# RediOS Kernel Specification

Version: 2.0  
Status: Active Development  
Architecture: Metadata Driven Runtime Kernel  
Current Capability: Phase 18.x Foundation Complete


---

# 1. Kernel Philosophy


RediOS Kernel is the stable execution layer.

The kernel NEVER understands business domain.


Kernel does NOT know:


```
Inventory

Accounting

Work Order

Ticket

CRM

HR

Asset
```


Those are applications.

Applications are metadata.


---

# 2. Core Principle


The most important rule:


```
CHANGE METADATA

NOT CODE
```


Business change:

DO NOT:

change service

change controller

change frontend


DO:

change metadata


---

# 3. Forbidden Backend Pattern


Never create:


```
WorkOrderService

TicketWorkflow

EntitySpecificProcess

AssetPermission

CustomerForm

InvoiceController
```


Because this creates product fork.


---

Allowed:


```
RuntimeEngine

WorkflowEngine

ProcessEngine

FormEngine

QueryEngine

SecurityEngine
```


Generic only.


---

# 4. Kernel Architecture Overview



```
                 USER


                  |

                  v


          Runtime API Layer


                  |

                  v


          Runtime Context


                  |

                  v


        Metadata Resolver


                  |

                  v


+--------------------------------+

|         Kernel Engines          |

+--------------------------------+

|                                |

| Action Engine                  |

| Security Engine                |

| Workflow Engine                |

| Process Engine                 |

| Business Engine                |

| Event Engine                   |

| Ledger Impact Engine           |

| Trace Engine                   |

|                                |

+--------------------------------+

                  |

                  v


          Document Storage

```


---

# 5. Metadata Storage Principle


All definitions stored as:


metadata_definitions


Example:


```
{
 type:"WORKFLOW",

 code:"WORK_ORDER_FLOW",

 tenantId:"xxx",

 domainCode:"SERVICE",

 applicationCode:"ASSET",

 definition:{}

}
```


Kernel only reads:


type

code

definition


Never entity specific collection.


---

# 6. Metadata Scope


Every metadata supports:


```
tenantId

domainCode

applicationCode
```


Purpose:


Multi company

Multi industry

Multi application


---

# 7. Current Metadata Types


## Application Foundation


```
TENANT

DOMAIN

APPLICATION
```


---


## Data Layer


```
ENTITY

FIELD

RELATION
```


---

## Action Layer


```
ACTION
```


---

## Runtime Layer


```
WORKFLOW

PROCESS

BUSINESS_RULE

EVENT

LEDGER
```


---

## Presentation Layer


```
VIEW

FORM

UI

THEME

NAVIGATION

EXPERIENCE
```


---

## Security Layer


```
SECURITY_POLICY
```


Supports:


RBAC

ABAC

Field ACL

Data Policy


---

## Governance Layer


```
DEPENDENCY

VALIDATION

SIMULATION

TRACE

VERSION
```


---

## Mobile Runtime Layer


```
SYNC_POLICY

CONFLICT_POLICY
```


---

# 8. Runtime Execution Contract


Every action follows same pipeline.



Example:


User:


```
START WORK_ORDER
```


Kernel sees:


```
ACTION START

ENTITY WORK_ORDER
```


Not:


```
startWorkOrder()
```


---

Execution:


```
Runtime Request


        |


Action Resolve


        |


Security Check


        |


Workflow Transition


        |


Process Execute


        |


Business Rule


        |


Event Publish


        |


Ledger Impact


        |


Trace Save
```


---

# 9. Runtime Context


Every engine receives:


```
RuntimeContext {

 tenantId

 userId

 domainCode

 applicationCode

 entityCode

 actionCode

 metadataVersion

}
```


Never pass business object.


---

# 10. Action Engine


Responsible:


- validate action exists

- resolve action metadata

- prepare execution


Example:


Metadata:


```
{
 code:"APPROVE",

 entity:"REQUEST"
}
```


No:


approveRequest()


---

# 11. Security Policy Engine


Security is evaluated runtime.


Supports:


## RBAC


Example:


Role:

MANAGER


Can:

APPROVE


---


## ABAC


Example:


Allow if:


department == user.department


---


## Field Policy


Example:


cost:


Manager:

visible


Technician:

hidden


---

# 12. Workflow Engine


Workflow is metadata graph.


Example:


```
OPEN

 |

APPROVE

 |

DONE
```


Stored:


STATE

TRANSITION

ACTION



Validation prevents:


Transition to missing state.


---

# 13. Process Engine


Process executes automation.


Example:


After APPROVE:


```
Send Notification

Create Task

Update Field
```


No custom code.


---

# 14. Business Rule Engine


Executes rules:


Examples:


Validation


Calculation


Condition


Automation



Example:


```
IF priority = HIGH

THEN escalation = TRUE
```


Metadata only.


---

# 15. Event Engine


Responsible:


Publish events.


Example:


```
WORK_ORDER_APPROVED
```


Handlers:


EMAIL

WEBHOOK

PROCESS

INTEGRATION


---

# 16. Ledger Impact Engine


Important:


Ledger != Accounting only.


Ledger means:


Controlled business impact.


Example:


Receiving:


```
ACTION RECEIVE


creates:


STOCK_MOVEMENT

INVENTORY_IMPACT

AUDIT
```


Metadata:


LEDGER


No inventory code.


---
---

# 17. Trace Engine


Trace Engine is the black box recorder of RediOS.


Every runtime execution creates trace.


Example:


```
ACTION_RECEIVED

↓

SECURITY_CHECK

↓

WORKFLOW_TRANSITION

↓

PROCESS_EXECUTION

↓

BUSINESS_RULE

↓

EVENT_TRIGGER

↓

LEDGER_IMPACT

↓

COMPLETED
```


Purpose:


- debugging
- audit
- compliance
- support


---

## Trace Sanitizer


Sensitive data must never be stored raw.


Masked:


```
password

secret

token

accessToken

refreshToken

apiKey

authorization

credential
```


Example:


Input:


```
{
 password:"abc123"
}
```


Stored:


```
{
 password:"***MASKED***"
}
```


---

# 18. Validation Engine


Validation runs before metadata publish.


Purpose:


Prevent invalid application creation.


Checks:


APPLICATION:

- duplicate application
- invalid reference


ENTITY:

- missing field
- invalid action


WORKFLOW:

- missing state
- broken transition
- missing action
- multiple initial states


FORM:

- invalid field
- invalid lookup


UI:

- invalid component tree


SECURITY:

- invalid policy


---

# 19. Simulation Engine


Simulation allows testing metadata without execution.


Flow:


```
Metadata Draft

      |

Simulation Engine

      |

Prediction Result
```


Example:


User creates:


```
OPEN

 |

APPROVE

 |

DONE
```


but APPROVE state missing.


Simulation returns:


```
STATE_NOT_FOUND
```


---

Simulation predicts:


- workflow
- process
- event
- ledger impact
- relation
- view
- form
- UI
- security
- navigation
- conflict


---

# 20. Relation Engine


Relation Engine manages entity relationship.


Example:


WORK_ORDER


has relation:


ASSET



Metadata:


```
WORK_ORDER_ASSET_RELATION
```



Never:


```
populateAsset()
```


Runtime resolves relation dynamically.


---

# 21. Query / View Engine


All data views are metadata.


Never create:


```
WorkOrderListQuery
AssetTableQuery
```


Use:


VIEW metadata.


Example:


```
WORK_ORDER_LIST_VIEW
```


contains:


columns

filters

relations

sorting


---

# 22. Form Engine


Forms are metadata driven.


Never create:


```
EntitySpecificForm

TicketForm

CustomerForm
```


Form metadata:


```
{
 entity:"WORK_ORDER",

 fields:[

 title,

 priority,

 assetId

 ]
}
```


Runtime creates form schema.


---

# 23. Lookup Resolution


Lookup uses:


```
Relation Engine

+

View Engine
```


Example:


Field:


assetId


Display:


```
AC Server Room
```


Flow:


```
FORM

 |

RELATION

 |

VIEW

 |

QUERY
```


No direct entity query.


---

# 24. UI Composition Engine


RediOS UI follows Atomic Design.


Hierarchy:


```
PAGE

 |

TEMPLATE

 |

ORGANISM

 |

MOLECULE

 |

ATOM
```



Example:


```
WORK_ORDER_PAGE


MASTER_DETAIL_TEMPLATE


DETAIL_CARD


FORM_FIELD


TEXT_INPUT
```


---

Important:


UI metadata describes structure.


Renderer decides implementation.


---

# 25. Theme Engine


Theme controls visual identity.


Metadata:


THEME


Controls:


- color
- typography
- spacing
- radius
- density


Example:


Tenant A:


blue corporate theme


Tenant B:


compact dark theme


Same application.


Different theme.


---

# 26. Navigation Engine


Navigation is metadata.


Never:


```
WorkOrderMenu.ts
```


Navigation supports:


- sidebar
- mobile tab
- menu tree
- permission filtering


Example:


```
MAIN_NAVIGATION

 |- Asset

 |- Work Order

 |- Ticket
```


Visibility controlled by Security Policy.


---

# 27. Adaptive Experience Engine


Important decision:


WEB EXPERIENCE

and

MOBILE EXPERIENCE


are different.



Same:


```
ENTITY

WORKFLOW

SECURITY

PROCESS
```


Different:


```
PAGE

LAYOUT

NAVIGATION

INTERACTION
```


Example:


WEB:


```
Table

+

Sidebar

+

Detail Panel
```


Mobile:


```
Card

+

Bottom Navigation

+

Swipe Action
```


---

# 28. Designer Engine


Designer changes metadata safely.


Never update production metadata directly.


Lifecycle:


```
CREATE DRAFT


      |


MODIFY


      |


DEPENDENCY CHECK


      |


SIMULATION


      |


VALIDATION


      |


PUBLISH VERSION
```


---

# 29. Metadata Versioning


Every publish creates immutable version.


Example:


```
Version 10

WORK_ORDER_FORM

5 fields
```



After change:


```
Version 11

WORK_ORDER_FORM

6 fields
```


Rollback creates new version.


Never edit history.


---

# 30. Dependency Engine


Before metadata change:


Analyze impact.


Example:


Remove:


```
assetId
```


Impacts:


```
FORM

VIEW

RELATION

SECURITY POLICY
```


Unsafe changes are blocked.


---

# 31. Security Architecture


Security is metadata driven.


Supports:


## RBAC


Role based.


Example:


ADMIN

TECHNICIAN


---

## ABAC


Attribute based.


Example:


```
user.department == document.department
```


---

## Field ACL


Example:


cost field:


Manager:

visible


Technician:

hidden


---

## Data Policy


Example:


User only sees:


own branch data.


---

# 32. Audit Requirement


All important actions must record:


who

when

where

what changed

before

after


Implemented through:


Trace Engine

Event Engine

Audit Metadata


---
---

# 33. Mobile Runtime Foundation


Mobile applications use same kernel metadata.


Mobile DOES NOT duplicate business logic.


Shared:


```
ENTITY

FIELD

ACTION

WORKFLOW

PROCESS

SECURITY

BUSINESS RULE
```


Mobile specific:


```
EXPERIENCE

LAYOUT

INTERACTION

SYNC POLICY
```


---

# 34. Mobile Renderer Rule


Never create:


```
WorkOrderMobileScreen

TicketMobilePage

AssetMobileForm
```


Allowed:


```
MetadataRenderer

MobileRenderer

ComponentRegistry
```


Example:


Metadata:


```
FORM_FIELD

component:

TEXT_INPUT
```


Mobile renders:


Native Input


Web renders:


HTML Input


---

# 35. Offline Sync Foundation


Offline is supported through metadata.


Foundation:


```
SYNC_POLICY

CONFLICT_POLICY

SYNC_QUEUE
```


Purpose:


Allow mobile operation during connection loss.


---

# 36. Offline Scope Decision


Current scope:


FOUNDATION ONLY


Implemented:

- metadata contract
- sync concept
- conflict detection model


Deferred:


Enterprise Offline Phase


Includes:

- background sync
- delta sync
- offline encryption
- device policy
- large dataset sync


---

# 37. Integration Architecture


Integration must be generic.


Never create:


```
WhatsAppService

GoogleCalendarWorkflow

OfficeApprovalCode
```


Allowed:


```
IntegrationEngine

ConnectorEngine

MappingEngine
```


---

# 38. Integration Flow


Example:


WORK_ORDER_APPROVED


Metadata:


```
EVENT

 |

INTEGRATION HANDLER

 |

CONNECTOR

 |

EXTERNAL SYSTEM
```


Connector examples:


Communication:

- WhatsApp

- Telegram

- Email


Productivity:

- Microsoft 365

- Google Workspace


Enterprise:

- REST API

- Webhook

- Message Queue


---

# 39. Performance Principle


RediOS must NOT parse raw metadata on every request.


Bad:


```
Request

 |

Load 500 metadata

 |

Parse JSON

 |

Execute
```


---

Correct:


```
Metadata

 |

Compile

 |

Runtime Package

 |

Execute
```


---

# 40. Metadata Runtime Compiler


Future performance layer.


Input:


```
ENTITY

WORKFLOW

FORM

UI

SECURITY

PROCESS
```


Compile into:


```
Runtime Graph

Security Matrix

UI Tree

Workflow Map

Validation Map
```


---

# 41. Cache Strategy


Important decision:


DO NOT cache transactional truth.


Avoid:


```
Document cache

Workflow state cache
```


Risk:


User sees outdated business data.


---

Allowed:


```
Metadata Cache

Compiled Runtime Cache

Theme Cache

Navigation Cache
```


---

# 42. Version Based Cache


Every metadata publish increments version.


Example:


Current:


```
Application:

ASSET


Metadata Version:

25
```


Cache:


```
ASSET:v25
```


After publish:


```
ASSET:v26
```


Old cache automatically ignored.


---

# 43. Database Strategy


Kernel supports large enterprise scale.


Rules:


Metadata:

optimized read


Transaction:

strong consistency


Trace:

append only


Event:

async capable


---

# 44. Scalability Target


Architecture target:


Small tenant:

hundreds users


Medium:

thousands users


Enterprise:

100k+ users


---

Scaling:


API horizontal scaling


Worker scaling


Database optimization


Runtime compiler


Async processing


---

# 45. Builder Studio Priority


After kernel foundation:


Priority moves to:


RediOS Studio


---

Studio modules:


Application Builder


Entity Builder


Field Builder


Workflow Builder


Form Builder


Page Builder


Theme Builder


Navigation Builder


Security Builder


Integration Builder


---

# 46. Renderer Architecture


Frontend must never contain business logic.


Forbidden:


```
if(entity=="WORK_ORDER")

show button
```


Correct:


```
metadata.actions[]

render()
```


---

# 47. Web Application Renderer


Web renderer responsibility:


Render:


PAGE

TEMPLATE

ORGANISM

MOLECULE

ATOM


Handle:


desktop UX

large screen

complex layout


---

# 48. Mobile Application Renderer


Mobile renderer responsibility:


Render same metadata


but optimize:


touch interaction


small screen


offline usage


native behavior


---

# 49. AI Assistant Future


AI can generate metadata.


Example:


Prompt:


"Create maintenance system"


AI creates:


```
ENTITY

FIELD

FORM

VIEW

WORKFLOW

PROCESS

SECURITY
```


User validates.


Kernel executes.


---

# 50. Enterprise Governance


Required:


Audit Trail

Metadata Version

Rollback

Approval Flow

Change History

Compliance Report


---

# 51. Current Completed Foundation


Completed:


Phase 1-18.x


Includes:


Metadata Engine

Runtime Engine

Action Engine

Security Engine

Workflow Engine

Process Engine

Business Engine

Event Engine

Ledger Impact Engine

Trace Engine

Trace Sanitizer

Validation Engine

Simulation Engine

Relation Engine

Query Engine

View Engine

UI Composition Engine

Form Engine

Designer Engine

Dependency Engine

Theme Engine

Navigation Engine

Security Policy Engine

Experience Engine

Mobile Foundation

Offline Foundation


---

# 52. Deferred Enterprise Features


Deferred intentionally:


Advanced Offline Sync


Runtime Compiler


Integration Marketplace


AI Builder


Reporting Engine


Monitoring Dashboard


High Availability Deployment


---

# 53. Kernel Stability Rule


Before adding feature ask:


Question 1:


Does kernel need to know business name?


If yes:


WRONG DESIGN


---


Question 2:


Can another tenant customize without code?


If no:


WRONG DESIGN


---


Question 3:


Can metadata describe this?


If yes:


CREATE METADATA ENGINE


---

# 54. Final Architecture Goal



```
Business Idea


      |


RediOS Studio


      |


Metadata


      |


Kernel Runtime


      |


Application
```



No source change.


No fork.


Enterprise customizable platform.


---

END OF KERNEL SPECIFICATION
