# RediOS Platform
# Product Requirement Document (PRD)

Version: 1.0  
Status: Active Development  
Current Kernel Phase: 9.6 Completed  
Next Phase: Ledger / Impact Engine  

---

# 1. Vision

RediOS is an enterprise operating platform designed to build business applications without rewriting application logic.

The main idea:

> Business changes should modify metadata, not source code.

RediOS separates:

- Platform Kernel
- Business Definition
- User Experience

The kernel remains stable while companies can create different applications, workflows, forms, permissions, and processes dynamically.

---

# 2. Problem Statement

Traditional ERP / SaaS applications usually create:

- modules
- services
- controllers
- database schemas
- workflows

directly inside source code.

Example:

InventoryService

WorkOrderService

CRMService

AccountingService


This creates problems:

- customization is expensive
- upgrades are difficult
- different companies require different forks
- business logic becomes locked inside code

---

# 3. RediOS Philosophy

RediOS follows:

## Kernel First Architecture

The system provides generic engines:

- Runtime Engine
- Metadata Engine
- Action Engine
- Security Engine
- Workflow Engine
- Process Engine
- Business Engine
- Event Engine
- Trace Engine
- Simulation Engine
- Future Ledger Engine


Business applications are only metadata.

---

# 4. Core Rule

RediOS must NEVER create hardcoded business modules.

Forbidden examples:

```
inventory.service.ts
stock.service.ts
asset.service.ts
workOrder.service.ts
ticket.service.ts
crm.service.ts
accounting.service.ts
```

Forbidden:

```
InventoryController
AssetController
TicketController
WorkOrderController
```

Allowed:

```
RuntimeController
MetadataEngine
WorkflowEngine
BusinessEngine
```

---

# 5. Metadata Driven Application Model


Applications are created using metadata:

Example:

```
Application:
ASSET_MAINTENANCE

Entities:
- ASSET
- WORK_ORDER

Fields:
- title
- priority
- status

Actions:
- CREATE
- START
- COMPLETE

Workflow:
OPEN
 |
START
 |
IN_PROGRESS
 |
COMPLETE
 |
DONE
```


No new backend code.

---

# 6. Multi Tenant / Multi Company Strategy


RediOS supports different companies having different behavior.

Controlled by:

```
tenantId
domainCode
applicationCode
```


Example:


## Company A

Work Order flow:

```
CREATE
 |
ADMIN REVIEW
 |
SCHEDULE
 |
ASSIGN PIC
 |
ALLOCATE SPAREPART
 |
EXECUTE
 |
DONE
```


## Company B

Same WORK_ORDER entity:

```
CREATE
 |
ASSIGN
 |
DONE
```


Difference:

Not code.

Only metadata.


---

# 7. RediOS Studio Vision


RediOS will provide visual builders:

## Application Builder

Create:

- ERP module
- CRM module
- Helpdesk
- Asset Management
- Custom application


without programming.


---


## Form Builder


User can:

- add field
- remove field
- change validation
- change visibility
- change layout


Examples:

Add:

```
assetLocation
serialNumber
customerSegment
```

No migration required.


---

## Workflow Builder


User can design:

Example:

```
DRAFT

APPROVE

DONE
```


Before saving:

Simulation Engine validates:

- missing states
- invalid transition
- missing permission
- invalid action
- broken process


---

## Security Builder


Metadata controls:

- role access
- action permission
- field visibility
- field readonly
- data scope


Example:

Manager:

```
CAN_APPROVE = true
```

Staff:

```
CAN_APPROVE = false
```


---

## Report Builder


Future capability:

Users can create:

- operational report
- dashboard
- KPI
- analytics

based on metadata.


---

# 8. Runtime Execution Concept


Every request flows through:

```
Runtime API

    |
    v

Context

    |
    v

Metadata Resolver

    |
    v

Action

    |
    v

Security

    |
    v

Workflow

    |
    v

Process

    |
    v

Business Rules

    |
    v

Event

    |
    v

Trace

```


Every execution can be audited.

---

# 9. Simulation First Concept


Before metadata goes live:

RediOS simulates execution.


Example:


User creates workflow:

```
OPEN

APPROVE

DONE
```


But transition references:

```
OPEN -> REVIEW
```


Simulation detects:

```
ERROR:

State REVIEW does not exist.
```


Metadata cannot be activated until valid.


---

# 10. AI Assisted Configuration


Future RediOS Studio can use AI Agent assistance.

Example request:

User:

"Create asset maintenance application with approval workflow"


AI generates metadata:

- entities
- fields
- workflow
- actions
- process
- business rules


Simulation validates before activation.


---

# 11. Target Platform Comparison


RediOS aims to combine concepts from:

## Service Management Platforms

Dynamic:

- workflow
- ticket
- approval
- automation


## ERP Platforms

Enterprise:

- accounting
- inventory
- CRM
- asset
- operation


## Low Code Platforms

Configurable:

- form
- data model
- process


But RediOS difference:

Kernel does not know business domains.


---

# 12. Example Applications


Applications are metadata packages:

## Asset Management

Contains:

- Asset
- Maintenance
- Work Order


## Helpdesk

Contains:

- Ticket
- SLA
- Escalation


## Warehouse

Contains:

- Receiving
- Stock Movement
- Transfer


## CRM

Contains:

- Customer
- Lead
- Opportunity


## Finance

Future:

- Journal
- Ledger
- Settlement


No dedicated backend modules.

---

# 13. Development Roadmap


Completed:

## Phase 1-4

Foundation:

- Metadata
- Runtime API
- Storage
- Swagger


## Phase 5

Action + Security Engine


## Phase 6

Workflow Engine


## Phase 7

Process Engine


## Phase 8

Business Engine


## Phase 9

Event Engine


## Phase 9.5

Runtime Trace Engine


## Phase 9.5.1

Trace Sanitizer


## Phase 9.5.2

Metadata Validation Engine


## Phase 9.6

Simulation Engine


---

# Next Phase


## Phase 10

Ledger / Impact Engine


Purpose:

One business action can create multiple impacts.


Example:

Receiving Item:

Action:

```
RECEIVE
```

Impact:

```
+ Inventory Quantity

+ Stock Movement

+ Accounting Journal

+ Asset Creation

+ Audit Log
```


Without hardcoded services.


---

# 14. Final Product Goal


RediOS should allow:

"Build enterprise software by configuring business knowledge,
not rewriting application code."


The value is not only the engine.

The value is:

- business experience
- industry process knowledge
- reusable metadata
- automation intelligence


```
One Kernel

Unlimited Applications
```
