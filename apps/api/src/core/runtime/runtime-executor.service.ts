import { Injectable } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
  RuntimeContext,
} from '@redios/shared';
import { ActionEngine, type RuntimeActionPlan } from '../action/action-engine.service';
import { ApplicationEngine } from '../application/application-engine.service';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { SecurityEngine } from '../security/security-engine.service';

export interface RuntimeExecutionInput {
  context: RuntimeContext;
  entityCode: string;
  actionCode: string;
  payload: unknown;
}

export interface RuntimeExecutionResult {
  stage: 'ACTION_READY';
  context: RuntimeContext;
  application: MetadataDefinition<ApplicationDefinition>;
  entity: MetadataDefinition<EntityDefinition>;
  fields: MetadataDefinition<FieldDefinition>[];
  action: MetadataDefinition<ActionDefinition>;
  actionPlan: RuntimeActionPlan;
}

@Injectable()
export class RuntimeExecutor {
  constructor(
    private readonly applicationEngine: ApplicationEngine,
    private readonly metadataResolver: MetadataResolver,
    private readonly securityEngine: SecurityEngine,
    private readonly actionEngine: ActionEngine,
  ) {}

  async execute(input: RuntimeExecutionInput): Promise<RuntimeExecutionResult> {
    const { context, entityCode, actionCode, payload } = input;

    this.securityEngine.validateContext(context);

    const application = await this.applicationEngine.resolve(context);
    const entity = await this.metadataResolver.resolveEntity(context, entityCode);
    const fields = await this.metadataResolver.resolveFields(context, entity.definition.fieldCodes);
    const action = await this.actionEngine.resolve(context, actionCode);

    this.securityEngine.validateActionAccess(context, action);

    return {
      stage: 'ACTION_READY',
      context,
      application,
      entity,
      fields,
      action,
      actionPlan: this.actionEngine.prepare(action, payload),
    };
  }
}
