"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type StatusVariant = "success" | "warning" | "pending" | "info" | "destructive"

type PurchaseOrder = {
  po: string
  vendor: string
  amount: string
  status: StatusVariant
  statusLabel: string
  risk: RiskLevel
}

const PURCHASE_ORDERS: PurchaseOrder[] = [
  { po: "PO-10231", vendor: "Sterling Rebar Co.", amount: "$84,200", status: "success", statusLabel: "Approved", risk: "low" },
  { po: "PO-10232", vendor: "Granite Supply Ltd.", amount: "$12,900", status: "warning", statusLabel: "Warning", risk: "medium" },
  { po: "PO-10233", vendor: "Apex Electrical", amount: "$210,000", status: "pending", statusLabel: "Pending", risk: "high" },
  { po: "PO-10234", vendor: "Coastal Concrete", amount: "$56,300", status: "warning", statusLabel: "Warning", risk: "high" },
  { po: "PO-10235", vendor: "Vantage Glazing", amount: "$98,750", status: "destructive", statusLabel: "Overdue", risk: "critical" },
  { po: "PO-10236", vendor: "Northwind Timber", amount: "$31,400", status: "info", statusLabel: "Info", risk: "low" },
]

const MANY_ROWS: PurchaseOrder[] = Array.from({ length: 14 }, (_, i) => ({
  ...PURCHASE_ORDERS[i % PURCHASE_ORDERS.length],
  po: `PO-${10300 + i}`,
}))

function BasicTableExample() {
  return (
    <Table>
      <TableCaption>Monthly material spend by category.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Spend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Steel</TableCell>
          <TableCell>8</TableCell>
          <TableCell>$84,200</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Concrete</TableCell>
          <TableCell>5</TableCell>
          <TableCell>$56,300</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>MEP</TableCell>
          <TableCell>3</TableCell>
          <TableCell>$210,000</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>16</TableCell>
          <TableCell>$350,500</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

function ProcurementTableExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO Number</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Risk</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {PURCHASE_ORDERS.map((row) => (
          <TableRow key={row.po}>
            <TableCell className="font-medium">{row.po}</TableCell>
            <TableCell className="text-muted-foreground">{row.vendor}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>
              <Badge variant={row.status}>{row.statusLabel}</Badge>
            </TableCell>
            <TableCell>
              <RiskIndicator level={row.risk} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SelectableTableExample() {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox checked={headerChecked} onCheckedChange={toggleAll} aria-label="Select all rows" />
          </TableHead>
          <TableHead>PO Number</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {PURCHASE_ORDERS.map((row) => (
          <TableRow key={row.po} data-selected={selected.has(row.po) ? "true" : "false"}>
            <TableCell>
              <Checkbox
                checked={selected.has(row.po)}
                onCheckedChange={() => toggleRow(row.po)}
                aria-label={`Select row ${row.po}`}
              />
            </TableCell>
            <TableCell className="font-medium">{row.po}</TableCell>
            <TableCell className="text-muted-foreground">{row.vendor}</TableCell>
            <TableCell>
              <Badge variant={row.status}>{row.statusLabel}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function StickyHeaderTableExample() {
  return (
    <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
      <Table className="rounded-none border-0">
        <TableHeader className="sticky top-0 z-sticky bg-card">
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MANY_ROWS.map((row) => (
            <TableRow key={row.po}>
              <TableCell className="font-medium">{row.po}</TableCell>
              <TableCell className="text-muted-foreground">{row.vendor}</TableCell>
              <TableCell>
                <Badge variant={row.status}>{row.statusLabel}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CompactDensityTableExample() {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>PO Number</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {PURCHASE_ORDERS.map((row) => (
          <TableRow key={row.po}>
            <TableCell className="font-medium">{row.po}</TableCell>
            <TableCell className="text-muted-foreground">{row.vendor}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>
              <Badge variant={row.status}>{row.statusLabel}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EmptyStateTableExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO Number</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
            No purchase orders match the current filters.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function LoadingStateTableExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO Number</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }, (_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-36" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function TableDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Table demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Basic, procurement, selectable, sticky-header, compact, empty, and loading examples.
      </p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Basic table</h2>
          <BasicTableExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Procurement orders</h2>
          <ProcurementTableExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Selectable table (Checkbox)
          </h2>
          <SelectableTableExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Sticky header (scroll the container)
          </h2>
          <StickyHeaderTableExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Compact density</h2>
          <CompactDensityTableExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Empty state</h2>
          <EmptyStateTableExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Loading state</h2>
          <LoadingStateTableExample />
        </section>
      </div>
    </div>
  )
}
