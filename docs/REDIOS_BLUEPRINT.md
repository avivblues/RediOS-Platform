# Blueprint RediOS

Status: Sumber Kebenaran Utama  
Pembaca: AI agent, developer, product owner, system analyst  
Aturan: baca dokumen ini sebelum mengerjakan fase berikutnya.

---

## 1. Tujuan Dokumen

Dokumen ini adalah kontrak arsitektur RediOS.

Sebelum mengerjakan fase baru:

1. Baca blueprint ini.
2. Cari use case yang terkait.
3. Validasi bahwa rencana implementasi mengikuti arsitektur.
4. Update blueprint ini jika use case belum tercatat.
5. Coding hanya setelah arsitektur jelas.
6. Verifikasi acceptance test.

Jangan membuat UI saja.

Setiap komponen atau fitur wajib menjawab:

- Data-nya dari mana?
- Action-nya apa?
- Permission-nya bagaimana?
- Runtime behavior-nya seperti apa?

---

## 2. Visi Utama RediOS

RediOS bukan form builder.

RediOS adalah platform aplikasi berbasis metadata.

Prinsip utama:

> User tidak membangun database. User membangun experience. RediOS mengubah experience tersebut menjadi metadata dan runtime behavior.

RediOS memisahkan:

- definisi aplikasi
- definisi data bisnis
- user experience
- business action
- connector/API metadata
- process/workflow
- permission/security
- runtime execution

### 2.1 Hybrid ERP Architecture (Phase 19.99)

RediOS bukan pure metadata database.

RediOS adalah:

```text
Enterprise Domain Core + Metadata Customization Layer
```

| Layer | Owner | Contoh |
| --- | --- | --- |
| Domain Core | Developer | Finance journal, inventory stock, tenant, platform user |
| Metadata | System Analyst | Form, menu, screen, action binding, workflow |
| Extension | Power User | Custom field, label, layout |

Stack runtime:

```text
Visual Builder → Metadata → Capability Registry → Domain Runtime → Real Database
```

Dokumen boundary lengkap: `docs/ARCHITECTURE_BOUNDARY.md`

**Domain vs Metadata:**

- Journal GL disimpan di tabel `gl_journal_header` / `gl_journal_line` (domain).
- Layout form journal disimpan di metadata form.
- Tombol Post memanggil capability `JOURNAL.POST`, bukan API langsung.

**Capability Pattern:**

- Setiap action runtime wajib menunjuk `capabilityCode`.
- Registry: `GET /api/capabilities`, collection `capability_definitions`.
- Domain handler di `modules/{module}/capability/`.

**Extension Strategy:**

- System field locked di domain + metadata.
- Power User menambah custom field via `custom_field_definitions` / `custom_field_values`.
- Power User tidak boleh mengubah datatype system field atau domain logic.

User experience tetap metadata-driven. Domain logic tetap di developer-owned modules.

Tidak boleh ada screen bisnis hardcoded untuk aplikasi yang dibuat System Analyst.

Domain core module (Finance, Inventory) boleh punya service dan repository — tetapi screen dan action binding tetap metadata.

Arah yang dilarang:

```text
ProductController
InventoryService
AssetMaintenanceForm
TicketWorkflow
```

Arah yang benar:

```text
MetadataDefinition
RuntimeEngine
ActionEngine
QueryEngine
SecurityEngine
ProcessEngine
Renderer
```

---

## 3. Actor

### 3.1 System Analyst

System Analyst memiliki akses penuh dan bertanggung jawab membuat aplikasi bisnis.

Dapat mengakses:

- Data Designer
- Query Designer
- Action Designer
- Connector Designer
- Process Designer
- Menu Designer
- Security Designer
- Custom Organisms
- Application Builder

Membuat:

- data object
- business logic
- API metadata
- workflow/process
- struktur aplikasi
- form dan view definition
- menu
- permission

Contoh: Inventory Application.

System Analyst membuat:

- Product Object
- Product Form
- Product List View
- Product Query
- Save Product Action
- Approval Process
- Menu
- Permission

### 3.2 Power User

Power User dapat menyesuaikan aplikasi yang sudah berjalan secara aman.

Boleh:

- menambah custom field
- hide/show field
- mengubah layout
- menambah validation
- menambah approval rule
- menambah notification

Tidak boleh:

- menghapus core system field
- mengubah struktur database yang protected
- merusak standard metadata
- mengubah core API contract
- melewati permission guard

Core metadata wajib dilindungi.

### 3.3 End User

End User hanya menggunakan aplikasi yang dihasilkan.

End User dapat:

- membuka menu
- melihat data
- mengisi form
- menjalankan action
- approve/reject jika punya permission
- menerima notification

End User tidak boleh mengubah metadata aplikasi.

---

## 4. Alur Arsitektur

```text
SYSTEM ANALYST
      |
      v
METADATA ENGINE
      |
+-------------+-------------+-------------+
|             |             |             |
DATA          ACTION        API
Object        Event         Endpoint
Schema        Logic         Connector
      |
      v
APPLICATION BUILDER
+---------------------------+---------------------------+
|                           |                           |
FORM BUILDER                VIEW BUILDER
Input/Edit                  List/Table/Card/Kanban
      |
      v
RUNTIME ENGINE
      |
GENERATED APPLICATION
      |
DATABASE / EXTERNAL API
```

Metadata Engine adalah sumber kebenaran aplikasi.

Application Builder membuat user experience metadata. Builder tidak boleh berubah menjadi generator aplikasi hardcoded.

Runtime Engine membaca metadata dan menjalankan behavior.

---

## 5. Domain Metadata

### 5.0 Capability Registry

Capability Registry adalah pusat daftar kemampuan aplikasi yang sudah disetujui oleh System Analyst.

Implementasi foundation (Phase 19.99):

- Service: `apps/api/src/platform/capability/capability-registry.service.ts`
- Collection: `capability_definitions`
- API: `GET /api/capabilities`, `GET /api/capabilities/:code`
- Seed: `apps/api/src/seed/platform-seed.records.ts`

Format capability:

```json
{
  "code": "JOURNAL.POST",
  "name": "Post Journal",
  "module": "FINANCE",
  "inputSchema": {},
  "outputSchema": {},
  "implementationStatus": "CONTRACT"
}
```

Form Builder dan View Builder wajib membaca capability dari registry ini. Builder tidak boleh menciptakan core API, core database contract, atau core process sendiri.

**Builder Connection Rule:** Builder memilih capability dan mengikat action. Builder tidak membuat tabel database.

**Query Builder Rule:** Query Builder mengonsumsi Query Capability (contoh `FINANCE.TRIAL_BALANCE`). Query Builder tidak menghasilkan SQL acak untuk modul ERP.

Capability yang diekspos:

- DATA: contoh `Product`, `Customer`
- QUERY: contoh `Product List`, `Customer Lookup`
- ACTION: contoh `Save Product`, `Delete Product`
- API: contoh `Product Create API`, `Product Update API`
- PROCESS: contoh `Approval Flow`
- SECURITY: contoh `Permission Rules`

Aturan utama:

- System Analyst membuat dan mengelola capability.
- Power User memilih dan memakai capability yang tersedia.
- Jika capability belum ada, Power User membuat Capability Request.
- Capability Request dikirim ke System Analyst untuk dianalisis dan dibuatkan metadata resmi.

Contoh:

```text
Power User:
"Saya butuh Export Product Excel"

System:
Membuat Capability Request

System Analyst:
Membuat Export Product Capability

Power User:
Dapat memakai capability tersebut di Builder
```

Builder hanya boleh menampilkan capability yang tersedia di registry.

### 5.1 Application Metadata

Mendefinisikan satu generated application.

Berisi:

- application code
- application slug
- target platform
- data objects
- queries
- actions
- connectors
- processes
- menu
- security
- screens/views
- UI metadata
- theme

Application metadata wajib scoped per application.

Untuk production, scope wajib mencakup:

- tenantId
- domainCode
- applicationCode
- version
- publish status

### 5.2 Data Metadata

Mendefinisikan struktur business object.

Contoh:

```text
Object: Product

Attributes:
- name
- stock
- price
- status
```

Hasil:

- database schema metadata
- API contract
- sumber field binding
- sumber validation
- sumber query

#### 5.2.1 System Object

System Object adalah metadata object milik RediOS yang dipakai platform untuk membangun dirinya sendiri.

Contoh pertama:

```text
Object: USER
Type: SYSTEM_OBJECT
Owner: REDIOS
Locked: true
Upgrade safe: true
```

Aturan:

- Field sistem boleh tampil di Data Designer, tetapi wajib dilindungi.
- Power User boleh menambah custom field, mengganti label, mengubah posisi, dan menyembunyikan field.
- Power User tidak boleh menghapus, rename, atau mengganti tipe field sistem.
- Data system object tetap disimpan lewat runtime persistence yang sama dengan business object.
- API tidak dibuat sebagai controller khusus, tetapi muncul dari runtime object metadata.

Contoh capability yang digenerate dari `USER`:

```text
USER.CREATE
USER.UPDATE
USER.DELETE
USER.DISABLE
USER.LIST
USER.GET
```

Contoh route generic:

```text
POST /runtime/object/USER
GET /runtime/object/USER
PATCH /runtime/object/USER/{id}
```

### 5.3 Query Metadata

Mendefinisikan reusable data source.

Dipakai oleh:

- table
- dropdown
- autocomplete
- report
- dashboard
- list view
- card view

Contoh:

```text
Dataset: Active Product List
Source: Product
Fields:
- name
- stock
- category.name
Filter:
- status = ACTIVE
Runtime:
- GET /runtime/query/product.active
```

Query metadata wajib ada untuk View Builder dan table/list runtime behavior.

### 5.4 Action Metadata

Mendefinisikan business event.

Contoh: Save Product Action

```text
Button Click
  |
  v
Validate
  |
  v
Open Confirm Modal
  |
  v
User Confirm
  |
  v
Execute Save API
  |
  v
Show Notification
  |
  v
Refresh View
```

Penting:

- Modal bukan visual content yang ditempel permanen di form.
- Modal adalah runtime interaction.
- Button tidak memanggil API langsung.
- Button menjalankan Action.
- Action menentukan validation, confirmation, API, notification, refresh, workflow/process, dan connector behavior.

Salah:

```text
Render ConfirmModal permanen di dalam form.
Button langsung memanggil /api/product/save.
```

Benar:

```text
Button -> Save Product Action -> runtime membuka confirm modal -> setelah confirm action menjalankan save.
```

### 5.5 Connector/API Metadata

Mendefinisikan integrasi ke sistem eksternal.

Connector metadata berada di Action step, bukan langsung di button.

Contoh:

```text
Connector: Sync Product to ERP
Method: POST
URL: https://erp.example.com/products
Auth: Bearer Token
Used by: Save Product Action
```

Runtime wajib menjalankan connector melalui generic connector engine.

### 5.6 Process Metadata

Mendefinisikan business approval routing.

Process Designer bukan application URL routing.

Contoh:

```text
Purchase Request
  |
  v
Submit
  |
  v
Supervisor Approval
  |
  v
Manager Approval
  |
  v
Completed
```

Mendukung:

- approval level
- organization hierarchy
- condition
- delegation
- escalation

### 5.7 Menu Metadata

Mendefinisikan runtime navigation.

Contoh:

```text
Inventory
  Product
  Category
```

Generated URL:

```text
/app/inventory/product
```

Menu wajib terhubung:

```text
menu -> view metadata -> runtime renderer
```

### 5.8 Security Metadata

Mengontrol:

- application
- menu
- view
- action
- field
- power user boundary

Contoh:

```text
User A:
- boleh melihat product
- tidak boleh edit price
```

Runtime wajib enforce security metadata. Menampilkan label permission saja tidak cukup.

### 5.9 Custom Organisms

Custom Organisms adalah reusable experience block yang disusun dari komponen yang sudah ada.

Custom Organisms adalah metadata.

Custom Organisms tidak boleh membawa business logic hardcoded.

---

## 6. Builder

### 6.1 Aturan Form Builder

Tujuan:

Membuat user experience saja.

Form Builder tidak boleh langsung membuat tabel database. Form Builder boleh mengusulkan dan melakukan sinkronisasi metadata, tetapi hasil akhirnya tetap Data Metadata.

Komponen bind ke metadata.

Contoh:

```text
Text Input:
binding: Product.name

Button:
action: Save Product Action

Dropdown:
query: Product Category Lookup
```

Aturan:

- Input component wajib punya data binding atau menghasilkan field metadata saat save.
- Button component wajib bind ke Action Metadata.
- Confirmation wajib menjadi action/runtime behavior, bukan visual content permanen.
- Dropdown/autocomplete wajib bind ke Query Metadata.
- Component settings tidak boleh menduplikasi config yang sama di beberapa tempat.
- Visual Builder hanya memiliki UI_METADATA.

### 6.2 Aturan View Builder

Tujuan:

Menampilkan data.

Mendukung:

- Table
- List
- Card
- Kanban
- Dashboard

Contoh:

```text
Product Table
Datasource: Product Active Query
Actions:
- row click: Open Product Detail
- create button: Open Product Form
```

View Builder wajib memakai Query Metadata sebagai data source.

---

## 7. Ekspektasi Runtime Application

Saat aplikasi dipublish, runtime wajib menghasilkan:

- Header
- Sidebar menu
- Breadcrumb
- Permission Guard
- Notification
- User Profile
- Content Area

Contoh:

```text
/app/inventory/product
```

Harus menampilkan:

```text
Sidebar:
- Inventory

Content:
- Product Table

Button:
- Create Product

Click:
- Open Form

Save:
- Execute Action
```

Runtime behavior wajib meliputi:

- menu tampil
- table load data dari database/query
- create button membuka form
- save membuka confirmation
- confirm menyimpan database
- data refresh
- permission bekerja
- notification menampilkan hasil

Runtime berbasis localStorage hanya boleh untuk prototype validation. Production runtime wajib memakai generic runtime API dan metadata engines.

### 7.1 Identity Metadata

Identity di RediOS bukan aplikasi authentication tradisional.

Tidak boleh dibuat:

- User model class khusus.
- User CRUD controller khusus.
- User page hardcoded.
- UserBusinessService.

Identity wajib dibangun dari metadata:

- `USER` sebagai `SYSTEM_OBJECT`.
- `LOGIN_FORM` sebagai form metadata.
- `REGISTER_FORM` sebagai form metadata.
- `USER_FORM`, `USER_EDIT_FORM`, `USER_DETAIL`, dan `USER_LIST` sebagai screen/view metadata.
- `AUTH.LOGIN`, `USER.REGISTER`, `USER.CREATE`, `USER.UPDATE`, `USER.DISABLE`, `USER.DELETE`, `USER.LIST`, dan `USER.GET` sebagai Action/Capability metadata.

Identity Runtime hanya boleh berupa engine platform:

```text
IdentityEngine
SessionEngine
PasswordProvider
```

Alur login:

```text
Input
  -> Validate
  -> IdentityEngine
  -> Resolve USER metadata
  -> Create Session
  -> Load Permission
  -> Redirect
```

### 7.2 Generated Admin Application

RediOS wajib dapat membangun aplikasi admin miliknya sendiri.

System application pertama:

```text
Application: REDIOS ADMIN
Menu:
- Security
  - Users
  - Roles
  - Permission
```

Menu, form, view, action, dan security tetap metadata. Runtime hanya membaca package metadata dan menjalankan engine generik.

---

## 8. Publish Contract

Publish wajib menghasilkan satu versi application metadata yang lengkap.

Minimum package:

- application identity
- data objects
- queries
- actions
- connectors
- processes
- menu
- screens/views
- screen canvases/UI metadata
- security
- custom organisms
- theme
- publishedAt/version

Publish tidak boleh hanya membawa screen aktif.

Publish wajib memvalidasi:

- setiap menu item menunjuk ke screen/view
- setiap screen punya UI metadata
- setiap input binding menunjuk ke data metadata
- setiap button action tersedia
- setiap connector step menunjuk ke connector metadata
- setiap permission tersedia
- setiap runtime route dapat diresolve

---

## 9. Status Implementasi Saat Ini

Status:

- DONE: sudah diimplementasikan dan bisa dipakai untuk fase saat ini.
- PARTIAL: sudah ada, tetapi belum lengkap secara runtime/validasi/production.
- MISSING: belum ada.

| Area | Status | Catatan |
| --- | --- | --- |
| Visual Application Builder | PARTIAL | Canvas, component panel, property panel, screen context, save/publish sudah ada. Masih butuh all-screen sync, View Builder terpisah, query binding, dan protected metadata rules. |
| Metadata Designer Workspace | PARTIAL | Advanced Mode berbasis menu sudah ada. Masih butuh global application context dan dependency validation. |
| Data Designer | PARTIAL | Object/attribute application-scoped, data type, inline editing, confirmation sudah ada. Masih butuh pemisahan code/label, dependency impact, type-specific config, dan schema sync production. |
| Query Designer | MISSING | Dibutuhkan untuk table, dropdown, autocomplete, report, dashboard, dan list view. |
| Action Designer | PARTIAL | Action draft dan step sudah ada. Masih butuh structured step model, validation, confirmation model, connector execution contract, notification/refresh behavior. |
| Connector Designer | PARTIAL | Connector draft application-scoped sudah ada. Masih butuh generic connector execution, secret handling, test execution, dan mapping validation. |
| Process Designer | PARTIAL | Process draft application-scoped sudah ada. Masih butuh runtime process execution, hierarchy organisasi, delegation, dan approval state. |
| Menu Designer | PARTIAL | Menu application-scoped dengan screen selection sudah ada. Masih butuh route generation, permission validation, root/child validation, dan runtime URL mapping. |
| Security Designer | PARTIAL | Role, permission, action access sudah ada. Masih butuh runtime enforcement untuk field/action/menu guard. |
| Capability Registry | PARTIAL | Foundation locked Phase 19.99: registry service, seed contracts, API list. Domain handlers masih CONTRACT. |
| Custom Organisms | PARTIAL | Reusable component composition application-scoped sudah ada. Masih butuh nested component metadata dan safe power-user boundary. |
| Platform Domain Core | PARTIAL | Phase 19.99: tenant, user, role, application seed + custom field schemas. Identity runtime bridge belum full. |
| Runtime Renderer | PARTIAL | Published app render menu dan screen canvas dari metadata. Save demo localStorage sudah ada. Masih butuh backend runtime API, query loading, permission guard, notification, dan connector execution. |
| Publish Flow | PARTIAL | Package metadata dan screen canvases lokal sudah ada. Masih butuh full validation, all-screen sync, backend publish/versioning, dan acceptance test automation. |

---

## 10. Acceptance Test Sebelum Phase 20

Buat aplikasi:

```text
Asset Maintenance
```

System Analyst:

1. Create Product Object.
2. Create Product Query.
3. Create Product Form.
4. Create Product View.
5. Create Save Action.
6. Add Confirm Modal behavior through Action.
7. Create Menu.
8. Assign Permission.
9. Publish.

Runtime test:

Buka generated URL.

Expected:

- menu tampil
- table load database
- create button membuka form
- save membuka confirmation
- confirm menyimpan database
- data refresh
- permission bekerja

Acceptance test ini belum selesai sampai runtime memakai metadata engines, query execution, action execution, dan security guard.

---

## 11. Aturan AI Agent

Sebelum mengimplementasikan fitur baru:

1. Baca `docs/REDIOS_BLUEPRINT.md`.
2. Identifikasi actor dan use case terkait.
3. Pastikan data/action/permission/runtime behavior jelas.
4. Update blueprint ini jika use case belum ada.
5. Implementasikan hanya behavior yang metadata-driven.
6. Verifikasi acceptance test.

Jangan implementasikan fitur yang melanggar blueprint ini.

Jangan membuat business module hardcoded.

Jangan membuat UI yang tidak punya metadata/runtime contract.

