import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useMockAuth } from "../../hooks/useMockAuth"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useMockAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
