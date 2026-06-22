"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type RadioGroupStatus = "default" | "success" | "warning" | "error"

const RadioGroupStatusContext = React.createContext<RadioGroupStatus>("default")

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  status?: RadioGroupStatus
}

function RadioGroup({
  className,
  status = "default",
  "aria-invalid": ariaInvalidProp,
  ...props
}: RadioGroupProps) {
  const ariaInvalid = ariaInvalidProp ?? (status === "error" ? true : undefined)

  return (
    <RadioGroupStatusContext.Provider value={status}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        aria-invalid={ariaInvalid}
        className={cn(
          "flex flex-col gap-2 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4",
          className
        )}
        {...props}
      />
    </RadioGroupStatusContext.Provider>
  )
}

const radioGroupItemVariants = cva(
  "aspect-square size-4 shrink-0 rounded-full border bg-background outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      status: {
        default:
          "border-input data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring",
        success:
          "border-success data-[state=checked]:border-success focus-visible:border-success focus-visible:ring-success/20",
        warning:
          "border-warning data-[state=checked]:border-warning focus-visible:border-warning focus-visible:ring-warning/20",
        error:
          "border-destructive data-[state=checked]:border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

const radioGroupIndicatorDotVariants = cva("size-2 rounded-full", {
  variants: {
    status: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-destructive",
    },
  },
  defaultVariants: {
    status: "default",
  },
})

type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioGroupItemVariants>

function RadioGroupItem({ className, status: statusProp, ...props }: RadioGroupItemProps) {
  const contextStatus = React.useContext(RadioGroupStatusContext)
  const status = statusProp ?? contextStatus

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ status }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className={cn(radioGroupIndicatorDotVariants({ status }))} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
