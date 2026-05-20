import { useCallback, useEffect, useRef, useState } from "react"
import type { SportKey } from "../components/sportTokens"
import { useAuth } from "../auth/useAuth"
import { supabase } from "../lib/supabase"

/** Ordered list for edit UI toggles */
export const PROFILE_SPORT_OPTIONS: readonly SportKey[] = ["running", "triathlon", "cycling", "hyrox"]

export type LocalProfile = {
  displayName: string
  avatarUrl: string
  bio: string
  locationLine: string
  favouriteSportKeys: SportKey[]
}

export const GUEST_PROFILE: LocalProfile = {
  displayName: "",
  avatarUrl: "",
  bio: "",
  locationLine: "",
  favouriteSportKeys: [],
}

export function freshProfileForAuthUser(displayName: string): LocalProfile {
  return {
    displayName: displayName.trim(),
    avatarUrl: "",
    bio: "",
    locationLine: "",
    favouriteSportKeys: [],
  }
}

function isSportKey(x: string): x is SportKey {
  return PROFILE_SPORT_OPTIONS.includes(x as SportKey)
}

function normalizeSports(raw: unknown): SportKey[] {
  if (!Array.isArray(raw)) return []
  const next = raw.filter((x): x is SportKey => typeof x === "string" && isSportKey(x))
  return [...new Set(next)]
}

type ProfileCols = {
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location_line: string | null
  favourite_sport_keys: string[] | null
}

function rowToLocal(profileRow: ProfileCols, fallbackDisplayName: string): LocalProfile {
  const displayName =
    typeof profileRow.display_name === "string" && profileRow.display_name.trim()
      ? profileRow.display_name.trim()
      : fallbackDisplayName.trim()
  const avatarUrl =
    typeof profileRow.avatar_url === "string" ? profileRow.avatar_url.trim() : ""
  const bio = typeof profileRow.bio === "string" ? profileRow.bio : ""
  const locationLine =
    typeof profileRow.location_line === "string" && profileRow.location_line.trim()
      ? profileRow.location_line.trim()
      : ""
  return {
    displayName,
    avatarUrl,
    bio,
    locationLine,
    favouriteSportKeys: normalizeSports(profileRow.favourite_sport_keys),
  }
}

export function usePersistedProfile(): {
  profile: LocalProfile
  setProfile: (next: LocalProfile) => Promise<boolean>
} {
  const { user, refreshProfile } = useAuth()
  const userId = user?.id ?? null
  const authDisplayName = user?.displayName ?? ""

  const currentUserIdRef = useRef<string | null>(userId)
  const [profileSnapshot, setProfileSnapshot] = useState<{ userId: string | null; profile: LocalProfile }>({
    userId: null,
    profile: GUEST_PROFILE,
  })

  useEffect(() => {
    currentUserIdRef.current = userId
  }, [userId])

  const reload = useCallback(async () => {
    const requestedUserId = userId
    if (!requestedUserId) {
      setProfileSnapshot({ userId: null, profile: GUEST_PROFILE })
      return
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", requestedUserId).maybeSingle()
    if (currentUserIdRef.current !== requestedUserId) return
    if (error || !data) {
      setProfileSnapshot({ userId: requestedUserId, profile: freshProfileForAuthUser(authDisplayName) })
      return
    }
    setProfileSnapshot({ userId: requestedUserId, profile: rowToLocal(data as ProfileCols, authDisplayName) })
  }, [userId, authDisplayName])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch profile when Supabase user id changes
    void reload()
  }, [reload])

  const setProfile = useCallback(
    async (next: LocalProfile) => {
      const writeUserId = userId
      if (!writeUserId) return false
      const patch = {
        display_name: next.displayName.trim(),
        avatar_url: next.avatarUrl.trim(),
        bio: next.bio,
        location_line: next.locationLine.trim(),
        favourite_sport_keys: next.favouriteSportKeys,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("profiles").update(patch).eq("id", writeUserId)
      if (error) {
        console.error(error)
        return false
      }
      if (currentUserIdRef.current === writeUserId) {
        setProfileSnapshot({ userId: writeUserId, profile: next })
        await refreshProfile()
      }
      return true
    },
    [userId, refreshProfile],
  )

  const profile =
    userId && profileSnapshot.userId === userId
      ? profileSnapshot.profile
      : userId
        ? freshProfileForAuthUser(authDisplayName)
        : GUEST_PROFILE

  return {
    profile,
    setProfile,
  }
}
