"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive, Slot } from "radix-ui"
import { ChevronDown } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShell } from "@/components/shell/app-shell"
import { cn } from "@/lib/utils"

const SIDEBAR_WIDTH_EXPANDED = "194px"
const SIDEBAR_WIDTH_COLLAPSED = "64px"

interface SidebarProps {
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function Sidebar({ children, footer, className }: SidebarProps) {
  const { collapsed, mobileMenuOpen, setMobileMenuOpen } = useShell()

  return (
    <>
      {/* Mobile overlay backdrop — below md only, and only while the drawer is
       *  open. Starts below the header (top-16) so the header itself, with its
       *  own nav-toggle button, stays reachable to close the drawer too. */}
      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/50 md:hidden"
        />
      )}
      <nav
        data-slot="sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        data-mobile-open={mobileMenuOpen ? "true" : "false"}
        aria-label="Primary"
        style={{ "--sidebar-width": collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED } as React.CSSProperties}
        className={cn(
          // Below md: a fixed-position overlay drawer, slid off-screen by
          // default and only ever as wide as a comfortable touch target,
          // independent of the desktop icon-rail/expanded widths above.
          // z-50, strictly above the backdrop's z-40 — explicit, not relying
          // on DOM order between siblings to determine which stacks on top.
          "fixed inset-x-0 top-16 bottom-0 z-50 w-72 -translate-x-full bg-sidebar text-sidebar-foreground transition-transform duration-normal",
          mobileMenuOpen && "translate-x-0",
          // At md and above: the exact pre-existing static, width-toggling sidebar.
          // h-full only applies at md+ — combined with `fixed` below it, an
          // unconditional height:100% would resolve against the viewport and
          // overflow past the bottom by exactly the header's own height.
          "md:static md:inset-auto md:z-auto md:h-full md:w-[var(--sidebar-width)] md:translate-x-0 md:transition-[width] md:duration-normal",
          "flex flex-col",
          className
        )}
      >
        <div className="flex-1 overflow-y-auto px-2.5 py-4">
          <div className="flex flex-col gap-4">{children}</div>
        </div>
        {footer && (
          <div className="shrink-0 border-t border-sidebar-border px-2.5 py-3">{footer}</div>
        )}
      </nav>
    </>
  )
}

interface SidebarGroupProps {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

function SidebarGroup({ label, children, defaultOpen = true, className }: SidebarGroupProps) {
  const { collapsed } = useShell()

  // Icon-rail mode has no room for a label/chevron to click — always show all items.
  if (collapsed) {
    return (
      <div data-slot="sidebar-group" className={cn("flex flex-col gap-0.5", className)}>
        {children}
      </div>
    )
  }

  return (
    <CollapsiblePrimitive.Root
      defaultOpen={defaultOpen}
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-0.5", className)}
    >
      <CollapsiblePrimitive.Trigger asChild>
        <button
          type="button"
          data-slot="sidebar-section-label"
          className="group/sidebar-trigger flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/70 outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring"
        >
          <ChevronDown
            className="size-3.5 shrink-0 transition-transform duration-normal group-data-[state=closed]/sidebar-trigger:-rotate-90"
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
        </button>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="flex flex-col gap-0.5 pt-0.5">{children}</div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

function SidebarSectionLabel({
  children,
  closed = false,
  className,
}: {
  children: React.ReactNode
  closed?: boolean
  className?: string
}) {
  const { collapsed } = useShell()

  if (collapsed) return null

  return (
    <div
      data-slot="sidebar-section-label"
      className={cn("flex items-center gap-1 px-2 py-1.5 text-xs text-sidebar-foreground/70", className)}
    >
      <ChevronDown
        className={cn("size-3.5 shrink-0 transition-transform duration-normal", closed && "-rotate-90")}
        aria-hidden="true"
      />
      <span className="truncate">{children}</span>
    </div>
  )
}

interface SidebarItemProps extends React.ComponentProps<"button"> {
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: React.ReactNode
  asChild?: boolean
}

function SidebarItem({
  icon: Icon,
  active = false,
  badge,
  asChild = false,
  className,
  children,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useShell()
  const Comp = asChild ? Slot.Root : "button"

  const item = (
    <Comp
      type={asChild ? undefined : "button"}
      data-slot="sidebar-item"
      data-active={active ? "true" : undefined}
      className={cn(
        "flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-sm text-sidebar-foreground outline-none transition-colors",
        "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        "focus-visible:ring-3 focus-visible:ring-sidebar-ring",
        "data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
        className
      )}
      {...props}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="flex-1 truncate text-left">{children}</span>}
      {!collapsed && badge}
    </Comp>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{children}</TooltipContent>
      </Tooltip>
    )
  }

  return item
}

function SidebarBadge({
  variant = "count",
  children,
  className,
}: {
  variant?: "count" | "new"
  children: React.ReactNode
  className?: string
}) {
  if (variant === "new") {
    return (
      <span
        data-slot="sidebar-badge"
        data-variant="new"
        className={cn(
          "rounded-sm bg-badge-new px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-badge-new-foreground uppercase",
          className
        )}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      data-slot="sidebar-badge"
      data-variant="count"
      className={cn(
        "flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div data-slot="sidebar-footer">{children}</div>
}

export {
  Sidebar,
  SidebarGroup,
  SidebarSectionLabel,
  SidebarItem,
  SidebarBadge,
  SidebarFooter,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
}
