import { Injectable, Logger } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';
import { HumanTaskEngine } from './human-task.engine';

/**
 * Demo seed only — production human tasks are created by TunasFlow (ApprovalEngine / process HUMAN_TASK steps).
 */
@Injectable()
export class HumanTaskBridgeService {
  private readonly logger = new Logger(HumanTaskBridgeService.name);

  constructor(private readonly humanTaskEngine: HumanTaskEngine) {}

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
      entityCode: 'PURCHASE_REQUEST',
      actionCode: 'APPROVE',
      processCode: 'PURCHASE_APPROVAL',
      assigneeRoles: ['MANAGER', 'POWER_USER'],
      priority: 'NORMAL',
      source: 'MANUAL',
    });

    this.logger.debug(`Seeded ${existing === 0 ? 2 : 1} demo human tasks for tenant ${context.tenantId}`);
    return 2;
  }
}
