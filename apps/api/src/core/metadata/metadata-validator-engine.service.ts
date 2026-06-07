import { Injectable } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  BusinessDefinition,
  EntityDefinition,
  EventDefinition,
  FieldDefinition,
  LedgerDefinition,
  MetadataDefinition,
  ProcessDefinition,
  RelationDefinition,
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

  private workflowHasState(index: MetadataIndex, entityCode: string, stateCode: string): boolean {
    return Boolean(index.workflowsByEntity.get(entityCode)?.definition.states.some((state) => state.code === stateCode));
  }

  private fieldExists(fields: Map<string, MetadataDefinition<FieldDefinition>> | undefined, fieldCode: string): boolean {
    return fieldCode === 'id' || fieldCode === 'status' || Boolean(fields?.has(fieldCode));
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
