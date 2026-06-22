"use client"

import * as React from "react"
import { CircleDot, Eye, FileClock, FileText, Shield, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SUBMITTALS = [
  { id: "SUB-301", item: "Structural steel shop drawings", vendor: "Sterling Rebar Co.", stage: "draft" },
  { id: "SUB-302", item: "Glazing system samples", vendor: "Vantage Glazing", stage: "in-review" },
  { id: "SUB-303", item: "Concrete mix design", vendor: "Coastal Concrete", stage: "done" },
  { id: "SUB-304", item: "MEP coordination drawings", vendor: "Apex Electrical", stage: "in-review" },
  { id: "SUB-305", item: "Elevator shop drawings", vendor: "Meridian Lifts", stage: "draft" },
  { id: "SUB-306", item: "Roofing material certs", vendor: "Summit Roofing", stage: "done" },
] as const

function SubmittalList({ stage }: { stage: (typeof SUBMITTALS)[number]["stage"] }) {
  const rows = SUBMITTALS.filter((s) => s.stage === stage)
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
        >
          <span>
            <span className="font-medium">{row.id}</span> — {row.item}
          </span>
          <span className="text-muted-foreground">{row.vendor}</span>
        </li>
      ))}
    </ul>
  )
}

export default function TabsDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Tabs demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Built directly on <code>@radix-ui/react-tabs</code> — an underline active indicator
        styled via the explicit <code>data-[state=active]:</code> selector (verified against the
        real compiled stylesheet, not the unconfirmed <code>data-active:</code> shorthand), no
        overflow handling, no animated indicator — both deliberately deferred per{" "}
        <code>TABS_FOUNDATION.md</code>.
      </p>

      <div className="flex max-w-2xl flex-col gap-12">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Standard tabs — a PO detail page
          </h2>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">
                PO-10231 — Sterling Rebar Co. — $84,200. Submitted 2026-06-02, approved
                2026-06-05.
              </p>
            </TabsContent>
            <TabsContent value="documents">
              <p className="text-sm text-muted-foreground">
                3 attachments: purchase-order.pdf, shop-drawings.pdf, coi.pdf.
              </p>
            </TabsContent>
            <TabsContent value="history">
              <p className="text-sm text-muted-foreground">
                Created by Jordan Lee → reviewed by Alex Kim → approved by Sam Patel.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Disabled tab</h2>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="audit-log" disabled>
                Audit log
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">PO-10231 overview.</p>
            </TabsContent>
            <TabsContent value="documents">
              <p className="text-sm text-muted-foreground">PO-10231 documents.</p>
            </TabsContent>
          </Tabs>
          <p className="mt-2 text-caption text-muted-foreground">
            &quot;Audit log&quot; is unreachable by click or arrow-key navigation — not just
            visually dimmed.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Icon + label tabs
          </h2>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">
                <FileText />
                Overview
              </TabsTrigger>
              <TabsTrigger value="watchers">
                <Eye />
                Watchers
              </TabsTrigger>
              <TabsTrigger value="activity">
                <FileClock />
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">Overview content.</p>
            </TabsContent>
            <TabsContent value="watchers">
              <p className="text-sm text-muted-foreground">4 people watching this PO.</p>
            </TabsContent>
            <TabsContent value="activity">
              <p className="text-sm text-muted-foreground">Activity feed.</p>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Settings-style tabs
          </h2>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">
                <User />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <CircleDot />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield />
                Security
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <p className="text-sm text-muted-foreground">Name, email, avatar.</p>
            </TabsContent>
            <TabsContent value="notifications">
              <p className="text-sm text-muted-foreground">Email and in-app preferences.</p>
            </TabsContent>
            <TabsContent value="security">
              <p className="text-sm text-muted-foreground">Password and active sessions.</p>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Project workflow tabs — submittals by stage
          </h2>
          <p className="mb-3 text-caption text-muted-foreground">
            Each tab shows a genuinely different subset of submittals, not the same list
            reformatted — tabs, not a segmented control (<code>TABS_FOUNDATION.md</code>&apos;s
            drawn boundary).
          </p>
          <Tabs defaultValue="draft">
            <TabsList>
              <TabsTrigger value="draft">
                Draft <Badge variant="default">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-review">
                In Review <Badge variant="warning">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="done">
                Done <Badge variant="success">2</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="draft">
              <SubmittalList stage="draft" />
            </TabsContent>
            <TabsContent value="in-review">
              <SubmittalList stage="in-review" />
            </TabsContent>
            <TabsContent value="done">
              <SubmittalList stage="done" />
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Activation mode — automatic vs. manual
          </h2>
          <p className="mb-3 text-caption text-muted-foreground">
            Focus a tab with Tab, then arrow to the next one. Automatic switches content
            immediately on arrow-key focus; manual requires <kbd>Enter</kbd>/<kbd>Space</kbd>{" "}
            after focusing — correct when a tab&apos;s content would trigger its own expensive
            fetch (<code>TABS_FOUNDATION.md</code>&apos;s activation-mode framework).
          </p>
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                automatic (default)
              </p>
              <Tabs defaultValue="a">
                <TabsList>
                  <TabsTrigger value="a">A</TabsTrigger>
                  <TabsTrigger value="b">B</TabsTrigger>
                  <TabsTrigger value="c">C</TabsTrigger>
                </TabsList>
                <TabsContent value="a">
                  <p className="text-sm text-muted-foreground">Content A</p>
                </TabsContent>
                <TabsContent value="b">
                  <p className="text-sm text-muted-foreground">Content B</p>
                </TabsContent>
                <TabsContent value="c">
                  <p className="text-sm text-muted-foreground">Content C</p>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">manual</p>
              <Tabs defaultValue="a" activationMode="manual">
                <TabsList>
                  <TabsTrigger value="a">A</TabsTrigger>
                  <TabsTrigger value="b">B</TabsTrigger>
                  <TabsTrigger value="c">C</TabsTrigger>
                </TabsList>
                <TabsContent value="a">
                  <p className="text-sm text-muted-foreground">Content A</p>
                </TabsContent>
                <TabsContent value="b">
                  <p className="text-sm text-muted-foreground">Content B</p>
                </TabsContent>
                <TabsContent value="c">
                  <p className="text-sm text-muted-foreground">Content C</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
