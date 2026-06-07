import type { MobileResolvedUIPage, MobileRuntimeForm, MobileRuntimeTheme } from '../api/mobile-runtime-types';

export interface OfflineActionQueueItem {
  entityCode: string;
  documentId?: string;
  actionCode: string;
  data: Record<string, unknown>;
}

export interface OfflineMetadataSnapshot {
  page?: MobileResolvedUIPage;
  form?: MobileRuntimeForm;
  theme?: MobileRuntimeTheme;
}

export interface OfflineStore {
  saveMetadata(key: string, metadata: OfflineMetadataSnapshot): Promise<void>;
  saveDocument(entityCode: string, document: Record<string, unknown>): Promise<void>;
  queueAction(action: OfflineActionQueueItem): Promise<void>;
  sync(): Promise<void>;
}
