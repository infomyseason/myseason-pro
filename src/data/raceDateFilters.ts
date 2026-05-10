/** Local calendar day as `YYYY-MM-DD` (lexicographic compare matches ISO race dates). */
export function calendarIsoTodayLocal(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** True when `isoDate` is today or in the future. */
export function isRaceDateNotPast(isoDate: string): boolean {
  const t = isoDate.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return true
  return t >= calendarIsoTodayLocal()
}

/** Drops races whose `date` is before today (local). */
export function filterRaceDetailsNotPast<R extends { date: string }>(rows: R[]): R[] {
  const cutoff = calendarIsoTodayLocal()
  return rows.filter((r) => r.date >= cutoff)
}
