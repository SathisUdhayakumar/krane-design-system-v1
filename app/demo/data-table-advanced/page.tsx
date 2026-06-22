"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Check, Eye, FileDown, Pencil, Trash2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableEmptyState,
  type DataTableBulkAction,
  type DataTableState,
} from "@/components/ui/data-table"
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator"
import { toast } from "@/hooks/use-toast"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

// ---------------------------------------------------------------------------
// 1. Procurement Log — full-featured: row + bulk actions, select + dateRange
// filters, numbered pagination, sticky select/actions columns (enough columns
// to force horizontal scroll so pinning is visibly demonstrated).
// ---------------------------------------------------------------------------

type StatusVariant = "success" | "warning" | "pending" | "info" | "destructive"

type PurchaseOrder = {
  id: string
  po: string
  vendor: string
  division: string
  amount: number
  status: StatusVariant
  statusLabel: string
  dueDate: string
  risk: RiskLevel
  buyer: string
}

const STATUS_OPTIONS = [
  { label: "Approved", value: "success" },
  { label: "Pending", value: "pending" },
  { label: "Warning", value: "warning" },
  { label: "Overdue", value: "destructive" },
]

function makePurchaseOrders(): PurchaseOrder[] {
  const vendors = [
    "Sterling Rebar Co.",
    "Granite Supply Ltd.",
    "Apex Electrical",
    "Coastal Concrete",
    "Vantage Glazing",
    "Northwind Timber",
  ]
  const statuses: { status: StatusVariant; label: string }[] = [
    { status: "success", label: "Approved" },
    { status: "pending", label: "Pending" },
    { status: "warning", label: "Warning" },
    { status: "destructive", label: "Overdue" },
  ]
  const risks: RiskLevel[] = ["low", "medium", "high", "critical"]
  return Array.from({ length: 32 }, (_, i) => {
    const s = statuses[i % statuses.length]
    return {
      id: `PO-${10231 + i}`,
      po: `PO-${10231 + i}`,
      vendor: vendors[i % vendors.length],
      division: ["Steel", "Concrete", "MEP", "Facade"][i % 4],
      amount: 12000 + i * 4375,
      status: s.status,
      statusLabel: s.label,
      dueDate: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
      risk: risks[i % risks.length],
      buyer: ["Jordan Lee", "Alex Kim", "Sam Patel"][i % 3],
    }
  })
}

const PURCHASE_ORDERS = makePurchaseOrders()

const poColumns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: "po", header: "PO Number" },
  { accessorKey: "vendor", header: "Vendor" },
  { accessorKey: "division", header: "Division" },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => currency.format(row.original.amount) },
  {
    accessorKey: "status",
    header: "Status",
    meta: { filterVariant: "select", filterOptions: STATUS_OPTIONS, filterLabel: "Status" },
    cell: ({ row }) => <Badge variant={row.original.status}>{row.original.statusLabel}</Badge>,
  },
  {
    accessorKey: "dueDate",
    header: "Due date",
    meta: { filterVariant: "dateRange", filterLabel: "Due date" },
  },
  { accessorKey: "risk", header: "Risk", cell: ({ row }) => <RiskIndicator level={row.original.risk} /> },
  { accessorKey: "buyer", header: "Buyer" },
]

const poBulkActions: DataTableBulkAction<PurchaseOrder>[] = [
  {
    label: "Approve",
    icon: Check,
    onAction: async (rows) => {
      await new Promise((resolve) => setTimeout(resolve, 600))
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
    onAction: async (rows) => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast({
        variant: "destructive",
        title: `${rows.length} purchase order${rows.length === 1 ? "" : "s"} rejected`,
        description: rows.map((r) => r.po).join(", "),
      })
    },
  },
]

function poRowActions(po: PurchaseOrder): DataTableBulkAction<PurchaseOrder>[] {
  return [
    {
      label: "View",
      icon: Eye,
      onAction: () => {
        toast({ title: `Viewing ${po.po}` })
      },
    },
    {
      label: "Edit",
      icon: Pencil,
      onAction: () => {
        toast({ title: `Editing ${po.po}` })
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onAction: () => {
        toast({ variant: "destructive", title: `${po.po} deleted` })
      },
    },
  ]
}

function ProcurementLogTable() {
  const [savedSnapshot, setSavedSnapshot] = React.useState<DataTableState | null>(null)
  const [liveState, setLiveState] = React.useState<DataTableState | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        columns={poColumns}
        data={PURCHASE_ORDERS}
        getRowId={(row) => row.id}
        enableRowSelection
        bulkActions={poBulkActions}
        rowActions={poRowActions}
        globalFilterPlaceholder="Search purchase orders…"
        enablePagination
        pageSizeOptions={[5, 10, 25]}
        initialState={savedSnapshot ?? undefined}
        onTableStateChange={setLiveState}
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setSavedSnapshot(liveState)}>
          <FileDown /> Save current view
        </Button>
        <p className="text-caption text-muted-foreground">
          {savedSnapshot
            ? `Snapshot captured — ${savedSnapshot.columnFilters.length} filter(s), sorted by ${savedSnapshot.sorting[0]?.id ?? "none"}. Reload this section's parent demo and it reapplies via initialState.`
            : "No snapshot saved yet — sort or filter the table above, then save."}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. Vendors — Load More pagination variant (the other presentation, on the
// same underlying TanStack pagination model), select filter, row actions.
// ---------------------------------------------------------------------------

type Vendor = {
  id: string
  name: string
  category: string
  activePOs: number
  riskRating: RiskLevel
  status: "success" | "pending"
  statusLabel: string
}

const ALL_VENDORS: Vendor[] = Array.from({ length: 18 }, (_, i) => ({
  id: `v${i}`,
  name: [
    "Sterling Rebar Co.",
    "Granite Supply Ltd.",
    "Apex Electrical",
    "Coastal Concrete",
    "Vantage Glazing",
    "Northwind Timber",
    "Bedrock Aggregates",
    "Summit Scaffolding",
    "Meridian Lifts",
    "Harbor Steel",
  ][i % 10] + (i >= 10 ? ` #${i}` : ""),
  category: ["Steel", "Aggregate", "MEP", "Concrete", "Facade", "Lumber"][i % 6],
  activePOs: i % 6,
  riskRating: (["low", "medium", "high", "critical"] as RiskLevel[])[i % 4],
  status: i % 5 === 0 ? "pending" : "success",
  statusLabel: i % 5 === 0 ? "Under review" : "Active",
}))

const vendorColumns: ColumnDef<Vendor>[] = [
  { accessorKey: "name", header: "Vendor" },
  {
    accessorKey: "category",
    header: "Category",
    meta: {
      filterVariant: "select",
      filterLabel: "Category",
      filterOptions: Array.from(new Set(ALL_VENDORS.map((v) => v.category))).map((c) => ({
        label: c,
        value: c,
      })),
    },
  },
  { accessorKey: "activePOs", header: "Active POs" },
  { accessorKey: "riskRating", header: "Risk rating", cell: ({ row }) => <RiskIndicator level={row.original.riskRating} /> },
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
    onAction: (rows) => {
      toast({
        variant: "warning",
        title: `${rows.length} vendor${rows.length === 1 ? "" : "s"} deactivated`,
        description: rows.map((r) => r.name).join(", "),
      })
    },
  },
]

function vendorRowActions(vendor: Vendor): DataTableBulkAction<Vendor>[] {
  return [
    {
      label: "View",
      icon: Eye,
      onAction: () => {
        toast({ title: `Viewing ${vendor.name}` })
      },
    },
    {
      label: "Deactivate",
      icon: Trash2,
      variant: "destructive",
      onAction: () => {
        toast({ variant: "warning", title: `${vendor.name} deactivated` })
      },
    },
  ]
}

const VENDOR_PAGE_SIZE = 6

function VendorsTable() {
  const [visibleCount, setVisibleCount] = React.useState(VENDOR_PAGE_SIZE)
  const [isFetching, setIsFetching] = React.useState(false)

  async function loadMore() {
    setIsFetching(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setVisibleCount((count) => Math.min(count + VENDOR_PAGE_SIZE, ALL_VENDORS.length))
    setIsFetching(false)
  }

  return (
    <DataTable
      columns={vendorColumns}
      data={ALL_VENDORS.slice(0, visibleCount)}
      getRowId={(row) => row.id}
      enableRowSelection
      bulkActions={vendorBulkActions}
      rowActions={vendorRowActions}
      globalFilterPlaceholder="Search vendors…"
      hasNextPage={visibleCount < ALL_VENDORS.length}
      isFetchingNextPage={isFetching}
      onLoadMore={loadMore}
    />
  )
}

// ---------------------------------------------------------------------------
// 3. Submittals — row actions positioned first, text + select filters, and
// both empty-state cases demonstrated live (true empty vs. filtered-to-zero).
// ---------------------------------------------------------------------------

type Submittal = {
  id: string
  item: string
  vendor: string
  stage: "draft" | "in-review" | "done"
  stageLabel: string
  dueDate: string
}

const SUBMITTALS: Submittal[] = [
  { id: "SUB-301", item: "Structural steel shop drawings", vendor: "Sterling Rebar Co.", stage: "draft", stageLabel: "Draft", dueDate: "2026-07-02" },
  { id: "SUB-302", item: "Glazing system samples", vendor: "Vantage Glazing", stage: "in-review", stageLabel: "In Review", dueDate: "2026-06-28" },
  { id: "SUB-303", item: "Concrete mix design", vendor: "Coastal Concrete", stage: "done", stageLabel: "Done", dueDate: "2026-06-20" },
  { id: "SUB-304", item: "MEP coordination drawings", vendor: "Apex Electrical", stage: "in-review", stageLabel: "In Review", dueDate: "2026-07-10" },
  { id: "SUB-305", item: "Elevator shop drawings", vendor: "Meridian Lifts", stage: "draft", stageLabel: "Draft", dueDate: "2026-07-15" },
  { id: "SUB-306", item: "Roofing material certs", vendor: "Summit Scaffolding", stage: "done", stageLabel: "Done", dueDate: "2026-06-18" },
]

const STAGE_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "in-review" },
  { label: "Done", value: "done" },
]

const submittalColumns: ColumnDef<Submittal>[] = [
  { accessorKey: "id", header: "Submittal" },
  { accessorKey: "item", header: "Item" },
  { accessorKey: "vendor", header: "Vendor" },
  {
    accessorKey: "stage",
    header: "Stage",
    meta: { filterVariant: "select", filterOptions: STAGE_OPTIONS, filterLabel: "Stage" },
    cell: ({ row }) => <span>{row.original.stageLabel}</span>,
  },
  { accessorKey: "dueDate", header: "Due" },
]

function submittalRowActions(submittal: Submittal): DataTableBulkAction<Submittal>[] {
  return [
    {
      label: "Open",
      icon: Eye,
      onAction: () => {
        toast({ title: `Opening ${submittal.id}` })
      },
    },
  ]
}

function SubmittalsTable() {
  const [showEmpty, setShowEmpty] = React.useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowEmpty((v) => !v)}>
          {showEmpty ? "Show real data" : "Simulate no data at all"}
        </Button>
        <p className="text-caption text-muted-foreground">
          Or type a search that matches nothing (e.g. &quot;zzz&quot;) to see the other empty
          state — &quot;no results match your filters,&quot; distinct from this one.
        </p>
      </div>
      <DataTable
        columns={submittalColumns}
        data={showEmpty ? [] : SUBMITTALS}
        getRowId={(row) => row.id}
        rowActions={submittalRowActions}
        positionActionsColumn="first"
        globalFilterPlaceholder="Search submittals…"
        emptyState={
          <DataTableEmptyState
            title="No submittals yet"
            description="Create your first submittal to get started."
          />
        }
      />
    </div>
  )
}

export default function DataTableAdvancedDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">
        Krane Design System — DataTable Advanced demo
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        Pagination (both presentations), a row-actions column, two distinct empty states,
        per-column filters, sticky select/actions columns, and the Saved Views serialization
        contract — all additive to the already-shipped <code>DataTable</code>, per{" "}
        <code>DATATABLE_ADVANCED_FOUNDATION.md</code>.
      </p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            Procurement Log — full-featured
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Numbered pagination · Status (select) and Due date (date range) filters · row actions
            (View/Edit/Delete) pinned right, selection pinned left — scroll the table
            horizontally to see both stay put · &quot;Save current view&quot; demonstrates the
            Saved Views serialization contract without any saved-views UI existing yet.
          </p>
          <ProcurementLogTable />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            Vendors — Load More pagination variant
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            The other pagination presentation, on the same underlying model as Procurement
            Log&apos;s numbered pages · Category (select) filter · row actions (View/Deactivate).
          </p>
          <VendorsTable />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            Submittals — row actions first, both empty states
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Row actions column pinned <em>left</em> this time (positionActionsColumn=&quot;first&quot;)
            · Stage (select) filter · the two distinct empty-state messages live, not just
            described.
          </p>
          <SubmittalsTable />
        </section>
      </div>
    </div>
  )
}
