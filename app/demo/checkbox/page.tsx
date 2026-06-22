"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator"

type StatusVariant = "success" | "warning" | "pending" | "info" | "destructive"

const PURCHASE_ORDERS: {
  po: string
  vendor: string
  amount: string
  status: StatusVariant
  statusLabel: string
  risk: RiskLevel
}[] = [
  { po: "PO-10231", vendor: "Sterling Rebar Co.", amount: "$84,200", status: "success", statusLabel: "Approved", risk: "low" },
  { po: "PO-10232", vendor: "Granite Supply Ltd.", amount: "$12,900", status: "warning", statusLabel: "Warning", risk: "medium" },
  { po: "PO-10233", vendor: "Apex Electrical", amount: "$210,000", status: "pending", statusLabel: "Pending", risk: "high" },
  { po: "PO-10234", vendor: "Coastal Concrete", amount: "$56,300", status: "warning", statusLabel: "Warning", risk: "high" },
  { po: "PO-10235", vendor: "Vantage Glazing", amount: "$98,750", status: "destructive", statusLabel: "Overdue", risk: "critical" },
  { po: "PO-10236", vendor: "Northwind Timber", amount: "$31,400", status: "info", statusLabel: "Info", risk: "low" },
]

function SingleCheckboxExamples() {
  const [interactive, setInteractive] = React.useState(false)

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Single checkbox — all states</h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={interactive}
            onCheckedChange={(value) => setInteractive(value === true)}
          />
          Interactive — currently {interactive ? "checked" : "unchecked"}
        </label>
        <label className="flex items-center gap-2">
          <Checkbox defaultChecked={false} />
          Unchecked
        </label>
        <label className="flex items-center gap-2">
          <Checkbox defaultChecked />
          Checked
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked="indeterminate" onCheckedChange={() => {}} />
          Indeterminate
        </label>
        <label className="flex items-center gap-2 opacity-50">
          <Checkbox disabled />
          Disabled — unchecked
        </label>
        <label className="flex items-center gap-2 opacity-50">
          <Checkbox disabled defaultChecked />
          Disabled — checked
        </label>
        <label className="flex items-center gap-2">
          <Checkbox aria-invalid="true" />
          Invalid (failed validation)
        </label>
      </div>
    </section>
  )
}

function SelectableTable() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const allSelected = selected.size === PURCHASE_ORDERS.length
  const someSelected = selected.size > 0 && !allSelected
  const headerChecked: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
      ? "indeterminate"
      : false

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(PURCHASE_ORDERS.map((row) => row.po)))
  }

  function toggleRow(po: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(po)) {
        next.delete(po)
      } else {
        next.add(po)
      }
      return next
    })
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        Selectable table — row selection + bulk-select header
      </h2>
      <p className="mb-2 text-xs text-muted-foreground" role="status">
        {selected.size > 0 ? `${selected.size} of ${PURCHASE_ORDERS.length} selected` : "No rows selected"}
      </p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-10 px-4 py-2">
                <Checkbox
                  checked={headerChecked}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">PO Number</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Vendor</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Risk</th>
            </tr>
          </thead>
          <tbody>
            {PURCHASE_ORDERS.map((row) => (
              <tr
                key={row.po}
                data-selected={selected.has(row.po) ? "true" : "false"}
                className="border-b border-border last:border-0 hover:bg-muted/50 data-selected:bg-accent"
              >
                <td className="px-4 py-2">
                  <Checkbox
                    checked={selected.has(row.po)}
                    onCheckedChange={() => toggleRow(row.po)}
                    aria-label={`Select row ${row.po}`}
                  />
                </td>
                <td className="px-4 py-2 font-medium">{row.po}</td>
                <td className="px-4 py-2 text-muted-foreground">{row.vendor}</td>
                <td className="px-4 py-2">{row.amount}</td>
                <td className="px-4 py-2">
                  <Badge variant={row.status}>{row.statusLabel}</Badge>
                </td>
                <td className="px-4 py-2">
                  <RiskIndicator level={row.risk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function CheckboxDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Checkbox demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Single checkbox states, table row selection, and bulk-select header (tri-state).
      </p>
      <div className="flex flex-col gap-10">
        <SingleCheckboxExamples />
        <SelectableTable />
      </div>
    </div>
  )
}
