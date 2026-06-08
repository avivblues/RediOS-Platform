# RediOS Studio Business User Flow Proof

## Goal

Validate that Simple Mode feels like building a real business application screen, not editing developer definitions.

## Scenario

New user creates an Inventory App without seeing developer workflow or technical metadata terms.

## Steps

1. Open Studio in Simple Mode.
2. Create application: `Inventory App`.
3. Create Data Object: `Product`.
4. Confirm the next step is `Screen Design`.
5. Confirm there is no separate Field or Form step in the visible stepper.
6. On the Product Screen, click `+ Add Information`.
7. Add `Name` with type `Text`, then click `CREATE`.
8. Add `Price` with type `Number`, then click `CREATE`.
9. Confirm both items appear immediately on the Product Screen canvas with labels and input boxes.
10. Drag or reorder `Price` and `Name`.
11. Click `Price` on the canvas.
12. Confirm the right drawer opens with `Information Settings`.
13. Set behavior:
    - `Must be filled`
    - `Show on list`
    - `Searchable`
14. Set layout to `Full row` or `Half row`.
15. Continue to `Workflow`.
16. Launch the application.
17. Open the launched Inventory App.
18. Input a Product record with `Name` and `Price`.

## Pass Criteria

- Simple Mode flow is `Application -> Data Object -> Screen Design -> Workflow -> Launch`.
- Field creation happens only from `+ Add Information` inside Screen Designer.
- The canvas uses a real screen preview layout, not a left/center/right developer layout.
- Clicking any canvas information opens the properties drawer and allows editing.
- Launch generates the required runtime definitions behind the scenes.
- User never sees these words in Simple Mode:
  - `Entity`
  - `Field`
  - `Form`
  - `Metadata`
  - `JSON`

## Validation

```bash
npm run typecheck
npm run build
```
