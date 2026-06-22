# Krane Design System — Label Foundation

Audit + specification, now implemented at `components/ui/label.tsx` exactly per §7's API (`required`, `disabled`, `visuallyHidden`, passthrough), demoed at `/demo/label`. Builds on (and in two places, corrects) `FORM_SPECIFICATIONS.md`'s original Label entry.

One implementation discovery beyond this spec: combining `text-label` with a `text-foreground`/color class through this codebase's `cn()` helper silently dropped `text-label` — `tailwind-merge` didn't recognize Krane's custom typography roles and filed them under its `text-color` group. Fixed in `lib/utils.ts` (`extendTailwindMerge`, registering the six `text-{role}` tokens under `font-size`), not in `Label` itself — every consumer of `text-label`/`text-display`/etc. through `cn()` benefits.

## Audit: existing codebase state

- **No `Label` component exists.** `components/ui/` has no `label.tsx`. Radix's `Label` primitive remains in the installed `radix-ui` bundle, unused — confirmed again this pass, same position it's been in since the first form audit.
- **Three hand-rolled `<label>` elements exist today** (`app/demo/input/page.tsx`, all three added while building `Input`), all using `className="text-sm font-medium"` — and all three put the label **before** the control in DOM order.
- **A real `text-label` typography token already exists** (`app/globals.css`): `0.875rem` / line-height `1.2` / weight `500`, no letter-spacing override. This doesn't quite match what the hand-rolled labels use (`text-sm font-medium` has no explicit line-height, so it falls back to Tailwind's default for `text-sm`, not `1.2`) — a small, concrete drift between the typography foundation and actual usage that this document corrects (§3).
- **The original `FORM_SPECIFICATIONS.md` disabled-state mechanism doesn't actually work with how this codebase is built.** It specified `peer-disabled:opacity-70`, which requires the *control* to appear before the *label* in DOM order (Tailwind's `peer-*` compiles to a `~` general-sibling selector, which only matches later siblings). But every real example in this codebase — including the three labels audited above — puts the label first. The originally-documented mechanism would silently do nothing in Krane's own dominant layout. Corrected in §7.

## 1. Purpose

Associates a human-readable name with exactly one form control — enabling click-to-focus/activate and giving assistive technology the control's accessible name. Not a heading, not instructional copy, not a substitute for a visible error message — specifically the *name* of one control (or, for a group of controls, the name of the group as a whole — see §8's Radio Group case, which needs a different mechanism entirely).

## 2. Visual specification

Plain text, no border/background/padding. Two layout patterns, both already established by example in this codebase, neither owned by Label itself:
- **Stacked above** (`flex flex-col gap-1.5`) — the dominant pattern, used by every `Input` example so far.
- **Inline beside** — for `Checkbox`/`Switch`/`RadioGroupItem`, where the control is small and the label reads naturally to its right.

**Required indicator**: a trailing `*`, rendered when a new `required` prop is true (§7) — decorative only (`aria-hidden`), positioned with a small left margin, not a separate text node screen readers need to parse (see §6 for why it must stay decorative).

## 3. Typography

**Use the `text-label` token directly** (`text-label` utility — bundles size/line-height/weight in one class), not a hand-rolled `text-sm font-medium`. This is a correction, not a restatement: the three labels already built for the `Input` demo used `text-sm font-medium` because `Label` didn't exist yet to enforce the real token — they should be migrated once `Label` ships. `text-label` resolves to `0.875rem` / line-height `1.2` / weight `500` — confirmed in `globals.css`, no new token required.

## 4. Sizes

**No size variant.** Checked all four reference systems (§ comparison, below) — none give their label primitive an independent size axis; label size either tracks the paired field's own density setting or is simply fixed. Krane's `Label` should be fixed at `text-label` for the same reason `RiskIndicator` stayed a fixed 4-tier scale and `Input` didn't get color variants: introducing an axis nothing actually needs yet is how this system's scope has crept in the past, and every time it didn't, that was the right call.

## 5. States

| State | Treatment |
|---|---|
| Default | `text-label text-foreground` |
| **Required** | Trailing `*`, decorative (`aria-hidden`), via a new `required` prop — not present in the original spec at all |
| **Disabled** | **Corrected from the original spec.** An explicit `disabled` boolean prop (`opacity-70 cursor-not-allowed` when true), set directly by the consumer alongside the paired control's own `disabled` — not the original `peer-disabled:` CSS mechanism, which doesn't fire in label-before-control layouts (the dominant layout in this codebase, per the audit above). The peer-based approach still works as a CSS-only fallback for anyone who happens to order their markup control-first, but it's no longer the *documented* mechanism. |
| **Read-only** | **No visual change, deliberately.** A read-only field's data is still real, active content — only non-editable — so its label shouldn't look muted or "turned off" the way a disabled one does. Mirrors the same reasoning already applied to `Input`'s own read-only treatment (full opacity, no graying). |

(Invalid/error state remains deliberately absent, per the original spec — still `FormLabel`'s job once the Form layer exists, for the same DOM-order-independence reason already documented.)

## 6. Accessibility requirements

- Must use Radix's `Label`, not a plain `<label>` — Radix proxies clicks to the associated control even when that control isn't a real `<input>` (Radix `Checkbox`, `Switch`, `Select`'s trigger button are all real `<button>` elements; a plain `<label for>` click does nothing for those, Radix's manually triggers focus/activation on the matching `id`).
- **The required asterisk is decorative-only, never the actual accessibility signal.** Screen readers don't reliably announce a bare `*` glyph in a meaningful way, and a colorblind user gets nothing from a red asterisk alone. The real signal is the paired control's own `required`/`aria-required="true"` attribute — Label's asterisk is a sighted-user convenience layered on top, not a replacement.
- **Group labels need `aria-labelledby`, not `htmlFor`/`id`.** A label for an entire `RadioGroup` ("Payment method") has no single control to point `htmlFor` at — the group container itself needs `aria-labelledby` referencing the label's `id`. This is a different association mechanism from every other composition in §8, and worth getting right deliberately rather than discovering it's wrong after the fact.
- Disabled styling (§5) must not depend on DOM order, for the reason already established by the audit.

## 7. API design

```ts
type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean
  disabled?: boolean
}
```
Two additions beyond the original passthrough-only spec — `required` (renders the decorative asterisk) and `disabled` (the DOM-order-independent correction from §5). `htmlFor`/`children` continue to come from the underlying `React.ComponentProps`.

## 8. Composition patterns

| Control | Mechanism | Notes |
|---|---|---|
| **Input** | `htmlFor`/`id`, stacked above | Already established by example |
| **Textarea** | `htmlFor`/`id`, stacked above | Identical to Input |
| **Select** | `htmlFor`/`id`, stacked above | `id` goes on `SelectTrigger` (the actual focusable/clickable element), not the Select root |
| **Switch** | `htmlFor`/`id`, inline beside | Radix's click-proxy is load-bearing here — Switch is a `button[role=switch]`, not a native input |
| **Radio Group** | **Two label roles at once** — a *group* label via `aria-labelledby` on the `RadioGroup` root (no single `htmlFor` target exists for a group), plus a separate, ordinary `htmlFor`/`id` label per individual `RadioGroupItem` ("Credit card", "Bank transfer", etc.) | The one composition pattern in this list that isn't just "point `htmlFor` at the control's `id`" — worth its own demo section specifically because it's easy to get wrong by reaching for `htmlFor` on the group out of habit |

## 9. Enterprise use cases

- **Required-field indication on creation forms** — vendor creation, PO creation (both already demoed via `Dialog`) are the immediate, real consumers.
- **Group labels for routing/choice decisions** — e.g. "Approval routing" with Auto-approve / Manual review / Escalate as `RadioGroupItem`s — a realistic procurement pattern, and the concrete reason §8's group-labeling distinction matters in practice, not just in theory.
- **Read-only field labels in view-only/detail screens** — viewing a submitted PO or vendor record without editing rights; the "no visual change" decision in §5 is what makes this look right.
- **Label paired with a `Tooltip`** for supplementary context (e.g. "Tax ID ⓘ" where the icon explains the expected format) — not a new Label feature, just a composition worth demoing since `Tooltip` already exists and this is a common enterprise-form need.

## 10. Demo requirements

- Stacked with `Input` (the baseline case).
- Inline with `Checkbox` and `Switch`.
- With `Select` (`id` on the trigger).
- **Radio Group, showing both label roles at once** — one group-level `aria-labelledby` label plus three per-item `htmlFor` labels.
- `required` example.
- `disabled` example, using the new explicit prop — and ideally shown *next to* a control whose own `disabled` state is set in the normal label-before-control order, to visibly prove the corrected mechanism works where the original wouldn't have.
- `readOnly`-paired example showing **no visual change** in the label, deliberately, to make the §5 decision visible rather than just documented.
- One `Label` + `Tooltip` composition.

---

## Comparison: Material Design, Atlassian Design System, Shopify Polaris, GitHub Primer

- **Material Design (MUI)**: `TextField`'s label is a *floating* label — it animates from inside the field into a smaller position above it on focus/fill. This is a fundamentally different visual paradigm (label motion tightly coupled to the field's own state) and isn't really a standalone, independently-composable primitive the way Krane wants — it's baked into the field component. Required state auto-appends `*` when the field's `required` prop is set.
- **Atlassian Design System (Atlaskit)**: `Label` is a standalone component, much closer to Krane's intended shape. Notably, required indication is its own separate composable piece (`RequiredAsterisk`), not a boolean prop on `Label` — composition over configuration. Their `Form` package keeps `HelperMessage`/`ErrorMessage` deliberately separate from `Label`, reinforcing the same boundary Krane already drew (Label doesn't own validation messaging).
- **Shopify Polaris**: Doesn't expose a standalone `Label` primitive for manual composition at all — `TextField`/`Select`/etc. take a `label` *prop* directly, and the field renders its own label internally. `labelHidden` (visually hide, stay accessible) and `requiredIndicator` exist as props on the *field*, not a separate component. A real architectural alternative Krane is deliberately not following — Krane's separate-primitive approach matches Atlaskit and Primer more than Polaris.
- **GitHub Primer**: `FormControl.Label`, used inside a `FormControl` compound component that auto-generates and wires the `id`/`htmlFor` association — no manual wiring needed once inside `FormControl`. This is the closest existing precedent to what `FORM_FOUNDATION_PLAN.md` already plans to build (`Form`/`FormField`/`FormItem`/`FormLabel`) — Primer's existence and maturity is a real signal that direction is sound, not speculative. Primer's Label also supports `visuallyHidden`.

### Existing capabilities
Nothing — `Label` doesn't exist yet. The only "existing capability" is the three hand-rolled, soon-to-be-superseded `<label>` elements in the `Input` demo.

### Missing capabilities
- The component itself, full stop.
- **Visually-hidden label support** (Polaris's `labelHidden`, Primer's `visuallyHidden`) — needed for icon-only/compact controls (e.g. a toolbar search input) where a visible label would be redundant but a real accessible name is still required. Not in the original spec at all.
- Required-state indication (now added, §5/§7).
- A working, DOM-order-independent disabled mechanism (now corrected, §5/§7).
- Group-labeling guidance for multi-control compositions like `RadioGroup` (now added, §6/§8).

### Recommended additions
Everything in §5/§7 above (`required`, the corrected `disabled`), plus a `visuallyHidden` boolean (renders the label with `sr-only`-style classes — visually hidden, still in the accessibility tree) — the one gap this audit found that isn't already folded into the sections above. Recommend adding it now, at the same time as `required`/`disabled`, rather than as a second pass: it's the same shape of change (a boolean prop toggling a class), and Polaris/Primer both treat it as core enough to ship in their base label API, not an afterthought.

### Must-have vs. Nice-to-have

**Must-have**: the component itself; `required`; the corrected `disabled` mechanism; the `aria-labelledby` group-labeling pattern documented for `RadioGroup` (without it, the very next component built on this foundation ships with an accessibility gap on day one, not eventually).

**Nice-to-have**: `visuallyHidden` (real, but no concrete blocking consumer yet — the same bar `INPUT_GAP_ANALYSIS.md` used to sort its own list); the `Label`+`Tooltip` composition (valuable, demonstrable, not foundational).

### Final recommendation for Krane

Build `Label` with exactly the API in §7 (`required`, `disabled`, passthrough) plus `visuallyHidden` — four props total, still one of the smallest components in this system. Do not follow Polaris's bake-the-label-into-every-field architecture; Krane has already committed to the separate-primitive path (matching Atlaskit/Primer), and `Input`/`Textarea`/`Select`/`Switch`/`RadioGroup` are all already built or specified assuming a standalone `Label` they compose with, not one they contain. The `aria-labelledby` group-labeling pattern is the one piece of this document that isn't a simple prop addition — it's a documentation/convention fix that costs nothing to build but actively prevents a wrong pattern (reaching for `htmlFor` on a group) from shipping in whatever uses `RadioGroup` first.
