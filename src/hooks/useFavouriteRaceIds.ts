import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "../auth/useAuth"
import { supabase } from "../lib/supabase"

export function useFavouriteRaceIds(): {
  ids: ReadonlySet<string>
  toggle: (raceId: string) => void
  isFavourite: (raceId: string) => boolean
} {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const currentUserIdRef = useRef<string | null>(userId)
  const [idsSnapshot, setIdsSnapshot] = useState<{ userId: string | null; ids: Set<string> }>({
    userId: null,
    ids: new Set(),
  })

  useEffect(() => {
    currentUserIdRef.current = userId
  }, [userId])

  const reload = useCallback(async () => {
    const requestedUserId = userId
    if (!requestedUserId) {
      setIdsSnapshot({ userId: null, ids: new Set() })
      return
    }
    const { data, error } = await supabase.from("user_favourite_races").select("race_id").eq("user_id", requestedUserId)
    if (currentUserIdRef.current !== requestedUserId) return
    if (error || !data) {
      console.error(error)
      setIdsSnapshot({ userId: requestedUserId, ids: new Set() })
      return
    }
    setIdsSnapshot({
      userId: requestedUserId,
      ids: new Set(data.map((r) => r.race_id).filter((x): x is string => typeof x === "string")),
    })
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch favourites when Supabase user id changes
    void reload()
  }, [reload])

  const ids = idsSnapshot.userId === userId ? idsSnapshot.ids : new Set<string>()

  const toggle = useCallback(
    async (raceId: string) => {
      const writeUserId = userId
      if (!writeUserId) return
      const had = ids.has(raceId)
      if (had) {
        const { error } = await supabase.from("user_favourite_races").delete().eq("user_id", writeUserId).eq("race_id", raceId)
        if (error) {
          console.error(error)
          return
        }
        if (currentUserIdRef.current !== writeUserId) return
        setIdsSnapshot((prev) => {
          const next = new Set(prev.userId === writeUserId ? prev.ids : ids)
          next.delete(raceId)
          return { userId: writeUserId, ids: next }
        })
      } else {
        const { error } = await supabase.from("user_favourite_races").insert({ user_id: writeUserId, race_id: raceId })
        if (error) {
          console.error(error)
          return
        }
        if (currentUserIdRef.current !== writeUserId) return
        setIdsSnapshot((prev) => {
          const next = new Set(prev.userId === writeUserId ? prev.ids : ids)
          next.add(raceId)
          return { userId: writeUserId, ids: next }
        })
      }
    },
    [userId, ids],
  )

  const isFavourite = useCallback((raceId: string) => ids.has(raceId), [ids])

  return { ids, toggle, isFavourite }
}
