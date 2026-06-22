"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stepper, StepperContent, StepperList, StepperStep } from "@/components/ui/stepper"

function OnboardingWizard() {
  const [step, setStep] = React.useState(0)
  const [reviewHasError, setReviewHasError] = React.useState(false)
  const lastStep = 3

  function goNext() {
    if (step < lastStep) setStep(step + 1)
  }
  function goBack() {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <Stepper currentStep={step} onStepChange={setStep}>
        <StepperList>
          <StepperStep label="Company Information" />
          <StepperStep label="Compliance Documents" optional />
          <StepperStep label="Banking Details" />
          <StepperStep label="Review & Submit" hasError={reviewHasError} />
        </StepperList>

        <StepperContent>
          <div className="flex flex-col gap-3 sm:max-w-sm">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-name">Vendor name</Label>
              <Input id="vendor-name" placeholder="Sterling Rebar Co." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tax-id">Tax ID</Label>
              <Input id="tax-id" placeholder="12-3456789" />
            </div>
          </div>
        </StepperContent>

        <StepperContent>
          <p className="max-w-sm text-sm text-muted-foreground">
            Upload a W-9 and certificate of insurance, or skip this step and submit them later —
            it&apos;s marked optional above.
          </p>
        </StepperContent>

        <StepperContent>
          <div className="flex flex-col gap-3 sm:max-w-sm">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="routing">Routing number</Label>
              <Input id="routing" placeholder="021000021" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="account">Account number</Label>
              <Input id="account" placeholder="••••••1234" />
            </div>
          </div>
        </StepperContent>

        <StepperContent>
          <p className="max-w-sm text-sm text-muted-foreground">
            Confirm the details above and submit. Stepper owns position only — this
            &quot;Submit&quot; action and any validation it runs belongs to the consumer&apos;s
            own form layer, the same separation <code>Tabs</code> already keeps from{" "}
            <code>Form</code>.
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={reviewHasError}
              onChange={(e) => setReviewHasError(e.target.checked)}
            />
            Simulate a validation error on this step
          </label>
        </StepperContent>
      </Stepper>

      <div className="flex gap-2">
        <Button variant="outline" onClick={goBack} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={goNext} disabled={step === lastStep}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default function StepperDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Stepper demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Two layers — <code>StepperList</code>/<code>StepperStep</code> (the indicator, usable
        standalone for read-only tracking) and <code>Stepper</code>/<code>StepperContent</code>{" "}
        (the interactive wizard layer). No Radix primitive, no validation logic — both stay the
        consumer&apos;s job, the same as <code>Tabs</code>.
      </p>

      <div className="flex max-w-2xl flex-col gap-12">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Interactive onboarding wizard
          </h2>
          <OnboardingWizard />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Read-only status tracker — no <code>Stepper</code> wrapper
          </h2>
          <StepperList currentStep={1}>
            <StepperStep label="Submitted" />
            <StepperStep label="Under Review" />
            <StepperStep label="Approved" />
          </StepperList>
          <p className="mt-3 text-caption text-muted-foreground">
            A submittal&apos;s lifecycle, driven by its own status field — no Next/Back, no{" "}
            <code>StepperContent</code>, and clicking a step does nothing (no{" "}
            <code>onStepChange</code> was supplied).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Completed steps</h2>
          <StepperList currentStep={3}>
            <StepperStep label="Company Information" />
            <StepperStep label="Compliance Documents" />
            <StepperStep label="Banking Details" />
            <StepperStep label="Review & Submit" />
          </StepperList>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Error state</h2>
          <StepperList currentStep={2}>
            <StepperStep label="Company Information" />
            <StepperStep label="Compliance Documents" hasError />
            <StepperStep label="Banking Details" />
            <StepperStep label="Review & Submit" />
          </StepperList>
          <p className="mt-3 text-caption text-muted-foreground">
            &quot;Compliance Documents&quot; was visited and is now invalid — the error icon and
            color are paired with a <code>sr-only</code> &quot;(error)&quot; suffix, not
            color-only.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Long labels</h2>
          <StepperList currentStep={1}>
            <StepperStep label="Confirm vendor tax and compliance documentation" />
            <StepperStep label="Review banking and remittance preferences" optional />
            <StepperStep label="Final approval and submission to procurement" />
          </StepperList>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Mobile behavior (360px container)
          </h2>
          <p className="mb-3 text-caption text-muted-foreground">
            Below <code>sm</code>, step labels hide — only the numbered/checked circles and
            connectors remain. The active step&apos;s label is never actually lost: it&apos;s
            still real, visible text in the &quot;Step X of Y&quot; heading inside{" "}
            <code>StepperContent</code> regardless of viewport.
          </p>
          <div className="w-[360px] overflow-hidden rounded-lg border border-border p-4">
            <StepperList currentStep={1}>
              <StepperStep label="Company Information" />
              <StepperStep label="Compliance Documents" />
              <StepperStep label="Banking Details" />
              <StepperStep label="Review & Submit" />
            </StepperList>
          </div>
        </section>
      </div>
    </div>
  )
}
