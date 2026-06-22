# CURRENT_ARCHITECTURE.md

Status: Phase 0 Deliverable  
Version: 1.0  
Date: 2026-06-16  
Scope: Repository snapshot at audit time — no code modified

---

## 1. Executive Summary

REDI-OS Platform is a **npm workspaces monorepo** with three applications and four shared packages. The backend (`apps/api`) implements a **metadata-driven runtime kernel** on NestJS + MongoDB. The frontend (`apps/web`) implements a **dual-path studio and runtime** — one path uses localStorage metadata, another uses the kernel API.

The codebase is **not greenfield**. It contains substantial kernel work (runtime executor, metadata resolver/validator, compiler) plus a forward-looking Studio UI that is **ahead of the official phase gate** but **not fully integrated** with the kernel registry.

---

## 2. Repository Topology

```text
RediOS-Platform/
├── apps/
│   ├── api/          NestJS runtime kernel API (151 .ts files)
│   ├── web/          React studio + runtime + auth (160 .ts/.tsx files)
│   └── mobile/       Early mobile shell (minimal)
├── packages/
│   ├── shared/                 Metadata & runtime contracts (34 files)
│   ├── runtime-renderer-core/  Renderer tree, binding, experience (9 files)
│   ├── engine-sdk/             Placeholder (empty export)
│   └── ui-schema/              Experience / atomic component schema
├── modules/          Business capability placeholders (README only)
├── docs/
│   ├── architecture/   Blueprint v3 (active)
│   ├── phase/          Phase 0–7 documents (active)
│   ├── analysis/       Phase 0 outputs (this folder)
│   └── archive/        Historical docs (ignored for decisions)
├── .cursorrules        AI governance v3.0
└── README.md           Platform vision v3.0
```

### Workspace dependencies

```text
apps/api      → @redios/shared
apps/web      → @redios/shared, @redios/runtime-renderer-core
apps/mobile   → (minimal)
```

---

## 3. API Architecture (`apps/api/src`)

### 3.1 Layer model

```text
HTTP Controllers (runtime/, designer/, metadata/, platform/, …)
        ↓
ContextEngine (header → RuntimeContext)
        ↓
Domain Services (RuntimeService, DesignerService, …)
        ↓
Core Engines (metadata, runtime, security, event, workflow, …)
        ↓
Providers (MongoMetadataProvider, MongoDBStorageProvider)
        ↓
MongoDB Collections
```

### 3.2 Core kernel (`apps/api/src/core/`)

| Folder | Primary files | Responsibility |
| --- | --- | --- |
| `context/` | `context.engine.ts` | Build `RuntimeContext` from HTTP headers |
| `metadata/` | `metadata-resolver.service.ts`, `metadata-registry.service.ts`, `metadata-validator-engine.service.ts`, `providers/mongo-metadata.provider.ts` | Load, resolve, validate, persist metadata definitions |
| `compiler/` | `runtime-compiler.service.ts`, `runtime-package-provider.service.ts` | Compile metadata → `RUNTIME_PACKAGE` with checksum |
| `runtime/` | `runtime-executor.service.ts` | Universal CRUD + action orchestration pipeline |
| `security/` | `security-engine.service.ts` | Context validation + RBAC permission checks |
| `security-policy/` | `security-policy-engine.service.ts` | Metadata-driven ABAC policies, field masking |
| `action/` | `action-engine.service.ts` | Resolve and prepare actions from metadata |
| `workflow/` | `workflow-engine.service.ts` | Initial state + transition validation |
| `process/` | `process-engine.service.ts` | Process step planning (returns READY plans) |
| `business/` | `business-engine.service.ts` | Execute embedded business rules (2 types) |
| `event/` | `event-engine.service.ts` | Publish events → trigger integrations |
| `storage/` | `storage.engine.ts`, `providers/mongodb-storage.provider.ts` | Tenant-scoped runtime document CRUD |
| `integration/` | `integration-engine.service.ts`, adapters | HTTP/webhook connector execution |
| `ledger/` | `ledger-engine.service.ts` | Ledger impact planning |
| `trace/` | `trace-engine.service.ts` | Runtime execution traces |
| `designer/` | `designer-engine.service.ts` (~1,927 lines) | Draft/preview/publish metadata (Studio API) |
| `experience/` | `experience-engine.service.ts` | Experience metadata resolution |
| `form/`, `ui/`, `theme/`, `navigation/` | Various engines | Compose UI metadata at runtime |
| `query/`, `relation/`, `dependency/` | Engines + graph | Query, relations, dependency validation |
| `conflict/`, `sync/` | Engines | Offline sync conflict handling |
| `simulation/` | `simulation-engine.service.ts` | Metadata simulation |

**Absent from kernel:** `core/identity/`, `core/rule/`, `core/registry/` (as named in Phase 1 doc).

### 3.3 Platform layer (`apps/api/src/platform/`)

| Path | Role |
| --- | --- |
| `domain/schemas/` | Mongo schemas: `platform_tenants`, `platform_users`, `platform_roles`, `platform_applications` |
| `capability/` | `CapabilityRegistry` + `GET /api/capabilities` |
| `extension/schemas/` | `custom_field_definitions`, `custom_field_values` |
| `password.util.ts` | Demo password hashing for platform seed |

No platform domain **services** (login, user management API) exist yet — schemas and seed only.

### 3.4 HTTP API surface

| Module | Prefix | Kernel connection |
| --- | --- | --- |
| `runtime/` | `/api/runtime` | `RuntimeExecutor` — dynamic object CRUD + actions |
| `runtime-package/` | `/api/runtime-package` | `RuntimeCompiler` — compile + get active package |
| `metadata/` | `/api/metadata` | Debug inventory + validation |
| `designer/` | `/api/designer` | `DesignerEngine` — draft/preview/publish |
| `security-policy/` | `/api/security-policy` | Policy evaluate/simulate |
| `integrations/`, `connectors/` | `/api/integrations`, `/api/connectors` | Integration hub surface |
| `platform/capability/` | `/api/capabilities` | Capability catalog |
| `health/` | `/api/health` | Health check |

**No auth/login controller** exists. All runtime endpoints expect trusted headers documented in Swagger (`x-tenant-id`, `x-user-id`, etc.).

### 3.5 MongoDB collections (observed)

| Collection | Owner | Purpose |
| --- | --- | --- |
| `metadata_definitions` | Metadata engine | All metadata types (ENTITY, ACTION, WORKFLOW, …) |
| `runtime_documents` | Storage engine | Generic business record storage |
| `runtime_packages` | Compiler | Compiled application packages |
| `runtime_traces` | Trace engine | Execution audit trail |
| `platform_tenants` | Platform seed | Domain tenant |
| `platform_users` | Platform seed | Domain admin user |
| `platform_roles` | Platform seed | Role + permission seed |
| `platform_applications` | Platform seed | REDIOS_STUDIO, REDIOS_ADMIN |
| `capability_definitions` | Capability registry | Capability contracts |
| `custom_field_definitions` | Extension | Power-user custom fields |
| `custom_field_values` | Extension | Custom field values |
| `metadata_versions` | Designer | Draft version history |
| `sync_conflicts` | Conflict engine | Offline sync conflicts |

### 3.6 Seed pipeline (`apps/api/src/seed/`)

| Runner | Entry | Output |
| --- | --- | --- |
| `PlatformSeedRunner` | `platform-main.ts` | Tenant DEFAULT, admin user, roles, apps, 19 capabilities |
| `MetadataSeedRunner` | `main.ts` (combined) | Demo app `ASSET_MAINTENANCE` with ASSET + WORK_ORDER |
| Combined | `main.ts` | Platform seed then metadata seed |

Compile is **not** automatic after seed — requires `POST /api/runtime-package/compile` or designer publish.

---

## 4. Web Architecture (`apps/web/src`)

### 4.1 Routing (`App.tsx`)

| Route | Component | Data source |
| --- | --- | --- |
| `/studio/*` | `StudioPage` | localStorage (`metadata-store`) |
| `/login`, `/register`, `/profile` | Auth pages | Client `IdentityEngine` |
| `/apps/:slug` | `RuntimeAppShell` | Published localStorage package |
| `/` (default) | `RuntimePage` | Kernel API + `runtime-renderer-core` |

### 4.2 Three parallel paths (critical)

```text
PATH A — Active Studio (local)
  studio/BuilderShell → metadata-store (localStorage) → RuntimeAppShell

PATH B — API Studio (dormant)
  builder/* + DesignerClient → Kernel /api/designer (no active route)

PATH C — Kernel Runtime
  RuntimePage → metadata-client → RuntimeRenderer → runtime-renderer-core
```

### 4.3 Studio active (`studio/` — 28 files)

| Area | Key files | Behavior |
| --- | --- | --- |
| Visual builder | `builder/BuilderShell.tsx`, `Canvas/`, `PropertyPanel/` | Drag/drop canvas, web/android targets, publish |
| Metadata designers | `metadata/MetadataDesignerPage.tsx`, `data/`, `actions/`, `menu/`, `security/`, `process/` | Application-scoped metadata editing |
| Query builder | `query/QueryBuilderPage.tsx` | Visual query + SQL import |
| API builder | `api/ApiBuilderPage.tsx` | Endpoint binding from query/data/connector |
| Create app | `create/CreateApplicationPage.tsx` | Application wizard |
| Identity seed | `metadata/identity/identity-metadata.ts` | REDIOS_ADMIN system app metadata |

Persistence: **`studio/metadata/metadata-store.ts`** — parallel type system, not `@redios/shared` registry.

### 4.4 Studio legacy (`studio_legacy_phase19/` — 68 files)

Archived per `studio_legacy_phase19/legacy/README.md`. **Not routed** from `StudioPage`.

Still imported by ~10 active files (EmptyState, HumanizerEngine, MetadataEditor, ApplicationExplorer, etc.).

### 4.5 Builder orphan layer (`builder/` — 17 files)

API-connected designers using `DesignerClient` and `@redios/shared` types:

- `form/VisualFormBuilder.tsx`
- `workflow/WorkflowBuilder.tsx`
- `entity/EntityBuilder.tsx`
- `integration/IntegrationBuilder.tsx`

**Not wired to current studio routes** — superseded by localStorage studio path.

### 4.6 Runtime (`runtime/` + `pages/`)

| File | Role |
| --- | --- |
| `RuntimeAppShell.tsx` | Published app shell — TailAdmin dashboard, menu nav, canvas render |
| `RuntimePageRenderer.tsx` | Bridge to `core/renderer/runtime-renderer.tsx` |
| `runtime-record-store.ts` | localStorage CRUD for demo objects |
| `pages/RuntimePage.tsx` | Kernel-connected runtime entry |

### 4.7 Auth & identity

| File | Role |
| --- | --- |
| `auth/` | Login/register/profile UI, `AuthProvider` |
| `identity/identity-engine.ts` | Client-side session, password hash, USER CRUD via localStorage |

Identity is **web-local**, not kernel `Identity Engine`.

### 4.8 Core glue (`core/`)

| Path | Role |
| --- | --- |
| `api/designer-client.ts` | Designer API client (used by dormant builder/) |
| `api/metadata-client.ts` | Kernel metadata debug client |
| `metadata-client/metadata-client.ts` | Runtime-facing client (different API shape) |
| `renderer/runtime-renderer.tsx` | Uses `generateRuntimeTree` from renderer-core |
| `security/PermissionGate.tsx` | UI visibility gate |
| `context/runtime-context.tsx` | Runtime context provider |

**Note:** Two `MetadataClient` implementations with different APIs.

---

## 5. Shared Packages

### 5.1 `@redios/shared` (34 exports)

Metadata contracts: application, entity, field, action, workflow, process, business, event, security-policy, form, ui, view, navigation, theme, experience, integration, sync, conflict, relation, dependency, ledger, designer, capability, platform-domain, custom-field.

Runtime contracts: `RuntimeContext`, `RuntimeDocument`, `RuntimePackage`, `RuntimeTrace`.

Generic: `EngineInterface`, metadata validation/simulation helpers.

**Gap:** `MetadataType` includes `'RULE'` and `'REPORT'` but no dedicated definition files.

### 5.2 `@redios/runtime-renderer-core` (9 files)

| Module | Used by web? |
| --- | --- |
| `renderer/renderer-tree.ts` | ✅ `RuntimePage` path |
| `experience/experience-resolver.ts` | ✅ `RuntimePage` |
| `binding/binding-engine.ts` | ✅ atoms |
| `action/action-resolver.ts` | ✅ atoms |
| `platform/platform-adapter.ts` | ❌ web uses custom React registry |

`RuntimeAppShell` does **not** use renderer-core — custom TailAdmin/canvas path.

---

## 6. Modules (`modules/`)

Placeholder only:

| Module | Content |
| --- | --- |
| `modules/finance/README.md` | Capability contract list (JOURNAL.POST, etc.) |
| `modules/inventory/README.md` | Capability contract list (PRODUCT.CREATE, etc.) |
| `modules/README.md` | Layer pattern guideline |

No `domain/`, `application/`, `infrastructure/`, or `capability/handlers/` code.

---

## 7. REDI Core DNA Mapping

### 7.1 appProcess → Metadata Engine

| Legacy concept | Current implementation |
| --- | --- |
| `appProcess` (business process config) | `PROCESS` + `WORKFLOW` metadata types; `ProcessEngine` + `WorkflowEngine` in API |
| Location in code | `apps/api/src/core/process/`, `core/workflow/`, seed `metadata-seed.records.ts` |
| Migration status | **Functional evolution complete** — no `appProcess` symbol in source; behavior lives in metadata |

### 7.2 appRouting → TunasFlow / Runtime Routing

| Legacy concept | Current implementation |
| --- | --- |
| `appRouting` (dynamic route config) | `NAVIGATION` metadata + `NavigationEngine`; web menu from `MenuDesigner` |
| Workflow routing | `WorkflowEngine` transition map (partial — still resolves live metadata) |
| Migration status | **Partial** — menu-first routing exists; TunasFlow runtime (Phase 3) not complete |

### 7.3 domainCode → Business Context Engine

| Legacy concept | Current implementation |
| --- | --- |
| `domainCode` | Field on `RuntimeContext`, metadata definitions, storage scope |
| Tenant separation | `tenantId` + `domainCode` on metadata and `runtime_documents` |
| Context resolution | `ContextEngine` reads headers — **not JWT-derived** |
| Migration status | **Partial** — scoping exists; trust model not production-ready |

---

## 8. Data Flow Diagrams

### 8.1 Kernel runtime request (Path C)

```text
HTTP Request
  + headers (x-tenant-id, x-user-id, x-application-code, …)
      ↓
ContextEngine.resolve()
      ↓
RuntimeController → RuntimeService
      ↓
RuntimeExecutor
  ├── SecurityEngine (permission check)
  ├── SecurityPolicyEngine (ABAC + field mask)
  ├── RuntimePackageProvider (compiled entity/fields) OR MetadataResolver (fallback)
  ├── ActionEngine → WorkflowEngine → ProcessEngine → BusinessEngine
  ├── EventEngine → IntegrationEngine
  ├── LedgerEngine
  └── StorageEngine → MongoDB runtime_documents
      ↓
Response + RuntimeTrace
```

### 8.2 Studio publish flow (Path A)

```text
System Analyst edits in studio/
      ↓
metadata-store.ts → localStorage
      ↓
BuilderShell.publishApplicationPackage()
      ↓
RuntimeAppShell loads package by slug (/apps/:slug)
      ↓
Custom canvas render (NOT kernel RuntimeExecutor)
```

### 8.3 Designer API flow (Path B — dormant)

```text
builder/VisualFormBuilder (or legacy studio)
      ↓
DesignerClient → POST /api/designer/*
      ↓
DesignerEngine → MongoMetadataProvider
      ↓
Optional: RuntimeCompiler.compile()
```

### 8.4 Metadata compile flow

```text
Metadata definitions (Mongo)
      ↓
MetadataValidatorEngine.validateAll()
      ↓
RuntimeCompiler.compile()
      ↓
RUNTIME_PACKAGE (versioned, checksum, expires previous)
      ↓
RuntimeExecutor prefers compiled package for entity/fields
```

---

## 9. Dependency Map

### 9.1 API module wiring (`app.module.ts`)

```text
AppModule
├── MongooseModule (MongoDB)
├── ContextModule
├── MetadataModule ──────────┐
├── CoreCompilerModule       │
├── CoreRuntimeModule ◄──────┤ orchestration chain
├── SecurityModule           │
├── SecurityPolicyModule     │
├── ActionModule             │
├── WorkflowModule           │
├── ProcessModule            │
├── BusinessModule           │
├── EventModule              │
├── IntegrationModule        │
├── StorageModule ───────────┘
├── PlatformModule
├── RuntimeApiModule (HTTP)
├── DesignerModule (HTTP)
├── MetadataDebugModule (HTTP)
└── … (experience, navigation, sync, simulation, etc.)
```

### 9.2 Web dependency graph (simplified)

```text
App.tsx
├── auth/AuthProvider → identity/identity-engine.ts
├── studio/StudioPage → metadata-store (localStorage)
│   └── builder/BuilderShell → runtime/RuntimeAppShell (publish)
├── pages/RuntimePage → core/metadata-client + core/renderer
│   └── @redios/runtime-renderer-core
└── studio_legacy_phase19/* (transitive imports)
```

### 9.3 Cross-cutting couplings

| From | To | Risk |
| --- | --- | --- |
| `studio/metadata-store` | localStorage | Not kernel source of truth |
| `identity-engine` | `runtime-record-store` | Duplicates kernel identity |
| `RuntimeAppShell` | TailAdmin templates | Hardcoded dashboard blocks |
| `builder/` | `studio_legacy_phase19/` | Legacy coupling |
| `ContextEngine` | HTTP headers | No server auth verification |

---

## 10. Authentication & Authorization (Current State)

| Concern | Implementation | Production ready? |
| --- | --- | --- |
| Login | Web `IdentityEngine` + localStorage session | ❌ |
| Server auth | None | ❌ |
| Tenant context | Header `x-tenant-id` | ❌ (trust model) |
| RBAC | `context.permissions` string array from headers | 🟡 |
| ABAC | `SecurityPolicyEngine` on metadata policies | 🟡 |
| Field security | Read masking via security policy | ✅ (metadata-driven) |
| Platform user seed | `platform_users` collection | 🟡 (seed only) |

---

## 10. Largest Files (Complexity Hotspots)

| File | Lines | Area |
| --- | --- | --- |
| `metadata-validator-engine.service.ts` | ~2,379 | API metadata validation |
| `designer-engine.service.ts` | ~1,927 | API designer |
| `metadata-seed.records.ts` | ~1,875 | Seed data |
| `BuilderShell.tsx` | ~1,785 | Web studio |
| `Canvas.tsx` | ~1,319 | Web builder |
| `VisualFormBuilder.tsx` | ~1,209 | Web builder (dormant) |
| `runtime-executor.service.ts` | ~399 | API runtime |

---

## 11. Integration Readiness (Current)

| Target | Status | Location |
| --- | --- | --- |
| REST / Webhook | 🟡 Partial | `core/integration/adapters/` |
| TunasIoT | ❌ No connector | Must use Integration Hub (Phase 6) |
| MQTT / PLC / SCADA | ❌ | Phase 6 |
| SAP / Odoo / Office365 | ❌ | Phase 6 |
| ISP-Kita / TunasNOC | ❌ | Phase 6 |

Per `.cursorrules`: **Do not build IoT module inside REDI** — connect via Integration Hub to existing TunasIoT Python platform.

---

## 12. Document References

- Blueprint: `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md`
- Phase roadmap: `docs/phase/PHASE_DEVELOPMENT_ROADMAP.md`
- Gap analysis: [GAP_ANALYSIS.md](./GAP_ANALYSIS.md)
- Refactor plan: [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)
