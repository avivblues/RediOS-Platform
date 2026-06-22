# REDI-OS PHASE 6 — INTEGRATION HUB

Version: 1.0  
Status: PLANNED

Depends On:

- PHASE_1_KERNEL_COMPLETION.md
- PHASE_2_EXPERIENCE_ENGINE.md
- PHASE_3_TUNASFLOW_RUNTIME.md
- PHASE_4_REDI_STUDIO.md
- PHASE_5_CAPABILITY_PACKAGE_ENGINE.md
- REDIOS_PLATFORM_BLUEPRINT_v3.md


---

# 1. PURPOSE

Integration Hub adalah gerbang komunikasi REDI-OS dengan dunia luar.

REDI-OS bukan sistem tertutup.

REDI-OS harus mampu terhubung dengan:

- IoT Platform
- Machine
- PLC
- Sensor
- ERP External
- API Partner
- Legacy System
- Mobile Device
- AI Service


---

# 2. CORE PRINCIPLE


Traditional ERP:


```
Module

 |

Custom Integration Code

 |

External System
```


Problem:


- Banyak custom script
- Sulit maintenance
- Tidak reusable


---


REDI-OS:


```
External System

        |

 Connector Engine

        |

 Integration Hub

        |

 Event Bus

        |

 Runtime Engine

        |

 Experience Engine
```


Integration menjadi capability.


---

# 3. CREATE INTEGRATION CORE


Implement:


```
apps/api/src/core/integration/


├── integration.hub.ts

├── connector.registry.ts

├── connector.runtime.ts

├── mapping.engine.ts

├── transformation.engine.ts

├── integration.event.ts

└── integration.security.ts

```


---

# 4. CONNECTOR ENGINE


Connector adalah adapter.


Support:


```
REST API

GraphQL

MQTT

WebSocket

Webhook

Database

File

Message Queue

OPC-UA

Modbus

```


Connector format:


```json
{
 "name":"machine_connector",

 "type":"mqtt",

 "endpoint":"broker",

 "events":[

   "temperature",

   "alarm"

 ]

}
```


---

# 5. EVENT BRIDGE


All external input becomes:


REDI Event


Example:


Wrong:


```
Machine Alarm

 |

Create WO directly
```


Correct:


```
Machine Alarm

 |

Integration Hub

 |

Event Bus

 |

TunasFlow

 |

Action

```


---

# 6. DATA MAPPING ENGINE


Never hardcode mapping.


Wrong:


```ts
machine.temp = payload.t1
```


Correct:


Metadata Mapping:


```json
{
 "source":"payload.t1",

 "target":"machine.temperature"
}
```


---


Flow:


```
External Payload

        |

Mapping Engine

        |

Runtime Object

```


---

# 7. TRANSFORMATION ENGINE


Support:


- Unit Conversion

- Format Conversion

- Calculation

- Validation

- Enrichment


Example:


```
Sensor:

0.85


Transform:


85%

```


---

# 8. TUNAS IOT INTEGRATION


IMPORTANT:


TunasIoT already exists.


Technology:


```
Python Platform
```


DO NOT CREATE:


```
apps/tunas-iot

iot.service.ts

iot-module
```


---


Integration Model:


```
                REDI-OS


                   |


            Integration Hub


                   |


            Connector Package


                   |


              TunasIoT API


                   |


      MQTT / Sensor / Gateway / PLC

```


---

# 9. TUNAS IOT RESPONSIBILITY


TunasIoT owns:


- Device Management

- Sensor Collection

- Telemetry

- MQTT Processing

- Edge Communication

- Machine Protocol

- Realtime Signal


---

REDI owns:


- Business Context

- Workflow

- Work Order

- Notification

- Analytics

- Decision


---

Example:


```
Bearing Temperature High


        |

     TunasIoT


        |

  Integration Hub


        |

     Event Bus


        |

    TunasFlow


        |

Create Maintenance WO

```


---

# 10. WEBHOOK ENGINE


Create:


```
integration/webhook/


├── webhook.manager.ts

├── webhook.security.ts

├── webhook.dispatcher.ts

└── webhook.log.ts

```


Support:


Incoming:

External → REDI


Outgoing:

REDI → External


---

# 11. API GATEWAY READY


Prepare:


```
External Client


      |

API Gateway


      |

Auth


      |

Rate Limit


      |

REDI Runtime

```


Support:


- Token
- API Key
- OAuth
- Tenant Isolation


---

# 12. MESSAGE QUEUE READY


Future scalable architecture:


```
REDI

 |

Event Broker

 |

Consumers

```


Support:


- RabbitMQ

- Kafka

- Redis Stream


---

# 13. CONNECTOR PACKAGE


Integration can be installed.


Example:


```
packages/connectors/


├── tunas-iot/

├── sap/

├── mikrotik/

├── whatsapp/

└── email/

```


Connector contains:


- Metadata
- Authentication
- Mapping
- Events
- Actions


---

# 14. MONITORING


Every integration stores:


```
Status

Latency

Error

Retry

Payload Log

Last Sync

```


Visible in:


Admin Workspace.


---

# 15. SECURITY RULE


Never expose core.


External system:


NO:


```
Database Access
```


YES:


```
Connector

↓

Runtime API
```


---

# 16. ACCEPTANCE CRITERIA


Phase complete when:


## Connector


✔ Register connector

✔ Execute connector dynamically



## Event


✔ External event converted

✔ Event bus triggered



## Mapping


✔ Dynamic field mapping



## TunasIoT


✔ Connected without rewrite



## Security


✔ Isolated per tenant


---

# 17. STRICT CURSOR RULE


DO NOT:


❌ Rewrite TunasIoT

❌ Create IoT module

❌ Direct access external database

❌ Hardcode integration



BUILD:


✅ Integration Hub

✅ Connector Runtime

✅ Mapping Engine

✅ Event Bridge

✅ Security Gateway



External system connects through:

Connector Package


---

# NEXT


PHASE 7:

INDUSTRIAL TEMPLATE


ERP

WMS

MES

QMS

CMMS

ITSM

HRGA

built as Capability Packages.
