"use client"

import { Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RiskIndicator } from "@/components/ui/risk-indicator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function BasicTooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Saves the current purchase order as a draft.</TooltipContent>
    </Tooltip>
  )
}

function IconOnlyTooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Vendor information">
          <Info />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Vendor information</TooltipContent>
    </Tooltip>
  )
}

function RiskIndicatorTooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-3 focus-visible:ring-ring">
        <RiskIndicator level="high" />
      </TooltipTrigger>
      <TooltipContent>
        Based on vendor delivery history and current budget variance — review
        before approval.
      </TooltipContent>
    </Tooltip>
  )
}

function StatusBadgeTooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-3 focus-visible:ring-ring">
        <Badge variant="warning">Warning</Badge>
      </TooltipTrigger>
      <TooltipContent>
        This purchase order is approaching its budget threshold or deadline.
      </TooltipContent>
    </Tooltip>
  )
}

function LongContentTooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Policy reference</Button>
      </TooltipTrigger>
      <TooltipContent>
        Purchase orders exceeding $50,000 require dual approval from both the
        requesting department head and procurement finance before being
        released to the vendor — wraps at a fixed max width rather than
        stretching the whole row.
      </TooltipContent>
    </Tooltip>
  )
}

function PlacementTooltipExample() {
  const sides = ["top", "right", "bottom", "left"] as const

  return (
    <div className="grid w-fit grid-cols-2 gap-3">
      {sides.map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Placed on the {side}.</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export default function TooltipDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Tooltip demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Hover or focus any trigger below. <code>TooltipProvider</code> is mounted once in
        the root layout, so delay timing is shared across the whole app.
      </p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Basic tooltip</h2>
          <BasicTooltipExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Icon-only button tooltip
          </h2>
          <IconOnlyTooltipExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Risk indicator explanation
          </h2>
          <RiskIndicatorTooltipExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status badge explanation
          </h2>
          <StatusBadgeTooltipExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Long-content tooltip
          </h2>
          <LongContentTooltipExample />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Placements</h2>
          <PlacementTooltipExample />
        </section>
      </div>
    </div>
  )
}
