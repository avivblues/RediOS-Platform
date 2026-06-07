# RediOS Studio Experience Proof

## Scope

Phase 19.0.1 upgrades RediOS Studio from a metadata debugger into a guided low-code studio experience while keeping all behavior metadata-driven.

No backend kernel changes were made. Studio uses existing API surfaces:

- `/api/forms/:entityCode`
- `/api/ui/pages/:pageCode`
- `/api/navigation/current`
- `/api/themes/current`
- `/api/metadata/debug`
- `/api/metadata/:type/:code`
- `/api/designer/*`
- `/api/runtime-package/current`

No `/api/studio` endpoint is required.

## UX Flow Proof

Open:

```text
http://localhost:3000/studio
```

Expected result:

- Dashboard appears as the default Studio Home.
- Human labels appear through the frontend HumanizerEngine, for example `WORK_ORDER` renders as `Work Order`.
- Application cards are populated from `APPLICATION` metadata and entity metadata.
- Global search returns metadata results only.
- Guided App Builder opens from the dashboard and walks through Application, Data Model, Experience, Workflow, and Publish steps.
- Template Gallery shows metadata package cards, not source-code modules.
- Runtime Health shows active runtime package status and compiled object counts when a runtime package exists.

## Form Builder Proof

The Forms section loads `WORK_ORDER_FORM` through `/api/forms/WORK_ORDER`.

Expected result:

- Field palette is populated from `EntityDefinition.fieldCodes`.
- Canvas renders sections and fields from form metadata.
- Dragging a field into the canvas calls Designer `ADD_FIELD` operation on a draft.
- Preview runs before publish.
- Publish is disabled unless preview is valid.

## Impact Preview Proof

Designer preview output is rendered as visual impact analysis:

- FORM
- UI
- SECURITY
- DEPENDENCY

Breaking dependency impact is displayed as a warning.

## Runtime Proof

Runtime Health reads `/api/runtime-package/current`.

Expected result:

- Active package code
- Metadata version
- Compiled entities
- Compiled forms
- Compiled views
- Compiled workflow count
- ACTIVE status when a package is active

## Forbidden Search

Required forbidden term search from the phase prompt must return no matches.

## Validation

Required commands:

```text
npm run typecheck
npm run build
```

Expected result: both pass.
