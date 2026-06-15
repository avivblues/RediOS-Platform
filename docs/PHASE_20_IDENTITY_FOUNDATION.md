# Phase 20 - Metadata Driven Identity Foundation

Status: implemented for prototype validation  
Referensi: `docs/REDIOS_BLUEPRINT.md`

---

## Tujuan

Phase 20 membuktikan bahwa RediOS dapat membangun aplikasi sistemnya sendiri dari metadata.

Identity Management tidak dibuat sebagai aplikasi auth tradisional. Tidak ada User model class, User CRUD controller, atau User page hardcoded. Yang dibuat adalah metadata `SYSTEM_OBJECT`, action capability, screen metadata, menu metadata, dan runtime engine generik.

---

## Metadata Yang Dibuat

System object:

```text
USER
type: SYSTEM_OBJECT
owner: REDIOS
locked: true
upgradeSafe: true
```

Field sistem:

- `id`: uuid, primary, locked, editable false
- `email`: email, unique, required, locked
- `username`: string, unique, locked
- `passwordHash`: password, secure, hidden, locked
- `displayName`: string
- `status`: enum, ACTIVE/INACTIVE/LOCKED
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`

Power User dapat menambah custom field seperti `employeeCode`, `department`, atau `phone`. Field custom ikut muncul otomatis di form user runtime. Field sistem tidak dapat dihapus, rename, atau diubah tipe datanya di Data Designer.

---

## Generated Capability

Capability berasal dari metadata action:

- `AUTH.LOGIN`
- `USER.REGISTER`
- `USER.CREATE`
- `USER.UPDATE`
- `USER.DELETE`
- `USER.DISABLE`
- `USER.LIST`
- `USER.GET`

Backend generic runtime juga memiliki alias object metadata:

```text
POST /runtime/object/USER
GET /runtime/object/USER
GET /runtime/object/USER/{id}
PATCH /runtime/object/USER/{id}
```

Path ini tetap generic runtime controller, bukan controller khusus User.

---

## Generated Admin Application

System application:

```text
REDIOS ADMIN
slug: redios-admin
```

Menu metadata:

```text
Security
  Users
  Roles
  Permission
```

Screen metadata:

- `LOGIN_FORM`
- `REGISTER_FORM`
- `USER_FORM`
- `USER_EDIT_FORM`
- `USER_DETAIL`
- `USER_LIST`

Seed data:

```text
email: admin@redios.local
password: admin123
```

Password disimpan sebagai `passwordHash` melalui `PasswordProvider`.

---

## Runtime Engine

Engine yang dibuat:

- `IdentityEngine`
- `SessionEngine`
- `PasswordProvider`

Alur login:

```text
Input
  -> Validate
  -> IdentityEngine
  -> Resolve USER metadata
  -> Create Session
  -> Load Permission
  -> Redirect ke REDIOS ADMIN
```

Runtime record `USER` memakai storage metadata runtime yang sama dengan object lain pada prototype web.

---

## Validation Test

1. Buka `/login`, login dengan `admin@redios.local` dan `admin123`. Expected: session dibuat dan runtime masuk ke `REDIOS ADMIN`.
2. Buka `/apps/redios-admin`, pilih `Security > Users`. Expected: table user dari metadata `USER_LIST` muncul.
3. Klik `Create User`, isi form, lalu `Save User`. Expected: data tersimpan ke runtime object `USER`.
4. Buka `USER_EDIT_FORM`. Expected: field sistem seperti `id`, `email`, dan `username` readonly, custom field editable.
5. Di Data Designer aplikasi `REDIOS ADMIN`, tambah custom field `employeeCode` ke `USER`. Expected: runtime form user otomatis menampilkan field baru.

---

## Catatan Production

Implementasi ini memvalidasi konsep di runtime prototype. Untuk production, session resolver harus pindah ke backend context engine, password hashing harus memakai provider cryptographic yang kuat, dan permission resolver harus mengambil policy dari security metadata server-side.
