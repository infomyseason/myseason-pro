import { useCallback, useEffect, useState } from "react"
import { useMockAuth } from "./useMockAuth"
import { notifyUserDataChanged, USER_DATA_CHANGED_EVENT } from "./userScopedStorage"

/** `Record<userId, UserRaceLists>` — never cleared on logout. */
export const USER_RACE_LISTS_MAP_KEY = "myseason_user_race_lists"

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

function legacyRaceListsBlobKey(userId: string): string {
  return `myseason:userRaceLists:${userId}`
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
  const legacyCalendarIds = readIdArray(row.calendarRaceIds)
  const calendarEntries = readCalendarEntries(row.calendarEntries)
  const mergedEntries =
    calendarEntries.length > 0
      ? calendarEntries
      : legacyCalendarIds.map((raceId) => ({
          raceId,
          selectedDistance: "",
          addedAt: new Date().toISOString(),
        }))
  return {
    plannedRaceIds: readIdArray(row.plannedRaceIds),
    completedRaceIds: readIdArray(row.completedRaceIds),
    calendarEntries: mergedEntries,
  }
}

function loadRaceListsMap(): Record<string, UserRaceLists> {
  try {
    const raw = localStorage.getItem(USER_RACE_LISTS_MAP_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {}
    const out: Record<string, UserRaceLists> = {}
    for (const [uid, row] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof row !== "object" || row === null) continue
      out[uid] = listsFromRow(row as Record<string, unknown>)
    }
    return out
  } catch {
    return {}
  }
}

function saveRaceListsMap(map: Record<string, UserRaceLists>): void {
  localStorage.setItem(USER_RACE_LISTS_MAP_KEY, JSON.stringify(map))
}

function migrateLegacyRaceListsBlob(userId: string): UserRaceLists | null {
  try {
    const legacyRaw = localStorage.getItem(legacyRaceListsBlobKey(userId))
    if (!legacyRaw) return null
    const parsed = JSON.parse(legacyRaw) as Record<string, unknown>
    const lists = listsFromRow(parsed)
    const map = loadRaceListsMap()
    map[userId] = lists
    saveRaceListsMap(map)
    localStorage.removeItem(legacyRaceListsBlobKey(userId))
    return lists
  } catch {
    return null
  }
}

export function loadUserRaceLists(userId: string): UserRaceLists {
  const map = loadRaceListsMap()
  let lists = map[userId]
  if (!lists) {
    lists = migrateLegacyRaceListsBlob(userId) ?? defaultUserRaceLists()
  }
  return lists
}

export function saveUserRaceLists(userId: string, lists: UserRaceLists): void {
  const map = loadRaceListsMap()
  map[userId] = lists
  saveRaceListsMap(map)
  notifyUserDataChanged()
}

export function useUserRaceLists(): UserRaceLists & {
  plannedCount: number
  completedCount: number
  calendarCount: number
  setLists: (next: UserRaceLists) => void
} {
  const { user } = useMockAuth()
  const userId = user?.id ?? null

  const [lists, setListsState] = useState<UserRaceLists>(defaultUserRaceLists())

  const reload = useCallback(() => {
    if (!userId) {
      setListsState(defaultUserRaceLists())
      return
    }
    setListsState(loadUserRaceLists(userId))
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const onEvt = () => reload()
    window.addEventListener("storage", onEvt)
    window.addEventListener(USER_DATA_CHANGED_EVENT, onEvt)
    return () => {
      window.removeEventListener("storage", onEvt)
      window.removeEventListener(USER_DATA_CHANGED_EVENT, onEvt)
    }
  }, [reload])

  const setLists = useCallback(
    (next: UserRaceLists) => {
      if (!userId) return
      saveUserRaceLists(userId, next)
      setListsState(next)
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
