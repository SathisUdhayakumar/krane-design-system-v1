"use client"

import * as React from "react"
import { DollarSign, Eye, EyeOff, Lock, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PasswordFieldExample() {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Lock
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="password"
          type={visible ? "text" : "password"}
          placeholder="Enter password"
          className="pl-8 pr-9"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p className="text-caption text-muted-foreground">
        Composed manually, not via the <code>suffix</code> slot — interactive trailing
        elements need their own click handler, which is outside that slot&apos;s
        decorative contract.
      </p>
    </div>
  )
}

function ClearableSearchExample() {
  const [value, setValue] = React.useState("Sterling Rebar")

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="clearable-search">Vendor search</Label>
      <Input
        id="clearable-search"
        prefix={<Search className="size-4" aria-hidden="true" />}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        clearButton={value.length > 0}
        onClear={() => setValue("")}
        placeholder="Search vendors…"
      />
      <p className="text-caption text-muted-foreground">
        <code>clearButton</code> is just a boolean — this example ties it to
        <code> value.length &gt; 0</code> itself, since Input has no opinion on when a
        clear action should appear.
      </p>
    </div>
  )
}

function LoadingAvailabilityExample() {
  const [value, setValue] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(next: string) {
    setValue(next)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (next.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    timeoutRef.current = setTimeout(() => setLoading(false), 900)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="availability">Vendor name</Label>
      <Input
        id="availability"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        loading={loading}
        placeholder="Type to check availability…"
      />
      <p className="text-caption text-muted-foreground">
        Simulates an async uniqueness check — <code>loading</code> takes the trailing
        slot over any <code>suffix</code>/<code>clearButton</code> while true.
      </p>
    </div>
  )
}

export default function InputDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Input demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Default, sizes, states, status, prefix/suffix, clear button, loading, and two
        fully-composed interactive examples.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Default</h2>
          <div className="flex flex-col gap-3">
            <Input placeholder="Vendor name" />
            <Input defaultValue="Sterling Rebar Co." />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Sizes</h2>
          <div className="flex flex-col gap-3">
            <Input size="sm" placeholder="Small" />
            <Input size="default" placeholder="Default" />
            <Input size="lg" placeholder="Large" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Disabled vs. read-only
          </h2>
          <div className="flex flex-col gap-3">
            <Input disabled placeholder="Disabled" defaultValue="Can't edit this" />
            <Input readOnly defaultValue="PO-10231 (read-only, still selectable)" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status (default / success / warning / error)
          </h2>
          <div className="flex flex-col gap-3">
            <Input placeholder="Default" />
            <div className="flex flex-col gap-1.5">
              <Input status="success" defaultValue="vendor@example.com" />
              <p className="text-caption text-success-text">Email verified.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Input status="warning" defaultValue="98007" />
              <p className="text-caption text-warning-text">
                This ZIP code doesn&apos;t match the billing state on file.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Input status="error" defaultValue="not-a-valid-id" />
              <p className="text-caption text-destructive">
                Tax ID must be in the format XX-XXXXXXX.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Prefix / suffix
          </h2>
          <div className="flex flex-col gap-3">
            <Input prefix="$" suffix="USD" placeholder="0.00" />
            <Input prefix={<DollarSign className="size-4" aria-hidden="true" />} placeholder="Amount" />
            <Input suffix="kg" placeholder="Weight" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Clear button</h2>
          <ClearableSearchExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Loading</h2>
          <div className="flex flex-col gap-3">
            <Input loading defaultValue="Static example" readOnly />
            <LoadingAvailabilityExample />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Native types</h2>
          <div className="flex flex-col gap-3">
            <Input type="email" placeholder="name@company.com" />
            <Input type="number" placeholder="0" min={0} max={100} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Composed interactive example
          </h2>
          <PasswordFieldExample />
        </section>
      </div>
    </div>
  )
}
