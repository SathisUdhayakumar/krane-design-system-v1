"use client"

import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function BasicPopoverExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-medium">Basic popover</p>
        <p className="mt-1 text-muted-foreground">
          Plain content anchored to its trigger — no actions, no special semantics.
        </p>
      </PopoverContent>
    </Popover>
  )
}

function ActionPopoverExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">PO actions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1">
        <PopoverClose asChild>
          <button className="flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
            Duplicate PO
          </button>
        </PopoverClose>
        <PopoverClose asChild>
          <button className="flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
            Archive PO
          </button>
        </PopoverClose>
        <PopoverClose asChild>
          <button className="flex w-full rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10">
            Reject PO
          </button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

function InformationPopoverExample() {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      Risk: Medium
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="What does Medium risk mean?"
          >
            <Info />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <p className="font-medium">Medium risk</p>
          <p className="mt-1 text-muted-foreground">
            Based on vendor delivery history and current budget variance. Review
            before approval, but no immediate action required.
          </p>
        </PopoverContent>
      </Popover>
    </span>
  )
}

function PlacementPopoverExample() {
  const sides = ["top", "right", "bottom", "left"] as const

  return (
    <div className="grid w-fit grid-cols-2 gap-3">
      {sides.map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={side} className="w-48">
            <p className="text-muted-foreground">Placed on the {side}.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}

export default function PopoverDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Popover demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Basic, action, and information popovers, plus all four placement sides.
      </p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Basic popover</h2>
          <BasicPopoverExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Action popover</h2>
          <ActionPopoverExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Information popover</h2>
          <InformationPopoverExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Placements</h2>
          <PlacementPopoverExample />
        </section>
      </div>
    </div>
  )
}
