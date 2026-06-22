"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

function InteractiveExample() {
  const [checked, setChecked] = React.useState(false)

  return (
    <div className="flex items-center gap-2">
      <Switch id="email-notifications" checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor="email-notifications">
        Email notifications — currently {checked ? "on" : "off"}
      </Label>
    </div>
  )
}

export default function SwitchDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Switch demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Off/on states, an interactive toggle, disabled, and the four <code>status</code> values.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Off / On</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Switch id="switch-off" />
              <Label htmlFor="switch-off">Off</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-on" defaultChecked />
              <Label htmlFor="switch-on">On</Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Interactive</h2>
          <InteractiveExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Disabled (off and on)
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Switch id="switch-disabled-off" disabled />
              <Label htmlFor="switch-disabled-off" disabled>
                Off, disabled
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-disabled-on" disabled defaultChecked />
              <Label htmlFor="switch-disabled-on" disabled>
                On, disabled
              </Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status (default / success / warning / error)
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Switch id="switch-status-default" defaultChecked />
              <Label htmlFor="switch-status-default">Auto-approve POs under $500</Label>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Switch id="switch-status-success" status="success" defaultChecked />
                <Label htmlFor="switch-status-success">Two-factor authentication</Label>
              </div>
              <p className="text-caption text-success-text">Enabled and verified.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Switch id="switch-status-warning" status="warning" defaultChecked />
                <Label htmlFor="switch-status-warning">Auto-approve POs under $500</Label>
              </div>
              <p className="text-caption text-warning-text">
                Auto-approval is on for this vendor despite an open dispute — review before
                relying on it.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Switch id="switch-status-error" status="error" />
                <Label htmlFor="switch-status-error" required>
                  Accept data retention policy
                </Label>
              </div>
              <p className="text-caption text-destructive">
                This setting must be enabled before continuing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
