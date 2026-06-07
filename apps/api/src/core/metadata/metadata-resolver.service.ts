import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  BusinessDefinition,
  ConflictPolicyDefinition,
  EntityDefinition,
  EventDefinition,
  EventTriggerDefinition,
  ExperienceDefinition,
  FieldDefinition,
  FormDefinition,
  LedgerDefinition,
  MetadataDefinition,
  MetadataType,
  NavigationDefinition,
  ProcessDefinition,
  RelationDefinition,
  RuntimeContext,
  SecurityPolicyDefinition,
  SyncDefinition,
  ThemeDefinition,
  UIDefinition,
  UIKind,
  UIPageDefinition,
  ViewDefinition,
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

  async resolveEvents(
    context: RuntimeContext,
    entityCode: string,
    trigger: EventTriggerDefinition,
  ): Promise<MetadataDefinition<EventDefinition>[]> {
    const definitions = await this.registry.findByType(context, 'EVENT');
    const matchingDefinitions = definitions.filter((candidate) => {
      const event = candidate.definition as EventDefinition;
      return event.entityCode === entityCode && event.enabled && this.eventTriggerMatches(event.trigger, trigger);
    });

    for (const definition of matchingDefinitions) {
      const validation = this.validator.validate(definition);

      if (!validation.valid) {
        throw new UnprocessableEntityException(validation.errors);
      }
    }

    return matchingDefinitions as MetadataDefinition<EventDefinition>[];
  }

  async resolveLedger(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
    workflowState?: string,
    eventCodes: string[] = [],
  ): Promise<MetadataDefinition<LedgerDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'LEDGER');
    const definition = definitions.find((candidate) => {
      const ledger = candidate.definition as LedgerDefinition;
      return (
        ledger.entityCode === entityCode &&
        ledger.trigger.actionCode === actionCode &&
        (!ledger.trigger.workflowState || ledger.trigger.workflowState === workflowState) &&
        (!ledger.trigger.eventCode || eventCodes.includes(ledger.trigger.eventCode)) &&
        ledger.enabled
      );
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<LedgerDefinition>;
  }

  async resolveRelations(context: RuntimeContext, entityCode: string): Promise<MetadataDefinition<RelationDefinition>[]> {
    const definitions = await this.registry.findByType(context, 'RELATION');
    const matchingDefinitions = definitions.filter((candidate) => {
      const relation = candidate.definition as RelationDefinition;
      return relation.source.entityCode === entityCode && relation.enabled;
    });

    for (const definition of matchingDefinitions) {
      const validation = this.validator.validate(definition);

      if (!validation.valid) {
        throw new UnprocessableEntityException(validation.errors);
      }
    }

    return matchingDefinitions as MetadataDefinition<RelationDefinition>[];
  }

  async resolveView(
    context: RuntimeContext,
    entityCode: string,
    viewCode?: string,
  ): Promise<MetadataDefinition<ViewDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'VIEW');
    const matchingDefinitions = definitions.filter((candidate) => {
      const view = candidate.definition as ViewDefinition;
      return view.entityCode === entityCode && view.enabled && (!viewCode || view.code === viewCode);
    });
    const definition =
      matchingDefinitions.find((candidate) => (candidate.definition as ViewDefinition).type === 'TABLE') ??
      matchingDefinitions[0];

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<ViewDefinition>;
  }

  async resolveViews(context: RuntimeContext, entityCode: string): Promise<MetadataDefinition<ViewDefinition>[]> {
    const definitions = await this.registry.findByType(context, 'VIEW');
    const matchingDefinitions = definitions.filter((candidate) => {
      const view = candidate.definition as ViewDefinition;
      return view.entityCode === entityCode && view.enabled;
    });

    for (const definition of matchingDefinitions) {
      const validation = this.validator.validate(definition);

      if (!validation.valid) {
        throw new UnprocessableEntityException(validation.errors);
      }
    }

    return matchingDefinitions as MetadataDefinition<ViewDefinition>[];
  }

  async resolveForm(
    context: RuntimeContext,
    entityCode: string,
    formCode?: string,
  ): Promise<MetadataDefinition<FormDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'FORM');
    const matchingDefinitions = definitions.filter((candidate) => {
      const form = candidate.definition as FormDefinition;
      return form.entityCode === entityCode && form.enabled && (!formCode || form.code === formCode);
    });
    const definition = matchingDefinitions[0];

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<FormDefinition>;
  }

  async resolveTheme(context: RuntimeContext, themeCode?: string): Promise<MetadataDefinition<ThemeDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'THEME');
    const matchingDefinitions = definitions.filter((candidate) => {
      const theme = candidate.definition as ThemeDefinition;
      return theme.enabled && (!themeCode || theme.code === themeCode);
    });
    const definition =
      (themeCode
        ? matchingDefinitions[0]
        : definitions.find((candidate) => (candidate.definition as ThemeDefinition).code === 'DEFAULT_THEME')) ??
      matchingDefinitions[0] ??
      definitions[0];

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<ThemeDefinition>;
  }

  async resolveNavigation(
    context: RuntimeContext,
    navigationCode?: string,
  ): Promise<MetadataDefinition<NavigationDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'NAVIGATION');
    const matchingDefinitions = definitions.filter((candidate) => {
      const navigation = candidate.definition as NavigationDefinition;
      return navigation.enabled && (!navigationCode || navigation.code === navigationCode);
    });
    const definition =
      (navigationCode
        ? matchingDefinitions[0]
        : definitions.find((candidate) => (candidate.definition as NavigationDefinition).code === 'MAIN_NAVIGATION')) ??
      matchingDefinitions[0] ??
      definitions[0];

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<NavigationDefinition>;
  }

  async resolveSecurityPolicy(
    context: RuntimeContext,
    policyCode: string,
  ): Promise<MetadataDefinition<SecurityPolicyDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'SECURITY_POLICY');
    const definition = definitions.find((candidate) => {
      const policy = candidate.definition as SecurityPolicyDefinition;
      return policy.enabled && policy.code === policyCode;
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<SecurityPolicyDefinition>;
  }

  async resolveExperience(
    context: RuntimeContext,
    entityCode: string,
  ): Promise<MetadataDefinition<ExperienceDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'EXPERIENCE');
    const matchingDefinitions = definitions
      .filter((candidate) => {
        const experience = candidate.definition as ExperienceDefinition;
        return experience.enabled && experience.entityCode === entityCode;
      })
      .sort(
        (left, right) =>
          (right.definition as ExperienceDefinition).priority - (left.definition as ExperienceDefinition).priority,
      );
    const definition = matchingDefinitions[0];

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<ExperienceDefinition>;
  }

  async resolveSyncPolicy(
    context: RuntimeContext,
    entityCode: string,
  ): Promise<MetadataDefinition<SyncDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'SYNC_POLICY');
    const matchingDefinitions = definitions
      .filter((candidate) => {
        const policy = candidate.definition as SyncDefinition;
        return policy.enabled && policy.entityCode === entityCode;
      })
      .sort((left, right) => (right.definition as SyncDefinition).priority - (left.definition as SyncDefinition).priority);
    const definition = matchingDefinitions[0];

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<SyncDefinition>;
  }

  async resolveConflictPolicy(
    context: RuntimeContext,
    entityCode: string,
  ): Promise<MetadataDefinition<ConflictPolicyDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'CONFLICT_POLICY');
    const definition = definitions.find((candidate) => {
      const policy = candidate.definition as ConflictPolicyDefinition;
      return policy.enabled && policy.entityCode === entityCode;
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<ConflictPolicyDefinition>;
  }

  async resolveUI(
    context: RuntimeContext,
    kind: UIKind,
    code: string,
  ): Promise<MetadataDefinition<UIDefinition> | null> {
    const definitions = await this.registry.findByType(context, 'UI');
    const definition = definitions.find((candidate) => {
      const ui = candidate.definition as UIDefinition;
      return ui.kind === kind && ui.code === code && ui.enabled;
    });

    if (!definition) {
      return null;
    }

    const validation = this.validator.validate(definition);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation.errors);
    }

    return definition as MetadataDefinition<UIDefinition>;
  }

  async resolveUIPages(context: RuntimeContext, entityCode: string): Promise<MetadataDefinition<UIPageDefinition>[]> {
    const definitions = await this.registry.findByType(context, 'UI');
    const matchingDefinitions = definitions.filter((candidate) => {
      const ui = candidate.definition as UIDefinition;
      return ui.kind === 'PAGE' && ui.entityCode === entityCode && ui.enabled;
    });

    for (const definition of matchingDefinitions) {
      const validation = this.validator.validate(definition);

      if (!validation.valid) {
        throw new UnprocessableEntityException(validation.errors);
      }
    }

    return matchingDefinitions as MetadataDefinition<UIPageDefinition>[];
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

  private eventTriggerMatches(expected: EventTriggerDefinition, actual: EventTriggerDefinition): boolean {
    if (expected.actionCode && expected.actionCode !== actual.actionCode) {
      return false;
    }

    if (expected.workflowState && expected.workflowState !== actual.workflowState) {
      return false;
    }

    if (expected.processCode && expected.processCode !== actual.processCode) {
      return false;
    }

    return true;
  }
}
