# PHASE 0 - REDI-OS Repository Audit & Architecture Mapping

## Purpose

Phase 0 adalah fase pemahaman dan konsolidasi existing REDI-OS Platform sebelum development fitur baru.

Tujuan utama:

- Memahami existing source code
- Menjaga business logic yang sudah berjalan
- Mapping existing architecture ke REDI-OS v3 Blueprint
- Menentukan refactor strategy
- Menyiapkan foundation Industrial 5.0 Platform

---

# Mandatory Reading

Sebelum melakukan perubahan code, AI Agent / Developer WAJIB membaca:

1. README.md
2. .cursorrules
3. docs/README.md
4. docs/architecture/REDIOS_PLATFORM_BLUEPRINT_v3.md

Blueprint v3 adalah source of truth.

---

# Golden Rules

## Allowed

- Analyze existing code
- Document current behavior
- Create architecture mapping
- Suggest refactor
- Identify duplicate logic

## Forbidden

- NO new feature development
- NO rewrite from scratch
- NO delete existing business logic
- NO breaking API contract
- NO database redesign without migration plan

---

# Audit Scope

Analyze repository structure:

- Folder architecture
- Routing layer
- Controller layer
- Service layer
- Model/schema layer
- Middleware
- Authentication
- Authorization
- Tenant handling
- Database access pattern

---

# REDI Core DNA Mapping

## appProcess Analysis

Current:

appProcess

Target:

Metadata Engine

Analyze:

- where appProcess is used
- current responsibility
- migration path

---

## appRouting Analysis

Current:

appRouting

Target:

TunasFlow / Runtime Routing Engine

Analyze:

- dynamic route handling
- workflow potential
- automation capability

---

## domainCode Analysis

Current:

domainCode

Target:

Business Context Engine

Analyze:

- tenant context
- business separation
- module context

---

# Module Mapping

Existing modules must be mapped into Business Capability Package.

Target modules:

- REDI Kernel
- Identity Engine
- Metadata Engine
- Workflow Engine (TunasFlow)
- ERP
- Finance
- Inventory / WMS
- Production / MES
- Quality / QMS
- Engineering / CMMS
- ITSM
- HR-GA
- Integration Hub

---

# Integration Mapping

Analyze readiness for:

- TunasIoT
- ISP-Kita
- TunasNOC
- SAP
- Odoo
- Office365
- MQTT
- External API

---

# Required Output Documents

AI Agent must generate:

## docs/analysis/CURRENT_ARCHITECTURE.md

Contain:

- existing architecture
- folder explanation
- data flow
- dependency map

---

## docs/analysis/GAP_ANALYSIS.md

Compare:

Current REDI-OS

vs

REDI-OS Platform Blueprint v3

---

## docs/analysis/REFACTOR_PLAN.md

Contain:

- refactor priority
- migration strategy
- risk
- impact

---

## docs/analysis/MIGRATION_PHASE.md

Contain:

- development sequence
- module extraction order
- release planning

---

# Phase 0 Success Criteria

Phase 0 selesai jika:

- Existing architecture documented
- Core engine identified
- Module boundary clear
- Refactor roadmap approved
- No business logic lost

Only after Phase 0 completed:

Proceed to Phase 1 - REDI Kernel Development
