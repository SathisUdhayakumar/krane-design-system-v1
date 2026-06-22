"use client"

import * as React from "react"
import { Building2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Organization {
  id: string
  label: string
}

interface OrganizationSwitcherProps {
  organizations: Organization[]
  value: string
  onValueChange?: (id: string) => void
}

function OrganizationSwitcher({ organizations, value, onValueChange }: OrganizationSwitcherProps) {
  const current = organizations.find((org) => org.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="organization-switcher-trigger"
        aria-label={current?.label ?? "Select organization"}
        className="flex min-h-11 min-w-11 shrink items-center gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-sm font-medium text-sidebar-accent-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent">
          <Building2 className="size-3.5" aria-hidden="true" />
        </span>
        <span className="hidden truncate sm:inline">{current?.label ?? "Select organization"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onSelect={() => onValueChange?.(org.id)}>
            {org.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { OrganizationSwitcher }
