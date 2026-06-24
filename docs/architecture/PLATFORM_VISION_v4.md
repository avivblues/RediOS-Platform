# REDI-OS Platform Vision v4

**Industrial Intelligence Operating System**  
Version: 4.0  
Status: **Active north star** (supersedes vision framing in Blueprint v3)  
Owner: PT Revolusi Digital Solusi

---

## 1. Purpose of this document

`README.md` (root) and `.cursorrules` v4 mendefinisikan paradigma baru:

> Dari *metadata-driven platform* → **Industrial Intelligence Operating System**

Dokumen ini menjadi **jembatan resmi** antara visi v4, kode yang sudah ada, dan folder `docs/phase/` + `docs/architecture/`.

**Aturan baca untuk developer & AI agent:**

```
README.md  →  .cursorrules  →  docs/architecture/PLATFORM_VISION_v4.md (this file)
                                        ↓
                    docs/phase/PHASE_*_VALIDATION.md  (status implementasi aktual)
                                        ↓
                    docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md  (detail kernel — masih valid)
```

---

## 2. North Star (v4)

REDI-OS **bukan** ERP, CRUD generator, atau low-code form builder.

REDI-OS adalah **Industrial Intelligence Operating System** — platform yang mengubah **pengetahuan industri** menjadi **model operasi digital** yang dapat:

- dipahami sistem (ontology + context)
- dieksekusi runtime (metadata + workflow)
- dibantu AI (context layer — Phase 8+)

```
Industrial Reality
        ↓
Industrial Knowledge Model
        ↓
Ontology Context          ← Phase 8 (belum ada di kode)
        ↓
Metadata Runtime          ← Phase 1–4 (sebagian besar live)
        ↓
Experience + Workflow     ← Phase 2–3 (live / in progress)
        ↓
AI Assisted Execution     ← Phase 9–11 (roadmap)
```

**Sumber kebenaran bisnis** bukan schema database, melainkan:

```
Industrial Context + Relationship + Business Meaning + Operational Behavior
```

---

## 3. Layer architecture (v4)

| Layer | Responsibility | Phase | Code status |
| --- | --- | --- | --- |
| **AI Assistant / AI Composer** | Orchestrate models, industrial agents | 9–11 | ❌ Not implemented |
| **Industrial Intelligence** | Ontology, knowledge graph, semantic context | 8 | ❌ Not implemented |
| **Experience Engine** | Persona, workspace, inbox, notifications | 2 | ✅ Complete |
| **TunasFlow** | Workflow, approval, rule routing, automation | 3 | 🟡 Sprint 2 (core live) |
| **REDI Studio** | Designers → kernel publish | 4 | 🟡 UI partial, kernel integration weak |
| **Runtime + Kernel** | Metadata registry, executor, event, security | 1 | ✅ Acceptance passed |
| **Capability Packages** | Installable industrial modules | 5–7 | ❌ Contracts/seed only |
| **Integration Hub** | MQTT, REST, TunasIoT bridge | 6 | 🟡 Partial |

### Prinsip layer

- **Ontology tidak menggantikan metadata** — ontology memberi *makna*; metadata memberi *struktur runtime*.
- **Metadata tidak hardcode bisnis tenant** — capability package + configuration.
- **AI tidak akses database langsung** — hanya lewat context layer (Phase 9+).
- **TunasFlow tidak membuat UI** — output = task object → universal inbox (Phase 2).

---

## 4. Development decision tree (v4)

Sebelum menulis kode, tanyakan:

| Pertanyaan | Buat | Jangan |
| --- | --- | --- |
| Apakah ini **makna industri**? | Ontology definition (Phase 8+) | Hardcode di service |
| Apakah ini **struktur**? | Metadata (entity, field, form) | Table + CRUD controller |
| Apakah ini **proses**? | Workflow + TunasFlow process | if/else approval di module |
| Apakah ini **aksi**? | Runtime command / action metadata | Endpoint khusus tenant |
| Apakah ini **variasi tenant**? | Configuration / capability package | Branch `if (tenantId)` |
| Apakah ini **UI operasi**? | Experience workspace / runtime shell | Halaman CRUD admin |

---

## 5. Phase roadmap (v4 — locked order)

### Foundation track (Phase 1–7)

| Phase | Name | Status (Jun 2026) |
| --- | --- | --- |
| **1** | Kernel Completion | ✅ Acceptance — `PHASE_1_VALIDATION.md` |
| **2** | Experience Engine | ✅ Complete — `PHASE_2_VALIDATION.md` |
| **3** | TunasFlow Runtime | 🟡 In progress — `PHASE_3_VALIDATION.md` (Sprint 2) |
| **4** | REDI Studio | ⏳ UI ahead of kernel integration |
| **5** | Capability Package Engine | ⏳ Planned |
| **6** | Integration Hub | ⏳ Partial |
| **7** | Industrial Templates (ERP/WMS/MES/…) | ⏳ Planned |

### Intelligence track (Phase 8–11) — **after stable runtime**

| Phase | Name | Status |
| --- | --- | --- |
| **8** | Industrial Ontology Engine | ❌ Not started — no `OntologyService` in repo |
| **9** | AI Composer Platform | ❌ Not started |
| **10** | Industrial Agent Runtime | ❌ Not started |
| **11** | Autonomous Enterprise OS | ❌ Vision only |

**Phase locking rule:** Jangan implement Phase 8+ sebelum Phase 3–4 runtime + publish path stabil.

---

## 6. Terminology migration (old → v4)

| Istilah lama (v3) | Istilah v4 | Catatan |
| --- | --- | --- |
| Metadata Driven Platform | Industrial Intelligence OS | Metadata tetap **layer**, bukan identitas produk |
| Metadata First | Knowledge → Ontology → Metadata | Urutan desain, bukan hanya metadata |
| Enterprise Operating Platform | Industrial Intelligence Operating System | Fokus manufacturing/industrial context |
| Phase 8 = Industrial Intelligence | Phase 8 = Ontology Engine | Phase 9–11 = AI track terpisah |
| Rule Engine (kernel) | TunasFlow RuleEngine + future ontology rules | `apps/api/src/core/tunasflow/rule/` = process step conditions |

---

## 7. What exists in code today (honest map)

### ✅ Aligned with v4 foundation

| Area | Path / feature |
| --- | --- |
| Kernel runtime pipeline | `apps/api/src/core/runtime/runtime-executor.service.ts` |
| Metadata resolver + seed | `apps/api/src/core/metadata/`, `apps/api/src/seed/` |
| Experience persona/workspace | `apps/api/src/core/experience/` |
| TunasFlow engine | `apps/api/src/core/tunasflow/` |
| JWT identity | `apps/api/src/core/identity/` |
| Event bus (partial) | `apps/api/src/core/event/event.bus.ts` |
| Handbook (operational truth) | `docs/handbook/` |

### 🟡 Partial / drift risk

| Area | Gap vs v4 |
| --- | --- |
| Studio | Draft di localStorage — belum ontology-ready publish |
| Capability modules | `modules/*` = README contracts, bukan package loader |
| Integration Hub | Connector partial, no TunasIoT bridge |
| Inbox | Masih ada hardcoded WORK_ORDER items di `InboxEngine` |

### ❌ Not started (v4 intelligence track)

- Ontology registry / graph / semantic relationships
- AI Composer / context assembly / model routing
- Industrial agents
- Knowledge graph persistence

---

## 8. Documentation hierarchy (v4)

| Priority | Document | Role |
| --- | --- | --- |
| 1 | `/README.md` | Product vision & roadmap |
| 2 | `/.cursorrules` | AI agent coding rules |
| 3 | `docs/architecture/PLATFORM_VISION_v4.md` | This file — alignment |
| 4 | `docs/analysis/ALIGNMENT_v4_STATUS.md` | Code vs vision scorecard |
| 5 | `docs/phase/PHASE_*_VALIDATION.md` | Sprint truth per phase |
| 6 | `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md` | Kernel detail (technical) |
| 7 | `docs/handbook/` | User & operator guides |
| — | `docs/archive/` | History only — **ignore for active decisions** |

---

## 9. Anti-patterns (v4 guardrails)

Jangan bangun:

- Modul ERP hardcoded (`PurchaseService`, `ProductionModule` dengan logic tetap)
- CRUD admin per entity di source code
- AI query SQL/Mongo langsung
- Approval UI terpisah per modul (gunakan universal inbox)
- Ontology engine di Phase 3 (tunggu Phase 8 setelah runtime stabil)

Selalu bangun:

- Reusable kernel engine
- Metadata + workflow definitions
- Capability package boundary
- Experience-first delivery (persona → workspace → action)

---

## 10. References

- `/README.md` §1–7, §32 (roadmap)
- `/.cursorrules` §1–9, §34 (phase locking)
- `docs/phase/PHASE_DEVELOPMENT_ROADMAP.md`
- `docs/analysis/ALIGNMENT_v4_STATUS.md`
