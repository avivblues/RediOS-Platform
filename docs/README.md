# REDI-OS Documentation Center

## Industrial Intelligence Operating System — Engineering Guide

Version: 4.0  
Owner: PT Revolusi Digital Solusi

> **Paradigm v4:** REDI bukan sekadar metadata-driven platform — REDI adalah **Industrial Intelligence OS**.  
> Metadata tetap layer runtime kritikal; ontology + AI context adalah layer di atasnya (Phase 8+).

---

# 1. Purpose

Folder ini adalah pusat dokumentasi teknis REDI-OS.

Semua keputusan development harus mengikuti:

```
Industrial Knowledge First

Ontology Ready (Phase 8+)

Metadata Runtime

Workflow / TunasFlow

Experience First

AI Context (Phase 9+)
```

Dokumentasi ini menjadi panduan untuk:

- Developer
- Solution Architect
- System Analyst
- AI Coding Agent

---

# 2. Documentation Hierarchy

Urutan membaca (**v4**):

```
Repository Opened
        |
README.md                    ← Vision v4, north star
        |
.cursorrules                 ← AI agent rules v4
        |
docs/architecture/PLATFORM_VISION_v4.md   ← Alignment bridge
        |
docs/design/UI_UX_STANDARDS.md            ← UI/UX before any page/form work
        |
docs/analysis/ALIGNMENT_v4_STATUS.md
        |
docs/phase/PHASE_*_VALIDATION.md          ← Sprint status per phase
        |
docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md  ← Kernel detail (technical)
        |
Source Code
```

**Jangan** pakai `docs/archive/` untuk keputusan arsitektur aktif.

---

# 3. Main Architecture Reference

| Document | Role |
| --- | --- |
| `docs/architecture/PLATFORM_VISION_v4.md` | **Vision & alignment** — north star v4, phase map, guardrails |
| `docs/design/UI_UX_STANDARDS.md` | **UI/UX mandatory** — forms, pages, Studio designers |
| `docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md` | **Kernel detail** — metadata engine, runtime, module strategy |
| `docs/analysis/ALIGNMENT_v4_STATUS.md` | **Current code truth** — what exists vs v4 layers |

Blueprint v3 tetap valid untuk detail kernel; visi produk mengikuti **README v4 + PLATFORM_VISION_v4**.

---

# 4. Development Philosophy

REDI-OS tidak membangun aplikasi ERP hardcoded.

REDI-OS membangun **operating system** yang mengeksekusi:

```
Industrial Knowledge
        +
Ontology Context (Phase 8+)
        +
Metadata Model
        +
Workflow / TunasFlow
        +
Experience Workspace
        +
AI Assistance (Phase 9+)
```

Capability bisnis hidup di **Capability Package** + metadata — bukan di source code kernel.

Example:

Wrong: `Create Purchase Approval Module` (hardcoded ERP)

Correct: `Approval Capability + Workflow Template + Purchase Configuration` (metadata + package)

---

# 5. Architecture Layers (v4)

```
AI Assistant / Composer (Phase 9+)
        |
Industrial Ontology (Phase 8+)
        |
Application Experience (Phase 2) ✅
        |
REDI Studio (Phase 4)
        |
TunasFlow Engine (Phase 3) 🟡
        |
Universal Document / Runtime Engine (Phase 1) ✅
        |
REDI Kernel
        |
Capability Modules (Phase 5–7)
        |
Integration Hub (Phase 6)
```

Detail layer → `docs/architecture/PLATFORM_VISION_v4.md`


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
