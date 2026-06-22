# Krane Design System — Breadcrumb Foundation

Audit + specification, now implemented at `components/ui/breadcrumb.tsx` (`Breadcrumb`), exactly as recommended — no Radix primitive, a single flat `items` array, the current-page segment derived from array position. Demoed at `/demo/breadcrumb` and composed directly into `/demo/app-shell`'s real Submittals page, alongside the existing organization/project switcher chain this document was careful to distinguish from it.

One robustness detail resolved during implementation, not anticipated in this document's own API sketch: the sketch's `href?` being optional on every item (not just the last one) left an unhandled edge case — a non-final item missing `href` would, with a naive implementation, either crash or render a dead `href="#"` link. Resolved by rendering any item without an `href` as plain, non-interactive text regardless of position, while keeping `aria-current="page"` reserved strictly for the actual last item — preserving this document's position-derived rule exactly while closing the gap its own sketch left open. Verified via Playwright: zero anchors anywhere carry `aria-current="page"`, and both the global switcher chain and the page-level breadcrumb render correctly together in light and dark mode. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail.

## Audit: existing codebase state

- **No `Breadcrumb` file exists anywhere.** Confirmed by direct search — no current component, no hand-rolled stand-in.
- **No Radix primitive exists for this, and none is needed.** Confirmed directly against the `radix-ui` bundle's type definitions — no `Breadcrumb` export anywhere in it. This isn't a gap; breadcrumbs are plain semantic HTML (`nav` → `ol` → `li` → link) with no focus-trap, positioning, or open/closed state to manage — the same "no headless primitive needed" position `Textarea`/`Label`/`Skeleton`/`Badge`/`RiskIndicator` are each already in. Zero new dependency, confirmed before writing a single line of spec below.
- **`AppHeader` already has a chevron-separated chain that looks like a breadcrumb but isn't one — a real distinction this document has to draw, not gloss over.** `app-header.tsx`'s `organizationSwitcher`/`projectSwitcher` slots are joined by a literal `<ChevronRight className="size-3.5 shrink-0 text-sidebar-foreground/60" aria-hidden="true" />` (confirmed directly in the file). Visually, this is breadcrumb-shaped. Functionally, it isn't one: each segment is a `DropdownMenu`-backed *switcher* (pick a different org/project at the same level), not a link to a parent page. Breadcrumb answers "where am I in this page's hierarchy, and how do I go up" — the org/project chain answers "what context am I currently working in, and can I swap it." Both can legitimately appear on the same page (the switcher chain in the global header, a page-level breadcrumb trail above a page title in the content area) without conflicting — addressed directly in "Composition with the existing switcher chain," below, rather than left as an unexamined visual coincidence.
- **The separator glyph is already decided by precedent.** `ChevronRight`, already used for exactly this "sequence of location segments" purpose in `AppHeader`. Breadcrumb reuses it rather than introducing a second separator convention (`/`, `›`, or any other glyph) for what is visually the same kind of chain.
- **Typography precedent already exists and is already muted/secondary**: `text-caption text-muted-foreground` is the established small/de-emphasized text role, already used for exactly this register of content (`FormDescription`, `Combobox`'s empty state). Breadcrumb reuses it directly — confirmed this matches the cross-system guidance found in comparison research below (breadcrumbs should never visually compete with a page's own title), not asserted from instinct alone.
- **`Sidebar`'s existing `<nav aria-label="Primary">` confirms the landmark-naming convention this system already follows** when more than one `nav` exists on a page. Breadcrumb's own `<nav>` needs its own distinguishing name — addressed in Accessibility, below — not a new pattern to invent.
- **No token gap.** Nothing here needs anything beyond `--muted-foreground`/`--foreground` and the existing `text-caption` role.

## Purpose

Tells a user where the current page sits in Krane's actual entity hierarchy — Organization → Project → record, or record → sub-record — and lets them jump to any ancestor in one click. A **location-based** breadcrumb, specifically: it reflects the fixed structure of the data (where this page *lives*), not the user's session history (the path they happened to click through to get here) and not applied filters/sort criteria (a different, unrelated pattern sometimes also called "breadcrumbs" in UX literature). This distinction — confirmed via comparison research, not assumed — is the single most important scoping decision in this document: Krane's procurement domain has a real, fixed containment hierarchy (a submittal belongs to a project belongs to an organization), which is exactly what location-based breadcrumbs are for, and exactly what the other two breadcrumb types are not.

## Composition with the existing switcher chain

Deliberately separate, not merged, the same posture `ACCOUNT_MENU_FOUNDATION.md` already took toward `OrganizationSwitcher`/`ThemeToggle`. The org/project chain in `AppHeader` is global, persistent chrome — it's on every page, regardless of how deep the current page is in any hierarchy, and its job is letting a user *change* context. `Breadcrumb` is page-level content, appears only on pages that are actually nested under something, and its job is showing *where this specific page is* and letting a user go *up*, not *sideways*. A real page can show both at once without redundancy: the global header's "Brigade Group / Brigade Homes" switcher chain stays constant while a page-level breadcrumb underneath might read "Submittals / SUB-301" — different altitudes of the same overall location, not a duplicated control.

## Visual specification

`<nav>` → `<ol>` (flex row) → `<li>` per segment → `ChevronRight` (`size-3.5`, `text-muted-foreground/60`, `aria-hidden`) between segments, no separator after the last one. Each non-final segment is a real link, `text-caption text-muted-foreground` with an `underline-offset-4 hover:underline` treatment on hover (matching `Button`'s own `link` variant's hover behavior, not inventing a new link style). The final segment — the current page — renders as plain text, `text-foreground` (not muted, since unlike the links around it, this is the one thing on the trail the user doesn't need de-emphasized — it's confirming where they already are) and is never a link, never a hover target, never `aria-hidden`'s opposite-numbered concern. Sits directly above a page's own title, smaller and quieter than it by construction (the `text-caption` role itself, not a one-off override) — the cross-system guidance found below ("breadcrumbs should never compete with primary elements like page titles") is structural here, not a styling reminder added after the fact.

## Structure and the current-page crumb — an explicit, deliberate API choice

GitHub Primer's own implementation requires the consumer to manually mark the last item with a `selected` prop, which then produces `aria-current="page"`. This is a real, avoidable footgun: forget the flag on the actual last item (or set it on the wrong one after a list is reordered or filtered) and the current page silently renders as a clickable link to itself with no `aria-current` at all — wrong both visually and for assistive tech, and the kind of mistake that's invisible until someone audits it. Krane's `Breadcrumb` instead **derives the current-page treatment automatically from array position**: the last item in the supplied list is always rendered as the non-interactive, `aria-current="page"` segment; every item before it is always a link. One less flag to remember, one less way to get it wrong — a deliberate improvement over the reference implementation, not a simplification that loses anything Primer's own version actually needs.

## Collapse / truncation for long trails — named, not built

Two real, converging precedents exist: Material UI's `maxItems`/`itemsBeforeCollapse`/`itemsAfterCollapse`/`expandText`, and Atlaskit's near-identical `maxItems` (default 8) with an `isExpanded`/`onExpand` pair, both collapsing the middle of a long trail behind a single ellipsis item. **Worth a specific caution before ever building this**: MUI's own issue tracker has a real, confirmed report of the collapsed ellipsis being unreachable via keyboard — a concrete demonstration that "collapse the middle into an ellipsis" is easy to ship with a real accessibility regression if the ellipsis isn't a genuine, focusable, keyboard-operable control. **Not built for v1** — no named Krane use case today has a trail deep enough to need it (three or four segments at most: Organization/Project/record, or record/sub-record), and inventing collapse logic ahead of an actual long-trail case would repeat the exact mistake this project's own roadmap sections have flagged before. Named here, with the specific failure mode already on record, so a future contributor facing a genuinely long trail doesn't have to rediscover MUI's bug the hard way.

## A real, considered alternative explicitly not adopted: Polaris's `backAction`

Shopify Polaris removed multi-level breadcrumbs from its `Page` component entirely, replacing them with a single `backAction` (one link back, not a full ancestor trail) — a deliberate simplification, not an oversight, presumably because most of Polaris's own admin-surface pages don't sit more than one level deep. **Not adopted for Krane**: the procurement domain's actual entity hierarchy is genuinely multi-level (Organization → Project → Submittal, or Vendor → Contract, both real, named below), and collapsing that down to "just show one step back" would lose real information a full trail correctly preserves — going from a submittal detail page straight back to the organization level, not just back one step, is a real, common navigation a single `backAction` can't serve. Named here as the considered alternative it is, not dismissed without reading why Polaris made the call it did.

## Accessibility

- **`<nav aria-label="Breadcrumbs">`** — confirmed directly from GitHub Primer's own implementation, and consistent with this system's own existing convention (`Sidebar`'s `<nav aria-label="Primary">`) for distinguishing multiple navigation landmarks on one page.
- **Real `<ol>`/`<li>` structure**, not a `<div>` chain with visual-only spacing — confirmed as Primer's actual DOM shape, and the correct semantic choice regardless (an ordered sequence of locations is genuinely an ordered list).
- **`aria-current="page"` on the final segment, derived automatically, never an opt-in flag** — the deliberate improvement over Primer's own API, above.
- **The separator (`ChevronRight`) is `aria-hidden`** — decorative reinforcement of the `<li>` boundary the list structure already conveys, the same treatment every other status/decorative icon in this system already gets.
- **Link text matches the destination page's own title** — confirmed as Primer's explicit content guideline, directly adopted: a breadcrumb segment reading "Submittals" should link to a page whose own `<h1>` says "Submittals," not a paraphrase: if the full title would be unreasonably long for the trail, shorten it, but keep it unique and recognizable rather than generic.

## API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped.

```tsx
<Breadcrumb
  items={[
    { label: "Brigade Homes", href: "/projects/brigade-homes" },
    { label: "Submittals", href: "/projects/brigade-homes/submittals" },
    { label: "SUB-301" }, // last item — no href, rendered as the current page automatically
  ]}
/>
```

A single `items` array (`{ label, href? }[]`), not a compound `Breadcrumb`/`BreadcrumbItem`/`BreadcrumbSeparator`/`BreadcrumbLink`/`BreadcrumbPage` family of sub-components. This is a deliberate, narrower choice: unlike `DropdownMenu` or `Dialog`, breadcrumb segments carry no internal state, no per-item interactivity beyond "is this a link," and no slot a consumer would ever need to customize independently — a flat data array is simpler to build pages with and has nothing missing relative to what any named Krane use case actually needs. The final item's omitted `href` is what marks it as the current page (consistent with "derived from position," above) — supplying one anyway is harmless but unnecessary, since the component will not render a link for the last position regardless.

## Enterprise use cases

- **Organization → Project → Submittals list** — the most direct, already-modeled hierarchy (the same one `OrganizationSwitcher`/`ProjectSwitcher` already represent at the global-context level), shown here as page-level static trail rather than an interactive switcher.
- **Submittals → SUB-301 (Structural steel shop drawings)** — a record-detail page reached by drilling into a list, the single most common breadcrumb shape in this entire domain.
- **Vendors → Sterling Rebar Co. → Contracts** — a genuine three-level trail, the concrete case Polaris's single-`backAction` simplification (above) would actually lose information on.
- **Settings → Notifications** — once a real settings surface exists (`AccountMenu`'s own "Settings" row currently has nowhere to land); breadcrumb is exactly what that page's own header would use the moment it's built.
- **A future `DataTable` row → detail page drilldown** — `DataTable` doesn't have row-click-to-detail navigation today, but if it gains one, the detail page it navigates to is a real, concrete future consumer ("Purchase Orders → PO-10231"), named here so it isn't invented blind later.

## Demo requirements

- A two-level trail and a three-level trail, both with real Krane content (Organization/Project, and Vendor/Contract), not generic placeholder labels.
- The current-page segment shown rendering as plain, non-linked text even though it's the last array entry with no special prop set — proving the position-derived behavior is real, not just documented.
- A direct side-by-side with `AppHeader`'s existing org/project switcher chain (composed into a demo page that shows both at once), making the "these are different, coexisting things" distinction in "Composition with the existing switcher chain" visually self-evident rather than only asserted in prose.
- Keyboard and screen-reader verification of the landmark name and `aria-current`, the same Playwright-confirmed bar every interactive component in this system has been held to since `Alert`.
- Dark mode, confirmed visually, not assumed.

---

## Comparison: Material Design, Atlassian, Polaris, GitHub Primer, Linear

**Material Design (MUI)** — `maxItems`/`itemsBeforeCollapse`/`itemsAfterCollapse`/`expandText` for collapsing long trails behind an ellipsis. [(MUI — Breadcrumbs)](https://mui.com/material-ui/react-breadcrumbs/) **Verdict**: the collapse *shape* is named under "Collapse / truncation," above, as a real, deferred pattern — but MUI's own issue tracker confirms a real keyboard-accessibility bug in exactly this feature, the single most important caution this comparison surfaced, not just a feature to maybe copy later.

**Atlassian (Atlaskit)** — near-identical collapse behavior (`maxItems`, default 8) with `isExpanded`/`onExpand`. [(Atlaskit — Breadcrumbs)](https://atlaskit.atlassian.com/packages/core/breadcrumbs) **Verdict**: the default-8 threshold is a useful, concrete reference number for whenever collapse is actually built — two independent systems converging on a similar number is worth more than either alone, though still not a v1 requirement here.

**Shopify Polaris** — replaced multi-level breadcrumbs with a single `backAction` in its `Page` component. [(Polaris — Page)](https://polaris-react.shopify.com/components/layout-and-structure/page) **Verdict**: the real, considered alternative explicitly not adopted, above — Krane's actual multi-level entity hierarchy is the specific reason this simplification doesn't fit here, not a default rejection of "the way Polaris does things."

**GitHub Primer** — `<nav aria-label="Breadcrumbs">` → `<ol>` → `<li>` → link, `aria-current="page"` via an explicit `selected` prop on the last item, and explicit link-text-matches-destination-title guidance. [(Primer — Breadcrumbs)](https://primer.style/components/breadcrumbs/) [(Primer — Breadcrumbs accessibility)](https://primer.style/product/components/breadcrumbs/accessibility/) **Verdict**: the structural and landmark-naming backbone of this entire document — adopted directly — with one deliberate departure: Krane derives the current-page treatment from array position instead of requiring Primer's own explicit, forgettable `selected` flag.

**Linear** — confirmed (via a real changelog bug fix concerning a deleted project's name lingering in the trail) to use breadcrumb-style navigation for its own project hierarchy, though detailed structural specifics weren't surfaced by this research. **Verdict**: the bug itself is a useful, generalizable caution worth carrying forward independent of Linear's exact implementation — a breadcrumb trail that caches a now-stale label (a renamed or deleted ancestor) is a real, easy-to-introduce bug class if labels are ever cached rather than read live from current data; Krane's own `items` prop is a per-render array supplied fresh by the consumer, not something this component caches itself, which avoids the class of bug Linear actually hit — but the consumer-side discipline of not caching stale ancestor labels is worth naming, not just inheriting for free.

---

## Existing capabilities

The `ChevronRight` separator convention, the `text-caption text-muted-foreground` typography role, and the `aria-label`-for-landmark-disambiguation pattern (`Sidebar`'s own `aria-label="Primary"`) — all three already exist and are reused directly, not reinvented. No new token, no new dependency.

## Missing capabilities

The component itself, in any form. A drawn boundary against the org/project switcher chain being mistaken for the same thing Breadcrumb is (didn't exist before this document, and the closest miscategorization risk any prior foundation doc in this project has had, given how visually similar the two patterns are). A stated, deliberate choice of breadcrumb *type* (location-based, not path- or attribute-based) — nothing in this codebase previously had to make that distinction explicit.

## Recommended architecture

A single component, no Radix primitive, no compound sub-component family — `<Breadcrumb items={[{ label, href? }]} />`, real `<nav aria-label="Breadcrumbs"><ol>…</ol></nav>` markup, `ChevronRight` separators reused from `AppHeader`'s existing convention, `text-caption text-muted-foreground` links and a `text-foreground` non-linked final segment, both derived automatically from array position rather than an explicit per-item flag. No collapse/truncation logic in v1. No `backAction`-style single-link simplification — Krane's real multi-level hierarchy doesn't fit it.

## Must-have vs. Nice-to-have

**Must-have**: the component itself; the `<nav>`/`<ol>`/`<li>` semantic structure and `aria-label="Breadcrumbs"` landmark name; the position-derived current-page treatment (`aria-current="page"`, non-link) — getting this wrong (an explicit, forgettable flag instead) is a real, citable footgun this document found specifically to avoid; the explicit drawn distinction from `AppHeader`'s switcher chain, so the two are never accidentally merged or mistaken for each other at a future call site.

**Nice-to-have**: collapse/truncation behavior for long trails (Material UI's/Atlaskit's converging pattern) — real, no concrete Krane trail is long enough to need it yet, and MUI's own confirmed keyboard-accessibility bug means this should be built carefully and deliberately whenever it is, not bolted on quickly; any path-based "recently visited" trail or attribute/filter-summary breadcrumb — both real patterns elsewhere, neither the type of breadcrumb Krane's domain actually needs.

## Final recommendation for Krane

Build the single flat-array `Breadcrumb` component described above — no Radix primitive, no new dependency, no compound sub-component family, reusing `ChevronRight` and `text-caption` exactly as both already exist in this system. Keep it strictly location-based, and keep it structurally distinct from `AppHeader`'s org/project switcher chain rather than merging the two just because they look similar — they answer different questions, on different parts of the page, for different reasons. Defer collapse/truncation until a real trail is long enough to need it, and when that day comes, build the ellipsis as a genuine focusable control from the start — Material UI's own issue tracker already shows what happens when that's an afterthought.
