# Domain Module Contract

Status: Foundation Pattern (Phase 19.99)

## Purpose

Prepare RediOS for ERP development without implementing full ERP modules yet.

RediOS = **Enterprise Domain Core** + **Metadata Customization Layer**.

## Standard Layout

```text
modules/{module-name}/
  domain/
    entities/
    repositories/
    services/
  application/
    commands/
    queries/
    handlers/
  infrastructure/
    persistence/
    adapters/
  capability/
    handlers/
    registry.bindings.ts
```

### domain/

Owns business truth.

- Real entity models (`gl_journal_header`, `product`, `stock_movement`)
- Validation rules and invariants
- Domain events (optional)
- No UI, no metadata, no HTTP

### application/

Orchestrates use cases.

- `JournalPostingService.post(journalId)`
- Transaction boundaries
- Calls domain + infrastructure
- Returns DTOs for capability output schemas

### infrastructure/

Technical implementation.

- Mongo/SQL repositories
- Locking, audit trail persistence
- External system adapters

### capability/

Bridge to metadata runtime.

- One handler per capability code
- Maps `CapabilityExecutionRequest` → application service
- Registered in `CapabilityRegistry` via seed or module bootstrap

## Example: Finance

```text
modules/finance/
  domain/
    entities/journal-header.ts
    entities/journal-line.ts
    entities/gl-account.ts
  application/
    journal-posting.service.ts
    journal-create.service.ts
  infrastructure/
    persistence/journal.repository.ts
  capability/
    handlers/journal-post.handler.ts   # JOURNAL.POST
    handlers/journal-create.handler.ts # JOURNAL.CREATE
```

Tables (domain core — not metadata):

- `gl_account`
- `gl_journal_header`
- `gl_journal_line`

## Example: Inventory

```text
modules/inventory/
  domain/
    entities/product.ts
    entities/stock-movement.ts
  application/
    product-create.service.ts
    stock-receive.service.ts
  infrastructure/
    persistence/product.repository.ts
  capability/
    handlers/product-create.handler.ts  # PRODUCT.CREATE
    handlers/stock-receive.handler.ts   # STOCK.RECEIVE
```

## Integration with Builder

Builder does **not** create database tables.

| Builder action | Binds to | Runtime calls |
| --- | --- | --- |
| Save button | `PRODUCT.CREATE` | `ProductCreateService` |
| Post button | `JOURNAL.POST` | `JournalPostingService` |
| List query | `FINANCE.TRIAL_BALANCE` | Finance query engine |

## Integration with Query Builder

Query Builder does **not** generate random SQL.

It selects a **Query Capability**:

```text
Query Metadata
  capabilityCode: FINANCE.TRIAL_BALANCE
  input: { period, company }
```

Finance engine prepares the result set. Query Builder only configures input mapping and presentation.

## Phase 19.99 Scope

- Folder pattern and contract documentation only
- Capability contracts seeded in `capability_definitions`
- No full ERP implementation in this phase
