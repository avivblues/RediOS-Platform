# Phase 19.5 Split Builder Architecture Proof

## Goal

Validate that RediOS Studio separates source-of-truth metadata design from web and Android layout builders.

## Scenario

1. Open `/studio/metadata`.
2. Confirm Metadata Designer shows:
   - Object and Attribute model.
   - Static and dynamic Data Source examples.
   - Auto generated API endpoints.
   - Event metadata examples.
3. Create or open Product metadata:
   - Object: `Product`.
   - Attributes: `name`, `stock`.
4. Confirm API metadata is represented as:
   - `GET /api/products`
   - `GET /api/products/:id`
   - `POST /api/products`
   - `PUT /api/products/:id`
   - `DELETE /api/products/:id`
5. Confirm Save Product event exists or is offered as reusable event metadata.
6. Open `/studio/builder/web/PRODUCT_FORM`.
7. Confirm Web Builder only handles layout:
   - Drag Product fields.
   - Resize, reorder, section, columns.
   - Select Save button.
   - Connect On Click to Save Product Event.
   - No API URL editor is shown in the web layout builder.
8. Open `/studio/builder/android/PRODUCT_FORM`.
9. Confirm Android Builder uses the same metadata and event:
   - Phone frame preview.
   - Android components such as Camera, Image Upload, Location, Barcode Scanner.
   - Mobile properties such as keyboard type, offline mode, and sync behavior.
   - Save button connects to the same Save Product Event.
10. Publish.

## Pass Criteria

- Metadata Designer is the only place for Object, Attribute, Data Source, API, and Event concepts.
- Web Builder stores web layout metadata only.
- Android Builder stores mobile layout metadata only.
- Web and Android builders reuse the same Object, Attribute, API, and Event metadata.
- Button-to-API wiring happens through Event Metadata, not direct API URL fields in layout builders.

## Validation

```bash
npm run typecheck
npm run build
```
