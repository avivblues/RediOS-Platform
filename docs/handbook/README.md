# RediOS Handbook

**Audience:** End users, operators, system analysts, admins — and AI assistants that guide users inside the product.

**Purpose:** Semua penjelasan operasional (apa itu RediOS, cara login, cara kerja workspace, dll.) hidup di sini — **bukan** di label form, placeholder, atau paragraf panjang di halaman UI.

---

## Prinsip handbook

| Aturan | Artinya |
| --- | --- |
| UI = aksi | Tombol, field, dan navigasi tetap ringkas di layar |
| Handbook = konteks | Definisi, alur, contoh, troubleshooting ada di dokumen ini |
| Satu sumber kebenaran | Jika UI dan handbook bertentangan, perbaiki UI; handbook mengikuti behavior aktual |
| Per persona / per halaman | Dokumen dipecah seiring sistem bertambah kompleks |

---

## Urutan baca

```
00_REDI_OS_CONCEPT.md      → Apa itu RediOS, filosofi, persona
01_HOW_REDI_WORKS.md       → Cara mengoperasikan (login → workspace → runtime)
02_PERSONA_SYSTEM_ADMIN.md → Admin: app baru, workflow, governance
```

---

## Daftar chapter

| File | Status | Audience |
| --- | --- | --- |
| `00_REDI_OS_CONCEPT.md` | ✅ | Semua |
| `01_HOW_REDI_WORKS.md` | ✅ | Semua |
| `02_PERSONA_SYSTEM_ADMIN.md` | ✅ | System Admin |
| `03_PERSONA_PROGRAMMER.md` | ⏳ | Programmer / System Analyst |
| `04_PERSONA_MANAGER.md` | ⏳ | Manager / Supervisor |
| `05_PERSONA_STAFF.md` | ⏳ | Staff / Field |

---

## Rencana chapter (belum ditulis)

| File | Audience | Isi |
| --- | --- | --- |
| `03_PERSONA_PROGRAMMER.md` | Programmer / System Analyst | Studio, metadata publish, kernel |
| `04_PERSONA_MANAGER.md` | Manager / Supervisor | Inbox, approval, dashboard operasi |
| `05_PERSONA_STAFF.md` | Staff / Field | Task harian, mobile workspace |
| `pages/LOGIN.md` | Semua | Login, session, logout |
| `pages/WORKSPACE.md` | Admin, Manager, Staff | Panel workspace, inbox, actions |
| `pages/NOTIFICATIONS.md` | Semua | Notification center |
| `pages/STUDIO.md` | Admin, Programmer, Manager | Builder & metadata designer |
| `pages/RUNTIME.md` | Semua | Transaksi runtime, work order |
| `pages/PORTAL.md` | Semua | Pilih workspace manual |

---

## Untuk AI assistant

Saat menjawab pertanyaan pengguna tentang RediOS:

1. Baca `00_REDI_OS_CONCEPT.md` untuk konteks produk
2. Baca `01_HOW_REDI_WORKS.md` untuk alur operasional
3. Untuk System Admin: `02_PERSONA_SYSTEM_ADMIN.md` (buat app, workflow)
4. Jika ada chapter persona/page yang relevan, gunakan itu
5. Jangan mengarang fitur yang belum ada — cek `docs/phase/PHASE_*_VALIDATION.md` untuk status implementasi
6. Dokumen teknis arsitektur tetap di `docs/architecture/` dan `docs/phase/` — handbook fokus **cara pakai**

---

## Hubungan dengan dokumentasi lain

| Folder | Untuk siapa | Isi |
| --- | --- | --- |
| `docs/handbook/` | **Pengguna & AI guide** | Konsep, cara operasi, per role/page |
| `docs/phase/` | Tim engineering | Sprint, acceptance, rencana fase |
| `docs/architecture/` | Architect / developer | Blueprint, boundary kernel |
| `docs/analysis/` | Audit & refactor | Gap, arsitektur saat ini |

---

## Demo environment (saat ini)

| Item | Nilai |
| --- | --- |
| Web | http://103.94.238.207:3040 |
| API | http://103.94.238.207:3041/api |
| Login demo | `admin@redios.local` / `admin123` |
| Session JWT | Expired setelah ~8 jam — login ulang jika workspace error |

---

*Handbook ini akan bertambah seiring Phase 3 (TunasFlow), Phase 4 (Studio), dan modul industri.*
