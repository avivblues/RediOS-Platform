# 00 — RediOS Concept

**Versi handbook:** 2.0  
**Status platform:** Phase 2 selesai · Phase 3 in progress · Phase 8+ (Ontology/AI) roadmap  
**Audience:** Semua pengguna RediOS

---

## 1. Apa itu RediOS?

RediOS **bukan ERP tradisional** dan **bukan sekadar generator form/metadata**.

RediOS adalah **Industrial Intelligence Operating System** — sistem operasi yang:

- Mengubah **pengetahuan industri** menjadi model operasi digital yang dapat dieksekusi
- Menjalankan proses dari **metadata + workflow** (bukan hardcode menu/form di source code)
- Membawa **pekerjaan ke pengguna** lewat persona, workspace, dan universal inbox
- (Ke depan) Memberi **konteks ontology + AI** agar sistem memahami makna operasi, bukan hanya field database

Analogi sederhana:

| ERP tradisional | RediOS |
| --- | --- |
| Human → operates → Software → stores Data | Industrial reality → knowledge → runtime → **AI-assisted** execution |
| Buka menu → modul → form → simpan | Login → **persona** → **workspace** → **inbox / action** |
| Setiap modul punya approval sendiri | **Satu universal inbox** |
| Ubah alur = ubah kode | Ubah alur = **metadata + workflow** (+ ontology Phase 8+) |

---

## 2. Filosofi inti

### 2.1 Knowledge & ontology driven (v4)

Urutan desain yang benar:

```
Industrial Knowledge → Ontology (Phase 8+) → Metadata → Runtime → Experience → AI (Phase 9+)
```

**Metadata** tetap fondasi runtime hari ini — yang berubah adalah sudut pandang: metadata adalah *layer*, bukan identitas seluruh produk.

### 2.2 Persona-driven

Setelah login, sistem menentukan **siapa Anda di platform** — bukan hanya role database, tapi **pengalaman kerja**:

| Persona | Siapa | Fokus kerja |
| --- | --- | --- |
| **System Admin** | Administrator platform | Governance, user, tenant, akses studio |
| **Programmer** | System analyst / developer | Desain metadata, workflow, publish aplikasi |
| **Manager** | Supervisor / plant manager | Approval, exception, operasi |
| **Staff** | Operator / field | Eksekusi task harian |

### 2.3 Workspace-driven

Setiap persona mendapat **workspace** berbeda — layout panel didefinisikan sebagai metadata.

### 2.4 Action-driven & inbox-driven

Pekerjaan muncul sebagai inbox item, action queue, dan notification — user tidak hunting menu.

### 2.5 Runtime-first (bukan CRUD-first)

Perubahan bisnis lewat metadata + workflow + capability package — bukan patch controller per tenant.

---

## 3. Lapisan platform (v4)

```
┌─────────────────────────────────────┐
│  AI Assistant / Composer (Phase 9+) │  ← belum live
├─────────────────────────────────────┤
│  Industrial Ontology (Phase 8+)     │  ← belum live
├─────────────────────────────────────┤
│  Experience Layer (Phase 2) ✅       │  Persona, Workspace, Inbox
├─────────────────────────────────────┤
│  TunasFlow (Phase 3) 🟡             │  Approval, rules, automation
├─────────────────────────────────────┤
│  REDI Studio (Phase 4) 🟡           │  Designer → kernel publish
├─────────────────────────────────────┤
│  Runtime + Kernel (Phase 1) ✅       │  Metadata registry, executor
├─────────────────────────────────────┤
│  Capability Modules (Phase 5–7)     │  ERP, WMS, MES, CMMS, …
├─────────────────────────────────────┤
│  Integration Hub (Phase 6)          │  TunasIoT, MQTT, REST
└─────────────────────────────────────┘
```

**Sudah live (demo):** login JWT, persona/workspace, inbox, notifications (SSE), runtime Work Order & Purchase Request, TunasFlow approval chain, Studio terbatas.

**Jangan dijanjikan sebagai fitur penuh:** ontology designer, AI composer, modul industri package, autonomous agents.

---

## 4. Istilah penting

| Istilah | Arti singkat |
| --- | --- |
| **Industrial knowledge** | Konsep domain nyata (mesin, order, material, proses) — sumber desain v4 |
| **Ontology** | Makna & relasi antar objek industri (Phase 8+) |
| **Metadata** | Blueprint runtime: entity, field, workflow, process, UI |
| **Persona** | Profil pengalaman kerja (Admin, Programmer, Manager, Staff) |
| **Workspace** | Dashboard persona — panel inbox, actions, link |
| **Universal Inbox** | Satu daftar task approval/pekerjaan |
| **TunasFlow** | Workflow brain — process, approval, rules |
| **Runtime** | Eksekusi transaksi dari metadata |
| **Studio** | Lingkungan desain metadata & UI |
| **Capability package** | Modul industri ter-install (Phase 5–7) |

---

## 5. Siapa melakukan apa?

| Kegiatan | Persona tipikal |
| --- | --- |
| Kelola user & role platform | System Admin |
| Desain entity, form, workflow | Programmer |
| Approve & supervise operasi | Manager |
| Eksekusi work order / task lapangan | Staff |

---

## 6. Perbedaan dengan dokumentasi teknis

| Dokumen | Untuk apa |
| --- | --- |
| **Handbook** (`docs/handbook/`) | Cara pakai — user & AI guide |
| `docs/architecture/PLATFORM_VISION_v4.md` | Visi v4 & alignment |
| `docs/analysis/ALIGNMENT_v4_STATUS.md` | Status kode vs visi |
| `docs/phase/` | Sprint & validasi engineering |
| `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md` | Detail kernel (teknis) |
| `/README.md` + `.cursorrules` | North star produk |

---

## 7. Referensi

- `docs/handbook/01_HOW_REDI_WORKS.md`
- `docs/phase/PHASE_2_VALIDATION.md`, `PHASE_3_VALIDATION.md`
- `docs/architecture/PLATFORM_VISION_v4.md`
