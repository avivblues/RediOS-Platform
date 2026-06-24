import { Injectable, Logger } from '@nestjs/common';
import type { AutomationDefinition, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { MetadataRegistry } from '../../metadata/metadata-registry.service';
import { ConditionEvaluator } from '../rule/condition.evaluator';
import type { AutomationActionResult } from './automation.action';
import { AutomationActionRunner } from './automation.action';
import { automationEntityMatches } from './trigger';

export interface AutomationRunResult {
  automationCode: string;
  status: 'EXECUTED' | 'SKIPPED' | 'FAILED';
  actions: AutomationActionResult[];
  message?: string;
}

@Injectable()
export class AutomationEngine {
  private readonly logger = new Logger(AutomationEngine.name);
  private readonly lastScheduleRun = new Map<string, number>();

  constructor(
    private readonly metadataRegistry: MetadataRegistry,
    private readonly conditionEvaluator: ConditionEvaluator,
    private readonly actionRunner: AutomationActionRunner,
  ) {}

  async listAutomations(context: RuntimeContext): Promise<AutomationDefinition[]> {
    const definitions = await this.metadataRegistry.findByType(context, 'AUTOMATION');
    return definitions.map((record) => record.definition as AutomationDefinition).filter((item) => item.enabled);
  }

  async findAutomation(context: RuntimeContext, code: string): Promise<AutomationDefinition | null> {
    const record = await this.metadataRegistry.findOne(context, 'AUTOMATION', code);
    if (!record?.enabled) {
      return null;
    }

    return record.definition as AutomationDefinition;
  }

  async runAutomation(
    context: RuntimeContext,
    automationCode: string,
    document?: RuntimeDocument,
  ): Promise<AutomationRunResult> {
    const automation = await this.findAutomation(context, automationCode);
    if (!automation) {
      return {
        automationCode,
        status: 'SKIPPED',
        actions: [],
        message: 'Automation not found or disabled.',
      };
    }

    return this.executeAutomation(context, automation, document);
  }

  async executeAutomation(
    context: RuntimeContext,
    automation: AutomationDefinition,
    document?: RuntimeDocument,
  ): Promise<AutomationRunResult> {
    if (!automation.enabled) {
      return { automationCode: automation.code, status: 'SKIPPED', actions: [], message: 'Automation disabled.' };
    }

    if (automation.trigger.type === 'CONDITION' && document) {
      if (!this.conditionEvaluator.evaluate(document, automation.trigger.condition)) {
        return { automationCode: automation.code, status: 'SKIPPED', actions: [], message: 'Condition not met.' };
      }
    }

    const actions: AutomationActionResult[] = [];

    for (const action of automation.actions) {
      actions.push(await this.actionRunner.run(context, automation, document, action));
    }

    const failed = actions.some((action) => action.status === 'FAILED');

    return {
      automationCode: automation.code,
      status: failed ? 'FAILED' : 'EXECUTED',
      actions,
    };
  }

  async runScheduled(context: RuntimeContext): Promise<AutomationRunResult[]> {
    const automations = await this.listAutomations(context);
    const now = Date.now();
    const results: AutomationRunResult[] = [];

    for (const automation of automations) {
      if (automation.trigger.type !== 'SCHEDULE') {
        continue;
      }

      const intervalMinutes = Number(automation.trigger.intervalMinutes ?? 0);
      if (intervalMinutes <= 0) {
        continue;
      }

      const key = `${context.tenantId}:${automation.code}`;
      const lastRun = this.lastScheduleRun.get(key) ?? 0;
      const intervalMs = intervalMinutes * 60 * 1000;

      if (now - lastRun < intervalMs) {
        continue;
      }

      this.lastScheduleRun.set(key, now);
      results.push(await this.executeAutomation(context, automation));
    }

    return results;
  }

  async runForEvent(
    context: RuntimeContext,
    entityCode: string,
    eventCode: string,
    document?: RuntimeDocument,
  ): Promise<AutomationRunResult[]> {
    const automations = await this.listAutomations(context);
    const results: AutomationRunResult[] = [];

    for (const automation of automations) {
      if (automation.trigger.type !== 'EVENT') {
        continue;
      }

      if (!automationEntityMatches(automation, entityCode)) {
        continue;
      }

      if (automation.trigger.eventCode && automation.trigger.eventCode !== eventCode) {
        continue;
      }

      results.push(await this.executeAutomation(context, automation, document));
    }

    return results;
  }
}
