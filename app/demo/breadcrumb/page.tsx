import Link from "next/link"

import { Breadcrumb } from "@/components/ui/breadcrumb"

export default function BreadcrumbDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Breadcrumb demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Plain semantic markup — no Radix primitive needed. Location-based only (reflects
        Krane&apos;s fixed entity hierarchy, not session history or applied filters), with the
        current-page segment derived automatically from array position, never an explicit flag.
      </p>

      <div className="flex max-w-2xl flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Two-level trail</h2>
          <Breadcrumb
            items={[
              { label: "Submittals", href: "/demo/breadcrumb" },
              { label: "SUB-301 — Structural steel shop drawings" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Three-level trail</h2>
          <Breadcrumb
            items={[
              { label: "Vendors", href: "/demo/breadcrumb" },
              { label: "Sterling Rebar Co.", href: "/demo/breadcrumb" },
              { label: "Contracts" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Current page is never a link
          </h2>
          <Breadcrumb
            items={[
              { label: "Brigade Homes", href: "/demo/breadcrumb" },
              { label: "Submittals" },
            ]}
          />
          <p className="mt-2 text-caption text-muted-foreground">
            &quot;Submittals&quot; above is the last array entry — it renders as plain text with{" "}
            <code>aria-current=&quot;page&quot;</code> automatically, with no <code>href</code>{" "}
            and no flag set on it. Inspect it: there is no anchor tag there at all.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Composed above a real page title
          </h2>
          <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
            <Breadcrumb
              items={[
                { label: "Brigade Homes", href: "/demo/breadcrumb" },
                { label: "Submittals", href: "/demo/breadcrumb" },
                { label: "SUB-301" },
              ]}
            />
            <h3 className="text-heading text-foreground">SUB-301</h3>
            <p className="text-sm text-muted-foreground">
              Structural steel shop drawings — Sterling Rebar Co.
            </p>
          </div>
          <p className="mt-2 text-caption text-muted-foreground">
            Deliberately quieter than the title beneath it — <code>text-caption</code>, not a
            one-off size override. See <Link href="/demo/app-shell" className="underline">
              /demo/app-shell
            </Link>{" "}
            for this composed directly above a real page, alongside the global header&apos;s
            organization/project switcher chain — different altitudes of the same overall
            location, not a duplicated control.
          </p>
        </section>
      </div>
    </div>
  )
}
