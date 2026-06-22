import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-lg border p-4",
  {
    variants: {
      variant: {
        info: "border-info/30 bg-info/10 text-info-text",
        success: "border-success/30 bg-success/10 text-success-text",
        warning: "border-warning/30 bg-warning/10 text-warning-text",
        error: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
  }
)

const ALERT_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
} as const

const VARIANT_LABEL = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  error: "Error",
} as const

type AlertVariant = keyof typeof ALERT_ICON

type AlertAction = {
  label: string
  onClick: () => void
}

type AlertProps = Omit<React.ComponentProps<"div">, "role"> &
  VariantProps<typeof alertVariants> & {
    variant: AlertVariant
    /** Explicit, not variant-derived — see ALERT_FOUNDATION.md §8. Omit for a
     *  persistent, already-present banner (the default: a named `region` landmark).
     *  Set to `"alert"` only for a dynamically-appearing, urgent message, or
     *  `"status"` for a dynamically-appearing, advisory one. */
    role?: "alert" | "status"
    /** Presence-driven, not a separate boolean — see ALERT_FOUNDATION.md §7. */
    onDismiss?: () => void
    primaryAction?: AlertAction
    secondaryAction?: AlertAction
  }

function Alert({
  className,
  variant,
  role,
  onDismiss,
  primaryAction,
  secondaryAction,
  children,
  ...props
}: AlertProps) {
  const Icon = ALERT_ICON[variant]
  const label = VARIANT_LABEL[variant]
  const hasActions = Boolean(primaryAction || secondaryAction)

  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role={role ?? "region"}
      aria-label={role ? undefined : label}
      className={cn(alertVariants({ variant }), onDismiss && "pr-8", className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1">
        {children}
        {hasActions && (
          <div className="mt-2 flex justify-end gap-2">
            {secondaryAction && (
              <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button size="sm" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 rounded-md opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring"
        >
          <X className="size-4" />
          <span className="sr-only">Dismiss this {label.toLowerCase()}</span>
        </button>
      )}
    </div>
  )
}

function AlertTitle({
  className,
  visuallyHidden,
  ...props
}: React.ComponentProps<"h2"> & { visuallyHidden?: boolean }) {
  return (
    <h2
      data-slot="alert-title"
      className={cn("text-label", visuallyHidden && "sr-only", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="alert-description" className={cn("text-body", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
export type { AlertVariant, AlertAction }
