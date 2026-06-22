# Krane Design System — Input Foundation

**v1 API frozen.** This document originally specified the base component (sizes, icon slots, the five core states); a follow-up pass (`INPUT_GAP_ANALYSIS.md`) audited it against Material/Atlaskit/Polaris/Primer and identified five must-have additions, all now implemented: read-only state, a `status` prop, `clearButton`/`onClear`, `loading`, and `prefix`/`suffix` (replacing the original icon-only slots). Sections below are updated to reflect what actually shipped, not the original proposal where the two differ.

## Audit: existing precedent

Two hand-rolled instances already exist, both sharing the same recipe — confirmed directly in source:
```
app/demo/dialog/page.tsx:155,166        h-9 rounded-md border border-input bg-background px-3 text-sm
                                         outline-none focus-visible:border-ring focus-visible:ring-3
                                         focus-visible:ring-ring
components/ui/data-table.tsx:315        identical, plus pl-8 (room for a leading Search icon) pr-3
```
This confirms the `default` size below isn't a fresh design decision — it's a formalization of what two real call sites already independently arrived at. Both should be migrated to the real component once it exists (not done as part of this pass — that's a separate follow-up).

## 1. Visual specification

Single-line text field. `rounded-md`, `border border-input`, `bg-background`, `text-sm` (at default size), placeholder in `placeholder:text-muted-foreground`. No filled/ghost/underline variants — a text field's visual treatment shouldn't vary by context the way a Button's does (a Button's variant maps to *intent* — primary action vs. destructive vs. secondary; an Input's intent is always "let the user type," so manufacturing visual variants here would be distinguishing things that aren't actually different).

## 2. States

| State | Treatment |
|---|---|
| Default | `border-input bg-background` |
| Hover | None — no precedent anywhere in this codebase for hovering a text field changing its appearance; only focus should signal interactivity |
| Focus | `outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring` — identical mechanism to every other interactive primitive in this system |
| Disabled | `disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed` |
| **Read-only** *(new in v1 freeze)* | `read-only:bg-muted read-only:cursor-default` — deliberately distinct from disabled: full opacity, text stays selectable/copyable, no "blocked" cursor. Relies on the native `readOnly` HTML attribute (no `aria-readonly` needed — native `readonly` is already correctly exposed to assistive tech on a real `<input>`) |
| Invalid | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40` — copied exactly from `Button`'s aria-invalid block. Still present standalone (for any consumer setting `aria-invalid` directly); superseded in practice by `status="error"`, below |
| **Loading** *(new in v1 freeze)* | Not a CSS state — a trailing `Loader2` spinner (`animate-spin`) takes over the trailing slot, `aria-busy="true"` is set on the input. The field stays fully editable while loading — this models "checking what you typed" (e.g. vendor-name uniqueness), not "field unavailable" |

## 3. Token usage

`border-input`, `bg-background`, `text-foreground` (inherited), `placeholder:text-muted-foreground`, `border-ring`/`ring-ring`, `border-destructive`/`ring-destructive`. Zero new tokens.

## 4. Accessibility requirements

- Must be paired with a `Label` via `htmlFor`/`id` at the usage site — Input can't enforce this itself.
- `aria-invalid` is set by the consumer (or the future `Form`/`useFormField()` layer) — Input only *styles* in response to it, never manages validation state itself.
- Icon slots (below) are always `aria-hidden` — decorative only, never the sole conveyor of meaning.

## 5. API design — as implemented (v1 frozen)

```ts
type InputProps = Omit<React.ComponentProps<"input">, "size" | "prefix" | "suffix"> &
  VariantProps<typeof inputVariants> & {
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    clearButton?: boolean
    onClear?: () => void
    loading?: boolean
  }
```

**Two native attributes are omitted, not one.** `size` was the originally-documented collision (HTML's native character-width `size: number` vs. this component's `size` variant). Implementation surfaced a second, unanticipated one: TypeScript's DOM typings for `<input>` also declare a native (XML-namespace-related, effectively unused in practice) `prefix` attribute, which collided with the new `prefix` slot the same way. Both `prefix` and `suffix` are omitted from the native props for the same reason `size` was — confirmed by an actual `tsc` failure during implementation, not discovered by inspection.

**`prefix`/`suffix` replaced the original `startIcon`/`endIcon`**, and changed shape while doing it — `React.ComponentType<{className}>` (a component *reference*, so Input could inject sizing) became `React.ReactNode` (already-rendered content). This trades away Input's ability to auto-size icon content for the ability to accept plain text (`"$"`, `"kg"`) in the same slot — the actual point of generalizing them. Consumers passing icons now size them themselves (`prefix={<Search className="size-4" />}`), which is one line more per call site than before. At implementation time, zero real call sites depended on the old shape (only this component's own demo page used it), so the replacement cost was effectively zero.

**`clearButton`/`loading` share the trailing slot with `suffix`, in a fixed precedence**: `loading` (spinner) wins over `clearButton` (✕ button) wins over `suffix` (decorative content) — decided once, here, rather than left as an undocumented implementation detail. `clearButton` is a plain boolean with no built-in value-awareness; Input doesn't track whether there's anything *to* clear. A consumer who wants auto-hide-when-empty behavior gets it for free, since they already own the value: `clearButton={value.length > 0}` (demonstrated in the demo).

**Icon/prefix/suffix slots remain decorative-only**, except `clearButton`, which is the one built-in interactive trailing element now. A *different* interactive trailing element (password visibility toggle) still isn't a built-in prop — still demonstrated as manual composition, unchanged from the original spec's reasoning.

## 6. Variants — as implemented

**Still no color/style variants in the traditional sense** — but `status` (`"default" | "success" | "warning" | "error"`) is now a real `cva` variant, not just `aria-invalid` styling. `error` mirrors the existing always-on `aria-invalid` treatment (persistent colored border *and* ring, not gated to focus — errors get the loudest signal). `success`/`warning` are deliberately quieter: a persistent colored border only, with the matching color reinforced on `focus-visible`'s ring — a permanent green or amber ring glow on a field that's simply "fine" would be louder than the state warrants. `status="error"` also auto-derives `aria-invalid={true}` unless the consumer explicitly passes their own `aria-invalid` (which always wins).

**The composition axis is now three things, not two**: `prefix`/`suffix` content, the built-in `clearButton` action, and native `type`. Input passes `type` straight through with no Krane-specific handling per value, unchanged from the original spec.

## 7. Sizes

| Size | Height | Padding | Text | Note |
|---|---|---|---|---|
| `sm` | `h-8` (32px) | `px-2.5` | `text-xs` | |
| `default` | `h-9` (36px) | `px-3` | `text-sm` | Matches both existing hand-rolled instances exactly |
| `lg` | `h-10` (40px) | `px-3.5` | `text-sm` | |

**Known, deliberate divergence from `Button`'s size scale**: `Button`'s own `default` size is `h-8`, and `h-9` is `Button`'s `lg`. Input's `default` is `h-9`. These two scales are not meant to align 1:1 — a text field conventionally wants a bit more vertical room than a button at the "same" tier for comfortable typing/legibility, and forcing Input's default down to `h-8` would mean abandoning the two real, already-shipped precedents (the Dialog form, the DataTable search box) purely for cross-component symmetry that wasn't actually a stated goal. Recorded here explicitly so it reads as a decision, not an inconsistency someone "fixes" later.

Icon size stays a flat `size-4` across all three input sizes (matching how `Button`'s icon sizing is also size-invariant) — not independently tuned per tier. Acceptable simplification, revisit only if a specific size genuinely looks wrong with it.

## 8. Validation patterns

- **Input never owns validation logic.** It receives `value`/`onChange` (controlled) like any input, and `aria-invalid` like any styled state — both supplied by the consumer today, and by the future `Form`/`FormField`/`useFormField()` layer (`FORM_FOUNDATION_PLAN.md`) once it exists. This mirrors the same boundary already drawn for `Label` (no built-in invalid state, deferred to `FormLabel`).
- **Native HTML validation attributes pass straight through** — `required`, `pattern`, `minLength`/`maxLength`, `min`/`max` (for `type="number"`), `type="email"` — Input doesn't intercept or duplicate any of these; the browser's own constraint validation API continues to work normally underneath Krane's styling.
- **Error message association** is the consumer's responsibility today (`aria-describedby` pointing at a visible error string) — and becomes automatic once `FormMessage`/`FormItem`'s shared id context exists. Not built here; this document just confirms Input's `aria-invalid` styling is the half of that contract Input is actually responsible for.
- **Async validation** (e.g. checking vendor-name uniqueness against a server) is a timing/debounce concern that belongs in the consumer's `onChange` handler, not in Input — Input has no opinion about when validation runs, only how it looks once `aria-invalid` is set.

## 9. Demo requirements — as implemented

All originally specified, plus the v1-freeze additions — `/demo/input` now covers:

- Default, with placeholder, with value.
- All three sizes side by side.
- **Disabled vs. read-only, shown side by side** (not disabled alone) — the whole point of giving read-only its own treatment is that it should look visibly different from disabled, so the demo has to show both at once to prove it.
- All four `status` values, each paired with a real message (`success`/`warning`/`error` text colors reusing the existing `-text` token family, not new colors).
- `prefix`/`suffix` composition: a currency-adjacent example (`prefix="$"` + `suffix="USD"` — explicitly *not* a currency input, just the slots), an icon-as-`prefix` example, and a `suffix`-only unit example (`"kg"`).
- **A controlled clear-button example** tying `clearButton`'s visibility to the consumer's own value length, proving the "Input has no value-awareness, the consumer supplies it" design decision actually works as intended.
- **A static loading example** (`loading` + `readOnly` together, confirming the two new states don't conflict) and **an interactive one** simulating an async vendor-name availability check on a timer — the exact real-world case this state was built for.
- A few native `type` variations (`email`, `number`).
- The original fully-composed interactive example (password visibility toggle) — unchanged, since `prefix`/`suffix`'s decorative-only contract didn't change, only its content type did.
