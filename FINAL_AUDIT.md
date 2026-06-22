# Krane Design System — Final Audit

A fresh audit of the actual codebase — file listings, grep counts, and direct cross-checks, not a summary of `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md`'s own claims. Where this document's findings match those two, that's stated as confirmation, not assumed. Four findings below appear in neither prior doc. Documentation only — no code was changed to produce this.

---

## 1. Component inventory

**29 component files**: 22 in `components/ui/` (`alert`, `badge`, `button`, `checkbox`, `combobox`, `data-table`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `popover`, `radio-group`, `risk-indicator`, `select`, `skeleton`, `switch`, `table`, `textarea`, `toast`, `toaster`, `tooltip`), 5 in `components/shell/` (`app-header`, `app-shell`, `organization-switcher`, `project-switcher`, `sidebar`), 2 at `components/` root (`theme-provider`, `theme-toggle`). Plus `hooks/use-toast.ts` and `lib/utils.ts`.

File count understates real surface area — several files export multiple logical primitives: `form.tsx` (7: `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`), `table.tsx` (8), `dialog.tsx` (~7), `dropdown-menu.tsx` (~12), `sidebar.tsx` (6), `alert.tsx` (3). `COMPONENT_STATUS.md`'s own table groups by file/feature, not by every export — this audit matches that granularity rather than inventing a finer one.

**Cross-check against `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md`**: both docs' completed-component lists match the actual file list exactly — no file exists that either doc fails to mention, and no row in either doc names a file that doesn't exist. **20 demo routes confirmed** (`find app/demo -name page.tsx` = 20: 19 named subroutes + `/demo` itself), **20 homepage grid entries** confirmed via `app/page.tsx`'s `href` count — both docs' route counts are accurate, not stale.

## 2. Token inventory

`app/globals.css`: **62 tokens in `:root`, 61 in `.dark`** — the only delta is `--radius` (mode-independent by nature, correctly absent from `.dark`, not a gap). Diffed by name, not assumed: **zero tokens exist in one mode and not the other.** `--sidebar*`/`--badge-new` are deliberately duplicated with *identical* values in both blocks (confirmed via the file's own comments: "fixed Krane-navy brand surface... not theme-responsive"), not omitted from dark mode by oversight. **107 `@theme inline` registrations** bridge every raw token to a Tailwind-facing utility. This fully confirms both tracking docs' "Color: Complete" claim — re-verified from the file, not re-cited from the docs.

## 3. Dark mode coverage

**One hardcoded color literal remains in the entire codebase**: `Dialog`'s `bg-black/50` overlay — already documented in both tracking docs as a deliberate, legitimate exception (a scrim dims whatever's behind it regardless of that content's mode). An exhaustive sweep (`bg-white`, `bg-black`, `text-white`, `text-black`, `bg-gray-*`, `bg-slate-*`, raw hex) across every `.tsx` file under `components/` and `app/` found nothing else. `AppShell`'s previously-hardcoded `bg-white` content panel (`THEME_SWITCHER_FOUNDATION.md`'s audit finding) is confirmed fixed — gone from this sweep. The `.dark` class mechanism (`@custom-variant dark (&:is(.dark *))`) and the theme switcher (`ThemeProvider`/`useTheme`/`ThemeToggle`, `React.useSyncExternalStore`-based, no `next-themes`) are both confirmed wired into `app/layout.tsx`'s root. **Dark mode coverage is complete** — both tracking docs' claims hold under fresh inspection.

## 4. Accessibility coverage

A literal `aria-*` grep across every component is the wrong instrument used alone — it would flag `Dialog`, `Popover`, `DropdownMenu`, `Tooltip`, `Toast` as having zero accessibility consideration, when in fact their ARIA wiring (`role="dialog"`, `aria-expanded`, `aria-haspopup`, live-region behavior) is correctly handled *inside* the underlying Radix primitives these files wrap, invisible at the call-site grep level. That's expected, not a gap — the same "don't re-derive what the headless primitive already does correctly" principle this project applied when choosing `cmdk`/Radix in the first place. `Input` (14 `aria-*` occurrences), `Combobox` (11), and `Button` (11) carry the most explicit ARIA surface, consistent with being the components with the most documented accessibility correction history (`aria-invalid` auto-derivation, `aria-describedby` joins, the `data-invalid` fallback for `Combobox`'s trigger).

**One real, previously undocumented gap found this pass**: **`Skeleton` has no `role` or `aria-*` attribute at all** — `<div className="animate-pulse rounded-md bg-muted" />`, nothing else. Unlike `Badge` and `Table` (whose lack of explicit ARIA is *correct* — a badge's real text content and a table's native semantic elements already carry the signal AT needs, no supplementing required), a loading skeleton has no text content and no native loading semantics — a screen reader user gets nothing indicating that content is loading. Neither `COMPONENT_STATUS.md` nor `DESIGN_SYSTEM_PROGRESS.md` names this. Not flagged here as urgent (no component currently composes `Skeleton` in a way that leaves a screen reader user stranded mid-load without other cues — `Input`'s own `loading` state, for instance, carries its own spinner with implicit visual-only signal too, the same gap class), but it is a real, fixable, previously-unnamed item.

## 5. Form coverage

`FormField`/`FormControl` is confirmed exercised, in the real `/demo/form` page, against **6 of the system's field-shaped components**: `Combobox`, `Select`, `Input`, `Textarea`, `Switch`, `RadioGroup` (×2 fields). **`Checkbox` has never been composed inside `FormField`/`FormControl` anywhere in this codebase** — grepped directly, not assumed; every `Checkbox` usage found is in its own standalone demo, `Label`'s demo, `DropdownMenu`'s checkbox-item variant (a different primitive entirely), or `Table`/`DataTable`'s row-selection column. This isn't a known bug — `Checkbox` is Radix-backed with a real `button[role=checkbox]` element, the same shape `Switch` (which *is* verified) has, so it would likely compose correctly — but "likely" is exactly the gap `FORM_FOUNDATION.md`'s own pre-implementation audit was built to close for `Combobox` and `RadioGroup` before either shipped inside `Form`. `Checkbox` never got that same explicit check. Neither tracking doc names this.

## 6. Missing components

Confirmed accurate against the actual `components/ui/` listing — no file named `avatar.tsx`, `tabs.tsx`, `breadcrumb.tsx`, `card.tsx`, `progress.tsx`, `stepper.tsx`, or any command-palette primitive exists. Both tracking docs' "not started" lists match reality exactly: **Avatar** (App Shell renders a literal `<span>`), **Tabs, Breadcrumb, Card, Progress, Stepper/Wizard** (no spec, no code), **Command Palette** (`--z-command-palette` reserved, nothing else exists), plus `DataTable`'s named deferred scope (pagination, row-actions column, virtualization, status/risk-aware sort comparators, `DataTableColumnHeader` extraction, CSV export) and the App Shell's unwired notification/account-menu/i18n content.

## 7. Missing foundations

**Spacing is the one foundation category never formalized** — confirmed again: no `--spacing-*` token exists anywhere in `app/globals.css`; every gap/padding value across all 29 component files is a literal Tailwind utility (`gap-1.5`, `p-2`, `px-3`) chosen ad hoc. This has been flagged in every prior status pass without being acted on — now backfilled against ten components' worth of un-named spacing values rather than a clean slate, a cost that only grows the longer it's deferred. No other foundation gap was found: Color, Typography, Radius, Border, Shadow/Elevation, Motion, Z-index, App Shell layout, and Entry point are all independently re-confirmed complete in §2–3 above and by direct file inspection.

## 8. Technical debt

- **Spacing token scale** (§7) — the largest, longest-standing item.
- **No automated test suite, no visual-regression tooling** — confirmed again: zero `*.test.*`/`*.spec.*` files exist anywhere in the repository. Every "verified" claim across this entire project's history has been `tsc`/lint/build/`curl`/DOM-structure checks plus manual or Playwright-driven browser passes — real, but not automated, and nothing here would catch a future regression on its own.
- **`README.md` is still the unmodified `create-next-app` scaffold** — found fresh this pass, named in neither tracking doc. It documents nothing about Krane, the token system, the component inventory, or how to find any of the 23 foundation/status documents now in the repo root. A new contributor opening `README.md` first would learn nothing true about this project.
- **`components.json`'s `baseColor: "neutral"`** no longer describes this system (primary is brand yellow) — harmless until `shadcn add` is run again against this config.
- **`RiskIndicator`'s `label` override isn't validated against `level`** — contradictory text is possible and silent.
- **Mobile/responsive behavior is unimplemented everywhere**, not just the App Shell (explicitly desktop-only by instruction).
- **`Checkbox` inside `Form` is unverified** (§5) — small, but real.
- **`Skeleton` has no loading-announcement semantics** (§4) — small, but real.

## 9. Architectural risks

- **Every piece of this design system — every component, every foundation doc, every demo page built across this project's entire history — is sitt­ing uncommitted.** `git log` shows exactly one commit: the original `create-next-app` scaffold. `git status` shows 26 untracked entries and 5 modified files. This is the single largest *process* risk found this pass, distinct from any code risk: there is no version-controlled checkpoint of any of this work, anywhere. Not raised in either tracking doc.
- **The theme switcher is the one piece of this system built without a reference implementation to lean on as heavily.** Every other non-trivial component wraps an already-installed primitive (`radix-ui`, `cmdk`) whose correctness is externally maintained; `ThemeProvider`'s `useSyncExternalStore`-based store is this project's own code, chosen deliberately over `next-themes` (`THEME_SWITCHER_FOUNDATION.md`'s reasoned rejection), and is real but newer and less battle-tested than the Radix-wrapping majority of the system.
- **`cmdk` is the one component built on a non-Radix headless library.** If Radix ever ships its own combobox primitive, this becomes a live "migrate or keep" question; not urgent today, but the one place this system doesn't have a single underlying-primitive story.
- **Systemic, not local, blast radius on a few shared tokens.** `--ring` (focus) and `--destructive` (error) are each relied on by effectively every interactive component in the system. Both are confirmed correct today (§2–3), but a future miscalibration of either wouldn't be a one-component bug — it would be simultaneous, system-wide.
- **No automated regression coverage** (§8) means every one of the findings in this document was only catchable by deliberately looking — the same manual-or-Playwright-pass discipline that found this session's real bugs (`AppShell`'s `bg-white`, the various `Form`-integration gaps) has no standing mechanism to catch the *next* one without another full pass like this.

## 10. Recommended roadmap

Re-validated against this audit's findings, not just re-copied from the two tracking docs — both turn out to still be accurate:

1. **Avatar.** Small, closes a real, named App Shell gap (§6).
2. **DataTable: Pagination, then RowActions/`DataTableColumnHeader` extraction.** RowActions was always sequenced to follow `DropdownMenu`, already available.
3. **Spacing token formalization** (§7) — worth doing deliberately, once, rather than continuing to grow the backfill.
4. **Two small, cheap closes surfaced fresh by this audit, not previously queued**: verify `Checkbox` inside `FormField`/`FormControl` (§5) the same way `Combobox`/`RadioGroup` were verified before `Form` shipped; give `Skeleton` a `role="status"`/`aria-label` (§4). Neither is large enough to need its own foundation doc.
5. **Tabs, Breadcrumb, Card, Progress** — only once a real consuming module surfaces a concrete need; this project's own history shows building chrome ahead of an actual requirement is how scope creep has happened before.
6. **Stepper/Wizard, DataTable virtualization, mobile/responsive shell, CSV export, Command Palette, notification/account-menu content, i18n** — defer as a group until a real requirement forces the question.

Do not build anything from this list without a fresh, explicit go-ahead — this is a sequencing recommendation, not a standing work order. Separately, and not really a "roadmap" item: **commit the current working tree** (§9) before any of the above — a process recommendation, not a design-system one, but the single highest-leverage action available before doing anything else.

---

## Comparison: current implementation vs. `COMPONENT_STATUS.md` vs. `DESIGN_SYSTEM_PROGRESS.md`

Both tracking docs were found **accurate on every claim checked against the actual filesystem and codebase** — component lists, demo route counts, homepage grid counts, token completeness, dark-mode coverage, and the recommended build order all held up under fresh, independent verification (not re-reading the docs and trusting them). The two docs agree with each other on every point checked. **Four real findings surfaced by this audit appear in neither doc**: `Skeleton`'s missing loading-announcement accessibility (§4), `Checkbox`'s never-verified `Form` integration (§5), the stock, unmodified `README.md` (§8), and the fact that this entire project's work is uncommitted (§9). None of these are contradictions of either doc's claims — both docs simply never looked at these four specific angles. This audit's value is additive, not corrective.

---

## What is complete

Every foundation except Spacing (Color, Typography, Radius, Border, Shadow/Elevation, Motion, Z-index, App Shell layout, Entry point). Every field primitive (`Input`, `Label`, `Textarea`, `Select`, `Combobox`, `RadioGroup`, `Switch`) and the `Form` validation layer built on top of six of them. `Alert`. The theme switcher, including the one real prerequisite (`AppShell`'s content panel) it found and fixed. Every overlay/feedback primitive (`Popover`, `DropdownMenu`, `Dialog`, `Tooltip`, `Toast`+`Toaster`, `Skeleton` visually if not yet accessibly). `Button`, `Badge`, `RiskIndicator`, `Checkbox`, `Table`. Dark mode, end to end, down to the last hardcoded literal found and fixed. The App Shell as a *layout*.

## What is partially complete

`DataTable` (v1 shipped; pagination, row-actions, virtualization, sort comparators, CSV export, and header-extraction explicitly deferred). The App Shell as a *product surface* (layout complete; notification bell, account menu, language i18n visually present and entirely unwired; Avatar is a literal `<span>`). `Checkbox`'s `Form` compatibility (works standalone, never verified composed). `Skeleton`'s accessibility (correct visually, silent to assistive tech).

## What is missing

Spacing tokens. Avatar, Tabs, Breadcrumb, Card, Progress, Stepper/Wizard, Command Palette as components. Any automated test suite or visual-regression tooling. A README that describes this project. A version-control checkpoint of any of this work.

## What should never be built

Drawn from this project's own, already-reasoned rejections, not invented fresh for this document — restated here because a final audit is exactly the place a "don't re-litigate this" list belongs:

- **`next-themes`**, or any theme-switching dependency — the problem was small enough to hand-roll correctly, and reaching for one now would undo a deliberate decision, not fill a gap.
- **A `useDataTable` hook exposing the internal TanStack Table instance** — a deliberate v1 simplification, traded against flexibility on purpose.
- **A fifth "discovery"/announcement `Alert` variant**, or any variant beyond info/success/warning/error — `info` already covers the one named use case; Atlaskit's own five-tone model was evaluated and explicitly not adopted.
- **Multiple theme variants per mode** (Primer's dimmed/high-contrast pattern, Atlaskit's multi-theme model) — real systems, no named Krane consumer for anything beyond one light and one dark theme.
- **Icon-override props on `Alert` or `Toast`** — neither has ever had a consumer ask for one; both stay variant-locked, matching GitHub Primer's stricter stance over Material UI's more permissive one.
- **Auto-dismiss timers on `Alert`** — would blur the one structural distinction (`Alert` persistent, `Toast` transient) this system's entire feedback-primitive split is built around.
- **A `Label` size variant** — rejected once already, matching every externally-reviewed reference system.
- **Unifying `Badge` and `RiskIndicator` into one palette/shape** — tried and rejected; users' learned green/red conventions for "status" and "severity" are different mental models, and collapsing them risks a Warning/Risk hue collision in dense tables.
- **A second, six-component `Alert` API** (`AlertActions`/`AlertClose`/`AlertAction` as separate exports) — the foundation doc's own sketch suggested it; the simpler, prop-driven three-component shape that shipped loses no documented capability.
- **Building Tabs/Breadcrumb/Card/Progress/Stepper speculatively** — this system's own history (this exact roadmap section, multiple times over) treats building general chrome ahead of an actual consuming requirement as the proven way scope creep has happened before, not a hypothetical risk.

## Design system completion percentage

A single number invites false precision, so the breakdown is shown rather than just the headline:

| Category | Estimate | Basis |
|---|---|---|
| Foundations (Color/Typography/Radius/Border/Shadow/Motion/Z-index/Layout/Entry) | **90%** | 9 of 10 complete; Spacing is the only gap. |
| Field primitives + Form validation layer | **100%** | All 7 primitives + validation layer shipped, demoed, verified — `Checkbox`'s unverified `Form` slot (§5) is a small caveat on an otherwise-closed chain. |
| Feedback/overlay primitives (`Toast`, `Alert`, `Dialog`, `Popover`, `DropdownMenu`, `Tooltip`, `Skeleton`) | **95%** | All shipped and functioning; `Skeleton`'s accessibility gap (§4) is the only deduction. |
| Theming (dark mode + switcher) | **100%** | Tokens complete, mechanism complete, switcher built, one real prerequisite found and fixed, verified visually. |
| Layout/Shell as a product surface | **70%** | Layout itself complete; notification/account-menu/i18n content and Avatar are real, named, unwired gaps. |
| Enterprise-scale data components (`DataTable` advanced scope) | **55%** | v1 shipped; pagination, row-actions, virtualization, CSV export, sort comparators all explicitly deferred. |
| Net-new components identified as needed (Avatar, Tabs, Breadcrumb, Card, Progress, Stepper, Command Palette) | **0%** | No spec beyond a name, no code, for any of the seven. |
| Quality infrastructure (automated tests, visual regression, version control checkpoint) | **0%** | None exists; every verification in this project's history has been manual or one-off scripted. |

**Blended estimate: approximately 80%** of the scope this project has itself identified as in-scope — weighted toward the foundation and component work, which is both the largest share of total effort and the most completely finished, with quality infrastructure and net-new components as the two categories pulling the number down from where the component list alone would suggest. This is a measure against *self-identified* scope, not an external enterprise-design-system benchmark — no claim is made here that the identified scope is itself complete or final.
