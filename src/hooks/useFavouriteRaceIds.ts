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

  const [ids, setIds] = useState<Set<string>>(new Set())
  const requestSeq = useRef(0)

  const reload = useCallback(async () => {
    const seq = ++requestSeq.current
    if (!userId) {
      setIds(new Set())
      return
    }
    setIds(new Set())
    const { data, error } = await supabase.from("user_favourite_races").select("race_id").eq("user_id", userId)
    if (seq !== requestSeq.current) return
    if (error || !data) {
      console.error(error)
      setIds(new Set())
      return
    }
    setIds(new Set(data.map((r) => r.race_id).filter((x): x is string => typeof x === "string")))
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch favourites when Supabase user id changes
    void reload()
  }, [reload])

  const toggle = useCallback(
    async (raceId: string) => {
      if (!userId) return
      const seq = ++requestSeq.current
      const had = ids.has(raceId)
      if (had) {
        const { error } = await supabase.from("user_favourite_races").delete().eq("user_id", userId).eq("race_id", raceId)
        if (seq !== requestSeq.current) return
        if (error) {
          console.error(error)
          return
        }
        setIds((prev) => {
          const next = new Set(prev)
          next.delete(raceId)
          return next
        })
      } else {
        const { error } = await supabase.from("user_favourite_races").insert({ user_id: userId, race_id: raceId })
        if (seq !== requestSeq.current) return
        if (error) {
          console.error(error)
          return
        }
        setIds((prev) => new Set(prev).add(raceId))
      }
    },
    [userId, ids],
  )

  const isFavourite = useCallback((raceId: string) => ids.has(raceId), [ids])

  return { ids, toggle, isFavourite }
}
