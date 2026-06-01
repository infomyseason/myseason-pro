import { useCallback, useEffect, useState } from "react"
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

function listsFromRow(row: Record<string, unknown>): UserRaceLists {
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

function mergeIds(existing: string[], incoming: string[]): string[] {
  return [...new Set([...incoming, ...existing])]
}

function mergeCalendarEntries(existing: CalendarEntry[], incoming: CalendarEntry[]): CalendarEntry[] {
  const seen = new Set<string>()
  const merged: CalendarEntry[] = []
  for (const entry of [...incoming, ...existing]) {
    if (seen.has(entry.raceId)) continue
    seen.add(entry.raceId)
    merged.push(entry)
  }
  return merged
}

function mergeBeforeHydration(existing: UserRaceLists, incoming: UserRaceLists): UserRaceLists {
  return {
    plannedRaceIds: mergeIds(existing.plannedRaceIds, incoming.plannedRaceIds),
    completedRaceIds: mergeIds(existing.completedRaceIds, incoming.completedRaceIds),
    calendarEntries: mergeCalendarEntries(existing.calendarEntries, incoming.calendarEntries),
  }
}

async function fetchSeasonRow(userId: string): Promise<UserRaceLists> {
  const { data, error } = await supabase.from("user_season_data").select("*").eq("user_id", userId).maybeSingle()
  if (error || !data) return defaultUserRaceLists()
  return listsFromRow(data as Record<string, unknown>)
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
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setListsState(defaultUserRaceLists())
      setHydratedUserId(null)
      return () => {
        cancelled = true
      }
    }

    setHydratedUserId(null)
    void fetchSeasonRow(userId).then((next) => {
      if (cancelled) return
      setListsState(next)
      setHydratedUserId(userId)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const setLists = useCallback(
    async (next: UserRaceLists) => {
      if (!userId) return
      const nextToSave = hydratedUserId === userId ? next : mergeBeforeHydration(await fetchSeasonRow(userId), next)
      const payload = {
        user_id: userId,
        planned_race_ids: nextToSave.plannedRaceIds,
        completed_race_ids: nextToSave.completedRaceIds,
        calendar_entries: nextToSave.calendarEntries,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("user_season_data").upsert(payload, { onConflict: "user_id" })
      if (error) {
        console.error(error)
        return
      }
      setListsState(nextToSave)
      setHydratedUserId(userId)
    },
    [userId, hydratedUserId],
  )

  return {
    ...lists,
    plannedCount: lists.plannedRaceIds.length,
    completedCount: lists.completedRaceIds.length,
    calendarCount: lists.calendarEntries.length,
    setLists,
  }
}
