# Runtime Package Performance Proof

Phase 19.3 introduces a metadata compiler that turns validated metadata into an optimized runtime package.

## Before

Runtime execution resolved metadata dynamically:

- request enters Runtime Executor
- metadata resolvers load definitions
- arrays are scanned with `.find(...)`
- workflow transitions are searched from `transitions[]`
- event integrations require metadata scans
- renderer metadata is composed from source metadata each time

Lookup shape: dynamic metadata resolution and array scans.

## After

Publishing or compiling metadata creates a `RUNTIME_PACKAGE` metadata definition.

Compiled package content contains maps:

- `entities[code]`
- `actions[entityCode:actionCode]`
- `fields[entityCode:fieldCode]`
- `workflows[entityCode].statesByCode`
- `workflows[entityCode].transitionMap`
- `forms[entityCode:formCode]`
- `ui[kind:code]`
- `securityPolicies[code]`
- `eventIntegrationMap[eventCode]`

Workflow transition lookup example:

```json
{
  "OPEN.START": {
    "next": "IN_PROGRESS",
    "transitionCode": "START",
    "actionCode": "START"
  }
}
```

Lookup shape: compiled map lookup, prepared for `O(1)` runtime paths.

## Scope Control

- The compiler stores metadata packages only.
- It does not cache business documents.
- It does not cache transaction state.
- Runtime falls back to metadata resolvers when no active package exists.

## Version Strategy

- Only one package can be `ACTIVE`.
- Older packages are marked `EXPIRED`.
- Package `metadataVersion` matches its metadata definition version.
- Designer publish and rollback both compile a fresh active package.
