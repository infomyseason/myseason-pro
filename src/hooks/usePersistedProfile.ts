import { useCallback, useEffect, useState } from "react"
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

  useEffect(() => {
    let cancelled = false

    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear user-scoped profile on sign-out
      setProfileState(GUEST_PROFILE)
      return () => {
        cancelled = true
      }
    }

    const fallbackProfile = freshProfileForAuthUser(authDisplayName)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prevent previous account's profile from leaking during reload
    setProfileState(fallbackProfile)
    void supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setProfileState(fallbackProfile)
          return
        }
        setProfileState(rowToLocal(data as ProfileCols, authDisplayName))
      })

    return () => {
      cancelled = true
    }
  }, [userId, authDisplayName])

  const setProfile = useCallback(
    async (next: LocalProfile) => {
      if (!userId) return false
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
