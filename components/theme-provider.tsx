"use client"

import * as React from "react"

type ThemePreference = "light" | "dark" | "system"

const STORAGE_KEY = "krane-theme"

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

// Same-tab pub-sub — the native `storage` event only fires in *other* tabs, never
// the one that made the change, so calling setTheme() here needs its own notify.
const themeListeners = new Set<() => void>()

function getThemeSnapshot(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isThemePreference(stored) ? stored : "system"
}

function getThemeServerSnapshot(): ThemePreference {
  return "system"
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    themeListeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

function setStoredTheme(theme: ThemePreference) {
  window.localStorage.setItem(STORAGE_KEY, theme)
  themeListeners.forEach((listener) => listener())
}

function getSystemSnapshot(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getSystemServerSnapshot(): "light" | "dark" {
  return "light"
}

function subscribeSystem(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement
  root.classList.add("no-theme-transition")
  root.classList.toggle("dark", resolved === "dark")
  // Force a reflow so the transition-suppressing class above takes effect before
  // it's removed — otherwise the browser can coalesce both class changes into one
  // paint and the suppression never visibly applies.
  void root.offsetHeight
  root.classList.remove("no-theme-transition")
}

type ThemeContextValue = {
  theme: ThemePreference
  resolvedTheme: "light" | "dark"
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider>")
  }
  return context
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore, not useState+useEffect — this is the React-correct tool
  // for "read a value from an external source the server can't see" (localStorage,
  // matchMedia): it renders the server snapshot during SSR and the first client
  // render (avoiding a hydration mismatch), then synchronously re-renders with the
  // real client value right after — no setState-in-effect, no cascading renders.
  const theme = React.useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot)
  const systemTheme = React.useSyncExternalStore(
    subscribeSystem,
    getSystemSnapshot,
    getSystemServerSnapshot
  )
  const resolvedTheme = theme === "system" ? systemTheme : theme

  React.useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: ThemePreference) => {
    setStoredTheme(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const THEME_NO_FLASH_SCRIPT = `(function(){try{var k="${STORAGE_KEY}",s=localStorage.getItem(k),m=window.matchMedia("(prefers-color-scheme: dark)").matches,d=m;if(s==="light")d=false;if(s==="dark")d=true;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`

export { ThemeProvider, useTheme, THEME_NO_FLASH_SCRIPT }
export type { ThemePreference }
