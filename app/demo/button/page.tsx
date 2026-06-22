"use client"

import { ChevronDown, Download, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ButtonDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Button demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Six variants, eight sizes (four text + four icon-only), <code>asChild</code>{" "}
        composition, disabled and <code>aria-invalid</code> states, and icon placement via the
        existing <code>data-icon</code> affordance already built into <code>buttonVariants</code>{" "}
        but not previously demonstrated anywhere in this system.
      </p>

      <div className="flex max-w-2xl flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Variants</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Sizes</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Icon-only sizes
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="icon-xs" variant="outline" aria-label="Delete (extra small)">
              <Trash2 />
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="Delete (small)">
              <Trash2 />
            </Button>
            <Button size="icon" variant="outline" aria-label="Delete (default)">
              <Trash2 />
            </Button>
            <Button size="icon-lg" variant="outline" aria-label="Delete (large)">
              <Trash2 />
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Icon placement (<code>data-icon</code>)
          </h2>
          <p className="mb-3 text-caption text-muted-foreground">
            <code>buttonVariants</code> already adjusts padding via{" "}
            <code>has-data-[icon=inline-start]</code>/<code>has-data-[icon=inline-end]</code> —
            an existing affordance no demo in this system had exercised yet.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Plus data-icon="inline-start" />
              New submittal
            </Button>
            <Button variant="outline">
              Download
              <Download data-icon="inline-end" />
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            <code>asChild</code> — composes onto another element
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <a href="#asChild-target">Renders as a real anchor</a>
            </Button>
          </div>
          <p id="asChild-target" className="mt-2 text-caption text-muted-foreground">
            No wrapper <code>&lt;button&gt;</code> around an <code>&lt;a&gt;</code> — Radix{" "}
            <code>Slot</code> merges Button&apos;s classes onto the anchor itself.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">States</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled outline
            </Button>
            <Button aria-invalid="true">Invalid</Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            <code>aria-expanded</code> — as a real menu trigger
          </h2>
          <p className="mb-3 text-caption text-muted-foreground">
            Outline/secondary/ghost variants already style <code>aria-expanded</code> — visible
            here because Radix sets it automatically while the menu is open, not because this
            demo sets it manually.
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Approve</DropdownMenuItem>
              <DropdownMenuItem>Reject</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      </div>
    </div>
  )
}
