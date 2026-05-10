export function normalizeDedupeSourceUrl(sourceUrl: string): string {
  return sourceUrl.trim().toLowerCase().replace(/\/+$/, "")
}

export function normalizeDedupeTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ")
}
