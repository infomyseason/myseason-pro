import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useMockAuth } from "../../hooks/useMockAuth"
import { isAdminEmail } from "../../hooks/useRaceSubmissions"

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useMockAuth()

  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isAdminEmail(user?.email)) return <Navigate to="/" replace />
  return children
}

