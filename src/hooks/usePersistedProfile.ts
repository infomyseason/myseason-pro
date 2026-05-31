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

  const [profile, setProfileState] = useState<LocalProfile>(GUEST_PROFILE)
  const requestSeq = useRef(0)

  const reload = useCallback(async () => {
    const seq = ++requestSeq.current
    if (!userId) {
      setProfileState(GUEST_PROFILE)
      return
    }
    setProfileState(freshProfileForAuthUser(authDisplayName))
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
    if (seq !== requestSeq.current) return
    if (error || !data) {
      setProfileState(freshProfileForAuthUser(authDisplayName))
      return
    }
    setProfileState(rowToLocal(data as ProfileCols, authDisplayName))
  }, [userId, authDisplayName])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch profile when Supabase user id changes
    void reload()
  }, [reload])

  const setProfile = useCallback(
    async (next: LocalProfile) => {
      if (!userId) return false
      const seq = ++requestSeq.current
      const patch = {
        display_name: next.displayName.trim(),
        avatar_url: next.avatarUrl.trim(),
        bio: next.bio,
        location_line: next.locationLine.trim(),
        favourite_sport_keys: next.favouriteSportKeys,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId)
      if (error) {
        console.error(error)
        return false
      }
      if (seq !== requestSeq.current) return false
      setProfileState(next)
      await refreshProfile()
      return true
    },
    [userId, refreshProfile],
  )

  return {
    profile: userId ? profile : GUEST_PROFILE,
    setProfile,
  }
}
