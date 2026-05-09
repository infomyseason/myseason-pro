import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { AuthPageShell } from "../../components/auth/AuthPageShell"
import { LOGIN_NOTICE_SESSION_KEY } from "../../lib/authNotice"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, loading, signInWithPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isLoggedIn) navigate("/profile", { replace: true })
  }, [isLoggedIn, loading, navigate])

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(LOGIN_NOTICE_SESSION_KEY)
      if (stored && stored.trim().length > 0) {
        sessionStorage.removeItem(LOGIN_NOTICE_SESSION_KEY)
        setNotice(stored.trim())
        return
      }
    } catch {
      /* ignore */
    }
    const routeMsg = (location.state as { authNotice?: unknown } | null)?.authNotice
    if (typeof routeMsg === "string" && routeMsg.trim().length > 0) {
      setNotice(routeMsg.trim())
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const emailEl = form.elements.namedItem("email")
    const passEl = form.elements.namedItem("password")
    const emailVal = emailEl instanceof HTMLInputElement ? emailEl.value.trim() : ""
    const passValue = passEl instanceof HTMLInputElement ? passEl.value : ""

    setError(null)
    setSubmitting(true)
    const res = await signInWithPassword(emailVal, passValue)
    setSubmitting(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    const from = (location.state as { from?: string } | null)?.from
    const unsafe =
      typeof from !== "string" ||
      !from.startsWith("/") ||
      from.startsWith("//") ||
      from === "/login" ||
      from === "/register"
    const safe = unsafe ? "/profile" : from
    navigate(safe, { replace: true })
  }

  return (
    <AuthPageShell title="Sign in" subtitle="Use your email and password. Sessions stay signed in on this device.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={FIELD_CLASS}
          />
          <p className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary transition hover:text-primary/85"
            >
              Forgot password?
            </Link>
          </p>
        </label>

        {notice ? (
          <p
            className="rounded-lg border border-emerald-500/25 bg-emerald-950/35 px-3 py-2 text-sm text-emerald-100/95"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="font-semibold text-primary transition hover:text-primary/85">
            Create one
          </Link>
        </p>
      </form>
    </AuthPageShell>
  )
}
