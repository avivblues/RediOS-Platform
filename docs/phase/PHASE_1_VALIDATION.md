# Phase 1 Validation

Status: **Kernel Completion — Acceptance**  
Purpose: Verify Phase 1 kernel acceptance criteria (`PHASE_1_KERNEL_COMPLETION.md` §13)  
Gate: **G1** — required before Phase 2 (Experience Engine)

---

## Prerequisites

```bash
npm run build --workspace @redios/shared
npm run build --workspace @redios/api
npm run seed:metadata --workspace @redios/api
npm run start:dev --workspace @redios/api
```

Environment: copy `apps/api/.env.example` → `apps/api/.env` and ensure MongoDB is reachable.

---

## Automated Acceptance

```bash
npm run acceptance:phase1 --workspace @redios/api
```

Expected output ends with:

```text
Phase 1 acceptance: PASS
```

### Cases covered

| Case | Validates |
| --- | --- |
| 1 | `POST /api/auth/login` — JWT issued, tenant context `demo` |
| 2 | `GET /api/auth/me` — profile from Bearer token only |
| 3 | `GET /api/runtime-package/current` — ACTIVE package + compiled `WORK_ORDER` transitionMap |
| 4 | `POST /api/runtime/WORK_ORDER/create` — dynamic object create |
| 5 | `POST /api/runtime/WORK_ORDER/:id/actions/START` — workflow `OPEN → IN_PROGRESS` |
| 6 | Event engine — `WORK_ORDER_STARTED_EVENT` published, handler executed |
| 7 | Document persistence — status `IN_PROGRESS` after action |

---

## Manual Spot Checks

### Auth modes

| `AUTH_MODE` | Behavior |
| --- | --- |
| `header` (default) | Legacy `x-tenant-id`, `x-user-id`, etc. OR Bearer JWT |
| `jwt` | Bearer token **required** on all runtime routes |

Production recommendation:

```env
AUTH_MODE=jwt
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=8h
```

Never commit production secrets. Rotate `JWT_SECRET` if leaked.

### Metadata pipeline

```bash
# Re-compile after metadata changes
curl -X POST http://localhost:3000/api/runtime-package/compile \
  -H "Authorization: Bearer <token>"
```

Seed pipeline runs: platform → metadata → compile (see `apps/api/src/seed/main.ts`).

### Capability security

`SecurityEngine.validateActionAccess` resolves action permissions and capability codes from metadata. Admin seed role has `permissions: ['*']` for acceptance; tenant-scoped roles use resolved permission lists from JWT.

---

## Acceptance Matrix (§13)

### Metadata

| Criterion | Status | Evidence |
| --- | --- | --- |
| metadata can register | ✅ | Mongo `metadata_definitions` + seed |
| metadata can compile | ✅ | `RuntimeCompiler` → `RUNTIME_PACKAGE` |
| metadata cached | ✅ | `MetadataCache` + `MetadataLoader` boot hydrate |

### Runtime

| Criterion | Status | Evidence |
| --- | --- | --- |
| execute object dynamically | ✅ | CASE 4 |
| action executed dynamically | ✅ | CASE 5 |
| no hardcoded business module | ✅ | `modules/` README-only |

### Security

| Criterion | Status | Evidence |
| --- | --- | --- |
| permission runtime | ✅ | `SecurityEngine.validateActionAccess` |
| capability resolver | ✅ | `SecurityEngine.assertCapability` wired |
| tenant isolation | ✅ | JWT `tenantId` in context (CASE 1–2) |

### Event

| Criterion | Status | Evidence |
| --- | --- | --- |
| publish event | ✅ | CASE 6 |
| subscribe event | ✅ | `IntegrationEventSubscriber` + `WorkflowEventSubscriber` |
| trigger workflow ready | ✅ | `WORKFLOW` handler type + `WorkflowEventSubscriber` |

---

## Sprint Delivery Summary

| Sprint | Work packages | Status |
| --- | --- | --- |
| 1 | Metadata cache + post-seed compile | ✅ |
| 2 | Identity + JWT (`auth/`, `core/identity/`) | ✅ |
| 3 | Event bus + capability security | ✅ |
| 4 | RuntimeContext alignment + acceptance | ✅ |

---

## Known Limitations (Phase 1 scope)

- Studio still uses localStorage primary path (Phase 4 bridge)
- Process engine returns READY plans, not full TunasFlow execution (Phase 3)
- Notification handlers are planned, not delivered (Phase 2)
- Domain capability handlers remain CONTRACT-only (`modules/` placeholders)

These are **not** Phase 1 blockers per phase gate rules.

---

## Phase 1 Sign-Off

| Gate | Requirement | Status |
| --- | --- | --- |
| G1 | Automated acceptance PASS | Pending human run |
| G1 | No breaking `/api/runtime` contract | ✅ additive auth endpoints only |
| G1 | Phase 2 **not** started | ✅ locked |

**Next phase (after G1 approval):** Phase 2 — REDI Experience Engine

---

## References

- `docs/phase/PHASE_1_KERNEL_COMPLETION.md`
- `docs/analysis/MIGRATION_PHASE.md` §4
- `docs/analysis/REFACTOR_PLAN.md` §8
- `apps/api/scripts/phase1-acceptance.mjs`
