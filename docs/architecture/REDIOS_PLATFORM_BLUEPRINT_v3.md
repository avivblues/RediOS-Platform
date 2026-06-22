# 🌱 REDI-OS PLATFORM BLUEPRINT

## Industrial 5.0 Enterprise Operating Platform

Version : 3.0 Consolidated Blueprint  
Owner   : PT Revolusi Digital Solusi

---

# 1. Product Vision

REDI-OS bukan ERP.

REDI-OS adalah:

**Enterprise & Industrial Operating Platform**

untuk membangun, menjalankan, mengintegrasikan dan mengotomasi seluruh proses bisnis perusahaan.


Prinsip utama:

```
Business Change
      |
      v
Metadata Change

NOT

Source Code Change
```


REDI-OS menggabungkan konsep:

- ERP Platform
- ServiceNow
- Freshworks
- n8n
- CMMS
- MES
- QMS
- ITSM
- IoT Platform
- Enterprise Integration Platform
- AI Operating System


---

# 2. Platform Architecture


```
                    AI Agent Layer
                          |
                  REDI Intelligence
                          |
                    REDI Studio
                          |
              Experience Runtime Engine
                          |
                    TunasFlow Engine
                          |
                 Universal Document Engine
                          |
                    REDI Kernel
                          |
        Business Capability Module Layer
                          |
             Integration & Data Platform
                          |
                  Industrial Ecosystem
```


---

# 3. REDI Kernel


REDI Kernel adalah core.

Kernel tidak mengenal:

- Sales Order
- Ticket
- Work Order
- QC Release
- Production Order


Kernel hanya mengenal:


```
Object
Document
State
Action
Event
Rule
Workflow
Identity
Permission
```


Semua aplikasi dibangun di atas metadata.


---

# 4. Kernel Services


## Identity Engine


Support:

- Multi Tenant
- Company
- Site
- Department
- Organization
- User
- Role
- Group
- Position


---

## Metadata Engine


Evolution:


```
Existing:

appProcess

      |

Metadata Engine
```


Fungsi:


- Dynamic Object
- Dynamic Field
- Dynamic Relation
- Dynamic Form
- Dynamic Menu
- Dynamic Action
- Dynamic Report


Structure:


```
Application

   |

Module

   |

Object

   |

Field

   |

Process

   |

Workflow

   |

Experience
```


---

# 5. Dynamic Data Model


Object Designer:


Support:


- Field
- Lookup
- Master Detail
- Formula
- Validation
- Attachment
- Versioning
- Audit Trail


Example:


```
WorkOrder Object


field:
 asset
 engineer
 priority
 sparepart


workflow:
 open
 assigned
 repair
 verify
 close
```


---

# 6. Runtime Engine


Metadata tidak langsung dibaca.


Architecture:


```
Metadata Definition

        |

Runtime Compiler

        |

Runtime Model

        |

Cache Version

        |

Execution Engine
```


Benefit:

- High Performance
- Version Control
- Rollback Metadata
- Tenant Isolation


---

# 7. TunasFlow Engine


TunasFlow adalah:

Universal Process Orchestration Engine.


Inspired by:

- ServiceNow Flow
- Freshworks Automation
- n8n Workflow
- BPM Engine


---

## Flow Component


```
Trigger

   |

Condition

   |

Action

   |

Integration

   |

Human Task

   |

System Task
```


---

## Supported Trigger


- User Action
- Schedule
- API Event
- IoT Event
- Database Event
- Webhook


---

## Example


Machine Alarm


```
TunasIoT

   |

Machine Down Event

   |

TunasFlow

   |

Create Work Order

   |

Check Sparepart

   |

Assign Engineer

   |

Close WO
```


---

# 8. Event Driven Architecture


Central Event Bus.


Events:


```
WO_CREATED

QC_RELEASED

MACHINE_DOWN

STOCK_LOW

PAYMENT_APPROVED

PRODUCTION_FINISHED
```


Consumer:

- Workflow
- Notification
- Integration
- AI Agent
- Reporting


---

# 9. Rule Engine


Business Rule:


Example:


```
IF

machine.temperature > limit


THEN

create maintenance WO


AND

notify engineer
```


Used by:


- Finance Approval
- QC Decision
- SLA
- Maintenance
- Production


---

# 10. Universal Document Engine


Semua transaksi adalah:


```
Business Document
```


Examples:


- Ticket
- Work Order
- Purchase Request
- Sales Order
- QC Release
- Batch Record
- Payment Request


Core Schema:


{
 id,
 type,
 status,
 workflow,
 owner,
 data,
 attachment,
 history
}


---

# 11. REDI Studio


Visual Enterprise Builder.


REDI Studio membuat metadata.


Bukan generate source code.


Modules:


## Application Builder

Create business application.


## Object Designer

Create business object.


## Form Designer

Create UI dynamically.


## Workflow Designer

Design TunasFlow.


## Rule Designer

Business logic.


## Dashboard Designer

Analytics.


## Security Designer

Access control.


---

# 12. Experience Engine


Single Metadata.

Multiple Experience.


```
             Metadata


                 |


 --------------------------------


 Web          Mobile        Kiosk
```


Support:


- Web Application
- Mobile Apps
- Tablet
- Barcode Scanner
- Industrial Panel


Offline:


- Offline Metadata
- Offline Transaction
- Sync Queue
- Conflict Resolver


Use:


- Engineer Mobile WO
- Warehouse Scanner
- QA Tablet
- ISP Field Technician

---

# 13. Solution Template Layer

REDI-OS menggunakan konsep:

```
Capability Module
        +
Industry Template
        +
Workflow Template
```

User tidak membuat aplikasi dari nol.

User memilih template.


Example:

```
Install Template:

Manufacturing Company

        |

Auto Create:

- Master Data
- Production Flow
- QC Flow
- Warehouse Flow
- Maintenance Flow
- Finance Flow
```

---

# 14. Template Marketplace


REDI Template:


## Manufacturing Template

Include:

- ERP
- WMS
- MES
- QMS
- CMMS


---

## ISP Template

Include:

- Customer Operation
- Subscription
- Installation
- Trouble Ticket
- NOC
- Field Service


---

## IT Service Template

Include:

- ITSM
- Asset
- Endpoint
- Monitoring
- Helpdesk


---

## Corporate Template

Include:

- HR
- GA
- Finance
- Approval
- Project


---

# 15. Business Capability Modules


# Master Data Management


Universal Master:


## Product Master

- Item
- Material
- Finish Goods
- Sparepart
- Service


## Organization Master

- Company
- Plant
- Warehouse
- Department
- Cost Center


## Asset Master

- Machine
- Equipment
- Vehicle
- IT Asset
- IoT Device


---

# 16. ERP Capability


## Finance


Support:


- Chart Of Account
- Journal
- Ledger
- Account Payable
- Account Receivable
- Cash Bank
- Budget


---

## Finance Workflow


Example:


```
Budget Request

       |

Approval Matrix

       |

Purchase

       |

Goods Receive

       |

Invoice Matching

       |

Payment

       |

Cost Allocation
```


---

# 17. Costing Engine


Support:


Product Cost:

```
Material Cost
+
Labor Cost
+
Machine Cost
+
Overhead Cost
```


Integration:

- Production
- Maintenance
- IoT Machine Data


---

# 18. Procurement


Flow:


```
Purchase Request

        |

Approval

        |

RFQ

        |

Purchase Order

        |

Receiving

        |

Invoice
```


---

# 19. Supply Chain Management


End to End:


```
Demand

  |

Sales Order

  |

Planning

  |

MRP

  |

Procurement

  |

Warehouse

  |

Production

  |

Delivery
```


---

# 20. Warehouse Management System


Capability:


- Multi Warehouse
- Location
- Bin
- Receiving
- Put Away
- Picking
- Transfer
- Stock Opname


Support:


- Barcode
- QR
- RFID
- Mobile Scanner


---

# 21. Manufacturing Execution System


Integration:


```
TunasIoT Platform
```


MES Flow:


```
Material Release

       |

Production Order

       |

Machine Execution

       |

IoT Data Capture

       |

Operator Confirmation

       |

Supervisor Approval

       |

Before QA Release
```


Support:


- BOM
- Recipe
- Routing
- Work Center
- Batch Record
- eBMR


---

# 22. QMS Platform


Target:


- CPOB
- CPMB
- GMP
- ISO


---

## Quality Flow


```
Material Incoming

       |

QC Inspection

       |

Material Release

       |

Production

       |

IPC Check

       |

Finished Goods Inspection

       |

QA Release
```


---

## QMS Modules


- Inspection
- Sampling
- Deviation
- CAPA
- Change Control
- Calibration
- Complaint
- Document Control


---

# 23. RediDMS Document Management


For regulated industry.


Support:


- SOP
- Work Instruction
- Specification
- Drawing
- Certificate
- Validation Document


Features:


- Revision Control
- Approval Flow
- Electronic Signature
- Distribution Control
- History


---

# 24. Compliance Engine


Support:


- GMP
- CPOB
- CPMB
- ISO


Capability:


- Audit Trail
- Electronic Record
- Electronic Signature
- Traceability
- Approval Evidence


---

# 25. Engineering CMMS


Asset Lifecycle:


```
Asset Register

       |

Maintenance Plan

       |

Preventive Maintenance

       |

Corrective Maintenance

       |

History

       |

Cost Analysis
```


---

## Work Order Flow


```
Request

   |

Approval

   |

Engineer Assignment

   |

Sparepart Request

   |

Execution

   |

Verification

   |

Close
```


---

## Sparepart Integration


```
Work Order

    |

Need Part

    |

Inventory Check

    |

Reservation

    |

Issue Stock

    |

Cost Posting
```


---

# 26. Predictive Maintenance


Integration:


```
TunasIoT

    |

Sensor Data

    |

AI Prediction

    |

Auto Work Order
```


---

# 27. ITSM Platform


Inspired by:


- ServiceNow
- Freshworks
- GLPI
- PC24


Modules:


- Incident
- Request
- Problem
- Change
- Knowledge Base
- SLA


---

# 28. IT Asset & Endpoint


Manage:


- PC
- Laptop
- Server
- Network Device
- Software
- License


Lifecycle:


```
Purchase

 |

Assign User

 |

Maintenance

 |

Retire
```


---

# 29. TunasNOC Platform


Monitoring:


- Server
- Network
- Endpoint
- IoT Device
- PLC
- Machine
- OLT
- ONU


Flow:


```
Alert

 |

TunasFlow

 |

Ticket

 |

Engineer

 |

Resolution
```


---

# 30. HR & GA


HR:


- Employee
- Attendance
- Leave
- Training
- Competency


---

GA:


- Vehicle Booking
- Driver Schedule
- Room Booking
- Facility Request
- Asset Request


---

# 31. Project Management


Support:


- Project
- Task
- Milestone
- Resource
- Budget
- Risk
- Issue


---

# 32. ISP Operation Platform


Integration:


```
ISP-Kita
```


Modules:


- Customer
- Subscription
- Billing Integration
- Installation
- Trouble Ticket
- Field Engineer
- Network Asset


Network:


- OLT
- ONU
- Router
- Radius
- Monitoring
---

# 33. Integration Marketplace

REDI-OS menyediakan connector ecosystem.

Tujuan:

```
Any System
     |
Connector
     |
REDI Integration Hub
     |
Business Process
```


Supported Connector:


## Enterprise System

- SAP
- Odoo
- Oracle ERP
- Existing ERP


## Productivity

- Office 365
- Google Workspace
- Email
- Calendar


## Communication

- WhatsApp Gateway
- Telegram
- Email
- Push Notification


## Industrial Connector

- MQTT
- Modbus
- OPC-UA
- PLC
- SCADA
- Machine Interface


## Developer Connector

- REST API
- Webhook
- GraphQL
- Database Connector


---

# 34. Data Platform


REDI Data Architecture:


```
Operational Database

        |

Event Stream

        |

Data Lake

        |

Analytics Engine

        |

AI Engine
```


Source:


- ERP Transaction
- Production Data
- QC Data
- Machine Data
- IoT Sensor
- Maintenance History
- Financial Data


---

# 35. Analytics Platform


Capability:


## Operational Dashboard

Real time monitoring.


## Management Dashboard

KPI.


## Executive Dashboard

Business Insight.


## Industrial Dashboard

OEE:

```
Availability

Performance

Quality
```


---

# 36. REDI Intelligence (AI Layer)


REDI-OS bukan hanya AI Assistant.

Tetapi:


```
AI Agent Framework
```


---

## AI Agents


### Production Agent

Analyze:

- downtime
- productivity
- bottleneck


Recommend:

- schedule adjustment
- improvement


---


### Maintenance Agent


Input:


- IoT Sensor
- Failure History
- WO History


Output:


- Failure Prediction
- Maintenance Recommendation


---


### Quality Agent


Analyze:


- Batch Data
- QC Result
- Process Parameter


Output:


- Quality Prediction
- Risk Detection


---


### Finance Agent


Analyze:


- Cost
- Budget
- Spending


Output:


- Cost Optimization
- Anomaly Detection


---


### IT/NOC Agent


Analyze:


- Network
- Server
- Endpoint
- Ticket


Output:


- Root Cause Analysis
- Auto Remediation


---


### HR Agent


Analyze:


- Skill
- Performance
- Attendance


Output:


- Workforce Recommendation


---

# 37. Notification Engine


Central Notification.


Channel:


- Web
- Mobile
- Email
- WhatsApp
- Telegram


Trigger:


- Workflow
- SLA
- Approval
- Alert
- IoT Event


---

# 38. Scheduler Engine


Universal Scheduler.


Used For:


- Preventive Maintenance
- Recurring Task
- Backup
- Report
- Reminder
- Automation


Example:


```
Every Monday

     |

Generate PM Work Order

     |

Assign Engineer
```


---

# 39. Deployment Architecture


REDI-OS supports:


## SaaS Cloud


```
Multi Tenant

Container Based

Auto Scaling
```


---


## Enterprise On Premise


For:


- Factory
- Pharma
- Government
- ISP


---


## Hybrid Deployment


```
Factory Edge Server

        |

Cloud Platform

        |

AI Service
```


---

# 40. Technology Architecture


Target:


Frontend:

- Web Application
- Mobile Application


Backend:

- API Service
- Event Service
- Worker Service


Infrastructure:

- Docker
- Kubernetes Ready
- Object Storage
- Message Broker
- Cache Layer


Database:

- Transaction DB
- Time Series DB
- Analytics DB


---

# 41. Multi Tenant Strategy


Hierarchy:


```
Tenant

 |

Company

 |

Site

 |

Department

 |

User
```


Isolation:


- Data
- Metadata
- Configuration
- Workflow


---

# 42. Existing REDI-OS Migration


Tidak rewrite total.


Existing:


```
appProcess
```


menjadi:


```
Metadata Engine
```


---


Existing:


```
appRouting
```


menjadi:


```
TunasFlow Engine
```


---


Existing Module:


```
inventory
finance
production
```


menjadi:


```
Business Capability Module
```


---

# 43. Module Structure


Target Repository:


```
modules/

├── master-data

├── finance

├── procurement

├── inventory-wms

├── production-mes

├── quality-qms

├── engineering-cmms

├── itsm

├── tunasnoc

├── hr-ga

├── project

├── isp-operation

└── integration
```


---

# 44. Development Roadmap


## Phase 0
Architecture Stabilization


Task:

- analyze existing code
- cleanup duplicate logic
- define kernel boundary


---

## Phase 1
REDI Kernel


Build:

- Identity Engine
- Metadata Engine
- Security Engine
- Runtime Engine


---

## Phase 2
TunasFlow Platform


Build:

- Workflow Runtime
- Rule Engine
- Event Engine
- Automation Engine


---

## Phase 3
Studio Builder


Build:

- Object Designer
- Form Designer
- Workflow Designer
- Template Designer


---

## Phase 4
Core Business Module


Priority:


1. Master Data

2. Asset

3. Inventory WMS

4. Engineering CMMS

5. ITSM

6. Production MES

7. QMS


---

## Phase 5
ERP Expansion


Add:

- Finance
- Procurement
- Costing
- Supply Chain


---

## Phase 6
Industrial Integration


Add:


- TunasIoT
- ISP-Kita
- SAP
- Odoo
- Office365
- PLC
- SCADA


---

## Phase 7
Industrial AI


Build:


- AI Agent
- Prediction Engine
- Optimization Engine


---

# 45. Final Product Position


REDI-OS adalah:


```
Industrial 5.0 Business Operating System
```


Bukan:


❌ ERP biasa

❌ Ticketing System

❌ Workflow App saja

❌ Low Code sederhana


Tetapi:


```
ERP
+
MES
+
QMS
+
CMMS
+
ITSM
+
Integration
+
Automation
+
IoT
+
AI
```


Satu platform.

Satu data.

Satu workflow engine.


---

## 12.1 REDI EXPERIENCE & WORKSPACE PHILOSOPHY
# REDI EXPERIENCE & WORKSPACE PHILOSOPHY

## Purpose

REDI Experience Layer bertanggung jawab menyediakan pengalaman penggunaan REDI-OS berdasarkan persona.

REDI-OS tidak menampilkan menu berdasarkan aplikasi, tetapi berdasarkan:

- User Responsibility
- Capability
- Permission
- Workflow Context
- Daily Activity

---

# Experience Principle


Traditional ERP:

User
 |
Menu
 |
Transaction


REDI-OS:

User
 |
Workspace
 |
Action
 |
Result


System brings work to user.

User does not search work.

---

# REDI Persona Model


## 1. System Administrator


Purpose:

Mengelola keseluruhan platform.


Access:

ALL PLATFORM CAPABILITY


Workspace:

System Control Center


Capabilities:


## Platform Management

- Tenant Management

- Organization Management

- User Management

- Role Management

- Permission Management


---

## Module Management

- Install Module

- Enable Capability

- Configure Application Template


---

## System Builder Access

Allowed:


✔ Metadata Builder

✔ Form Builder

✔ Workflow Builder

✔ Report Builder

✔ Dashboard Builder

✔ Integration Builder

✔ Notification Builder

✔ Action Builder


---

UI Experience:


Dashboard:

- System Health

- Tenant Usage

- Module Status

- Integration Status

- Security Alert


---

# 2. Programmer / Platform Developer


Purpose:

Membuat dan memperluas capability REDI-OS.


Workspace:

REDI Studio


Access:


## Metadata Designer


Create:


- Object Definition

- Entity Model

- Field Model

- Relationship


---


## Form Builder


Create:


- Dynamic Form

- Validation

- UI Layout

- Component Binding


---


## Workflow Designer


Powered by:

TunasFlow


Create:


- Process Flow

- Approval

- Automation

- Event Trigger


---


## Query Builder


Purpose:


Build:


- Dynamic Query

- Dataset

- API Mapping

- Data Transformation


---


## Action Builder


Create:


- Button Action

- Business Action

- Automation Action

- Integration Action


---


## Report Builder


Create:


- Report Template

- Parameter

- Dataset Binding


---


Restriction:


Programmer membuat platform capability.

Tidak menjalankan business approval.

---

# 3. Manager / Process Owner


Purpose:


Mengatur proses bisnis tanpa coding.


Workspace:


Management Workspace


Access:


## Flow Editor


Allowed:


- Adjust Approval

- Change PIC

- SLA Rule

- Escalation


---


## Form Editor


Allowed:


- Hide Field

- Rename Label

- Rearrange Layout

- Add Business Field


(with permission)


---


## Report Builder


Allowed:


- Create Report

- Modify Report

- Schedule Report


---


## Dashboard Builder


Create:


- KPI Dashboard

- Monitoring

- Analytics


---


## Action Management


Configure:


- Approval Action

- Review Action

- Delegation


---

Example:


QC Manager:


Can edit:


Batch Release Flow


Cannot edit:


Database Schema


---

# 4. Staff / Business User


Purpose:


Daily Operation Execution.


Workspace:


My Workspace


Default View:


- My Task

- My Approval

- My Notification

- My Dashboard


---


Capability:


## Dashboard Builder


Allowed:


Personal Dashboard


Example:


- My KPI

- My Ticket

- My Production


---


## Report Builder


Allowed:


Self Service Reporting


Example:


- Filter

- Export

- Schedule


---


## Notification Builder


Allowed:


Personal Alert Rule


Example:


Notify me when:


- WO Assigned

- QC Waiting

- Stock Low


---


Not Allowed:


- Change Metadata

- Change Workflow Core

- Change Security


---

# REDI Studio Permission Matrix


| Capability | Admin | Programmer | Manager | Staff |
|-|-|-|-|-|
| Metadata Builder | ✓ | ✓ | - | - |
| Form Designer | ✓ | ✓ | Limited | - |
| Workflow Designer | ✓ | ✓ | Limited | - |
| Query Builder | ✓ | ✓ | - | - |
| Action Builder | ✓ | ✓ | Limited | - |
| Report Builder | ✓ | ✓ | ✓ | ✓ |
| Dashboard Builder | ✓ | ✓ | ✓ | ✓ |
| Notification Builder | ✓ | ✓ | ✓ | ✓ |
| Module Install | ✓ | - | - | - |


---

# Workspace Runtime Flow


Login

 ↓

Identity Engine

 ↓

Persona Resolver

 ↓

Capability Resolver

 ↓

Workspace Generator

 ↓

Runtime Renderer


