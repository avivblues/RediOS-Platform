# REDI-OS Documentation Center

## Industrial 5.0 Platform Engineering Guide

Version: 3.0  
Owner: PT Revolusi Digital Solusi

---

# 1. Purpose

Folder ini adalah pusat dokumentasi teknis REDI-OS.

Semua keputusan development harus mengikuti:

```
Architecture First

Platform First

Metadata First

Workflow First
```

Dokumentasi ini menjadi panduan untuk:

- Developer
- Solution Architect
- System Analyst
- AI Coding Agent

---

# 2. Documentation Hierarchy


Urutan membaca:


```
Repository Opened

        |

README.md

        |

.cursorrules

        |

docs/README.md

        |

architecture/
REDIOS_PLATFORM_BLUEPRINT_v3.md

        |

Source Code Analysis
```


Blueprint adalah sumber kebenaran utama.


---

# 3. Main Architecture Reference


Primary Document:


```
docs/

└── architecture/

    └── REDIOS_PLATFORM_BLUEPRINT_v3.md
```


Contains:


- Platform Vision
- Kernel Architecture
- Metadata Architecture
- Workflow Architecture
- Module Strategy
- Integration Strategy
- Industrial Roadmap


---

# 4. Development Philosophy


REDI-OS tidak membangun aplikasi.

REDI-OS membangun:

```
Capability

+

Metadata

+

Workflow

+

Template
```


Example:


Wrong:

```
Create Purchase Approval Module
```


Correct:

```
Create:

Approval Capability

       +

Workflow Template

       +

Purchase Configuration
```


---

# 5. Architecture Layers


REDI-OS Layer:


```
Application Experience


        |


REDI Studio


        |


TunasFlow Engine


        |


Universal Document Engine


        |


REDI Kernel


        |


Capability Modules


        |


Integration Hub
```


---

# 6. REDI Kernel Boundary


Kernel adalah platform core.


Kernel owns:


## Identity

- Tenant
- Company
- User
- Role
- Permission


## Metadata

- Object Definition
- Field Definition
- Form Definition
- Menu Definition


## Runtime

- Metadata Compiler
- Execution Engine
- Cache


## Workflow

- State
- Transition
- Approval


## Event

- Publish
- Subscribe


## Rule

- Condition
- Decision


---

# 7. Module Development Contract


Module TIDAK boleh membuat engine sendiri.


Module hanya menyediakan:


```
module/

├── schema-extension

├── workflow-template

├── form-template

├── rule-template

├── integration-map

└── seed-data
```


Module bergantung kepada Kernel.


---

# 8. Business Capability Modules


Target:


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

# 9. Universal Document Rule


Semua transaksi extend:


```
BusinessDocument
```


Examples:


- Ticket
- Work Order
- Purchase Request
- Sales Order
- QC Release
- Production Batch


Base:


```
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
```


Tidak membuat lifecycle sendiri.


---

# 10. Workflow Rule


Semua proses menggunakan:


```
TunasFlow Engine
```


Avoid:


```
if(status == APPROVED)
```


Use:


```
State

 |

Transition

 |

Action

 |

Event
```


---

# 11. Event Driven Rule


Communication:


Wrong:


```
Inventory Service

        |

calls

        |

Finance Service
```


Correct:


```
STOCK_MOVED Event


        |


Event Bus


        |


Finance Subscriber
```


---

# 12. Integration Rule


External system masuk melalui:


```
REDI Integration Hub
```


Connector:


Enterprise:

- SAP
- Odoo
- Office365


Industrial:

- MQTT
- PLC
- SCADA
- OPC-UA


Internal:

- TunasIoT
- ISP-Kita
- TunasNOC


---

# 13. Industrial Flow Standard


## Manufacturing


Flow:


```
Material Release

       |

Production Execution

       |

IoT Capture

       |

Supervisor Release

       |

QA Release
```


---

## Engineering


Flow:


```
IoT Alert

   |

Work Order

   |

Sparepart

   |

Maintenance

   |

History
```


---

## ITSM


Flow:


```
Monitoring Alert

      |

Incident

      |

Assignment

      |

Resolution
```


---

# 14. Existing Code Evolution


Jangan rewrite total.


Transform existing:


## appProcess


From:


```
Business Process Config
```


To:


```
Metadata Engine
```


---


## appRouting


From:


```
Static Routing
```


To:


```
TunasFlow Runtime
```


---


Existing modules:


```
inventory

finance

production
```


become:


```
Capability Package
```


---

# 15. AI Agent Development Rules


AI Agent wajib:


1. Read blueprint first


2. Analyze existing implementation


3. Identify reusable code


4. Refactor gradually


5. Preserve business knowledge


Never:


- Delete without analysis

- Duplicate engine

- Create hardcoded process


---

# 16. Development Phase Gate


## PHASE 0

Architecture Stabilization


Goals:


- Repository audit

- Remove duplicate logic

- Define boundaries

- Map existing code


NO NEW FEATURE.


---

## PHASE 1

REDI Kernel


Deliver:


- Identity Engine

- Metadata Engine

- Security Engine

- Runtime Engine


---

## PHASE 2

TunasFlow


Deliver:


- Workflow Runtime

- Rule Engine

- Event Engine


---

## PHASE 3

REDI Studio


Deliver:


- Object Designer

- Form Designer

- Workflow Designer


---

## PHASE 4

Core Industrial Module


Priority:


1. Master Data

2. Asset

3. Inventory WMS

4. Engineering CMMS

5. ITSM

6. MES

7. QMS


---

## PHASE 5

Enterprise Module


- Finance

- Procurement

- Costing

- Supply Chain


---

## PHASE 6

Integration


- IoT

- ERP Connector

- Industrial Connector


---

## PHASE 7

AI Layer


- Agent Framework

- Prediction

- Optimization


---

# 17. Code Decision Tree


Before creating code ask:


```
Is this reusable?


YES

 |
Kernel Capability


NO

 |
Module Template
```


Before creating field:


```
Can metadata solve it?


YES

 |
Metadata Definition


NO

 |
Extend Engine
```


---

# 18. Final Architecture Rule


Always choose:


Platform > Feature


Configuration > Hardcode


Event > Dependency


Workflow > Status


Metadata > Migration


---

# END DOCUMENT
