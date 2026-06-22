"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
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

function BasicDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title, a description, and two actions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DestructiveDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete PO-10235</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete purchase order?</DialogTitle>
          <DialogDescription>
            PO-10235 (Vantage Glazing, $98,750) will be permanently deleted. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BulkActionDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Approve selected (12)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve 12 purchase orders?</DialogTitle>
          <DialogDescription>
            This will move 12 selected purchase orders, totaling $612,400, into
            Approved status. Vendors will be notified.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Approve 12 POs</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LongContentDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View procurement policy</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Procurement policy — Section 4</DialogTitle>
          <DialogDescription>
            Header and footer stay pinned; only the body below scrolls.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-6 flex-1 overflow-y-auto px-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 14 }, (_, i) => (
              <p key={i}>
                Clause {i + 1}.1 — All purchase orders exceeding $50,000 require
                dual approval from both the requesting department head and
                procurement finance before being released to the vendor. Risk
                tier &quot;High&quot; or above additionally requires a documented
                mitigation note attached to the PO record.
              </p>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Acknowledge</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FormDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New vendor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create vendor</DialogTitle>
          <DialogDescription>
            Add a new vendor to the procurement directory.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vendor-name" className="text-sm font-medium">
              Vendor name
            </label>
            <input
              id="vendor-name"
              type="text"
              placeholder="Sterling Rebar Co."
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vendor-category" className="text-sm font-medium">
              Category
            </label>
            <input
              id="vendor-category"
              type="text"
              placeholder="Steel, Concrete, MEP…"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Create vendor</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function DialogDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Dialog demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Basic, destructive, bulk-action, long-content (scrollable), and form dialogs.
      </p>

      <div className="flex flex-col gap-6">
        <section className="flex items-center gap-3">
          <span className="w-56 text-sm text-muted-foreground">Basic dialog</span>
          <BasicDialogExample />
        </section>
        <section className="flex items-center gap-3">
          <span className="w-56 text-sm text-muted-foreground">Destructive confirmation</span>
          <DestructiveDialogExample />
        </section>
        <section className="flex items-center gap-3">
          <span className="w-56 text-sm text-muted-foreground">Bulk action confirmation</span>
          <BulkActionDialogExample />
        </section>
        <section className="flex items-center gap-3">
          <span className="w-56 text-sm text-muted-foreground">Long-content (scroll)</span>
          <LongContentDialogExample />
        </section>
        <section className="flex items-center gap-3">
          <span className="w-56 text-sm text-muted-foreground">Form dialog</span>
          <FormDialogExample />
        </section>
      </div>
    </div>
  )
}
