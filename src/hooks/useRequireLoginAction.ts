import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"

/** Sends guests to `/login` with safe `state.from` + optional banner message after sign-in. */
export function useRequireLoginAction() {
  const { isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectToLogin = useCallback(
    (authNotice?: string) => {
      navigate("/login", {
        state: {
          from: `${location.pathname}${location.search}`,
          ...(authNotice?.trim() ? { authNotice: authNotice.trim() } : {}),
        },
      })
    },
    [navigate, location.pathname, location.search],
  )

  const guardOrRun = useCallback(
    (run: () => void, authNotice?: string) => {
      if (loading) return
      if (!isLoggedIn) {
        redirectToLogin(authNotice)
        return
      }
      run()
    },
    [loading, isLoggedIn, redirectToLogin],
  )

  return { isLoggedIn, loading, redirectToLogin, guardOrRun }
}
