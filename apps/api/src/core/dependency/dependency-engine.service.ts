import { Inject, Injectable } from '@nestjs/common';
import type {
  ActionDefinition,
  ApplicationDefinition,
  BusinessDefinition,
  DependencyGraph,
  DependencyImpact,
  DependencyNode,
  DependencyNodeType,
  DependencyReference,
  DependencyRelationship,
  EntityDefinition,
  EventDefinition,
  ExperienceDefinition,
  FieldDefinition,
  FormDefinition,
  LedgerDefinition,
  MetadataDefinition,
  NavigationDefinition,
  ProcessDefinition,
  RelationDefinition,
  RuntimeContext,
  SecurityPolicyDefinition,
  SyncDefinition,
  ThemeDefinition,
  UIDefinition,
  ViewDefinition,
  WorkflowDefinition,
} from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';

@Injectable()
export class DependencyEngine {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async buildGraph(context: RuntimeContext): Promise<DependencyGraph> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });
    return this.buildGraphFromMetadata(metadata);
  }

  async analyzeImpact(context: RuntimeContext, target: DependencyNode): Promise<{
    target: DependencyNode;
    dependencies: DependencyReference[];
    safe: boolean;
    impacts: DependencyImpact[];
  }> {
    const graph = await this.buildGraph(context);
    const dependencies = graph.references.filter((reference) => this.sameNode(reference.source, target));
    const impacts = graph.references
      .filter((reference) => this.sameNode(reference.dependsOn, target))
      .map((reference) => this.toImpact(reference));

    return {
      target,
      dependencies,
      safe: impacts.every((impact) => impact.impact !== 'BREAKING'),
      impacts,
    };
  }

  analyzeImpactFromMetadata(metadata: MetadataDefinition[], target: DependencyNode): {
    target: DependencyNode;
    dependencies: DependencyReference[];
    safe: boolean;
    impacts: DependencyImpact[];
  } {
    const graph = this.buildGraphFromMetadata(metadata);
    const dependencies = graph.references.filter((reference) => this.sameNode(reference.source, target));
    const impacts = graph.references
      .filter((reference) => this.sameNode(reference.dependsOn, target))
      .map((reference) => this.toImpact(reference));

    return {
      target,
      dependencies,
      safe: impacts.every((impact) => impact.impact !== 'BREAKING'),
      impacts,
    };
  }

  buildGraphFromMetadata(metadata: MetadataDefinition[]): DependencyGraph {
    const nodes = new Map<string, DependencyNode>();
    const references: DependencyReference[] = [];

    for (const record of metadata) {
      const source = this.node(record.type as DependencyNodeType, record.code);
      nodes.set(this.key(source), source);

      for (const reference of this.referencesFor(record, source)) {
        nodes.set(this.key(reference.source), reference.source);
        nodes.set(this.key(reference.dependsOn), reference.dependsOn);
        references.push(reference);
      }
    }

    return {
      nodes: [...nodes.values()].sort((left, right) => this.key(left).localeCompare(this.key(right))),
      references,
    };
  }

  private referencesFor(record: MetadataDefinition, source: DependencyNode): DependencyReference[] {
    if (record.type === 'APPLICATION') {
      return this.applicationReferences(record.definition as ApplicationDefinition, source);
    }

    if (record.type === 'ENTITY') {
      return this.entityReferences(record.definition as EntityDefinition, source);
    }

    if (record.type === 'WORKFLOW') {
      return this.workflowReferences(record.definition as WorkflowDefinition, source);
    }

    if (record.type === 'PROCESS') {
      return this.processReferences(record.definition as ProcessDefinition, source);
    }

    if (record.type === 'BUSINESS') {
      return this.businessReferences(record.definition as BusinessDefinition, source);
    }

    if (record.type === 'EVENT') {
      return this.eventReferences(record.definition as EventDefinition, source);
    }

    if (record.type === 'LEDGER') {
      return this.ledgerReferences(record.definition as LedgerDefinition, source);
    }

    if (record.type === 'RELATION') {
      return this.relationReferences(record.definition as RelationDefinition, source);
    }

    if (record.type === 'VIEW') {
      return this.viewReferences(record.definition as ViewDefinition, source);
    }

    if (record.type === 'FORM') {
      return this.formReferences(record.definition as FormDefinition, source);
    }

    if (record.type === 'UI') {
      return this.uiReferences(record.definition as UIDefinition, source);
    }

    if (record.type === 'THEME') {
      return this.themeReferences(record.definition as ThemeDefinition, source);
    }

    if (record.type === 'NAVIGATION') {
      return this.navigationReferences(record.definition as NavigationDefinition, source);
    }

    if (record.type === 'SECURITY_POLICY') {
      return this.securityPolicyReferences(record.definition as SecurityPolicyDefinition, source);
    }

    if (record.type === 'EXPERIENCE') {
      return this.experienceReferences(record.definition as ExperienceDefinition, source);
    }

    if (record.type === 'SYNC_POLICY') {
      return this.syncPolicyReferences(record.definition as SyncDefinition, source);
    }

    if (record.type === 'FIELD') {
      return this.fieldReferences(record.definition as FieldDefinition, source);
    }

    if (record.type === 'ACTION') {
      return this.actionReferences(record.definition as ActionDefinition, source);
    }

    return [];
  }

  private applicationReferences(definition: ApplicationDefinition, source: DependencyNode): DependencyReference[] {
    return (definition.entityCodes ?? []).map((entityCode) => this.reference(source, 'USES', 'ENTITY', entityCode));
  }

  private entityReferences(definition: EntityDefinition, source: DependencyNode): DependencyReference[] {
    return [
      ...definition.fieldCodes.map((fieldCode) => this.reference(source, 'USES', 'FIELD', fieldCode)),
      ...definition.actionCodes.map((actionCode) => this.reference(source, 'USES', 'ACTION', actionCode)),
      ...(definition.workflowCode ? [this.reference(source, 'USES', 'WORKFLOW', definition.workflowCode)] : []),
    ];
  }

  private fieldReferences(definition: FieldDefinition, source: DependencyNode): DependencyReference[] {
    return definition.relation ? [this.reference(source, 'REFERENCES', 'RELATION', definition.relation)] : [];
  }

  private actionReferences(definition: ActionDefinition, source: DependencyNode): DependencyReference[] {
    return [this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode)];
  }

  private workflowReferences(definition: WorkflowDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      ...definition.transitions.map((transition) => this.reference(source, 'TRIGGERS', 'ACTION', transition.actionCode)),
    ];
  }

  private processReferences(definition: ProcessDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      this.reference(source, 'TRIGGERS', 'ACTION', definition.trigger.actionCode),
      ...(definition.trigger.workflowState ? [this.reference(source, 'REFERENCES', 'WORKFLOW', definition.entityCode)] : []),
    ];
  }

  private businessReferences(definition: BusinessDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      this.reference(source, 'TRIGGERS', 'PROCESS', definition.trigger.processCode),
      ...definition.rules
        .map((rule) => this.configString(rule.config, 'field'))
        .filter((fieldCode): fieldCode is string => Boolean(fieldCode))
        .map((fieldCode) => this.reference(source, 'REFERENCES', 'FIELD', fieldCode)),
    ];
  }

  private eventReferences(definition: EventDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      ...(definition.trigger.actionCode ? [this.reference(source, 'TRIGGERS', 'ACTION', definition.trigger.actionCode)] : []),
      ...(definition.trigger.processCode ? [this.reference(source, 'TRIGGERS', 'PROCESS', definition.trigger.processCode)] : []),
    ];
  }

  private ledgerReferences(definition: LedgerDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      this.reference(source, 'TRIGGERS', 'ACTION', definition.trigger.actionCode),
      ...definition.impacts.flatMap((impact) => [
        this.reference(source, 'REFERENCES', 'ENTITY', impact.target.entityCode),
        ...Object.keys(impact.mapping ?? {}).map((fieldCode) => this.reference(source, 'BINDS', 'FIELD', fieldCode)),
        ...Object.values(impact.mapping ?? {})
          .filter((sourcePath) => sourcePath.startsWith('relation.'))
          .map((sourcePath) => this.reference(source, 'REFERENCES', 'RELATION', sourcePath.split('.')[1])),
      ]),
    ];
  }

  private relationReferences(definition: RelationDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.source.entityCode),
      this.reference(source, 'REFERENCES', 'ENTITY', definition.target.entityCode),
      this.reference(source, 'BINDS', 'FIELD', definition.mapping.sourceField),
      this.reference(source, 'BINDS', 'FIELD', definition.mapping.targetField),
    ];
  }

  private viewReferences(definition: ViewDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      ...definition.columns.map((column) => this.reference(source, 'BINDS', 'FIELD', column.field)),
      ...definition.columns
        .filter((column) => Boolean(column.relation))
        .map((column) => this.reference(source, 'REFERENCES', 'RELATION', column.relation!)),
      ...definition.filters.map((filter) => this.reference(source, 'BINDS', 'FIELD', filter.field)),
      ...(definition.sorting ? [this.reference(source, 'BINDS', 'FIELD', definition.sorting.field)] : []),
    ];
  }

  private formReferences(definition: FormDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      ...definition.layout.sections.flatMap((section) =>
        section.fields.flatMap((field) => [
          this.reference(source, 'BINDS', 'FIELD', field.fieldCode),
          this.reference(source, 'RENDERS', 'UI', field.component),
          ...(field.lookup
            ? [
                this.reference(source, 'REFERENCES', 'RELATION', field.lookup.relationCode),
                this.reference(source, 'REFERENCES', 'VIEW', field.lookup.viewCode),
              ]
            : []),
        ]),
      ),
    ];
  }

  private uiReferences(definition: UIDefinition, source: DependencyNode): DependencyReference[] {
    if (definition.kind === 'MOLECULE') {
      return definition.atoms.map((atom) => this.reference(source, 'RENDERS', 'UI', atom.atom));
    }

    if (definition.kind === 'ORGANISM') {
      return definition.molecules.map((molecule) => this.reference(source, 'RENDERS', 'UI', molecule.molecule));
    }

    if (definition.kind === 'PAGE') {
      return [
        this.reference(source, 'RENDERS', 'UI', definition.template),
        ...(definition.themeCode ? [this.reference(source, 'RENDERS', 'THEME', definition.themeCode)] : []),
        ...(definition.entityCode ? [this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode)] : []),
        ...(definition.viewCode ? [this.reference(source, 'REFERENCES', 'VIEW', definition.viewCode)] : []),
        ...(definition.actions ?? []).map((actionCode) => this.reference(source, 'TRIGGERS', 'ACTION', actionCode)),
        ...(definition.relations ?? []).map((relationCode) => this.reference(source, 'REFERENCES', 'RELATION', relationCode)),
        ...Object.values(definition.regions).flatMap((organisms) =>
          organisms.map((organismCode) => this.reference(source, 'RENDERS', 'UI', organismCode)),
        ),
      ];
    }

    return [];
  }

  private themeReferences(definition: ThemeDefinition, source: DependencyNode): DependencyReference[] {
    return definition.extends ? [this.reference(source, 'REFERENCES', 'THEME', definition.extends)] : [];
  }

  private navigationReferences(definition: NavigationDefinition, source: DependencyNode): DependencyReference[] {
    return definition.items.flatMap((item) => this.navigationItemReferences(item, source));
  }

  private navigationItemReferences(
    item: NavigationDefinition['items'][number],
    source: DependencyNode,
  ): DependencyReference[] {
    const target =
      item.target.type === 'PAGE'
        ? [this.reference(source, 'RENDERS', 'UI', item.target.code)]
        : item.target.type === 'ACTION'
          ? [this.reference(source, 'TRIGGERS', 'ACTION', item.target.code)]
          : [];

    return [...target, ...(item.children ?? []).flatMap((child) => this.navigationItemReferences(child, source))];
  }

  private securityPolicyReferences(definition: SecurityPolicyDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', definition.target.type, definition.target.code),
      ...(definition.target.entityCode ? [this.reference(source, 'REFERENCES', 'ENTITY', definition.target.entityCode)] : []),
    ];
  }

  private experienceReferences(definition: ExperienceDefinition, source: DependencyNode): DependencyReference[] {
    return [
      this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode),
      ...definition.variants.flatMap((variant) => [
        this.reference(source, 'RENDERS', 'UI', variant.pageCode),
        ...(variant.templateCode ? [this.reference(source, 'RENDERS', 'UI', variant.templateCode)] : []),
        ...(variant.navigationCode ? [this.reference(source, 'REFERENCES', 'NAVIGATION', variant.navigationCode)] : []),
        ...(variant.themeCode ? [this.reference(source, 'REFERENCES', 'THEME', variant.themeCode)] : []),
      ]),
    ];
  }

  private syncPolicyReferences(definition: SyncDefinition, source: DependencyNode): DependencyReference[] {
    return [this.reference(source, 'REFERENCES', 'ENTITY', definition.entityCode)];
  }

  private toImpact(reference: DependencyReference): DependencyImpact {
    return {
      type: reference.source.type,
      code: reference.source.code,
      impact: this.impactLevel(reference),
      reason: `${this.label(reference.source)} ${reference.relationship.toLowerCase()} ${this.label(reference.dependsOn)}`,
    };
  }

  private impactLevel(reference: DependencyReference): DependencyImpact['impact'] {
    if (reference.relationship === 'BINDS' || reference.relationship === 'REFERENCES') {
      return 'BREAKING';
    }

    if (reference.relationship === 'TRIGGERS') {
      return 'WARNING';
    }

    return 'INFO';
  }

  private reference(
    source: DependencyNode,
    relationship: DependencyRelationship,
    type: DependencyNodeType,
    code: string,
  ): DependencyReference {
    return {
      source,
      relationship,
      dependsOn: this.node(type, code),
    };
  }

  private node(type: DependencyNodeType, code: string): DependencyNode {
    return {
      type,
      code,
    };
  }

  private sameNode(left: DependencyNode, right: DependencyNode): boolean {
    return left.type === right.type && left.code === right.code;
  }

  private key(node: DependencyNode): string {
    return `${node.type}:${node.code}`;
  }

  private label(node: DependencyNode): string {
    return `${node.type} ${node.code}`;
  }

  private configString(config: Record<string, unknown> | undefined, key: string): string | undefined {
    const value = config?.[key];
    return typeof value === 'string' ? value : undefined;
  }
}
