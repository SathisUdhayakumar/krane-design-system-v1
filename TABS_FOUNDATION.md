# Krane Design System — Tabs Foundation

Audit + specification, now implemented at `components/ui/tabs.tsx` (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`), built directly on `@radix-ui/react-tabs` exactly as recommended, demoed at `/demo/tabs`. Tabs had been named in every "components not started" list since the original "Enterprise SaaS Components Required for Krane" inventory.

Both real architectural decisions this document resolved were implemented exactly as specified, then verified empirically rather than assumed correct: the explicit `data-[state=active]:` styling (not the unconfirmed `data-active:` shorthand) was confirmed via Playwright to produce a `border-bottom-color` exactly matching `--primary` once the transition settles; `activationMode` was confirmed to pass straight through to Radix unmodified — `automatic` activates a tab the instant it receives arrow-key focus, `manual` requires an explicit `Enter` first, both demoed side by side. The disabled-tab example was confirmed genuinely unreachable via arrow-key navigation (skipped, not just dimmed), not just visually styled. No overflow handling, no animated indicator, `horizontal` orientation only — all three deferred exactly as recommended. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail.

## Audit: existing codebase state

- **No `Tabs` file exists anywhere.** Confirmed by direct search — no current component, no hand-rolled stand-in anywhere in any demo (unlike Avatar's literal `<span>` or Account Menu's prior gap, nothing in this codebase has ever even approximated tabbed navigation).
- **`@radix-ui/react-tabs` is already installed**, confirmed directly in the `radix-ui` bundle's type definitions (`export { reactTabs as Tabs }`), exposing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` (`Root`/`List`/`Trigger`/`Content`). Zero new dependency — the same position every Radix-backed component in this system has shipped from.
- **Radix's actual API surface has two real decisions this document has to make, not just a structure to wrap**: `orientation` (`horizontal`/`vertical`, changing arrow-key navigation direction via the underlying `RovingFocusGroup`) and `activationMode` (`automatic`/`manual` — confirmed directly in the package's own type definitions, not assumed). Both are addressed below, not left to be discovered mid-implementation.
- **Radix sets `data-state="active"|"inactive"`** on `TabsTrigger`/`TabsContent` (confirmed directly in `@radix-ui/react-tabs`'s compiled source) — a different vocabulary from the `data-state="open"|"closed"` every floating-UI primitive in this system (`Dialog`/`Popover`/`DropdownMenu`/`Tooltip`/`Toast`) already uses.
- **A real, verified nuance in how this connects to the existing `data-open:`/`data-closed:` animation convention.** Every floating-UI primitive's content animates via classes like `data-open:animate-in data-closed:animate-out` (confirmed working — not assumed — by inspecting the actual compiled CSS in `.next/static/chunks/*.css`: Tailwind v4 compiles `data-open:` to a rule matching *either* `[data-state=open]` *or* a bare `[data-open]` attribute, a documented convenience specifically for that named pair). **This does not automatically generalize to `active`/`inactive`** — Tailwind only compiles a utility for a class that's actually referenced somewhere in scanned source, and no special-cased `data-active:`/`data-inactive:` pairing for an arbitrary `data-state` value is guaranteed the way `open`/`closed` empirically is. The safe, verified-correct choice for Tabs' own active-indicator styling is the explicit `data-[state=active]:` arbitrary-variant syntax, not an assumed `data-active:` shorthand — confirmed by testing both forms directly against the compiled stylesheet rather than inferred from the `open`/`closed` precedent.
- **`Sidebar`'s existing `data-active` convention is a different mechanism, not a precedent to extend.** `SidebarItem` sets a literal boolean `data-active="true"` attribute itself (not Radix-derived `data-state`), styled via `data-active:bg-sidebar-accent`. It's the closest existing "this is the current selection" visual language in this system (worth reusing in spirit for Tabs' own active-indicator color), but the attribute mechanism underneath is unrelated to what Radix Tabs actually emits.
- **No token gap.** An active-tab indicator reusing `--primary` (the same brand-yellow underline/text treatment already used for focus rings and primary actions) needs nothing new.

## Purpose

Lets a user switch between fully separate views or sections of content within one page, where each view is distinct (not the same data shown a different way — see "Tabs vs. segmented control," below). The first real navigation-within-a-page primitive in this system; everything before it (`DropdownMenu`, `Select`, `Combobox`) is either a transient overlay or a single-value picker, not a way to switch what's rendered in the main content area.

## Tabs vs. segmented control — a real distinction this document draws deliberately

Worth stating explicitly because it's easy to blur and because it directly affects whether `DataTable`'s own `density` control (compact/default/comfortable, currently a `DropdownMenuRadioGroup`) should ever become "tabs" — it shouldn't. The distinction, confirmed during comparison research rather than asserted from instinct: **tabs** switch between views with genuinely different content (a PO detail page's "Overview" vs. "Documents" vs. "History" — nothing shared between them); a **segmented control** toggles between different presentations of the *same* underlying data (Linear's board-vs-list issue view is the canonical example — same issues, different layout). Krane has no segmented-control component today and this document does not recommend building one under the Tabs name — if a real Board/List-style need ever surfaces (most plausibly on `DataTable`), it gets its own foundation doc, not a `Tabs` variant prop.

## Visual specification

A horizontal row of `TabsTrigger`s (`TabsList`) above a single `TabsContent` region. Underline-style active indicator — a `border-b-2` that's transparent on inactive triggers and `border-primary` on the active one (`data-[state=active]:border-primary`, the verified-safe explicit syntax, not the unconfirmed `data-active:` shorthand), with `text-muted-foreground` for inactive triggers and `text-foreground` for the active one. No animated sliding indicator (Material UI's signature treatment) — a CSS-only border-color swap on the active trigger itself needs no layout measurement or JS, and nothing about Krane's enterprise procurement surfaces calls for that level of motion polish. `TabsList` sits on a `border-b border-border` baseline the whole row shares, the same border token already used for every other horizontal divider in this system (Sidebar's section separators, Select's content edges).

## Activation mode — a real per-instance decision, not a global default

Radix defaults to `automatic` (a tab activates as soon as it receives focus, including via arrow-key navigation) — correct, per WAI-ARIA's own authoring practices, **only when a tab's content is already loaded and displays without noticeable latency**. The authoring practices are explicit that automatic activation should be avoided when displaying a panel requires an operation slow enough to be noticeable, since arrowing through tabs to find the right one would otherwise trigger a cascade of unwanted work. This is not a one-time global setting for Krane's `Tabs` component — it is a property of what a *specific* instance's tabs actually do: a PO detail page where every tab's content is already part of the same page fetch (Overview/Documents/History as already-loaded sections) should stay `automatic`; a future instance where one tab triggers its own expensive, on-demand fetch (an audit-log tab hitting a slow endpoint, say) should set `activationMode="manual"` for that instance specifically. Document this as a decision the consumer makes per use, not something `Tabs` itself should hardcode either way.

## Orientation

`horizontal` is the only case with a concrete Krane use today — every named enterprise use case below is a horizontal row above content, matching every comparison system's own default. `vertical` is real (Radix supports it natively, flipping arrow-key direction via the same `RovingFocusGroup`) but is left undocumented beyond "Radix supports it if a use case appears" — no Krane surface needs a vertical tab rail today, and inventing one speculatively repeats the exact mistake this project's own roadmap sections have flagged before (building chrome ahead of an actual requirement).

## Overflow — named, not solved

Neither this document nor Radix's bare primitive handles what happens when there are more tabs than fit the available width. Two real, divergent strategies exist among the systems compared below: Polaris collapses overflow tabs into a "disclosure" (a `...` button opening a dropdown of the remaining tabs) and Material UI scrolls the tab row horizontally with prev/next buttons. **Neither is recommended for v1** — every named Krane use case today (a handful of fixed, known sections on a detail page) fits comfortably without overflow, and "desktop-first" has been this project's standing posture since the App Shell itself. Named here so a future contributor facing a real overflow case picks deliberately rather than reinventing either strategy from scratch.

## Accessibility

Confirmed via Radix's own implementation and WAI-ARIA's pattern documentation — nothing here needs Krane-specific invention, the same "trust the primitive" position every other Radix-backed component in this system is in: `TabsTrigger` carries `role="tab"`, `aria-selected`, and `aria-controls` pointing at its panel; `TabsContent` carries `role="tabpanel"` and `aria-labelledby` pointing back at its trigger — all wired automatically. Arrow-key navigation (left/right for horizontal, up/down for vertical), `Home`/`End` to jump to the first/last tab, and roving `tabindex` (one stop in the whole `TabsList` for sequential Tab-key navigation, not one stop per tab) all come from `RovingFocusGroup` with zero additional work. The one real decision left to Krane is activation mode (above) — everything else is correctly handled before a single line of Krane-specific code is written.

## API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped.

```tsx
<Tabs defaultValue="overview" activationMode="automatic">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="documents">Documents</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="documents">…</TabsContent>
  <TabsContent value="history">…</TabsContent>
</Tabs>
```

Thin wrappers over Radix's own `Root`/`List`/`Trigger`/`Content` — `value`/`defaultValue`/`onValueChange`/`orientation`/`activationMode` all pass straight through, the same shape `Dialog`/`Popover`/`DropdownMenu` already use for their own Radix-derived props. No Krane-specific props anticipated beyond visual styling — unlike `Select`/`Combobox`, Tabs has no `status`/`size` vocabulary to carry, since a tab row isn't a form field and has no invalid/success state to communicate.

## Enterprise use cases

- **A PO or submittal detail page** — Overview / Line Items / Documents / Approval History, each a genuinely distinct view of the same record, the canonical tabs case this whole document is scoped around.
- **A vendor profile page** — Overview / Contracts / Submittals / Performance History.
- **A settings-style surface** (once one exists — `AccountMenu`'s own "Settings" row currently has nowhere to land) — Profile / Notifications / Security, the same shape most reference systems use tabs for internally.
- **Not** `DataTable`'s density toggle, and not any future board/list view switch — both are segmented-control territory, named above as deliberately out of scope under the Tabs name.

## Demo requirements

- A representative multi-tab example using real Krane content (a PO detail page shape: Overview/Documents/History), not placeholder Lorem ipsum panels.
- A disabled-tab example (`TabsTrigger disabled`), confirming the disabled state is real and keyboard-skippable, not just visually dimmed.
- Both activation modes, shown side by side with a visible difference in behavior (automatic switches on arrow-key focus; manual requires an explicit `Enter`/`Space` after focusing) — proving the distinction is real, not just documented.
- Keyboard-only navigation demonstrated directly (arrow keys, `Home`/`End`), the same Playwright-verified bar every interactive component in this system has been held to since `Alert`.
- Dark mode, confirmed visually, not assumed — the same bar `AppShell`'s own theme-switcher pass set.

---

## Comparison: Radix Tabs, Atlassian, Polaris, Material Design, Linear

**Radix Tabs** — already installed, already audited above. The two real decisions it surfaces (`activationMode`, `orientation`) are both addressed directly in this document rather than left for implementation time to discover.

**Atlassian (Atlaskit)** — `Tabs`/`TabList`/`Tab`/`TabPanel`, controlled via a numeric `selected` index plus `onChange`, not a string `value`. [(Atlaskit — Tabs)](https://atlaskit.atlassian.com/packages/core/tabs) **Verdict**: Radix's string-`value` model is kept, not Atlaskit's index-based one — string values compose more naturally with URL/query-param-driven tab state (a real, plausible future need — "which tab was open" surviving a page reload), where an index would silently break if tabs were ever reordered or conditionally rendered.

**Shopify Polaris** — `fitted` (tabs stretch to fill the container width) and a disclosure pattern for tab overflow (collapsing extra tabs into a dropdown). [(Polaris — Tabs)](https://polaris-react.shopify.com/components/navigation/tabs) **Verdict**: the disclosure pattern is named under "Overflow," above, as a real, citable strategy explicitly not built for v1 — no concrete Krane case needs it yet.

**Material Design (MUI)** — `scrollable` + `scrollButtons="auto"` as its own overflow strategy (horizontal scroll, not a collapsing disclosure), `centered`, and an animated sliding `indicator`. [(MUI — Tabs)](https://mui.com/material-ui/react-tabs/) **Verdict**: the second, divergent overflow strategy confirms there's no single obvious answer to copy — supporting this document's choice to name the problem and defer it rather than pick one prematurely. The animated indicator is explicitly not adopted (Visual specification, above) — real polish, no concrete Krane need, and real implementation cost (layout measurement) this document isn't willing to spend without one.

**Linear** — no tabs primitive surfaced directly in research, but its board/list display-options toggle is the clearest real-world instance of the tabs-vs-segmented-control distinction this document leans on. [(Linear Docs — Display options)](https://linear.app/docs/display-options) **Verdict**: the single most load-bearing comparison point in this document — confirms the category boundary (§"Tabs vs. segmented control") is a real, externally-validated distinction, not a Krane-specific overthink.

---

## Existing capabilities

`@radix-ui/react-tabs`, already installed, zero new dependency. The `--primary` token and `border-border` baseline this component's visual treatment needs, both already complete. The verified, safe `data-[state=active]:` styling pattern, confirmed against the real compiled stylesheet rather than assumed from the `data-open`/`data-closed` precedent.

## Missing capabilities

The component itself, in any form — no file, no hand-rolled stand-in, nothing to migrate away from (a cleaner starting position than `Avatar`'s placeholder `<span>` or `Account Menu`'s inert trigger both were). A documented activation-mode decision framework (none existed before this document — easy to get wrong by defaulting blindly to `automatic` everywhere). A drawn boundary against segmented-control conflation (also didn't exist before this document, and the kind of thing that's cheap to state now and expensive to untangle after two or three call sites have already blurred it).

## Recommended Krane Tabs architecture

Thin wrappers over `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from `@radix-ui/react-tabs` (via the already-installed `radix-ui` bundle) — no new dependency, no Krane-specific prop vocabulary beyond what Radix already exposes, the same "wrap, don't reinvent" position `Dialog`/`Popover`/`DropdownMenu`/`Select` all shipped from. Underline-style active indicator using `--primary`, styled via the explicit `data-[state=active]:` syntax (verified safe, not the unconfirmed `data-active:` shorthand). `horizontal` orientation only, documented as v1 scope, not a missing feature. `activationMode` left as a per-instance consumer decision with clear guidance (default `automatic`, opt into `manual` only when a tab's content triggers its own expensive fetch), not a global default baked into the wrapper. No overflow handling, no `fitted`/`scrollable`/`centered` variants, no animated indicator — all four named explicitly as deferred, not overlooked.

## Must-have vs. Nice-to-have

**Must-have**: the four wrapper components; the verified `data-[state=active]:` styling approach over the unconfirmed shorthand; the activation-mode decision framework, documented before any instance gets built with the wrong default; the tabs-vs-segmented-control boundary, stated before `DataTable`'s `density` control or any future board/list need gets mistakenly built as a `Tabs` variant.

**Nice-to-have**: overflow handling (disclosure or scroll, Polaris's and MUI's two divergent strategies) — real, no concrete Krane case yet; an animated sliding indicator — real polish, real implementation cost, no concrete need; `vertical` orientation — Radix supports it natively at zero marginal cost whenever a real use case appears, so there's nothing to pre-build.

## Final recommendation for Krane

Build the four thin wrappers directly on `@radix-ui/react-tabs` — this is the lowest-risk, fewest-open-questions foundation doc in recent sequence precisely because the hard problems (ARIA wiring, keyboard navigation, roving focus) are already solved by Radix, and the two genuine Krane-specific decisions (activation mode, the segmented-control boundary) are both resolved in this document rather than left to surface mid-implementation the way `Avatar`'s `delayMs` bug or `Form`'s `RadioGroup` labelling gap did. Do not add overflow handling, an animated indicator, or a segmented-control mode under the Tabs name — none has a named Krane consumer, and the segmented-control boundary specifically is worth defending rather than blurring the first time someone reaches for "tabs" to solve a board/list toggle instead.
