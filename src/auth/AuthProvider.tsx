import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import type { AppUser, AuthContextValue, ProfileRow } from "./context"
import { AuthContext } from "./context"
import { supabase } from "../lib/supabase"

function buildAppUser(session: Session | null, profile: ProfileRow | null): AppUser | null {
  if (!session?.user) return null
  const u = session.user
  const sessionProfile = profile?.id === u.id ? profile : null
  const email = u.email ?? ""
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>
  const metaLogin = typeof meta.login_name === "string" ? meta.login_name.trim() : null
  const metaDisplay = typeof meta.display_name === "string" ? meta.display_name.trim() : ""
  const displayName =
    (sessionProfile?.display_name?.trim() || metaDisplay || email.split("@")[0] || "Athlete").trim() || "Athlete"
  const loginNameRaw = sessionProfile?.login_name?.trim() || metaLogin
  return {
    id: u.id,
    email,
    displayName,
    loginName: loginNameRaw || null,
  }
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  if (error || !data) return null
  return data as ProfileRow
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profileRow, setProfileRow] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const { data: ures } = await supabase.auth.getUser()
    const uid = ures.user?.id
    if (!uid) {
      setProfileRow(null)
      return
    }
    const p = await fetchProfile(uid)
    setProfileRow(p?.id === uid ? p : null)
  }, [])

  useEffect(() => {
    let alive = true
    let hydrateSeq = 0

    const hydrate = async (sess: Session | null) => {
      const seq = ++hydrateSeq
      if (!alive) return
      setLoading(true)
      setSession(sess ?? null)
      setProfileRow(null)
      let nextProfile: ProfileRow | null = null
      if (sess?.user?.id) {
        nextProfile = await fetchProfile(sess.user.id)
      }
      if (!alive || seq !== hydrateSeq) return
      setProfileRow(nextProfile?.id === sess?.user?.id ? nextProfile : null)
      setLoading(false)
    }

    void supabase.auth.getSession().then(({ data: { session: s } }) => hydrate(s ?? null))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      void hydrate(sess ?? null)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  const user = useMemo(() => buildAppUser(session, profileRow), [session, profileRow])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: error ? { message: error.message } : null }
  }, [])

  const signUp = useCallback(
    async (input: { email: string; password: string; loginName: string; displayName: string }) => {
      const email = input.email.trim()
      const password = input.password
      const login_name = input.loginName.trim()
      const display_name = input.displayName.trim()

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              login_name,
              display_name,
            },
          },
        })
        if (error) return { error: { message: error.message }, needsEmailConfirmation: false }
        return { error: null, needsEmailConfirmation: !data.session }
      } catch (err) {
        let msg = "Sign up failed."
        if (err instanceof TypeError && err.message === "Failed to fetch") {
          msg =
            "Could not reach Supabase. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY and your network."
        } else if (err instanceof Error) {
          msg = err.message
        }
        return { error: { message: msg }, needsEmailConfirmation: false }
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}/update-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    return { error: error ? { message: error.message } : null }
  }, [])

  const value = useMemo(
    (): AuthContextValue => ({
      session,
      profileRow,
      user,
      isLoggedIn: user !== null,
      loading,
      signInWithPassword,
      signUp,
      signOut,
      logout: signOut,
      resetPasswordForEmail,
      refreshProfile,
    }),
    [
      session,
      profileRow,
      user,
      loading,
      signInWithPassword,
      signUp,
      signOut,
      resetPasswordForEmail,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
