import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "../auth/useAuth"
import { supabase } from "../lib/supabase"

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

function mergeUniqueIds(primary: string[], fallback: string[]): string[] {
  return [...new Set([...primary, ...fallback])]
}

function mergeCalendarEntries(primary: CalendarEntry[], fallback: CalendarEntry[]): CalendarEntry[] {
  const seen = new Set(primary.map((entry) => entry.raceId))
  return [...primary, ...fallback.filter((entry) => !seen.has(entry.raceId))]
}

function mergeWithExistingLists(next: UserRaceLists, existing: UserRaceLists): UserRaceLists {
  return {
    plannedRaceIds: mergeUniqueIds(next.plannedRaceIds, existing.plannedRaceIds),
    completedRaceIds: mergeUniqueIds(next.completedRaceIds, existing.completedRaceIds),
    calendarEntries: mergeCalendarEntries(next.calendarEntries, existing.calendarEntries),
  }
}

function listsFromRow(row: Record<string, unknown>): UserRaceLists {
  const legacyCalendarIds = readIdArray(row.calendarRaceIds)
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

type SeasonFetchResult = {
  lists: UserRaceLists
  ready: boolean
}

async function fetchSeasonRow(userId: string): Promise<SeasonFetchResult> {
  const { data, error } = await supabase.from("user_season_data").select("*").eq("user_id", userId).maybeSingle()
  if (error) {
    console.error(error)
    return { lists: defaultUserRaceLists(), ready: false }
  }
  if (!data) return { lists: defaultUserRaceLists(), ready: true }
  return { lists: listsFromRow(data as Record<string, unknown>), ready: true }
}

export function useUserRaceLists(): UserRaceLists & {
  plannedCount: number
  completedCount: number
  calendarCount: number
  setLists: (next: UserRaceLists) => Promise<void>
} {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [lists, setListsState] = useState<UserRaceLists>(defaultUserRaceLists())
  const requestSeq = useRef(0)
  const hydratedUserRef = useRef<string | null>(null)

  const reload = useCallback(async () => {
    const seq = ++requestSeq.current
    if (!userId) {
      hydratedUserRef.current = null
      setListsState(defaultUserRaceLists())
      return
    }
    hydratedUserRef.current = null
    setListsState(defaultUserRaceLists())
    const result = await fetchSeasonRow(userId)
    if (seq !== requestSeq.current || !result.ready) return
    hydratedUserRef.current = userId
    setListsState(result.lists)
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch calendar lists when Supabase user id changes
    void reload()
  }, [reload])

  const setLists = useCallback(
    async (next: UserRaceLists) => {
      if (!userId) return
      const seq = ++requestSeq.current
      let nextToPersist = next
      if (hydratedUserRef.current !== userId) {
        const result = await fetchSeasonRow(userId)
        if (seq !== requestSeq.current || !result.ready) return
        nextToPersist = mergeWithExistingLists(next, result.lists)
      }
      const payload = {
        user_id: userId,
        planned_race_ids: nextToPersist.plannedRaceIds,
        completed_race_ids: nextToPersist.completedRaceIds,
        calendar_entries: nextToPersist.calendarEntries,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("user_season_data").upsert(payload, { onConflict: "user_id" })
      if (seq !== requestSeq.current) return
      if (error) {
        console.error(error)
        return
      }
      hydratedUserRef.current = userId
      setListsState(nextToPersist)
    },
    [userId],
  )

  return {
    ...lists,
    plannedCount: lists.plannedRaceIds.length,
    completedCount: lists.completedRaceIds.length,
    calendarCount: lists.calendarEntries.length,
    setLists,
  }
}
