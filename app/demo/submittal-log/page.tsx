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
import { Button } from "@/components/ui/button"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import {
  DataTable,
  DataTableEmptyState,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/hooks/use-toast"

// ---------------------------------------------------------------------------
// Data — same Submittal shape, STAGE_OPTIONS, and vendor pool already
// established in app/demo/data-table-advanced/page.tsx's SubmittalsTable and
// app/demo/app-shell/page.tsx, extended with two columns ("Spec Section",
// "Submitted By") for a fuller real-page treatment — the same enrichment
// already applied to ProcurementLogTable's own real-page counterpart.
// ---------------------------------------------------------------------------

type Stage = "draft" | "in-review" | "done"

type Submittal = {
  id: string
  item: string
  vendor: string
  specSection: string
  stage: Stage
  stageLabel: string
  dueDate: string
  submittedBy: string
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
  "Structural steel shop drawings",
  "Glazing system samples",
  "Concrete mix design",
  "MEP coordination drawings",
  "Elevator shop drawings",
  "Roofing material certs",
  "Fire-rated door schedule",
  "Curtain wall details",
  "Rebar placement drawings",
  "HVAC equipment cut sheets",
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

const STAGES: { stage: Stage; label: string }[] = [
  { stage: "draft", label: "Draft" },
  { stage: "in-review", label: "In Review" },
  { stage: "done", label: "Done" },
]

const SUBMITTED_BY = ["Jordan Lee", "Alex Kim", "Sam Patel", "Morgan Reyes"]

const STAGE_OPTIONS = STAGES.map((s) => ({ label: s.label, value: s.stage }))
const VENDOR_OPTIONS = Array.from(new Set(VENDORS)).map((v) => ({ label: v, value: v }))

function makeSubmittals(): Submittal[] {
  return Array.from({ length: 28 }, (_, i) => {
    const s = STAGES[i % STAGES.length]
    return {
      id: `SUB-${501 + i}`,
      item: ITEMS[i % ITEMS.length],
      vendor: VENDORS[i % VENDORS.length],
      specSection: CSI_DIVISIONS[i % CSI_DIVISIONS.length].label,
      stage: s.stage,
      stageLabel: s.label,
      dueDate: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
      submittedBy: SUBMITTED_BY[i % SUBMITTED_BY.length],
    }
  })
}

const INITIAL_SUBMITTALS = makeSubmittals()

// ---------------------------------------------------------------------------
// New Submittal form — same Form/FormField/zod composition already
// established in app/demo/form/page.tsx and reused for Procurement Log's
// New Purchase Order dialog, adapted to submittal-appropriate fields.
// ---------------------------------------------------------------------------

const VENDOR_FORM_OPTIONS: ComboboxOption[] = VENDOR_OPTIONS.map((v) => ({
  value: v.value,
  label: v.label,
}))

const submittalFormSchema = z
  .object({
    item: z.string().min(1, "Item is required"),
    vendor: z.string().min(1, "Vendor is required"),
    specSection: z.string().min(1, "Spec section is required"),
    stage: z.enum(["draft", "in-review", "done"]),
    dueDate: z.string().min(1, "Due date is required"),
    notes: z.string().max(280, "Notes must be 280 characters or fewer.").optional(),
  })
  .refine((data) => data.vendor !== "Sterling Rebar Co." || data.stage !== "done", {
    message: "Sterling Rebar Co. submittals always require In Review before Done.",
    path: ["stage"],
  })

type SubmittalFormValues = z.infer<typeof submittalFormSchema>

function NewSubmittalDialog({
  nextSubmittalNumber,
  onCreate,
}: {
  nextSubmittalNumber: number
  onCreate: (submittal: Submittal) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<SubmittalFormValues>({
    resolver: zodResolver(submittalFormSchema),
    defaultValues: {
      item: "",
      vendor: "",
      specSection: "",
      stage: "draft",
      dueDate: "",
      notes: "",
    },
  })

  async function onSubmit(values: SubmittalFormValues) {
    setSubmitting(true)
    // Simulated async validation — same setTimeout convention already used in
    // the Input/Combobox/Form demos' own "loading" examples. No real network call.
    await new Promise((resolve) => setTimeout(resolve, 700))

    const division = CSI_DIVISIONS.find((d) => d.value === values.specSection)
    const stage = STAGES.find((s) => s.stage === values.stage)!
    const submittalId = `SUB-${nextSubmittalNumber}`
    const newSubmittal: Submittal = {
      id: submittalId,
      item: values.item,
      vendor: VENDOR_FORM_OPTIONS.find((v) => v.value === values.vendor)?.label ?? values.vendor,
      specSection: division ? division.label : values.specSection,
      stage: stage.stage,
      stageLabel: stage.label,
      dueDate: values.dueDate,
      submittedBy: "Jordan Lee",
    }

    onCreate(newSubmittal)
    toast({
      variant: "success",
      title: "Submittal created",
      description: `${newSubmittal.id} was added to the submittal log.`,
    })
    setSubmitting(false)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New submittal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create submittal</DialogTitle>
          <DialogDescription>
            Log a new submittal for vendor and engineering review.
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
                    <Input placeholder="e.g. Structural steel shop drawings" {...field} />
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
                name="specSection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Spec section</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger status={form.formState.errors.specSection ? "error" : "default"}>
                          <SelectValue placeholder="Select a section" />
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
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger status={form.formState.errors.stage ? "error" : "default"}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.stage} value={s.stage}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Sterling Rebar Co. submittals can&apos;t be created directly as Done — try it
                    above with Stage set to Done to see the cross-field rule fire on this field.
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
                  <FormDescription>Optional — visible to the reviewer.</FormDescription>
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
                {submitting ? "Creating…" : "Create submittal"}
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
// tokens, mirroring Procurement Log's PurchaseOrderDetailDialog exactly,
// not a new "detail view" component.
// ---------------------------------------------------------------------------

function SubmittalDetailDialog({
  submittal,
  onOpenChange,
}: {
  submittal: Submittal | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={submittal !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {submittal && (
          <>
            <DialogHeader>
              <DialogTitle>{submittal.id}</DialogTitle>
              <DialogDescription>Submittal detail</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Item</dt>
                <dd className="text-body text-foreground">{submittal.item}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Vendor</dt>
                <dd className="text-body text-foreground">{submittal.vendor}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Spec section</dt>
                <dd className="text-body text-foreground">{submittal.specSection}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Stage</dt>
                <dd className="text-body text-foreground">{submittal.stageLabel}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Due date</dt>
                <dd className="text-body text-foreground">{submittal.dueDate}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">Submitted by</dt>
                <dd className="text-body text-foreground">{submittal.submittedBy}</dd>
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
// Header right-side actions — identical structure to the Procurement Log and
// App Shell demo pages' own HeaderRightActions, reused verbatim.
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

export default function SubmittalLogPage() {
  const [orgId, setOrgId] = React.useState("brigade-group")
  const [projectId, setProjectId] = React.useState("brigade-homes")
  const [submittals, setSubmittals] = React.useState<Submittal[]>(INITIAL_SUBMITTALS)
  const [showEmpty, setShowEmpty] = React.useState(false)
  const [viewingSubmittal, setViewingSubmittal] = React.useState<Submittal | null>(null)
  const [savedSnapshot, setSavedSnapshot] = React.useState<DataTableState | null>(null)
  const [liveState, setLiveState] = React.useState<DataTableState | null>(null)

  const columns = React.useMemo<ColumnDef<Submittal>[]>(
    () => [
      { accessorKey: "id", header: "Submittal" },
      { accessorKey: "item", header: "Item" },
      {
        accessorKey: "vendor",
        header: "Vendor",
        meta: { filterVariant: "select", filterOptions: VENDOR_OPTIONS, filterLabel: "Vendor" },
      },
      { accessorKey: "specSection", header: "Spec section" },
      {
        accessorKey: "stage",
        header: "Stage",
        meta: { filterVariant: "select", filterOptions: STAGE_OPTIONS, filterLabel: "Stage" },
        cell: ({ row }) => <span>{row.original.stageLabel}</span>,
      },
      {
        accessorKey: "dueDate",
        header: "Due date",
        meta: { filterVariant: "dateRange", filterLabel: "Due date" },
      },
      { accessorKey: "submittedBy", header: "Submitted by" },
    ],
    []
  )

  const bulkActions: DataTableBulkAction<Submittal>[] = React.useMemo(
    () => [
      {
        label: "Approve",
        icon: Check,
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "success",
            title: `${rows.length} submittal${rows.length === 1 ? "" : "s"} approved`,
            description: rows.map((r) => r.id).join(", "),
          })
        },
      },
      {
        label: "Send back",
        icon: X,
        variant: "destructive",
        confirm: {
          title: (count) => `Send back ${count} submittal${count === 1 ? "" : "s"}?`,
          description: (count) =>
            `${count} submittal${count === 1 ? "" : "s"} will be returned to the vendor for revision.`,
        },
        onAction: async (rows) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast({
            variant: "destructive",
            title: `${rows.length} submittal${rows.length === 1 ? "" : "s"} sent back`,
            description: rows.map((r) => r.id).join(", "),
          })
        },
      },
    ],
    []
  )

  function rowActions(submittal: Submittal): DataTableBulkAction<Submittal>[] {
    return [
      {
        label: "Open",
        icon: Eye,
        onAction: () => setViewingSubmittal(submittal),
      },
      {
        label: "Edit",
        icon: Pencil,
        onAction: () => {
          toast({ title: `Editing ${submittal.id}` })
        },
      },
      {
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        onAction: () => {
          toast({ variant: "destructive", title: `${submittal.id} deleted` })
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
            <SidebarItem icon={Truck}>Deliveries</SidebarItem>
          </SidebarGroup>

          <SidebarGroup label="Schedule viewer">
            <SidebarItem icon={Calendar}>Project Schedule</SidebarItem>
            <SidebarItem icon={NotebookPen}>Lookahead Plan</SidebarItem>
          </SidebarGroup>

          <div className="my-1 border-t border-sidebar-border" />

          <div className="flex flex-col gap-0.5">
            <SidebarItem icon={ClipboardCheck} active>
              Submittals
            </SidebarItem>
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
            { label: "Brigade Homes", href: "/demo/submittal-log" },
            { label: "Submittal Log" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-heading text-foreground">Submittal Log</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  variant: "success",
                  title: "Submittal log refreshed",
                  description: `${submittals.length} submittals loaded.`,
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
            <NewSubmittalDialog
              nextSubmittalNumber={501 + submittals.length}
              onCreate={(submittal) => setSubmittals((current) => [submittal, ...current])}
            />
          </div>
        </div>

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
            columns={columns}
            data={showEmpty ? [] : submittals}
            getRowId={(row) => row.id}
            density="compact"
            enableRowSelection
            bulkActions={bulkActions}
            rowActions={rowActions}
            globalFilterPlaceholder="Search submittals…"
            enablePagination
            initialState={savedSnapshot ?? undefined}
            onTableStateChange={setLiveState}
            emptyState={
              <DataTableEmptyState
                title="No submittals yet"
                description="Create your first submittal to get started."
              />
            }
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

      <SubmittalDetailDialog
        submittal={viewingSubmittal}
        onOpenChange={(open) => !open && setViewingSubmittal(null)}
      />
    </AppShell>
  )
}
