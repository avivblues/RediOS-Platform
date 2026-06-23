import { Inject, Injectable } from '@nestjs/common';
import type {
  FieldDefinition,
  DependencyImpact,
  MetadataDefinition,
  NavigationDefinition,
  NavigationItemDefinition,
  RuntimeContext,
  RuntimeDocument,
  RuntimePackageContent,
  RuntimeTraceStepEngine,
  SimulationRequest,
  SimulationResult,
  SimulationStep,
  ValidationResult,
} from '@redios/shared';
import { ActionEngine } from '../action/action-engine.service';
import { BusinessEngine } from '../business/business-engine.service';
import { RuntimePackageProvider } from '../compiler/runtime-package-provider.service';
import { ConflictEngine } from '../conflict/conflict-engine.service';
import { EventEngine } from '../event/event-engine.service';
import { ExperienceEngine } from '../experience/experience-engine.service';
import { FormEngine } from '../form/form-engine.service';
import { LedgerEngine } from '../ledger/ledger-engine.service';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { MetadataValidatorEngine } from '../metadata/metadata-validator-engine.service';
import { NavigationEngine } from '../navigation/navigation-engine.service';
import { ProcessEngine } from '../process/process-engine.service';
import { RelationEngine } from '../relation/relation-engine.service';
import { SecurityEngine } from '../security/security-engine.service';
import { SecurityPolicyEngine } from '../security-policy/security-policy-engine.service';
import { SyncPolicyEngine } from '../sync/sync-policy-engine.service';
import { ThemeEngine } from '../theme/theme-engine.service';
import { TraceEngine } from '../trace/trace-engine.service';
import { UIEngine } from '../ui/ui-engine.service';
import { WorkflowEngine } from '../workflow/workflow-engine.service';

@Injectable()
export class SimulationEngine {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly metadataResolver: MetadataResolver,
    private readonly metadataValidatorEngine: MetadataValidatorEngine,
    private readonly actionEngine: ActionEngine,
    private readonly securityEngine: SecurityEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly processEngine: ProcessEngine,
    private readonly businessEngine: BusinessEngine,
    private readonly eventEngine: EventEngine,
    private readonly ledgerEngine: LedgerEngine,
    private readonly relationEngine: RelationEngine,
    private readonly uiEngine: UIEngine,
    private readonly formEngine: FormEngine,
    private readonly themeEngine: ThemeEngine,
    private readonly navigationEngine: NavigationEngine,
    private readonly securityPolicyEngine: SecurityPolicyEngine,
    private readonly experienceEngine: ExperienceEngine,
    private readonly syncPolicyEngine: SyncPolicyEngine,
    private readonly conflictEngine: ConflictEngine,
    private readonly traceEngine: TraceEngine,
    private readonly runtimePackageProvider: RuntimePackageProvider,
  ) {}

  simulateDesigner(input: {
    validation: ValidationResult;
    operation: string;
    impact: string[];
    dependencies?: Array<{
      change: string;
      impacts: DependencyImpact[];
    }>;
  }): SimulationResult {
    return {
      success: input.validation.valid,
      validation: input.validation,
      steps: [
        {
          stage: 'VALIDATION',
          status: input.validation.valid ? 'SUCCESS' : 'FAILED',
          message: input.validation.valid ? 'Designer metadata validation passed.' : 'Designer metadata validation failed.',
          result: input.validation,
        },
      ],
      predicted: {
        designer: {
          operation: input.operation,
          impact: input.impact,
        },
        dependencies: input.dependencies?.map((dependency) => ({
          change: dependency.change,
          breaking: dependency.impacts.filter((impact) => impact.impact === 'BREAKING').length,
          warnings: dependency.impacts.filter((impact) => impact.impact === 'WARNING').length,
          impacts: dependency.impacts,
        })),
      },
    };
  }

  async simulate(request: SimulationRequest): Promise<SimulationResult> {
    const context = this.toContext(request);
    const steps: SimulationStep[] = [];
    const predicted: SimulationResult['predicted'] = {};
    const validation = await this.validateMetadata(context, request.entityCode);

    steps.push({
      stage: 'VALIDATION',
      status: validation.valid ? 'SUCCESS' : 'FAILED',
      message: validation.valid ? 'Metadata validation passed.' : 'Metadata validation failed.',
      result: validation,
    });

    if (!validation.valid) {
      return this.finalize(request, context, {
        success: false,
        validation,
        steps,
        predicted,
      });
    }

    const entity = await this.runStep(steps, 'VALIDATION', 'Entity metadata resolved.', () =>
      this.metadataResolver.resolveEntity(context, request.entityCode),
    );

    if (!entity.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    const fields = await this.runStep(steps, 'VALIDATION', 'Field metadata resolved.', () =>
      this.metadataResolver.resolveFields(context, entity.value.definition.fieldCodes),
    );

    if (!fields.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    const requiredFields = this.validateRequiredFields(request, fields.value.map((field) => field.definition));

    if (requiredFields.length > 0) {
      steps.push({
        stage: 'ACTION',
        status: 'FAILED',
        message: `Required fields are missing: ${requiredFields.join(', ')}`,
        error: {
          code: 'FIELD_REQUIRED',
          message: `Required fields are missing: ${requiredFields.join(', ')}`,
        },
      });
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    const action = await this.runStep(steps, 'ACTION', 'Action is available.', () =>
      this.actionEngine.resolve(context, request.entityCode, request.actionCode),
    );

    if (!action.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    const security = await this.runStep(steps, 'SECURITY', 'Action permission is valid.', async () => {
      await this.securityEngine.validateActionAccess(context, action.value);
      return {
        allowed: true,
      };
    });

    if (!security.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    const securityPolicy = await this.runStep(steps, 'SECURITY_POLICY', 'Security policy is valid.', () =>
      this.securityPolicyEngine.assertActionAllowed(context, request.actionCode, request.entityCode),
    );

    if (!securityPolicy.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.security = await this.securityPolicyEngine.summarizeEntityAccess(
      context,
      request.entityCode,
      entity.value.definition.fieldCodes,
      entity.value.definition.actionCodes,
    );

    const document = await this.createMockDocument(context, request);
    const workflow = await this.runStep(steps, 'WORKFLOW', 'Workflow transition predicted.', () =>
      this.workflowEngine.transition(context, request.entityCode, document.status, request.actionCode),
    );

    if (!workflow.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.workflow = {
      from: workflow.value.from,
      to: workflow.value.to,
    };
    document.status = workflow.value.to || document.status;
    document.data = {
      ...document.data,
      ...(request.payload ?? {}),
    };

    const process = await this.runStep(steps, 'PROCESS', 'Process plan predicted.', () =>
      this.processEngine.execute(context, request.entityCode, request.actionCode, workflow.value, document),
    );

    if (!process.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.process = {
      executed: process.value.executed,
      processCode: process.value.processCode,
    };

    if (!process.value.executed) {
      steps.push({
        stage: 'PROCESS',
        status: 'SKIPPED',
        message: 'No process metadata matched this action.',
      });
    }

    const businessDocument = this.cloneDocument(document);
    const business = await this.runStep(steps, 'BUSINESS', 'Business rules predicted.', () =>
      this.businessEngine.execute(context, request.entityCode, businessDocument, process.value),
    );

    if (!business.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.business = {
      rules: business.value.executedRules,
    };

    const events = await this.runStep(steps, 'EVENT', 'Event handlers predicted.', () =>
      this.eventEngine.publish(context, request.entityCode, businessDocument, {
        actionCode: request.actionCode,
        workflowState: workflow.value.transitioned ? workflow.value.to : undefined,
        processCode: process.value.processCode,
      }),
    );

    if (!events.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.events = {
      events: events.value.events.map((event) => event.eventCode),
      handlers: events.value.events.flatMap((event) => event.handlers.map((handler) => handler.type)),
    };
    predicted.integrations = events.value.integrations.map((integration) => ({
      code: integration.code,
      trigger: integration.trigger,
      connector: integration.connector,
      status: integration.status,
    }));

    if (events.value.events.length === 0 || events.value.events.every((event) => event.handlers.length === 0)) {
      steps.push({
        stage: 'EVENT',
        status: 'SKIPPED',
        message: 'No event metadata or enabled event handlers matched this action.',
      });
    }

    steps.push({
      stage: 'INTEGRATION',
      status: events.value.integrations.length > 0 ? 'SUCCESS' : 'SKIPPED',
      message:
        events.value.integrations.length > 0
          ? 'Integration metadata and connectors are ready.'
          : 'No integration metadata matched generated events.',
      result: events.value.integrations,
    });

    const ledger = await this.runStep(steps, 'LEDGER', 'Ledger impacts predicted.', () =>
      this.ledgerEngine.execute(context, businessDocument, request.actionCode, {
        workflowState: workflow.value.transitioned ? workflow.value.to : undefined,
        eventCodes: events.value.events.map((event) => event.eventCode),
      }),
    );

    if (!ledger.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.ledger = {
      impacts: ledger.value.impacts.map((impact) => `${impact.type} ${impact.target}`),
    };

    if (ledger.value.impacts.length === 0) {
      steps.push({
        stage: 'LEDGER',
        status: 'SKIPPED',
        message: 'No ledger impact metadata matched this action.',
      });
    }

    const relations = await this.runStep(steps, 'VALIDATION', 'Relation metadata resolved.', () =>
      this.relationEngine.resolve(context, request.entityCode),
    );

    if (!relations.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.relations = relations.value.relations.map((relation) => ({
      relation: relation.code,
      status: 'VALID',
      target: relation.targetEntity,
      lookup: relation.capabilities.lookup,
    }));

    const views = await this.runStep(steps, 'VALIDATION', 'View metadata resolved.', () =>
      this.metadataResolver.resolveViews(context, request.entityCode),
    );

    if (!views.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.views = views.value.map((view) => ({
      code: view.definition.code,
      valid: true,
    }));

    const pages = await this.runStep(steps, 'VALIDATION', 'UI pages resolved.', () =>
      this.uiEngine.resolvePagesByEntity(context, request.entityCode),
    );

    if (!pages.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.ui = {
      pages: pages.value.map((page) => ({
        code: page.page.code,
        template: page.template.code,
        atoms: this.uiEngine.countAtoms(page),
      })),
    };

    const experience = await this.runStep(steps, 'VALIDATION', 'Experience metadata resolved.', () =>
      this.experienceEngine.resolveExperience(context, request.entityCode, {
        platform: request.platform ?? 'WEB',
        device: request.device,
      }),
    );

    if (!experience.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.experience = {
      selected: experience.value.selected,
      platform: experience.value.platform,
      page: experience.value.page,
    };

    const syncPolicy = await this.runStep(steps, 'VALIDATION', 'Sync policy metadata resolved.', () =>
      this.syncPolicyEngine.resolvePolicy(context, request.entityCode),
    );

    if (!syncPolicy.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.sync = {
      offline: syncPolicy.value.offline,
      strategy: syncPolicy.value.strategy,
      conflict: syncPolicy.value.conflict,
    };

    const conflictPolicy = await this.runStep(steps, 'VALIDATION', 'Conflict policy metadata resolved.', () =>
      this.conflictEngine.resolvePolicy(context, request.entityCode),
    );

    if (!conflictPolicy.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.conflict = {
      possible: syncPolicy.value.offline,
      policy: conflictPolicy.value.strategy,
    };

    const runtimePackage = await this.runtimePackageProvider.getActive(context);
    predicted.runtimePackage = runtimePackage
      ? {
          version: runtimePackage.definition.metadataVersion,
          optimized: true,
          compiledObjects: this.compiledObjectCount(runtimePackage.definition.content),
          estimatedLookup: 'O(1)',
        }
      : {
          version: 0,
          optimized: false,
          compiledObjects: 0,
          estimatedLookup: 'DYNAMIC',
        };

    const forms = await this.runStep(steps, 'VALIDATION', 'Form metadata resolved.', () =>
      this.formEngine.compose(context, request.entityCode),
    );

    if (!forms.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.forms = [
      {
        code: forms.value.form,
        fields: this.formEngine.countFields(forms.value),
        lookups: this.formEngine.countLookups(forms.value),
      },
    ];

    const theme = await this.runStep(steps, 'VALIDATION', 'Theme metadata resolved.', () => this.themeEngine.compose(context));

    if (!theme.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.theme = {
      code: theme.value.theme,
      affectedPages: pages.value.length,
    };

    const navigation = await this.runStep(steps, 'VALIDATION', 'Navigation metadata resolved.', () =>
      this.navigationEngine.compose(context),
    );

    if (!navigation.ok) {
      return this.finalize(request, context, this.failed(validation, steps, predicted));
    }

    predicted.navigation = {
      code: navigation.value.navigation,
      affectedMenus: this.countNavigationItems(navigation.value.items),
    };

    return this.finalize(request, context, {
      success: steps.every((step) => step.status !== 'FAILED'),
      validation,
      steps,
      predicted,
    });
  }

  private async validateMetadata(context: RuntimeContext, entityCode: string): Promise<ValidationResult> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });
    return this.metadataValidatorEngine.validate(this.relevantMetadata(metadata, entityCode));
  }

  private relevantMetadata(metadata: MetadataDefinition[], entityCode: string): MetadataDefinition[] {
    const relatedEntityCodes = new Set<string>([entityCode]);
    const referencedViewCodes = new Set<string>();
    const scopedPageCodes = new Set<string>();

    for (const metadataDefinition of metadata) {
      if (metadataDefinition.type === 'UI' && this.uiEntityCode(metadataDefinition.definition) === entityCode) {
        scopedPageCodes.add(metadataDefinition.code);
      }

      if (metadataDefinition.type === 'LEDGER' && this.definitionEntityCode(metadataDefinition.definition) === entityCode) {
        for (const impact of this.ledgerImpacts(metadataDefinition.definition)) {
          relatedEntityCodes.add(impact.target.entityCode);
        }
      }

      if (metadataDefinition.type === 'RELATION' && this.relationSourceEntityCode(metadataDefinition.definition) === entityCode) {
        const targetEntityCode = this.relationTargetEntityCode(metadataDefinition.definition);

        if (targetEntityCode) {
          relatedEntityCodes.add(targetEntityCode);
        }
      }

      if (metadataDefinition.type === 'FORM' && this.definitionEntityCode(metadataDefinition.definition) === entityCode) {
        for (const viewCode of this.formLookupViewCodes(metadataDefinition.definition)) {
          referencedViewCodes.add(viewCode);
        }
      }
    }

    return metadata.flatMap((metadataDefinition): MetadataDefinition[] => {
      if (metadataDefinition.type === 'ENTITY') {
        if (!relatedEntityCodes.has(metadataDefinition.code)) {
          return [];
        }

        if (metadataDefinition.code === entityCode) {
          return [metadataDefinition];
        }

        const definition = metadataDefinition.definition as { actionCodes?: string[]; workflowCode?: string };
        return [
          {
            ...metadataDefinition,
            definition: {
              ...definition,
              actionCodes: [],
              workflowCode: undefined,
            },
          },
        ];
      }

      if (
        metadataDefinition.type === 'FIELD'
      ) {
        const fieldEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return fieldEntityCode && relatedEntityCodes.has(fieldEntityCode) ? [metadataDefinition] : [];
      }

      if (
        metadataDefinition.type === 'ACTION' ||
        metadataDefinition.type === 'WORKFLOW' ||
        metadataDefinition.type === 'PROCESS' ||
        metadataDefinition.type === 'BUSINESS' ||
        metadataDefinition.type === 'EVENT' ||
        metadataDefinition.type === 'LEDGER'
      ) {
        const metadataEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return metadataEntityCode === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'VIEW') {
        const metadataEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return metadataEntityCode === entityCode || referencedViewCodes.has(metadataDefinition.code) ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'FORM') {
        const metadataEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return metadataEntityCode === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'RELATION') {
        return this.relationSourceEntityCode(metadataDefinition.definition) === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'UI') {
        const uiEntityCode = this.uiEntityCode(metadataDefinition.definition);
        return !uiEntityCode || uiEntityCode === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'THEME') {
        return [metadataDefinition];
      }

      if (metadataDefinition.type === 'NAVIGATION') {
        const navigation = metadataDefinition.definition as NavigationDefinition;
        return [
          {
            ...metadataDefinition,
            definition: {
              ...navigation,
              items: this.filterNavigationItems(navigation.items, scopedPageCodes),
            },
          },
        ];
      }

      if (metadataDefinition.type === 'SECURITY_POLICY') {
        return [metadataDefinition];
      }

      if (metadataDefinition.type === 'EXPERIENCE') {
        const metadataEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return metadataEntityCode === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'SYNC_POLICY') {
        const metadataEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return metadataEntityCode === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'CONFLICT_POLICY') {
        const metadataEntityCode = this.definitionEntityCode(metadataDefinition.definition);
        return metadataEntityCode === entityCode ? [metadataDefinition] : [];
      }

      if (metadataDefinition.type === 'INTEGRATION' || metadataDefinition.type === 'CONNECTOR') {
        return [metadataDefinition];
      }

      return [];
    });
  }

  private definitionEntityCode(definition: unknown): string | undefined {
    if (definition && typeof definition === 'object' && 'entityCode' in definition) {
      return (definition as { entityCode?: string }).entityCode;
    }

    return undefined;
  }

  private ledgerImpacts(definition: unknown): Array<{ target: { entityCode: string } }> {
    if (definition && typeof definition === 'object' && 'impacts' in definition && Array.isArray(definition.impacts)) {
      return definition.impacts as Array<{ target: { entityCode: string } }>;
    }

    return [];
  }

  private relationSourceEntityCode(definition: unknown): string | undefined {
    if (definition && typeof definition === 'object' && 'source' in definition) {
      return (definition as { source?: { entityCode?: string } }).source?.entityCode;
    }

    return undefined;
  }

  private relationTargetEntityCode(definition: unknown): string | undefined {
    if (definition && typeof definition === 'object' && 'target' in definition) {
      return (definition as { target?: { entityCode?: string } }).target?.entityCode;
    }

    return undefined;
  }

  private formLookupViewCodes(definition: unknown): string[] {
    if (!definition || typeof definition !== 'object' || !('layout' in definition)) {
      return [];
    }

    const sections = (definition as { layout?: { sections?: Array<{ fields?: Array<{ lookup?: { viewCode?: string } }> }> } }).layout
      ?.sections;

    if (!Array.isArray(sections)) {
      return [];
    }

    return sections.flatMap((section) =>
      (section.fields ?? [])
        .map((field) => field.lookup?.viewCode)
        .filter((viewCode): viewCode is string => Boolean(viewCode)),
    );
  }

  private uiEntityCode(definition: unknown): string | undefined {
    if (definition && typeof definition === 'object' && 'kind' in definition && (definition as { kind?: string }).kind === 'PAGE') {
      return (definition as { entityCode?: string }).entityCode;
    }

    return undefined;
  }

  private filterNavigationItems(items: NavigationItemDefinition[], allowedPageCodes: Set<string>): NavigationItemDefinition[] {
    return items.flatMap((item): NavigationItemDefinition[] => {
      const children = this.filterNavigationItems(item.children ?? [], allowedPageCodes);
      const targetAllowed =
        item.target.type !== 'PAGE' || allowedPageCodes.has(item.target.code);

      if (!targetAllowed && children.length === 0) {
        return [];
      }

      if (item.target.type === 'URL' && children.length === 0) {
        return [];
      }

      return [
        {
          ...item,
          children,
        },
      ];
    });
  }

  private async runStep<T>(
    steps: SimulationStep[],
    stage: SimulationStep['stage'],
    successMessage: string,
    action: () => Promise<T> | T,
  ): Promise<{ ok: true; value: T } | { ok: false }> {
    try {
      const value = await action();
      steps.push({
        stage,
        status: 'SUCCESS',
        message: successMessage,
        result: value,
      });
      return {
        ok: true,
        value,
      };
    } catch (error) {
      steps.push({
        stage,
        status: 'FAILED',
        message: error instanceof Error ? error.message : String(error),
        error: {
          code: this.errorCode(stage, error),
          message: error instanceof Error ? error.message : String(error),
        },
      });
      return {
        ok: false,
      };
    }
  }

  private toContext(request: SimulationRequest): RuntimeContext {
    return {
      userId: request.userId ?? 'simulation',
      tenantId: request.tenantId,
      domainCode: request.domainCode,
      applicationCode: request.applicationCode,
      permissions: request.permissions ?? [],
      capabilities: [],
      roles: request.roles ?? [],
      groups: request.groups ?? [],
      attributes: request.attributes ?? {},
    };
  }

  private async createMockDocument(context: RuntimeContext, request: SimulationRequest): Promise<RuntimeDocument> {
    const initialStatus = request.currentState ?? (await this.workflowEngine.resolveInitialStatus(context, request.entityCode));
    const mockData = this.extractMockData(request.mockDocument);

    return {
      id: 'SIMULATED_DOCUMENT',
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      entityCode: request.entityCode,
      status: initialStatus,
      data: {
        ...mockData,
        ...(request.payload ?? {}),
      },
      metadataVersion: 1,
      createdBy: context.userId,
    };
  }

  private extractMockData(mockDocument: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!mockDocument) {
      return {};
    }

    const data = mockDocument.data;
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : mockDocument;
  }

  private cloneDocument(document: RuntimeDocument): RuntimeDocument {
    return {
      ...document,
      data: {
        ...document.data,
      },
    };
  }

  private compiledObjectCount(content: RuntimePackageContent): number {
    return Object.values(content as unknown as Record<string, unknown>).reduce<number>((count, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return count + Object.keys(value).length;
      }

      return count;
    }, 0);
  }

  private validateRequiredFields(request: SimulationRequest, fields: FieldDefinition[]): string[] {
    if (request.actionCode !== 'CREATE') {
      return [];
    }

    const payload = request.payload ?? {};
    return fields
      .filter((field) => field.required)
      .map((field) => field.code)
      .filter((fieldCode) => payload[fieldCode] === undefined || payload[fieldCode] === null || payload[fieldCode] === '');
  }

  private countNavigationItems(items: Array<{ children: unknown[] }>): number {
    return items.reduce((total, item) => total + 1 + this.countNavigationItems(item.children as Array<{ children: unknown[] }>), 0);
  }

  private errorCode(stage: SimulationStep['stage'], error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (stage === 'SECURITY') {
      return 'PERMISSION_MISSING';
    }

    if (stage === 'WORKFLOW' && message.includes('Invalid workflow transition')) {
      return 'TRANSITION_NOT_FOUND';
    }

    if (message.includes('Required field is missing')) {
      return 'FIELD_REQUIRED';
    }

    return `${stage}_FAILED`;
  }

  private async finalize(
    request: SimulationRequest,
    context: RuntimeContext,
    result: SimulationResult,
  ): Promise<SimulationResult> {
    if (request.traceMode !== 'STORE') {
      return result;
    }

    const trace = await this.traceEngine.start(context, {
      entityCode: request.entityCode,
      documentId: 'SIMULATED_DOCUMENT',
      actionCode: request.actionCode,
    });

    for (const step of result.steps) {
      const engine = this.toTraceEngine(step.stage);

      if (!engine) {
        continue;
      }

      await this.traceEngine.recordStepResult(
        trace.id!,
        engine,
        step.status === 'READY' ? 'SUCCESS' : step.status,
        {
          dryRun: true,
          traceMode: request.traceMode,
          message: step.message,
        },
        step.result,
        step.error,
      );
    }

    if (result.success) {
      await this.traceEngine.complete(trace.id!);
    } else {
      await this.traceEngine.fail(trace.id!, result.steps.find((step) => step.status === 'FAILED')?.error ?? result);
    }

    return {
      ...result,
      traceId: trace.id,
    };
  }

  private toTraceEngine(stage: SimulationStep['stage']): RuntimeTraceStepEngine | undefined {
    if (
      stage === 'ACTION' ||
      stage === 'SECURITY' ||
      stage === 'WORKFLOW' ||
      stage === 'PROCESS' ||
      stage === 'BUSINESS' ||
      stage === 'EVENT' ||
      stage === 'LEDGER'
    ) {
      return stage;
    }

    return undefined;
  }

  private failed(
    validation: ValidationResult,
    steps: SimulationStep[],
    predicted: SimulationResult['predicted'],
  ): SimulationResult {
    return {
      success: false,
      validation,
      steps,
      predicted,
    };
  }
}
