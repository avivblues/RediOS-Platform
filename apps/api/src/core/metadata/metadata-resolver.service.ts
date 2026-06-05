import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  BusinessDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
  MetadataType,
  ProcessDefinition,
  RuntimeContext,
  WorkflowDefinition,
} from '@redios/shared';
import { MetadataRegistry } from './metadata-registry.service';
import { MetadataValidator } from './metadata-validator.service';

@Injectable()
export class MetadataResolver {
  constructor(
    private readonly registry: MetadataRegistry,
    private readonly validator: MetadataValidator,
  ) {}

  resolveApplication(context: RuntimeContext): Promise<MetadataDefinition<ApplicationDefinition>> {
    return this.resolveOne<ApplicationDefinition>(context, 'APPLICATION', context.applicationCode);
  }

  resolveEntity(context: RuntimeContext, entityCode: string): Promise<MetadataDefinition<EntityDefinition>> {
    return this.resolveOne<EntityDefinition>(context, 'ENTITY', entityCode);
  }

  resolveFields(context: RuntimeContext, fieldCodes: string[]): Promise<MetadataDefinition<FieldDefinition>[]> {
    return this.resolveMany<FieldDefinition>(context, 'FIELD', fieldCodes);
  }

  async resolveAction(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
  ): Promise<MetadataDefinition<ActionDefinition>> {
    const definitions = await this.registry.findByType(context, 'ACTION');
    const definition = definitions.find((candidate) => {
      const action = candidate.definition as ActionDefinition;
      return candidate.code === actionCode && action.entityCode === entityCode;
    });
    const validation = this.validator.validate(definition ?? null);

    if (!definition) {
      throw new NotFoundException(`Metadata ACTION:${entityCode}:${actionCode} was not found.`);
    }

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<ActionDefinition>;
  }

  async resolveWorkflow(
    context: RuntimeContext,
    entityCode: string,
  ): Promise<MetadataDefinition<WorkflowDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'WORKFLOW');
    const definition = definitions.find((candidate) => {
      const workflow = candidate.definition as WorkflowDefinition;
      return workflow.entityCode === entityCode && workflow.enabled;
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<WorkflowDefinition>;
  }

  async resolveProcess(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
    workflowState?: string,
  ): Promise<MetadataDefinition<ProcessDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'PROCESS');
    const definition = definitions.find((candidate) => {
      const process = candidate.definition as ProcessDefinition;
      const workflowStateMatches = !process.trigger.workflowState || process.trigger.workflowState === workflowState;
      return (
        process.entityCode === entityCode &&
        process.trigger.actionCode === actionCode &&
        workflowStateMatches &&
        process.enabled
      );
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<ProcessDefinition>;
  }

  async resolveBusiness(
    context: RuntimeContext,
    entityCode: string,
    processCode: string,
    stepCode: string,
  ): Promise<MetadataDefinition<BusinessDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'BUSINESS');
    const definition = definitions.find((candidate) => {
      const business = candidate.definition as BusinessDefinition;
      return (
        business.entityCode === entityCode &&
        business.trigger.processCode === processCode &&
        business.trigger.stepCode === stepCode &&
        business.enabled
      );
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<BusinessDefinition>;
  }

  private async resolveMany<TDefinition>(
    context: RuntimeContext,
    type: MetadataType,
    codes: string[],
  ): Promise<MetadataDefinition<TDefinition>[]> {
    const definitions = await Promise.all(codes.map((code) => this.resolveOne<TDefinition>(context, type, code)));
    return definitions;
  }

  private async resolveOne<TDefinition>(
    context: RuntimeContext,
    type: MetadataType,
    code: string,
  ): Promise<MetadataDefinition<TDefinition>> {
    const definition = await this.registry.findOne(context, type, code);
    const validation = this.validator.validate(definition);

    if (!definition) {
      throw new NotFoundException(`Metadata ${type}:${code} was not found.`);
    }

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<TDefinition>;
  }
}
