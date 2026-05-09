import type { SportKey } from "../components/sportTokens"

export const MOCK_USER_ID = "mock-session-local"

export const MOCK_PROFILE_DEFAULTS = {
  displayName: "Benas",
  locationLine: "Kaunas, Lithuania",
  favouriteSportKeys: ["running", "triathlon", "hyrox"] as SportKey[],
}
