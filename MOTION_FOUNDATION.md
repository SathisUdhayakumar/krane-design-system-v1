# Krane Design System — Motion Foundation

Documentation only — no code changed. Formalizes the motion architecture flagged as a gap in `FOUNDATION_GAPS.md`, going further: that document proposed duration tokens only; this one adds easing, a full interaction-standards table, and per-component animation definitions.

---

## Duration tokens

Three tiers — two already exist as unlabeled numbers in the codebase today, the third is new headroom for cases that haven't come up yet:

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 150ms | Micro-interactions: color/opacity fades, icon transforms, floating-UI enter/exit (Popover, DropdownMenu, Tooltip, Toast, Dialog). Matches the value already implicit everywhere via `tw-animate-css`'s and Tailwind core's own defaults — naming it changes no current visual behavior. |
| `--duration-normal` | 200ms | Layout-affecting transitions: width/height changes, panel slides. Matches the App Shell sidebar's existing hardcoded `duration-200`, used in exactly two places today. |
| `--duration-slow` | 300ms | Reserved — no current consumer. For transitions covering more visual distance or affecting more of the screen than a single panel (e.g. a future page-level transition, a large reveal). Defined now so a future component has a documented value to reach for instead of inventing a fourth number. |

## Easing tokens

No component today chains an explicit easing utility — everything relies on an implicit default. That default doesn't distinguish *entering* from *exiting*, which is the one real refinement this section adds:

| Token | Curve | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General-purpose default — color transitions, hover states, anything without a clear directional motion |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | **Entering** elements — decelerates into place. Floating UI appearing, panels expanding, anything becoming visible |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | **Exiting** elements — accelerates away. Floating UI dismissing, panels collapsing, anything becoming hidden |

This enter-decelerates/exit-accelerates split is a standard, well-established motion convention (Material Design's motion spec uses the same three curves for the same reasons) — adopting it formalizes something this codebase doesn't currently do at all, not just naming an existing pattern.

---

## Interaction standards

| Interaction type | Duration | Easing | Notes |
|---|---|---|---|
| Hover (color/background change) | `--duration-fast` | `--ease-standard` | Color-only — never paired with movement or scale |
| Focus indicator appearing | **None — instant, no transition** | — | Deliberate: focus indication must be immediate for accessibility. Animating a focus ring's appearance risks a user losing track of focus mid-transition. This is a hard rule, not an oversight. |
| Floating UI entering (Popover/Dropdown/Tooltip/Select open) | `--duration-fast` | `--ease-out` | Paired with `fade-in` + `zoom-in-95` (+ a directional `slide-in-from-*` matching whichever side Radix actually placed the content on) |
| Floating UI exiting | `--duration-fast` | `--ease-in` | Mirror of the above — `fade-out` + `zoom-out-95` |
| Dialog entering/exiting | `--duration-fast` | `--ease-out` / `--ease-in` | Overlay: fade only. Content: fade + zoom, no directional slide (it's centered, there's no "side" to slide from) |
| Toast entering/exiting | `--duration-fast` | `--ease-out` / `--ease-in` | Slide direction is responsive (`slide-in-from-top-full` on mobile, `slide-in-from-bottom-full` on desktop, matching the viewport's anchor position) |
| Toast swipe-to-dismiss (active drag) | **None during drag** | — | The toast must track the pointer 1:1 during an active swipe — easing a drag gesture would make it feel laggy/disconnected from the user's finger/cursor |
| Toast swipe-cancel (snap back) | `--duration-fast` | `--ease-out` | Once the user releases without crossing the dismiss threshold, it eases back to rest |
| Layout-affecting (sidebar width, panel collapse) | `--duration-normal` | `--ease-standard` | Bigger visual change than a fade — gets the slower tier |
| Collapsible nav group (height) | `--duration-normal` *(recommended change)* | `--ease-standard` | **Currently inherits the implicit `--duration-fast` default via `tw-animate-css`'s collapsible keyframes — flagged here as a recommended reclassification**, not yet implemented. A group expanding/collapsing reveals or hides multiple nav items at once; by this table's own logic that's a layout-affecting change, not a micro-fade, and should match the sidebar's own width transition rather than the faster tier it currently inherits by default. |

---

## Animation definitions by component

Each entry: current real implementation (verified against source), formalized token mapping, and any recommended refinement.

### Hover
**Current**: `transition-colors` / `transition-opacity` / `transition-all`, no explicit duration, on `Button`, `Checkbox`, `Table` rows, `Sidebar` items. **Formalized**: `--duration-fast` + `--ease-standard`, applied via the global default rather than per-component classes (see Architecture, below) — no component file needs to change.

### Focus
**Current**: `focus-visible:ring-3 focus-visible:ring-ring` (or `ring-sidebar-ring` in the shell), no transition class anywhere. **Formalized**: stays exactly as-is — instant appearance is the correct, intentional behavior per the interaction-standards table above, not a gap to close.

### Open / Close (floating UI generally)
**Current**: `data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95` plus `data-[side=*]:slide-in-from-*`, identical across `Popover`, `DropdownMenu`, `Tooltip` (all three share this exact block). **Formalized**: `--duration-fast`, with the enter/exit easing split (`--ease-out` for `data-open`, `--ease-in` for `data-closed`) as the one real *behavior* change this document recommends — currently both directions share one undifferentiated default curve.

### Dialog
**Current**: `DialogOverlay` — `data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0` (fade only, no zoom — a backdrop shouldn't scale). `DialogContent` — adds `zoom-in-95`/`zoom-out-95` on top of the same fade. **Formalized**: same `--duration-fast` + directional easing split as the general floating-UI case.

### Dropdown (DropdownMenu)
**Current**: shares the exact `FLOATING_SURFACE` constant with `Popover` and `SubContent` — identical animation treatment by construction, not by coincidence. **Formalized**: no change beyond the general floating-UI easing split, which applies here automatically since it's the same shared code path.

### Toast
**Current**: most complex of the set — open/close fade+slide (responsive direction), plus the swipe-gesture-specific `data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]` / `data-[swipe=cancel]:translate-x-0 transition-transform` / `data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]`. **Formalized**: enter/exit per the general rule; the swipe-cancel snap-back explicitly gets `--ease-out` (decelerating back to rest), the active-drag state explicitly gets **no** easing token at all (must track the pointer exactly).

---

## Formal motion token architecture — as implemented

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-standard: var(--ease-in-out);
```
All six live in `app/globals.css`'s `@theme inline` block, generating real utilities (`duration-fast`, `ease-out`, etc.) the same way `--text-*`/`--shadow-*`/`--radius-*` already do — confirmed in compiled CSS.

### Three corrections made during implementation (this section originally specified something different — recorded here per "update documentation if implementation differs from specification")

**1. `ease-in-out` was added to the request after this document was written, and Tailwind v4 already ships it.** Checked `node_modules/tailwindcss/theme.css` directly: Tailwind's own stock `--ease-in-out` is `cubic-bezier(0.4, 0, 0.2, 1)` — the *exact* value this document had already chosen for `--ease-standard`. Rather than defining two tokens that coincidentally hold the same literal value, `--ease-standard` is implemented as `var(--ease-in-out)` — an explicit alias, not a duplicate.

**2. The proposed global `--tw-duration`/`--tw-ease` override was not implemented — it would have caused a real regression.** This document originally proposed setting both globally so every `animate-in`/`animate-out` consumer would inherit the new defaults with zero per-component changes. While implementing, `tw-animate-css`'s actual source was checked directly and found that `--animate-collapsible-down`/`--animate-collapsible-up` (used by the App Shell's collapsible nav groups) have their **own distinct fallback** — `var(--tw-duration, .2s)` / `var(--tw-ease, ease-out)` — separate from `--animate-in`/`--animate-out`'s `var(--tw-duration, .15s)` / `var(--tw-ease, ease)`. Both formulas share the *same* `--tw-duration`/`--tw-ease` variables as their first fallback — meaning a global override would have applied identically to both, silently pulling the collapsible groups' correct 200ms/ease-out down to 150ms/standard. **Implemented instead**: explicit `duration-fast` + `data-open:ease-out data-closed:ease-in` applied directly on each of the five floating-UI components (`Popover`, `Tooltip`, `DropdownMenu`'s shared `FLOATING_SURFACE`, `Dialog`'s overlay and content, `Toast`). More files touched than the original proposal, but no global variable was set, so the Collapsible system was never at risk.

**3. The "collapsible group should reclassify to `--duration-normal`" recommendation was wrong and was not applied.** It was based on an incorrect assumption that the group's height animation inherited the *fast* tier by default. It doesn't — see correction #2 above: `--animate-collapsible-down/up`'s own built-in fallback is already `.2s`/`ease-out`, i.e. already exactly `--duration-normal`'s value, before this implementation pass touched anything. No change was made to `components/shell/sidebar.tsx`'s `CollapsiblePrimitive.Content` — only its two *other*, genuinely-unlabeled `duration-200` literals (the width transition and the chevron rotation) were renamed to `duration-normal`, since those use Tailwind's separate, non-competing `transition-*` mechanism.

### What else changed
`--default-transition-duration: var(--duration-fast)` and `--default-transition-timing-function: var(--ease-standard)` *were* set globally in `@theme inline` — safe, because this mechanism (Tailwind core's bare `transition-colors`/`transition-opacity`/etc., used by `Button`, `Checkbox`, `Table`, and others) has no second competing sub-system the way `tw-animate-css` does. Confirmed in compiled CSS: `--default-transition-duration: var(--duration-fast)`.

**Layout-affecting transitions** (sidebar width, the recommended collapsible-group reclassification) reference `--duration-normal` directly via the same syntax: `duration-(--duration-normal)`, replacing the current bare `duration-200` literal with a named reference to the same value.

No code in this codebase has been changed to produce this document — every "current" claim above was checked against the actual source, and every "formalized"/"recommended" item is a proposal for the next implementation pass.
