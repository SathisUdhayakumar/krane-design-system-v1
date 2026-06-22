# Krane Design System — Foundation Gaps

Documentation only — no code changed. Covers the three gaps flagged in `DESIGN_SYSTEM_FOUNDATION.md`: Typography, Motion, Z-index. Every file reference below was re-verified against the current source for this document, not recalled from memory.

---

## Typography tokens

### 1. Problem
The `--font-sans` token is self-referential and was never assigned a real value. The `font-sans` utility class — applied globally to `<html>` — currently resolves to nothing meaningful.

### 2. Current implementation
```css
/* app/globals.css, @theme inline */
--font-sans: var(--font-sans);      /* self-reference — never resolves */
--font-mono: var(--font-geist-mono); /* this one works correctly */
--font-heading: var(--font-sans);    /* inherits the same broken value */
```
```css
/* app/globals.css, @layer base */
html { @apply font-sans; }
```
`app/layout.tsx` loads `Geist`/`Geist_Mono` via `next/font` and exposes them as `--font-geist-sans`/`--font-geist-mono` on `<html>`'s className — but nothing ever assigns `--font-sans` itself to point at `--font-geist-sans`. `app/page.tsx` also applies `font-sans` directly (line 5), inheriting the same dead value.

### 3. Why it is a risk
- The entire app is currently rendering in whatever the browser's CSS-cascade fallback ends up being for an unresolved custom property (effectively the user-agent default sans-serif), not the Geist typeface every other part of the brand (logo treatment, etc.) assumes.
- `--font-heading` was clearly intended to allow a distinct heading typeface later — right now it can't, because it inherits the same broken reference. Anyone fixing one without checking the other will fix it halfway.
- This has been present since the project's first commit and has survived every subsequent audit untouched — a sign that "it doesn't visually break anything obviously" is masking it, not that it's safe.

### 4. Recommended fix
Point `--font-sans` at the real CSS variable `next/font` already produces, with a sensible system-font fallback chain, instead of at itself:
```css
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
--font-heading: var(--font-sans); /* fine to keep inheriting, once the source is real */
```
No change needed to `--font-mono` — it's already correct. No change needed to `app/layout.tsx` — the variable it produces is fine, it just isn't being consumed.

### 5. Impacted files
| File | Change |
|---|---|
| `app/globals.css` (lines 10, 12) | Fix `--font-sans` and (by inheritance) `--font-heading` |
| `app/layout.tsx` | No change required — confirms the variable being pointed at already exists |
| `app/page.tsx` (line 5) | No change required, but this is the one place outside `globals.css` that directly uses `font-sans` — worth a smoke check after the fix, since it's currently the only visual evidence (or lack of it) that the bug exists |

### 6. Proposed token structure
```
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono:  var(--font-geist-mono), ui-monospace, monospace;   /* formalizing the fallback chain here too, for parity */
--font-heading: var(--font-sans);
```
Secondary, lower-priority recommendation (not a bug fix, a documentation gap): the type *scale* itself (`text-xs`…`text-2xl`) is Tailwind's untouched default and doesn't need new tokens — what's missing is a documented mapping of scale step to semantic role, e.g. page title → `text-2xl font-bold` (already the de facto pattern in the App Shell demo), section label → `text-xs`, body → `text-sm`. This is worth writing down as a convention table, not worth duplicating as parallel CSS custom properties.

---

## Motion tokens

### 1. Problem
Two independent "default transition speed" mechanisms are both in play, both currently set to 150ms by coincidence rather than by a shared decision, and one component has already drifted to a third, explicit value (200ms) with no documented reason.

### 2. Current implementation
**Mechanism A** — `tw-animate-css`'s enter/exit animations (`animate-in`/`animate-out`, used by every overlay's open/close transition):
```css
--animate-in:  enter var(--tw-animation-duration, var(--tw-duration, .15s)) …
--animate-out: exit  var(--tw-animation-duration, var(--tw-duration, .15s)) …
```
Consumed by `components/ui/popover.tsx`, `tooltip.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx` — all five rely on the `.15s` fallback, since nothing in this project currently sets `--tw-duration`.

**Mechanism B** — Tailwind core's own `transition-*` property utilities (`transition-colors`, `transition-opacity`, `transition-all`, `transition-transform`), which default to Tailwind's own internal `--default-transition-duration` (150ms) when no explicit `duration-*` utility is chained:
```
components/ui/button.tsx     — transition-all          (no explicit duration)
components/ui/checkbox.tsx   — transition-colors        (no explicit duration)
components/ui/table.tsx      — transition-colors        (no explicit duration)
components/ui/dialog.tsx     — transition-opacity (close button)  (no explicit duration)
components/ui/toast.tsx      — transition-opacity, transition-transform  (no explicit duration)
components/shell/sidebar.tsx — transition-colors (×2, group trigger + nav item)  (no explicit duration)
```

**The drift** — `components/shell/sidebar.tsx` explicitly overrides both mechanisms' implicit defaults in exactly two places:
```
line 30: transition-[width] duration-200      (sidebar expand/collapse)
line 76: transition-transform duration-200    (group chevron rotation)
```

### 3. Why it is a risk
- Two unrelated systems (a Tailwind core theme default and a third-party plugin's fallback chain) currently agree by coincidence. If either one's upstream default ever changes — a `tw-animate-css` version bump, a Tailwind major-version default change — they silently diverge, and nothing in this codebase would notice or fail a build over it.
- The 200ms sidebar values have no written rationale. A future contributor can't tell whether 200ms is "slower because a width/transform change is a bigger visual movement than a fade" (a real, defensible reason) or just an arbitrary number someone typed once.
- Every new component built from here forward has no documented value to copy — the only way to "stay consistent" today is to go read what the last component happened to do.

### 4. Recommended fix
Formalize two tiers rather than collapsing to one — the existing 150/200 split already reflects a reasonable distinction (small fades/color/opacity changes vs. larger layout-affecting transitions like width or transform on a whole panel), it just isn't written down anywhere:
```css
--duration-fast: 150ms;    /* fades, color/opacity changes, overlay enter/exit */
--duration-normal: 200ms;  /* width/transform changes on larger elements (sidebar collapse, chevron rotation) */
```
Wire `--duration-fast` into *both* mechanisms at once so the two systems can't drift independently:
```css
--tw-duration: var(--duration-fast);               /* drives tw-animate-css's animate-in/out fallback */
--default-transition-duration: var(--duration-fast); /* Tailwind v4's own theme key for the bare transition-* utilities */
```
This changes the *visible* behavior of nothing (150ms stays 150ms everywhere it already was) — it just makes the number a deliberate decision instead of an accident, and gives the sidebar's existing 200ms a name (`--duration-normal`) instead of a bare literal.

### 5. Impacted files
| File | Change |
|---|---|
| `app/globals.css` | Add `--duration-fast`/`--duration-normal`, wire `--tw-duration` and `--default-transition-duration` |
| `components/ui/popover.tsx`, `tooltip.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx` | No change required — they inherit the formalized default automatically through the existing `--tw-duration` fallback chain |
| `components/ui/button.tsx`, `checkbox.tsx`, `table.tsx` | No change required — they inherit through `--default-transition-duration` |
| `components/shell/sidebar.tsx` | Replace the two literal `duration-200` with `duration-(--duration-normal)` (or an equivalent token reference), so the value has a name instead of being a bare number |

### 6. Proposed token structure
```
--duration-fast: 150ms;
--duration-normal: 200ms;
--tw-duration: var(--duration-fast);
--default-transition-duration: var(--duration-fast);
```
No easing-curve token is proposed yet — every transition in this codebase currently uses Tailwind's default easing implicitly (none chain an explicit `ease-*` utility), so there's no observed inconsistency to fix there, unlike duration. Worth revisiting only if a component introduces an explicit easing curve later.

---

## Z-index tokens

### 1. Problem
Three different z-index values are in active use, with no named scale, no documented relationship between them, and one real latent stacking conflict between two of them that hasn't surfaced as a visible bug yet only because of Radix's portal mount-order behavior — not because it's actually guaranteed to be safe.

### 2. Current implementation
```
z-10   — app/demo/table/page.tsx (sticky table header)                         — 1 occurrence
z-50   — components/ui/popover.tsx, tooltip.tsx, dropdown-menu.tsx              — floating, trigger-anchored chrome
       — components/ui/dialog.tsx (both the overlay AND the content panel)      — modal, scrim-backed
z-100  — components/ui/toast.tsx (viewport)                                     — must always be topmost
```
No `--z-*` custom properties exist anywhere in `app/globals.css`.

### 3. Why it is a risk
- **Dialog and Popover/DropdownMenu/Tooltip currently share the exact same `z-50` tier.** If a `Select` or `DropdownMenu` is ever opened *from within* an open `Dialog` (a completely ordinary pattern — e.g. a category picker inside a "Create vendor" form), its stacking position relative to the Dialog's own backdrop and content depends entirely on DOM/portal mount order, not on an explicit guarantee. Radix portals typically append in mount order, which usually produces the right visual result today — but "usually correct because of mount order" is not the same as "guaranteed correct," and this is exactly the kind of bug that only appears once a specific interaction sequence is tried for the first time.
- **`z-10` for the sticky table header is a one-off, unrelated to the other two values** — there's no documented reason it's 10 rather than, say, 5 or 40, and no guarantee a future sticky element won't pick a colliding number independently.
- No reserved headroom exists between any of the three values for a future component that needs to sit between two existing tiers.

### 4. Recommended fix
A 4-tier scale with deliberate gaps, and — the one substantive behavioral change in this entire document — **give Dialog its own tier above Popover/DropdownMenu/Tooltip**, resolving the latent collision rather than just naming the existing numbers:
```css
--z-sticky: 10;    /* sticky headers and similar in-flow elevated elements */
--z-popover: 50;   /* Popover, Tooltip, DropdownMenu, (future) Select content — trigger-anchored floating chrome */
--z-overlay: 60;   /* Dialog overlay + content — intentionally above the popover tier, so a Select/DropdownMenu opened from inside an open Dialog still stacks correctly */
--z-toast: 100;     /* Toast viewport — always topmost, including above an open Dialog */
```

### 5. Impacted files
| File | Change |
|---|---|
| `app/globals.css` | Add the four `--z-*` tokens (+ `@theme inline` registration if exposed as utilities, e.g. `--z-index-overlay`) |
| `components/ui/popover.tsx`, `tooltip.tsx`, `dropdown-menu.tsx` | `z-50` → `z-(--z-popover)` (value unchanged, now named) |
| `components/ui/dialog.tsx` | `z-50` → `z-(--z-overlay)` **on both the overlay and the content panel** — this is the one actual value change (50 → 60), fixing the latent collision |
| `components/ui/toast.tsx` | `z-100` → `z-(--z-toast)` (value unchanged, now named) |
| `app/demo/table/page.tsx` | `z-10` → `z-(--z-sticky)` (value unchanged, now named) |

### 6. Proposed token structure
```
--z-sticky: 10;
--z-popover: 50;
--z-overlay: 60;
--z-toast: 100;
```
Gaps are deliberate: 10→50 (40 units of headroom below floating chrome), 50→60 (a small but explicit separation, not a coincidence), 60→100 (40 units of headroom above Dialog for anything future). Any new overlay-style component should be evaluated against this scale at design time — "does it need to sit above or below an open Dialog" is now an answerable question instead of a guess.
