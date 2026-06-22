# Krane Design System — Z-Index Foundation

Documentation only — no code changed. Supersedes the z-index section of `FOUNDATION_GAPS.md` with a fuller audit and an explicit hierarchy covering layers that don't have a component yet (Command Palette).

---

## Audit: all current z-index usage

Re-verified directly against source for this document:

```
z-10   app/demo/table/page.tsx           — sticky table header (one-off, demo page only)
z-50   components/ui/popover.tsx          — PopoverContent
z-50   components/ui/tooltip.tsx          — TooltipContent
z-50   components/ui/dropdown-menu.tsx    — DropdownMenuContent (and SubContent, via the shared FLOATING_SURFACE constant)
z-50   components/ui/dialog.tsx           — DialogOverlay AND DialogContent (both, same value)
z-100  components/ui/toast.tsx            — ToastViewport
```

No `--z-*` custom property exists anywhere in `app/globals.css` today. Three distinct numbers (10, 50, 100) are in use, chosen independently at three different points in this project's history, with no documented relationship between them.

**The one real defect this audit confirms**: Dialog shares its z-index with Popover/Tooltip/DropdownMenu. A Select, DropdownMenu, or Tooltip triggered from *inside* an open Dialog has no guaranteed stacking position relative to that Dialog's own overlay and content — it works today only because Radix's portal mount order happens to place later-opened content after (and therefore visually above) earlier content in the DOM. That's an accident of implementation, not a guarantee.

---

## Token hierarchy

Eight named layers, four of which are not yet built as components (Sticky Header exists only as a one-off demo pattern; Command Palette doesn't exist at all):

| Layer | Token | Value | Status |
|---|---|---|---|
| Content | — | `auto` (no explicit z-index) | Exists — the entire app's base page flow |
| Sticky Header | `--z-sticky` | 10 | Exists as a one-off (`z-10`, demo only) — not yet a named token |
| Dropdown | `--z-dropdown` | 50 | Exists (`DropdownMenu`) |
| Popover | `--z-popover` | 50 | Exists (`Popover`) — **same value as Dropdown, deliberately** (see below) |
| Tooltip | `--z-tooltip` | 60 | Exists at `z-50` today — **recommended change to 60** (see below) |
| Dialog | `--z-overlay` | 70 | Exists at `z-50` today — **recommended change to 70**, the actual defect fix |
| Command Palette | `--z-command-palette` | 80 | **Does not exist yet** — reserved ahead of need |
| Toast | `--z-toast` | 100 | Exists, unchanged |

Gaps are deliberate: 10→50 (40 units below all floating chrome), 50→60→70→80 (tight but explicit separation through the stack of "things that can legitimately be open at once"), 80→100 (20 units of headroom above Command Palette, below Toast, for anything future).

---

## Layering rules

### Content
No z-index. Default stacking context. Anything that needs to appear above page content but isn't one of the named layers below should not invent a new ad hoc number — it should be evaluated against this table first.

### Sticky Header
`--z-sticky: 10`. Sits above scrolling content beneath it, but below every floating-chrome layer — a Dropdown or Popover triggered from within a sticky header (e.g. a column-visibility menu in a sticky table header) must render above the header itself, not behind it. Confirmed correct today: 10 < 50.

### Dropdown
`--z-dropdown: 50`. Trigger-anchored, dismiss-on-outside-click, transient.

### Popover
`--z-popover: 50`. Same numeric tier as Dropdown — not an oversight. The two are structurally equivalent in every way that matters for stacking (both Radix-Popper-anchored, both dismiss the same way, neither is ever the "outer" context for the other in a way that requires a guaranteed order — when one is opened from inside the other, normal DOM/portal mount order already resolves it correctly, the same way two Dropdowns or two Popovers never need a tiebreaker between each other today). Splitting them into different numbers would imply a relationship that doesn't actually exist.

### Tooltip
`--z-tooltip: 60` — **recommended change from the current `z-50`.** A Tooltip frequently explains an element that lives *inside* another floating surface (e.g. an icon-only action inside an open DropdownMenu item, or a risk-explanation icon inside an open Popover). A tooltip must never be visually hidden behind the surface containing the element it's describing. Giving Tooltip its own tier strictly above Dropdown/Popover guarantees this regardless of mount order, rather than relying on the same accident-of-implementation correctness flagged in the audit above.

### Dialog
`--z-overlay: 70` — **recommended change from the current `z-50`, the fix for this document's central finding.** Must sit above Dropdown/Popover/Tooltip so that any of those, when triggered from content rendered *outside* an open Dialog, can never visually intrude above it — and more importantly, so that the Dialog's own overlay reliably dims everything beneath it, including any floating chrome that happened to be open at the moment the Dialog opened. Both `DialogOverlay` and `DialogContent` move together — they must never be split across tiers, or the content would render dimmed by its own backdrop.

### Command Palette
`--z-command-palette: 80` — **no component exists yet; this is a reservation, not a retrofit.** Recommended above Dialog: a command palette is typically invoked via a global keyboard shortcut from anywhere in the app, including from inside an open Dialog, and represents the user jumping to an entirely different interaction mode — it should never be trapped beneath whatever happened to already be open. Recommended *below* Toast: a passive system notification should remain glanceable even while the command palette has the user's full attention, rather than being hidden by it.

### Toast
`--z-toast: 100`, unchanged. Must remain visible above literally everything else in the stack, including an open Dialog or (once built) Command Palette — a system notification that gets silently trapped behind a modal is a notification the user never sees.

---

## Summary of value changes — as implemented

| Component | Was | Now | Behavior change? |
|---|---|---|---|
| Sticky header (demo) | `z-10` | `z-sticky` (10) | No — same value, now named |
| Dropdown | `z-50` | `z-dropdown` (50) | No — same value, now named |
| Popover | `z-50` | `z-popover` (50) | No — same value, now named |
| Tooltip | `z-50` | `z-tooltip` (60) | **Yes — implemented, the recommended +10 fix** |
| Dialog (overlay + content) | `z-50` | `z-dialog` (70) | **Yes — implemented, the recommended +20 fix, the central defect** |
| Toast | `z-100` | `z-toast` (100) | No — same value, now named |
| Command Palette | — | — | **Not implemented this pass.** This turn's explicit token list (`z-content`, `z-sticky`, `z-dropdown`, `z-popover`, `z-tooltip`, `z-dialog`, `z-toast`) didn't include it, deliberately — no component exists yet to consume it. `--z-command-palette` remains a documented reservation (value `80`, between Dialog and Toast) in this file only, not yet in `globals.css`. Add it when the component is actually built, not before. |

All seven implemented tokens (plus `--z-content: 0`, defined for completeness though nothing consumes it — Content needs no explicit z-index) live in `app/globals.css`'s `@theme inline` block and were confirmed in compiled CSS, e.g. `.z-tooltip{z-index:var(--z-tooltip)}` with `--z-tooltip:60` registered. The token name in this file's earlier sections (`z-(--z-overlay)`) doesn't match what shipped (`z-dialog`) — the *value* (70) is identical, only the name changed, to match this turn's explicit naming request (`z-dialog`, not `z-overlay`).
