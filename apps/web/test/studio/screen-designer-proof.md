# Studio Visual Screen Designer Proof

## Scenario

User creates an Inventory application without writing code.

## Steps

1. Open `http://localhost:3000/studio`.
2. Choose `Manage Inventory`.
3. Create app: `Inventory App`.
4. Create Data Object: `Product`.
5. Add information:
   - Name
   - Price
   - Stock
6. Open `Screen Design`.
7. Use visual designer:
   - Left panel shows Components: Text Input, Number, Date, Dropdown, Table, Button, Section, Tabs.
   - Center canvas shows Product Screen and sections.
   - Right panel shows properties: Label, Required, Readonly, Width, Visibility.
8. Move `Stock` above `Price`.
9. Click `Auto Design`.
10. Preview `Mobile`.
11. Click `Use This Design`.
12. Launch Application.
13. Expected launch progress:
   - Preparing application...
   - Checking data
   - Creating screens
   - Activating version
14. Expected success:
   - Application Ready 🚀
   - Open Application
   - Continue Editing
15. Click `Open Application`.
16. Generated runtime app opens.
17. Create Product record from the generated screen.

## Metadata Proof

The visual designer updates generated metadata:

- `FORM` metadata uses visual screen sections and field order.
- `UI` metadata includes screen composition through molecules and organisms.
- `PAGE` behavior is represented by existing `UI` page metadata.
- `NAVIGATION` points to the generated page.
- Runtime compiler activates an `ACTIVE` published version after launch.

## Publish Contract Proof

Generated publish sends:

- APPLICATION
- ENTITY
- FIELD
- FORM
- VIEW
- UI PAGE / UI COMPOSITION
- NAVIGATION
- Optional relation metadata for lookup information

The request body remains:

```json
{
  "metadata": []
}
```

## Validation

Run:

```bash
npm run typecheck
npm run build
```
