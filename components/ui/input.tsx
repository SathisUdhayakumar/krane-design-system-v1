import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full rounded-md border border-input bg-background outline-none transition-colors placeholder:text-muted-foreground read-only:bg-muted read-only:cursor-default focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-xs",
        default: "h-9 px-3 text-sm",
        lg: "h-10 px-3.5 text-sm",
      },
      status: {
        default: "",
        success: "border-success focus-visible:border-success focus-visible:ring-success/20",
        warning: "border-warning focus-visible:border-warning focus-visible:ring-warning/20",
        error: "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      },
    },
    defaultVariants: {
      size: "default",
      status: "default",
    },
  }
)

type InputProps = Omit<React.ComponentProps<"input">, "size" | "prefix" | "suffix"> &
  VariantProps<typeof inputVariants> & {
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    clearButton?: boolean
    onClear?: () => void
    loading?: boolean
  }

function Input({
  className,
  size,
  status = "default",
  prefix,
  suffix,
  clearButton = false,
  onClear,
  loading = false,
  "aria-invalid": ariaInvalidProp,
  ...props
}: InputProps) {
  const ariaInvalid = ariaInvalidProp ?? (status === "error" ? true : undefined)

  const trailing = loading ? (
    <Loader2
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
    />
  ) : clearButton ? (
    <button
      type="button"
      onClick={onClear}
      aria-label="Clear input"
      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <X className="size-4" />
    </button>
  ) : suffix ? (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center text-sm text-muted-foreground"
    >
      {suffix}
    </span>
  ) : null

  const hasLeading = Boolean(prefix)
  const hasTrailing = Boolean(trailing)

  if (!hasLeading && !hasTrailing) {
    return (
      <input
        data-slot="input"
        aria-invalid={ariaInvalid}
        aria-busy={loading || undefined}
        className={cn(inputVariants({ size, status }), className)}
        {...props}
      />
    )
  }

  return (
    <div className="relative">
      {prefix && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center text-sm text-muted-foreground"
        >
          {prefix}
        </span>
      )}
      <input
        data-slot="input"
        aria-invalid={ariaInvalid}
        aria-busy={loading || undefined}
        className={cn(
          inputVariants({ size, status }),
          hasLeading && "pl-9",
          hasTrailing && "pr-9",
          className
        )}
        {...props}
      />
      {trailing}
    </div>
  )
}

export { Input, inputVariants }
