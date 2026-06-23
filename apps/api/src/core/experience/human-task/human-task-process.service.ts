import { Injectable } from '@nestjs/common';
import type { MetadataDefinition, ProcessDefinition, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { MetadataRegistry } from '../../metadata/metadata-registry.service';
import type { ProcessExecutionPlan } from '../../process/process-engine.service';
import { HumanTaskEngine } from './human-task.engine';

@Injectable()
export class HumanTaskProcessService {
  constructor(
    private readonly metadataRegistry: MetadataRegistry,
    private readonly humanTaskEngine: HumanTaskEngine,
  ) {}

  async execute(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    processPlan: ProcessExecutionPlan,
  ): Promise<string[]> {
    if (!processPlan.executed || !processPlan.processCode) {
      return [];
    }

    const process = await this.resolveProcessByCode(context, processPlan.processCode);
    if (!process) {
      return [];
    }

    const created: string[] = [];

    for (const step of process.definition.steps.filter((candidate) => candidate.enabled && candidate.type === 'HUMAN_TASK')) {
      const config = step.config ?? {};
      const title = String(config.title ?? `${process.definition.code}:${step.code}`);
      const assigneeRoles = Array.isArray(config.assigneeRoles)
        ? config.assigneeRoles.map(String)
        : [String(config.targetRole ?? 'SUPERVISOR')];

      const saved = await this.humanTaskEngine.create({
        tenantId: context.tenantId,
        title,
        entityCode,
        documentId: document.id,
        actionCode: String(config.actionCode ?? 'APPROVE'),
        processCode: process.definition.code,
        assigneeRoles,
        priority: String(config.priority ?? 'NORMAL').toUpperCase() === 'HIGH' ? 'HIGH' : 'NORMAL',
        source: 'PROCESS',
      });

      created.push(saved.id);
    }

    return created;
  }

  private async resolveProcessByCode(context: RuntimeContext, processCode: string) {
    const definitions = await this.metadataRegistry.findByType(context, 'PROCESS');
    return definitions.find((candidate) => (candidate.definition as ProcessDefinition).code === processCode) as
      | MetadataDefinition<ProcessDefinition>
      | undefined;
  }
}
