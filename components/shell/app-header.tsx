"use client"

import * as React from "react"
import { ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useShell, useIsBelowBreakpoint } from "@/components/shell/app-shell"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  organizationSwitcher?: React.ReactNode
  projectSwitcher?: React.ReactNode
  rightActions?: React.ReactNode
  className?: string
}

function AppHeader({
  organizationSwitcher,
  projectSwitcher,
  rightActions,
  className,
}: AppHeaderProps) {
  const { collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen } = useShell()
  const isMobile = useIsBelowBreakpoint(768)
  const navIsOpen = isMobile ? mobileMenuOpen : !collapsed

  return (
    <header
      data-slot="app-header"
      className={cn(
        "flex h-16 items-center justify-between gap-2 bg-sidebar px-3 text-sidebar-foreground sm:gap-4 sm:px-5",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M12 3 2 19h20L12 3z" />
            </svg>
          </span>
          <span className="hidden text-base font-bold tracking-wide text-sidebar-accent-foreground sm:inline">
            KRANE
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring"
          aria-label={isMobile ? (navIsOpen ? "Close menu" : "Open menu") : navIsOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-pressed={navIsOpen}
          onClick={() => (isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setCollapsed(!collapsed))}
        >
          {navIsOpen ? <PanelLeftClose /> : <PanelLeft />}
        </Button>

        {(organizationSwitcher || projectSwitcher) && (
          <div className="flex min-w-0 items-center gap-1 text-sm sm:gap-2">
            {organizationSwitcher}
            {organizationSwitcher && projectSwitcher && (
              <ChevronRight className="size-3.5 shrink-0 text-sidebar-foreground/60" aria-hidden="true" />
            )}
            {projectSwitcher}
          </div>
        )}
      </div>

      {rightActions && (
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">{rightActions}</div>
      )}
    </header>
  )
}

export { AppHeader }
