import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
  RuntimeContext,
  RuntimeDocument,
  RuntimeTrace,
} from '@redios/shared';
import { ActionEngine, type RuntimeActionPlan } from '../action/action-engine.service';
import { ApplicationEngine } from '../application/application-engine.service';
import { BusinessEngine, type BusinessExecutionResult } from '../business/business-engine.service';
import { EventEngine, type RuntimeEventPublishResult } from '../event/event-engine.service';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { ProcessEngine, type ProcessExecutionPlan } from '../process/process-engine.service';
import { SecurityEngine } from '../security/security-engine.service';
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
}

export interface RuntimeActionResult {
  stage: 'EVENT_PUBLISHED';
  actionCode: string;
  workflow: WorkflowTransitionResult;
  process: ProcessExecutionPlan;
  business: BusinessExecutionResult;
  events: RuntimeEventPublishResult;
  traceId: string;
  next: 'LEDGER_ENGINE';
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
    private readonly traceEngine: TraceEngine,
    private readonly storageEngine: StorageEngine,
  ) {}

  async create(input: RuntimeExecutionInput): Promise<RuntimeExecutionResult> {
    const { context, entityCode, payload } = input;
    const { application, entity, fields } = await this.resolveRuntimeTarget(context, entityCode);
    const action = await this.actionEngine.resolve(context, entityCode, 'CREATE');
    this.securityEngine.validateActionAccess(context, action);
    const actionPlan = this.actionEngine.prepare(action, payload);
    const initialStatus = await this.workflowEngine.resolveInitialStatus(context, entityCode);
    const document = await this.storageEngine.create(context, entityCode, {
      ...(initialStatus ? { status: initialStatus } : {}),
      data: this.toData(payload),
      metadataVersion: entity.version,
    });

    return {
      stage: 'STORED',
      context,
      application,
      entity,
      fields,
      action,
      actionPlan,
      document,
    };
  }

  async findMany(input: RuntimeReadInput): Promise<RuntimeDocument[]> {
    const { context, entityCode, query } = input;
    await this.resolveRuntimeTarget(context, entityCode);
    await this.validateReadAccess(context, entityCode);
    return this.storageEngine.findMany(context, entityCode, query);
  }

  async findOne(input: RuntimeReadInput): Promise<RuntimeDocument | null> {
    const { context, entityCode, id } = input;
    await this.resolveRuntimeTarget(context, entityCode);
    await this.validateReadAccess(context, entityCode);
    return id ? this.storageEngine.findOne(context, entityCode, id) : null;
  }

  async update(input: RuntimeUpdateInput): Promise<RuntimeDocument | null> {
    const { context, entityCode, id, payload } = input;
    const { entity } = await this.resolveRuntimeTarget(context, entityCode);
    const action = await this.actionEngine.resolve(context, entityCode, 'UPDATE');
    this.securityEngine.validateActionAccess(context, action);
    return this.storageEngine.update(context, entityCode, id, {
      data: this.toData(payload),
      metadataVersion: entity.version,
    });
  }

  async prepareAction(input: RuntimeActionInput): Promise<RuntimeActionResult> {
    const { context, entityCode, id, actionCode, payload } = input;
    const trace = await this.traceEngine.start(context, {
      entityCode,
      documentId: id,
      actionCode,
    });

    try {
      await this.resolveRuntimeTarget(context, entityCode);
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

      await this.traceEngine.recordStep(trace.id!, 'SECURITY', () => {
        this.securityEngine.validateActionAccess(context, action);
        return {
          allowed: true,
          permissions: action.definition.permissions ?? [],
        };
      });

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

      await this.traceEngine.complete(trace.id!);

      return {
        stage: 'EVENT_PUBLISHED',
        actionCode,
        workflow,
        process,
        business,
        events,
        traceId: trace.id!,
        next: 'LEDGER_ENGINE',
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
  }> {
    this.securityEngine.validateContext(context);

    const application = await this.applicationEngine.resolve(context);
    const entity = await this.metadataResolver.resolveEntity(context, entityCode);
    const fields = await this.metadataResolver.resolveFields(context, entity.definition.fieldCodes);

    return {
      application,
      entity,
      fields,
    };
  }

  private async validateReadAccess(context: RuntimeContext, entityCode: string): Promise<void> {
    const action = await this.actionEngine.resolve(context, entityCode, 'READ');
    this.securityEngine.validateActionAccess(context, action);
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
