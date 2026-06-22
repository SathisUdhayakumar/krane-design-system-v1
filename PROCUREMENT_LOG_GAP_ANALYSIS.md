# Krane Design System — Procurement Log Gap Analysis

`app/demo/procurement-log/page.tsx`, demoed at `/demo/procurement-log`, linked from `/`. Built under one constraint: **only** components, tokens, layouts, patterns, and conventions that already existed in this repository at the time of building — confirmed by reading every file in `components/ui/`, `components/shell/`, `hooks/`, `lib/`, `app/globals.css`, and the established page-composition conventions in `app/demo/app-shell/page.tsx`, `app/demo/data-table-advanced/page.tsx`, and `app/demo/form/page.tsx`, not recalled from memory. Zero new components were created. Every gap below was found *while building*, not predicted in advance, and is cited against the actual source, not assumed.

---

## 1. What was built

A full, composed procurement-log page: `AppShell` + `AppHeader` + `Sidebar` (a new "Procurement Log" nav item added to the existing "Procurement log" group, marked active) → `Breadcrumb` → a title row with `Refresh`/`Export`/`New purchase order` actions → a `DataTable` (36 synthetic purchase orders, Vendor/Status select filters, Due-date range filter, sortable columns, row selection, bulk Approve/Reject, a row-actions menu with View/Edit/Delete, numbered pagination, the Saved Views serialization contract) → a `Dialog`+`Form` for creating a new purchase order (Combobox vendor picker, CSI division `Select`, `Input` amount/due-date, `Textarea` notes, `Switch` auto-approve, `Select` routing, zod cross-field validation) → a second `Dialog` for viewing a purchase order's detail.

Verified via `tsc`, `lint`, `build`, and a live Playwright pass: sorting, the Vendor/Status filters, bulk selection, the View detail dialog, empty-form validation, and a full create-PO submission (confirmed the new row is prepended with the correct sequential PO number and a success toast fires) — all at 1440px, with a separate pass confirming zero page-level horizontal overflow and no clipped primary actions at 768px and 390px, in both light and dark mode.

## 2. Components reused (zero new components created)

| From `components/ui/` | From `components/shell/` |
|---|---|
| `Badge`, `Button`, `Combobox`, `DataTable` (+ `DataTableBulkAction`, `DataTableState` types), `Dialog` family, `DropdownMenu` family, `Form` family (`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`), `Input`, `RiskIndicator`, `Select` family, `Switch`, `Textarea`, `Tooltip` family, `Breadcrumb` | `AppShell`, `AppHeader`, `Sidebar` (+ `SidebarGroup`/`SidebarItem`/`SidebarBadge`/`SidebarFooter`), `OrganizationSwitcher`, `ProjectSwitcher`, `AccountMenu` |

Also reused: `ThemeToggle`, `toast()`/`useToast`, `cn()`. Patterns reused, not invented: the synthetic-data-generator shape from `data-table-advanced/page.tsx`'s `ProcurementLogTable`, the PO-creation zod schema/field composition from `form/page.tsx`, the title+actions responsive stacking and `HeaderRightActions` structure from `app-shell/page.tsx`, and the ad-hoc `text-label`/`text-body` label-value layout already used informally elsewhere in this codebase (no `Card` or "detail view" component exists, so the View dialog uses plain `<dl>`/`<dt>`/`<dd>` with existing typography tokens, not a new abstraction).

**Deliberately not built**, to stay within "only what exists": a KPI/summary metrics strip (would require either a `Card`-like component, which doesn't exist, or inventing a new page-level layout pattern with no precedent anywhere in this repo) and an actual Saved Views feature (only the serialization contract exists — see `DataTableState`/`initialState`/`onTableStateChange`; this page demonstrates the contract exactly as `data-table-advanced/page.tsx` already does, with no naming/list/persistence layer added).

---

## 3. Gaps found

Each gap is something this page either worked around using an existing primitive in a non-ideal way, or could not address at all without inventing a new capability — which, per instruction, was not done.

### Missing components

- **No `Card` or stat-tile primitive.** Confirmed via `COMPONENT_STATUS.md` §3 ("Card, Progress — No spec, no code") and a full read of `components/ui/`. A procurement log conventionally wants a KPI strip (total POs, pending approval, overdue, total value) above the table. Not built — building one would mean either inventing a new component (prohibited) or composing raw `border-border`/`bg-card` divs into a *new page-level layout pattern* with no existing precedent (the one ad-hoc div-tile pattern that does exist, in `app/page.tsx`'s homepage, is for static navigation tiles, not live data — using it for KPIs would be a different job wearing the same clothes, not genuine reuse).
- **No Drawer/Sheet (slide-in side panel).** Confirmed by enumerating every file in `components/ui/` — the only overlay primitives are `Dialog` (centered, blocking), `Popover`, `DropdownMenu`, and `Tooltip`. A "View PO" panel that lets a user keep scrolling the table while it's open is a common enterprise-table pattern; `Dialog` (centered, modal) was used instead, which is a real, accepted compromise, not equivalent UX.
- **No exported `DataTableColumnHeader`.** The *capability* (clickable, sort-direction-indicating headers) exists and works — it's inlined directly inside `DataTable`'s own header-rendering, confirmed by reading `components/ui/data-table.tsx` lines ~386–429. What's missing is the *abstraction*: a consuming page cannot reuse just the header-button behavior outside `DataTable` itself. Already named in `COMPONENT_STATUS.md` §3; this page doesn't add a new instance of the gap, just confirms it's still there.
- **No permission/role-gating primitive anywhere in the system.** `Sidebar`, `AccountMenu`, and `DataTable`'s row/bulk actions all render identically regardless of who's looking. A real procurement approval workflow needs to hide "Approve"/"Reject" from non-approvers; this page shows every action to everyone, which is unrealistic for production and was not something a missing-component workaround could fix.

### Missing variants

- **`DataTable`'s filter system has exactly three variants — `text`/`select`/`dateRange`** (the literal type union in `components/ui/data-table.tsx`'s `DataTableFilterVariant`). There is no searchable/`Combobox`-style filter variant. This page's Vendor filter uses `select`, which only works because the demo's vendor list is short and fully enumerable; a real procurement system with hundreds of vendors would need type-ahead filtering, which `DataTable` cannot provide without a fourth, currently-nonexistent variant.
- **No numeric-range filter variant.** Only `dateRange` exists for range filtering; an "Amount between $X and $Y" filter — a real, common procurement-log need — has no equivalent. Not added to this page as a result.
- **`Badge` has exactly five non-default semantic variants** (`success`/`warning`/`destructive`/`info`/`pending`). This page's five statuses (Approved/Pending/Warning/Overdue/In review) map onto them exactly, but a real procurement workflow commonly needs more (Draft, Submitted, Cancelled, Closed are all distinct from the five above) — at six or more distinct statuses, two conceptually different states would be forced to share one color, which is a real, findable ceiling, not yet hit by this page's chosen vocabulary but one constraint away from being hit.
- **`Button` has no `loading` prop**, unlike `Input` and `Combobox`, both of which do (confirmed: `components/ui/button.tsx`'s props are only `variant`/`size`/`asChild`). The "New purchase order" submit button has to manage its own disabled state and manually swap its label text ("Creating…") rather than using a consistent, built-in loading affordance — an inconsistency in this system's own loading-state vocabulary, not something this page could fix without modifying `Button` itself.

### Missing states

- **No in-flight visual state on the *rows themselves* during a bulk action.** Confirmed by reading `DataTableBulkActions` in `data-table.tsx`: the pending spinner renders only on the clicked action button (`pendingLabel === action.label`); the affected table rows look completely unchanged while `Approve`/`Reject` is in flight. For a procurement-approval action, a user has no visual confirmation *which* rows are being acted on beyond their already-checked checkboxes.
- **`RiskIndicator`'s `label` override isn't validated against `level`** — already a known, documented gap (`COMPONENT_STATUS.md` §4), not new here, but directly relevant since this page uses `RiskIndicator` on every row.

### Missing tokens

- **No `--spacing-*` scale** — the single most-repeated, already-documented gap in this entire system (`COMPONENT_STATUS.md` §1/§4). This page's every `gap-2`/`p-4`/`px-3` is a literal Tailwind value chosen ad hoc, exactly like every other component and page in this codebase — it adds to the existing pile rather than introducing anything new, but is worth re-confirming: a full page build did not surface a single place where a named spacing scale would have changed a decision, only where it would have made an already-consistent set of choices *checkable*.
- **No sixth+ semantic color token.** The token-level root of the Badge-variant ceiling above — `--success`/`--warning`/`--destructive`/`--info`/`--pending` is the complete semantic vocabulary in `app/globals.css`; there is no token to draw from for a conceptually distinct sixth status without reusing one of the five for two different meanings.

### Missing interaction patterns

- **No row-click-to-view.** `TableRow` (`components/ui/table.tsx`) forwards only native `<tr>` props; `DataTable` never wires an `onClick` to it. This page's "View" action is reachable only through the row-actions kebab menu, matching the one interaction model `DataTable` actually supports — clicking anywhere else on a row does nothing, which is a real, common enterprise-table expectation this system doesn't meet today.
- **No inline cell editing.** TanStack Table (the engine underneath) supports editable-cell patterns at the library level, but Krane's `DataTable` wrapper never exposes them. A user wanting to correct an Amount or Due date must go through the (toast-only, non-persisting) Edit row action.
- **No column resize or reorder.** Also available in the underlying TanStack engine, also not wired up by Krane's wrapper. Column *visibility* toggling exists (`DataTableColumnVisibility`); resize/reorder do not.
- **No confirm-before-bulk-action step.** Clicking "Approve" or "Reject" on multiple selected purchase orders fires immediately, with no confirmation `Dialog` — matching the exact precedent already established in `data-table-advanced/page.tsx`'s own bulk actions, which this page deliberately mirrored rather than inventing a new confirm-step pattern. Worth flagging regardless: a real approval workflow rejecting several purchase orders at once with one click and no confirmation is a real risk, and `Dialog` already exists to build this with — it just isn't the established convention yet.
- **No page-level action overflow menu.** Three primary actions (Refresh/Export/New purchase order) already need `flex-wrap` to avoid clipping at narrow widths (confirmed via the responsive check below); `DataTable` has an established "consolidate into a kebab menu" pattern for *row* actions, but nothing equivalent exists for *page-level* actions. A page needing five or six primary actions has no established pattern to reach for beyond more wrapping.

### Missing responsive behavior

- **Confirmed working, not a gap**: `AppShell`/`Sidebar`/`AppHeader`'s responsive fixes (per `SHELL_RESPONSIVENESS_AUDIT.md`) and `DataTable`'s contained-overflow behavior both hold up correctly on this page too, verified via Playwright at 390/768/1440px — zero page-level horizontal overflow, the primary "New purchase order" button never clipped.
- **`DialogContent`'s own default classes have no `overflow-y-auto`.** Confirmed by reading `components/ui/dialog.tsx`: the base content classes include `max-h-[85vh] flex flex-col` but no scroll behavior. A tall form (this page's New Purchase Order dialog has seven fields) would clip against that `max-h-[85vh]` ceiling on a shorter viewport unless the *consumer* remembers to add `overflow-y-auto` themselves, which this page does (`className="max-h-[85vh] overflow-y-auto"`) — but nothing in `Dialog`'s own API or any foundation doc flags that a tall form needs this. A real, findable gap: the requirement is real and currently undocumented, discovered only by building a form long enough to hit it.

### Missing accessibility support

- **`DataTableRowActionsMenu`'s kebab button uses a static `aria-label="Row actions"`** on every row (confirmed: `data-table.tsx`'s `DataTableRowActionsMenu`, not parameterized by row). A screen-reader user tabbing through 36 identical "Row actions" buttons has no way to tell which row's menu is focused without separately reading the preceding cells. By contrast, the per-row selection checkbox *does* get a row-specific label (`aria-label={`Select row ${row.id}`}`) two lines above it in the same file — an inconsistency within one component, not something this page introduced but newly visible at this row count.
- **`SidebarItem`'s `active` prop sets `data-active` for styling but never `aria-current="page"`** (confirmed: no `aria-current` anywhere in `components/shell/sidebar.tsx`). `Breadcrumb`, composed directly above it on the same page, *does* set `aria-current="page"` on its current segment. Two "you are here" indicators in the same Shell, one accessible, one not.
- **No skip-to-content link anywhere in `AppShell`** (confirmed: no skip-nav anchor in `components/shell/app-shell.tsx`). This page's sidebar has five groups and roughly fifteen items — a keyboard user must tab through all of them before reaching the Procurement Log table itself. A pre-existing, system-wide gap, made more visible by this page's particularly content-heavy sidebar.
- **Confirmed working, not a gap**: the New Purchase Order dialog's `Combobox`-inside-`FormField` correctly takes its accessible name from `FormLabel` ("Vendor") via `FormControl`'s `aria-labelledby` injection, rather than its own placeholder text — verified directly during Playwright testing (a test written against the wrong assumption failed, and tracing why confirmed the documented `FORM_FOUNDATION.md` integration is working exactly as designed, not a bug).

---

## 4. Recommended design system improvements, ranked by priority

1. **Parameterize `DataTableRowActionsMenu`'s `aria-label`** (e.g., accept a per-row label or derive one from the row). Trivial, fixes a real accessibility gap affecting every existing and future `DataTable` usage with `rowActions`, not just this page.
2. **Add a `loading` prop to `Button`**, mirroring `Input`/`Combobox`. Closes a real, system-wide consistency gap in how this design system represents "this is working" across its three async-submit-capable primitives.
3. **Formalize the `--spacing-*` token scale.** Already the most-flagged, longest-standing gap (`COMPONENT_STATUS.md` §1, §4, §5 all name it). A full page build reconfirms it's still purely ad hoc, with no new urgency but no less real.
4. **Add a fourth `DataTable` filter variant for searchable/entity-style columns** (Vendor, Buyer, or similar), or document that `select` is the deliberate ceiling for "small enough to enumerate" columns and a different table entirely is expected once a column's options outgrow a static list.
5. **Build `Card` (or a narrower "metric tile") once a real consuming page needs one** — per this system's own stated discipline (`COMPONENT_STATUS.md` §5: "only once a real consuming module surfaces a concrete need"), and a KPI strip on a procurement log is about as concrete a need as this system is likely to surface. Worth treating as the next real candidate, not built speculatively here.
6. **Add `aria-current="page"` to `SidebarItem`'s `active` state**, matching `Breadcrumb`'s existing, correct behavior. Small, isolated, fixes a real inconsistency between two "current location" indicators in the same Shell.
7. **Document (or build) a confirm-before-destructive-bulk-action pattern** using the already-existing `Dialog`, since `DataTable`'s bulk actions currently fire immediately with no established alternative.
8. **Evaluate a Drawer/Sheet primitive** for non-blocking detail views, once more than one consuming page wants one — named here as a real gap, not urgent in isolation.
9. **Lower priority, defer as a group**: `DataTable` column resize/reorder, inline cell editing, a page-level action overflow menu, a numeric-range filter variant, and a skip-to-content link in `AppShell`. Each is real and findable, but none blocks this page or any other today — consistent with this system's own recorded discipline of not building speculatively ahead of a concrete requirement.

No new component, token, or pattern was added to the design system itself to produce this page — every item above is a recommendation for *future* work, not something silently slipped in to make this page easier to build.
