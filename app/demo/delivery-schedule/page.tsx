"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
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
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/hooks/use-toast"

// ---------------------------------------------------------------------------
// Data — same generator/vendor-pool pattern already established for
// Procurement Log and Submittal Log, applied to a delivery-schedule shape.
// ---------------------------------------------------------------------------

type DeliveryStatus = "scheduled" | "in-transit" | "delivered" | "delayed" | "cancelled"

type Delivery = {
  id: string
  item: string
  vendor: string
  destination: string
  quantity: number
  scheduledDate: string
  status: DeliveryStatus
  statusLabel: string
  delayRisk: RiskLevel
  loggedBy: string
}

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

const ITEMS = [
  "Structural steel beams",
  "Rebar bundles",
  "Concrete mix (ready-mix)",
  "Glazing panels",
  "HVAC ductwork",
  "Electrical conduit",
  "Roofing membrane",
  "Scaffolding equipment",
  "Lumber framing",
  "Aggregate (gravel)",
]

const DESTINATIONS = [
  { value: "site-a-dock", label: "Site A — Loading Dock" },
  { value: "site-b-dock", label: "Site B — Loading Dock" },
  { value: "site-office", label: "Site Office" },
  { value: "central-warehouse", label: "Central Warehouse" },
]

const STATUSES: { status: DeliveryStatus; label: string }[] = [
  { status: "scheduled", label: "Scheduled" },
  { status: "in-transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
  { status: "delayed", label: "Delayed" },
  { status: "cancelled", label: "Cancelled" },
]

const STATUS_BADGE_VARIANT: Record<DeliveryStatus, "pending" | "info" | "success" | "warning" | "destructive"> = {
  scheduled: "pending",
  "in-transit": "info",
  delivered: "success",
  delayed: "warning",
  cancelled: "destructive",
}

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"]
const LOGGED_BY = ["Jordan Lee", "Alex Kim", "Sam Patel", "Morgan Reyes"]

const STATUS_OPTIONS = STATUSES.map((s) => ({ label: s.label, value: s.status }))
const VENDOR_OPTIONS = Array.from(new Set(VENDORS)).map((v) => ({ label: v, value: v }))

function makeDeliveries(): Delivery[] {
  return Array.from({ length: 30 }, (_, i) => {
    const s = STATUSES[i % STATUSES.length]
    return {
      id: `DEL-${601 + i}`,
      item: ITEMS[i % ITEMS.length],
      vendor: VENDORS[i % VENDORS.length],
      destination: DESTINATIONS[i % DESTINATIONS.length].label,
      quantity: 10 + i * 7,
      scheduledDate: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
      status: s.status,
      statusLabel: s.label,
      delayRisk: RISK_LEVELS[i % RISK_LEVELS.length],
      loggedBy: LOGGED_BY[i % LOGGED_BY.length],
    }
  })
}

const INITIAL_DELIVERIES = makeDeliveries()

const DEFAULT_TABLE_STATE: DataTableState = {
  sorting: [{ id: "scheduledDate", desc: false }],
  columnFilters: [],
  columnVisibility: {},
  globalFilter: "",
  density: "compact",
}

function isOverdue(delivery: Delivery): boolean {
  return (
    (delivery.status === "scheduled" || delivery.status === "in-transit") &&
    new Date(delivery.scheduledDate) < new Date()
  )
}

// ---------------------------------------------------------------------------
// New Delivery form — same Form/FormField/zod composition already
// established for Procurement Log and Submittal Log, adapted to
// delivery-appropriate fields.
// ---------------------------------------------------------------------------

const VENDOR_FORM_OPTIONS: ComboboxOption[] = VENDOR_OPTIONS.map((v) => ({
  value: v.value,
  label: v.label,
}))

const deliveryFormSchema = z
  .object({
    item: z.string().min(1, "Item is required"),
    vendor: z.string().min(1, "Vendor is required"),
    destination: z.string().min(1, "Destination is required"),
    quantity: z
      .number({ message: "Quantity must be a number" })
      .positive("Quantity must be greater than zero"),
    scheduledDate: z.string().min(1, "Scheduled date is required"),
    notes: z.string().max(280, "Notes must be 280 characters or fewer.").optional(),
  })
  .refine((data) => data.destination !== "site-office" || data.quantity <= 50, {
    message: "Site Office has no loading dock — deliveries over 50 units must use a Loading Dock destination.",
    path: ["quantity"],
  })

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>

function NewDeliveryDialog({
  nextDeliveryNumber,
  onCreate,
}: {
  nextDeliveryNumber: number
  onCreate: (delivery: Delivery) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      item: "",
      vendor: "",
      destination: "",
      quantity: 0,
      scheduledDate: "",
      notes: "",
    },
  })

  async function onSubmit(values: DeliveryFormValues) {
    setSubmitting(true)
    // Simulated async validation — same setTimeout convention already used in
    // the Input/Combobox/Form demos' own "loading" examples. No real network call.
    await new Promise((resolve) => setTimeout(resolve, 700))

    const destination = DESTINATIONS.find((d) => d.value === values.destination)
    const deliveryId = `DEL-${nextDeliveryNumber}`
    const newDelivery: Delivery = {
      id: deliveryId,
      item: values.item,
      vendor: VENDOR_FORM_OPTIONS.find((v) => v.value === values.vendor)?.label ?? values.vendor,
      destination: destination ? destination.label : values.destination,
      quantity: values.quantity,
      scheduledDate: values.scheduledDate,
      status: "scheduled",
      statusLabel: "Scheduled",
      delayRisk: "low",
      loggedBy: "Jordan Lee",
    }

    onCreate(newDelivery)
    toast({
      variant: "success",
      title: "Delivery scheduled",
      description: `${newDelivery.id} was added to the delivery schedule.`,
    })
    setSubmitting(false)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Schedule delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule a delivery</DialogTitle>
          <DialogDescription>
            Log a new delivery for tracking against the site schedule.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Item</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Structural steel beams" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Destination</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger status={form.formState.errors.destination ? "error" : "default"}>
                          <SelectValue placeholder="Select a destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DESTINATIONS.map((destination) => (
                          <SelectItem key={destination.value} value={destination.value}>
                            {destination.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        status={form.formState.errors.quantity ? "error" : "default"}
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
            </div>

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Scheduled date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      status={form.formState.errors.scheduledDate ? "error" : "default"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Site Office deliveries over 50 units must use a Loading Dock destination instead
                    — try Site Office with a quantity over 50 to see the cross-field rule fire.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional instructions…" {...field} />
                  </FormControl>
                  <FormDescription>Optional — visible to the site team.</FormDescription>
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
                {submitting ? "Scheduling…" : "Schedule delivery"}
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
// tokens, mirroring Procurement Log's and Submittal Log's detail dialogs.
// ---------------------------------------------------------------------------

function DeliveryDetailDialog({
  delivery,
  onOpenChange,
}: {
  delivery: Delivery | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={delivery !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {delivery && (
          <>
            <DialogHeader>
              <DialogTitle>{delivery.id}</DialogTitle>
              <DialogDescription>Delivery detail</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Item</dt>
                <dd className="text-body text-foreground">{delivery.item}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Vendor</dt>
                <dd className="text-body text-foreground">{delivery.vendor}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Destination</dt>
                <dd className="text-body text-foreground">{delivery.destination}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Quantity</dt>
                <dd className="text-body text-foreground">{delivery.quantity}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Scheduled date</dt>
                <dd className="text-body text-foreground">{delivery.scheduledDate}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={STATUS_BADGE_VARIANT[delivery.status]}>{delivery.statusLabel}</Badge>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Delay risk</dt>
                <dd>
                  <RiskIndicator level={delivery.delayRisk} />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Logged by</dt>
                <dd className="text-body text-foreground">{delivery.loggedBy}</dd>
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
// Header right-side actions — identical structure to the other "Log" demo
// pages' own HeaderRightActions, reused verbatim.
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

export default function DeliverySchedulePage() {
  const [orgId, setOrgId] = React.useState("brigade-group")
  const [projectId, setProjectId] = React.useState("brigade-homes")
  const [deliveries, setDeliveries] = React.useState<Delivery[]>(INITIAL_DELIVERIES)
  const [viewingDelivery, setViewingDelivery] = React.useState<Delivery | null>(null)
  const [savedSnapshot, setSavedSnapshot] = React.useState<DataTableState>(DEFAULT_TABLE_STATE)
  const [liveState, setLiveState] = React.useState<DataTableState | null>(null)
  const [hasCustomSnapshot, setHasCustomSnapshot] = React.useState(false)

  const columns = React.useMemo<ColumnDef<Delivery>[]>(
    () => [
      { accessorKey: "id", header: "Delivery" },
      { accessorKey: "item", header: "Item" },
      {
        accessorKey: "vendor",
        header: "Vendor",
        meta: { filterVariant: "select", filterOptions: VENDOR_OPTIONS, filterLabel: "Vendor" },
      },
      { accessorKey: "destination", header: "Destination" },
      { accessorKey: "quantity", header: "Qty" },
      {
        accessorKey: "scheduledDate",
        header: "Scheduled date",
        meta: { filterVariant: "dateRange", filterLabel: "Scheduled date" },
        // Conditional cell styling using only existing tokens (text-destructive) —
        // not a new capability, just a column-level cell renderer flagging rows
        // whose scheduled date has passed while still Scheduled/In Transit.
        cell: ({ row }) => {
          const overdue = isOverdue(row.original)
          return (
            <span className={overdue ? "flex items-center gap-1 text-destructive" : undefined}>
              {overdue && <AlertTriangle className="size-3.5" aria-hidden="true" />}
              {row.original.scheduledDate}
              {overdue && <span className="sr-only"> (overdue)</span>}
            </span>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { filterVariant: "select", filterOptions: STATUS_OPTIONS, filterLabel: "Status" },
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>{row.original.statusLabel}</Badge>
        ),
      },
      {
        accessorKey: "delayRisk",
        header: "Delay risk",
        cell: ({ row }) => <RiskIndicator level={row.original.delayRisk} />,
      },
      { accessorKey: "loggedBy", header: "Logged by" },
    ],
    []
  )

  const bulkActions: DataTableBulkAction<Delivery>[] = React.useMemo(
    () => [
      {
        label: "Confirm receipt",
        icon: Check,
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "success",
            title: `${rows.length} deliver${rows.length === 1 ? "y" : "ies"} confirmed received`,
            description: rows.map((r) => r.id).join(", "),
          })
        },
      },
      {
        label: "Flag as delayed",
        icon: X,
        variant: "destructive",
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "destructive",
            title: `${rows.length} deliver${rows.length === 1 ? "y" : "ies"} flagged as delayed`,
            description: rows.map((r) => r.id).join(", "),
          })
        },
      },
    ],
    []
  )

  function rowActions(delivery: Delivery): DataTableBulkAction<Delivery>[] {
    return [
      {
        label: "View",
        icon: Eye,
        onAction: () => setViewingDelivery(delivery),
      },
      {
        label: "Edit",
        icon: Pencil,
        onAction: () => {
          toast({ title: `Editing ${delivery.id}` })
        },
      },
      {
        label: "Cancel delivery",
        icon: Trash2,
        variant: "destructive",
        onAction: () => {
          toast({ variant: "destructive", title: `${delivery.id} cancelled` })
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
            <SidebarItem icon={ClipboardList}>Procurement Log</SidebarItem>
            <SidebarItem icon={Archive}>Inventory</SidebarItem>
            <SidebarItem icon={Truck} active>
              Deliveries
            </SidebarItem>
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
            { label: "Brigade Homes", href: "/demo/delivery-schedule" },
            { label: "Delivery Schedule" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-heading text-foreground">Delivery Schedule</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  variant: "success",
                  title: "Delivery schedule refreshed",
                  description: `${deliveries.length} deliveries loaded.`,
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
            <NewDeliveryDialog
              nextDeliveryNumber={601 + deliveries.length}
              onCreate={(delivery) => setDeliveries((current) => [delivery, ...current])}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <DataTable
            columns={columns}
            data={deliveries}
            getRowId={(row) => row.id}
            density="compact"
            enableRowSelection
            bulkActions={bulkActions}
            rowActions={rowActions}
            globalFilterPlaceholder="Search deliveries…"
            enablePagination
            initialState={savedSnapshot}
            onTableStateChange={setLiveState}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSavedSnapshot(liveState ?? DEFAULT_TABLE_STATE)
                setHasCustomSnapshot(true)
              }}
            >
              <FileDown /> Save current view
            </Button>
            <p className="text-caption text-muted-foreground">
              {hasCustomSnapshot
                ? `Snapshot captured — ${savedSnapshot.columnFilters.length} filter(s), sorted by ${savedSnapshot.sorting[0]?.id ?? "none"}. Reload this page and it reapplies via initialState.`
                : "Defaults to sorting by Scheduled date, ascending — the nearest upcoming deliveries first. Sort or filter the table above, then save to capture a new snapshot."}{" "}
              (Serialization contract only — see the Gap Analysis Report; there is no named,
              persisted &quot;view&quot; feature, and no way to set this default from a quick-filter
              button after the table has mounted.)
            </p>
          </div>
        </div>
      </div>

      <DeliveryDetailDialog
        delivery={viewingDelivery}
        onOpenChange={(open) => !open && setViewingDelivery(null)}
      />
    </AppShell>
  )
}
