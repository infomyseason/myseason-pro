import { useEffect } from "react"
import { useLocation, useNavigationType } from "react-router-dom"

/**
 * Scroll to top on normal navigations (PUSH/REPLACE).
 * Preserve scroll on back/forward (POP) so lists like Explore keep their position.
 */
export function ScrollToTopOnRouteChange() {
  const { pathname, search, hash } = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    if (navType === "POP") return
    // Ignore hash-only jumps; still scroll to top for full route changes.
    void hash
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname, search, navType, hash])

  return null
}

