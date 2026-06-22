# Krane Design System — Delivery Schedule Reuse Report

`app/demo/delivery-schedule/page.tsx`, demoed at `/demo/delivery-schedule`, linked from `/`. Built following the same process as Procurement Log and Submittal Log: confirmed via `git status` that the repository was unchanged since the last full read, re-verified the one assumption this page's domain made newly relevant (whether `DataTable`'s column filters are externally controllable — confirmed they are not, see the Gap Analysis Report), then composed the page from only what already existed. **Zero new components were created.**

## Components reused

| From `components/ui/` | From `components/shell/` |
|---|---|
| `Badge`, `Button`, `Combobox`, `DataTable` (+ `DataTableBulkAction`, `DataTableState`), `Dialog` family, `DropdownMenu` family, `Form` family, `Input`, `RiskIndicator`, `Select` family, `Textarea`, `Tooltip` family, `Breadcrumb` | `AppShell`, `AppHeader`, `Sidebar` (+ `SidebarGroup`/`SidebarItem`/`SidebarBadge`/`SidebarFooter`), `OrganizationSwitcher`, `ProjectSwitcher`, `AccountMenu` |

Also reused: `ThemeToggle`, `toast()`/`useToast`, `cn()`, the `AlertTriangle` icon (already used elsewhere in this codebase for `Alert`'s warning variant and `Stepper`'s error state — reused here for the same "something needs attention" meaning, not a new association).

## Patterns reused, and where each came from

- **The same vendor pool, synthetic-data-generator shape, and `Form`/`zod`/`Combobox` composition** used for Procurement Log and Submittal Log, applied to a delivery-tracking shape (Item, Vendor, Destination, Quantity, Scheduled date, Status, Delay risk, Logged by). The cross-field `.refine()` rule is the same *mechanism* both prior pages used (a destination/quantity combination blocking submission), with a new, logistics-appropriate rule replacing each prior page's own.
- **`Badge` for Status and `RiskIndicator` for a risk dimension** — both reused exactly as Procurement Log used them for its own Status/Risk columns. This page's five delivery statuses (Scheduled/In Transit/Delivered/Delayed/Cancelled) map cleanly onto `Badge`'s five non-default variants, the same ceiling Procurement Log's report already named — reconfirmed, not new.
- **The header chrome, responsive title+action stacking, and the View-detail-dialog's `<dl>`/`<dt>`/`<dd>` layout** are reused exactly from the prior two pages, which themselves reused them from `app/demo/app-shell/page.tsx`.
- **The sidebar reuses the exact nav structure already established**, including both previously-added/activated items ("Procurement Log" and "Submittals," both present but inactive here). This page activates the pre-existing "Deliveries" item under the "Procurement log" group — the closest literal match for "Delivery Schedule" — rather than adding a new item, the same kind of pure reuse Submittal Log achieved with "Submittals."
- **`positionActionsColumn` was deliberately left at its default (`"last"`)**, the proven-safe configuration, *not* explored as `"first"` again. Per instruction not to fix or re-trigger the already-documented sticky-column defect from `SUBMITTAL_LOG_GAP_ANALYSIS.md`, this page avoids the one combination known to break — confirmed via the same computed-style check used to find that defect originally (exactly two pinned headers this time, one per side, `left: 0px` and `left: auto` respectively — no overlap).

## A new use of an existing capability, not a new capability

**Per-column `cell` renderers were used to conditionally style overdue rows** (a red, icon-prefixed date for any delivery still `Scheduled`/`In Transit` whose date has passed) — entirely within `ColumnDef.cell`'s existing, fully-open React-render contract, using only the existing `text-destructive` token and the existing `AlertTriangle` icon. This is not a new `DataTable` feature; `cell` has always been able to render arbitrary content conditioned on row data. It's flagged here specifically because neither Procurement Log nor Submittal Log exercised this — both used `cell` only for `Badge`/`RiskIndicator`/currency formatting, never for row-level conditional styling — and a schedule-domain page is the first place in this codebase that need actually arose.

**The Saved Views serialization contract was used for a second purpose beyond what it was built for**: this page's `initialState` is seeded with a real default (`sorting: [{ id: "scheduledDate", desc: false }]`), not left empty, so the page opens with the nearest upcoming deliveries first — using `DataTableState`/`initialState` to express "this page's natural default view" as well as "a user's saved snapshot," both via the exact same prop, with no new mechanism added. See the Gap Analysis Report for the real limitation this same exploration surfaced (no way to express "show me the next 7 days" as a button, only as this kind of author-set initial default).

## What was deliberately not built

Same reasoning as both prior pages: no KPI/summary strip, no actual Saved Views feature. **New for this page**: no calendar, timeline, or Gantt-style visualization — despite "Schedule" being in the page's own name. This is the most significant thing this page does *not* do, and it is the headline of `DELIVERY_SCHEDULE_GAP_ANALYSIS.md`, not a quiet omission.
