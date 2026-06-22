"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function DismissibleExample() {
  const [visible, setVisible] = React.useState(true)

  if (!visible) {
    return (
      <p className="text-caption text-muted-foreground">
        Dismissed. <code>onDismiss</code> removed it from the DOM, not just hidden it.
      </p>
    )
  }

  return (
    <Alert variant="success" onDismiss={() => setVisible(false)}>
      <AlertTitle>PO submitted for approval</AlertTitle>
      <AlertDescription>
        PO-10231 was sent to Jordan Lee for review. You&apos;ll be notified once it&apos;s
        approved.
      </AlertDescription>
    </Alert>
  )
}

function FormCompositionExample() {
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    // Simulated async submission failure — not a real network call, mirrors the
    // setTimeout-driven convention already used in the Input/Combobox/Form demos.
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSubmitting(false)
    setError("3 of 12 line items failed validation.")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert variant="error" role="alert" primaryAction={{ label: "Review line items", onClick: () => {} }}>
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="po-number-demo">PO number</Label>
        <Input id="po-number-demo" placeholder="PO-10231" />
      </div>
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Submitting…" : "Submit"}
      </Button>
      <p className="text-caption text-muted-foreground">
        This error <code>Alert</code> appears dynamically, right after a failed submit — exactly
        the case where <code>role=&quot;alert&quot;</code> is correct (ALERT_FOUNDATION.md §8),
        unlike the static examples above which default to a named <code>region</code> landmark
        instead.
      </p>
    </form>
  )
}

export default function AlertDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Alert demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Persistent, page/section-level status messages — distinct from <code>Toast</code>
        (transient) and <code>FormMessage</code> (field-level). All four <code>variant</code>{" "}
        values, dismissible vs. non-dismissible, actions, title-only, and a dynamic{" "}
        <code>role=&quot;alert&quot;</code> composition.
      </p>

      <div className="flex max-w-2xl flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            All variants (title + description)
          </h2>
          <div className="flex flex-col gap-3">
            <Alert variant="info">
              <AlertTitle>New: bulk PO approval is now available</AlertTitle>
              <AlertDescription>
                Select multiple purchase orders from the list view to approve them in one step.
              </AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>PO submitted for approval</AlertTitle>
              <AlertDescription>
                PO-10231 was sent to Jordan Lee for review.
              </AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Open dispute on this vendor</AlertTitle>
              <AlertDescription>
                Sterling Rebar Co. has an open billing dispute — review before proceeding.
              </AlertDescription>
            </Alert>
            <Alert variant="error">
              <AlertTitle>Submission failed</AlertTitle>
              <AlertDescription>3 of 12 line items failed validation.</AlertDescription>
            </Alert>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Title only</h2>
          <Alert variant="info">
            <AlertTitle>Vendor catalog synced 2 minutes ago</AlertTitle>
          </Alert>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Long content</h2>
          <Alert variant="warning">
            <AlertTitle>Net 60 payment terms require additional review</AlertTitle>
            <AlertDescription>
              This vendor&apos;s standard payment terms are Net 30. The purchase order you&apos;re
              creating specifies Net 60, which exceeds what was negotiated in the current
              contract. Net 60 terms require either Manual review or Escalation routing before
              this PO can be auto-approved — Auto-approve is not available while these terms are
              selected. If this is intentional (for example, a one-time accommodation agreed with
              the vendor outside the standard contract), note the reason in the PO before
              submitting so the reviewer has context.
            </AlertDescription>
          </Alert>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Dismissible (success — safe to dismiss once acknowledged)
          </h2>
          <DismissibleExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Non-dismissible (error — blocking, per ALERT_FOUNDATION.md §7)
          </h2>
          <div className="flex flex-col gap-3">
            <Alert variant="error">
              <AlertTitle>Submission failed</AlertTitle>
              <AlertDescription>3 of 12 line items failed validation.</AlertDescription>
            </Alert>
            <p className="text-caption text-muted-foreground">
              No close control — dismissing this wouldn&apos;t fix the line items, and removing
              the only visible indication of what&apos;s broken would be a real regression, not a
              convenience.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            One action (primary only)
          </h2>
          <Alert
            variant="warning"
            primaryAction={{ label: "Review now", onClick: () => {} }}
          >
            <AlertTitle>Open dispute on this vendor</AlertTitle>
            <AlertDescription>
              Sterling Rebar Co. has an open billing dispute — review before proceeding.
            </AlertDescription>
          </Alert>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Two actions (primary + secondary)
          </h2>
          <Alert
            variant="error"
            primaryAction={{ label: "Review line items", onClick: () => {} }}
            secondaryAction={{ label: "Cancel submission", onClick: () => {} }}
          >
            <AlertTitle>Submission failed</AlertTitle>
            <AlertDescription>3 of 12 line items failed validation.</AlertDescription>
          </Alert>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Visually-hidden title
          </h2>
          <div className="flex flex-col gap-3">
            <Alert variant="info">
              <AlertTitle visuallyHidden>Information</AlertTitle>
              <AlertDescription>
                The title above is in the accessibility tree but not rendered visually — the icon
                and tinted surface already carry the signal for sighted users.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Form composition — dynamic role=&quot;alert&quot;
          </h2>
          <FormCompositionExample />
        </section>
      </div>
    </div>
  )
}
