import { useCallback, useEffect, useState } from "react"
import { useMockAuth } from "./useMockAuth"
import { notifyUserDataChanged, USER_DATA_CHANGED_EVENT } from "./userScopedStorage"

/** `Record<userId, raceId[]>` — never cleared on logout. */
export const USER_FAVOURITES_MAP_KEY = "myseason_user_favourites"

const LEGACY_FAVOURITES_PREFIX = "myseason:favouriteRaceIds:"

function legacyFavouritesBlobKey(userId: string): string {
  return `${LEGACY_FAVOURITES_PREFIX}${userId}`
}

function loadFavouritesMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(USER_FAVOURITES_MAP_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {}
    const out: Record<string, string[]> = {}
    for (const [uid, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(v)) continue
      out[uid] = v.filter((x): x is string => typeof x === "string")
    }
    return out
  } catch {
    return {}
  }
}

function saveFavouritesMap(map: Record<string, string[]>): void {
  localStorage.setItem(USER_FAVOURITES_MAP_KEY, JSON.stringify(map))
}

function migrateLegacyFavouritesBlob(userId: string): string[] | null {
  try {
    const legacyRaw = localStorage.getItem(legacyFavouritesBlobKey(userId))
    if (!legacyRaw) return null
    const parsed = JSON.parse(legacyRaw) as unknown
    if (!Array.isArray(parsed)) return null
    const ids = parsed.filter((x): x is string => typeof x === "string")
    const map = loadFavouritesMap()
    map[userId] = ids
    saveFavouritesMap(map)
    localStorage.removeItem(legacyFavouritesBlobKey(userId))
    return ids
  } catch {
    return null
  }
}

function readIds(userId: string | null): Set<string> {
  if (!userId) return new Set()
  const map = loadFavouritesMap()
  let arr = map[userId]
  if (!arr || arr.length === 0) {
    const migrated = migrateLegacyFavouritesBlob(userId)
    if (migrated) arr = migrated
  }
  if (!arr?.length) return new Set()
  return new Set(arr)
}

function writeIds(userId: string, ids: Set<string>): void {
  const map = loadFavouritesMap()
  map[userId] = [...ids]
  saveFavouritesMap(map)
  notifyUserDataChanged()
}

export function useFavouriteRaceIds(): {
  ids: ReadonlySet<string>
  toggle: (raceId: string) => void
  isFavourite: (raceId: string) => boolean
} {
  const { user } = useMockAuth()
  const userId = user?.id ?? null

  const [ids, setIds] = useState<Set<string>>(new Set)

  useEffect(() => {
    setIds(readIds(userId))
  }, [userId])

  useEffect(() => {
    const onEvt = () => setIds(readIds(userId))
    window.addEventListener("storage", onEvt)
    window.addEventListener(USER_DATA_CHANGED_EVENT, onEvt)
    return () => {
      window.removeEventListener("storage", onEvt)
      window.removeEventListener(USER_DATA_CHANGED_EVENT, onEvt)
    }
  }, [userId])

  const toggle = useCallback(
    (raceId: string) => {
      if (!userId) return
      setIds((prev) => {
        const next = new Set(prev)
        if (next.has(raceId)) next.delete(raceId)
        else next.add(raceId)
        writeIds(userId, next)
        return next
      })
    },
    [userId],
  )

  const isFavourite = useCallback((raceId: string) => ids.has(raceId), [ids])

  return { ids, toggle, isFavourite }
}
