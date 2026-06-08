# RediOS Studio Unified No-Code Builder Proof

## Goal

Business user understands:

> I add information, and it appears on my screen.

## Scenario

User: non-developer warehouse employee

No required knowledge:

- JSON
- database
- API
- developer tooling
- metadata terms

## Steps

1. Open `http://localhost:3000/studio`.
2. Choose `Manage Inventory`.
3. Create application: `Inventory App`.
4. Create Data Object: `Product`.
5. Open `Design Screen`.
6. Click `+ Add Information` inside the designer.
7. Add:
   - Name, type Text
   - Price, type Number
   - Stock, type Number
8. Confirm each information item appears immediately on the Product Screen canvas.
9. Rearrange fields so Stock appears above Price.
10. Select Stock and change properties:
    - Required ON
    - Visible ON
    - List Screen ON
11. Preview generated app before launch:
    - Inventory App
    - Product List
    - Product Screen
    - Product menu
    - Product Information
12. Click `Open Preview App`.
13. Launch Application.
14. Open generated app.
15. Create Product record.

## Pass Criteria

- Simple Mode flow is Application -> Data Object -> Design Screen -> Workflow -> Launch.
- There is no separate Field step for business users.
- `+ Add Information` creates information and places it on the screen immediately.
- Canvas looks like a real app form, not metadata blocks.
- Desktop, Tablet, and Mobile preview are available.
- Runtime definitions are still generated behind the scenes.
- No JSON is visible in Simple Mode.
- No metadata terms are required to complete the journey.

## Validation

```bash
npm run typecheck
npm run build
```
