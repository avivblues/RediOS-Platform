import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type {
  MetadataDefinition,
  RuntimeContext,
  RuntimeDocument,
  SecurityPolicyDefinition,
  SecurityPolicyRulesDefinition,
  SecurityPolicyTargetDefinition,
} from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';

export interface SecurityPolicyEvaluation {
  allowed: boolean;
  visible: boolean;
  editable: boolean;
  reason: string;
  policies: string[];
}

export interface SecurityPolicyFieldAccess extends SecurityPolicyEvaluation {
  entityCode: string;
  fieldCode: string;
}

@Injectable()
export class SecurityPolicyEngine {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async evaluate(context: RuntimeContext, target: SecurityPolicyTargetDefinition): Promise<SecurityPolicyEvaluation> {
    const policies = await this.resolveMatchingPolicies(context, target);
    return this.toEvaluation(policies, target);
  }

  async evaluateFieldAccess(
    context: RuntimeContext,
    entityCode: string,
    fieldCode: string,
  ): Promise<SecurityPolicyFieldAccess> {
    const evaluation = await this.evaluate(context, {
      type: 'FIELD',
      code: fieldCode,
      entityCode,
    });

    return {
      ...evaluation,
      entityCode,
      fieldCode,
    };
  }

  async evaluateActionAccess(context: RuntimeContext, actionCode: string, entityCode?: string): Promise<SecurityPolicyEvaluation> {
    return this.evaluate(context, {
      type: 'ACTION',
      code: actionCode,
      entityCode,
    });
  }

  async assertActionAllowed(context: RuntimeContext, actionCode: string, entityCode?: string): Promise<SecurityPolicyEvaluation> {
    const evaluation = await this.evaluateActionAccess(context, actionCode, entityCode);

    if (!evaluation.allowed) {
      throw new ForbiddenException(evaluation.reason);
    }

    return evaluation;
  }

  async maskDocument(context: RuntimeContext, document: RuntimeDocument): Promise<RuntimeDocument> {
    const data: Record<string, unknown> = {};

    for (const [fieldCode, value] of Object.entries(document.data ?? {})) {
      const access = await this.evaluateFieldAccess(context, document.entityCode, fieldCode);

      if (access.visible && access.allowed) {
        data[fieldCode] = value;
      }
    }

    return {
      ...document,
      data,
    };
  }

  async maskDocuments(context: RuntimeContext, documents: RuntimeDocument[]): Promise<RuntimeDocument[]> {
    return Promise.all(documents.map((document) => this.maskDocument(context, document)));
  }

  async summarizeEntityAccess(
    context: RuntimeContext,
    entityCode: string,
    fieldCodes: string[],
    actionCodes: string[],
  ): Promise<{
    hiddenFields: number;
    readonlyFields: number;
    deniedActions: string[];
  }> {
    const fieldAccess = await Promise.all(fieldCodes.map((fieldCode) => this.evaluateFieldAccess(context, entityCode, fieldCode)));
    const actionAccess = await Promise.all(
      actionCodes.map(async (actionCode) => ({
        actionCode,
        access: await this.evaluateActionAccess(context, actionCode, entityCode),
      })),
    );

    return {
      hiddenFields: fieldAccess.filter((access) => !access.visible || !access.allowed).length,
      readonlyFields: fieldAccess.filter((access) => access.visible && access.allowed && !access.editable).length,
      deniedActions: actionAccess.filter((result) => !result.access.allowed).map((result) => result.actionCode),
    };
  }

  private async resolveMatchingPolicies(
    context: RuntimeContext,
    target: SecurityPolicyTargetDefinition,
  ): Promise<SecurityPolicyDefinition[]> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      type: 'SECURITY_POLICY',
      enabledOnly: true,
    });

    return metadata
      .map((record) => record.definition as SecurityPolicyDefinition)
      .filter((policy) => policy.enabled)
      .filter((policy) => this.targetMatches(policy.target, target))
      .filter((policy) => this.subjectMatches(context, policy))
      .filter((policy) => this.conditionsMatch(context, policy));
  }

  private toEvaluation(policies: SecurityPolicyDefinition[], target: SecurityPolicyTargetDefinition): SecurityPolicyEvaluation {
    const matchingPolicies = [...policies].sort((left, right) => this.effectPriority(left.effect) - this.effectPriority(right.effect));
    const denied = matchingPolicies.filter((policy) => policy.effect === 'DENY');
    const allowed = matchingPolicies.filter((policy) => policy.effect === 'ALLOW');
    const denyRules = this.mergeRules(denied);
    const allowRules = this.mergeRules(allowed);
    const rules = {
      read: this.resolveRule('read', denyRules, allowRules, true),
      visible: this.resolveRule('visible', denyRules, allowRules, true),
      editable: this.resolveRule('editable', denyRules, allowRules, true),
    };
    const allowedByOperation = this.resolveOperationAllowed(target, denyRules, allowRules);
    const isAllowed = allowedByOperation && rules.read;

    return {
      allowed: isAllowed,
      visible: isAllowed && rules.visible,
      editable: isAllowed && rules.editable,
      reason: denied.length > 0 ? 'SECURITY_POLICY_DENY' : allowed.length > 0 ? 'SECURITY_POLICY_ALLOW' : 'SECURITY_POLICY_DEFAULT',
      policies: matchingPolicies.map((policy) => policy.code),
    };
  }

  private resolveOperationAllowed(
    target: SecurityPolicyTargetDefinition,
    denyRules: SecurityPolicyRulesDefinition,
    allowRules: SecurityPolicyRulesDefinition,
  ): boolean {
    if (target.type !== 'ACTION') {
      return true;
    }

    const actionCode = target.code.toUpperCase();

    if (actionCode === 'CREATE') {
      return this.resolveRule('create', denyRules, allowRules, true);
    }

    if (actionCode === 'UPDATE') {
      return this.resolveRule('update', denyRules, allowRules, true);
    }

    if (actionCode === 'DELETE') {
      return this.resolveRule('delete', denyRules, allowRules, true);
    }

    return this.resolveRule('read', denyRules, allowRules, true);
  }

  private resolveRule(
    key: keyof SecurityPolicyRulesDefinition,
    denyRules: SecurityPolicyRulesDefinition,
    allowRules: SecurityPolicyRulesDefinition,
    fallback: boolean,
  ): boolean {
    if (denyRules[key] === false || denyRules[key] === true) {
      return false;
    }

    if (allowRules[key] !== undefined) {
      return Boolean(allowRules[key]);
    }

    return fallback;
  }

  private mergeRules(policies: SecurityPolicyDefinition[]): SecurityPolicyRulesDefinition {
    return policies.reduce<SecurityPolicyRulesDefinition>(
      (merged, policy) => ({
        ...merged,
        ...policy.rules,
      }),
      {},
    );
  }

  private targetMatches(policyTarget: SecurityPolicyTargetDefinition, target: SecurityPolicyTargetDefinition): boolean {
    return (
      policyTarget.type === target.type &&
      policyTarget.code === target.code &&
      (!policyTarget.entityCode || !target.entityCode || policyTarget.entityCode === target.entityCode)
    );
  }

  private subjectMatches(context: RuntimeContext, policy: SecurityPolicyDefinition): boolean {
    if (policy.subjects.length === 0) {
      return true;
    }

    return policy.subjects.some((subject) => {
      if (subject.type === 'USER') {
        return subject.value === context.userId;
      }

      if (subject.type === 'ROLE') {
        return (context.roles ?? []).includes(subject.value);
      }

      if (subject.type === 'GROUP') {
        return (context.groups ?? []).includes(subject.value);
      }

      if (subject.type === 'ATTRIBUTE') {
        const [attributeKey, attributeValue] = subject.value.split(':');
        return String(context.attributes?.[attributeKey] ?? '') === attributeValue;
      }

      return false;
    });
  }

  private conditionsMatch(context: RuntimeContext, policy: SecurityPolicyDefinition): boolean {
    const attributes = policy.conditions?.attributes ?? {};

    return Object.entries(attributes).every(([key, value]) => context.attributes?.[key] === value);
  }

  private effectPriority(effect: SecurityPolicyDefinition['effect']): number {
    return effect === 'DENY' ? 0 : 1;
  }
}
