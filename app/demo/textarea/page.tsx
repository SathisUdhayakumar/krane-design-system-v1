import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const LONG_NOTE = `Vendor confirmed delivery window has slipped twice already — first from the original 2-week lead time to 3 weeks, then again citing a supplier-side material shortage on the galvanized rebar batch.

Procurement has asked for a written commitment on the new date before releasing the next milestone payment. Flagging here so whoever picks up this PO next has the full history without digging through email threads.

Will follow up directly with the vendor's account manager once the signed commitment comes back.`

export default function TextareaDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Textarea demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Label pairing, disabled vs. read-only, the four <code>status</code> values, and a
        mixed-form composition with Input.
      </p>

      <div className="flex max-w-md flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Default</h2>
          <div className="flex flex-col gap-3">
            <Textarea placeholder="Add a note…" />
            <Textarea defaultValue={"Delivered on time, no issues.\nVendor confirmed via email."} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Label pairing (stacked above)
          </h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="po-notes">Order notes</Label>
            <Textarea id="po-notes" placeholder="Internal notes about this purchase order…" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Disabled vs. read-only
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="disabled-notes" disabled>
                Notes
              </Label>
              <Textarea id="disabled-notes" disabled defaultValue="Can't edit this right now." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="readonly-notes">Rejection reason</Label>
              <Textarea
                id="readonly-notes"
                readOnly
                defaultValue="Quote exceeded approved budget by 18%. Returned to vendor for re-quote."
              />
            </div>
            <p className="text-caption text-muted-foreground">
              Read-only drops the resize handle (<code>read-only:resize-none</code>) — offering a
              resize affordance on content the user can&apos;t edit would be a confusing signal.
              Text stays full-opacity and selectable, unlike disabled.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status (default / success / warning / error)
          </h2>
          <div className="flex flex-col gap-3">
            <Textarea placeholder="Default" />
            <div className="flex flex-col gap-1.5">
              <Textarea status="success" defaultValue="Reviewed and approved by finance." />
              <p className="text-caption text-success-text">Note saved and confirmed.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Textarea status="warning" defaultValue="Pending legal review before vendor sign-off." />
              <p className="text-caption text-warning-text">
                This note hasn&apos;t been acknowledged by the assigned reviewer yet.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Textarea status="error" defaultValue="" placeholder="Reason is required" />
              <p className="text-caption text-destructive">
                A rejection reason is required before this PO can be returned.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Long content (resize-y, min-h-[80px])
          </h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="long-note">Vendor history</Label>
            <Textarea id="long-note" defaultValue={LONG_NOTE} rows={6} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Mixed-form composition (Input + Textarea)
          </h2>
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-name-mixed" required>
                Vendor name
              </Label>
              <Input id="vendor-name-mixed" placeholder="Sterling Rebar Co." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor-notes-mixed">Notes</Label>
              <Textarea id="vendor-notes-mixed" placeholder="Additional instructions…" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
