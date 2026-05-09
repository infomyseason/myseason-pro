import { createContext } from "react"
import type { Session } from "@supabase/supabase-js"

export type AppUser = {
  id: string
  email: string
  displayName: string
  loginName: string | null
}

export type ProfileRow = {
  id: string
  login_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location_line: string | null
  favourite_sport_keys: string[] | null
}

export type AuthContextValue = {
  session: Session | null
  profileRow: ProfileRow | null
  user: AppUser | null
  isLoggedIn: boolean
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signUp: (input: {
    email: string
    password: string
    loginName: string
    displayName: string
  }) => Promise<{ error: { message: string } | null; needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<{ error: { message: string } | null }>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
