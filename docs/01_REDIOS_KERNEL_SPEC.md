# RediOS Kernel Specification

Version: 1.0  
Status: Active  
Current Kernel Phase: 9.6 Completed  

---

# 1. Kernel Principle

RediOS uses:

Metadata Driven Kernel Architecture

The kernel executes business behavior from metadata.

The kernel must NEVER understand business domains.

Example:

Kernel does NOT know:

- Inventory
- Accounting
- Asset
- Ticket
- Work Order
- CRM

Kernel only understands:

- Metadata
- Runtime
- Action
- Security
- Workflow
- Process
- Business Rule
- Event
- Trace
- Simulation
- Ledger Impact

---

# 2. Forbidden Architecture


Never create:

```ts
InventoryService
StockService
AssetService
WorkOrderService
TicketService
CustomerService
AccountingService
```


Never create:

```ts
InventoryController
AssetController
WorkOrderController
TicketController
CRMController
```


Never create:

```ts
inventory.schema.ts
asset.schema.ts
ticket.schema.ts
```


Business objects are metadata only.

Allowed:

```ts
RuntimeController

MetadataEngine

WorkflowEngine

BusinessEngine

EventEngine

LedgerEngine
```

---

# 3. Runtime Pipeline


All execution MUST follow:


```
Runtime API

 ↓

Runtime Context

 ↓

Metadata Resolver

 ↓

Action Engine

 ↓

Security Engine

 ↓

Workflow Engine

 ↓

Process Engine

 ↓

Business Engine

 ↓

Event Engine

 ↓

Ledger Engine (future)

 ↓

Trace Engine

```


No engine can bypass previous engine.


---

# 4. Runtime Context


Every execution contains:

```ts
RuntimeContext {

 tenantId

 domainCode

 applicationCode

 userId

 permissions[]

 capabilities[]

}
```


Every metadata lookup MUST include:

```ts
tenantId
domainCode
applicationCode
```


Purpose:

Different companies can have different:

- workflow
- rules
- permissions
- process

without code changes.


---

# 5. Metadata Model


All definitions stored inside:

```
metadata_definitions
```


Generic structure:


```ts
MetadataDefinition {

 tenantId

 domainCode

 applicationCode

 type

 code

 version

 enabled

 definition

}
```


Allowed metadata types:

```
APPLICATION

ENTITY

FIELD

ACTION

WORKFLOW

PROCESS

BUSINESS

EVENT

LEDGER (future)
```


---

# 6. Runtime Storage


Business data stored generic:

```
runtime_documents
```


Example:


```json
{
 entityCode:"WORK_ORDER",

 status:"OPEN",

 data:{
   title:"AC Broken",
   priority:"HIGH"
 }
}
```


Forbidden:

```
work_orders collection

assets collection

tickets collection
```


---

# 7. Action Engine


Action controls:

"What user wants to do"


Example:

```
CREATE

UPDATE

START

APPROVE

CANCEL
```


Action metadata:


```json
{
 code:"START",

 entityCode:"WORK_ORDER",

 permissions:[
  "WORK_ORDER.START"
 ],

 behavior:{
   confirmation:true
 }
}
```


Action Engine responsibility:

- resolve action metadata
- check enabled
- prepare action plan


---

# 8. Security Engine


Security is metadata based.

Responsible:

- validate context
- validate permissions


Example:


Action requires:

```
WORK_ORDER.START
```


User context:

```
permissions:[
 WORK_ORDER.START
]
```


Allowed.


No hardcoded role logic.


---

# 9. Workflow Engine


Workflow controls:

"Where document moves"


Example:


```
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


Workflow metadata:


```json
{
 states:[
  OPEN,
  IN_PROGRESS,
  DONE
 ],

 transitions:[
 {
  actionCode:"START",
  from:"OPEN",
  to:"IN_PROGRESS"
 }
 ]
}
```


Rules:

- no hardcoded state
- no enum status
- status comes from metadata


---

# 10. Process Engine


Process controls:

"What steps happen"


Example:

START action:

```
VALIDATE

BUSINESS_RULE

EVENT

LEDGER
```


Metadata:


```json
{
 processCode:"START_PROCESS",

 steps:[
  VALIDATION,
  BUSINESS,
  EVENT
 ]
}
```


---

# 11. Business Engine


Business Engine executes:

metadata rules


Supported rules:


```
VALIDATE_REQUIRED_FIELD

SET_FIELD_VALUE

CALCULATE_FIELD
```


Example:


```json
{
 type:"SET_FIELD_VALUE",

 config:{
  field:"status",
  value:"DONE"
 }
}
```


Forbidden:


```ts
if(entity==="WORK_ORDER")
```


---

# 12. Event Engine


Event handles side effects.


Example:

Action:

```
WORK_ORDER START
```


Can trigger:


```
Notification

Audit

Webhook

Integration

Message Queue
```


Event metadata:


```json
{
 eventCode:"WORK_ORDER_STARTED",

 handlers:[
  {
    type:"NOTIFICATION"
  }
 ]
}
```


Phase 9:

Event only creates execution plan.

No real external execution yet.


---

# 13. Trace Engine


Every runtime execution creates trace.


Collection:

```
runtime_traces
```


Contains:


```
ACTION SUCCESS

SECURITY SUCCESS

WORKFLOW SUCCESS

PROCESS SUCCESS

BUSINESS SUCCESS

EVENT SUCCESS
```


Purpose:

- debugging
- audit
- simulation comparison
- AI explanation


---

# 14. Trace Sanitizer


Before storing trace:

Sensitive data MUST be masked.


Fields:

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


Before:


```json
{
 password:"secret123"
}
```


After:


```json
{
 password:"***MASKED***"
}
```


---

# 15. Metadata Validation Engine


Before metadata activation:

Validate:

APPLICATION:

- duplicate code
- missing entity


ENTITY:

- missing fields
- missing actions
- missing workflow


WORKFLOW:

- missing state
- invalid transition
- invalid action
- missing initial state


PROCESS:

- invalid trigger
- invalid step


BUSINESS:

- invalid field reference


EVENT:

- invalid handler


---

# 16. Simulation Engine


Simulation checks:

"What will happen if user runs this?"


Without saving real transaction.


Example:


Input:

```
WORK_ORDER

Action START
```


Output:


```json
{
 success:true,

 workflow:{
  from:"OPEN",
  to:"IN_PROGRESS"
 },

 process:true,

 event:true
}
```


Invalid:


Workflow:

```
OPEN -> APPROVE
```


but APPROVE missing:


Output:


```json
{
 success:false,

 error:"STATE_NOT_FOUND"
}
```


---

# 17. Future Ledger / Impact Engine


Purpose:

One action creates multiple impacts.


Example:


Receiving Item:

Action:

```
RECEIVE
```


Impact:


```
Inventory +

Stock Movement +

Accounting Journal +

Asset Creation +
```


Important:

Do NOT create:

```ts
InventoryService

AccountingService
```


Create:


```ts
LedgerEngine
```


Metadata:


```json
{
 impact:[
 {
  target:"STOCK",
  operation:"INCREASE"
 },

 {
  target:"JOURNAL",
  operation:"CREATE"
 }
]
}
```


---

# 18. AI Agent Rules


When AI modifies RediOS:

ALWAYS check:


```
npm run typecheck

npm run build
```


Forbidden search:


```
grep:

Service

Controller

Schema
```


for business entities.


Must remain empty:


```
workOrderService

assetService

inventoryService

ticketController

accountingController
```


---

# 19. Design Goal


Kernel should survive for years.


Business changes should create:

metadata changes


NOT:

code changes


Final principle:


```
Stable Kernel

+

Dynamic Metadata

=

Unlimited Enterprise Applications
```

