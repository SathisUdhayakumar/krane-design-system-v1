# Krane Design System — Submittal Log Gap Analysis

Companion to `SUBMITTAL_LOG_REUSE_REPORT.md` and `PROCUREMENT_LOG_GAP_ANALYSIS.md`, following the same process and the same instruction: document gaps, do not invent solutions to them. One genuinely new, previously-undiscovered defect was found while building this page — it leads this report. Everything else is organized in the same seven categories used for Procurement Log, restated only where this page's specific build surfaced new evidence, not duplicated wholesale.

---

## 1. The headline finding: a real `DataTable` sticky-column defect, found and worked around, not fixed

**What happened.** This page's first working draft set `enableRowSelection` and `rowActions` with `positionActionsColumn="first"` — pinning *both* the selection checkbox and the row-actions menu to the *left* side. Every prior usage of `DataTable`'s sticky columns anywhere in this codebase (Procurement Log, and all three tables in `app/demo/data-table-advanced/page.tsx`) pins exactly one column per side, never two on the same side. This page is the first to do so.

**What broke.** The "Submittal" column header rendered partially obscured, with the pinned "Actions" header floating on top of it. Confirmed directly, not assumed: `getComputedStyle` on the live page showed the pinned "Actions" header at `left: 150px`, while the actual checkbox column it should sit flush against is only ~29px wide.

**Root cause, confirmed by inspection.** `components/ui/data-table.tsx`'s `getPinnedStyle()` (around line 516) computes a pinned column's offset via TanStack Table's `column.getStart("left")` / `column.getAfter("right")`. Those functions sum each preceding pinned column's `column.getSize()` — and `getSize()` falls back to TanStack Table's own library-wide default of **150px** whenever a `ColumnDef` doesn't set an explicit `size`. Neither the internally-generated select column nor the internally-generated actions column (both built inside `DataTable` itself, around lines 273–314) ever sets `size`. The defect was always present in the code; it was simply never *triggered* before, because every prior usage kept one pinned side empty of any second column, so there was never a "preceding pinned column" whose phantom 150px width could throw the math off.

**What this page does instead.** The shipped version omits `positionActionsColumn` entirely (defaulting to `"last"`, matching Procurement Log) — keeping the checkbox alone on the left and the actions menu alone on the right, the one configuration already proven correct everywhere else. This is a behavior change to *this page's own props*, not a fix to `DataTable` itself; the defect remains live in the component for the next page that tries the same combination.

**The fix, named but not made** (out of scope — it would mean modifying an existing component, not building a page from existing ones): give the internally-generated `SELECT_COLUMN_ID` and `ROW_ACTIONS_COLUMN_ID` column definitions an explicit `size` (e.g., 40px and 48px respectively) inside `data-table.tsx`, so `getStart()`/`getAfter()` compute against real widths instead of TanStack's generic default — regardless of which sides future pages choose to combine.

---

## 2. Everything else, organized the same way as Procurement Log's report

### Missing components
No new findings beyond `PROCUREMENT_LOG_GAP_ANALYSIS.md` §3 (`Card`/stat-tile, Drawer/Sheet, exported `DataTableColumnHeader`, a permission/role-gating primitive) — all confirmed to still apply, none specific to Submittal Log.

### Missing variants
- Same `DataTable` filter ceiling (`text`/`select`/`dateRange` only) reconfirmed — this page's Vendor filter has the identical limitation Procurement Log's did.
- **New**: no written guidance anywhere in this design system for *when* a categorical table column should render as `Badge` versus plain text. Procurement Log's Status column uses `Badge`; this page's Stage column (following the existing `SubmittalsTable` precedent) uses plain text — both are arguably correct, but the *decision rule* between them exists only in each foundation doc's own reasoning, not as a documented, generalizable guideline. A future page author has no single place to check this against.

### Missing states
Same `RiskIndicator` label-validation gap is not applicable here (this page doesn't use `RiskIndicator` — submittals carry no risk-rating concept anywhere in this system's existing data, and none was invented for this page). The bulk-action in-flight row-state gap from Procurement Log's report reconfirms identically here (`Approve`/`Send back` show a spinner only on the clicked button, never on the affected rows).

### Missing tokens
No new findings — the `--spacing-*` gap reconfirms exactly as before, with this page's literal Tailwind values adding to the same already-documented pile.

### Missing interaction patterns
- Same row-click-to-view, inline-cell-editing, column-resize/reorder, and confirm-before-bulk-action gaps reconfirm identically.
- **New, and the most concrete of this page's findings**: no established pattern — and, per §1 above, an actual defect — for combining row selection with first-positioned row actions. A future page wanting both has no safe precedent to copy from `DataTable`'s own current implementation; it has exactly one safe precedent (last-positioned actions) and one now-documented trap.

### Missing responsive behavior
Confirmed working, not a gap: `AppShell`/`Sidebar`/`AppHeader`'s responsive behavior and `DataTable`'s contained-overflow both hold up correctly on this page too, verified via Playwright at 390/768/1440px in both light and dark mode — zero page-level horizontal overflow, the "New submittal" button never clipped. `DialogContent`'s missing default `overflow-y-auto` (named in Procurement Log's report) reconfirms identically — this page's New Submittal dialog needed the same manual `className` override.

### Missing accessibility support
- `DataTableRowActionsMenu`'s static `aria-label="Row actions"` (named in Procurement Log's report) reconfirms here, and this page's build additionally confirms the gap is **independent of column position** — it affected the row-actions menu identically whether pinned first or last, since the label is generated the same way regardless of pinning side.
- `SidebarItem`'s missing `aria-current="page"` (named in Procurement Log's report) reconfirms identically — "Submittals" is marked `active` (styling only) the same way "Procurement Log" was.
- Confirmed working, not a gap: the New Submittal dialog's `Combobox`-inside-`FormField` again correctly took its accessible name from `FormLabel` ("Vendor") rather than its own placeholder text, the same `aria-labelledby` behavior confirmed during Procurement Log's build — re-confirmed here as a second, independent data point that the documented `FORM_FOUNDATION.md` integration is reliable, not a one-off.

---

## 3. Recommended design system improvements, ranked by priority

1. **Give `DataTable`'s internally-generated select and row-actions columns an explicit `size`.** Promoted to rank 1 over everything carried forward from Procurement Log's own list — this is a confirmed, reproducible rendering defect (not a missing nice-to-have), and the fix is small, isolated, and named precisely above.
2. **Parameterize `DataTableRowActionsMenu`'s `aria-label`** (carried forward from Procurement Log's rank 1) — now confirmed to reproduce identically regardless of pinning side, strengthening the case that this is a real, general gap rather than specific to one page's configuration.
3. **Add a `loading` prop to `Button`** (carried forward from Procurement Log's rank 2) — unchanged, reconfirmed needed again by this page's own New Submittal submit button.
4. **Document a `Badge`-vs-plain-text decision rule for categorical table columns.** New this round: cheap to write (a paragraph in `COMPONENT_STATUS.md` or a `Badge` doc-comment), and directly prevents the next page author from having to re-derive the same judgment call this page and Procurement Log each made independently.
5. **Formalize the `--spacing-*` token scale** (carried forward, unchanged priority) — still the longest-standing, most-repeated gap; two full pages built on top of it now without it mattering once, but never making the existing ad-hoc choices checkable.
6. **Everything else from `PROCUREMENT_LOG_GAP_ANALYSIS.md`'s ranks 4–9** (searchable `DataTable` filter variant, `Card`, `aria-current` on `SidebarItem`, confirm-before-destructive-bulk-action, Drawer/Sheet, and the lower-priority group) carries forward unchanged — this page found no evidence to re-rank any of them.
