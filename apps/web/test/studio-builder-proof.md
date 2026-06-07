# RediOS Studio Builder Proof

Phase 19 adds a metadata-only Studio foundation at `/studio` inside `apps/web`.

## 1. Open Studio

- Route: `/studio`
- Loads Theme Engine through `GET /api/themes/current`
- Loads Navigation Engine through `GET /api/navigation/current`
- Loads metadata tree through `GET /api/metadata/debug`
- Applies theme tokens through the existing `ThemeProvider`

## 2. Open Form Metadata

- Select an entity from the metadata explorer.
- Studio calls `GET /api/forms/:entityCode`.
- `FormBuilder` and `FormRenderer` display the returned sections and fields.

Example: selecting an entity whose runtime form is `WORK_ORDER_FORM` displays fields from form metadata. No form-specific component is created.

## 3. Drag New Field

- Select a component from the field palette.
- Enter a generic `fieldCode`.
- Drag/drop into the form canvas.
- Studio creates or reuses a Designer draft:
  - `POST /api/designer/drafts`
  - target type: `FORM`
- Studio applies:
  - `POST /api/designer/:draftId/operations`
  - operation: `ADD_FIELD`

No direct metadata persistence is performed by the UI.

## 4. Preview

- Studio calls `POST /api/designer/:draftId/preview`.
- Preview shows:
  - validation result
  - dependency impact
  - simulation payload
  - rendered form preview using `FormRenderer`

Runtime renderer proof:

- `TEXT_INPUT` metadata maps to the generic `Input` atom.
- `NUMBER_INPUT` maps to the generic `Input` atom with numeric input.
- `BADGE` maps to the generic `Badge` atom.
- PAGE/TEMPLATE/ORGANISM/MOLECULE/ATOM trees are rendered through `PageRenderer` and `ComponentRegistry`.

## 5. Publish

- Studio calls `POST /api/designer/:draftId/publish`.
- Designer Engine validates dependencies before publish.
- Published metadata receives the next metadata version.
- Runtime forms read the updated metadata through the existing Form Engine endpoint.

## Forbidden Architecture Proof

- Studio does not create application code.
- Studio does not hardcode entity, field, workflow, menu, permission, or page behavior.
- All operations route through Designer API draft operations.
- The explorer tree is loaded from metadata APIs, not a static business list.
