"use client"

import * as React from "react"
import { Archive, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function BasicMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem disabled>Billing (disabled)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RowActionsMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Row actions for PO-10231">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye /> View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Archive /> Archive
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CheckboxMenuExample() {
  const [showStatus, setShowStatus] = React.useState(true)
  const [showRisk, setShowRisk] = React.useState(true)
  const [showAmount, setShowAmount] = React.useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Columns</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
          Status
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showRisk} onCheckedChange={setShowRisk}>
          Risk
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showAmount} onCheckedChange={setShowAmount}>
          Amount
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RadioMenuExample() {
  const [density, setDensity] = React.useState("default")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Density: {density}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Table density</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NestedSubmenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">PO-10231 actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Eye /> View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export as…</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
            <DropdownMenuItem>XLSX</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function DropdownMenuDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — DropdownMenu demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Basic menu, row actions, checkbox items, radio items, and a nested submenu.
      </p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Basic menu</h2>
          <BasicMenuExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Row actions menu (View, Edit, Archive, Delete)
          </h2>
          <RowActionsMenuExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Checkbox menu items</h2>
          <CheckboxMenuExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Radio menu items</h2>
          <RadioMenuExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Nested submenu</h2>
          <NestedSubmenuExample />
        </section>
      </div>
    </div>
  )
}
