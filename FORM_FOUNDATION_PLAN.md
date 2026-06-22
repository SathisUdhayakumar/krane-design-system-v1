# Krane Design System — Form Foundation Plan

Audit only — nothing implemented. Generated from the current state of `components/ui/`, `package.json`, and the installed `radix-ui` bundle.

---

## 1. Existing form-related components

| Component | Status |
|---|---|
| Checkbox | **Exists** — `components/ui/checkbox.tsx`. Built on Radix Checkbox, supports `checked`/`indeterminate`/`disabled`/`aria-invalid`. Its `checked`/`onCheckedChange` shape is already compatible with `react-hook-form`'s `Controller` render-prop pattern — no rework needed when the Form layer arrives. |
| Raw `<input>` (inline, not a component) | Two hand-styled instances exist today: the vendor-creation example in `app/demo/dialog/page.tsx`, and `DataTable`'s search box (`components/ui/data-table.tsx`, `DataTableToolbar`). Both apply the same ad hoc classes (`border-input bg-background focus-visible:ring-3 focus-visible:ring-ring`) independently — this is exactly the pattern a real `Input` component should consolidate. |

Everything else in the user's focus list — **Label, Input, Textarea, Select, Radio Group, Switch, Form, FormField, FormItem, FormLabel, FormDescription, FormMessage** — does not exist yet. 12 of the 13 named items are missing; only Checkbox is done.

---

## 2. Missing form primitives

**Standalone field primitives** (no `react-hook-form` involvement):

| Primitive | Headless dependency | Already installed? |
|---|---|---|
| Label | Radix `Label` | **Yes** — confirmed present in the installed `radix-ui` bundle, unused |
| Input | none (plain `<input>`, styled) | n/a |
| Textarea | none (plain `<textarea>`, styled) | n/a |
| Select | Radix `Select` | **Yes** — confirmed present, unused |
| Radio Group | Radix `RadioGroup` | **Yes** — confirmed present, unused |
| Switch | Radix `Switch` | **Yes** — confirmed present, unused |

Same position Checkbox/Popover/Dialog/Tooltip/Toast were each in before they were built — the headless engine is already a dependency, only the styled wrapper is missing.

**Form-validation composition layer** (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormDescription`, `FormMessage`):

This is a different category from the field primitives above — it's the `react-hook-form` integration layer (shadcn's own `form.tsx` pattern), not a styled-Radix-wrapper. **`react-hook-form` is not currently installed** (checked `package.json` directly — only `@tanstack/react-table`, `radix-ui`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tw-animate-css` are dependencies). This is a hard blocker for this entire cluster, unlike everything else in this plan.

One nuance worth flagging precisely: `zod` is present in `node_modules` today, but it is **not** a direct dependency in `package.json` — it's a transitive dependency of something else in the tree. It should not be imported directly without explicitly adding it as a real dependency first; a transitive package can disappear on the next clean install.

A piece of glue this layer needs that isn't on the user's named list but is architecturally required: a shared **`useFormField()`** hook that reads both the field name (from a `FormField`-provided context) and a generated id (from a `FormItem`-provided context) plus `react-hook-form`'s field/error state — `FormLabel`, `FormDescription`, and `FormMessage` all consume it. Flagging this now so it isn't "discovered" mid-implementation the way Toast's imperative-API gap was.

---

## 3. Component inventory

| # | Component | Exists | Headless dep | New npm package needed |
|---|---|---|---|---|
| 1 | Label | No | Radix Label | No |
| 2 | Input | No | — | No |
| 3 | Textarea | No | — | No |
| 4 | Select | No | Radix Select | No |
| 5 | Checkbox | **Yes** | Radix Checkbox | No |
| 6 | Radio Group | No | Radix RadioGroup | No |
| 7 | Switch | No | Radix Switch | No |
| 8 | Form | No | `react-hook-form` (`FormProvider`) | **Yes** |
| 9 | FormField | No | `react-hook-form` (`Controller`) | **Yes** |
| 10 | FormItem | No | React `useId()` (built-in) | No, but blocked by cluster's lead item |
| 11 | FormLabel | No | Label (#1) + FormItem + FormField context | No, but blocked |
| 12 | FormDescription | No | FormItem context | No, but blocked |
| 13 | FormMessage | No | FormField context, `--destructive` tokens (exist) | No, but blocked |

---

## 4. Dependency graph

```
Radix Label ──────────► Label
                            │
Radix Select ──────────► Select        (reuses Popover/DropdownMenu's
                                          floating-surface styling —
                                          shadow-md, bg-popover, the
                                          data-open/data-closed
                                          animation classes — a styling
                                          convention, not an import)

Radix RadioGroup ──────► Radio Group   (visual indicator conventions
                                          borrowed from Checkbox: same
                                          border-input / focus-ring /
                                          data-state treatment, circular
                                          instead of square — convention,
                                          not an import)

Radix Switch ───────────► Switch

(none) ─────────────────► Input ───────► Textarea
                                          (shares Input's style recipe;
                                          no import dependency, just the
                                          same conventions applied twice)

──────────────────────────────────────────────────────────────────────
react-hook-form (NOT INSTALLED) ──► Form (= FormProvider re-export)
                                       │
                                       ▼
                                    FormField (wraps Controller,
                                    provides field-name context)
                                       │
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                     FormItem      useFormField() hook (shared glue,
                  (provides id      reads FormField context + FormItem
                   context)         context + react-hook-form state)
                         │             │
            ┌────────────┼─────────────┼────────────┐
            ▼            ▼             ▼            ▼
        FormLabel   FormDescription            FormMessage
     (also needs    (needs FormItem            (needs FormField's
      Label, #1)     context only)              error state +
                                                 --destructive tokens)
```

Two independent dependency chains, not one: the **field primitives** (Label/Input/Textarea/Select/RadioGroup/Switch) need nothing from `react-hook-form` and can be built, demoed, and used standalone today. The **Form-validation layer** (Form/FormField/FormItem/FormLabel/FormDescription/FormMessage) is a single connected cluster that's entirely blocked on one `npm install`, and internally, `FormLabel` is the most dependency-heavy single piece (it needs Label, FormItem's context, *and* FormField's context all at once).

---

## 5. Recommended build order

1. **Label** — zero dependencies beyond an already-installed Radix primitive, and it's a prerequisite for `FormLabel` later. Build it first even though nothing consumes it yet.
2. **Input** — the highest-value single item in this whole plan: two existing call sites (`Dialog`'s vendor form, `DataTable`'s search box) are already hand-rolling its exact styling independently; a real component consolidates both.
3. **Textarea** — trivial once Input's style recipe is settled; same conventions, different element.
4. **Switch** — simplest of the remaining Radix wraps (binary, no item-list complexity), and structurally closest to Checkbox, which already proved this project's "wrap a wakefield Radix primitive" pattern five times over.
5. **Radio Group** — slightly more structure than Switch (a group + items), benefits from Checkbox/Switch's now-established indicator-dot conventions.
6. **Select** — the most complex of the standalone primitives (Trigger/Content/Item/Viewport/Group), and the natural point to reuse Popover/DropdownMenu's floating-surface decisions rather than re-deriving them.
7. **Install `react-hook-form`** — do this right before it's first needed, not earlier, consistent with how `@tanstack/react-table` was added exactly when `DataTable` needed it and not before.
8. **`useFormField()` + `Form` + `FormField`** — the core wiring, built together since `FormField` is meaningless without the hook, and `Form` is a one-line re-export that only matters once `FormField` exists to be wrapped by it.
9. **`FormItem`** — needed before `FormLabel`/`FormDescription`/`FormMessage` since all three read its id context.
10. **`FormLabel`, `FormDescription`, `FormMessage`** — build last, together; all three are thin consumers of the hook and contexts established in steps 8–9, and none of them is independently useful before the others exist.

Steps 1–6 (the field primitives) can proceed immediately with no new dependency. Steps 7–10 (the validation layer) are gated entirely on the `react-hook-form` install in step 7 — there's no partial-credit way to start step 8 before it.

---

## Design-system conventions these must follow

Pulled from how every prior primitive in this codebase was actually built, not general best practice — the point is consistency with what's already here:

- **`border-input`, not `border-border`**, for any form-control's resting border — established by Checkbox, must carry to Input/Textarea/Select/RadioGroup.
- **Focus ring is always `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring`** — identical mechanism on every interactive primitive in this project so far (Button, Checkbox, DropdownMenu items, Dialog's close button). No new primitive should invent its own focus treatment.
- **Invalid state is always `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`** (+ `dark:` opacity variants) — the same pattern Button and Checkbox already use; `FormMessage`'s error text and `FormLabel`'s error-state color should pull from the same `--destructive`/`--destructive-foreground` tokens, not introduce a new error color.
- **Native-disabled elements use `disabled:pointer-events-none disabled:opacity-50`; Radix div-based parts use `data-disabled:`** — apply whichever matches what the primitive actually renders (Input/Textarea/native `<button>`-based Switch get the former; any Radix `Item`-style div needs the latter, exactly the distinction already drawn between Checkbox and DropdownMenuItem).
- **`data-slot` on every rendered part**, matching the convention used in literally every component built so far — needed for the same reasons (styling hooks, predictable structure, consistency with `Table`'s `data-slot="table-cell"` etc.).
- **No new floating-surface recipe for Select** — reuse the `shadow-md` / `bg-popover` / `text-popover-foreground` / `border-border` / `data-open:animate-in …` block already established by Popover and DropdownMenu, not a fourth variation of the same idea.
- **File organization**: one file per field primitive (`label.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `radio-group.tsx`, `switch.tsx`), and the six Form-layer pieces bundled into one `form.tsx` — matching how `dropdown-menu.tsx`, `toast.tsx`, and `table.tsx` already bundle their own tightly-coupled families into a single file rather than one-file-per-export.
- **No "use client" on Input/Textarea/Label** — they hold no internal state and aren't wrapping a stateful Radix primitive, the same reason `Button`/`Badge`/`Table` don't need it either. Select/RadioGroup/Switch and the entire Form-validation cluster **do** need it, same reasoning as Checkbox/Popover/DropdownMenu/Dialog/Tooltip/Toast.

Waiting for approval before building any of this.
