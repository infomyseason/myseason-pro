import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthPageShell } from "../../components/auth/AuthPageShell"
import { LOGIN_NOTICE_SESSION_KEY } from "../../lib/authNotice"
import { validatePasswordRules } from "../../lib/authValidation"
import { supabase } from "../../lib/supabase"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

function blockClipboard(e: React.ClipboardEvent<HTMLInputElement>): void {
  e.preventDefault()
}

export function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [allowReset, setAllowReset] = useState(() =>
    typeof window !== "undefined" ? window.location.hash.includes("type=recovery") : false,
  )
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setAllowReset(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const pwdHints = validatePasswordRules(password)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!allowReset) {
      setError("Open this page from the link in your reset email.")
      return
    }
    if (password !== repeatPassword) {
      setError("Passwords must match.")
      return
    }
    const errs = validatePasswordRules(password)
    if (errs.length > 0) {
      setError(errs.join(" "))
      return
    }

    setSubmitting(true)
    const { error: upErr } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (upErr) {
      setError(upErr.message)
      return
    }

    await supabase.auth.signOut()
    try {
      sessionStorage.setItem(LOGIN_NOTICE_SESSION_KEY, "Password updated successfully. Sign in with your new password.")
    } catch {
      /* ignore */
    }
    navigate("/login", { replace: true })
  }

  return (
    <AuthPageShell title="Set new password" subtitle="Choose a strong password for your account.">
      {!allowReset ? (
        <p className="rounded-lg border border-border/55 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
          Waiting for a secure recovery session… If this message stays, open this page from the email link Supabase sent
          you, or request a new reset from{" "}
          <Link to="/forgot-password" className="font-semibold text-primary">
            Forgot password
          </Link>
          .
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            New password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPaste={blockClipboard}
            onCopy={blockClipboard}
            onCut={blockClipboard}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Repeat new password
          </span>
          <input
            type="password"
            name="repeatPassword"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            onPaste={blockClipboard}
            onCopy={blockClipboard}
            onCut={blockClipboard}
            className={FIELD_CLASS}
          />
        </label>

        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className={/[A-Z]/.test(password) ? "text-emerald-400/90" : ""}>• One uppercase letter</li>
          <li className={(password.match(/\d/g) ?? []).length >= 2 ? "text-emerald-400/90" : ""}>• Two numbers</li>
          <li className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400/90" : ""}>• One special symbol</li>
        </ul>
        {password.length > 0 && pwdHints.length > 0 ? (
          <p className="text-xs text-amber-200/80">{pwdHints.join(" ")}</p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !allowReset}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary transition hover:text-primary/85">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthPageShell>
  )
}
