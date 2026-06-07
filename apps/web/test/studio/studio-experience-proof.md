# RediOS Studio Product Experience Proof

## Scope

Phase 19.0.2 improves the RediOS Studio product experience without adding or changing kernel engines.

The implementation remains metadata driven and uses existing APIs only:

- `/api/metadata/debug`
- `/api/metadata/:type/:code`
- `/api/forms/:entityCode`
- `/api/ui/pages/:pageCode`
- `/api/themes/current`
- `/api/designer/*`
- `/api/runtime-package/current`

## Open Studio

Open:

```text
http://localhost:3000/studio
```

Expected UI:

- Landing page shows "Welcome to RediOS Studio".
- Application cards show friendly names, descriptions, entity counts, form counts, and workflow counts.
- Simple Mode is default and hides developer tools.
- Expert Mode reveals metadata explorer, runtime package, trace viewer, and raw details.

## Select Application

Click Customize on Asset Management.

Expected route:

```text
http://localhost:3000/studio/apps/ASSET_MAINTENANCE
```

Expected UI:

- Breadcrumb shows Studio > Applications > Asset Management.
- Builder cards appear for Data Model, Forms, Pages, Workflow, Integration, and Access Control.
- Labels are human friendly, with technical codes only in Expert Mode.

## Open Form Builder

Open Form Builder from Studio navigation.

Expected UI:

- Header explains that forms control how users enter and update data.
- Flow indicator shows Select Data, Design Form, Preview, Publish.
- Left panel shows Data Source and friendly field/component labels.
- Center canvas renders a modern card-based form from metadata.
- Right panel shows label, component, required, visibility, security, and validation.

## Edit Field

Drag a field from the left panel into the canvas.

Expected behavior:

- The UI creates a Designer draft.
- The field addition calls a Designer `ADD_FIELD` operation.
- Preview runs before publish.
- Publish remains disabled unless preview is valid.

## Preview

Expected UI:

- Desktop Preview renders the form/page as a real app preview.
- Mobile Preview placeholder is visible for future Adaptive Experience metadata.
- Preview does not dump raw simulation JSON.

## Publish

Expected behavior:

- Publish uses the existing Designer publish endpoint.
- Runtime compiler behavior remains backend-owned and unchanged.

## Screens

Expected visual screenshots:

- Studio Home: modern application cards and product-oriented calls to action.
- Application Builder: breadcrumb and builder cards grouped by purpose.
- Form Builder: three-panel low-code layout with modern canvas.
- Preview: app-like desktop preview and mobile placeholder.

## Validation

Required commands:

```text
npm run typecheck
npm run build
```

Expected result: both pass.
