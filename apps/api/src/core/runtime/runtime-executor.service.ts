import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
  RuntimeContext,
  RuntimeDocument,
} from '@redios/shared';
import { ActionEngine, type RuntimeActionPlan } from '../action/action-engine.service';
import { ApplicationEngine } from '../application/application-engine.service';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { SecurityEngine } from '../security/security-engine.service';
import { StorageEngine } from '../storage/storage.engine';
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
  stage: 'WORKFLOW_READY';
  actionCode: string;
  workflow: WorkflowTransitionResult;
  next: 'PROCESS_ENGINE';
}

@Injectable()
export class RuntimeExecutor {
  constructor(
    private readonly applicationEngine: ApplicationEngine,
    private readonly metadataResolver: MetadataResolver,
    private readonly securityEngine: SecurityEngine,
    private readonly actionEngine: ActionEngine,
    private readonly workflowEngine: WorkflowEngine,
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
    await this.resolveRuntimeTarget(context, entityCode);
    const document = await this.storageEngine.findOne(context, entityCode, id);

    if (!document) {
      throw new NotFoundException('Runtime document was not found.');
    }

    const action = await this.actionEngine.resolve(context, entityCode, actionCode);
    this.securityEngine.validateActionAccess(context, action);
    const workflow = await this.workflowEngine.transition(context, entityCode, document.status, actionCode);

    if (workflow.transitioned) {
      await this.storageEngine.update(context, entityCode, id, {
        status: workflow.to,
      });
    }

    return {
      stage: 'WORKFLOW_READY',
      actionCode,
      workflow,
      next: 'PROCESS_ENGINE',
    };
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
}
