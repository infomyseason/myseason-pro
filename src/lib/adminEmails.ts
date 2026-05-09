import { normalizeAuthEmail } from "./authValidation"

function parseAdminEmails(): Set<string> {
  const raw = import.meta.env.VITE_ADMIN_EMAILS ?? ""
  const parts = raw.split(",").map((s) => normalizeAuthEmail(s))
  return new Set(parts.filter(Boolean))
}

/** Comma-separated list in `VITE_ADMIN_EMAILS` (same normalization as login email). */
export function isAdminEmail(email: string | null | undefined): boolean {
  const em = normalizeAuthEmail(email ?? "")
  if (!em) return false
  return parseAdminEmails().has(em)
}
