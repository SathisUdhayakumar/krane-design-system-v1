"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import {
  Archive,
  Bell,
  Calendar,
  CalendarClock,
  Check,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileDown,
  FileText,
  Globe,
  MapPin,
  NotebookPen,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Share2,
  Trash2,
  Truck,
  X,
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AppShell } from "@/components/shell/app-shell"
import { AppHeader } from "@/components/shell/app-header"
import {
  Sidebar,
  SidebarBadge,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
} from "@/components/shell/sidebar"
import { OrganizationSwitcher } from "@/components/shell/organization-switcher"
import { ProjectSwitcher } from "@/components/shell/project-switcher"
import { AccountMenu } from "@/components/shell/account-menu"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import {
  DataTable,
  type DataTableBulkAction,
  type DataTableState,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/hooks/use-toast"

// ---------------------------------------------------------------------------
// Data — same synthetic-data-generator pattern already established in
// app/demo/data-table-advanced/page.tsx's ProcurementLogTable.
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

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

const VENDORS = [
  "Sterling Rebar Co.",
  "Granite Supply Ltd.",
  "Apex Electrical",
  "Coastal Concrete",
  "Vantage Glazing",
  "Northwind Timber",
  "Bedrock Aggregates",
  "Summit Scaffolding",
]

const DIVISIONS = ["Steel", "Concrete", "MEP", "Facade", "Sitework"]

const STATUSES: { status: StatusVariant; label: string }[] = [
  { status: "success", label: "Approved" },
  { status: "pending", label: "Pending" },
  { status: "warning", label: "Warning" },
  { status: "destructive", label: "Overdue" },
  { status: "info", label: "In review" },
]

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"]
const BUYERS = ["Jordan Lee", "Alex Kim", "Sam Patel", "Morgan Reyes"]

const STATUS_OPTIONS = STATUSES.map((s) => ({ label: s.label, value: s.status }))
const VENDOR_OPTIONS = Array.from(new Set(VENDORS)).map((v) => ({ label: v, value: v }))

function makePurchaseOrders(): PurchaseOrder[] {
  return Array.from({ length: 36 }, (_, i) => {
    const s = STATUSES[i % STATUSES.length]
    return {
      id: `PO-${20410 + i}`,
      po: `PO-${20410 + i}`,
      vendor: VENDORS[i % VENDORS.length],
      division: DIVISIONS[i % DIVISIONS.length],
      amount: 8400 + i * 3725,
      status: s.status,
      statusLabel: s.label,
      dueDate: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
      risk: RISK_LEVELS[i % RISK_LEVELS.length],
      buyer: BUYERS[i % BUYERS.length],
    }
  })
}

const INITIAL_PURCHASE_ORDERS = makePurchaseOrders()

// ---------------------------------------------------------------------------
// New Purchase Order form — same Form/FormField/zod composition already
// established in app/demo/form/page.tsx, extended with one Due date field
// (a plain `Input type="date"`, the same pattern DataTable's own date-range
// filter already uses — not a new field type).
// ---------------------------------------------------------------------------

const VENDOR_FORM_OPTIONS: ComboboxOption[] = VENDOR_OPTIONS.map((v) => ({
  value: v.value,
  label: v.label,
}))

const CSI_DIVISIONS = [
  { value: "03", label: "03 — Concrete" },
  { value: "04", label: "04 — Masonry" },
  { value: "05", label: "05 — Steel" },
  { value: "07", label: "07 — Thermal & Moisture Protection" },
  { value: "23", label: "23 — HVAC" },
  { value: "26", label: "26 — Electrical" },
]

const poFormSchema = z
  .object({
    vendor: z.string().min(1, "Vendor is required"),
    csiDivision: z.string().min(1, "CSI division is required"),
    amount: z
      .number({ message: "Amount must be a number" })
      .positive("Amount must be greater than zero"),
    dueDate: z.string().min(1, "Due date is required"),
    notes: z.string().max(280, "Notes must be 280 characters or fewer.").optional(),
    autoApprove: z.boolean(),
    routing: z.enum(["auto", "manual", "escalate"]),
  })
  .refine((data) => data.amount <= 50000 || data.routing !== "auto", {
    message: "Purchase orders over $50,000 require Manual review or Escalate, not Auto-approve.",
    path: ["routing"],
  })

type PoFormValues = z.infer<typeof poFormSchema>

function NewPurchaseOrderDialog({
  nextPoNumber,
  onCreate,
}: {
  nextPoNumber: number
  onCreate: (po: PurchaseOrder) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<PoFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues: {
      vendor: "",
      csiDivision: "",
      amount: 0,
      dueDate: "",
      notes: "",
      autoApprove: false,
      routing: "manual",
    },
  })

  async function onSubmit(values: PoFormValues) {
    setSubmitting(true)
    // Simulated async validation — same setTimeout convention already used in
    // the Input/Combobox/Form demos' own "loading" examples. No real network call.
    await new Promise((resolve) => setTimeout(resolve, 700))

    const division = CSI_DIVISIONS.find((d) => d.value === values.csiDivision)
    const poNumber = `PO-${nextPoNumber}`
    const newPo: PurchaseOrder = {
      id: poNumber,
      po: poNumber,
      vendor: VENDOR_FORM_OPTIONS.find((v) => v.value === values.vendor)?.label ?? values.vendor,
      division: division ? division.label.replace(/^\d+ — /, "") : values.csiDivision,
      amount: values.amount,
      status: values.autoApprove ? "success" : "pending",
      statusLabel: values.autoApprove ? "Approved" : "Pending",
      dueDate: values.dueDate,
      risk: "low",
      buyer: "Jordan Lee",
    }

    onCreate(newPo)
    toast({
      variant: "success",
      title: "Purchase order created",
      description: `${newPo.po} was added to the procurement log.`,
    })
    setSubmitting(false)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New purchase order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create purchase order</DialogTitle>
          <DialogDescription>
            Log a new purchase order for vendor and engineering review.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Vendor</FormLabel>
                  <FormControl>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                      options={VENDOR_FORM_OPTIONS}
                      placeholder="Select a vendor"
                      searchPlaceholder="Search vendors…"
                      emptyMessage="No vendors found."
                      status={form.formState.errors.vendor ? "error" : "default"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="csiDivision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>CSI division</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger status={form.formState.errors.csiDivision ? "error" : "default"}>
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CSI_DIVISIONS.map((division) => (
                        <SelectItem key={division.value} value={division.value}>
                          {division.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        status={form.formState.errors.amount ? "error" : "default"}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Due date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        status={form.formState.errors.dueDate ? "error" : "default"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional instructions…" {...field} />
                  </FormControl>
                  <FormDescription>Optional — visible to the approver.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoApprove"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Auto-approve if under budget</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval routing</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger status={form.formState.errors.routing ? "error" : "default"}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">Auto-approve</SelectItem>
                      <SelectItem value="manual">Manual review</SelectItem>
                      <SelectItem value="escalate">Escalate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Orders over $50,000 require Manual review or Escalate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create purchase order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// View detail dialog — plain label/value rows using existing typography
// tokens, not a new "detail view" component. Opened from the row-actions
// menu's "View" item, which DataTable already supports via rowActions.
// ---------------------------------------------------------------------------

function PurchaseOrderDetailDialog({
  po,
  onOpenChange,
}: {
  po: PurchaseOrder | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={po !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {po && (
          <>
            <DialogHeader>
              <DialogTitle>{po.po}</DialogTitle>
              <DialogDescription>Purchase order detail</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Vendor</dt>
                <dd className="text-body text-foreground">{po.vendor}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Division</dt>
                <dd className="text-body text-foreground">{po.division}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Amount</dt>
                <dd className="text-body text-foreground">{currency.format(po.amount)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={po.status}>{po.statusLabel}</Badge>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Due date</dt>
                <dd className="text-body text-foreground">{po.dueDate}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Risk</dt>
                <dd>
                  <RiskIndicator level={po.risk} />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Buyer</dt>
                <dd className="text-body text-foreground">{po.buyer}</dd>
              </div>
            </dl>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Header right-side actions — identical structure to app/demo/app-shell's
// own HeaderRightActions, reused verbatim (this is Shell chrome, unrelated
// to Procurement Log content, so duplicating the established composition
// exactly keeps every demo page's header behaving identically).
// ---------------------------------------------------------------------------

function HeaderRightActions() {
  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border-0 bg-sidebar-accent px-2.5 py-1.5 text-sm text-sidebar-accent-foreground outline-none hover:bg-sidebar-accent/80 focus-visible:ring-3 focus-visible:ring-sidebar-ring">
            <Globe className="size-4" aria-hidden="true" />
            English
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Español</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Help"
            className="hidden text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring md:inline-flex"
          >
            <CircleHelp />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Help</TooltipContent>
      </Tooltip>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Notifications"
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring"
      >
        <Bell />
      </Button>

      <ThemeToggle />

      <div className="hidden h-6 w-px bg-sidebar-border sm:block" aria-hidden="true" />

      <AccountMenu
        user={{ name: "Sam Patel", email: "sam.patel@brigadegroup.com", initials: "SP" }}
        organizationLabel="Brigade Group"
        onProfile={() => {}}
        onSettings={() => {}}
        onNotificationPreferences={() => {}}
        onSignOut={() => {}}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProcurementLogPage() {
  const [orgId, setOrgId] = React.useState("brigade-group")
  const [projectId, setProjectId] = React.useState("brigade-homes")
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>(
    INITIAL_PURCHASE_ORDERS
  )
  const [viewingPo, setViewingPo] = React.useState<PurchaseOrder | null>(null)
  const [savedSnapshot, setSavedSnapshot] = React.useState<DataTableState | null>(null)
  const [liveState, setLiveState] = React.useState<DataTableState | null>(null)

  const columns = React.useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      { accessorKey: "po", header: "PO Number" },
      {
        accessorKey: "vendor",
        header: "Vendor",
        meta: { filterVariant: "select", filterOptions: VENDOR_OPTIONS, filterLabel: "Vendor" },
      },
      { accessorKey: "division", header: "Division" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => currency.format(row.original.amount),
      },
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
      {
        accessorKey: "risk",
        header: "Risk",
        cell: ({ row }) => <RiskIndicator level={row.original.risk} />,
      },
      { accessorKey: "buyer", header: "Buyer" },
    ],
    []
  )

  const bulkActions: DataTableBulkAction<PurchaseOrder>[] = React.useMemo(
    () => [
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
        confirm: {
          title: (count) => `Reject ${count} purchase order${count === 1 ? "" : "s"}?`,
          description: (count) =>
            `${count} purchase order${count === 1 ? "" : "s"} will be marked as rejected.`,
        },
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "destructive",
            title: `${rows.length} purchase order${rows.length === 1 ? "" : "s"} rejected`,
            description: rows.map((r) => r.po).join(", "),
          })
        },
      },
    ],
    []
  )

  function rowActions(po: PurchaseOrder): DataTableBulkAction<PurchaseOrder>[] {
    return [
      {
        label: "View",
        icon: Eye,
        onAction: () => setViewingPo(po),
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

  return (
    <AppShell
      header={
        <AppHeader
          organizationSwitcher={
            <OrganizationSwitcher
              organizations={[
                { id: "brigade-group", label: "Brigade Group" },
                { id: "meridian-co", label: "Meridian Co." },
              ]}
              value={orgId}
              onValueChange={setOrgId}
            />
          }
          projectSwitcher={
            <ProjectSwitcher
              projects={[
                { id: "brigade-homes", label: "Brigade Homes" },
                { id: "brigade-towers", label: "Brigade Towers" },
              ]}
              value={projectId}
              onValueChange={setProjectId}
            />
          }
          rightActions={<HeaderRightActions />}
        />
      }
      sidebar={
        <Sidebar
          footer={
            <SidebarFooter>
              <SidebarItem icon={Settings}>Settings</SidebarItem>
            </SidebarFooter>
          }
        >
          <SidebarGroup label="Procurement log">
            <SidebarItem icon={ClipboardList} active>
              Procurement Log
            </SidebarItem>
            <SidebarItem icon={Archive}>Inventory</SidebarItem>
            <SidebarItem icon={Truck}>Deliveries</SidebarItem>
          </SidebarGroup>

          <SidebarGroup label="Schedule viewer">
            <SidebarItem icon={Calendar}>Project Schedule</SidebarItem>
            <SidebarItem icon={NotebookPen}>Lookahead Plan</SidebarItem>
          </SidebarGroup>

          <div className="my-1 border-t border-sidebar-border" />

          <div className="flex flex-col gap-0.5">
            <SidebarItem icon={ClipboardCheck}>Submittals</SidebarItem>
            <SidebarItem
              icon={CalendarClock}
              badge={<SidebarBadge variant="count">2</SidebarBadge>}
            >
              Delivery board
            </SidebarItem>
          </div>

          <div className="my-1 border-t border-sidebar-border" />

          <SidebarGroup label="Logistics">
            <SidebarItem icon={MapPin} badge={<SidebarBadge variant="new">NEW</SidebarBadge>}>
              Area Map
            </SidebarItem>
            <SidebarItem icon={Archive}>Reservation</SidebarItem>
          </SidebarGroup>

          <div className="my-1 border-t border-sidebar-border" />

          <SidebarGroup label="KAI">
            <SidebarItem icon={ShieldCheck}>KAI Agent</SidebarItem>
            <SidebarItem icon={FileText}>Saved Documents</SidebarItem>
            <SidebarItem icon={Share2} badge={<SidebarBadge variant="count">2</SidebarBadge>}>
              Integrations
            </SidebarItem>
          </SidebarGroup>
        </Sidebar>
      }
    >
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <Breadcrumb
          items={[
            { label: "Brigade Homes", href: "/demo/procurement-log" },
            { label: "Procurement Log" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-heading text-foreground">Procurement Log</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  variant: "success",
                  title: "Procurement log refreshed",
                  description: `${purchaseOrders.length} purchase orders loaded.`,
                })
              }
            >
              <RefreshCw /> Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  title: "Export started",
                  description: "Your CSV download will begin shortly.",
                })
              }
            >
              <FileDown /> Export
            </Button>
            <NewPurchaseOrderDialog
              nextPoNumber={20410 + purchaseOrders.length}
              onCreate={(po) => setPurchaseOrders((current) => [po, ...current])}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <DataTable
            columns={columns}
            data={purchaseOrders}
            getRowId={(row) => row.id}
            density="compact"
            enableRowSelection
            bulkActions={bulkActions}
            rowActions={rowActions}
            globalFilterPlaceholder="Search purchase orders…"
            enablePagination
            initialState={savedSnapshot ?? undefined}
            onTableStateChange={setLiveState}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSavedSnapshot(liveState)}>
              <FileDown /> Save current view
            </Button>
            <p className="text-caption text-muted-foreground">
              {savedSnapshot
                ? `Snapshot captured — ${savedSnapshot.columnFilters.length} filter(s), sorted by ${savedSnapshot.sorting[0]?.id ?? "none"}. Reload this page and it reapplies via initialState.`
                : "No snapshot saved yet — sort or filter the table above, then save. (Serialization contract only — see the Gap Analysis Report; there is no named, persisted \"view\" feature.)"}
            </p>
          </div>
        </div>
      </div>

      <PurchaseOrderDetailDialog po={viewingPo} onOpenChange={(open) => !open && setViewingPo(null)} />
    </AppShell>
  )
}
