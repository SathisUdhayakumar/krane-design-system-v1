# Krane Design System — Form Foundation

Audit + specification, now implemented at `components/ui/form.tsx` exactly per the architecture below (`react-hook-form` + `zod` + `@hookform/resolvers`, all three installed with explicit instruction), demoed at `/demo/form`. This is the validation-layer half of `FORM_FOUNDATION_PLAN.md`'s "two independent dependency chains" — the field primitives chain (Label through Switch) shipped first; this document was the first real look at the second chain, and it changed one load-bearing assumption that plan made.

Two implementation discoveries beyond this spec, both found during the pre-implementation verification this document called for, not after: **`Combobox` needed a small API extension** (`aria-describedby`/`aria-labelledby` passthrough, an overridable `aria-invalid`) before `FormControl` could reach its actual interactive element — exactly the prerequisite §8 named. And **`FormControl`/`FormLabel` needed one real addition beyond what's specified below**: `FormControl` also injects `aria-labelledby` (not just `id`), and `FormLabel` sets its own `id` (not just `htmlFor`) — `RadioGroup`'s root has no native label association (divs aren't labelable elements), so without this, a `FormField`-wrapped `RadioGroup` would have had no accessible name from `FormLabel` at all. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail on both.

## Audit: existing codebase state

- **`react-hook-form` is still not an installed dependency.** Confirmed again directly against `package.json` (12 dependencies, unchanged from the last audit). `zod` is still present in `node_modules` only as a transitive dependency of `shadcn`'s own toolchain, not a direct one — importing it today would mean depending on a package that isn't actually declared and can vanish on a clean install.
- **A real correction to `FORM_FOUNDATION_PLAN.md`'s framing**: that document said "`react-hook-form` is not currently installed… this is a hard blocker for this entire cluster" — true, but incomplete. **`@radix-ui/react-form` is already installed**, sitting inside the same `radix-ui` umbrella package every other primitive in this project comes from, confirmed by reading its actual shipped type definitions: it exports `Form`, `FormField`, `FormLabel`, `FormControl`, `FormMessage`, `FormValidityState`, and `FormSubmit` — almost the exact name set this document was asked to define. It is unused. This document evaluates it seriously before recommending against it (§ comparison, below) — it is not the zero-dependency free lunch its presence might suggest.
- **A concrete naming-collision risk, found by this audit, not by inspection after the fact**: whatever Krane builds will be named `Form`/`FormField`/`FormLabel`/`FormControl`/`FormMessage` — identical to `@radix-ui/react-form`'s own exports. A future contributor importing from `"radix-ui"` without realizing Krane already has its own `components/ui/form.tsx` could pull the wrong `Form` family by accident, and both would type-check fine since their shapes are superficially similar. Worth a one-line warning in the eventual implementation's file header, not a reason to rename anything.
- **All seven field primitives this layer needs to wrap now exist** — `Label`, `Input`, `Textarea`, `Select`, `Combobox`, `RadioGroup`, `Switch` (plus `Checkbox`, built earlier still). This audit checked each one's actual prop surface for `react-hook-form` compatibility, not just assumed it from the API docs written when each shipped:
  - **`Input`, `Textarea`** — plain native elements, fully `ref`-forwarding, already compatible with `register()` with zero adapter needed.
  - **`Select`, `RadioGroup`, `Switch`, `Checkbox`** — Radix-based, `button`/`div`-rendered, not native form controls. These need `Controller`, not `register()` — the same split Material UI's own official guidance describes for wrapping MUI's controlled components, for the identical underlying reason (no native ref/onChange/onBlur signature to register against).
  - **`Combobox`'s current prop surface has a real, concrete gap**: it accepts `id` but not `aria-invalid` or `aria-describedby`, and doesn't spread an arbitrary `...rest` onto its trigger button. A `FormControl` that Slot-injects those two ARIA attributes onto whatever it wraps (§3, below) would silently fail to reach `Combobox`'s actual interactive element. This is a small, named prerequisite for whenever this layer is actually built — not a blocker for this document, but a real implementation note that would otherwise be "discovered" mid-build the way `Toast`'s imperative-API gap once was.

---

## 1. Purpose

Owns validation state, error display, and accessible field-wiring **across** a multi-field form — the layer above individual field primitives, not a replacement for any of them. `Label`, `Input`, `Select`, `Combobox`, `RadioGroup`, `Switch` all already draw a hard line at "I style in response to `aria-invalid`/`status`, I never decide what's invalid" (every one of their foundation docs says this explicitly). This layer is where that line stops being a deferral and becomes a real answer: something has to own *deciding* a field is invalid, propagate that decision to the right DOM attributes, and render the message a human reads. That's this document's entire scope.

## 2. Architecture

```
FormProvider (react-hook-form)           ← Form, a thin re-export
  └─ useForm({ resolver: zodResolver(schema) })   ← owns submission/dirty/touched state machine
       │
       ▼
   FormField (name="vendorId")           ← provides FormFieldContext { name }
       │  wraps Controller (for Radix-based fields) or register() (for native ones)
       ▼
   FormItem                              ← provides FormItemContext { id }, generates the id once
       │
       ├─ FormLabel        (htmlFor={formItemId}, data-error styling)
       ├─ FormControl      (Slot — injects id/aria-invalid/aria-describedby onto its one child)
       ├─ FormDescription  (id={formDescriptionId}, helper text)
       └─ FormMessage      (id={formMessageId}, renders fieldState.error?.message or null)

useFormField()  ← the shared glue: reads FormFieldContext.name + FormItemContext.id +
                   useFormContext().getFieldState(name) — every one of the four leaf
                   pieces above is a thin consumer of this one hook, not independent logic.
```

This is the same shape `FORM_FOUNDATION_PLAN.md` already sketched, now confirmed against shadcn/ui's actual shipped source (not assumed): `FormFieldContext` holds only `{ name }`, `FormItemContext` holds only `{ id }`, and `useFormField()` is the single point combining both contexts with `react-hook-form`'s own `getFieldState`. `FormControl` specifically renders Radix's `Slot.Root` (already available in this project's installed `radix-ui` bundle, already the mechanism behind `Button`'s and `Badge`'s `asChild`) — it injects `id`, `aria-invalid`, and `aria-describedby` onto whichever single child it wraps, which is why `Combobox`'s missing passthrough (audit, above) matters: `FormControl` has to wrap the actual interactive element, not a non-forwarding wrapper around it.

## 3. Form composition model

| Piece | Renders | Reads | Provides |
|---|---|---|---|
| **`Form`** | Nothing itself — a thin re-export of `react-hook-form`'s `FormProvider` | — | `react-hook-form`'s form context (consumed by `useFormContext()` deeper in the tree) |
| **`FormField`** | Nothing itself — wraps `Controller` (Radix-based fields) or just provides context around `register()`'d native fields | `name` prop | `FormFieldContext { name }` |
| **`FormItem`** | `<div className="grid gap-2">` (or Krane's own spacing equivalent — no new token either way) | — | `FormItemContext { id }`, one `useId()` call per field, shared by every id below |
| **`FormLabel`** | Krane's existing `Label` (not a new label implementation — reuses it directly) | `useFormField()` | `htmlFor={formItemId}`, `data-error` styling hook |
| **`FormControl`** | Radix `Slot.Root` | `useFormField()` | `id={formItemId}`, `aria-invalid`, `aria-describedby` — injected onto its one child |
| **`FormDescription`** | `<p>` (Krane's `text-caption text-muted-foreground`, not a new typography role) | `useFormField()` | `id={formDescriptionId}` |
| **`FormMessage`** | `<p>` (Krane's `text-caption text-destructive` — the same caption/destructive pairing every other component's error caption in this system already uses) | `useFormField()` | `id={formMessageId}`; renders `null` when there's no error — never an empty, visually-present element |

Every "Provides" column entry exists because something below it reads it via `useFormField()` — there is exactly one shared hook, not six independent implementations, mirroring the `FORM_FOUNDATION_PLAN.md` warning that this is "a single connected cluster," not six standalone pieces.

## 4. Validation ownership

Four distinct layers, not one — conflating any two of them is how this kind of layer usually goes wrong:

1. **Shape/type/cross-field rules — `zod`.** "Amount must be a positive number," "rejection reason is required when status is `rejected`," "Net 60 payment terms require `manual` or `escalate` routing, not `auto`" — all expressible as a schema, all validated client-side before submission, all independent of any specific field component.
2. **Submission/dirty/touched state machine — `react-hook-form`.** Whether a field has been touched, whether the form is currently submitting, whether to revalidate on blur vs. on change — this is `useForm()`'s job, not something `FormField`/`FormItem` should re-derive.
3. **Translating state into accessible UI — the `Form*` composition layer itself (§3).** `FormMessage` doesn't decide *whether* something is invalid; it reads `fieldState.error?.message` and renders it, or renders nothing. `FormControl` doesn't decide invalidity either; it reads the same state and sets `aria-invalid` accordingly. This layer is a faithful renderer of layers 1–2's decisions, never an independent source of them — the exact same boundary already drawn for every field primitive's own `status`/`aria-invalid` props.
4. **Server-side / async business-rule validation — explicitly *not* `zod`'s job.** "This vendor's credit limit is exceeded," "this material is currently out of stock" — these require a network round-trip `zod`'s synchronous schema validation can't express. The correct mechanism is `react-hook-form`'s own `setError()`, called from a submit-time (or debounced on-change) async check, landing in the exact same `formState.errors` shape `zod`-driven errors do — `FormMessage` doesn't need to know or care which layer produced the error it's rendering.

## 5. Error propagation

```
zod schema validation failure
  → zodResolver (the @hookform/resolvers adapter — a separate package, see §9)
    → react-hook-form's formState.errors[name]
      → Controller's fieldState.error  (Radix-based fields)  OR  register()'s field-level error (native fields)
        → useFormField()'s merged return value
          → FormMessage renders fieldState.error.message
          → FormControl sets aria-invalid={!!fieldState.error}, aria-describedby includes formMessageId only when an error exists
          → FormLabel gets data-error={!!fieldState.error}, styled via the same border-destructive/text-destructive
            vocabulary already established by every field primitive's own status="error" treatment — not a new error color
```

Server-side errors (§4, layer 4) enter this same chain one step lower — `setError(name, { message })` lands in the identical `formState.errors[name]` slot a `zod` failure would, so everything downstream of that point (steps 3 onward above) is unaffected by which layer produced the error. This is the whole reason `FormMessage` never needs a "is this a schema error or a server error" branch.

## 6. Accessibility requirements

- **`FormControl`'s `aria-describedby` must include both `formDescriptionId` and `formMessageId` when both exist**, space-separated — not just whichever one was added most recently. Getting this wrong (overwriting instead of joining) is an easy, real mistake when `FormDescription` and `FormMessage` are both present on the same field (a help line and a live error, e.g. "Enter the vendor's tax ID" + "Tax ID must be in the format XX-XXXXXXX").
- **Required marking belongs on the control itself** (native `required`/`aria-required="true"`), **not just visually via `Label`'s decorative asterisk** — already established in `LABEL_FOUNDATION.md` §6, restated here because `FormField`'s `zod`-driven required-ness is the first real place this distinction gets exercised with actual schema-derived state rather than a manually-passed boolean.
- **Do not rely on native browser validation UI as the accessible error mechanism** — GitHub Primer's own design guidance states this explicitly: native validation messages aren't reliably exposed to screen readers and visually clash with a system's own styling. This is a direct argument against `@radix-ui/react-form`'s `ValidityState`-driven model for anything beyond the simplest required/pattern checks (§ comparison, below), not just a generic caution.
- **`FormMessage` needs a way for screen-reader users to learn an error appeared without requiring them to re-focus the field** — neither shadcn's reference implementation nor `@radix-ui/react-form` solves this by default; a `role="alert"` (or `aria-live="polite"`) on the rendered message element is a real, named addition this document recommends adding, not assumed already solved by copying a reference pattern verbatim.
- **`FormControl` must wrap the actual interactive element**, not a non-forwarding wrapper — the `Combobox` gap named in the audit above is the concrete reason this requirement is stated explicitly rather than assumed obvious.

## 7. API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped.

```ts
// Form — thin re-export, no Krane-specific logic
const Form = FormProvider  // from react-hook-form

// FormField — generic over the schema's field names
function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>
): JSX.Element

// useFormField — the shared glue (§2/§3)
function useFormField(): {
  id: string
  name: string
  formItemId: string
  formDescriptionId: string
  formMessageId: string
} & ControllerFieldState  // { error, isDirty, isTouched, invalid }

// FormItem
function FormItem(props: React.ComponentProps<"div">): JSX.Element

// FormLabel — reuses Krane's existing Label, not a new implementation
function FormLabel(props: React.ComponentProps<typeof Label>): JSX.Element

// FormControl — Slot-based, injects id/aria-invalid/aria-describedby onto its one child
function FormControl(props: React.ComponentProps<typeof Slot.Root>): JSX.Element

// FormDescription
function FormDescription(props: React.ComponentProps<"p">): JSX.Element

// FormMessage — renders fieldState.error?.message, or its own children as a fallback, or null
function FormMessage(props: React.ComponentProps<"p">): JSX.Element
```

## 8. React Hook Form integration

- **Two integration paths across Krane's seven field primitives, not one** — confirmed by checking each component's actual rendered output (audit, above), not assumed uniformly:
  - `Input`/`Textarea`: `register()` directly — native elements, no `Controller` overhead needed.
  - `Select`/`Combobox`/`RadioGroup`/`Switch`/`Checkbox`: `Controller`, wiring `field.value`/`field.onChange` to each component's existing `value`/`onValueChange` (or `checked`/`onCheckedChange`) props — already shaped correctly for this with zero rework, the same observation `FORM_FOUNDATION_PLAN.md` made about `Checkbox` specifically, now confirmed true of every Radix-based primitive built since.
- **`Combobox` needs one small, named addition before this integration is real**: accept and forward `aria-describedby` (and respect an externally-supplied `aria-invalid` the same way `status="error"` already derives one internally) — not a redesign, a small prop-surface extension, flagged now so it isn't rediscovered mid-build.
- **New dependencies, precisely**: `react-hook-form` itself, **plus `@hookform/resolvers`** — a separate package from `react-hook-form`, not bundled with it, required to bridge a `zod` schema into `useForm()`'s `resolver` option. `FORM_FOUNDATION_PLAN.md`'s dependency graph named `react-hook-form` but not this second package — a real, concrete correction this audit found, not a restatement.

## 9. Zod integration

- **`zod` must become a real, direct dependency** — it is currently transitive-only (audit, above; the same flag `FORM_FOUNDATION_PLAN.md` and every `COMPONENT_STATUS.md` pass since has carried). This is not new information, but it's restated here because this is the document where it finally matters: the Form layer cannot be built without resolving it.
- **The integration point is `zodResolver(schema)` passed to `useForm()`'s `resolver` option** (from `@hookform/resolvers/zod`, §8) — `zod` itself never touches any Krane component directly; it only ever talks to `react-hook-form` through that one adapter function.
- **Cross-field rules belong in the schema, not in individual field components** — e.g. `z.object({...}).refine(data => data.paymentTerms !== "net60" || data.routing !== "auto", { message: "Net 60 terms require manual review or escalation", path: ["routing"] })`. This is the concrete mechanism behind §10's enterprise use cases below, not a hypothetical capability.
- **Async/server-driven checks are explicitly out of `zod`'s scope** (§4, layer 4) — `zod`'s `.refine()` supports async predicates in principle, but a network round-trip inside schema validation on every keystroke is the wrong place for it; `react-hook-form`'s `setError()` at submit time (or a debounced handler) is the correct mechanism, already covered in §5's error-propagation chain.

## 10. Enterprise use cases

- **PO creation form** — the canonical example this whole field-primitive cluster was built toward: vendor (`Combobox`), CSI division (`Select`), manufacturer (`Combobox`), amount (`Input`), notes (`Textarea`), auto-approve (`Switch`), approval routing (`RadioGroup`) — all in one schema-validated form, with the cross-field rule named in §9 (`paymentTerms`/`routing` interaction) as the concrete reason a schema-based layer is load-bearing here, not decorative.
- **Vendor onboarding form** — conditionally required fields (a tax ID format requirement that only applies to domestic vendors, an insurance-certificate upload requirement only above a certain contract value) — exactly the shape of rule `zod`'s `.refine()`/`.superRefine()` express cleanly and native HTML5 `required` cannot.
- **Rejection/approval reasoning** — a `Textarea` that becomes required only when a sibling `RadioGroup`/`Select` is set to "rejected" — the same conditional-requirement shape as vendor onboarding, different domain.
- **Async business-rule validation at submit** — "this vendor's credit limit is exceeded," surfaced via `setError()` (§4/§9), the concrete reason a server-validation escape hatch matters and isn't speculative.

## 11. Demo requirements

- A real, multi-field PO creation form (per §10) using every field primitive this system has shipped — `Label` (via `FormLabel`), `Input`, `Textarea`, `Select`, `Combobox`, `RadioGroup`, `Switch` — composed through the full `Form`/`FormField`/`FormItem`/`FormControl`/`FormDescription`/`FormMessage` stack, not a subset.
- At least one **cross-field validation rule visibly enforced** (the payment-terms/routing interaction from §9) — submitting an invalid combination must show the error on the correct field, not just block submission silently.
- A **required-field example** showing the `Label` asterisk (decorative) paired with the control's real `aria-required` (the actual signal) — directly demonstrating §6's restated requirement, not just asserting it.
- A **simulated async/server-error example** (a `setTimeout`-driven fake credit-limit check at submit time, mirroring the same simulated-delay convention already used in `Input`'s and `Combobox`'s own demos) — proving §4/§9's layer-4 error path actually renders through `FormMessage` correctly, not just documented as theoretically possible.
- An **empty-vs-populated `FormDescription` + `FormMessage` co-presence example** — directly exercising §6's `aria-describedby`-must-join-not-overwrite requirement.

---

## Comparison: shadcn/ui, Radix UI, Material Design, Atlassian Design System, Shopify Polaris, GitHub Primer

**shadcn/ui** — the direct architectural source for the exact component names this document was asked to define. Confirmed against its actual shipped source (not assumed): `FormFieldContext` holds `{ name }`, `FormItemContext` holds `{ id }`, `useFormField()` merges both with `react-hook-form`'s `getFieldState`, `FormControl` is a `Slot`-based prop injector, `FormMessage` renders `null` when there's no error rather than an empty paragraph. **Verdict**: this is the architecture §2/§3 already describe — not a Krane invention, the standard recipe, the same relationship `Combobox`'s `Popover`+`cmdk` composition already has to shadcn's own Combobox recipe.

**Radix UI** (`@radix-ui/react-form`) — already installed, unused, exports nearly the same name set (`Form`/`FormField`/`FormLabel`/`FormControl`/`FormMessage`/`FormValidityState`/`FormSubmit`). Built entirely around the native HTML5 Constraint Validation API: `FormMessage`'s `match` prop targets `ValidityState` keys (`valueMissing`, `typeMismatch`, `patternMismatch`, etc.), with a `CustomMatcher` escape hatch for one-off sync/async predicates per field. **No schema validation, no cross-field rules, no form-wide state machine** (no `useForm()`-equivalent, no `watch()`/`getValues()`/`setError()`). A GitHub Radix Primitives discussion is explicit on the compatibility question this document had to ask directly: combining `@radix-ui/react-form` with `react-hook-form` means "two competing validation methods" — they are alternative architectures for the same problem, not complementary layers. **Verdict**: technically free, but cannot express §9's/§10's actual enterprise requirements (the payment-terms/routing cross-field rule has no native HTML5 validity attribute to hang off of) — reject for Krane's real domain, not on principle.

**Material Design (MUI)** — no built-in form-state library of its own; the documented, official pattern is wrapping MUI's controlled components in `react-hook-form`'s `Controller`, with an explicit warning not to double-register a field already wrapped in one. This is the direct precedent for §8's "two integration paths" finding — MUI's own components are controlled exactly the way Krane's Radix-based ones are, for the identical underlying reason (no native ref to register against).

**Atlassian Design System (Atlaskit)** — `@atlaskit/form`'s current documentation describes `useForm`/`useFormState`/`handleSubmit` in terms that mirror `react-hook-form`'s own API closely (shared `defaultValues` semantics, the same async-validation-via-`handleSubmit` shape) — independent confirmation that the schema/resolver-based model this document recommends is also where a mature enterprise design system landed, not a Krane-specific choice made in isolation.

**Shopify Polaris** — does not use `react-hook-form` at all; Shopify's own official recommendation is `@shopify/react-form`, a separate, Shopify-built form-state library designed specifically to pair with Polaris components. A real, deliberate divergence from this document's recommendation, included for completeness: it confirms a major design system *can* successfully build its own form-state layer rather than adopt `react-hook-form`, but doing so is a multi-year investment a single internal design system the size of Krane has no concrete reason to take on when a mature, widely-known library already solves the same problem.

**GitHub Primer** — `FormControl` plus `FormControl.Validation` for inline error/validation text, with explicit design guidance (cited in §6) against relying on native browser validation UI for exactly the accessibility reasons this document already flags independently. Primer's convention of marking the *control* required rather than relying on a separately-styled required indicator is the direct precedent already folded into §6's restated requirement.

---

## Existing capabilities

Nothing implemented. The "existing capability" is the complete set of seven field primitives this layer composes (`Label` through `Switch`, all already shipped with `status`/`aria-invalid` boundaries already drawn correctly) and `@radix-ui/react-form`'s presence as an already-installed-but-rejected alternative (§ comparison) — both real, both confirmed this pass, neither previously documented together until now.

## Missing capabilities

- The component itself, full stop — `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`, none built.
- **`react-hook-form` and `@hookform/resolvers`, both genuinely missing** — `FORM_FOUNDATION_PLAN.md` only named the first; this audit found the second.
- **`zod` as a real, direct dependency** — present only transitively today, a known, repeatedly-flagged, still-unresolved blocker.
- **A small `Combobox` API extension** (`aria-describedby` passthrough, an externally-settable `aria-invalid`) — not built, a real prerequisite named by this audit, not a hypothetical one.
- **An accessible live-announcement mechanism for newly-appearing error messages** (`role="alert"`/`aria-live`) — absent from both the shadcn reference implementation and `@radix-ui/react-form`; a real Krane-specific addition this document recommends, not copied from either source.

## Recommended architecture

`Form` (thin `FormProvider` re-export) → `FormField` (wraps `Controller` for Radix-based fields; a thinner wrapper for `register()`'d native fields) → `FormItem` (generates the shared id) → `FormLabel`/`FormControl`/`FormDescription`/`FormMessage`, all four reading the single `useFormField()` hook (§2/§3/§7). Validated by `zod` via `zodResolver` (§9), with async/server-rule validation entering through `react-hook-form`'s own `setError()` rather than through the schema (§4/§5). Built on `react-hook-form` + `zod` + `@hookform/resolvers` — three real, explicit new dependencies, not one — composed with the seven already-shipped field primitives rather than reimplementing any of them.

## Must-have vs. Nice-to-have

**Must-have**: the component itself; `zod` promoted to a direct dependency; `@hookform/resolvers` (the integration is incomplete without it — `useForm()` has no schema-validation path otherwise); the `Combobox` API extension (§8) — without it, one of this layer's seven target primitives silently can't participate; the `aria-describedby` join-not-overwrite behavior (§6) — a real, easy-to-get-wrong correctness requirement, not a refinement; the `role="alert"`/live-announcement addition to `FormMessage` (§6) — a real accessibility gap neither reference implementation solves by default.

**Nice-to-have**: a reusable cross-field `.refine()` pattern library for common Krane rules (payment-terms/routing, conditional-required) — valuable once two or three real forms exist to generalize from, premature to build against one hypothetical form today; a dedicated async-validation hook wrapping the `setError()` pattern (§4/§9) — real, but the raw pattern is simple enough to use directly until it's been hand-written three or four times.

## Final recommendation for Krane

Build the `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage` cluster on **`react-hook-form` + `zod` + `@hookform/resolvers`** — not `@radix-ui/react-form` (already installed, but architecturally incapable of the cross-field/schema validation Krane's actual procurement domain needs, and explicitly not meant to be combined with `react-hook-form` per Radix's own community guidance) and not a hand-rolled validation layer (re-deriving a solved problem, the same reasoning that ruled out a hand-rolled `Combobox` filter). Treat the three-package dependency addition with the same explicit weight already on record for `cmdk`: name it, justify it, do not add it silently as a side effect of building something else. Resolve the two concrete prerequisites this audit found before or during implementation — `Combobox`'s small API extension (§8) and `zod`'s promotion to a direct dependency (§9) — rather than discovering either mid-build.
