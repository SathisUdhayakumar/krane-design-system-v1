"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      status: {
        default:
          "bg-input data-[state=checked]:bg-primary focus-visible:ring-3 focus-visible:ring-ring",
        success:
          "bg-input data-[state=checked]:bg-primary focus-visible:ring-3 focus-visible:ring-success/20",
        warning:
          "bg-input data-[state=checked]:bg-primary focus-visible:ring-3 focus-visible:ring-warning/20",
        error: "bg-input data-[state=checked]:bg-primary ring-3 ring-destructive/20 dark:ring-destructive/40",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>

function Switch({
  className,
  status = "default",
  "aria-invalid": ariaInvalidProp,
  ...props
}: SwitchProps) {
  const ariaInvalid = ariaInvalidProp ?? (status === "error" ? true : undefined)

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      aria-invalid={ariaInvalid}
      className={cn(switchVariants({ status }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0 rounded-full bg-background transition-transform data-[state=checked]:translate-x-4"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
