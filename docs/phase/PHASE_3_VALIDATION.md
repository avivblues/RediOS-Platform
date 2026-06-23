# Phase 3 Validation

Status: **TunasFlow Runtime — Sprint 2**  
Purpose: Rule engine (conditional step routing), approval engine (multi-level, parallel, SLA), sequential approval chaining  
Depends on: Sprint 1

---

## Sprint 2 Deliverables

| WP | Deliverable | Status |
| --- | --- | --- |
| WP3.6 | `RuleEngine` + `ConditionEvaluator` — skip steps when condition false | ✅ |
| WP3.7 | `ApprovalEngine` — SINGLE / SEQUENTIAL / PARALLEL approval modes | ✅ |
| WP3.8 | Amount-based approval levels (`minAmount` thresholds) | ✅ |
| WP3.9 | SLA — `slaHours` → human task `dueAt` | ✅ |
| WP3.10 | Sequential approval chain on inbox complete | ✅ |
| WP3.11 | `PURCHASE_REQUEST` seed — multi-level approval demo | ✅ |

---

## Architecture (Sprint 2 additions)

```
FlowExecutor
      │
      ├── RuleEngine.shouldExecuteStep()
      │         └── ConditionEvaluator (field ops + expression string)
      │
      └── ApprovalEngine.createApprovalTasks()
                ├── SINGLE → assigneeRoles (backward compatible)
                ├── SEQUENTIAL → first level only; chain on complete
                └── PARALLEL → all qualifying levels at once

Inbox complete → ApprovalEngine.onTaskCompleted() → next sequential level
```

**New paths:**

- `apps/api/src/core/tunasflow/rule/`
- `apps/api/src/core/tunasflow/approval/`

---

## API

```bash
# Create purchase request
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  http://localhost:3041/api/runtime/PURCHASE_REQUEST -d \
  '{"data":{"title":"Laptop procurement","amount":15000000,"requester":"staff@demo.local"}}'

# Submit → triggers sequential approval (Supervisor → Manager → Director for 15M)
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  http://localhost:3041/api/runtime/PURCHASE_REQUEST/{id}/actions/SUBMIT -d '{}'

# Complete level 1 → auto-creates level 2 task in inbox
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://localhost:3041/api/experience/inbox/human_{taskId}/complete
```

### Condition examples (step `config`)

| Format | Example |
| --- | --- |
| Expression string | `"amount >= 5000000"` |
| Structured | `{ "field": "amount", "operator": "gte", "value": 5000000 }` |

Steps with unmet conditions return `status: "SKIPPED"` in `flow.steps`.

### Approval config (step `config`)

```json
{
  "approvalMode": "SEQUENTIAL",
  "amountField": "amount",
  "slaHours": 24,
  "approvalLevels": [
    { "role": "SUPERVISOR", "minAmount": 0, "label": "Supervisor" },
    { "role": "MANAGER", "minAmount": 1000000, "label": "Manager" },
    { "role": "SYSTEM_ADMIN", "minAmount": 10000000, "label": "Director" }
  ]
}
```

---

## Sprint 1 Deliverables (reference)

| WP | Deliverable | Status |
| --- | --- | --- |
| WP3.1 | `TunasFlowEngine` | ✅ |
| WP3.2 | `FlowExecutor` step execution | ✅ |
| WP3.3 | `StateEngine` workflow history | ✅ |
| WP3.4 | Runtime pipeline integration | ✅ |
| WP3.5 | `GET /runtime/:entity/:id/state-history` | ✅ |

---

## Sprint 2 Acceptance

| Criterion | Status |
| --- | --- |
| Steps skipped when condition not met | ✅ |
| Multi-level approval by amount threshold | ✅ |
| Sequential: one level at a time, chain on complete | ✅ |
| Parallel: all qualifying levels created together | ✅ |
| SLA due date on human tasks | ✅ |
| WORK_ORDER unchanged (SINGLE mode fallback) | ✅ |

---

## Remaining (Phase 3 Sprint 3+)

| Capability | Sprint |
| --- | --- |
| Automation engine (event/schedule triggers) | Sprint 3 |
| Flow versioning | Sprint 3 |
| Escalation & delegation | Sprint 3 |
| Studio Process Designer → kernel publish | Sprint 4 / Phase 4 bridge |

---

## References

- `docs/phase/PHASE_3_TUNASFLOW_RUNTIME.md`
- `apps/api/src/core/tunasflow/rule/rule.engine.ts`
- `apps/api/src/core/tunasflow/approval/approval.engine.ts`
- `apps/api/src/seed/metadata-seed.records.ts` (PURCHASE_REQUEST)
