import { Injectable } from '@nestjs/common';
import type { MetadataDefinition, ProcessDefinition, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { readTunasFlowState, TUNASFLOW_DATA_KEY } from '@redios/shared';
import { MetadataRegistry } from '../../metadata/metadata-registry.service';
import { StorageEngine } from '../../storage/storage.engine';

@Injectable()
export class FlowVersionService {
  constructor(
    private readonly metadataRegistry: MetadataRegistry,
    private readonly storageEngine: StorageEngine,
  ) {}

  getPinnedVersion(document: RuntimeDocument, processCode: string): number | undefined {
    const state = readTunasFlowState(document.data);
    return state.processVersions?.[processCode];
  }

  async resolveProcess(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
    workflowState: string | undefined,
    document?: RuntimeDocument,
  ): Promise<MetadataDefinition<ProcessDefinition> | null> {
    const definitions = await this.metadataRegistry.findByType(context, 'PROCESS');
    const candidates = definitions.filter((candidate) => {
      const process = candidate.definition as ProcessDefinition;
      const workflowStateMatches = !process.trigger.workflowState || process.trigger.workflowState === workflowState;
      return (
        process.entityCode === entityCode &&
        process.trigger.actionCode === actionCode &&
        workflowStateMatches &&
        process.enabled
      );
    });

    if (candidates.length === 0) {
      return null;
    }

    const processCode = (candidates[0].definition as ProcessDefinition).code;
    const pinnedVersion = document ? this.getPinnedVersion(document, processCode) : undefined;

    if (pinnedVersion !== undefined) {
      const pinned = candidates.find((candidate) => candidate.version === pinnedVersion);
      if (pinned) {
        return pinned as MetadataDefinition<ProcessDefinition>;
      }
    }

    return candidates.sort((left, right) => right.version - left.version)[0] as MetadataDefinition<ProcessDefinition>;
  }

  async pinProcessVersion(
    context: RuntimeContext,
    entityCode: string,
    documentId: string,
    processCode: string,
    metadataVersion: number,
    document?: RuntimeDocument,
  ): Promise<void> {
    const current = document ?? (await this.storageEngine.findOne(context, entityCode, documentId));
    if (!current) {
      return;
    }

    const state = readTunasFlowState(current.data);
    if (state.processVersions?.[processCode] === metadataVersion) {
      return;
    }

    const nextState = {
      ...state,
      processVersions: {
        ...state.processVersions,
        [processCode]: metadataVersion,
      },
    };

    await this.storageEngine.update(context, entityCode, documentId, {
      data: {
        ...current.data,
        [TUNASFLOW_DATA_KEY]: nextState,
      },
    });
  }
}
