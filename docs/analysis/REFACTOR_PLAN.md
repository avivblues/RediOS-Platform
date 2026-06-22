# REFACTOR_PLAN.md

Status: Phase 0 Deliverable  
Version: 1.0  
Date: 2026-06-16  
Principle: **Evolve, not rebuild** — per `.cursorrules` and Phase 0 golden rules

---

## 1. Purpose

This document defines **how** to close gaps identified in [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) without losing existing business logic, breaking API contracts, or rewriting working engines.

All refactor work requires **human approval** before implementation.

---

## 2. Refactor Principles

| # | Principle | Source |
| --- | --- | --- |
| R1 | Extend existing engines; do not duplicate | `.cursorrules` KERNEL FIRST |
| R2 | Metadata changes over source code changes | Blueprint v3 |
| R3 | Phase document wins on scope conflict | `.cursorrules` PHASE LOCKING |
| R4 | Preserve Studio UI — redirect persistence, not redesign | Phase 4 golden rule |
| R5 | No delete without analysis and migration path | Phase 0 |
| R6 | No breaking `/api/runtime` contract during Phase 1 | Phase 0 |
| R7 | Identity moves to API; web becomes thin client | Phase 1 §10 |

---

## 3. Refactor Priority Matrix

| Priority | Area | Strategy | Risk | Effort |
| --- | --- | --- | --- | --- |
| **P0** | Identity + JWT context | Add `core/identity/` + auth module; evolve `ContextEngine` | Medium | Medium |
| **P0** | Tenant trust model | JWT claims replace header trust; headers become internal only | High if rushed | Medium |
| **P1** | Metadata cache/loader | Add services alongside existing provider; boot hydrate | Low | Small |
| **P1** | Post-seed compile | Add compile step to seed runner | Low | Small |
| **P1** | Event bus | Add bus module; evolve `EventEngine` to publish through bus | Medium | Medium |
| **P1** | Capability security wire | Inject `CapabilityRegistry` into security/action path | Low | Small |
| **P2** | Studio → kernel bridge | Map `metadata-store` types to `@redios/shared`; route save via `DesignerClient` | Medium | Large |
| **P2** | Unify MetadataClient | Merge two web clients into one facade | Low | Small |
| **P2** | RuntimeContext alignment | Align web, shared, renderer-core context shapes | Low | Small |
| **P3** | Legacy studio decoupling | Extract shared utilities; remove legacy imports from active paths | Low | Medium |
| **P3** | RuntimeAppShell → renderer-core | Gradually adopt renderer-core for published apps | Medium | Large |
| **P4** | Compiled package full use | WorkflowEngine reads compiled transition map | Medium | Medium |
| **P4** | Process/Ledger execution | Execute READY plans instead of returning stubs | Medium | Medium |
| **P5** | Standalone Rule Engine | Extract from BusinessEngine; add `rule-definition.ts` | Medium | Medium |

---

## 4. Detailed Refactor Plans

### 4.1 P0 — Identity Engine + JWT Context

**Problem:** `ContextEngine` trusts `x-tenant-id` from frontend. Web `IdentityEngine` holds credentials in localStorage.

**Target state:**

```text
POST /api/auth/login
      ↓
Validate against platform_users (domain core)
      ↓
Issue JWT (tenantId, userId, roles, permissions)
      ↓
AuthGuard on /api/runtime/*
      ↓
ContextEngine.fromJwt(token) → RuntimeContext
```

**Evolution path (not rewrite):**

1. Add `apps/api/src/core/identity/` — `IdentityEngine`, `SessionService`, `JwtStrategy`
2. Add `apps/api/src/auth/` — `AuthController` (login, logout, refresh)
3. Evolve `context.engine.ts` — add `fromJwt()`; deprecate raw header trust behind feature flag
4. Evolve web `auth.api.ts` — call real login API
5. Evolve `IdentityEngine` — thin wrapper over API session; remove local password storage
6. Keep `platform_users` seed as domain core (already exists)

**Preserve:**

- `platform/domain/schemas/*`
- `platform-seed.records.ts`
- Web login/register UI (no redesign)
- Existing header path for dev/testing until JWT stable

**Risk:** Breaking existing API consumers that pass headers manually.  
**Mitigation:** Support both modes temporarily with `AUTH_MODE=header|jwt` env flag.

**Impact:** Enables Phase 1 tenant isolation acceptance; unblocks production runtime.

---

### 4.2 P1 — Metadata Cache + Loader

**Problem:** Every request resolves metadata from Mongo. No boot-time hydrate. Phase 1 requires cache.

**Target state:**

```text
App bootstrap
      ↓
MetadataLoader.loadAll(tenantScope)
      ↓
MetadataCache.set(compiled indexes)
      ↓
Request → MetadataResolver reads cache first → Mongo fallback
```

**Evolution path:**

1. Add `metadata.cache.ts` — in-memory Map keyed by tenant/app/type/code
2. Add `metadata.loader.ts` — boot hydrate from `MongoMetadataProvider`
3. Evolve `metadata-registry.service.ts` — add `register()`, `invalidate()`
4. Evolve `MetadataResolver` — cache-first lookup
5. Add compile-on-boot or post-seed compile in `seed/main.ts`

**Preserve:**

- `mongo-metadata.provider.ts` as source of truth
- `MetadataValidatorEngine` unchanged
- `RuntimeCompiler` unchanged

**Risk:** Stale cache after designer publish.  
**Mitigation:** Invalidate cache on `DesignerEngine.publish()` and `RuntimeCompiler.compile()`.

**Impact:** Performance + Phase 1 acceptance "metadata cached".

---

### 4.3 P1 — Event Bus Foundation

**Problem:** `EventEngine.publish()` runs integrations inline. No subscribe, no workflow trigger from events.

**Target state:**

```text
RuntimeExecutor / external
      ↓
EventBus.publish(EVENT_CODE, payload)
      ↓
EventSubscriberRegistry
  ├── IntegrationHandler
  ├── WorkflowTriggerHandler (Phase 3)
  └── NotificationHandler (Phase 2)
```

**Evolution path:**

1. Add `event.bus.ts`, `event.subscriber.ts` in `core/event/`
2. Evolve `EventEngine.publish()` — delegate to bus
3. Register existing integration trigger as first subscriber
4. Add handler execution (currently returns `READY` only)

**Preserve:**

- Existing event metadata format in `@redios/shared`
- `IntegrationEngine` as subscriber

**Risk:** Circular event loops.  
**Mitigation:** Event depth limit + idempotency key.

**Impact:** Phase 1 event acceptance; foundation for Phase 2 notifications and Phase 3 TunasFlow.

---

### 4.4 P1 — Capability → Security Wiring

**Problem:** `CapabilityRegistry` is catalog-only. Runtime security checks flat permission strings, not capability codes.

**Target state:**

```text
Button action metadata: capabilityCode = "JOURNAL.POST"
      ↓
ActionEngine resolves capability
      ↓
SecurityEngine.assertCapability(context, code)
      ↓
CapabilityRegistry → required permissions
```

**Evolution path:**

1. Add permission mapping to capability definitions (or role seed)
2. Evolve `SecurityEngine` — `assertCapability()` method
3. Evolve `ActionEngine` / `RuntimeExecutor` — resolve capability before execute
4. Keep `GET /api/capabilities` for Studio binding

**Preserve:**

- Existing `CapabilityRegistry` and seed records
- Existing RBAC permission strings on roles

**Risk:** Low — additive.

**Impact:** Closes architecture boundary between metadata actions and domain capabilities.

---

### 4.5 P2 — Studio → Kernel Registry Bridge

**Problem:** Active studio saves to `localStorage` via parallel types. Kernel compiler never sees studio output.

**Target state:**

```text
Studio save/publish
      ↓
Adapter: StudioType → MetadataDefinition (@redios/shared)
      ↓
DesignerClient.publish() OR MetadataProvider.saveMetadata()
      ↓
RuntimeCompiler.compile()
      ↓
Runtime reads compiled package (Path C becomes primary)
```

**Evolution path:**

1. Add `studio/adapters/metadata-adapter.ts` — map `StudioDataObject` → `EntityDefinition`, etc.
2. Evolve `BuilderShell.publish()` — dual-write: localStorage (dev) + API (when connected)
3. Feature flag `STUDIO_PERSISTENCE=api|local` default `local` until adapter tested
4. Gradually retire localStorage as primary

**Preserve:**

- All Studio UI components (BuilderShell, Canvas, PropertyPanel, designers)
- `metadata-store.ts` during transition (read fallback)

**Risk:** Data loss during migration; type mapping errors.  
**Mitigation:** Dual-write period; export/import tool from localStorage to API.

**Impact:** Closes D1/D2 architecture drift; makes Phase 4 real.

---

### 4.6 P2 — Unify Web Clients

**Problem:** `core/api/metadata-client.ts` and `core/metadata-client/metadata-client.ts` have different APIs. `redios-client.ts` unused.

**Evolution path:**

1. Create `core/api/platform-client.ts` facade
2. Deprecate duplicate; redirect imports
3. Remove dead `redios-client.ts` or wire it as facade entry

**Risk:** Low.  
**Impact:** Developer clarity.

---

### 4.7 P3 — Legacy Studio Decoupling

**Problem:** `studio_legacy_phase19/` (68 files) still imported by active code.

**Evolution path:**

1. Inventory 10 import sites (documented in CURRENT_ARCHITECTURE)
2. Copy needed utilities to `studio/shared/` or `components/`
3. Update imports
4. Mark legacy folder as frozen — no new imports

**Preserve:** Entire legacy folder until decoupling complete (no delete).

**Risk:** Low if incremental.  
**Impact:** Reduces maintenance confusion.

---

### 4.8 P3 — RuntimeAppShell → Renderer-Core

**Problem:** Published apps use custom TailAdmin render, not `runtime-renderer-core`.

**Evolution path:**

1. Map `CanvasComponent` → renderer tree nodes
2. Replace hardcoded dashboard with metadata-driven experience cards (Phase 2)
3. Use `generateRuntimeTree` in `RuntimeAppShell`

**Preserve:** TailAdmin styling via theme tokens, not component rewrite.

**Risk:** Medium — visual regression.  
**Impact:** Single render path; Phase 2 readiness.

**Defer:** Until Phase 2 Experience metadata exists.

---

### 4.9 P4 — Compiled Package End-to-End

**Problem:** `WorkflowEngine` re-reads Mongo per request though compiler builds `transitionMap`.

**Evolution path:**

1. Evolve `WorkflowEngine` — accept compiled package transition map
2. Evolve `RuntimeExecutor` — pass package to workflow/process engines
3. Fallback to live resolver if package stale

**Risk:** Low — fallback preserves behavior.  
**Impact:** Performance + compile value realization.

---

### 4.10 P5 — Standalone Rule Engine

**Problem:** `RULE` metadata type declared but no engine. Rules embedded in `BUSINESS` metadata.

**Evolution path:**

1. Add `packages/shared/src/rule-definition.ts`
2. Add `core/rule/rule-engine.service.ts`
3. Evolve `BusinessEngine` — delegate to RuleEngine
4. Migrate `BUSINESS` rules gradually

**Defer:** After Phase 1 core complete.

---

## 5. Explicit Non-Refactors (Do Not Touch in Phase 1)

| Area | Reason |
| --- | --- |
| Studio UI layout (Canvas, PropertyPanel, ComponentPanel) | Phase 4 approved UX |
| `metadata-validator-engine.service.ts` | Working; 2,379 lines of validation logic |
| `RuntimeExecutor` pipeline structure | Core asset |
| `ASSET_MAINTENANCE` seed data | Demo acceptance test |
| `studio_legacy_phase19/` deletion | Phase 0 forbids delete without migration |
| Business modules (`finance`, `inventory` handlers) | Phase 7 scope |
| IoT/MQTT inside REDI | `.cursorrules` — use Integration Hub |
| Menu designer removal | Defer to Phase 2 persona model |

---

## 6. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| RK1 | JWT migration breaks API tests | High | Medium | Dual auth mode env flag |
| RK2 | Studio API bridge data loss | Medium | High | Dual-write + export tool |
| RK3 | Cache staleness | Medium | Medium | Invalidate on publish/compile |
| RK4 | Event loop / duplicate handlers | Low | High | Depth limit + idempotency |
| RK5 | Phase creep (building Studio in Phase 1) | High | High | Strict phase gate in PR review |
| RK6 | Legacy import breakage | Low | Low | Incremental extraction |
| RK7 | Breaking `/api/runtime` contract | Low | Critical | Additive endpoints only in Phase 1 |

---

## 7. Impact Assessment

### 7.1 By stakeholder

| Stakeholder | Impact |
| --- | --- |
| System Analyst | Studio publish eventually hits real registry — more reliable runtime |
| Developer | Clearer client APIs; JWT standard auth |
| DevOps | Boot compile + cache changes startup behavior |
| End user | No visible change until Studio API bridge + Experience engine |

### 7.2 By component

| Component | Change level | Downtime |
| --- | --- | --- |
| `ContextEngine` | Evolve | None (flagged rollout) |
| `MetadataResolver` | Evolve | None |
| `EventEngine` | Evolve | None |
| Web `IdentityEngine` | Evolve → thin client | Re-login required once |
| `metadata-store` | Bridge, not delete | None during dual-write |
| `RuntimeAppShell` | Deferred Phase 2/3 | None in Phase 1 |

---

## 8. Success Metrics (Post-Refactor Phase 1)

| Metric | Target |
| --- | --- |
| Login via API JWT | Works for `admin@redios.local` |
| Runtime without manual headers | JWT bearer only |
| Metadata cache hit rate | >90% on resolve after boot |
| Post-seed compile | Automatic in seed pipeline |
| Event subscribe | At least 1 handler executed |
| Capability on action | `SecurityEngine.assertCapability` called |
| Zero deleted engine files | Count unchanged |
| Studio UI files deleted | 0 in Phase 1 |

---

## 9. Approval Checklist

Before starting Phase 1 implementation, human must approve:

- [ ] P0 Identity + JWT approach (dual auth flag)
- [ ] P1 Metadata cache strategy
- [ ] P1 Event bus design
- [ ] P2 Studio bridge timing (Phase 1 vs Phase 4)
- [ ] Legacy studio decoupling schedule
- [ ] Risk register acceptance

---

## 10. References

- [CURRENT_ARCHITECTURE.md](./CURRENT_ARCHITECTURE.md)
- [GAP_ANALYSIS.md](./GAP_ANALYSIS.md)
- [MIGRATION_PHASE.md](./MIGRATION_PHASE.md)
- `docs/phase/PHASE_1_KERNEL_COMPLETION.md`
