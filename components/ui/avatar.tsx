"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        sm: "size-6 text-xs",
        default: "size-8 text-sm",
        lg: "size-10 text-base",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
    },
  }
)

const STATUS_DOT_SIZE = {
  sm: "size-2",
  default: "size-2.5",
  lg: "size-3",
} as const

const STATUS_DOT_COLOR = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  info: "bg-info",
} as const

const STATUS_LABEL = {
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Info",
} as const

type AvatarStatus = keyof typeof STATUS_DOT_COLOR

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & {
    status?: AvatarStatus
    statusLabel?: string
  }

function Avatar({ className, size, shape, status, statusLabel, children, ...props }: AvatarProps) {
  const dotSize = STATUS_DOT_SIZE[size ?? "default"]

  return (
    <span className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
            dotSize,
            STATUS_DOT_COLOR[status]
          )}
        >
          <span className="sr-only">{statusLabel ?? STATUS_LABEL[status]}</span>
        </span>
      )}
    </span>
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  // No default delayMs — Radix's own default (undefined) renders the fallback
  // immediately, which is correct when there's no AvatarImage sibling at all
  // (plain initials/icon avatars). Pass delayMs explicitly only when pairing
  // this with an AvatarImage, to avoid a flash of fallback before a fast load.
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center font-medium uppercase [&_svg]:size-[55%]",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarStatus }
