# Mobile Runtime Proof

## Input

`RuntimeScreen` receives:

```json
{
  "entityCode": "WORK_ORDER",
  "platform": "MOBILE"
}
```

## Experience Resolution

Mobile resolves:

```http
GET /api/experience/WORK_ORDER?platform=MOBILE
```

Expected metadata-driven result:

```json
{
  "selected": "WORK_ORDER_EXPERIENCE",
  "page": "WORK_ORDER_MOBILE_PAGE",
  "layout": "MOBILE_STACK",
  "navigation": "MOBILE_NAV",
  "theme": "COMPACT_THEME",
  "interaction": "TOUCH"
}
```

## Runtime Tree

The mobile app then loads the selected page and calls `generateRuntimeTree()` from `@redios/runtime-renderer-core`.

Expected render path:

```text
MOBILE_STACK
HEADER
ACTION_BAR -> Bottom Action Sheet
CONTENT
DETAIL_CARD
FORM_FIELD
TEXT_INPUT
LOOKUP
BADGE
TIMELINE
BOTTOM_NAV
```

## Lookup Proof

`LOOKUP` reads relation/view metadata from the runtime form field:

```json
{
  "fieldCode": "assetId",
  "relation": "WORK_ORDER_ASSET_RELATION",
  "view": "ASSET_LOOKUP"
}
```

The mobile renderer calls Query API:

```http
POST /api/query/ASSET
```

Payload:

```json
{
  "viewCode": "ASSET_LOOKUP"
}
```

No direct entity-specific mobile API is used.

## Action Proof

`BUTTON` resolves a runtime action through `resolveAction()`:

```json
{
  "entityCode": "WORK_ORDER",
  "documentId": "<runtime document id>",
  "actionCode": "START",
  "data": {
    "title": "Inspect compressor"
  }
}
```

The mobile API client posts through the generic runtime action endpoint. Mobile does not execute workflow, ledger, events, or business logic.

## Readiness

Device capability preparation exists through `DeviceCapabilityService` for `CAMERA`, `FILE_PICKER`, `LOCATION`, and `SIGNATURE`.

Offline preparation exists through `OfflineStore` with `saveMetadata()`, `saveDocument()`, `queueAction()`, and `sync()` interfaces only. Sync behavior is reserved for a later phase.

## Forbidden Structure

No entity-specific mobile screens, renderers, workflow code, or direct entity APIs are defined.
