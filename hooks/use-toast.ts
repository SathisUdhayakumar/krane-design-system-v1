"use client"

import * as React from "react"

export type ToastVariant = "default" | "success" | "warning" | "destructive" | "info"

export type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  duration?: number
  open: boolean
}

const TOAST_REMOVE_DELAY = 300

type Listener = (toasts: ToasterToast[]) => void

let toasts: ToasterToast[] = []
const listeners: Listener[] = []
let count = 0

function emit() {
  listeners.forEach((listener) => listener(toasts))
}

function scheduleRemoval(id: string) {
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, TOAST_REMOVE_DELAY)
}

function dismiss(id: string) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
  emit()
  scheduleRemoval(id)
}

function toast(props: Omit<ToasterToast, "id" | "open">) {
  const id = String(count++)
  toasts = [{ id, open: true, ...props }, ...toasts]
  emit()
  return id
}

function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(toasts)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts: state, toast, dismiss }
}

export { useToast, toast, dismiss }
