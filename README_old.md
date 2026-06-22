# RediOS Dynamic Business Operating System

# AI_ARCHITECTURE_CONTEXT.md

Version: 3.0


============================================================

# 1. CORE VISION

RediOS is NOT an ERP application.

RediOS is a Dynamic Business Operating System.

The goal is to create a platform where applications are not hardcoded,
but generated and controlled by metadata, workflow, rules, and business context.


DO NOT think:

    RediERP
    RediPOS
    RediClinic


Think:

    RediOS Kernel

          |

    Dynamic Engine

          |

    Business Application Composer



Any future business application should be created by configuration,
not source code changes.


Examples:

- Retail System
- ERP
- Clinic
- ISP Billing
- Manufacturing
- Custom Industry Software

are only compositions of modules.


============================================================


# 2. EXISTING SOURCE CODE INTERPRETATION


Important:

The current code is not just CRUD.

Several concepts already exist and must be preserved.


------------------------------------------------------------

## appProcess

Current:

Dynamic application/process definition.


Future:

Application Metadata Engine.


Responsibilities:

- define business object
- define process
- define available actions
- connect form
- connect workflow
- connect reports
- control application behavior


DO NOT replace appProcess with hardcoded controller.


------------------------------------------------------------


## appRouting


Current:

Dynamic routing/process configuration.


Future:

Workflow Engine / Business Process Engine.


Responsibilities:

- approval workflow
- process routing
- conditional flow
- state transition
- automation trigger
- business orchestration


Example:


purchase.submit

        |

 Workflow Engine

        |

 + approval
 + inventory movement
 + accounting journal
 + notification



Rules:

Business process must be configurable.

Avoid:

purchaseService.approve()


Prefer:

workflow.execute(
    event,
    context
)


------------------------------------------------------------


## domainCode


IMPORTANT CONCEPT.


domainCode is NOT only a code separator.

domainCode is Business Context Engine.


It handles:

- owner context
- multiple companies
- multiple business types
- multiple branches
- data isolation
- dynamic query context
- reporting context
- business segmentation


Example:


OWNER GROUP A


        |

        + Restaurant Business
        |
        + Distribution Business
        |
        + Manufacturing Business


Each business may have:

- different workflow
- different report
- different module
- different user access


Structure:


Tenant

   |

Organization

   |

Business Domain

(domainCode)

   |

Branch

   |

Data Context



Every query must understand domainCode.


NEVER bypass domain context.
============================================================

# 3. REDIOS KERNEL ARCHITECTURE


RediOS Kernel is the core layer.

Kernel responsibility:

- isolate tenant
- resolve business context
- manage permission
- manage metadata
- provide foundation for all engines


Application logic should NOT directly access database.

All requests must pass kernel context.



Request Flow:


Client Request

      |

API Gateway

      |

Authentication

      |

Tenant Resolver

      |

Organization Resolver

      |

Business Context Resolver
(domainCode)

      |

Permission Engine

      |

Engine Execution

      |

Database



============================================================


# 4. TENANT ENGINE


Tenant Engine controls SaaS isolation.


Supported strategy:


1. Shared Database

Suitable for:

- POS
- small business
- high tenant volume


Example:


database:

redios


tables:

transactions

tenantId
domainCode



------------------------------------------------------------


2. Dedicated Database


Suitable for:

- corporate ERP
- enterprise customer
- customer requiring backup ownership


Example:


Customer A

database_a


Customer B

database_b



------------------------------------------------------------


3. Hybrid Mode


RediOS must support both.


Decision is metadata driven.


Example:


{
    "tenant": "CUSTOMER_A",

    "databaseMode": "dedicated"
}


{
    "tenant": "SMALL_POS",

    "databaseMode": "shared"
}


DO NOT hardcode database selection.



============================================================


# 5. ORGANIZATION ENGINE


A tenant can own multiple organizations.


Example:


Holding Company


        |

        + Company A

        + Company B

        + Company C



Organization Engine handles:

- legal entity
- company hierarchy
- ownership
- consolidation
- reporting scope


A user may access:

- one company
- multiple companies
- group level



============================================================


# 6. BUSINESS CONTEXT RESOLVER


Partner of domainCode.


Developers should NOT manually add:


where {

    domainCode:"xxx"

}


everywhere.



Instead:


Request

    |

JWT Context

    |

Context Resolver

    |

Automatic Query Injection



Example:


User:

John


Context:


{
 tenant:"T001",

 organization:"COMPANY_A",

 domainCode:"RETAIL"

}


Query Engine automatically adds:

tenant filter

domain filter

permission filter



Goal:

prevent data leakage.



============================================================


# 7. MODULE MANAGEMENT ENGINE


IMPORTANT:


RediOS does NOT have fixed applications.


Avoid:


apps/

   erp/

   pos/

   clinic/




Because future applications are unknown.



Use capability modules.



Example:


modules/


    sales/

    inventory/

    finance/

    document/

    workflow/

    payment/

    asset/

    customer/

    custom/




Application is only composition.



Example:


POS System:


modules:

- sales

- inventory

- payment



ERP System:


modules:

- sales

- purchase

- finance

- workflow



Rental System:


modules:

- asset

- contract

- billing




============================================================


# 8. MODULE MANIFEST


Every module should describe itself.


Example:


module.json


{


"name":"inventory",


"version":"1.0",


"dependencies":[

    "product"

],


"provides":[

    "forms",

    "reports",

    "workflow",

    "api",

    "events"

]


}



Module installation should register:


- menu
- permission
- form
- workflow
- report
- API endpoint



============================================================


# 9. MENU MANAGEMENT ENGINE


Menu is NOT hardcoded frontend.


Menu comes from metadata.


Example:


{

"name":"Inventory",

"module":"inventory",

"route":"/inventory",

"permission":"inventory.read"

}



Menu visibility depends on:


- tenant package
- installed module
- user role
- permission
- workflow state



Frontend only renders menu definition.



============================================================


# END PART 2
============================================================

# 10. DYNAMIC FORM ENGINE


IMPORTANT:

Frontend must NOT contain business rules.


Frontend responsibility:

- render component
- collect input
- display result


Business definition comes from metadata.



Form Engine controls:


- form layout
- component type
- field visibility
- field permission
- readonly state
- validation rule
- default value
- calculated field
- workflow state behavior



============================================================


## Form Definition Example


Example:


{
    "form":"purchase_order",

    "fields":[

        {

        "name":"supplier",

        "component":"lookup",

        "required":true

        },


        {

        "name":"amount",

        "component":"currency",

        "validation":[

            "minimum:0"

        ]

        }

    ]

}



Frontend only renders this definition.



============================================================


# 11. UI SECURITY POLICY ENGINE


Security is NOT only API security.


Every field can have policy.



Example:


Staff:


{
 field:"purchase_price",

 visible:false
}



Manager:


{
 field:"purchase_price",

 visible:true,

 readonly:false
}



After workflow approved:


{
 field:"amount",

 readonly:true
}



Policy depends on:


- user
- role
- permission
- domainCode
- workflow state
- organization



NEVER hardcode:


if(user.role==="admin")


inside frontend.



============================================================


# 12. DYNAMIC DATA MODEL ENGINE


Avoid creating new database model for every business case.



Traditional:


PurchaseModel

SalesModel

CustomerModel



Problem:

Every customer customization requires code changes.



RediOS way:


Metadata defines object.



Example:


Object Definition:


{
 "object":"purchase_order",

 "fields":[

    {

     "name":"supplier",

     "type":"relation"

    },


    {

     "name":"total",

     "type":"currency"

    }

 ]

}



Runtime Data:


{
 "object":"purchase_order",

 "tenant":"T001",

 "domainCode":"RETAIL",


 "data":{

    "supplier":"ABC",

    "total":100000

 }

}



Customer can add fields without deployment.



============================================================


# 13. DYNAMIC API ENGINE


Avoid:


/api/purchase/create


/api/customer/update



Because every new module creates new endpoint.



Preferred:


Universal Object API:



POST


/api/v1/object/:objectName



Example:


/api/v1/object/purchase_order



Flow:


API Gateway

      |

Permission Engine

      |

Metadata Engine

      |

Validation Engine

      |

Workflow Engine

      |

Database Engine



API behavior comes from metadata.



============================================================


# 14. DOMAIN QUERY ENGINE


Existing domainCode concept evolves here.



Reports and queries must understand:


- tenant
- organization
- domainCode
- branch
- permission



Example:


User asks:


"Show sales this month"



Engine automatically resolves:


WHO is asking?

WHAT business?

WHICH branch?

WHAT permission?



Then generate safe query.



============================================================


# 15. DYNAMIC REPORT BUILDER


DO NOT create:


salesReport()

stockReport()

profitReport()



Reports must be metadata.



Example:


{


"name":"Monthly Sales",


"source":"sales_transaction",


"groupBy":[

    "customer"

],


"metrics":[

    {

    "field":"amount",

    "operation":"SUM"

    }

]

}



Same report engine can generate:


- API response
- dashboard
- PDF
- Excel
- analytics



============================================================


# 16. DASHBOARD ENGINE


Dashboard is NOT hardcoded.



Dashboard consists of widgets.



Widget Example:


{


"type":"chart",


"source":"sales",


"metric":"monthly_growth"


}



Dashboard visibility depends on:


- role
- domainCode
- module
- permission



CEO:

shows:

- profit
- revenue
- company overview



Branch:

shows:

- branch performance



Staff:

shows:

- operational task



============================================================


# END PART 3
============================================================

# 17. RULE ENGINE


IMPORTANT:

Business rules must NOT be hardcoded inside services.



Avoid:


if(customer.type === "VIP") {

    discount = 20

}



Because every business has different rules.



RediOS Rule Engine controls:


- pricing
- discount
- promotion
- tax
- commission
- approval condition
- validation rule
- SLA rule
- business policy



============================================================


## Dynamic Pricing Engine


Existing:

cron based price calculation.


Future:

Pricing Rule Engine.



Example:


{


"name":"Happy Hour Pricing",


"condition":{


"time":{

    "from":"18:00",

    "to":"21:00"

},


"domainCode":"RETAIL"


},



"action":{


"discount":"20%"


}


}



Engine decides price dynamically.



Use cases:


Retail:

- happy hour discount
- member pricing
- bundle pricing



ERP:

- customer contract price
- volume discount
- project pricing



Service:

- SLA based pricing
- subscription pricing



============================================================


# 18. SCHEDULER ENGINE


DO NOT directly depend on operating system cron.



Current cron jobs should evolve into:

Scheduler Engine.



Responsibilities:


- recurring task
- delayed execution
- background process
- automatic calculation
- notification
- synchronization



Example:


{


"job":"recalculate_price",


"schedule":"every 1 hour",


"context":{

    "tenant":"T001",

    "domainCode":"RETAIL"

}

}



Scheduler must understand:


- tenant
- domainCode
- timezone
- permission



============================================================


# 19. EVENT ENGINE


Avoid direct service dependency.



Avoid:


Purchase Service

      |

Inventory Service

      |

Accounting Service



Because modules become tightly coupled.



Use Event Driven Architecture.



Example:


purchase.approved


          |

       Event Bus


          |


+---------+---------+

Inventory Module

Finance Module

Notification Module



============================================================


Events Example:



Transaction:


sales.created


purchase.approved


stock.updated



System:


user.created


module.installed


workflow.completed



AI:


ai.analysis.requested


ai.action.executed



============================================================


# 20. INTEGRATION ENGINE


RediOS must support external systems.



Examples:


- payment gateway
- marketplace
- bank
- government API
- third party software
- IoT devices
- external AI service



Integration should NOT access database directly.



Flow:



External System


       |

API Gateway


       |

Security


       |

Business Context


       |

Engine



============================================================


# 21. API GATEWAY ENGINE


API Gateway is the single entry point.



Used by:


- Web Application
- Mobile Application
- POS Client
- External Partner
- Corporate Integration
- AI Agent



Responsibilities:


Authentication


Authorization


Rate Limit


Tenant Resolver


Domain Resolver


API Versioning


Request Validation


Audit Logging



============================================================


Example Flow:


POS Terminal


      |

API Gateway


      |

Tenant Context


      |

domainCode Context


      |

Permission


      |

Sales Module



============================================================


# 22. AUDIT ENGINE


Enterprise customers require traceability.



Every action creates audit.



Example:



{


"user":"john",


"action":"UPDATE_PRICE",


"before":10000,


"after":12000,


"time":"2026-01-01",


"context":{


"tenant":"T001",

"domainCode":"RETAIL"


}


}



Audit applies to:


- user action
- workflow
- API
- AI execution
- scheduler execution



============================================================


# END PART 4
============================================================

# 23. AI ORCHESTRATION ENGINE


IMPORTANT:

AI is NOT only chatbot.

AI is an intelligent operator running on top of RediOS Kernel.



AI must understand:


- tenant
- organization
- domainCode
- installed modules
- user permission
- workflow
- business rules
- available actions



AI must NEVER access database directly.



Wrong:


AI Agent

      |

Database



Correct:


AI Agent

      |

AI Gateway

      |

Permission Engine

      |

Business Context Engine
(domainCode)

      |

Metadata Engine

      |

Workflow / Report / Data Engine



============================================================


# 24. AI CAPABILITY


AI can execute:


------------------------------------------------------------

1. Transaction Assistant


Example:


User:

"Create purchase order for low stock items"



AI Process:


Understand intent

        |

Check Permission

        |

Read Inventory Metadata

        |

Generate Purchase Request

        |

Execute Workflow



------------------------------------------------------------


2. Dynamic Report Analysis



Example:


User:

"Why profit decreased this month?"



AI Process:


Resolve:

- tenant
- domainCode
- allowed data



Analyze:

- sales
- cost
- discount
- expense



Generate:

- explanation
- recommendation



------------------------------------------------------------


3. Application Builder



Example:


User:

"Create rental management system"



AI generates:


- module composition
- data model
- forms
- workflow
- reports
- dashboard



NO manual coding required.



============================================================


# 25. AI SECURITY RULE


AI must follow same security as human.



AI cannot:


- bypass permission
- read hidden field
- access another domainCode
- execute forbidden workflow



Example:


Staff asks:


"Show company profit"



If permission denied:


AI Response:

Access denied.



============================================================


# 26. TARGET SOURCE STRUCTURE


Future structure:


src/


kernel/


    tenant/

    organization/

    context/

    security/

    permission/

    metadata/

    event/




engines/


    app-engine/

    workflow-engine/

    module-engine/

    form-engine/

    data-engine/

    report-engine/

    rule-engine/

    scheduler-engine/

    ai-engine/




modules/


    sales/

    inventory/

    finance/

    customer/

    document/

    workflow/

    custom/




gateway/


    api/

    integration/

    ai/



============================================================


# 27. MIGRATION ROADMAP V1 TO V2


IMPORTANT:


DO NOT REWRITE EVERYTHING.



Current RediERP already contains early kernel concepts.



Migration means:

extract engine

NOT rebuild.



============================================================


PHASE 1:

Create kernel foundation.



Add:


src/kernel/


Implement:


- Context Resolver
- Tenant Resolver
- Permission Engine
- Event Bus



Keep existing controllers.



============================================================


PHASE 2:

Promote existing concepts.



Move:


appProcess


        ->


Application Metadata Engine




Move:


appRouting


        ->


Workflow Engine




Move:


domainCode


        ->


Business Context Engine




Move:


reportControl


        ->


Report Engine




============================================================


PHASE 3:

Create Dynamic Runtime Engine.



Implement:


- Dynamic Object API
- Dynamic Form Renderer
- Rule Engine
- Module Installer



============================================================


PHASE 4:

AI Integration.



AI reads:


Metadata

Workflow

Report

Permission

Domain Context



AI executes through:

RediOS Kernel only.



============================================================


# 28. GOLDEN RULES FOR AI CODING AGENT


Before editing code:


READ THIS FILE.



Rules:


1.

Never convert RediOS into normal CRUD.



2.

Never hardcode business process.



3.

Never remove:


- appProcess concept

- appRouting concept

- domainCode concept



4.

Configuration is preferred over code.



5.

Metadata controls behavior.



6.

Every request must know:


tenant

organization

domainCode

permission



7.

Modules are capabilities,
not applications.



8.

AI must operate through Kernel.



============================================================


# FINAL ARCHITECTURE SUMMARY



             AI ENGINE


                 |


           API GATEWAY


                 |


              KERNEL


 Tenant

 Organization

 domainCode

 Permission

 Metadata

 Event



                 |


             ENGINES


 App Engine

 Workflow Engine

 Form Engine

 Data Engine

 Report Engine

 Rule Engine

 Scheduler Engine



                 |


             MODULES


 Dynamic Business Capability



============================================================


RediOS Vision:


Build business software without rebuilding software.


END.

