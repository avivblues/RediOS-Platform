import { BadRequestException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  ConnectorDefinition,
  DesignerOperation,
  DependencyImpact,
  DependencyNodeType,
  DesignerTargetType,
  FormDefinition,
  FormFieldDefinition,
  FormSectionDefinition,
  IntegrationDefinition,
  MetadataDefinition,
  MetadataDraft,
  MetadataVersion,
  NavigationDefinition,
  NavigationItemDefinition,
  RuntimeContext,
  RuntimeDocument,
  SecurityPolicyDefinition,
  SimulationResult,
  ThemeDefinition,
  ValidationResult,
  WorkflowDefinition,
} from '@redios/shared';
import { Model } from 'mongoose';
import { RuntimeCompiler } from '../compiler/runtime-compiler.service';
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
type DesignerDefinition =
  | FormDefinition
  | ThemeDefinition
  | NavigationDefinition
  | SecurityPolicyDefinition
  | WorkflowDefinition
  | IntegrationDefinition
  | ConnectorDefinition;

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
  draft: MetadataDraft<DesignerDefinition>;
}

export interface DesignerPublishResult {
  draft: MetadataDraft<DesignerDefinition>;
  published: MetadataDefinition<DesignerDefinition>;
  traceId?: string;
}

export interface GeneratedMetadataPublishRequest {
  metadata: MetadataDefinition[];
}

export interface GeneratedMetadataPublishResult {
  published: MetadataDefinition[];
  validation: ValidationResult[];
  dependencies: DependencyImpact[];
  runtimePackages: Array<{
    applicationCode: string;
    status: string;
  }>;
}

export interface StudioHistoryEntry {
  id: string;
  version: number;
  targetType: string;
  targetCode: string;
  entityCode?: string;
  summary: string;
  createdBy: string;
  createdAt?: Date;
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
    private readonly runtimeCompiler: RuntimeCompiler,
  ) {}

  async createDraft(context: RuntimeContext, request: CreateDesignerDraftRequest): Promise<MetadataDraft<DesignerDefinition>> {
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
  ): Promise<MetadataDraft<DesignerDefinition>> {
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
            'draft.name': this.definitionDisplayName(definition, draft.draft.name),
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
      const affected = this.affectedForDraft(draft);
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

        const next: MetadataDefinition<DesignerDefinition> = {
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
        await this.saveVersion(context, saved as MetadataDefinition<DesignerDefinition>, context.userId);
        return saved as MetadataDefinition<DesignerDefinition>;
      });
      await this.traceEngine.recordStep(trace.id!, 'RUNTIME_PACKAGE', () => this.runtimeCompiler.compile(context), {
        source: 'DESIGNER_PUBLISH',
        metadataType: published.type,
        metadataCode: published.code,
      });
      const updatedDraft = await this.markDraftStatus(context, draft.id!, 'PUBLISHED');
      await this.audit(context, this.definitionEntityCode(published.definition) ?? published.type, `${published.type}_PUBLISHED`, {
        draftId,
        targetCode: published.definition.code,
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

  async publishGeneratedMetadata(
    context: RuntimeContext,
    request: GeneratedMetadataPublishRequest,
  ): Promise<GeneratedMetadataPublishResult> {
    this.permissionGuard.assert(context, 'FORM.PUBLISH');

    if (!Array.isArray(request.metadata) || request.metadata.length === 0) {
      throw new BadRequestException('Generated metadata publish requires metadata.');
    }

    const metadataByApplication = this.groupGeneratedMetadata(request.metadata, context);
    const validationResults: ValidationResult[] = [];
    const dependencyImpacts: DependencyImpact[] = [];
    const runtimePackages: GeneratedMetadataPublishResult['runtimePackages'] = [];
    const published: MetadataDefinition[] = [];

    for (const [applicationCode, generatedMetadata] of metadataByApplication.entries()) {
      const publishContext: RuntimeContext = {
        ...context,
        applicationCode,
      };
      const existingMetadata = await this.metadataProvider.findMetadata(publishContext, {
        applicationCode,
        enabledOnly: true,
      });
      const validationSet = this.mergeGeneratedMetadata(existingMetadata, generatedMetadata);
      const validation = await this.metadataValidatorEngine.validate(validationSet);
      validationResults.push(validation);

      if (!validation.valid) {
        throw new UnprocessableEntityException(validation);
      }

      for (const metadata of generatedMetadata) {
        const dependency = this.dependencyEngine.analyzeImpactFromMetadata(validationSet, {
          type: metadata.type as DependencyNodeType,
          code: metadata.code,
        });
        dependencyImpacts.push(...dependency.impacts);

        if (!dependency.safe) {
          throw new UnprocessableEntityException({
            code: 'DEPENDENCY_BREAKING_IMPACT',
            impacts: dependency.impacts,
          });
        }
      }

      for (const metadata of generatedMetadata) {
        const current = existingMetadata.find((candidate) => this.sameMetadataIdentity(candidate, metadata));
        const next: MetadataDefinition = {
          ...metadata,
          tenantId: context.tenantId,
          domainCode: context.domainCode,
          applicationCode,
          version: (current?.version ?? 0) + 1,
          enabled: true,
        };

        if (current) {
          await this.saveVersion(publishContext, current as MetadataDefinition<DesignerDefinition>, context.userId);
        }

        const saved = await this.metadataProvider.saveMetadata(publishContext, next);
        published.push(saved);
        await this.saveVersion(publishContext, saved as MetadataDefinition<DesignerDefinition>, context.userId);
      }

      const runtimePackage = await this.runtimeCompiler.compile(publishContext);
      runtimePackages.push({
        applicationCode,
        status: runtimePackage.definition.status,
      });
    }

    return {
      published,
      validation: validationResults,
      dependencies: dependencyImpacts,
      runtimePackages,
    };
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
        const restored: MetadataDefinition<DesignerDefinition> = {
          ...(snapshot.metadata as MetadataDefinition<DesignerDefinition>),
          id: current.id,
          version: current.version + 1,
          definition: {
            ...(snapshot.metadata as MetadataDefinition<DesignerDefinition>).definition,
            version: current.version + 1,
          } as DesignerDefinition,
        };
        const saved = await this.metadataProvider.saveMetadata(context, restored);
        await this.saveVersion(context, saved as MetadataDefinition<DesignerDefinition>, context.userId);
        return saved as MetadataDefinition<DesignerDefinition>;
      });
      await this.traceEngine.recordStep(trace.id!, 'RUNTIME_PACKAGE', () => this.runtimeCompiler.compile(context), {
        source: 'DESIGNER_ROLLBACK',
        metadataType: published.type,
        metadataCode: published.code,
      });
      const updatedDraft = await this.markDraftStatus(context, draft.id!, 'REJECTED');
      await this.audit(context, this.definitionEntityCode(published.definition) ?? published.type, `${published.type}_PUBLISHED`, {
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

  async listVersions(context: RuntimeContext, limit = 12): Promise<StudioHistoryEntry[]> {
    this.permissionGuard.assert(context, 'FORM.DESIGN');
    const snapshots = await this.versionModel
      .find(this.scope(context))
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return snapshots.map((snapshot) => {
      const record = this.toVersion(snapshot);
      return {
        id: String(snapshot._id ?? record.id ?? `${record.targetType}:${record.targetCode}:${record.version}`),
        version: record.version,
        targetType: record.targetType,
        targetCode: record.targetCode,
        entityCode: record.entityCode,
        summary: this.historySummary(record),
        createdBy: record.createdBy,
        createdAt: record.createdAt,
      };
    });
  }

  async composeDraft(context: RuntimeContext, draftId: string): Promise<ComposedForm> {
    const draft = await this.findDraft(context, draftId);
    const form = draft.draft.definition as FormDefinition;
    return this.formEngine.compose(context, form.entityCode, form.code);
  }

  private async validateDraft(context: RuntimeContext, draft: MetadataDraft<DesignerDefinition>): Promise<ValidationResult> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });
    let replacedExisting = false;
    const replaced = metadata.map((candidate) => {
      const matches =
        candidate.type === draft.targetType &&
        candidate.code === draft.targetCode &&
        this.sameDefinitionScope(candidate.definition, draft.draft.definition);

      if (matches) {
        replacedExisting = true;
        return draft.draft;
      }

      return candidate;
    });
    const validationSet = replacedExisting ? replaced : [...replaced, draft.draft];
    return this.metadataValidatorEngine.validate(validationSet);
  }

  private groupGeneratedMetadata(metadata: MetadataDefinition[], context: RuntimeContext): Map<string, MetadataDefinition[]> {
    const groups = new Map<string, MetadataDefinition[]>();

    for (const definition of metadata) {
      const applicationCode = definition.applicationCode || context.applicationCode;
      const records = groups.get(applicationCode) ?? [];
      records.push(definition);
      groups.set(applicationCode, records);
    }

    return groups;
  }

  private mergeGeneratedMetadata(existing: MetadataDefinition[], generated: MetadataDefinition[]): MetadataDefinition[] {
    const merged = existing.filter((candidate) => !generated.some((metadata) => this.sameMetadataIdentity(candidate, metadata)));
    return [...merged, ...generated];
  }

  private sameMetadataIdentity(left: MetadataDefinition, right: MetadataDefinition): boolean {
    if (left.applicationCode !== right.applicationCode || left.type !== right.type || left.code !== right.code) {
      return false;
    }

    if (
      left.type === 'UI' &&
      left.definition &&
      right.definition &&
      typeof left.definition === 'object' &&
      typeof right.definition === 'object' &&
      'kind' in left.definition &&
      'kind' in right.definition
    ) {
      return left.definition.kind === right.definition.kind;
    }

    return this.sameDefinitionScope(left.definition, right.definition);
  }

  private async analyzeDraftDependencies(
    context: RuntimeContext,
    draft: MetadataDraft<DesignerDefinition>,
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

  private affectedForDraft(draft: MetadataDraft<DesignerDefinition>): string[] {
    if (draft.targetType === 'NAVIGATION') {
      return ['NAVIGATION', 'UI_SHELL', 'VALIDATION'];
    }

    if (draft.targetType === 'SECURITY_POLICY') {
      return ['SECURITY_POLICY', 'RUNTIME_AUTHORIZATION', 'VALIDATION'];
    }

    if (draft.targetType === 'WORKFLOW') {
      return ['WORKFLOW', 'PROCESS', 'EVENT', 'SECURITY', 'UI', 'FORMS', 'VALIDATION'];
    }

    if (draft.targetType === 'INTEGRATION') {
      return ['INTEGRATION', 'EVENT', 'CONNECTOR', 'VALIDATION', 'SIMULATION'];
    }

    if (draft.targetType === 'CONNECTOR') {
      return ['CONNECTOR', 'INTEGRATION', 'VALIDATION'];
    }

    if (draft.targetType === 'THEME') {
      return ['THEME', 'UI_RENDER', 'NAVIGATION', 'VALIDATION'];
    }

    return ['FORM', 'UI_RENDER', 'VALIDATION'];
  }

  private dependencyTargetFromOperation(
    draft: MetadataDraft<DesignerDefinition>,
    operation: DesignerOperation | undefined,
  ): { type: 'FIELD' | 'THEME' | 'NAVIGATION' | 'SECURITY_POLICY' | 'WORKFLOW' | 'INTEGRATION' | 'CONNECTOR'; code: string } | undefined {
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

    if (
      operation.type === 'ADD_MENU' ||
      operation.type === 'REMOVE_MENU' ||
      operation.type === 'MOVE_MENU' ||
      operation.type === 'CHANGE_ICON' ||
      operation.type === 'CHANGE_TARGET'
    ) {
      return {
        type: 'NAVIGATION',
        code: draft.targetCode,
      };
    }

    if (operation.type === 'CREATE_POLICY' || operation.type === 'UPDATE_POLICY' || operation.type === 'DELETE_POLICY') {
      return {
        type: 'SECURITY_POLICY',
        code: draft.targetCode,
      };
    }

    if (
      operation.type === 'ADD_STATE' ||
      operation.type === 'REMOVE_STATE' ||
      operation.type === 'UPDATE_STATE' ||
      operation.type === 'ADD_TRANSITION' ||
      operation.type === 'REMOVE_TRANSITION' ||
      operation.type === 'UPDATE_TRANSITION'
    ) {
      return {
        type: 'WORKFLOW',
        code: draft.targetCode,
      };
    }

    if (operation.type === 'CREATE_INTEGRATION' || operation.type === 'UPDATE_INTEGRATION' || operation.type === 'DELETE_INTEGRATION') {
      return {
        type: 'INTEGRATION',
        code: draft.targetCode,
      };
    }

    if (operation.type === 'CREATE_CONNECTOR' || operation.type === 'UPDATE_CONNECTOR' || operation.type === 'DELETE_CONNECTOR') {
      return {
        type: 'CONNECTOR',
        code: draft.targetCode,
      };
    }

    return undefined;
  }

  private async resolveDesignerSource(
    context: RuntimeContext,
    request: CreateDesignerDraftRequest,
  ): Promise<MetadataDefinition<DesignerDefinition> | null> {
    if (request.targetType === 'FORM') {
      if (!request.entityCode) {
        throw new BadRequestException('FORM designer drafts require entityCode.');
      }

      return this.metadataResolver.resolveForm(context, request.entityCode, request.targetCode);
    }

    if (request.targetType === 'THEME') {
      return this.metadataResolver.resolveTheme(context, request.targetCode);
    }

    if (request.targetType === 'NAVIGATION') {
      return this.metadataResolver.resolveNavigation(context, request.targetCode);
    }

    if (request.targetType === 'WORKFLOW') {
      return this.metadataProvider.findOne(context, {
        type: 'WORKFLOW',
        code: request.targetCode,
        enabledOnly: true,
      }) as Promise<MetadataDefinition<DesignerDefinition> | null>;
    }

    if (request.targetType === 'INTEGRATION') {
      return (
        ((await this.metadataProvider.findOne(context, {
          type: 'INTEGRATION',
          code: request.targetCode,
          enabledOnly: true,
        })) as MetadataDefinition<DesignerDefinition> | null) ?? this.createIntegrationSource(context, request)
      );
    }

    if (request.targetType === 'CONNECTOR') {
      return (
        ((await this.metadataProvider.findOne(context, {
          type: 'CONNECTOR',
          code: request.targetCode,
          enabledOnly: true,
        })) as MetadataDefinition<DesignerDefinition> | null) ?? this.createConnectorSource(context, request)
      );
    }

    return (await this.metadataResolver.resolveSecurityPolicy(context, request.targetCode)) ?? this.createPolicySource(context, request);
  }

  private async resolveCurrentDraftSource(
    context: RuntimeContext,
    draft: MetadataDraft<DesignerDefinition>,
  ): Promise<MetadataDefinition<DesignerDefinition> | null> {
    if (draft.targetType === 'FORM') {
      const form = draft.draft.definition as FormDefinition;
      return this.metadataResolver.resolveForm(context, form.entityCode, draft.targetCode);
    }

    if (draft.targetType === 'THEME') {
      return this.metadataResolver.resolveTheme(context, draft.targetCode);
    }

    if (draft.targetType === 'NAVIGATION') {
      return this.metadataResolver.resolveNavigation(context, draft.targetCode);
    }

    if (draft.targetType === 'WORKFLOW') {
      return this.metadataProvider.findOne(context, {
        type: 'WORKFLOW',
        code: draft.targetCode,
        enabledOnly: true,
      }) as Promise<MetadataDefinition<DesignerDefinition> | null>;
    }

    if (draft.targetType === 'INTEGRATION' || draft.targetType === 'CONNECTOR') {
      return (
        ((await this.metadataProvider.findOne(context, {
          type: draft.targetType,
          code: draft.targetCode,
          enabledOnly: true,
        })) as MetadataDefinition<DesignerDefinition> | null) ?? draft.draft
      );
    }

    return (await this.metadataResolver.resolveSecurityPolicy(context, draft.targetCode)) ?? draft.draft;
  }

  private applyDraftOperation(
    targetType: DesignerTargetType,
    definition: DesignerDefinition,
    operation: DesignerOperation,
  ): void {
    if (targetType === 'THEME') {
      this.applyThemeOperation(definition as ThemeDefinition, operation);
      return;
    }

    if (targetType === 'NAVIGATION') {
      this.applyNavigationOperation(definition as NavigationDefinition, operation);
      return;
    }

    if (targetType === 'SECURITY_POLICY') {
      this.applySecurityPolicyOperation(definition as SecurityPolicyDefinition, operation);
      return;
    }

    if (targetType === 'WORKFLOW') {
      this.applyWorkflowOperation(definition as WorkflowDefinition, operation);
      return;
    }

    if (targetType === 'INTEGRATION') {
      this.applyIntegrationOperation(definition as IntegrationDefinition, operation);
      return;
    }

    if (targetType === 'CONNECTOR') {
      this.applyConnectorOperation(definition as ConnectorDefinition, operation);
      return;
    }

    this.applyFormOperation(definition as FormDefinition, operation);
  }

  private createPolicySource(
    context: RuntimeContext,
    request: CreateDesignerDraftRequest,
  ): MetadataDefinition<SecurityPolicyDefinition> {
    const definition: SecurityPolicyDefinition = {
      code: request.targetCode,
      name: request.targetCode,
      version: 1,
      target: {
        type: 'APPLICATION',
        code: context.applicationCode,
      },
      effect: 'ALLOW',
      subjects: [],
      rules: {
        read: true,
        create: true,
        update: true,
        delete: true,
        visible: true,
        editable: true,
      },
      enabled: true,
    };

    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      type: 'SECURITY_POLICY',
      code: request.targetCode,
      name: request.targetCode,
      version: 1,
      enabled: true,
      definition,
    };
  }

  private createIntegrationSource(
    context: RuntimeContext,
    request: CreateDesignerDraftRequest,
  ): MetadataDefinition<IntegrationDefinition> {
    const definition: IntegrationDefinition = {
      code: request.targetCode,
      name: request.targetCode,
      enabled: true,
      version: 1,
      trigger: {
        type: 'EVENT',
        sourceCode: '',
      },
      connector: {
        type: 'WEBHOOK',
        connectorCode: '',
      },
      mapping: {
        input: {},
        output: {},
      },
      errorPolicy: {
        retry: false,
        maxAttempts: 1,
      },
    };

    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      type: 'INTEGRATION',
      code: request.targetCode,
      name: request.targetCode,
      version: 1,
      enabled: true,
      definition,
    };
  }

  private createConnectorSource(
    context: RuntimeContext,
    request: CreateDesignerDraftRequest,
  ): MetadataDefinition<ConnectorDefinition> {
    const definition: ConnectorDefinition = {
      code: request.targetCode,
      type: 'WEBHOOK',
      configSchema: {},
      authType: 'NONE',
      enabled: true,
      version: 1,
    };

    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      type: 'CONNECTOR',
      code: request.targetCode,
      name: request.targetCode,
      version: 1,
      enabled: true,
      definition,
    };
  }

  private applySecurityPolicyOperation(policy: SecurityPolicyDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};

    if (operation.type === 'CREATE_POLICY' || operation.type === 'UPDATE_POLICY') {
      const definition = this.payloadPolicyDefinition(payload);

      if (definition) {
        Object.assign(policy, definition);
        return;
      }

      for (const key of ['name', 'target', 'effect', 'subjects', 'rules', 'conditions', 'enabled'] as const) {
        if (key in payload) {
          (policy as unknown as Record<string, unknown>)[key] = payload[key];
        }
      }

      const path = operation.path ?? this.payloadOptionalString(payload, 'path');

      if (path) {
        const value = 'after' in operation ? operation.after : payload.value;
        this.setPath(policy as unknown as Record<string, unknown>, path, value);
      }

      return;
    }

    if (operation.type === 'DELETE_POLICY') {
      policy.enabled = false;
      return;
    }

    throw new BadRequestException(`Unsupported security policy designer operation: ${operation.type}`);
  }

  private applyNavigationOperation(navigation: NavigationDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};

    if (operation.type === 'ADD_MENU') {
      this.addMenu(navigation, payload);
      return;
    }

    if (operation.type === 'REMOVE_MENU') {
      this.removeMenu(navigation, this.payloadString(payload, 'code'));
      return;
    }

    if (operation.type === 'MOVE_MENU') {
      this.moveMenu(navigation, payload);
      return;
    }

    if (operation.type === 'CHANGE_ICON') {
      this.findMenu(navigation.items, this.payloadString(payload, 'code')).icon = this.payloadString(payload, 'icon');
      return;
    }

    if (operation.type === 'CHANGE_TARGET') {
      const item = this.findMenu(navigation.items, this.payloadString(payload, 'code'));
      item.target = this.payloadNavigationTarget(payload);
      return;
    }

    throw new BadRequestException(`Unsupported navigation designer operation: ${operation.type}`);
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

  private applyIntegrationOperation(integration: IntegrationDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};

    if (operation.type === 'DELETE_INTEGRATION') {
      integration.enabled = false;
      return;
    }

    if (operation.type !== 'CREATE_INTEGRATION' && operation.type !== 'UPDATE_INTEGRATION') {
      throw new BadRequestException(`Unsupported integration designer operation: ${operation.type}`);
    }

    const definition = this.payloadDefinition<IntegrationDefinition>(payload);

    if (definition) {
      Object.assign(integration, definition);
      return;
    }

    for (const key of ['code', 'name', 'enabled', 'version', 'trigger', 'connector', 'mapping', 'errorPolicy'] as const) {
      if (key in payload) {
        (integration as unknown as Record<string, unknown>)[key] = payload[key];
      }
    }

    const path = operation.path ?? this.payloadOptionalString(payload, 'path');

    if (path) {
      this.setPath(integration as unknown as Record<string, unknown>, path, 'after' in operation ? operation.after : payload.value);
    }
  }

  private applyConnectorOperation(connector: ConnectorDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};

    if (operation.type === 'DELETE_CONNECTOR') {
      connector.enabled = false;
      return;
    }

    if (operation.type !== 'CREATE_CONNECTOR' && operation.type !== 'UPDATE_CONNECTOR') {
      throw new BadRequestException(`Unsupported connector designer operation: ${operation.type}`);
    }

    const definition = this.payloadDefinition<ConnectorDefinition>(payload);

    if (definition) {
      Object.assign(connector, definition);
      return;
    }

    for (const key of ['code', 'type', 'configSchema', 'authType', 'secretCode', 'enabled', 'version'] as const) {
      if (key in payload) {
        (connector as unknown as Record<string, unknown>)[key] = payload[key];
      }
    }

    const path = operation.path ?? this.payloadOptionalString(payload, 'path');

    if (path) {
      this.setPath(connector as unknown as Record<string, unknown>, path, 'after' in operation ? operation.after : payload.value);
    }
  }

  private applyWorkflowOperation(workflow: WorkflowDefinition, operation: DesignerOperation): void {
    const payload = operation.payload ?? {};

    if (operation.type === 'ADD_STATE') {
      const code = this.payloadString(payload, 'code');
      if (workflow.states.some((state) => state.code === code)) {
        throw new BadRequestException(`Workflow state ${code} already exists.`);
      }

      const type = this.payloadWorkflowStateType(payload);
      const state = {
        code,
        label: this.payloadString(payload, 'label', code),
        type,
        colorToken: this.payloadOptionalString(payload, 'colorToken'),
        initial: type === 'INITIAL' ? true : this.payloadBoolean(payload, 'initial'),
        final: type === 'FINAL' ? true : this.payloadBoolean(payload, 'final'),
      };
      workflow.states.push(state);
      this.normalizeWorkflowStateTypes(workflow);
      return;
    }

    if (operation.type === 'REMOVE_STATE') {
      const code = this.payloadString(payload, 'code');
      workflow.states = workflow.states.filter((state) => state.code !== code);
      workflow.transitions = workflow.transitions.filter((transition) => transition.from !== code && transition.to !== code);
      return;
    }

    if (operation.type === 'UPDATE_STATE') {
      const state = this.findWorkflowState(workflow, this.payloadString(payload, 'code'));
      const nextCode = this.payloadOptionalString(payload, 'nextCode');
      if (nextCode && nextCode !== state.code) {
        for (const transition of workflow.transitions) {
          if (transition.from === state.code) {
            transition.from = nextCode;
          }
          if (transition.to === state.code) {
            transition.to = nextCode;
          }
        }
        state.code = nextCode;
      }
      state.label = this.payloadString(payload, 'label', state.label);
      state.type = this.payloadWorkflowStateType(payload, state.type ?? 'NORMAL');
      state.colorToken = this.payloadOptionalString(payload, 'colorToken') ?? state.colorToken;
      state.initial = state.type === 'INITIAL' ? true : this.payloadBoolean(payload, 'initial', false);
      state.final = state.type === 'FINAL' ? true : this.payloadBoolean(payload, 'final', false);
      this.normalizeWorkflowStateTypes(workflow);
      return;
    }

    if (operation.type === 'ADD_TRANSITION') {
      const from = this.payloadString(payload, 'from');
      const to = this.payloadString(payload, 'to');
      const actionCode = this.payloadOptionalString(payload, 'actionCode') ?? '';
      const code = this.payloadString(payload, 'code', `${from}_${actionCode}_${to}`);
      if (workflow.transitions.some((transition) => transition.code === code)) {
        throw new BadRequestException(`Workflow transition ${code} already exists.`);
      }
      workflow.transitions.push({
        code,
        from,
        to,
        actionCode,
        condition: this.payloadWorkflowCondition(payload),
        securityPolicy: this.payloadOptionalString(payload, 'securityPolicy'),
        processBinding: this.payloadOptionalString(payload, 'processBinding'),
      });
      return;
    }

    if (operation.type === 'REMOVE_TRANSITION') {
      const code = this.payloadString(payload, 'code');
      workflow.transitions = workflow.transitions.filter((transition) => transition.code !== code);
      return;
    }

    if (operation.type === 'UPDATE_TRANSITION') {
      const transition = this.findWorkflowTransition(workflow, this.payloadString(payload, 'code'));
      transition.code = this.payloadOptionalString(payload, 'nextCode') ?? transition.code;
      transition.from = this.payloadString(payload, 'from', transition.from);
      transition.to = this.payloadString(payload, 'to', transition.to);
      transition.actionCode = this.payloadString(payload, 'actionCode', transition.actionCode);
      transition.condition = this.payloadWorkflowCondition(payload) ?? transition.condition;
      transition.securityPolicy = this.payloadOptionalString(payload, 'securityPolicy') ?? transition.securityPolicy;
      transition.processBinding = this.payloadOptionalString(payload, 'processBinding') ?? transition.processBinding;
      return;
    }

    throw new BadRequestException(`Unsupported workflow designer operation: ${operation.type}`);
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

  private addMenu(navigation: NavigationDefinition, payload: Record<string, unknown>): void {
    const item: NavigationItemDefinition = {
      code: this.payloadString(payload, 'code'),
      label: this.payloadString(payload, 'label'),
      icon: this.payloadOptionalString(payload, 'icon'),
      order: this.payloadNumber(payload, 'order', this.nextMenuOrder(navigation.items)),
      target: this.payloadNavigationTarget(payload),
      children: [],
      visibleWhen: this.payloadVisibleWhen(payload),
    };
    const parentCode = this.payloadOptionalString(payload, 'parentCode');
    const siblings = parentCode ? this.findMenu(navigation.items, parentCode).children ?? [] : navigation.items;

    if (parentCode) {
      this.findMenu(navigation.items, parentCode).children = siblings;
    }

    siblings.push(item);
  }

  private removeMenu(navigation: NavigationDefinition, itemCode: string): void {
    const removed = this.removeMenuFromItems(navigation.items, itemCode);

    if (!removed) {
      throw new BadRequestException(`Navigation menu ${itemCode} was not found.`);
    }
  }

  private moveMenu(navigation: NavigationDefinition, payload: Record<string, unknown>): void {
    const itemCode = this.payloadString(payload, 'code');
    const item = this.detachMenu(navigation.items, itemCode);

    if (!item) {
      throw new BadRequestException(`Navigation menu ${itemCode} was not found.`);
    }

    item.order = this.payloadNumber(payload, 'order', item.order);
    const parentCode = this.payloadOptionalString(payload, 'parentCode');
    const siblings = parentCode ? this.findMenu(navigation.items, parentCode).children ?? [] : navigation.items;

    if (parentCode) {
      this.findMenu(navigation.items, parentCode).children = siblings;
    }

    siblings.push(item);
  }

  private findMenu(items: NavigationItemDefinition[], itemCode: string): NavigationItemDefinition {
    for (const item of items) {
      if (item.code === itemCode) {
        return item;
      }

      const child = this.findMenuOptional(item.children ?? [], itemCode);

      if (child) {
        return child;
      }
    }

    throw new BadRequestException(`Navigation menu ${itemCode} was not found.`);
  }

  private findMenuOptional(items: NavigationItemDefinition[], itemCode: string): NavigationItemDefinition | undefined {
    for (const item of items) {
      if (item.code === itemCode) {
        return item;
      }

      const child = this.findMenuOptional(item.children ?? [], itemCode);

      if (child) {
        return child;
      }
    }

    return undefined;
  }

  private detachMenu(items: NavigationItemDefinition[], itemCode: string): NavigationItemDefinition | undefined {
    const index = items.findIndex((item) => item.code === itemCode);

    if (index >= 0) {
      return items.splice(index, 1)[0];
    }

    for (const item of items) {
      const child = this.detachMenu(item.children ?? [], itemCode);

      if (child) {
        return child;
      }
    }

    return undefined;
  }

  private removeMenuFromItems(items: NavigationItemDefinition[], itemCode: string): boolean {
    const index = items.findIndex((item) => item.code === itemCode);

    if (index >= 0) {
      items.splice(index, 1);
      return true;
    }

    return items.some((item) => this.removeMenuFromItems(item.children ?? [], itemCode));
  }

  private payloadNavigationTarget(payload: Record<string, unknown>): NavigationItemDefinition['target'] {
    const target = payload.target;

    if (target && typeof target === 'object' && !Array.isArray(target)) {
      const targetPayload = target as Record<string, unknown>;
      return {
        type: this.payloadString(targetPayload, 'type') as NavigationItemDefinition['target']['type'],
        code: this.payloadString(targetPayload, 'code'),
      };
    }

    return {
      type: this.payloadString(payload, 'targetType') as NavigationItemDefinition['target']['type'],
      code: this.payloadString(payload, 'targetCode'),
    };
  }

  private payloadVisibleWhen(payload: Record<string, unknown>): NavigationItemDefinition['visibleWhen'] | undefined {
    const visibleWhen = payload.visibleWhen;

    if (!visibleWhen || typeof visibleWhen !== 'object' || Array.isArray(visibleWhen)) {
      return undefined;
    }

    const permissions = (visibleWhen as { permissions?: unknown }).permissions;

    return Array.isArray(permissions) ? { permissions: permissions.filter((permission): permission is string => typeof permission === 'string') } : undefined;
  }

  private payloadPolicyDefinition(payload: Record<string, unknown>): Partial<SecurityPolicyDefinition> | undefined {
    const definition = payload.definition;

    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      return undefined;
    }

    return definition as Partial<SecurityPolicyDefinition>;
  }

  private payloadDefinition<TDefinition>(payload: Record<string, unknown>): Partial<TDefinition> | undefined {
    const definition = payload.definition;

    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      return undefined;
    }

    return definition as Partial<TDefinition>;
  }

  private async saveVersion(
    context: RuntimeContext,
    metadata: MetadataDefinition<DesignerDefinition>,
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
  ): Promise<MetadataDraft<DesignerDefinition>> {
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

  private async findDraft(context: RuntimeContext, draftId: string): Promise<MetadataDraft<DesignerDefinition>> {
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
    if (
      targetType !== 'FORM' &&
      targetType !== 'THEME' &&
      targetType !== 'NAVIGATION' &&
      targetType !== 'SECURITY_POLICY' &&
      targetType !== 'WORKFLOW' &&
      targetType !== 'INTEGRATION' &&
      targetType !== 'CONNECTOR'
    ) {
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

    if (
      operationType === 'ADD_MENU' ||
      operationType === 'REMOVE_MENU' ||
      operationType === 'MOVE_MENU' ||
      operationType === 'CHANGE_ICON' ||
      operationType === 'CHANGE_TARGET'
    ) {
      return `NAVIGATION_${operationType}`;
    }

    if (operationType === 'CREATE_POLICY' || operationType === 'UPDATE_POLICY' || operationType === 'DELETE_POLICY') {
      return `SECURITY_POLICY_${operationType}`;
    }

    if (
      operationType === 'CREATE_INTEGRATION' ||
      operationType === 'UPDATE_INTEGRATION' ||
      operationType === 'DELETE_INTEGRATION' ||
      operationType === 'CREATE_CONNECTOR' ||
      operationType === 'UPDATE_CONNECTOR' ||
      operationType === 'DELETE_CONNECTOR'
    ) {
      return `INTEGRATION_${operationType}`;
    }

    return `DESIGNER_${operationType}`;
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

  private payloadOptionalString(payload: Record<string, unknown>, key: string): string | undefined {
    const value = payload[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private payloadNumber(payload: Record<string, unknown>, key: string, fallback: number): number {
    const value = payload[key];
    return typeof value === 'number' ? value : fallback;
  }

  private payloadBoolean(payload: Record<string, unknown>, key: string, fallback?: boolean): boolean | undefined {
    const value = payload[key];
    return typeof value === 'boolean' ? value : fallback;
  }

  private payloadWorkflowStateType(
    payload: Record<string, unknown>,
    fallback: NonNullable<WorkflowDefinition['states'][number]['type']> = 'NORMAL',
  ): NonNullable<WorkflowDefinition['states'][number]['type']> {
    const value = payload.type;

    if (value === 'INITIAL' || value === 'NORMAL' || value === 'FINAL') {
      return value;
    }

    return fallback;
  }

  private payloadWorkflowCondition(payload: Record<string, unknown>): WorkflowDefinition['transitions'][number]['condition'] | undefined {
    const value = payload.condition ?? payload.conditions;

    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return undefined;
  }

  private findWorkflowState(workflow: WorkflowDefinition, code: string): WorkflowDefinition['states'][number] {
    const state = workflow.states.find((candidate) => candidate.code === code);

    if (!state) {
      throw new BadRequestException(`Workflow state ${code} was not found.`);
    }

    return state;
  }

  private findWorkflowTransition(workflow: WorkflowDefinition, code: string): WorkflowDefinition['transitions'][number] {
    const transition = workflow.transitions.find((candidate) => candidate.code === code);

    if (!transition) {
      throw new BadRequestException(`Workflow transition ${code} was not found.`);
    }

    return transition;
  }

  private normalizeWorkflowStateTypes(workflow: WorkflowDefinition): void {
    const initial = workflow.states.find((state) => state.type === 'INITIAL') ?? workflow.states.find((state) => state.initial);

    for (const state of workflow.states) {
      if (initial) {
        state.initial = state.code === initial.code;
      }

      if (state.code === initial?.code) {
        state.type = 'INITIAL';
        state.final = false;
        continue;
      }

      if (state.type === 'FINAL') {
        state.initial = false;
        state.final = true;
      }

      if (state.type === 'NORMAL') {
        state.initial = false;
        state.final = false;
      }
    }
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

  private nextMenuOrder(items: NavigationItemDefinition[]): number {
    return Math.max(0, ...items.map((item) => item.order)) + 1;
  }

  private definitionEntityCode(definition: unknown): string | undefined {
    return definition && typeof definition === 'object' && 'entityCode' in definition
      ? (definition as { entityCode?: string }).entityCode
      : undefined;
  }

  private definitionDisplayName(definition: DesignerDefinition, fallback: string): string {
    return 'name' in definition && typeof definition.name === 'string' ? definition.name : fallback;
  }

  private draftEntityCode(draft: MetadataDraft<DesignerDefinition>): string {
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

  private toDraft(record: MetadataDraftRecord): MetadataDraft<DesignerDefinition> {
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
      draft: record.draft as MetadataDefinition<DesignerDefinition>,
      changes: record.changes,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toVersion(record: MetadataVersionRecord): MetadataVersion {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      domainCode: record.domainCode,
      applicationCode: record.applicationCode,
      sourceMetadataId: record.sourceMetadataId,
      targetType: record.targetType,
      targetCode: record.targetCode,
      entityCode: record.entityCode,
      version: record.version,
      metadata: record.metadata,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
    };
  }

  private historySummary(record: MetadataVersion): string {
    const name = record.metadata?.name ?? record.targetCode;
    return `Updated ${name}`;
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}
