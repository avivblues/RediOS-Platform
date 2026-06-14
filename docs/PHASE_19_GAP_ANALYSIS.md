# Analisis Gap Phase 19

Referensi: `docs/REDIOS_BLUEPRINT.md`  
Scope: Studio, Builder, Metadata Designer, Publish Flow, dan Published Runtime Phase 19  
Tanggal Status: 2026-06-14

---

## 1. Ringkasan

Phase 19 sudah membawa RediOS ke arah yang benar:

- Visual Application Builder sudah ada.
- Metadata Designer workspace sudah ada.
- Data, Action, Connector, Process, Menu, Security, dan Custom Organism Designer sudah ada.
- Application scoping sudah ada untuk metadata utama.
- Builder dapat menyimpan UI metadata dan sync basic DATA/ACTION metadata.
- Publish sudah membawa application metadata dan screen canvases.
- Published runtime bisa render menu dan screen canvas dari metadata lokal.

Namun Phase 19 belum menjadi metadata-driven application platform yang lengkap.

Gap terbesar sebelum Phase 20:

- Query Designer belum ada.
- View Builder belum ada.
- Runtime masih memakai demo localStorage persistence.
- Runtime belum enforce security metadata.
- Action execution masih berbasis string step sederhana.
- Connector metadata sudah dipackage, tetapi belum dieksekusi lewat runtime connector engine.
- Publish validation belum lengkap.
- Screen/draft sync masih partial dan perlu validasi semua screen.

---

## 2. Yang Sudah Benar

### 2.1 Arah Core Platform

Status: sudah benar

RediOS sekarang sudah diarahkan sebagai metadata-driven application platform, bukan ERP module hardcoded.

Bukti:

- Studio memiliki Advanced Mode designers.
- Builder membuat UI metadata.
- Published runtime membaca metadata package.
- Backend runtime sudah memiliki generic runtime endpoints.

### 2.2 Visual Application Builder

Status: sudah benar untuk prototype Phase 19

Sudah ada:

- Canvas builder
- Component panel
- Property panel
- Tree/data binding panel
- Theme tab
- Export metadata preview
- Application selector
- Screen/Form selector
- Screen-scoped drafts
- Save confirmation
- Publish action

Prinsip yang sudah benar:

- Builder visual-first.
- Builder tidak memaksa user membuat database dulu.
- Component bisa bind ke metadata.

Gap:

- Builder masih membutuhkan contract validation yang lebih kuat sebelum publish.

### 2.3 Data Designer

Status: sudah benar untuk basic object/attribute metadata

Sudah ada:

- Data Object application-scoped
- Attribute list
- Inline editing
- Extended data types
- JSON type
- Confirmation modals
- Entry object/attribute dengan gaya autocomplete
- Builder Save dapat sync field metadata dari visual components

Prinsip yang sudah benar:

- Data Designer mendefinisikan business object metadata.

Gap:

- Stable `code` dan display `label` belum dipisah.
- Dependency impact belum ada.
- Runtime database schema generation belum complete.

### 2.4 Prinsip Action Binding

Status: sudah benar secara konsep

Sudah ada:

- Button/Event settings bind ke Action Metadata.
- Confirmation settings bind ke action behavior.
- Button tidak langsung memilih API.
- Connector dirancang dipanggil oleh Action step.

Prinsip yang benar:

```text
Button -> Action -> Connector/API
```

Gap:

- Runtime action execution masih interpreter string-step sederhana.

### 2.5 Menu Terhubung ke Screen Registry

Status: sudah benar untuk linkage metadata

Sudah ada:

- Menu Designer application-scoped.
- Menu item dapat memilih screen/form yang terdaftar.
- Runtime memakai `menu.screen` untuk memilih `screenCanvases`.

Gap:

- Runtime URL belum sepenuhnya digenerate sebagai `/app/{app}/{menu}` route metadata.
- Menu permission belum dienforce.

### 2.6 Publish Package Memiliki Screen Canvases

Status: sudah benar untuk prototype saat ini

Sudah ada:

- `StudioApplicationMetadataPackage` memiliki `screenCanvases`.
- Publish membawa data objects, actions, connectors, processes, menu, screens, security, custom organisms, canvas, screen canvases, theme.
- Published runtime bisa render canvas per screen berdasarkan menu.

Gap:

- Publish masih localStorage-only.
- Publish belum memiliki formal validation dan versioning.
- All-screen metadata sync belum lengkap.

---

## 3. Yang Masih Partial

### 3.1 Metadata Designer Workspace

Status: PARTIAL

Sudah ada:

- Overview page
- Data Designer
- Action Designer
- Connector Designer
- Process Designer
- Menu Designer
- Security Designer
- Custom Organisms
- Navigasi berbasis menu

Gap:

- Belum ada top-level Application Workspace summary.
- Tiap designer masih punya pola app selector masing-masing, belum satu shared application context provider.
- Belum ada cross-metadata validation.
- Belum ada dependency graph.

Sebelum Phase 20:

- Tambahkan shared application context.
- Tambahkan metadata health/validation summary.

### 3.2 Builder Save Sync

Status: PARTIAL

Sudah ada:

- Save sync visual inputs screen aktif menjadi Data Object attributes.
- Save sync Button/Event action labels menjadi Action metadata.
- Save refresh opsi Data/Action di Builder.

Gap:

- Sync saat ini fokus pada active screen components.
- Saat pindah screen, draft tersimpan tetapi Data/Action metadata belum selalu ikut sync.
- Existing attribute type belum ikut update saat component type berubah.
- Attribute name masih berasal dari label tanpa stable metadata code.

Sebelum Phase 20:

- Sync semua screen draft saat save/publish.
- Tambahkan dependency impact dan aturan perubahan type.

### 3.3 Action Designer

Status: PARTIAL

Sudah ada:

- Action application-scoped
- Trigger types
- Step strings
- Shortcut connector step
- Delete confirmation
- Builder dapat auto-create action metadata

Gap:

- Step masih string, belum structured metadata.
- Confirmation masih tersimpan di component, belum sepenuhnya dinormalisasi ke action step metadata.
- Belum ada action validation editor.
- Belum ada konfigurasi notification/refresh.
- Belum ada action runtime transaction model.

Arah yang dibutuhkan:

```text
ActionStep {
  type: VALIDATE | CONFIRM | SAVE | CALL_CONNECTOR | NOTIFY | REFRESH | NAVIGATE
  config: object
}
```

### 3.4 Connector Designer

Status: PARTIAL

Sudah ada:

- Connector metadata application-scoped
- Method, URL, auth mode
- Action mapping
- Generated API labels berdasarkan data objects
- Delete confirmation

Gap:

- Connector belum dieksekusi di published runtime.
- Auth secrets belum disimpan secara aman.
- Belum ada connector test execution dari Studio.
- Belum ada payload mapping.
- Belum ada response mapping.

Sebelum Phase 20:

- Connector harus berjalan lewat generic Connector Engine.
- Connector hanya boleh dipanggil oleh Action/Integration metadata.

### 3.5 Process Designer

Status: PARTIAL

Sudah ada:

- Process draft application-scoped
- Steps, approver, condition
- Delete confirmation

Gap:

- Runtime process state belum connected.
- Approval inbox belum ada.
- Organization hierarchy model belum ada.
- Delegation execution belum ada.
- Belum ada link kuat antara Action dan Process trigger.

### 3.6 Security Designer

Status: PARTIAL

Sudah ada:

- Role metadata application-scoped
- Permissions
- Bentuk field access object
- Action access
- Power user flag
- Delete confirmation

Gap:

- Runtime belum enforce permission.
- Menu permission masih ditampilkan, belum diguard.
- Field/action access belum dienforce.
- Power User boundary belum dienforce.

Sebelum Phase 20:

- Runtime permission guard wajib diimplementasikan untuk menu, view, action, dan field.

### 3.7 Custom Organisms

Status: PARTIAL

Sudah ada:

- Custom organism draft application-scoped
- Daftar composition component
- Muncul di Builder toolbox sesuai app scope

Gap:

- Composition saat ini masih daftar component type, bukan full nested component metadata.
- Belum ada safe editable boundary untuk Power User.
- Belum ada versioning atau dependency impact.

### 3.8 Runtime Renderer

Status: PARTIAL

Sudah ada:

- Published app shell
- Sidebar menu
- Header
- Breadcrumb-like metadata pills
- Active menu memilih screen canvas
- Form inputs render dari canvas
- Button melakukan basic action lookup
- Confirmation modal render dari metadata
- Demo save persist ke localStorage

Gap:

- Runtime save belum memakai backend universal runtime API.
- Runtime query loading belum ada.
- Runtime table/list view belum diimplementasikan dari Query Metadata.
- Permission guard belum dienforce.
- Notification masih berupa status text.
- User profile masih placeholder.
- Connector execution baru "prepared" text, belum real execution.

### 3.9 Publish Flow

Status: PARTIAL

Sudah ada:

- Publish menulis local metadata package.
- Published app dapat dibuka di `/apps/{slug}`.
- Package mencakup screen canvas map.
- Package mencakup metadata domain utama.

Gap:

- Belum ada publish validation.
- Belum ada backend publish registry.
- Belum ada metadata versioning.
- Belum ada rollback.
- Belum ada acceptance test automation.
- Belum ada complete all-screen sync sebelum package dibuat.

---

## 4. Yang Masih Missing Sebelum Phase 20

### 4.1 Query Designer

Status: MISSING

Wajib sesuai blueprint.

Tujuan:

- reusable data source
- table datasource
- dropdown datasource
- autocomplete datasource
- report datasource
- dashboard datasource

Harus mendukung:

- source object
- selected fields
- joins/lookups
- filters
- sort
- pagination
- permissions
- runtime endpoint

Contoh:

```text
Active Product List
Source: Product
Filter: status = ACTIVE
Runtime: GET /runtime/query/product.active
```

### 4.2 View Builder

Status: MISSING

Wajib sesuai blueprint.

Tujuan:

- menampilkan data dari Query Metadata

Harus mendukung:

- Table
- List
- Card
- Kanban
- Dashboard
- Row actions
- Create button
- Open detail/form action

Builder saat ini masih dominan Form Builder plus general canvas. Harus dipisah jelas menjadi:

- Form Builder
- View Builder

### 4.3 Runtime Query Execution

Status: MISSING

Runtime wajib menjalankan Query Metadata dan mengembalikan data untuk:

- table
- list
- dropdown
- autocomplete
- dashboard

### 4.4 Runtime Permission Guard

Status: MISSING

Runtime wajib enforce:

- application access
- menu access
- view access
- action access
- field visibility
- field editability

### 4.5 Runtime Backend Persistence Dari Published App

Status: MISSING

Published app saat ini menyimpan ke localStorage.

Yang dibutuhkan:

```text
POST /runtime/:entityCode/create
PATCH /runtime/:entityCode/:id
GET /runtime/query/:queryCode
POST /runtime/:entityCode/:id/actions/:actionCode
```

### 4.6 Structured Action Runtime

Status: MISSING

Action execution wajib mendukung:

- validate
- confirm
- save
- call connector
- process transition
- notify
- refresh view
- navigate

String steps saat ini belum cukup untuk Phase 20.

### 4.7 Power User Protection

Status: MISSING

Power User customization harus terpisah dari core metadata.

Dibutuhkan:

- protected fields
- custom field overlay
- layout override overlay
- permission-limited customization
- revert to standard metadata

---

## 5. Gap Acceptance Test

Acceptance test dari blueprint:

```text
Create application: Asset Maintenance
1. Create Product Object
2. Create Product Query
3. Create Product Form
4. Create Product View
5. Create Save Action
6. Add Confirm Modal
7. Create Menu
8. Assign Permission
9. Publish
```

Kemampuan saat ini:

| Step | Status | Catatan |
| --- | --- | --- |
| Create Product Object | DONE | Data Designer mendukung object/attributes. |
| Create Product Query | MISSING | Query Designer belum ada. |
| Create Product Form | PARTIAL | Form Builder/canvas mendukung input screen. |
| Create Product View | MISSING | View Builder dan table query binding belum ada. |
| Create Save Action | PARTIAL | Action Designer dan auto-sync ada, tetapi structured action runtime belum ada. |
| Add Confirm Modal | PARTIAL | Button confirmation runtime ada dari component metadata; action-level modal model belum lengkap. |
| Create Menu | PARTIAL | Menu link ke screen; runtime route/permission validation belum lengkap. |
| Assign Permission | PARTIAL | Security metadata ada; runtime enforcement belum ada. |
| Publish | PARTIAL | Local publish berjalan; backend publish/version/validation belum ada. |

Expected runtime:

| Expected Runtime Behavior | Status | Catatan |
| --- | --- | --- |
| Menu appears | PARTIAL | Sidebar render menu metadata. |
| Table loads database | MISSING | Query/View runtime belum ada. |
| Create button opens form | MISSING | View-to-form action flow belum ada. |
| Save opens confirmation | PARTIAL | Button confirmation berjalan dari component metadata. |
| Confirm saves database | PARTIAL | Menyimpan demo localStorage, belum backend database. |
| Data refreshes | MISSING | Query/view refresh belum ada. |
| Permission works | MISSING | Runtime guard belum ada. |

---

## 6. Rekomendasi Urutan Phase 20

Jangan menambah UI yang tidak terkait sebelum fondasi ini selesai.

1. Query Designer dan Query Metadata.
2. View Builder dengan table/list yang bind ke Query Metadata.
3. Structured Action Step model.
4. Runtime Action Executor.
5. Runtime Query Executor.
6. Runtime Permission Guard.
7. Backend publish registry/versioning.
8. Power User customization overlay.
9. Acceptance test automation.

---

## 7. Aturan Development Untuk Fase Berikutnya

Sebelum coding Phase 20:

1. Baca `docs/REDIOS_BLUEPRINT.md`.
2. Pilih satu acceptance test gap.
3. Implementasikan metadata terlebih dahulu.
4. Implementasikan renderer/runtime setelah metadata jelas.
5. Validasi publish package.
6. Validasi runtime behavior.

Tidak boleh menerima fitur yang hanya UI tanpa metadata/runtime contract.

