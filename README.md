# 🌱 REDI-OS Platform

## Industrial Intelligence Operating System

Version : 4.0  
Owner   : PT Revolusi Digital Solusi


---

# 1. Vision

REDI-OS is an **Industrial Intelligence Operating System**.

REDI transforms industrial knowledge into an executable digital operating model.


Traditional enterprise software:

```
Human
 |
operates
 |
Software
 |
stores
 |
Data
```

REDI-OS:

```
Industrial Reality
        |
        v
Industrial Knowledge Model
        |
        v
Ontology Context
        |
        v
Metadata Runtime
        |
        v
AI Assisted Execution
```


The goal:

> Transform enterprises from humans operating software
> into intelligent systems that understand industrial context
> and assist humans in operating businesses.


---

# 2. What REDI-OS Is

REDI-OS is not a traditional ERP.

REDI-OS is a foundation platform for:

- Industrial Digital Transformation
- Manufacturing Intelligence
- Enterprise Automation
- AI Assisted Operation
- Autonomous Enterprise Evolution


REDI combines:

```
Industrial Knowledge

        +

Ontology Model

        +

Metadata Engine

        +

Workflow Runtime

        +

Experience Engine

        +

AI Context Layer
```


---

# 3. What REDI-OS Is NOT


REDI is NOT:


❌ Traditional ERP

❌ CRUD Generator

❌ Low Code Form Builder

❌ Hardcoded Business Application

❌ Dashboard Only Platform


REDI is:


✔ Industrial Operating Layer

✔ Runtime Platform

✔ Knowledge Driven System

✔ Ontology Ready Architecture

✔ AI Native Enterprise Foundation


---

# 4. REDI North Star


Most enterprise applications start from:

```
Database
    |
    v
Application
    |
    v
User Interface
```


REDI starts from:


```
Industrial Knowledge
        |
        v
Ontology Definition
        |
        v
Metadata Model
        |
        v
Runtime Engine
        |
        v
Experience Workspace
        |
        v
AI Agent
```


The source of truth is not database schema.

The source of truth is:

```
Industrial Context
+
Relationship
+
Business Meaning
+
Operational Behavior
```


---

# 5. Industrial Knowledge Foundation


REDI captures real industrial knowledge:


Example:

```yaml
domain: Manufacturing


objects:

  - Machine

  - ProductionOrder

  - Material

  - Operator


process:

  - Planning

  - Production

  - Quality

  - Maintenance


relationship:


  ProductionOrder:

      consumes:

        - Material


      executedBy:

        - Machine

        - Operator


      produces:

        - Product



  Machine:

      belongsTo:

        - ProductionLine


      generates:

        - IoTEvent
```


This industrial knowledge generates:


- Ontology

- Metadata

- Workflow

- User Experience

- Report

- AI Context


---

# 6. Knowledge Driven Development


Traditional development:


```
Requirement

     |

Developer

     |

Database

     |

Application
```


REDI development:


```
Industrial Blueprint

        |

Ontology Model

        |

Metadata Compiler

        |

Runtime Execution

        |

Business Application
```


Business capability is modeled.

Not hardcoded.
---

# 7. REDI Architecture Layers


REDI-OS follows a layered operating system architecture.


```
                    USER EXPERIENCE

                           |

                    AI ASSISTANT

                           |

                    AI COMPOSER


================================================


              INDUSTRIAL INTELLIGENCE LAYER


                           |

                 Industrial Ontology

                           |

                 Industrial Context

                           |

                 Knowledge Graph


================================================


                    RUNTIME LAYER


                           |

                 Metadata Engine

                           |

                 Workflow Engine

                           |

                 Policy Engine

                           |

                 Event Engine


================================================


                    KERNEL LAYER


                           |

                 Identity

                 Security

                 Tenant

                 Permission

                 Audit


================================================


                    DATA LAYER


                           |

                 Database

                 External System

                 IoT Platform

                 API Integration
```


Each layer has clear responsibility.

No layer is allowed to bypass another layer.


---

# 8. Industrial Ontology Layer


Ontology represents:

"What the industrial world means."


It defines:

- Business meaning
- Relationship
- Dependency
- Impact
- Behavior
- Context


Example:


```
Customer

    |

places

    |

Sales Order

    |

requires

    |

Production Order

    |

uses

    |

Machine

    |

generates

    |

IoT Event
```


With ontology, REDI understands:


Example:


Machine failure is not only:


```
Machine.status = DOWN
```


REDI understands:


```
Machine Down

      |

Production Impact

      |

Order Delay

      |

Customer Risk

      |

Business Decision
```


---

# 9. Metadata Runtime Engine


Metadata represents:

"What exists and how it runs."


Metadata defines:


- Object Structure

- Field Definition

- Validation

- UI Schema

- Runtime Behavior

- Permission

- Event Mapping


Example:


```json
{
  "object": "Machine",

  "fields": [

    {
      "name": "serialNumber",
      "type": "string"
    },

    {
      "name": "status",
      "type": "enum"
    }

  ]
}
```


Metadata is NOT removed by ontology.


The evolution:


```
Database

    |

Metadata

    |

Semantic Metadata

    |

Ontology

    |

AI Context

    |

Autonomous Agent
```


---

# 10. Ontology Ready Metadata Principle


All metadata must support future intelligence.


Metadata object should allow:


```
Object

 ├── Fields

 ├── Validation

 ├── Relationship

 ├── Behavior

 ├── Event

 ├── Policy

 └── Semantic Context
```


Example:


```json
{
 "object": "Machine",


 "type": "IndustrialAsset",


 "relationships": [

   {
     "type":"BELONGS_TO",
     "target":"ProductionLine"
   }

 ],


 "behaviors":[

    "operate",

    "maintain",

    "shutdown"

 ],


 "events":[

    "MachineStarted",

    "MachineStopped"

 ]
}
```


This allows AI to understand:

not only data,

but industrial meaning.


---

# 11. REDI Kernel Responsibility


REDI Kernel is the core operating layer.


The kernel manages:


## Identity Engine

Responsible for:

- User identity

- Tenant identity

- Organization context


---

## Security Engine


Responsible for:


- Authentication

- Authorization

- Policy enforcement

- Data boundary


REDI does NOT use simple role checking.


Avoid:


```
if role == admin
```


Use:


```
Subject

    |

Policy

    |

Action

    |

Resource

    |

Context
```


---

## Runtime Engine


Responsible for executing:


- Metadata Object

- Business Rule

- Workflow

- Action

- Event


Application logic should run through runtime.


Avoid:


```
Controller

   |

Business Logic

   |

Database
```


Use:


```
Request

   |

Runtime Engine

   |

Policy Check

   |

Workflow

   |

Event

   |

Persistence
```


---

# 12. Event Driven Operating Model


REDI is event aware.


Traditional:


```
Save Data

    |

Finish
```


REDI:


```
Business Event

      |

Context Evaluation

      |

Rule Processing

      |

Workflow Execution

      |

Notification

      |

AI Learning
```


Example events:


```
ProductionStarted

MachineStopped

QualityRejected

OrderCompleted

StockCritical

ApprovalRequested
```


Events become input for:

- Automation

- AI Agent

- Analytics

- Optimization


---

# 13. TunasFlow Integration


Workflow is not a feature.


Workflow is the behavior engine of REDI.


Ontology defines:

"What it means"


Metadata defines:

"What exists"


TunasFlow defines:

"What should happen"


Flow:


```
Industrial Event

        |

Ontology Context

        |

TunasFlow Decision

        |

Runtime Action
```


Business change should modify workflow,

not source code.
---

# 14. REDI Experience Philosophy


REDI does not expose software complexity to users.


Traditional enterprise application:


```
Menu

 ↓

Module

 ↓

Form

 ↓

Transaction
```


REDI Experience:


```
User

 ↓

Role Context

 ↓

Workspace

 ↓

Recommended Action

 ↓

Business Outcome
```


The user should not search for work.

REDI delivers the right work to the right user.


---

# 15. Workspace Driven UI


REDI UI is not menu driven.


Every user receives a workspace generated from:


- Identity

- Role

- Responsibility

- Permission

- Business Context

- Active Workflow

- Notification

- AI Recommendation


Example:


Operator Workspace:


```
Today


Production Batch #2001

Status:
Waiting Execution


Recommended Action:

[Start Production]


Alert:

Machine A requires inspection
```


Manager Workspace:


```
Need Approval


Purchase Request

Production Exception

Quality Issue


Business Insight:

Delay Risk +15%
```


---

# 15A. UI/UX Design Standards (Mandatory)


> **Full spec:** `docs/design/UI_UX_STANDARDS.md`  
> **Goal:** User-friendly, consistent pages — minimize revision cycles for every designer, form, and screen.


Every page, form, and Studio designer **must** follow these rules before merge.


## 15A.1 Golden rules


| Rule | UI | Not in UI |
| --- | --- | --- |
| UI = action | Short labels, clear buttons | Long explanations |
| Handbook = context | `"Learn more"` link | Tutorial paragraphs on forms |
| Persona-first | Workspace layout per role | One generic admin menu |
| One primary action | Single filled CTA per view | Multiple competing primaries |
| Metadata-bound fields | Data object binding | Hardcoded field names |


```
WRONG:  Form header with 3 paragraphs explaining workflow
RIGHT:  Title + fields + [Submit] + HelpTip (max 120 chars) → handbook
```


## 15A.2 Page templates


### Workspace (`/workspace`)

- Inbox / tasks **first** (priority sort)
- Max **6 panels** without scroll on desktop
- Empty state: one sentence + action — not an essay


### Runtime (`/runtime/{entity}`)

```
← Back to workspace          [PRIMARY ACTION]
Status badge + document title
Form (max 8 fields above fold per section)
Secondary actions (outline / ghost)
```

- Primary action matches workflow state (START, SUBMIT, COMPLETE)
- Destructive (CANCEL, DELETE): danger color + confirm


### Studio designer (`/studio/metadata/*`)

- Overview: **card grid** — title + 1-line description + Open
- Editor: section nav | main form | HelpTip sidebar
- Intro text **max 2 lines** on page — detail lives in handbook
- Save/Publish: sticky footer right


### Auth (`/login`)

- Logo + form + one secondary link — no marketing walls of text


## 15A.3 Form standards


| Item | Standard |
| --- | --- |
| Fields per section (fold) | Max **8** |
| Label | Title Case noun phrase |
| Placeholder | Example value, not instructions |
| Field order | Title → status → core fields → references → notes |
| Primary button | Bottom-right or header-right, one per screen |
| Validation | On blur + submit; message under field |


## 15A.4 Design tokens (use only these)


From `apps/web/src/styles.css`:


```
--redios-color-primary / danger / success / muted
--redios-spacing-md / lg
--redios-radius-medium
--redios-font-family
--redos-builder-button-* (Studio/builder)
```


Do **not** introduce ad-hoc hex colors per page.


## 15A.5 Component hierarchy


```
atoms → molecules → organisms → templates
```


New reusable UI → **Custom Organism** metadata before inline page code.


## 15A.6 Copy limits


| Element | Max |
| --- | --- |
| Page title | 4 words |
| Button | 2 words |
| HelpTip | 120 characters |
| Empty state | 1 sentence + optional action |


## 15A.7 Designer checklist (required before PR)


```
[ ] Matches page template (workspace / runtime / studio / auth)
[ ] One primary action visible without scroll
[ ] No designer intro > 2 lines (handbook holds detail)
[ ] Fields bound to metadata — not hardcoded
[ ] HelpTip → handbook, not inline tutorial
[ ] Design tokens only
[ ] Loading + empty + error states
[ ] Tested 375px (mobile) and 1280px (desktop)
```


## 15A.8 Anti-patterns (avoid repeat revisions)


❌ Approval page per module → use universal inbox  
❌ Long help blocks on Metadata Designer overview  
❌ 15+ fields without sections  
❌ Custom colors per screen  
❌ Hardcoded entity UI (e.g. WORK_ORDER-only inbox)  
❌ Menu-driven CRUD as default landing  


---


# 16. REDI User Persona Model


REDI supports different operating experiences.


================================================


## System Administrator


Purpose:

Operate the REDI platform.


Access:


```
ALL SYSTEM CONTROL
```


Responsibilities:


- Tenant Management

- User Management

- Identity

- Security Policy

- Module Activation

- Capability Installation

- System Configuration

- Monitoring


Admin sees:


```
Complete Platform View
```


---


## REDI Programmer / Solution Builder


Purpose:

Create business capability without breaking kernel.


Programmer does NOT create traditional modules.


Programmer creates:


```
Industrial Model

      |

Builder Tools

      |

Capability Package
```


Tools:


### Metadata Builder

Creates:

- Object

- Field

- Relationship

- Behavior


### Ontology Designer

Creates:

- Business Meaning

- Dependency

- Context

- Industrial Relationship


### Form Builder

Creates:

- Dynamic UI

- Input Experience

- Validation


### Report Builder

Creates:

- Report Definition

- Analytics View


### Query Builder

Creates:

- Data Model Query

- Context Query


### Action Builder

Creates:

- Business Action

- Runtime Command


### Flow Designer

Creates:

- Approval

- Automation

- Process Flow


Output:


```
Capability Package
```


NOT custom source code.


---


## Manager


Purpose:

Control and optimize business operation.


Manager can modify:


- Dashboard

- Report

- Workflow

- Approval

- Business Rule

- Notification


Without developer dependency.


Manager experience:


```
Insight

  |

Decision

  |

Action

```


---


## Staff / Operator


Purpose:

Execute business operation.


Staff should only see:


- Assigned Work

- Required Action

- Notification

- Relevant Report

- Personal Dashboard


Avoid:


```
Complex Menu Navigation
```


Use:


```
My Workspace
```


---

# 17. Capability Package Architecture


REDI business applications are delivered as capability packages.


A capability package contains:


```
Capability


├── Ontology Definition


├── Metadata Objects


├── Relationship Model


├── Workflow


├── UI Experience


├── Dashboard


├── Report


├── Security Policy


├── Event Definition


└── AI Context
```


Example:


Manufacturing Capability:


```
Manufacturing


├── Production

├── Quality

├── Maintenance

├── Inventory

└── Planning
```


Each capability extends REDI Kernel.


It never modifies REDI Kernel.


---

# 18. Capability Marketplace Vision


Future REDI ecosystem:


```
Industrial Expert

        |

Creates

        |

Capability Package

        |

Published To

        |

Industrial Marketplace

        |

Installed By Tenant
```


Examples:


Manufacturing:

- MES

- QMS

- CMMS

- WMS


Service:

- Ticket Management

- Asset Management


Enterprise:

- Finance

- Procurement

- Human Resource


---

# 19. REDI Studio


REDI Studio is the development environment of REDI OS.


Similar concept:


Developer IDE:

```
Code

 ↓

Compile

 ↓

Application
```


REDI Studio:


```
Industrial Knowledge

        |

Design

        |

Compile

        |

Capability Runtime
```


Studio Components:


- Ontology Designer

- Metadata Designer

- Form Builder

- Flow Builder

- Report Builder

- Dashboard Builder

- Action Builder

- Integration Builder


---

# 20. TunasIoT Boundary


TunasIoT already exists.


Do not duplicate IoT responsibility inside REDI.


TunasIoT owns:


```
Physical Layer


Machine

Sensor

PLC

Gateway

Telemetry

Realtime Data

Protocol
```


REDI owns:


```
Intelligence Layer


Context

Relationship

Workflow

Decision

Optimization

AI Action
```


Integration:


```
Factory Reality


      |

      v


TunasIoT


      |

      v


Industrial Event


      |

      v


REDI Ontology


      |

      v


AI Assisted Operation
```


Example:


TunasIoT detects:


```
Machine Temperature High
```


REDI understands:


```
Machine Risk

      |

Production Impact

      |

Maintenance Workflow

      |

Manager Decision
```


---

# 21. Development Boundary Rules


Never create:


```
Fixed Business Module

Hardcoded Workflow

Tenant Specific Logic

Direct Database Business Logic
```


Always create:


```
Ontology

Metadata

Runtime Behavior

Reusable Capability
```


REDI source code builds the operating system.


Industrial knowledge builds the applications.
---

# 22. Industrial AI Composer


REDI does not build a general purpose AI model.


REDI builds:


```
Industrial AI Orchestration Layer
```


AI Composer is responsible for coordinating intelligence.


Architecture:


```
                  User Request


                       |

                       v


                AI Composer


                       |


        +--------------+--------------+


        |              |              |


    OpenAI         Claude        Local Model


        |              |              |


        +--------------+--------------+


                       |

                       v


          Industrial Context Engine


                       |

                       v


              REDI Runtime Action
```


AI Composer decides:


- Which AI model to use

- Which industrial context is required

- Which agent should execute

- Which workflow must run


AI providers are replaceable.


Industrial intelligence belongs to REDI.


---

# 23. Industrial Context Engine


LLM does not understand a company automatically.


REDI provides context.


AI should never query database directly.


Wrong:


```
AI

 |

Database

```


Correct:


```
AI

 |

Industrial Context Engine

 |

Ontology

 |

Metadata

 |

Runtime

 |

Action

```


Context Engine provides:


- Tenant Context

- Organization Context

- Process Context

- Machine Context

- Workflow Context

- Historical Decision Context


Example:


Question:


"Why is production delayed?"


AI receives:


```
Production Order

Machine Status

Material Availability

Operator Schedule

Quality Issue

Maintenance History

Relationship Impact
```


Not raw tables.


---

# 24. Data Operating Layer


Traditional applications store data.


REDI operates data.


Traditional:


```
Table

 |

Record

 |

Report
```


REDI:


```
Business Object

       |

Relationship

       |

Context

       |

Decision

       |

Action
```


Example:


Machine data:


Traditional:


```
Machine.status = DOWN
```


REDI:


```
Machine Down

      |

Affects Production Line

      |

Impacts Customer Order

      |

Requires Maintenance

      |

Creates Action
```


Data becomes operational intelligence.


---

# 25. Industrial Agent Runtime


Future REDI supports industrial AI agents.


Agent is not chatbot.


Agent is a digital industrial worker.


Examples:


Production Agent:


Responsible for:


- Monitor production

- Detect bottleneck

- Recommend action


Maintenance Agent:


Responsible for:


- Analyze machine condition

- Predict failure

- Create maintenance workflow


Quality Agent:


Responsible for:


- Detect quality trend

- Suggest correction


Finance Agent:


Responsible for:


- Analyze cost impact

- Monitor risk


Agents execute through:


```
Agent

 |

Policy

 |

TunasFlow

 |

REDI Runtime

 |

Human Governance

```


---

# 26. Industrial Agent Marketplace


Future capability evolution:


Today:


```
Install Application
```


Tomorrow:


```
Install Intelligence
```


Marketplace contains:


```
Industrial Agent Package


├── Knowledge Model

├── Ontology

├── Workflow Skill

├── AI Instruction

├── Policy

└── Runtime Action
```


Examples:


Manufacturing:

- Production Optimization Agent

- Predictive Maintenance Agent

- Quality Improvement Agent


Enterprise:

- Finance Intelligence Agent

- Procurement Agent

- HR Assistant Agent


---

# 27. Industrial Learning Loop


REDI AI evolution does not start from machine learning.


Learning requires structured context first.


Evolution:


```
Industrial Knowledge

        |

Ontology

        |

Context Engine

        |

Decision History

        |

Learning Dataset

        |

Machine Learning

        |

Optimization
```


Every action creates experience:


```
Event Happens

      |

AI Recommendation

      |

Human Decision

      |

Business Result

      |

Learning Memory
```


REDI learns:


- What worked

- What failed

- Which decision created value


---

# 28. Autonomous Enterprise OS Vision


Final REDI evolution:


From:


```
Human operates software
```


To:


```
Human governs intelligence
```


Autonomous flow:


```
Industrial Event


      |

      v


AI Understands Context


      |

      v


AI Suggests Decision


      |

      v


REDI Validates Policy


      |

      v


Workflow Executes


      |

      v


Human Controls Governance
```


AI assists.

Human owns authority.


---

# 29. REDI Position In AI Ecosystem


REDI does not compete directly with AI giants.


Each layer has different responsibility.


```
NVIDIA

=

AI Infrastructure


--------------------


OpenAI

=

General Intelligence Engine


--------------------


Microsoft

=

Productivity AI


--------------------


Palantir

=

Enterprise Reality Model


--------------------


REDI-OS

=

Industrial Intelligence Operating System
```


REDI focuses on:


```
Industrial Reality

       |

Operational Context

       |

Workflow Execution

       |

AI Assisted Action
```


---

# 30. Architecture Decision Principles


Every REDI development must ask:


## Is this knowledge?


If yes:


Create ontology.


---


## Is this structure?


If yes:


Create metadata.


---


## Is this process?


If yes:


Create workflow.


---


## Is this action?


If yes:


Create runtime command.


---


## Is this tenant specific?


If yes:


Create configuration.


Never hardcode.


---


# 31. AI Development Guardrails


Cursor / AI developer must follow:


DO NOT create:


```
Hardcoded ERP Module

Direct Business CRUD

Tenant Specific Logic

AI Direct Database Access

Fixed Workflow
```


ALWAYS create:


```
Reusable Kernel

Ontology Model

Metadata Definition

Runtime Behavior

Capability Package

AI Context
```


---

# 32. REDI Evolution Roadmap


Foundation:


```
PHASE 1

Kernel Completion


PHASE 2

Experience Engine


PHASE 3

TunasFlow Runtime


PHASE 4

REDI Studio


PHASE 5

Capability Engine


PHASE 6

Integration Hub


PHASE 7

Industrial Template
```


Intelligence:


```
PHASE 8

Industrial Ontology Engine


PHASE 9

AI Composer Platform


PHASE 10

Industrial Agent Runtime


PHASE 11

Autonomous Enterprise OS
```


---

# 33. Final North Star


REDI-OS mission:


```
Turn industrial knowledge

into

executable operating model

that AI can understand,

reason,

and assist.
```


The future:


```
Knowledge

    becomes

Software


Software

    becomes

Intelligence


Intelligence

    helps operate

Industry
```


REDI is not only a system builder.


REDI is:


```
Industrial Intelligence Operating System
```
