# Krane Design System — Input Gap Analysis

Audit only — nothing implemented. Compares the current `components/ui/input.tsx` against Material Design (MUI's TextField), Atlassian Design System (Atlaskit's Textfield), Shopify Polaris (TextField), and GitHub Primer (TextInput) — all four chosen because they're mature, shipped, enterprise/admin-surface systems, not marketing-site component libraries.

## 1. Existing capabilities

Confirmed directly from source — `components/ui/input.tsx`:

- Three sizes (`sm`/`default`/`lg`), one visual treatment, no color/style variants (by design — see `INPUT_FOUNDATION.md`)
- Decorative-only `startIcon`/`endIcon` slots (always `aria-hidden`)
- `disabled` (native attribute, styled)
- `aria-invalid` styling (binary — invalid or not, no intermediate states)
- Native `type`/`required`/`pattern`/`min`/`max`/etc. pass through untouched
- Focus ring matching every other interactive primitive in this system
- One demoed composition pattern: an interactive password-visibility toggle, built *outside* the icon-slot API

That's the complete surface. Everything below is either partially present only as an unstyled native HTML behavior, or entirely absent.

## 2. Missing capabilities

### Missing states
| State | Krane today | Reference precedent |
|---|---|---|
| **Read-only** | Native `readOnly` attribute passes through and functions, but has **no distinct visual treatment** — a read-only field looks identical to a normal editable one. A user has no visual cue it can't be edited until they try to type. | Atlaskit's `Textfield` has an explicit `isReadOnly` prop, *separate* from `isDisabled` — different cursor, different background, text remains selectable/copyable (disabled text often isn't). This is a real, well-established distinction Krane currently collapses into "doesn't exist." |
| **Loading / async** | Not present at all. | GitHub Primer's `TextInput` has a built-in `loading` prop with a spinner — used for exactly the case Krane will need soon: async validation (checking vendor-name uniqueness against a server) while the user is still in the field. |
| **Success / valid** | Not present — only `invalid` exists, as a binary. | Primer's `validationStatus` accepts `"error" | "success" | "warning"` — three states, not two. Polaris and Atlaskit's Form packages both support a positive/valid confirmation state too. Krane has no way to say "this field was checked and is fine," only "this field is wrong" or "nothing has been said about this field yet." |

### Missing accessibility support
- **No `aria-describedby` wiring** — Input styles `aria-invalid` but does nothing to connect an error message's `id` to the field. Already flagged as deferred to the future `Form`/`useFormField()` layer in `FORM_FOUNDATION_PLAN.md`, restated here because it blocks several of the use cases below (character count, inline validation) from being accessible even if built visually.
- **No `aria-readonly` distinction** — ARIA defines `aria-readonly` as semantically distinct from `aria-disabled`; Krane's Input has no opinion on this at all today.
- **No live-region pattern for async state changes** — a loading→success transition, an autosave "Saving…"→"Saved" transition, or a copy-confirmation message all need `aria-live="polite"` somewhere for screen-reader users to learn about a state change they can't see. None of this infrastructure exists, and none of the missing features below can be built accessibly without deciding where it lives first.
- **No accessible-name guidance for icon-adjacent interactive elements** — the password-toggle demo got this right by hand (explicit `aria-label`, `aria-pressed`), but that correctness lives in the *demo*, not enforced or even documented as a requirement by the component itself. A clear button or copy button built the same ad hoc way next time has no guardrail reminding the builder to do the same.

### Missing variants
- **No textual prefix/suffix** — only decorative *icons* are supported. Polaris's `prefix`/`suffix` props explicitly accept arbitrary content (e.g. `"$"`, `"kg"`, `"@company.com"`), not just glyphs — a meaningfully different use case from an icon, and currently unsupported in any form.
- **No "connected" composition** (input physically attached to a Button or Select, no gap/border between them — e.g. a currency Select fused to an amount Input, or a search Input fused to a "Go" Button). Polaris's `connectedLeft`/`connectedRight` is the direct precedent. Krane has neither the visual treatment (shared border-radius, no double border) nor a documented pattern for this.
- **No monospace variant** — relevant for IDs, tokens, PO numbers where consistent character width aids scanning. Primer has this as a named prop (`monospace`); Atlaskit calls it `isMonospaced`.

### Missing enterprise use cases (the explicit list)
| Use case | Status | Notes |
|---|---|---|
| Read only | Missing distinct treatment | See States, above |
| Loading | Missing entirely | See States, above |
| Prefix/suffix (text) | Missing | Icon slots exist; text slots don't |
| Character count | Missing | Polaris's `showCharacterCount` is the cleanest precedent — a boolean that pairs `maxLength` with a visible, accessible counter |
| Clear button | Missing — not even demoed as a composition, unlike the password toggle | Primer's `trailingAction` and Polaris's `clearButton` (a literal boolean prop) are both direct precedents |
| Password visibility toggle | **Demoed as composition**, not a built-in feature | Already covered — flagged here only to confirm it's the one use case from this list that already has a working pattern |
| Currency inputs | Missing | Best modeled as a *separate, future component* built on Input (locale-aware formatting/parsing is real complexity, not a prop), not a core Input feature — see Recommendation |
| Search inputs | **Partially covered, but inconsistently** — `Input`'s `startIcon` supports the icon, but `DataTable`'s own search box (a real, shipped consumer) still uses its original hand-rolled `<input>` and was never migrated to the new component. Two implementations of "search input" now coexist in this codebase. | |
| Copyable inputs | Missing | No copy-to-clipboard composition exists, demoed or otherwise — GitHub's own product (tokens, SSH keys) is the canonical real-world reference even though it's not strictly a documented Primer prop |
| Autosave indicators | Missing | Closely related to Loading/async state above — likely the same underlying mechanism (a status slot + live region), not a separate feature |
| Inline validation patterns | Missing | Input styles `aria-invalid`; nothing renders, positions, or accessibly associates the validation *message* itself. This is `FormMessage`'s job once the Form layer exists, not Input's — but Input currently has no slot to host one even for non-Form-layer manual usage |

## 3. Recommended additions

In rough order of how they'd actually get built, not yet prioritized (that's §4):

- **`readOnly` visual treatment** — distinct from `disabled`: keep text selectable/copyable, remove the focus-ring-on-interact affordance (or keep a muted version), no opacity reduction (the content is still fully legible, just not editable). Likely `aria-readonly` + a `read-only:` Tailwind variant pairing.
- **`status` prop** generalizing the current binary `aria-invalid` into a real tri/quad-state: `"default" | "success" | "warning" | "error"` (a fourth, `loading`, may be better modeled as a separate boolean — see below) — directly closes the Missing States gap, and gives a real home for `--success`/`--warning` tokens (which already exist in this system) on a form control for the first time.
- **`loading` boolean** rendering a spinner in the `endIcon` slot's position (mutually exclusive with a real `endIcon` if both are somehow passed) — the same mechanism would back both "checking availability" and "autosave in progress" use cases, so build it once, not twice.
- **Text `prefix`/`suffix` slots**, distinct from the existing icon slots — likely the same component can absorb both (icon slots already are "arbitrary content before/after the text," the icon-specific styling just needs to generalize to accept a plain string or short element too).
- **`clearButton` boolean** (Polaris's exact naming) with an `onClear` callback — the single highest-value addition relative to effort, given DataTable's search box is a real, immediate, already-existing consumer.
- **A documented "connected" composition pattern** (not necessarily a new Input prop — likely a small wrapper utility or just documented CSS, e.g. `rounded-r-none` on the Input + `rounded-l-none` on an adjacent Button) for currency-style and search-with-button layouts.
- **A `CharacterCount` pattern** — likely belongs as a small composed example (Input + a live-updating counter reading the controlled value's length) rather than a new Input prop, mirroring how the password toggle was handled: demonstrate the composition, don't bake controlled-value-length-tracking into the base component.
- **Copy-to-clipboard composition** — same shape as the password toggle: a trailing icon-button (not the decorative `endIcon` slot), `navigator.clipboard.writeText`, and a brief confirmation (a `Tooltip` flipping to "Copied!", or a `Toast` — both already exist in this system and are the correct tool for the confirmation, not a new Input feature).
- **Currency input — recommend as a future, separate component**, not an Input prop. Locale-aware number formatting/parsing (thousands separators, decimal precision, currency symbol placement) is enough real logic that bolting it onto Input as a `type="currency"` would either be shallow (just visual) or scope-creep Input into a number-formatting library. Better modeled later as its own component built *on* Input, the same relationship `DataTable` has to `Table`.
- **Migrate `DataTable`'s search box onto the real `Input` component** — not a new capability, just closing the gap between "the component exists" and "every internal consumer actually uses it."

## 4. Must-have vs. Nice-to-have

### Must-have before this component should be considered done for Krane's actual domain
- **Read-only treatment** — procurement workflows are full of "view this submitted PO/vendor record without editing" screens; this isn't a hypothetical enterprise pattern, it's close to guaranteed to be needed almost immediately.
- **Inline validation message slot/pattern** — blocks real form-building today; every Dialog-based create/edit form in this system's future needs this, not just Input in isolation.
- **`status` (success/warning/error)** — directly unlocks reusing tokens (`--success`, `--warning`) that already exist elsewhere in this system but have never reached a form control.
- **Clear button** — concrete, existing, unmigrated consumer (`DataTable`'s search) already wants this today, not hypothetically.
- **Migrating `DataTable`'s search box onto `Input`** — closing a gap this audit found, not a new feature; leaving two competing search-input implementations in the same codebase is the kind of small inconsistency that compounds.

### Should fix soon, not blocking
- **Loading/async state** — real and will be needed (vendor-uniqueness checks, autosave), but no concrete consumer exists yet today, unlike Clear button's DataTable case.
- **Text prefix/suffix** — valuable, moderate effort, no urgent blocking consumer yet.
- **`aria-describedby` wiring convention** — genuinely important, but its real home is the Form layer (`FormField`/`FormItem`/`useFormField()`), not Input alone — fixing it properly means building that layer, which is already sequenced in `FORM_FOUNDATION_PLAN.md`.

### Nice-to-have
- Character count — real but narrow (mainly long-text/description fields, which more often end up as `Textarea`, not `Input`).
- Copy-to-clipboard composition — valuable for ID/token-heavy screens specifically, not a general-purpose need.
- Connected composition pattern (currency/search+button) — valuable once a concrete layout needs it; speculative until then.
- Currency input component — real future need, but correctly scoped as its own component, not an Input feature, so it doesn't block anything about Input itself.
- Monospace variant — small, easy, but no concrete consumer yet.

## 5. Final recommendation for Krane

Don't treat this as one big "Input v2" rewrite — the gaps split cleanly into three different kinds of work, and conflating them is how scope creeps:

1. **Fix what's inconsistent today**: migrate `DataTable`'s search box onto the real `Input` component. Zero new capability, pure cleanup, should happen regardless of anything else in this document.
2. **Extend Input itself** with the four must-have items — `readOnly` styling, a generalized `status` prop (success/warning/error), a `loading` boolean, and a `clearButton` boolean. These are genuinely Input's responsibility (visual/state concerns on the field itself), each has real precedent in at least one of the four reference systems, and together they close every "must-have" gap this audit found.
3. **Defer everything else to either composition patterns (demoed, not built-in) or future, separate components** — copy-to-clipboard, character count, and the password toggle (already done) all belong in the first bucket; currency input belongs in the second. Baking any of these into Input directly would repeat the exact mistake this system has been careful to avoid every other time it built a primitive (Checkbox stayed simple and let Form layer concerns stay separate; RiskIndicator stayed a fixed 4-tier scale instead of trying to be a general-purpose progress bar) — Input should hold the line the same way.

The inline-validation-message gap is real but shouldn't be solved inside Input at all — it's a strong signal that `FORM_FOUNDATION_PLAN.md`'s `Form`/`FormField`/`FormItem`/`FormMessage` cluster is the actual next priority, not a reason to bolt a message slot onto Input as a stopgap.
