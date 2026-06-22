import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  items: BreadcrumbItem[]
}

function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  const lastIndex = items.length - 1

  return (
    <nav data-slot="breadcrumb" aria-label="Breadcrumbs" className={className} {...props}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isCurrent = index === lastIndex

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {!isCurrent && item.href ? (
                <Link
                  href={item.href}
                  className="text-caption text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn("text-caption", isCurrent ? "text-foreground" : "text-muted-foreground")}
                >
                  {item.label}
                </span>
              )}
              {!isCurrent && (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
export type { BreadcrumbItem }
