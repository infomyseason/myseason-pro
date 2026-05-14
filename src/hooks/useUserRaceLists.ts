import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "../auth/useAuth"
import { supabase } from "../lib/supabase"
import {
  defaultUserRaceLists,
  userRaceListsFromRow,
  type UserRaceLists,
} from "./userRaceListsCodec"

export { defaultUserRaceLists, type CalendarEntry, type CalendarGoalType, type UserRaceLists } from "./userRaceListsCodec"

type FetchSeasonRowResult =
  | {
      ok: true
      lists: UserRaceLists
    }
  | {
      ok: false
    }

async function fetchSeasonRow(userId: string): Promise<FetchSeasonRowResult> {
  const { data, error } = await supabase.from("user_season_data").select("*").eq("user_id", userId).maybeSingle()
  if (error) {
    console.error(error)
    return { ok: false }
  }
  if (!data) return { ok: true, lists: defaultUserRaceLists() }
  return { ok: true, lists: userRaceListsFromRow(data as Record<string, unknown>) }
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
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const loadRequestId = useRef(0)

  const reload = useCallback(async () => {
    const requestId = loadRequestId.current + 1
    loadRequestId.current = requestId
    if (!userId) {
      setListsState(defaultUserRaceLists())
      setLoadedUserId(null)
      return
    }
    setListsState(defaultUserRaceLists())
    setLoadedUserId(null)
    const result = await fetchSeasonRow(userId)
    if (requestId !== loadRequestId.current) return
    if (!result.ok) return
    setListsState(result.lists)
    setLoadedUserId(userId)
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch calendar lists when Supabase user id changes
    void reload()
  }, [reload])

  const setLists = useCallback(
    async (next: UserRaceLists) => {
      if (!userId) return
      if (loadedUserId !== userId) {
        console.warn("Skipping season data save before Supabase season data has loaded.")
        return
      }
      const payload = {
        user_id: userId,
        planned_race_ids: next.plannedRaceIds,
        completed_race_ids: next.completedRaceIds,
        calendar_entries: next.calendarEntries,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("user_season_data").upsert(payload, { onConflict: "user_id" })
      if (error) {
        console.error(error)
        return
      }
      setListsState(next)
    },
    [loadedUserId, userId],
  )

  return {
    ...lists,
    plannedCount: lists.plannedRaceIds.length,
    completedCount: lists.completedRaceIds.length,
    calendarCount: lists.calendarEntries.length,
    setLists,
  }
}
