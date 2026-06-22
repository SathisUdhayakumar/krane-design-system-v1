# Krane Design System — Form Component Specifications

Specification only — nothing implemented. Covers the six standalone field primitives identified as missing in `FORM_FOUNDATION_PLAN.md` (Checkbox is excluded — it already exists). Every measurement and class name below is chosen to match conventions already established elsewhere in this codebase, not invented fresh — cited inline where it matters.

---

## Label

### 1. Visual specification
Plain inline text, no box/border/background. `text-sm font-medium leading-none text-foreground`. Sits adjacent to its control — either stacked above (`flex flex-col gap-1.5`, the pattern already used in the Dialog vendor-form example) or inline beside it (Checkbox's existing demo pattern, `flex items-center gap-2`).

### 2. States
| State | Treatment |
|---|---|
| Default | `text-sm font-medium text-foreground` |
| Hover | None — a label isn't itself interactive; hover affordance belongs to the control it's paired with |
| Focus | None — Label is never a tab stop itself |
| Disabled | `peer-disabled:cursor-not-allowed peer-disabled:opacity-70` — requires the associated control to carry Tailwind's `peer` marker class and to appear *before* the Label in DOM order (the `peer-*` variant compiles to a `~` general-sibling selector, which only matches later siblings) |
| Invalid | **Deliberately not built into Label.** Label has no access to a field's actual validation state without the Form-layer's context — bolting on a `peer-aria-invalid:` rule would only work if Label is forced into a specific DOM-order relative to its control, which conflicts with the "stacked above" layout this codebase already uses everywhere. Invalid-state label coloring is `FormLabel`'s job (reads real error state via context, no DOM-order constraint) — out of scope for the bare `Label` primitive. |

### 3. Token usage
`text-foreground` only. No new tokens.

### 4. Accessibility requirements
- Must always pair with a real control via `htmlFor`/`id` — Label has no value on its own without that association.
- Use Radix's `Label` primitive, not a plain `<label>` element — Radix's version correctly proxies click-to-focus/activate even for non-native controls (Switch, RadioGroupItem, Select's trigger button aren't real `<input>` elements; a plain `<label for>` click does nothing for those, Radix's does).

### 5. API design
```ts
React.ComponentProps<typeof LabelPrimitive.Root> // htmlFor, children, className — pure passthrough
```
No Krane-specific props.

### 6. Demo requirements
- Label paired with Input (stacked).
- Label paired with Checkbox/Switch (inline).
- Label rendered before a `disabled` Input, demonstrating the `peer-disabled` dimming.

### 7. Dependencies
Radix `Label` (already installed, unused). No internal Krane component dependency.

---

## Input

### 1. Visual specification
Single-line text field. Height `h-9` (36px — matches the existing ad hoc input in `app/demo/dialog/page.tsx`'s vendor-creation example exactly), full width by default, `rounded-md`, `border border-input`, `bg-background`, `px-3 text-sm`, placeholder in `placeholder:text-muted-foreground`.

### 2. States
| State | Treatment |
|---|---|
| Default | `border-input bg-background` |
| Hover | **None specified.** Native inputs don't conventionally change appearance on hover — only focus should signal interactivity. Deliberately omitting rather than inventing a hover treatment with no precedent elsewhere in this system. |
| Focus | `outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring` — identical mechanism to every other interactive primitive in this codebase |
| Disabled | `disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed` (native `disabled` attribute) |
| Invalid | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40` — copied exactly from Button's existing aria-invalid block |

### 3. Token usage
`border-input`, `bg-background`, `text-foreground`, `placeholder:text-muted-foreground`, `ring-ring`, `border-ring`, `border-destructive`, `ring-destructive`. Zero new tokens — full reuse.

### 4. Accessibility requirements
- Must be paired with a `Label` via `htmlFor`/`id` at the usage site (Input itself can't enforce this).
- `aria-invalid` should be set by the consumer (or by `FormField`/`useFormField()` once the Form layer exists) — Input just needs to *style* in response to it, not manage it.
- Placeholder text is never a substitute for a real label — Input doesn't need to enforce this, but it shouldn't be demoed in a way that implies placeholder-as-label is acceptable.

### 5. API design
```ts
React.ComponentProps<"input"> // type defaults to native behavior (text/email/password/number/etc., consumer's choice)
```
No size variant — deliberately single-size for v1, consistent with how this plan avoids adding unrequested surface area. Revisit only if an actual consumer needs `sm`/`lg`.

### 6. Demo requirements
- Default, with placeholder, with value.
- Disabled.
- `aria-invalid="true"` with an adjacent error message (visually, even before `FormMessage` exists).
- A couple of native `type` variations (`email`, `password`, `number`) to confirm the styling holds across browser-rendered input chrome (e.g. password reveal icons, number steppers).

### 7. Dependencies
None — plain `<input>`, styled. No Radix primitive, no internal component dependency.

---

## Textarea

### 1. Visual specification
Multi-line text field. `min-h-[80px]` rather than a fixed height (content-driven), full width, otherwise identical visual recipe to Input: `rounded-md border border-input bg-background px-3 py-2 text-sm`. Vertically resizable by the user (`resize-y`), not resizable horizontally.

### 2. States
Identical 5-state treatment to Input — same classes, same reasoning (no hover, focus ring, disabled, aria-invalid block). Not re-derived independently; literally the same recipe applied to a `<textarea>` element instead of `<input>`.

### 3. Token usage
Identical to Input. Zero new tokens.

### 4. Accessibility requirements
Same as Input (label pairing, `aria-invalid` styling only, not management).

### 5. API design
```ts
React.ComponentProps<"textarea">
```

### 6. Demo requirements
- Default, with placeholder, with multi-line value.
- Disabled.
- `aria-invalid="true"` example.
- One long-content example demonstrating the resize handle and that `min-h` doesn't clip existing content.

### 7. Dependencies
None. Should be built immediately after Input, reusing its exact conventions — there's no reason for these two to drift stylistically.

---

## Select

### 1. Visual specification
**Trigger**: visually matches Input — `h-9 rounded-md border border-input bg-background px-3 text-sm`, but is a `<button>` (Radix Select is fully custom-rendered, not a native `<select>`, which is what makes consistent cross-browser styling possible at all). Contents: selected value (or placeholder text) left-aligned, a `ChevronDown` icon right-aligned, `justify-between`.

**Content**: a floating panel — this should **reuse the exact floating-surface recipe already established by Popover and DropdownMenu**, not invent a fourth variant: `bg-popover text-popover-foreground border border-border rounded-lg shadow-md`, plus the same `data-open:animate-in data-closed:animate-out …` block.

**Item**: same row shape as `DropdownMenuItem` — `data-highlighted:bg-accent data-highlighted:text-accent-foreground`, with a `Check` indicator (Radix `Select.ItemIndicator`) shown only for the currently-selected value, same absolute-positioned-icon pattern already used by `DropdownMenuCheckboxItem`.

### 2. States
| State | Treatment |
|---|---|
| Default | Trigger: `border-input bg-background`. Closed, no value: shows placeholder text in `text-muted-foreground` (Radix sets `data-placeholder` on the value slot — worth tracking even though it's not one of the five named states, since it's a real, distinct visual condition: "no selection yet") |
| Hover | None on the trigger (matches Input's reasoning). Items inside the open content use `data-highlighted:`, same as DropdownMenu — that's effectively their hover/focus treatment, driven by Radix, not a CSS `:hover` rule |
| Focus | Trigger: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring`, identical mechanism to Input |
| Disabled | Trigger: `disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed` |
| Invalid | Trigger: `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20` (+ dark variants) — identical block to Input/Button |

### 3. Token usage
Trigger: same as Input (`border-input`, `bg-background`, `ring-ring`, `border-destructive`/`ring-destructive`). Content: `bg-popover`/`text-popover-foreground`/`border-border`/`shadow-md` — all already established by Popover/DropdownMenu. Items: `bg-accent`/`text-accent-foreground` (the `data-highlighted` state), same token Tooltip/DropdownMenu already use for this exact purpose. Zero new tokens.

### 4. Accessibility requirements
- Keyboard support (open/close, arrow-key navigation, type-ahead, Home/End) is entirely Radix's responsibility — same "don't hand-roll what the primitive already solves" principle applied to DropdownMenu/Tooltip earlier in this project.
- Long option lists need scroll affordance — Radix Select supports `ScrollUpButton`/`ScrollDownButton` parts specifically for this; the demo (see below) should include a long enough list to actually exercise them, not just declare support.
- The trigger must expose its current value's text content accessibly (Radix's `Select.Value` handles this) — placeholder text must not be the *only* accessible name when a value is selected.

### 5. API design
```ts
// Root
{ value, onValueChange, defaultValue, disabled, name }

// SelectTrigger
React.ComponentProps<"button"> // + aria-invalid passthrough, no special props

// SelectContent
{ position?: "item-aligned" | "popper" } // Radix default; align/sideOffset available if "popper"

// SelectItem
{ value: string, disabled?: boolean, children }

// Also: SelectGroup, SelectLabel, SelectSeparator — for grouped/long option lists
```

### 6. Demo requirements
- Basic select with 4–5 options.
- Select with grouped options (`SelectGroup` + `SelectLabel`), e.g. mirroring something domain-relevant like vendor categories.
- Disabled select.
- `aria-invalid="true"` example.
- A long list (15+ options) to genuinely exercise scroll behavior, not just claim it works.

### 7. Dependencies
Radix `Select` (already installed, unused). Styling depends on Popover/DropdownMenu's already-established floating-surface convention (a styling reuse, not an import).

---

## Radio Group

### 1. Visual specification
A set of circular controls, visually Checkbox's sibling but round instead of square and with a different fill treatment: Checkbox fully fills with a checkmark icon; RadioGroupItem stays an **outline circle that shows a small centered filled dot** when selected — the conventional radio-button distinction from a checkbox. Size `size-4` (16px), matching Checkbox exactly. Each item is typically paired with an inline `Label` (`flex items-center gap-2`, same layout Checkbox's demo already uses).

### 2. States
| State | Treatment |
|---|---|
| Default (unselected) | `border-input bg-background`, circular, empty |
| Hover | None distinct — matches Input/Select's "no invented hover" stance |
| Focus | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring`, identical mechanism, applied per-item (each radio is independently focusable/tabbable per native radio-group semantics, but only the group itself participates in a single tab stop with arrow-key movement between items — Radix handles this roving-tabindex behavior internally) |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` — can be set per-item or on the whole group |
| Selected | `border-primary` + an inner filled dot, `bg-primary` — same brand-yellow choice already made for Checkbox's checked state, for consistency between the two "selection" controls. Small, contained element — doesn't carry the "looks like a Warning tint" risk a full-row fill would (the same reasoning already applied when Checkbox's checked-state color was decided) |
| Invalid | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`, same block as Checkbox, applied per-item |

### 3. Token usage
`border-input` (unselected), `border-primary`/`bg-primary` (selected dot), `ring-ring`, `border-destructive`/`ring-destructive` (invalid). Zero new tokens — entirely reused from Checkbox's already-established palette.

### 4. Accessibility requirements
- Radix `RadioGroup.Root` provides the native `role="radiogroup"` + roving-tabindex behavior (arrow keys move selection between items, only one tab stop for the whole group) — not something to reimplement.
- Each `RadioGroupItem` needs a paired `Label` via `htmlFor`/`id`, same requirement as every other control here.
- Group-level `aria-label` or an associated `FormLabel` (once the Form layer exists) is needed when there's no visible group heading — flagging this as a usage requirement, not something the component can enforce on its own.

### 5. API design
```ts
// RadioGroup (Root)
{ value, onValueChange, defaultValue, disabled, name, orientation?: "horizontal" | "vertical" }

// RadioGroupItem
{ value: string, disabled?: boolean, id }
```

### 6. Demo requirements
- Vertical group, 3–4 options, one disabled.
- Horizontal group (e.g. a small Yes/No/Unknown row).
- `aria-invalid="true"` example.
- A controlled example showing the selected value reflected elsewhere on the page (proves `onValueChange` wiring, not just visual state).

### 7. Dependencies
Radix `RadioGroup` (already installed, unused). Visual conventions borrowed from Checkbox (a styling reuse, not an import) — should be built *after* Checkbox's patterns are the reference, which they already are.

---

## Switch

### 1. Visual specification
Classic toggle: a track (`h-5 w-9`, fully rounded, `rounded-full`) containing a circular thumb (`size-4`) that slides between two positions. Off: thumb sits left. On: thumb sits right, track fill changes color.

### 2. States
| State | Treatment |
|---|---|
| Off (default) | Track: `bg-input` (a neutral, matching the same token Input's border already uses, repurposed here as a fill) or `bg-muted` — track reads as "empty/neutral." Thumb: `bg-background`, positioned left via `translate-x-0` |
| Hover | None distinct |
| Focus | `focus-visible:ring-3 focus-visible:ring-ring`, applied to the track (the whole control is one focusable element, unlike RadioGroup's per-item focus) |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` |
| On | Track: `bg-primary` — same brand-yellow-for-small-contained-selection-state reasoning as Checkbox/RadioGroup. Thumb: `bg-background`, slides to `translate-x-4` |
| Invalid | `aria-invalid:ring-3 aria-invalid:ring-destructive/20` plus a `border-destructive`-equivalent on the track (Switch has no border by default, so invalid state needs a visible ring even more than Input/Checkbox do, since there's no border to also flip red) |

### 3. Token usage
`bg-input` or `bg-muted` (off-track), `bg-primary` (on-track), `bg-background` (thumb), `ring-ring`, `ring-destructive`. Zero new tokens.

### 4. Accessibility requirements
- Radix `Switch` renders `role="switch"` with `aria-checked` automatically — not `role="checkbox"`, a real semantic distinction screen readers announce differently (a switch implies an immediate on/off effect, a checkbox implies a selection in a set) — using `Switch` for "enable this setting now" toggles and `Checkbox` for "select this item" is the correct split, not interchangeable.
- Must be paired with a `Label` exactly like every other control here — Switch has no visible text of its own.

### 5. API design
```ts
{ checked, onCheckedChange, disabled, "aria-invalid" }
```
Deliberately mirrors Checkbox's API shape (`checked`/`onCheckedChange`/`disabled`) exactly — consistent naming across the two binary controls in this system, even though their headless primitives and visual form differ.

### 6. Demo requirements
- Off/On static examples.
- Interactive toggle with visible state readout (mirrors the Checkbox demo's "currently checked/unchecked" pattern already established).
- Disabled (both off and on).
- `aria-invalid="true"` example.

### 7. Dependencies
Radix `Switch` (already installed, unused). No internal component dependency.

---

## Cross-component summary

| Component | New npm dependency | Reuses styling from | Token reuse only (no new tokens) |
|---|---|---|---|
| Label | None (Radix Label already installed) | — | `text-foreground` |
| Input | None | — | `border-input`, `bg-background`, `ring-ring`, `border-destructive`/`ring-destructive` |
| Textarea | None | Input (identical recipe) | same as Input |
| Select | None (Radix Select already installed) | Popover/DropdownMenu (floating surface), DropdownMenu (item highlight) | `border-input`, `bg-popover`, `border-border`, `bg-accent` |
| Radio Group | None (Radix RadioGroup already installed) | Checkbox (selection-state color choice) | `border-input`, `border-primary`/`bg-primary` |
| Switch | None (Radix Switch already installed) | Checkbox (API shape, selection-state color) | `bg-input`/`bg-muted`, `bg-primary`, `bg-background` |

No new design tokens are required for any of the six. No new npm packages are required for any of the six — every headless primitive they need is already sitting in the installed `radix-ui` bundle, unused, the same position five other components were in before they got built.

Waiting for approval before implementing any of this.
