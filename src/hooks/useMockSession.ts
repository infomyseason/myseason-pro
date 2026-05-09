import type { SportKey } from "../components/sportTokens"
import { MOCK_PROFILE_DEFAULTS, MOCK_USER_ID } from "./mockSessionDefaults"
import { usePersistedProfile } from "./usePersistedProfile"

/**
 * Stand-in identity defaults until real authentication exists.
 * Display fields are overridden by `usePersistedProfile` / localStorage when set.
 */
export type MockSessionUser = {
  id: string
  displayName: string
  locationLine: string
  favouriteSportKeys: readonly SportKey[]
  avatarUrl?: string
  bio?: string
}

/** Defaults before localStorage overrides — kept for imports/tests. */
export const MOCK_SESSION_USER: Omit<MockSessionUser, "avatarUrl" | "bio"> = {
  id: MOCK_USER_ID,
  ...MOCK_PROFILE_DEFAULTS,
}

/**
 * No real auth provider yet — merges persisted local profile with mock session id.
 */
export function useMockSession(): {
  isAuthenticated: true
  user: MockSessionUser
} {
  const { profile } = usePersistedProfile()
  const avatarTrim = profile.avatarUrl.trim()
  const bioTrim = profile.bio.trim()
  return {
    isAuthenticated: true,
    user: {
      id: MOCK_USER_ID,
      displayName: profile.displayName,
      locationLine: profile.locationLine,
      favouriteSportKeys: profile.favouriteSportKeys,
      ...(avatarTrim ? { avatarUrl: avatarTrim } : {}),
      ...(bioTrim ? { bio: bioTrim } : {}),
    },
  }
}
