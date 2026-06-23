# 00 — RediOS Concept

**Versi handbook:** 1.0  
**Status platform:** Phase 2 (Experience Engine) selesai · Phase 3+ dalam roadmap  
**Audience:** Semua pengguna RediOS

---

## 1. Apa itu RediOS?

RediOS **bukan ERP tradisional**.

RediOS adalah **Enterprise Operating Platform** — sistem operasi perusahaan yang:

- Menjalankan proses bisnis dari **metadata** (bukan hardcode form/menu di source code)
- Membawa **pekerjaan ke pengguna** (bukan pengguna mencari menu)
- Menyatukan operasi, workflow, integrasi, dan (ke depan) IoT + AI dalam satu kernel

Analogi sederhana:

| ERP tradisional | RediOS |
| --- | --- |
| Buka menu → modul → form → simpan | Login → **persona** → **workspace** → **inbox / action** → selesai |
| Setiap modul punya menu approval sendiri | **Satu universal inbox** untuk semua approval & task |
| Ubah alur = ubah kode | Ubah alur = ubah **metadata & workflow** |

---

## 2. Filosofi inti

### 2.1 Persona-driven

Setelah login, sistem menentukan **siapa Anda di platform** — bukan hanya role database, tapi **pengalaman kerja**:

| Persona | Siapa | Fokus kerja |
| --- | --- | --- |
| **System Admin** | Administrator platform | Governance, user, tenant, akses studio |
| **Programmer** | System analyst / developer | Desain metadata, workflow, publish aplikasi |
| **Manager** | Supervisor / plant manager | Approval, exception, operasi |
| **Staff** | Operator / field | Eksekusi task harian |

Persona diturunkan dari **role platform** Anda (mis. `SYSTEM_ADMIN`, `MANAGER`, `STAFF`).

### 2.2 Workspace-driven

Setiap persona mendapat **workspace** berbeda — layout panel (inbox, actions, link, metrics) didefinisikan sebagai **metadata**, bukan hardcode di UI.

Contoh workspace yang sudah ada:

- **System Control Center** — Admin
- **RediOS Studio** — Programmer
- **Management Workspace** — Manager
- **My Workspace** / **Field Workspace (mobile)** — Staff

### 2.3 Action-driven & inbox-driven

Pekerjaan muncul sebagai:

- **Inbox item** — task menunggu Anda (approval, verifikasi work order, human task dari process)
- **Action queue** — aksi runtime yang bisa dijalankan dari entity metadata (CREATE, START, COMPLETE, dll.)
- **Notification** — alert event-driven (bukan halaman terpisah per jenis notifikasi)

**Prinsip:** User tidak hunting menu. Sistem yang push context.

### 2.4 Metadata-first

Perubahan bisnis seharusnya lewat:

```
Metadata + Workflow + Rules + Configuration
```

Bukan patch source code untuk setiap form, approval, atau menu baru.

---

## 3. Lapisan platform (gambaran)

Dari atas ke bawah:

```
┌─────────────────────────────────────┐
│  Experience Layer (Phase 2)         │  Persona, Workspace, Inbox, Notifications
├─────────────────────────────────────┤
│  RediOS Studio (Phase 4)          │  Designer metadata, form, query, workflow
├─────────────────────────────────────┤
│  TunasFlow (Phase 3)              │  Approval, automation, human task routing
├─────────────────────────────────────┤
│  Runtime + Kernel (Phase 1)         │  Identity, metadata registry, executor
├─────────────────────────────────────┤
│  Capability Modules (Phase 5–7)   │  Finance, WMS, MES, CMMS, ITSM, …
├─────────────────────────────────────┤
│  Integration Hub (Phase 6)        │  MQTT, REST, TunasIoT, ERP connector
└─────────────────────────────────────┘
```

Yang **sudah bisa dipakai** di environment demo saat ini:

- Login JWT + identity
- Persona & workspace metadata
- Universal inbox (work order + human task)
- Notification center (+ live SSE)
- Runtime transaksi (contoh: Work Order)
- Studio (terbatas per persona)
- Persona-gated capabilities

Yang **masih roadmap** (jangan dijanjikan ke user sebagai fitur penuh):

- TunasFlow visual builder penuh
- Modul industri (ERP/WMS/MES template)
- AI assistant terintegrasi di UI

---

## 4. Istilah penting

| Istilah | Arti singkat |
| --- | --- |
| **Persona** | Profil pengalaman kerja platform (Admin, Programmer, Manager, Staff) |
| **Workspace** | Dashboard persona — kumpulan panel (inbox, actions, link, …) |
| **Universal Inbox** | Satu daftar task untuk semua jenis approval/pekerjaan |
| **Human task** | Task manusia dari process/workflow (bridge ke TunasFlow) |
| **Action queue** | Daftar aksi entity yang relevan untuk persona Anda |
| **Notification center** | Riwayat alert event (work order started, role-based alert, …) |
| **Runtime** | Eksekusi transaksi bisnis (form, list, action) dari metadata |
| **Studio** | Lingkungan desain metadata & UI (Programmer/Admin) |
| **Metadata** | Definisi object, form, workflow, process, menu — “blueprint” aplikasi |
| **Capability** | Hak akses granular (mis. `metadata.*`, `runtime.access`) |
| **Tenant** | Organisasi/isolasi data multi-company |
| **Application** | Paket runtime ter-compile (mis. Asset Maintenance) |

---

## 5. Siapa melakukan apa?

| Kegiatan | Persona tipikal |
| --- | --- |
| Kelola user & role platform | System Admin |
| Desain entity, form, workflow | Programmer |
| Customize form/layout terbatas | Manager (akses studio terbatas) |
| Approve & supervise operasi | Manager |
| Eksekusi work order / task lapangan | Staff |
| Lihat notification & inbox | Semua (kecuali Programmer — inbox kosong by design) |

---

## 6. Perbedaan dengan dokumentasi teknis

| Dokumen | Untuk apa |
| --- | --- |
| **Handbook ini** (`docs/handbook/`) | Cara memakai RediOS — untuk user & AI guide |
| `docs/phase/` | Rencana & validasi engineering per fase |
| `docs/architecture/` | Blueprint arsitektur untuk developer |
| `.cursorrules` | Aturan coding untuk AI agent saat develop |

Handbook **tidak** menggantikan blueprint — handbook menjawab: *“Saya login sebagai manager, lalu apa?”*

---

## 7. Arah ke depan (handbook)

Seiring fitur bertambah, handbook akan dipecah:

1. **Per persona** — panduan lengkap Admin vs Staff
2. **Per halaman** — `/workspace`, `/studio`, `/runtime/WORK_ORDER`, dll.
3. **Playbook industri** — CMMS, ITSM, warehouse (Phase 7)
4. **Troubleshooting** — session expired, akses ditolak, inbox kosong

Teks panjang di form dan halaman UI akan **dialihkan ke handbook** agar UI tetap bersih dan handbook bisa dipelajari AI assistant.

---

## 8. Referensi

- `docs/handbook/01_HOW_REDI_WORKS.md` — langkah operasional
- `docs/phase/PHASE_2_VALIDATION.md` — fitur experience yang sudah live
- `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md` — visi arsitektur lengkap
