# Krane Design System — Stepper Foundation

Audit + specification, now implemented at `components/ui/stepper.tsx` (`Stepper`/`StepperList`/`StepperStep`/`StepperContent`), exactly matching the two-layer architecture recommended — demoed at `/demo/stepper`. Stepper/Wizard had been named in every "components not started" list since the original "Enterprise SaaS Components Required for Krane" inventory.

The one hard requirement this document specified — focus moving to the new step's heading on every change, sourced from W3C's own guidance — was implemented via a `tabIndex={-1}` `<h2>` per `StepperContent` and a shared ref `Stepper` attaches to whichever one is currently mounted, explicitly guarded against firing on the initial render. Verified via Playwright, not assumed correct from the implementation alone: confirmed firing after `Next`, `Back`, and indicator-click-to-go-back, and confirmed *not* firing on mount. The `error` state's `sr-only` "(error)" suffix, the position-derived `upcoming`/`current`/`completed` states, and the standalone read-only-tracker mode (where every step button is genuinely `disabled` since no `onStepChange` exists to call) were all implemented and verified exactly as specified. The label-hiding responsive behavior named only implicitly in this document's content guidelines was implemented as a real `sm:` breakpoint treatment and confirmed at an actual 390px viewport, not just a simulated container. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail.

## Audit: existing codebase state

- **No `Stepper`/`Wizard` file exists anywhere.** Confirmed by direct search.
- **No Radix primitive exists for this, and — unlike `Breadcrumb` — that's not a trivial non-issue here.** Confirmed directly against the `radix-ui` bundle: no `Stepper` export anywhere in it. WAI-ARIA itself has no dedicated "stepper" role the way it has `tab`/`tabpanel` — this is a real, structural finding, not just a missing-package check: the accessible pattern this component needs to follow is closer to "a sequence of pages" than "a sequence of tabs," addressed directly below rather than assumed away.
- **`Tabs` (`components/ui/tabs.tsx`, just shipped) is the closest existing structural precedent and a real, deliberate non-precedent at the same time.** Visually, a step indicator and a tab list look similar — a row of segments, one "active" at a time. Functionally, `Tabs`' actual behavior is wrong for a stepper in a specific, important way: Radix `Tabs`' default `automatic` activation mode switches panels the instant a segment receives keyboard focus, and even `manual` mode only requires `Enter`/`Space`, with no concept of "you can't go here yet because the prior step isn't done." A stepper's progression is gated by completion state, not just focus — addressed directly in "Why this isn't `Tabs` with extra steps," below.
- **`Form` (`components/ui/form.tsx`, `react-hook-form` + `zod`) already owns exactly the validation responsibility a multi-step wizard needs per step**, and this document does not propose duplicating it. A `Stepper` that tried to own field-level validation itself would be re-deriving what `Form` already does correctly — addressed in "Composition with `Form`," below.
- **No token gap.** Step-state colors reuse the existing `success`/`destructive`/`primary`/`muted-foreground` family directly — no new token needed for "completed" (success), "error" (destructive), "current" (primary), or "upcoming" (muted).

## Purpose

Two genuinely different jobs that the comparison research below confirms are usually served by the *same* underlying visual machinery, not two separate components — worth stating explicitly before architecture, since it shapes the API directly:

1. **An interactive wizard** a single user completes in one sitting — a PO creation flow split across Vendor & Items / Shipping & Terms / Review & Submit, gated, with Next/Back navigation and per-step form content.
2. **A read-only progress tracker** showing where a multi-party, longer-lived entity currently sits in a fixed pipeline — a submittal's Draft → In Review → Done lifecycle, driven by other people's actions over days, not one person clicking through a form. No Next/Back, no editable content, just "you are here."

Atlaskit's own component is tellingly named five different things in its own documentation — "Progress tracker, Stepper, Steps, Timeline, Meter" — which is real, independent confirmation that this is one convergent visual pattern serving multiple jobs industry-wide, not a Krane-specific stretch. The architecture below is built around that convergence: the step-indicator visual is the reusable core; the interactive wizard behavior (state, Next/Back, content panels) is an optional layer on top of it, not baked into the indicator itself.

## Why this isn't `Tabs` with extra steps

Three concrete differences, not a vague "it feels different":

1. **Progression is gated, not just focusable.** A user can always click any tab; a user should not always be able to click step 4 before finishing step 2. `Tabs`' roving-focus model has no concept of this.
2. **Steps carry a completion state `Tabs` panels don't.** `active`/`inactive` is binary; a step is `upcoming`, `current`, `completed`, or — a real, Krane-specific addition beyond every reference system's own vocabulary, named explicitly as an addition rather than borrowed — `error` (visited, attempted, currently invalid).
3. **Advancing should behave like a real navigation, not a tab swap, for assistive tech.** This is the single most important finding in this document, sourced directly from W3C's own multi-step-forms guidance: *"If the button action indicates a context change, such as moving to the next step in a wizard, then it is often appropriate to move focus to the starting point for that action."* A naive implementation that just swaps which content panel is visible (exactly what `Tabs` already does, correctly, for *its* use case) would leave keyboard/screen-reader focus sitting on the "Next" button after every step change — a sighted mouse user notices the new content; a screen reader user gets no signal anything happened at all unless they go looking. This is treated as a hard requirement below, not a nice-to-have.

## Krane architecture

A two-layer design, directly reflecting the dual purpose above:

- **`StepperList` + `StepperStep`** — the indicator itself: a horizontal row of step circles/numbers, connecting line segments colored by state, and labels. Self-contained, usable standalone with no surrounding `Stepper` wrapper at all — this is the "read-only progress tracker" mode, where `currentStep` is just a plain number derived from the entity's own status field, there's no Next/Back, and no `StepperContent` exists anywhere on the page.
- **`Stepper` + `StepperContent`** — the interactive wizard layer, composed *around* `StepperList`/`StepperStep` when (and only when) a real multi-step task needs Next/Back navigation and per-step content panels. `Stepper` owns `currentStep`/`onStepChange` and the focus-management requirement above; it does not own validation.

This mirrors `Tabs`' own naming shape (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`) deliberately, for the same reason `Breadcrumb` reused `AppHeader`'s existing `ChevronRight` rather than inventing a new separator: consistency with an established convention in this system, not a coincidence.

## Step states

Four states, three of them derived automatically from comparing a step's index to `currentStep` — the same "derive position, don't require an explicit flag" discipline `Breadcrumb` already established for its own current-page segment — and one that genuinely cannot be derived and must be explicit:

| State | Derivation | Notes |
|---|---|---|
| `upcoming` | `index > currentStep` | Not yet reached. In linear mode (the only mode this document specifies for v1), not clickable. |
| `current` | `index === currentStep` | The step the user is actively completing. |
| `completed` | `index < currentStep` | Visited and passed. Remains clickable — going *back* to revisit a completed step is always allowed; only going *forward* past the current step is gated. |
| `error` | explicit `hasError` prop, consumer-set | Cannot be derived from position — only the consumer's own form-validation state (already owned by `Form`, per "Composition with `Form`," below) knows a completed-looking step actually failed validation. Named here as a deliberate Krane addition: Atlaskit's own `disabled`/`visited`/`current`/`unvisited` vocabulary (the closest reference precedent found) has no equivalent, and this document adds it because Krane's actual wizard use cases are form-validated in a way a generic progress tracker isn't. |

`disabled` is not a fifth state needing its own flag — it falls out of `upcoming` directly (an upcoming step is disabled *because* it's upcoming, in linear mode), avoiding a redundant prop that could disagree with the derived state.

## Linear-only for v1 — a real, named alternative not adopted

Material UI explicitly supports both linear (strict order, confirmed via its own documentation) and non-linear (free navigation between steps) modes as a real, named toggle. **Krane builds linear only for v1** — every named use case below (a PO wizard, vendor onboarding) is a genuinely sequential process where letting a user jump to "Review & Submit" before filling in line items would produce a broken review screen, not a convenience. Non-linear is real, MUI-precedented, and explicitly deferred, not overlooked — named here so a future contributor facing an actual optional/non-sequential flow doesn't have to rediscover the option from scratch.

## Optional steps

A real, sourced accessibility consideration, not a Krane invention: W3C's own multi-step-forms guidance explicitly calls for making it "easy to recognize and skip optional stages... by highlighting optional steps in the main heading and providing an option to skip." `StepperStep` accepts an `optional` flag; an optional step's label visibly indicates this (e.g., "Shipping notes (optional)"), and `Stepper`'s `onStepChange` can be invoked to skip past it without that step's content ever needing to report itself "valid" first.

## Composition with `Form`

`Stepper` does not validate anything — it owns *position* (`currentStep`) and *navigation* (`onStepChange`, gated by linear-mode rules), full stop. Each step's content is exactly the same `Form`/`FormField`/`FormItem` composition already shipped, with its own `react-hook-form` instance or a shared one scoped per step. The consumer's own "Next" handler is responsible for calling the existing validation machinery (e.g., `form.trigger()` against the current step's fields) before calling `onStepChange` to actually advance — the same separation of concerns `Tabs` already has from `Form` (neither knows the other exists), applied here deliberately rather than rediscovered mid-implementation the way `Combobox`'s `Form` integration gap was found and fixed before `Form` itself shipped.

## Content guidelines — outcome-based labels, not "Step 1"

A real, sourced content rule, not a style preference: stepper UI research converges on labeling steps by their outcome ("Connect your first data source," "Invite your team") rather than bare ordinals, specifically because outcome language ties completing a step to a feeling of real progress, not just advancing a counter. `StepperStep.label` is a required, descriptive string for exactly this reason — "Vendor & Items," not "Step 1" — with the step *number* itself rendered automatically from array position (the same position-derivation discipline applied to content, not just state).

## Accessibility

- **Focus moves to the new step's content on every step change — the single hard requirement of this entire document**, sourced directly from W3C's guidance above. Implemented as a `tabIndex={-1}` heading at the top of each `StepperContent`, given `.focus()` programmatically the instant `currentStep` changes — the same "treat this like a real navigation, not a visibility toggle" principle GOV.UK-style accessible wizards are built around, confirmed via WAI-ARIA's own multi-page-forms tutorial rather than assumed from general SPA-navigation conventions.
- **"Step X of Y" is announced, not just shown.** The visual indicator (circles, connectors, color) is not on its own a reliable signal for screen reader users; each `StepperContent` carries (or precedes) text stating current position and total — visible text serving this purpose doubles as the accessible name, not a separate `sr-only` duplicate, the same preference for real visible text over hidden-only text already established for `Alert`'s visually-hidden-title escape hatch (an opt-in, not a default).
- **`StepperStep`'s clickability matches its derived state exactly** — an `upcoming` step in linear mode is genuinely `disabled` (not just visually dimmed, not a click-handler that silently no-ops), the same "really unreachable, not just styled to look that way" bar `Tabs`' own disabled-tab implementation was held to and Playwright-verified against.
- **No live region needed for the step-change announcement itself** — moving real DOM focus to a new heading is already announced by assistive tech as part of normal focus-change handling; adding `aria-live` on top would risk a double-announcement, a real, avoidable mistake worth naming rather than reflexively adding `aria-live` "to be safe."

## API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped.

```tsx
function PoWizard() {
  const [step, setStep] = React.useState(0)
  return (
    <Stepper currentStep={step} onStepChange={setStep}>
      <StepperList>
        <StepperStep label="Vendor & Items" />
        <StepperStep label="Shipping & Terms" optional />
        <StepperStep label="Review & Submit" hasError={!isReviewValid} />
      </StepperList>
      <StepperContent>{/* step 0 form fields */}</StepperContent>
      <StepperContent>{/* step 1 form fields */}</StepperContent>
      <StepperContent>{/* step 2 — review */}</StepperContent>
    </Stepper>
  )
}

// Read-only tracker mode — no Stepper wrapper, no StepperContent, no Next/Back:
<StepperList>
  <StepperStep label="Submitted" />
  <StepperStep label="Under Review" />
  <StepperStep label="Approved" />
</StepperList>
```

`StepperStep` takes no explicit `index` — position is read from DOM order, the same array-position discipline `Breadcrumb` already established, so a consumer can't desync a manually-tracked index from where a step actually renders. `hasError` is the one prop that's genuinely state, not derived — everything else on `StepperStep` (`current`/`completed`/`upcoming`, clickability) falls out of comparing its position to `Stepper`'s `currentStep` automatically.

## Enterprise use cases

- **PO creation wizard** — Vendor & Items / Shipping & Terms / Review & Submit, the direct evolution path for `/demo/form`'s existing single-page PO form if it ever grows too long for one screen.
- **Vendor onboarding** — Company Info / Compliance Documents / Banking Details / Review, a genuinely sequential, gated process (banking details shouldn't be collected before compliance docs are on file).
- **A submittal's lifecycle as a read-only tracker** — Draft → In Review → Done, the exact stage vocabulary already used in `Tabs`' own workflow demo, but consumed here as a non-interactive status display on a submittal detail page rather than a user-driven filter — the concrete instance of "two jobs, one visual pattern" this document's Purpose section opens with.

## Demo requirements

- A full interactive PO wizard: three steps, Next/Back, an optional step actually skippable, one step shown with `hasError` to prove the visual treatment is real.
- Direct proof that focus moves to the new step's heading on every `Next`/`Back` click — verified via the focused element after a click, not just asserted in prose, the same Playwright bar every interactive component in this system has been held to since `Alert`.
- Proof that an `upcoming` step is genuinely unclickable in linear mode, not just visually dimmed.
- The standalone read-only tracker mode (`StepperList`/`StepperStep` with no `Stepper` wrapper), using the submittal-lifecycle use case above.
- Dark mode, confirmed visually, not assumed.

---

## Comparison: Material UI, Atlassian, Polaris, Primer, Linear

**Material UI** — `Stepper`/`Step`/`StepLabel`/`StepContent`/`StepButton`/`StepIcon`/`StepConnector`, a real linear-vs-non-linear toggle, `orientation` (horizontal/vertical), `alternativeLabel` for label placement. [(MUI — Stepper)](https://mui.com/material-ui/react-stepper/) **Verdict**: confirms linear/non-linear as a real, named axis (adopted in reasoning, not in scope — linear-only for v1, above) and the compound-family shape generally, though Krane's own family is narrower (no separate `StepButton`/`StepIcon` — folded into `StepperStep` directly, the same "don't split into more sub-components than the actual variability calls for" judgment `Breadcrumb`'s single-`items`-array choice already made).

**Atlassian (Atlaskit)** — `ProgressTracker`, items as `{ id, label, percentageComplete, status }`, status one of `disabled`/`visited`/`current`/`unvisited`. [(Atlaskit — Progress tracker)](https://atlaskit.atlassian.com/packages/design-system/progress-tracker) **Verdict**: the single strongest influence on this document's state vocabulary and its explicit five-names-one-pattern framing, which directly justifies the two-layer (`StepperList`/`StepperStep` vs. full `Stepper`) architecture above. `error` is named explicitly as a Krane addition beyond what this reference actually has.

**Shopify Polaris** — no dedicated stepper/wizard component; multi-step forms are pattern guidance composed from existing `Page`/`Form` components, with third-party packages filling the rest. [(Polaris — Patterns)](https://polaris-react.shopify.com/patterns) **Verdict**: consistent with Polaris's broader minimalism already observed in `BREADCRUMB_FOUNDATION.md` (its own `backAction` simplification). Read as support for keeping `Stepper` itself deliberately thin (own position and navigation only, nothing else) rather than evidence against building a dedicated component at all — Krane's named use cases (gated, multi-step, validated wizards) are concrete enough to justify a real component where Polaris's broader product surface apparently wasn't.

**GitHub Primer** — no dedicated wizard/stepper pattern surfaced; general WCAG 2.1 AA accessibility commitment only. **Verdict**: not a structural precedent here, unlike its load-bearing role in `BREADCRUMB_FOUNDATION.md` and `AVATAR_FOUNDATION.md` — named for completeness of the requested comparison, not stretched into a finding it doesn't support.

**Linear** — does not use a classic numbered stepper for its own onboarding; instead, a task checklist where completing one item unlocks the next ("the engine," per its own framing), with outcome-based task labels rather than step numbers. [(general stepper-UI research, including Linear's onboarding teardown)](https://www.eleken.co/blog-posts/stepper-ui-examples) **Verdict**: the direct source for this document's outcome-based-labeling content rule — adopted directly — while Linear's own *checklist* structure (distinct from a numbered, gated stepper) is correctly not adopted, since no named Krane use case is "complete tasks in any order, each unlocking the next" the way Linear's own onboarding actually works.

---

## Existing capabilities

The `success`/`destructive`/`primary`/`muted-foreground` token family Stepper's four states reuse directly. The `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` naming convention, reused in shape (not in underlying mechanism) for `Stepper`'s own four-piece family. `Form`'s already-complete validation architecture, which `Stepper` composes with rather than duplicates.

## Missing capabilities

The component itself, in any form. A resolved answer to "is this `Tabs`-shaped or page-shaped," which didn't exist before this document and which the W3C focus-management finding resolves decisively toward "page-shaped." A stated, deliberate split between the read-only tracker mode and the interactive wizard mode — without it, a future contributor would plausibly build two separate components for what's actually one convergent pattern, or one component that's needlessly stuck always rendering Next/Back buttons even for the read-only tracker use case.

## Krane Stepper architecture (recommended)

Two layers: `StepperList`/`StepperStep` (the indicator, usable standalone for read-only tracking) and `Stepper`/`StepperContent` (the interactive wizard layer, composed around the indicator when Next/Back navigation and per-step content are actually needed). Four step states — `upcoming`/`current`/`completed` derived automatically from position, `error` explicit because it requires validation knowledge only the consumer has. Linear progression only for v1, non-linear named and deferred. No validation logic inside `Stepper` itself — `Form`'s existing machinery owns that, composed in by the consumer's own "Next" handler. Mandatory focus-to-new-step-heading on every step change, sourced directly from W3C's own multi-step-forms guidance, treated as a hard requirement rather than a nice-to-have.

## API, states, and accessibility — summarized

**API**: `Stepper`(`currentStep`, `onStepChange`) / `StepperList` / `StepperStep`(`label`, `optional?`, `hasError?`) / `StepperContent` — position read from DOM order, not a manually-tracked index prop.

**States**: `upcoming` (`index > currentStep`, not clickable), `current` (`index === currentStep`), `completed` (`index < currentStep`, clickable to go back), `error` (explicit `hasError`, the one Krane addition beyond every reference system compared).

**Accessibility**: focus moves to the new step's heading on every change (the hard requirement); "Step X of Y" as real visible text, not a hidden-only announcement; `upcoming` steps in linear mode are genuinely `disabled`, not just dimmed; no redundant `aria-live` on top of a focus change that's already announced.

## Final recommendation for Krane

Build the two-layer architecture above — it's the one finding in this document that, if skipped, would force a costly redesign later (a single-layer component would either always carry wizard machinery a read-only tracker doesn't want, or never support the read-only case at all). Treat the W3C focus-management requirement as non-negotiable; it's the one accessibility detail in this entire document that's both easy to miss and confirmed, sourced guidance rather than inferred best practice. Ship linear-only, ship the `error` state as a deliberate Krane addition, and defer non-linear mode and vertical orientation exactly as named — both are real, MUI-precedented, and currently unrequested by anything in this domain.
