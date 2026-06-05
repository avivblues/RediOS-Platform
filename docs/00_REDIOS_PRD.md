# RediOS Platform
# Product Requirement Document
# Prototype v0.1


==================================================


# 1. Product Vision


RediOS adalah Enterprise Runtime Operating Platform
untuk membangun aplikasi bisnis berbasis metadata.


RediOS bukan satu aplikasi ERP.


RediOS adalah kernel yang menjalankan banyak aplikasi bisnis
dengan runtime engine yang sama.



Developer membuat:


ENGINE



Consultant / Implementor / User melakukan:


CONFIGURATION

+

METADATA DEFINITION



Perubahan bisnis harus dilakukan melalui metadata
selama tidak mengubah core business engine.



==================================================


# 2. Platform Objective


RediOS dibuat untuk mengubah konsep:


Application Development


menjadi:


Application Configuration



Aplikasi tidak dibangun dengan membuat ulang:

- database table
- controller
- service
- form
- report



Aplikasi dibangun melalui:


Metadata

+

Runtime Engine

+

Business Engine



==================================================


# 3. Platform Capability


Satu RediOS Kernel mendukung:



## Multi Tenant


Satu platform melayani banyak customer.



## Multi Application


Satu kernel dapat menjalankan banyak aplikasi.



Example:


ERP

POS

WMS

HRIS

Ticketing

Maintenance

IoT Portal

Custom Application



Application bukan source code.


Application adalah metadata composition.



## Multi Company / Branch


Menggunakan domainCode sebagai business namespace.



## Multi Module


Module adalah capability metadata.



Example:


Inventory

Finance

Maintenance

Sales

Purchasing



Module dapat:

- enable
- disable
- package based
- subscription based



## Multi Workflow


Business flow dapat berubah tanpa coding.



## Multi Experience


Satu metadata dapat berjalan di:


Web

Mobile

Device

Future Interface



==================================================


# 4. Core Philosophy


RediOS dipisah menjadi:



METADATA


menjawab:


WHAT EXISTS



contoh:


- entity
- field
- form
- workflow
- report



--------------------------------------------------



RUNTIME ENGINE


menjawab:


HOW TO EXECUTE



contoh:


- resolve metadata
- execute action
- execute process



--------------------------------------------------



BUSINESS ENGINE


menjawab:


WHAT BUSINESS IMPACT HAPPENS



contoh:


- stock movement
- costing
- finance impact
- pricing calculation



==================================================


# 5. Metadata Concept


Metadata bukan business logic.


Metadata hanya definisi.



Example:



WORK_ORDER


memiliki:


Action:

APPROVE



Workflow:

DRAFT -> APPROVED



Process:

CREATE_COST



Business Engine yang menentukan impact.



==================================================


# 6. Domain Code Concept


domainCode adalah identitas area bisnis.



domainCode bukan relational hierarchy.



Tidak menggunakan:


parentId



Example:



1.26.1.0


artinya:


Client 1

Join Year 2026

Head Office



--------------------------------------------------



1.26.1.1


artinya:


Client 1

Join Year 2026

Branch 1



--------------------------------------------------



Digunakan untuk:


- ownership
- access scope
- numbering
- consolidation
- reporting



==================================================


# 7. Data Philosophy


Data business tidak bergantung kepada module.



Entity:

hanya definisi.



Document:

menyimpan transaksi.



Ledger:

menyimpan impact.



Snapshot:

menyimpan hasil closing.



Example:



Transaction

↓

Ledger

↓

Monthly Snapshot

↓

Fast Reporting



Digunakan untuk:


inventory closing

asset amount

finance balance

cost calculation



==================================================


# 8. Dynamic Experience Concept


UI bukan dibuat manual per aplikasi.



Tidak membuat:


Asset Page

Work Order Page



Membuat:


Experience Renderer



Metadata menentukan:


- field
- layout
- component
- validation
- visibility



Renderer menghasilkan:


Web

Mobile



==================================================


# 9. IoT & Integration Vision


RediOS dapat menjadi portal integrasi.



External:


PLC

Arduino

Sensor

Machine

External API



Integration masuk melalui:


Adapter

↓

Event

↓

Process

↓

Business Engine



==================================================


# 10. Prototype v0.1 Goal


Prototype pertama:


Asset Maintenance Runtime



Tujuan:


Membuktikan RediOS Kernel.



Bukan membuat aplikasi maintenance.



==================================================


# 11. Prototype Scenario


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

Report



==================================================


# 12. Prototype Boundary


Implement:


- metadata runtime

- runtime API

- workflow

- process

- business engine

- ledger

- report



Tidak fokus:


- full ERP

- full accounting

- advanced UI builder



==================================================


# 13. Success Criteria


Prototype berhasil jika:



✓ membuat aplikasi baru tanpa source code baru



✓ membuat entity baru tanpa controller



✓ membuat field baru tanpa database migration



✓ workflow berubah dari metadata



✓ action berubah dari metadata



✓ report membaca Data View Engine



✓ business impact masuk ledger



✓ UI dapat dirender dari metadata



✓ satu kernel menjalankan banyak aplikasi



==================================================


# 14. Long Term Vision


RediOS menjadi:


Enterprise Runtime Operating Platform


yang menggabungkan:



Metadata Engine

+

Business Engine

+

Experience Engine

+

Integration Engine

+

AI Engine



untuk membangun aplikasi enterprise masa depan.
