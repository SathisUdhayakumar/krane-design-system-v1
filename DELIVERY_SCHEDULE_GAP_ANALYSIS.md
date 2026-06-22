# Krane Design System — Delivery Schedule Gap Analysis

Companion to `DELIVERY_SCHEDULE_REUSE_REPORT.md`, `SUBMITTAL_LOG_GAP_ANALYSIS.md`, and `PROCUREMENT_LOG_GAP_ANALYSIS.md`. Same instruction as always: document gaps, do not invent solutions, and per this round's explicit addition, do not fix any existing defect encountered (including the one this exact page was at risk of re-triggering — see §3). This page's domain — a *schedule* — raised one major question the prior two pages' domains never had reason to ask, and the answer is a real, significant gap, not a workaround.

---

## 1. The headline finding: this design system has no calendar, timeline, or date-visualization primitive

**"Schedule" implies a temporal visualization** — a calendar grid, a week/day view, a Gantt-style timeline showing deliveries laid out against dates — not necessarily a sortable list. Confirmed by enumerating every file in `components/ui/` (the same full inventory done for both prior pages, re-verified unchanged via `git status` before this page was built): there is no `Calendar`, `DatePicker`, `Timeline`, or `Gantt` component anywhere in this system. The only date-related UI anywhere is the bare native `<input type="date">`, passed through unmodified by `Input` and by `DataTable`'s own date-range filter — confirmed by reading `components/ui/input.tsx`, which adds no date-specific behavior at all beyond forwarding the native `type` attribute.

**What this page does instead.** `Delivery Schedule` is a `DataTable`-based list, sorted by scheduled date ascending by default, with a date-range filter and per-row overdue highlighting — a legitimate, common interpretation of "schedule" in enterprise software (many real procurement/logistics tools are exactly this: a list, not a calendar), but not the *only* legitimate interpretation, and not the one a calendar-shaped mental model would expect. This was a deliberate choice to build the *table* interpretation faithfully with existing components rather than attempt the *calendar* interpretation, which existing components cannot provide.

**What would be needed, named but not built**: a true calendar/timeline view would require, at minimum, a date-grid layout primitive and some way to position/render entries against specific days or a date axis — neither exists, and approximating one with raw `Table`/`div`+token composition would mean inventing an entirely new layout pattern with no precedent anywhere in this codebase, which the brief explicitly prohibits. This is named here as the clearest, single biggest gap found across all three "Log"/"Schedule" pages built so far — bigger than any individual missing prop or variant, because it's a missing *category* of UI, not a missing option within an existing one.

---

## 2. A second, concrete finding: `DataTable`'s filters cannot be driven from outside the table after mount

Confirmed by reading `DataTableProps` in full (`components/ui/data-table.tsx`, lines ~108–168): `sorting`, `globalFilter`, and `pagination` all have a controlled-prop pair (`value`/`onChange`). **`columnFilters` does not** — it is initialized once from `initialState.columnFilters` and then lives purely in `DataTable`'s own internal `React.useState`, with no prop to read or set it again afterward.

This matters specifically for a schedule page in a way it didn't for Procurement Log or Submittal Log: a natural, expected feature for any date-driven list is a row of quick-filter buttons — "Today," "This week," "Overdue" — sitting *outside* the table, each one setting the date-range filter to a computed range with one click. That pattern cannot be built today: there is no prop through which a button's `onClick` could push a new value into `DataTable`'s column-filter state. The only thing influenceable from outside is the *initial* value, once, at mount (which this page does use, for its ascending-by-date default — see the Reuse Report) — not a live, repeated update.

**Not attempted as a workaround**: forcibly remounting `DataTable` with a new `key` to force a fresh `initialState` on each quick-filter click would technically work, but would also reset sorting, pagination, and row selection every time — a destructive side effect for the sake of one filter, and a misuse of a prop (`initialState`) explicitly documented as a one-time seed, not a live channel. Left undone and documented instead.

---

## 3. The known `DataTable` sticky-column defect — avoided again, not fixed, per explicit instruction

`SUBMITTAL_LOG_GAP_ANALYSIS.md` documented a real defect: pinning two columns to the same side (e.g., `enableRowSelection` plus `rowActions` with `positionActionsColumn="first"`) causes the second pinned column's sticky offset to be computed against TanStack Table's default 150px column size instead of the first column's actual rendered width, producing visible header overlap.

This page also uses `enableRowSelection` and `rowActions` together, which made it a second opportunity to either re-trigger or avoid that same defect. **It was avoided, not fixed**: `positionActionsColumn` was left at its default (`"last"`), keeping exactly one pinned column per side — confirmed directly via computed style during this page's own verification (`position: sticky` on exactly two header cells, one per side, `left: 0px` and `left: auto`, no overlap). Per this round's explicit instruction not to fix existing defects, `components/ui/data-table.tsx` itself was not touched. The defect remains live in the component for the next page that tries first-positioned actions together with row selection.

---

## 4. Carried forward from the prior two reports, reconfirmed, not re-explained in full

- **No `Card`/stat-tile, no Drawer/Sheet, no exported `DataTableColumnHeader`, no permission/role-gating primitive** — all reconfirmed still absent; none specific to this page.
- **`DataTableRowActionsMenu`'s static, non-row-specific `aria-label="Row actions"`** — reconfirmed identically on this page's row-actions menu.
- **`Button` has no `loading` prop** — reconfirmed needed again by this page's "Schedule delivery" submit button, handled the same manual-disabled-plus-text-swap way as the prior two pages.
- **`SidebarItem`'s `active` state sets no `aria-current="page"`**, unlike `Breadcrumb`'s correct handling of its own current segment — reconfirmed identically; "Deliveries" is marked active the same styling-only way "Procurement Log" and "Submittals" were.
- **`DialogContent` has no default `overflow-y-auto`** — reconfirmed; this page's New Delivery dialog needed the same manual `className` override Procurement Log's and Submittal Log's dialogs did.
- **No `--spacing-*` token scale** — reconfirmed; three full pages now built on top of the same ad-hoc-but-consistent literal Tailwind values.
- **Confirmed working, not a gap**: `AppShell`/`Sidebar`/`AppHeader`'s responsive behavior, `DataTable`'s contained-overflow, and the `Combobox`-inside-`FormField` `aria-labelledby` integration all reconfirmed correct on this page too, via the same Playwright methodology used for both prior pages, at 390/768/1440px in both light and dark mode.

---

## 5. Recommended design system improvements, ranked by priority

1. **Give `DataTable`'s internally-generated select and row-actions columns an explicit `size`** (carried forward from Submittal Log's rank 1, unchanged — this page deliberately didn't re-trigger it, but didn't fix it either, and it's still the single most concrete, reproducible defect on record across all three pages).
2. **Decide, deliberately, whether "schedule"-shaped product surfaces are in scope for this design system at all.** This is a scoping question, not an implementation one: if calendar/timeline views are expected for future Krane pages, a `Calendar`/date-grid primitive needs its own foundation doc and audit, the same discipline every other component in this system went through — it should not be approximated ad hoc the first time a real page needs one. If they're explicitly out of scope, that should be written down (the way `Card`/`Progress` already are) so the next person doesn't re-ask the question this report just answered.
3. **Add a controlled `columnFilters`/`onColumnFiltersChange` pair to `DataTable`**, mirroring the existing `sorting`/`globalFilter`/`pagination` pattern exactly. This is what a "Today"/"This week" quick-filter row needs, and it's a small, consistent addition to an interface that already has the identical shape for its three other pieces of table state.
4. **Parameterize `DataTableRowActionsMenu`'s `aria-label`** (carried forward, unchanged priority — now confirmed on a third page).
5. **Add a `loading` prop to `Button`** (carried forward, unchanged priority — now confirmed on a third page).
6. **Formalize the `--spacing-*` token scale** (carried forward, unchanged priority).
7. **Everything else from the prior two reports' lower-ranked items** (searchable `DataTable` filter variant, `Card`, `aria-current` on `SidebarItem`, confirm-before-destructive-bulk-action, Drawer/Sheet, `Badge`-vs-plain-text documentation, column resize/reorder, inline editing, skip-to-content) carries forward unchanged — this page found no evidence to re-rank any of them.
