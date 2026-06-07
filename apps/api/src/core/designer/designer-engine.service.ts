import { BadRequestException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  DesignerOperation,
  DependencyImpact,
  DesignerTargetType,
  FormDefinition,
  FormFieldDefinition,
  FormSectionDefinition,
  MetadataDefinition,
  MetadataDraft,
  MetadataVersion,
  RuntimeContext,
  RuntimeDocument,
  SimulationResult,
  ThemeDefinition,
  ValidationResult,
} from '@redios/shared';
import { Model } from 'mongoose';
import { EventEngine } from '../event/event-engine.service';
import { FormEngine, type ComposedForm } from '../form/form-engine.service';
import { DependencyEngine } from '../dependency/dependency-engine.service';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { MetadataValidatorEngine } from '../metadata/metadata-validator-engine.service';
import { SimulationEngine } from '../simulation/simulation-engine.service';
import { TraceEngine } from '../trace/trace-engine.service';
import { DesignerPermissionGuard } from './designer-permission.guard';
import { METADATA_DRAFT_MODEL } from './schemas/metadata-draft.schema';
import { METADATA_VERSION_MODEL } from './schemas/metadata-version.schema';

type MetadataDraftRecord = MetadataDraft & { _id?: unknown };
type MetadataVersionRecord = MetadataVersion & { _id?: unknown };

export interface CreateDesignerDraftRequest {
  targetType: DesignerTargetType;
  targetCode: string;
  entityCode?: string;
}

export interface DesignerPreviewResult {
  valid: boolean;
  validation: ValidationResult;
  simulation: SimulationResult;
  affected: string[];
  dependencies: {
    safe: boolean;
    impacts: DependencyImpact[];
  };
  draft: MetadataDraft<FormDefinition | ThemeDefinition>;
}

export interface DesignerPublishResult {
  draft: MetadataDraft<FormDefinition | ThemeDefinition>;
  published: MetadataDefinition<FormDefinition | ThemeDefinition>;
  traceId?: string;
}

@Injectable()
export class DesignerEngine {
  constructor(
    @InjectModel(METADATA_DRAFT_MODEL)
    private readonly draftModel: Model<MetadataDraftRecord>,
    @InjectModel(METADATA_VERSION_MODEL)
    private readonly versionModel: Model<MetadataVersionRecord>,
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly metadataResolver: MetadataResolver,
    private readonly metadataValidatorEngine: MetadataValidatorEngine,
    private readonly simulationEngine: SimulationEngine,
    private readonly formEngine: FormEngine,
    private readonly dependencyEngine: DependencyEngine,
    private readonly eventEngine: EventEngine,
    private readonly traceEngine: TraceEngine,
    private readonly permissionGuard: DesignerPermissionGuard,
  ) {}

  async createDraft(context: RuntimeContext, request: CreateDesignerDraftRequest): Promise<MetadataDraft<FormDefinition | ThemeDefinition>> {
    this.permissionGuard.assert(context, 'FORM.DESIGN');
    this.assertSupportedTarget(request.targetType);

    const source = await this.resolveDesignerSource(context, request);

    if (!source) {
      throw new NotFoundException(`Metadata ${request.targetType}:${request.targetCode} was not found.`);
    }

    const trace = await this.traceEngine.start(context, {
      entityCode: request.entityCode ?? request.targetType,
      documentId: source.id,
      actionCode: 'DESIGNER_CREATE_DRAFT',
    });

    const draft = await this.traceEngine.recordStep(trace.id!, 'DESIGNER', async () => {
      const record = await this.draftModel.create({
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: context.applicationCode,
        sourceMetadataId: source.id,
        targetType: request.targetType,
        targetCode: request.targetCode,
        entityCode: request.entityCode,
        status: 'DRAFT',
        draft: this.clone(source),
        changes: [],
        createdBy: context.userId,
        updatedBy: context.userId,
      });

      return this.toDraft(record.toObject());
    }, request);

    await this.traceEngine.complete(trace.id!);
    return draft;
  }

  async applyOperation(
    context: RuntimeContext,
    draftId: string,
    operation: DesignerOperation,
  ): Promise<MetadataDraft<FormDefinition | ThemeDefinition>> {
    this.permissionGuard.assert(context, 'FORM.DESIGN');
    const draft = await this.findDraft(context, draftId);
    this.assertDraftEditable(draft);

    const normalizedOperation: DesignerOperation = {
      ...operation,
      userId: context.userId,
      timestamp: new Date(),
    };
    const definition = this.clone(draft.draft.definition);
    const before = this.clone(definition);
    this.applyDraftOperation(draft.targetType, definition, normalizedOperation);
    normalizedOperation.before = normalizedOperation.before ?? before;
    normalizedOperation.after = normalizedOperation.after ?? this.clone(definition);

    const updated = await this.draftModel
      .findOneAndUpdate(
        {
          _id: draftId,
          ...this.scope(context),
        },
        {
          $set: {
            status: 'DRAFT',
            'draft.definition': definition,
            'draft.name': definition.name,
            updatedBy: context.userId,
          },
          $push: {
            changes: normalizedOperation,
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Metadata draft was not found.');
    }

    await this.audit(context, this.draftEntityCode(draft), this.auditEvent(normalizedOperation.type), normalizedOperation);
    return this.toDraft(updated);
  }

  async preview(context: RuntimeContext, draftId: string): Promise<DesignerPreviewResult> {
    this.permissionGuard.assert(context, 'FORM.DESIGN');
    const draft = await this.findDraft(context, draftId);
    const trace = await this.traceEngine.start(context, {
      entityCode: this.draftEntityCode(draft),
      documentId: draft.id,
      actionCode: 'DESIGNER_PREVIEW',
    });

    try {
      const validation = await this.traceEngine.recordStep(trace.id!, 'VALIDATION', () => this.validateDraft(context, draft), {
        draftId,
        targetCode: draft.targetCode,
      });
      const dependency = await this.traceEngine.recordStep(trace.id!, 'DEPENDENCY_CHECK', () =>
        this.analyzeDraftDependencies(context, draft),
      );
      const affected = ['FORM', 'UI_RENDER', 'VALIDATION'];
      const simulation = await this.traceEngine.recordStep(trace.id!, 'SIMULATION', () =>
        this.simulationEngine.simulateDesigner({
          validation,
          operation: draft.changes.at(-1)?.type ?? 'PREVIEW',
          impact: affected,
          dependencies: [
            {
              change: draft.changes.at(-1)?.type ?? 'PREVIEW',
              impacts: dependency.impacts,
            },
          ],
        }),
      );

      const valid = validation.valid && dependency.safe;

      if (valid) {
        await this.markDraftStatus(context, draft.id!, 'VALIDATED');
        await this.traceEngine.complete(trace.id!);
      } else {
        await this.traceEngine.fail(trace.id!, { validation, dependency });
      }

      return {
        valid,
        validation,
        simulation,
        affected,
        dependencies: dependency,
        draft,
      };
    } catch (error) {
      await this.traceEngine.fail(trace.id!, error);
      throw error;
    }
  }

  async publish(context: RuntimeContext, draftId: string): Promise<DesignerPublishResult> {
    this.permissionGuard.assert(context, 'FORM.PUBLISH');
    const draft = await this.findDraft(context, draftId);
    const trace = await this.traceEngine.start(context, {
      entityCode: this.draftEntityCode(draft),
      documentId: draft.id,
      actionCode: 'DESIGNER_PUBLISH',
    });

    try {
      const validation = await this.traceEngine.recordStep(trace.id!, 'VALIDATION', () => this.validateDraft(context, draft), {
        draftId,
      });

      if (!validation.valid) {
        throw new UnprocessableEntityException(validation);
      }

      const dependency = await this.traceEngine.recordStep(trace.id!, 'DEPENDENCY_CHECK', () =>
        this.analyzeDraftDependencies(context, draft),
      );

      if (!dependency.safe) {
        throw new UnprocessableEntityException({
          code: 'DEPENDENCY_BREAKING_IMPACT',
          impacts: dependency.impacts,
        });
      }

      const published = await this.traceEngine.recordStep(trace.id!, 'PUBLISH', async () => {
        const current = await this.resolveCurrentDraftSource(context, draft);

        if (!current) {
          throw new NotFoundException(`Metadata ${draft.targetType}:${draft.targetCode} was not found.`);
        }

        await this.saveVersion(context, current, context.userId);

        const next: MetadataDefinition<FormDefinition | ThemeDefinition> = {
          ...current,
          name: draft.draft.name,
          version: current.version + 1,
          enabled: true,
          definition: {
            ...draft.draft.definition,
            version: current.version + 1,
          },
        };
        const saved = await this.metadataProvider.saveMetadata(context, next);
        await this.saveVersion(context, saved as MetadataDefinition<FormDefinition | ThemeDefinition>, context.userId);
        return saved as MetadataDefinition<FormDefinition | ThemeDefinition>;
      });
      const updatedDraft = await this.markDraftStatus(context, draft.id!, 'PUBLISHED');
      await this.audit(context, this.definitionEntityCode(published.definition) ?? published.type, 'FORM_PUBLISHED', {
        draftId,
        formCode: published.definition.code,
        version: published.version,
      });
      await this.traceEngine.complete(trace.id!);

      return {
        draft: updatedDraft,
        published,
        traceId: trace.id,
      };
    } catch (error) {
      await this.traceEngine.fail(trace.id!, error);
      throw error;
    }
  }

  async rollback(context: RuntimeContext, draftId: string, version: number): Promise<DesignerPublishResult> {
    this.permissionGuard.assert(context, 'FORM.PUBLISH');
    const draft = await this.findDraft(context, draftId);
    const snapshot = await this.versionModel
      .findOne({
        ...this.scope(context),
        targetType: draft.targetType,
        targetCode: draft.targetCode,
        version,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!snapshot) {
      throw new NotFoundException(`Metadata version ${version} was not found.`);
    }

    const trace = await this.traceEngine.start(context, {
      entityCode: this.draftEntityCode(draft),
      documentId: draft.id,
      actionCode: 'DESIGNER_ROLLBACK',
    });

    try {
      const published = await this.traceEngine.recordStep(trace.id!, 'PUBLISH', async () => {
        const current = await this.resolveCurrentDraftSource(context, draft);

        if (!current) {
          throw new NotFoundException(`Metadata ${draft.targetType}:${draft.targetCode} was not found.`);
        }

        await this.saveVersion(context, current, context.userId);
        const restored: MetadataDefinition<FormDefinition | ThemeDefinition> = {
          ...(snapshot.metadata as MetadataDefinition<FormDefinition | ThemeDefinition>),
          id: current.id,
          version: current.version + 1,
          definition: {
            ...(snapshot.metadata as MetadataDefinition<FormDefinition | ThemeDefinition>).definition,
            version: current.version + 1,
          } as FormDefinition | ThemeDefinition,
        };
        const saved = await this.metadataProvider.saveMetadata(context, restored);
        await this.saveVersion(context, saved as MetadataDefinition<FormDefinition | ThemeDefinition>, context.userId);
        return saved as MetadataDefinition<FormDefinition | ThemeDefinition>;
      });
      const updatedDraft = await this.markDraftStatus(context, draft.id!, 'REJECTED');
      await this.audit(context, this.definitionEntityCode(published.definition) ?? published.type, 'FORM_PUBLISHED', {
        draftId,
        rollbackToVersion: version,
        version: published.version,
      });
      await this.traceEngine.complete(trace.id!);

      return {
        draft: updatedDraft,
        published,
        traceId: trace.id,
      };
    } catch (error) {
      await this.traceEngine.fail(trace.id!, error);
      throw error;
    }
  }

  async composeDraft(context: RuntimeContext, draftId: string): Promise<ComposedForm> {
    const draft = await this.findDraft(context, draftId);
    const form = draft.draft.definition as FormDefinition;
    return this.formEngine.compose(context, form.entityCode, form.code);
  }

  private async validateDraft(context: RuntimeContext, draft: MetadataDraft<FormDefinition | ThemeDefinition>): Promise<ValidationResult> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });
    const replaced = metadata.map((candidate) =>
      candidate.type === draft.targetType &&
      candidate.code === draft.targetCode &&
      this.sameDefinitionScope(candidate.definition, draft.draft.definition)
        ? draft.draft
        : candidate,
    );
    return this.metadataValidatorEngine.validate(replaced);
  }

  private async analyzeDraftDependencies(
    context: RuntimeContext,
    draft: MetadataDraft<FormDefinition | ThemeDefinition>,
  ): Promise<{ safe: boolean; impacts: DependencyImpact[] }> {
    const lastChange = draft.changes.at(-1);
    const target = this.dependencyTargetFromOperation(draft, lastChange);

    if (!target) {
      return {
        safe: true,
        impacts: [],
      };
    }

    const analysis = await this.dependencyEngine.analyzeImpact(context, target);
    const impacts =
      lastChange?.type === 'UPDATE_THEME_TOKEN'
        ? analysis.impacts.map((impact) => ({
            ...impact,
            impact: 'INFO' as const,
          }))
        : lastChange?.type === 'REMOVE_FIELD'
          ? analysis.impacts
          : analysis.impacts.filter((impact) => impact.impact === 'WARNING');

    return {
      safe: impacts.every((impact) => impact.impact !== 'BREAKING'),
      impacts,
    };
  }

  private dependencyTargetFromOperation(
    draft: MetadataDraft<FormDefinition | ThemeDefinition>,
    operation: DesignerOperation | undefined,
  ): { type: 'FIELD' | 'THEME'; code: string } | undefined {
    if (!operation) {
      return undefined;
    }

    if (operation.type === 'REMOVE_FIELD' || operation.type === 'CHANGE_COMPONENT' || operation.type === 'MOVE_FIELD') {
      return {
        type: 'FIELD',
        code: this.payloadString(operation.payload ?? {}, 'fieldCode'),
      };
    }

    if (operation.type === 'UPDATE_THEME_TOKEN') {
      return {
        type: 'THEME',
        code: draft.targetCode,
      };
    }

    return undefined;
  }

  private async resolveDesignerSource(
    context: RuntimeContext,
    request: CreateDesignerDraftRequest,
  ): Promise<MetadataDefinition<FormDefinition | ThemeDefinition> | null> {
    if (request.targetType === 'FORM') {
      if (!request.entityCode) {
        throw new BadRequestException('FORM designer drafts require entityCode.');
      }

      return this.metadataResolver.resolveForm(context, request.entityCode, request.targetCode);
    }

    return this.metadataResolver.resolveTheme(context, request.targetCode);
  }

  private async resolveCurrentDraftSource(
    context: RuntimeContext,
    draft: MetadataDraft<FormDefinition | ThemeDefinition>,
  ): Promise<MetadataDefinition<FormDefinition | ThemeDefinition> | null> {
    if (draft.targetType === 'FORM') {
      const form = draft.draft.definition as FormDefinition;
      return this.metadataResolver.resolveForm(context, form.entityCode, draft.targetCode);
    }

    return this.metadataResolver.resolveTheme(context, draft.targetCode);
  }

  private applyDraftOperation(
    targetType: DesignerTargetType,
    definition: FormDefinition | ThemeDefinition,
    operation: DesignerOperation,
  ): void {
    if (targetType === 'THEME') {
      this.applyThemeOperation(definition as ThemeDefinition, operation);
      return;
    }

    this.applyFormOperation(definition as FormDefinition, operation);
  }

  private applyThemeOperation(theme: ThemeDefinition, operation: DesignerOperation): void {
    if (operation.type !== 'UPDATE_THEME_TOKEN') {
      throw new BadRequestException(`Unsupported theme designer operation: ${operation.type}`);
    }

    const payload = operation.payload ?? {};
    const path = operation.path ?? this.payloadString(payload, 'path');
    const value = 'after' in operation ? operation.after : payload.value;
    this.setPath(theme as unknown as Record<string, unknown>, path.startsWith('tokens.') || path.startsWith('layout.') || path.startsWith('assets.') ? path : `tokens.${path}`, value);
  }

  private applyFormOperation(form: FormDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};

    if (operation.type === 'ADD_FIELD') {
      this.addField(form, payload);
      return;
    }

    if (operation.type === 'REMOVE_FIELD') {
      this.removeField(form, this.payloadString(payload, 'fieldCode'));
      return;
    }

    if (operation.type === 'MOVE_FIELD') {
      this.moveField(form, payload);
      return;
    }

    if (operation.type === 'CHANGE_COMPONENT') {
      this.changeComponent(form, payload);
      return;
    }

    if (operation.type === 'CHANGE_PROPERTY') {
      this.changeProperty(form, operation);
      return;
    }

    if (operation.type === 'ADD_SECTION') {
      this.addSection(form, payload);
      return;
    }

    if (operation.type === 'REMOVE_SECTION') {
      this.removeSection(form, this.payloadString(payload, 'section'));
    }
  }

  private addField(form: FormDefinition, payload: Record<string, unknown>): void {
    const section = this.findSection(form, this.payloadString(payload, 'section', form.layout.sections[0]?.code));
    const fieldCode = this.payloadString(payload, 'fieldCode');
    const component = this.payloadString(payload, 'component', 'TEXT_INPUT');
    const lookup = this.payloadLookup(payload);
    const field: FormFieldDefinition = {
      fieldCode,
      component,
      order: this.payloadNumber(payload, 'order', this.nextFieldOrder(section)),
      required: this.payloadBoolean(payload, 'required'),
      readonly: this.payloadBoolean(payload, 'readonly'),
      visible: this.payloadBoolean(payload, 'visible', true),
      ...(lookup ? { lookup } : {}),
    };

    section.fields.push(field);
  }

  private removeField(form: FormDefinition, fieldCode: string): void {
    for (const section of form.layout.sections) {
      section.fields = section.fields.filter((field) => field.fieldCode !== fieldCode);
    }
  }

  private moveField(form: FormDefinition, payload: Record<string, unknown>): void {
    const fieldCode = this.payloadString(payload, 'fieldCode');
    const targetSection = this.findSection(form, this.payloadString(payload, 'section'));
    const order = this.payloadNumber(payload, 'order', this.nextFieldOrder(targetSection));
    let moving: FormFieldDefinition | undefined;

    for (const section of form.layout.sections) {
      const index = section.fields.findIndex((field) => field.fieldCode === fieldCode);

      if (index >= 0) {
        moving = section.fields.splice(index, 1)[0];
        break;
      }
    }

    if (!moving) {
      throw new BadRequestException(`Form field ${fieldCode} was not found.`);
    }

    targetSection.fields.push({
      ...moving,
      order,
    });
  }

  private changeComponent(form: FormDefinition, payload: Record<string, unknown>): void {
    const field = this.findField(form, this.payloadString(payload, 'fieldCode'));
    field.component = this.payloadString(payload, 'component');
    const lookup = this.payloadLookup(payload);

    if (lookup) {
      field.lookup = lookup;
    } else if (field.component !== 'LOOKUP') {
      field.lookup = undefined;
    }
  }

  private changeProperty(form: FormDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};
    const path = operation.path ?? this.payloadString(payload, 'path');
    const value = 'after' in operation ? operation.after : payload.value;

    if (!path) {
      throw new BadRequestException('CHANGE_PROPERTY requires a path.');
    }

    this.setPath(form as unknown as Record<string, unknown>, path, value);
  }

  private addSection(form: FormDefinition, payload: Record<string, unknown>): void {
    form.layout.sections.push({
      code: this.payloadString(payload, 'section'),
      title: this.payloadString(payload, 'title', this.payloadString(payload, 'section')),
      order: this.payloadNumber(payload, 'order', this.nextSectionOrder(form)),
      fields: [],
    });
  }

  private removeSection(form: FormDefinition, sectionCode: string): void {
    form.layout.sections = form.layout.sections.filter((section) => section.code !== sectionCode);
  }

  private findSection(form: FormDefinition, sectionCode: string): FormSectionDefinition {
    const section = form.layout.sections.find((candidate) => candidate.code === sectionCode);

    if (!section) {
      throw new BadRequestException(`Form section ${sectionCode} was not found.`);
    }

    return section;
  }

  private findField(form: FormDefinition, fieldCode: string): FormFieldDefinition {
    for (const section of form.layout.sections) {
      const field = section.fields.find((candidate) => candidate.fieldCode === fieldCode);

      if (field) {
        return field;
      }
    }

    throw new BadRequestException(`Form field ${fieldCode} was not found.`);
  }

  private setPath(target: Record<string, unknown>, path: string, value: unknown): void {
    const segments = path.split('.').filter(Boolean);
    let cursor: Record<string, unknown> | unknown[] = target;

    for (const [index, segment] of segments.entries()) {
      const isLast = index === segments.length - 1;
      const key = /^\d+$/.test(segment) ? Number(segment) : segment;

      if (isLast) {
        (cursor as Record<string, unknown>)[key] = value;
        return;
      }

      const next = (cursor as Record<string, unknown>)[key];

      if (!next || typeof next !== 'object') {
        throw new BadRequestException(`CHANGE_PROPERTY path is invalid: ${path}`);
      }

      cursor = next as Record<string, unknown>;
    }
  }

  private async saveVersion(
    context: RuntimeContext,
    metadata: MetadataDefinition<FormDefinition | ThemeDefinition>,
    userId: string,
  ): Promise<void> {
    await this.versionModel.create({
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      sourceMetadataId: metadata.id,
      targetType: metadata.type,
      targetCode: metadata.code,
      entityCode: this.definitionEntityCode(metadata.definition),
      version: metadata.version,
      metadata: this.clone(metadata),
      createdBy: userId,
    });
  }

  private async markDraftStatus(
    context: RuntimeContext,
    draftId: string,
    status: MetadataDraft['status'],
  ): Promise<MetadataDraft<FormDefinition | ThemeDefinition>> {
    const updated = await this.draftModel
      .findOneAndUpdate(
        {
          _id: draftId,
          ...this.scope(context),
        },
        {
          $set: {
            status,
            updatedBy: context.userId,
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Metadata draft was not found.');
    }

    return this.toDraft(updated);
  }

  private async findDraft(context: RuntimeContext, draftId: string): Promise<MetadataDraft<FormDefinition | ThemeDefinition>> {
    const draft = await this.draftModel
      .findOne({
        _id: draftId,
        ...this.scope(context),
      })
      .lean()
      .exec();

    if (!draft) {
      throw new NotFoundException('Metadata draft was not found.');
    }

    return this.toDraft(draft);
  }

  private assertDraftEditable(draft: MetadataDraft): void {
    if (draft.status === 'PUBLISHED') {
      throw new BadRequestException('Published drafts cannot be edited.');
    }
  }

  private assertSupportedTarget(targetType: DesignerTargetType): void {
    if (targetType !== 'FORM' && targetType !== 'THEME') {
      throw new BadRequestException(`Unsupported designer target type: ${targetType}`);
    }
  }

  private async audit(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
    payload: unknown,
  ): Promise<void> {
    const document: RuntimeDocument = {
      id: 'DESIGNER_AUDIT',
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      entityCode,
      status: 'DESIGNER',
      data: {
        payload,
      },
      metadataVersion: 1,
      createdBy: context.userId,
    };
    await this.eventEngine.publish(context, entityCode, document, {
      actionCode,
    });
  }

  private auditEvent(operationType: DesignerOperation['type']): string {
    if (operationType === 'ADD_FIELD') {
      return 'FORM_FIELD_ADDED';
    }

    if (operationType === 'MOVE_FIELD') {
      return 'FORM_FIELD_MOVED';
    }

    return `FORM_${operationType}`;
  }

  private payloadString(payload: Record<string, unknown>, key: string, fallback?: string): string {
    const value = payload[key];

    if (typeof value === 'string' && value.length > 0) {
      return value;
    }

    if (fallback !== undefined) {
      return fallback;
    }

    throw new BadRequestException(`Operation payload.${key} is required.`);
  }

  private payloadNumber(payload: Record<string, unknown>, key: string, fallback: number): number {
    const value = payload[key];
    return typeof value === 'number' ? value : fallback;
  }

  private payloadBoolean(payload: Record<string, unknown>, key: string, fallback?: boolean): boolean | undefined {
    const value = payload[key];
    return typeof value === 'boolean' ? value : fallback;
  }

  private payloadLookup(payload: Record<string, unknown>): FormFieldDefinition['lookup'] | undefined {
    const lookup = payload.lookup;

    if (lookup && typeof lookup === 'object' && !Array.isArray(lookup)) {
      const relationCode = (lookup as { relationCode?: unknown }).relationCode;
      const viewCode = (lookup as { viewCode?: unknown }).viewCode;

      if (typeof relationCode === 'string' && typeof viewCode === 'string') {
        return {
          relationCode,
          viewCode,
        };
      }
    }

    const relationCode = payload.relationCode;
    const viewCode = payload.viewCode;

    if (typeof relationCode === 'string' && typeof viewCode === 'string') {
      return {
        relationCode,
        viewCode,
      };
    }

    return undefined;
  }

  private nextFieldOrder(section: FormSectionDefinition): number {
    return Math.max(0, ...section.fields.map((field) => field.order)) + 1;
  }

  private nextSectionOrder(form: FormDefinition): number {
    return Math.max(0, ...form.layout.sections.map((section) => section.order)) + 1;
  }

  private definitionEntityCode(definition: unknown): string | undefined {
    return definition && typeof definition === 'object' && 'entityCode' in definition
      ? (definition as { entityCode?: string }).entityCode
      : undefined;
  }

  private draftEntityCode(draft: MetadataDraft<FormDefinition | ThemeDefinition>): string {
    return draft.entityCode ?? this.definitionEntityCode(draft.draft.definition) ?? draft.targetType;
  }

  private sameDefinitionScope(left: unknown, right: unknown): boolean {
    const leftEntity = this.definitionEntityCode(left);
    const rightEntity = this.definitionEntityCode(right);

    if (leftEntity || rightEntity) {
      return leftEntity === rightEntity;
    }

    return true;
  }

  private scope(context: RuntimeContext): Record<string, string> {
    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
    };
  }

  private toDraft(record: MetadataDraftRecord): MetadataDraft<FormDefinition | ThemeDefinition> {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      domainCode: record.domainCode,
      applicationCode: record.applicationCode,
      sourceMetadataId: record.sourceMetadataId,
      targetType: record.targetType,
      targetCode: record.targetCode,
      entityCode: record.entityCode,
      status: record.status,
      draft: record.draft as MetadataDefinition<FormDefinition | ThemeDefinition>,
      changes: record.changes,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}
