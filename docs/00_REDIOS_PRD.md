# RediOS Platform
# Product Requirement Document (PRD)

Version: 2.0  
Status: Active Development  
Current Phase: 18.x  
Architecture: Metadata Driven Enterprise Platform

---

# 1. Vision

RediOS is an Enterprise Operating Platform designed to build, customize, and operate business applications without rewriting source code.

Core principle:

> Business changes should modify metadata, not application code.

RediOS separates:

- Platform Kernel
- Business Definition
- User Experience
- Integration Layer

The kernel stays stable while every company can create different:

- applications
- workflows
- forms
- approvals
- processes
- permissions
- UI experiences

using metadata.

---

# 2. Product Positioning

RediOS aims to become a flexible enterprise platform comparable in concept to:

- ServiceNow
- Salesforce Platform
- Microsoft Power Platform
- Odoo Studio

but designed with:

- kernel-first architecture
- metadata-first runtime
- multi-tenant isolation
- developer extensibility
- enterprise scalability


RediOS is NOT:

- traditional ERP
- fixed CRM
- fixed Helpdesk
- fixed Inventory


RediOS is:

> Platform to create platforms.

---

# 3. Problem Statement

Traditional enterprise systems create:

```
InventoryService

AssetService

TicketService

AccountingModule

CRMModule
```

inside source code.


Problems:

- customization requires developer
- upgrade becomes difficult
- every client creates fork
- business logic is locked
- integration becomes expensive


RediOS solution:

Move business behavior into metadata.

---

# 4. Kernel First Architecture

Backend contains generic engines only.

Examples:

```
Runtime Engine

Metadata Engine

Action Engine

Security Engine

Workflow Engine

Process Engine

Business Engine

Event Engine

Ledger Engine

Relation Engine

Query Engine

UI Engine

Form Engine

Theme Engine

Navigation Engine

Experience Engine
```

Business applications are metadata.

---

# 5. No Hardcoded Business Module Rule

NEVER create:

```
workOrder.service.ts

inventory.service.ts

asset.controller.ts

ticket.module.ts

crm.schema.ts
```


Allowed:

```
runtime.service.ts

metadata-engine.ts

workflow-engine.ts

form-engine.ts

ui-engine.ts
```

---

# 6. Multi Tenant Strategy


Every metadata is scoped by:


```
tenantId

domainCode

applicationCode
```


Example:

Company A:

WORK_ORDER flow:

```
CREATE

↓

APPROVAL

↓

ASSIGN

↓

EXECUTE

↓

DONE
```


Company B:

same WORK_ORDER:

```
CREATE

↓

ASSIGN

↓

DONE
```


No backend change.

Only metadata.

---

# 7. Metadata Driven Applications


Application consists of:


## Data

ENTITY

FIELD

RELATION


## Behavior

ACTION

WORKFLOW

PROCESS

BUSINESS RULE

EVENT


## Experience

VIEW

FORM

UI

THEME

NAVIGATION

EXPERIENCE


## Security

RBAC

ABAC

FIELD POLICY

DATA POLICY


## Operation

AUDIT

TRACE

SIMULATION

DEPENDENCY


---

# 8. RediOS Studio


RediOS Studio provides visual builders.


## Application Builder

Create:

- ERP
- CRM
- Helpdesk
- Asset Management
- HR
- Custom Apps


without coding.


---

## Form Builder


User can:

- drag field
- add section
- change component
- create lookup
- configure validation


Result:

Metadata updated.


No React change.

No API change.


---

## UI Builder


Supports Atomic Design:


```
PAGE

 ↓

TEMPLATE

 ↓

ORGANISM

 ↓

MOLECULE

 ↓

ATOM
```


Examples:

BUTTON

INPUT

CARD

TABLE

TIMELINE

FORM


---

## Theme Builder


Client can customize:

- colors
- spacing
- typography
- density
- navigation style


without deployment.


---

# 9. Web and Mobile Strategy


Important:


WEB UI != MOBILE UI


Both consume same metadata but different experience.


Example:


```
WORK_ORDER_PAGE

WEB:

sidebar + table + detail


MOBILE:

card + bottom navigation
```


Controlled by:

Experience Engine.


---

# 10. Offline Mobile Strategy


Mobile supports offline foundation:


- local metadata
- local document draft
- sync queue
- conflict detection


Advanced offline synchronization is separate phase.


---

# 11. Integration Vision


RediOS supports integration with:


Communication:

- WhatsApp
- Telegram
- Email


Productivity:

- Microsoft 365
- Google Workspace


Enterprise:

- API
- Webhook
- Event Bus
- External Workflow


Integration must be metadata driven.

No hardcoded connector logic.

---

# 12. Security Requirement


Enterprise security:

- RBAC
- ABAC
- Field ACL
- Data Policy
- Audit Trail
- Compliance


Security is evaluated dynamically.

---

# 13. Performance Strategy


RediOS must support enterprise scale.


Principles:

DO NOT cache transactional truth.


Avoid:

```
cache document state blindly
```


Use:


## Metadata Runtime Compiler


Compile:

metadata

↓

runtime optimized structure


## Version Based Cache


Example:


```
metadataVersion = 20


cache key:

tenant:app:v20
```


Metadata change:

new version

automatic refresh


---

# 14. Target Enterprise Capability


RediOS must support:

- thousands of users
- millions of records
- large enterprise tenants
- custom processes
- multiple applications


without source code fork.


---

# 15. Long Term Vision


A company should be able to build:

ERP

CRM

ITSM

HR

Asset Management

Industry specific application


from RediOS Studio only.


Final goal:


> Build enterprise software at metadata speed.
---

# 16. RediOS Studio Architecture


RediOS Studio is the control center for metadata creation.


Studio does NOT generate source code.


Studio creates:

```
Metadata Definition
        |
Validation Engine
        |
Simulation Engine
        |
Dependency Engine
        |
Publish
        |
Runtime Engine
```


---

## 16.1 Entity Designer


Capabilities:

- create entity
- add fields
- configure datatype
- configure validation
- configure relation
- configure indexes


Example:

User creates:

CUSTOMER

Fields:

- name
- email
- phone


System creates metadata only.


No database model class.

No API controller.


---

## 16.2 Workflow Designer


User can visually create:


```
STATE

 |

ACTION

 |

STATE
```


Example:


OPEN

 |

APPROVE

 |

DONE



Before publish:


Validation checks:

- missing state
- invalid transition
- missing action


---

## 16.3 Process Designer


Used for automation.


Example:


When:

WORK_ORDER APPROVED


Then:

- assign technician
- send notification
- create task


Metadata:


PROCESS


No custom worker.


---

## 16.4 Page Designer


User can compose:


PAGE

TEMPLATE

SECTION

COMPONENT


Using Atomic Design Engine.


---

## 16.5 Security Designer


Configure:


Role Based Access Control

Attribute Based Access Control

Field Level Permission

Data Visibility Rule


Examples:


Manager:

can see cost


Technician:

cannot see cost


Same API.

Different policy.


---

# 17. Metadata Lifecycle


Metadata is never directly changed.


Flow:


```
CREATE DRAFT

      |

CHANGE

      |

DEPENDENCY CHECK

      |

SIMULATION

      |

VALIDATION

      |

PUBLISH VERSION

      |

RUNTIME
```


Benefits:

- safe customization
- rollback support
- audit history
- enterprise governance


---

# 18. Version Management


Every metadata publish creates version.


Example:


Version 10:


WORK_ORDER_FORM

5 fields


Version 11:


WORK_ORDER_FORM

6 fields



Runtime knows active version.


Rollback supported.


---

# 19. Application Marketplace Vision


Future RediOS applications:


Examples:


## ITSM

Metadata:

Ticket

Incident

Problem

Change Request


---

## ERP

Metadata:

Inventory

Purchase

Warehouse

Finance


---

## CRM

Metadata:

Lead

Customer

Opportunity


---


All apps are metadata packages.


No source fork.


---

# 20. Integration Hub


Future integration engine supports:


## Communication


WhatsApp

Telegram

Email

SMS


---

## Productivity


Microsoft 365

Google Workspace


---

## Enterprise


REST API

Webhook

Message Queue

Event Stream



Integration rules:


Connector = generic

Mapping = metadata


Never:


GoogleService.ts

WhatsAppWorkflow.ts


---

# 21. Reporting & Analytics


Future reporting engine:


Dashboard Builder


Chart Builder


KPI Builder


Data Explorer



Based on:


VIEW metadata

QUERY engine

SECURITY policy



Reports respect permission.


---

# 22. AI Assistant Vision


RediOS AI Assistant can help:


Generate:

- entity
- workflow
- form
- report
- automation


Example:


User:

"Create asset maintenance system"


AI generates:


ENTITY

FIELD

FORM

WORKFLOW

PROCESS


Human validates.


---

# 23. Performance Architecture


RediOS must support enterprise workload.


Avoid:


```
request

↓

parse thousands metadata

↓

execute
```


Target:


```
metadata

↓

compile

↓

runtime package

↓

execute
```


---

## Metadata Runtime Package


Example:


Tenant A


Application ERP


Version 25



Compile:


Workflow Graph

Security Matrix

Form Schema

UI Tree

Navigation Tree


---

## Cache Policy


Do not cache transactional truth.


Allowed:


Metadata cache

Compiled runtime cache

Static configuration cache


Avoid:


Document state cache

Workflow state cache


---

# 24. Enterprise Scale Target


Architecture target:


Small:

100 users


Medium:

10,000 users


Enterprise:

100,000+ users



Scaling strategy:


Horizontal API

Worker Pool

Database Partition

Metadata Compiler

Async Event Processing


---

# 25. Offline Strategy Decision


Offline foundation exists:


SYNC_POLICY

CONFLICT_POLICY

ACTION QUEUE


Current scope:

Foundation only.


Deferred enterprise offline:


- advanced conflict UI
- delta sync
- background sync
- device management
- encryption policy


Moved to Enterprise Offline Phase.


---

# 26. Audit & Compliance


Every important action:


who

when

where

before

after

why



Supported by:


Trace Engine

Audit Event

Metadata Version


---

# 27. Observability


Platform must provide:


Runtime Trace

Execution Timeline

Performance Metrics

Error Tracking

User Activity


---

# 28. Development Roadmap


Completed:


Kernel Foundation

Metadata Engine

Runtime Engine

Workflow Engine

Process Engine

Business Rule Engine

Event Engine

Ledger Impact Engine

Trace Engine

Simulation Engine

Validation Engine

Relation Engine

Query/View Engine

UI Composition

Form Engine

Designer Engine

Theme Engine

Navigation Engine

Security Policy Engine

Experience Engine

Mobile Runtime Foundation

Offline Foundation


---

# 29. Next Priority


Immediate focus:


RediOS Studio


Including:


Application Builder

Entity Builder

Form Builder

Workflow Builder

Page Builder

Security Builder


Goal:


User can create complete application without developer.


---

# 30. Final Product Goal


RediOS should enable:


Idea

↓

Metadata Design

↓

Simulation

↓

Publish

↓

Production Application



without source code change.



END OF DOCUMENT