# 🌱 REDI-OS Platform

## Industrial 5.0 Enterprise Operating Platform

Version: 3.0  
Owner: PT Revolusi Digital Solusi

---

# 1. Introduction

REDI-OS adalah **Enterprise & Industrial Operating Platform**.

REDI-OS bukan ERP tradisional.

REDI-OS adalah platform untuk membangun, menjalankan, mengintegrasikan, dan mengotomasi seluruh proses bisnis perusahaan berbasis:

```
Metadata
+
Workflow
+
Integration
+
IoT
+
AI
```

Satu platform untuk banyak kebutuhan bisnis.

---

# 2. Vision

Tujuan utama REDI-OS:

```
Business Change

      |

Configuration Change

      |

Runtime Execution
```


bukan:


```
Business Change

      |

Source Code Change

      |

Application Redeploy
```


REDI-OS memungkinkan perusahaan berkembang tanpa selalu melakukan rewrite aplikasi.

---

# 3. REDI-OS Positioning


REDI-OS menggabungkan konsep:


## Enterprise Platform

- ERP
- Supply Chain
- Finance
- Procurement


## Manufacturing Platform

- MES
- WMS
- QMS
- CMMS


## Service Platform

- ITSM
- Helpdesk
- Work Order
- Field Service


## Automation Platform

- Workflow Engine
- Business Rule
- Event Automation


## Industrial Platform

- IoT Integration
- Machine Data
- Predictive Maintenance


## Intelligence Platform

- Analytics
- AI Agent
- Decision Support


---

# 4. Platform Architecture


```
                 AI Agent Layer

                       |

              REDI Intelligence

                       |

                 REDI Studio

                       |

             Experience Engine

                       |

              TunasFlow Engine

                       |

        Universal Document Engine

                       |

                 REDI Kernel

                       |

       Business Capability Modules

                       |

          REDI Integration Hub

                       |

              External Ecosystem
```


---

# 5. Core Platform Components


## REDI Kernel


Foundation runtime.


Responsibilities:


### Identity Engine

- Multi Tenant
- Company
- Organization
- User
- Role


### Security Engine

- RBAC
- ABAC
- Field Permission
- Audit Trail


### Metadata Engine

Controls:

- Application
- Object
- Field
- Form
- Menu
- Action
- Report


### Runtime Engine

Compile metadata into executable application behavior.


### Event Engine

Enable asynchronous communication.


### Rule Engine

Execute dynamic business decision.


---

# 6. Universal Document Engine


REDI-OS tidak membuat object transaksi terpisah.

Semua transaksi adalah:


```
Business Document
```


Example:


- Ticket
- Work Order
- Purchase Request
- Production Order
- QC Release
- Payment Approval


Common capability:


- Workflow
- Status
- Approval
- Attachment
- Comment
- History
- Audit Trail


---

# 7. TunasFlow Engine


Universal Workflow & Automation Platform.


Inspired by:


- ServiceNow
- Freshworks
- n8n
- BPM


Capability:


- Human Task
- System Task
- Approval
- SLA
- Escalation
- Automation
- Integration Flow


Example:


```
Machine Alarm

      |

TunasIoT

      |

TunasFlow

      |

Create Work Order

      |

Assign Engineer

      |

Resolve
```


---

# 8. REDI Studio


Enterprise Low-Code Builder.


REDI Studio membuat:


- Application Template
- Data Object
- Dynamic Form
- Workflow
- Rule
- Dashboard


Output:

```
Metadata Definition

        |

Runtime Engine

        |

Application Experience
```


---

# 9. Experience Engine


Satu metadata berjalan di banyak interface:


```
Metadata


   +---- Web

   +---- Mobile

   +---- Tablet

   +---- Kiosk

   +---- Industrial Device
```


Support:


- Offline Mode
- Sync Engine
- Mobile Workforce


---

# 10. Solution Template Concept


REDI-OS bukan membuat aplikasi satu per satu.


REDI-OS menggunakan:


```
Capability Module

        +

Workflow Template

        +

Industry Template
```


User memilih:


Example:


```
Install Manufacturing Template


Automatically Enable:


ERP

MES

QMS

CMMS

WMS
```


---

# 11. Business Capability Modules


Repository target:


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

# 12. Industrial Ecosystem Integration


## Internal Product


### TunasIoT


Used for:


- Machine Monitoring
- Production Data
- Predictive Maintenance
- Quality Evidence


---


### ISP-Kita


Used for:


- ISP Operation
- Customer Service
- Field Work Order
- Network Monitoring


---


### TunasNOC


Used for:


- Server Monitoring
- Network Monitoring
- Endpoint Monitoring
- Industrial Monitoring


---

# 13. External Integration


Through REDI Integration Hub:


Enterprise:


- SAP
- Odoo
- Office365


Industrial:


- MQTT
- OPC-UA
- PLC
- SCADA


Developer:


- REST API
- Webhook
- Database Connector


---

# 14. Data Platform


Architecture:


```
Operational Data

       |

Event Stream

       |

Analytics

       |

AI Engine
```


Used for:


- KPI
- Prediction
- Optimization


---

# 15. REDI Intelligence


AI Agent Framework.


Agents:


## Production Agent


Optimize manufacturing process.


## Maintenance Agent


Predict machine failure.


## Quality Agent


Analyze quality risk.


## Finance Agent


Analyze cost and anomaly.


## IT/NOC Agent


Analyze infrastructure issue.


---

# 16. Deployment Model


Supported:


## SaaS Cloud

Multi Tenant Platform.


## Enterprise On Premise

Factory / Corporate Deployment.


## Hybrid Industrial

Factory Edge + Cloud AI.


---

# 17. Existing Platform Evolution


Existing REDI-OS component evolution:


```
appProcess

      |

Metadata Engine
```


```
appRouting

      |

TunasFlow Engine
```


Existing code is evolved.

Not rewritten.


---

# 18. Development Roadmap


## Phase 0

Architecture Stabilization


## Phase 1

REDI Kernel Foundation


## Phase 2

TunasFlow Engine


## Phase 3

REDI Studio


## Phase 4

Industrial Core Modules


Priority:


1. Master Data

2. Asset

3. Inventory WMS

4. Engineering CMMS

5. ITSM

6. Production MES

7. QMS


## Phase 5

ERP Expansion


## Phase 6

Integration Ecosystem


## Phase 7

AI Industrial Layer


---

# 19. Developer & AI Agent Instruction


Before development:


Read:


```
.cursorrules

docs/README.md

docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md
```


Rules:


DO:


✓ Extend platform capability

✓ Use metadata

✓ Use workflow

✓ Use event


DON'T:


✗ Hardcode business process

✗ Duplicate kernel service

✗ Create isolated application


---

# Final Vision


REDI-OS:


```
ONE PLATFORM

ONE DATA MODEL

ONE WORKFLOW ENGINE

ONE INTEGRATION LAYER


Industrial 5.0 Ready
```


---

# End
