"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RiskIndicator } from "@/components/ui/risk-indicator"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"

function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <p className="text-caption text-muted-foreground">
      Persisted preference: <code>{theme}</code> — currently applied:{" "}
      <code>{resolvedTheme}</code>. Reload the page; the choice survives. Set this to{" "}
      <code>system</code> and change your OS appearance while this tab stays open — Krane
      follows without a refresh (THEME_SWITCHER_FOUNDATION.md §5).
    </p>
  )
}

export default function ThemeDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Theme demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Light, Dark, and System — persisted to <code>localStorage</code>, applied before paint
        (no flash), and tracking live OS preference changes while set to System.
      </p>

      <div className="flex max-w-2xl flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Switch theme</h2>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ThemeStatus />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            A representative sample, both modes
          </h2>
          <p className="mb-3 text-caption text-muted-foreground">
            Every component below reads its colors from tokens, not literals — confirmed during
            this foundation&apos;s audit, not assumed. Toggle the theme above and watch all of it
            recolor together, with no per-component change needed.
          </p>
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="pending">Pending</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RiskIndicator level="low" />
              <RiskIndicator level="medium" />
              <RiskIndicator level="high" />
              <RiskIndicator level="critical" />
            </div>

            <div className="flex flex-col gap-1.5 sm:max-w-xs">
              <Label htmlFor="theme-demo-input">Vendor name</Label>
              <Input id="theme-demo-input" placeholder="Sterling Rebar Co." />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="theme-demo-switch" defaultChecked />
              <Label htmlFor="theme-demo-switch">Auto-approve if under budget</Label>
            </div>

            <Alert variant="warning">
              <AlertTitle>Open dispute on this vendor</AlertTitle>
              <AlertDescription>
                Sterling Rebar Co. has an open billing dispute — review before proceeding.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Inside the App Shell
          </h2>
          <p className="text-caption text-muted-foreground">
            See <code>/demo/app-shell</code> for the same toggle wired into{" "}
            <code>AppHeader</code>&apos;s <code>rightActions</code> slot — the layout where the
            content panel previously stayed hardcoded white regardless of theme (now{" "}
            <code>bg-background</code>, per this foundation&apos;s audit).
          </p>
        </section>
      </div>
    </div>
  )
}
