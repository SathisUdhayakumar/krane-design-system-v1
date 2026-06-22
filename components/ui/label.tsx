"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean
  disabled?: boolean
  visuallyHidden?: boolean
}

function Label({
  className,
  required,
  disabled,
  visuallyHidden,
  children,
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-label text-foreground",
        disabled && "cursor-not-allowed opacity-70",
        visuallyHidden && "sr-only",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-destructive">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
}

export { Label }
