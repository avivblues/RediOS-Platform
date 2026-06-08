# Studio No-Code User Journey Proof

## Scope

This proof covers Phase 19.0.3 UX hardening for non-technical users.

Studio remains metadata-driven:

- No source-code app UI is generated.
- Creation output is metadata definitions.
- Publish remains routed through Designer, validation, dependency analysis, and runtime compiler ownership.
- Simple Mode hides metadata JSON.
- Expert Mode can show generated metadata JSON.

## Scenario: Non-Technical User Creates Inventory App

1. Open Studio:

```text
http://localhost:3000/studio
```

Expected screen notes:

- Product-style Studio dashboard appears.
- User clicks Create Application.
- Browser routes to `/studio/create`.

2. Application step:

- User sees "What do you want to build?"
- User picks Inventory card or Blank App.
- User enters "Warehouse Management".

Expected:

- Later steps are locked until app name is present.
- Locked steps show "Complete previous step first" if clicked.

3. Data Model step:

- User sees "Create your first data object".
- User can choose example objects like Product, Customer, Asset, or Order.
- User enters Product and clicks Create Object.

Expected:

- Product appears as a friendly object.
- No technical metadata code is shown in Simple Mode.

4. Fields step:

- User sees Product Fields.
- User clicks Add Field.
- User adds:
  - Name as Text
  - SKU as Text
  - Stock as Number
  - Supplier as Lookup

Expected:

- Field dialog shows simple types.
- Advanced options are hidden under Advanced.
- Lookup asks for related object and display field only when choices exist.
- No empty dropdown is shown.

5. Experience step:

- User clicks Generate Experience.

Expected generated metadata:

- Form
- List View
- Detail Page
- Navigation
- API-ready metadata

6. Review step:

Expected:

- Build Preview Panel replaces raw JSON in Simple Mode.
- Counts show application, objects, forms, pages, navigation, and runtime readiness.
- Expert Mode can reveal generated metadata JSON.

7. Publish step:

- User clicks Publish Application.

Expected:

- Publish experience explains Designer-backed publish ownership.
- Success state says "Your application is ready".
- Open App action is visible.

## Screenshot Notes

Expected visual states:

- SaaS-style starter cards for app creation.
- Guarded stepper with locked future steps.
- Object creation empty state with clear examples.
- Field dialog with simple and advanced options.
- Business-friendly build preview.
- Publish success panel.

## Validation

Commands:

```text
npm run typecheck
npm run build
```

Expected result: both pass.
