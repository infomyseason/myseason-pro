import { useCallback, useEffect, useMemo, useState } from "react"

export type ThemeMode = "dark" | "light"

const THEME_KEY = "myseason_theme_mode"

function applyTheme(mode: ThemeMode) {
  if (mode === "light") document.documentElement.dataset.theme = "light"
  else delete document.documentElement.dataset.theme
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === "light" ? "light" : "dark"
  })

  useEffect(() => {
    applyTheme(mode)
    localStorage.setItem(THEME_KEY, mode)
  }, [mode])

  const toggle = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), [])
  const isDark = mode === "dark"

  return useMemo(() => ({ mode, isDark, setMode, toggle }), [mode, isDark, toggle])
}

