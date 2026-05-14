export type CalendarGoalType = "justFinish" | "pbAttempt" | "trainingRace" | "aRace" | "bRace" | "cRace"

export type CalendarEntry = {
  raceId: string
  selectedDistance: string
  goalType?: CalendarGoalType
  userNote?: string
  addedAt: string // ISO
}

export type UserRaceLists = {
  plannedRaceIds: string[]
  completedRaceIds: string[]
  calendarEntries: CalendarEntry[]
}

export function defaultUserRaceLists(): UserRaceLists {
  return {
    plannedRaceIds: [],
    completedRaceIds: [],
    calendarEntries: [],
  }
}

function readIdArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string")
}

function readCalendarEntries(v: unknown): CalendarEntry[] {
  if (!Array.isArray(v)) return []
  const out: CalendarEntry[] = []
  for (const row of v) {
    if (typeof row !== "object" || row === null) continue
    const r = row as Record<string, unknown>
    const raceId = typeof r.raceId === "string" ? r.raceId : null
    const selectedDistance = typeof r.selectedDistance === "string" ? r.selectedDistance : ""
    const addedAt = typeof r.addedAt === "string" ? r.addedAt : null
    if (!raceId || !addedAt) continue
    const goalType = typeof r.goalType === "string" ? (r.goalType as CalendarGoalType) : undefined
    const userNote = typeof r.userNote === "string" ? r.userNote : undefined
    out.push({
      raceId,
      selectedDistance,
      ...(goalType ? { goalType } : {}),
      ...(userNote?.trim() ? { userNote } : {}),
      addedAt,
    })
  }
  return out
}

export function userRaceListsFromRow(row: Record<string, unknown>): UserRaceLists {
  const legacyCalendarIds = readIdArray(row.calendar_race_ids ?? row.calendarRaceIds)
  const calendarEntries = readCalendarEntries(row.calendar_entries ?? row.calendarEntries)
  const mergedEntries =
    calendarEntries.length > 0
      ? calendarEntries
      : legacyCalendarIds.map((raceId) => ({
          raceId,
          selectedDistance: "",
          addedAt: new Date().toISOString(),
        }))
  return {
    plannedRaceIds: readIdArray(row.planned_race_ids ?? row.plannedRaceIds),
    completedRaceIds: readIdArray(row.completed_race_ids ?? row.completedRaceIds),
    calendarEntries: mergedEntries,
  }
}
