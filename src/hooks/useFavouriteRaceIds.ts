import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../auth/useAuth"
import { supabase } from "../lib/supabase"

const EMPTY_FAVOURITE_IDS = new Set<string>()

type FavouriteState = {
  userId: string | null
  ids: Set<string>
  loaded: boolean
}

export function useFavouriteRaceIds(): {
  ids: ReadonlySet<string>
  toggle: (raceId: string) => void
  isFavourite: (raceId: string) => boolean
} {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [favourites, setFavourites] = useState<FavouriteState>({
    userId: null,
    ids: new Set(),
    loaded: false,
  })

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear prior user's favourites before loading current user's row
    setFavourites({ userId: null, ids: new Set(), loaded: !userId })
    if (!userId) {
      return () => {
        cancelled = true
      }
    }

    const load = async () => {
      const { data, error } = await supabase.from("user_favourite_races").select("race_id").eq("user_id", userId)
      if (cancelled) return
      if (error || !data) {
        console.error(error)
        setFavourites({ userId: null, ids: new Set(), loaded: false })
        return
      }
      setFavourites({
        userId,
        ids: new Set(data.map((r) => r.race_id).filter((x): x is string => typeof x === "string")),
        loaded: true,
      })
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [userId])

  const ids = favourites.userId === userId ? favourites.ids : EMPTY_FAVOURITE_IDS

  const toggle = useCallback(
    async (raceId: string) => {
      if (!userId) return
      if (!favourites.loaded || favourites.userId !== userId) {
        console.error("Cannot update favourites before the current user's favourites have loaded.")
        return
      }
      const had = favourites.ids.has(raceId)
      if (had) {
        const { error } = await supabase.from("user_favourite_races").delete().eq("user_id", userId).eq("race_id", raceId)
        if (error) {
          console.error(error)
          return
        }
        setFavourites((prev) => {
          if (prev.userId !== userId) return prev
          const next = new Set(prev.ids)
          next.delete(raceId)
          return { userId, ids: next, loaded: true }
        })
      } else {
        const { error } = await supabase.from("user_favourite_races").insert({ user_id: userId, race_id: raceId })
        if (error) {
          console.error(error)
          return
        }
        setFavourites((prev) => {
          if (prev.userId !== userId) return prev
          return { userId, ids: new Set(prev.ids).add(raceId), loaded: true }
        })
      }
    },
    [favourites.ids, favourites.loaded, favourites.userId, userId],
  )

  const isFavourite = useCallback((raceId: string) => ids.has(raceId), [ids])

  return { ids, toggle, isFavourite }
}
