import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { AuthPageShell } from "../../components/auth/AuthPageShell"
import { validatePasswordRules } from "../../lib/authValidation"
import { supabase } from "../../lib/supabase"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

export function RegisterPage() {
  const navigate = useNavigate()
  const { isLoggedIn, loading, signUp } = useAuth()

  const [loginName, setLoginName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(false)

  useEffect(() => {
    if (!loading && isLoggedIn) navigate("/profile", { replace: true })
  }, [isLoggedIn, loading, navigate])

  const pwdHints = validatePasswordRules(password)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const loginNameEl = form.elements.namedItem("loginName")
    const emailEl = form.elements.namedItem("email")
    const displayNameEl = form.elements.namedItem("displayName")
    const passwordEl = form.elements.namedItem("password")
    const loginNameVal = loginNameEl instanceof HTMLInputElement ? loginNameEl.value.trim() : ""
    const emailVal = emailEl instanceof HTMLInputElement ? emailEl.value.trim() : ""
    const displayNameVal = displayNameEl instanceof HTMLInputElement ? displayNameEl.value.trim() : ""
    const passwordVal = passwordEl instanceof HTMLInputElement ? passwordEl.value : ""

    setError(null)
    setPendingConfirm(false)

    if (!loginNameVal || !emailVal || !displayNameVal) {
      setError("Fill in every field.")
      return
    }

    const pwdErrors = validatePasswordRules(passwordVal)
    if (pwdErrors.length > 0) {
      setError(pwdErrors.join(" "))
      return
    }

    setSubmitting(true)

    const { data: available, error: rpcErr } = await supabase.rpc("login_name_available", {
      p_login: loginNameVal,
    })

    if (rpcErr) {
      setSubmitting(false)
      setError(rpcErr.message || "Could not validate login name.")
      return
    }

    if (available !== true) {
      setSubmitting(false)
      setError("Login name already taken.")
      return
    }

    const res = await signUp({
      loginName: loginNameVal,
      email: emailVal,
      password: passwordVal,
      displayName: displayNameVal,
    })

    setSubmitting(false)

    if (res.error) {
      setError(res.error.message)
      return
    }

    if (res.needsEmailConfirmation) {
      setPendingConfirm(true)
      return
    }

    navigate("/profile", { replace: true })
  }

  return (
    <AuthPageShell
      title="Create account"
      subtitle="We’ll send a confirmation link when your project requires verified email (Supabase Auth settings)."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Login name
          </span>
          <input
            type="text"
            name="loginName"
            autoComplete="username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Display name
          </span>
          <input
            type="text"
            name="displayName"
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={FIELD_CLASS}
          />
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li className={/[A-Z]/.test(password) ? "text-emerald-400/90" : ""}>• One uppercase letter</li>
            <li className={(password.match(/\d/g) ?? []).length >= 2 ? "text-emerald-400/90" : ""}>• Two numbers</li>
            <li className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400/90" : ""}>• One special symbol</li>
          </ul>
          {password.length > 0 && pwdHints.length > 0 ? (
            <p className="mt-2 text-xs text-amber-200/80">{pwdHints.join(" ")}</p>
          ) : null}
        </label>

        {pendingConfirm ? (
          <p
            className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary-foreground/95"
            role="status"
          >
            Check your inbox and confirm your email, then sign in. You can close this tab after you’ve clicked the link.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loading || pendingConfirm}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Register"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary transition hover:text-primary/85">
            Sign in
          </Link>
        </p>
      </form>
    </AuthPageShell>
  )
}
