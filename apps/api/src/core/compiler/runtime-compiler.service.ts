import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import type {
  ConnectorDefinition,
  EntityDefinition,
  EventDefinition,
  FieldDefinition,
  FormDefinition,
  IntegrationDefinition,
  MetadataDefinition,
  MetadataType,
  RuntimeContext,
  RuntimePackageContent,
  RuntimePackageDefinition,
  SecurityPolicyDefinition,
  WorkflowDefinition,
} from '@redios/shared';
import { DependencyEngine } from '../dependency/dependency-engine.service';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';
import { MetadataRegistry } from '../metadata/metadata-registry.service';
import { MetadataValidatorEngine } from '../metadata/metadata-validator-engine.service';
import { NoopRuntimeProjectionProvider } from './runtime-projection-provider.interface';

@Injectable()
export class RuntimeCompiler {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly metadataRegistry: MetadataRegistry,
    private readonly metadataValidatorEngine: MetadataValidatorEngine,
    private readonly dependencyEngine: DependencyEngine,
    private readonly projectionProvider: NoopRuntimeProjectionProvider,
  ) {}

  async compile(context: RuntimeContext): Promise<MetadataDefinition<RuntimePackageDefinition>> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });
    const sourceMetadata = metadata.filter((record) => record.type !== 'RUNTIME_PACKAGE');
    const validation = this.metadataValidatorEngine.validate(sourceMetadata);

    if (!validation.valid) {
      throw new UnprocessableEntityException(validation);
    }

    this.dependencyEngine.buildGraphFromMetadata(sourceMetadata);
    const content = this.buildContent(sourceMetadata);
    const metadataVersion = this.metadataVersion(sourceMetadata);
    const checksum = this.checksum({
      metadataVersion,
      content,
    });
    const definition: RuntimePackageDefinition = {
      code: this.packageCode(context.applicationCode, metadataVersion),
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      metadataVersion,
      compiledAt: new Date(),
      checksum,
      status: 'ACTIVE',
      content,
    };

    await this.expireActivePackages(context);
    const saved = (await this.metadataProvider.saveMetadata(context, {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      type: 'RUNTIME_PACKAGE',
      code: definition.code,
      name: `Runtime Package ${metadataVersion}`,
      version: metadataVersion,
      enabled: true,
      definition,
    })) as MetadataDefinition<RuntimePackageDefinition>;
    await this.projectionProvider.project(saved.definition);
    await this.metadataRegistry.invalidate(context);
    return saved;
  }

  private buildContent(metadata: MetadataDefinition[]): RuntimePackageContent {
    const content: RuntimePackageContent = {
      entities: {},
      actions: {},
      fields: {},
      workflows: {},
      processes: {},
      businessRules: {},
      events: {},
      ledgers: {},
      relations: {},
      views: {},
      forms: {},
      ui: {},
      securityPolicies: {},
      themes: {},
      navigation: {},
      integrations: {},
      connectors: {},
      eventIntegrationMap: {},
      rolePolicyMap: {},
      fieldPolicyMap: {},
    };

    for (const record of metadata) {
      this.addRecord(content, record);
    }

    return content;
  }

  private addRecord(content: RuntimePackageContent, record: MetadataDefinition): void {
    if (record.type === 'ENTITY') {
      content.entities[record.code] = record;
      return;
    }

    if (record.type === 'ACTION') {
      const entityCode = (record.definition as { entityCode?: string }).entityCode ?? 'GLOBAL';
      content.actions[this.scopedKey(entityCode, record.code)] = record;
      return;
    }

    if (record.type === 'FIELD') {
      const field = record.definition as FieldDefinition;
      content.fields[this.scopedKey(field.entityCode, field.code)] = record;
      return;
    }

    if (record.type === 'WORKFLOW') {
      const workflow = record.definition as WorkflowDefinition;
      content.workflows[workflow.entityCode] = this.compileWorkflow(workflow);
      return;
    }

    if (record.type === 'PROCESS') {
      const entityCode = (record.definition as { entityCode?: string }).entityCode ?? 'GLOBAL';
      content.processes[this.scopedKey(entityCode, record.code)] = record;
      return;
    }

    if (record.type === 'BUSINESS') {
      const entityCode = (record.definition as { entityCode?: string }).entityCode ?? 'GLOBAL';
      content.businessRules[this.scopedKey(entityCode, record.code)] = record;
      return;
    }

    if (record.type === 'EVENT') {
      const event = record.definition as EventDefinition;
      content.events[this.scopedKey(event.entityCode, event.code)] = record;
      return;
    }

    if (record.type === 'LEDGER') {
      content.ledgers[record.code] = record;
      return;
    }

    if (record.type === 'RELATION') {
      content.relations[record.code] = record;
      return;
    }

    if (record.type === 'VIEW') {
      const entityCode = (record.definition as { entityCode?: string }).entityCode ?? 'GLOBAL';
      content.views[this.scopedKey(entityCode, record.code)] = record;
      return;
    }

    if (record.type === 'FORM') {
      const form = record.definition as FormDefinition;
      content.forms[this.scopedKey(form.entityCode, form.code)] = record;
      return;
    }

    if (record.type === 'UI') {
      const kind = (record.definition as { kind?: string }).kind ?? 'UNKNOWN';
      content.ui[this.scopedKey(kind, record.code)] = record;
      return;
    }

    if (record.type === 'SECURITY_POLICY') {
      this.addSecurityPolicy(content, record as MetadataDefinition<SecurityPolicyDefinition>);
      return;
    }

    if (record.type === 'THEME') {
      content.themes[record.code] = record;
      return;
    }

    if (record.type === 'NAVIGATION') {
      content.navigation[record.code] = record;
      return;
    }

    if (record.type === 'INTEGRATION') {
      const integration = record.definition as IntegrationDefinition;
      content.integrations[record.code] = record;

      if (integration.trigger.type === 'EVENT' && integration.trigger.sourceCode) {
        const current = content.eventIntegrationMap[integration.trigger.sourceCode] ?? [];
        content.eventIntegrationMap[integration.trigger.sourceCode] = [...current, integration.code];
      }
      return;
    }

    if (record.type === 'CONNECTOR') {
      const connector = record.definition as ConnectorDefinition;
      content.connectors[connector.code] = record;
    }
  }

  private compileWorkflow(workflow: WorkflowDefinition): RuntimePackageContent['workflows'][string] {
    return {
      code: workflow.code,
      statesByCode: workflow.states.reduce<Record<string, unknown>>((states, state) => {
        states[state.code] = state;
        return states;
      }, {}),
      transitionMap: workflow.transitions.reduce<RuntimePackageContent['workflows'][string]['transitionMap']>(
        (transitions, transition) => {
          transitions[`${transition.from}.${transition.actionCode}`] = {
            next: transition.to,
            transitionCode: transition.code,
            actionCode: transition.actionCode,
          };
          return transitions;
        },
        {},
      ),
      source: workflow,
    };
  }

  private addSecurityPolicy(content: RuntimePackageContent, record: MetadataDefinition<SecurityPolicyDefinition>): void {
    const policy = record.definition;
    content.securityPolicies[record.code] = record;

    for (const subject of policy.subjects) {
      if (subject.type === 'ROLE') {
        const policies = content.rolePolicyMap[subject.value] ?? [];
        content.rolePolicyMap[subject.value] = [...policies, policy.code];
      }
    }

    if (policy.target.type === 'FIELD' && policy.target.code) {
      const key = this.scopedKey(policy.target.entityCode ?? 'GLOBAL', policy.target.code);
      const policies = content.fieldPolicyMap[key] ?? [];
      content.fieldPolicyMap[key] = [...policies, policy.code];
    }
  }

  private async expireActivePackages(context: RuntimeContext): Promise<void> {
    const packages = await this.metadataProvider.findMetadata(context, {
      type: 'RUNTIME_PACKAGE',
      enabledOnly: true,
    });

    for (const runtimePackage of packages as MetadataDefinition<RuntimePackageDefinition>[]) {
      if (runtimePackage.definition.status === 'ACTIVE') {
        await this.metadataProvider.saveMetadata(context, {
          ...runtimePackage,
          definition: {
            ...runtimePackage.definition,
            status: 'EXPIRED',
          },
        });
      }
    }
  }

  private metadataVersion(metadata: MetadataDefinition[]): number {
    return Math.max(1, ...metadata.map((record) => record.version));
  }

  private packageCode(applicationCode: string, version: number): string {
    return `${applicationCode}_RUNTIME_PACKAGE_V${version}`;
  }

  private scopedKey(scope: string, code: string): string {
    return `${scope}:${code}`;
  }

  private checksum(value: unknown): string {
    const json = JSON.stringify(value, this.stableSort);
    let hash = 0;

    for (let index = 0; index < json.length; index += 1) {
      hash = (hash * 31 + json.charCodeAt(index)) >>> 0;
    }

    return hash.toString(16).padStart(8, '0');
  }

  private stableSort(_key: string, value: unknown): unknown {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = (value as Record<string, unknown>)[key];
        return sorted;
      }, {});
  }
}
