# Krane Design System — Foundation

Documentation only — no code changed to produce this. Where a category below has a real, formal token system, it's described as one. Where it doesn't, that's stated plainly rather than implied — this document distinguishes *designed* conventions from *informal habits that happened consistently*, because conflating the two is how a design system quietly rots.

---

## 1. Design token architecture

### Colors — formal, mature
The only category with a complete, deliberate token system. Built in layers across this project's history:
- **Brand**: `--primary`/`--primary-foreground`, `--ring`, `--sidebar-ring` — Krane Yellow, with a light-mode-only darkened variant of `--ring` for contrast against white.
- **Status** (success/warning/destructive/info/pending): each with `base`/`-foreground`/`-text` roles.
- **Risk** (low/medium/high/critical): same 3-role shape as Status, independent token family.
- **Chart** (5 hues): hue-mapped against every other family to avoid collisions.
- **Shell** (sidebar/header navy): fixed, non-theme-responsive — repurposed a previously-dead token family rather than adding a parallel one.
- **Neutrals**: background/foreground/card/popover/secondary/muted/accent/border/input — all true zero-chroma OKLCH (`oklch(L 0 0)`), a deliberate constraint so no neutral ever silently picks up an accidental tint.

### Typography — formal, fixed, Geist established as the brand typeface

**The `--font-sans` defect (tracked since this project's first audit) is fixed.** It was self-referential — `--font-sans: var(--font-sans)` — and never actually resolved to anything. It now points at the real font variable:
```css
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono:  var(--font-geist-mono), ui-monospace, monospace;
--font-heading: var(--font-sans);
```

**Geist is now self-hosted, not loaded from Google Fonts.** `app/layout.tsx` previously used `next/font/google`'s `Geist`. It now uses `next/font/local` against the official Geist variable-font files (OFL licensed), copied into `app/fonts/`:
```
app/fonts/Geist-VariableFont_wght.ttf          (upright, weight axis 100–900)
app/fonts/Geist-Italic-VariableFont_wght.ttf   (italic, weight axis 100–900)
```
Both are registered as a single `localFont()` call producing the same `--font-geist-sans` CSS variable name the rest of the system already expected — nothing downstream had to change to consume it. **No new npm dependency** — `next/font/local` ships with `next` itself, same package already installed. `Geist_Mono` is untouched, still via `next/font/google` — the provided font package didn't include a mono variant, and the mono token was never broken, so it wasn't in scope to change.

**Named type-scale tokens now exist** — six roles, each bundling size + line-height + weight + letter-spacing into one utility via Tailwind v4's `--text-{name}--{property}` pairing convention:

| Token / utility | Size | Weight | Line-height | Letter-spacing | Typical use |
|---|---|---|---|---|---|
| `text-display` | 2.25rem (36px) | 700 Bold | 1.1 | −0.02em | Reserved — no current consumer; large hero/landing moments |
| `text-heading` | 1.5rem (24px) | 600 SemiBold | 1.25 | −0.01em | Page titles — now used by the App Shell demo's "Submittals" title (previously ad hoc `text-2xl font-bold`) |
| `text-title` | 1.125rem (18px) | 600 SemiBold | 1.3 | normal | Section/dialog titles — matches `DialogTitle`'s existing `text-lg font-semibold` |
| `text-body` | 0.875rem (14px) | 400 Regular | 1.5 | normal | Default UI text — the size already dominant across nearly every component |
| `text-caption` | 0.75rem (12px) | 400 Regular | 1.4 | normal | Sidebar section labels, helper/muted text — currently bare `text-xs` everywhere it's used |
| `text-label` | 0.875rem (14px) | 500 Medium | 1.2 | normal | Form field labels — matches the `Label` primitive's spec (`text-sm font-medium leading-none`) exactly |

All six live in `app/globals.css`'s existing `@theme inline` block as literal values (no light/dark split needed — type scale isn't theme-dependent). Verified live: `text-heading` compiles to exactly `font-size:1.5rem;line-height:1.25;letter-spacing:-0.01em;font-weight:600` and is now applied on `/demo/app-shell`'s page title.

**Not yet retrofitted**: every other existing ad hoc heading/label class across the demo pages (`text-xl font-semibold`, `text-sm font-semibold`, etc.) still works exactly as before and was *not* migrated to the new tokens as part of this change — only the one concrete example above was applied, specifically to verify the new utilities actually generate correctly rather than trusting the `@theme` syntax blindly. Migrating the rest is a separate, larger follow-up, not implied by "create the tokens."

### Spacing — informal
No custom spacing scale. Every `gap-*`/`p-*`/`px-*` value used across every component is Tailwind's default 4px-based scale, applied by convention rather than by a named Krane spacing token. Recurring values worth naming as *de facto* conventions, even though nothing enforces them: `gap-2` (icon-to-text in most controls), `px-3`/`h-9` (form-control sizing, established by Input's spec), `p-2` (the App Shell's 8px content gutter), `gap-1.5` (tight label/description stacks).

### Radius — formal
```
--radius: 0.625rem (10px)        — the only literal value
--radius-sm:  calc(--radius × 0.6)  = 6px
--radius-md:  calc(--radius × 0.8)  = 8px
--radius-lg:  var(--radius)         = 10px
--radius-xl:  calc(--radius × 1.4)  = 14px
--radius-2xl: calc(--radius × 1.8)  = 18px
--radius-3xl: calc(--radius × 2.2)  = 22px
--radius-4xl: calc(--radius × 2.6)  = 26px
```
One real base value, everything else derived. `rounded-md` (8px) was confirmed to land exactly on the App Shell's "8px border radius" spec without needing a new token — this scale has so far covered every radius need that's come up.

### Shadow — formal, mode-aware
```
--shadow-sm/md/lg  (Tailwind-facing) → --elevation-sm/md/lg (raw, mode-dependent)
```
Three tiers mapped to specific surfaces (sm: Tooltip/sticky header, md: Popover/DropdownMenu, lg: Dialog/side panel). Dark-mode opacity is 4–5× light-mode's for the same tier — a flat black-alpha shadow barely registers against an already-dark background, so the values aren't symmetric across modes by design.

### Opacity — informal, no centralized scale
No `--opacity-*` tokens. Every opacity modifier in the codebase (`/10`, `/12%`, `/20`, `/25`, `/30`, `/40`, `/50`, `/55`, `/70`, `/80`) was chosen ad hoc, case by case, usually after an explicit contrast check at implementation time (e.g. the destructive tint's `/10`, the sidebar active-state wash's `12%`, the risk-indicator border's `/55`). This produced *individually justified* values but not a *coherent scale* — there's no answer today to "what's the standard tint opacity for a hover state" beyond "look at what a similar component already did." This is a real gap, not a stylistic choice.

### Motion — formal, implemented
Six tokens live in `globals.css`: `--duration-fast` (150ms), `--duration-normal` (200ms), `--duration-slow` (300ms, reserved), `--ease-in`, `--ease-out`, `--ease-in-out` (the latter confirmed identical to Tailwind v4's own stock default), and `--ease-standard` as an explicit alias of `--ease-in-out` rather than a coincidentally-duplicate value. Full rationale, the interaction-standards table, and — importantly — **two corrections discovered only while implementing** are in `MOTION_FOUNDATION.md`: the originally-proposed global `--tw-duration`/`--tw-ease` override was dropped after checking `tw-animate-css`'s source directly and finding it would have silently slowed the App Shell's collapsible nav groups (which already had their own correct, distinct 200ms/ease-out default, separate from every other floating element's 150ms/ease) down to the wrong tier. The five floating-UI components (`Popover`, `Tooltip`, `DropdownMenu`, `Dialog`, `Toast`) instead get explicit `duration-fast` + directional `data-open:ease-out`/`data-closed:ease-in` applied per component — more files touched than originally planned, but no shared variable was set, so the Collapsible system was never at risk. Confirmed in compiled CSS and verified live in the browser.

### Border — formal
`--border` (general), `--input` (form-control borders specifically — confirmed as a deliberate, documented distinction in `FORM_SPECIFICATIONS.md`: form controls use `border-input`, everything else uses `border-border`), `--sidebar-border` (shell-specific, fixed value). Mature and consistently applied.

### Size — informal, but consistent by convention
No named size tokens. Recurring sizes that have become de facto standards purely through repetition: `size-4` (16px — the default icon size almost everywhere), `h-9` (form controls: Input/Textarea/Select trigger), `h-8` (Button's default size), `size-8` (avatar). These are conventions worth formalizing if a third or fourth component starts needing the same number — right now they're consistent because every component was built by checking what the last one did, not because a scale exists.

### Z-index — formal, implemented
Seven tokens live in `globals.css`: `--z-content` (0, defined for completeness, nothing consumes it), `--z-sticky` (10), `--z-dropdown` (50), `--z-popover` (50), `--z-tooltip` (60), `--z-dialog` (70), `--z-toast` (100). The two real defects found in `Z_INDEX_FOUNDATION.md`'s audit are fixed, not just named: Tooltip moved from a shared `z-50` to its own `60` (tooltips routinely describe elements nested inside other floating surfaces and must never be hidden behind them), and Dialog moved from `z-50` to `z-70` (it previously shared a tier with Popover/Tooltip/DropdownMenu, meaning a dropdown opened from inside an open Dialog had no *guaranteed* stacking position above it — it only worked by Radix's portal mount order, not by design). `--z-command-palette` (80, between Dialog and Toast) remains a documented reservation only — deliberately not added to `globals.css` this pass, since no component exists yet to consume it. Confirmed in compiled CSS, e.g. `.z-tooltip{z-index:var(--z-tooltip)}`.

---

## 2. Naming convention

Three tiers, used consistently since the very first token (`--primary`) was added:

**Primitive tokens** — the raw value, defined once per mode in `:root`/`.dark`. Example: `--primary: oklch(0.883 0.181 94.426);`. Never consumed directly by a utility class.

**Semantic tokens** — the Tailwind-facing name, registered in `@theme inline`, pointing at a primitive. Example: `--color-primary: var(--primary);` — this is what makes `bg-primary` resolve. The separation between these two tiers (different name on each side) is what allows a single utility class to mean something different in light vs. dark mode without `@theme inline` itself needing two definitions.

**Component-scoped tokens** — semantic tokens whose name ties them to one specific component family rather than general-purpose use. Example: `--sidebar-ring`, `--badge-new`, `--risk-low-text`. These still follow the primitive/semantic split internally, but the *name* signals "don't reach for this outside its owning component" the way `--destructive` or `--primary` invite broad reuse. This tier exists because several real collisions were avoided by **not** forcing component-specific needs into general tokens — e.g. the shell's navy background is `--sidebar`, not a redefinition of `--background`.

---

## 3. Light mode and dark mode strategy

- Toggled via a `.dark` class on an ancestor (`@custom-variant dark (&:is(.dark *))`), **not** `prefers-color-scheme` — an explicit choice, not automatic OS-following.
- Every token family has real, distinct dark values (status, risk, chart stay nearly fixed since they were tuned to work on both; neutrals invert; shell tokens are deliberately identical in both modes).
- **The token layer is 100% complete. The activation layer does not exist.** Nothing in this application currently sets the `.dark` class — there is no theme switcher built yet (tracked in `DESIGN_SYSTEM_ROADMAP.md` as the single highest leverage-to-effort item remaining). Dark mode can be verified today only by manually adding the class in devtools.
- Deliberate **exceptions** to mode-responsiveness exist and are intentional, not oversights: the shell navy (`--sidebar*`), the "NEW" badge (`--badge-new*`), the Dialog overlay (`bg-black/50`, literal), and the App Shell's content panel (`bg-white`, literal) all stay fixed regardless of theme — these are brand/structural constants, not things a user's theme preference should be able to change.

---

## 4. Krane brand color system

**Primary yellow** — `#FFD503`, converted to `oklch(0.883 0.181 94.426)`. Used at full brightness for `--primary`/`--sidebar-primary` and dark-mode `--ring`. Light-mode `--ring` is a *separately darkened* derivative of the same hue (`oklch(0.550 0.112 94.426)`) — full-brightness yellow measured 1.42:1 against white, far below any usable focus-indicator contrast; the darkened variant hits 4.83:1. Same hue everywhere, different lightness/chroma calibrated per background.

**Supporting neutrals** — strictly zero-chroma OKLCH grayscale across background/foreground/card/popover/secondary/muted/accent/border/input. The zero-chroma constraint is deliberate: it guarantees no neutral ever reads as faintly blue or warm by accident, which matters more in a system with this many *intentionally* chromatic semantic colors (status, risk, chart, brand) — neutrals need to stay unambiguously neutral so they don't compete for meaning.

**Status colors** — five families (success/warning/destructive/info/pending), each carrying its own `-text` variant specifically because the base, fill-tuned tokens fail contrast as direct text color. The hardest problem in this entire color system was fitting Warning, the Risk tiers, and Brand Yellow into the same crowded 25°–95° warm arc of the hue wheel without them reading as the same color in a dense table — solved not by relocating any hue, but by giving Risk and Status structurally different *component forms* (solid pill vs. outlined chip + dot meter) so the distinction survives even when two colors land close together.

**Data-heavy enterprise usage considerations** — several decisions in this system trace directly back to "this renders in dense procurement tables with many badges/rows visible at once," not a marketing surface:
- DataTable's selected-row tint deliberately uses `--accent` (a neutral) rather than brand yellow, specifically to avoid a selected row reading as a Warning/Pending state when both appear in the same view.
- Risk's color palette stayed in the conventional green→red zone rather than moving to a visually "safer" but unfamiliar hue lane, because dense operational tables are exactly where users rely most on learned color conventions (green=fine, red=urgent) — the fix for the Status/Risk collision was deliberately *not* "make Risk a weirder color."
- Hover/selection states throughout the table primitives use low-opacity neutral washes (`bg-muted/50`) rather than saturated fills — a dense grid with many rows needs a hover state that doesn't visually compete with the badges and risk indicators already in each row.
- Elevation tiers are intentionally restrained (6–12% opacity shadows in light mode) — a UI with this much tabular content needs floating chrome (Popover/DropdownMenu/Tooltip) to feel "lifted" without adding visual noise on top of already-dense rows.
- The chart palette (5 hues) was explicitly checked for pairwise hue separation rather than picked for individual prettiness — small-multiple and dense chart contexts punish palettes that look fine in isolation but collapse together at a glance.

---

## 5. Folder structure recommendation

**Current structure**:
```
components/
  ui/          — domain-agnostic primitives (Button, Badge, Dialog, Table, DataTable, …)
  shell/       — Krane-specific app chrome (AppShell, Sidebar, switchers)
hooks/         — shared client-side state (use-toast.ts)
lib/           — utils.ts (cn() — the one shared helper everything depends on)
app/demo/      — one route per component/feature, used as the living documentation
```

This split (generic `ui/` vs. Krane-specific `shell/`) has held up well and should continue — it's the right boundary between "reusable anywhere" and "this specific app's chrome."

**Recommended additions as the system grows** (not a restructure — additive):
- Keep new field primitives (Label, Input, Textarea, Select, RadioGroup, Switch) in `components/ui/`, one file each, alongside Button/Badge/Checkbox — they're exactly as domain-agnostic. Bundle the Form-validation cluster (Form/FormField/FormItem/FormLabel/FormDescription/FormMessage) into one `components/ui/form.tsx`, matching how `dropdown-menu.tsx`/`toast.tsx`/`table.tsx` already bundle tightly-coupled families — already decided in `FORM_FOUNDATION_PLAN.md`, restated here for completeness.
- `hooks/` will need a second file the moment a second piece of shared client state shows up (a theme-switcher hook is the next likely candidate) — no reorganization needed, just more files at the same level.
- `lib/` is currently a single file. If form validation (`react-hook-form` + a schema library) is added, a `lib/validations/` subfolder for shared zod schemas (PO shape, vendor shape, etc.) would be a reasonable addition *once a second schema exists* — not before.
- No need for a `components/forms/` split distinct from `components/ui/` — the field primitives aren't a different *kind* of thing the way `shell/` is; they're just more `ui/` primitives.
- If a real Krane module is ever added beside the `/demo` routes, it should get its own top-level `app/<module>/` tree and consume `components/ui` + `components/shell` as a library — `app/demo` should stay purely a documentation/demo surface, not grow real product logic.
