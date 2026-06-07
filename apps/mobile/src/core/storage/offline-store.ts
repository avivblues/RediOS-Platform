import type { MobileResolvedUIPage, MobileRuntimeForm, MobileRuntimeTheme } from '../api/mobile-runtime-types';

export type OfflineActionStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface OfflineAction {
  id: string;
  entityCode: string;
  documentId?: string;
  actionCode: string;
  payload: Record<string, unknown>;
  status: OfflineActionStatus;
  createdAt: string;
  error?: string;
}

export interface OfflineMetadataSnapshot {
  page?: MobileResolvedUIPage;
  form?: MobileRuntimeForm;
  theme?: MobileRuntimeTheme;
  metadataVersion?: number;
}

export interface SyncConflict {
  entityCode: string;
  documentId: string;
  localVersion: number;
  serverVersion: number;
  policy: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface OfflineStore {
  saveMetadata(key: string, metadata: OfflineMetadataSnapshot): Promise<void>;
  getMetadata(key: string): Promise<OfflineMetadataSnapshot | undefined>;
  saveDocument(entityCode: string, document: Record<string, unknown>): Promise<void>;
  getDocument(entityCode: string, documentId: string): Promise<Record<string, unknown> | undefined>;
  queueAction(action: Omit<OfflineAction, 'id' | 'status' | 'createdAt'>): Promise<OfflineAction>;
  getPendingActions(): Promise<OfflineAction[]>;
  markSyncing(actionId: string): Promise<void>;
  markSynced(actionId: string): Promise<void>;
  markFailed(actionId: string, error: string): Promise<void>;
  saveConflict(conflict: SyncConflict): Promise<void>;
  getConflicts(): Promise<SyncConflict[]>;
}

export interface SQLiteDriver {
  execute(sql: string, params?: unknown[]): Promise<unknown>;
}

export class SQLiteOfflineStore implements OfflineStore {
  private readonly metadata = new Map<string, OfflineMetadataSnapshot>();
  private readonly documents = new Map<string, Record<string, unknown>>();
  private readonly actions = new Map<string, OfflineAction>();
  private readonly conflicts = new Map<string, SyncConflict>();

  constructor(private readonly driver?: SQLiteDriver) {}

  async saveMetadata(key: string, metadata: OfflineMetadataSnapshot): Promise<void> {
    this.metadata.set(key, metadata);
    await this.driver?.execute('UPSERT metadata', [key, JSON.stringify(metadata)]);
  }

  async getMetadata(key: string): Promise<OfflineMetadataSnapshot | undefined> {
    return this.metadata.get(key);
  }

  async saveDocument(entityCode: string, document: Record<string, unknown>): Promise<void> {
    const documentId = String(document.id ?? document._id ?? cryptoId());
    this.documents.set(this.documentKey(entityCode, documentId), document);
    await this.driver?.execute('UPSERT document', [entityCode, documentId, JSON.stringify(document)]);
  }

  async getDocument(entityCode: string, documentId: string): Promise<Record<string, unknown> | undefined> {
    return this.documents.get(this.documentKey(entityCode, documentId));
  }

  async queueAction(action: Omit<OfflineAction, 'id' | 'status' | 'createdAt'>): Promise<OfflineAction> {
    const queued: OfflineAction = {
      ...action,
      id: cryptoId(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.actions.set(queued.id, queued);
    await this.driver?.execute('INSERT offline_action', [queued.id, JSON.stringify(queued)]);
    return queued;
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    return [...this.actions.values()].filter((action) => action.status === 'PENDING' || action.status === 'FAILED');
  }

  async markSyncing(actionId: string): Promise<void> {
    await this.updateAction(actionId, { status: 'SYNCING', error: undefined });
  }

  async markSynced(actionId: string): Promise<void> {
    await this.updateAction(actionId, { status: 'SYNCED', error: undefined });
  }

  async markFailed(actionId: string, error: string): Promise<void> {
    await this.updateAction(actionId, { status: 'FAILED', error });
  }

  async saveConflict(conflict: SyncConflict): Promise<void> {
    this.conflicts.set(this.documentKey(conflict.entityCode, conflict.documentId), conflict);
    await this.driver?.execute('UPSERT sync_conflict', [conflict.entityCode, conflict.documentId, JSON.stringify(conflict)]);
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return [...this.conflicts.values()].filter((conflict) => conflict.status === 'OPEN');
  }

  private async updateAction(actionId: string, patch: Partial<OfflineAction>): Promise<void> {
    const current = this.actions.get(actionId);

    if (!current) {
      return;
    }

    const next = {
      ...current,
      ...patch,
    };
    this.actions.set(actionId, next);
    await this.driver?.execute('UPDATE offline_action', [actionId, JSON.stringify(next)]);
  }

  private documentKey(entityCode: string, documentId: string): string {
    return `${entityCode}:${documentId}`;
  }
}

function cryptoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
