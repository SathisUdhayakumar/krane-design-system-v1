# Krane Design System — Select Foundation

Audit + specification only — nothing implemented. This is the first document in this project to seriously interrogate the question every other Select write-up so far (`FORM_SPECIFICATIONS.md`, `FORM_FOUNDATION_PLAN.md`, `DESIGN_SYSTEM_ROADMAP.md`, `COMPONENT_STATUS.md`) has quietly assumed away: whether a non-searchable dropdown is even the right primitive for Krane's actual domain entities.

## Audit: existing codebase state

- **`FORM_SPECIFICATIONS.md`'s Select section already exists, and already assumes Radix Select is sufficient** — visual spec, states, token usage, accessibility, and a full API design are written, but every example given (`vendor categories`, generic grouped lists) implicitly assumes a short, scrollable, in-memory list. Search, async loading, multi-select, and virtualization are not mentioned anywhere in that section. This document does not throw that spec away — its Radix-backed mechanics are correct and reusable — but it does correct the scope: that spec describes *one* of the two components Krane actually needs, not the whole answer.
- **`FORM_FOUNDATION_PLAN.md` confirms**: Radix `Select` is already installed (part of the `radix-ui` bundle) and unused; Select needs `"use client"` (it wraps a stateful Radix primitive, same reasoning as Checkbox/Popover/DropdownMenu/Dialog/Tooltip/Toast); no new floating-surface recipe should be invented — Select must reuse Popover/DropdownMenu's `bg-popover`/`border-border`/`shadow-md`/animate-in-out block exactly.
- **No search/combobox-capable dependency exists in this codebase.** Confirmed directly against `package.json`/`package-lock.json`: no `cmdk`, no `react-select`, no `downshift`, no `react-window`/`@tanstack/react-virtual`. Only `@radix-ui/react-select` (via the `radix-ui` bundle) is present, and it is unused.
- **`COMPONENT_STATUS.md`, `DESIGN_SYSTEM_PROGRESS.md`, and `DESIGN_SYSTEM_ROADMAP.md` all currently slot "Select" into the same bucket as RadioGroup/Switch** — "wrap an already-installed Radix primitive," the same shape of work as five components before it. That framing is accurate for *bounded* pickers (status, category, CSI division) and actively wrong for the highest-value entities named in this audit's brief — vendor, manufacturer, material, project, user — none of which is a short, fixed, scrollable list in a real procurement system. This document's job is to make that distinction explicit before any code gets written, not discover it mid-implementation.

---

## 1. Purpose

Lets a user choose exactly one value from a set of options the system already knows about. Unlike `Input`/`Textarea`, where the user supplies novel content, `Select`'s entire value space is predefined — so the central design question isn't "how does typing feel," it's **"how does finding the right option feel, at the actual cardinality this option set has in production."** That cardinality spans two genuinely different regimes in Krane's own domain: fixed enumerations under ~50 items that rarely change (CSI division, status), and open-ended, growing entity catalogs that can run into the hundreds or thousands (vendor, manufacturer, material, project, user). Treating both as the same component is the single biggest risk this document exists to flag.

## 2. Visual specification

**Trigger**: matches `Input`'s visual recipe exactly — `rounded-md border border-input bg-background px-3`, a `<button>` (not a native `<select>` — full styling control is the entire reason this project already chose Radix Select over native, per `FORM_SPECIFICATIONS.md`). Selected value (or placeholder) left-aligned, truncated (`truncate`) if it overflows, a `ChevronDown` icon right-aligned (`justify-between`), rotating 180° when open (`data-[state=open]:rotate-180`) — a small addition beyond the original spec, cheap and already-conventional (DropdownMenu/Popover triggers in this codebase don't currently rotate an icon, but nothing else currently has a persistent open/closed indicator on the trigger itself either; worth doing here specifically because a closed Select and a closed Input are otherwise visually identical, and the chevron is the one cue that this field opens something).

**Content**: the exact Popover/DropdownMenu floating-surface recipe — `bg-popover text-popover-foreground border border-border rounded-lg shadow-md`, the same `data-open:animate-in data-closed:animate-out …` block. Zero new variant, per `FORM_FOUNDATION_PLAN.md`'s explicit instruction.

**Item**: same row shape as `DropdownMenuItem` (`data-highlighted:bg-accent data-highlighted:text-accent-foreground`), `Check` indicator via `Select.ItemIndicator`, shown only for the current value — the same absolute-positioned-icon pattern `DropdownMenuCheckboxItem` already established.

**The second component this document recommends (§6 below) — a searchable Combobox** — uses an **identical trigger** to the above. A consumer (and an end user) should not be able to tell which Select they're looking at until they open it; the difference is entirely in what the content panel does, not in how the closed field presents itself. Content for the searchable variant adds one element: a search input pinned to the top of the panel, styled as `Input`'s `sm` size, with the option list below it and a centered, muted empty-state row (`text-caption text-muted-foreground`) when nothing matches.

## 3. Trigger behavior

- Click, `Enter`, or `Space` while focused opens the panel; `Escape` or click-outside closes it without changing the value; closing returns focus to the trigger — the same floating-UI convention already established by Popover/Dialog/DropdownMenu.
- **Radix Select's default open position is item-aligned, not anchor-aligned** — the panel opens so the *currently selected item* lands under the trigger, not so the panel's top edge lands under the trigger the way Popover/DropdownMenu do. This is a deliberate, distinctive Radix Select behavior (the user's eye is already on their current selection) worth documenting explicitly so a future consumer doesn't pass `position="popper"` to "fix" something that wasn't broken, without understanding they're trading away that behavior.
- The searchable variant's trigger opens the same way, but focus lands in the search input, not on a list item — typing filters immediately, arrow keys then move a highlighted row, `Enter` selects it.

## 4. Typography

**`text-sm`** (Input's bare token), not `Textarea`'s `text-body` — for the trigger's value/placeholder text and for item labels. This is a deliberate, explicit choice, not an oversight: `text-body`'s entire justification (§3 of `TEXTAREA_FOUNDATION.md`) is a `1.5` line-height for content that wraps. Select's displayed value never wraps — it truncates on one line, the same nature as Input's content, not Textarea's. `text-muted-foreground` for placeholder text (Radix's `data-placeholder` state) and for the searchable variant's empty-state caption.

## 5. Sizes

**`sm`/`default`/`lg`, matching `Input`'s scale exactly** (`h-8 px-2.5 text-xs` / `h-9 px-3 text-sm` / `h-10 px-3.5 text-sm`) — the opposite call from `Textarea`, and deliberately so: `Textarea` got no size tier because its height is content-driven (multi-line, resizable); Select's trigger is fixed-height, single-line, exactly Input-shaped. Reusing Input's three tiers verbatim means a Select sitting beside an Input in the same form at the same size lines up pixel-for-pixel, with no Select-specific scale to maintain separately. Applies identically to the searchable variant's trigger (§2) — the content panel's internal search input stays at `Input`'s `sm` size regardless of the trigger's own tier, the same way Popover/DropdownMenu content doesn't scale with a "trigger size" concept either.

## 6. States

| State | Treatment |
|---|---|
| Default | `border-input bg-background`. No value: placeholder in `text-muted-foreground` (Radix `data-placeholder`) |
| Focus | `outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring` — identical mechanism to every other field in this system |
| **Open** | Content visible via the `data-open:animate-in` block; trigger's chevron rotates (§2) — not in the original spec, a small, cheap, conventional addition |
| Disabled | `disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50` |
| **Read-only** | **Does not exist on the underlying platform and has to be built, not inherited.** MDN is explicit: `readonly` is only meaningful on text-like controls (`Input`, `Textarea`) — "for other controls… there is no useful distinction between being read-only and being disabled, so the `readonly` attribute does not apply" to `<select>`. Radix Select has no `readOnly`-equivalent prop either. Krane needs its **own** `readOnly` prop, implemented as `disabled` for interaction purposes (the trigger can't be opened) but styled with `Input`/`Textarea`'s read-only treatment, not the disabled one — full opacity, `bg-muted`, `cursor-default`, **and the chevron icon hidden entirely** (a control that can't be opened shouldn't display the affordance that says it can). This is the one state in this document that's a genuine Krane-specific construct, not a pass-through of something Radix or the platform already solved — flagged here explicitly so it isn't discovered as a surprise mid-implementation, the same kind of correction `LABEL_FOUNDATION.md` made for `Label`'s disabled mechanism. |
| **Error** | `status="error"` → `border-destructive ring-3 ring-destructive/20` (+ dark variants) on the trigger, auto-deriving `aria-invalid={true}` unless the consumer sets their own — identical mechanism to `Input`/`Textarea`. |
| **Success** | `status="success"` → `border-success`, reinforced on `focus-visible` with `ring-success/20` — same quieter-than-error treatment already established. |
| **Warning** | `status="warning"` → `border-warning`, `focus-visible:ring-warning/20`. |

## 7. Accessibility requirements

- Radix Select implements the listbox keyboard/ARIA pattern correctly out of the box (arrow keys, `Home`/`End`, type-ahead, focus management) — "don't hand-roll what the primitive already solves," the same principle already applied to every Radix-backed component in this system.
- The trigger must expose the current value's text accessibly (`Select.Value`) — placeholder text must never be the *only* accessible name once a value is selected (already correctly speced, carried forward unchanged).
- `Label` pairing via `htmlFor`/`id`, with `id` on `SelectTrigger` — the actual focusable element, not the `Select` root (already correctly speced, carried forward unchanged).
- Long lists get Radix's `ScrollUpButton`/`ScrollDownButton` — **this is a manual-scroll affordance, not virtualization**, worth stating plainly since this audit specifically separates those two as distinct dimensions (§ comparison, below) and they're easy to conflate.
- **The searchable variant must implement the real WAI-ARIA combobox pattern** (`aria-expanded`/`aria-controls`/`aria-activedescendant` tracking the filtered, highlighted row as the user types) — this is exactly the part of "don't hand-roll it" that's hardest to get right from scratch, and exactly why §6's recommended foundation (`cmdk`) matters: it implements this pattern correctly already, rather than asking Krane to re-derive it.
- **A zero-results empty state needs to be perceivable to screen-reader users in the moment**, not just visually present — the same category of gap `INPUT_GAP_ANALYSIS.md` already flagged generally ("no live-region pattern for async state changes"). A real requirement for the Combobox demo (§11) to get right, not a detail to skip because the visual empty state already "looks done."

## 8. API design

Two components, sharing a trigger but diverging in content. **Neither is frozen — nothing is implemented yet** (same hedge already used in `LABEL_FOUNDATION.md`/`TEXTAREA_FOUNDATION.md` before each shipped).

```ts
// Select (Radix-backed) — bounded, fixed-enumeration case
// Root
{ value, onValueChange, defaultValue, disabled, name, required }
  + readOnly?: boolean   // Krane-specific — see §6, no native/Radix equivalent

// SelectTrigger
VariantProps<typeof selectTriggerVariants>  // size: sm/default/lg · status: default/success/warning/error
  & React.ComponentProps<"button">

// SelectContent
{ position?: "item-aligned" | "popper" }   // Radix default unchanged, see §3

// SelectItem
{ value: string, disabled?: boolean, children }

// SelectGroup, SelectLabel, SelectSeparator — unchanged from the original spec
```

```ts
// Combobox (cmdk-backed) — open-ended entity-catalog case, see §6
// ComboboxTrigger — visually identical to SelectTrigger, same size/status variants
{ value, onValueChange, placeholder?, disabled?, readOnly? }

// ComboboxContent
{ options: { value: string; label: string; disabled?: boolean }[]
  searchPlaceholder?: string
  emptyMessage?: string }
```

The Combobox shape above is intentionally rougher than Select's — it's a documentation-stage sketch of where the API would land given a `cmdk`-backed implementation, not a frozen contract. Async loading and multi-select are deliberately absent from both shapes (§13/§14, future evolution).

## 9. Composition patterns

| With | Pattern |
|---|---|
| **Label** | `htmlFor`/`id`, stacked above, `id` on `SelectTrigger` (or `ComboboxTrigger`) — identical mechanism to `Input`. Nothing Select-specific. |
| **Input** | Visual and rhythm consistency in a shared form: identical height tiers (§5) so the two line up in a mixed form, shared `status` vocabulary, same `gap-1.5`/`gap-4` stacking rhythm already established by `Input`/`Textarea`'s own demos. A realistic example: vendor-creation form with `Input` (name) + `Select` (CSI division) + `Combobox` (manufacturer), all under shared `Label`s, all reading as one family. |
| **FormField (future)** | Not built yet (`react-hook-form` isn't installed). `value`/`onValueChange` is already `Controller`-compatible, the same property already true of `Checkbox`/`Input`/`Textarea`. One real nuance worth flagging now rather than rediscovering later: a `Combobox`'s `options` array will typically come from a query/fetch hook that lives *outside* the Form layer (server-sourced vendor/material data) — `FormField` should own the selected value only, never the options list itself, or the two concerns get tangled the moment async loading (§13) is added. |

## 10. Enterprise use cases

- **CSI division** (`Select` — a fixed, ~50-item industry-standard enumeration that essentially never changes) on a material/line-item entry form.
- **Vendor** (`Combobox` — realistically hundreds of records in an active procurement system) on PO creation.
- **Manufacturer** (`Combobox`, same cardinality reasoning) on material/product creation.
- **Material / SKU** (`Combobox` — the highest-cardinality entity in this list; a real catalog can run into the thousands) on a PO line-item row. The single strongest argument in this entire document for why a non-searchable list is not an acceptable v1 answer for at least one named entity.
- **Project** (`Combobox` — cardinality depends on org size, but even a few dozen active projects makes scanning slower than typing).
- **User / assignee** (`Combobox`) for approval routing, "assign to," watcher lists — directly analogous to the Jira assignee picker and GitHub's own Assignees/Reviewers `SelectPanel`, both cited in the comparison below as the same problem Krane is solving.
- **Status / category** (`Select`, small fixed enumeration) — for filtering UI elsewhere in the system (e.g. a future `DataTable` filter row).

## 11. Demo requirements

- Basic `Select`, 4–5 options (per the original spec).
- `Select` with grouped options (`SelectGroup`+`SelectLabel`) — domain example: CSI divisions grouped by division category.
- `Select`: disabled, **read-only** (showing the corrected, distinct-from-disabled treatment from §6 — no chevron, full opacity), all four `status` values.
- A long `Select` list (15+ items) exercising `ScrollUpButton`/`ScrollDownButton` — captioned explicitly as scroll, not virtualization, per §7.
- `Combobox`: live search over a realistic vendor list (15–30 example vendor names).
- `Combobox`: empty state ("No vendors found").
- `Combobox`: a clear-selection control once a value is picked — explicitly demoed, since "clear selection" is one of this audit's eight evaluated dimensions and several reference systems treat it as expected baseline behavior, not an add-on.
- One mixed-form composition: `Input` (vendor name) + `Select` (CSI division) + `Combobox` (manufacturer) under shared `Label`s, proving §9's consistency claim rather than just asserting it.

---

## Comparison: Native Select, Radix Select, Material Design, Atlassian Design System, Shopify Polaris, GitHub Primer

| Dimension | Native `<select>` | Radix Select | Material (MUI) | Atlaskit | Polaris | Primer |
|---|---|---|---|---|---|---|
| **Searchable** | No — type-ahead jump-to-letter only | No — same type-ahead only; search exists only as unofficial community add-ons (e.g. Fuse.js-based forks) | `Select`: no. **`Autocomplete`**: yes | **Yes, by default** — `@atlaskit/select` is react-select-based | `Select`: no, by design ("4+ options… avoid cluttering"). **`Combobox`/`Autocomplete`**: yes | `Select`: no. **`SelectPanel`**: yes, the actively-promoted modern component |
| **Async options** | No — options must be re-populated by hand, no loading affordance | No first-class hook — consumer manages it entirely outside the primitive | `Autocomplete` ships an official large-dataset demo paired with async fetching | Dedicated `AsyncSelect`/`AsyncCreatableSelect` variants — first-class | Consumer-managed loading state on `Combobox`/`Autocomplete` | First-class — `:remote` (query on every keystroke) and `:eventually_local` (query once on open) fetch strategies |
| **Large datasets** | OS picker tolerates thousands but offers no way to *find* one | Same — `Viewport` renders every item; scroll-button affordance only | `Autocomplete`'s own large-dataset demo explicitly pairs it with virtualization (next row) | `react-select` is documented as needing a separate windowing add-on at real scale | `Combobox` filters client-side; no built-in ceiling raise | Explicitly punts to **server-side filtering** rather than rendering large lists client-side at all |
| **Virtualization** | N/A — OS-rendered | Not built in | Not built into `Autocomplete` itself — MUI's own demo adds `@tanstack/react-virtual` separately | Not built into `react-select` core — a separate windowing package is the documented path | Not built in | Not built in — server-side filtering is the substitute, not virtualization |
| **Multi-select** | `multiple` attribute exists — workable on mobile, poor desktop UX (non-discoverable ctrl/cmd+click) | **Not supported** — open, unresolved upstream feature request | Both `Select` and `Autocomplete` support `multiple` | Yes, first-class (`isMulti` / dedicated `CheckboxSelect`) | `Combobox` has an explicit documented multi-select example | `SelectPanel` is first-class multi-select, including "cancel discards selections made this session" semantics |
| **Grouped options** | `<optgroup>` — but screen-reader exposure is **inconsistent across browsers** (Chrome doesn't expose `optgroup` in its accessibility tree at all; Firefox does) | `Select.Group`+`Select.Label` — solid, consistent support | `ListSubheader`/native `optgroup`, or `Autocomplete`'s `groupBy` | Supported | Not a primary documented `Combobox` pattern — flatter lists are the norm | Not a primary documented feature |
| **Clear selection** | No built-in clear — only re-selecting a hidden blank `<option>` | No built-in clear control | `Autocomplete` ships a clear icon by default | `isClearable` — first-class | Expected, common pattern | Common pattern in panels |
| **Placeholder** | Hacky — a disabled, selected, hidden first `<option>` | First-class (`Select.Value`'s placeholder + `data-placeholder` state) | First-class on both | First-class | First-class | First-class |

**Sources**: [Radix Select docs](https://www.radix-ui.com/primitives/docs/components/select) · [Radix multi-select feature request (open)](https://github.com/radix-ui/primitives/issues/1270) · [MUI Autocomplete](https://mui.com/material-ui/react-autocomplete/) · [@atlaskit/select](https://www.npmjs.com/package/@atlaskit/select) · [Atlassian Design — Select](https://atlassian.design/components/select) / [Async select](https://atlassian.design/components/select/async-select) · [Polaris — Combobox](https://polaris-react.shopify.com/components/selection-and-input/combobox) / [Select](https://polaris-react.shopify.com/components/selection-and-input/select) · [Primer — SelectPanel](https://www.primer.style/components/selectpanel) / [Rails SelectPanel](https://primer.style/product/getting-started/rails/components/select_panel/) · [html5accessibility.com — optgroup labeling](https://html5accessibility.com/stuff/2024/01/12/options-for-optgroup-labeling-of-options/) · [MDN — `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select) · [MDN — `readonly` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/readonly).

### What this table actually shows

Every single mature, shipped enterprise/admin-surface design system audited here — Material, Atlassian, Polaris, Primer — independently arrived at the **same two-tier architecture**: a plain, non-searchable Select for short fixed lists, and a *separate*, explicitly-recommended-for-scale searchable component (`Autocomplete`/`Combobox`/`SelectPanel`/react-select) for anything open-ended. None of them tried to make one component do both jobs. Atlassian's case is the most directly relevant: their default `Select` is searchable *by default*, because their own product's real pickers — Jira's assignee picker, project picker, sprint picker — are exactly the same shape of problem as Krane's vendor/manufacturer/project/user pickers, not a hypothetical edge case. GitHub's evolution tells the same story from the other direction: their older native-style `Select` is being actively superseded by `SelectPanel` for precisely the Assignees/Labels/Projects/Milestone pickers that are GitHub's own closest analog to Krane's domain entities.

---

## The core decision: A, B, or C?

**Recommendation: C — a searchable, Command-style Select — for Krane's actual highest-value entities, with B (Radix Select) retained, not replaced, for the genuinely bounded case.**

This is not a hedge. The brief names six concrete entities — vendors, manufacturers, materials, CSI divisions, projects, users — and they do not all have the same cardinality:

- **CSI division** is a fixed, ~50-item industry enumeration. It will not grow past a few dozen items in this system's lifetime. A non-searchable Select is not just adequate here, it's *correct* — adding search to a 50-item, alphabetically-stable list is solving a problem that doesn't exist, the same "don't add an axis nothing needs" discipline already applied to `Label`'s size variant and `Input`'s color variants.
- **Vendor, manufacturer, material, project, user** are open-ended, growing, real-world-scale entity catalogs. A real procurement system's material/SKU catalog can run into the thousands; even a modest vendor list reaches the point where scrolling-to-find loses to typing-to-find well before triple digits. **Option A (native Select) is disqualified outright** for these — no styling control over the panel (already the reason this project rejected it for Select generally), inconsistent `optgroup` accessibility across browsers (sourced above), and no way to render anything richer than plain option text (no secondary metadata like a risk badge or approval status next to a vendor name). **Option B alone (plain Radix Select) is disqualified for these specific entities, not in general** — it has no search, no first-class async hook, and an unresolved upstream multi-select gap, and forcing a user to scroll a 500-row vendor list to find "Sterling Rebar Co." is a real, immediate usability failure, not a hypothetical one this audit invented. Every comparable design system above reached the identical conclusion for the identical category of picker.

So the honest answer to "A, B, or C" is **C for the entities where it actually matters, B for the one where it doesn't** — not because this document is unwilling to commit, but because the brief itself contains both kinds of list, and every piece of external evidence gathered here says treating them identically is the wrong call, not a simplification.

---

## Output

### 1. Existing capabilities

Nothing implemented. The only "existing capability" is `FORM_SPECIFICATIONS.md`'s original Select section — a complete, correct spec for the *bounded* case (visual recipe, states, Radix API, demo requirements), now formally scoped down to "what `Select` covers" rather than "what Select-shaped pickers need," per this document.

### 2. Missing capabilities

- The component(s) themselves, full stop — two of them, not one (§ core decision).
- **Search/filter** — entirely absent from the original spec and from plain Radix Select; the single biggest gap relative to the named domain entities.
- **A real read-only treatment** — doesn't exist on the platform or in Radix Select at all (§6); the original spec never raised this because it never considered the question.
- **Async loading** — no mechanism in the original spec; needed the moment vendor/material data is server-sourced rather than a hardcoded demo array (deferred, see §7 below — not built now, but a real, named gap).
- **A documented multi-select path** — not in the original spec, not solved by Radix Select upstream either; no current Krane use case demands it today, but it's worth knowing the gap exists before someone reaches for `Select` to build "assign multiple reviewers" and discovers it can't.
- **Virtualization** — not addressed anywhere; only matters once an in-memory option list actually gets large enough to matter (same bar already applied to `DataTable`'s own deferred virtualization).
- **Clear-selection control** — not in the original spec; several reference systems treat this as expected baseline, not optional.

### 3. Recommended additions

- **Build `Select` (Radix-backed) largely as `FORM_SPECIFICATIONS.md` already speced**, with two corrections from this audit: the `status` vocabulary generalized to match `Input`/`Textarea` exactly (the original spec only had binary `aria-invalid`), and the Krane-specific `readOnly` treatment from §6 (not in the original spec at all).
- **Build a new `Combobox` component**, recommended foundation: **`cmdk`** (a small, unstyled, MIT-licensed package — already the canonical answer this project's own tooling assumes: this codebase already depends on `shadcn` and follows its conventions end-to-end, and `cmdk` is the literal dependency shadcn's own `Command`/`Combobox` pattern is built on). This is a real, explicit new dependency — flagged here exactly the way `FORM_FOUNDATION_PLAN.md` flagged `react-hook-form`: it needs its own deliberate go-ahead, not a silent default, and nothing in this document installs it.
- **Why a dependency here and not a hand-rolled Popover+Input filter** (which *would* keep the zero-new-dependency streak intact): the real WAI-ARIA combobox pattern (`aria-expanded`/`aria-controls`/`aria-activedescendant` tracked against a live-filtered, live-highlighted list) is exactly the kind of thing this project has repeatedly said not to hand-roll once a primitive already solves it correctly — the same principle that justified choosing Radix Select over native in the first place. `cmdk` is small, headless (matches this project's "wrap a headless primitive in Krane's own classes" pattern exactly), and already implied by this repo's own existing `shadcn` tooling — a meaningfully different, lower-risk case than reaching for a heavier, non-idiomatic library like `react-select` or `downshift`.

### 4. Must-have vs. Nice-to-have

**Must-have**: `Select` itself (the bounded case is real and immediate — CSI division has no other home); `Combobox` itself (vendor/manufacturer/material/project/user pickers are named, concrete, and a non-searchable list fails them in production, not in theory); the `readOnly` correction (a procurement system has "view a submitted PO" screens exactly like `Input`/`Textarea` do, and Select-shaped fields appear on those screens too); the `status` vocabulary (keeps `Select`/`Combobox` speaking the same language as `Input`/`Textarea` in a mixed form, the same reason this mattered for `Textarea`); clear-selection on `Combobox` (every searchable reference system treats it as baseline, and an unclearable vendor field is a real, named annoyance the moment someone picks the wrong vendor and wants to start over).

**Nice-to-have**: async loading (real, will be needed the moment vendor/material data is server-sourced, but no concrete backend exists in this repo yet to wire it against — same bar `INPUT_GAP_ANALYSIS.md` used for `Input`'s own loading state before a concrete consumer appeared); multi-select (real future need — "assign multiple reviewers," "select several materials at once" — but nothing in the current brief names a concrete multi-select consumer); virtualization (only matters once an in-memory option list is large enough to cost something — `cmdk` itself stays comfortable into the low thousands of items, well past where Krane's likely v1 data volumes sit); grouped options on `Combobox` specifically (useful, e.g. grouping vendors by category, but not load-bearing — `Select`'s grouping, by contrast, is must-have since CSI divisions are naturally grouped by division category).

### 5. Final recommendation for Krane

**Ship both `Select` and `Combobox` in v1** — not as a phased "Select now, Combobox later" sequence, but together, because the brief's own named entities split cleanly across the line this document draws, and shipping only `Select` would leave every one of the headline procurement pickers (vendor, manufacturer, material, project, user) without a usable home. Reuse Radix Select for the bounded case exactly as already speced. Build `Combobox` on `cmdk`, styled to be visually indistinguishable from `Select` until opened, sharing the same trigger size/status variants so the two read as one family in a mixed form. Treat the `cmdk` dependency decision with the same explicit weight already given to `react-hook-form` — name it, justify it, do not add it silently as a side effect of building something else.

### 6. Recommended architecture for Select v1

```
components/ui/select.tsx     — Radix Select-backed. Trigger/Content/Item/Group/Label/Separator.
                                size: sm/default/lg · status: default/success/warning/error · readOnly (Krane-specific, §6).
                                Bounded enumerations only: CSI division, status/category pickers.

components/ui/combobox.tsx   — cmdk-backed (new dependency, requires explicit go-ahead).
                                ComboboxTrigger visually identical to SelectTrigger (same size/status variants).
                                ComboboxContent = Popover-style panel containing cmdk's Command,
                                styled with the same bg-popover/border-border/shadow-md recipe.
                                Client-side filtered, in-memory options array — no async, no virtualization in v1.
                                Vendor, manufacturer, material, project, user pickers.
```

Both components share: the Popover/DropdownMenu floating-surface recipe (zero new variant), `Input`'s exact size scale, the same `status` vocabulary and `aria-invalid` derivation, and the same `readOnly` treatment philosophy (disabled interaction, non-disabled visual treatment, chevron hidden). Nothing about this split requires two different design languages — only two different internal engines for two genuinely different list shapes.

### 7. Future evolution path (v2/v3)

- **v2 — Async loading.** Once vendor/material/user data is genuinely server-sourced rather than a hardcoded demo array, add a `loadOptions`-style hook to `Combobox` (debounced search-as-you-type against a real endpoint), modeled on the pattern every searchable reference system above already converged on (Atlaskit's `AsyncSelect`, Primer's `:remote` fetch strategy). Not built now because there is no concrete backend in this repo to wire it against yet — the same reasoning that's kept `Input`'s own `loading` state and `DataTable`'s virtualization deferred until a real consumer existed.
- **v2 — Multi-select.** Add once a concrete consumer appears (e.g. "assign multiple reviewers to a PO approval"). `cmdk`'s `CommandItem` rows already support a checked/unchecked visual treatment cheaply, reusing the exact pattern `DropdownMenuCheckboxItem` established in this codebase — this is additive to `Combobox`, not a rearchitecture.
- **v2/v3 — Virtualization.** Revisit if a real material/SKU catalog grows past the range `cmdk`'s unvirtualized list stays comfortable in (roughly low thousands). At that point, the realistic fix is pairing server-side filtering (so the client never holds the *entire* catalog at once — Primer's own answer above) with `@tanstack/react-virtual` for whatever page of results does need to render — not a `Combobox` rewrite, since `@tanstack/react-table` is already a dependency in this codebase and the virtualization sibling package is a small, well-precedented addition.
- **v3 — Grouped `Combobox` options.** Useful (vendors by category, materials by CSI division) but not load-bearing — revisit once a concrete screen wants it rather than building it speculatively.
- **Ongoing — re-evaluate `cmdk` if it's ever displaced upstream.** This system already tracks its dependencies' health deliberately (`zod` flagged as present-but-not-direct, `react-hook-form` flagged as a real blocker) — `cmdk`, once adopted, should get the same treatment: confirmed-working, not assumed-working, in any future audit pass.
