# REDI-OS UI/UX Design Standards

Version: 1.0  
Status: **Mandatory** for all designers, frontend engineers, and AI agents building pages/forms  
Companion: `/README.md` §15A · `docs/handbook/` (operational context)

---

## 1. Golden rules

| Rule | Do | Don't |
| --- | --- | --- |
| **UI = aksi** | Label singkat, tombol jelas, 1 primary action per view | Paragraf penjelasan panjang di form |
| **Handbook = konteks** | Link "Learn more" → `docs/handbook/` | Duplikasi handbook di placeholder/help text |
| **Persona-first** | Layout dari workspace persona | Menu CRUD generik sama untuk semua role |
| **Inbox-first** | Task/approval muncul di universal inbox | Halaman approval terpisah per modul |
| **Progressive disclosure** | Section collapsible, advanced di panel | 20 field sekaligus tanpa grouping |
| **Consistent tokens** | CSS vars `--redios-*` / `--redos-builder-*` | Warna/spacing ad-hoc per page |
| **Metadata-bound** | Field dari data object binding | Hardcode field name di komponen |

---

## 2. Page types & layout

### 2.1 Workspace (`/workspace`)

**User goal:** Lihat pekerjaan hari ini, selesaikan task, navigasi cepat.

```
┌─────────────────────────────────────────────┐
│ Header: persona label + notifications badge │
├──────────────┬──────────────────────────────┤
│ Inbox        │ Actions / Links / Metrics    │
│ (priority)   │ (secondary panels)           │
└──────────────┴──────────────────────────────┘
```

- Inbox **kiri atau atas** — highest priority
- Max **6 panel** visible tanpa scroll (desktop)
- Primary CTA per inbox row: **Complete** / **Open** — satu verb
- Empty state: `"No tasks waiting"` + link ke handbook — bukan essay

### 2.2 Runtime (`/runtime/{entity}`)

**User goal:** Lihat/edit dokumen, jalankan action workflow.

```
┌─────────────────────────────────────────────┐
│ ← Back to workspace    [PRIMARY ACTION]     │
├─────────────────────────────────────────────┤
│ Status badge + title                          │
├─────────────────────────────────────────────┤
│ Form sections (max 8 fields visible fold)     │
├─────────────────────────────────────────────┤
│ Secondary actions (ghost/outline)             │
└─────────────────────────────────────────────┘
```

- **Satu primary action** sesuai workflow state (START, COMPLETE, SUBMIT)
- Destructive actions (CANCEL, DELETE): warn color + confirm
- Field readonly sesuai security policy — jangan tampilkan lalu error di submit

### 2.3 Studio designer (`/studio/metadata/*`)

**User goal:** Desain metadata tanpa coding.

```
┌──────────┬────────────────────┬─────────────┐
│ Section  │ Main editor        │ Help tip    │
│ nav      │ (form/canvas)      │ (1 line)    │
└──────────┴────────────────────┴─────────────┘
```

- Overview page: **card grid** — title + 1 line description + Open
- Designer page: **no intro paragraph > 2 lines** — detail di handbook
- `HelpTip` component: max **120 karakter** — link ke handbook chapter
- Save/Publish: sticky footer kanan bawah

### 2.4 Auth (`/login`, `/register`)

- Logo + title + form + 1 secondary link
- No marketing copy > 3 lines
- Error inline di field — bukan modal

---

## 3. Form design standards

### 3.1 Field layout

| Rule | Value |
| --- | --- |
| Max fields per section (fold) | **8** |
| Label | Noun phrase, Title Case — `"Work Order Title"` |
| Placeholder | Example value — `"e.g. Pump repair line A"` |
| Required indicator | `*` + `aria-required` |
| Field width | Full width mobile; 2-col desktop untuk field pendek |
| Section gap | `--redios-spacing-lg` |

### 3.2 Field order (default)

1. Identifier / title
2. Status (readonly badge if not editable)
3. Core business fields (amount, date, assignee)
4. Reference / lookup
5. Description / notes (textarea last)

### 3.3 Actions

| Type | Style | Position |
| --- | --- | --- |
| Primary | Filled gradient (`--redos-builder-button-bg`) | Bottom-right or header right |
| Secondary | Outline | Left of primary |
| Destructive | Danger color | Separated — never adjacent to primary |

### 3.4 Validation UX

- Validate on blur + on submit — not on every keystroke
- Error message: `"Title is required"` — specific, under field
- Success: toast 3s or inline status — no blocking modal

---

## 4. Component hierarchy

Use existing layers — **do not invent one-off components**:

```
atoms/     → Button, Input, Badge, Label
molecules/ → FormField, ActionBar, InboxRow
organisms/ → RuntimeForm, WorkspacePanel, MetadataSectionCard
templates/ → StudioLayout, ExperienceShell
```

New reusable block → **Custom Organism** metadata (`/studio/metadata/organisms`) before hardcoding in page.

---

## 5. Design tokens (mandatory)

From `apps/web/src/styles.css`:

| Token | Usage |
| --- | --- |
| `--redios-color-primary` | Primary actions, links |
| `--redios-color-danger` | Delete, cancel destructive |
| `--redios-color-success` | Done, approved states |
| `--redios-color-muted` | Helper text, timestamps |
| `--redios-spacing-md/lg` | Section padding |
| `--redios-radius-medium` | Cards, inputs |
| `--redios-font-family` | All UI text |

Dark mode: defer to theme metadata (Phase 4) — don't ship per-page dark styles.

---

## 6. Copy & microcopy

| Context | Max length | Example |
| --- | --- | --- |
| Page title | 4 words | `"Purchase Requests"` |
| Panel label | 3 words | `"Universal Inbox"` |
| Button | 2 words | `"Start Work"` |
| HelpTip | 120 chars | `"Defines approval steps. See handbook §5."` |
| Empty state | 1 sentence + action | `"No open tasks." [Refresh]` |

**Language:** UI English for platform chrome; entity labels from metadata `label` field.

---

## 7. Mobile / field workspace

- Touch target min **44px** height
- Primary action **sticky bottom** bar
- Max **5 inbox items** above fold
- No horizontal scroll on forms

---

## 8. Designer checklist (before merge)

```
[ ] Page type matches template (workspace / runtime / studio / auth)
[ ] One primary action visible without scroll
[ ] No paragraph > 2 lines on designer pages
[ ] All fields bound to metadata data object (no hardcoded names)
[ ] Help text uses HelpTip → handbook, not inline essay
[ ] Uses design tokens (no raw #hex except tokens file)
[ ] Empty + loading + error states defined
[ ] Persona capability gate applied (studio panels)
[ ] Tested at 375px and 1280px width
```

---

## 9. Anti-patterns (caused past revisions)

| Anti-pattern | Why bad | Fix |
| --- | --- | --- |
| Long help paragraph in form header | UI clutter, untranslatable | Move to handbook |
| Menu-per-module navigation | Violates experience philosophy | Workspace panel LINK |
| Approval page per entity | Duplicate inbox pattern | TunasFlow → human task |
| 15 fields no sections | Cognitive overload | Group into sections |
| Custom colors per designer page | Visual inconsistency | Tokens only |
| "Click here to learn about X" blocks | Repeated across pages | Single handbook chapter |
| Hardcoded WORK_ORDER UI | Not scalable | Metadata-driven runtime |

---

## 10. References

- `/README.md` §15, §15A
- `docs/handbook/01_HOW_REDI_WORKS.md` §11 (UI vs handbook)
- `apps/web/src/styles.css` — token source
- `apps/web/src/studio/guide/AdminGuide.tsx` — HelpTip pattern
