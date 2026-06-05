# RediOS Platform
# Product Requirement Document
# Prototype v0.1


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


RediOS bukan kumpulan aplikasi.

RediOS adalah runtime kernel.


Application dibuat dari komposisi metadata:

Application

    |
    + Entity
    + Capability
    + Workflow
    + Process
    + Rule
    + Form
    + Report
    + Experience


Kernel tetap sama.

Metadata berbeda menghasilkan aplikasi berbeda.


Example:


POS

ERP

Clinic

IoT Portal

Ticketing

WMS



==================================================


# 2. Core Principle


Application = Metadata + Runtime + Business Engine



Metadata:

WHAT EXISTS



Runtime:

HOW TO EXECUTE



Business Engine:

WHAT BUSINESS IMPACT HAPPENS



==================================================


# 3. Platform Layer


## Metadata Layer


Menyimpan definisi:

- application
- entity
- field
- form
- workflow
- process
- report
- security
- experience



## Runtime Layer


Menjalankan:

- context resolving
- metadata resolving
- validation
- permission
- action
- workflow
- process



## Business Engine Layer


Menjalankan enterprise logic:

- inventory
- costing
- finance
- pricing
- integration
- IoT



==================================================


# 4. Domain Concept


domainCode adalah business namespace.


Example:


1.26.1.0


Meaning:

Client 1

Join 2026

Business 1

Head Office



1.26.1.1

Branch 1



Digunakan untuk:

- ownership
- security
- consolidation
- reporting
- numbering


Tidak menggunakan parent relation.



==================================================


# 5. Prototype Scenario


Prototype menggunakan:


Asset Maintenance Runtime


Flow:


Asset Master

↓

Work Order

↓

Approval

↓

Inventory Usage

↓

Cost Calculation

↓

Ledger

↓

Report



==================================================


# 6. Success Criteria


Prototype berhasil jika:


✓ membuat aplikasi baru dari metadata


✓ membuat entity tanpa coding


✓ tambah field tanpa migration


✓ API berjalan tanpa controller baru


✓ workflow berubah tanpa deploy


✓ form berubah tanpa frontend coding


✓ report tanpa hardcoded query


✓ business process execute engine


✓ multi tenant berbeda konfigurasi


✓ multi application dari kernel sama
