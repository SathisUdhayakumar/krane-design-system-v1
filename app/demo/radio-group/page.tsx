"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

function ShippingMethodExample() {
  return (
    <RadioGroup defaultValue="standard">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="ship-standard" />
        <Label htmlFor="ship-standard">Standard (5–7 business days)</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="expedited" id="ship-expedited" />
        <Label htmlFor="ship-expedited">Expedited (2–3 business days)</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="overnight" id="ship-overnight" disabled />
        <Label htmlFor="ship-overnight" disabled>
          Overnight (not available for this destination)
        </Label>
      </div>
    </RadioGroup>
  )
}

function HazmatExample() {
  return (
    <RadioGroup defaultValue="no" orientation="horizontal">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="yes" id="hazmat-yes" />
        <Label htmlFor="hazmat-yes">Yes</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="no" id="hazmat-no" />
        <Label htmlFor="hazmat-no">No</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="unknown" id="hazmat-unknown" />
        <Label htmlFor="hazmat-unknown">Unknown</Label>
      </div>
    </RadioGroup>
  )
}

function ApprovalRoutingExample() {
  const groupLabelId = React.useId()

  return (
    <div className="flex flex-col gap-3">
      <Label id={groupLabelId}>Approval routing</Label>
      <RadioGroup aria-labelledby={groupLabelId} defaultValue="manual">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="auto" id="routing-auto" />
          <Label htmlFor="routing-auto">Auto-approve</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="manual" id="routing-manual" />
          <Label htmlFor="routing-manual">Manual review</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="escalate" id="routing-escalate" />
          <Label htmlFor="routing-escalate">Escalate</Label>
        </div>
      </RadioGroup>
      <p className="text-caption text-muted-foreground">
        The group has no single control to point <code>htmlFor</code> at, so &quot;Approval
        routing&quot; is associated via <code>aria-labelledby</code> — each option still gets
        its own ordinary <code>htmlFor</code>/<code>id</code> label.
      </p>
    </div>
  )
}

function StatusExamples() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label id="status-default-label">Payment terms</Label>
        <RadioGroup aria-labelledby="status-default-label" defaultValue="net30">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net30" id="terms-net30-default" />
            <Label htmlFor="terms-net30-default">Net 30</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net60" id="terms-net60-default" />
            <Label htmlFor="terms-net60-default">Net 60</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label id="status-success-label">Payment terms</Label>
        <RadioGroup aria-labelledby="status-success-label" defaultValue="net30" status="success">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net30" id="terms-net30-success" />
            <Label htmlFor="terms-net30-success">Net 30</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net60" id="terms-net60-success" />
            <Label htmlFor="terms-net60-success">Net 60</Label>
          </div>
        </RadioGroup>
        <p className="text-caption text-success-text">
          Terms confirmed against the vendor contract.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label id="status-warning-label">Payment terms</Label>
        <RadioGroup aria-labelledby="status-warning-label" defaultValue="net60" status="warning">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net30" id="terms-net30-warning" />
            <Label htmlFor="terms-net30-warning">Net 30</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net60" id="terms-net60-warning" />
            <Label htmlFor="terms-net60-warning">Net 60</Label>
          </div>
        </RadioGroup>
        <p className="text-caption text-warning-text">
          Net 60 exceeds this vendor&apos;s usual terms — confirm before submitting.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label id="status-error-label" required>
          Payment terms
        </Label>
        <RadioGroup aria-labelledby="status-error-label" status="error">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net30" id="terms-net30-error" />
            <Label htmlFor="terms-net30-error">Net 30</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="net60" id="terms-net60-error" />
            <Label htmlFor="terms-net60-error">Net 60</Label>
          </div>
        </RadioGroup>
        <p className="text-caption text-destructive">Payment terms are required.</p>
      </div>
    </div>
  )
}

function ControlledExample() {
  const [value, setValue] = React.useState("manual-review")
  const groupLabelId = React.useId()

  return (
    <div className="flex flex-col gap-3">
      <Label id={groupLabelId}>Escalation path</Label>
      <RadioGroup aria-labelledby={groupLabelId} value={value} onValueChange={setValue}>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="auto-approve" id="escalation-auto" />
          <Label htmlFor="escalation-auto">Auto-approve</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="manual-review" id="escalation-manual" />
          <Label htmlFor="escalation-manual">Manual review</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="escalate" id="escalation-escalate" />
          <Label htmlFor="escalation-escalate">Escalate to finance</Label>
        </div>
      </RadioGroup>
      <p className="text-caption text-muted-foreground">
        Currently selected: <code>{value}</code>
      </p>
    </div>
  )
}

function DisabledGroupExample() {
  return (
    <div className="flex flex-col gap-3">
      <Label id="disabled-group-label" disabled>
        Shipping method
      </Label>
      <RadioGroup aria-labelledby="disabled-group-label" defaultValue="standard" disabled>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="standard" id="disabled-ship-standard" />
          <Label htmlFor="disabled-ship-standard" disabled>
            Standard
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="expedited" id="disabled-ship-expedited" />
          <Label htmlFor="disabled-ship-expedited" disabled>
            Expedited
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

export default function RadioGroupDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Radio Group demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Vertical and horizontal groups, group labeling via <code>aria-labelledby</code>, the
        four <code>status</code> values, a controlled example, and a fully disabled group.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Vertical group, one item disabled
          </h2>
          <ShippingMethodExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Horizontal group</h2>
          <HazmatExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Group label (aria-labelledby) + per-item labels
          </h2>
          <ApprovalRoutingExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status (default / success / warning / error)
          </h2>
          <StatusExamples />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Controlled (selected value reflected below)
          </h2>
          <ControlledExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Disabled group</h2>
          <DisabledGroupExample />
        </section>
      </div>
    </div>
  )
}
