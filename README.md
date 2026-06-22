# Krane Design System

Enterprise design system for Krane products — tokens, primitives, and an application shell, purpose-built for dense, data-heavy procurement workflows (purchase orders, vendors, submittals, schedules). Built on Next.js 16, Tailwind CSS v4, and Radix UI (via the `radix-ui` umbrella package), following shadcn conventions without depending on the shadcn CLI at runtime.

Current tag: **`v1.0.0-rc1`**.

---

## Overview

This repository is two things at once:

1. **A component library** — `components/ui/` (26 primitives) and `components/shell/` (6 application-shell pieces) — meant to be copied into or consumed by Krane product codebases.
2. **A living reference app** — every component has a real, interactive demo at `/demo/*` (27 routes), built from the same code a consuming product would import, not a static mockup or a Storybook-style isolated fixture.

There is no published npm package yet. The intended consumption model today is direct: clone this repo, read the component source under `components/ui/` or `components/shell/`, and copy what you need — the same model shadcn-style systems use, since the components are plain, readable React + Tailwind, not hidden behind a build step.

## Philosophy

A few decisions recur across nearly every component in this codebase, recorded here because they aren't visible from reading any single file in isolation:

- **Wrap, don't reinvent.** Every component that has a Radix primitive backing it (`Dialog`, `Select`, `Tabs`, `DropdownMenu`, `RadioGroup`, `Switch`, `Avatar`, `Tooltip`, `Popover`, `Collapsible`, …) is a thin styling/API layer on top of `radix-ui`, not a hand-rolled reimplementation. Where no primitive exists or is appropriate — `Breadcrumb`, `Stepper`, `Alert`, `RiskIndicator` — that absence is confirmed during a written audit first, not assumed.
- **No new dependency or design token without concrete justification.** `cmdk` (for `Combobox`), `react-hook-form` + `zod` + `@hookform/resolvers` (for `Form`), and `@tanstack/react-table` (for `DataTable`) are the only three points where this system reached outside `radix-ui` and Tailwind itself — each added on an explicit instruction naming the package, after the zero-new-dependency alternative was evaluated and rejected in writing.
- **Derive state from structure, don't require a flag a consumer can forget to set.** `Breadcrumb`'s current-page segment is the last array item, not an explicit `current` prop. `Stepper`'s `upcoming`/`current`/`completed` states come from comparing array position to `currentStep`, not a per-step flag. This pattern was established with `Breadcrumb` and deliberately reused by `Stepper`.
- **Status (operational state) and Risk (severity) are distinguished by component form, not color alone.** `Badge` is a solid pill; `RiskIndicator` is an outlined chip with a dot meter. Krane Yellow (the brand primary) is deliberately withheld from anywhere it could be mistaken for "Warning" or "Pending."
- **Audit before implementing.** Every non-trivial component is preceded by a `<COMPONENT>_FOUNDATION.md` document comparing the planned API against named reference systems (Material UI, Atlassian Atlaskit, Shopify Polaris, GitHub Primer) before a line of implementation code is written. See [Foundations](#foundations) below for how this differs from the design-token foundations.
- **Verify, don't assume.** Claims like "dark mode works," "the dropdown fits on screen," or "the table doesn't force horizontal scroll" are backed by Playwright runs against the actual rendered page (computed styles, bounding boxes, `document.elementFromPoint`) — not inferred from reading class names. `SHELL_RESPONSIVENESS_AUDIT.md` is the clearest example: every finding cites a specific pixel measurement or DOM query, not a visual impression.

## Architecture

```
app/
  globals.css          # all design tokens (the single source of truth)
  layout.tsx            # root layout — font loading, ThemeProvider, TooltipProvider, Toaster
  page.tsx               # entry point — links to every foundation and every demo
  fonts/                 # self-hosted Geist (variable + italic), via next/font/local
  demo/<component>/      # one route per component/pattern — see Demo Routes

components/
  ui/                     # framework-agnostic primitives — no app-shell knowledge
  shell/                  # Krane-specific navigation chrome — composes ui/ primitives
  theme-provider.tsx       # useSyncExternalStore-backed theme state (light/dark/system)
  theme-toggle.tsx          # DropdownMenu-based toggle, built on theme-provider

hooks/
  use-toast.ts            # imperative toast() API — an external store, since Radix's
                            # Toast primitive is declarative-only

lib/
  utils.ts                 # cn() — clsx + a custom extendTailwindMerge config that
                             # understands Krane's text-{role} typography scale
```

**Layering**, bottom to top:

1. **Tokens** (`app/globals.css`) — colors, typography, motion, shadow, radius, border, z-index. Nothing above this layer hardcodes a raw color or pixel value where a token exists.
2. **`components/ui/`** — primitives that know nothing about Krane's navigation chrome, sidebar, or brand layout. `Button`, `Input`, `DataTable`, etc. would be equally at home in any product built on these tokens.
3. **`components/shell/`** — `AppShell` (layout + collapse-state context), `AppHeader`, `Sidebar`, `OrganizationSwitcher`, `ProjectSwitcher`, `AccountMenu`. These compose `components/ui/` primitives (`AccountMenu` is `Avatar` + `DropdownMenu`; `Sidebar`'s nav groups are Radix `Collapsible`) but are themselves Krane-specific — fixed navy brand surface, fixed nav structure.
4. **`app/demo/`** — one route per component, each demonstrating real composed usage against realistic procurement data (purchase orders, vendors, submittals) rather than `"Lorem ipsum"` placeholders.

`AppShell` exposes a `useShell()` context (`collapsed`/`setCollapsed`, `mobileMenuOpen`/`setMobileMenuOpen`) that `Sidebar` and `AppHeader` both read — the only piece of cross-component shared state in the system, and it's scoped narrowly to navigation visibility, not a general state-management layer.

## Foundations

Two senses of "foundation" exist in this repo, named separately on purpose:

**Design-token foundations** (`app/globals.css`, documented in `DESIGN_SYSTEM_FOUNDATION.md`, `MOTION_FOUNDATION.md`, `Z_INDEX_FOUNDATION.md`):

| Foundation | State |
|---|---|
| Color | Brand, Status (success/warning/destructive/info/pending), Risk (4 severity tiers), Chart (5 hue-mapped series), Shell (fixed navy, mode-independent) — all in OKLCH color space. |
| Typography | Geist, self-hosted via `next/font/local` (no `next/font/google` dependency). A six-role scale — `display`/`heading`/`title`/`body`/`caption`/`label` — each bundling size, line-height, weight, and letter-spacing as one Tailwind v4 `--text-{role}` token rather than four separate utilities. |
| Radius | One base value (`--radius: 0.625rem`), six derived tiers (`sm` through `4xl`) via `calc()`. |
| Border | `--border` (general dividers) vs. `--input` (form-control outlines) — kept as a real distinction, not collapsed into one token. |
| Shadow / Elevation | `--shadow-sm/md/lg`, mode-aware (dark-mode opacity is 4–5× light mode's, not the same value rendered on a dark background). |
| Motion | `--duration-fast/normal/slow` (150/200/300ms), `--ease-in/out/in-out/standard`. Wired into both `--tw-duration` and `--default-transition-duration` so Tailwind's `animate-in`/`animate-out` utilities and bare `transition-*` utilities can't silently drift apart. |
| Z-index | Seven tokens — `z-content/sticky/dropdown/popover/tooltip/dialog/toast` (0/10/50/50/60/70/100) — replacing two real layering defects found during the audit (Tooltip and Dialog each previously shared a tier with unrelated floating chrome). An eighth, `z-command-palette` (80), is documented in `Z_INDEX_FOUNDATION.md` but deliberately *not* added to `globals.css` yet — no component exists to consume it. |
| Spacing | **Not yet formalized.** Every gap/padding value in every component today is a literal Tailwind utility (`gap-1.5`, `p-2`, `px-3`) chosen ad hoc — consistent enough that nothing looks wrong, but with no named scale to check future work against. Flagged repeatedly, first on the Roadmap below. |

**Component foundation docs** — one `<COMPONENT>_FOUNDATION.md` per non-trivial component (`BREADCRUMB_FOUNDATION.md`, `STEPPER_FOUNDATION.md`, `DATATABLE_ADVANCED_FOUNDATION.md`, `FORM_FOUNDATION.md`, etc.), each a sourced comparison against named reference systems, written *before* implementation. `COMPONENT_STATUS.md` and `DESIGN_SYSTEM_PROGRESS.md` are the running, repo-wide trackers; `SHELL_RESPONSIVENESS_AUDIT.md` is a point-in-time audit (now resolved) of the application shell specifically at three viewport widths.

## Components

**`components/ui/`** (26):

| Category | Components |
|---|---|
| Field primitives | `Input`, `Label`, `Textarea`, `Select`, `Combobox`, `RadioGroup`, `Switch` |
| Validation | `Form` (`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`), on `react-hook-form` + `zod` |
| Feedback | `Alert`, `Toast` + `Toaster`, `Skeleton` |
| Overlays | `Dialog`, `Popover`, `DropdownMenu`, `Tooltip` |
| Data display | `Table`, `DataTable` (sorting, global search, bulk actions, numbered + Load More pagination, row actions, per-column filters, sticky pinned columns, dual empty states, a Saved Views serialization contract), `Badge`, `RiskIndicator`, `Avatar` |
| Navigation & structure | `Tabs`, `Breadcrumb`, `Stepper` (interactive wizard layer + standalone read-only progress-tracker layer), `Button`, `Checkbox` |

**`components/shell/`** (6): `AppShell`, `AppHeader`, `Sidebar` (icon-rail collapse at `md`+, fixed-position overlay drawer below it), `OrganizationSwitcher`, `ProjectSwitcher`, `AccountMenu`.

**Support**: `components/theme-provider.tsx` + `theme-toggle.tsx` (light/dark/system, no-flash, no `next-themes` dependency), `hooks/use-toast.ts`, `lib/utils.ts`.

See `COMPONENT_STATUS.md` for the authoritative, per-component breakdown of what's built vs. deferred.

## Demo Routes

All 27 routes below are linked from `/` (`app/page.tsx`) and verified against a live render, not just a successful build:

| Route | Demonstrates |
|---|---|
| `/demo` | Badge and RiskIndicator — operational state vs. severity |
| `/demo/checkbox` | Single, table-row selection, tri-state bulk-select header |
| `/demo/popover` | Basic, action, and information popovers |
| `/demo/input` | Sizes, icon composition, validation states, password toggle |
| `/demo/label` | Required/disabled/read-only states, RadioGroup's `aria-labelledby` pattern |
| `/demo/textarea` | Status states, resize behavior, mixed-form example |
| `/demo/select` | Grouped CSI divisions, sizes, disabled vs. read-only |
| `/demo/combobox` | Searchable vendor/manufacturer/user/project/material pickers |
| `/demo/radio-group` | Layouts, group labeling, status states |
| `/demo/switch` | States, status values |
| `/demo/form` | Schema-validated PO creation form composing every field primitive |
| `/demo/alert` | Variants, dismissible behavior, actions |
| `/demo/theme` | Light/Dark/System, no-flash, live OS-preference tracking |
| `/demo/avatar` | Fallback behavior, sizes, status dot, square non-human entities |
| `/demo/account-menu` | Identity, actions, organization context, sign out |
| `/demo/dropdown-menu` | Items, checkboxes, radio groups, nested submenus |
| `/demo/dialog` | Confirmations, destructive actions, scrollable content |
| `/demo/toast` | Stacked, dismissible notifications, four variants |
| `/demo/tooltip` | Hover/focus explanations |
| `/demo/table` | Sticky headers, density modes, selection-aware rows |
| `/demo/data-table` | Sorting, search, bulk actions, column visibility |
| `/demo/data-table-advanced` | Pagination, row actions, filters, sticky columns, dual empty states — across Procurement Log, Vendors, and Submittals tables |
| `/demo/app-shell` | The full navigation shell — sidebar, header, switchers, collapse, mobile drawer |
| `/demo/button` | Variants, sizes, `asChild` composition, icon placement |
| `/demo/tabs` | Underline indicator, disabled tabs, activation modes |
| `/demo/breadcrumb` | Location-based trail, auto-derived current-page segment |
| `/demo/stepper` | Interactive wizard and read-only tracker, mobile label-hiding |

## Installation

**Requirements**: Node.js 20+ (the installed `@types/node` targets Node 20; no `.nvmrc` is committed, so this isn't pinned to an exact patch version), npm.

```bash
git clone https://github.com/SathisUdhayakumar/krane-design-system-v1.git
cd krane-design-system-v1
npm install
```

No environment variables or external services are required — this is a static/client-rendered demo app with no backend.

## Running Locally

```bash
npm run dev      # starts the Next.js dev server at http://localhost:3000
npm run build    # production build — also the fastest way to typecheck every route
npm run start    # serve the production build
npm run lint      # ESLint (flat config, eslint-config-next)
```

There is no separate `npm run typecheck` script; `npx tsc --noEmit` is used directly during development, and `npm run build` will fail on type errors regardless. There is no automated test suite or visual-regression tooling today — every behavioral claim in this repo's documentation was verified manually via Playwright during development, not via CI (`COMPONENT_STATUS.md` §4 names this explicitly as a known gap).

## Design Token Strategy

Every token family in `app/globals.css` follows the same two-layer pattern:

```css
:root {
  --primary: oklch(0.883 0.181 94.426);   /* layer 1: raw, mode-dependent value */
}
.dark {
  --primary: oklch(0.883 0.181 94.426);   /* same token, dark-mode value */
}
@theme inline {
  --color-primary: var(--primary);         /* layer 2: stable Tailwind-facing name */
}
```

The raw value lives in `:root`/`.dark` and can differ per mode; the `@theme inline` registration is what makes `bg-primary`/`text-primary`/etc. exist as Tailwind utilities, and it never needs two definitions — `var(--primary)` resolves differently depending on which mode's `:root`/`.dark` block is active. Mode-independent families (motion, z-index, radius, typography) skip the two-layer split and are registered directly in `@theme inline` as literal values, since they have nothing to vary by mode.

**Color space**: every color token is OKLCH, not HSL or hex — chosen for perceptually-uniform lightness across hues, which matters specifically for this system's Status/Risk palettes (so "warning yellow" and "destructive red" read as comparably salient, not accidentally mismatched in perceived brightness).

**Confirmed empirically, not assumed from documentation**: every new Tailwind v4 theme namespace used here (`--text-*`, `--shadow-*`, `--duration-*`, `--ease-*`, `--z-*`) was checked against actual compiled CSS output during development — this caught real surprises (utilities not appearing until something actually referenced them; `tailwind-merge`'s default config not recognizing Krane's custom `text-{role}` scale, silently dropping `text-label` when combined with a color utility, fixed via a custom `extendTailwindMerge` config in `lib/utils.ts`).

**Status vs. Risk, encoded at the token level**: Status tokens (`success`/`warning`/`destructive`/`info`/`pending`) and Risk tokens (`risk-low`/`risk-medium`/`risk-high`/`risk-critical`) are separate families even though some hues are visually close — `Badge` (Status) and `RiskIndicator` (Risk) are deliberately different *shapes* (solid pill vs. outlined chip + dot meter) so the two concepts never read as interchangeable in a dense table.

## Roadmap

Tracked authoritatively in `COMPONENT_STATUS.md`; summarized here as of `v1.0.0-rc1`.

**Not started** (no spec, no code, unless noted):

- `Card`, `Progress` — deliberately not built speculatively; this system's own history shows building general chrome ahead of an actual consuming requirement is how scope creep has happened before.
- `Command Palette` — z-index tier (`z-command-palette`, 80) reserved in `Z_INDEX_FOUNDATION.md`, not yet added to `globals.css`.
- `DataTable`: `DataTableColumnHeader` extraction, CSV export, Saved Views as an actual feature (naming/persisting/switching views — only the serialization contract exists today).
- Notification-panel content and language i18n — the bell and language selector exist visually in `AppHeader`, wired to nothing.

**Recommended order** (sequencing guidance, not a standing work order — nothing here should be built without a fresh, explicit go-ahead):

1. **Spacing token formalization** — a deliberate backfill against every component shipped without one so far.
2. **`Card`, `Progress`** — only once a real consuming module names a concrete need.
3. **DataTable virtualization** (would require the `@tanstack/react-virtual` dependency, not yet installed), the remaining DataTable items above, Command Palette, notification-panel content, i18n — deferred as a group until a real requirement forces the question.

Mobile/responsive behavior is resolved for the App Shell and everything it composes (`Sidebar`, `AppHeader`, `OrganizationSwitcher`/`ProjectSwitcher`, `AccountMenu`, `Breadcrumb`, `DataTable`) — see `SHELL_RESPONSIVENESS_AUDIT.md`. It remains unaddressed for every component outside that pass's scope (`Combobox`, `Form`, standalone `Table`, etc.).

## Versioning

This repository uses annotated/lightweight git tags, not a published npm version. The current tag is **`v1.0.0-rc1`** — a release-candidate marker indicating the full first pass (every component in [Components](#components) above, plus the application shell and its responsive behavior) is complete and demoed, but has not yet been declared a stable `v1.0.0`.

`package.json`'s own `"version": "0.1.0"` is the unmodified Create Next App scaffold default and is **not** kept in sync with the git tag today — the git tag is the authoritative version marker for this repository until a publishing pipeline exists to make `package.json` meaningful.

No CHANGELOG exists yet. `COMPONENT_STATUS.md` and `DESIGN_SYSTEM_PROGRESS.md` serve as the closest equivalent — both are living documents updated after each component or audit pass, not point-in-time release notes.
