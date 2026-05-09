import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"

export function RequireAuth({
  children,
  signInNotice,
}: {
  children: ReactNode
  /** Optional message shown on the login page (via route state). */
  signInNotice?: string
}) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground"
        aria-busy="true"
      >
        Loading…
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          ...(signInNotice?.trim() ? { authNotice: signInNotice.trim() } : {}),
        }}
      />
    )
  }

  return children
}
