# 02 — Persona: System Admin

**Versi handbook:** 1.0  
**Audience:** System Administrator platform RediOS  
**Prasyarat:** `00_REDI_OS_CONCEPT.md`, `01_HOW_REDI_WORKS.md`

---

## 1. Peran System Admin

System Admin adalah **pemilik platform** — bukan sekadar user bisnis. Tanggung jawab utama:

| Area | Apa yang Anda lakukan |
| --- | --- |
| **Governance** | User, role, tenant, capability |
| **Experience platform** | Workspace admin, inbox platform, notification |
| **Aplikasi baru** | Membuat aplikasi via Studio (UI + metadata draft) |
| **Workflow & process** | Mendefinisikan lifecycle dokumen, approval, human task |
| **Publish & runtime** | Menghubungkan desain ke kernel (seed/API publish) |
| **Operasi** | Monitor exception lewat inbox & notification |

Setelah login, persona **SYSTEM_ADMIN** → workspace **System Control Center** → `homeRoute` `/workspace`.

### Capability yang Anda miliki

| Capability | Arti praktis |
| --- | --- |
| `platform.*` | Kontrol penuh platform |
| `metadata.*` | Semua metadata designer |
| `builder.*` | Studio builder penuh |
| `workflow.*` | Workflow & process |
| `runtime.*` | Runtime transaksi |
| Role `SYSTEM_ADMIN` | Merge dari JWT permissions (`*` → wildcard di atas) |

Anda juga punya akses **Studio penuh**: builder, metadata, query, API, create app — sama seperti Programmer.

---

## 2. System Control Center (workspace harian)

**URL:** `/workspace`

| Panel | Fungsi admin |
| --- | --- |
| **User Management** | `/apps/redios-admin` — kelola user platform |
| **RediOS Studio** | `/studio` — desain aplikasi |
| **Universal Inbox** | Task platform (approval demo, verifikasi work order) |
| **Action Center** | Shortcut aksi entity (Work Order, dll.) |
| **Notifications** | Alert event platform |
| **Capability Registry** | Link ke runtime contoh (Work Order) |

**Tip operasional:** Mulai hari dari inbox + notifications, bukan dari menu runtime.

---

## 3. Peta mental: komponen satu aplikasi RediOS

Sebelum membuat aplikasi atau workflow, pahami lapisan metadata:

```
┌─────────────────────────────────────────────────────────┐
│  EXPERIENCE (Phase 2)                                   │
│  Workspace · Persona · Inbox · Notifications            │
├─────────────────────────────────────────────────────────┤
│  STUDIO UI (Phase 4 — sebagian live)                    │
│  Screens · Forms · Menu · Visual builder                │
├─────────────────────────────────────────────────────────┤
│  METADATA BLUEPRINT                                     │
│  Entity/Data · Action · Process · Menu · Security       │
├─────────────────────────────────────────────────────────┤
│  RUNTIME KERNEL (Phase 1)                               │
│  Workflow (state/transition) · Process (steps) · Event  │
│  Storage · Security · Event bus                         │
└─────────────────────────────────────────────────────────┘
```

| Konsep | Analogi | Contoh |
| --- | --- | --- |
| **Entity / Data Object** | “Tabel” bisnis | Work Order, Asset, Purchase Request |
| **Workflow** | Status dokumen | OPEN → IN_PROGRESS → DONE |
| **Action** | Tombol yang user tekan | START, COMPLETE, APPROVE |
| **Process** | Apa yang terjadi setelah action | Validasi → Human task → Event |
| **Event** | Side effect | Notifikasi supervisor, audit log |
| **Human task** | Item di universal inbox | “Verify work order start” |
| **Menu / Screen** | Navigasi & layout UI | Sidebar, form page |
| **Security** | Role & permission entity | Siapa boleh START |

**Workflow ≠ Process (Studio):**

- **Workflow (kernel):** state machine resmi dokumen — disimpan sebagai metadata `WORKFLOW` di API/Mongo.
- **Process (Studio designer):** draft alur approval bisnis di browser — saat ini **localStorage** per aplikasi Studio.
- **Process (kernel):** metadata `PROCESS` yang dieksekusi runtime saat action jalan — contoh `WORK_ORDER_START_PROCESS`.

---

## 4. Membuat aplikasi baru — panduan lengkap

### 4.1 Kapan pakai jalur mana?

| Kebutuhan | Jalur | Hasil |
| --- | --- | --- |
| App UI cepat (form, dashboard) | **Create Application** + Builder | Draft di browser, preview `/apps/{slug}` |
| Entity + field bisnis | **Metadata → Data Designer** | Data object draft |
| Tombol & alur UI | **Metadata → Action Designer** | Action draft |
| Approval bisnis (konsep) | **Metadata → Process Designer** | Process draft |
| Menu navigasi | **Metadata → Menu Designer** | Menu draft |
| Role & permission app | **Metadata → Security Designer** |
| **Production kernel** (runtime API) | **Metadata seed / Designer Publish API** | Mongo + runtime executor |

> **Penting (status saat ini):** Studio menyimpan draft di **localStorage browser**. Runtime production (contoh Work Order di VPS) memakai metadata di **Mongo** via seed atau `POST /api/designer/generated/publish`. Admin perlu tahu kedua jalur ini.

---

### 4.2 Jalur A — Aplikasi visual (disarankan untuk mulai)

**Tujuan:** Aplikasi dengan layar drag-and-drop tanpa coding.

#### Langkah 1 — Create Application

1. Login sebagai admin
2. Buka **`/studio/create`**
3. Isi:
   - **Application Name** — nama proses bisnis, mis. `Asset Maintenance`, `Inventory Request`
   - **Runtime Target** — `Web` atau `Android`
   - **Starter Experience:**
     - **Blank Experience** — kosong
     - **Inventory Experience** — product, stock, dashboard starter
     - **Service Experience** — ticket, assignment, timeline starter
4. Klik **Create and Open Builder**

#### Langkah 2 — Visual Builder

1. Di **`/studio`** (web) atau **`/studio/builder/android`**
2. Drag komponen ke canvas: Form, Table, Dashboard, Button, dll.
3. Bind field ke data object (jika sudah ada di Data Designer)
4. Simpan layout — tersimpan di localStorage aplikasi aktif

#### Langkah 3 — Advanced metadata (opsional tapi disarankan)

Buka **`/studio/metadata`** per area:

| Section | URL | Isi |
| --- | --- | --- |
| Data | `/studio/metadata/data` | Object & attribute |
| Action | `/studio/metadata/action` | Trigger & step action |
| Process | `/studio/metadata/process` | Approval routing konsep |
| Menu | `/studio/metadata/menu` | Sidebar / navigasi |
| Security | `/studio/metadata/security` | Role & permission app |
| Workspace | `/studio/metadata/workspace` | Panel workspace platform |
| Organisms | `/studio/metadata/organisms` | Blok reusable builder |

#### Langkah 4 — Preview aplikasi

- Generated app shell: **`/apps/{application-slug}`**
- Contoh admin app: **`/apps/redios-admin`**

#### Langkah 5 — Publish ke kernel (production)

Saat blueprint siap, metadata harus masuk kernel:

1. **Designer Publish API** — `POST /api/designer/generated/publish` (via Studio expert / legacy wizard)
2. Atau **metadata seed** di server (tim engineering) untuk environment VPS

Tanpa publish, aplikasi hanya ada di browser yang sama (localStorage).

---

### 4.3 Jalur B — Extend aplikasi demo (Asset Maintenance)

Platform demo sudah punya **`ASSET_MAINTENANCE`** dengan entity:

- `WORK_ORDER`, `ASSET`, dll.

Admin bisa:

1. Buka **`/runtime/WORK_ORDER`** — lihat lifecycle existing
2. Buka **`/studio/metadata`** — pilih application aktif atau buat app baru
3. Extend data object / action / process di Studio draft
4. Untuk perubahan production, koordinasi publish ke kernel

---

### 4.4 Checklist aplikasi baru

```
[ ] Nama aplikasi & target (web/android) ditentukan
[ ] Data object & field didefinisikan
[ ] Screen/form di builder
[ ] Menu navigasi
[ ] Action terhubung ke trigger UI
[ ] Process approval (jika ada)
[ ] Security role di-set
[ ] Uji preview /apps/{slug}
[ ] Publish ke kernel (API/seed)
[ ] Uji runtime dengan user Manager/Staff
[ ] Panel workspace di-update jika perlu (link ke app baru)
```

---

## 5. Membuat workflow baru — panduan lengkap

Workflow di RediOS = **Workflow (status)** + **Process (langkah)** + **Event (efek samping)**.

### 5.1 Contoh referensi: Work Order (production)

Entity **`WORK_ORDER`** di kernel:

**A. Workflow — lifecycle status**

```
OPEN ──START──► IN_PROGRESS ──COMPLETE──► DONE
  │
  └──CANCEL──► CANCELLED
```

| State | Arti |
| --- | --- |
| OPEN | Work order baru, belum dikerjakan |
| IN_PROGRESS | Sedang dikerjakan |
| DONE | Selesai |
| CANCELLED | Dibatalkan |

| Transition | Action code | From → To |
| --- | --- | --- |
| START | `START` | OPEN → IN_PROGRESS |
| COMPLETE | `COMPLETE` | IN_PROGRESS → DONE |
| CANCEL | `CANCEL` | OPEN → CANCELLED |

**B. Process — setelah action START**

Process `WORK_ORDER_START_PROCESS` (trigger: action `START`, state `IN_PROGRESS`):

| Order | Step type | Fungsi |
| --- | --- | --- |
| 1 | VALIDATION | Validasi field |
| 2 | HUMAN_TASK | Task inbox supervisor: “Verify work order start” |
| 3 | EVENT | Publish event ke event bus |

**C. Event — setelah process**

Event `WORK_ORDER_STARTED_EVENT`:

| Handler | Tipe | Efek |
| --- | --- | --- |
| NOTIFY_SUPERVISOR | NOTIFICATION | Alert ke role SUPERVISOR |
| TRACK_CHANGE | AUDIT_LOG | Jejak audit |

**D. Dampak ke user**

1. Staff/manager: START work order di runtime
2. Status → IN_PROGRESS
3. Human task muncul di **inbox** admin/supervisor
4. Notification muncul di **notification center**
5. Supervisor: Complete task di inbox atau lanjut verifikasi di runtime

---

### 5.2 Membuat workflow baru — langkah admin

#### Opsi 1 — Process Designer (Studio, konsep approval)

**URL:** `/studio/metadata/process`

Cocok untuk **merancang alur approval bisnis** sebelum diimplementasi di kernel.

1. Pilih **Application** aktif (dropdown)
2. Isi **Process label** — mis. `Purchase Request`
3. Isi **Description**
4. Klik **Create Process** — otomatis dapat step Submit + Done
5. Tambah step approval:
   - **Step label:** `Supervisor Approval`
   - **Approver:** `Supervisor` (role/konsep)
   - **Condition:** `amount > 1000` (opsional)
6. Ulangi untuk step Manager, Finance, dll.

> Draft ini **belum** otomatis jadi runtime kernel. Gunakan sebagai **blueprint** untuk tim analyst atau untuk Phase 3 TunasFlow visual.

#### Opsi 2 — Metadata blueprint lengkap (production)

Untuk workflow yang **benar-benar jalan** di runtime API, definisikan di metadata kernel:

| Metadata type | Isi |
| --- | --- |
| `ENTITY` | Field, actionCodes |
| `WORKFLOW` | states, transitions |
| `PROCESS` | steps (VALIDATION, HUMAN_TASK, EVENT, …) |
| `EVENT` | handlers (NOTIFICATION, HUMAN_TASK, WORKFLOW, …) |
| `BUSINESS` | rules per process step (opsional) |
| `SECURITY_POLICY` | siapa boleh action apa |

**Alur desain (disarankan):**

```
1. Tentukan ENTITY + field
2. Gambar workflow state (OPEN → … → DONE)
3. Tentukan action code per transition
4. Tentukan process per action (step list)
5. Tentukan event & notification per process
6. Tentukan human task (assignee role) untuk approval
7. Seed / publish metadata
8. Compile runtime package (otomatis di seed runner)
9. Uji: POST /api/runtime/{ENTITY}/{id}/actions/{ACTION}
10. Verifikasi inbox + notification sebagai Manager/Admin
```

#### Opsi 3 — Extend Work Order (cepat belajar)

1. Login admin → `/runtime/WORK_ORDER`
2. Buat atau buka work order
3. Jalankan **START**
4. Buka `/workspace` → lihat inbox & notifications
5. Complete human task
6. Jalankan **COMPLETE** → status DONE

Ini memvalidasi pipeline workflow end-to-end tanpa menulis metadata baru.

---

### 5.3 Template workflow: Purchase Request Approval

Use case: karyawan ajukan pembelian, supervisor & manager approve.

**Entity:** `PURCHASE_REQUEST`

| Field | Tipe |
| --- | --- |
| title | string |
| amount | currency |
| requester | string |
| status | (dari workflow) |

**Workflow:**

```
DRAFT ──SUBMIT──► SUBMITTED ──APPROVE──► APPROVED ──PO_CREATED──► CLOSED
                      │
                      └──REJECT──► REJECTED
```

**Process `PR_SUBMIT_PROCESS`** (trigger: SUBMIT, state SUBMITTED):

| Step | Type | Config |
| --- | --- | --- |
| VALIDATE | VALIDATION | amount, title required |
| HUMAN_TASK | HUMAN_TASK | title: “Supervisor approval”, assigneeRoles: [`SUPERVISOR`] |
| EVENT | EVENT | publish PR_SUBMITTED_EVENT |

**Event `PR_SUBMITTED_EVENT`:**

| Handler | Config |
| --- | --- |
| NOTIFICATION | targetRole: SUPERVISOR, message: “New purchase request” |

**Process `PR_APPROVE_PROCESS`** (trigger: APPROVE, state APPROVED):

| Step | Type |
| --- | --- |
| HUMAN_TASK | Manager final approval jika amount > 10_000_000 |
| EVENT | Notify finance |

> Implementasi penuh memerlukan metadata seed/publish — gunakan template ini saat briefing Programmer atau saat menulis seed record.

---

### 5.4 Human task & universal inbox

Setiap approval sebaiknya jadi **human task**, bukan menu terpisah.

| Config process step | Arti |
| --- | --- |
| `title` | Judul di inbox |
| `assigneeRoles` | Role yang melihat task (SUPERVISOR, MANAGER, SYSTEM_ADMIN) |
| `actionCode` | Aksi saat complete (APPROVE, COMPLETE) |
| `priority` | HIGH / NORMAL |

Admin melihat task di **System Control Center → Universal Inbox**.  
Complete via tombol **Complete** atau API `PATCH /experience/inbox/human_{id}/complete`.

---

## 6. Metadata designer — urutan disarankan

Saat membangun aplikasi dari nol di **`/studio/metadata`**:

```
1. Data Designer      → object & attribute
2. Action Designer    → trigger & steps
3. Process Designer   → approval flow (draft)
4. Menu Designer      → navigasi runtime
5. Security Designer  → role & permission
6. Visual Builder     → layout screen
7. Query Builder      → datasource table/report (/studio/query)
8. API Builder        → connector external (/studio/api)
9. Workspace Designer → panel workspace platform (/studio/metadata/workspace)
10. Publish           → kernel API
```

**Jangan** mulai dari menu atau form kosong tanpa data object — binding akan sulit.

---

## 7. Mengelola workspace platform

**URL:** `/studio/metadata/workspace`

Admin dapat:

1. Load workspace metadata dari API (`GET /experience/workspaces`)
2. Edit panel (INBOX, ACTIONS, LINK, METRIC, NOTIFICATIONS)
3. Set **required capabilities** per panel
4. **Publish to Platform** → `PUT /experience/workspaces/{code}`

Contoh: tambah panel link ke aplikasi baru di **MANAGEMENT_WORKSPACE** untuk Manager.

---

## 8. User & identity management

**URL:** `/apps/redios-admin`

| Tugas | Catatan |
| --- | --- |
| Buat user | Email, display name, password |
| Assign role | SYSTEM_ADMIN, MANAGER, STAFF, … |
| Role → persona | Role menentukan persona & workspace saat login |

**Demo login:** `admin@redios.local` / `admin123` (SYSTEM_ADMIN)

Setelah ubah role user, minta user **login ulang** agar JWT & persona refresh.

---

## 9. Studio — peta URL admin

| URL | Fungsi |
| --- | --- |
| `/studio` | Visual builder (web) |
| `/studio/create` | Buat aplikasi baru |
| `/studio/metadata` | Overview metadata designer |
| `/studio/metadata/data` | Data object |
| `/studio/metadata/action` | Action |
| `/studio/metadata/process` | Process / approval draft |
| `/studio/metadata/menu` | Menu |
| `/studio/metadata/security` | Security |
| `/studio/metadata/workspace` | Workspace platform |
| `/studio/metadata/organisms` | Custom components |
| `/studio/query` | Query builder |
| `/studio/api` | API / connector builder |

---

## 10. Troubleshooting admin

| Masalah | Penyebab | Solusi |
| --- | --- | --- |
| Workspace error / internal server error | JWT expired (~8 jam) | Login ulang `/login` |
| Aplikasi Studio hilang | localStorage browser beda/cleared | Buat ulang atau export draft (belum ada export UI — hindari clear storage) |
| Runtime Work Order OK, app Studio tidak | Belum publish ke kernel | Publish via designer API atau seed |
| Process Studio tidak jalan di inbox | Process draft ≠ kernel PROCESS | Implementasi kernel metadata + HUMAN_TASK step |
| Inbox kosong setelah START WO | Role bukan assignee | Cek assigneeRoles di process step |
| User tidak bisa Studio | Persona Staff | Ubah role ke ANALYST/ADMIN |
| Panel Studio tidak muncul di workspace | Capability | Normal — cek persona capabilities |

---

## 11. Batasan platform (jujur untuk admin)

| Fitur | Status | Implikasi admin |
| --- | --- | --- |
| Studio draft | localStorage | Ganti browser = draft hilang |
| Designer publish API | Ada, integrasi Studio partial | Production butuh langkah publish eksplisit |
| TunasFlow visual | Phase 3 | Process designer Studio = blueprint, bukan engine penuh |
| Modul industri (ERP/WMS) | Phase 7 | Pakai template demo + extend metadata |
| AI assistant | Phase 8 | Pakai handbook + support manual |

---

## 12. Playbook singkat

### Playbook A — “Saya mau app inventory sederhana”

1. `/studio/create` → Inventory Experience → Web
2. Builder: edit product screen
3. `/studio/metadata/data` → cek object Product
4. `/studio/metadata/menu` → sesuaikan menu
5. Preview `/apps/{slug}`
6. (Production) publish metadata ke kernel

### Playbook B — “Saya mau approval purchase request”

1. `/studio/metadata/process` → buat Purchase Request + steps
2. Dokumentasikan state workflow (DRAFT → SUBMITTED → APPROVED)
3. Minta Programmer/seed: ENTITY + WORKFLOW + PROCESS + HUMAN_TASK + EVENT
4. Uji sebagai Manager: submit → inbox → approve
5. Tambah notification handler untuk supervisor

### Playbook C — “Saya mau monitor operasi harian”

1. Login → `/workspace`
2. Cek inbox + notifications
3. Buka Work Orders / Assets dari panel link
4. `/notifications` untuk detail alert
5. Assign role user lewat redios-admin jika ada kendala akses

---

## 13. Referensi

| Dokumen | Isi |
| --- | --- |
| `00_REDI_OS_CONCEPT.md` | Filosofi platform |
| `01_HOW_REDI_WORKS.md` | Alur login & workspace |
| `docs/phase/PHASE_2_VALIDATION.md` | Fitur experience live |
| `docs/phase/PHASE_3_TUNASFLOW_RUNTIME.md` | Rencana workflow engine penuh |
| `docs/phase/PHASE_4_REDI_STUDIO.md` | Rencana Studio terintegrasi |
| `apps/api/src/seed/metadata-seed.records.ts` | Contoh metadata WORK_ORDER production |

---

*Chapter berikutnya: `03_PERSONA_PROGRAMMER.md` — fokus publish metadata & integrasi kernel.*
