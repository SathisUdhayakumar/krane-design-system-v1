# Krane Design System — Alert Foundation

Audit + specification, now implemented at `components/ui/alert.tsx` exactly per the recipe below (`Toast`'s variant treatment reused verbatim, `text-label`/`text-body` typography, zero new tokens, no Radix primitive), demoed at `/demo/alert`. Alert/Banner had been flagged as missing since this project's very first component audit, repeatedly deferred behind the entire field-primitive and `Form`-validation clusters.

One scope refinement made at implementation time: this document's §9 API sketch loosely suggested `AlertActions`/`AlertClose`/`AlertAction` as separate sub-components; the actual build instruction was narrower — three components (`Alert`/`AlertTitle`/`AlertDescription`), with dismiss and actions as singular (`onDismiss`/`primaryAction`/`secondaryAction`) props on `Alert` itself, which also has the effect of enforcing §6's "at most one of each" rule in the type system rather than leaving it to documentation. One small correction found during implementation: §2's literal class string omitted `items-start`, structurally required for the icon to align with the first line of text. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail on both.

## Audit: existing codebase state

- **No `Alert`/`Banner` component exists.** Confirmed by direct search — no file anywhere in this repository matches either name.
- **No headless primitive is needed, and none exists to reach for.** The `radix-ui` bundle's only "Alert"-adjacent export is `AlertDialog` (`@radix-ui/react-alert-dialog`) — a modal, focus-trapping confirmation pattern ("are you sure you want to delete this PO?"), solving a completely different problem (gating a destructive action) from a static, page-level status message. It is not a candidate architecture for this document and is mentioned only to close the question before it gets asked. Alert needs no portal, no focus management, no swipe gesture, no auto-dismiss timer — unlike `Toast`, which needed Radix specifically for those things, Alert is in the same "no Radix primitive needed" position `Input`/`Textarea`/`Label` were each in before they shipped.
- **`Toast` is the closest existing precedent, and its exact variant treatment should be reused, not reinvented.** `components/ui/toast.tsx`'s `toastVariants` already defines `border-{color}/30 bg-{color}/10 text-{color}-text` per status family, with a fixed `TOAST_ICON` map (`CheckCircle2`/`AlertTriangle`/`XCircle`/`Info`) — this is the same "soft, tinted" treatment every reference system audited below independently converged on for their own Alert-equivalent. Alert should borrow this as a **styling convention**, the same relationship `RadioGroup` has to `Checkbox`'s selection-color choice — not an import or composition dependency, since Alert has no shared runtime behavior with Toast.
- **A real, found typographic drift, worth correcting now rather than copying forward.** `Toast`'s own `ToastTitle`/`ToastDescription` use hand-rolled `text-sm font-semibold` / `text-sm opacity-90` — not Krane's formal `text-label`/`text-body` typography tokens. `Toast` was built before this project's `text-label`-vs-hand-rolled discipline was established (the same discipline that later corrected `Label`'s three hand-rolled instances in the `Input` demo, and that gave `Textarea` `text-body` instead of bare `text-sm`). This document does not propose fixing `Toast` itself — out of scope here — but `Alert` should use `text-label` (title) and `text-body` (description) from the start rather than perpetuate the same drift a second time.
- **`Badge`'s variant set (`default/success/warning/destructive/info/pending`) is not the right model — `Toast`'s four-variant set is.** `pending` is an operational-status concept (matching `DataTable` row states), not a page-level alert tone; this document's four requested variants (info/success/warning/error) match `Toast` exactly, not `Badge`.
- **Every token Alert needs already exists**: the `success`/`warning`/`destructive`/`info` families (each with `base`/`-foreground`/`-text` roles) have been complete since this project's first color-foundation pass. Zero new tokens, confirmed before writing a single line of spec below, not asserted afterward.

## 1. Purpose

A persistent, page- or section-level status message — distinct from `Toast` (transient, corner-positioned, auto-dismissing) and distinct from `FormMessage` (field-level, tied to one control's validation state via `useFormField()`). Alert's job is to communicate something true about the *current page or section as a whole*: "this PO was submitted successfully," "this vendor has an open dispute," "3 of 12 line items failed validation." It can be present from initial page load (unlike `Toast`, which only ever appears in response to an action) or appear dynamically — both are valid, and which one a given instance is changes its correct accessibility treatment (§8).

## 2. Visual specification

```
relative flex w-full gap-3 rounded-lg border p-4
```

No `shadow-*` — a deliberate omission, not an oversight: Alert sits in normal content flow as part of the page, the same reasoning that already keeps `Table`/`Card`-like persistent content shadow-free in this system while reserving `shadow-sm/md/lg` for genuinely elevated, floating chrome (`Popover`/`DropdownMenu`/`Dialog`/`Toast`). No `overflow-hidden`/`pr-8` either — both are `Toast`-specific (its swipe gesture and always-present close button), not relevant to a static banner.

**Variant treatment, reused verbatim from `Toast`'s already-established recipe:**

| Variant | Classes |
|---|---|
| `success` | `border-success/30 bg-success/10 text-success-text` |
| `warning` | `border-warning/30 bg-warning/10 text-warning-text` |
| `error` | `border-destructive/30 bg-destructive/10 text-destructive` (no `-text` variant needed — same reason `Toast`'s `destructive` doesn't have one: the base `--destructive` token already passes AA contrast directly) |
| `info` | `border-info/30 bg-info/10 text-info-text` |

**No neutral/default variant** — a deliberate difference from `Toast`, which has one. `Toast`'s `default` exists because a toast can be a content-neutral notification ("saved"). An Alert's entire purpose is communicating a status tone; "neutral information" is just `info`, a tone Krane already has. Picking one of the four variants is mandatory, not optional-with-a-fallback.

## 3. Variants

- **`info`** — neutral, ambient status communication. "New: bulk approval is now available." No urgency, no implied problem.
- **`success`** — confirms a completed action or a healthy state. "PO submitted for approval."
- **`warning`** — something needs attention but hasn't failed yet. "This vendor has an open dispute — review before proceeding."
- **`error`** — something failed or is blocking progress. "3 of 12 line items failed validation." Maps to the `--destructive` token family, the same "error" (public name) → `destructive` (token name) convention already established by `Input`/`Textarea`/`Select`/`Combobox`/`RadioGroup`/`Switch`'s own `status` props — not a new naming decision, a continuation of one already made six times.

## 4. Typography

**`text-label`** for the title, **`text-body`** for the description — not `Toast`'s hand-rolled `text-sm font-semibold`/`text-sm opacity-90` (audit, above). `text-body`'s defining feature (1.5 line-height) is the same justification already used for `Textarea`: description text is exactly the kind of content that wraps onto multiple lines, and `text-label`'s defining feature (weight 500, not button-bold 600) keeps the title's prominence coming from the icon/border/tint treatment, not from competing with `Textarea`/`Input` labels for visual weight elsewhere on the same page.

## 5. Icon behavior

A fixed `size-4` icon, one per variant, **not independently suppressible or overridable** — `success: CheckCircle2`, `warning: AlertTriangle`, `error: XCircle`, `info: Info`, the exact same map `Toast`'s `TOAST_ICON` already uses, reused verbatim rather than re-derived. This is a deliberate, stricter stance than Material UI's (which allows an `icon` override prop and a global `iconMapping`) and matches GitHub Primer's explicit position instead ("icons match the Banner variant and can't be disabled") — consistent with `Toast`'s own existing precedent in this codebase, which has never had an icon-override capability either. `aria-hidden="true"` — the icon is reinforcement for sighted users, never the accessible signal (the same decorative-only stance already applied to every status icon in this system).

## 6. Actions

**At most one primary action and one secondary action** — not an open-ended list. This is a convergent finding across the comparison set, not a Krane-specific guess: Shopify Polaris's `Banner` literally ships `action`/`secondaryAction` (exactly two slots), and Atlassian's `SectionMessage` documentation states explicitly: "avoid using more than two actions." Material UI's single `action` slot is the most permissive of the four real precedents, and even it is conventionally used for one button, not a list. Actions render right-aligned within the alert body (not floated into the dismiss button's corner), as plain `Button` instances — no new button variant, `Button`'s existing `size="sm"` is sufficient.

## 7. Dismissible behavior

**Opt-in via an `onDismiss` callback, not a separate boolean** — presence of the callback is what shows the close control, exactly Material UI's API shape ("if you provide an onClose callback... the component will display a close icon by default") and functionally identical to `Toast`'s own `ToastClose` pattern (X icon + `sr-only` "Close" text, reused verbatim for visual consistency: `absolute top-3 right-3 rounded-md opacity-70 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring`).

**A real, citable design guideline this document adopts deliberately, not incidentally**: both Shopify Polaris and GitHub Primer independently arrived at the same rule — dismissibility should track whether the user can actually resolve what the alert describes, not its variant. Polaris: "make banners dismissible, unless they contain critical information or an important step that customers need to take." Primer: dismissible banners "should be used for... something that the user can not solve" (an org-level issue, a passive informational notice) — implying banners describing something the user *can* and *should* act on right now are the ones that should stay non-dismissible, so dismissing isn't a way to silently skip required action. Concretely for Krane: "PO submitted successfully" (`success`) is safely dismissible; "3 of 12 line items failed validation" (`error`, blocking submission) should not be — dismissing it doesn't fix the line items, and removing the only visible indication of what's broken is a real, avoidable regression.

## 8. Accessibility requirements

- **`role="alert"` is not the universal default — this is a deliberate, sourced decision, not an oversight.** MDN's own ARIA reference states it plainly: "the alert role is for content that is dynamically displayed, not for content that appears on page load." A `success`/`info`/`warning` banner present from initial render gets no benefit from `role="alert"` (`aria-live="assertive"` + `aria-atomic="true"`, per spec) — there's no live-region *change* for it to announce, since it was never absent. Default Alert to a plain, well-structured region (a real heading element for the title, no implicit live-region role) — and expose an explicit prop (not a variant-driven default) for the one case where `role="alert"` is genuinely correct: an `error` alert that appears *dynamically*, in direct response to something the user just did (e.g., a page-level validation summary appearing right after a failed submit — the page-level sibling of `FormMessage`'s own `role="alert"`, already built in `components/ui/form.tsx`, but a structurally different element, not the same one reused).
- **A persistent, already-present banner that genuinely needs ongoing advisory announcement (rare, but real) should use `role="status"`** (`aria-live="polite"` + `aria-atomic="true"`, per MDN), not `role="alert"` — for the same reason `FormMessage` already distinguishes urgency level, just one tier down.
- **GitHub Primer's specific, concrete requirements are worth adopting wholesale, not just citing**: the alert is "exposed as a section landmark with a name appropriate for its variant type" (a `role="region"` + `aria-label` derived from the variant, e.g. "Warning"), it "has a default heading that matches the variant type" (so a sighted user *and* a screen-reader user both get the same "this is a warning" signal, not just a color), and that heading "can be visually hidden and remains in the accessibility tree" (a `visuallyHidden` escape hatch — the same pattern `Label` already has, reused, not reinvented).
- **The dismiss button needs a real accessible name** ("Dismiss this warning," not a bare "Close") and meets Primer's cited minimum target size (24×24 CSS pixels) — already satisfied by reusing `ToastClose`'s exact sizing/padding.

## 9. API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped.

```ts
type AlertVariant = "info" | "success" | "warning" | "error"

type AlertProps = React.ComponentProps<"div"> & {
  variant: AlertVariant            // required — no default, see §2
  role?: "alert" | "status"        // explicit, not variant-derived — see §8
}

type AlertTitleProps = React.ComponentProps<"h2"> & {
  visuallyHidden?: boolean         // see §8
}

type AlertDescriptionProps = React.ComponentProps<"p">

type AlertActionsProps = React.ComponentProps<"div">
// children: 1–2 <Button> instances, see §6

type AlertCloseProps = React.ComponentProps<"button"> & {
  onDismiss: () => void            // presence-driven, see §7
}
```

## 10. Composition patterns

| With | Pattern |
|---|---|
| **`Button`** | Action slot (§6) — plain existing `Button`, `size="sm"`, no new variant. |
| **`Form`** | A page-level validation-summary `Alert` (`error`, dynamically-appearing, `role="alert"`) sitting above a `Form` — distinct from, not a replacement for, the per-field `FormMessage`s already inside it. The two coexist: `FormMessage` answers "what's wrong with *this* field," the summary `Alert` answers "what's wrong with the *form as a whole*," exactly the same field-vs-group distinction already drawn for `RadioGroup`'s `aria-labelledby` correction. |
| **`Dialog`** | A `warning`/`error` `Alert` inside a confirmation `Dialog`'s body (e.g., "this action cannot be undone") — a real, common composition, not a hypothetical one; `Dialog` already uses `bg-card` for its own surface, and Alert's tinted background reads correctly nested inside it without any adjustment needed. |
| **`DataTable`** | An `Alert` positioned above the table (e.g., "3 rows failed to update") — the page-level aggregate-status sibling of `DataTable`'s own already-built empty/loading states, not a replacement for either. |

## 11. Enterprise use cases

- **"PO submitted for approval."** (`success`, dismissible) — the most common, lowest-stakes case.
- **"This vendor has an open dispute — review before proceeding."** (`warning`, non-dismissible by the §7 guideline — the user should see this every time they return to the page until the dispute is resolved, not just until they happen to click ×).
- **"3 of 12 line items failed validation."** (`error`, page-level, dynamic, `role="alert"`, non-dismissible, paired with a "Review line items" action) — the concrete `Form`-composition case named in §10.
- **"Your session will expire in 5 minutes."** (`warning`, present from a background timer rather than initial load — dynamically appearing, arguably worth `role="status"` rather than `role="alert"` per §8's urgency tiering, since it's advisory rather than blocking).
- **"New: bulk PO approval is now available."** (`info`, dismissible) — the closest Krane equivalent to Atlaskit's dedicated "discovery" appearance, handled here as a plain `info` alert rather than a fifth variant (§ comparison, below) — consistent with this system's repeated "don't add an axis nothing's named a need for" discipline.

## 12. Demo requirements

- All four variants, each with icon, title, and description, statically.
- A **dismissible example** (likely `success`) demonstrating `onDismiss` actually removing the alert from the DOM, not just visually hiding it.
- A **non-dismissible `error` example**, deliberately shown without a close control, directly demonstrating §7's guideline rather than just documenting it.
- An **action-button example** (`warning`, one primary action — "Review now") and a **two-action example** (`error`, primary + secondary), proving §6's "at most two" constraint is workable, not just declared.
- A **visually-hidden-title example**, demonstrating §8's `visuallyHidden` escape hatch is real, not aspirational.
- A **`Form`-composition example**: a page-level `error` `Alert` appearing above a form after a simulated failed submission, directly reusing the same `setTimeout`-driven simulated-async convention already established in the `Input`/`Combobox`/`Form` demos — not a new pattern invented for this one case.

---

## Comparison: Material Design, Atlassian Design System, Shopify Polaris, GitHub Primer, Radix UI

**Material Design (MUI)** — `Alert`, `severity`: `success`/`info`/`warning`/`error` (default `success`), an `AlertTitle` subcomponent, an `action` slot, `icon`/`iconMapping` for overriding the per-severity icon (globally or per-instance), and an `onClose` prop that auto-renders a close (✕) icon without requiring a separate `action`. [(MUI — Alert)](https://mui.com/material-ui/react-alert/) **Verdict**: the closest precedent for §7's `onDismiss`-presence-driven close button; rejected on icon overridability specifically (§5), in favor of Primer's stricter, already-`Toast`-consistent stance.

**Atlassian Design System (Atlaskit)** — `SectionMessage`, `appearance`: `information`/`warning`/`error`/`success`/`discovery` — a fifth, Atlassian-specific tone for new-feature/onboarding announcements. `title` prop, `actions` rendering as button-or-link depending on `onClick`/`href`, with explicit guidance against more than two. [(Atlaskit — Section message)](https://atlassian.design/components/section-message/) **Verdict**: the "avoid more than two actions" guidance is adopted directly (§6); the fifth "discovery" appearance is a real, well-reasoned addition for Atlassian's own product surface, deliberately not adopted here — Krane's `info` variant already covers the one named use case (§11) without a new token or variant.

**Shopify Polaris** — `Banner`, `tone`: `success`/`info`/`warning`/`critical`, `onDismiss`, `action`/`secondaryAction`. Polaris's own documentation states the dismissibility guideline cited and adopted in §7 almost verbatim. [(Polaris — Banner)](https://polaris-react.shopify.com/components/feedback-indicators/banner) **Verdict**: the single strongest influence on this document's §6 (two-action shape) and §7 (dismissibility-tracks-resolvability, not variant) — both adopted directly, not just referenced.

**GitHub Primer** — `Banner` (the current, actively-recommended component; `Flash` is formally deprecated, with an ESLint rule discouraging its continued use — a real, citable signal that Primer itself corrected an earlier design the same way this document is trying not to need to later). Icons are variant-locked, not overridable except for `info`/`upsell`. Documented, specific accessibility requirements: exposed as a named section landmark, a default heading matching the variant, a visually-hideable-but-still-in-the-tree heading, and a minimum 24×24px dismiss target. [(Primer — Banner)](https://primer.style/product/components/banner/) [(Primer — Banner accessibility)](https://primer.style/product/components/banner/accessibility/) **Verdict**: the single strongest influence on §8 — every concrete accessibility requirement in that section traces directly to Primer's own documented, shipped implementation, not general best-practice inference.

**Radix UI** — no dedicated Alert/Banner primitive exists in the installed `radix-ui` bundle; `AlertDialog` is a different problem entirely (audit, above). **Verdict**: confirms Alert needs no headless dependency at all — the same "no Radix primitive needed" position `Input`/`Textarea`/`Label` were each in, not a gap to fill.

---

## Existing capabilities

Nothing — confirmed again this pass. The real "existing capability" is `Toast`'s already-built variant-color/icon recipe (§ audit), directly reusable as a styling convention, and the complete status token family it's built on, both already paid for by earlier work.

## Missing capabilities

- The component itself, full stop.
- A correct, sourced accessibility model distinguishing static-on-load alerts from dynamically-appearing ones (§8) — not previously documented anywhere in this system, and easy to get wrong by defaulting every alert to `role="alert"` regardless of how it entered the page.
- A `text-label`/`text-body` typography treatment that doesn't repeat `Toast`'s own pre-token-discipline drift (§4) — a correction, not a new capability, but a real one.
- A documented dismissibility guideline tied to resolvability, not variant (§7) — without it, the natural-but-wrong default is "let everything have a close button," which Polaris's and Primer's own documentation both explicitly warn against.

## Recommended additions

Everything in §2–§9 above. Beyond that, nothing — this document's own comparison found a notably *short* gap list relative to every other foundation doc in this system, because the hard problems (token family, icon-per-status mapping, dismiss-button visual treatment) were already solved by `Toast`, and the remaining real work is architectural correctness (the role/dismissibility/typography decisions above), not missing visual machinery.

## Must-have vs. Nice-to-have

**Must-have**: the component itself; the four-variant token reuse (§2/§3); the `text-label`/`text-body` typography correction (§4) — costs nothing, and shipping the same drift `Toast` already has would be a known, avoidable regression repeated a second time; the explicit (not variant-derived) `role` prop (§8) — getting this wrong by hardcoding `role="alert"` to the `error` variant would be a real, citable accessibility mistake per MDN's own guidance, not a hypothetical one; the dismissibility-tracks-resolvability guideline (§7) — cheap to document, expensive to retrofit once five different teams have already shipped "everything gets a close button."

**Nice-to-have**: an `icon` override prop (MUI's pattern) — real, but `Toast` itself has never needed one, and no concrete Krane consumer has asked for one yet; a fifth "discovery"-style variant (Atlaskit's pattern) — real for Atlassian's product surface, no named Krane use case beyond what plain `info` already covers (§11); auto-dismiss-after-a-delay (a `Toast`-like timeout) — explicitly not requested, and would blur the one structural distinction (`Toast` = transient, `Alert` = persistent) this entire document is built around.

## Final recommendation for Krane

Build `Alert` reusing `Toast`'s exact variant/icon recipe as a styling convention (zero new tokens, zero new dependency, no Radix primitive needed) — but correct, deliberately, the two things `Toast` either got wrong or never had to consider: typography (`text-label`/`text-body`, not hand-rolled `text-sm`) and the role/dismissibility decisions this audit found are genuinely tied to *how* and *why* a given alert appears, not to its variant alone. Adopt Polaris's and Primer's documented guidance directly rather than re-deriving it — both already solved the dismissibility and accessibility-landmark questions correctly, and this is exactly the kind of problem where citing a mature reference system's actual shipped answer beats inventing a Krane-specific one from first principles. Do not add icon overriding, a fifth variant, or auto-dismiss — none has a named Krane consumer, and all three would be solving problems `Toast`'s own precedent in this codebase has never actually needed solved.
