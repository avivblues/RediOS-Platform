# RediOS Studio Runtime User Journey Proof

## Scope

Phase 19.0.4 connects the no-code creation journey to the real runtime path:

Studio Draft -> Designer Publish API -> MetadataProvider save -> RuntimeCompiler compile -> RuntimePackage ACTIVE -> `/apps/:applicationCode`.

No static Product page, app component, or hardcoded generated application UI is created.

## Scenario

1. Open `http://localhost:3000/studio/create`.
2. Choose `Inventory`.
3. Create the `Product` data object.
4. Add an information field named `Stock` with type `Number`.
5. Generate experience metadata.
6. Review readiness. Before publish, readiness shows metadata prerequisites ready and runtime package pending.
7. Click `Publish Application`.
8. Expected publish result:
   - Generated metadata is submitted to `POST /api/designer/generated/publish`.
   - DesignerEngine validates the generated metadata set.
   - MetadataProvider saves application, entity, field, form, view, UI, theme, and navigation metadata.
   - RuntimeCompiler compiles the package for the generated application code.
   - Studio shows `Your application is live`.
9. Click `Open Application`.
10. Browser opens `/apps/INVENTORY_APP`.
11. RuntimeAppShell loads theme, navigation, page, and form through existing metadata APIs.
12. Product input screen renders from metadata and allows entering Stock data in the generated form control.

## Runtime Proof

- Route: `/apps/:applicationCode`
- Runtime shell: `RuntimeAppShell`
- Navigation renderer: `RuntimeNavigationRenderer`
- Page renderer: `RuntimePageRenderer`
- Form renderer: `RuntimeFormRenderer`
- Data source: UI composition API, Form API, Theme API, Navigation API

## UX Proof

- Business users see simple terms:
  - `ENTITY` -> Data Object
  - `FIELD` -> Information Field
  - `FORM` -> Input Screen
  - `VIEW` -> Data List
  - `WORKFLOW` -> Business Process
  - `RELATION` -> Connection
- Build preview says `Your application contains` and groups Data Objects, Input Screens, Lists, Automation, and Runtime.
- Empty field state says `No information fields yet` and explains fields with examples.
- Recommended Next Step suggests Product Name, Price, Stock, and Category.
- Help tooltips explain Application, Data Object, Field, Screen, Workflow, Publish, and Runtime concepts.

## Forbidden Proof

The implementation does not add static generated app pages, browser alert fallbacks, pending publish placeholders, or simulated runtime messages.
