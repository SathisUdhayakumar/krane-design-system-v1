# Krane Design System — Account Menu Foundation

Audit + specification, now implemented at `components/shell/account-menu.tsx` (`AccountMenu`), composed exactly as recommended — the real `Avatar` as trigger, `DropdownMenu`'s existing `Group`/`Item`/`Label`/`Separator` pieces for the menu, zero new dependency. Demoed at `/demo/account-menu` and composed into `/demo/app-shell`'s real header, replacing the placeholder `<span>` this gap had been named against since the App Shell's very first audit.

Two refinements made at implementation time, both explicit instruction rather than discovered mid-build: `organizationLabel` shipped as a **required** prop, not the optional one this document's own §8 sketch suggested (every real Krane session already has an organization context); and the Actions group shipped as **three** distinct, always-rendered rows (Profile / Settings / Notification Preferences) rather than this document's two-row ("Profile settings" bundled) sketch. `ThemeToggle` and `OrganizationSwitcher` were not folded in, exactly as recommended in §10/§11 — confirmed via Playwright that both still render correctly alongside the new component in the real header. See `COMPONENT_STATUS.md`/`DESIGN_SYSTEM_PROGRESS.md` for the full detail.

## Audit: existing codebase state

- **The trigger today is still the same inert `<span>S</span>`** in `app/demo/app-shell/page.tsx`'s `HeaderRightActions` — no click handler, no menu, unchanged since `AVATAR_FOUNDATION.md`'s own audit found it. `Avatar` the component now exists (`components/ui/avatar.tsx`) but the Shell hasn't been switched over to it.
- **Every primitive this menu needs already exists, fully built, zero gaps**: `Avatar`/`AvatarImage`/`AvatarFallback` (the trigger), `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuGroup`/`DropdownMenuItem`/`DropdownMenuLabel`/`DropdownMenuSeparator` (the menu itself — `DropdownMenuItem` already has a `variant="destructive"` treatment, the exact styling a "Sign out" row needs, confirmed directly in `components/ui/dropdown-menu.tsx` rather than assumed). **No new component or primitive is required to build this** — the entire remaining work is composition and content, the same position `OrganizationSwitcher`/`ProjectSwitcher` were in before they shipped.
- **`OrganizationSwitcher`/`ProjectSwitcher` are the direct, already-shipped precedent** for "small trigger + `DropdownMenuContent`," positioned at the *left* of `AppHeader`. Account Menu is the same shape, positioned at the *right* — confirmed via direct inspection of `app-header.tsx`'s `organizationSwitcher`/`projectSwitcher`/`rightActions` slots, not assumed from naming alone.
- **`ThemeToggle` (`components/theme-toggle.tsx`) is already its own independent `DropdownMenu`**, sitting in the header's right-side icon row, between the notification bell and the divider that precedes the avatar stand-in. It is not nested inside anything — a real, working, already-shipped, standalone control, and a real design question this document has to answer directly: does Account Menu absorb it, or stay separate? (§"Theme switcher integration," below.)
- **No token gap.** `Avatar`'s `default` size (`size-8`) matches the current stand-in's exact pixel size; the menu reuses `DropdownMenuContent`'s existing floating-surface recipe and `align="end"` (already the established alignment for every other right-side header dropdown — the language switcher already uses it).

## 1. Purpose

The signed-in user's quick-access point for their own account — not workspace or project context (already `OrganizationSwitcher`/`ProjectSwitcher`'s job, on the opposite side of the header), not a settings destination in itself, but the menu that gets a user *to* profile/notification settings and lets them sign out, plus a small amount of identity confirmation ("who am I signed in as, right now").

## 2. Visual specification

Trigger: `Avatar` at `default` size (`size-8`), `shape="circle"` (a human user, per `AVATAR_FOUNDATION.md`'s circle-for-people convention), no `status` dot — Krane has no presence concept to show one for, the same reasoning that kept `Avatar`'s own status vocabulary tied to action outcomes rather than online/offline. Menu: `DropdownMenuContent`, `align="end"`, reusing the exact floating-surface recipe (`rounded-lg border bg-popover p-1 shadow-md`) already shared by every other dropdown in this system — no new visual treatment.

## 3. Trigger behavior

Identical to `OrganizationSwitcher`'s trigger contract: a `DropdownMenuTrigger` wrapping `Avatar` directly, opening on click (Radix's default), closing on selection, outside click, or `Escape`. No hover-to-open — this system has no hover-opened menu anywhere (Tooltips open on hover, menus open on click; conflating the two was never done for `OrganizationSwitcher`/`ProjectSwitcher`/`ThemeToggle` and shouldn't be invented here either).

## 4. Menu structure

Top to bottom, the convergent shape every system in the comparison below independently arrives at: an identity header (read-only), grouped actions, then an isolated, visually distinct sign-out row. Not a deep menu — a quick-actions surface that links *out* to fuller settings rather than reproducing a settings page inline (GitHub's and Linear's confirmed pattern: the dropdown is for fast actions and a jump-off point, not where dense configuration actually lives).

## 5. Section grouping

Three groups, each separated by `DropdownMenuSeparator`:

1. **Identity** — name, email, rendered via `DropdownMenuLabel` (non-interactive, matching its existing role as section/contextual text elsewhere in this system).
2. **Actions** — "Profile settings," "Notification preferences," wrapped in `DropdownMenuGroup`. Informational organization context ("Signed in as Brigade Group") can sit here too, as text, not as an action — switching organizations stays `OrganizationSwitcher`'s job (§10).
3. **Sign out** — alone, `variant="destructive"`, separated from the actions group above it — the same isolation-by-separator pattern this system already uses for `Toast`'s/`DropdownMenu`'s own destructive rows.

## 6. States

- **Closed / open** — Radix's own state, nothing new.
- **Default** — name, email, avatar all present.
- **Missing avatar image** — falls back to initials or a generic person icon, exactly `Avatar`'s already-documented fallback behavior; Account Menu doesn't add a second fallback layer on top of it.
- **Long name/email truncation** — `truncate` on the identity text, the same overflow handling already applied to `Sidebar`'s nav item labels and `OrganizationSwitcher`'s current-org label.
- **Action-required nudge** (a real, nameable state, not built into v1): a small badge or dot on the trigger itself, the same visual language `Sidebar`'s count/new badges already use, for something like "verify your email" — named here as a future state this structure can support, not a requirement for the first version.

## 7. Accessibility

- The trigger needs a real accessible name distinct from a bare avatar image's `alt` — `aria-label="Account menu for {name}"` (or similar), since `Avatar`'s own `alt`/fallback content describes the *person*, not the *action* of opening this menu — the same identification-vs-function distinction `AVATAR_FOUNDATION.md` already drew from GitHub Primer's guidance, directly applicable here.
- `DropdownMenuLabel`'s identity text needs no special treatment — it's already non-interactive, already excluded from arrow-key navigation by Radix's own menu implementation.
- The destructive "Sign out" row inherits `DropdownMenuItem`'s already-correct `data-variant="destructive"` styling and keyboard/focus behavior — nothing new to verify, the same position `dropdown-menu`'s own demo's "Sign out" example is already in.
- Full keyboard support (open via `Enter`/`Space` on the trigger, arrow-key navigation, `Escape` to close, type-ahead) comes from Radix `DropdownMenu` with zero additional work — re-confirmed, not re-derived, the same guarantee every other `DropdownMenu` consumer in this system already relies on.

## 8. API design

Documentation-stage sketch, not a frozen contract — the same hedge every component in this system used before it shipped. A real, dedicated component (`AccountMenu`, living in `components/shell/` alongside `OrganizationSwitcher`/`ProjectSwitcher`), not a loose composition pattern left to ad hoc recreation at each call site — its structure (identity, actions, destructive sign-out) doesn't vary per page the way generic dropdown content might, the same reasoning that already justified `OrganizationSwitcher` as a real component rather than "just compose `DropdownMenu` yourself."

```ts
interface AccountMenuUser {
  name: string
  email: string
  avatarUrl?: string
  initials: string
}

interface AccountMenuProps {
  user: AccountMenuUser
  organizationLabel?: string        // "Signed in as Brigade Group" — informational only, §10
  onProfileSettings?: () => void
  onNotificationPreferences?: () => void
  onSignOut: () => void
}
```

## 9. Avatar integration

The trigger *is* an `Avatar` — not a lookalike, the real component, `size="default"` `shape="circle"`, `src={user.avatarUrl}` with `AvatarFallback` rendering `user.initials`. This is the exact composition `AVATAR_FOUNDATION.md` already documented (`OrganizationSwitcher`'s "small trigger element inside `DropdownMenuTrigger`" shape) — confirmed reusable here, not redesigned. No `status` dot on this particular `Avatar` instance — re-affirmed from §2, not a new decision.

## 10. Organization switcher integration

Deliberately separate, not merged — Linear's own architecture independently confirms this split (workspace switching lives in its own dedicated top-left control, distinct from the personal account/profile menu), the same separation Krane's `AppHeader` already has built in (`organizationSwitcher`/`projectSwitcher` props on the left, `rightActions` — where Account Menu would sit — on the right). The only integration point Account Menu needs is **informational, not functional**: an organization-context line ("Signed in as Brigade Group") inside the Actions group, read-only text, not a switcher control — switching stays a deliberate one-job task for `OrganizationSwitcher` alone.

## 11. Theme switcher integration

**Stays separate — not absorbed into Account Menu.** `ThemeToggle` is already a real, working, independently-shipped header control, occupying its own one-click position. Folding it into Account Menu would cost an extra click for an action used often enough to have earned standalone placement, and would mean two places in the header doing the same job during any transition period. GitHub's own pattern — confirmed during comparison research — actually supports keeping both: a quick theme control at the top level *and*, separately, a fuller "Appearance" configuration reachable from account settings for deeper options Krane doesn't have today (no settings page exists yet). If Krane ever builds a real account-settings page, that page — not this dropdown — is the right place to expose anything beyond the simple Light/Dark/System choice `ThemeToggle` already covers; nothing about that needs deciding now.

## 12. Enterprise use cases

- **Replacing the App Header's literal `<span>S</span>`** — the concrete, already-named gap this document specs.
- **"Signed in as Brigade Group"** — a buyer working across multiple organizations (a real Krane concept, already modeled by `OrganizationSwitcher`) gets a quick, read-only confirmation of current context without needing to open the (separate) organization switcher just to check.
- **Profile settings** — updating display name/avatar, relevant the moment more than a placeholder initial is needed anywhere `Avatar` renders a real user.
- **Notification preferences** — a real, plausible link target given the App Header's already-present (and still entirely unwired) notification bell — Account Menu doesn't need to build that system, just provide the expected entry point to it.
- **Sign out** — the one universally-present row across every system compared below; isolated and destructive-styled because, per Linear's own documented behavior, signing out can have real session-wide consequences worth that visual weight, even though enforcing any particular sign-out behavior itself is an application concern, not a design-system one.

## 13. Demo requirements

- The full menu, open, showing all three groups (identity, actions, destructive sign-out) with realistic Krane data (a named buyer/approver, a real-looking email, "Brigade Group" as the organization line).
- The avatar-fallback states already demoed in `/demo/avatar` are not re-demoed here — this page demonstrates the *menu*, not `Avatar`'s own fallback behavior a second time; a single representative trigger (initials fallback, no image) is enough.
- A long name/email, demonstrating truncation live, not just described.
- The menu composed inside `AppHeader`'s actual `rightActions` slot (mirroring `/demo/app-shell`'s existing pattern for `ThemeToggle`/`OrganizationSwitcher`), proving the integration point is real — not a standalone menu floating outside any layout.
- `ThemeToggle` and `OrganizationSwitcher` both visibly present alongside it in that same demo, making the "these stay separate" decision (§10/§11) visually self-evident rather than just asserted in prose.

---

## Comparison: GitHub Primer, Atlassian, Polaris, Material Design, Linear

**GitHub** — profile-avatar dropdown in the header's upper right is the primary entry point to account management; quick theme switching is available directly from the account surface, while deeper configuration (username, security, accessibility) lives on dedicated settings pages the dropdown links out to, not inline in the menu itself. [(GitHub Docs — Theme settings)](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-personal-account-settings/managing-your-theme-settings) **Verdict**: the strongest influence on §4/§11 — "quick actions in the menu, depth on a linked settings page" is adopted directly, and is exactly why Krane's already-shipped standalone `ThemeToggle` doesn't need folding into this menu to match the convention; GitHub itself doesn't collapse the two into one surface either.

**Atlassian (Atlaskit)** — ships a dedicated `ProfileCard` component (a richer hover/click identity surface) composed with `@atlaskit/popup`-based menus, a real, named precedent for treating "show identity + offer actions" as its own first-class composed component rather than ad hoc per-page assembly. [(Atlaskit — ProfileCard)](https://atlaskit.atlassian.com/packages/people-and-teams/profilecard/example/profilecard/docs/profilecard-overview) **Verdict**: confirms the §8 decision to make `AccountMenu` a real, dedicated component rather than a loose pattern — the same conclusion reached independently from `OrganizationSwitcher`'s own precedent, now doubly supported.

**Shopify Polaris** — the account/user menu is a named, built-in responsibility of the `TopBar` chrome component itself ("provide search and a user menu"), not a separate freestanding piece — structurally the same relationship Krane's `AppHeader` already has to this menu (composed into the header's `rightActions`, not a page-level component of its own). [(Polaris — Navigation)](https://polaris-react.shopify.com/components/deprecated/navigation) **Verdict**: confirms Account Menu belongs to `components/shell/`, living beside `AppHeader`, not `components/ui/` — it's chrome, not a generic UI primitive, the same category `OrganizationSwitcher`/`ProjectSwitcher` are already filed under.

**Material Design (MUI)** — generic `Menu` + `Avatar` composition is common enough that MUI's own product, Toolpad Core, ships a dedicated, pre-built `Account` component specifically for this exact pattern. [(MUI Toolpad — Account)](https://mui.com/toolpad/core/react-account/) **Verdict**: independent, third confirmation (alongside Atlaskit's `ProfileCard` and Polaris's `TopBar`-owned user menu) that this composition is common enough to deserve its own dedicated component rather than being left as a recipe — reinforces §8 again, not a new finding.

**Linear** — workspace switching is a separate, dedicated top-left control, explicitly distinct from personal account/profile settings (reached via a full `Settings > Profile` page, not a quick dropdown action); signing out is documented to end all other active sessions, a real, security-relevant consequence for what looks like a simple menu row. [(Linear Docs — Workspaces)](https://linear.app/docs/workspaces) [(Linear Docs — Profile)](https://linear.app/docs/profile) **Verdict**: the strongest influence on §10 — the org-switcher/account-menu separation already built into Krane's `AppHeader` is independently validated, not a gap to close. The sign-out session-impact note is named in §12 as real context, not a new design requirement — enforcing that behavior is this system's eventual application layer's job, not this document's.

---

## Existing capabilities

Every primitive this menu is built from — `Avatar`, `DropdownMenu` and its full set of sub-parts (including the destructive item variant), the established floating-surface recipe, `AppHeader`'s `rightActions` slot. Confirmed directly from the files, not assumed from their names. Nothing new needs to exist before this can be built.

## Missing capabilities

The composition itself, as a real component. Identity-header content (name/email rendering via `DropdownMenuLabel`) has no existing precedent to point to — every other `DropdownMenuLabel` use in this system today is a short category heading ("Menu," column-visibility groupings), not a two-line identity block, so this is a genuinely new (if small) content shape, not just a reused one.

## Recommended implementation

Build `AccountMenu` as a real, dedicated component in `components/shell/`, alongside `OrganizationSwitcher`/`ProjectSwitcher` — not a `components/ui/` primitive (it's chrome with fixed, Krane-specific structure, the same category distinction Polaris's `TopBar`-owned user menu and Atlaskit's `ProfileCard` both independently confirm), and not a loose, ad hoc composition pattern left undocumented at each call site (Material UI's own `Account` component and Atlaskit's `ProfileCard` both confirm this composition is common enough to deserve one real component). Trigger: the real `Avatar`, `default` size, circle, no status dot. Structure: identity (`DropdownMenuLabel`) → actions (`DropdownMenuGroup`: profile settings, notification preferences, a read-only organization-context line) → an isolated, `variant="destructive"` sign-out row, each section separated by `DropdownMenuSeparator`. Do not fold `ThemeToggle` or `OrganizationSwitcher` into it — both are real, working, separately-justified controls, and GitHub's and Linear's own architectures independently confirm keeping them apart rather than consolidating for consolidation's own sake.

## Must-have vs. Nice-to-have

**Must-have**: the `AccountMenu` component itself, replacing the App Header's placeholder `<span>`; the three-group structure with an isolated destructive sign-out row (the one element every single comparison system includes without exception); the avatar-as-trigger composition, reusing `Avatar` exactly as already built; the accessible-name correction on the trigger (§7) — getting this wrong (relying on `Avatar`'s own identity-only `alt` to also describe "this opens a menu") would be a real, avoidable accessibility gap, not a style nitpick.

**Nice-to-have**: the action-required nudge badge on the trigger (§6) — a real, supportable future state, no concrete Krane trigger condition exists for it yet; a richer `ProfileCard`-style hover preview (Atlaskit's pattern) — more surface area than this menu's actual job calls for today; folding appearance settings into a future full account-settings page reachable from this menu (§11) — real, but blocked on a settings page that doesn't exist yet, not on anything in this document.

## Final recommendation for Krane

Build `AccountMenu` now, as the direct, fully-unblocked next step after `Avatar` — every primitive it needs is already shipped, and this is the same "compose what exists, add no new primitive" position `OrganizationSwitcher`/`ProjectSwitcher`/`ThemeToggle` were each in. Keep it deliberately small: identity, two or three real action rows, one informational organization line, one isolated sign-out — resist pulling `ThemeToggle` or `OrganizationSwitcher` into it, both already correctly placed and independently validated by every system in this comparison rather than just by Krane's own preference. The one genuinely new content shape (a two-line identity block inside a menu) is small enough not to need its own sub-component — `DropdownMenuLabel` already renders arbitrary children, and a `flex flex-col` of two text lines inside it is enough.
