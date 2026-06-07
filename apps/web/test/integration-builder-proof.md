# Integration Studio Builder Proof

Phase 19.2 adds a metadata-only Integration Studio foundation.

## Create Integration

- Open `/studio`.
- Select `Integrations` or `Connectors` from the metadata explorer.
- The builder loads metadata through generic metadata APIs:
  - `GET /api/metadata/INTEGRATION/:code`
  - `GET /api/metadata/CONNECTOR/:code`
- Creating metadata uses Designer draft operations only:
  - `CREATE_CONNECTOR`
  - `CREATE_INTEGRATION`

## Map Field

- The right property editor edits `IntegrationDefinition.mapping`.
- Mapping stays declarative:

```json
{
  "document.id": "external.reference"
}
```

No code transform or provider-specific adapter is generated.

## Test Connector

- The builder calls:
  - `POST /api/connectors/test`
- Expected foundation result:
  - `CONNECTOR_EXECUTED`

## Test Integration

- The builder calls:
  - `POST /api/integrations/test`
- Expected foundation flow:
  - resolve integration metadata
  - resolve connector metadata
  - apply mapping metadata
  - execute connector adapter

## Publish

- Preview uses:
  - `POST /api/designer/:draftId/preview`
- Publish uses:
  - `POST /api/designer/:draftId/publish`

## Runtime Proof

- Runtime events call Integration Engine through Event Engine.
- Runtime traces include:
  - `EVENT`
  - `INTEGRATION`
- Integration results include connector execution output.

## Forbidden Architecture Proof

- No provider-specific service is created.
- No provider, entity, event, or workflow behavior is hardcoded.
- All connector and integration behavior comes from `ConnectorDefinition` and `IntegrationDefinition` metadata.
