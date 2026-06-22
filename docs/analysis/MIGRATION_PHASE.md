# MIGRATION_PHASE.md

Status: Phase 0 Deliverable  
Version: 1.0  
Date: 2026-06-16  
Authority: `docs/phase/PHASE_DEVELOPMENT_ROADMAP.md` + [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)

---

## 1. Purpose

Defines the **development sequence**, **module extraction order**, and **release planning** from current repository state to Blueprint v3 target — without rewriting existing code.

---

## 2. Current State Baseline

| Dimension | Position |
| --- | --- |
| Official active phase | Phase 1 — Kernel Completion |
| Code maturity | Phase 1 ~55%, Phase 4 UI ~40%, Phase 3/6 partial |
| Phase 0 documentation | **Complete** (this folder) |
| Production readiness | Not ready — identity/security trust model |

---

## 3. Locked Phase Sequence

Per active phase documents (overrides README.md phase numbering):

```text
PHASE 0  Repository Audit          ← COMPLETE
PHASE 1  Kernel Completion          ← NEXT
PHASE 2  Experience Engine
PHASE 3  TunasFlow Runtime
PHASE 4  REDI Studio (kernel integration)
PHASE 5  Capability Package Engine
PHASE 6  Integration Hub
PHASE 7  Industrial Capability Template
PHASE 8  Industrial Intelligence    (roadmap only)
```

**Rule:** No phase may be marked complete until its acceptance criteria in the phase document are met.

---

## 4. Phase 1 — Migration Plan (Kernel Completion)

### 4.1 Objectives

Close kernel gaps without UI redesign or business module implementation.

### 4.2 Work packages

| WP | Name | Deliverables | Depends on |
| --- | --- | --- | --- |
| WP1.1 | Identity + Auth API | `core/identity/`, `auth/` module, login/logout endpoints | — |
| WP1.2 | JWT Context Resolver | Evolve `ContextEngine`, auth guard on runtime routes | WP1.1 |
| WP1.3 | Metadata Cache + Loader | `metadata.cache.ts`, `metadata.loader.ts`, boot hydrate | — |
| WP1.4 | Post-seed Compile | Seed runner calls `RuntimeCompiler.compile()` | WP1.3 |
| WP1.5 | Event Bus | `event.bus.ts`, `event.subscriber.ts`, handler execution | — |
| WP1.6 | Capability Security Wire | `SecurityEngine.assertCapability()` | WP1.2 |
| WP1.7 | RuntimeContext alignment | Unify shared/web/renderer-core context | WP1.2 |

### 4.3 Suggested sprint order

```text
Sprint 1:  WP1.3 + WP1.4        (low risk, immediate value)
Sprint 2:  WP1.1 + WP1.2        (critical security path)
Sprint 3:  WP1.5 + WP1.6        (event + capability foundation)
Sprint 4:  WP1.7 + acceptance   (integration test pass)
```

### 4.4 Phase 1 exit criteria

All items from `PHASE_1_KERNEL_COMPLETION.md` §13 acceptance matrix must be ✅ or documented exception with human approval.

### 4.5 Phase 1 release

| Release | Contents | Breaking? |
| --- | --- | --- |
| `v0.2.0-kernel` | Cache + loader + post-seed compile | No |
| `v0.3.0-auth` | JWT auth + guarded runtime | Optional header fallback |
| `v0.4.0-kernel` | Event bus + capability security | No |

---

## 5. Phase 2 — Migration Plan (Experience Engine)

### 5.1 Prerequisites

- Phase 1 complete (JWT context, event bus)
- Persona definitions in metadata or platform seed

### 5.2 Work packages

| WP | Name | Deliverables |
| --- | --- | --- |
| WP2.1 | Persona Resolver | API `core/experience/persona-resolver.ts` |
| WP2.2 | Workspace Engine | Metadata-driven workspace layout |
| WP2.3 | Universal Inbox | Task aggregation from process/workflow |
| WP2.4 | Action Center | Pending actions queue |
| WP2.5 | Notification Center | Event subscriber for notifications |
| WP2.6 | Runtime shell refactor | Replace menu-first with persona→workspace in web |

### 5.3 Migration from current web

| Current | Target | Strategy |
| --- | --- | --- |
| `RuntimeAppShell` menu sidebar | Workspace panels | Evolve, not replace shell |
| Hardcoded dashboard metrics | Experience metadata cards | WP2.2 |
| `MenuDesigner` primary nav | Secondary within workspace | Deprecate gradually |
| `PermissionGate` visibility | Persona capability map | WP2.1 |

### 5.4 Phase 2 release

`v0.5.0-experience` — persona login shows different workspace per role.

---

## 6. Phase 3 — Migration Plan (TunasFlow Runtime)

### 6.1 Prerequisites

- Phase 2 experience shell
- Event bus operational (Phase 1)

### 6.2 Evolution from existing engines

| Existing | TunasFlow target | Migration |
| --- | --- | --- |
| `WorkflowEngine` | Full state machine runtime | Execute compiled transitions |
| `ProcessEngine` | Human task orchestration | Execute steps, not READY stubs |
| `EventEngine` | Flow triggers | Subscribe → start workflow |
| `appRouting` concept | Flow-based routing | Navigation from workflow state |

### 6.3 Work packages

| WP | Deliverables |
| --- | --- |
| WP3.1 | TunasFlow state machine executor |
| WP3.2 | Approval runtime (multi-actor) |
| WP3.3 | Automation executor (system tasks) |
| WP3.4 | SLA + timer foundation |
| WP3.5 | Flow trigger from event bus |

### 6.4 Phase 3 release

`v0.6.0-tunasflow` — ASSET_MAINTENANCE demo runs approval flow end-to-end via TunasFlow.

---

## 7. Phase 4 — Migration Plan (REDI Studio Integration)

### 7.1 Prerequisites

- Phase 1 metadata registry stable
- Phase 3 workflow publish format stable (for flow builder)

### 7.2 Key migration: Studio persistence

```text
CURRENT:  studio/metadata-store.ts → localStorage
TARGET:   studio/ → DesignerClient → Mongo metadata_definitions
BRIDGE:   studio/adapters/ + dual-write (see REFACTOR_PLAN §4.5)
```

### 7.3 Work packages

| WP | Deliverables |
| --- | --- |
| WP4.1 | Metadata type adapter (studio → shared) |
| WP4.2 | Studio save/publish via API |
| WP4.3 | Query builder → query metadata in registry |
| WP4.4 | API builder → connector metadata in registry |
| WP4.5 | Flow builder → TunasFlow metadata |
| WP4.6 | Report + dashboard builders |
| WP4.7 | Persona-gated studio modes (Admin vs Programmer) |
| WP4.8 | Retire localStorage as primary (flag flip) |

### 7.4 Preserve (no redesign)

- `BuilderShell`, `Canvas`, `PropertyPanel`, `ComponentPanel`
- Metadata designer pages
- Query builder visual UI

### 7.5 Phase 4 release

`v0.7.0-studio` — create app → publish → runtime via kernel API only.

---

## 8. Phase 5 — Migration Plan (Capability Package Engine)

### 8.1 Module extraction order

Install capabilities in dependency order:

```text
1. master-data          (foundation objects)
2. integration          (connector framework)
3. inventory-wms        (depends: master-data)
4. engineering-cmms     (depends: inventory, integration/TunasIoT)
5. production-mes       (depends: inventory, cmms)
6. quality-qms          (depends: production, inventory)
7. finance              (depends: inventory, events)
8. procurement          (depends: finance, inventory)
9. itsm                 (depends: integration/TunasNOC)
10. hr-ga               (depends: master-data)
11. isp-operation       (depends: itsm, integration/ISP-Kita)
12. project             (depends: hr-ga, finance)
```

### 8.2 Package structure (per module)

```text
packages/capabilities/{module}/
├── package.json
├── manifest.json
├── metadata/
├── workflow/
├── experience/
├── security/
├── integration/
└── seed/
```

### 8.3 Evolution from current `modules/`

| Current | Target |
| --- | --- |
| `modules/finance/README.md` | `packages/capabilities/finance/` installable package |
| `capability_definitions` seed | Loaded from package manifest |
| No handlers | `capability/handlers/` per DOMAIN_MODULE_CONTRACT |

### 8.4 Work packages

| WP | Deliverables |
| --- | --- |
| WP5.1 | Package manifest schema |
| WP5.2 | Module loader + dependency resolver |
| WP5.3 | Installer (tenant-scoped) |
| WP5.4 | Template engine (enable module set) |
| WP5.5 | First package: `master-data` |

### 8.5 Phase 5 release

`v0.8.0-packages` — install master-data package on DEFAULT tenant via CLI/API.

---

## 9. Phase 6 — Migration Plan (Integration Hub)

### 9.1 Prerequisites

- Phase 5 package framework
- Event bus (Phase 1)

### 9.2 Connector rollout order

| Order | Connector | External system | Notes |
| --- | --- | --- | --- |
| 1 | REST generic | Any API | Extend existing adapters |
| 2 | Webhook | Inbound events | Exists partially |
| 3 | **TunasIoT** | Python platform | **Do not rebuild IoT** — connector only |
| 4 | MQTT | Industrial devices | Via hub, not REDI IoT module |
| 5 | TunasNOC | Monitoring | Event → ITSM flow |
| 6 | ISP-Kita | ISP operations | |
| 7 | SAP / Odoo | ERP | |
| 8 | Office365 | Productivity | |

### 9.3 Evolution from current `core/integration/`

| Existing | Target |
| --- | --- |
| `IntegrationEngine` | `integration.hub.ts` central router |
| `connectors/` API | `connector.registry.ts` |
| Inline event trigger | Hub → bus → connector runtime |

### 9.4 Phase 6 release

`v0.9.0-integration` — TunasIoT connector package installable; event from IoT creates runtime document.

---

## 10. Phase 7 — Migration Plan (Industrial Templates)

### 10.1 Template rollout order

Aligned with `PHASE_7_INDUSTRIAL_TEMPLATE.md` and manufacturing flow standard:

```text
1. Corporate Template      (finance, hr-ga, procurement)
2. Manufacturing Template  (master-data, WMS, MES, QMS, CMMS, TunasIoT)
3. ISP Operation Template  (customer, ticket, WO, ISP-Kita, TunasNOC)
4. ITSM Template           (incident, change, asset)
```

### 10.2 Template = package bundle, not code

```text
Install Manufacturing Template
      ↓
Enable: master-data + inventory-wms + production-mes + quality-qms + engineering-cmms
      ↓
Load metadata + workflow + experience + security from packages
      ↓
Activate TunasIoT connector (Phase 6)
      ↓
Runtime ready
```

### 10.3 Demo app migration

| Current | Target |
| --- | --- |
| `ASSET_MAINTENANCE` metadata seed | Becomes CMMS template seed inside package |
| `metadata-seed.records.ts` monolith | Split into package seeds |

### 10.4 Phase 7 release

`v1.0.0-industrial` — Manufacturing template installable; full material→production→QA flow demonstrable.

---

## 11. Module Extraction Map (Existing Code → Target Module)

| Existing code / concept | Target capability package | Phase |
| --- | --- | --- |
| `appProcess` → PROCESS/WORKFLOW metadata | All modules | ✅ Evolved |
| `ASSET_MAINTENANCE` seed (ASSET, WORK_ORDER) | `engineering-cmms` template | 7 |
| `CapabilityRegistry` finance/inventory contracts | `finance`, `inventory-wms` packages | 5–7 |
| `platform_users/roles` | `master-data` + kernel identity | 1 |
| `IntegrationEngine` + adapters | `integration` package | 5–6 |
| `studio/query` query builder | Studio publishes query metadata → `inventory-wms`, `finance` | 4 |
| Web `IdentityEngine` | Kernel identity (remove from web) | 1 |
| `studio_legacy_phase19/` | Extract utilities → retire | 2–4 |
| `builder/WorkflowBuilder` | Studio flow builder (reroute) | 4 |

---

## 12. Release Train Overview

```text
2026 Q2  Phase 0 complete (this document set)
2026 Q2  Phase 1 sprints → v0.2–v0.4 kernel releases
2026 Q3  Phase 2 → v0.5 experience
2026 Q3  Phase 3 → v0.6 tunasflow
2026 Q4  Phase 4 → v0.7 studio integration
2027 Q1  Phase 5 → v0.8 packages
2027 Q2  Phase 6 → v0.9 integration (TunasIoT)
2027 Q3  Phase 7 → v1.0 industrial templates
2027 Q4  Phase 8 → AI layer (roadmap)
```

*Dates are planning estimates — require human approval.*

---

## 13. Acceptance Test Migration

### Current demo path (preserve during migration)

```text
ASSET_MAINTENANCE seed
      ↓
POST /runtime-package/compile
      ↓
POST /runtime/object/ASSET (with headers)
      ↓
Action pipeline executes
```

### Target demo path (Phase 4+)

```text
Install CMMS template package
      ↓
REDI Studio publishes form/workflow (via API)
      ↓
Login JWT → runtime
      ↓
Persona workspace → create Work Order
      ↓
TunasFlow approval → event → notification
```

### Acceptance test from Phase 1 doc

Must pass with JWT (not manual headers) before Phase 1 sign-off.

---

## 14. Rollback Strategy

| Phase | Rollback |
| --- | --- |
| Phase 1 JWT | `AUTH_MODE=header` env flag reverts to current behavior |
| Phase 1 cache | Disable cache; resolver hits Mongo directly |
| Phase 4 studio bridge | `STUDIO_PERSISTENCE=local` reverts to localStorage |
| Phase 5+ packages | Uninstall package API removes metadata scope |

No database destructive migrations in Phase 1 — additive collections and fields only.

---

## 15. Human Approval Gates

| Gate | Before proceeding to |
| --- | --- |
| G0 | Phase 0 docs approved | Phase 1 Sprint 1 |
| G1 | Phase 1 acceptance pass | Phase 2 |
| G2 | Persona model approved | Phase 2 implementation |
| G3 | TunasFlow state model approved | Phase 3 |
| G4 | Studio API bridge tested | Phase 4 flag flip |
| G5 | Package manifest approved | Phase 5 |
| G6 | TunasIoT connector spec approved | Phase 6 |
| G7 | Manufacturing template scope approved | Phase 7 |

---

## 16. References

- [CURRENT_ARCHITECTURE.md](./CURRENT_ARCHITECTURE.md)
- [GAP_ANALYSIS.md](./GAP_ANALYSIS.md)
- [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)
- `docs/phase/PHASE_DEVELOPMENT_ROADMAP.md`
- `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md`
