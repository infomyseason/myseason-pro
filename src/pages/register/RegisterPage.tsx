import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { AuthPageShell } from "../../components/auth/AuthPageShell"
import { validatePasswordRules } from "../../lib/authValidation"
import { supabase } from "../../lib/supabase"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

const FIELD_TAKEN = " border-amber-600/60 focus:border-amber-600/70"

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
  const [takenLogin, setTakenLogin] = useState(false)
  const [takenDisplay, setTakenDisplay] = useState(false)
  const [checkingIdentity, setCheckingIdentity] = useState(false)
  const identityReq = useRef(0)

  useEffect(() => {
    if (!loading && isLoggedIn) navigate("/profile", { replace: true })
  }, [isLoggedIn, loading, navigate])

  useEffect(() => {
    const login = loginName.trim()
    const display = displayName.trim()

    const wantLogin = login.length >= 1
    const wantDisplay = display.length >= 1

    const req = ++identityReq.current

    const delay = setTimeout(() => {
      if (!wantLogin && !wantDisplay) {
        setTakenLogin(false)
        setTakenDisplay(false)
        setCheckingIdentity(false)
        return
      }

      setCheckingIdentity(true)

      void (async () => {
        const { data: idCheck, error: rpcErr } = await supabase.rpc("signup_identity_available", {
          p_login: login,
          p_display: display,
          p_email: "",
        })

        if (identityReq.current !== req) return

        setCheckingIdentity(false)

        if (rpcErr) {
          setTakenLogin(false)
          setTakenDisplay(false)
          return
        }

        const check = idCheck as {
          login_available?: boolean
          display_available?: boolean
        } | null

        setTakenLogin(wantLogin && check?.login_available !== true)
        setTakenDisplay(wantDisplay && check?.display_available !== true)
      })()
    }, wantLogin || wantDisplay ? 420 : 0)

    return () => clearTimeout(delay)
  }, [loginName, displayName])

  const pwdHints = validatePasswordRules(password)
  const identityBlocked = takenLogin || takenDisplay

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

    if (identityBlocked) {
      setError("Choose a login name and display name that are not already used.")
      return
    }

    const pwdErrors = validatePasswordRules(passwordVal)
    if (pwdErrors.length > 0) {
      setError(pwdErrors.join(" "))
      return
    }

    setSubmitting(true)

    const { data: idCheck, error: rpcErr } = await supabase.rpc("signup_identity_available", {
      p_login: loginNameVal,
      p_display: displayNameVal,
      p_email: "",
    })

    if (rpcErr) {
      setSubmitting(false)
      setError(rpcErr.message || "Could not validate login name or display name.")
      return
    }

    const check = idCheck as {
      login_available?: boolean
      display_available?: boolean
    } | null

    if (check?.login_available !== true) {
      setSubmitting(false)
      setError("Login name already taken.")
      return
    }
    if (check?.display_available !== true) {
      setSubmitting(false)
      setError("Display name already taken.")
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
      const msg = res.error.message.toLowerCase()
      if (
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("user already exists")
      ) {
        setError("Email already registered.")
      } else if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
        setError("That login name, display name, or email is already in use.")
      } else {
        setError(res.error.message)
      }
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
            onChange={(e) => {
              setLoginName(e.target.value)
              setTakenLogin(false)
            }}
            className={FIELD_CLASS + (takenLogin ? FIELD_TAKEN : "")}
          />
          {takenLogin ? (
            <p className="mt-1.5 text-xs text-amber-200/95" role="status">
              Already used
            </p>
          ) : checkingIdentity && loginName.trim().length >= 1 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">Checking…</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
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
            onChange={(e) => {
              setDisplayName(e.target.value)
              setTakenDisplay(false)
            }}
            className={FIELD_CLASS + (takenDisplay ? FIELD_TAKEN : "")}
          />
          {takenDisplay ? (
            <p className="mt-1.5 text-xs text-amber-200/95" role="status">
              Already used
            </p>
          ) : checkingIdentity && displayName.trim().length >= 1 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">Checking…</p>
          ) : null}
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
            <li className={password.length >= 6 ? "text-emerald-400/90" : ""}>• At least 6 characters</li>
            <li className={/[a-z]/.test(password) ? "text-emerald-400/90" : ""}>• One lowercase letter</li>
            <li className={/[A-Z]/.test(password) ? "text-emerald-400/90" : ""}>• One uppercase letter</li>
            <li className={/\d/.test(password) ? "text-emerald-400/90" : ""}>• One number</li>
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
          disabled={submitting || loading || pendingConfirm || identityBlocked}
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
