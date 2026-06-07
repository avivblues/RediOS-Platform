export type SyncStrategy = 'ONLINE_ONLY' | 'CACHE_ONLY' | 'OFFLINE_FIRST';

export type SyncDirection = 'DOWNLOAD' | 'UPLOAD' | 'BIDIRECTIONAL';

export type SyncConflictPolicy = 'SERVER_WINS' | 'CLIENT_WINS' | 'MANUAL_REVIEW';

export interface SyncRetentionDefinition {
  maxAgeDays?: number;
  maxRecords?: number;
}

export interface SyncDefinition {
  code: string;
  entityCode: string;
  enabled: boolean;
  offlineEnabled: boolean;
  strategy: SyncStrategy;
  syncDirection: SyncDirection;
  conflictPolicy: SyncConflictPolicy;
  retention?: SyncRetentionDefinition;
  priority: number;
}

export interface ResolvedSyncPolicy {
  code: string;
  entityCode: string;
  offline: boolean;
  strategy: SyncStrategy;
  direction: SyncDirection;
  conflict: SyncConflictPolicy;
  retention?: SyncRetentionDefinition;
  priority: number;
}
