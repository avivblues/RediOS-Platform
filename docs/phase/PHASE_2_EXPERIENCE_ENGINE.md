# REDI-OS PHASE 2 — EXPERIENCE ENGINE

Version: 1.0  
Status: PLANNED  
Depends On:
- PHASE_1_KERNEL_COMPLETION.md
- REDIOS_PLATFORM_BLUEPRINT_v3.md


---

# 1. PURPOSE

Phase 2 membangun Human Experience Layer REDI-OS.

REDI-OS bukan aplikasi berbasis menu.

REDI-OS adalah:

Persona Driven
+
Workspace Driven
+
Action Driven
+
Context Aware

Enterprise Operating System.


Goal:

User tidak mencari pekerjaan.

System membawa pekerjaan ke user.


---

# 2. CORE PRINCIPLE


Traditional ERP:


```
User

 ↓

Menu

 ↓

Module

 ↓

Transaction

 ↓

Input Form
```


REDI-OS:


```
User

 ↓

Persona Resolver

 ↓

Workspace

 ↓

Action Required

 ↓

Result
```


---

# 3. TARGET ARCHITECTURE


```
                 User Login


                     |


              Identity Engine


                     |


              Context Engine


                     |


             Persona Resolver


                     |


          Capability Resolver


                     |


           Workspace Generator


                     |


          Runtime Renderer Core


             /              \


          Web              Mobile

```


---

# 4. CREATE EXPERIENCE CORE


Target:


```
apps/api/src/core/experience/


├── persona/

│   ├── persona.resolver.ts

│   ├── persona.policy.ts

│   └── persona.types.ts


├── workspace/

│   ├── workspace.engine.ts

│   ├── workspace.generator.ts

│   └── workspace.context.ts


├── action-center/

│   ├── action.resolver.ts

│   └── action.queue.ts


├── inbox/

│   ├── inbox.engine.ts

│   └── inbox.item.ts


└── notification/

    ├── notification.engine.ts

    └── notification.rule.ts
```


---

# 5. PERSONA MODEL


REDI has 4 main platform personas.


---

# 5.1 SYSTEM ADMIN


Purpose:

Full platform control.


Workspace:

System Control Center


Access:


```
ALL MENU

ALL MODULE

ALL CONFIGURATION
```


Capabilities:


Platform:


- Tenant Management

- User Management

- Role Management

- Security Management

- Module Management

- Integration Management



Builders:


✔ Metadata Builder

✔ Meta Designer

✔ Form Builder

✔ Flow Builder

✔ Query Builder

✔ Action Builder

✔ Report Builder

✔ Dashboard Builder

✔ Notification Builder


---

# 5.2 PROGRAMMER / PLATFORM DEVELOPER


Purpose:

Extend REDI capability.


Workspace:

REDI Studio


Allowed:


## Metadata


- Object Designer

- Entity Designer

- Field Designer

- Relationship Designer


---


## UI


- Form Builder

- Component Builder

- Layout Designer


---


## Logic


- Query Builder

- Action Builder

- API Builder

- Connector Builder


---


## Output


- Report Builder

- Dashboard Builder


Restriction:


Programmer builds capability.

Programmer does not execute business approval.


---

# 5.3 MANAGER / PROCESS OWNER


Purpose:

Control business operation without coding.


Workspace:

Management Workspace


Allowed:


Workflow:


✔ Flow Editor

✔ Approval Editor

✔ SLA Editor

✔ Escalation Rule



Forms:


✔ Edit Label

✔ Hide Field

✔ Rearrange Layout

✔ Add Business Field



Analytics:


✔ Report Builder

✔ Dashboard Builder



Action:


✔ Action Configuration


Example:


QC Manager:

Can modify:

- QC Release Flow

- QC Dashboard


Cannot modify:

- Core Metadata

- Database Schema


---

# 5.4 STAFF / OPERATOR


Purpose:

Execute daily work.


Workspace:

My Workspace


Default:


```
My Task

My Approval

My Notification

My Dashboard
```


Allowed:


✔ Personal Dashboard Builder

✔ Report Builder

✔ Notification Builder


Not Allowed:


× Metadata Change

× Workflow Core Change

× Security Change


---

# 6. UNIVERSAL INBOX


Problem:


Do NOT create:


```
Purchase Approval Menu

QC Approval Menu

Leave Approval Menu
```


Create:


```
Universal Inbox
```


Example:


```
Waiting For Me


□ Purchase Approval

□ Batch Release

□ Work Order Verification

□ IT Ticket Escalation
```


Source:


```
TunasFlow

    |

Universal Inbox
```


---

# 7. ACTION CENTER


Every task becomes action.


Action examples:


```
Approve

Reject

Assign

Comment

Delegate

Start Work

Complete
```


Action source:


```
Metadata

+

Workflow

+

Permission
```


---

# 8. DASHBOARD EXPERIENCE


Rule:


NO 100 GRAPH DASHBOARD


Use:


Exception Driven Dashboard


Answer:


- What happened?

- What needs action?

- Who owns it?

- When is deadline?


---

# 9. MOBILE EXPERIENCE


Mobile principle:


```
DO MY JOB
```


NOT:


```
SEARCH MENU
```


Examples:


Engineering:


```
WO #1001


Replace Bearing


[START]


Scan Asset QR


Upload Photo


[FINISH]
```


Warehouse:


```
Pick Task


Location A01


Scan


Confirm
```


---

# 10. RUNTIME UI COMPONENT


Create:


```
packages/ui-system/


components/


├── Workspace

├── ActionCard

├── ApprovalCard

├── Timeline

├── Kanban

├── DataGrid

├── KPI

├── FlowViewer

├── IoTWidget

└── AssistantPanel
```


---

# 11. AI ASSISTANT READY


Prepare:


```
REDI Assistant
```


Connected:


```
Metadata

Workflow

Business Data

TunasIoT
```


Example:


Question:


"Why production line 2 down?"


Answer from:


Production

+

Maintenance

+

TunasIoT Sensor


---

# 12. PERMISSION MATRIX


| Capability | Admin | Programmer | Manager | Staff |
|-|-|-|-|-|
| Metadata Builder | ✓ | ✓ | - | - |
| Meta Designer | ✓ | ✓ | - | - |
| Form Builder | ✓ | ✓ | △ | - |
| Flow Builder | ✓ | ✓ | △ | - |
| Query Builder | ✓ | ✓ | - | - |
| Action Builder | ✓ | ✓ | △ | - |
| Report Builder | ✓ | ✓ | ✓ | ✓ |
| Dashboard Builder | ✓ | ✓ | ✓ | ✓ |
| Notification Builder | ✓ | ✓ | ✓ | ✓ |


---

# 13. ACCEPTANCE CRITERIA


Phase complete when:


## Persona


✔ Login resolves persona

✔ Capability generated dynamically



## Workspace


✔ Different role different workspace

✔ Workspace generated by metadata



## Inbox


✔ Universal task inbox works



## Action


✔ Actions generated dynamically



## UI


✔ Renderer uses metadata



---

# 14. STRICT CURSOR RULE


DO NOT:


❌ Build ERP menu

❌ Build static sidebar per module

❌ Hardcode dashboard



BUILD:


✅ Persona Engine

✅ Workspace Runtime

✅ Universal Inbox

✅ Dynamic Action

✅ Runtime UI


---

# NEXT


PHASE 3:

TUNASFLOW RUNTIME ENGINE
