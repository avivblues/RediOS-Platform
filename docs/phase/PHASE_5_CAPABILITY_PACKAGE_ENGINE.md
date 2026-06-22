# REDI-OS PHASE 5 — CAPABILITY PACKAGE ENGINE

Version: 1.0  
Status: PLANNED

Depends On:

- PHASE_1_KERNEL_COMPLETION.md
- PHASE_2_EXPERIENCE_ENGINE.md
- PHASE_3_TUNASFLOW_RUNTIME.md
- PHASE_4_REDI_STUDIO.md
- REDIOS_PLATFORM_BLUEPRINT_v3.md


---

# 1. PURPOSE

Phase 5 membangun Capability Package Engine.

Ini adalah pondasi supaya REDI-OS tidak berubah menjadi kumpulan aplikasi ERP.

REDI-OS tidak membuat module hardcoded.

REDI-OS menginstall kemampuan bisnis.


Contoh:


Traditional ERP:

```
finance.service.ts
inventory.service.ts
production.service.ts
```


REDI-OS:

```
Finance Capability Package

Inventory Capability Package

Production Capability Package
```


Berisi:

- Metadata
- Workflow
- UI Experience
- Security
- Report
- Dashboard
- Integration


---

# 2. CORE PRINCIPLE


REDI-OS adalah platform.


Application = Package + Runtime


```
Capability Package

        |

        v

Metadata Registry

        |

        v

Compiler

        |

        v

Runtime Engine

        |

        v

Experience Engine

```


---

# 3. PACKAGE STRUCTURE


Standard package:


```
packages/


finance/

├── package.json

├── metadata/

│   ├── objects.json

│   ├── fields.json

│   └── relations.json


├── workflow/

│   └── flow.json


├── experience/

│   ├── workspace.json

│   ├── forms.json

│   └── actions.json


├── security/

│   ├── roles.json

│   └── policies.json


├── reports/

│   └── reports.json


├── dashboards/

│   └── dashboards.json


└── integration/

    └── connectors.json

```


---

# 4. CREATE PACKAGE ENGINE


Implement:


```
apps/api/src/core/package/


├── package.manager.ts

├── package.installer.ts

├── package.registry.ts

├── package.validator.ts

├── package.version.ts

├── dependency.resolver.ts

└── package.loader.ts

```


---

# 5. PACKAGE INSTALL FLOW


Process:


```
Upload Package

      |

Validate Manifest

      |

Check Dependency

      |

Register Metadata

      |

Compile Runtime

      |

Generate Workspace

      |

Activate Capability

```


---

# 6. PACKAGE MANIFEST


Example:


```json
{
"name":"quality-management",

"code":"QMS",

"version":"1.0",

"requires":[

 "core.workflow",

 "core.document"

],

"capabilities":[

 "inspection",

 "release",

 "audit"

]

}
```


---

# 7. DEPENDENCY ENGINE


Problem:


QMS needs:

- Inventory
- Production


CMMS needs:

- Asset


So package must resolve:


```
QMS

 |

 +-- Inventory Capability

 |

 +-- Production Capability

```


No duplicate objects.


---

# 8. VERSION MANAGEMENT


Every package versioned.


Example:


```
QMS

v1.0

v1.1

v2.0

```


Support:


- Upgrade

- Migration

- Rollback

- Compatibility Check


---

# 9. TENANT PACKAGE RULE


Multi tenant:


```
Tenant A


ERP
WMS
QMS



Tenant B


HRGA
ITSM
CMMS

```


Same platform.


Different capabilities.


---

# 10. MARKETPLACE READY DESIGN


Future:


REDI Marketplace


Package types:


## Official Package


Created by:

PT Revolusi Digital Solusi


## Partner Package


Created by:

Developer Partner


## Tenant Custom Package


Created by:

Tenant Programmer


---

# 11. CUSTOMIZATION RULE


DO NOT MODIFY CORE.


Wrong:


```
edit production.service.ts
```


Correct:


```
Extend Metadata

Override Experience

Add Workflow

Add Action

```


---

# 12. INDUSTRIAL PACKAGE EXAMPLES


## ERP Package


Contains:


- Finance Capability

- Purchase

- Sales

- Inventory

- Costing



## MES Package


Contains:


- Production Order

- Machine

- Batch

- Output



## QMS Package


Contains:


- QC Inspection

- QA Release

- Audit

- CAPA



## CMMS Package


Contains:


- Asset

- Maintenance

- Work Order

- Sparepart



## HRGA Package


Contains:


- Employee

- Attendance

- Leave

- Asset Request



---

# 13. INTEGRATION PACKAGE


External system packaged as connector.


Example:


```
SAP Connector

Mikrotik Connector

PLC Connector

IoT Connector

```


Including:


- Endpoint

- Authentication

- Mapping

- Event


---

# 14. TUNAS IOT RULE


IMPORTANT:


TunasIoT already exists.


DO NOT create:


```
tunas-iot-module
```


Create:


```
TunasIoT Connector Package
```


Flow:


```
REDI Package Engine


        |

Integration Hub


        |

TunasIoT Python Platform

```


---

# 15. PACKAGE SECURITY


Every package declares:


```
Role

Permission

Capability

Policy

```


Runtime decides access.


Never hardcode.


---

# 16. ACCEPTANCE CRITERIA


Phase complete when:


## Package


✔ install package

✔ uninstall package

✔ version package



## Metadata


✔ package registers metadata

✔ runtime can execute



## Tenant


✔ tenant can enable different packages



## Upgrade


✔ package upgrade without breaking core



---

# 17. STRICT CURSOR RULE


DO NOT:


❌ Create ERP folders

❌ Create business services

❌ Create static modules

❌ Modify kernel for tenant request



BUILD:


✅ Package Runtime

✅ Installer

✅ Registry

✅ Dependency Resolver

✅ Version Manager



Business capability = Package


Core stays clean.


---

# NEXT


PHASE 6:

INTEGRATION HUB


Including:

- External API
- MQTT
- Event Bridge
- TunasIoT Connection
