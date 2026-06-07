import { MobileConflictResponseError, type MobileMetadataClient } from '../api/mobile-metadata-client';
import type { OfflineAction, OfflineStore } from '../storage/offline-store';

export interface SyncResult {
  processed: number;
  synced: number;
  failed: number;
  actions: OfflineAction[];
}

export class MobileSyncEngine {
  constructor(
    private readonly store: OfflineStore,
    private readonly client: MobileMetadataClient,
  ) {}

  async sync(): Promise<SyncResult> {
    const pending = await this.store.getPendingActions();
    let synced = 0;
    let failed = 0;

    for (const action of pending) {
      await this.store.markSyncing(action.id);

      try {
        await this.client.replayOfflineAction(action);
        await this.store.markSynced(action.id);
        synced += 1;
      } catch (error) {
        if (error instanceof MobileConflictResponseError) {
          await this.store.markConflict(action.id, error.conflictId);
          failed += 1;
          continue;
        }

        await this.store.markFailed(action.id, error instanceof Error ? error.message : String(error));
        failed += 1;
      }
    }

    return {
      processed: pending.length,
      synced,
      failed,
      actions: pending,
    };
  }
}
