# REDI-OS PHASE 1 — KERNEL COMPLETION

Version: 1.0  
Status: READY FOR DEVELOPMENT  
Depends On:
- REDIOS_PLATFORM_BLUEPRINT_v3.md
- PHASE_DEVELOPMENT_ROADMAP.md


---

# 1. PURPOSE

Phase 1 bertujuan menyelesaikan REDI Kernel Foundation.

REDI-OS bukan ERP CRUD.

REDI-OS adalah **Industrial Intelligence Operating System** (v4 vision).

Foundation phases (1–3) membangun:

```
Metadata Runtime
+
Workflow / TunasFlow
+
Experience Layer
```

Ontology + AI layers = Phase 8+ (see PLATFORM_VISION_v4.md).

Goal utama Phase 1:

Mengubah **Metadata Definition** menjadi **Executable Enterprise Application Runtime**


---

# 2. CURRENT FOUNDATION STATUS

Existing:

apps/api/src/core


```
core/

├── context        ✅ EXISTING

├── metadata       🟡 PARTIAL

├── security       🟡 PARTIAL

├── runtime        🔴 BUILD

├── registry       🔴 BUILD

├── compiler       🔴 BUILD

└── event          🔴 BUILD
```


DO NOT rewrite existing engine.

RULE:

```
EVOLVE

NOT

REBUILD
```


---

# 3. TARGET KERNEL ARCHITECTURE


Final:

```
                REQUEST

                   |

            Context Engine

                   |

            Security Engine

                   |

            Runtime Executor

                   |

        Metadata Runtime Engine

                   |

              Event Engine

                   |

        +----------+-----------+

        |                      |

    TunasFlow            Integration Hub

                               |

                            TunasIoT

                        (External Python)
```


---

# 4. METADATA ENGINE COMPLETION


Existing:

```
metadata/

metadata-validator-engine.service.ts
```


Add:


```
apps/api/src/core/metadata/


├── metadata.registry.ts

├── metadata.repository.ts

├── metadata.cache.ts

├── metadata.loader.ts

└── metadata.types.ts
```


---

## Metadata Registry Responsibility


Responsible for:


- Register Application Definition

- Register Entity Definition

- Register Field Definition

- Register Workflow Definition

- Register UI Definition

- Register Security Definition



Flow:


```
System Start


     ↓


Load Metadata


     ↓


Validate Metadata


     ↓


Register


     ↓


Runtime Ready
```


---

# 5. METADATA COMPILER ENGINE


Create:


```
apps/api/src/core/compiler/


├── metadata.compiler.ts

├── object.compiler.ts

├── workflow.compiler.ts

├── ui.compiler.ts

└── security.compiler.ts
```


Purpose:


Convert:


```json
{
 "entity":"work_order",
 "fields":[]
}
```


Into:


```
Runtime Object Model
```


Reason:


DO NOT parse metadata every request.


Wrong:


```
Request

↓

Read JSON

↓

Execute
```


Correct:


```
Boot

↓

Compile

↓

Cache Runtime Model



Request

↓

Execute Runtime
```


---

# 6. RUNTIME EXECUTOR


Create:


```
apps/api/src/core/runtime/


├── runtime.executor.ts

├── runtime.context.ts

├── runtime.model.ts

├── runtime.action.ts

└── runtime.module.ts
```


Universal execution:


Example:


```ts
runtime.execute({

 object:"work_order",

 action:"create",

 payload:data

})
```


Avoid:


```ts
workOrderService.create()
```


Because REDI must stay:

Dynamic Platform


NOT:

Hardcoded ERP


---

# 7. UNIVERSAL OBJECT ENGINE


Support:


Objects:


- Ticket

- Asset

- Purchase Request

- Work Order

- QC Inspection

- Production Batch

- Employee

- Document



Every object has:


```
Object

 |
 +-- Metadata

 |
 +-- Fields

 |
 +-- Workflow

 |
 +-- Permission

 |
 +-- UI Schema

 |
 +-- Events
```


---

# 8. EVENT ENGINE FOUNDATION


Create:


```
apps/api/src/core/event/


├── event.bus.ts

├── event.definition.ts

├── event.dispatcher.ts

├── event.handler.ts

└── event.subscriber.ts
```


Purpose:


Internal communication.


Example:


Machine Alarm:


```
TunasIoT

   ↓

Integration Hub

   ↓

REDI Event

   ↓

TunasFlow

   ↓

Create Maintenance WO
```


---

# 9. SECURITY ENGINE COMPLETION


Existing:


Context:


```
user

tenant

role

permission

capability

attribute
```


Add:


```
apps/api/src/core/security/


├── policy.engine.ts

├── permission.evaluator.ts

├── capability.resolver.ts

└── security.context.ts
```


Support:


RBAC

+

ABAC


Example:


```
User can approve

IF

role = Manager

AND

department = document.department
```


---

# 10. TENANT CONTEXT RULE


Never trust frontend header.


Wrong:


```
Frontend

x-tenant-id

↓

Backend
```


Correct:


```
Login

 ↓

JWT

 ↓

Context Resolver

 ↓

Runtime Context
```


---

# 11. PACKAGE BOUNDARY RULE


DO NOT create:


```
modules/

├── finance.service.ts

├── inventory.service.ts

└── production.service.ts
```


Instead:


Capability Package:


```
package/


metadata.json

workflow.json

ui.json

security.json
```


---

# 12. TUNAS IOT RULE


TunasIoT already exists.


DO NOT create:


```
iot-module
```


Use:


```
Integration Connector
```


Architecture:


```
REDI-OS

 |

Integration Hub

 |

TunasIoT Platform

(Python Existing)
```


---

# 13. ACCEPTANCE CRITERIA


Phase 1 complete when:


## Metadata


✔ metadata can register

✔ metadata can compile

✔ metadata cached


---


## Runtime


✔ execute object dynamically

✔ action executed dynamically

✔ no hardcoded business module


---


## Security


✔ permission runtime

✔ capability resolver

✔ tenant isolation


---


## Event


✔ publish event

✔ subscribe event

✔ trigger workflow ready


---

# 14. STRICT CURSOR AI RULE


Cursor Agent:


DO NOT:

❌ create ERP CRUD module

❌ create finance logic

❌ create inventory logic

❌ create production logic



ONLY BUILD:

✅ Kernel

✅ Runtime

✅ Compiler

✅ Registry

✅ Event

✅ Security Foundation



Business module starts at:

PHASE 7 Industrial Template


---

# NEXT PHASE


After completion:


PHASE 2

REDI Experience Engine


- Persona Runtime

- Workspace Engine

- Universal Inbox

- Action Center

- Notification Center

```
