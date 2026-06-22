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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/hooks/use-toast"

// ---------------------------------------------------------------------------
// Data — same generator/vendor-pool pattern already established for
// Procurement Log, Submittal Log, and Delivery Schedule, applied to a
// materials-inventory shape.
// ---------------------------------------------------------------------------

type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "on-order" | "discontinued"

type Material = {
  id: string
  item: string
  category: string
  uom: string
  quantityOnHand: number
  reorderPoint: number
  unitCost: number
  totalValue: number
  status: StockStatus
  statusLabel: string
  stockoutRisk: RiskLevel
  warehouse: string
  vendor: string
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

const ITEMS = [
  "Rebar, #4 grade 60",
  "Portland cement, Type I",
  "Glazing panels, 1in insulated",
  "HVAC ductwork, 24ga galvanized",
  "Electrical conduit, 3/4in EMT",
  "Roofing membrane, TPO 60mil",
  "Scaffolding planks",
  "Framing lumber, 2x6 SPF",
  "Aggregate, 3/4in crushed",
  "Anchor bolts, 5/8in",
]

const CSI_DIVISIONS = [
  { value: "03", label: "03 — Concrete" },
  { value: "04", label: "04 — Masonry" },
  { value: "05", label: "05 — Steel" },
  { value: "07", label: "07 — Thermal & Moisture Protection" },
  { value: "08", label: "08 — Openings" },
  { value: "23", label: "23 — HVAC" },
  { value: "26", label: "26 — Electrical" },
]

const UNITS_OF_MEASURE = ["EA", "TON", "CY", "LF", "SF", "BOX"]

const WAREHOUSES = [
  { value: "central", label: "Central Warehouse" },
  { value: "site-a", label: "Site A Yard" },
  { value: "site-b", label: "Site B Yard" },
]

const STATUSES: { status: StockStatus; label: string }[] = [
  { status: "in-stock", label: "In Stock" },
  { status: "low-stock", label: "Low Stock" },
  { status: "out-of-stock", label: "Out of Stock" },
  { status: "on-order", label: "On Order" },
  { status: "discontinued", label: "Discontinued" },
]

// Badge's five non-default semantic variants cover four of these five
// statuses; "Discontinued" deliberately uses the neutral `default` variant
// instead of reusing one of the five semantic colors for a meaning that
// isn't really a health/urgency signal at all — see the Gap Analysis Report.
const STATUS_BADGE_VARIANT: Record<StockStatus, "success" | "warning" | "destructive" | "pending" | "default"> = {
  "in-stock": "success",
  "low-stock": "warning",
  "out-of-stock": "destructive",
  "on-order": "pending",
  discontinued: "default",
}

const STATUS_OPTIONS = STATUSES.map((s) => ({ label: s.label, value: s.status }))
const VENDOR_OPTIONS = Array.from(new Set(VENDORS)).map((v) => ({ label: v, value: v }))
const CATEGORY_OPTIONS = CSI_DIVISIONS.map((d) => ({ label: d.label, value: d.value }))
const WAREHOUSE_OPTIONS = WAREHOUSES.map((w) => ({ label: w.label, value: w.value }))

// Stockout risk is derived from comparing quantity on hand against the
// reorder point — a computed RiskIndicator level, not stored/hardcoded data,
// the same derivation pattern Delivery Schedule's overdue-cell check used.
function computeStockoutRisk(quantityOnHand: number, reorderPoint: number): RiskLevel {
  if (quantityOnHand <= 0) return "critical"
  if (quantityOnHand <= reorderPoint) return "high"
  if (quantityOnHand <= reorderPoint * 1.5) return "medium"
  return "low"
}

function makeMaterials(): Material[] {
  return Array.from({ length: 32 }, (_, i) => {
    const s = STATUSES[i % STATUSES.length]
    const division = CSI_DIVISIONS[i % CSI_DIVISIONS.length]
    const quantityOnHand = s.status === "out-of-stock" ? 0 : 20 + ((i * 37) % 480)
    const reorderPoint = 50 + ((i * 13) % 150)
    const unitCost = 12.5 + i * 7.25
    return {
      id: `MAT-${1001 + i}`,
      item: ITEMS[i % ITEMS.length],
      category: division.label,
      uom: UNITS_OF_MEASURE[i % UNITS_OF_MEASURE.length],
      quantityOnHand,
      reorderPoint,
      unitCost,
      totalValue: quantityOnHand * unitCost,
      status: s.status,
      statusLabel: s.label,
      stockoutRisk: computeStockoutRisk(quantityOnHand, reorderPoint),
      warehouse: WAREHOUSES[i % WAREHOUSES.length].label,
      vendor: VENDORS[i % VENDORS.length],
    }
  })
}

const INITIAL_MATERIALS = makeMaterials()

const DEFAULT_TABLE_STATE: DataTableState = {
  sorting: [{ id: "quantityOnHand", desc: false }],
  columnFilters: [],
  columnVisibility: {},
  globalFilter: "",
  density: "compact",
}

// ---------------------------------------------------------------------------
// New Material form — same Form/FormField/zod composition already
// established across all three prior pages, adapted to inventory fields.
// ---------------------------------------------------------------------------

const VENDOR_FORM_OPTIONS: ComboboxOption[] = VENDOR_OPTIONS.map((v) => ({
  value: v.value,
  label: v.label,
}))

const materialFormSchema = z
  .object({
    item: z.string().min(1, "Item is required"),
    category: z.string().min(1, "Category is required"),
    uom: z.string().min(1, "Unit of measure is required"),
    quantityOnHand: z
      .number({ message: "Quantity must be a number" })
      .min(0, "Quantity cannot be negative"),
    reorderPoint: z
      .number({ message: "Reorder point must be a number" })
      .min(0, "Reorder point cannot be negative"),
    unitCost: z
      .number({ message: "Unit cost must be a number" })
      .positive("Unit cost must be greater than zero"),
    warehouse: z.string().min(1, "Warehouse is required"),
    vendor: z.string().min(1, "Vendor is required"),
  })
  .refine((data) => data.warehouse !== "central" || data.quantityOnHand <= 1000, {
    message: "Central Warehouse has limited capacity — quantities over 1,000 units must use a site yard instead.",
    path: ["quantityOnHand"],
  })

type MaterialFormValues = z.infer<typeof materialFormSchema>

function NewMaterialDialog({
  nextMaterialNumber,
  onCreate,
}: {
  nextMaterialNumber: number
  onCreate: (material: Material) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      item: "",
      category: "",
      uom: "",
      quantityOnHand: 0,
      reorderPoint: 0,
      unitCost: 0,
      warehouse: "",
      vendor: "",
    },
  })

  async function onSubmit(values: MaterialFormValues) {
    setSubmitting(true)
    // Simulated async validation — same setTimeout convention already used
    // across every prior page's own form demos. No real network call.
    await new Promise((resolve) => setTimeout(resolve, 700))

    const category = CSI_DIVISIONS.find((d) => d.value === values.category)
    const warehouse = WAREHOUSES.find((w) => w.value === values.warehouse)
    const materialId = `MAT-${nextMaterialNumber}`
    const status: StockStatus = values.quantityOnHand <= 0 ? "out-of-stock" : "in-stock"
    const statusLabel = STATUSES.find((s) => s.status === status)!.label
    const newMaterial: Material = {
      id: materialId,
      item: values.item,
      category: category ? category.label : values.category,
      uom: values.uom,
      quantityOnHand: values.quantityOnHand,
      reorderPoint: values.reorderPoint,
      unitCost: values.unitCost,
      totalValue: values.quantityOnHand * values.unitCost,
      status,
      statusLabel,
      stockoutRisk: computeStockoutRisk(values.quantityOnHand, values.reorderPoint),
      warehouse: warehouse ? warehouse.label : values.warehouse,
      vendor: VENDOR_FORM_OPTIONS.find((v) => v.value === values.vendor)?.label ?? values.vendor,
    }

    onCreate(newMaterial)
    toast({
      variant: "success",
      title: "Material added",
      description: `${newMaterial.id} was added to inventory.`,
    })
    setSubmitting(false)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add material</DialogTitle>
          <DialogDescription>
            Log a new material into inventory tracking.
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
                    <Input placeholder="e.g. Rebar, #4 grade 60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger status={form.formState.errors.category ? "error" : "default"}>
                          <SelectValue placeholder="Select a category" />
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

              <FormField
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Unit of measure</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger status={form.formState.errors.uom ? "error" : "default"}>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS_OF_MEASURE.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantityOnHand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Quantity on hand</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        status={form.formState.errors.quantityOnHand ? "error" : "default"}
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
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Reorder point</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        status={form.formState.errors.reorderPoint ? "error" : "default"}
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
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Unit cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      status={form.formState.errors.unitCost ? "error" : "default"}
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
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Warehouse</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger status={form.formState.errors.warehouse ? "error" : "default"}>
                        <SelectValue placeholder="Select a warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WAREHOUSES.map((warehouse) => (
                        <SelectItem key={warehouse.value} value={warehouse.value}>
                          {warehouse.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Central Warehouse has limited capacity — try it with a quantity over 1,000 to
                    see the cross-field rule fire on Quantity on hand above.
                  </FormDescription>
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

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Add material"}
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
// tokens, mirroring the detail dialogs on all three prior pages.
// ---------------------------------------------------------------------------

function MaterialDetailDialog({
  material,
  onOpenChange,
}: {
  material: Material | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={material !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {material && (
          <>
            <DialogHeader>
              <DialogTitle>{material.id}</DialogTitle>
              <DialogDescription>Material detail</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Item</dt>
                <dd className="text-body text-foreground">{material.item}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Category</dt>
                <dd className="text-body text-foreground">{material.category}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Vendor</dt>
                <dd className="text-body text-foreground">{material.vendor}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Quantity on hand</dt>
                <dd className="text-body text-foreground">
                  {material.quantityOnHand.toLocaleString()} {material.uom}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Reorder point</dt>
                <dd className="text-body text-foreground">
                  {material.reorderPoint.toLocaleString()} {material.uom}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Unit cost</dt>
                <dd className="text-body text-foreground">{currency.format(material.unitCost)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Total value</dt>
                <dd className="text-body text-foreground">{currency.format(material.totalValue)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={STATUS_BADGE_VARIANT[material.status]}>{material.statusLabel}</Badge>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Stockout risk</dt>
                <dd>
                  <RiskIndicator level={material.stockoutRisk} />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Warehouse</dt>
                <dd className="text-body text-foreground">{material.warehouse}</dd>
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
// Header right-side actions — identical structure to the other "Log"/
// "Schedule" demo pages' own HeaderRightActions, reused verbatim.
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

export default function MaterialsInventoryPage() {
  const [orgId, setOrgId] = React.useState("brigade-group")
  const [projectId, setProjectId] = React.useState("brigade-homes")
  const [materials, setMaterials] = React.useState<Material[]>(INITIAL_MATERIALS)
  const [viewingMaterial, setViewingMaterial] = React.useState<Material | null>(null)
  const [savedSnapshot, setSavedSnapshot] = React.useState<DataTableState>(DEFAULT_TABLE_STATE)
  const [liveState, setLiveState] = React.useState<DataTableState | null>(null)
  const [hasCustomSnapshot, setHasCustomSnapshot] = React.useState(false)

  const columns = React.useMemo<ColumnDef<Material>[]>(
    () => [
      { accessorKey: "id", header: "Material" },
      { accessorKey: "item", header: "Item" },
      {
        accessorKey: "category",
        header: "Category",
        meta: { filterVariant: "select", filterOptions: CATEGORY_OPTIONS.map((c) => ({ label: c.label, value: c.label })), filterLabel: "Category" },
      },
      { accessorKey: "uom", header: "UOM" },
      {
        accessorKey: "quantityOnHand",
        header: "Qty on hand",
        cell: ({ row }) => row.original.quantityOnHand.toLocaleString(),
      },
      {
        accessorKey: "reorderPoint",
        header: "Reorder pt",
        cell: ({ row }) => row.original.reorderPoint.toLocaleString(),
      },
      {
        accessorKey: "stockoutRisk",
        header: "Stockout risk",
        cell: ({ row }) => <RiskIndicator level={row.original.stockoutRisk} />,
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
        accessorKey: "unitCost",
        header: "Unit cost",
        cell: ({ row }) => currency.format(row.original.unitCost),
      },
      {
        accessorKey: "totalValue",
        header: "Total value",
        cell: ({ row }) => currency.format(row.original.totalValue),
      },
      {
        accessorKey: "warehouse",
        header: "Warehouse",
        meta: { filterVariant: "select", filterOptions: WAREHOUSE_OPTIONS.map((w) => ({ label: w.label, value: w.label })), filterLabel: "Warehouse" },
      },
      {
        accessorKey: "vendor",
        header: "Vendor",
        meta: { filterVariant: "select", filterOptions: VENDOR_OPTIONS, filterLabel: "Vendor" },
      },
    ],
    []
  )

  const bulkActions: DataTableBulkAction<Material>[] = React.useMemo(
    () => [
      {
        label: "Reorder",
        icon: Check,
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "success",
            title: `Reorder requested for ${rows.length} material${rows.length === 1 ? "" : "s"}`,
            description: rows.map((r) => r.id).join(", "),
          })
        },
      },
      {
        label: "Discontinue",
        icon: X,
        variant: "destructive",
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "destructive",
            title: `${rows.length} material${rows.length === 1 ? "" : "s"} discontinued`,
            description: rows.map((r) => r.id).join(", "),
          })
        },
      },
    ],
    []
  )

  function rowActions(material: Material): DataTableBulkAction<Material>[] {
    return [
      {
        label: "View",
        icon: Eye,
        onAction: () => setViewingMaterial(material),
      },
      {
        label: "Adjust stock",
        icon: Pencil,
        onAction: () => {
          toast({ title: `Editing ${material.id}` })
        },
      },
      {
        label: "Remove from inventory",
        icon: Trash2,
        variant: "destructive",
        onAction: () => {
          toast({ variant: "destructive", title: `${material.id} removed from inventory` })
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
            <SidebarItem icon={Archive} active>
              Inventory
            </SidebarItem>
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
            { label: "Brigade Homes", href: "/demo/materials-inventory" },
            { label: "Materials Inventory" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-heading text-foreground">Materials Inventory</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  variant: "success",
                  title: "Inventory refreshed",
                  description: `${materials.length} materials loaded.`,
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
            <NewMaterialDialog
              nextMaterialNumber={1001 + materials.length}
              onCreate={(material) => setMaterials((current) => [material, ...current])}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <DataTable
            columns={columns}
            data={materials}
            getRowId={(row) => row.id}
            density="compact"
            enableRowSelection
            bulkActions={bulkActions}
            rowActions={rowActions}
            globalFilterPlaceholder="Search materials…"
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
                : "Defaults to sorting by Qty on hand, ascending — the most depleted materials first. Sort or filter the table above, then save to capture a new snapshot."}{" "}
              (Serialization contract only — see the Gap Analysis Report; there is no named,
              persisted &quot;view&quot; feature.)
            </p>
          </div>
        </div>
      </div>

      <MaterialDetailDialog
        material={viewingMaterial}
        onOpenChange={(open) => !open && setViewingMaterial(null)}
      />
    </AppShell>
  )
}
