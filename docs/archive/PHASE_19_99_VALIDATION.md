# Phase 19.99 Validation

Status: Foundation Lock  
Purpose: Verify enterprise hybrid metadata runtime boundary

---

## Prerequisites

```bash
npm run build --workspace @redios/shared
npm run seed:platform --workspace @redios/api
```

Verify API:

```bash
curl http://localhost:3000/api/capabilities?module=FINANCE
```

---

## CASE 1: Finance Journal

**Question:** Where is journal stored?

**Expected:** Real finance table (`gl_journal_header`, `gl_journal_line`).

**Validation:**

| Check | Result |
| --- | --- |
| `JOURNAL.CREATE` in `capability_definitions` | CONTRACT — handler ref `finance.journal.create` |
| `JOURNAL.POST` in `capability_definitions` | CONTRACT — handler ref `finance.journal.post` |
| Journal data in `metadata_definitions` | NO — metadata only binds capability code |
| Domain module contract documents `gl_journal_*` tables | YES — `docs/DOMAIN_MODULE_CONTRACT.md` |

**Flow (when implemented):**

```text
Post Button → action metadata → JOURNAL.POST → JournalPostingService → gl_journal_header
```

---

## CASE 2: User Adds Custom Field

**Question:** Where is custom field stored?

**Expected:** Extension metadata (`custom_field_definitions` + `custom_field_values`).

**Validation:**

| Check | Result |
| --- | --- |
| Schema `custom_field_definitions` | `entity`, `fieldName`, `dataType`, `createdBy` |
| Schema `custom_field_values` | `entity`, `recordId`, `fieldId`, `value` |
| Custom field in domain `product` table column | NO — extension is separate |
| Power User can add field | YES — extension layer rule |

**Example:**

```text
Product (domain): id, name, price
Custom: color → custom_field_values.fieldId = cf_color
```

---

## CASE 3: User Changes Form

**Question:** Where is form layout stored?

**Expected:** Form metadata (`metadata_definitions` type FORM or published package).

**Validation:**

| Check | Result |
| --- | --- |
| Form layout in `metadata_definitions` | YES |
| Form layout in `platform_users` | NO |
| Form layout in `gl_journal_header` | NO |
| Builder creates DB table on save | NO — builder connection rule |

---

## CASE 4: Button Save Clicked

**Question:** What is the execution flow?

**Expected:**

```text
Metadata Action
      ↓
Capability Registry
      ↓
Domain Service
```

**Validation:**

| Step | Artifact |
| --- | --- |
| 1. Button in form metadata | `actionCode` + `capabilityCode: PRODUCT.CREATE` |
| 2. Runtime resolves action | Reads capability code from metadata |
| 3. Capability Registry | `GET /api/capabilities/PRODUCT.CREATE` |
| 4. Domain handler (future) | `ProductCreateService` → `product` table |

**Current phase:** Steps 1–3 are locked by contract and seed. Step 4 is `implementationStatus: CONTRACT`.

---

## Platform Seed Verification

| Seed item | Expected value |
| --- | --- |
| Tenant | `DEFAULT` in `platform_tenants` |
| Admin user | `admin@redios.local` in `platform_users` (domain core) |
| Admin password | `admin123` (hashed) |
| Roles | SYSTEM_ADMIN, SYSTEM_ANALYST, POWER_USER, BUSINESS_USER |
| SYSTEM_ADMIN permissions | `*` |
| SYSTEM_ANALYST permissions | `metadata.*`, `builder.*`, `workflow.*`, `automation.*` |
| POWER_USER permissions | `form.customize`, `field.create`, `layout.change` |
| BUSINESS_USER permissions | `runtime.access` |
| Applications | REDIOS_STUDIO, REDIOS_ADMIN |

---

## Explicit Non-Goals (Verified)

- [ ] No Form Builder redesign
- [ ] No Visual Builder redesign
- [ ] No full ERP module code
- [ ] No JSON-database ERP pattern
- [ ] No ERP transactions in metadata collections
