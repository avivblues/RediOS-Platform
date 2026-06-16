# RediOS Architecture Boundary

Status: Locked (Phase 19.99)  
Audience: Developers, System Analysts, Power Users, AI agents

---

## Purpose

RediOS is **not** a pure metadata database.

RediOS is:

```text
Enterprise Domain Core
+
Metadata Customization Layer
```

This document defines what belongs in each layer and what must never cross the boundary.

---

## Final Architecture Stack

```text
                 USER EXPERIENCE
                       |
                Visual Builder
                       |
                  Metadata
                       |
             Capability Registry
                       |
                Domain Runtime
                       |
              Real Database / API
```

---

## A. Domain Core

**Owner:** Developer

**Examples:**

- Identity
- Tenant
- Security
- Finance
- Inventory
- Manufacturing
- Costing

### Characteristics

| Property | Domain Core |
| --- | --- |
| Storage | Real database table/collection |
| Query | Optimized SQL or domain query engine |
| Transaction | Yes — ACID where required |
| Locking | Yes — optimistic/pessimistic |
| Audit | Immutable audit trail |
| Validation | Domain invariants enforced in code |

### Example: Finance

Tables (real schema — **not** metadata JSON):

```text
gl_account
gl_journal_header
gl_journal_line
```

Journal posting runs in `JournalPostingService` with transaction, balance validation, and audit.

ERP transaction data **never** lives in `metadata_definitions` or generic `runtime_documents` bags for production ERP modules.

### Platform Domain Core (Phase 19.99)

Seeded in domain collections:

| Collection | Purpose |
| --- | --- |
| `platform_tenants` | Tenant `DEFAULT` |
| `platform_users` | System admin (`admin@redios.local`) |
| `platform_roles` | SYSTEM_ADMIN, SYSTEM_ANALYST, POWER_USER, BUSINESS_USER |
| `platform_applications` | REDIOS_STUDIO, REDIOS_ADMIN |

---

## B. Metadata Layer

**Owner:** System Analyst

### Contains

- Application
- Menu
- Screen
- Form Layout
- Field Configuration
- Action Binding (→ capability code)
- Workflow
- Approval Routing
- Automation
- Report Layout
- Dashboard

### Metadata NEVER stores

- ERP transaction data (journals, stock movements, invoices)
- Domain user passwords (domain core)
- GL balances
- Inventory on-hand quantities

### Metadata stores references

Action metadata binds to capability codes:

```json
{
  "actionCode": "SAVE_PRODUCT",
  "capabilityCode": "PRODUCT.CREATE",
  "confirmation": true
}
```

Form layout metadata stores field positions and labels — not business records.

---

## C. Extension Layer

**Owner:** Power User

### Can

- Add custom field
- Change label
- Change layout
- Hide field
- Add validation (extension scope)

### Cannot

- Delete system field
- Change datatype of system field
- Modify domain logic
- Create new core capability without System Analyst approval

### Storage

| Collection | Purpose |
| --- | --- |
| `custom_field_definitions` | Extension field schema per entity |
| `custom_field_values` | Extension values per domain record |

Example:

```text
Product (domain table)
  id, name, price

Custom (extension)
  color, brand, warrantyDate  → custom_field_values
```

---

## Capability Registry

**Purpose:** Bridge between Metadata and Domain Code.

### Flow

```text
Button "Post Journal"
      ↓
Metadata Action (capabilityCode: JOURNAL.POST)
      ↓
Capability Registry
      ↓
JOURNAL.POST contract
      ↓
JournalPostingService (domain)
```

Buttons **do not** call REST endpoints directly from metadata. They resolve a capability code.

### Capability Format

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

Stored in: `capability_definitions`

API: `GET /api/capabilities`

---

## Builder Connection Rule

Builder does **not** create database tables.

| Builder responsibility | Domain responsibility |
| --- | --- |
| Select capability | Own table schema |
| Bind action to capability code | Enforce business rules |
| Configure layout | Execute transaction |
| Configure validation (extension) | Audit and lock |

Example — Save Button:

```text
Action: PRODUCT.CREATE
Runtime: CapabilityRegistry → ProductCreateService → product table
```

---

## Query Builder Rule

Query Builder does **not** generate random SQL for ERP.

It consumes **Query Capabilities**:

```text
capabilityCode: FINANCE.TRIAL_BALANCE
input: { period, company }
output: prepared by Finance Engine
```

Query metadata stores:

- Which capability to call
- Input parameter mapping
- Column presentation

Finance engine owns the query logic and optimized execution.

---

## Relationship to Phase 20 Identity

Phase 20 added metadata-driven USER screens for runtime UX.

Phase 19.99 locks the **domain boundary**:

- Platform admin user is a **domain core** record in `platform_users`
- Runtime USER metadata screens are **experience layer** — they render and bind to identity capabilities
- Login capability: `IDENTITY.LOGIN` → Identity domain handler (future) or runtime bridge

Both layers coexist:

| Concern | Layer |
| --- | --- |
| Who can log in (credential store) | Domain Core |
| Login form layout | Metadata |
| Login action binding | Metadata → `IDENTITY.LOGIN` |

---

## What This Phase Does Not Do

- No UI/Builder redesign
- No full ERP module implementation
- No dynamic JSON-database ERP
- No moving ERP transactions into metadata

---

## References

- `docs/REDIOS_BLUEPRINT.md` — platform blueprint
- `docs/DOMAIN_MODULE_CONTRACT.md` — module folder pattern
- `docs/PHASE_19_99_VALIDATION.md` — acceptance cases
- `apps/api/src/platform/` — domain schemas and capability registry
- `apps/api/src/seed/platform-seed.records.ts` — platform seed data
