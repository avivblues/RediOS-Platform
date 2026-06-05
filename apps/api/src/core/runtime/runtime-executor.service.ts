import { Injectable } from '@nestjs/common';
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

export interface RuntimeExecutionInput {
  context: RuntimeContext;
  entityCode: string;
  actionCode: string;
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

@Injectable()
export class RuntimeExecutor {
  constructor(
    private readonly applicationEngine: ApplicationEngine,
    private readonly metadataResolver: MetadataResolver,
    private readonly securityEngine: SecurityEngine,
    private readonly actionEngine: ActionEngine,
    private readonly storageEngine: StorageEngine,
  ) {}

  async execute(input: RuntimeExecutionInput): Promise<RuntimeExecutionResult> {
    const { context, entityCode, actionCode, payload } = input;

    this.securityEngine.validateContext(context);

    const application = await this.applicationEngine.resolve(context);
    const entity = await this.metadataResolver.resolveEntity(context, entityCode);
    const fields = await this.metadataResolver.resolveFields(context, entity.definition.fieldCodes);
    const action = await this.actionEngine.resolve(context, actionCode);

    this.securityEngine.validateActionAccess(context, action);

    const actionPlan = this.actionEngine.prepare(action, payload);
    const document = await this.storageEngine.create(context, entityCode, {
      status: 'DRAFT',
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

  private toData(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }

    return {
      value: payload,
    };
  }
}
