# Workflow Studio Visual Builder Proof

Phase 19.1 adds a metadata-only Workflow Studio builder inside RediOS Studio.

## 1. Open Workflow Builder

- Open `/studio`.
- Select a workflow metadata item from the metadata explorer.
- Studio loads the workflow through the generic metadata API:
  - `GET /api/metadata/WORKFLOW/:code`

No workflow-specific React component or entity-specific builder is created.

## 2. Load Metadata Workflow

- The builder renders `WorkflowDefinition.states` as generic `StateNode` components.
- The builder renders `WorkflowDefinition.transitions` as generic `TransitionEdge` components.
- State positions are visual canvas state only; workflow metadata remains the source of truth.

## 3. Add State

- Click `Add State`.
- Studio creates or reuses a Designer draft:
  - `POST /api/designer/drafts`
  - target type: `WORKFLOW`
- Studio applies:
  - `POST /api/designer/:draftId/operations`
  - operation: `ADD_STATE`

The state metadata includes only generic properties: `code`, `label`, `type`, and optional `colorToken`.

## 4. Connect Transition

- Select a source state.
- Click `Connect Transition`.
- Studio applies:
  - operation: `ADD_TRANSITION`

The transition metadata includes only generic properties: `from`, `to`, `actionCode`, `condition`, `securityPolicy`, and `processBinding`.

## 5. Simulation Success

- `WorkflowSimulator` calls:
  - `POST /api/simulation/run`
- Inputs:
  - current state
  - action code
- Outputs displayed:
  - success
  - next state
  - process executed
  - event generated
  - ledger impact
  - runtime trace stages: `SECURITY`, `WORKFLOW`, `PROCESS`, `EVENT`

## 6. Publish

- Click `Preview`.
- Studio calls:
  - `POST /api/designer/:draftId/preview`
- Validation and dependency impacts are shown before publish.
- Click `Publish`.
- Studio calls:
  - `POST /api/designer/:draftId/publish`

## 7. Runtime Uses New Workflow

- Published workflow metadata is saved by Designer Engine.
- Runtime execution continues to use Workflow Engine resolution from metadata.
- No direct metadata updates are performed by the UI.

## Validation Display

The builder preview can surface Workflow ValidationEngine issues including:

- `STATE_NOT_FOUND`
- `INVALID_TRANSITION`
- `MISSING_ACTION`
- `CIRCULAR_FLOW`

## Dependency Impact Display

Before removing a state, the builder calls:

- `GET /api/dependencies/WORKFLOW/:code`

The UI highlights affected areas:

- Process
- Event
- Security
- UI
- Forms

## Forbidden Architecture Proof

- No entity-specific workflow code is introduced.
- No state, transition, approval, or entity behavior is hardcoded.
- All changes route through Designer API workflow draft operations.
