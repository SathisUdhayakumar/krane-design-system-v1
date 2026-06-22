# Krane Design System — Textarea Foundation

Audit + specification only — nothing implemented. Builds on (and in three places, corrects or extends) `FORM_SPECIFICATIONS.md`'s original Textarea entry, which was written by copying `Input`'s *pre-gap-analysis* spec verbatim and has since fallen behind what `Input` actually shipped as.

## Audit: existing codebase state

- **No `Textarea` component exists.** `components/ui/` has no `textarea.tsx`. No Radix primitive is needed — a native `<textarea>` is the correct headless element here, same conclusion `FORM_SPECIFICATIONS.md` already reached.
- **Zero hand-rolled `<textarea>` elements exist anywhere in this codebase** — confirmed by a direct search of `app/` and `components/`. This is a real difference from both `Input` (two hand-rolled instances existed before it was built — Dialog's vendor form, DataTable's search box) and `Label` (three hand-rolled instances). There is no existing precedent to formalize or migrate here; this spec is greenfield in a way the other two weren't.
- **`FORM_SPECIFICATIONS.md`'s Textarea section is stale relative to `Input`'s shipped reality, not just lightly under-specified.** It says "Identical 5-state treatment to Input… literally the same recipe" — true of `Input`'s *original* spec, but `Input` was later upgraded by `INPUT_GAP_ANALYSIS.md` to a distinct read-only treatment, a quad-state `status` prop (`success`/`warning`/`error`), and a `loading` boolean. Textarea's spec was never revisited after that upgrade landed, so "identical to Input" is now a stale claim, not a correct one. Corrected in §5/§7 below.
- **No typography decision was ever made for Textarea specifically** — the original spec just inherited Input's bare `text-sm`. This document reconsiders that (§3) — multi-line content is exactly what this system's `text-body` role token was defined for, and Input never had a reason to use it (`text-body`'s defining feature, a 1.5 line-height, only matters once text actually wraps onto a second line).

## 1. Purpose

Captures free-form, multi-line text — notes, comments, descriptions, rejection reasons — where a single line of `Input` would either clip content or force horizontal scrolling. Not a rich-text editor, not a code editor: plain text only, no formatting toolbar, no syntax highlighting. The multi-line equivalent of `Input` in exactly the same sense `RadioGroupItem` is the multi-select-shaped sibling of `Checkbox` — same family, different cardinality of content.

## 2. Visual specification

Multi-line text field, content-driven height rather than a fixed one: `min-h-[80px]`, full width, `rounded-md border border-input bg-background px-3 py-2`, vertically resizable by the user (`resize-y`), never horizontally. Otherwise the same visual recipe as `Input` — same border/background/radius tokens, same focus-ring mechanism — so the two read as one family when they appear in the same form, not as two independently-designed fields that happen to sit near each other.

## 3. Typography

**Use the `text-body` token** (`0.875rem` / line-height `1.5` / weight `400`, already in `app/globals.css`'s `@theme inline`), not `Input`'s bare `text-sm`. This is a correction, not a restatement: `text-sm` and `text-body` share the same `0.875rem` size, but `text-body`'s `1.5` line-height is the one this system already defined specifically for wrapped, multi-line copy — `Input`'s text never wraps, so it had no reason to reach for it, but `Textarea`'s content exists specifically *to* wrap. No new token; this is the first real consumer of `text-body` as a form-control typography role rather than prose.

## 4. Sizes

**No discrete height-tier size variant** (no `sm`/`default`/`lg` the way `Input` has). Neither Atlaskit's `TextArea` nor GitHub Primer's `Textarea` — the two reference systems with a standalone Textarea primitive (§ comparison, below) — expose a size prop at all; only the *single-line* field gets one, because for a single line, height tier directly maps to "how much text fits without wrapping," a question multi-line content has already answered differently (by wrapping). The real sizing lever for Textarea is row count / minimum height, not a density tier:
- `min-h-[80px]` stays the default floor, formalizing what `FORM_SPECIFICATIONS.md` already proposed.
- Native `rows` passes straight through (`React.ComponentProps<"textarea">` already includes it) as the documented way to size a specific instance taller — e.g. a long "Terms" field — instead of inventing an `lg` variant.
- Padding/text size hold at `Input`'s `default` tier (`px-3 py-2`, `text-body` per §3) for visual parity when the two appear in the same form — there is no equivalent of `Input`'s `sm`/`lg` to match against, so this just anchors to the one Input size that's actually common in mixed forms.

## 5. States

| State | Treatment |
|---|---|
| Default | `border-input bg-background` |
| Focus | `outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring` — identical mechanism to every other interactive primitive in this system, `Input` included |
| Disabled | `disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50` — `pointer-events-none` also kills the resize-handle drag for free, no extra rule needed |
| **Read-only** | **Corrected from the original spec**, which claimed this was "identical to Input" — at the time that sentence was written, Input itself had no distinct read-only treatment either, but it now does (`read-only:bg-muted read-only:cursor-default`, added in `Input`'s v1 freeze). Textarea should match that exactly, **plus one addition specific to multi-line content**: `read-only:resize-none` — a resize handle is an editing affordance, and offering one on content the user can't actually edit is a confusing, inconsistent signal, even though dragging it wouldn't change the text itself. Text stays full-opacity and selectable, matching the same "read-only content is still real" reasoning already applied to `Input` and `Label`. |
| **Error** | `status="error"` → `border-destructive ring-3 ring-destructive/20` (+ dark-mode variants) — copied exactly from `Input`'s `status` variant, not the old standalone `aria-invalid:` block the original spec proposed. Auto-derives `aria-invalid={true}` unless the consumer passes their own, identical to `Input`'s mechanism. |
| **Success** | `status="success"` → `border-success`, reinforced on `focus-visible` with `ring-success/20` — quieter than error by design, matching `Input`'s reasoning that a permanent colored ring glow on a field that's simply "fine" would overstate the signal. |
| **Warning** | `status="warning"` → `border-warning`, `focus-visible:ring-warning/20` — same shape as success, amber instead of green. |

**`loading` is deliberately not in this list.** `Input` gained it for a concrete, narrow use case — an async single-value check (vendor-name uniqueness) while the user is still in a short field. Multi-line free-text content (notes, comments) doesn't have an equivalent real-time validation pattern anywhere in this system today, and inventing one speculatively is exactly the kind of scope creep this system has avoided elsewhere. Revisit only if a concrete consumer (e.g. live profanity/PII scanning on a comment field) actually appears.

## 6. Accessibility requirements

- Must be paired with a `Label` via `htmlFor`/`id` at the usage site, identical requirement to `Input` — Textarea can't enforce this itself.
- `aria-invalid` is set by the consumer (or, later, the `Form`/`useFormField()` layer) in response to `status="error"` or directly — Textarea only *styles* in response to it, never manages validation state itself, the same boundary already drawn for `Input` and `Label`.
- Native `readOnly` is already correctly exposed to assistive technology on a real `<textarea>` — no `aria-readonly` duplication needed, same conclusion already reached for `Input`.
- **The resize handle is a platform limitation, not a Krane gap**: native `<textarea>` resize handles are mouse/pointer-only in every current browser, with no standard keyboard equivalent. Nothing in this component can fix that — worth documenting as an accepted, inherited limitation rather than rediscovering it as a surprise later.
- Long-form multi-line content needs no special screen-reader handling beyond the `Label` pairing above — a native `<textarea>`'s value is read normally, including embedded line breaks.

## 7. API design

```ts
const textareaVariants = cva(
  "w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-body outline-none transition-colors placeholder:text-muted-foreground resize-y read-only:bg-muted read-only:resize-none read-only:cursor-default focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      status: {
        default: "",
        success: "border-success focus-visible:border-success focus-visible:ring-success/20",
        warning: "border-warning focus-visible:border-warning focus-visible:ring-warning/20",
        error: "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      },
    },
    defaultVariants: { status: "default" },
  }
)

type TextareaProps = React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>
```

**Deliberately not Input's full prop surface.** No `prefix`/`suffix` (decorative slots don't have an obvious position against multi-line, wrapping content), no `clearButton` (clearing a paragraph of notes with one click is a much higher-stakes, easier-to-mis-click action than clearing a short search box — no concrete consumer asking for it), no `loading` (§5). The one prop Textarea does inherit from Input's upgraded surface is `status` — kept specifically so a mixed form (an `Input` for "Vendor name" above a `Textarea` for "Notes") can use the same success/warning/error vocabulary on both fields, rather than Textarea regressing to the binary `aria-invalid`-only model Input itself moved past.

**No native-attribute collision to omit, unlike Input.** `Input` had to `Omit<>` two native attributes (`size`, then `prefix`/`suffix`) because its custom props collided with real DOM typings. `<textarea>`'s native attributes (`rows`, `cols`, `wrap`, `dirname`) don't overlap with anything Textarea's API adds — a direct consequence of deliberately not giving Textarea a `size` prop (§4), not a coincidence worth re-checking later.

## 8. Composition patterns

| With | Pattern |
|---|---|
| **Label** | `htmlFor`/`id`, stacked above (`flex flex-col gap-1.5`) — identical mechanism to every `Input` example today. Nothing Textarea-specific here. |
| **Input** | Not a nesting relationship — the pattern is **visual and rhythm consistency in a shared form**: same `border-input`/`bg-background`/focus-ring recipe so the two read as one family, same vertical gap between stacked fields (`gap-4`/`gap-6` at the form level), and shared `status` vocabulary (§7) so a form mixing both can say "this field is fine" / "this field has a warning" with one consistent visual language across both control types. |
| **FormField (future)** | Not built yet (`react-hook-form` isn't installed — see `FORM_FOUNDATION_PLAN.md`), but Textarea needs no special accommodation to slot in once it exists: plain `value`/`onChange` (or an uncontrolled `ref`) is already `Controller`-compatible, the same property already true of `Input` and `Checkbox`. `FormField name="notes" render={({ field }) => <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>}` is the expected eventual shape — stated here so nobody re-derives it as a surprise once the Form layer actually lands. |

## 9. Enterprise use cases

- **PO / vendor creation notes** — a free-text "Additional instructions" or "Internal notes" field, the direct multi-line sibling of the same Dialog-based creation forms `Input` already demos.
- **Rejection / approval reasoning** — a procurement approver leaving a reason when escalating or rejecting a PO; realistically paired with `status="error"` or `status="warning"` depending on the action.
- **Read-only audit/detail views** — viewing a previously-submitted note or rejection reason on a closed PO/vendor record, without edit rights — the direct multi-line sibling of `Input`'s "view a submitted PO" read-only case, and the reason §5's read-only correction (no resize handle, full opacity) matters in practice, not just in theory.
- **Comment threads on a PO or vendor record** — the input box for adding a new comment to an existing thread (display of existing comments is a separate, not-yet-specified concern).

## 10. Demo requirements

- Default, with placeholder, with a multi-line value.
- Disabled vs. **read-only, shown side by side** — mirroring `Input`'s own demo decision, for the same reason: the entire point of giving read-only its own treatment is that it should look visibly different from disabled, which only shows up if both are on screen at once. The read-only example specifically should show **no resize handle**, to make §5's correction visible, not just documented.
- All four `status` values, each paired with a real message (reusing the `-text` token family / `text-destructive`, exactly like `Input`'s demo, not new colors).
- One long-content example proving `min-h-[80px]` doesn't clip existing content and the resize handle works as expected.
- A `Label`-paired baseline example (stacked above), confirming §3's `text-body` typography choice is visible against real wrapped, multi-line text — not just declared.
- One small mixed-form composition: an `Input` (e.g. "Vendor name") stacked above a `Textarea` (e.g. "Notes") under shared `Label`s, demonstrating §8's rhythm-and-vocabulary consistency claim rather than just asserting it.

---

## Comparison: Material Design, Atlassian Design System, Shopify Polaris, GitHub Primer

- **Material Design (MUI)**: No standalone Textarea at all — `TextField` takes a `multiline` prop (plus `rows`/`minRows`/`maxRows`), and the *same* component renders as single- or multi-line depending on that one prop, auto-growing height via an internal shadow-textarea measurement technique. Architecturally the same "bake it into the field" choice MUI's `Label` makes (floating label baked into `TextField` itself) — consistent with that system's overall philosophy, but not the separate-primitive path Krane already committed to.
- **Atlassian Design System (Atlaskit)**: `@atlaskit/textarea`'s `TextArea` is a real, standalone component — the closest precedent to what this document specifies. Notably has a `resize` prop with **four explicit modes** (`"smart" | "vertical" | "horizontal" | "both" | "none"`), where `"smart"` auto-grows to fit content up to a max before scrolling — a real, named feature this document's `resize-y` (manual-drag-only) doesn't attempt to replicate. No size-tier prop, confirming §4's reasoning. Has `isMonospaced`, mirroring `Input`'s already-identified (and already-deferred) monospace gap.
- **Shopify Polaris**: Same architecture as Material here — `TextField` takes `multiline` (boolean, or a number setting initial rows), no separate Textarea primitive, consistent with Polaris's already-noted (in `LABEL_FOUNDATION.md`) general pattern of folding everything into the field component rather than composing standalone primitives. Also the origin of `showCharacterCount`, which pairs with `maxLength` to render a live, accessible counter — flagged here because long-text fields (descriptions, notes) are exactly where a character limit is most likely to actually matter, more so than on `Input`.
- **GitHub Primer**: `Textarea` is a standalone component, same `validationStatus` vocabulary as Primer's `TextInput` (`"error" | "success" | "warning"` — the direct precedent for this document's `status` prop), a `resize` prop (`"none" | "vertical" | "both"`, default `"both"` — Primer permits horizontal resize by default, which this document deliberately does not, on the reasoning that horizontal resize fighting a form's fixed-width layout is more often a layout bug than a useful affordance), and a `monospace` boolean, same as Atlaskit's `isMonospaced`.

### Existing capabilities

Nothing — `Textarea` doesn't exist yet. The closest thing to an "existing capability" is `FORM_SPECIFICATIONS.md`'s original entry, now found to be a stale derivative of `Input`'s pre-upgrade spec (corrected throughout this document) and `Input`'s own already-validated visual recipe, which Textarea can inherit directly rather than re-deriving.

### Missing capabilities

- The component itself, full stop.
- **A real read-only treatment** (now added/corrected, §5) — the original spec's claim that this was "identical to Input" was already wrong by the time it was written, since it didn't track Input's own later upgrade.
- **A `status` prop** generalizing the old standalone `aria-invalid` block into the same success/warning/error vocabulary `Input` already has (now added, §5/§7) — without it, a mixed form would have one field type that can say "this is fine" and one that can't.
- **A deliberate typography decision** (now added, §3) — the original spec never considered whether multi-line content deserved a different line-height than single-line `Input` text, and it does.
- **Auto-grow / "smart" resize** (Atlaskit's `resize="smart"`) — real, common in comment/notes fields, not in this spec. Manual drag-resize (`resize-y`) is the documented v1 behavior instead.
- **Character count** (Polaris's `showCharacterCount` + `maxLength`) — not in this spec. Flagged as the more natural home for this feature than `Input` ever was, per `INPUT_GAP_ANALYSIS.md`'s own §4 ("more often end up as Textarea, not Input").
- **Monospace variant** (Atlaskit's `isMonospaced`, Primer's `monospace`) — same gap already identified and deferred for `Input`; carries over here for the same reason (no concrete consumer in this system today).

### Recommended additions

Everything in §3/§5/§7 above (the `text-body` typography correction, the corrected read-only treatment with `resize-none`, the `status` prop) — these are corrections to bring the spec in line with `Input`'s already-settled reality, not new scope. Beyond that, two items worth naming now without building them yet, both **demoed as composition rather than built into the component**, mirroring exactly how `Input` deferred character-count and copy-to-clipboard the same way:
- A `CharacterCount` composition pattern (Textarea + a live counter reading the controlled value's length against a `maxLength`) — same shape as `Input`'s deferred version, just more likely to actually get used here.
- Auto-grow resize-on-content behavior — real, but no concrete consumer in this system yet; revisit if a specific notes/comment field needs it badly enough to justify the extra implementation complexity over manual `resize-y`. **Upgraded from speculative to confirmed-direction-but-still-deferred by `TEXTAREA_RESIZE_AUDIT.md`**, a dedicated follow-up audit of GitHub/Atlassian/Linear's actual product behavior (not just their API surfaces) — all three have moved their primary multi-line surfaces toward auto-grow, but `field-sizing: content` still lacks Safari/Firefox support today, so the deferral reasoning here stands; only the confidence behind "this is the right eventual direction" changed.

### Must-have vs. Nice-to-have

**Must-have**: the component itself; the `status` prop (keeps `Input`/`Textarea` vocabulary consistent in the same form, the concrete, already-existing reason this matters); the corrected read-only treatment including `resize-none` (a read-only field offering a resize handle is a real, visible inconsistency, not a hypothetical one); the `text-body` typography correction (costs nothing — zero new tokens, one class name — and is simply more correct for wrapped content than what would otherwise ship).

**Nice-to-have**: character count (real value, but — same bar `INPUT_GAP_ANALYSIS.md` used — no concrete blocking consumer yet); auto-grow/"smart" resize (valuable, meaningfully more implementation effort than `resize-y`, no current consumer); monospace variant (small, but nothing in this system's domain currently needs fixed-width multi-line text).

### Final recommendation for Krane

Build `Textarea` immediately after this document, directly reusing `Input`'s now-settled v1 conventions (`border-input`/`bg-background`/focus-ring mechanism/`status` vocabulary) rather than re-deriving them — the two should never visually or behaviorally drift apart in a mixed form. Apply all three corrections found in this audit (§3 typography, §5 read-only, §7 `status`) rather than shipping the original, now-stale `FORM_SPECIFICATIONS.md` entry as-is; none of the three cost a new token or a new dependency. Do not build character count, auto-grow resize, or a monospace variant now — demoed-composition or deferred, exactly the precedent `Input` already set for its own equivalent gaps. Do not give Textarea a discrete `sm`/`default`/`lg` size tier — `min-h-[80px]` plus native `rows` passthrough is the correct lever, matching both reference systems that bothered to ship a standalone Textarea at all.
