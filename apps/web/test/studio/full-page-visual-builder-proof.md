# Phase 19.4 Full Page Visual Builder Proof

## Goal

Validate that a business user can open a full page screen builder, drag information into a canvas, bind a Save button to a connection, preview, publish, and open the generated app without editing metadata.

## Scenario

Product app builder flow:

1. Create or open `Inventory App`.
2. Open `/studio/builder/forms/PRODUCT_FORM`.
3. Confirm builder uses the full browser workspace:
   - Top bar with application name.
   - Device preview switch: Desktop, Tablet, Mobile.
   - Actions: Undo, Redo, Preview, Save, Publish.
   - Left panel with `Information Fields` and `Components`.
   - Center visual canvas.
   - Right property inspector.
4. Drag existing fields:
   - `product.name`
   - `product.stock`
   - `product.price`
   - `product.category`
5. Confirm each field creates:
   - Label.
   - Input component.
   - Validation binding.
   - Connection mapping metadata under `validation.visualBuilder`.
6. Add or select `Save Product` button.
7. Configure On Click event:
   - Action: `Save Record` or `Call Connection`.
   - Method: `POST`.
   - Endpoint: `/product`.
   - Payload mapper: product fields to request body.
   - Success toast.
   - Navigate to Product List.
8. Preview.
9. Publish.
10. Open generated app and save product data.

## Pass Criteria

- Builder is not shown as a small wizard panel.
- Existing fields can be dragged directly into canvas.
- Button events are edited from the right inspector.
- Default generated connections are visible for the current Data Object.
- Visual layout is stored as metadata.
- Developer Mode can show metadata JSON, Simple Mode uses business language.
- No manual metadata editing is required.

## Validation

```bash
npm run typecheck
npm run build
```
