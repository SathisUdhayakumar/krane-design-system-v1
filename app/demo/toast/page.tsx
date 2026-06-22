"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function ToastDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Toast demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Each button fires a real toast via the shared <code>useToast</code> store —
        rendered through the single <code>&lt;Toaster /&gt;</code> mounted in the root layout.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() =>
            toast({
              variant: "success",
              title: "PO-10231 approved",
              description: "Sterling Rebar Co. has been notified.",
            })
          }
        >
          Success toast
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast({
              variant: "warning",
              title: "Budget threshold approaching",
              description: "PO-10232 is at 92% of its allocated budget.",
            })
          }
        >
          Warning toast
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast({
              variant: "destructive",
              title: "Failed to submit PO",
              description: "Vantage Glazing's vendor record is missing a tax ID.",
            })
          }
        >
          Error toast
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast({
              variant: "info",
              title: "Vendor directory synced",
              description: "14 vendor records were updated from the ERP feed.",
            })
          }
        >
          Info toast
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            toast({ variant: "success", title: "PO-10231 approved" })
            toast({ variant: "warning", title: "PO-10232 nearing budget limit" })
            toast({ variant: "info", title: "Vendor directory synced" })
            toast({ variant: "destructive", title: "PO-10235 submission failed" })
          }}
        >
          Multiple stacked toasts
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast({
              variant: "info",
              title: "Procurement policy updated",
              description:
                "Section 4 of the procurement policy was revised: purchase orders exceeding $50,000 now require dual approval from both the requesting department head and procurement finance, and any PO scored High risk or above must include a documented mitigation note before it can be released to the vendor.",
            })
          }
        >
          Long-content toast
        </Button>
      </div>
    </div>
  )
}
