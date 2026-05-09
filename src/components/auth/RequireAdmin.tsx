import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { isAdminEmail } from "../../lib/adminEmails"

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoggedIn, loading } = useAuth()

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

  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isAdminEmail(user?.email)) return <Navigate to="/" replace />
  return children
}

