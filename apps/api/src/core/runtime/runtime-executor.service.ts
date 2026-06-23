import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
  RuntimeContext,
  RuntimeDocument,
  RuntimePackageDefinition,
  RuntimeTrace,
} from '@redios/shared';
import { ActionEngine, type RuntimeActionPlan } from '../action/action-engine.service';
import { ApplicationEngine } from '../application/application-engine.service';
import { BusinessEngine, type BusinessExecutionResult } from '../business/business-engine.service';
import { RuntimePackageProvider } from '../compiler/runtime-package-provider.service';
import { ConflictEngine } from '../conflict/conflict-engine.service';
import { HumanTaskProcessService } from '../experience/human-task/human-task-process.service';
import { EventEngine, type RuntimeEventPublishResult } from '../event/event-engine.service';
import { LedgerEngine, type LedgerExecutionResult } from '../ledger/ledger-engine.service';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { ProcessEngine, type ProcessExecutionPlan } from '../process/process-engine.service';
import { SecurityEngine } from '../security/security-engine.service';
import { SecurityPolicyEngine } from '../security-policy/security-policy-engine.service';
import { StorageEngine } from '../storage/storage.engine';
import { TraceEngine } from '../trace/trace-engine.service';
import { WorkflowEngine, type WorkflowTransitionResult } from '../workflow/workflow-engine.service';

export interface RuntimeExecutionInput {
  context: RuntimeContext;
  entityCode: string;
  payload: unknown;
}

export interface RuntimeExecutionResult {
  stage: 'STORED';
  context: RuntimeContext;
  application: MetadataDefinition<ApplicationDefinition>;
  entity: MetadataDefinition<EntityDefinition>;
  fields: MetadataDefinition<FieldDefinition>[];
  action: MetadataDefinition<ActionDefinition>;
  actionPlan: RuntimeActionPlan;
  document: RuntimeDocument;
}

export interface RuntimeReadInput {
  context: RuntimeContext;
  entityCode: string;
  id?: string;
  query?: Record<string, unknown>;
}

export interface RuntimeUpdateInput extends RuntimeExecutionInput {
  id: string;
}

export interface RuntimeActionInput {
  context: RuntimeContext;
  entityCode: string;
  id: string;
  actionCode: string;
  payload: unknown;
  source?: 'OFFLINE_SYNC';
  clientVersion?: number;
  serverVersion?: number;
  clientData?: Record<string, unknown>;
}

export interface RuntimeActionResult {
  stage: 'IMPACT_READY';
  actionCode: string;
  workflow: WorkflowTransitionResult;
  process: ProcessExecutionPlan;
  business: BusinessExecutionResult;
  events: RuntimeEventPublishResult;
  ledger: LedgerExecutionResult;
  traceId: string;
  next: 'COMPLETED';
}

@Injectable()
export class RuntimeExecutor {
  constructor(
    private readonly applicationEngine: ApplicationEngine,
    private readonly metadataResolver: MetadataResolver,
    private readonly securityEngine: SecurityEngine,
    private readonly actionEngine: ActionEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly processEngine: ProcessEngine,
    private readonly businessEngine: BusinessEngine,
    private readonly eventEngine: EventEngine,
    private readonly ledgerEngine: LedgerEngine,
    private readonly traceEngine: TraceEngine,
    private readonly storageEngine: StorageEngine,
    private readonly securityPolicyEngine: SecurityPolicyEngine,
    private readonly conflictEngine: ConflictEngine,
    private readonly runtimePackageProvider: RuntimePackageProvider,
    private readonly humanTaskProcessService: HumanTaskProcessService,
  ) {}

  async create(input: RuntimeExecutionInput): Promise<RuntimeExecutionResult> {
    const { context, entityCode, payload } = input;
    const { application, entity, fields } = await this.resolveRuntimeTarget(context, entityCode);
    const action = await this.actionEngine.resolve(context, entityCode, 'CREATE');
    await this.securityEngine.validateActionAccess(context, action);
    await this.securityPolicyEngine.assertActionAllowed(context, 'CREATE', entityCode);
    const actionPlan = this.actionEngine.prepare(action, payload);
    const initialStatus = await this.workflowEngine.resolveInitialStatus(context, entityCode);
    const document = await this.storageEngine.create(context, entityCode, {
      ...(initialStatus ? { status: initialStatus } : {}),
      data: this.toData(payload),
      metadataVersion: entity.version,
    });
    const maskedDocument = await this.securityPolicyEngine.maskDocument(context, document);

    return {
      stage: 'STORED',
      context,
      application,
      entity,
      fields,
      action,
      actionPlan,
      document: maskedDocument,
    };
  }

  async findMany(input: RuntimeReadInput): Promise<RuntimeDocument[]> {
    const { context, entityCode, query } = input;
    await this.resolveRuntimeTarget(context, entityCode);
    await this.validateReadAccess(context, entityCode);
    const documents = await this.storageEngine.findMany(context, entityCode, query);
    return this.securityPolicyEngine.maskDocuments(context, documents);
  }

  async findOne(input: RuntimeReadInput): Promise<RuntimeDocument | null> {
    const { context, entityCode, id } = input;
    await this.resolveRuntimeTarget(context, entityCode);
    await this.validateReadAccess(context, entityCode);
    const document = id ? await this.storageEngine.findOne(context, entityCode, id) : null;
    return document ? this.securityPolicyEngine.maskDocument(context, document) : null;
  }

  async update(input: RuntimeUpdateInput): Promise<RuntimeDocument | null> {
    const { context, entityCode, id, payload } = input;
    const { entity } = await this.resolveRuntimeTarget(context, entityCode);
    const action = await this.actionEngine.resolve(context, entityCode, 'UPDATE');
    await this.securityEngine.validateActionAccess(context, action);
    await this.securityPolicyEngine.assertActionAllowed(context, 'UPDATE', entityCode);
    const document = await this.storageEngine.update(context, entityCode, id, {
      data: this.toData(payload),
      metadataVersion: entity.version,
    });
    return document ? this.securityPolicyEngine.maskDocument(context, document) : null;
  }

  async prepareAction(input: RuntimeActionInput): Promise<RuntimeActionResult> {
    const { context, entityCode, id, actionCode, payload, source } = input;
    const trace = await this.traceEngine.start(context, {
      entityCode,
      documentId: id,
      actionCode,
    });

    try {
      const runtimeTarget = await this.resolveRuntimeTarget(context, entityCode);
      await this.traceEngine.recordStepResult(trace.id!, 'RUNTIME_PACKAGE', 'SUCCESS', {
        status: 'RUNTIME_PACKAGE',
        version: runtimeTarget.runtimePackage?.metadataVersion,
        source: runtimeTarget.runtimePackage ? 'COMPILED' : 'METADATA_RESOLVER',
      });

      if (source === 'OFFLINE_SYNC') {
        await this.traceEngine.recordStep(trace.id!, 'CONFLICT_CHECK', () =>
          this.conflictEngine.assertNoConflict(context, {
            entityCode,
            documentId: id,
            actionCode,
            payload: this.toActionData(payload),
            clientVersion: input.clientVersion,
            serverVersion: input.serverVersion,
            clientData: input.clientData,
          }),
        );
      }

      const document = await this.storageEngine.findOne(context, entityCode, id);

      if (!document) {
        throw new NotFoundException('Runtime document was not found.');
      }

      let action!: MetadataDefinition<ActionDefinition>;
      await this.traceEngine.recordStep(
        trace.id!,
        'ACTION',
        async () => {
          action = await this.actionEngine.resolve(context, entityCode, actionCode);
          return {
            actionCode: action.definition.code,
            enabled: action.definition.enabled,
          };
        },
        { entityCode, actionCode, payload },
      );

      await this.traceEngine.recordStep(trace.id!, 'SECURITY', async () => {
        await this.securityEngine.validateActionAccess(context, action);
        return {
          allowed: true,
          permissions: action.definition.permissions ?? [],
        };
      });

      await this.traceEngine.recordStep(trace.id!, 'SECURITY_POLICY', () =>
        this.securityPolicyEngine.assertActionAllowed(context, actionCode, entityCode),
      );

      let workflowDocument = document;
      const workflow = await this.traceEngine.recordStep(trace.id!, 'WORKFLOW', async () => {
        const transition = await this.workflowEngine.transition(context, entityCode, document.status, actionCode);

        if (transition.transitioned) {
          workflowDocument =
            (await this.storageEngine.update(context, entityCode, id, {
              status: transition.to,
            })) ?? document;
        }

        return transition;
      });

      const actionData = this.toActionData(payload);
      const hasActionData = Object.keys(actionData).length > 0;

      if (hasActionData) {
        workflowDocument.data = {
          ...workflowDocument.data,
          ...actionData,
        };
      }

      const process = await this.traceEngine.recordStep(trace.id!, 'PROCESS', () =>
        this.processEngine.execute(context, entityCode, actionCode, workflow, workflowDocument),
      );

      await this.traceEngine.recordStep(trace.id!, 'HUMAN_TASK', async () =>
        this.humanTaskProcessService.execute(context, entityCode, workflowDocument, process),
      );

      const business = await this.traceEngine.recordStep(trace.id!, 'BUSINESS', async () => {
        const businessResult = await this.businessEngine.execute(context, entityCode, workflowDocument, process);

        if (
          hasActionData ||
          businessResult.executedRules.some((rule) => rule.type === 'SET_FIELD_VALUE' && rule.status === 'EXECUTED')
        ) {
          await this.storageEngine.update(context, entityCode, id, {
            data: workflowDocument.data,
          });
        }

        return businessResult;
      });

      const events = await this.traceEngine.recordStep(trace.id!, 'EVENT', () =>
        this.eventEngine.publish(context, entityCode, workflowDocument, {
          actionCode,
          workflowState: workflow.transitioned ? workflow.to : undefined,
          processCode: process.processCode,
        }),
      );

      await this.traceEngine.recordStepResult(trace.id!, 'INTEGRATION', 'SUCCESS', {
        status: 'INTEGRATION_SUCCESS',
        integrations: events.integrations,
      });

      const ledger = await this.traceEngine.recordStep(trace.id!, 'LEDGER', () =>
        this.ledgerEngine.execute(context, workflowDocument, actionCode, {
          workflowState: workflow.transitioned ? workflow.to : undefined,
          eventCodes: events.events.map((event) => event.eventCode),
        }),
      );

      if (source === 'OFFLINE_SYNC') {
        await this.traceEngine.recordStepResult(trace.id!, 'SYNC_REPLAY', 'SUCCESS', {
          source,
          entityCode,
          documentId: id,
          actionCode,
        });
      }

      await this.traceEngine.complete(trace.id!);

      return {
        stage: 'IMPACT_READY',
        actionCode,
        workflow,
        process,
        business,
        events,
        ledger,
        traceId: trace.id!,
        next: 'COMPLETED',
      };
    } catch (error) {
      await this.failTrace(trace, error);
      throw error;
    }
  }

  private async resolveRuntimeTarget(
    context: RuntimeContext,
    entityCode: string,
  ): Promise<{
    application: MetadataDefinition<ApplicationDefinition>;
    entity: MetadataDefinition<EntityDefinition>;
    fields: MetadataDefinition<FieldDefinition>[];
    runtimePackage?: RuntimePackageDefinition;
  }> {
    this.securityEngine.validateContext(context);

    const application = await this.applicationEngine.resolve(context);
    const activeRuntimePackage = await this.runtimePackageProvider.getActive(context);
    const compiledTarget = activeRuntimePackage
      ? {
          packageDefinition: activeRuntimePackage.definition,
          target: this.compiledRuntimeTarget(activeRuntimePackage.definition, entityCode),
        }
      : undefined;

    if (compiledTarget?.target) {
      return {
        application,
        ...compiledTarget.target,
        runtimePackage: compiledTarget.packageDefinition,
      };
    }

    const entity = await this.metadataResolver.resolveEntity(context, entityCode);
    const fields = await this.metadataResolver.resolveFields(context, entity.definition.fieldCodes);

    return {
      application,
      entity,
      fields,
    };
  }

  private compiledRuntimeTarget(
    runtimePackage: RuntimePackageDefinition,
    entityCode: string,
  ): { entity: MetadataDefinition<EntityDefinition>; fields: MetadataDefinition<FieldDefinition>[] } | undefined {
    const entity = runtimePackage.content.entities[entityCode] as MetadataDefinition<EntityDefinition> | undefined;

    if (!entity) {
      return undefined;
    }

    const fields = entity.definition.fieldCodes
      .map((fieldCode) => runtimePackage.content.fields[`${entityCode}:${fieldCode}`] as MetadataDefinition<FieldDefinition> | undefined)
      .filter((field): field is MetadataDefinition<FieldDefinition> => Boolean(field));

    return {
      entity,
      fields,
    };
  }

  private async validateReadAccess(context: RuntimeContext, entityCode: string): Promise<void> {
    const action = await this.actionEngine.resolve(context, entityCode, 'READ');
    await this.securityEngine.validateActionAccess(context, action);
    await this.securityPolicyEngine.assertActionAllowed(context, 'READ', entityCode);
  }

  private toData(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }

    return {
      value: payload,
    };
  }

  private toActionData(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }

    return {};
  }

  private async failTrace(trace: RuntimeTrace, error: unknown): Promise<void> {
    if (trace.id) {
      try {
        await this.traceEngine.fail(trace.id, error);
      } catch {
        // Preserve the original runtime exception; trace persistence must not mask it.
      }
    }
  }
}
