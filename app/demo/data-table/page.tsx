"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Check, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableEmptyState,
  type DataTableBulkAction,
} from "@/components/ui/data-table"
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator"
import { toast } from "@/hooks/use-toast"

type StatusVariant = "success" | "warning" | "pending" | "info" | "destructive"

type PurchaseOrder = {
  id: string
  po: string
  vendor: string
  amount: number
  status: StatusVariant
  statusLabel: string
  risk: RiskLevel
}

const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "PO-10231", po: "PO-10231", vendor: "Sterling Rebar Co.", amount: 84200, status: "success", statusLabel: "Approved", risk: "low" },
  { id: "PO-10232", po: "PO-10232", vendor: "Granite Supply Ltd.", amount: 12900, status: "warning", statusLabel: "Warning", risk: "medium" },
  { id: "PO-10233", po: "PO-10233", vendor: "Apex Electrical", amount: 210000, status: "pending", statusLabel: "Pending", risk: "high" },
  { id: "PO-10234", po: "PO-10234", vendor: "Coastal Concrete", amount: 56300, status: "warning", statusLabel: "Warning", risk: "high" },
  { id: "PO-10235", po: "PO-10235", vendor: "Vantage Glazing", amount: 98750, status: "destructive", statusLabel: "Overdue", risk: "critical" },
  { id: "PO-10236", po: "PO-10236", vendor: "Northwind Timber", amount: 31400, status: "info", statusLabel: "Info", risk: "low" },
  { id: "PO-10237", po: "PO-10237", vendor: "Bedrock Aggregates", amount: 47250, status: "success", statusLabel: "Approved", risk: "low" },
  { id: "PO-10238", po: "PO-10238", vendor: "Summit Scaffolding", amount: 19800, status: "pending", statusLabel: "Pending", risk: "medium" },
]

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

const poColumns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: "po", header: "PO Number" },
  { accessorKey: "vendor", header: "Vendor" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => currency.format(row.original.amount),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.status}>{row.original.statusLabel}</Badge>,
  },
  {
    accessorKey: "risk",
    header: "Risk",
    cell: ({ row }) => <RiskIndicator level={row.original.risk} />,
  },
]

const poBulkActions: DataTableBulkAction<PurchaseOrder>[] = [
  {
    label: "Approve",
    icon: Check,
    onAction: (rows) => {
      toast({
        variant: "success",
        title: `${rows.length} purchase order${rows.length === 1 ? "" : "s"} approved`,
        description: rows.map((r) => r.po).join(", "),
      })
    },
  },
  {
    label: "Reject",
    icon: X,
    variant: "destructive",
    confirm: {
      title: (count) => `Reject ${count} purchase order${count === 1 ? "" : "s"}?`,
      description: (count) =>
        `${count} purchase order${count === 1 ? "" : "s"} will be marked as rejected.`,
    },
    onAction: (rows) => {
      toast({
        variant: "destructive",
        title: `${rows.length} purchase order${rows.length === 1 ? "" : "s"} rejected`,
        description: rows.map((r) => r.po).join(", "),
      })
    },
  },
]

type Vendor = {
  id: string
  name: string
  category: string
  activePOs: number
  riskRating: RiskLevel
  status: "success" | "pending"
  statusLabel: string
}

const VENDORS: Vendor[] = [
  { id: "v1", name: "Sterling Rebar Co.", category: "Steel", activePOs: 4, riskRating: "low", status: "success", statusLabel: "Active" },
  { id: "v2", name: "Granite Supply Ltd.", category: "Aggregate", activePOs: 2, riskRating: "medium", status: "success", statusLabel: "Active" },
  { id: "v3", name: "Apex Electrical", category: "MEP", activePOs: 1, riskRating: "high", status: "success", statusLabel: "Active" },
  { id: "v4", name: "Coastal Concrete", category: "Concrete", activePOs: 3, riskRating: "high", status: "success", statusLabel: "Active" },
  { id: "v5", name: "Vantage Glazing", category: "Facade", activePOs: 0, riskRating: "critical", status: "pending", statusLabel: "Under review" },
  { id: "v6", name: "Northwind Timber", category: "Lumber", activePOs: 5, riskRating: "low", status: "success", statusLabel: "Active" },
]

const vendorColumns: ColumnDef<Vendor>[] = [
  { accessorKey: "name", header: "Vendor" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "activePOs", header: "Active POs" },
  {
    accessorKey: "riskRating",
    header: "Risk rating",
    cell: ({ row }) => <RiskIndicator level={row.original.riskRating} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.status}>{row.original.statusLabel}</Badge>,
  },
]

const vendorBulkActions: DataTableBulkAction<Vendor>[] = [
  {
    label: "Deactivate",
    variant: "destructive",
    confirm: {
      title: (count) => `Deactivate ${count} vendor${count === 1 ? "" : "s"}?`,
      description: (count) =>
        `${count} vendor${count === 1 ? "" : "s"} will be removed from active use until reactivated.`,
    },
    onAction: (rows) => {
      toast({
        variant: "warning",
        title: `${rows.length} vendor${rows.length === 1 ? "" : "s"} deactivated`,
        description: rows.map((r) => r.name).join(", "),
      })
    },
  },
]

export default function DataTableDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — DataTable demo</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        Each table below has sorting (click a header), global search, column
        visibility (Columns menu), and row selection with a bulk-action bar all
        live — built on TanStack Table + the existing Table/Checkbox/DropdownMenu/
        Button/Toast components.
      </p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            1. Procurement Orders — full-featured
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Covers (3) bulk selection — select rows, Approve/Reject fires a Toast
            · (4) column visibility — try the Columns menu · (5) sorting — click
            any header · (6) search — try &quot;concrete&quot; or &quot;granite&quot;.
          </p>
          <DataTable
            columns={poColumns}
            data={PURCHASE_ORDERS}
            getRowId={(row) => row.id}
            enableRowSelection
            bulkActions={poBulkActions}
            globalFilterPlaceholder="Search purchase orders…"
          />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            2. Vendor Directory — different shape, same component
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            A second, unrelated dataset and column set, proving DataTable isn&apos;t
            hardcoded to purchase orders.
          </p>
          <DataTable
            columns={vendorColumns}
            data={VENDORS}
            getRowId={(row) => row.id}
            enableRowSelection
            bulkActions={vendorBulkActions}
            globalFilterPlaceholder="Search vendors…"
          />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            7. Empty state
          </h2>
          <DataTable
            columns={poColumns}
            data={[]}
            emptyState={
              <DataTableEmptyState
                title="No purchase orders"
                description="Try adjusting your filters or search query."
              />
            }
          />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            8. Loading state
          </h2>
          <DataTable columns={poColumns} data={[]} isLoading />
        </section>
      </div>
    </div>
  )
}
