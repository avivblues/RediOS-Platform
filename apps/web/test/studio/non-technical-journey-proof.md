# RediOS Studio Non-Technical Journey Proof

## Scenario

User: warehouse employee

Starting knowledge:

- No database knowledge
- No coding knowledge
- No API knowledge
- No metadata knowledge

## Expected Journey

1. Open `http://localhost:3000/studio`.
2. Studio Home shows "Apa yang ingin kamu buat?" with guided starter cards.
3. Select `Manage Inventory`.
4. RediOS opens the guided application lifecycle journey.
5. Create application: `Inventory App`.
6. Create first Data Object: `Product`.
7. Add information:
   - Name
   - Price
   - Stock
8. Design Screen.
9. Review application preview:
   - Menu: Inventory
   - Screen: Product List
   - Button: + Add Product
10. Launch Application.
11. Launch progress shows:
   - Preparing application...
   - Checking data
   - Creating screens
   - Activating version
12. Completion shows: "Your application is ready".
13. Click `Open Application`.
14. Generated runtime app opens at `/apps/{applicationCode}`.
15. User can add a Product record from the generated screen.

## UX Proof

- Home no longer starts from builder/tool categories.
- Application pages show lifecycle progress and required checklist items.
- Every required lifecycle item opens the correct builder.
- Right-side assistant tells the user what to do next.
- Create and edit flows share the same `MetadataEditor` renderer.
- Simple Mode uses business language and hides technical implementation details.
- Preview is visual and does not expose raw JSON.

## Forbidden Simple Mode Words

The following words are reserved for Expert Mode or source code only:

- Entity
- Field
- Metadata
- Runtime Package
- Compiler
- Schema
- JSON

## Validation

Run:

```bash
npm run typecheck
npm run build
```
