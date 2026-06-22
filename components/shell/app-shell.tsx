"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ShellContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  /** Mobile overlay-drawer open state — independent of `collapsed` (which only
   *  ever means icon-rail vs. expanded at the `md` breakpoint and above).
   *  Always starts closed, regardless of `defaultCollapsed`. */
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

const ShellContext = React.createContext<ShellContextValue | null>(null)

function useShell() {
  const context = React.useContext(ShellContext)
  if (!context) {
    throw new Error("Shell components must be rendered inside <AppShell>")
  }
  return context
}

/** True when the viewport is narrower than `breakpointPx` — used specifically
 *  to decide whether the header's single nav-toggle button should control the
 *  mobile overlay drawer or the desktop/tablet icon-rail collapse. Not a
 *  general-purpose responsive primitive; CSS breakpoints handle the rest.
 *
 *  useSyncExternalStore, not useState+useEffect — the same React-correct tool
 *  already established in components/theme-provider.tsx for "subscribe to a
 *  browser-only media query": calling setState synchronously inside an effect
 *  body hits a real react-hooks/set-state-in-effect lint error, confirmed
 *  again here rather than assumed safe from that earlier fix. */
function useIsBelowBreakpoint(breakpointPx: number) {
  const getSnapshot = React.useCallback(
    () => window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches,
    [breakpointPx]
  )
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const query = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
      query.addEventListener("change", callback)
      return () => query.removeEventListener("change", callback)
    },
    [breakpointPx]
  )
  const getServerSnapshot = React.useCallback(() => false, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

interface AppShellProps {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
}

function AppShell({
  header,
  sidebar,
  children,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className,
}: AppShellProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed)
  const collapsed = controlledCollapsed ?? internalCollapsed
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      setInternalCollapsed(next)
      onCollapsedChange?.(next)
    },
    [onCollapsedChange]
  )

  return (
    <ShellContext.Provider value={{ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }}>
      <div className={cn("flex h-screen flex-col", className)}>
        <div className="h-16 shrink-0">{header}</div>
        <div className="flex flex-1 overflow-hidden bg-sidebar">
          <div className="md:shrink-0">{sidebar}</div>
          <div className="min-w-0 flex-1 overflow-hidden p-2">
            <main className="h-full overflow-y-auto rounded-md bg-background text-foreground">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ShellContext.Provider>
  )
}

export { AppShell, useShell, useIsBelowBreakpoint }
