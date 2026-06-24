# Phase 3 Validation

Status: **TunasFlow Runtime — Sprint 3**  
Purpose: Automation engine, flow versioning, escalation & delegation  
Depends on: Sprint 2

---

## Sprint 3 Deliverables

| WP | Deliverable | Status |
| --- | --- | --- |
| WP3.12 | `AutomationEngine` — EVENT / SCHEDULE / API / CONDITION triggers | ✅ |
| WP3.13 | `AutomationEventSubscriber` — event bus integration | ✅ |
| WP3.14 | `AutomationScheduler` — scheduled automations + escalation tick | ✅ |
| WP3.15 | `FlowVersionService` — pin process metadata version on document | ✅ |
| WP3.16 | `EscalationEngine` — SLA breach → escalate to configured role | ✅ |
| WP3.17 | Inbox delegation API — `PATCH /experience/inbox/:id/delegate` | ✅ |
| WP3.18 | Automation API — `POST /api/automation/:code/trigger` | ✅ |
| WP3.19 | Seed: `WO_START_FOLLOWUP` event automation | ✅ |

---

## Architecture (Sprint 3 additions)

```
Event Bus publish
      │
      ├── AutomationEventSubscriber → AutomationEngine.runForEvent()
      │
Runtime action complete
      │
      └── FlowVersionService.pinProcessVersion() on document.data._tunasflow

AutomationScheduler (60s tick)
      ├── runScheduled() — SCHEDULE trigger automations
      └── EscalationEngine.escalateOverdue() — overdue human tasks

Experience
      └── PATCH inbox/:id/delegate → HumanTaskEngine.delegate()
```

**New paths:**

- `apps/api/src/core/tunasflow/automation/`
- `apps/api/src/core/tunasflow/flow/flow.version.ts`
- `apps/api/src/core/tunasflow/approval/escalation.engine.ts`
- `apps/api/src/automation/`
- `packages/shared/src/automation-definition.ts`
- `packages/shared/src/tunasflow-state.ts`

---

## API

```bash
# List automations
curl -H "Authorization: Bearer $TOKEN" http://localhost:3041/api/automation

# Manual trigger (API trigger type)
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  http://localhost:3041/api/automation/WO_START_FOLLOWUP/trigger \
  -d '{"entityCode":"WORK_ORDER","documentId":"<wo-id>"}'

# Delegate inbox task
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  http://localhost:3041/api/experience/inbox/human_<taskId>/delegate \
  -d '{"assigneeRoles":["MANAGER"]}'

# Flow version pinned after first process execution (inspect document)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3041/api/runtime/object/PURCHASE_REQUEST/<id>
# → data._tunasflow.processVersions.PR_SUBMIT_PROCESS = <metadata version>
```

### Automation action types

| Type | Config keys |
| --- | --- |
| `CREATE_HUMAN_TASK` | `title`, `assigneeRoles`, `actionCode`, `processCode`, `priority` |
| `NOTIFY` | `title`, `body`, `targetRole`, `userId` |
| `RUNTIME_ACTION` | `entityCode`, `actionCode`, `payload` |

### Escalation config (step `config`)

```json
{
  "slaHours": 24,
  "escalationRole": "SYSTEM_ADMIN",
  "escalationAfterHours": 0
}
```

---

## Sprint 2 Deliverables (reference)

See Sprint 2 section in prior revision — rule engine, approval engine, PURCHASE_REQUEST seed.

---

## Sprint 3 Acceptance

| Criterion | Status |
| --- | --- |
| Event-triggered automation creates human task / notification | ✅ |
| Scheduled automation runs on interval | ✅ |
| API manual trigger works | ✅ |
| Process version pinned on document after first run | ✅ |
| Pinned version used on subsequent actions | ✅ |
| Overdue task escalates to `escalationRole` | ✅ |
| Inbox task delegation updates assignee | ✅ |

---

## Phase 3 Complete

Sprint 1–3 deliver the TunasFlow foundation track scope:

- Flow runtime + state history
- Rule + approval engines
- Automation + versioning + escalation/delegation

**Next:** Phase 4 Studio → kernel publish path.

> **Vision v4:** Ontology (Phase 8) and AI Composer (Phase 9) remain separate tracks.

---

## References

- `docs/phase/PHASE_3_TUNASFLOW_RUNTIME.md`
- `apps/api/src/core/tunasflow/automation/automation.engine.ts`
- `apps/api/src/core/tunasflow/flow/flow.version.ts`
- `apps/api/src/core/tunasflow/approval/escalation.engine.ts`
