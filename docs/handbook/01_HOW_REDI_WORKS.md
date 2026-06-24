# 01 — How RediOS Works

**Versi handbook:** 1.0  
**Audience:** Operator, admin, analyst — panduan operasional harian  
**Prasyarat:** Baca `00_REDI_OS_CONCEPT.md`

---

## 1. Alur kerja standar

```
Landing / Login
      │
      ▼
Persona Resolver  ← role platform menentukan persona
      │
      ├── Programmer ──► /studio
      │
      └── Admin / Manager / Staff ──► /workspace
                │
                ├── Inbox (task menunggu)
                ├── Actions (aksi entity)
                ├── Notifications
                └── Link ──► /runtime/* atau /studio
                          │
                          └── Back to workspace (bar navigasi)
```

**Inti:** Workspace adalah **home** operasional. Runtime dan Studio adalah **alat** — bukan titik masuk utama (kecuali Programmer).

---

## 2. Login & session

### 2.1 Login

1. Buka `/login`
2. Masukkan email & password platform
3. Sistem memanggil API auth → JWT token
4. Sistem memanggil `/experience/me` → tentukan persona & `homeRoute`
5. Redirect otomatis:
   - **Programmer** → `/studio`
   - **Admin / Manager / Staff** → `/workspace`

### 2.2 Session & token

- Token JWT berlaku **~8 jam** (konfigurasi server)
- Jika token expired:
  - Workspace menampilkan error atau redirect ke login
  - **Solusi:** login ulang di `/login`
- Jangan andalkan tab browser terbuka berhari-hari tanpa login ulang

### 2.3 Logout

- Dari workspace: tombol **Logout**
- Session di browser dihapus

### 2.4 Portal manual

`/portal` — pilih workspace secara manual jika ingin ganti mode kerja (Programmer / Manager / Staff) tanpa logout.

---

## 3. Workspace — pusat operasi

**URL:** `/workspace`  
**Persona:** System Admin, Manager, Staff (Programmer diarahkan ke Studio)

### 3.1 Panel workspace

Panel ditampilkan sesuai metadata workspace persona Anda. Tipe panel:

| Tipe panel | Fungsi |
| --- | --- |
| **INBOX** | Task menunggu — approval, verifikasi, human task |
| **ACTIONS** | Shortcut aksi entity (CREATE, START, …) |
| **NOTIFICATIONS** | Ringkasan alert + link ke notification center |
| **LINK** | Navigasi ke runtime, studio, atau app shell |
| **METRIC** | Ringkasan angka (waiting, in progress, unread) |

Panel bisa disembunyikan jika capability Anda tidak memenuhi `requiredCapabilities` (mis. link Studio hanya untuk yang punya `builder.*`).

### 3.2 Universal inbox

**Satu inbox** untuk semua jenis pekerjaan — bukan menu “Purchase Approval”, “QC Approval”, dll. terpisah.

Sumber item inbox saat ini:

| Sumber | Contoh |
| --- | --- |
| **Human task** (process/workflow) | Batch Release Approval, Verify work order start |
| **Work order** (workflow document) | Work order OPEN / IN_PROGRESS |

**Menyelesaikan human task:**

1. Di panel inbox, item dengan prefix human task → tombol **Complete**
2. Atau buka entity terkait lewat link **Open**

**Programmer:** inbox sengaja kosong — fokus desain di Studio, bukan operasi.

### 3.3 Action center

Daftar aksi entity yang di-generate dari metadata + panel workspace (link runtime). Contoh: `START WORK_ORDER`, `COMPLETE WORK_ORDER`.

Klik **Run** → masuk halaman runtime entity.

### 3.4 Header workspace

- **Notifications (N)** → `/notifications`
- **Switch workspace** → `/portal`
- **Logout**

---

## 4. Notification center

**URL:** `/notifications`

- Menampilkan alert event-driven (mis. work order started → supervisor)
- Update **live** via SSE (stream) + load awal via API
- **Mark read** per item
- Notifikasi bisa personal (userId) atau per role (`targetRole`)

---

## 5. Runtime — transaksi bisnis

**URL:** `/runtime/{ENTITY}` — contoh: `/runtime/WORK_ORDER`

### 5.1 Persona-first shell

Halaman runtime dibungkus **Experience Runtime Shell**:

- Bar atas: **← Back to workspace**
- Link: Notifications, Switch workspace

Anda selalu bisa kembali ke workspace tanpa memorizing menu.

### 5.2 Work Order (contoh demo)

Entity **WORK_ORDER** dengan lifecycle:

```
OPEN → (START) → IN_PROGRESS → (COMPLETE) → DONE
                              → (CANCEL) → CANCELLED
```

**START work order:**

1. Buka work order di runtime
2. Jalankan action **START**
3. Side effects (otomatis):
   - Status → IN_PROGRESS
   - Process `WORK_ORDER_START_PROCESS` jalan
   - Human task **Verify work order start** masuk inbox supervisor/admin
   - Event notifikasi (jika dikonfigurasi)

### 5.3 Generated applications

**URL:** `/apps/{applicationCode}` — shell aplikasi hasil publish Studio (localStorage + metadata API).

---

## 6. RediOS Studio

**URL:** `/studio`  
**Persona:** System Admin & Programmer (full); Manager (terbatas); Staff (ditolak)

| Route | Akses | Fungsi |
| --- | --- | --- |
| `/studio` | Admin, Programmer, Manager* | Visual builder |
| `/studio/metadata/*` | Admin, Programmer, Manager* | Data, action, process, menu, security, workspace |
| `/studio/query` | Admin, Programmer | Query builder |
| `/studio/api` | Admin, Programmer | API builder |
| `/studio/create` | Admin, Programmer | Create application |

\*Manager: builder + metadata saja, tanpa query/api/create.

**Workspace designer:** `/studio/metadata/workspace` — edit panel workspace & publish ke platform metadata.

> Detail Studio akan expanded di `03_PERSONA_PROGRAMMER.md` (rencana).

---

## 7. Persona & capability (akses)

Capabilities diturunkan dari:

1. Metadata **PERSONA** (base capabilities per persona)
2. **Role permissions** JWT (mis. `*` untuk admin)

Contoh capability:

| Capability | Arti |
| --- | --- |
| `platform.*` | Kontrol platform penuh |
| `metadata.*` | Desain metadata |
| `builder.*` | Studio builder |
| `runtime.access` | Akses runtime transaksi |
| `notification.read` | Lihat notification center |
| `dashboard.read` | Panel metric/dashboard |

UI menyembunyikan panel/tombol jika capability tidak cukup — bukan error, panel tidak muncul.

---

## 8. Demo environment

| Item | Nilai |
| --- | --- |
| Web | http://103.94.238.207:3040 |
| Login | `admin@redios.local` / `admin123` |
| Persona admin | System Admin → System Control Center |
| API | http://103.94.238.207:3041/api |

### 8.1 Skenario uji 5 menit (Admin)

1. Login → workspace **System Control Center**
2. Lihat **Universal Inbox** — item demo "Platform Approval Queue"
3. Klik **Complete** pada human task (opsional)
4. Buka **Work Orders** link → runtime WORK_ORDER
5. START sebuah work order → cek inbox & notifications
6. Buka `/studio` → metadata designer (jika perlu desain)

### 8.2 Troubleshooting umum

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| "Internal server error" / workspace kosong | JWT expired | Login ulang `/login` |
| "Bearer token required" | Belum login | Login |
| Inbox kosong (admin) | Human task sudah complete / role mismatch | START work order atau login role supervisor |
| Studio blocked | Persona Staff | Gunakan akun Programmer/Admin |
| Panel Studio tidak muncul | Capability | Normal untuk Staff; Admin/Programmer harusnya muncul |

---

## 9. API yang dipakai UI (referensi)

| Endpoint | Fungsi |
| --- | --- |
| `POST /api/auth/login` | Login |
| `GET /api/experience/me` | Persona + workspace + inbox + actions + notifications |
| `GET /api/experience/notifications` | Daftar notifikasi |
| `GET /api/experience/notifications/stream?token=` | SSE live notifications |
| `PATCH /api/experience/inbox/{id}/complete` | Selesaikan human task |
| `POST /api/runtime/{entity}/{id}/actions/{code}` | Jalankan aksi runtime |

---

## 10. Yang akan berubah (roadmap v4)

| Fitur | Phase | Dampak ke user |
| --- | --- | --- |
| TunasFlow penuh (automation, versioning) | 3 | Approval & routing lebih kaya |
| Studio → kernel publish | 4 | Desain tanpa localStorage |
| Capability packages | 5–7 | Modul CMMS, WMS, ITSM ter-install |
| **Industrial Ontology** | **8** | Sistem paham relasi & dampak operasi |
| **AI Composer + agents** | **9–10** | Asisten kontekstual dari data runtime |
| Autonomous enterprise (vision) | 11 | AI assist — human tetap governance |

Ontology dan AI **belum ada di produk** — jangan dijanjikan ke user sampai Phase 8+ live.

---

## 11. Checklist: UI vs handbook

Standar lengkap: **`docs/design/UI_UX_STANDARDS.md`** dan **`README.md` §15A**.

Ke depan, konten berikut **pindah dari UI ke handbook** (UI hanya label singkat + HelpTip max 120 karakter):

- [x] Paragraf panjang di Metadata Designer overview (`AdminGuidePanel` removed)
- [x] Intro paragraphs di Create Application & designer pages
- [ ] Deskripsi panjang di Metadata Designer overview cards (done — card one-liners only)
- [ ] Help tip multi-kalimat di Studio forms (ongoing — PropertyPanel)
- [ ] Eyebrow/subtitle panjang di workspace header
- [ ] Persona card di landing (bisa link ke handbook)

UI tetap punya: label field, nama tombol, error singkat (1 baris).

---

## 12. Referensi

- `00_REDI_OS_CONCEPT.md`
- `docs/handbook/README.md` — indeks & rencana chapter
- `docs/phase/PHASE_2_VALIDATION.md` — acceptance fitur live
