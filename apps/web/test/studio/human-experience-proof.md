# RediOS Studio Human Experience Proof

## Scope

Phase 19.0.4 adds a Studio presentation layer for business users. Kernel names, metadata definitions, API contracts, and generated JSON remain unchanged.

## Terminology Layer

New files:

- `apps/web/src/studio/terminology/terminology-map.ts`
- `apps/web/src/studio/terminology/terminology.service.ts`

Simple Mode uses business language:

- Application
- Data Object
- Information
- Input Screen
- List Screen
- Process
- Connection
- Rule
- Permission
- Connector
- Launch Version

Developer View uses internal platform language from the same terminology service.

## Simple User Journey

1. Open `http://localhost:3000/studio/create`.
2. Choose the Inventory starter.
3. Create the Product Data Object.
4. Add Information:
   - Name
   - Price
   - Stock
5. Design screens.
6. Review the business preview:
   - Desktop Product List
   - `+ Add Product`
   - Name, Stock, Price columns
   - Mobile preview with responsive input controls
7. Launch the application.
8. Open `/apps/INVENTORY_APP`.
9. Generated runtime application renders from active metadata and allows entering Product data.

## Guidance Proof

- First-time tour explains: Create application, define information, design interaction, add rules, launch.
- Current step explanation appears above the stepper.
- Locked steps explain what business prerequisite is missing.
- Recommended next action suggests Product Name, Price, Stock, and Category.
- Contextual help explains Data Object, Information, Screen, Process, and Launch.

## Mode Boundary

Simple Mode does not expose developer terminology in the creation journey. Developer View preserves internal terminology, JSON, publish detail, and validation-oriented copy for expert users.

## Validation

Expected commands:

- `npm run typecheck`
- `npm run build`

Both must pass before commit.
