# Offline Sync Proof

## Policy Metadata

Mobile starts by requesting the generic sync policy API:

```http
GET /api/sync/policies
```

Expected metadata-driven policies:

```json
[
  {
    "code": "WORK_ORDER_SYNC",
    "entityCode": "WORK_ORDER",
    "offline": true,
    "strategy": "OFFLINE_FIRST",
    "conflict": "MANUAL_REVIEW"
  },
  {
    "code": "ASSET_SYNC",
    "entityCode": "ASSET",
    "offline": true,
    "strategy": "CACHE_ONLY",
    "conflict": "SERVER_WINS"
  }
]
```

`STOCK_BALANCE_SYNC` exists as metadata but is not returned to mobile startup because `offlineEnabled` is false.

## Bootstrap Package

Mobile requests:

```http
POST /api/sync/bootstrap
```

Payload:

```json
{
  "deviceId": "mobile-device-001",
  "metadataVersion": 0
}
```

Expected package includes:

```text
metadataVersion
entities
forms
workflow
security
navigation
theme
experience
```

## Offline Queue

When the device is offline, a generic `BUTTON` still resolves the same runtime action through `resolveAction()`:

```json
{
  "entityCode": "WORK_ORDER",
  "documentId": "runtime-doc-001",
  "actionCode": "COMPLETE",
  "payload": {
    "photo": "file001"
  }
}
```

Instead of calling the server, `OfflineStore.queueAction()` stores:

```json
{
  "entityCode": "WORK_ORDER",
  "documentId": "runtime-doc-001",
  "actionCode": "COMPLETE",
  "payload": {
    "photo": "file001"
  },
  "status": "PENDING"
}
```

No workflow, ledger, event, business, or database logic runs on mobile.

## Replay

When connectivity returns, `MobileSyncEngine.sync()` loads pending actions and sends each one through Runtime API:

```http
POST /api/runtime/WORK_ORDER/runtime-doc-001/actions/COMPLETE
```

Payload:

```json
{
  "source": "OFFLINE_SYNC",
  "payload": {
    "photo": "file001"
  }
}
```

Expected trace:

```text
ACTION
SECURITY
SECURITY_POLICY
WORKFLOW
PROCESS
BUSINESS
EVENT
LEDGER
SYNC_REPLAY
```

## Conflict Foundation

`SyncConflict` records are stored with:

```text
entityCode
documentId
localVersion
serverVersion
policy
status
```

Conflict detection is captured, but conflict resolution is reserved for a later phase.

## File Sync Readiness

`FileSyncProvider` prepares future photos, attachments, and signatures with states:

```text
LOCAL_ONLY
UPLOADING
SYNCED
```
