# Alignment v4 — Code vs Vision Status

Version: 1.0  
Date: 2026-06-16  
Compares: **Repository reality** vs **README v4 / .cursorrules v4 / PLATFORM_VISION_v4**

> GAP_ANALYSIS.md (v1.0) masih berguna untuk audit historis Phase 0, tapi scorecard-nya **sudah usang** — gunakan dokumen ini untuk keputusan arah ke depan.

---

## 1. Paradigm shift summary

| Aspek | Sebelum (v3 framing) | Sekarang (v4) |
| --- | --- | --- |
| Identitas produk | Metadata-driven enterprise platform | **Industrial Intelligence Operating System** |
| Sumber kebenaran | Metadata definition | **Industrial knowledge + ontology context + metadata** |
| AI | Phase 8 lumped | Phase **8** Ontology → **9** Composer → **10** Agent → **11** Autonomous |
| Metadata | Pusat narasi | **Layer runtime** — tetap kritikal, bukan whole story |

**Kesimpulan:** Kode Phase 1–3 **masih valid** di bawah v4. Yang berubah adalah *framing* dan *urutan intelligence track*, bukan rewrite kernel.

---

## 2. Phase scorecard (current)

| Phase | Validation doc | Status | v4 aligned? |
| --- | --- | --- | --- |
| 0 | `PHASE_0_REPOSITORY_AUDIT.md` | Complete | ✅ |
| 1 | `PHASE_1_VALIDATION.md` | Acceptance PASS | ✅ Kernel = metadata runtime layer |
| 2 | `PHASE_2_VALIDATION.md` | Complete | ✅ Experience = v4 workspace layer |
| 3 | `PHASE_3_VALIDATION.md` | Sprint 3 complete | ✅ TunasFlow = v4 workflow brain |
| 4 | — | Sprint 2 FORM/VIEW/UI publish | 🟡 Query, canvas, connector publish wired |
| 5–7 | Phase plans | Not started | ⏳ Capability + industrial templates |
| 8 | — | **No code** | ❌ Ontology engine missing |
| 9–11 | — | **No code** | ❌ AI track missing |

---

## 3. v4 layer → code mapping

### Industrial Intelligence Layer (Phase 8+)

| v4 component | Expected | In repo | Action |
| --- | --- | --- | --- |
| Ontology registry | Semantic types, relationships | ❌ | Phase 8 — do not hack into metadata module |
| Knowledge graph | Object ↔ impact ↔ context | ❌ | Phase 8 |
| AI Composer | Model routing, context assembly | ❌ | Phase 9 |
| Industrial agents | Domain agents (maintenance, QC) | ❌ | Phase 10 |

### Runtime Layer (Phase 1–3)

| v4 component | Expected | In repo | Notes |
| --- | --- | --- | --- |
| Metadata Engine | Registry, resolver, compiler | ✅ | `core/metadata`, `core/compiler` |
| TunasFlow / Workflow | Process, approval, rules | 🟡 | `core/tunasflow/` — Sprint 2 |
| Policy / Security | RBAC, field policy | 🟡 | `core/security-policy` |
| Event Engine | Bus + subscribers | 🟡 | `core/event/event.bus.ts` |
| State history | Workflow audit | ✅ | `tunasflow/state/` |

### Experience Layer (Phase 2)

| v4 component | Expected | In repo | Notes |
| --- | --- | --- | --- |
| Persona resolver | Metadata + JWT merge | ✅ | `persona-capability.service.ts` |
| Workspace engine | Panel metadata | ✅ | `workspace.engine.ts` |
| Universal inbox | Human tasks | ✅ | `inbox.engine.ts` — minor WO hardcode drift |
| Notifications + SSE | Event-driven alerts | ✅ | Sprint 4 |

### Studio / Builder (Phase 4)

| v4 component | Expected | In repo | Notes |
| --- | --- | --- | --- |
| Metadata designers | Kernel publish | 🟡 | localStorage draft |
| Ontology Designer | v4 README §1193 | ❌ | Future Phase 8 UI, not Phase 4 |
| Flow Builder | TunasFlow visual | 🟡 | ProcessDesigner linear draft |

---

## 4. Drift items to fix (engineering backlog)

Prioritas agar tidak salah arah:

| # | Drift | Status |
| --- | --- | --- |
| 1 | `InboxEngine` hardcodes WORK_ORDER list | ✅ Fixed — human tasks only (TunasFlow) |
| 2 | `HumanTaskBridgeService` hardcodes WO START | ✅ Fixed — demo seed only; TunasFlow creates tasks |
| 3 | Studio localStorage | ⏳ Phase 4 publish path |
| 4 | GAP_ANALYSIS stale | ✅ Superseded by this file |
| 5 | Blueprint v3 header | ✅ Banner → PLATFORM_VISION_v4 |
| 6 | Handbook metadata-only framing | ✅ Updated v2 concept |

---

## 5. What NOT to do next (v4 guardrails)

- ❌ Build `OntologyModule` before Phase 3–4 stable
- ❌ Add OpenAI calls directly in runtime controllers
- ❌ Rename entire codebase away from metadata types (metadata remains valid)
- ❌ Create ERP modules (`modules/finance/src/PurchaseService.ts`) with hardcoded flows
- ❌ Promise ontology/AI features to users — Phase 8+ only

## What TO do next (aligned sequence)

1. Complete **Phase 3** TunasFlow (automation, versioning — Sprint 3+)
2. **Phase 4** Studio → kernel publish (ontology-*ready* metadata schema, not full ontology engine)
3. **Phase 5–7** Capability packages + industrial templates
4. **Phase 8** Ontology Engine (new `core/ontology/` — separate from metadata resolver)
5. **Phase 9+** AI Composer on top of ontology context

---

## 6. References

- `docs/architecture/PLATFORM_VISION_v4.md`
- `docs/phase/PHASE_3_VALIDATION.md`
- `docs/phase/PHASE_2_VALIDATION.md`
- `/README.md` §32
- `/.cursorrules` §34
