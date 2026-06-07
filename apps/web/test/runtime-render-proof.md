# Runtime Renderer Proof

Route:

```text
/runtime/WORK_ORDER_DETAIL_PAGE?tenantId=demo&domainCode=DEFAULT&applicationCode=ASSET_MAINTENANCE
```

Runtime loading flow:

```text
pageCode
-> GET /api/ui/pages/:pageCode
-> GET /api/themes/current
-> GET /api/navigation/current
-> GET /api/forms/:entityCode
-> RuntimeRenderer
```

Rendered metadata tree:

```text
PAGE WORK_ORDER_DETAIL_PAGE
  TEMPLATE MASTER_DETAIL
    REGION HEADER
      ORGANISM ACTION_BAR
        MOLECULE ACTION_BUTTON
          ATOM BUTTON
    REGION CONTENT
      ORGANISM DETAIL_CARD
        MOLECULE STATUS_BADGE
          ATOM BADGE
        MOLECULE FORM_FIELD
          ATOM LABEL
          ATOM TEXT_INPUT | TEXT_AREA | SELECT | LOOKUP | NUMBER_INPUT
    REGION SIDEBAR
      ORGANISM TIMELINE
        MOLECULE STATUS_BADGE
          ATOM BADGE
```

Lookup proof:

```text
LOOKUP
-> form field lookup metadata
-> relation WORK_ORDER_ASSET_RELATION
-> view ASSET_LOOKUP
-> POST /api/query/:targetEntity
```

Security proof:

```text
field.visible=false -> renderer hides field
field.readonly=true -> renderer disables input
navigation/current -> backend policy already filters menu visibility
```

No entity-specific React pages or components are created. The renderer uses only metadata codes, the component registry, and generic runtime components.
