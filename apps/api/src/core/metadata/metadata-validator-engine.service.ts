import { Injectable } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  BusinessDefinition,
  EntityDefinition,
  EventDefinition,
  ExperienceConditions,
  ExperienceDefinition,
  FieldDefinition,
  FormDefinition,
  LedgerDefinition,
  MetadataDefinition,
  NavigationDefinition,
  NavigationItemDefinition,
  ProcessDefinition,
  RelationDefinition,
  SecurityPolicyDefinition,
  SyncDefinition,
  ThemeDefinition,
  UIAtomDefinition,
  UIDefinition,
  UIMoleculeDefinition,
  UIOrganismDefinition,
  UIPageDefinition,
  UITemplateDefinition,
  ValidationIssue,
  ValidationResult,
  ViewDefinition,
  WorkflowDefinition,
} from '@redios/shared';

type MetadataIndex = {
  applications: Map<string, MetadataDefinition<ApplicationDefinition>[]>;
  entities: Map<string, MetadataDefinition<EntityDefinition>>;
  fieldsByEntity: Map<string, Map<string, MetadataDefinition<FieldDefinition>>>;
  actionsByEntity: Map<string, Map<string, MetadataDefinition<ActionDefinition>>>;
  workflows: Map<string, MetadataDefinition<WorkflowDefinition>>;
  workflowsByEntity: Map<string, MetadataDefinition<WorkflowDefinition>>;
  processes: Map<string, MetadataDefinition<ProcessDefinition>>;
  events: Map<string, MetadataDefinition<EventDefinition>>;
  relations: Map<string, MetadataDefinition<RelationDefinition>[]>;
  views: Map<string, MetadataDefinition<ViewDefinition>[]>;
  ui: Map<string, MetadataDefinition<UIDefinition>[]>;
  forms: Map<string, MetadataDefinition<FormDefinition>[]>;
  themes: Map<string, MetadataDefinition<ThemeDefinition>[]>;
  navigation: Map<string, MetadataDefinition<NavigationDefinition>[]>;
  securityPolicies: Map<string, MetadataDefinition<SecurityPolicyDefinition>[]>;
  experiences: Map<string, MetadataDefinition<ExperienceDefinition>[]>;
  syncPolicies: Map<string, MetadataDefinition<SyncDefinition>[]>;
};

@Injectable()
export class MetadataValidatorEngine {
  validate(metadataDefinitions: MetadataDefinition[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const index = this.createIndex(metadataDefinitions);

    this.validateApplications(index, issues);
    this.validateEntities(index, issues);
    this.validateWorkflows(index, issues);
    this.validateProcesses(index, issues);
    this.validateBusinessDefinitions(metadataDefinitions, index, issues);
    this.validateEvents(metadataDefinitions, index, issues);
    this.validateLedgerDefinitions(metadataDefinitions, index, issues);
    this.validateRelationDefinitions(metadataDefinitions, index, issues);
    this.validateFieldRelationReferences(index, issues);
    this.validateViewDefinitions(metadataDefinitions, index, issues);
    this.validateUIDefinitions(metadataDefinitions, index, issues);
    this.validateFormDefinitions(metadataDefinitions, index, issues);
    this.validateThemeDefinitions(metadataDefinitions, index, issues);
    this.validateNavigationDefinitions(metadataDefinitions, index, issues);
    this.validateSecurityPolicyDefinitions(metadataDefinitions, index, issues);
    this.validateExperienceDefinitions(metadataDefinitions, index, issues);
    this.validateSyncPolicyDefinitions(metadataDefinitions, index, issues);
    this.validateDependencyIntegrity(metadataDefinitions, index, issues);

    const errors = issues.filter((issue) => issue.severity === 'ERROR').length;
    const warnings = issues.filter((issue) => issue.severity === 'WARNING').length;

    return {
      valid: errors === 0,
      errors,
      warnings,
      issues,
    };
  }

  private createIndex(metadataDefinitions: MetadataDefinition[]): MetadataIndex {
    const index: MetadataIndex = {
      applications: new Map(),
      entities: new Map(),
      fieldsByEntity: new Map(),
      actionsByEntity: new Map(),
      workflows: new Map(),
      workflowsByEntity: new Map(),
      processes: new Map(),
      events: new Map(),
      relations: new Map(),
      views: new Map(),
      ui: new Map(),
      forms: new Map(),
      themes: new Map(),
      navigation: new Map(),
      securityPolicies: new Map(),
      experiences: new Map(),
      syncPolicies: new Map(),
    };

    for (const metadata of metadataDefinitions) {
      if (metadata.type === 'APPLICATION') {
        const records = index.applications.get(metadata.code) ?? [];
        records.push(metadata as MetadataDefinition<ApplicationDefinition>);
        index.applications.set(metadata.code, records);
      }

      if (metadata.type === 'ENTITY') {
        index.entities.set(metadata.code, metadata as MetadataDefinition<EntityDefinition>);
      }

      if (metadata.type === 'FIELD') {
        const field = metadata.definition as FieldDefinition;
        const fields = index.fieldsByEntity.get(field.entityCode) ?? new Map();
        fields.set(field.code, metadata as MetadataDefinition<FieldDefinition>);
        index.fieldsByEntity.set(field.entityCode, fields);
      }

      if (metadata.type === 'ACTION') {
        const action = metadata.definition as ActionDefinition;
        const actions = index.actionsByEntity.get(action.entityCode) ?? new Map();
        actions.set(action.code, metadata as MetadataDefinition<ActionDefinition>);
        index.actionsByEntity.set(action.entityCode, actions);
      }

      if (metadata.type === 'WORKFLOW') {
        const workflow = metadata.definition as WorkflowDefinition;
        index.workflows.set(workflow.code, metadata as MetadataDefinition<WorkflowDefinition>);
        index.workflowsByEntity.set(workflow.entityCode, metadata as MetadataDefinition<WorkflowDefinition>);
      }

      if (metadata.type === 'PROCESS') {
        const process = metadata.definition as ProcessDefinition;
        index.processes.set(process.code, metadata as MetadataDefinition<ProcessDefinition>);
      }

      if (metadata.type === 'EVENT') {
        const event = metadata.definition as EventDefinition;
        index.events.set(event.code, metadata as MetadataDefinition<EventDefinition>);
      }

      if (metadata.type === 'RELATION') {
        const records = index.relations.get(metadata.code) ?? [];
        records.push(metadata as MetadataDefinition<RelationDefinition>);
        index.relations.set(metadata.code, records);
      }

      if (metadata.type === 'VIEW') {
        const records = index.views.get(metadata.code) ?? [];
        records.push(metadata as MetadataDefinition<ViewDefinition>);
        index.views.set(metadata.code, records);
      }

      if (metadata.type === 'UI') {
        const ui = metadata.definition as UIDefinition;
        const key = this.uiKey(ui.kind, ui.code);
        const records = index.ui.get(key) ?? [];
        records.push(metadata as MetadataDefinition<UIDefinition>);
        index.ui.set(key, records);
      }

      if (metadata.type === 'FORM') {
        const form = metadata.definition as FormDefinition;
        const key = this.formKey(form.entityCode, form.code);
        const records = index.forms.get(key) ?? [];
        records.push(metadata as MetadataDefinition<FormDefinition>);
        index.forms.set(key, records);
      }

      if (metadata.type === 'THEME') {
        const records = index.themes.get(metadata.code) ?? [];
        records.push(metadata as MetadataDefinition<ThemeDefinition>);
        index.themes.set(metadata.code, records);
      }

      if (metadata.type === 'NAVIGATION') {
        const records = index.navigation.get(metadata.code) ?? [];
        records.push(metadata as MetadataDefinition<NavigationDefinition>);
        index.navigation.set(metadata.code, records);
      }

      if (metadata.type === 'EXPERIENCE') {
        const experience = metadata.definition as ExperienceDefinition;
        const key = this.experienceKey(experience.entityCode, experience.code);
        const records = index.experiences.get(key) ?? [];
        records.push(metadata as MetadataDefinition<ExperienceDefinition>);
        index.experiences.set(key, records);
      }

      if (metadata.type === 'SECURITY_POLICY') {
        const records = index.securityPolicies.get(metadata.code) ?? [];
        records.push(metadata as MetadataDefinition<SecurityPolicyDefinition>);
        index.securityPolicies.set(metadata.code, records);
      }

      if (metadata.type === 'SYNC_POLICY') {
        const syncPolicy = metadata.definition as SyncDefinition;
        const key = this.syncPolicyKey(syncPolicy.entityCode, syncPolicy.code);
        const records = index.syncPolicies.get(key) ?? [];
        records.push(metadata as MetadataDefinition<SyncDefinition>);
        index.syncPolicies.set(key, records);
      }
    }

    return index;
  }

  private validateApplications(index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [code, applications] of index.applications.entries()) {
      if (!code) {
        this.addIssue(issues, 'APPLICATION_CODE_REQUIRED', 'ERROR', 'Application code is required.', 'APPLICATION.code');
      }

      if (applications.length > 1) {
        this.addIssue(
          issues,
          'DUPLICATE_APPLICATION_CODE',
          'ERROR',
          `Duplicate application code ${code}.`,
          `APPLICATION.${code}`,
          'Keep one APPLICATION definition per code.',
        );
      }

      for (const application of applications) {
        for (const entityCode of application.definition.entityCodes ?? []) {
          if (!index.entities.has(entityCode)) {
            this.addIssue(
              issues,
              'ENTITY_NOT_FOUND',
              'ERROR',
              `Application references missing entity ${entityCode}.`,
              `APPLICATION.${application.code}.entityCodes`,
              `Create ${entityCode} entity metadata.`,
            );
          }
        }
      }
    }
  }

  private validateEntities(index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [entityCode, entityMetadata] of index.entities.entries()) {
      const entity = entityMetadata.definition;

      if (!entity.code) {
        this.addIssue(issues, 'ENTITY_CODE_REQUIRED', 'ERROR', 'Entity code is required.', `ENTITY.${entityCode}.code`);
      }

      for (const fieldCode of entity.fieldCodes ?? []) {
        if (!index.fieldsByEntity.get(entity.code)?.has(fieldCode)) {
          this.addIssue(
            issues,
            'FIELD_NOT_FOUND',
            'ERROR',
            `Entity references missing field ${fieldCode}.`,
            `ENTITY.${entity.code}.fieldCodes`,
            `Create ${fieldCode} field metadata.`,
          );
        }
      }

      for (const actionCode of entity.actionCodes ?? []) {
        if (!index.actionsByEntity.get(entity.code)?.has(actionCode)) {
          this.addIssue(
            issues,
            'ACTION_NOT_FOUND',
            'ERROR',
            `Entity references missing action ${actionCode}.`,
            `ENTITY.${entity.code}.actionCodes`,
            `Create ${actionCode} action metadata.`,
          );
        }
      }

      if (entity.workflowCode && !index.workflows.has(entity.workflowCode)) {
        this.addIssue(
          issues,
          'WORKFLOW_NOT_FOUND',
          'ERROR',
          'Entity references missing workflow.',
          `ENTITY.${entity.code}.workflowCode`,
          `Create ${entity.workflowCode} workflow.`,
        );
      }
    }
  }

  private validateWorkflows(index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const workflowMetadata of index.workflows.values()) {
      const workflow = workflowMetadata.definition;
      const stateCodes = new Set(workflow.states.map((state) => state.code));

      if (workflow.states.length === 0) {
        this.addIssue(issues, 'WORKFLOW_STATES_REQUIRED', 'ERROR', 'Workflow must define states.', `WORKFLOW.${workflow.code}.states`);
      }

      for (const [transitionIndex, transition] of workflow.transitions.entries()) {
        if (!stateCodes.has(transition.from)) {
          this.addIssue(
            issues,
            'STATE_NOT_FOUND',
            'ERROR',
            `Source state ${transition.from} does not exist.`,
            `WORKFLOW.${workflow.code}.transitions[${transitionIndex}]`,
            `Create state ${transition.from}.`,
          );
        }

        if (!stateCodes.has(transition.to)) {
          this.addIssue(
            issues,
            'STATE_NOT_FOUND',
            'ERROR',
            `Target state ${transition.to} does not exist.`,
            `WORKFLOW.${workflow.code}.transitions[${transitionIndex}]`,
            `Create state ${transition.to}.`,
          );
        }

        if (!index.actionsByEntity.get(workflow.entityCode)?.has(transition.actionCode)) {
          this.addIssue(
            issues,
            'ACTION_NOT_FOUND',
            'ERROR',
            `Workflow transition references missing action ${transition.actionCode}.`,
            `WORKFLOW.${workflow.code}.transitions[${transitionIndex}].actionCode`,
            `Create ${transition.actionCode} action metadata.`,
          );
        }
      }

      const initialStates = workflow.states.filter((state) => state.initial);

      if (initialStates.length !== 1) {
        this.addIssue(
          issues,
          'INITIAL_STATE_INVALID',
          'ERROR',
          'Workflow must have exactly one initial state.',
          `WORKFLOW.${workflow.code}.states`,
          'Mark exactly one state with initial:true.',
        );
      }

      if (!workflow.states.some((state) => state.final)) {
        this.addIssue(
          issues,
          'FINAL_STATE_MISSING',
          'WARNING',
          'Workflow has no final state.',
          `WORKFLOW.${workflow.code}.states`,
          'Mark at least one state with final:true if the lifecycle can end.',
        );
      }
    }
  }

  private validateProcesses(index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const processMetadata of index.processes.values()) {
      const process = processMetadata.definition;

      if (!index.actionsByEntity.get(process.entityCode)?.has(process.trigger.actionCode)) {
        this.addIssue(
          issues,
          'ACTION_NOT_FOUND',
          'ERROR',
          `Process trigger references missing action ${process.trigger.actionCode}.`,
          `PROCESS.${process.code}.trigger.actionCode`,
          `Create ${process.trigger.actionCode} action metadata.`,
        );
      }

      if (process.trigger.workflowState && !this.workflowHasState(index, process.entityCode, process.trigger.workflowState)) {
        this.addIssue(
          issues,
          'STATE_NOT_FOUND',
          'ERROR',
          `Process trigger references missing workflow state ${process.trigger.workflowState}.`,
          `PROCESS.${process.code}.trigger.workflowState`,
          `Create state ${process.trigger.workflowState}.`,
        );
      }

      if (process.steps.length === 0) {
        this.addIssue(issues, 'PROCESS_STEPS_REQUIRED', 'ERROR', 'Process must have at least one step.', `PROCESS.${process.code}.steps`);
      }

      const orderCounts = process.steps.reduce<Map<number, number>>((counts, step) => {
        counts.set(step.order, (counts.get(step.order) ?? 0) + 1);
        return counts;
      }, new Map());

      for (const [order, count] of orderCounts.entries()) {
        if (count > 1) {
          this.addIssue(
            issues,
            'PROCESS_STEP_ORDER_DUPLICATE',
            'ERROR',
            `Process has duplicate step order ${order}.`,
            `PROCESS.${process.code}.steps`,
            'Use unique order values for process steps.',
          );
        }
      }
    }
  }

  private validateBusinessDefinitions(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'BUSINESS')) {
      const business = metadata.definition as BusinessDefinition;
      const fields = index.fieldsByEntity.get(business.entityCode);

      for (const [ruleIndex, rule] of business.rules.entries()) {
        if (rule.type === 'VALIDATE_REQUIRED_FIELD' || rule.type === 'SET_FIELD_VALUE') {
          const field = this.configString(rule.config, 'field');

          if (!field || !fields?.has(field)) {
            this.addIssue(
              issues,
              'FIELD_NOT_FOUND',
              'ERROR',
              `Business rule references missing field ${field ?? '(missing)'}.`,
              `BUSINESS.${business.code}.rules[${ruleIndex}].config.field`,
              'Create the field metadata or update the business rule config.',
            );
          }
        }

        if (rule.type === 'CALCULATE_FIELD' && !rule.config) {
          this.addIssue(
            issues,
            'BUSINESS_RULE_CONFIG_MISSING',
            'ERROR',
            'CALCULATE_FIELD rule requires config metadata.',
            `BUSINESS.${business.code}.rules[${ruleIndex}].config`,
          );
        }
      }
    }
  }

  private validateEvents(metadataDefinitions: MetadataDefinition[], index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'EVENT')) {
      const event = metadata.definition as EventDefinition;
      const hasTrigger = Boolean(event.trigger.actionCode || event.trigger.workflowState || event.trigger.processCode);

      if (!hasTrigger) {
        this.addIssue(issues, 'EVENT_TRIGGER_REQUIRED', 'ERROR', 'Event must define a trigger.', `EVENT.${event.code}.trigger`);
      }

      if (event.trigger.actionCode && !index.actionsByEntity.get(event.entityCode)?.has(event.trigger.actionCode)) {
        this.addIssue(
          issues,
          'ACTION_NOT_FOUND',
          'ERROR',
          `Event trigger references missing action ${event.trigger.actionCode}.`,
          `EVENT.${event.code}.trigger.actionCode`,
          `Create ${event.trigger.actionCode} action metadata.`,
        );
      }

      if (event.trigger.workflowState && !this.workflowHasState(index, event.entityCode, event.trigger.workflowState)) {
        this.addIssue(
          issues,
          'STATE_NOT_FOUND',
          'ERROR',
          `Event trigger references missing workflow state ${event.trigger.workflowState}.`,
          `EVENT.${event.code}.trigger.workflowState`,
          `Create state ${event.trigger.workflowState}.`,
        );
      }

      if (event.trigger.processCode && !index.processes.has(event.trigger.processCode)) {
        this.addIssue(
          issues,
          'PROCESS_NOT_FOUND',
          'ERROR',
          `Event trigger references missing process ${event.trigger.processCode}.`,
          `EVENT.${event.code}.trigger.processCode`,
          `Create ${event.trigger.processCode} process metadata.`,
        );
      }

      for (const [handlerIndex, handler] of event.handlers.entries()) {
        if (!handler.type) {
          this.addIssue(
            issues,
            'EVENT_HANDLER_TYPE_REQUIRED',
            'ERROR',
            'Event handler type is required.',
            `EVENT.${event.code}.handlers[${handlerIndex}].type`,
          );
        }

        if (typeof handler.enabled !== 'boolean') {
          this.addIssue(
            issues,
            'EVENT_HANDLER_ENABLED_REQUIRED',
            'ERROR',
            'Event handler enabled flag is required.',
            `EVENT.${event.code}.handlers[${handlerIndex}].enabled`,
          );
        }
      }
    }
  }

  private validateLedgerDefinitions(metadataDefinitions: MetadataDefinition[], index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'LEDGER')) {
      const ledger = metadata.definition as LedgerDefinition;

      if (!index.actionsByEntity.get(ledger.entityCode)?.has(ledger.trigger.actionCode)) {
        this.addIssue(
          issues,
          'ACTION_NOT_FOUND',
          'ERROR',
          `Ledger trigger references missing action ${ledger.trigger.actionCode}.`,
          `LEDGER.${ledger.code}.trigger.actionCode`,
          `Create ${ledger.trigger.actionCode} action metadata.`,
        );
      }

      if (ledger.trigger.workflowState && !this.workflowHasState(index, ledger.entityCode, ledger.trigger.workflowState)) {
        this.addIssue(
          issues,
          'STATE_NOT_FOUND',
          'ERROR',
          `Ledger trigger references missing workflow state ${ledger.trigger.workflowState}.`,
          `LEDGER.${ledger.code}.trigger.workflowState`,
          `Create state ${ledger.trigger.workflowState}.`,
        );
      }

      if (ledger.trigger.eventCode && !index.events.has(ledger.trigger.eventCode)) {
        this.addIssue(
          issues,
          'EVENT_NOT_FOUND',
          'ERROR',
          `Ledger trigger references missing event ${ledger.trigger.eventCode}.`,
          `LEDGER.${ledger.code}.trigger.eventCode`,
          `Create ${ledger.trigger.eventCode} event metadata.`,
        );
      }

      for (const [impactIndex, impact] of ledger.impacts.entries()) {
        if (!index.entities.has(impact.target.entityCode)) {
          this.addIssue(
            issues,
            'ENTITY_NOT_FOUND',
            'ERROR',
            `Ledger impact references missing target entity ${impact.target.entityCode}.`,
            `LEDGER.${ledger.code}.impacts[${impactIndex}].target.entityCode`,
            `Create ${impact.target.entityCode} entity metadata.`,
          );
          continue;
        }

        const targetFields = index.fieldsByEntity.get(impact.target.entityCode);

        for (const targetField of Object.keys(impact.mapping ?? {})) {
          if (!targetFields?.has(targetField)) {
            this.addIssue(
              issues,
              'FIELD_NOT_FOUND',
              'ERROR',
              `Ledger impact maps to missing target field ${targetField}.`,
              `LEDGER.${ledger.code}.impacts[${impactIndex}].mapping.${targetField}`,
              `Create ${targetField} field metadata on ${impact.target.entityCode}.`,
            );
          }
        }

        for (const sourcePath of Object.values(impact.mapping ?? {})) {
          if (sourcePath.startsWith('relation.')) {
            const relationCode = sourcePath.split('.')[1];

            if (!relationCode || !index.relations.has(relationCode)) {
              this.addIssue(
                issues,
                'RELATION_NOT_FOUND',
                'ERROR',
                `Ledger impact references missing relation ${relationCode ?? '(missing)'}.`,
                `LEDGER.${ledger.code}.impacts[${impactIndex}].mapping`,
                `Create ${relationCode ?? 'the referenced'} relation metadata.`,
              );
            }
          }
        }
      }
    }
  }

  private validateRelationDefinitions(metadataDefinitions: MetadataDefinition[], index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [relationCode, relations] of index.relations.entries()) {
      if (relations.length > 1) {
        this.addIssue(
          issues,
          'DUPLICATE_RELATION_CODE',
          'ERROR',
          `Duplicate relation code ${relationCode}.`,
          `RELATION.${relationCode}`,
          'Keep one RELATION definition per code.',
        );
      }
    }

    const ownershipEdges: Array<{ code: string; source: string; target: string }> = [];

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'RELATION')) {
      const relation = metadata.definition as RelationDefinition;
      const sourceFields = index.fieldsByEntity.get(relation.source.entityCode);
      const targetFields = index.fieldsByEntity.get(relation.target.entityCode);

      if (!index.entities.has(relation.source.entityCode)) {
        this.addIssue(
          issues,
          'RELATION_ENTITY_NOT_FOUND',
          'ERROR',
          `Relation references missing source entity ${relation.source.entityCode}.`,
          `RELATION.${relation.code}.source.entityCode`,
          `Create ${relation.source.entityCode} entity metadata.`,
        );
      }

      if (!index.entities.has(relation.target.entityCode)) {
        this.addIssue(
          issues,
          'RELATION_ENTITY_NOT_FOUND',
          'ERROR',
          `Relation references missing target entity ${relation.target.entityCode}.`,
          `RELATION.${relation.code}.target.entityCode`,
          `Create ${relation.target.entityCode} entity metadata.`,
        );
      }

      if (!this.fieldExists(sourceFields, relation.mapping.sourceField)) {
        this.addIssue(
          issues,
          'RELATION_FIELD_NOT_FOUND',
          'ERROR',
          `Relation source field ${relation.mapping.sourceField} does not exist.`,
          `RELATION.${relation.code}.mapping.sourceField`,
          `Create ${relation.mapping.sourceField} field metadata on ${relation.source.entityCode}.`,
        );
      }

      if (!this.fieldExists(targetFields, relation.mapping.targetField)) {
        this.addIssue(
          issues,
          'RELATION_FIELD_NOT_FOUND',
          'ERROR',
          `Relation target field ${relation.mapping.targetField} does not exist.`,
          `RELATION.${relation.code}.mapping.targetField`,
          `Create ${relation.mapping.targetField} field metadata on ${relation.target.entityCode}.`,
        );
      }

      if (relation.behavior.ownership) {
        ownershipEdges.push({
          code: relation.code,
          source: relation.source.entityCode,
          target: relation.target.entityCode,
        });
      }
    }

    for (const edge of ownershipEdges) {
      const circular = ownershipEdges.find(
        (candidate) => candidate.source === edge.target && candidate.target === edge.source && candidate.code !== edge.code,
      );

      if (circular) {
        this.addIssue(
          issues,
          'CIRCULAR_OWNERSHIP',
          'ERROR',
          `Relations ${edge.code} and ${circular.code} define circular ownership.`,
          `RELATION.${edge.code}.behavior.ownership`,
          'Only one side of a relation pair should own the lifecycle.',
        );
      }
    }
  }

  private validateFieldRelationReferences(index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const fields of index.fieldsByEntity.values()) {
      for (const field of fields.values()) {
        const relationCode = field.definition.relation;

        if (relationCode && !index.relations.has(relationCode)) {
          this.addIssue(
            issues,
            'RELATION_NOT_FOUND',
            'ERROR',
            `Field references missing relation ${relationCode}.`,
            `FIELD.${field.definition.entityCode}.${field.definition.code}.relation`,
            `Create ${relationCode} relation metadata.`,
          );
        }
      }
    }
  }

  private validateViewDefinitions(metadataDefinitions: MetadataDefinition[], index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [viewCode, views] of index.views.entries()) {
      if (views.length > 1) {
        this.addIssue(
          issues,
          'DUPLICATE_VIEW_CODE',
          'ERROR',
          `Duplicate view code ${viewCode}.`,
          `VIEW.${viewCode}`,
          'Keep one VIEW definition per code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'VIEW')) {
      const view = metadata.definition as ViewDefinition;
      const entityFields = index.fieldsByEntity.get(view.entityCode);
      const columnCounts = view.columns.reduce<Map<string, number>>((counts, column) => {
        counts.set(column.field, (counts.get(column.field) ?? 0) + 1);
        return counts;
      }, new Map());

      if (!index.entities.has(view.entityCode)) {
        this.addIssue(
          issues,
          'ENTITY_NOT_FOUND',
          'ERROR',
          `View references missing entity ${view.entityCode}.`,
          `VIEW.${view.code}.entityCode`,
          `Create ${view.entityCode} entity metadata.`,
        );
      }

      for (const [columnIndex, column] of view.columns.entries()) {
        if (!this.fieldExists(entityFields, column.field)) {
          this.addIssue(
            issues,
            'FIELD_NOT_FOUND',
            'ERROR',
            `View column references missing field ${column.field}.`,
            `VIEW.${view.code}.columns[${columnIndex}].field`,
            `Create ${column.field} field metadata on ${view.entityCode}.`,
          );
        }

        if (column.relation && !index.relations.has(column.relation)) {
          this.addIssue(
            issues,
            'RELATION_NOT_FOUND',
            'ERROR',
            `View column references missing relation ${column.relation}.`,
            `VIEW.${view.code}.columns[${columnIndex}].relation`,
            `Create ${column.relation} relation metadata.`,
          );
        }
      }

      for (const [field, count] of columnCounts.entries()) {
        if (count > 1) {
          this.addIssue(
            issues,
            'DUPLICATE_VIEW_COLUMN',
            'ERROR',
            `View has duplicate column ${field}.`,
            `VIEW.${view.code}.columns`,
            'Keep one column per field.',
          );
        }
      }

      for (const [filterIndex, filter] of view.filters.entries()) {
        if (!this.fieldExists(entityFields, filter.field)) {
          this.addIssue(
            issues,
            'FIELD_NOT_FOUND',
            'ERROR',
            `View filter references missing field ${filter.field}.`,
            `VIEW.${view.code}.filters[${filterIndex}].field`,
            `Create ${filter.field} field metadata on ${view.entityCode}.`,
          );
        }
      }

      if (view.sorting && !this.fieldExists(entityFields, view.sorting.field)) {
        this.addIssue(
          issues,
          'FIELD_NOT_FOUND',
          'ERROR',
          `View sorting references missing field ${view.sorting.field}.`,
          `VIEW.${view.code}.sorting.field`,
          `Create ${view.sorting.field} field metadata on ${view.entityCode}.`,
        );
      }
    }
  }

  private validateUIDefinitions(metadataDefinitions: MetadataDefinition[], index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [key, definitions] of index.ui.entries()) {
      if (definitions.length > 1) {
        this.addIssue(
          issues,
          'DUPLICATE_UI_CODE',
          'ERROR',
          `Duplicate UI definition ${key}.`,
          `UI.${key}`,
          'Keep one UI definition per kind and code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'UI')) {
      const ui = metadata.definition as UIDefinition;

      if (ui.kind === 'ATOM') {
        this.validateUIAtom(ui, issues);
      }

      if (ui.kind === 'MOLECULE') {
        this.validateUIMolecule(ui, index, issues);
      }

      if (ui.kind === 'ORGANISM') {
        this.validateUIOrganism(ui, index, issues);
      }

      if (ui.kind === 'TEMPLATE') {
        this.validateUITemplate(ui, issues);
      }

      if (ui.kind === 'PAGE') {
        this.validateUIPage(ui, index, issues);
      }
    }
  }

  private validateUIAtom(atom: UIAtomDefinition, issues: ValidationIssue[]): void {
    if (!atom.renderer.web || !atom.renderer.mobile) {
      this.addIssue(
        issues,
        'UI_RENDERER_NOT_FOUND',
        'ERROR',
        `UI atom ${atom.code} must define web and mobile renderer names.`,
        `UI.ATOM.${atom.code}.renderer`,
        'Set renderer.web and renderer.mobile.',
      );
    }
  }

  private validateUIMolecule(molecule: UIMoleculeDefinition, index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [atomIndex, atomBinding] of molecule.atoms.entries()) {
      if (!this.hasUI(index, 'ATOM', atomBinding.atom)) {
        this.addIssue(
          issues,
          'UI_ATOM_NOT_FOUND',
          'ERROR',
          `Molecule ${molecule.code} references missing atom ${atomBinding.atom}.`,
          `UI.MOLECULE.${molecule.code}.atoms[${atomIndex}].atom`,
          `Create atom ${atomBinding.atom}.`,
        );
      }
    }
  }

  private validateUIOrganism(organism: UIOrganismDefinition, index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [moleculeIndex, moleculeBinding] of organism.molecules.entries()) {
      if (!this.hasUI(index, 'MOLECULE', moleculeBinding.molecule)) {
        this.addIssue(
          issues,
          'UI_MOLECULE_NOT_FOUND',
          'ERROR',
          `Organism ${organism.code} references missing molecule ${moleculeBinding.molecule}.`,
          `UI.ORGANISM.${organism.code}.molecules[${moleculeIndex}].molecule`,
          `Create molecule ${moleculeBinding.molecule}.`,
        );
      }
    }
  }

  private validateUITemplate(template: UITemplateDefinition, issues: ValidationIssue[]): void {
    const regionCounts = template.regions.reduce<Map<string, number>>((counts, region) => {
      counts.set(region.code, (counts.get(region.code) ?? 0) + 1);
      return counts;
    }, new Map());

    for (const [regionCode, count] of regionCounts.entries()) {
      if (count > 1) {
        this.addIssue(
          issues,
          'UI_REGION_INVALID',
          'ERROR',
          `Template ${template.code} has duplicate region ${regionCode}.`,
          `UI.TEMPLATE.${template.code}.regions`,
          'Use unique region codes.',
        );
      }
    }
  }

  private validateUIPage(page: UIPageDefinition, index: MetadataIndex, issues: ValidationIssue[]): void {
    const template = this.getUI<UITemplateDefinition>(index, 'TEMPLATE', page.template);

    if (!template) {
      this.addIssue(
        issues,
        'UI_TEMPLATE_NOT_FOUND',
        'ERROR',
        `Page ${page.code} references missing template ${page.template}.`,
        `UI.PAGE.${page.code}.template`,
        `Create template ${page.template}.`,
      );
    }

    const templateRegions = new Set(template?.regions.map((region) => region.code) ?? []);

    for (const [regionCode, organisms] of Object.entries(page.regions)) {
      if (template && !templateRegions.has(regionCode)) {
        this.addIssue(
          issues,
          'UI_REGION_INVALID',
          'ERROR',
          `Page ${page.code} uses region ${regionCode} that is not declared by template ${page.template}.`,
          `UI.PAGE.${page.code}.regions.${regionCode}`,
          `Add region ${regionCode} to template ${page.template} or update the page region.`,
        );
      }

      for (const [organismIndex, organismCode] of organisms.entries()) {
        if (!this.hasUI(index, 'ORGANISM', organismCode)) {
          this.addIssue(
            issues,
            'UI_ORGANISM_NOT_FOUND',
            'ERROR',
            `Page ${page.code} references missing organism ${organismCode}.`,
            `UI.PAGE.${page.code}.regions.${regionCode}[${organismIndex}]`,
            `Create organism ${organismCode}.`,
          );
        }
      }
    }
  }

  private validateFormDefinitions(metadataDefinitions: MetadataDefinition[], index: MetadataIndex, issues: ValidationIssue[]): void {
    for (const [key, definitions] of index.forms.entries()) {
      if (definitions.length > 1) {
        this.addIssue(
          issues,
          'DUPLICATE_FORM_CODE',
          'ERROR',
          `Duplicate form definition ${key}.`,
          `FORM.${key}`,
          'Keep one FORM definition per entity and code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'FORM')) {
      const form = metadata.definition as FormDefinition;
      const entityFields = index.fieldsByEntity.get(form.entityCode);
      const fieldCounts = new Map<string, number>();
      const sectionOrderCounts = new Map<number, number>();

      if (!index.entities.has(form.entityCode)) {
        this.addIssue(
          issues,
          'ENTITY_NOT_FOUND',
          'ERROR',
          `Form references missing entity ${form.entityCode}.`,
          `FORM.${form.code}.entityCode`,
          `Create ${form.entityCode} entity metadata.`,
        );
      }

      for (const section of form.layout.sections) {
        sectionOrderCounts.set(section.order, (sectionOrderCounts.get(section.order) ?? 0) + 1);

        for (const [fieldIndex, field] of section.fields.entries()) {
          fieldCounts.set(field.fieldCode, (fieldCounts.get(field.fieldCode) ?? 0) + 1);

          if (!this.fieldExists(entityFields, field.fieldCode)) {
            this.addIssue(
              issues,
              'FORM_FIELD_NOT_FOUND',
              'ERROR',
              `Form field ${field.fieldCode} does not exist on entity ${form.entityCode}.`,
              `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].fieldCode`,
              `Create ${field.fieldCode} field metadata on ${form.entityCode}.`,
            );
          }

          if (!this.hasUI(index, 'ATOM', field.component)) {
            this.addIssue(
              issues,
              'FORM_COMPONENT_NOT_FOUND',
              'ERROR',
              `Form field ${field.fieldCode} references missing UI component ${field.component}.`,
              `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].component`,
              `Create UI atom ${field.component}.`,
            );
          }

          if (field.lookup) {
            if (!index.relations.has(field.lookup.relationCode)) {
              this.addIssue(
                issues,
                'FORM_RELATION_NOT_FOUND',
                'ERROR',
                `Form lookup references missing relation ${field.lookup.relationCode}.`,
                `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].lookup.relationCode`,
                `Create relation ${field.lookup.relationCode}.`,
              );
            }

            if (!index.views.has(field.lookup.viewCode)) {
              this.addIssue(
                issues,
                'FORM_VIEW_NOT_FOUND',
                'ERROR',
                `Form lookup references missing view ${field.lookup.viewCode}.`,
                `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].lookup.viewCode`,
                `Create view ${field.lookup.viewCode}.`,
              );
            }
          }

          if (field.component === 'LOOKUP' && !field.lookup) {
            this.addIssue(
              issues,
              'FORM_RELATION_NOT_FOUND',
              'ERROR',
              `Lookup field ${field.fieldCode} must define relation metadata.`,
              `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].lookup.relationCode`,
              'Set lookup.relationCode for lookup fields.',
            );
            this.addIssue(
              issues,
              'FORM_VIEW_NOT_FOUND',
              'ERROR',
              `Lookup field ${field.fieldCode} must define lookup view metadata.`,
              `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].lookup.viewCode`,
              'Set lookup.viewCode for lookup fields.',
            );
          }
        }
      }

      for (const [fieldCode, count] of fieldCounts.entries()) {
        if (count > 1) {
          this.addIssue(
            issues,
            'DUPLICATE_FORM_FIELD',
            'ERROR',
            `Form has duplicate field ${fieldCode}.`,
            `FORM.${form.code}.layout.sections`,
            'Keep one form field per entity field.',
          );
        }
      }

      for (const [order, count] of sectionOrderCounts.entries()) {
        if (count > 1) {
          this.addIssue(
            issues,
            'DUPLICATE_FORM_SECTION_ORDER',
            'ERROR',
            `Form has duplicate section order ${order}.`,
            `FORM.${form.code}.layout.sections`,
            'Use unique section order values.',
          );
        }
      }
    }
  }

  private validateThemeDefinitions(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    const requiredColorTokens: Array<keyof ThemeDefinition['tokens']['colors']> = [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'background',
      'surface',
      'text',
    ];

    for (const [themeCode, themes] of index.themes.entries()) {
      if (themes.length > 1) {
        this.addIssue(
          issues,
          'THEME_DUPLICATE',
          'ERROR',
          `Duplicate theme code ${themeCode}.`,
          `THEME.${themeCode}`,
          'Keep one THEME definition per code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'THEME')) {
      const theme = metadata.definition as ThemeDefinition;

      for (const token of requiredColorTokens) {
        if (!theme.tokens.colors[token]) {
          this.addIssue(
            issues,
            'THEME_TOKEN_MISSING',
            'ERROR',
            `Theme ${theme.code} is missing color token ${token}.`,
            `THEME.${theme.code}.tokens.colors.${token}`,
            `Set tokens.colors.${token}.`,
          );
        }
      }

      if (!['SIDEBAR', 'TOPBAR', 'HYBRID'].includes(theme.layout.navigation)) {
        this.addIssue(
          issues,
          'THEME_LAYOUT_INVALID',
          'ERROR',
          `Theme ${theme.code} has invalid navigation mode ${theme.layout.navigation}.`,
          `THEME.${theme.code}.layout.navigation`,
          'Use SIDEBAR, TOPBAR, or HYBRID.',
        );
      }

      if (!['COMPACT', 'NORMAL', 'COMFORTABLE'].includes(theme.layout.density)) {
        this.addIssue(
          issues,
          'THEME_LAYOUT_INVALID',
          'ERROR',
          `Theme ${theme.code} has invalid density ${theme.layout.density}.`,
          `THEME.${theme.code}.layout.density`,
          'Use COMPACT, NORMAL, or COMFORTABLE.',
        );
      }
    }
  }

  private validateNavigationDefinitions(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    for (const [navigationCode, definitions] of index.navigation.entries()) {
      if (definitions.length > 1) {
        this.addIssue(
          issues,
          'NAVIGATION_DUPLICATE',
          'ERROR',
          `Duplicate navigation code ${navigationCode}.`,
          `NAVIGATION.${navigationCode}`,
          'Keep one NAVIGATION definition per code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'NAVIGATION')) {
      const navigation = metadata.definition as NavigationDefinition;

      if (!['SIDEBAR', 'TOPBAR', 'MOBILE_TAB'].includes(navigation.type)) {
        this.addIssue(
          issues,
          'NAVIGATION_TYPE_INVALID',
          'ERROR',
          `Navigation ${navigation.code} has invalid type ${navigation.type}.`,
          `NAVIGATION.${navigation.code}.type`,
          'Use SIDEBAR, TOPBAR, or MOBILE_TAB.',
        );
      }

      this.validateNavigationItems(navigation, navigation.items, index, issues, new Set(), new Set(), `NAVIGATION.${navigation.code}.items`);
    }
  }

  private validateNavigationItems(
    navigation: NavigationDefinition,
    items: NavigationItemDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
    globalCodes: Set<string>,
    pathCodes: Set<string>,
    path: string,
  ): void {
    for (const [itemIndex, item] of items.entries()) {
      const itemPath = `${path}[${itemIndex}]`;

      if (globalCodes.has(item.code)) {
        this.addIssue(
          issues,
          'NAVIGATION_DUPLICATE',
          'ERROR',
          `Navigation ${navigation.code} has duplicate menu item ${item.code}.`,
          `${itemPath}.code`,
          'Use unique menu item codes.',
        );
      }

      globalCodes.add(item.code);

      if (pathCodes.has(item.code)) {
        this.addIssue(
          issues,
          'NAVIGATION_CYCLE',
          'ERROR',
          `Navigation ${navigation.code} has a circular menu tree at ${item.code}.`,
          `${itemPath}.children`,
          'Remove the repeated child reference.',
        );
      }

      const nextPathCodes = new Set(pathCodes);
      nextPathCodes.add(item.code);

      if (item.target.type === 'PAGE' && !this.hasUI(index, 'PAGE', item.target.code)) {
        this.addIssue(
          issues,
          'NAVIGATION_PAGE_NOT_FOUND',
          'ERROR',
          `Navigation item ${item.code} references missing page ${item.target.code}.`,
          `${itemPath}.target.code`,
          `Create page metadata ${item.target.code}.`,
        );
      }

      if (item.target.type === 'ACTION' && !this.actionExists(index, item.target.code)) {
        this.addIssue(
          issues,
          'NAVIGATION_ACTION_NOT_FOUND',
          'ERROR',
          `Navigation item ${item.code} references missing action ${item.target.code}.`,
          `${itemPath}.target.code`,
          `Create action metadata ${item.target.code}.`,
        );
      }

      this.validateNavigationItems(navigation, item.children ?? [], index, issues, globalCodes, nextPathCodes, `${itemPath}.children`);
    }
  }

  private validateSecurityPolicyDefinitions(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    for (const [policyCode, policies] of index.securityPolicies.entries()) {
      if (policies.length > 1) {
        this.addIssue(
          issues,
          'POLICY_DUPLICATE',
          'ERROR',
          `Duplicate security policy code ${policyCode}.`,
          `SECURITY_POLICY.${policyCode}`,
          'Keep one SECURITY_POLICY definition per code.',
        );
      }
    }

    const conflicts = new Map<string, SecurityPolicyDefinition[]>();

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'SECURITY_POLICY')) {
      const policy = metadata.definition as SecurityPolicyDefinition;

      if (!this.policyTargetExists(policy, index)) {
        this.addIssue(
          issues,
          'POLICY_TARGET_NOT_FOUND',
          'ERROR',
          `Security policy ${policy.code} references missing ${policy.target.type} ${policy.target.code}.`,
          `SECURITY_POLICY.${policy.code}.target`,
          'Create the target metadata or update the policy target.',
        );
      }

      for (const [subjectIndex, subject] of policy.subjects.entries()) {
        if (!['ROLE', 'USER', 'GROUP', 'ATTRIBUTE'].includes(subject.type) || !subject.value) {
          this.addIssue(
            issues,
            'POLICY_SUBJECT_INVALID',
            'ERROR',
            `Security policy ${policy.code} has invalid subject.`,
            `SECURITY_POLICY.${policy.code}.subjects[${subjectIndex}]`,
            'Use ROLE, USER, GROUP, or ATTRIBUTE with a non-empty value.',
          );
        }
      }

      for (const rule of Object.keys(policy.rules) as Array<keyof SecurityPolicyDefinition['rules']>) {
        const key = `${policy.target.type}:${policy.target.entityCode ?? ''}:${policy.target.code}:${rule}:${policy.subjects
          .map((subject) => `${subject.type}:${subject.value}`)
          .sort()
          .join('|')}`;
        conflicts.set(key, [...(conflicts.get(key) ?? []), policy]);
      }
    }

    for (const [key, policies] of conflicts.entries()) {
      const effects = new Set(policies.map((policy) => policy.effect));

      if (effects.has('ALLOW') && effects.has('DENY')) {
        this.addIssue(
          issues,
          'POLICY_CONFLICT',
          'ERROR',
          `Conflicting ALLOW and DENY security policies for ${key}.`,
          'SECURITY_POLICY',
          'Remove one policy or narrow the subject/target/rule.',
        );
      }
    }
  }

  private validateExperienceDefinitions(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    for (const [experienceKey, experiences] of index.experiences.entries()) {
      if (experiences.length > 1) {
        this.addIssue(
          issues,
          'EXPERIENCE_DUPLICATE',
          'ERROR',
          `Duplicate experience definition ${experienceKey}.`,
          `EXPERIENCE.${experienceKey}`,
          'Keep one EXPERIENCE definition per entity and code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'EXPERIENCE')) {
      const experience = metadata.definition as ExperienceDefinition;
      const variantPlatforms = new Map<string, number>();

      if (!index.entities.has(experience.entityCode)) {
        this.addIssue(
          issues,
          'ENTITY_NOT_FOUND',
          'ERROR',
          `Experience ${experience.code} references missing entity ${experience.entityCode}.`,
          `EXPERIENCE.${experience.code}.entityCode`,
          `Create ${experience.entityCode} entity metadata.`,
        );
      }

      this.validateExperienceConditions(experience.conditions, `EXPERIENCE.${experience.code}.conditions`, issues);

      for (const [variantIndex, variant] of experience.variants.entries()) {
        const platformCount = (variantPlatforms.get(variant.platform) ?? 0) + 1;
        variantPlatforms.set(variant.platform, platformCount);

        if (platformCount > 1) {
          this.addIssue(
            issues,
            'EXPERIENCE_VARIANT_DUPLICATE',
            'ERROR',
            `Experience ${experience.code} has duplicate ${variant.platform} variants.`,
            `EXPERIENCE.${experience.code}.variants[${variantIndex}].platform`,
            'Keep one variant per platform.',
          );
        }

        if (!['WEB', 'MOBILE', 'TABLET'].includes(variant.platform)) {
          this.addIssue(
            issues,
            'EXPERIENCE_CONDITION_INVALID',
            'ERROR',
            `Experience ${experience.code} has invalid platform ${variant.platform}.`,
            `EXPERIENCE.${experience.code}.variants[${variantIndex}].platform`,
            'Use WEB, MOBILE, or TABLET.',
          );
        }

        if (!this.hasUI(index, 'PAGE', variant.pageCode)) {
          this.addIssue(
            issues,
            'EXPERIENCE_PAGE_NOT_FOUND',
            'ERROR',
            `Experience ${experience.code} references missing page ${variant.pageCode}.`,
            `EXPERIENCE.${experience.code}.variants[${variantIndex}].pageCode`,
            `Create page metadata ${variant.pageCode}.`,
          );
        }

        if (variant.templateCode && !this.hasUI(index, 'TEMPLATE', variant.templateCode)) {
          this.addIssue(
            issues,
            'EXPERIENCE_TEMPLATE_NOT_FOUND',
            'ERROR',
            `Experience ${experience.code} references missing template ${variant.templateCode}.`,
            `EXPERIENCE.${experience.code}.variants[${variantIndex}].templateCode`,
            `Create template metadata ${variant.templateCode}.`,
          );
        }

        if (variant.navigationCode && !index.navigation.has(variant.navigationCode)) {
          this.addIssue(
            issues,
            'NAVIGATION_NOT_FOUND',
            'ERROR',
            `Experience ${experience.code} references missing navigation ${variant.navigationCode}.`,
            `EXPERIENCE.${experience.code}.variants[${variantIndex}].navigationCode`,
            `Create navigation metadata ${variant.navigationCode}.`,
          );
        }

        if (variant.themeCode && !index.themes.has(variant.themeCode)) {
          this.addIssue(
            issues,
            'THEME_NOT_FOUND',
            'ERROR',
            `Experience ${experience.code} references missing theme ${variant.themeCode}.`,
            `EXPERIENCE.${experience.code}.variants[${variantIndex}].themeCode`,
            `Create theme metadata ${variant.themeCode}.`,
          );
        }

        this.validateExperienceConditions(
          variant.conditions,
          `EXPERIENCE.${experience.code}.variants[${variantIndex}].conditions`,
          issues,
        );
      }
    }
  }

  private validateSyncPolicyDefinitions(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    for (const [syncPolicyKey, policies] of index.syncPolicies.entries()) {
      if (policies.length > 1) {
        this.addIssue(
          issues,
          'SYNC_POLICY_INVALID',
          'ERROR',
          `Duplicate sync policy definition ${syncPolicyKey}.`,
          `SYNC_POLICY.${syncPolicyKey}`,
          'Keep one SYNC_POLICY definition per entity and code.',
        );
      }
    }

    for (const metadata of metadataDefinitions.filter((candidate) => candidate.type === 'SYNC_POLICY')) {
      const policy = metadata.definition as SyncDefinition;

      if (!index.entities.has(policy.entityCode)) {
        this.addIssue(
          issues,
          'SYNC_ENTITY_NOT_FOUND',
          'ERROR',
          `Sync policy ${policy.code} references missing entity ${policy.entityCode}.`,
          `SYNC_POLICY.${policy.code}.entityCode`,
          `Create ${policy.entityCode} entity metadata.`,
        );
      }

      if (!['ONLINE_ONLY', 'CACHE_ONLY', 'OFFLINE_FIRST'].includes(policy.strategy)) {
        this.addIssue(
          issues,
          'SYNC_POLICY_INVALID',
          'ERROR',
          `Sync policy ${policy.code} has invalid strategy ${policy.strategy}.`,
          `SYNC_POLICY.${policy.code}.strategy`,
          'Use ONLINE_ONLY, CACHE_ONLY, or OFFLINE_FIRST.',
        );
      }

      if (!['DOWNLOAD', 'UPLOAD', 'BIDIRECTIONAL'].includes(policy.syncDirection)) {
        this.addIssue(
          issues,
          'SYNC_POLICY_INVALID',
          'ERROR',
          `Sync policy ${policy.code} has invalid direction ${policy.syncDirection}.`,
          `SYNC_POLICY.${policy.code}.syncDirection`,
          'Use DOWNLOAD, UPLOAD, or BIDIRECTIONAL.',
        );
      }

      if (!['SERVER_WINS', 'CLIENT_WINS', 'MANUAL_REVIEW'].includes(policy.conflictPolicy)) {
        this.addIssue(
          issues,
          'SYNC_CONFLICT_POLICY_INVALID',
          'ERROR',
          `Sync policy ${policy.code} has invalid conflict policy ${policy.conflictPolicy}.`,
          `SYNC_POLICY.${policy.code}.conflictPolicy`,
          'Use SERVER_WINS, CLIENT_WINS, or MANUAL_REVIEW.',
        );
      }

      if (policy.offlineEnabled && policy.strategy === 'ONLINE_ONLY') {
        this.addIssue(
          issues,
          'SYNC_POLICY_INVALID',
          'ERROR',
          `Sync policy ${policy.code} enables offline with ONLINE_ONLY strategy.`,
          `SYNC_POLICY.${policy.code}.strategy`,
          'Use CACHE_ONLY or OFFLINE_FIRST when offlineEnabled is true.',
        );
      }

      if (!policy.offlineEnabled && policy.strategy === 'OFFLINE_FIRST') {
        this.addIssue(
          issues,
          'SYNC_POLICY_INVALID',
          'ERROR',
          `Sync policy ${policy.code} disables offline but uses OFFLINE_FIRST strategy.`,
          `SYNC_POLICY.${policy.code}.offlineEnabled`,
          'Set offlineEnabled true or change strategy.',
        );
      }
    }
  }

  private validateDependencyIntegrity(
    metadataDefinitions: MetadataDefinition[],
    index: MetadataIndex,
    issues: ValidationIssue[],
  ): void {
    const nodes = new Set(metadataDefinitions.map((metadata) => `${metadata.type}:${metadata.code}`));
    const references = this.dependencyReferences(metadataDefinitions);

    for (const reference of references) {
      if (reference.target === 'FIELD:id' || reference.target === 'FIELD:status') {
        continue;
      }

      if (!nodes.has(reference.target)) {
        this.addIssue(
          issues,
          'DEPENDENCY_NOT_FOUND',
          'ERROR',
          `Missing dependency ${reference.target} referenced by ${reference.source}.`,
          reference.path,
          `Create ${reference.target} metadata or update the reference.`,
        );
      }
    }

    for (const metadata of metadataDefinitions) {
      const entityCode = this.definitionEntityCode(metadata.definition);

      if (entityCode && metadata.type !== 'ENTITY' && !index.entities.has(entityCode)) {
        this.addIssue(
          issues,
          'ORPHAN_METADATA',
          'ERROR',
          `${metadata.type} ${metadata.code} references missing entity ${entityCode}.`,
          `${metadata.type}.${metadata.code}.entityCode`,
          `Create ${entityCode} entity metadata or remove the orphan metadata.`,
        );
      }
    }

    const cycle = this.findDependencyCycle(references);

    if (cycle) {
      this.addIssue(
        issues,
        'DEPENDENCY_CYCLE_FOUND',
        'ERROR',
        `Dependency cycle found: ${cycle.join(' -> ')}.`,
        'metadata.dependencies',
        'Remove one of the circular references.',
      );
    }
  }

  private dependencyReferences(metadataDefinitions: MetadataDefinition[]): Array<{ source: string; target: string; path: string }> {
    return metadataDefinitions.flatMap((metadata) => {
      if (metadata.type === 'ENTITY') {
        const entity = metadata.definition as EntityDefinition;
        return [
          ...entity.fieldCodes.map((fieldCode) => this.dependency(metadata, 'FIELD', fieldCode, `ENTITY.${entity.code}.fieldCodes`)),
          ...entity.actionCodes.map((actionCode) => this.dependency(metadata, 'ACTION', actionCode, `ENTITY.${entity.code}.actionCodes`)),
          ...(entity.workflowCode ? [this.dependency(metadata, 'WORKFLOW', entity.workflowCode, `ENTITY.${entity.code}.workflowCode`)] : []),
        ];
      }

      if (metadata.type === 'FORM') {
        const form = metadata.definition as FormDefinition;
        return form.layout.sections.flatMap((section) =>
          section.fields.flatMap((field, fieldIndex) => [
            this.dependency(metadata, 'FIELD', field.fieldCode, `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}]`),
            this.dependency(metadata, 'UI', field.component, `FORM.${form.code}.sections.${section.code}.fields[${fieldIndex}].component`),
            ...(field.lookup
              ? [
                  this.dependency(metadata, 'RELATION', field.lookup.relationCode, `FORM.${form.code}.lookup.relationCode`),
                  this.dependency(metadata, 'VIEW', field.lookup.viewCode, `FORM.${form.code}.lookup.viewCode`),
                ]
              : []),
          ]),
        );
      }

      if (metadata.type === 'VIEW') {
        const view = metadata.definition as ViewDefinition;
        return [
          this.dependency(metadata, 'ENTITY', view.entityCode, `VIEW.${view.code}.entityCode`),
          ...view.columns.flatMap((column, columnIndex) => [
            this.dependency(metadata, 'FIELD', column.field, `VIEW.${view.code}.columns[${columnIndex}].field`),
            ...(column.relation
              ? [this.dependency(metadata, 'RELATION', column.relation, `VIEW.${view.code}.columns[${columnIndex}].relation`)]
              : []),
          ]),
          ...view.filters.map((filter, filterIndex) =>
            this.dependency(metadata, 'FIELD', filter.field, `VIEW.${view.code}.filters[${filterIndex}].field`),
          ),
          ...(view.sorting ? [this.dependency(metadata, 'FIELD', view.sorting.field, `VIEW.${view.code}.sorting.field`)] : []),
        ];
      }

      if (metadata.type === 'RELATION') {
        const relation = metadata.definition as RelationDefinition;
        return [
          this.dependency(metadata, 'ENTITY', relation.source.entityCode, `RELATION.${relation.code}.source.entityCode`),
          this.dependency(metadata, 'ENTITY', relation.target.entityCode, `RELATION.${relation.code}.target.entityCode`),
          this.dependency(metadata, 'FIELD', relation.mapping.sourceField, `RELATION.${relation.code}.mapping.sourceField`),
          this.dependency(metadata, 'FIELD', relation.mapping.targetField, `RELATION.${relation.code}.mapping.targetField`),
        ];
      }

      if (metadata.type === 'UI') {
        const ui = metadata.definition as UIDefinition;

        if (ui.kind === 'MOLECULE') {
          return ui.atoms.map((atom, atomIndex) => this.dependency(metadata, 'UI', atom.atom, `UI.${ui.code}.atoms[${atomIndex}]`));
        }

        if (ui.kind === 'ORGANISM') {
          return ui.molecules.map((molecule, moleculeIndex) =>
            this.dependency(metadata, 'UI', molecule.molecule, `UI.${ui.code}.molecules[${moleculeIndex}]`),
          );
        }

        if (ui.kind === 'PAGE') {
          return [
            this.dependency(metadata, 'UI', ui.template, `UI.${ui.code}.template`),
            ...(ui.themeCode ? [this.dependency(metadata, 'THEME', ui.themeCode, `UI.${ui.code}.themeCode`)] : []),
            ...(ui.viewCode ? [this.dependency(metadata, 'VIEW', ui.viewCode, `UI.${ui.code}.viewCode`)] : []),
            ...(ui.actions ?? []).map((actionCode) => this.dependency(metadata, 'ACTION', actionCode, `UI.${ui.code}.actions`)),
            ...(ui.relations ?? []).map((relationCode) =>
              this.dependency(metadata, 'RELATION', relationCode, `UI.${ui.code}.relations`),
            ),
            ...Object.values(ui.regions).flatMap((organisms) =>
              organisms.map((organismCode) => this.dependency(metadata, 'UI', organismCode, `UI.${ui.code}.regions`)),
            ),
          ];
        }
      }

      if (metadata.type === 'THEME') {
        const theme = metadata.definition as ThemeDefinition;
        return theme.extends ? [this.dependency(metadata, 'THEME', theme.extends, `THEME.${theme.code}.extends`)] : [];
      }

      if (metadata.type === 'NAVIGATION') {
        const navigation = metadata.definition as NavigationDefinition;
        return navigation.items.flatMap((item, itemIndex) =>
          this.navigationDependencyReferences(metadata, item, `NAVIGATION.${navigation.code}.items[${itemIndex}]`),
        );
      }

      if (metadata.type === 'SECURITY_POLICY') {
        const policy = metadata.definition as SecurityPolicyDefinition;
        return [
          this.dependency(metadata, policy.target.type, policy.target.code, `SECURITY_POLICY.${policy.code}.target.code`),
          ...(policy.target.entityCode
            ? [this.dependency(metadata, 'ENTITY', policy.target.entityCode, `SECURITY_POLICY.${policy.code}.target.entityCode`)]
            : []),
        ];
      }

      if (metadata.type === 'EXPERIENCE') {
        const experience = metadata.definition as ExperienceDefinition;
        return [
          this.dependency(metadata, 'ENTITY', experience.entityCode, `EXPERIENCE.${experience.code}.entityCode`),
          ...experience.variants.flatMap((variant, variantIndex) => [
            this.dependency(metadata, 'UI', variant.pageCode, `EXPERIENCE.${experience.code}.variants[${variantIndex}].pageCode`),
            ...(variant.templateCode
              ? [this.dependency(metadata, 'UI', variant.templateCode, `EXPERIENCE.${experience.code}.variants[${variantIndex}].templateCode`)]
              : []),
            ...(variant.navigationCode
              ? [
                  this.dependency(
                    metadata,
                    'NAVIGATION',
                    variant.navigationCode,
                    `EXPERIENCE.${experience.code}.variants[${variantIndex}].navigationCode`,
                  ),
                ]
              : []),
            ...(variant.themeCode
              ? [this.dependency(metadata, 'THEME', variant.themeCode, `EXPERIENCE.${experience.code}.variants[${variantIndex}].themeCode`)]
              : []),
          ]),
        ];
      }

      if (metadata.type === 'SYNC_POLICY') {
        const policy = metadata.definition as SyncDefinition;
        return [this.dependency(metadata, 'ENTITY', policy.entityCode, `SYNC_POLICY.${policy.code}.entityCode`)];
      }

      return [];
    });
  }

  private navigationDependencyReferences(
    metadata: MetadataDefinition,
    item: NavigationItemDefinition,
    path: string,
  ): Array<{ source: string; target: string; path: string }> {
    const target =
      item.target.type === 'PAGE'
        ? [this.dependency(metadata, 'UI', item.target.code, `${path}.target.code`)]
        : item.target.type === 'ACTION'
          ? [this.dependency(metadata, 'ACTION', item.target.code, `${path}.target.code`)]
          : [];

    return [
      ...target,
      ...(item.children ?? []).flatMap((child, childIndex) =>
        this.navigationDependencyReferences(metadata, child, `${path}.children[${childIndex}]`),
      ),
    ];
  }

  private dependency(
    metadata: MetadataDefinition,
    targetType: string,
    targetCode: string,
    path: string,
  ): { source: string; target: string; path: string } {
    return {
      source: `${metadata.type}:${metadata.code}`,
      target: `${targetType}:${targetCode}`,
      path,
    };
  }

  private findDependencyCycle(references: Array<{ source: string; target: string }>): string[] | undefined {
    const graph = references.reduce<Map<string, string[]>>((edges, reference) => {
      edges.set(reference.source, [...(edges.get(reference.source) ?? []), reference.target]);
      return edges;
    }, new Map());
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (node: string, path: string[]): string[] | undefined => {
      if (visiting.has(node)) {
        return [...path, node];
      }

      if (visited.has(node)) {
        return undefined;
      }

      visiting.add(node);

      for (const next of graph.get(node) ?? []) {
        const cycle = visit(next, [...path, node]);

        if (cycle) {
          return cycle;
        }
      }

      visiting.delete(node);
      visited.add(node);
      return undefined;
    };

    for (const node of graph.keys()) {
      const cycle = visit(node, []);

      if (cycle) {
        return cycle;
      }
    }

    return undefined;
  }

  private workflowHasState(index: MetadataIndex, entityCode: string, stateCode: string): boolean {
    return Boolean(index.workflowsByEntity.get(entityCode)?.definition.states.some((state) => state.code === stateCode));
  }

  private definitionEntityCode(definition: unknown): string | undefined {
    return definition && typeof definition === 'object' && 'entityCode' in definition
      ? (definition as { entityCode?: string }).entityCode
      : undefined;
  }

  private hasUI(index: MetadataIndex, kind: UIDefinition['kind'], code: string): boolean {
    return Boolean(this.getUI(index, kind, code));
  }

  private getUI<TDefinition extends UIDefinition>(
    index: MetadataIndex,
    kind: UIDefinition['kind'],
    code: string,
  ): TDefinition | undefined {
    return index.ui.get(this.uiKey(kind, code))?.[0]?.definition as TDefinition | undefined;
  }

  private uiKey(kind: UIDefinition['kind'], code: string): string {
    return `${kind}:${code}`;
  }

  private formKey(entityCode: string, code: string): string {
    return `${entityCode}:${code}`;
  }

  private experienceKey(entityCode: string, code: string): string {
    return `${entityCode}:${code}`;
  }

  private syncPolicyKey(entityCode: string, code: string): string {
    return `${entityCode}:${code}`;
  }

  private fieldExists(fields: Map<string, MetadataDefinition<FieldDefinition>> | undefined, fieldCode: string): boolean {
    return fieldCode === 'id' || fieldCode === 'status' || Boolean(fields?.has(fieldCode));
  }

  private actionExists(index: MetadataIndex, actionCode: string): boolean {
    return [...index.actionsByEntity.values()].some((actions) => actions.has(actionCode));
  }

  private policyTargetExists(policy: SecurityPolicyDefinition, index: MetadataIndex): boolean {
    if (policy.target.type === 'APPLICATION') {
      return index.applications.has(policy.target.code);
    }

    if (policy.target.type === 'ENTITY') {
      return index.entities.has(policy.target.code);
    }

    if (policy.target.type === 'FIELD') {
      return policy.target.entityCode
        ? this.fieldExists(index.fieldsByEntity.get(policy.target.entityCode), policy.target.code)
        : [...index.fieldsByEntity.values()].some((fields) => this.fieldExists(fields, policy.target.code));
    }

    if (policy.target.type === 'ACTION') {
      return policy.target.entityCode
        ? Boolean(index.actionsByEntity.get(policy.target.entityCode)?.has(policy.target.code))
        : this.actionExists(index, policy.target.code);
    }

    if (policy.target.type === 'VIEW') {
      return index.views.has(policy.target.code);
    }

    if (policy.target.type === 'FORM') {
      return [...index.forms.values()].some((forms) => forms.some((form) => form.definition.code === policy.target.code));
    }

    if (policy.target.type === 'UI') {
      return ['ATOM', 'MOLECULE', 'ORGANISM', 'TEMPLATE', 'PAGE'].some((kind) =>
        this.hasUI(index, kind as UIDefinition['kind'], policy.target.code),
      );
    }

    return false;
  }

  private validateExperienceConditions(
    conditions: ExperienceConditions | undefined,
    path: string,
    issues: ValidationIssue[],
  ): void {
    if (!conditions) {
      return;
    }

    if (conditions.platform && !['WEB', 'MOBILE', 'TABLET'].includes(conditions.platform)) {
      this.addIssue(
        issues,
        'EXPERIENCE_CONDITION_INVALID',
        'ERROR',
        `Experience condition has invalid platform ${conditions.platform}.`,
        `${path}.platform`,
        'Use WEB, MOBILE, or TABLET.',
      );
    }

    if (conditions.role && conditions.role.trim().length === 0) {
      this.addIssue(
        issues,
        'EXPERIENCE_CONDITION_INVALID',
        'ERROR',
        'Experience condition role must be non-empty.',
        `${path}.role`,
        'Set a role value or remove the condition.',
      );
    }

    if (conditions.roles?.some((role) => role.trim().length === 0)) {
      this.addIssue(
        issues,
        'EXPERIENCE_CONDITION_INVALID',
        'ERROR',
        'Experience condition roles must be non-empty.',
        `${path}.roles`,
        'Remove empty role values.',
      );
    }

    if (conditions.attribute && !conditions.attribute.key) {
      this.addIssue(
        issues,
        'EXPERIENCE_CONDITION_INVALID',
        'ERROR',
        'Experience condition attribute must define a key.',
        `${path}.attribute.key`,
        'Set attribute.key or remove the attribute condition.',
      );
    }
  }

  private configString(config: Record<string, unknown> | undefined, key: string): string | undefined {
    const value = config?.[key];
    return typeof value === 'string' ? value : undefined;
  }

  private addIssue(
    issues: ValidationIssue[],
    code: string,
    severity: ValidationIssue['severity'],
    message: string,
    path: string,
    suggestion?: string,
  ): void {
    issues.push({
      code,
      severity,
      message,
      path,
      suggestion,
    });
  }
}
