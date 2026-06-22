"use client"

import * as React from "react"
import { Building, ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Project {
  id: string
  label: string
}

interface ProjectSwitcherProps {
  projects: Project[]
  value: string
  onValueChange?: (id: string) => void
}

function ProjectSwitcher({ projects, value, onValueChange }: ProjectSwitcherProps) {
  const current = projects.find((project) => project.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="project-switcher-trigger"
        aria-label={current?.label ?? "Select project"}
        className="flex min-h-11 min-w-11 shrink items-center gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-sm font-medium text-sidebar-accent-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent">
          <Building className="size-3.5" aria-hidden="true" />
        </span>
        <span className="hidden truncate sm:inline">{current?.label ?? "Select project"}</span>
        <ChevronDown className="hidden size-3.5 shrink-0 text-sidebar-foreground/70 sm:block" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {projects.map((project) => (
          <DropdownMenuItem key={project.id} onSelect={() => onValueChange?.(project.id)}>
            {project.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProjectSwitcher }
