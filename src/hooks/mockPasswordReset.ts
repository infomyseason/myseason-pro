import {
  loadMockUsers,
  normalizeAuthEmail,
  notifyMockAuthListeners,
  saveMockUsers,
  validatePasswordRules,
} from "./useMockAuth"

/** Single active mock reset request (demo — would be email in production). */
export const PASSWORD_RESET_STORAGE_KEY = "myseason_password_reset"

/** One-shot message shown on `/login` after forgot-password completion (Strict Mode–safe). */
export const LOGIN_NOTICE_SESSION_KEY = "myseason_login_notice"

export type StoredPasswordReset = {
  email: string
  code: string
  expiresAt: number
}

function parseStored(raw: string): StoredPasswordReset | null {
  try {
    const p = JSON.parse(raw) as Partial<StoredPasswordReset>
    if (typeof p.email !== "string" || typeof p.code !== "string" || typeof p.expiresAt !== "number") return null
    return { email: p.email, code: p.code, expiresAt: p.expiresAt }
  } catch {
    return null
  }
}

/** Reads reset blob without deleting expired entries (use for strict expiry messaging). */
export function readPasswordResetRaw(): StoredPasswordReset | null {
  try {
    const raw = localStorage.getItem(PASSWORD_RESET_STORAGE_KEY)
    if (!raw) return null
    return parseStored(raw)
  } catch {
    return null
  }
}

/** Returns active reset request, or null if missing or expired (expired entries are cleared). */
export function readPasswordReset(): StoredPasswordReset | null {
  const r = readPasswordResetRaw()
  if (!r) return null
  if (Date.now() > r.expiresAt) {
    clearPasswordReset()
    return null
  }
  return r
}

export function clearPasswordReset(): void {
  localStorage.removeItem(PASSWORD_RESET_STORAGE_KEY)
}

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function startPasswordResetForEmail(
  emailInput: string,
): { ok: true; code: string; normalizedEmail: string } | { ok: false; error: string } {
  const email = normalizeAuthEmail(emailInput)
  if (!email) return { ok: false, error: "Enter your email." }

  const users = loadMockUsers()
  const exists = users.some((u) => normalizeAuthEmail(u.email) === email)
  if (!exists) return { ok: false, error: "No account exists with this email." }

  const code = generateSixDigitCode()
  const expiresAt = Date.now() + 10 * 60 * 1000
  localStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify({ email, code, expiresAt } satisfies StoredPasswordReset))
  return { ok: true, code, normalizedEmail: email }
}

export function verifyPasswordResetCode(
  inputCode: string,
): { ok: true; email: string } | { ok: false; error: string } {
  const stored = readPasswordResetRaw()
  if (!stored) return { ok: false, error: "No reset request found. Start again from step one." }

  if (Date.now() > stored.expiresAt) {
    clearPasswordReset()
    return { ok: false, error: "This code has expired. Request a new one." }
  }

  const digits = inputCode.trim().replace(/\s/g, "")
  if (!/^\d{6}$/.test(digits)) {
    return { ok: false, error: "Enter the 6-digit code." }
  }
  if (digits !== stored.code) {
    return { ok: false, error: "That code doesn't match." }
  }

  return { ok: true, email: stored.email }
}

export function updateMockUserPasswordByEmail(
  email: string,
  newPassword: string,
): { ok: true } | { ok: false; error: string } {
  const errs = validatePasswordRules(newPassword)
  if (errs.length > 0) return { ok: false, error: errs.join(" ") }

  const em = normalizeAuthEmail(email)
  const users = loadMockUsers()
  const idx = users.findIndex((u) => normalizeAuthEmail(u.email) === em)
  if (idx === -1) return { ok: false, error: "Account not found." }

  const next = users.slice()
  next[idx] = { ...next[idx], password: newPassword }
  saveMockUsers(next)
  notifyMockAuthListeners()
  clearPasswordReset()
  return { ok: true }
}
