# RediOS Studio Creation Journey Proof

## Scope

Phase 19.0.3 adds the RediOS Studio creation journey foundation.

Studio remains a metadata editor:

- No source-code application modules are generated.
- No direct database writes are performed.
- Generated output is metadata definitions.
- Publish is routed through existing Designer/validation/dependency/compiler ownership.

## Creation Route

Open:

```text
http://localhost:3000/studio/create
```

Expected:

- CreationWizard opens.
- Steps are Application, Data Model, Fields, Experience, Review, Publish.
- CreationDraft tracks application, entities, fields, forms, views, navigation, and generated metadata.

## Test 1: Create Application

Input:

- Application: Warehouse Management
- Description: Manage inventory
- Object: Product
- Fields:
  - Name as Text
  - SKU as Text
  - Stock as Number
  - Supplier as Lookup

Expected generated metadata:

- `APPLICATION` for `WAREHOUSE_MANAGEMENT`
- `ENTITY` for `PRODUCT`
- `FIELD` definitions for product fields
- `RELATION` for product supplier lookup
- `FORM` for product data entry
- `VIEW` for product list
- `UI` page for product detail
- `NAVIGATION` menu for product

Expected publish behavior:

- Review step shows objects, forms, views, pages, menus, security, and runtime readiness.
- Publish step does not bypass DesignerEngine.
- RuntimeCompiler remains backend-owned after Designer publish.

Expected runtime proof:

- Generated application metadata is ready to appear in app listing when generic creation targets are enabled.
- Generated product navigation points to generated page metadata.
- Product form is metadata-only and does not create source files.

## Test 2: Modify Existing Application

Open:

```text
http://localhost:3000/studio/apps/ASSET_MAINTENANCE
```

Expected:

- Application Builder shows Asset Management.
- Data Objects list exposes Work Order as a friendly object label.
- Opening the object routes to the existing Form Builder.
- Adding a field creates a Designer draft, previews impact, and publishes through Designer when valid.
- No source code is generated.

## Generated Metadata Example

Representative generated field:

```json
{
  "code": "productName",
  "name": "Product Name",
  "entityCode": "PRODUCT",
  "dataType": "string",
  "required": true,
  "visible": true,
  "readonly": false
}
```

Representative generated lookup relation:

```json
{
  "code": "PRODUCT_SUPPLIER_RELATION",
  "source": { "entityCode": "PRODUCT" },
  "target": { "entityCode": "SUPPLIER" },
  "type": "MANY_TO_ONE",
  "behavior": { "lookup": true }
}
```

## Validation

Required:

```text
npm run typecheck
npm run build
```

Expected result: both pass.
