# RediOS Platform
# Product Requirement Document
# Prototype v0.1


# 1. Product Vision


RediOS adalah ERP Runtime Operating Platform berbasis metadata.


RediOS bukan aplikasi ERP.


RediOS adalah kernel untuk membuat aplikasi bisnis secara dinamis.


Developer membangun:

ENGINE


Consultant / User melakukan:

CONFIGURATION & METADATA



==================================================


# 2. Platform Capability


Satu RediOS Kernel harus mampu menjalankan:


- Multi Tenant

- Multi Application

- Multi Company

- Multi Branch

- Multi Module

- Multi Workflow

- Multi Interface

- Multi Experience



Contoh aplikasi yang bisa dibuat:


- ERP

- POS

- Warehouse Management System

- HRIS

- Ticketing System

- IoT Portal

- Custom Enterprise Application



==================================================


# 3. Application Concept


Application bukan folder source code.


Application adalah metadata composition.



Application terdiri dari:


Entity

+

Field

+

Form

+

Workflow

+

Process

+

Rule

+

Report

+

Experience



Aplikasi baru dibuat dengan konfigurasi metadata.

Bukan membuat ulang source code.



==================================================


# 4. Metadata Driven Concept


Metadata menentukan:


WHAT



Runtime Engine menentukan:


HOW TO EXECUTE



Business Engine menentukan:


BUSINESS IMPACT



Contoh:


Metadata:


WORK_ORDER mempunyai action APPROVE



Runtime:


Menjalankan action



Business Engine:


Menghasilkan:

- inventory movement

- cost impact

- ledger



==================================================


# 5. Tenant & Domain Concept


Tenant:

Pemilik environment.



Domain:

Business namespace di dalam tenant.



domainCode bukan parent child relation.



Format example:


1.26.1.0

Head Office



1.26.1.1

Branch 1



1.26.1.2

Branch 2



domainCode digunakan untuk:


- data ownership

- access scope

- reporting

- consolidation

- numbering



==================================================


# 6. Prototype Goal v0.1


Prototype pertama:


Asset Maintenance Runtime



Tujuan:


Bukan membuat aplikasi maintenance.


Tujuan membuktikan RediOS Kernel.



==================================================


# 7. Prototype Scenario


Flow:


Asset Master

↓

Work Order

↓

Approval

↓

Sparepart Usage

↓

Inventory Impact

↓

Cost Calculation

↓

Ledger

↓

Dynamic Report



==================================================


# 8. Prototype Success Criteria


Prototype berhasil jika:


✓ Entity dibuat tanpa membuat model baru


✓ Field dibuat tanpa migration database


✓ API otomatis membaca metadata


✓ Tidak ada controller per module


✓ Workflow configurable


✓ Action configurable


✓ Process configurable


✓ Business impact masuk engine


✓ Ledger otomatis tercipta


✓ Report menggunakan Data View Engine


✓ UI bisa dibangun dari Experience Metadata


✓ Kernel sama bisa membuat aplikasi lain



==================================================


# 9. Long Term Vision


RediOS menjadi:


Enterprise Runtime Operating Platform


untuk membangun:


Business Application

+

Workflow

+

Data

+

Automation

+

AI Assistant



berbasis metadata.
