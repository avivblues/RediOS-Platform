# Technology Stack Contract
# RediOS Platform
# Product Requirement Document
# Prototype v0.1

# 0. Technology Stack Contract


Technology stack ini wajib digunakan untuk membangun RediOS Runtime Kernel.


Backend:

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


Web Renderer:

- Next.js
- React
- TypeScript


Mobile Renderer:

- React Native
- TypeScript


UI Architecture:

- Atomic Design System


==================================================


# 2. Kernel Execution Flow


Semua request wajib melalui:


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

Process Engine

↓

Business Engine

↓

Storage / Ledger


==================================================


# 1. Product Definition


RediOS adalah ERP Runtime Operating Platform berbasis metadata.

RediOS menyediakan kernel untuk membangun dynamic business application:

- multi tenant
- multi application
- multi company
- multi branch
- multi module
- multi workflow
- multi interface
- multi experience


RediOS bukan kumpulan aplikasi ERP.

RediOS adalah runtime kernel untuk membuat aplikasi bisnis.


Application bukan source code folder.

Application adalah metadata composition.


Application:

- Entity
- Capability
- Workflow
- Process
- Rule
- Form
- Report
- Experience


Satu kernel dapat menghasilkan:

- POS
- ERP
- WMS
- HRIS
- Ticketing
- IoT Portal
- Custom Business Application


==================================================


# 2. Platform Goal


Tujuan RediOS:

Membuat platform dimana perubahan bisnis dapat dilakukan melalui konfigurasi metadata.


Developer membuat:

ENGINE


User/Consultant mengatur:

METADATA



==================================================


# 3. Core Concept


Application

=

Metadata

+

Runtime Engine

+

Business Engine



Metadata menentukan:

WHAT


Runtime menentukan:

HOW


Business Engine menentukan:

BUSINESS IMPACT



==================================================


# 4. Tenant & Domain Concept


domainCode adalah business namespace.


Example:


1.26.1.0

Head Office


1.26.1.1

Branch


domainCode digunakan untuk:


- ownership
- isolation
- security scope
- reporting
- consolidation
- numbering



Tidak menggunakan parent relation.



==================================================


# 5. Prototype Scope


Prototype pertama:


Asset Maintenance System



Flow:


Asset Master

↓

Work Order

↓

Approval Workflow

↓

Inventory Usage

↓

Cost Calculation

↓

Ledger

↓

Dynamic Report



Tujuan bukan membuat maintenance apps.

Tujuan membuktikan kernel bisa membuat aplikasi.



==================================================


# 6. Prototype Acceptance Criteria


Prototype selesai jika:


✓ create entity tanpa coding controller


✓ create field tanpa migration


✓ generate API dari metadata


✓ dynamic form runtime


✓ workflow configurable


✓ action configurable


✓ business process masuk engine


✓ ledger tercipta dari transaksi


✓ report dari Data View Engine


✓ multi application dari kernel sama