# RediOS Domain Modules

Enterprise domain logic lives here — not in metadata JSON.

Each business module follows the same layered contract:

```text
modules/{module}/
  domain/          # entities, value objects, invariants
  application/     # use cases, orchestration, DTOs
  infrastructure/    # persistence, external adapters
  capability/        # capability handlers exposed to Capability Registry
```

## Registered Modules (Foundation)

| Module | Status | Purpose |
| --- | --- | --- |
| `finance` | CONTRACT | GL, journal posting, balances |
| `inventory` | CONTRACT | Product, stock movement |

## Rules

1. Domain tables are real collections/tables — not `runtime_documents` metadata bags.
2. Capability handlers in `capability/` register against codes like `JOURNAL.POST`.
3. Metadata and Builder bind to capability codes; they do not generate SQL or domain logic.
4. Query Builder consumes query capabilities (e.g. `FINANCE.TRIAL_BALANCE`), not ad-hoc SQL.

See `docs/DOMAIN_MODULE_CONTRACT.md` for the full contract.
