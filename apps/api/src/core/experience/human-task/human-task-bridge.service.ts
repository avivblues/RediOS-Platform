import { Injectable, Logger } from '@nestjs/common';
import type { RuntimeContext, RuntimeDocument } from '@redios/shared';
import { HumanTaskEngine } from './human-task.engine';

const SUPERVISOR_ROLES = ['SUPERVISOR', 'MANAGER', 'POWER_USER', 'PLANT_MANAGER'];

@Injectable()
export class HumanTaskBridgeService {
  private readonly logger = new Logger(HumanTaskBridgeService.name);

  constructor(private readonly humanTaskEngine: HumanTaskEngine) {}

  async onWorkflowTransition(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    toStatus: string | undefined,
    actionCode: string,
  ): Promise<void> {
    if (!document.id || !toStatus) {
      return;
    }

    if (entityCode === 'WORK_ORDER' && toStatus === 'IN_PROGRESS' && actionCode === 'START') {
      await this.humanTaskEngine.create({
        tenantId: context.tenantId,
        title: `Verify work order: ${String(document.data?.title ?? document.id)}`,
        entityCode,
        documentId: document.id,
        actionCode: 'COMPLETE',
        processCode: 'WORK_ORDER_START_PROCESS',
        assigneeRoles: SUPERVISOR_ROLES,
        priority: String(document.data?.priority ?? '').toUpperCase() === 'HIGH' ? 'HIGH' : 'NORMAL',
        source: 'WORKFLOW',
      });

      this.logger.debug(`Created human task for ${entityCode}:${document.id} after ${actionCode}`);
    }
  }

  async seedDemoTasks(context: RuntimeContext): Promise<number> {
    const adminPersona = {
      persona: 'SYSTEM_ADMIN' as const,
      label: 'System Admin',
      description: '',
      workspaceCode: 'SYSTEM_CONTROL_CENTER',
      homeRoute: '/workspace',
      applicationCode: 'REDIOS_PLATFORM',
      capabilities: ['platform.*'],
      sourceRoles: ['SYSTEM_ADMIN'],
    };
    const visible = await this.humanTaskEngine.list(context, adminPersona);

    if (visible.length > 0) {
      return 0;
    }

    const existing = await this.humanTaskEngine.countForTenant(context.tenantId);
    if (existing > 0) {
      await this.humanTaskEngine.create({
        tenantId: context.tenantId,
        title: 'Platform Approval Queue',
        entityCode: 'WORK_ORDER',
        actionCode: 'APPROVE',
        processCode: 'PLATFORM_APPROVAL',
        assigneeRoles: ['SYSTEM_ADMIN'],
        priority: 'NORMAL',
        source: 'MANUAL',
      });
      return 1;
    }

    await this.humanTaskEngine.create({
      tenantId: context.tenantId,
      title: 'Batch Release Approval',
      entityCode: 'WORK_ORDER',
      actionCode: 'APPROVE',
      processCode: 'BATCH_RELEASE_APPROVAL',
      assigneeRoles: ['SYSTEM_ADMIN', 'SUPERVISOR', 'MANAGER'],
      priority: 'HIGH',
      source: 'MANUAL',
    });

    await this.humanTaskEngine.create({
      tenantId: context.tenantId,
      title: 'Purchase Request Review',
      entityCode: 'WORK_ORDER',
      actionCode: 'APPROVE',
      processCode: 'PURCHASE_APPROVAL',
      assigneeRoles: ['MANAGER', 'POWER_USER'],
      priority: 'NORMAL',
      source: 'MANUAL',
    });

    return 2;
  }
}
