/** TunasFlow state persisted on runtime document.data._tunasflow */
export interface TunasFlowDocumentState {
  /** processCode → metadata version pinned at first execution */
  processVersions?: Record<string, number>;
}

export const TUNASFLOW_DATA_KEY = '_tunasflow';

export function readTunasFlowState(data: Record<string, unknown> | undefined): TunasFlowDocumentState {
  const raw = data?.[TUNASFLOW_DATA_KEY];

  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const state = raw as TunasFlowDocumentState;
  return {
    processVersions: state.processVersions ?? {},
  };
}
