# GAP_ANALYSIS.md

Status: Phase 0 Deliverable  
Version: 1.0  
Date: 2026-06-16  
Compares: **Current repository** vs **REDIOS_PLATFORM_BLUEPRINT_v3** + **Phase Roadmap**

---

## 1. Summary Scorecard

| Phase | Official status | Code reality | Gap severity |
| --- | --- | --- | --- |
| Phase 0 | Required | **Complete** (this folder) | — |
| Phase 1 | ACTIVE | ~55–60% | **HIGH** — identity, cache, event subscribe |
| Phase 2 | PLANNED | ~5% | **HIGH** — persona/workspace missing |
| Phase 3 | PLANNED | ~20% | **MEDIUM** — workflow foundation only |
| Phase 4 | PLANNED | ~40% UI / ~15% kernel | **MEDIUM** — UI ahead, not integrated |
| Phase 5 | PLANNED | ~10% | **HIGH** |
| Phase 6 | PLANNED | ~25% | **MEDIUM** |
| Phase 7 | PLANNED | ~0% | **HIGH** (expected) |

**Overall platform maturity vs Blueprint v3: ~35%**

---

## 2. Blueprint v3 Layer Comparison

### 2.1 Platform stack

| Blueprint layer | Expected (v3) | Current state | Gap |
| --- | --- | --- | --- |
| AI Agent Layer | Production, Finance, Maintenance agents | Not implemented | ❌ Phase 8 |
| REDI Intelligence | Analytics + prediction | Not implemented | ❌ Phase 8 |
| REDI Studio | Metadata-driven builders → registry | UI exists; persists localStorage | 🟡 Phase 4 partial |
| Experience Runtime Engine | Persona → Workspace → Action | Menu → Form pattern | ❌ Phase 2 |
| TunasFlow Engine | Universal workflow + automation | Basic workflow/process engines | 🟡 Phase 3 partial |
| Universal Document Engine | BusinessDocument model | `runtime_documents` + entity metadata | 🟡 Partial |
| REDI Kernel | Identity, Metadata, Runtime, Security, Event, Rule | Runtime strong; Identity/Rule weak | 🟡 Phase 1 partial |
| Business Capability Modules | Installable packages | README placeholders only | ❌ Phase 5–7 |
| Integration Hub | Connector marketplace | Partial integration engine | 🟡 Phase 6 partial |

### 2.2 Kernel services (Blueprint §4)

| Kernel service | Blueprint requirement | Current | Gap |
| --- | --- | --- | --- |
| **Identity Engine** | Multi-tenant, org hierarchy, JWT context | Platform schemas + web client stub | **CRITICAL** — no server engine |
| **Metadata Engine** | Dynamic object/field/form/menu/action | Resolver + validator + Mongo provider | **MEDIUM** — no cache/loader |
| **Runtime Engine** | Execute metadata dynamically | `RuntimeExecutor` full pipeline | **LOW** — naming/structure differs |
| **Security Engine** | RBAC + ABAC + field level | Partial RBAC + policy engine | **HIGH** — header trust, no JWT |
| **Event Engine** | Publish/subscribe, trigger workflow | Publish + integration only | **HIGH** — no bus/subscribe |
| **Rule Engine** | Metadata rules, not hardcoded | Embedded in `BusinessEngine` (2 types) | **HIGH** — no standalone engine |
| **Workflow Foundation** | TunasFlow-ready | `WorkflowEngine` basic transitions | **MEDIUM** — not full TunasFlow |

---

## 3. Phase 1 — Kernel Completion Gap

Reference: `docs/phase/PHASE_1_KERNEL_COMPLETION.md`

### 3.1 Metadata Engine

| Phase 1 artifact | Required | Current | Status |
| --- | --- | --- | --- |
| `metadata.registry.ts` | Register definitions | `metadata-registry.service.ts` (read-only) | 🟡 |
| `metadata.repository.ts` | Persistence | `mongo-metadata.provider.ts` | ✅ (renamed) |
| `metadata.cache.ts` | In-memory cache | Missing | ❌ |
| `metadata.loader.ts` | Boot hydrate | Missing | ❌ |
| `metadata.types.ts` | Type consolidation | Types in `@redios/shared` | 🟡 |

**Acceptance: metadata cached** — only `RUNTIME_PACKAGE` in Mongo; no memory cache; compile not on boot.

### 3.2 Metadata Compiler

| Phase 1 artifact | Required | Current | Status |
| --- | --- | --- | --- |
| Split compilers (object, workflow, ui, security) | Separate files | Single `runtime-compiler.service.ts` | 🟡 |
| Boot compile | On startup | Manual `POST /runtime-package/compile` | ❌ |
| Projection provider | Runtime model projection | Noop stub | ❌ |

### 3.3 Runtime Executor

| Requirement | Current | Status |
| --- | --- | --- |
| Dynamic object CRUD | `RuntimeExecutor` create/read/update | ✅ |
| Dynamic action execution | `prepareAction` pipeline | ✅ |
| No hardcoded business modules | Generic entity pipeline | ✅ |
| Use compiled package end-to-end | Entity/fields only; workflow live resolve | 🟡 |

### 3.4 Security

| Requirement | Current | Status |
| --- | --- | --- |
| Permission runtime | Header-injected permissions | 🟡 |
| Capability resolver in security chain | `CapabilityRegistry` separate | ❌ |
| Tenant isolation | DB scope from context | 🟡 scope OK, trust wrong |
| JWT context (§10) | Header `x-tenant-id` | **❌ CRITICAL** |
| Document-level ABAC | Context attributes only | 🟡 |

### 3.5 Event Engine

| Phase 1 artifact | Required | Current | Status |
| --- | --- | --- | --- |
| `event.bus.ts` | Pub/sub bus | Missing | ❌ |
| `event.subscriber.ts` | Subscribe handlers | Missing | ❌ |
| `event.dispatcher.ts` | Dispatch | Missing | ❌ |
| `event.handler.ts` | Execute handlers | Returns `READY` plans only | 🟡 |
| Publish event | `EventEngine.publish` | ✅ |
| Subscribe event | — | ❌ |
| Trigger workflow from event | — | ❌ |

### 3.6 Identity

| Requirement | Current | Status |
| --- | --- | --- |
| `core/identity/` | Missing | ❌ |
| Login API | Missing | ❌ |
| JWT → ContextEngine | Missing | ❌ |
| Platform user service | Seed only | 🟡 |

### 3.7 Phase 1 acceptance matrix

| Criterion | Met? |
| --- | --- |
| Metadata can register | 🟡 Partial |
| Metadata can compile | ✅ |
| Metadata cached | 🟡 Partial |
| Execute object dynamically | ✅ |
| Action executed dynamically | ✅ |
| No hardcoded business module | ✅ |
| Permission runtime | 🟡 |
| Capability resolver | 🟡 Stub |
| Tenant isolation | ❌ Trust model |
| Publish event | ✅ |
| Subscribe event | ❌ |
| Trigger workflow ready | 🟡 |

**Phase 1 blockers:** Identity/JWT, metadata cache, event subscribe, capability-security wiring.

---

## 4. Phase 2 — Experience Engine Gap

Reference: `docs/phase/PHASE_2_EXPERIENCE_ENGINE.md`

| Capability | Blueprint / Phase 2 | Current | Gap |
| --- | --- | --- | --- |
| Persona Resolver | Login → persona → capabilities | Login → local session | ❌ |
| Workspace Engine | Metadata-driven workspace per persona | Static studio/runtime shells | ❌ |
| Universal Inbox | Task queue across processes | Not implemented | ❌ |
| Action Center | Dynamic action queue | Action metadata in studio only | ❌ |
| Notification Center | Event-driven notifications | Not implemented | ❌ |
| Golden flow | User → Persona → Workspace → Action → Result | Menu → Module → Form | **❌ Architecture drift** |

**Existing hooks:** `experience-engine.service.ts` (API), `resolveExperienceForRuntime` (web `RuntimePage` only).

---

## 5. Phase 3 — TunasFlow Runtime Gap

| Capability | Required | Current | Gap |
| --- | --- | --- | --- |
| Flow runtime | State machine execution | Transition validation only | 🟡 |
| Approval runtime | Multi-step approval | Process metadata linear steps | 🟡 |
| Automation | System tasks | ProcessEngine returns READY | 🟡 |
| Action executor | Execute bound actions | RuntimeExecutor ✅ | ✅ |
| Event bus integration | Events drive flow | No bus | ❌ |

**Risk:** `WorkflowEngine` resolves live metadata per request instead of compiled transition map.

---

## 6. Phase 4 — REDI Studio Gap

| Capability | Phase 4 | Current web | Gap |
| --- | --- | --- | --- |
| Metadata Designer | Kernel registry | `MetadataDesignerPage` + localStorage | 🟡 UI ✅ / integration ❌ |
| Form Builder | Metadata output | `BuilderShell` + Canvas | 🟡 |
| Query Builder | Query metadata | `QueryBuilderPage` visual | 🟡 |
| API Builder | Connector binding | `ApiBuilderPage` | 🟡 |
| Flow Builder | TunasFlow definition | `ProcessDesigner` linear | 🟡 |
| Report Builder | Report metadata | Query mode `report` only | ❌ |
| Dashboard Builder | Metadata widgets | TailAdmin hardcoded in RuntimeAppShell | 🟡 |
| Persona-separated studio | Admin vs Programmer workspaces | Single analyst workspace | ❌ |
| Metadata versioning | Kernel version lifecycle | Local counter only | ❌ |
| No CRUD admin pattern | Experience golden rule | Menu designer + admin USER screens | **❌ Drift** |

**Positive:** Substantial UI investment exists and should be **preserved and redirected**, not rewritten.

---

## 7. Phase 5 — Capability Package Engine Gap

| Capability | Required | Current | Gap |
| --- | --- | --- | --- |
| Module loader | Load package manifest | Not implemented | ❌ |
| Installer | Install capability package | Not implemented | ❌ |
| Template engine | Apply template to tenant | Not implemented | ❌ |
| Capability registry | Catalog + dispatch | `CapabilityRegistry` CONTRACT only | 🟡 |

`modules/finance`, `modules/inventory` — README contracts only, no handlers.

---

## 8. Phase 6 — Integration Hub Gap

| Capability | Required | Current | Gap |
| --- | --- | --- | --- |
| Integration hub core | Central routing | `IntegrationEngine` partial | 🟡 |
| Connector registry | Register connectors | Connectors API partial | 🟡 |
| TunasIoT connector | Python platform bridge | Not implemented | ❌ |
| MQTT / industrial | Industrial connectors | Not implemented | ❌ |
| Event bus bridge | External → internal events | Not implemented | ❌ |

**Rule compliance:** No IoT module built inside REDI ✅ (correct — gap is connector, not duplicate platform).

---

## 9. Phase 7 — Industrial Template Gap

| Template | Required | Current | Gap |
| --- | --- | --- | --- |
| ERP / Finance | Capability package | Capability contracts seeded | ❌ |
| WMS / Inventory | Capability package | README placeholder | ❌ |
| MES / QMS / CMMS / ITSM | Templates | Not started | ❌ |

Demo seed `ASSET_MAINTENANCE` is metadata demo, not industrial template package.

---

## 10. Architecture Drift Gaps (Cross-Phase)

These are structural issues not captured in a single phase:

| # | Drift | Blueprint violation | Impact |
| --- | --- | --- | --- |
| D1 | Dual runtime path (localStorage vs API) | Single runtime engine | Published apps ≠ production runtime |
| D2 | Dual metadata type system | Metadata Engine as source of truth | Compiler doesn't consume studio output |
| D3 | Identity on web, not API | Kernel owns identity | Security boundary broken |
| D4 | Header-trust tenant | JWT → Context Resolver | Tenant spoofing risk |
| D5 | Studio before Experience | Phase order | UI rework likely for persona model |
| D6 | Legacy studio coupled | Clean architecture | Maintenance burden |
| D7 | Orphan API builders | Reuse existing capability | Wasted parallel implementation |
| D8 | Menu-first navigation | Persona → Workspace → Action | UX model mismatch |
| D9 | Hardcoded dashboard blocks | Metadata-driven experience | RuntimeAppShell not metadata-pure |
| D10 | Two MetadataClient classes | Single client contract | Integration confusion |

---

## 11. Shared Package Gaps

| Package | Gap |
| --- | --- |
| `@redios/shared` | Missing `rule-definition.ts`, `report-definition.ts`; studio parallel types |
| `runtime-renderer-core` | Not used by published runtime path; `RuntimeContext` shape mismatch |
| `engine-sdk` | Empty — no SDK for external agents |
| `ui-schema` | Not consumed by active studio |

---

## 12. DNA Evolution Gap (appProcess / appRouting / domainCode)

| Legacy DNA | Target | Evolution status |
| --- | --- | --- |
| `appProcess` | Metadata Engine (PROCESS/WORKFLOW) | ✅ Evolved in code |
| `appRouting` | TunasFlow / Runtime Routing | 🟡 Partial (navigation metadata, not TunasFlow) |
| `domainCode` | Business Context Engine | 🟡 Partial (field exists; resolver not JWT-backed) |

No `appProcess` or `appRouting` symbols remain in source — evolution is **conceptual**, documented in blueprint/archive only.

---

## 13. Integration Target Readiness

| External system | Blueprint | Ready? | Notes |
| --- | --- | --- | --- |
| TunasIoT | Integration Hub connector | ❌ | Do not build IoT inside REDI |
| ISP-Kita | Connector | ❌ | Phase 6 |
| TunasNOC | Connector | ❌ | Phase 6 |
| SAP / Odoo | ERP connector | ❌ | Phase 6 |
| Office365 | Connector | ❌ | Phase 6 |
| MQTT / PLC / SCADA | Industrial connector | ❌ | Phase 6 |
| REST / Webhook | Generic | 🟡 | `webhook.adapter.ts` exists |

---

## 14. What Is NOT a Gap (Preserve)

These exceed Phase 1 doc labels but are **valuable assets**:

- `RuntimeExecutor` orchestration pipeline
- `MetadataValidatorEngine` comprehensive graph validation
- `MetadataResolver` 20+ type resolution
- `RuntimeCompiler` package generation
- `SecurityPolicyEngine` metadata policies
- `DesignerEngine` publish flow (for future Studio integration)
- Web studio UI (`BuilderShell`, metadata designers, query builder)
- `@redios/shared` contract breadth
- Platform seed + capability contract pattern
- Demo metadata seed (`ASSET_MAINTENANCE`) for acceptance testing

**Per Phase 0 rules: DO NOT rewrite or delete these.**

---

## 15. Priority Gap Ranking (for Phase 1 entry)

| Priority | Gap | Phase |
| --- | --- | --- |
| P0 | JWT Identity + Context Resolver (replace header trust) | 1 |
| P0 | Server login/auth API | 1 |
| P1 | Metadata cache + loader + boot compile | 1 |
| P1 | Event bus + subscriber | 1 |
| P1 | Capability → security/runtime wiring | 1 |
| P2 | Studio → kernel registry integration | 1→4 bridge |
| P2 | Unify MetadataClient / RuntimeContext shapes | 1 |
| P3 | Persona + Workspace engine | 2 |
| P3 | TunasFlow full runtime | 3 |
| P4 | Capability package loader | 5 |
| P4 | TunasIoT connector | 6 |
| P5 | Industrial templates | 7 |

---

## 16. References

- [CURRENT_ARCHITECTURE.md](./CURRENT_ARCHITECTURE.md)
- [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)
- [MIGRATION_PHASE.md](./MIGRATION_PHASE.md)
- `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md`
- `docs/phase/PHASE_1_KERNEL_COMPLETION.md`
