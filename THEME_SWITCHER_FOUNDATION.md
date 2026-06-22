# Krane Design System — Theme Switcher Foundation

Audit + specification, now implemented at `components/theme-provider.tsx` (`ThemeProvider`/`useTheme`) and `components/theme-toggle.tsx` (`ThemeToggle`), wired into `app/layout.tsx`'s root and `/demo/app-shell`'s `AppHeader`, demoed at `/demo/theme`. The theme switcher had been the single most repeated line item in this project's status documents — "explicitly held back by instruction," not by any technical blocker — across every `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` pass since dark-mode tokens were first completed.

The recommended architecture (§"Final recommendation") was followed exactly: hand-rolled, not `next-themes`. The `AppShell` `bg-white` prerequisite this document found was fixed in the same pass, now `bg-background text-foreground` (`components/shell/app-shell.tsx`). One real implementation detail this document's API sketch (§8) didn't anticipate: a `useState`+`useEffect` read of `localStorage` on mount hit a genuine `react-hooks/set-state-in-effect` lint error, not a style nitpick — `React.useSyncExternalStore` was used instead, the React-correct tool for "read a value SSR can't see," which also yields cross-tab sync for free (named in this document as a deferred nice-to-have, MUI's `colorSchemes` capability) as a side effect of needing a same-tab pub-sub anyway. Verified with a full Playwright pass — light/dark/system toggling, a reload-while-dark no-flash check (confirmed via raw HTML inspection that the inline script renders blocking, before `</head>`), and a 6-page dark-mode spot-check (Input/Select/Form/Table/Dialog/Theme) — which found zero token issues beyond the one already named in this document's audit. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail.

## Audit: existing token system

Complete and correct, confirmed again this pass — every color token in `app/globals.css` follows the same two-layer pattern (`:root`/`.dark` raw value → `@theme inline` Tailwind-facing registration) without exception: Brand, Status ×5, Risk ×4, Chart ×5, all have real, distinct `.dark` values already written. `--accent`/`--sidebar-accent` and the rest of the neutral scale are likewise fully dual-valued. Nothing in the token layer is missing or stubbed.

## Audit: existing dark mode support

The mechanism (`@custom-variant dark (&:is(.dark *));`, matching Tailwind's class-based dark-mode strategy exactly) works correctly end to end — confirmed by the fact that several components already ship real, tested `dark:` variants on top of it: `Input`/`Textarea`/`Select`/`Combobox`/`RadioGroup`/`Switch`'s `error` status all carry `dark:border-destructive/50 dark:ring-destructive/40` (a deliberate opacity boost, not a copy-paste artifact — dark-mode shadow/ring opacity has been calibrated 4–5× light-mode's throughout this project for exactly this reason). **Nothing in any shipped component needs to change for dark mode to render correctly once `.dark` is actually applied to the document** — confirmed by re-reading every completed component's class list this pass, not assumed from the fact that tokens exist. The only thing missing is something that ever sets `.dark` in the first place.

## Audit: App Shell — one real, structural finding

**`AppShell`'s main content panel is hardcoded to `bg-white`, not `bg-background`** (`components/shell/app-shell.tsx`: `<main className="h-full overflow-y-auto rounded-md bg-white">`). This was a defensible, even correct, decision in a world where dark mode was real-but-unreachable — establishing the "framed white card against the navy shell" look documented in `DESIGN_SYSTEM_STATUS.md` as a deliberate, fixed exception alongside the Shell's own navy tokens. **It stops being defensible the moment a working theme switcher exists**: every component this system has built (`Button`, `Input`, `Select`, `Table`, …) is token-driven and will correctly flip to its dark-mode colors the instant `.dark` is applied — rendered on top of a panel that's hardcoded to stay white regardless. The result wouldn't be "dark mode doesn't quite look right," it would be light-on-dark form controls floating on a forced-white background, in the one region of the screen where users spend most of their time. **This is the single load-bearing prerequisite this document found** — not a nice-to-have polish item, a correctness requirement for the theme switcher to do anything coherent in the App Shell at all. The fix is narrow and precise: `bg-white` → `bg-background`, nothing else in the Shell's structure changes.

The Shell's *other* fixed value — the navy `--sidebar`/`--sidebar-foreground`/`--sidebar-border` family staying constant across both modes — is correctly, deliberately exempt, and stays exempt: a brand-chrome constant (the same category of decision as a product keeping its brand-colored sidebar fixed regardless of the user's light/dark preference) is a different question from a content surface that's supposed to be theme-aware and simply forgot to be. `Dialog`'s `bg-black/50` overlay is similarly fine to leave fixed — a scrim dims whatever's behind it regardless of that content's own mode, and nothing token-driven renders confusingly against it the way `Input`/`Button` would against a wrongly-fixed content panel.

## Audit: all completed components

No other gaps found. Every one of the 14 completed `components/ui/` primitives plus the App Shell's switchers reads its colors from tokens, not literals (the `bg-white`/`bg-black` search above was exhaustive, not sampled). `Toast`'s and `Alert`'s tinted variant treatments (`border-{color}/30 bg-{color}/10`) are opacity-based on top of the same dual-valued tokens, so they're already dark-mode-correct without any additional `dark:` overrides needed. Nothing else in this system requires a code change for the theme switcher to work — the App Shell's content panel is the one exception, not the rule.

---

## 1. Purpose

Gives users a way to actually reach the dark-mode token layer this project has maintained correctly since its early color-foundation work — closing the gap between "every token has a complete, correct dark value" and "nothing in the app ever sets `.dark`," a gap this project's own documentation has named in every status pass without closing it. Not a new design decision about *what* dark mode looks like (already decided, already built) — entirely a question of *how a user reaches it* and *how that choice persists*.

## 2. Theme architecture

Three layers, the same shape every comparison system below independently converges on:

1. **A persisted preference**: one of `light` / `dark` / `system` (§6).
2. **A resolution step**: `system` resolves to whatever `prefers-color-scheme` currently reports; `light`/`dark` are explicit and override it.
3. **An application step**: the resolved value toggles the `.dark` class on `<html>` — the exact mechanism `app/globals.css` already expects, requiring zero token-layer changes.

**A real architectural decision, not a default inherited from shadcn's own convention**: this document recommends a small, hand-rolled implementation over `next-themes` (shadcn's own canonical answer, and the library every shadcn-convention project reaches for first) — covered in full in the comparison section, not asserted here without justification.

## 3. Light mode behavior

The current, only-reachable-today behavior: `:root`'s token values apply, no `.dark` class present. Nothing changes about light mode's own appearance — this document is entirely about *reaching* dark mode and *returning* to light, not revisiting light mode's already-shipped design.

## 4. Dark mode behavior

`.dark` applied to `<html>`; every `dark:`-aware token and component-level override (audit, above) takes effect immediately, with no per-component code change required — confirmed, not assumed, this pass. The one prerequisite (`AppShell`'s `bg-white` → `bg-background`) must land for this to look coherent in the Shell specifically; every other surface in this system is already correct.

## 5. System theme behavior

`system` is not a one-time check at load — it must track *live* OS preference changes for as long as the app is open, via a `matchMedia('(prefers-color-scheme: dark)')` change listener, exactly the behavior `next-themes`, MUI's `colorSchemes`, and Primer's `data-color-mode="auto"` all document explicitly. A user who opens Krane in the afternoon (light) and is still in the same tab when their OS auto-switches to dark at night should see Krane follow, without a reload — this is the one behavior that's easy to half-implement (read `matchMedia` once at mount, never again) and look like it works in casual testing while actually being wrong.

## 6. Persistence strategy

`localStorage`, a single key (e.g. `krane-theme`), storing the *preference* (`light`/`dark`/`system`), not the *resolved* value — storing the resolved value would silently break system-tracking the next time the OS preference changes between sessions. **The no-flash requirement is the real engineering content of this section, not the storage mechanism itself**: the persisted preference must be read and applied *before* React hydrates and before first paint, via a small inline, synchronous `<script>` in `<head>` — the same technique every comparison system below uses under a different name (`next-themes`' injected script, MUI's `InitColorSchemeScript`). Without it, every page load briefly flashes the wrong theme before client-side JavaScript catches up — a real, visible defect, not a theoretical one. This requires `suppressHydrationWarning` on `<html>` in `app/layout.tsx` (currently absent), since the server has no way to know the client's stored preference and will always render a `class` attribute the client-side script then changes — exactly the one, narrow, expected case `suppressHydrationWarning` exists for, not a blanket escape hatch.

## 7. Accessibility requirements

- **Disable CSS transitions for the duration of the actual swap** — both `next-themes` (`disableTransitionOnChange`) and MUI's `colorSchemes` API document this as a real, named option, not an edge case: an untransitioned, instant swap avoids a jarring full-viewport color animation that's unpleasant for everyone and a genuine concern for users sensitive to motion, distinct from `prefers-reduced-motion` but solved by the same instinct.
- **The user's explicit choice always overrides `prefers-color-scheme`, permanently, until they change it again** — `system` is one of three equally-valid persisted states, not a fallback that quietly loses to a manual choice over time.
- **The toggle control needs a real accessible name and visible current-state indication** — reusing `DropdownMenu`'s already-correct ARIA menu semantics (§9) rather than a custom toggle button whose pressed-state semantics would need to be re-derived from scratch.
- **Contrast is already solved, not a new requirement** — the toggle lives in `AppHeader`'s navy chrome via the existing `rightActions` slot, using the same `text-sidebar-foreground`/`hover:bg-sidebar-accent`/`focus-visible:ring-sidebar-ring` treatment `AppHeader`'s own collapse-toggle button already establishes, not a new contrast pairing to validate.

## 8. API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped.

```ts
type ThemePreference = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: ThemePreference        // the persisted preference
  resolvedTheme: "light" | "dark"  // what's actually applied right now
  setTheme: (theme: ThemePreference) => void
}

function useTheme(): ThemeContextValue
// Mirrors useShell()'s exact existing shape and error-if-outside-provider behavior
// (components/shell/app-shell.tsx) — the same pattern, not a new one invented here.

function ThemeProvider(props: { children: React.ReactNode }): JSX.Element
// Mounted once at the root layout, the same relationship TooltipProvider/Toaster
// already have to app/layout.tsx.
```

## 9. Demo requirements

- A `Light`/`Dark`/`System` `DropdownMenu` (reusing the already-shipped component, `Sun`/`Moon`/`Monitor` icons, a checkmark on the active selection — the exact `DropdownMenuRadioItem` pattern already demoed in `/demo/dropdown-menu`) mounted in `AppHeader`'s `rightActions` slot on the `/demo/app-shell` page specifically — not a standalone toggle floating outside any real layout, since the entire point is proving it works inside the Shell where the `bg-white` prerequisite (audit, above) actually matters.
- A live demonstration that switching to `dark` while on `/demo/app-shell` correctly recolors the main content panel underneath whatever demo content is rendered there — the concrete, visible proof the prerequisite fix worked, not just a class-name check.
- A reload-persistence check: select `Dark`, refresh the page, confirm no flash of light mode before dark renders.
- A live system-preference-change check (§5): with `system` selected, change the OS preference while the page is open, confirm Krane follows without a manual refresh.

## 10. Enterprise use cases

- **Low-light operations environments** — warehouse/yard-facing procurement staff checking PO status on a tablet in dim conditions, a real, named reason enterprise software needs dark mode at all, not a cosmetic preference.
- **Personal preference parity with the rest of a user's tooling** — procurement staff who run their OS, IDE, and other SaaS tools in dark mode expect a "use system" option, not just a binary toggle requiring a separate manual choice per app.
- **Extended-session eye comfort** — approvers reviewing long PO/vendor lists for hours at a stretch, the original, still-valid justification recorded when the color token work began.

---

## Comparison: shadcn/ui, Material Design, Atlassian, Polaris, GitHub Primer

**shadcn/ui** — the canonical, idiomatic answer for a shadcn-convention project: `next-themes`, `ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`), `suppressHydrationWarning` on `<html>`, `useTheme()` returning `theme`/`setTheme`/`systemTheme`. [(shadcn/ui — Dark mode)](https://ui.shadcn.com/docs/dark-mode) **This is the most relevant single precedent in this comparison** — Krane already follows shadcn's conventions throughout (`components.json`, every component's own structure) — and is addressed at length in the recommendation below rather than dismissed by default.

**Material Design (MUI)** — the modern `colorSchemes` API: `useColorScheme()` hook, an `InitColorSchemeScript` component (MUI's own version of the no-flash script), automatic `localStorage` persistence, and **cross-tab synchronization** — a real, named capability neither `next-themes`' core docs nor this document's own §5–§6 explicitly required, worth naming as a genuine "nice to have" found by comparison rather than invented from scratch. [(MUI — Dark mode)](https://mui.com/material-ui/customization/dark-mode/)

**Atlassian (Atlaskit)** — `setGlobalTheme({ light, dark, colorMode: 'light' | 'dark' | 'auto' })` from `@atlaskit/tokens`, resulting in `data-theme`/`data-color-mode` HTML attributes. Atlaskit's actual problem is bigger than Krane's: it supports *multiple named themes per mode* (a legacy dark theme alongside a current one, e.g.), which is why it needs a two-part `{light, dark}` selection on top of the mode itself. [(Atlaskit — setGlobalTheme)](https://atlassian.design/tokens/use-tokens-in-code/) **Verdict**: confirms `auto` as the right name for the system-tracking state conceptually, but Krane has exactly one light theme and one dark theme — adopting Atlaskit's two-axis model would be solving a problem Krane doesn't have, the same "no axis nothing needs" discipline already applied to `Label`'s size variant and `Input`'s color variants.

**Shopify Polaris** — **has no dark mode at all**, confirmed directly: Shopify's own admin surface still has no native dark mode as of this research, and the closest available workaround for merchants who want one is a third-party browser extension (Dark Reader), not anything Polaris itself ships. A real, citable data point that not every mature enterprise admin-surface design system treats this as a given — but Krane's own token investment was made and completed well before this document, so the question here is "how do we reach what we already built," not "should we build it."

**GitHub Primer** — the most sophisticated system in this comparison: `data-color-mode="auto" | "light" | "dark"` plus *separate* `data-light-theme`/`data-dark-theme` attributes, supporting dimmed, high-contrast, and colorblind-friendly theme variants within each mode. [(Primer — Theming)](https://primer.style/product/getting-started/react/theming/) **Verdict**: real, and a meaningfully larger investment than Krane's binary light/dark — correctly out of scope here for the same reason Atlaskit's two-axis model is: no named Krane consumer for multiple variants *within* a mode, only for the mode itself. Primer's `data-color-mode="auto"` naming is, again, a vote for `system`/`auto` as a real third state, not just light-vs-dark.

---

## Existing capabilities

The entire token layer (audit, above) — every color in this system already has a correct, tested dark value. This is the unusual case among this project's foundation docs where the *hard* part (deciding what dark mode looks like, getting contrast right, calibrating shadow/ring opacity) is already done, and what's missing is comparatively small.

## Missing capabilities

- The switcher itself, full stop — no toggle, no persisted preference, no system-tracking, anywhere in this codebase.
- **`AppShell`'s `bg-white` → `bg-background` fix** (audit, above) — the one genuine prerequisite, not a nice-to-have; without it the switcher would "work" (the class toggles, the preference persists) while looking visibly broken in the Shell.
- A no-flash mechanism and the `suppressHydrationWarning` it requires — absent today, and easy to get wrong by skipping it (the flash is often missed in casual local testing on a fast machine, then reported as a real, confusing first-load bug once shipped).
- Live system-preference tracking (§5) — easy to half-build (read once, never listen for changes) and look correct in a quick test while actually being wrong.

## Recommended architecture

A small, hand-rolled `ThemeProvider`/`useTheme()` (§8), **not `next-themes`** — covered in full in the final recommendation below, since this is a real decision this document made deliberately, not a default. `AppHeader`'s already-existing `rightActions` slot hosts a `DropdownMenu`-based Light/Dark/System control, reusing already-shipped components rather than introducing a new toggle pattern. The `bg-white`→`bg-background` fix in `AppShell` ships alongside the switcher itself, not as a separate, later cleanup — shipping the switcher without it would be shipping a known, named defect on day one.

## Must-have vs. Nice-to-have

**Must-have**: the switcher itself; the `AppShell` content-panel fix (a correctness prerequisite, not a polish item — §"App Shell," above); the no-flash script + `suppressHydrationWarning` (a real, visible defect without it, not a theoretical edge case); live system-preference tracking, not a load-time-only check (§5).

**Nice-to-have**: cross-tab synchronization (MUI's `colorSchemes` capability, real and pleasant, but no concrete Krane consumer has hit the "two tabs disagree" annoyance yet — the same bar this system has applied to every other deferred feature); multiple theme variants per mode (Primer's dimmed/high-contrast pattern, Atlaskit's multi-theme model) — real for those systems' actual user bases, no named Krane need for anything beyond one light and one dark theme.

## Final recommendation for Krane

**Build a small, hand-rolled `ThemeProvider`/`useTheme()` rather than adopting `next-themes`** — a deliberate departure from "do what shadcn's own convention does," made for a specific reason this document can defend rather than a default followed out of habit: every other new-dependency decision in this project (`cmdk` for `Combobox`, `react-hook-form`/`zod`/`@hookform/resolvers` for `Form`) was justified by a real, easy-to-get-wrong problem a library solves better than a hand-rolled version would (the WAI-ARIA combobox pattern, a full form-validation state machine). A binary light/dark/system toggle with persistence and a no-flash script is genuinely smaller than either of those — a `useState`, a `localStorage` read/write, one `matchMedia` listener, and roughly ten lines of inline script. Reaching for a dependency here would be the first time this project added one *without* that justification, not a continuation of an established pattern. Ship the `AppShell` content-panel fix in the same pass as the switcher, not after it — the two are one piece of work, not a feature plus a follow-up cleanup. Do not adopt Atlaskit's or Primer's multi-theme-per-mode models — both are real, both solve a problem Krane has never been asked to solve.
