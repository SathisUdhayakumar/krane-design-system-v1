# Krane Design System — Avatar Foundation

Audit + specification, now implemented at `components/ui/avatar.tsx` (`Avatar`/`AvatarImage`/`AvatarFallback`), built directly on `@radix-ui/react-avatar` exactly as recommended, demoed at `/demo/avatar`. Avatar had been named as a real, missing component since the very first audit in this project's history.

One real bug found and fixed during implementation, not anticipated by this document's own prose: §"Image / avatar / fallback behavior" recommended using `AvatarFallback`'s `delayMs` so a fast-loading image never flashes initials first — but reading Radix's actual source showed `delayMs={300}` applied unconditionally (as first implemented) would delay *every* fallback, including plain initials/icon avatars with no `AvatarImage` sibling at all, since Radix's `canRender` starts `false` whenever `delayMs` is defined at all, regardless of whether there's anything to wait for. Fixed by leaving `delayMs` a plain pass-through prop with no default — Radix's own `undefined` default renders immediately — and passing it explicitly only where an `AvatarImage` is actually present. `AvatarStack`, a presence enum, and Account Menu behavior were all explicitly out of scope per instruction and not built; the App Shell header still uses its placeholder `<span>`. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail.

## Audit: existing codebase state

- **The current stand-in, found in `app/demo/app-shell/page.tsx`'s `HeaderRightActions`**: `<span className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">S</span>` — placed last in the header's right-side icon row, after a divider, with **no click handler, no `DropdownMenu`, no interactivity of any kind**. This isn't a degraded Account Menu — there is no Account Menu in any form today, not even an inert shell.
- **A real, worth-naming inconsistency**: that stand-in uses `rounded-md` — a rounded *square* — not a circle. This was never a deliberate shape decision (no foundation doc has ever specified it; it was written ad hoc, once, as a placeholder), so it isn't treated here as a precedent to preserve. Every one of the four systems compared below defaults to a circle for human avatars; this document recommends correcting the shape when the real component ships, not perpetuating the placeholder's accident.
- **`@radix-ui/react-avatar` is already installed** — confirmed directly in the `radix-ui` bundle's type definitions: `export { reactAvatar as Avatar }`, with `Avatar`/`AvatarImage`/`AvatarFallback` all present. This is the same "wrap an already-installed primitive" position `Checkbox`/`Popover`/`DropdownMenu`/`Dialog`/`Tooltip`/`Select`/`RadioGroup`/`Switch` were each in before they shipped — zero new dependency, not a question to revisit. `AvatarImage` exposes an `onLoadingStatusChange` callback (`'idle' | 'loading' | 'loaded' | 'error'`); `AvatarFallback` takes a `delayMs` prop specifically to suppress a flash of fallback content before a fast-loading image arrives. Both are real, easy-to-get-wrong behaviors (an image-loading state machine) worth not hand-rolling — the same justification this project already used for choosing `cmdk` over a hand-rolled combobox filter.
- **`OrganizationSwitcher`/`ProjectSwitcher` are the direct, already-shipped precedent for "small element as a `DropdownMenuTrigger`'s child"**: a `size-5 rounded-sm` icon box plus a label, wrapped directly inside `DropdownMenuTrigger`, no special switcher-specific machinery beyond that. This is the exact shape an eventual Account Menu would take with `Avatar` as its trigger — confirmed reusable, not hypothetical.
- **Existing dot/circle visual language to reuse, not reinvent**: `RadioGroup`'s selected-state dot (`size-2 rounded-full`), `RiskIndicator`'s meter dots (`size-1.5 rounded-full`), `Sidebar`'s count badge (`rounded-full bg-destructive`). A status dot on `Avatar` continues this, rather than introducing a new shape language.
- **`Skeleton` is the existing loading-placeholder precedent** for the moment between "no image yet" and "image loaded or fell back" — though `FINAL_AUDIT.md` just flagged that `Skeleton` itself has no `role`/`aria-*` at all. `Avatar` would be `Skeleton`'s first real consumer in a context where that gap is concretely visible (a loading avatar, not just a generic placeholder block) rather than abstract — noted here, not fixed here; out of scope for this document.
- **No `next/image` usage exists anywhere in this codebase yet.** `AvatarImage` renders a plain `<img>` under Radix's hood; introducing `next/image` here would be a new pattern with no precedent and would need to be reconciled with Radix's own load-state tracking. Plain `<img>` is recommended below, not as a placeholder but as the considered choice — profile thumbnails are typically already-sized, already-optimized assets where `next/image`'s main benefits (responsive `srcset`, layout-shift prevention via explicit dimensions) matter least.
- **No existing token gap.** A status dot reusing the established `success`/`warning`/`destructive`/`info` family (plus `muted-foreground` for a neutral/offline-like state) needs zero new tokens — confirmed available before writing the spec below.

## Purpose

A consistent visual representation of a person or entity across Krane — a user, a vendor/organization, or a non-human agent (this system's own "KAI Agent," already named in the App Shell's sidebar nav) — with graceful, predictable degradation when no image is available or it fails to load.

## Sizes

Three named tiers, matching `Input`/`Select`'s existing `sm`/`default`/`lg` scale exactly rather than inventing a new one — a deliberate, smaller set than Atlaskit's seven or Primer's eight pixel steps (comparison, below), since Krane has no concrete use case today for that much granularity:

| Size | Dimension | Use |
|---|---|---|
| `sm` | `size-6` (24px) | Dense contexts — a comment/note attribution, an `AvatarStack`-style row (not built now; named under Enterprise use cases). |
| `default` | `size-8` (32px) | The common case — matches the current placeholder's exact pixel size, so swapping it for the real component doesn't shift the App Header's layout. |
| `lg` | `size-10` (40px) | A more prominent showing — a dedicated user/vendor detail panel, if one exists. |

## Image / avatar / fallback behavior

Built directly on `Avatar`/`AvatarImage`/`AvatarFallback` from the already-installed `radix-ui` bundle — no new dependency, no hand-rolled image-load state machine. Fallback content is the consumer's choice, not a fixed hierarchy: initials (two characters at most — comfortably legible at `sm`, matching Material UI's explicit "fits two letters at most" guidance) for a known person with no image, or a generic person/building icon for an unknown user or organization. `AvatarFallback`'s `delayMs` is used (a short delay, on the order of what Radix's own docs suggest) so a fast-loading image never flashes initials first — the same problem Polaris's own documentation names directly ("initials render if `src`... does not load quickly," not just "is missing").

**Shape**: `rounded-full` (circle) by default — every system compared below defaults to a circle for a human avatar. A `square` variant (`rounded-md`, reusing the radius tier already used throughout this system, not a new one) is reserved specifically for non-human entities — directly following GitHub Primer's own reasoning (bots, AI agents, organizations get the square treatment, people get the circle) and directly applicable to two real, already-named Krane entities: the **KAI Agent** and vendor/organization logos, both square; human approvers and buyers, circle.

## Status indicator support

Atlaskit draws a real, useful distinction worth adopting rather than re-deriving: **presence** (is this person currently online/away — a collaboration-app concept) is a different question from **status** (the outcome of something this person did — approved, declined, pending). Krane's procurement domain has a real, concrete use for the second and no concrete use for the first today — nothing in this system tracks live user presence. Rather than import a presence-style `online`/`away`/`busy`/`offline` enum with no other foothold anywhere in Krane's domain model, the recommended status dot reuses the **exact same `success`/`warning`/`error`/`info` vocabulary already used by `Input`, `Select`, `Switch`, `RadioGroup`, `Alert`, `Toast`, and `Badge`** — a small, corner-positioned dot (bottom-right, the near-universal placement) colored from that family, e.g. `success` for "approved," `error` for "declined," `warning`/`muted-foreground` for "pending"/"no decision yet." This is a prop on `Avatar` itself (matching Atlaskit's and Polaris's stance), not a separate `Badge`-overlay composition every consumer has to wire up by hand (Material UI's road, explicitly not taken here — the same "one prop, it just works" simplicity this system has favored consistently, most recently in `Alert`'s singular `primaryAction`/`secondaryAction` props over a six-component sketch).

## Accessibility

- **Alt text describes function, not just identity, when the avatar is interactive** — GitHub Primer's own guidance, adopted directly: an avatar that's a profile link gets `alt="Jordan Lee's profile"`, not bare `alt="Jordan Lee"`; a purely decorative avatar sitting next to already-visible name text can reasonably have an empty or minimal `alt`, since the name is already in the accessible text nearby.
- **The fallback (initials or icon) needs the same accessible name the image would have had** — `AvatarFallback` renders real text/icon content, not an empty decorative box, so this mostly falls out naturally, but a consumer passing only an icon (no name available at all) should still supply an `aria-label` rather than leave the fallback silent.
- **The status dot is never the only signal** — color alone never carries the message in this system (the same principle behind every status icon on `Input`/`Select`/`Alert`), so the dot needs a paired accessible text equivalent (a `sr-only` span or `aria-label`, e.g. "Approved"), not just a colored circle a screen reader user can't perceive.
- **`Avatar`-as-`DropdownMenuTrigger` inherits Radix `DropdownMenu`'s already-correct ARIA menu semantics for free** — nothing new to verify here, the same position `OrganizationSwitcher`/`ProjectSwitcher` are already in.

## Composition with Account Menu

Account Menu doesn't exist yet, in any form — this section documents the composition pattern it would use, the same way `ALERT_FOUNDATION.md` documented a `Form`-composition pattern for a layer that already existed by the time Alert was built, except here the target itself is still unbuilt. The pattern needs nothing new: `Avatar` wrapped directly as `DropdownMenuTrigger`'s child, exactly `OrganizationSwitcher`'s and `ProjectSwitcher`'s existing shape — a small interactive element, a `DropdownMenuContent` beside it. `Avatar` itself stays completely decoupled from any menu concept, the same separation `Select`/`Combobox`/`RadioGroup` already keep from `Form` — it doesn't know it's inside a trigger, the trigger just happens to render it. When Account Menu is eventually built, it is this composition, not a new primitive.

## Enterprise use cases

- **Replacing the App Header's literal `<span>S</span>`** — the concrete, already-present gap this document closes the spec for.
- **Approver attribution with a status dot** on a PO approval chain — `success` (approved), `error` (declined), `warning` or neutral (pending) — directly using the status-indicator decision above, not a new enum.
- **Buyer/requester attribution** on a submittal or PO line item — a plain avatar, no status dot needed.
- **Vendor/organization avatars** — square variant, either a logo image or the organization's initials, distinguishing "this is an entity, not a person" at a glance, the same distinction Primer's own square-for-non-human convention exists to make.
- **The KAI Agent's own avatar** in any future agent-facing surface — square, for the same reason; already named in the App Shell's sidebar today, so this isn't a hypothetical consumer.
- **A future, explicitly-not-now companion**: GitHub Primer ships a dedicated `AvatarStack` for overlapping multiple avatars (e.g., "3 approvers on this PO"), a real pattern with a real Krane use case — named here so it isn't invented blind later, not built now, since nothing in this system needs it yet.

## Demo requirements

- All three sizes, side by side.
- A successfully loading image.
- A broken/404 image URL, demonstrating the fallback-to-initials path live, not just described.
- Initials-only (no `src` provided at all).
- Icon fallback (an unknown-user case, no name available).
- The `square` variant, shown as a KAI Agent or vendor/organization avatar — tying directly to the named enterprise use case above, not a generic shape toggle.
- The status dot, one example per reused token (`success`/`warning`/`error`/`info`), each with its accessible text equivalent demonstrated (not just visually present).
- `Avatar` composed as a `DropdownMenuTrigger`, mirroring `OrganizationSwitcher`'s exact pattern — proving the Account Menu composition is real and ready, even though Account Menu itself isn't being built.

---

## Comparison: Atlassian, GitHub Primer, Polaris, Material Design

**Atlassian (Atlaskit)** — seven named sizes (`xsmall` through `xxxlarge`), a `presence` prop (e.g. `presence="online"`) distinct from a separate `status` concept used for action outcomes like approve/decline. [(Atlaskit — Avatar)](https://atlaskit.atlassian.com/packages/core/avatar) [(Atlaskit — Avatar status)](https://atlassian.design/components/avatar/avatar-status/) **Verdict**: the presence-vs-status distinction is adopted directly (§"Status indicator support"); the seven-size scale is not — no Krane use case needs that granularity, and three tiers already matches this system's own established scale.

**GitHub Primer** — sizes run 16px in base-4 steps to 32px, then base-8 to 48px, capping at 64px; square shape explicitly reserved for non-human entities (bots, AI agents, organizations), circle for people; alt-text guidance distinguishing identification from function. [(Primer — Avatar)](https://primer.style/product/components/avatar/) [(Primer — AvatarStack)](https://primer.style/product/components/avatar-stack/) **Verdict**: the circle-vs-square-by-entity-type distinction and the alt-text guidance are both adopted directly — the single strongest influence on this document, and a precise match for Krane's own KAI Agent/vendor-organization split.

**Shopify Polaris** — five sizes (`xs`/`sm`/`md`/`lg`/`xl`, 20–32px+ range), with initials rendered as fallback when `src` is missing, fails, *or* doesn't load quickly enough — the third condition being the one easy to miss if hand-rolling rather than using a primitive with a real delay mechanism. [(Polaris — Avatar)](https://polaris-react.shopify.com/components/images-and-icons/avatar) **Verdict**: confirms `AvatarFallback`'s `delayMs` is solving a real, independently-named problem, not a Radix-specific quirk — directly adopted.

**Material Design (MUI)** — a three-tier fallback chain (image → letters → icon), no built-in size scale (manual sizing via `sx`), and status communicated via a *separate* `Badge` component overlaid on `Avatar` through positioning, not a prop on `Avatar` itself. [(MUI — Avatar)](https://mui.com/material-ui/react-avatar/) **Verdict**: the three-tier fallback *order* isn't adopted as a forced hierarchy (Krane's consumer picks one fallback, not all three staged) — but MUI's no-size-scale stance is rejected outright (the weakest of the four), and the separate-`Badge`-composition approach to status is named and explicitly not taken, in favor of a simpler built-in prop.

---

## Existing capabilities

None beyond the already-installed `@radix-ui/react-avatar` primitive and the token family (`success`/`warning`/`error`/`info`/`muted-foreground`) the status dot would reuse — both confirmed, neither requiring any new work to exist. The current `<span>` stand-in is not a capability; it's the gap.

## Missing capabilities

The component itself, in any form. A real circle-vs-square shape decision (the current stand-in's `rounded-md` was never a decision). A status-dot vocabulary decision (none exists today). Any Account Menu composition, even a placeholder one — `Avatar` is the prerequisite for that gap, not a fix for it.

## Recommended implementation

Build `Avatar`/`AvatarImage`/`AvatarFallback` directly on `@radix-ui/react-avatar` (zero new dependency, confirmed installed). Three sizes (`sm`/`default`/`lg`, matching `Input`/`Select`'s scale). Circle by default, an explicit `square` variant for non-human entities (KAI Agent, vendor/organizations) — Primer's distinction, directly applicable. A status-dot prop reusing the existing `success`/`warning`/`error`/`info` family, not a new presence enum — Atlaskit's presence-vs-status framing adopted, but mapped onto tokens this system already has rather than ones it doesn't. Plain `<img>` under Radix's hood, not `next/image` — no precedent for the latter anywhere in this codebase, and avatar thumbnails are the case where its main benefits matter least. Replace the App Header's literal `<span>S</span>` with the real component once built, composed exactly as `OrganizationSwitcher` already is, as the seed of an eventual Account Menu — not built now, but no longer blocked on anything once `Avatar` exists.
