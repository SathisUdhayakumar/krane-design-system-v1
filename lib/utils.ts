import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Krane's typography roles (`text-display/heading/title/body/caption/label`) aren't
// in tailwind-merge's built-in font-size scale, so by default it files them under
// `text-color` instead — silently dropping them when combined with a real text
// color utility (e.g. `text-label text-foreground` collapses to just `text-foreground`).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-heading",
        "text-title",
        "text-body",
        "text-caption",
        "text-label",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
