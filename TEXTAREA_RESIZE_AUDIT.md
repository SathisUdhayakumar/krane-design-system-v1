# Krane Design System — Textarea Resize Behavior Audit

Audit only — nothing implemented, no code changed. Follow-up to `TEXTAREA_FOUNDATION.md` (which already proposed `resize-y`/vertical-only as the v1 default) — this document exists to check that proposal against real external evidence rather than against reference-system *API surfaces* alone, then make one final call before `Textarea` is built. Sources are cited inline; confidence level is stated explicitly where evidence is circumstantial rather than a documented default.

---

## 1. What was checked

Three categories of evidence, in decreasing order of how directly verifiable they were given the tools available (live web search + static-HTML fetch — not a browser that can drive an actual third-party SaaS UI):

1. **Documented component defaults** for GitHub's and Atlassian's own design systems (high confidence — these are published API docs).
2. **Product-level engineering signal** — official packages a company ships specifically to change textarea behavior away from their own design-system default (medium-high confidence — confirms direction of travel, not pixel-exact current behavior on a specific page).
3. **Architectural inference** for Linear, which has no public design-system documentation site the way Primer/Atlaskit do — based on Linear's own documented editor capabilities, not a directly-observed DOM/resize-prop default (medium confidence, stated as such, not overstated).

## 2. Findings

### GitHub / Primer
Primer React's `Textarea` component ships a `resize` prop with options `'both' | 'horizontal' | 'vertical' | 'none'`, **defaulting to `'both'`** — full native browser resize, both directions, unless a consumer opts out. [(Primer Textarea docs)](https://primer.style/product/components/textarea/)

But GitHub separately builds and maintains its own **official** `@github/textarea-autosize` package — "autosizes textarea to the size of its contents" — as a distinct, deliberate addition on top of the base `<textarea>`/Primer default. [(github/textarea-autosize)](https://github.com/github/textarea-autosize) A company doesn't maintain a dedicated auto-grow package for its own flagship comment/PR-description boxes unless the generic design-system default (`both`, manual-only) wasn't the experience they wanted for that specific, highest-traffic surface. Read together, this is GitHub's own evidence that **manual `both` resize is the generic library default, not what their actual product relies on for its most important multi-line field.**

### Atlassian / Atlaskit
`@atlaskit/textarea`'s `resize` prop supports `'smart' | 'vertical' | 'horizontal' | 'both' | 'none'`, and **`'smart'` — auto-grow: show all input at once, wrapping/expanding the box, no drag handle — is the documented default.** [(@atlaskit/textarea)](https://www.npmjs.com/package/@atlaskit/textarea) Unlike GitHub, Atlassian didn't need a separate override package — their current-generation design system primitive defaults to auto-grow directly.

A second, separate data point from the product side: Atlassian support documentation includes an article titled **"How to Change the Size of Text Area Custom Field"** for legacy Jira multi-line custom fields, which are fixed-size (`rows`/`cols` set in an old Velocity template) unless the richer wiki/rich-text renderer is enabled. [(Atlassian support)](https://support.atlassian.com/jira/kb/how-to-change-the-size-of-text-area-custom-field/) This support article existing at all is evidence *against* fixed/no-resize as a good default — it's a recurring complaint serious enough to need a documented workaround, not a neutral, accepted behavior. Jira's actual comment/description fields (the high-traffic equivalent of GitHub's PR comment box) use the rich-text/wiki editor, which auto-grows like any contentEditable surface — the fixed-size complaint is specifically about the *old*, plain-textarea-backed custom fields, not the primary content-entry surfaces.

### Linear (and Linear-style editors generally)
Linear has no public design-system documentation site, so this is the one finding based on architectural inference rather than a published prop default. Linear's own docs describe its description/comment editor as accepting typed or pasted Markdown that's "converted into rich text automatically," with a real formatting toolbar. [(Linear — Editor)](https://linear.app/docs/editor) That description is consistent with a rich-text/contentEditable block editor, not a plain HTML `<textarea>` — and a contentEditable surface has no native resize handle to configure in the first place; it grows with its content by construction, the same architecture Notion/Height/Coda-style editors share. **Stated plainly: this is the expected pattern given what Linear documents about its editor, not a directly observed screenshot or DOM inspection** — the lowest-certainty finding of the three, but the conclusion (auto-grow, zero manual resize affordance) would be the same either way, since it's true of every mainstream contentEditable rich editor, not something specific and unverifiable about Linear alone.

### A relevant, separate platform constraint
Pure-CSS auto-grow (`field-sizing: content`) exists but **is not currently supported in Safari or Firefox** — confirmed across multiple current implementation guides. [(CSS-Tricks — Auto-Growing Inputs & Textareas)](https://css-tricks.com/auto-growing-inputs-textareas/) Shipping real auto-grow today means either a small JS measurement technique (`scrollHeight`, no new dependency) or a focused dependency like `react-textarea-autosize`/GitHub's own `@github/textarea-autosize` — not a CSS-only, zero-effort toggle yet.

## 3. Evaluating the four options against this evidence

| Option | Verdict | Why |
|---|---|---|
| **1. Native resize, both directions** | **Reject.** | This is the generic *library* default (Primer's), not what any audited product actually ships for its real content-entry surface. Horizontal growth is a specific liability in Krane's own layouts — every Krane form lives in a fixed-width Dialog/card column (per `DESIGN_SYSTEM_FOUNDATION.md`'s established density-conscious, fixed-grid conventions); a user dragging a textarea wider than its container breaks the layout it's sitting in, for a direction of resize none of the three audited ecosystems' actual products rely on. |
| **2. Vertical resize only** | **Recommended for now.** | Matches Atlaskit's `'vertical'` option and is the de facto behavior of GitHub's own auto-grow package in its *manual-fallback* sense (more room, only in the one dimension that doesn't break a fixed-width layout). Zero new dependency, zero browser-support gap, available today. Already what `TEXTAREA_FOUNDATION.md` proposed — this audit confirms rather than overturns that call. |
| **3. Disable resize entirely** | **Reject.** | No audited product does this for its primary multi-line content surface. The one piece of direct evidence on a no-resize-equivalent state (Jira's old fixed-size custom field) is a *documented complaint*, not a model to copy — Atlassian's own support team had to write an article explaining how to work around it. Removing resize entirely removes user agency for a real, recurring need (a notes field that's too short for what someone actually typed) with no offsetting benefit. |
| **4. Support future auto-grow** | **Recommended as the documented direction, not built now.** | This is where every audited ecosystem's *actual product* converges — GitHub's own override package, Atlaskit's new default, Linear's (and every contentEditable-style editor's) architecture. But building it today means either accepting Safari/Firefox's lack of `field-sizing: content` support or adding scope (a JS scrollHeight measurement or a new dependency) beyond what `TEXTAREA_FOUNDATION.md` scoped for v1 — and there is still no concrete Krane consumer asking for it, the same bar this system has applied to every other deferred feature (character count, monospace, `Input`'s own loading state before a real consumer appeared). |

## 4. Recommendation

**Ship vertical-only resize (`resize-y`) for v1, explicitly as a deliberate stepping stone toward auto-grow, not as a permanent end state.** This is a single recommendation, not two competing ones — option 2 is the *right v1 default on its own merits* (matches the safer half of every audited system's options, zero cost, zero browser gap), and it happens to also be the version of "resize" that imposes no migration cost later: switching to auto-grow is a `resize-y` → `resize-none` swap plus a height-measurement mechanism, not a rework of `Textarea`'s API, its `status` variants, or anything else `TEXTAREA_FOUNDATION.md` already specified. Choosing option 1 (both) now and walking it back later would be a visible behavior regression for any consumer who'd started relying on horizontal drag; choosing option 3 (none) now and adding resize later is the same migration cost as option 2 with none of the interim benefit.

**Concretely:**
- Build `Textarea` per `TEXTAREA_FOUNDATION.md` as already written — no change to that document's spec.
- Treat auto-grow as a named, intended v1.1 enhancement, not a maybe — record it as such (see §5) so it isn't re-litigated from scratch once `field-sizing: content` lands in Safari/Firefox, or once a concrete long-form consumer (a comment thread, a long rejection-reason field) makes the manual-resize experience feel dated relative to where GitHub/Atlassian/Linear have already moved.
- Do not add a new npm dependency to get there speculatively — re-evaluate `field-sizing: content`'s browser support at the time a real consumer justifies the work, the same "wait for a concrete need" discipline already applied to `Input`'s deferred features.

## 5. Relationship to `TEXTAREA_FOUNDATION.md`

No contradiction — this audit validates that document's existing §5 (`resize-y` as the shipped behavior, `read-only:resize-none` as the read-only correction) and strengthens its §"Recommended additions" entry on auto-grow from "real, but no concrete consumer" to "the confirmed direction every audited competitor has already moved in, deliberately deferred for the same reason as before (no concrete Krane consumer yet, plus a real cross-browser CSS gap today)." Treat that section's framing as upgraded by this audit, not superseded.

---

## Sources

- [Textarea — Primer (GitHub's design system)](https://primer.style/product/components/textarea/) — `resize` prop, default `'both'`.
- [github/textarea-autosize](https://github.com/github/textarea-autosize) — GitHub's own official auto-grow package, separate from Primer's base component.
- [@atlaskit/textarea — npm](https://www.npmjs.com/package/@atlaskit/textarea) — `resize` prop, default `'smart'` (auto-grow).
- [How to Change the Size of Text Area Custom Field — Atlassian Support](https://support.atlassian.com/jira/kb/how-to-change-the-size-of-text-area-custom-field/) — legacy fixed-size Jira custom field, the no-resize-adjacent cautionary case.
- [Linear — Editor (docs)](https://linear.app/docs/editor) — describes Markdown-to-rich-text conversion; basis for the contentEditable/auto-grow architectural inference.
- [Auto-Growing Inputs & Textareas — CSS-Tricks](https://css-tricks.com/auto-growing-inputs-textareas/) — `field-sizing: content` and its current Safari/Firefox support gap.
