"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

function RadioGroupExample() {
  const [value, setValue] = React.useState("card")
  const groupLabelId = React.useId()

  return (
    <div className="flex flex-col gap-3">
      <Label id={groupLabelId}>Payment method</Label>
      <RadioGroup aria-labelledby={groupLabelId} value={value} onValueChange={setValue}>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="card" id="payment-card" />
          <Label htmlFor="payment-card">Credit card</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="bank" id="payment-bank" />
          <Label htmlFor="payment-bank">Bank transfer</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="check" id="payment-check" />
          <Label htmlFor="payment-check">Check</Label>
        </div>
      </RadioGroup>
      <p className="text-caption text-muted-foreground">
        The group itself has no single control to point <code>htmlFor</code> at, so
        &quot;Payment method&quot; is associated via <code>aria-labelledby</code> on the
        <code> RadioGroup</code> root. Each option still gets its own ordinary{" "}
        <code>htmlFor</code>/<code>id</code> label — two label roles, two mechanisms.
      </p>
    </div>
  )
}

export default function LabelDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Label demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Standard <code>htmlFor</code> labeling, group labeling via{" "}
        <code>aria-labelledby</code>, and the required/disabled/read-only states.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Standard labeling (stacked above)
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-name">Vendor name</Label>
              <Input id="vendor-name" placeholder="Sterling Rebar Co." />
            </div>
            <p className="text-caption text-muted-foreground">
              Renders with the <code>text-label</code> token (0.875rem / line-height 1.2 /
              weight 500) — not a hand-rolled <code>text-sm font-medium</code>.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Inline labeling (beside the control)
          </h2>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">I agree to the terms and conditions</Label>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Required</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tax-id" required>
              Tax ID
            </Label>
            <Input id="tax-id" required placeholder="XX-XXXXXXX" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Disabled (label-before-control order)
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="disabled-vendor" disabled>
                Vendor name
              </Label>
              <Input id="disabled-vendor" disabled defaultValue="Can't edit this" />
            </div>
            <p className="text-caption text-muted-foreground">
              The label is dimmed via an explicit <code>disabled</code> prop, set
              alongside the input&apos;s own <code>disabled</code> — not a{" "}
              <code>peer-disabled:</code> selector, which would silently do nothing here
              since the label comes <em>before</em> the control in DOM order.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Read-only</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="readonly-po">PO number</Label>
              <Input id="readonly-po" readOnly defaultValue="PO-10231" />
            </div>
            <p className="text-caption text-muted-foreground">
              No visual change on the label, deliberately — read-only content is still
              real, active data, not turned off the way disabled content is.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Radio group — group label + per-item labels
          </h2>
          <RadioGroupExample />
        </section>
      </div>
    </div>
  )
}
