import { useCallback, useEffect, useState } from "react"
import type { SportKey } from "../components/sportTokens"
import { useMockAuth } from "./useMockAuth"
import { notifyUserDataChanged, USER_DATA_CHANGED_EVENT } from "./userScopedStorage"

/** `Record<userId, LocalProfile>` — never cleared on logout. */
export const USER_PROFILES_MAP_KEY = "myseason_user_profiles"

/** Legacy per-user blob keys → migrated into {@link USER_PROFILES_MAP_KEY}. */
function legacyProfileBlobKey(userId: string): string {
  return `myseason:localProfile:${userId}`
}

export type LocalProfile = {
  displayName: string
  avatarUrl: string
  bio: string
  locationLine: string
  favouriteSportKeys: SportKey[]
}

const ALL_SPORT_KEYS: SportKey[] = ["running", "triathlon", "cycling", "hyrox"]

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
  return ALL_SPORT_KEYS.includes(x as SportKey)
}

function normalizeSports(raw: unknown): SportKey[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const next = raw.filter((x): x is SportKey => typeof x === "string" && isSportKey(x))
  return [...new Set(next)]
}

function parseProfileRecord(parsed: Record<string, unknown>, fallbackDisplayName: string): LocalProfile {
  const displayName =
    typeof parsed.displayName === "string" && parsed.displayName.trim()
      ? parsed.displayName.trim()
      : fallbackDisplayName.trim()
  const avatarUrl = typeof parsed.avatarUrl === "string" ? parsed.avatarUrl.trim() : ""
  const bio = typeof parsed.bio === "string" ? parsed.bio : ""
  const locationLine =
    typeof parsed.locationLine === "string" && parsed.locationLine.trim()
      ? parsed.locationLine.trim()
      : ""
  const sports = normalizeSports(parsed.favouriteSportKeys)
  return {
    displayName,
    avatarUrl,
    bio,
    locationLine,
    favouriteSportKeys: sports ?? [],
  }
}

function loadProfilesMap(): Record<string, LocalProfile> {
  try {
    const raw = localStorage.getItem(USER_PROFILES_MAP_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {}
    const out: Record<string, LocalProfile> = {}
    for (const [uid, row] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof row !== "object" || row === null) continue
      out[uid] = parseProfileRecord(row as Record<string, unknown>, "")
    }
    return out
  } catch {
    return {}
  }
}

function saveProfilesMap(map: Record<string, LocalProfile>): void {
  localStorage.setItem(USER_PROFILES_MAP_KEY, JSON.stringify(map))
}

export function loadProfileForUser(userId: string, authDisplayName: string): LocalProfile {
  const map = loadProfilesMap()
  const stored = map[userId]
  if (stored) {
    const merged = parseProfileRecord(
      {
        displayName: stored.displayName,
        avatarUrl: stored.avatarUrl,
        bio: stored.bio,
        locationLine: stored.locationLine,
        favouriteSportKeys: stored.favouriteSportKeys,
      },
      authDisplayName,
    )
    return merged
  }

  try {
    const legacyRaw = localStorage.getItem(legacyProfileBlobKey(userId))
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as Record<string, unknown>
      const profile = parseProfileRecord(parsed, authDisplayName)
      saveProfileForUser(userId, profile)
      localStorage.removeItem(legacyProfileBlobKey(userId))
      return profile
    }
  } catch {
    /* ignore */
  }

  return freshProfileForAuthUser(authDisplayName)
}

export function saveProfileForUser(userId: string, profile: LocalProfile): void {
  const map = loadProfilesMap()
  map[userId] = profile
  saveProfilesMap(map)
  notifyUserDataChanged()
}

/** Ordered list for edit UI toggles */
export const PROFILE_SPORT_OPTIONS: readonly SportKey[] = ALL_SPORT_KEYS

export function usePersistedProfile(): {
  profile: LocalProfile
  setProfile: (next: LocalProfile) => void
} {
  const { user } = useMockAuth()
  const userId = user?.id ?? null
  const authDisplayName = user?.displayName ?? ""

  const [profile, setProfileState] = useState<LocalProfile>(GUEST_PROFILE)

  const reload = useCallback(() => {
    if (!userId) {
      setProfileState(GUEST_PROFILE)
      return
    }
    setProfileState(loadProfileForUser(userId, authDisplayName))
  }, [userId, authDisplayName])

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

  const setProfile = useCallback(
    (next: LocalProfile) => {
      if (!userId) return
      saveProfileForUser(userId, next)
      setProfileState(next)
    },
    [userId],
  )

  return {
    profile: userId ? profile : GUEST_PROFILE,
    setProfile,
  }
}
