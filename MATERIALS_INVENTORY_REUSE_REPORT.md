# Krane Design System — Materials Inventory Reuse Report

`app/demo/materials-inventory/page.tsx`, demoed at `/demo/materials-inventory`, linked from `/`. Built following the same process as Procurement Log, Submittal Log, and Delivery Schedule: confirmed via `git status` that the repository's components/tokens were unchanged since the last full read (the only change since Delivery Schedule was the `DataTable` sticky-column fix, already re-verified as part of that fix's own validation pass), re-read `DESIGN_SYSTEM_GAP_CONSOLIDATION.md` in full before starting, then composed the page from only what already existed. **Zero new components were created.**

## Components reused

| From `components/ui/` | From `components/shell/` |
|---|---|
| `Badge`, `Button`, `Combobox`, `DataTable` (+ `DataTableBulkAction`, `DataTableState`), `Dialog` family, `DropdownMenu` family, `Form` family, `Input`, `RiskIndicator`, `Select` family, `Tooltip` family, `Breadcrumb` | `AppShell`, `AppHeader`, `Sidebar` (+ `SidebarGroup`/`SidebarItem`/`SidebarBadge`/`SidebarFooter`), `OrganizationSwitcher`, `ProjectSwitcher`, `AccountMenu` |

Also reused: `ThemeToggle`, `toast()`/`useToast`, `cn()`, `Intl.NumberFormat` for currency (now used for a fourth time, for both `unitCost` and a newly-computed `totalValue`). **Not used this time**: `Textarea`, `Switch` — this page's "Add material" form turned out not to need either once the field set was finalized; neither was force-fit in just to match the prior three pages' form compositions.

## Patterns reused, and where each came from

- **The same vendor pool, synthetic-data-generator shape, and `Form`/`zod`/`Combobox` composition** used for all three prior pages, applied to an inventory shape (Item, Category, UOM, Quantity on hand, Reorder point, Unit cost, Warehouse, Vendor). The cross-field `.refine()` rule is the same *mechanism* every prior page used (a location/quantity combination blocking submission), with a new rule ("Central Warehouse has limited capacity — quantities over 1,000 must use a site yard") replacing each prior page's own.
- **`Badge` for Status and `RiskIndicator` for a derived risk dimension**, reused exactly as Procurement Log and Delivery Schedule did. The "Stockout risk" `RiskIndicator` level is *computed* from comparing `quantityOnHand` against `reorderPoint` (`computeStockoutRisk()`), not stored or hardcoded data — the same derivation pattern Delivery Schedule's `isOverdue()` cell check established, applied to a different domain question.
- **The sidebar reuses the exact nav structure already established**, including both previously-added/activated items ("Procurement Log" and "Deliveries," both present but inactive here). This page activates the pre-existing "Inventory" item under the "Procurement log" group — the exact, already-existing nav destination for this content — needing no new item, the same pure reuse Submittal Log and Delivery Schedule achieved with their own destinations.
- **The header chrome, responsive title+action stacking, and the View-detail-dialog's `<dl>`/`<dt>`/`<dd>` layout** are reused exactly from the three prior pages.
- **The Saved Views serialization contract is reused for the same dual purpose Delivery Schedule established**: `initialState` seeded with a real default (`sorting: [{ id: "quantityOnHand", desc: false }]`, surfacing the most-depleted materials first) rather than left empty, using the exact same prop both as "this page's natural default view" and as the target for a genuine user-saved snapshot.

## A new, deliberate use of an existing capability

**`Badge`'s `default` variant was used for the "Discontinued" status**, rather than reusing one of the five semantic colors (`success`/`warning`/`destructive`/`info`/`pending`) that every prior page's status vocabulary stayed within. This page's five statuses (In Stock/Low Stock/Out of Stock/On Order/Discontinued) map onto `success`/`warning`/`destructive`/`pending`/`default` — four semantic colors plus the neutral default, not five semantic colors. This refines, rather than just reconfirms, the "Badge has exactly five non-default variants, a real ceiling" finding already on record in `DESIGN_SYSTEM_GAP_CONSOLIDATION.md`: the realistic working ceiling is "four or five *semantic* meanings before collision," with `default` available as a genuinely distinct sixth slot for any status that isn't really a health/urgency signal at all (an inactive/archived state, here). See the Gap Analysis Report for the full implication.

## What was deliberately not built

Same reasoning as all three prior pages: no KPI/summary strip, no actual Saved Views feature. **New for this page, and the headline of `MATERIALS_INVENTORY_GAP_ANALYSIS.md`**: no stock-level gauge or progress visualization (despite this page's data — quantity relative to reorder point — being a near-textbook use case for one), and no inline quantity-increment control for the "Adjust stock" interaction. Both are named clearly as gaps rather than approximated with raw `div`s or ad-hoc `+`/`-` buttons, which would have meant inventing new UI the brief explicitly prohibits.
