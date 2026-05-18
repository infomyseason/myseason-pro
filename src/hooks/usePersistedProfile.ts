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
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const reloadSeq = useRef(0)

  const reload = useCallback(async () => {
    const seq = ++reloadSeq.current
    if (!userId) {
      setProfileState(GUEST_PROFILE)
      setLoadedUserId(null)
      return
    }
    const fallbackProfile = freshProfileForAuthUser(authDisplayName)
    setProfileState(fallbackProfile)
    setLoadedUserId(null)
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
    if (reloadSeq.current !== seq) return
    if (error) {
      console.error(error)
      return
    }
    if (!data) {
      setLoadedUserId(userId)
      return
    }
    setProfileState(rowToLocal(data as ProfileCols, authDisplayName))
    setLoadedUserId(userId)
  }, [userId, authDisplayName])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch profile when Supabase user id changes
    void reload()
  }, [reload])

  const setProfile = useCallback(
    async (next: LocalProfile) => {
      if (!userId) return false
      if (loadedUserId !== userId) {
        console.error("Refusing to save profile before it has loaded.")
        return false
      }
      const patch = {
        display_name: next.displayName.trim(),
        avatar_url: next.avatarUrl.trim(),
        bio: next.bio,
        location_line: next.locationLine.trim(),
        favourite_sport_keys: next.favouriteSportKeys,
        updated_at: new Date().toISOString(),
      }
      const selectedColumns = "display_name, avatar_url, bio, location_line, favourite_sport_keys"
      const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select(selectedColumns).maybeSingle()
      if (error) {
        console.error(error)
        return false
      }
      let persisted = data as ProfileCols | null
      if (!persisted) {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: userId, ...patch })
          .select(selectedColumns)
          .maybeSingle()
        if (insertError || !inserted) {
          console.error(insertError ?? new Error("Profile save did not return a row."))
          return false
        }
        persisted = inserted as ProfileCols
      }
      setProfileState(rowToLocal(persisted, next.displayName))
      await refreshProfile()
      return true
    },
    [userId, loadedUserId, refreshProfile],
  )

  return {
    profile: userId ? profile : GUEST_PROFILE,
    setProfile,
  }
}
