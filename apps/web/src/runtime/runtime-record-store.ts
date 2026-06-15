export type RuntimeRecord = Record<string, unknown>;

export function runtimeRecordsKey(appSlug: string, objectName: string) {
  return `redios:runtime:${appSlug}:${objectName}:records`;
}

export function loadRuntimeRecords(appSlug: string, objectName: string): RuntimeRecord[] {
  try {
    const rawValue = window.localStorage.getItem(runtimeRecordsKey(appSlug, objectName));

    if (!rawValue) {
      return [];
    }

    const value = JSON.parse(rawValue);

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveRuntimeRecords(appSlug: string, objectName: string, records: RuntimeRecord[]) {
  window.localStorage.setItem(runtimeRecordsKey(appSlug, objectName), JSON.stringify(records));
}

export function upsertRuntimeRecord(appSlug: string, objectName: string, record: RuntimeRecord) {
  const currentRecords = loadRuntimeRecords(appSlug, objectName);
  const recordId = String(record.id ?? `${objectName}_${Date.now()}`);
  const nextRecord = { ...record, id: recordId };
  const exists = currentRecords.some((current) => String(current.id) === recordId);
  const nextRecords = exists
    ? currentRecords.map((current) => String(current.id) === recordId ? nextRecord : current)
    : [nextRecord, ...currentRecords];

  saveRuntimeRecords(appSlug, objectName, nextRecords);
  return nextRecord;
}
