export function normalizeAuthEmail(s: string): string {
  return s.trim().toLowerCase()
}

export function validatePasswordRules(password: string): string[] {
  const errors: string[] = []
  if (password.length === 0) {
    return ["Enter a password."]
  }
  if (password.length < 6) {
    errors.push("At least 6 characters.")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter.")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter.")
  }
  if (!/\d/.test(password)) {
    errors.push("At least one number.")
  }
  return errors
}
