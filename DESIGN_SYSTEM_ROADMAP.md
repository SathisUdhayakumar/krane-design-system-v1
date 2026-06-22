# Krane Design System — Roadmap

Generated from the current state of the codebase. Companion to `DESIGN_SYSTEM_STATUS.md` — that document describes what exists today in depth; this one is forward-looking: what's done, what's half-done, and in what order the rest should get built.

---

# Completed

**Token layer**
- Brand (`--primary`, `--ring`, `--sidebar-ring`)
- Status — success / warning / destructive / info / pending, each with `base` / `-foreground` / `-text` roles
- Risk — low / medium / high / critical, same 3-role shape
- Chart — 5 hues, hue-mapped to avoid collisions with every other family
- Elevation — `--shadow-sm/md/lg`, mode-aware (dark-mode opacity 4–5× light-mode)
- Shell — `--sidebar`, `--sidebar-foreground`, `--sidebar-border`, `--sidebar-accent(-foreground)`, `--badge-new(-foreground)`
- Theme architecture (the `:root`/`.dark` + `@theme inline` two-layer mechanism) — fully wired for every token above

**Components**
- Button
- Badge
- RiskIndicator
- Checkbox
- Popover
- DropdownMenu (items, checkbox items, radio items, labels, separators, nested submenus)
- Dialog
- Tooltip (+ root `TooltipProvider`)
- Toast + Toaster + `useToast()` store
- Skeleton
- Table (`Table`, `TableHeader/Body/Footer/Row/Head/Cell/Caption`)
- AppShell, AppHeader, Sidebar (`SidebarGroup/SectionLabel/Item/Badge/Footer`), OrganizationSwitcher, ProjectSwitcher

**Infrastructure**
- TanStack Table integration (DataTable's engine)
- Radix Collapsible integration (sidebar group collapse)
- `hooks/` directory + the `@/hooks` alias (first real use: `use-toast.ts`)
- `components/shell/` as a distinct namespace from `components/ui/`

---

# In Progress

Built and usable, but with explicit, known holes — not safe to call "done":

- **DataTable** — sorting, column visibility, row selection, bulk actions, global search, empty/loading states all work. Missing: pagination (explicitly deferred), a row-actions column, virtualization, status/risk-aware sort comparators (currently sorts those columns lexicographically by variant string), CSV export. Sortable-header rendering is inlined rather than factored into its own component.
- **App Shell** — matches the reference layout, collapse/expand works, nav hierarchy is real. Missing: any responsive/mobile behavior (explicitly out of scope so far, not just forgotten), functional avatar/help/notification-bell menus (all visually present, none wired), working language selector (real dropdown, no i18n behind it), and a way to actually reach dark mode through the UI.
- **Dark mode / theming** — every token has a dark value and the `.dark` class mechanism works, but nothing in the app sets that class. The token layer is complete; the activation layer doesn't exist.

---

# Next Components

In priority order, reasoning included since "priority" isn't self-evident from a list:

1. **Theme switcher** — not really a "component" so much as a small toggle (Button or DropdownMenu, both already built) plus a tiny class-toggle/localStorage hook. Highest leverage-to-effort ratio of anything remaining: the entire dark-mode token layer is sitting finished and unreachable.
2. **Input** — the single biggest functional gap. Every form-shaped demo so far (Dialog's vendor-creation example, DataTable's search box) hand-styles a raw `<input>` inline because there's no real component. Blocks any real CRUD screen.
3. **Textarea** — same gap, same shape, trivial once Input exists.
4. **Select** — needed for anything with a fixed option set (status pickers, category pickers). Radix `Select` is already in the installed `radix-ui` bundle — no new dependency, same situation Checkbox/Popover/Dialog were in before they were built.
5. **RadioGroup**, **Switch** — also already available in the installed `radix-ui` bundle, smaller scope than Select, natural to batch with it.
6. **Alert / Banner** — flagged as missing since the very first component audit. Cheap relative to its value: fully reuses the status token family, no new dependency, no new design decision required.
7. **Avatar** — currently just a styled `<span>` inline in the Shell. Low cost, immediately reusable by `AppHeader`.
8. **DataTable: Pagination** — the explicitly-deferred piece from DataTable v1, an alternative footer to "Load more."
9. **DataTable: row-actions column + `DataTableColumnHeader` extraction** — both were scoped in the original DataTable architecture proposal; DropdownMenu (their dependency) didn't exist yet at the time, it does now.

---

# Future Components

Lower priority — not blocking any currently-demonstrated use case:

- **Tabs**, **Breadcrumb**, **Card**, **Progress** — general chrome, independent of each other, no current consumer.
- **Stepper / Wizard** — more complex than the above, and there's no real multi-step flow anywhere yet to motivate its exact shape.
- **DataTable virtualization** (`@tanstack/react-virtual`) — only matters once real data volumes exceed what renders comfortably unvirtualized; would be the first *new npm dependency* added since `@tanstack/react-table` itself.
- **Mobile/responsive shell behavior** — explicitly excluded from the App Shell's scope so far, not an oversight.
- **Notification panel content**, **account menu content**, **i18n wiring** — these are product features wearing design-system clothing (the bell/avatar/language *components* exist, the *behavior* behind them is application logic, not a missing primitive).
- **CSV/export affordance** on DataTable.
- **Automated visual regression / test suite** — every verification in this project to date has been manual (build, TypeScript, curl, DOM-structure checks, a manual open-in-browser ask) — there is no automated guard against regressions.

---

# Dependencies

```
Theme switcher        → Button or DropdownMenu (done), .dark mechanism (done)
Input                 → (no dependency — currently the blocking leaf)
Textarea               → Input (shares styling conventions, no hard import dependency)
Select                 → Radix Select (already installed, unused)
RadioGroup, Switch      → Radix RadioGroup/Switch (already installed, unused)
Alert                   → status tokens (done) — no component dependency
Avatar                  → (no dependency) — consumed by AppHeader once it exists
DataTable Pagination    → Button (done), DataTable (done)
DataTable RowActions    → DropdownMenu (done), Button (done)
DataTableColumnHeader   → extracted from DataTable's existing inline logic, no new dependency
Tabs, Breadcrumb, Card, Progress → independent of each other and of everything above
Stepper                 → conceptually benefits from Progress existing first, not a hard blocker
DataTable virtualization → new dependency: @tanstack/react-virtual (not installed)
Mobile shell behavior   → modifies AppShell/Sidebar directly, not a new component
Notification/account menu content → DropdownMenu (done) + Avatar (not done) + Bell trigger (exists, unwired)
```

Nothing in **Next Components** requires a new npm package — Select/RadioGroup/Switch are sitting in the already-installed `radix-ui` bundle, exactly like Checkbox/Popover/Dialog/Tooltip/Toast were before each was built. The first genuinely new dependency on the horizon is `@tanstack/react-virtual`, and only once virtualization is actually prioritized.

---

# Recommended Build Order

1. **Theme switcher** — smallest possible task, makes the entire dark-mode investment actually reachable. Do this first because it's nearly free and currently the single most "finished but invisible" piece of the system.
2. **Input → Textarea → Select → RadioGroup → Switch** — in this order specifically: Input unblocks the most (every future form), Textarea is nearly free once Input's conventions are settled, Select/RadioGroup/Switch can follow as a batch since they share the "wrap an already-installed Radix primitive" pattern this project has repeated seven times now (Checkbox, Popover, DropdownMenu, Dialog, Tooltip, Toast, Collapsible).
3. **Alert** — cheapest high-value item left after forms; do it before anything else because it's a pure reuse of work already paid for (status tokens), with no new design decisions to make.
4. **Avatar** — small, and finishing it lets the Shell's header stop using a placeholder span, tightening up an "in progress" item without much effort.
5. **DataTable: Pagination, then RowActions/ColumnHeader extraction** — both close out the explicit gaps in DataTable v1 (§ In Progress); RowActions specifically was always meant to follow DropdownMenu, which is now available, so this is the moment that dependency resolves.
6. **Tabs, Breadcrumb, Card, Progress** — pick up only once a real module surfaces a concrete need for one of them; building general chrome speculatively, ahead of an actual consumer, is how the rest of this system ended up over-scoped before (every component so far was built against a stated, specific requirement, not "because a design system should have one").
7. **Stepper, DataTable virtualization, mobile/responsive shell, CSV export, notification/account menu content, i18n** — defer as a group until a real Krane module's actual requirements force the question, since right now there is no concrete spec for any of them (unlike everything in steps 1–6, which all trace back to an explicit, already-identified gap).

Do not implement anything from this list without a fresh, explicit go-ahead — this document is a sequencing recommendation, not a standing work order.
