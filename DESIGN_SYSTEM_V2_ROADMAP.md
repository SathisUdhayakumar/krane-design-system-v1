# Krane Design System — v2 Implementation Roadmap

Sourced from `DESIGN_SYSTEM_GAP_CONSOLIDATION.md`, read fresh in full to produce this document. **One addition beyond the literal instruction, flagged rather than silent**: four findings from `MATERIALS_INVENTORY_GAP_ANALYSIS.md` were never folded into the consolidation doc (that page was built after the consolidation pass). Excluding them would mean planning v2 against known-stale information, so they're included below, each marked `(new since consolidation)`. Everything else traces to the consolidation doc as instructed.

**Severity is re-scaled from the consolidation doc's four tiers to the three this roadmap asks for**: P0 stays P0; P1 ("recurring workaround") stays P1; P2 ("quality improvement") and P3 ("enhancement") both fold into P2, since a three-tier scale has no fourth bucket to put them in. Where a P3 item's severity is *effectively* raised by new evidence (the numeric-range filter, no longer hypothetical after Materials Inventory), that's called out explicitly rather than silently re-ranked.

No code is written or changed anywhere in this document — planning only.

---

## How to read each table

| Field | Meaning |
|---|---|
| **Impact** | What real consequence follows from leaving this unaddressed. |
| **Severity** | P0 = blocks shipping a real workflow · P1 = recurring, already-paid workaround cost · P2 = real but not yet costly |
| **Effort** | Small (hours, isolated, low risk) · Medium (days, touches one subsystem, some design judgment) · Large (weeks, new architecture, cross-cutting) |
| **Dependencies** | What this needs to exist or be decided first, if anything |
| **Order** | Which phase (1–6) of the rollout at the bottom of this document this item belongs to |

---

## 1. Foundation improvements

| Gap | Impact | Severity | Effort | Dependencies | Order |
|---|---|---|---|---|---|
| No `--spacing-*` token scale | Every component and page (16+ so far) chooses spacing ad hoc; nothing is checkable against a standard, and drift becomes harder to catch the more that gets built on top of it | P1 | Medium | None | 5 |
| No sixth-or-later semantic color token | `Badge`'s real ceiling (see §2) is four-or-five semantic meanings before two concepts must share a color; not yet hit, one constraint away | P2 | Small | None — but should be decided alongside any move to give `Badge` a sixth semantic variant | 5 |

## 2. Existing component enhancements

| Gap | Impact | Severity | Effort | Dependencies | Order |
|---|---|---|---|---|---|
| `DataTable` risk/status columns sort lexicographically, not by severity rank *(new since consolidation)* | A user sorting a risk or status column to surface the most urgent rows first gets alphabetical order instead — confirmed with live data on Materials Inventory (`critical, critical, … high, high…` ascending, not severity order) | P1 | Medium | None | 2 |
| `DataTable` filter system limited to `text`/`select`/`dateRange` (no searchable/entity variant) | Every "Vendor"-shaped filter across four pages used `select` as a stand-in, which only works while the option list stays short enough to enumerate | P1 | Medium | None; natural to batch with the numeric-range variant below (same filter-variant subsystem) | 2 |
| `DataTable` has no numeric-range filter variant | Named once as P3/hypothetical; Materials Inventory made it concrete — "below reorder point" and "over $X" are that page's two most natural filters and neither is buildable | P1 *(raised from P2 — no longer hypothetical)* | Medium | Natural to batch with the searchable-variant work above | 2 |
| `DataTable`'s `columnFilters` has no controlled-prop pair (unlike `sorting`/`globalFilter`/`pagination`) | Blocks any externally-triggered quick-filter button ("Today," "Below reorder point") — the *initial* value is settable once at mount, never live | P1 | Small–Medium | None; natural to batch with the two filter-variant items above | 2 |
| No exported `DataTableColumnHeader` | The sortable-header behavior works correctly everywhere; it just can't be reused outside `DataTable`'s own internal rendering — an abstraction debt | P2 | Small | None; efficient to do alongside the sort-defect fix above (same code region) | 2 |
| No in-flight visual state on rows during a bulk action | The pending spinner shows only on the clicked button; affected rows look unchanged on every page that's used bulk actions (four so far) | P2 | Small–Medium | None | 6 |
| No row-click-to-view interaction | `TableRow` forwards only native props; "View" is reachable solely through the kebab menu on every page | P2 | Medium | Worth designing alongside inline editing and column resize/reorder below — three separate changes to the same interaction model are easier to get right designed together, even if shipped separately | 6 |
| No inline cell editing | TanStack Table supports it at the engine level; Krane's wrapper never exposes it — every "Edit" row action is a toast, not a real edit | P2 | Large | Same note as row-click-to-view above | 6 |
| No column resize or reorder | Also available in the underlying engine, also never wired up; visibility toggling exists, resize/reorder don't | P2 | Large | Same note as row-click-to-view above | 6 |
| No confirm-before-bulk-action step | Destructive bulk actions (Reject, Discontinue, Flag as delayed) fire immediately with no confirmation — `Dialog` already exists to build this with | P2 | Small–Medium | None | 6 |
| No page-level action overflow pattern | Three primary actions already need `flex-wrap` to avoid clipping; nothing like `DataTable`'s row-action kebab-menu consolidation exists for a page's own toolbar | P2 | Medium | None | 6 |
| `Button` has no `loading` prop (unlike `Input`/`Combobox`) | Every async submit button across four pages hand-manages its own disabled state and label swap — the most mechanically-repeated workaround on record | P1 | Small | None | 1 |
| `DialogContent` has no default `overflow-y-auto` for tall content | Every form-in-a-dialog across four pages needed the consumer to remember this manually; nothing in `Dialog`'s own API flags the requirement | P1 | Small | None | 1 |
| `Badge`'s real ceiling is "four-or-five semantic meanings plus one neutral slot," not strictly five *(new since consolidation)* | Materials Inventory used `default` for a non-health status ("Discontinued") rather than reusing a semantic color — refines, doesn't replace, the original five-variant finding | P2 | Small (documentation) | None | 5 |
| No written guidance for `Badge` vs. plain text on categorical table columns | Two pages independently made this judgment call differently (Status → `Badge`, Stage → plain text), both defensibly — no single place records the rule | P2 | Small (documentation) | None | 5 |

## 3. New components

| Gap | Impact | Severity | Effort | Dependencies | Order |
|---|---|---|---|---|---|
| No `Card` or stat-tile primitive | Four pages independently wanted a KPI/summary strip and built without one — the concrete, repeated need this system's own "wait for a real need" discipline was holding out for | P2 | Medium | None | 4 |
| No Drawer/Sheet (slide-in side panel) | Every "view detail" interaction across four pages used a centered, blocking `Dialog` instead — a real, accepted compromise, not equivalent UX | P2 | Medium–Large | None | 4 |
| No progress/gauge visualization *(new since consolidation)* | Resolves the consolidation doc's open "Data Visualization" question with a concrete case: Materials Inventory's quantity-vs-reorder-point relationship is close to a textbook use case this system has no way to show proportionally | P2 | Small–Medium | None | 4 |
| No numeric increment/stepper control *(new since consolidation)* | A "+/− quantity" interaction has no home under any name. **Explicitly not the same gap as the existing `Stepper` component** (a multi-step wizard indicator) — naming this distinction to head off future confusion from the shared name | P2 | Small | None | 4 |

## 4. Accessibility improvements

| Gap | Impact | Severity | Effort | Dependencies | Order |
|---|---|---|---|---|---|
| `DataTableRowActionsMenu`'s kebab button uses a static, non-row-specific `aria-label="Row actions"` | A screen-reader user tabbing through any table hears the identical announcement on every row, with no way to distinguish which row's menu is focused — confirmed on four pages, independent of column-pinning side | P1 | Small | None | 1 |
| `SidebarItem`'s `active` state sets no `aria-current="page"` | `Breadcrumb` on the same pages correctly marks its current segment; `Sidebar` doesn't — two "you are here" signals, one accessible, one not — confirmed on four pages | P1 | Small | None | 1 |
| No skip-to-content link in `AppShell` | Every page's five-group, dozen-plus-item sidebar must be fully tabbed through before reaching page content | P1 | Small | None | 1 |
| `RiskIndicator`'s `label` override isn't validated against `level` | A contradictory override is possible and silent — low severity, but `RiskIndicator`'s visible/announced text is exactly what this prop can make misleading | P2 | Small | None | 1 |

## 5. Enterprise workflow primitives

| Gap | Impact | Severity | Effort | Dependencies | Order |
|---|---|---|---|---|---|
| No permission/role-gating primitive anywhere in the system | `Sidebar`, `AccountMenu`, and every `DataTable` row/bulk action render identically regardless of who's looking — blocks shipping any of the four built workflows (procurement approval, submittal review, delivery confirmation, inventory adjustment) to real users in their current everyone-sees-everything form | P0 | Decision: Small · Build: Large | None to *start* design work; final shape should account for how it threads through `Sidebar`/`AccountMenu`/`DataTable` actions, so those three should be stable (they are) before locking the API | 3 (decision) / 6 (build) |
| No calendar, timeline, or Gantt-style date-visualization primitive | Krane's own `Sidebar` already names "Project Schedule" and "Lookahead Plan" as real destinations neither of which can be built credibly as a table the way Delivery Schedule could — a scoping decision blocking already-anticipated, not speculative, work | P0 | Decision: Small · Build (if in scope): Large | The *decision* has no dependency and should happen immediately; the *build*, if the decision is "yes," depends on that decision and warrants its own foundation doc and audit, the same discipline every other component here has had | 3 (decision) / 6 (build, if scoped in) |

---

## Recommended phased rollout for v2

Phases group items that share dependencies or touch the same subsystem, so each phase is something one focused effort could plausibly ship together — not a strict calendar.

**Phase 1 — Independent, Small-effort, zero-dependency fixes** *(6 items)*: `DataTableRowActionsMenu`'s `aria-label`, `SidebarItem`'s `aria-current`, the `AppShell` skip-to-content link, `RiskIndicator`'s label/level validation, `Button`'s `loading` prop, `DialogContent`'s default scroll handling. Nothing here blocks on anything else; nothing here is risky. Highest ratio of confirmed-real-need to effort in this entire roadmap.

**Phase 2 — The `DataTable` filtering and sorting subsystem, as one effort** *(5 items)*: the lexicographic-sort defect, the searchable filter variant, the numeric-range filter variant, controlled `columnFilters`, and the exported `DataTableColumnHeader` (bundled in because it touches the same header/sort code the lexicographic-sort fix does). All five touch the same area of `components/ui/data-table.tsx`. Doing them as five separate, disconnected patches risks the filter/sort system accumulating exactly the kind of inconsistency this whole exercise was built to catch; doing them together is barely more expensive and considerably safer.

**Phase 3 — The two P0 decisions** *(2 items)*: decide, in writing, whether calendar/timeline-shaped views are in scope at all, and commit to either building a permission/role-gating primitive or writing down that authorization is explicitly out of this system's scope. Neither decision is expensive to *make*; both are expensive to leave *un*made, since they're the two items standing between this system and a real, shippable version of any workflow already built against it. (This phase covers only the *decisions* — the resulting builds, if greenlit, land in Phase 6.)

**Phase 4 — New standalone components with no cross-dependencies** *(4 items)*: `Card`, `Drawer`/`Sheet`, the progress/gauge primitive, the numeric increment control. Each can be built and shipped independently, in any order, whenever capacity exists — none blocks or is blocked by anything else in this roadmap.

**Phase 5 — Token and documentation cleanup** *(4 items)*: the `--spacing-*` scale, the sixth-semantic-color question, the `Badge` ceiling clarification, and the `Badge`-vs-plain-text guidance. Deliberately last: each is real, but none has caused a single visible defect across four pages and a foundation audit — the cost of waiting is low, and batching them avoids four small, separate documentation-only changes.

**Phase 6 — The larger, riskier builds** *(8 items)*: permission/role-gating's actual implementation (once Phase 3's decision is made), the calendar/timeline build (if Phase 3 decides it's in scope), and the remaining `DataTable` interaction-model expansion — row-click-to-view, inline cell editing, column resize/reorder, confirm-before-bulk-action, page-level action overflow, and in-flight row state during bulk actions. The last five are grouped here, not earlier, because they're all changes to how a user *interacts* with a table rather than fixes to something already broken — designed as one coherent pass even if shipped incrementally, since five separate, uncoordinated changes to the same interaction model is how inconsistency compounds.

Nothing in this roadmap should be started without a fresh, explicit go-ahead — this is a sequencing recommendation for planning v2, not a standing work order, consistent with how every prior status document in this repository has drawn that same line.
