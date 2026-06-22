import { Badge } from "@/components/ui/badge"
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator"

type StatusVariant = "success" | "warning" | "pending" | "info" | "destructive"

const PURCHASE_ORDERS: {
  po: string
  vendor: string
  amount: string
  status: StatusVariant
  statusLabel: string
  risk: RiskLevel
}[] = [
  { po: "PO-10231", vendor: "Sterling Rebar Co.", amount: "$84,200", status: "success", statusLabel: "Approved", risk: "low" },
  { po: "PO-10232", vendor: "Granite Supply Ltd.", amount: "$12,900", status: "warning", statusLabel: "Warning", risk: "medium" },
  { po: "PO-10233", vendor: "Apex Electrical", amount: "$210,000", status: "pending", statusLabel: "Pending", risk: "high" },
  { po: "PO-10234", vendor: "Coastal Concrete", amount: "$56,300", status: "warning", statusLabel: "Warning", risk: "high" },
  { po: "PO-10235", vendor: "Vantage Glazing", amount: "$98,750", status: "destructive", statusLabel: "Overdue", risk: "critical" },
  { po: "PO-10236", vendor: "Northwind Timber", amount: "$31,400", status: "info", statusLabel: "Info", risk: "low" },
]

function DemoContent() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Status badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="pending">Pending</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Risk indicators</h2>
        <div className="flex flex-wrap gap-2">
          <RiskIndicator level="low" />
          <RiskIndicator level="medium" />
          <RiskIndicator level="high" />
          <RiskIndicator level="critical" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Procurement orders</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">PO Number</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Vendor</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Risk</th>
              </tr>
            </thead>
            <tbody>
              {PURCHASE_ORDERS.map((row) => (
                <tr key={row.po} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-medium">{row.po}</td>
                  <td className="px-4 py-2 text-muted-foreground">{row.vendor}</td>
                  <td className="px-4 py-2">{row.amount}</td>
                  <td className="px-4 py-2">
                    <Badge variant={row.status}>{row.statusLabel}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <RiskIndicator level={row.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default function DemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Status &amp; Risk demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Status badges (operational state) vs. risk indicators (severity), in light and dark mode.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-6">
          <p className="mb-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">Light</p>
          <DemoContent />
        </div>
        <div className="dark rounded-xl border border-border bg-background p-6 text-foreground">
          <p className="mb-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">Dark</p>
          <DemoContent />
        </div>
      </div>
    </div>
  )
}
