"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

function ToastProvider(props: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-0 z-toast flex max-h-screen w-full flex-col gap-2 p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col-reverse md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

const toastVariants = cva(
  "group relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 pr-8 text-sm text-card-foreground shadow-md",
  {
    variants: {
      variant: {
        default: "",
        success: "border-success/30 bg-success/10 text-success-text",
        warning: "border-warning/30 bg-warning/10 text-warning-text",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        info: "border-info/30 bg-info/10 text-info-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TOAST_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
  info: Info,
} as const

function Toast({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>) {
  const Icon = variant && variant !== "default" ? TOAST_ICON[variant] : null

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      className={cn(
        toastVariants({ variant }),
        "duration-fast data-open:animate-in data-closed:animate-out data-open:ease-out data-closed:ease-in data-closed:fade-out-80",
        "data-open:slide-in-from-top-full sm:data-open:slide-in-from-bottom-full data-closed:slide-out-to-right-full",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-fast data-[swipe=cancel]:ease-out",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <div className="flex flex-1 flex-col gap-1">{children}</div>
    </ToastPrimitive.Root>
  )
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "absolute top-3 right-3 rounded-md opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </ToastPrimitive.Close>
  )
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  toastVariants,
}
