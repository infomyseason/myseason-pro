import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { AuthPageShell } from "../../components/auth/AuthPageShell"
const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { isLoggedIn, loading, resetPasswordForEmail } = useAuth()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!loading && isLoggedIn) navigate("/profile", { replace: true })
  }, [isLoggedIn, loading, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await resetPasswordForEmail(email.trim())
    setSubmitting(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthPageShell
      title="Forgot password"
      subtitle="Enter your email and we’ll send a secure reset link (configure redirect URLs in Supabase Auth)."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_CLASS}
            disabled={sent}
          />
        </label>

        {sent ? (
          <p
            className="rounded-lg border border-emerald-500/25 bg-emerald-950/35 px-3 py-2 text-sm text-emerald-100/95"
            role="status"
          >
            Check your inbox for the reset link. After updating your password you can sign in again.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
            {error}
          </p>
        ) : null}

        {!sent ? (
          <button
            type="submit"
            disabled={submitting || loading || !email.trim()}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
          >
            Back to sign in
          </button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-primary transition hover:text-primary/85">
            Sign in
          </Link>
        </p>
      </form>
    </AuthPageShell>
  )
}
