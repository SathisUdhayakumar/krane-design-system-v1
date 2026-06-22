import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const
type RiskLevel = (typeof RISK_LEVELS)[number]

const SEVERITY: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

const DOT_COLOR: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
}

const riskIndicatorVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] bg-background px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      level: {
        low: "border-risk-low/55 text-risk-low-text",
        medium: "border-risk-medium/55 text-risk-medium-text",
        high: "border-risk-high/55 text-risk-high-text",
        critical: "border-risk-critical/55 text-risk-critical-text",
      },
    },
    defaultVariants: {
      level: "low",
    },
  }
)

function RiskIndicator({
  className,
  level = "low",
  label,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof riskIndicatorVariants> & {
    level?: RiskLevel
    label?: string
  }) {
  const filled = SEVERITY[level]

  return (
    <span
      data-slot="risk-indicator"
      data-level={level}
      className={cn(riskIndicatorVariants({ level }), className)}
      {...props}
    >
      {label ?? level.charAt(0).toUpperCase() + level.slice(1)}
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {RISK_LEVELS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full bg-muted-foreground/25",
              i < filled && DOT_COLOR[level]
            )}
          />
        ))}
      </span>
    </span>
  )
}

export { RiskIndicator, riskIndicatorVariants, RISK_LEVELS }
export type { RiskLevel }
