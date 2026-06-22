# Krane Design System — Submittal Log Reuse Report

`app/demo/submittal-log/page.tsx`, demoed at `/demo/submittal-log`, linked from `/`. Built following the exact same process as `PROCUREMENT_LOG_GAP_ANALYSIS.md`: read the full, current repository first (confirmed via `git status` that nothing had changed since that read), then composed the page from only what already existed. **Zero new components were created.**

This is a companion report to `PROCUREMENT_LOG_GAP_ANALYSIS.md`, not a restatement of it — it documents what this *second* page reused, including from the *first* page, and is honest about the one real defect this build surfaced that the first build never could have (see `SUBMITTAL_LOG_GAP_ANALYSIS.md`).

## Components reused

| From `components/ui/` | From `components/shell/` |
|---|---|
| `Button`, `Combobox`, `DataTable` (+ `DataTableBulkAction`, `DataTableState`, `DataTableEmptyState`), `Dialog` family, `DropdownMenu` family, `Form` family, `Input`, `Select` family, `Textarea`, `Tooltip` family, `Breadcrumb` | `AppShell`, `AppHeader`, `Sidebar` (+ `SidebarGroup`/`SidebarItem`/`SidebarBadge`/`SidebarFooter`), `OrganizationSwitcher`, `ProjectSwitcher`, `AccountMenu` |

Also reused: `ThemeToggle`, `toast()`/`useToast`, `cn()`. **Not used this time, deliberately**: `Badge` and `RiskIndicator` — see "A deliberate non-reuse" below.

## Patterns reused, and where each came from

- **The entire `Submittal` data shape, `STAGE_OPTIONS`, and the "Open" row-action label** come directly from `app/demo/data-table-advanced/page.tsx`'s existing `SubmittalsTable` — not re-derived. Two columns (`specSection`, `submittedBy`) were added for a fuller real-page treatment, the same enrichment Procurement Log already applied over its own `data-table-advanced` counterpart.
- **The dual-empty-states demonstration — a "Simulate no data at all" toggle plus the distinct "no results match your filters" case — is reused verbatim from `SubmittalsTable`**, including its exact `DataTableEmptyState` title/description strings. This is a real capability Procurement Log's own page never exercised (it always renders real data); Submittal Log is the first full *page* (not just a feature demo) to show both empty states live.
- **The New Submittal form's `Form`/`FormField`/`zod` composition, and the Combobox vendor picker, are reused from `app/demo/form/page.tsx`** and from Procurement Log's own New Purchase Order dialog — the same shape, re-applied to submittal-appropriate fields (Item, Spec section, Stage, Due date, Notes) rather than copied verbatim. The cross-field `.refine()` validation rule is the same *mechanism* Procurement Log used (a vendor-specific business rule blocking one field based on another), with a new, domain-appropriate rule ("Sterling Rebar Co. submittals always require In Review before Done") replacing Procurement Log's amount-threshold rule.
- **The header chrome (`HeaderRightActions`), the title+actions row's responsive stacking, and the View-detail-dialog's plain `<dl>`/`<dt>`/`<dd>` layout** are reused exactly from Procurement Log, which itself reused them from `app/demo/app-shell/page.tsx`. No new layout pattern was introduced at this layer either.
- **The sidebar reuses the *exact* nav structure already established**, including Procurement Log's own previously-added "Procurement Log" item — both pages now show the identical, full navigation, differing only in which single item is marked `active`. Unlike Procurement Log (which had to add a new `SidebarItem` because none existed for it), Submittal Log's "Submittals" item already existed in `app/demo/app-shell/page.tsx` and needed no addition — purer reuse, not a new composition.

## A deliberate non-reuse, and why

**`Badge` was not used for the Stage column**, even though Procurement Log used `Badge` for its analogous Status column. This was a deliberate choice, not an oversight: the existing `SubmittalsTable` precedent already renders Stage as plain text (`<span>{row.original.stageLabel}</span>`), and Stage (Draft/In Review/Done) is a *workflow position*, not an *operational health signal* the way Procurement Log's Status (Approved/Pending/Overdue) is — forcing it into `Badge`'s success/warning/destructive/info/pending vocabulary would mean picking an arbitrary, likely-misleading color for each stage rather than reusing an established semantic mapping. This page followed the existing precedent's own choice rather than introducing a new one. See `SUBMITTAL_LOG_GAP_ANALYSIS.md` for why this is flagged as a documentation gap (no written guidance exists for *when* a categorical column should get `Badge` treatment vs. plain text) rather than a UI gap.

## What was deliberately not built

Same reasoning as Procurement Log, restated for this page specifically: no KPI/summary strip (no `Card` exists, and no page-level layout precedent for one exists either), and no actual Saved Views feature (only the serialization contract — `DataTableState`/`initialState`/`onTableStateChange` — is demonstrated, via the identical "Save current view" pattern Procurement Log already uses).

## One real difference in outcome from Procurement Log

Building this page required combining `enableRowSelection` with `rowActions` pinned to the *same* side (`positionActionsColumn="first"`) for the first time anywhere in this codebase — Procurement Log always pinned its row actions to the opposite side from selection. That combination surfaced a real, previously-latent `DataTable` defect (sticky columns overlapping when two columns are pinned to the same side), which this page's final, shipped version avoids by using the proven-safe configuration instead. Full root-cause detail is in `SUBMITTAL_LOG_GAP_ANALYSIS.md` — flagged here because it's the one place this report's "what was reused" story changed mid-build, and that change is itself worth being transparent about.
