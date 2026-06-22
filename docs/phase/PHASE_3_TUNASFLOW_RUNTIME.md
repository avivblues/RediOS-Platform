# REDI-OS PHASE 3 — TUNASFLOW RUNTIME ENGINE

Version: 1.0  
Status: PLANNED  

Depends On:

- PHASE_1_KERNEL_COMPLETION.md
- PHASE_2_EXPERIENCE_ENGINE.md
- REDIOS_PLATFORM_BLUEPRINT_v3.md


---

# 1. PURPOSE

Phase 3 membangun TunasFlow Runtime Engine.

TunasFlow adalah:

Business Process Brain

untuk REDI-OS.


TunasFlow bukan workflow approval biasa.


TunasFlow menghubungkan:


Metadata

+

Runtime Object

+

User Action

+

Automation

+

Integration

+

AI Decision


---

# 2. CORE PRINCIPLE


Traditional ERP:


```
Purchase Request Service

      |

Approval Function

      |

Hardcoded Logic
```


REDI-OS:


```
Event

 |

TunasFlow Engine

 |

Decision

 |

Action Executor
```


No hardcoded workflow.


---

# 3. TARGET ARCHITECTURE


```
               Runtime Object


                    |


                 Event Bus


                    |


              TunasFlow Engine


                    |


       +------------+-------------+

       |            |             |


   Approval     Automation     Integration


       |            |             |


  Universal    Action        External

   Inbox       Engine        System



```


---

# 4. CREATE FLOW CORE


Create:


```
apps/api/src/core/workflow/


├── flow.engine.ts

├── flow.executor.ts

├── flow.context.ts

├── flow.registry.ts

├── flow.definition.ts

└── flow.version.ts

```


Responsibility:


- Load workflow definition

- Validate flow

- Execute flow

- Maintain state

- Version workflow


---

# 5. FLOW DEFINITION MODEL


Example:


```json
{
 "flow":"material_release",

 "version":"1.0",

 "trigger":"material.received",

 "steps":[

  {
   "id":"qc_sampling",
   "type":"task",
   "assign":"QC"
  },


  {
   "id":"qa_release",
   "type":"approval",
   "assign":"QA_MANAGER"
  }

 ]
}
```


---

# 6. STATE ENGINE


Create:


```
workflow/state/


├── state.engine.ts

├── state.transition.ts

├── state.history.ts

└── state.snapshot.ts

```


Every object has:


```
Object

 |

State

 |

Transition

 |

History

```


Example:


```
Draft

 ↓

Submitted

 ↓

Review

 ↓

Approved

 ↓

Completed

```


---

# 7. APPROVAL ENGINE


Create:


```
workflow/approval/


├── approval.engine.ts

├── approval.rule.ts

├── approval.assignment.ts

└── approval.policy.ts
```


Support:


- Single Approval

- Multi Level Approval

- Parallel Approval

- Delegation

- Escalation

- SLA


---

Example:


```json
{
 "approval":"purchase",

 "level":[

 {
  "role":"Manager",
  "limit":5000000
 },

 {
  "role":"Director",
  "limit":50000000
 }

 ]

}
```


---

# 8. ACTION ENGINE


Action adalah jembatan:

Experience Engine

↓

TunasFlow


Create:


```
workflow/action/


├── action.executor.ts

├── action.registry.ts

├── action.validator.ts

└── action.handler.ts

```


Example:


Button:


```
[ APPROVE ]
```


becomes:


```json
{
 "action":"approve",

 "object":"purchase_request",

 "id":"PR001"
}
```


---

# 9. RULE ENGINE


Create:


```
workflow/rule/


├── rule.engine.ts

├── expression.parser.ts

└── condition.evaluator.ts

```


Support:


```
IF

amount > 10000000

THEN

Director Approval
```


---

# 10. AUTOMATION ENGINE


Create:


```
workflow/automation/


├── automation.engine.ts

├── scheduler.ts

├── trigger.ts

└── automation.action.ts

```


Trigger:


- Event

- Schedule

- Condition

- API

- IoT Signal


---

Example:


```
Machine Alarm

(from TunasIoT)

      |

Event Bus

      |

TunasFlow

      |

Create WO

```


---

# 11. UNIVERSAL TASK OUTPUT


TunasFlow NEVER creates UI.


Wrong:


```
Workflow

 |

Approval Page

```


Correct:


```
TunasFlow

 |

Task Object

 |

Universal Inbox

 |

Experience Engine

```


---

# 12. INTEGRATION READY


External trigger:


```
REST

MQTT

Webhook

Message Queue

TunasIoT
```


Example:


Temperature abnormal:


```
TunasIoT

detect anomaly


     ↓


REDI Integration Hub


     ↓


Event


     ↓


TunasFlow


     ↓


Corrective Action
```


---

# 13. AUDIT TRAIL


Every action stored:


```
Who

When

Before

After

Reason

Device

Location
```


Mandatory for:


- GMP

- CPOB

- ISO

- Compliance


---

# 14. AI READY FOUNDATION


Future:


REDI AI Assistant


Can analyze:


```
Workflow History

+

Process Data

+

IoT Data

+

User Behavior
```


Example:


"Why approval always late?"


AI checks:


- Bottleneck

- SLA

- User workload


---

# 15. ACCEPTANCE CRITERIA


Phase complete when:


## Flow Runtime


✔ Create workflow from metadata

✔ Execute dynamically

✔ Version supported


---


## State


✔ Object state tracked

✔ History available


---


## Approval


✔ Dynamic approval

✔ Escalation

✔ Delegation


---


## Automation


✔ Event trigger

✔ Scheduled trigger

✔ IoT trigger ready


---


## Action


✔ Button generated dynamically

✔ Action executed by engine


---

# 16. STRICT CURSOR RULE


DO NOT:


❌ create approval inside business module

❌ create purchase workflow code

❌ create QC workflow code

❌ create hardcoded status


BUILD:


✅ Flow Engine

✅ State Engine

✅ Rule Engine

✅ Action Runtime

✅ Automation Runtime



Business flow definition comes from:

Metadata Package


---

# NEXT


PHASE 4:

REDI STUDIO


Build tools for:

- Metadata Designer

- Form Builder

- Flow Builder

- Query Builder

- Report Builder

- Dashboard Builder
