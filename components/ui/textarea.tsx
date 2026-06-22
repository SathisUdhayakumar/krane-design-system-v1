import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "w-full min-h-[80px] resize-y rounded-md border border-input bg-background px-3 py-2 text-body outline-none transition-colors placeholder:text-muted-foreground read-only:bg-muted read-only:resize-none read-only:cursor-default focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      status: {
        default: "",
        success: "border-success focus-visible:border-success focus-visible:ring-success/20",
        warning: "border-warning focus-visible:border-warning focus-visible:ring-warning/20",
        error: "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

type TextareaProps = React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>

function Textarea({
  className,
  status = "default",
  "aria-invalid": ariaInvalidProp,
  ...props
}: TextareaProps) {
  const ariaInvalid = ariaInvalidProp ?? (status === "error" ? true : undefined)

  return (
    <textarea
      data-slot="textarea"
      aria-invalid={ariaInvalid}
      className={cn(textareaVariants({ status }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
