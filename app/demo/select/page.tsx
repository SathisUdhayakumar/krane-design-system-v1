"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CSI_DIVISIONS = [
  { value: "02", label: "02 — Existing Conditions" },
  { value: "03", label: "03 — Concrete" },
  { value: "04", label: "04 — Masonry" },
  { value: "05", label: "05 — Metals" },
  { value: "06", label: "06 — Wood, Plastics & Composites" },
  { value: "07", label: "07 — Thermal & Moisture Protection" },
  { value: "08", label: "08 — Openings" },
  { value: "09", label: "09 — Finishes" },
  { value: "10", label: "10 — Specialties" },
  { value: "11", label: "11 — Equipment" },
  { value: "12", label: "12 — Furnishings" },
  { value: "21", label: "21 — Fire Suppression" },
  { value: "22", label: "22 — Plumbing" },
  { value: "23", label: "23 — HVAC" },
  { value: "26", label: "26 — Electrical" },
  { value: "27", label: "27 — Communications" },
  { value: "31", label: "31 — Earthwork" },
  { value: "32", label: "32 — Exterior Improvements" },
]

function ControlledStatusSelect() {
  const [status, setStatus] = React.useState("pending")

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="po-status">PO status</Label>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger id="po-status">
          <SelectValue placeholder="Select a status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending">Pending approval</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-caption text-muted-foreground">
        Currently selected: <code>{status}</code>
      </p>
    </div>
  )
}

export default function SelectDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Select demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Bounded, fixed-enumeration pickers — sizes, grouped options, disabled vs. read-only,
        validation states, and a long scrollable list. Open-ended entity pickers (vendor,
        manufacturer, material, project, user) are <code>Combobox</code>&apos;s job, not Select&apos;s
        — see <code>SELECT_FOUNDATION.md</code>.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Default</h2>
          <ControlledStatusSelect />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Grouped options (CSI divisions)
          </h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="csi-division">CSI division</Label>
            <Select>
              <SelectTrigger id="csi-division">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sitework &amp; Structure</SelectLabel>
                  <SelectItem value="02">02 — Existing Conditions</SelectItem>
                  <SelectItem value="03">03 — Concrete</SelectItem>
                  <SelectItem value="04">04 — Masonry</SelectItem>
                  <SelectItem value="05">05 — Metals</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Mechanical &amp; Electrical</SelectLabel>
                  <SelectItem value="21">21 — Fire Suppression</SelectItem>
                  <SelectItem value="22">22 — Plumbing</SelectItem>
                  <SelectItem value="23">23 — HVAC</SelectItem>
                  <SelectItem value="26">26 — Electrical</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Sizes</h2>
          <div className="flex flex-col gap-3">
            <Select defaultValue="approved">
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Small</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="approved">
              <SelectTrigger size="default">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Default</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="approved">
              <SelectTrigger size="lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Disabled vs. read-only
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="disabled-division" disabled>
                CSI division
              </Label>
              <Select disabled>
                <SelectTrigger id="disabled-division">
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="03">03 — Concrete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="readonly-division">CSI division</Label>
              <Select defaultValue="22">
                <SelectTrigger id="readonly-division" readOnly>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22">22 — Plumbing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-caption text-muted-foreground">
              Read-only hides the chevron entirely — a field that can&apos;t be opened shouldn&apos;t
              display the affordance that says it can — and stays full-opacity, unlike disabled.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status (default / success / warning / error)
          </h2>
          <div className="flex flex-col gap-3">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="03">03 — Concrete</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-1.5">
              <Select defaultValue="03">
                <SelectTrigger status="success">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="03">03 — Concrete</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-caption text-success-text">Division confirmed against the PO.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Select defaultValue="04">
                <SelectTrigger status="warning">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="04">04 — Masonry</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-caption text-warning-text">
                This division doesn&apos;t match the line item&apos;s material category.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Select>
                <SelectTrigger status="error">
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="03">03 — Concrete</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-caption text-destructive">CSI division is required.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Long list (scroll buttons)
          </h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="long-division">CSI division (all)</Label>
            <Select>
              <SelectTrigger id="long-division">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {CSI_DIVISIONS.map((division) => (
                  <SelectItem key={division.value} value={division.value}>
                    {division.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-caption text-muted-foreground">
              {CSI_DIVISIONS.length} divisions — exercises{" "}
              <code>ScrollUpButton</code>/<code>ScrollDownButton</code>, not virtualization.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Mixed-form composition (Input + Select)
          </h2>
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-name-select-mixed" required>
                Vendor name
              </Label>
              <Input id="vendor-name-select-mixed" placeholder="Sterling Rebar Co." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="division-select-mixed" required>
                CSI division
              </Label>
              <Select>
                <SelectTrigger id="division-select-mixed">
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  {CSI_DIVISIONS.slice(0, 6).map((division) => (
                    <SelectItem key={division.value} value={division.value}>
                      {division.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
