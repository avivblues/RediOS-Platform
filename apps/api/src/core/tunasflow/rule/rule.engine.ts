import { Injectable } from '@nestjs/common';
import type { ProcessStepDefinition, RuntimeDocument } from '@redios/shared';
import { ConditionEvaluator } from './condition.evaluator';

@Injectable()
export class RuleEngine {
  constructor(private readonly conditionEvaluator: ConditionEvaluator) {}

  shouldExecuteStep(document: RuntimeDocument, step: ProcessStepDefinition): boolean {
    const config = step.config ?? {};
    const condition = config.condition ?? config.when;

    return this.conditionEvaluator.evaluate(document, condition);
  }

  skipReason(step: ProcessStepDefinition): string {
    const config = step.config ?? {};
    const condition = config.condition ?? config.when;
    return `Condition not met: ${typeof condition === 'string' ? condition : JSON.stringify(condition)}`;
  }
}
