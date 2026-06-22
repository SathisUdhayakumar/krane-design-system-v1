"use client"

import * as React from "react"

import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

const VENDORS: ComboboxOption[] = [
  { value: "sterling-rebar", label: "Sterling Rebar Co." },
  { value: "granite-supply", label: "Granite Supply Ltd." },
  { value: "apex-electrical", label: "Apex Electrical" },
  { value: "coastal-concrete", label: "Coastal Concrete" },
  { value: "vantage-glazing", label: "Vantage Glazing" },
  { value: "northwind-timber", label: "Northwind Timber" },
  { value: "summit-steel", label: "Summit Steel Works" },
  { value: "pinnacle-plumbing", label: "Pinnacle Plumbing Supply" },
  { value: "ironclad-fasteners", label: "Ironclad Fasteners" },
  { value: "meridian-hvac", label: "Meridian HVAC Distributors" },
  { value: "crestview-masonry", label: "Crestview Masonry" },
  { value: "harborline-logistics", label: "Harborline Logistics" },
  { value: "brightline-electrical", label: "Brightline Electrical Supply" },
  { value: "cornerstone-aggregates", label: "Cornerstone Aggregates" },
  { value: "allied-roofing", label: "Allied Roofing Materials" },
]

const MANUFACTURERS: ComboboxOption[] = [
  { value: "owens-corning", label: "Owens Corning" },
  { value: "certainteed", label: "CertainTeed" },
  { value: "usg", label: "USG" },
  { value: "sherwin-williams", label: "Sherwin-Williams" },
  { value: "kohler", label: "Kohler" },
  { value: "andersen-windows", label: "Andersen Windows" },
  { value: "trane", label: "Trane" },
  { value: "carrier", label: "Carrier" },
  { value: "schneider-electric", label: "Schneider Electric" },
  { value: "hilti", label: "Hilti" },
  { value: "3m", label: "3M" },
  { value: "simpson-strong-tie", label: "Simpson Strong-Tie" },
]

const USERS: ComboboxOption[] = [
  { value: "jordan-lee", label: "Jordan Lee" },
  { value: "casey-morgan", label: "Casey Morgan" },
  { value: "priya-nair", label: "Priya Nair" },
  { value: "marcus-webb", label: "Marcus Webb" },
  { value: "elena-castillo", label: "Elena Castillo" },
  { value: "sam-okafor", label: "Sam Okafor" },
  { value: "taylor-brooks", label: "Taylor Brooks" },
  { value: "devon-patel", label: "Devon Patel" },
]

const PROJECTS: ComboboxOption[] = [
  { value: "riverside-tower", label: "Riverside Tower — Phase 2" },
  { value: "maple-street", label: "Maple Street Office Renovation" },
  { value: "harbor-logistics", label: "Harbor District Logistics Center" },
  { value: "crestpoint-medical", label: "Crestpoint Medical Campus" },
  { value: "lakeside-manufacturing", label: "Lakeside Manufacturing Expansion" },
  { value: "birchwood-senior", label: "Birchwood Senior Living" },
]

const MATERIALS: ComboboxOption[] = [
  { value: "ready-mix-4000", label: "Ready-Mix Concrete, 4000 PSI", group: "03 — Concrete" },
  { value: "rebar-4-60", label: "Rebar, #4 Grade 60", group: "03 — Concrete" },
  { value: "form-ties", label: "Concrete Form Ties", group: "03 — Concrete" },
  {
    value: "spray-foam-r21",
    label: "Spray Foam Insulation, R-21",
    group: "07 — Thermal & Moisture Protection",
  },
  {
    value: "tpo-membrane",
    label: "TPO Roofing Membrane",
    group: "07 — Thermal & Moisture Protection",
  },
  { value: "rooftop-10ton", label: "Rooftop Package Unit, 10 Ton", group: "23 — HVAC" },
  { value: "vav-reheat", label: "VAV Box w/ Reheat", group: "23 — HVAC" },
  { value: "thhn-12awg", label: "THHN Copper Wire, 12 AWG", group: "26 — Electrical" },
  { value: "panelboard-200a", label: "200A Panelboard", group: "26 — Electrical" },
]

function VendorPickerExample() {
  const [value, setValue] = React.useState<string | undefined>()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="vendor-picker">Vendor</Label>
      <Combobox
        id="vendor-picker"
        value={value}
        onValueChange={setValue}
        options={VENDORS}
        placeholder="Select a vendor"
        searchPlaceholder="Search vendors…"
        emptyMessage="No vendors found."
      />
      <p className="text-caption text-muted-foreground">
        15 vendors — search by name, and clear a selection with the × once one is picked.
      </p>
    </div>
  )
}

function ManufacturerPickerExample() {
  const [value, setValue] = React.useState<string | undefined>()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="manufacturer-picker">Manufacturer</Label>
      <Combobox
        id="manufacturer-picker"
        value={value}
        onValueChange={setValue}
        options={MANUFACTURERS}
        placeholder="Select a manufacturer"
        searchPlaceholder="Search manufacturers…"
        emptyMessage="No manufacturers found."
      />
    </div>
  )
}

function UserPickerExample() {
  const [value, setValue] = React.useState<string | undefined>()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="user-picker">Assigned to</Label>
      <Combobox
        id="user-picker"
        value={value}
        onValueChange={setValue}
        options={USERS}
        placeholder="Select a user"
        searchPlaceholder="Search users…"
        emptyMessage="No users found."
      />
    </div>
  )
}

function ProjectPickerExample() {
  const [value, setValue] = React.useState<string | undefined>()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="project-picker">Project</Label>
      <Combobox
        id="project-picker"
        value={value}
        onValueChange={setValue}
        options={PROJECTS}
        placeholder="Select a project"
        searchPlaceholder="Search projects…"
        emptyMessage="No projects found."
      />
    </div>
  )
}

function MaterialPickerExample() {
  const [value, setValue] = React.useState<string | undefined>()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="material-picker">Material</Label>
      <Combobox
        id="material-picker"
        value={value}
        onValueChange={setValue}
        options={MATERIALS}
        placeholder="Select a material"
        searchPlaceholder="Search materials…"
        emptyMessage="No materials found."
      />
      <p className="text-caption text-muted-foreground">
        Grouped by CSI division — the one picker in this set with a real, named grouping
        dimension (per <code>COMBOBOX_FOUNDATION.md</code> §8).
      </p>
    </div>
  )
}

function DisabledAndReadOnlyExample() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="disabled-vendor-picker" disabled>
          Vendor
        </Label>
        <Combobox
          id="disabled-vendor-picker"
          disabled
          options={VENDORS}
          placeholder="Select a vendor"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="readonly-vendor-picker">Vendor</Label>
        <Combobox
          id="readonly-vendor-picker"
          readOnly
          value="sterling-rebar"
          options={VENDORS}
        />
      </div>
      <p className="text-caption text-muted-foreground">
        Read-only hides the chevron (and the clear control) entirely, stays full-opacity, and
        can&apos;t be opened — the same correction already applied to <code>Select</code>.
      </p>
    </div>
  )
}

function EmptyStateExample() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="empty-vendor-picker">Vendor (empty catalog)</Label>
      <Combobox
        id="empty-vendor-picker"
        options={[]}
        placeholder="Select a vendor"
        searchPlaceholder="Search vendors…"
        emptyMessage="No vendors found."
      />
      <p className="text-caption text-muted-foreground">
        Open it — <code>Command.Empty</code> renders immediately since there are zero options.
      </p>
    </div>
  )
}

function LoadingStateExample() {
  const [value, setValue] = React.useState<string | undefined>()
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleOpenChange(open: boolean) {
    if (open && !loaded) {
      setLoading(true)
      timeoutRef.current = setTimeout(() => {
        setLoading(false)
        setLoaded(true)
      }, 900)
    }
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="loading-vendor-picker">Vendor (simulated fetch)</Label>
      <Combobox
        id="loading-vendor-picker"
        value={value}
        onValueChange={setValue}
        onOpenChange={handleOpenChange}
        loading={loading}
        options={loaded ? VENDORS : []}
        placeholder="Select a vendor"
        searchPlaceholder="Search vendors…"
        emptyMessage="No vendors found."
      />
      <p className="text-caption text-muted-foreground">
        Opening it the first time simulates a ~900ms fetch — <code>Command.Loading</code> renders
        skeleton rows, gated so it never overlaps the empty state at the same time
        (<code>COMBOBOX_FOUNDATION.md</code> §6). Not a real network call.
      </p>
    </div>
  )
}

export default function ComboboxDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Combobox demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        The searchable half of Select v1 — open-ended entity catalogs (vendor, manufacturer,
        user, project, material) that a plain <code>Select</code> can&apos;t comfortably cover.
        See <code>SELECT_FOUNDATION.md</code> / <code>COMBOBOX_FOUNDATION.md</code>.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Vendor picker</h2>
          <VendorPickerExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Manufacturer picker
          </h2>
          <ManufacturerPickerExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">User picker</h2>
          <UserPickerExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Project picker</h2>
          <ProjectPickerExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Material picker (grouped options)
          </h2>
          <MaterialPickerExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Disabled vs. read-only
          </h2>
          <DisabledAndReadOnlyExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Empty state</h2>
          <EmptyStateExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Loading state</h2>
          <LoadingStateExample />
        </section>
      </div>
    </div>
  )
}
