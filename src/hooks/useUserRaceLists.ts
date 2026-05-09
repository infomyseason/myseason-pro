import { useCallback, useEffect, useState } from "react"
import { useMockAuth } from "./useMockAuth"
import { notifyUserDataChanged, USER_DATA_CHANGED_EVENT } from "./userScopedStorage"

/** `Record<userId, UserRaceLists>` — never cleared on logout. */
export const USER_RACE_LISTS_MAP_KEY = "myseason_user_race_lists"

export type UserRaceLists = {
  plannedRaceIds: string[]
  completedRaceIds: string[]
  calendarRaceIds: string[]
}

function legacyRaceListsBlobKey(userId: string): string {
  return `myseason:userRaceLists:${userId}`
}

export function defaultUserRaceLists(): UserRaceLists {
  return {
    plannedRaceIds: [],
    completedRaceIds: [],
    calendarRaceIds: [],
  }
}

function readIdArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string")
}

function listsFromRow(row: Record<string, unknown>): UserRaceLists {
  return {
    plannedRaceIds: readIdArray(row.plannedRaceIds),
    completedRaceIds: readIdArray(row.completedRaceIds),
    calendarRaceIds: readIdArray(row.calendarRaceIds),
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
    calendarCount: lists.calendarRaceIds.length,
    setLists,
  }
}
