# REDIOS_PLATFORM_BLUEPRINT_v2.md

# 🌱 REDI-OS Platform
## Industrial 5.0 Business Operating System

Version: 2.0 Draft
Owner: PT Revolusi Digital Solusi

---

## 1. Vision

REDI-OS bukan ERP konvensional.

REDI-OS adalah Business Operating System yang menyatukan:

- People
- Process
- Machine
- Material
- Asset
- Quality
- Finance
- AI

Pendekatan utama:

Metadata + Workflow + Template + Integration Engine

Tujuan: membuat business application melalui konfigurasi, bukan rebuild source code.

---

# 2. Architecture Principle

REDI-OS = Kernel + Engine + Module Template + Connector

Business module tidak dibuat sebagai aplikasi hardcode.

Module hanya membawa:

- schema extension
- workflow template
- form template
- rule
- report
- integration mapping

---

# 3. Core Architecture

```
REDI-OS PLATFORM

AI Copilot Layer

RediFlow Engine

REDI Kernel

Business Modules

Connector Layer
```

---

# 4. REDI Kernel

Kernel memahami:

- Object
- State
- Action
- Event
- Permission
- Workflow

Kernel tidak mengenal langsung:

- Purchase Order
- QC Release
- Work Order
- Ticket

Semua domain berjalan sebagai metadata runtime.

---

# 5. Kernel Components

## Identity Engine

- Tenant
- Company
- Organization
- Department
- User
- Role
- Permission

## Metadata Engine

Evolution dari existing appProcess:

- appModule
- appProcess
- appForm
- appField
- appMenu
- appAction
- appReport

## RediFlow Engine

Evolution dari existing appRouting.

Capability:

- State Machine
- Approval Workflow
- Conditional Routing
- SLA
- Escalation
- Automation

## Event Engine

Sources:

- User Action
- Scheduler
- API
- IoT Event
- External System

## Universal Document Engine

Semua transaksi menjadi BusinessDocument:

- Purchase Request
- Work Order
- Ticket
- Batch Release
- Payment Request

---

# 6. Business Modules

## Master Data

- Item
- Product
- Material
- Asset
- Location
- Employee
- Customer
- Vendor

---

## Finance & Costing

- COA
- Journal
- Ledger
- Payment Approval
- Settlement
- Product Costing
- Machine Cost
- Labor Cost

---

## Procurement

- Purchase Request
- Purchase Order
- RFQ
- Supplier Management

---

## Warehouse / WMS

- Receiving
- Put Away
- Picking
- Transfer
- Stock Opname
- Barcode
- RFID

---

## Production / MES

- Production Order
- BOM
- Routing
- Recipe
- Batch Record
- Operator Task
- Machine Data
- Production Manager Release

Integration:

- TunasIoT

Flow:

Material Release → Production → IoT Evidence → Production Release → QA Review

---

## Quality Management System (QMS)

CPOB / CPMB Ready

- Incoming QC
- In Process Control
- Finished Good Release
- CAPA
- Deviation
- Change Control
- Audit
- Document Control
- Calibration

---

## Engineering CMMS / Work Order

- Asset Management
- Preventive Maintenance
- Corrective Maintenance
- Predictive Maintenance
- Work Order
- Sparepart Request
- Calibration

Integration:

TunasIoT Alarm → Work Order → Engineer → Sparepart

---

## ITSM / NOC

Inspired by GLPI, ServiceNow, PC24.

- Incident
- Request
- Problem
- Change Management
- IT Asset
- Endpoint Management
- Remote Support
- Knowledge Base

---

## HR

- Employee
- Attendance
- Leave
- Recruitment
- Training
- Competency

---

## GA

- Vehicle Booking
- Driver Schedule
- Facility Request
- Room Booking
- Visitor Management

---

## Project Management

- Project
- Milestone
- Task
- Resource
- Risk
- Budget

---

## ISP Operation

Integration ISP-Kita.

- Customer
- Subscription
- Installation
- Trouble Ticket
- Field Service
- OLT
- ONU
- Radius

---

# 7. Connector Layer

- TunasIoT
- ISP-Kita
- TunasNOC
- SAP
- Odoo
- Office365
- MQTT
- PLC
- SCADA
- REST API

---

# 8. Development Phase

## Phase 0 - Architecture Recovery

- Audit existing repo
- Mapping current code
- Decide keep/refactor/remove

## Phase 1 - Kernel Foundation

- Identity
- Metadata
- Dynamic Form
- Permission

## Phase 2 - RediFlow

- Workflow Engine
- State Machine
- Approval
- Event
- Rule

## Phase 3 - Universal Document Runtime

Create generic business object engine.

## Phase 4 - Industrial Core

Priority:

1. Master Data
2. Asset
3. Inventory/WMS
4. Maintenance CMMS
5. Production MES
6. Quality QMS

## Phase 5 - ERP Layer

- Finance
- Procurement
- Costing

## Phase 6 - Integration

- TunasIoT
- ISP-Kita
- Office365
- SAP/Odoo

## Phase 7 - Industrial AI

- Process Mining
- Predictive Maintenance
- Quality Prediction
- Cost Optimization

---

# Final Direction

REDI-OS menjadi Industrial Business Operating System.

Satu platform, banyak business capability melalui template.
