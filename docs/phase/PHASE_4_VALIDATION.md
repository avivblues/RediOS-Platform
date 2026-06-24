# Phase 4 Validation

Status: **REDI Studio — Sprint 2 (FORM / VIEW / UI / Integration Publish)**  
Purpose: Studio drafts publish to platform metadata + runtime compile  
Depends on: Phase 3 complete

---

## Sprint 1 Deliverables

| WP | Deliverable | Status |
| --- | --- | --- |
| WP4.1 | `studio-metadata-publisher.ts` — Studio package → `MetadataDefinition[]` | ✅ |
| WP4.2 | `studio-publish.api.ts` — `POST /designer/generated/publish` bridge | ✅ |
| WP4.3 | Builder **Publish** → kernel + local draft fallback | ✅ |
| WP4.4 | Metadata Designer **Publish to Kernel** | ✅ |
| WP4.5 | Process Designer **Publish to Kernel** (PROCESS + HUMAN_TASK steps) | ✅ |
| WP4.6 | Workspace Designer publish (existing `PUT /experience/workspaces`) | ✅ |
| WP4.7 | `DesignerPermissionGuard` — `builder.*` / `metadata.*` → FORM.PUBLISH | ✅ |

---

## Sprint 2 Deliverables

| WP | Deliverable | Status |
| --- | --- | --- |
| WP4.8 | `studio-sprint2-publisher.ts` — Query → VIEW, canvas → FORM/UI PAGE | ✅ |
| WP4.9 | External API → CONNECTOR + INTEGRATION publish | ✅ |
| WP4.10 | `loadScreenCanvases()` — builder drafts included in kernel publish | ✅ |
| WP4.11 | Query Builder **Publish to Kernel** | ✅ |
| WP4.12 | API Builder **Publish to Kernel** | ✅ |
| WP4.13 | UI foundation kit (atoms, molecules, organisms, templates) bundled on publish | ✅ |

---

## Publish flow

```
Studio localStorage drafts
        │
        ▼
studioPackageToMetadata()
  ├── Sprint 1: ENTITY, FIELD, ACTION, WORKFLOW, PROCESS, NAVIGATION, …
  └── Sprint 2: VIEW, FORM, UI PAGE, CONNECTOR, INTEGRATION
        │
        ▼
POST /api/designer/generated/publish
        │
        ├── MetadataValidatorEngine
        ├── MetadataProvider.saveMetadata (version++)
        └── RuntimeCompiler.compile → RUNTIME_PACKAGE
```

**Converted metadata types:**

| Studio draft | Kernel type |
| --- | --- |
| Data objects | ENTITY, FIELD, ACTION, WORKFLOW |
| Process steps | PROCESS (VALIDATION + HUMAN_TASK + EVENT) |
| Menu | NAVIGATION |
| Security roles | SECURITY_POLICY |
| Theme tokens | THEME |
| Application | APPLICATION |
| Queries | VIEW (TABLE / LOOKUP / REPORT_SOURCE) |
| Screens + canvas | FORM, UI PAGE |
| External API connectors | CONNECTOR, INTEGRATION (MANUAL trigger) |
| Builder screen drafts | `screenCanvases` via `loadScreenCanvases()` |

---

## API

```bash
# Publish generated metadata (Studio uses this)
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  http://localhost:3041/api/designer/generated/publish \
  -d '{"metadata":[...]}'

# Publish history
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3041/api/designer/history?limit=12

# Workspace (already wired)
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  http://localhost:3041/api/experience/workspaces/ADMIN_WORKSPACE \
  -d '{...}'
```

---

## UI entry points

| Surface | Action |
| --- | --- |
| `/studio` Builder | **Publish** → kernel + open `/apps/{slug}` |
| `/studio/metadata` | **Publish to Kernel** (full app package) |
| `/studio/metadata/process` | **Publish to Kernel** (process scope) |
| `/studio/metadata/workspace` | **Publish to Platform** (WORKSPACE metadata) |
| `/studio/query` | **Publish to Kernel** (queries → VIEW + full package) |
| `/studio/api` | **Publish to Kernel** (external connectors → INTEGRATION) |

---

## Sprint 2 Acceptance

| Criterion | Status |
| --- | --- |
| Saved queries publish as VIEW metadata | ✅ |
| Canvas-bound fields publish as FORM metadata | ✅ |
| Screens publish as UI PAGE with template regions | ✅ |
| External API connectors publish as CONNECTOR + INTEGRATION | ✅ |
| Navigation PAGE codes align with published UI pages | ✅ |
| Kernel publish loads builder screen drafts from localStorage | ✅ |

---

## Remaining (Phase 4 Sprint 3+)

| Capability | Sprint |
| --- | --- |
| Visual Flow Builder sync | Sprint 3 |
| Report / Dashboard builder | Sprint 4 |

---

## References

- `docs/phase/PHASE_4_REDI_STUDIO.md`
- `apps/web/src/studio/api/studio-metadata-publisher.ts`
- `apps/web/src/studio/api/studio-sprint2-publisher.ts`
- `apps/api/src/core/designer/designer-engine.service.ts`
- `apps/web/src/studio/metadata/workspace/WorkspaceDesigner.tsx`
