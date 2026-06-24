import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';
import { EscalationEngine } from '../approval/escalation.engine';
import { AutomationEngine } from './automation.engine';

const DEFAULT_TENANT_CONTEXT: RuntimeContext = {
  tenantId: 'demo',
  domainCode: 'DEFAULT',
  applicationCode: 'ASSET_MAINTENANCE',
  userId: 'system',
  permissions: [],
  capabilities: [],
  roles: ['SYSTEM'],
};

@Injectable()
export class AutomationScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutomationScheduler.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly automationEngine: AutomationEngine,
    private readonly escalationEngine: EscalationEngine,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, 60_000);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async tick(): Promise<void> {
    try {
      const scheduled = await this.automationEngine.runScheduled(DEFAULT_TENANT_CONTEXT);
      const escalated = await this.escalationEngine.escalateOverdue(DEFAULT_TENANT_CONTEXT);

      if (scheduled.length > 0 || escalated.length > 0) {
        this.logger.debug(`Scheduler tick: ${scheduled.length} automation(s), ${escalated.length} escalation(s).`);
      }
    } catch (error) {
      this.logger.warn(`Scheduler tick failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
