# RediOS Platform
# Kernel Specification
# Prototype v0.1



# 1. Kernel Execution Flow


Semua request wajib melalui:


Request

↓

Context Engine

↓

Application Engine

↓

Metadata Resolver

↓

Security Resolver

↓

Action Executor

↓

Process Engine

↓

Business Engine

↓

Storage / Ledger



Tidak boleh bypass engine.



==================================================


# 2. Context Engine


Membuat runtime context.


Output:


{
 userId,

 tenantId,

 domainCode,

 applicationCode,

 permissions,

 capabilities
}



Semua engine menerima context.



==================================================


# 3. Application Engine


Application bukan folder.


Application adalah metadata composition.


Example:


{
 application:"ERP",

 capabilities:[

 "FINANCE",

 "INVENTORY",

 "PURCHASE"

 ]

}



{
 application:"POS",

 capabilities:[

 "SALES",

 "PAYMENT"

 ]

}



==================================================


# 4. Capability Engine


Mengatur:

- module availability
- subscription
- feature access


Example:


WORK_ORDER enabled

FINANCE disabled



==================================================


# 5. Metadata Engine


Metadata Type:


APPLICATION

ENTITY

FIELD

ACTION

WORKFLOW

PROCESS

REPORT

RULE

EXPERIENCE



Metadata tidak berisi business calculation.



==================================================


# 6. Entity Contract


Entity menggantikan static model.


Entity Class:


MASTER

DOCUMENT

LEDGER

SNAPSHOT

CONFIGURATION



Example:


ITEM

=

MASTER



WORK_ORDER

=

DOCUMENT



STOCK_MOVEMENT

=

LEDGER



==================================================


# 7. Runtime Document Contract


Document mengikuti ERP pattern.


Structure:


{
 tenantId,

 domainCode,

 applicationCode,

 entityCode,


 documentNo,

 documentDate,


 status,

 workflowState,


 header:{},


 lines:[],


 attributes:{},


 references:[],


 audit:{}

}



header:

single document information



lines:

transaction detail



attributes:

dynamic/custom field



references:

document flow



Example:


Purchase Order

↓

Goods Receipt

↓

Invoice



==================================================


# 8. Relationship & Query Engine


Relationship bukan untuk ERP calculation.


Relationship Type:


1. Reference


Untuk:

lookup

validation



Example:


WO → Asset



--------------------------------


2. Document Flow


Untuk:

transaction chain



Example:


SO

↓

Delivery

↓

Invoice



--------------------------------


3. Ledger Relation


Untuk business impact.


Transaction

↓

Engine

↓

Ledger



--------------------------------


4. Data View


Untuk:

- costing

- finance report

- dashboard

- analytic



Report tidak join runtime document langsung.



==================================================


# 9. Data View Engine


Menggantikan complex hardcoded query.


Flow:


Request Report

↓

Data View Definition

↓

Source Resolver

↓

Aggregation Pipeline

↓

Calculation Engine

↓

Result



Example:


ITEM_COST_VIEW


Sources:


Inventory Ledger

Cost Ledger

Production Ledger



Pipeline:


Material Cost

+

Labor Cost

+

Overhead

+

Variance



==================================================


# 10. Field Engine


Handle:


- validation

- visibility

- readonly

- required

- default value

- calculation resolver



Security field runtime.



==================================================


# 11. Numbering Engine


Generate document number.


Example:


WO/{YEAR}/{DOMAIN}/{SEQ}



==================================================


# 12. Action Engine


Button adalah metadata.


SAVE:


validate

↓

save

↓

event



APPROVE:


validate

↓

workflow

↓

process



==================================================


# 13. Workflow Engine


Control:


STATE

ACTION

PERMISSION

PIPELINE



Example:


DRAFT

↓

APPROVED

↓

CLOSED



==================================================


# 14. Process Engine


Evolution from appProcess.


Menentukan business execution.


Example:


POST_WORK_ORDER


Steps:


Inventory.reserve()


Cost.calculate()


Ledger.create()



==================================================


# 15. Business Engine


Berisi enterprise logic.


Prototype:


Inventory Engine


Costing Engine


Finance Engine


Pricing Engine


IoT Engine



==================================================


# 16. Ledger Engine


Semua impact transaksi masuk ledger.


Document

↓

Business Engine

↓

Ledger

↓

Report



Ledger:

- inventory ledger
- cost ledger
- finance ledger



==================================================


# 17. Closing Engine


Untuk fast reporting.


Ledger

↓

Period Snapshot



Example:


itemInvStock

itemFaAmount



==================================================


# 18. Rule Engine


Dynamic business rule.


Example:


discount

pricing

approval limit

validation



==================================================


# 19. Scheduler Engine


Runtime scheduler.


Menggantikan cron manual.


Example:


PRICE_UPDATE

↓

Process Engine



==================================================


# 20. Report Engine


Report memakai:


Data View

+

Aggregation

+

Calculation



Bukan direct database query.



==================================================


# 21. Integration Engine


Support:


REST API

Webhook

MQTT

PLC

Arduino

IoT Device



Flow:


External

↓

Adapter

↓

Event

↓

Process



==================================================


# 22. Atomic Experience Engine


UI Runtime:


Design Token

↓

Atom

↓

Molecule

↓

Organism

↓

Template

↓

Page



Satu metadata dapat render:

- Web

- Mobile

- POS

- Dashboard



==================================================


# 23. Build Sequence


PHASE 0
Foundation


PHASE 1
Context


PHASE 2
Metadata


PHASE 3
Application


PHASE 4
Runtime Document


PHASE 5
Field + Security


PHASE 6
Action


PHASE 7
Workflow


PHASE 8
Process


PHASE 9
Business Engine


PHASE 10
Ledger


PHASE 11
Data View


PHASE 12
Report


PHASE 13
Closing


PHASE 14
Rule


PHASE 15
Scheduler


PHASE 16
Integration


PHASE 17
Experience



==================================================


# 24. Cursor Development Rules


DO NOT CREATE:


customerController

itemController

workOrderController


DO NOT:


hardcode workflow

hardcode form

hardcode report query



CREATE:


runtimeController

resolver

executor

engine

adapter



Every feature:


Metadata

↓

Runtime

↓

Engine

