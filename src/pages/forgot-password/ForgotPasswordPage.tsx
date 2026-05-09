import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthPageShell } from "../../components/auth/AuthPageShell"
import {
  clearPasswordReset,
  LOGIN_NOTICE_SESSION_KEY,
  readPasswordResetRaw,
  startPasswordResetForEmail,
  updateMockUserPasswordByEmail,
  verifyPasswordResetCode,
} from "../../hooks/mockPasswordReset"
import { useMockAuth, validatePasswordRules } from "../../hooks/useMockAuth"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

const CODE_FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-foreground outline-none ring-primary/15 focus:border-primary/40 focus:ring-2"

function blockClipboard(e: React.ClipboardEvent<HTMLInputElement>): void {
  e.preventDefault()
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useMockAuth()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  /** After code verified — local only until completion */
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [choicePhase, setChoicePhase] = useState<"pick" | "newPassword">("pick")

  const [email, setEmail] = useState("")
  const [demoCode, setDemoCode] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState("")

  const [newPassword, setNewPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate("/profile", { replace: true })
  }, [isLoggedIn, navigate])

  const pwdHintsNew = validatePasswordRules(newPassword)

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = startPasswordResetForEmail(email)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setDemoCode(res.code)
    setStep(2)
    setCodeInput("")
  }

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = verifyPasswordResetCode(codeInput)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setVerifiedEmail(res.email)
    setChoicePhase("pick")
    setNewPassword("")
    setRepeatPassword("")
    setStep(3)
  }

  const handleKeepPassword = () => {
    clearPasswordReset()
    try {
      sessionStorage.setItem(LOGIN_NOTICE_SESSION_KEY, "You can sign in with your existing password.")
    } catch {
      /* ignore quota / private mode */
    }
    navigate("/login", { replace: true })
  }

  const handleNewPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!verifiedEmail) return

    setError(null)
    if (newPassword !== repeatPassword) {
      setError("Passwords must match.")
      return
    }

    setSubmitting(true)
    const res = updateMockUserPasswordByEmail(verifiedEmail, newPassword)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error)
      return
    }

    try {
      sessionStorage.setItem(LOGIN_NOTICE_SESSION_KEY, "Password updated successfully")
    } catch {
      /* ignore */
    }
    navigate("/login", { replace: true })
  }

  useEffect(() => {
    const raw = readPasswordResetRaw()
    if (!raw || Date.now() > raw.expiresAt) {
      if (raw && Date.now() > raw.expiresAt) clearPasswordReset()
      return
    }
    setEmail(raw.email)
    setDemoCode(raw.code)
    setStep(2)
  }, [])

  return (
    <AuthPageShell
      title="Forgot password"
      subtitle="Mock reset — codes stay in your browser only. No email is sent yet."
    >
      <div className="space-y-6">
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1 · Email</p>
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

            {error ? (
              <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Checking…" : "Continue"}
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2 · Verification code</p>
            {demoCode ? (
              <p className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary-foreground/95">
                Demo reset code: <span className="font-mono font-bold tracking-wide">{demoCode}</span>
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">In a real app this code would be sent by email.</p>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                6-digit code
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                name="code"
                autoComplete="one-time-code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={CODE_FIELD_CLASS}
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || codeInput.length !== 6}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1)
                setDemoCode(null)
                setCodeInput("")
                setError(null)
              }}
              className="w-full rounded-xl border border-border/55 bg-transparent py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
            >
              Use a different email
            </button>
          </form>
        ) : null}

        {step === 3 && choicePhase === "pick" ? (
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 3 · Finish</p>
            <p className="text-sm text-muted-foreground">Your code is valid. Choose how to continue.</p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleKeepPassword}
                className="w-full rounded-xl border border-border/55 bg-background/60 py-3 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-background/80"
              >
                Keep current password
              </button>
              <button
                type="button"
                onClick={() => {
                  setChoicePhase("newPassword")
                  setError(null)
                  setNewPassword("")
                  setRepeatPassword("")
                }}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
              >
                Create new password
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 && choicePhase === "newPassword" ? (
          <form onSubmit={handleNewPasswordSubmit} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New password</p>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                New password
              </span>
              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              <li className={/[A-Z]/.test(newPassword) ? "text-emerald-400/90" : ""}>• One uppercase letter</li>
              <li className={(newPassword.match(/\d/g) ?? []).length >= 2 ? "text-emerald-400/90" : ""}>• Two numbers</li>
              <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-400/90" : ""}>• One special symbol</li>
            </ul>
            {newPassword.length > 0 && pwdHintsNew.length > 0 ? (
              <p className="text-xs text-amber-200/80">{pwdHintsNew.join(" ")}</p>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Updating…" : "Update password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setChoicePhase("pick")
                setError(null)
              }}
              className="w-full rounded-xl border border-border/55 bg-transparent py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
            >
              Back
            </button>
          </form>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-primary transition hover:text-primary/85">
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}
