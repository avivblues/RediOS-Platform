# RediOS Platform
# Kernel Specification
# Prototype v0.1



# 1. Technology Stack Contract


Backend:


Node.js

TypeScript

NestJS



Database:


MongoDB

Mongoose



Architecture:


Modular Monolith

Metadata Driven Runtime

Engine Based Architecture



Web Renderer:


Next.js

React

TypeScript



Mobile Renderer:


React Native

TypeScript



UI:


Atomic Design System



==================================================


# 2. Repository Structure


Gunakan monorepo.



apps/


api/

NestJS Runtime Kernel



web/

Next.js Experience Renderer



mobile/

React Native Renderer





packages/


shared/

metadata contract



engine-sdk/

engine interface



ui-schema/

experience schema



==================================================


# 3. Runtime Request Pipeline


Semua request wajib melewati:


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



Tidak boleh bypass.



==================================================


# 4. API Contract


Hanya membuat:


runtimeController



Tidak membuat:


assetController

itemController

workOrderController



Endpoint:


POST

/api/runtime/:entityCode



GET

/api/runtime/:entityCode



GET

/api/runtime/:entityCode/:id



PATCH

/api/runtime/:entityCode/:id



POST

/api/runtime/:entityCode/:id/actions/:actionCode



==================================================


# 5. Context Engine


Prototype v0.1 menggunakan header:



x-user-id

x-tenant-id

x-domain-code

x-application-code



Output context:


{
 userId,

 tenantId,

 domainCode,

 applicationCode,

 permissions,

 capabilities
}



Future:


JWT

OAuth

SSO



==================================================


# 6. Metadata Engine


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



Metadata hanya definisi.


Tidak berisi kalkulasi bisnis.



==================================================


# 7. Entity Contract


Entity menggantikan static model.



Entity Type:


MASTER


contoh:

ITEM

ASSET




DOCUMENT


contoh:

WORK_ORDER

SALES_ORDER




LEDGER


contoh:

STOCK_MOVEMENT

COST_LEDGER




SNAPSHOT


contoh:

MONTHLY_STOCK

ITEM_COST




CONFIGURATION



==================================================


# 8. Runtime Document Storage


Semua transaksi masuk:


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

 references:[]
}



==================================================


# 9. Relationship & Query Engine


Tidak menggunakan hardcoded join.



Untuk kebutuhan ERP complex query:


costing

finance

report



gunakan:


Data View Definition



Data View menentukan:


source

relation

aggregation

filter



Report tidak query database langsung.



==================================================


# 10. Workflow Engine


Workflow mengatur:


state

transition

approval

action availability



Example:


DRAFT

↓

APPROVED

↓

CLOSED



==================================================


# 11. Action Engine


Satu form dapat memiliki banyak action.



Example:


SAVE


APPROVE


CANCEL



Setiap action memiliki:


permission

workflow

process target



==================================================


# 12. Process Engine


Process adalah orchestration.



Example:


APPROVE_WORK_ORDER


Steps:


Validate

↓

Reserve Stock

↓

Calculate Cost

↓

Create Ledger



==================================================


# 13. Business Engine


Tempat enterprise logic.



Example engine:


Inventory Engine

Costing Engine

Finance Engine

Pricing Engine



Tidak boleh ditaruh di metadata.



==================================================


# 14. Ledger Engine


Semua impact transaksi masuk ledger.



Immutable.



Digunakan untuk:


audit

report

finance

costing



==================================================


# 15. Report Engine


Report Flow:


Report Request

↓

Data View Engine

↓

Aggregation

↓

JSON Response



Prototype:


JSON API dulu.



==================================================


# 16. Experience Engine


Frontend bukan halaman hardcoded.



Experience Metadata

↓

Component Resolver

↓

Renderer



Renderer:


Web:

Next.js



Mobile:

React Native



==================================================


# 17. Atomic Design Contract


Structure:


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



Page adalah runtime result.



Tidak membuat:


work-order.tsx



Membuat:


runtime-page.tsx



==================================================


# 18. Prototype Execution Rule


v0.1 focus:


Backend Kernel Vertical Slice



Build order:


1 Context Engine


2 Metadata Engine


3 Runtime API


4 Workflow Engine


5 Process Engine


6 Business Engine


7 Ledger Engine


8 Report Engine


9 Experience Renderer



==================================================


# 19. Cursor Development Rules


Cursor wajib menjaga:


NO business controller


NO entity service


NO hardcoded module


NO direct database query from feature



Build:


resolver

executor

engine

adapter



==================================================


# 20. Definition Of Done


Selesai jika:


Tambah entity baru:

tanpa coding.



Tambah field:

tanpa migration.



Tambah workflow:

tanpa deploy.



Satu kernel:

multi application.
