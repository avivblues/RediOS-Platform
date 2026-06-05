import { BadRequestException, Injectable } from '@nestjs/common';
import type { BusinessRuleType, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import type { ProcessExecutionPlan, ProcessStepPlan } from '../process/process-engine.service';

export interface BusinessRuleExecutionResult {
  code: string;
  type: BusinessRuleType;
  status: 'EXECUTED' | 'READY';
}

export interface BusinessExecutionResult {
  status: 'BUSINESS_READY';
  executedRules: BusinessRuleExecutionResult[];
  next: 'EVENT_ENGINE';
}

@Injectable()
export class BusinessEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async execute(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    processPlan: ProcessExecutionPlan,
  ): Promise<BusinessExecutionResult> {
    const executedRules: BusinessRuleExecutionResult[] = [];

    for (const step of this.getBusinessSteps(processPlan)) {
      const business = await this.metadataResolver.resolveBusiness(context, entityCode, processPlan.processCode!, step.code);

      if (!business) {
        continue;
      }

      for (const rule of business.definition.rules.filter((candidate) => candidate.enabled)) {
        if (rule.type === 'VALIDATE_REQUIRED_FIELD') {
          const field = this.getConfigString(rule.config, 'field', rule.code);
          const value = document.data[field];

          if (value === undefined || value === null || value === '') {
            throw new BadRequestException(`Required field is missing: ${field}`);
          }

          executedRules.push({ code: rule.code, type: rule.type, status: 'EXECUTED' });
          continue;
        }

        if (rule.type === 'SET_FIELD_VALUE') {
          const field = this.getConfigString(rule.config, 'field', rule.code);
          document.data[field] = rule.config?.value;
          executedRules.push({ code: rule.code, type: rule.type, status: 'EXECUTED' });
          continue;
        }

        executedRules.push({ code: rule.code, type: rule.type, status: 'READY' });
      }
    }

    return {
      status: 'BUSINESS_READY',
      executedRules,
      next: 'EVENT_ENGINE',
    };
  }

  private getBusinessSteps(processPlan: ProcessExecutionPlan): ProcessStepPlan[] {
    if (!processPlan.processCode) {
      return [];
    }

    return processPlan.steps.filter((step) => step.type === 'BUSINESS');
  }

  private getConfigString(config: Record<string, unknown> | undefined, key: string, ruleCode: string): string {
    const value = config?.[key];

    if (typeof value !== 'string' || value.length === 0) {
      throw new BadRequestException(`Business rule ${ruleCode} requires config.${key}.`);
    }

    return value;
  }
}
