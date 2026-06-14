# Phase 19.9 Alignment Report

Referensi utama: `docs/REDIOS_BLUEPRINT.md`  
Fase: Phase 19.9 - Align Metadata Capability Contract  
Tujuan: menyelaraskan implementasi saat ini dengan konsep RediOS sebagai metadata-driven enterprise application platform.

---

## 1. Ringkasan

Current Builder UI direction diterima. Tidak perlu redesign UI Builder.

Masalah utama Phase 19 bukan tampilan Builder, tetapi kontrak arsitektur:

- Form Builder masih terlalu dekat dengan pembuatan metadata core.
- Capability Registry belum menjadi konsep eksplisit di code.
- Query Designer belum ada.
- API/Connector/Action masih belum menjadi capability pipeline yang kuat.
- Runtime masih membaca manifest lokal dan menjalankan behavior demo.

Target Phase 19.9:

- Menetapkan batas tanggung jawab System Analyst dan Power User.
- Menegaskan bahwa Builder hanya mengonsumsi capability.
- Mengidentifikasi bagian yang perlu refactor sebelum fitur Phase 20.
- Mencegah penambahan UI acak tanpa metadata/capability/runtime contract.

---

## 2. Kontrak Yang Harus Dipegang

### 2.1 System Analyst

System Analyst membuat kemampuan aplikasi.

Responsible:

- Data Designer
- Query Designer
- API Designer
- Action Designer
- Process Designer
- Security Designer
- Menu Designer
- Connector Designer
- Custom Organism

System Analyst menciptakan:

- Data Capability
- Query Capability
- API Capability
- Action Capability
- Process Capability
- Security Capability
- Menu/Application Structure

Contoh:

```text
Object:
Product

Fields:
- name
- stock
- price

API Capability:
- Product Create
- Product Update
- Product Delete

Query Capability:
- Product List
- Product Lookup

Action Capability:
- Save Product
- Approve Product

Process:
- Manager Approval
```

### 2.2 Power User

Power User membuat experience.

Boleh:

- create screen
- change layout
- drag component
- add custom field extension
- configure visibility
- bind component to existing capability
- select existing action
- select existing query

Tidak boleh:

- create core API
- modify database contract
- delete system field
- change system process

Jika capability belum ada, Power User membuat Capability Request.

### 2.3 Form Builder

Form Builder tidak memiliki logic.

Salah:

```text
Button -> call API directly
```

Benar:

```text
Button
  -> Event Binding
  -> Capability Registry
  -> Action Metadata
  -> Runtime Engine
```

Contoh property Save Button:

```text
Action:
[Save Product]

Pipeline readonly:
1. Confirm Modal
2. Validate Product
3. Execute Product Create API
4. Show Notification
```

### 2.4 Published Application

Publish menghasilkan Application Manifest Metadata.

Manifest berisi:

- Application
- Menu
- Screens
- Components
- Bindings
- Actions
- Queries
- Security

Runtime membaca manifest. Runtime tidak boleh menghasilkan hardcoded React app.

---

## 3. Already Correct

### 3.1 Builder UI Direction

Status: already correct

Current Visual Application Builder sudah diterima secara UI direction.

Yang sudah benar:

- Builder visual-first.
- Ada canvas, component panel, property panel, context bar.
- Ada screen/form selector.
- Ada mode create/edit/detail/table/list.
- Ada save dan publish flow.
- Component memiliki binding metadata.
- Button memilih action, bukan endpoint langsung.

Catatan:

UI jangan di-redesign sebelum kontrak capability dan runtime lebih kuat.

### 3.2 Metadata Designer Exists

Status: already correct

Sudah ada designer:

- Data Designer
- Action Designer
- Connector/API Designer
- Process Designer
- Menu Designer
- Security Designer
- Custom Organisms

Catatan:

Ini sudah sejalan dengan peran System Analyst, tetapi belum semua designer menghasilkan capability contract yang siap runtime.

### 3.3 Application Scoped Metadata

Status: already correct untuk prototype

Data, Action, Connector, Process, Menu, Security, dan Custom Organisms sudah mulai application-scoped.

Catatan:

Scope production masih perlu tenant/domain/version/publish status.

### 3.4 Button Does Not Directly Call API

Status: already correct secara konsep

Property Panel menampilkan action binding. Confirmation juga mengarah ke action.

Catatan:

Action masih berupa label/string. Perlu refactor menjadi capability/action reference yang stabil.

### 3.5 Publish Manifest Exists

Status: already correct untuk prototype

Published app membaca package metadata dari localStorage.

Package sudah berisi:

- app identity
- data objects
- actions
- connectors
- processes
- menu
- screens
- security
- custom organisms
- screen canvases
- theme

Catatan:

Manifest production harus disimpan di backend publish registry, bukan localStorage.

---

## 4. Needs Refactor

### 4.1 Capability Registry Belum Ada Sebagai Modul Pusat

Status: needs refactor

Saat ini Builder langsung membaca:

- `loadDataObjects`
- `loadActions`
- screen metadata
- local metadata store

Yang dibutuhkan:

```text
CapabilityRegistry
  DATA
  QUERY
  ACTION
  API
  PROCESS
  SECURITY
```

Builder harus membaca dari registry, bukan dari masing-masing store secara terpisah.

Target refactor:

- `loadBuilderCapabilities(applicationCode)`
- return data/action/query/api/process/security capability yang siap dipilih Builder
- expose readonly capability untuk Power User
- support Capability Request jika capability belum ada

### 4.2 Builder Masih Bisa Membuat Core Data/Action Metadata

Status: needs refactor

Saat ini Builder Save dapat sync field dan action baru ke metadata.

Ini berguna untuk prototype, tetapi kontrak final harus membedakan:

- System Analyst membuat core metadata.
- Power User hanya membuat extension/custom metadata atau capability request.

Target refactor:

- Field baru dari Builder menjadi `custom field extension`, bukan core field.
- Action baru dari Builder menjadi `capability request`, bukan core action otomatis.
- Core metadata hanya dibuat lewat System Analyst designer.

### 4.3 Action Step Masih String

Status: needs refactor

Saat ini action steps berupa string seperti:

```text
validate
save
call CONNECTOR_CODE
```

Yang dibutuhkan:

```text
ActionStep {
  type: CONFIRM | VALIDATE | EXECUTE_API | CALL_CONNECTOR | NOTIFY | REFRESH | NAVIGATE
  capabilityCode: string
  config: object
}
```

Target refactor:

- Action Designer mengelola structured action pipeline.
- Builder hanya memilih action.
- Runtime menjalankan step berdasarkan structured metadata.

### 4.4 Confirmation Masih Component-Level

Status: needs refactor

Saat ini confirmation disimpan di component metadata.

Kontrak final:

- Modal adalah runtime interaction capability.
- Confirmation sebaiknya menjadi Action Step, bukan visual component permanen.

Target refactor:

```text
Save Product Action
  Step 1: CONFIRM
  Step 2: VALIDATE
  Step 3: EXECUTE_API
  Step 4: NOTIFY
```

Builder boleh menampilkan ringkasan readonly pipeline.

### 4.5 Query Designer Missing

Status: needs refactor / missing prerequisite

View Builder, dropdown, autocomplete, dashboard, dan report tidak boleh mengambil data langsung dari object.

Mereka harus memakai Query Capability.

Target:

- Query Designer
- Query Capability Registry
- Table/List component memilih Query Capability
- Runtime menjalankan query metadata

### 4.6 API Designer Perlu Dipisahkan Dari Connector Designer

Status: needs refactor

Saat ini API/Connector berada di satu konsep UI.

Kontrak:

- API Designer mengekspos business capability.
- Connector Designer mengelola external integration.
- Internal runtime API dan external connector API harus dibedakan di metadata.

Target refactor:

- API Capability: Product Create, Product Update, Product Delete
- Connector Capability: Sync Product to ERP
- Action dapat memakai keduanya.

### 4.7 Menu Belum Terkait View Metadata Secara Kuat

Status: needs refactor

Menu sekarang menunjuk screen.

Kontrak:

```text
menu -> view metadata -> runtime renderer
```

Target:

- Menu item menunjuk View/Screen capability.
- Runtime route bisa diresolve dari manifest.
- Permission guard diterapkan sebelum render.

### 4.8 Runtime Masih Demo Execution

Status: needs refactor

Runtime saat ini:

- render manifest localStorage
- save ke localStorage
- connector hanya prepared text
- security hanya tampil sebagai label/pill

Target:

- load manifest dari backend registry
- execute action via Runtime Engine
- execute API/Connector capability
- enforce security
- run query
- refresh view

---

## 5. Violates Blueprint

### 5.1 Builder Auto-Creates Core Field Metadata

Status: violates blueprint jika dianggap final behavior

Masalah:

Power User tidak boleh mengubah database contract/core field.

Saat ini Builder Save dapat membuat attribute baru dari label input.

Kondisi yang masih boleh untuk prototype:

- dianggap sebagai draft/proposal
- dianggap sebagai custom field extension
- tidak mengubah protected core metadata

Perbaikan kontrak:

- ubah auto-created field menjadi `customFieldExtension`
- atau ubah menjadi `Capability Request`
- core field tetap melalui Data Designer/System Analyst

### 5.2 Builder Auto-Creates Action Metadata

Status: violates blueprint jika dianggap final behavior

Masalah:

Power User tidak boleh membuat core action capability.

Saat ini Builder bisa membuat action dari event label.

Perbaikan kontrak:

- jika action belum ada, tampilkan "Request Action Capability"
- System Analyst membuat action di Action Designer
- Builder baru bisa memilih action setelah tersedia di registry

### 5.3 Confirm Modal Masih Bisa Menjadi Visual Component

Status: violates blueprint jika digunakan sebagai normal form content

Masalah:

Modal bukan content permanen dalam form.

Perbaikan:

- hapus/hidden ConfirmModal sebagai normal form element untuk simple mode
- confirmation harus muncul dari Action runtime interaction
- ConfirmModal visual component hanya boleh untuk expert/internal preview jika jelas contract-nya

### 5.4 DataTable Belum Menggunakan Query Capability

Status: violates blueprint untuk View Builder final

Masalah:

Table/List wajib memakai Query Metadata.

Saat ini DataTable masih render dari canvas/demo dan belum memilih Query Capability.

Perbaikan:

- DataTable property harus memilih Query Capability
- Query Designer harus tersedia
- Runtime query executor harus menjalankan query

### 5.5 Runtime Permission Guard Belum Enforced

Status: violates blueprint untuk published application final

Masalah:

Security metadata ada, tetapi runtime belum benar-benar enforce.

Perbaikan:

- guard menu
- guard screen/view
- guard action
- guard field visibility/editability

---

## 6. Required Contract Fix Before Feature Work

Urutan fix kontrak sebelum menambah fitur UI:

1. Tambahkan Capability Registry sebagai contract layer.
2. Pisahkan System Analyst capability creation dan Power User experience binding.
3. Ubah auto-created core metadata dari Builder menjadi custom extension atau capability request.
4. Ubah Action steps dari string menjadi structured action pipeline.
5. Jadikan confirmation sebagai Action Step, bukan form component permanen.
6. Tambahkan Query Capability sebelum View Builder final.
7. Jadikan DataTable/List memilih Query Capability.
8. Jadikan Runtime membaca manifest dan menjalankan capability melalui Runtime Engine.
9. Enforce Security metadata di runtime.

---

## 7. Validation Test

Use case: Inventory Application.

System Analyst membuat:

- Product Object
- Product Query
- Product API
- Save Action
- Menu

Power User membuat Form:

- bind Product fields
- create button
- select Save Action

Publish.

Runtime expected:

- form render benar
- button membuka confirmation
- confirm execute API
- data saved
- view reloads

Status saat ini:

| Expected | Current Status | Catatan |
| --- | --- | --- |
| form render benar | PARTIAL | Layout published sudah mengikuti grid, tetapi runtime masih demo. |
| button membuka confirmation | PARTIAL | Ada component-level confirmation. Harus dipindah ke action step. |
| confirm execute API | MISSING | Runtime belum execute API capability. |
| data saved | PARTIAL | Save localStorage, bukan backend runtime API. |
| view reloads | MISSING | Query/View reload belum ada. |

---

## 8. Keputusan Phase 19.9

Tidak menambah fitur baru dulu.

Builder UI tetap.

Yang harus dilakukan berikutnya adalah refactor kontrak:

- registry
- capability reference
- structured action
- query/view contract
- runtime execution
- permission guard

Setiap task setelah report ini wajib mengacu ke `docs/REDIOS_BLUEPRINT.md`.

