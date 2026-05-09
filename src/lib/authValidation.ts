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
