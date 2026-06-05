# RediOS Platform
# Kernel Specification
# Prototype v0.1


==================================================


# 1. Purpose


Dokumen ini adalah technical contract untuk membangun
RediOS Runtime Kernel.


Dokumen ini menjadi acuan:


- Developer
- AI Coding Agent
- Future Contributor


Tujuan utama:


Membangun engine.

Bukan membangun aplikasi.



==================================================


# 2. Technology Stack Contract


Backend Runtime:


- Node.js
- TypeScript
- NestJS



Database:


- MongoDB
- Mongoose



Architecture:


- Modular Monolith
- Metadata Driven Runtime
- Engine Based Architecture



Frontend Renderer:


Web:

- Next.js
- React
- TypeScript



Mobile:

- React Native
- TypeScript



UI System:


- Atomic Design System



==================================================


# 3. Repository Structure


Gunakan monorepo.



Structure:



apps/


 api/


    RediOS Runtime Kernel



 web/


    Experience Renderer Web



 mobile/


    Experience Renderer Mobile






packages/


 shared/


    Common contract

    Metadata schema

    Runtime interface



 engine-sdk/


    Engine abstraction

    Adapter interface



 ui-schema/


    Experience definition

    Atomic component schema




==================================================


# 4. Development Principle


RediOS tidak menggunakan traditional MVC.



DILARANG membuat:



assetController


itemController


customerController


workOrderController



DILARANG membuat:



assetService


inventoryService khusus entity


workOrderModel




==================================================



Yang dibuat:



Runtime Controller


Metadata Resolver


Runtime Executor


Engine


Adapter


Provider




==================================================


# 5. Canonical Runtime Pipeline


Semua request wajib melewati pipeline ini.



Client


↓


Runtime API


↓


Context Engine


↓


Application Engine


↓


Metadata Engine


↓


Security Engine


↓


Action Engine


↓


Workflow Engine


↓


Process Engine


↓


Business Engine


↓


Storage Engine


↓


Ledger Engine


↓


Event Engine



Tidak boleh bypass pipeline.



==================================================


# 6. Context Engine


Responsibility:


Membuat execution context.



Input v0.1:


Request Header



Example:



x-user-id


x-tenant-id


x-domain-code


x-application-code




Output:



RuntimeContext {


 userId


 tenantId


 domainCode


 applicationCode


 permissions


 capabilities


}




Future:


JWT

OAuth

SSO



==================================================


# 7. Application Engine


Application bukan folder source code.



Application adalah metadata composition.



Application terdiri dari:



Entity


Action


Workflow


Process


Report


Experience


Permission




Example:



APPLICATION:


MAINTENANCE



Contains:



ASSET


WORK_ORDER


APPROVAL_FLOW


MAINTENANCE_REPORT




==================================================


# 8. Metadata Engine


Metadata Engine bertugas:


- load definition

- validate definition

- resolve behavior

- provide runtime contract



Metadata tidak boleh menjalankan business logic.




Metadata Types:



APPLICATION


ENTITY


FIELD


ACTION


WORKFLOW


PROCESS


FORM


REPORT


EXPERIENCE


RULE




==================================================


# 9. Metadata vs Database Rule


PENTING:


Metadata bukan database schema.



Tidak membuat:



asset collection


item collection


work_order collection




Yang benar:



runtime_documents




Dengan:



entityCode = ASSET


entityCode = ITEM


entityCode = WORK_ORDER




Collection dibuat berdasarkan responsibility,
bukan business object.



==================================================


# 10. Entity Contract


Entity menggantikan static model.



Entity Type:



MASTER



contoh:


ITEM


CUSTOMER


ASSET





DOCUMENT



contoh:


WORK_ORDER


SALES_ORDER


PURCHASE_ORDER





LEDGER



contoh:


STOCK_LEDGER


COST_LEDGER


FINANCE_LEDGER





SNAPSHOT



contoh:


MONTHLY_STOCK


MONTHLY_COST


BALANCE




CONFIGURATION




==================================================


# 11. Field Contract


Field berasal dari metadata.



Field menentukan:



name


datatype


validation


default value


visibility


behavior





Example:



{
 entity:"ASSET",

 field:"serialNo",

 type:"string",

 required:true
}




Tidak perlu migration database.



==================================================


# 12. Runtime Document Storage


Semua operational document masuk:



runtime_documents




Format:



{
 tenantId,

 domainCode,

 applicationCode,

 entityCode,

 documentNo,

 status,

 header:{},

 lines:[],

 attributes:{},

 references:[],

 createdAt,

 updatedAt
}




==================================================


# 13. Domain Data Isolation


Setiap query wajib membawa:



tenantId


domainCode



domainCode digunakan untuk:



ownership


security scope


reporting scope


consolidation




Tidak menggunakan parent relationship.



==================================================
# Engine Contract Summary


All engines are independent modules.


Each engine exposes:


resolve()

validate()

execute()



==================================================


# Security Engine Contract


Responsibility:


- validate user context
- validate permission
- validate action access



v0.1:


Application Permission

Entity Permission

Action Permission



Future:


Field Permission

Data Masking



==================================================


# Workflow Engine Contract


Responsibility:


Control document lifecycle.



Example:


DRAFT

APPROVE

CLOSE



Workflow does not execute business calculation.



==================================================


# Process Engine Contract


Responsibility:


Execute ordered steps.



Example:


APPROVE_WORK_ORDER:


1 Validate

2 Reserve Inventory

3 Calculate Cost

4 Create Ledger



==================================================


# Business Engine Contract


Responsibility:


Enterprise calculation.



Example:


Inventory Engine

Cost Engine

Finance Engine

Pricing Engine



Business Engine never knows UI.



==================================================


# Ledger Engine Contract


Responsibility:


Store transaction impact.



Rules:


Immutable

Append only



Used by:


Finance

Inventory

Costing

Audit



==================================================


# Data View Engine Contract


Report never query runtime document directly.



Data View handles:


join

aggregation

calculation

projection



Used for:


Costing Report

Finance Report

Dashboard



==================================================


# Event Engine Contract


Responsibility:


Publish after transaction event.



Used for:


Notification

Webhook

IoT

Integration



==================================================


# Experience Engine Contract


Metadata

↓

Renderer



Support:


Next.js

React Native



Atomic Structure:


Design Token

Atom

Molecule

Organism

Template

Page