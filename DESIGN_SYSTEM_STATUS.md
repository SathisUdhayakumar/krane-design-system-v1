# Krane Design System — Status

Generated from the current state of the codebase (`app/globals.css`, `components/ui/`, `components/shell/`, `hooks/`, `app/demo/*`). Not a roadmap document — everything below either exists in the repo today or is explicitly marked as missing.

---

## 1. Design tokens implemented

All colors are OKLCH. Every family follows the same two-layer pattern: a raw, mode-dependent custom property (e.g. `--primary`) defined in `:root`/`.dark`, registered once under a stable Tailwind-facing name in `@theme inline` (e.g. `--color-primary: var(--primary)`). This is what lets `bg-primary` resolve differently per theme without `@theme inline` itself needing two definitions.

### Brand
| Token | Light | Dark |
|---|---|---|
| `--primary` / `--primary-foreground` | `oklch(0.883 0.181 94.426)` (Krane Yellow) / `oklch(0.145 0 0)` | identical |
| `--ring` | `oklch(0.550 0.112 94.426)` — darkened for contrast on white | `oklch(0.883 0.181 94.426)` — full brightness on near-black |

### Status (5 families: success, warning, destructive, info, pending)
Each has `base`, `-foreground` (near-black/white, for solid fills), and `-text` (a darker same-hue shade for use as text on light surfaces — added because the base tokens fail WCAG AA as direct text color).

| Family | Light base | Light text | Dark base/text |
|---|---|---|---|
| success | `oklch(0.627 0.170 149.214)` | `oklch(0.500 0.140 149.214)` | `oklch(0.720 0.150 149.214)` (both roles) |
| warning | `oklch(0.660 0.150 63.000)` | `oklch(0.460 0.106 63.000)` | `oklch(0.750 0.130 63.000)` |
| destructive | `oklch(0.577 0.245 27.325)` | *(none needed — base passes AA directly, 4.77:1)* | `oklch(0.704 0.191 22.216)` |
| info | `oklch(0.588 0.139 241.966)` | `oklch(0.500 0.118 241.966)` | `oklch(0.700 0.120 241.966)` |
| pending | `oklch(0.606 0.219 292.717)` | `oklch(0.500 0.220 292.717)` | `oklch(0.720 0.160 292.717)` |

### Risk (4 tiers: low, medium, high, critical)
Same 3-role shape as status (`base`/`-foreground`/`-text`), deliberately kept in the conventional green→amber→orange→red zone — the Status/Risk visual collision this caused (Warning vs. Risk-Medium/High reading as the same color in dense tables) was resolved by **changing RiskIndicator's form**, not its palette (outlined chip + dot meter vs. Badge's solid pill), so the hues stayed put.

| Tier | Light base | Dark base |
|---|---|---|
| low | `oklch(0.780 0.160 149.000)` | `oklch(0.800 0.150 149.000)` |
| medium | `oklch(0.800 0.150 77.000)` | `oklch(0.820 0.140 77.000)` |
| high | `oklch(0.680 0.174 52.000)` | `oklch(0.740 0.160 52.000)` |
| critical | `oklch(0.550 0.220 25.000)` | `oklch(0.680 0.190 25.000)` |

### Chart (5 hues, identical in both modes)
`--chart-1..5`: blue `262.881`, teal `184.704`, indigo `277.117`, slate `257.417`, orange `41.116` — chosen to avoid hue collisions with brand/status/risk (full hue map was computed and gap-checked during implementation).

### Elevation (added when no shadow tokens existed at all)
`--shadow-sm/md/lg` (Tailwind-facing) map to `--elevation-sm/md/lg` (raw, mode-dependent — dark-mode opacity is 4–5× higher than light-mode, since a low-alpha black shadow barely registers against an already-dark background).

| Tier | Used by |
|---|---|
| sm | Tooltip, sticky table header |
| md | Popover, DropdownMenu |
| lg | Dialog, Side panel |

### Shell (Krane-navy app shell — fixed values, identical in both modes, not theme-responsive)
Repurposed the pre-existing, previously-unused `--sidebar*` token family rather than minting parallel names:

| Token | Value | Role |
|---|---|---|
| `--sidebar` | `oklch(0.277 0.078 263.159)` = `#13264E` | Sidebar + header background |
| `--sidebar-foreground` | `oklch(0.721 0.037 265.891)` | Inactive nav text (6.0:1 against `#13264E`) |
| `--sidebar-border` | `oklch(0.394 0.042 264.691)` = `#3B465D` | Dividers |
| `--sidebar-accent` | `oklch(1 0 0 / 12%)` | Translucent white — active/hover nav row, header chip backgrounds |
| `--sidebar-accent-foreground` | `oklch(0.985 0 0)` | Active nav text |
| `--sidebar-ring` | `oklch(0.883 0.181 94.426)` | Focus ring on sidebar/header elements (full-brightness yellow — same value dark mode already proved out) |
| `--badge-new` / `-foreground` | `oklch(0.723 0.192 149.579)` / `oklch(0.145 0 0)` | "NEW" nav badge |

`--sidebar-primary`/`--sidebar-primary-foreground` exist (unchanged from original scaffold) but have no current consumer.

---

## 2. Theme architecture

- **Tailwind v4, CSS-native** — no `tailwind.config.ts`. All theme registration happens in `app/globals.css` via `@theme inline`.
- **Two-layer token pattern** (see §1) is the load-bearing convention of the whole system — every new token family added since the first commit followed it, including the shell tokens.
- **Light/dark via `.dark` class**, not `prefers-color-scheme` — `@custom-variant dark (&:is(.dark *))`. Nothing currently toggles this class; no theme switcher exists yet (see §9).
- **Deliberate exceptions to theme-responsiveness**: the shell (`--sidebar*`, `--badge-new*`) and a few literal values (`bg-black/50` Dialog overlay, `bg-white` shell content panel) are intentionally fixed across both modes — they're brand/structural constants, not things that should follow the app's theme toggle.
- **shadcn's own base layer** (`shadcn/tailwind.css`, imported in `globals.css`) supplies the `data-open`/`data-closed`/`data-checked`/`data-unchecked`/`data-disabled`/`data-selected`/`data-active` custom variants used throughout — these map directly to Radix's `data-state` attributes and were discovered/inventoried in the very first audit of this project, then actually used starting with Checkbox.
- **`tw-animate-css`** supplies `animate-in/out`, `fade-*`, `zoom-*`, `slide-in-from-*`, and the `--animate-collapsible-down/up` keyframes — also inventoried early, first consumed by Popover and finally exercised by the App Shell's collapsible nav groups.

---

## 3. App Shell architecture

```
AppShell (h-screen flex-col, owns collapse state via React Context — useShell())
├─ header (h-16 = 64px)
│   └─ AppHeader (bg-sidebar) — logo+toggle | OrganizationSwitcher → chevron → ProjectSwitcher | …gap… | rightActions slot
└─ body (flex-1, flex-row, bg-sidebar)
    ├─ Sidebar (shrink-0, width 194px↔64px via inline style + transition)
    │   ├─ scrollable nav region — SidebarGroup × N + standalone SidebarItem + dividers
    │   └─ SidebarFooter (shrink-0, border-t) — pinned, outside the scroll region
    └─ gutter wrapper (flex-1, p-2 = 8px on all sides, overflow-hidden)
        └─ <main> (h-full, overflow-y-auto, rounded-md, bg-white) — the actual content panel
```

- **Collapse state** lives in `AppShell`, exposed via `useShell()` — `AppHeader` (toggle button) and every `Sidebar`/`SidebarItem`/`SidebarGroup` read it directly rather than having it prop-drilled, since header and sidebar are siblings.
- **`SidebarGroup` collapse is independent per-group**, built on Radix `Collapsible` (uncontrolled, `defaultOpen=true`), separate from the sidebar's own icon-rail collapse. When the sidebar itself is in icon-rail mode, `SidebarGroup` bypasses `Collapsible` entirely (no room for a clickable label), so the two collapse mechanisms never fight each other.
- **`SidebarItem` auto-wraps itself in `Tooltip`** when the sidebar is in icon-rail mode, so the accessible label doesn't disappear along with the visual text.
- **The framed content panel** (8px gutter, `rounded-md`, `bg-white`) is a deliberate visual refinement added after the initial shell build — the dark `bg-sidebar` on the body row is what shows through the gutter on all four sides.

---

## 4. Component inventory

| Component | Location | Depends on |
|---|---|---|
| Button | `components/ui/button.tsx` | — |
| Badge | `components/ui/badge.tsx` | status tokens |
| RiskIndicator | `components/ui/risk-indicator.tsx` | risk tokens |
| Checkbox | `components/ui/checkbox.tsx` | Radix Checkbox |
| Popover | `components/ui/popover.tsx` | Radix Popover |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | Radix DropdownMenu |
| Dialog | `components/ui/dialog.tsx` | Radix Dialog |
| Tooltip | `components/ui/tooltip.tsx` | Radix Tooltip |
| Toast + Toaster | `components/ui/toast.tsx`, `toaster.tsx` | Radix Toast, `hooks/use-toast.ts` |
| Skeleton | `components/ui/skeleton.tsx` | — |
| Table (8 primitives) | `components/ui/table.tsx` | — |
| DataTable | `components/ui/data-table.tsx` | TanStack Table, Table, Checkbox, DropdownMenu, Button, Skeleton |
| AppShell | `components/shell/app-shell.tsx` | — |
| AppHeader | `components/shell/app-header.tsx` | Button, useShell |
| Sidebar (6 primitives) | `components/shell/sidebar.tsx` | Radix Collapsible, Tooltip, useShell |
| OrganizationSwitcher | `components/shell/organization-switcher.tsx` | DropdownMenu |
| ProjectSwitcher | `components/shell/project-switcher.tsx` | DropdownMenu |

**10 demo routes** exist under `/demo/*`: the original status/risk demo (`/demo`), `checkbox`, `popover`, `dropdown-menu`, `dialog`, `toast`, `tooltip`, `table`, `data-table`, `app-shell`.

**Maturity**: Button/Badge/RiskIndicator/Table are the most settled (no changes since their last hardening pass). DataTable and the Shell are v1 — functionally complete against what was specified, but the most likely to need revision once a real consuming module exists.

---

## 5. Component APIs

Abbreviated to the props that matter for usage — full signatures are in each file.

- **Button** — `variant`: default/outline/secondary/ghost/destructive/link · `size`: default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg · `asChild`.
- **Badge** — `variant`: default/success/warning/destructive/info/pending · `asChild`.
- **RiskIndicator** — `level`: low/medium/high/critical · `label?` (override text — not validated against `level`, a known gap, see §9).
- **Checkbox** — `checked`: `boolean | "indeterminate"` · `onCheckedChange` · `disabled` · `aria-invalid`.
- **Popover / PopoverTrigger / PopoverContent / PopoverAnchor / PopoverClose** — `side`/`align`/`sideOffset` on Content.
- **DropdownMenu** family — `DropdownMenuItem` (`variant`: default/destructive), `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`/`Item`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSub`/`SubTrigger`/`SubContent`.
- **Dialog / DialogTrigger / DialogContent (`showCloseButton`) / DialogHeader / DialogTitle / DialogDescription / DialogFooter / DialogClose**.
- **Tooltip / TooltipProvider (`delayDuration`) / TooltipTrigger / TooltipContent**.
- **Toast** (`ToastProvider`/`Viewport`/`Toast`/`Title`/`Description`/`Close`) + **`useToast()`/`toast(props)`** from `hooks/use-toast.ts` — `variant`: default/success/warning/destructive/info.
- **Table** — `Table` (`density`: compact/comfortable), `TableHeader`/`Body`/`Footer`/`Row`/`Head` (`scope` defaults to `"col"`, overridable)/`Cell`/`Caption`.
- **DataTable** — `columns`, `data`, `getRowId?`, `density?`, `enableRowSelection?`, `bulkActions?: DataTableBulkAction<T>[]`, `enableGlobalFilter?`, `globalFilter?`/`onGlobalFilterChange?` (controlled), `isLoading?`, `loadingRowCount?`, `emptyState?`, `manualSorting?`/`manualFiltering?`, `sorting?`/`onSortingChange?` (controlled), `hasNextPage?`/`isFetchingNextPage?`/`onLoadMore?`. Sub-exports: `DataTableToolbar`, `DataTableColumnVisibility`, `DataTableBulkActions`, `DataTableEmptyState`.
- **AppShell** — `header`, `sidebar`, `children`, `collapsed?`/`onCollapsedChange?`/`defaultCollapsed?`.
- **AppHeader** — `organizationSwitcher?`, `projectSwitcher?`, `rightActions?`.
- **Sidebar** — `children`, `footer?`. **SidebarGroup** — `label`, `defaultOpen?`. **SidebarItem** — `icon`, `active?`, `badge?`, `asChild?`. **SidebarBadge** — `variant`: count/new. **SidebarSectionLabel**, **SidebarFooter**.
- **OrganizationSwitcher** / **ProjectSwitcher** — `organizations`/`projects: {id,label}[]`, `value`, `onValueChange?`.

---

## 6. Design decisions made

- **Status = operational state, Risk = severity, distinguished by component *form*, not color.** Badge is always a solid pill; RiskIndicator is always an outlined chip + dot meter. This was the resolution to a real, demonstrated problem (Warning and Risk-Medium/High read as the same color in a dense table) — fixing it by relocating hues was tried and rejected (see §7).
- **`-text` token role exists because base tokens are fill-tuned, not text-tuned.** Discovered when RiskIndicator's label text (using the base risk color) failed contrast against its own background; generalized to all 4 status families pre-emptively rather than waiting to hit the same bug again (which Toast later would have).
- **`--accent` and `--sidebar-accent` were both pre-existing, unused tokens given real jobs** rather than inventing new ones — `--accent` for DataTable's selected-row tint (deliberately not `--primary`, to avoid echoing the Warning/Pending yellow across a whole row), `--sidebar-accent` for the shell's active/hover state and chip backgrounds.
- **Dialog uses `bg-card`, Popover/DropdownMenu/Tooltip use `bg-popover`** — a deliberate distinction (content panel vs. transient floating chrome) rather than collapsing both onto one token.
- **DataTable owns its TanStack instance internally** rather than accepting a pre-built `table` object — simpler v1 API, traded against the more flexible "headless engine + consumer-owned instance" architecture that was the original recommendation.
- **DataTable's selection column is auto-injected**, not hand-written per consumer.
- **Bulk-actions bar replaces the toolbar** when rows are selected, rather than stacking above it.
- **"Infinite-scroll-ready" resolved as a real "Load more" button**, not auto-scroll/IntersectionObserver — chosen specifically because scroll-triggered loading has no good fallback for keyboard/screen-reader users, and a button *is* that fallback.
- **Sidebar focus rings reuse the `--ring` *mechanism*, pointed at the `--sidebar-ring` *token*** — explicit instruction was "don't invent custom focus behavior," so the same `ring-3`/`focus-visible:` pattern already used everywhere else was kept, just retargeted to the pre-existing sidebar-specific color slot.
- **Shell tokens repurpose the dead `--sidebar*` family** instead of introducing `--shell-*` names, resolving a naming-collision question raised in the shell's own design audit.
- **Collapsible nav groups use Radix `Collapsible`**, not a hand-rolled height transition — `tw-animate-css`'s `--animate-collapsible-down/up` keyframes (referencing `--radix-collapsible-content-height`) had been sitting unused since the first audit.

---

## 7. Rejected patterns

- **Risk-color Alternative A** (relocate Risk into the unclaimed 293°→25° hue gap, multi-hue gradient) and **Alternative B** (same gap, monochromatic intensity ramp) — both solved the Warning/Risk collision but were rejected in favor of **Alternative C** (keep conventional colors, fix via component form) because they'd have broken the green=low/red=critical intuition users already bring to risk indicators.
- **A single shared "floating-surface" style helper** across Popover/DropdownMenu/Tooltip — considered, rejected in favor of small, deliberate duplication per file, consistent with shadcn's own copy-don't-abstract distribution model.
- **Shadow elevation reusing Tailwind's untouched defaults** — rejected once it was confirmed those defaults are mode-unaware (same flat black-alpha value regardless of light/dark), which is actively wrong for dark surfaces.
- **Copying shadcn's literal `TOAST_REMOVE_DELAY = 1000000` value** — rejected as a known community-flagged oddity; replaced with a short, correct 300ms cleanup delay once it was confirmed Radix's `Presence` handles the exit animation independently of when the JS array entry is pruned.
- **A hard cap (`TOAST_LIMIT`) on simultaneous toasts** — dropped because slicing the array would silently skip the dismiss/animate-out path for the oldest toast, and no cap was actually requested.
- **Group accordion behavior was explicitly rejected, then explicitly reversed** — the App Shell's first implementation pass was told groups are "always expanded... do not implement group collapse"; a later refinement turn explicitly asked for the opposite. Current behavior (collapsible, per §3) reflects the most recent instruction.
- **Reusing `--success`'s exact green for the shell's "NEW" badge** — rejected on semantic grounds (would conflate "approved" with "new feature"); given its own `--badge-new` token even though the resulting hue is visually close.
- **Using `--primary` (brand yellow) for DataTable's selected-row background** — rejected to avoid a yellow row tint reading as a Warning/Pending state in the same view.

---

## 8. Remaining components

Identified across multiple audits, not yet built:

- **Form primitives** — Input, Textarea, Select/Combobox, RadioGroup, Switch, Date Picker, File Upload. Nothing in this system currently has a styled text input outside of raw `<input>` elements hand-styled inline in demo pages (Dialog's vendor-creation example, DataTable's search box).
- **Pagination** — explicitly deferred ("Do not implement pagination yet" — DataTable v1).
- **Alert/Banner** — page-level status messaging (flagged as missing since the very first component audit; would directly reuse the now-complete status token set).
- **Avatar** (as a real component — the shell currently just renders a styled `<span>` with a letter).
- **Tabs, Breadcrumb, Progress, Card, Stepper/Wizard** — identified in the original "Enterprise SaaS Components Required for Krane" list, none built yet.
- **DataTable row-actions column** — a per-row trailing menu (View/Edit/Duplicate/Archive) was scoped in the original DataTable architecture proposal but not included in v1.
- **`DataTableColumnHeader` as its own exported component** — currently the sortable-header rendering is inlined inside `DataTable` itself rather than factored out.
- **CSV/export affordance** on DataTable's toolbar — flagged as a near-certain future ask, not built.

---

## 9. Known gaps

- **No theme switcher exists.** `.dark` class toggling is fully wired (every token has a dark value) but nothing in the app currently sets it — dark mode is implemented but unreachable through the UI.
- **No mobile/responsive behavior anywhere** — the App Shell is explicitly desktop-only by instruction; no other component has been checked against small viewports either.
- **`RiskIndicator`'s `label` override isn't validated against `level`** — passing a label that contradicts the dot count is possible and silent.
- **DataTable has no virtualization** — fine at demo scale, would need `@tanstack/react-virtual` before real infinite-scroll data volumes.
- **DataTable's default sort comparator is lexicographic for Status/Risk columns** — sorts alphabetically by variant string, not by severity rank; no custom `sortingFn` has been wired for either.
- **Shell header's decorative "chip" backgrounds (org/project icon boxes, language pill, avatar) all reuse one `--sidebar-accent` value** as a simplification — the reference design's avatar reads slightly more opaque/solid than the nav hover wash; treated as an acceptable v1 approximation, not pixel-verified.
- **No screenshot/visual-regression tooling was used at any point** — every "verified" claim in this project is build/TypeScript/curl/DOM-structure verification plus a manual open-in-browser request to the user; nothing has been pixel-diffed against the original design reference programmatically.
- **Avatar, help icon, and notification bell in the shell have no wired behavior** — present visually, not interactive (no account menu, no notification panel).
- **Language selector in the shell demo is a real `DropdownMenu`** but selecting an option doesn't do anything (no i18n wiring — out of scope so far).
- **No automated test suite** — every verification in this project has been manual (build, lint, curl, visual open) rather than unit/integration tests; nothing would catch a regression automatically.
- **`components.json`'s `baseColor: "neutral"`** no longer accurately describes the system — primary is brand yellow, not neutral — harmless metadata drift, but worth knowing if `shadcn add` is ever run again against this config.
