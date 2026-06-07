export type FileSyncState = 'LOCAL_ONLY' | 'UPLOADING' | 'SYNCED';

export interface FileSyncItem {
  id: string;
  fieldCode?: string;
  uri: string;
  state: FileSyncState;
}

export interface FileSyncProvider {
  prepare(file: FileSyncItem): Promise<FileSyncItem>;
  upload(file: FileSyncItem): Promise<FileSyncItem>;
}
