# REDI-OS PHASE 4 — REDI STUDIO

Version: 1.0  
Status: PLANNED

Depends On:

- PHASE_1_KERNEL_COMPLETION.md
- PHASE_2_EXPERIENCE_ENGINE.md
- PHASE_3_TUNASFLOW_RUNTIME.md
- REDIOS_PLATFORM_BLUEPRINT_v3.md


---

# 1. PURPOSE

REDI Studio adalah platform builder untuk REDI-OS.

REDI Studio digunakan untuk membuat:

- Business Capability
- Experience
- Workflow
- Automation
- Report
- Dashboard

tanpa mengubah source code.


REDI Studio bukan:

CRUD Generator

Database Editor

Admin Template


---

# 2. GOLDEN UI/UX RULE


DO NOT BREAK EXPERIENCE ENGINE.


All output must follow:


```
Persona

↓

Workspace

↓

Action

↓

Result
```


Never create:


```
Menu

↓

Sub Menu

↓

Form

↓

Submit
```


---

# 3. REDI STUDIO USERS


## SYSTEM ADMIN


Workspace:

System Studio


Access:


```
ALL DESIGNER
ALL BUILDER
ALL CONFIGURATION
```


Tools:


- Tenant Builder

- Module Manager

- Security Designer

- Permission Builder

- Integration Manager

- Environment Manager


---


# PROGRAMMER / PLATFORM DEVELOPER


Workspace:

Developer Studio


Purpose:

Create platform capability.


Tools:


## Metadata Designer


Create:


- Object

- Entity

- Field

- Relationship

- Validation

- Index


Example:


Work Order Object


NOT:


work_order table


---


## Form Builder


Purpose:

Create Experience Component


NOT database form.


Design:


```
Section

Card

Step

Wizard

Action

Validation

Context
```


Example:


Good:


```
Maintenance Request


Problem Info Card


Asset Card


Action:

[Assign Technician]
```


Bad:


```
100 input fields
```


---


## Query Builder


Purpose:


Create reusable data source.


Support:


- Visual Query

- Aggregation

- Filtering

- API Source

- External Connector


Output:


Dataset Metadata


NOT SQL hardcode


---


## Action Builder


Purpose:


Create business action.


Example:


Approve

Assign

Escalate

Release

Close


Action connected to:


- Permission

- Workflow

- Event

- Notification


---


## Flow Designer


Powered by:

TunasFlow


Create:


- State

- Transition

- Approval

- Automation

- SLA

- Escalation


---


## Report Builder


Create:


- Operational Report

- Compliance Report

- Management Report


Support:


- Parameter

- Schedule

- Export

- Subscription


---


## Dashboard Builder


Rule:


Dashboard must answer:


1. What happened?

2. What needs attention?

3. What action required?


Components:


- KPI

- Chart

- Timeline

- Exception Card

- IoT Widget


---


# MANAGER / PROCESS OWNER


Workspace:

Process Studio


Allowed:


Flow Editor:

✓


Form Editor:

Limited


Action Editor:

Limited


Report Builder:

✓


Dashboard Builder:

✓



Example:


Production Manager:


Can change:


Production Dashboard


Cannot change:


Runtime Metadata


---


# STAFF USER


Workspace:

Personal Studio


Allowed:


## Report Builder


Self Service


## Dashboard Builder


Personal View


## Notification Builder


Example:


Notify me when:


- My approval waiting

- Machine downtime

- Stock below limit


---

# 4. STUDIO ARCHITECTURE


```
REDI Studio UI


        |


Builder Engine


        |


Metadata Generator


        |


Validation Engine


        |


Registry


        |


Runtime Renderer
```


---

# 5. BUILDER OUTPUT FORMAT


Every builder creates metadata.


Example:


Form Builder:


OUTPUT:


```json
{
 "type":"workspace_card",

 "component":"approval",

 "action":[
   "approve",
   "reject"
 ]

}
```


NOT:


```html
<form>

<input/>

<button/>

</form>
```


---

# 6. DESIGN SYSTEM LOCK


All generated UI must use:


```
packages/ui-system
```


Allowed:


- Workspace

- Card

- ActionCard

- Timeline

- Kanban

- DataGrid

- KPI

- Wizard

- Modal

- Drawer


Forbidden:


- Random Component

- Custom Layout without token

- Inline Styling


---

# 7. MOBILE FIRST RULE


Every builder output must support:


Desktop

Tablet

Mobile


Because:


Production Operator

Warehouse

Engineering


mostly mobile.


---

# 8. VERSION CONTROL


Every change stored:


Metadata Version


Example:


```
Form:

work_order_form


v1

v2

v3
```


Support:


Rollback.


---

# 9. PREVIEW ENGINE


Before publish:


Designer


↓

Preview Workspace


↓

Validate


↓

Publish
```


No direct production change.


---

# 10. AI ASSISTED BUILDER READY


Future:


User:


"Create QC Incoming Flow"


AI generates:


- Metadata

- Form

- Workflow

- Dashboard


Human approves.


---

# 11. ACCEPTANCE CRITERIA


Phase complete when:


## Studio


✔ Builder creates metadata

✔ No source code generation


## UI


✔ Existing UX preserved

✔ Runtime renderer compatible


## Permission


✔ Admin / Programmer / Manager / Staff separated


## Version


✔ Metadata versioning works


---

# 12. STRICT CURSOR RULE


DO NOT:


❌ Generate CRUD admin

❌ Create ERP menu

❌ Create custom UI everywhere

❌ Generate React pages per module



ONLY BUILD:


✅ Builder Engine

✅ Designer

✅ Metadata Generator

✅ Preview Engine


UI comes from:


Experience Engine

+

Runtime Renderer


---

# NEXT


PHASE 5:

CAPABILITY PACKAGE ENGINE
