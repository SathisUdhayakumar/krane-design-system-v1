"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import {
  Archive,
  Bell,
  Calendar,
  CalendarClock,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Globe,
  MapPin,
  NotebookPen,
  Plus,
  Settings,
  ShieldCheck,
  Share2,
  Truck,
} from "lucide-react"

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
import { DataTable } from "@/components/ui/data-table"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

type Submittal = {
  id: string
  item: string
  vendor: string
  status: "success" | "warning" | "pending" | "info" | "destructive"
  statusLabel: string
  dueDate: string
}

const SUBMITTALS: Submittal[] = [
  { id: "SUB-301", item: "Structural steel shop drawings", vendor: "Sterling Rebar Co.", status: "pending", statusLabel: "Pending", dueDate: "2026-07-02" },
  { id: "SUB-302", item: "Glazing system samples", vendor: "Vantage Glazing", status: "warning", statusLabel: "Revise & resubmit", dueDate: "2026-06-28" },
  { id: "SUB-303", item: "Concrete mix design", vendor: "Coastal Concrete", status: "success", statusLabel: "Approved", dueDate: "2026-06-20" },
  { id: "SUB-304", item: "MEP coordination drawings", vendor: "Apex Electrical", status: "info", statusLabel: "Under review", dueDate: "2026-07-10" },
]

const submittalColumns: ColumnDef<Submittal>[] = [
  { accessorKey: "id", header: "Submittal" },
  { accessorKey: "item", header: "Item" },
  { accessorKey: "vendor", header: "Vendor" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.status}>{row.original.statusLabel}</Badge>,
  },
  { accessorKey: "dueDate", header: "Due" },
]

function HeaderRightActions() {
  return (
    <>
      {/* Least-essential controls — hidden below md so the always-essential
       *  ones (notifications, theme, account) never lose the space contest
       *  to them (SHELL_RESPONSIVENESS_AUDIT.md's header-overlap finding). */}
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

export default function AppShellDemoPage() {
  const [orgId, setOrgId] = React.useState("brigade-group")
  const [projectId, setProjectId] = React.useState("brigade-homes")

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
            <SidebarItem
              icon={MapPin}
              badge={<SidebarBadge variant="new">NEW</SidebarBadge>}
            >
              Area Map
            </SidebarItem>
            <SidebarItem icon={Archive}>Reservation</SidebarItem>
          </SidebarGroup>

          <div className="my-1 border-t border-sidebar-border" />

          <SidebarGroup label="KAI">
            <SidebarItem icon={ShieldCheck}>KAI Agent</SidebarItem>
            <SidebarItem icon={FileText}>Saved Documents</SidebarItem>
            <SidebarItem
              icon={Share2}
              badge={<SidebarBadge variant="count">2</SidebarBadge>}
            >
              Integrations
            </SidebarItem>
          </SidebarGroup>
        </Sidebar>
      }
    >
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <Breadcrumb
          items={[
            { label: "Brigade Homes", href: "/demo/app-shell" },
            { label: "Submittals" },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-heading text-foreground">Submittals</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  variant: "success",
                  title: "Submittal log refreshed",
                  description: "4 submittals loaded.",
                })
              }
            >
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus /> New submittal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create submittal</DialogTitle>
                  <DialogDescription>
                    Log a new submittal for vendor and engineering review.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={() =>
                        toast({
                          variant: "success",
                          title: "Submittal created",
                          description: "SUB-305 was added to the log.",
                        })
                      }
                    >
                      Create
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <DataTable
          columns={submittalColumns}
          data={SUBMITTALS}
          getRowId={(row) => row.id}
          globalFilterPlaceholder="Search submittals…"
        />
      </div>
    </AppShell>
  )
}
