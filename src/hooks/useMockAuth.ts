import { useCallback, useMemo, useSyncExternalStore } from "react"

/** Same-tab listeners — `storage` only fires across tabs. */
export function notifyMockAuthListeners(): void {
  window.dispatchEvent(new Event("myseason:mock-auth"))
}

/** All registered mock accounts in one array — passwords stored in plain text for local prototyping only. */
export const MOCK_USERS_STORAGE_KEY = "myseason_users"

/** Previous key — migrated once into {@link MOCK_USERS_STORAGE_KEY} when present. */
const LEGACY_MOCK_USERS_STORAGE_KEY = "myseason:mockUsers"

/** Active session pointer — logout clears only this key (JSON `{ userId }`). */
export const MOCK_AUTH_SESSION_KEY = "myseason_current_user"

const LEGACY_AUTH_SESSION_KEYS = ["myseason:mockAuthSession"] as const

export type MockRegisteredUser = {
  id: string
  loginName: string
  email: string
  password: string
  displayName: string
}

export function normalizeLoginName(s: string): string {
  return s.trim().toLowerCase()
}

export function normalizeAuthEmail(s: string): string {
  return s.trim().toLowerCase()
}

export function validatePasswordRules(password: string): string[] {
  const errors: string[] = []
  if (password.length === 0) {
    return ["Enter a password."]
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter.")
  }
  const digitCount = (password.match(/\d/g) ?? []).length
  if (digitCount < 2) {
    errors.push("At least two numbers.")
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("At least one special symbol.")
  }
  return errors
}

function coerceStoredString(v: unknown): string | null {
  if (typeof v === "string") return v
  if (typeof v === "number" && Number.isFinite(v)) return String(v)
  return null
}

/** Read registered users; tolerant coercion so entries are not dropped after JSON round-trips. */
export function loadMockUsers(): MockRegisteredUser[] {
  try {
    let raw = localStorage.getItem(MOCK_USERS_STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_MOCK_USERS_STORAGE_KEY)
      if (legacy) {
        raw = legacy
        localStorage.setItem(MOCK_USERS_STORAGE_KEY, legacy)
        localStorage.removeItem(LEGACY_MOCK_USERS_STORAGE_KEY)
      }
    }
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: MockRegisteredUser[] = []
    for (const row of parsed) {
      if (typeof row !== "object" || row === null) continue
      const r = row as Record<string, unknown>
      const id = coerceStoredString(r.id)
      const loginName = coerceStoredString(r.loginName)
      const email = coerceStoredString(r.email)
      const displayName = coerceStoredString(r.displayName)
      if (!id || !loginName || !email || displayName === null) continue
      const password =
        typeof r.password === "string" ? r.password : coerceStoredString(r.password) ?? ""
      out.push({ id, loginName, email, password, displayName })
    }
    return out
  } catch {
    return []
  }
}

export function saveMockUsers(users: MockRegisteredUser[]): void {
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

export function readSessionUserId(): string | null {
  try {
    let raw = localStorage.getItem(MOCK_AUTH_SESSION_KEY)
    if (!raw) {
      for (const legacyKey of LEGACY_AUTH_SESSION_KEYS) {
        const legacy = localStorage.getItem(legacyKey)
        if (legacy) {
          raw = legacy
          localStorage.setItem(MOCK_AUTH_SESSION_KEY, legacy)
          localStorage.removeItem(legacyKey)
          break
        }
      }
    }
    if (!raw) return null
    const parsed = JSON.parse(raw) as { userId?: unknown }
    return typeof parsed.userId === "string" ? parsed.userId : null
  } catch {
    return null
  }
}

export function writeSessionUserId(userId: string): void {
  localStorage.setItem(MOCK_AUTH_SESSION_KEY, JSON.stringify({ userId }))
  notifyMockAuthListeners()
}

export function clearAuthSession(): void {
  localStorage.removeItem(MOCK_AUTH_SESSION_KEY)
  for (const legacyKey of LEGACY_AUTH_SESSION_KEYS) {
    localStorage.removeItem(legacyKey)
  }
  notifyMockAuthListeners()
}

export function registerMockUser(input: {
  loginName: string
  email: string
  password: string
  displayName: string
}): { ok: true; user: MockRegisteredUser } | { ok: false; error: string } {
  const loginName = input.loginName.trim()
  const email = input.email.trim()
  const displayName = input.displayName.trim()

  if (!loginName || !email || !displayName) {
    return { ok: false, error: "Fill in every field." }
  }

  const pwdErrors = validatePasswordRules(input.password)
  if (pwdErrors.length > 0) {
    return { ok: false, error: pwdErrors.join(" ") }
  }

  const ln = normalizeLoginName(loginName)
  const em = normalizeAuthEmail(email)
  let existing = loadMockUsers()

  if (existing.some((u) => normalizeLoginName(u.loginName) === ln)) {
    return { ok: false, error: "Login name already exists" }
  }
  if (existing.some((u) => normalizeAuthEmail(u.email) === em)) {
    return { ok: false, error: "Email already exists" }
  }

  const user: MockRegisteredUser = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    loginName,
    email,
    password: typeof input.password === "string" ? input.password : "",
    displayName,
  }

  existing = loadMockUsers()
  if (existing.some((u) => normalizeLoginName(u.loginName) === ln)) {
    return { ok: false, error: "Login name already exists" }
  }
  if (existing.some((u) => normalizeAuthEmail(u.email) === em)) {
    return { ok: false, error: "Email already exists" }
  }

  try {
    saveMockUsers([...existing, user])
  } catch {
    return { ok: false, error: "Could not save your account in this browser." }
  }
  writeSessionUserId(user.id)
  return { ok: true, user }
}

export function loginMockUser(
  identifier: string,
  password: string,
): { ok: true; user: MockRegisteredUser } | { ok: false; error: string } {
  const trimmedId = identifier.trim()
  if (!trimmedId || typeof password !== "string" || password.length === 0) {
    return { ok: false, error: "Enter your email or login name and password." }
  }

  const asLogin = normalizeLoginName(trimmedId)
  const asEmail = normalizeAuthEmail(trimmedId)
  const users = loadMockUsers()
  const user = users.find(
    (u) => normalizeLoginName(u.loginName) === asLogin || normalizeAuthEmail(u.email) === asEmail,
  )

  if (!user) {
    return { ok: false, error: "Invalid login or password." }
  }

  if (user.password !== password) {
    return { ok: false, error: "Invalid login or password." }
  }

  writeSessionUserId(user.id)
  return { ok: true, user }
}

function subscribeAuth(onStoreChange: () => void): () => void {
  const run = () => onStoreChange()
  window.addEventListener("storage", run)
  window.addEventListener("myseason:mock-auth", run)
  return () => {
    window.removeEventListener("storage", run)
    window.removeEventListener("myseason:mock-auth", run)
  }
}

function getAuthSnapshot(): string {
  const id = readSessionUserId()
  const users = loadMockUsers()
  return `${id ?? ""}|${users.length}`
}

export function useMockAuth(): {
  user: MockRegisteredUser | null
  isLoggedIn: boolean
  login: (identifier: string, password: string) => ReturnType<typeof loginMockUser>
  register: (input: {
    loginName: string
    email: string
    password: string
    displayName: string
  }) => ReturnType<typeof registerMockUser>
  logout: () => void
} {
  const snap = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot)

  const user = useMemo((): MockRegisteredUser | null => {
    void snap
    const users = loadMockUsers()
    const id = readSessionUserId()
    if (!id) return null
    return users.find((u) => u.id === id) ?? null
  }, [snap])

  const login = useCallback((identifier: string, password: string) => loginMockUser(identifier, password), [])

  const register = useCallback(
    (input: {
      loginName: string
      email: string
      password: string
      displayName: string
    }) => registerMockUser(input),
    [],
  )

  const logout = useCallback(() => {
    clearAuthSession()
  }, [])

  return {
    user,
    isLoggedIn: user !== null,
    login,
    register,
    logout,
  }
}
