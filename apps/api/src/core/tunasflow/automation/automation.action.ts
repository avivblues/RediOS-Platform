import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import type {
  AutomationActionDefinition,
  AutomationDefinition,
  RuntimeContext,
  RuntimeDocument,
} from '@redios/shared';
import { HumanTaskEngine } from '../../experience/human-task/human-task.engine';
import { NotificationCenterService } from '../../experience/notification/notification-center.service';
import { RuntimeExecutor } from '../../runtime/runtime-executor.service';

export interface AutomationActionResult {
  type: string;
  status: 'EXECUTED' | 'SKIPPED' | 'FAILED';
  output?: unknown;
  message?: string;
}

@Injectable()
export class AutomationActionRunner {
  private readonly logger = new Logger(AutomationActionRunner.name);

  constructor(
    private readonly humanTaskEngine: HumanTaskEngine,
    private readonly notificationCenter: NotificationCenterService,
    @Inject(forwardRef(() => RuntimeExecutor))
    private readonly runtimeExecutor: RuntimeExecutor,
  ) {}

  async run(
    context: RuntimeContext,
    automation: AutomationDefinition,
    document: RuntimeDocument | undefined,
    action: AutomationActionDefinition,
  ): Promise<AutomationActionResult> {
    try {
      if (action.type === 'CREATE_HUMAN_TASK') {
        const saved = await this.humanTaskEngine.create({
          tenantId: context.tenantId,
          title: String(action.config.title ?? automation.code),
          entityCode: automation.entityCode,
          documentId: document?.id,
          actionCode: String(action.config.actionCode ?? 'COMPLETE'),
          processCode: String(action.config.processCode ?? automation.code),
          assigneeRoles: Array.isArray(action.config.assigneeRoles)
            ? action.config.assigneeRoles.map(String)
            : [String(action.config.targetRole ?? 'SUPERVISOR')],
          priority: String(action.config.priority ?? 'NORMAL').toUpperCase() === 'HIGH' ? 'HIGH' : 'NORMAL',
          source: 'PROCESS',
        });

        return { type: action.type, status: 'EXECUTED', output: { humanTaskId: saved.id } };
      }

      if (action.type === 'NOTIFY') {
        const notification = await this.notificationCenter.record({
          tenantId: context.tenantId,
          userId: action.config.userId ? String(action.config.userId) : context.userId,
          targetRole: action.config.targetRole ? String(action.config.targetRole) : undefined,
          title: String(action.config.title ?? automation.code),
          message: String(action.config.body ?? `Automation ${automation.code} executed.`),
          eventCode: automation.code,
        });

        return { type: action.type, status: 'EXECUTED', output: { notificationId: notification.id } };
      }

      if (action.type === 'RUNTIME_ACTION') {
        const actionCode = String(action.config.actionCode ?? '');
        const entityCode = String(action.config.entityCode ?? automation.entityCode);

        if (!actionCode || !document?.id) {
          return {
            type: action.type,
            status: 'SKIPPED',
            message: 'RUNTIME_ACTION requires actionCode and document id.',
          };
        }

        const result = await this.runtimeExecutor.prepareAction({
          context,
          entityCode,
          id: document.id,
          actionCode,
          payload: (action.config.payload as Record<string, unknown>) ?? {},
        });

        return { type: action.type, status: 'EXECUTED', output: result };
      }

      return { type: action.type, status: 'SKIPPED', message: `Unsupported automation action ${action.type}.` };
    } catch (error) {
      this.logger.warn(`Automation action failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        type: action.type,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Automation action failed.',
      };
    }
  }
}
