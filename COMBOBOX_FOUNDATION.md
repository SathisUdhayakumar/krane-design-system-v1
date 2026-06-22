# Krane Design System — Combobox Foundation

Audit + specification only — nothing implemented. This document builds directly on `SELECT_FOUNDATION.md`'s core decision (ship `Select` *and* `Combobox` in v1; `Combobox`'s recommended foundation is `cmdk`) — it does not re-litigate that decision, it deepens it into an actually implementable architecture, scoped specifically to the five entity pickers `SELECT_FOUNDATION.md` named as `Combobox`'s real consumers: **vendor, manufacturer, project, user, material**.

## Audit: existing codebase state

- **No `Select`, no `Combobox`, no `cmdk`.** Confirmed again this pass: `package.json`/`package-lock.json` have neither `cmdk` nor `react-select` nor `downshift`; `components/ui/` has no `select.tsx` or `combobox.tsx`. The only prior art is `SELECT_FOUNDATION.md` itself.
- **`Popover` (`components/ui/popover.tsx`) and `DropdownMenu` (`components/ui/dropdown-menu.tsx`) are both already shipped**, and both already define the exact floating-surface recipe `Combobox` must reuse, per `FORM_FOUNDATION_PLAN.md`'s standing "no new floating-surface recipe" instruction: `rounded-lg border border-border bg-popover text-popover-foreground shadow-md`, the `data-open:animate-in data-closed:animate-out …` block, `z-popover`. Nothing about `Combobox` justifies a fourth variant of this.
- **`DropdownMenuItem`'s row recipe** (`data-highlighted:bg-accent data-highlighted:text-accent-foreground`, `rounded-md px-2 py-1.5 text-sm outline-none select-none`) **and `DropdownMenuCheckboxItem`'s absolute-positioned-`Check`-indicator pattern** are the two existing conventions a `Command.Item` should match exactly. `cmdk` drives its own highlight state via `data-selected` rather than Radix's `data-highlighted` — same visual treatment, different attribute name to target in the class list. Worth getting right at implementation time, not discovering as a styling drift later.
- **`SELECT_FOUNDATION.md` already named `cmdk` as the recommended foundation** and explicitly flagged it as a new dependency requiring its own deliberate go-ahead, the same weight given to `react-hook-form`. That flag stands unchanged here — this document does not install anything either.

---

## 1. Purpose

The searchable half of Select v1 (`SELECT_FOUNDATION.md`'s core decision). Not a general-purpose "autocomplete anything" — scoped specifically to picking exactly one already-known record from a list whose real-world cardinality makes scrolling lose to typing: **vendor, manufacturer, project, user, material**, in this pass. (CSI division stays `Select`'s job — a fixed ~50-item enumeration has no business being searchable, per `SELECT_FOUNDATION.md` §10.) Multi-select is explicitly out of scope for this pass — `SELECT_FOUNDATION.md` already deferred it to v2 with no concrete named consumer yet, and nothing in this document's five named pickers changes that.

## 2. Architecture

```
ComboboxRoot                         — owns `open` (Popover state) + controlled `value`/`onValueChange`
└─ Popover.Root                      — existing primitive, unmodified
   ├─ Popover.Trigger  (asChild)
   │  └─ ComboboxTrigger             — visually identical to SelectTrigger; same size/status variants
   └─ Popover.Portal → Popover.Content   — EXISTING floating-surface recipe, zero new variant
      └─ Command.Root  (cmdk)        — value/onValueChange here = keyboard-highlight cursor, NOT the
         │                             selected value — see the warning below
         ├─ Command.Input             — styled as Input's `sm` size, integrated at the panel's top
         │                             edge (bottom border divider, no own box-border)
         └─ Command.List              — `max-h-*`, scrollable
            ├─ Command.Group (heading)  — maps onto DropdownMenuLabel's existing recipe
            │  └─ Command.Item × N      — maps onto DropdownMenuItem's existing recipe
            ├─ Command.Empty
            └─ Command.Loading
```

**Why `Popover`, not `cmdk`'s own `Command.Dialog`**: `Command.Dialog` is cmdk's elevated, modal, full-overlay variant — the ⌘K command-palette shape, not an inline field-level picker. `Popover` (anchored to the trigger, dismiss-on-outside-click) is architecturally correct here, and is exactly what shadcn's own Combobox recipe does — Popover-anchored, not Dialog-elevated. Using `Command.Dialog` for a field-level picker would be reaching for the wrong half of `cmdk`'s API.

**A real, specific implementation pitfall worth flagging now rather than discovering mid-build**: `Command.Root`'s own `value`/`onValueChange` props track which row is currently *highlighted* by keyboard/mouse — not which row is *selected*. Combobox's controlled, consumer-facing `value`/`onValueChange` (mirroring `Select`'s shape) is a separate concern entirely. Conflating the two — wiring the consumer's selected-value state directly into `Command.Root`'s `value` prop — is an easy, real mistake that would silently break keyboard navigation the moment a value is already selected when the panel reopens.

## 3. Search behavior

- Default: `cmdk`'s built-in client-side fuzzy filter runs against each `Command.Item`'s `value` (and optional `keywords`) as the user types into `Command.Input`. No tuning needed for v1's in-memory option lists.
- **Recommend populating `keywords` for vendor/manufacturer items specifically** with an internal vendor/material code or alias, not just the display name — a real, concrete procurement pattern (a vendor is often referred to internally by a short code, not its full registered name), and `cmdk`'s `keywords` prop exists precisely to let a search match text the user never sees rendered.
- **Server-driven search** (the eventual answer for material at real catalog scale, §9): pass `shouldFilter={false}` and treat every keystroke as a request the consumer's own data layer fulfills, not a client-side filter. `cmdk` does not debounce input for you — confirmed by the same category of real, open issue reports in the comparable react-select ecosystem about `loadOptions` firing inconsistently (§ evaluation, below) — debouncing is the integrator's job in every system audited here, not a solved problem any of them hand you for free.

## 4. Keyboard behavior

- Opening the trigger moves focus directly into `Command.Input`, not onto a list row — consistent with `SELECT_FOUNDATION.md` §3's already-stated Combobox trigger behavior.
- Typing filters live; `ArrowDown`/`ArrowUp` move the highlighted row (`cmdk` manages this internally via `Command.Root`'s own value, §2); `Enter` invokes the highlighted item's `onSelect`; `Escape` closes the `Popover` without changing the selected value — the same convention every other floating Krane primitive already uses.
- **Recommend enabling `loop`** (wrap from the last filtered row back to the first on `ArrowDown`, and vice versa) — a small, real nicety with no downside at the result-set sizes a *filtered* list realistically reaches.
- `Tab` closes the popover and advances focus to the next focusable element — standard combobox-pattern behavior, not something to build.

## 5. Loading states

- `cmdk` ships `Command.Loading` specifically for "fetching async items" — render it (reusing Krane's existing `Skeleton` component for the row shapes, not inventing a new loading treatment) while a request for the current search term is in flight.
- **A specific, sourced behavioral requirement, not a generic placeholder**: GitHub Primer's own `SelectPanel` guidance explicitly recommends "a more minimal loading state" once a result set is already showing and the user is re-searching — replacing the entire panel with a full skeleton on every keystroke, once there's already something on screen, is a real UX regression this document flags so the demo (§13) shows the *right* loading behavior, not merely *a* loading behavior.
- Pair with `shouldFilter={!loading}` — the confirmed, idiomatic `cmdk` pattern for async use — so the library doesn't try to client-filter a result set that's still arriving.

## 6. Empty states

- `Command.Empty` renders only once the (post-filter) list is genuinely empty — copy must be domain-specific per picker ("No vendors found," not a generic "No results"), matching the per-field caption convention already established across the `Input`/`Textarea` demos.
- **Loading and empty are mutually exclusive states, not sequential ones — and getting this wrong is a real, documented sharp edge, not a hypothetical one.** `cmdk`'s own issue tracker has an open report titled "Empty and Loading state being rendered at the same time" — cited here specifically because it's exactly the kind of pitfall this project's audits exist to catch before implementation, not after. The Combobox demo (§13) must prove these two states never render together, not just that each exists individually.
- The empty message must be perceivable to screen-reader users the moment it appears — the same live-region-adjacent requirement already flagged generally in `SELECT_FOUNDATION.md` §7, restated here as a concrete Combobox implementation requirement.

## 7. Async loading

- **v1 scope, unchanged from `SELECT_FOUNDATION.md`: in-memory, already-fetched options array, client-side `cmdk` filtering.** No real async wiring — there is no backend in this repository to call yet, the same reasoning that's kept `Input`'s `loading` state and `DataTable`'s virtualization deferred until a concrete consumer existed.
- This section documents the *shape* of the eventual hook so it isn't re-derived from scratch later: a debounced-search-term-in, `{ items, isLoading, error }`-out hook, feeding `Command.Loading`/`Command.Empty`/`shouldFilter={false}` exactly as §3/§5 describe. The `onSearchChange` callback in §12's API sketch is the named landing spot for this.
- Debouncing is explicitly the consumer's/hook's responsibility, not `cmdk`'s or any audited reference system's — Atlaskit's own `loadOptions` ecosystem has real, open bug reports about exactly when/how often it refires (§ evaluation), which is the clearest available evidence that this seam is genuinely fiddly everywhere, not something Krane can assume away by picking the right library.

## 8. Grouped options

- `Command.Group`'s `heading` prop maps directly onto the visual treatment `DropdownMenuLabel` already established (`px-2 py-1.5 text-xs font-medium text-muted-foreground`), reused verbatim — the same reuse discipline already applied to every other piece of this component.
- **Concretely valuable for exactly one of the five named pickers in this pass: material, grouped by CSI division** — an already-existing taxonomy in Krane's own domain (the same ~50-division enumeration `Select` itself uses for the bounded case). This is a real, named, non-speculative use of grouping, which is why it belongs in the v1 demo (§13), not a generic "nice to have" bolted on for completeness.
- Vendor/manufacturer/project/user have no obvious natural grouping dimension named anywhere in this brief — don't invent one speculatively, the same "no axis nothing needs" discipline already applied to `Label`'s size variant, `Input`'s color variants, and `Textarea`'s size tier.

## 9. Large datasets

- Vendor/manufacturer/project/user are "large" in the sense that search beats scrolling well before triple digits — not in the sense that the client can't hold the whole list. **Material/SKU is the one named picker where "large" can mean genuinely thousands of records.**
- v1 answer for all five: client-side, in-memory, `cmdk`'s built-in filter — comfortable, per `cmdk`'s own documented guidance, into the 2,000–3,000 item range. Sufficient for vendor/manufacturer/project/user at any realistic Krane org size, and sufficient for *most* material catalogs, though not guaranteed for the largest ones.
- The escape hatch for whichever picker first exceeds that range — almost certainly material — is §10, not a v1 build.

## 10. Virtualization strategy

- **Not built in v1.** `cmdk` ships none, and none of the four reference systems audited in `SELECT_FOUNDATION.md`'s comparison bundle it into their searchable component either — each either pairs it with a separate library (MUI's own large-dataset `Autocomplete` demo: `@tanstack/react-virtual`) or punts to server-side filtering instead (Primer's documented answer for `SelectPanel`).
- **Recommended v2/v3 path**: pair `shouldFilter={false}` with real server-side search for material (the actual fix for its potential scale), and only reach for `@tanstack/react-virtual` if a *server-filtered* result page itself still renders more rows than is comfortable — a much smaller, rarer problem than virtualizing an entire unfiltered catalog client-side. `@tanstack/react-virtual` is a natural-fit addition if it's ever needed: `@tanstack/react-table` (same vendor) is already a dependency in this codebase.
- This restates `SELECT_FOUNDATION.md` §7's future-evolution note as a Combobox-specific implementation plan, not a new decision.

## 11. Accessibility requirements

- The real WAI-ARIA combobox pattern (`aria-expanded`/`aria-controls`/`aria-activedescendant` tracked against a live-filtered, live-highlighted list) is `cmdk`'s job, not Krane's to re-derive — the central reason `cmdk` was recommended over a hand-rolled `Popover`+`Input` filter in `SELECT_FOUNDATION.md` §3, restated here with the implementation detail (§2–§6) now showing exactly how much surface area that decision avoids re-building.
- The trigger needs the same accessible-name behavior already specified for `Select`'s trigger — the current value's text must be part of the accessible name, never just the placeholder — even though Combobox's open-state search field is a second, separate, dynamic element from the closed-state trigger.
- Loading and empty states must be perceivable in the moment they change (§5/§6), not just visually present.
- **`Label` pairs with `ComboboxTrigger`** (`htmlFor`/`id`, the focusable closed-state element) — **the in-panel `Command.Input` does not get its own separate `Label`.** It's a second focusable element belonging to the same logical field once opened, not an independent control. Worth stating explicitly: reaching for a second `htmlFor` on the search input out of habit would be the same shape of mistake `LABEL_FOUNDATION.md` flagged for `RadioGroup`'s group-vs-item labeling — easy to get wrong by analogy to a different composition pattern that doesn't actually apply here.

## 12. API design

Documentation-stage sketch, not a frozen contract — same hedge already used for every component spec'd before implementation in this project.

```ts
// ComboboxTrigger — visually identical to SelectTrigger; shares the same variant set, not a duplicate
VariantProps<typeof selectTriggerVariants>   // size: sm/default/lg · status: default/success/warning/error
  & React.ComponentProps<"button">

// Combobox (Root)
{
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  options: { value: string; label: string; keywords?: string[]; group?: string; disabled?: boolean }[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  readOnly?: boolean              // same Krane-specific treatment as Select — SELECT_FOUNDATION.md §6
  loading?: boolean                // drives Command.Loading + shouldFilter={!loading} — §5/§7
  onSearchChange?: (search: string) => void   // named landing spot for the v2 async hook, inert in v1
}
```

## 13. Demo requirements

- **Vendor picker** — 20–30 example vendor names, live filter, a clear-selection control (carried forward from `SELECT_FOUNDATION.md` §11).
- **Material picker, grouped by CSI division** — the one demo that has to prove grouping actually works on `Combobox`, not just on `Select` (§8's one concrete consumer).
- **User picker** — a smaller list (8–10 example users) paired with a `Label`, demonstrating the simplest, most common case end to end.
- **Empty state** — a search term with zero matches, captioned per-entity ("No vendors found").
- **Loading state** — a deliberately simulated async delay (`setTimeout`-driven `loading` boolean, mirroring the existing `LoadingAvailabilityExample` pattern already in `app/demo/input/page.tsx` — not a real network call), specifically proving §5's "minimal loading state, not a full reset" guidance and §6's loading/empty mutual-exclusivity are both visible, not just documented.
- **Disabled and read-only** Combobox examples, mirroring `Select`'s (`SELECT_FOUNDATION.md` §11) — read-only with no chevron, full opacity.
- **One mixed-form composition** pairing a `Select` (CSI division) with a `Combobox` (manufacturer) under shared `Label`s — directly demonstrating `SELECT_FOUNDATION.md` §9's "read as one family" claim with `Combobox` specifically, not just `Select`.

---

## Evaluation: cmdk, shadcn Combobox, Radix Popover + Command, Atlassian, Shopify Polaris, GitHub Primer

**`cmdk`** — the raw library underneath this whole document. Exports `Command`/`Command.Input`/`Command.List`/`Command.Item`/`Command.Group`/`Command.Empty`/`Command.Separator`/`Command.Loading`/`Command.Dialog`; key root props `value`/`onValueChange`/`filter`/`keywords`/`shouldFilter`/`loop`. Performs well into the 2,000–3,000 item range with no built-in virtualization beyond that. [(cmdk — GitHub)](https://github.com/pacocoursey/cmdk) **Verdict**: the right low-level engine, not a finished component — it needs `Popover` for anchored, non-modal positioning and Krane's own styling, the same relationship Radix `Select` has to a raw `<select>`.

**shadcn Combobox** — not a separate library, a confirmation of architecture: shadcn's own documented Combobox is "built using a composition of the Popover and the Command components," and `Command` is itself a thin styling layer over `cmdk`. **Verdict**: this is the idiomatic, already-implied answer for a codebase that already depends on `shadcn`'s conventions end to end (`components.json`'s `"style": "radix-nova"`, the existing alias scaffold) — §2's architecture is not a Krane invention, it's the standard recipe.

**Radix Popover + Command (hand-rolled, no `cmdk`)** — the zero-new-dependency alternative already seriously considered and rejected in `SELECT_FOUNDATION.md` §3, reaffirmed here with the implementation detail now in hand to be specific about *why*: building the real WAI-ARIA combobox pattern by hand means independently re-deriving everything §3–§6 of this document just described `cmdk` as already solving correctly — live `aria-activedescendant` tracking against a filtered list, the loading/empty mutual-exclusivity pitfall, debounce-adjacent search semantics. `Popover` alone only solves positioning and dismissal; a hand-rolled version would mean re-implementing roughly half of `cmdk`, with a real, nontrivial chance of getting the accessibility half wrong. **Verdict**: reject, unchanged from `SELECT_FOUNDATION.md`, now with concrete reasons rather than a general principle.

**Atlassian (Atlaskit)** — `react-select`-based `Select`/`AsyncSelect`, `isClearable`, `isMulti`. [(@atlaskit/select)](https://www.npmjs.com/package/@atlaskit/select) [(Async select)](https://atlassian.design/components/select/async-select) The closest production analog to Krane's actual entities — Jira's assignee/project pickers are the same shape of problem as vendor/manufacturer/project/user. A real, citable rough edge worth carrying into Krane's own future async design: `react-select`'s `loadOptions` has open GitHub issues about firing inconsistently and not reliably re-calling after prop changes — not a reason to avoid the pattern, but a specific seam (§7) to test deliberately whenever Krane's own async hook is eventually built, rather than assuming it "just works" because a mature library does it.

**Shopify Polaris** — `Combobox`, explicitly described by Polaris itself as "a combination of a single-line `TextField` and a `Popover`," consumer-managed loading/filtering, a documented multi-select example. [(Polaris — Combobox)](https://polaris-react.shopify.com/components/selection-and-input/combobox) **Verdict**: independent confirmation, from a third design system, of the exact architectural shape recommended in §2 — TextField/Input-equivalent plus Popover, not a bespoke fourth pattern.

**GitHub Primer** — `SelectPanel`, the most directly relevant production precedent for §5/§6's loading/empty guidance specifically: Primer's own documentation recommends a minimal (not full-reset) loading treatment during re-search, and its `:remote`/`:eventually_local` fetch-strategy split is the direct external validation behind this document's §7 recommendation, not just a generic point of comparison. [(SelectPanel)](https://www.primer.style/components/selectpanel) [(Rails SelectPanel)](https://primer.style/product/getting-started/rails/components/select_panel/)

---

## Existing capabilities

Nothing — confirmed again this pass. The only "existing capability" is `SELECT_FOUNDATION.md`'s own architectural recommendation (`cmdk`, `Popover`-composed, a shared trigger with `Select`) plus `Popover`/`DropdownMenu`'s already-shipped floating-surface and item-row recipes, both directly reusable without modification.

## Missing capabilities

- The component itself, full stop.
- Real async wiring — documented shape only (`onSearchChange`, §7/§12), no backend to call yet.
- Grouping wired to a real domain taxonomy — material-by-CSI-division (§8) is now a named, concrete first consumer rather than a speculative "nice to have," but it's still unbuilt.
- Virtualization / genuine large-dataset handling for material specifically (§9/§10) — deferred, with an escape hatch documented rather than built.
- **Correct loading/empty mutual-exclusivity handling** (§6) — a real, specific implementation requirement this audit surfaced via `cmdk`'s own issue tracker, not something generically known in advance; worth calling out as its own line item rather than folding it into "the component itself."

## Recommended architecture

`Popover.Root`/`Trigger`/`Content` (existing primitive and recipe, zero new floating-surface variant) wrapping `cmdk`'s `Command.Root` → `Command.Input` + `Command.List` → `Command.Group` (`heading`, mapped onto `DropdownMenuLabel`'s recipe) / `Command.Item` (mapped onto `DropdownMenuItem`'s recipe) / `Command.Empty` / `Command.Loading`. `ComboboxTrigger` shares `SelectTrigger`'s size/status variants rather than duplicating them. The consumer-facing `value`/`onValueChange` (controlled, matching `Select`'s shape) is kept strictly separate from `Command.Root`'s own internal `value`/`onValueChange` (keyboard-highlight cursor only) — the one architectural detail in this document most likely to be gotten wrong without this explicit separation (§2).

## Must-have vs. Nice-to-have

**Must-have**: the component itself; the `Popover`+`cmdk` composition specifically (not `Command.Dialog`, not a hand-rolled filter); clear-selection; per-entity empty-state copy; correct loading/empty mutual exclusivity (§6); `readOnly`/`status` parity with `Select`.

**Nice-to-have**: grouping (real, but only material has a named consumer today); async wiring (real, but no backend exists yet to justify building it); virtualization (real, but no current dataset forces it — vendor/manufacturer/project/user are comfortably within `cmdk`'s unvirtualized range at any realistic Krane org size); `keywords`-based alias search for vendor/manufacturer codes (valuable, but a refinement on top of already-working search, not a blocker).

## Final recommendation for Krane

Build `Combobox` exactly as specified above — `Popover` (already shipped) composed with `cmdk` (new, explicitly-flagged dependency, requiring the same deliberate go-ahead already on record for `react-hook-form`) — not `Command.Dialog`, not a hand-rolled `Popover`+`Input` filter. Ship it for all five named pickers (vendor, manufacturer, project, user, material) in v1 with client-side filtering only. Wire material's CSI-division grouping, since it's the one concrete, non-speculative grouping use case this audit found. Defer async loading and virtualization, with their upgrade paths already documented (§7/§10) rather than built speculatively — consistent with how this project has handled every other deferred feature, from `Input`'s `loading` state to `DataTable`'s virtualization.
