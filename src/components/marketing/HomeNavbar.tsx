import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { usePersistedProfile } from "../../hooks/usePersistedProfile"
import { useRaceSubmissions } from "../../hooks/useRaceSubmissions"
import { useTheme } from "../../hooks/useTheme"

type NavLinkItem =
  | { label: string; to: string; accent?: undefined; icon?: "plus" }
  | { label: string; href: string; accent?: true; icon?: "plus" }
  | { label: string; to: string; accent: true; icon?: "plus" }

const LINKS: NavLinkItem[] = [
  { label: "Explore", to: "/explore" },
  {
    label: "My Calendar",
    to: "/my-calendar",
    accent: true as const,
  },
  { label: "Community", to: "/community" },
  { label: "Add Race", to: "/add-race", icon: "plus" as const },
]

const ICON_PROFILE = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="shrink-0 opacity-80">
    <path
      d="M20 21c0-4.418-4.03-8-9-8s-9 3.582-9 8M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const ICON_SETTINGS = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="shrink-0 opacity-80">
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ICON_LOGOUT = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="shrink-0 opacity-80">
    <path d="M10 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 12H3m4-4-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const NAV_SOLID_AFTER_SCROLL_Y = 32

export function HomeNavbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileWrapRef = useRef<HTMLDivElement>(null)
  const { user, isLoggedIn, logout } = useAuth()
  const { submissions, isAdmin } = useRaceSubmissions()
  const { profile } = usePersistedProfile()
  const { mode, toggle: toggleTheme } = useTheme()

  const pendingApprovals = isAdmin
    ? submissions.filter((s) => s.type === "official_race" && s.status === "pending").length
    : 0

  const navDisplayName =
    isLoggedIn && profile.displayName.trim()
      ? profile.displayName.trim()
      : user?.displayName?.trim() || "Profile"
  const navInitial = navDisplayName.charAt(0).toLocaleUpperCase() || "?"

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setScrolled(y > NAV_SOLID_AFTER_SCROLL_Y)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!profileMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const root = profileWrapRef.current
      const t = e.target
      if (!root || !(t instanceof Node) || root.contains(t)) return
      setProfileMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [profileMenuOpen])

  const closeProfileMenu = () => setProfileMenuOpen(false)

  const handleLogout = () => {
    closeProfileMenu()
    setOpen(false)
    logout()
    navigate("/", { replace: true })
  }

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ease-out ${
        scrolled || open
          ? "border-b border-border/55 bg-background shadow-[0_10px_36px_rgba(0,0,0,0.55)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="relative">
              <span className="text-xl font-black tracking-tight text-foreground">
                myseason<span className="text-primary">.pro</span>
              </span>
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) =>
              link.accent ? (
                "to" in link ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="mx-2 flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-300 hover:border-primary/40 hover:from-primary/30 hover:to-primary/20 hover:shadow-lg hover:shadow-primary/10"
                  >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path
                      d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {link.label}
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" className="opacity-70" aria-hidden="true">
                    <path
                      d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="mx-2 flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-300 hover:border-primary/40 hover:from-primary/30 hover:to-primary/20 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                      <path
                        d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {link.label}
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" className="opacity-70" aria-hidden="true">
                      <path
                        d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </a>
                )
              ) : "to" in link ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="group relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon === "plus" ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                      <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : null}
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-1/2" />
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="group relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon === "plus" ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                      <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : null}
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-1/2" />
                </a>
              ),
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 items-center gap-2 rounded-full border border-border/55 bg-secondary/40 px-3 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
              aria-label="Toggle light/dark mode"
              title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mode === "dark" ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="text-primary/90">
                  <path
                    d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="text-primary/90">
                  <path
                    d="M21 12.8A7.2 7.2 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span className="hidden lg:inline">{mode === "dark" ? "Dark" : "Light"}</span>
            </button>

            {isAdmin ? (
              <Link
                to="/admin"
                className="relative inline-flex h-9 items-center gap-2 rounded-full border border-border/55 bg-secondary/40 px-4 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="text-primary/90">
                  <path
                    d="M12 2 20 6v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.2 12.2 11 14l4-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Race approvals
                {pendingApprovals > 0 ? (
                  <span className="ml-1 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-black text-primary-foreground">
                    {pendingApprovals}
                  </span>
                ) : null}
              </Link>
            ) : null}

            {isLoggedIn ? (
              <div ref={profileWrapRef} className="relative">
                <button
                  type="button"
                  id="navbar-profile-trigger"
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  aria-controls="navbar-profile-menu"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="inline-flex h-9 max-w-[200px] items-center gap-2 rounded-full border border-border/50 bg-secondary/50 pl-1 pr-2 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:border-primary/30 hover:bg-secondary/70"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">
                    {navInitial}
                  </span>
                  <span className="truncate pr-0.5">{navDisplayName}</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    aria-hidden="true"
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ease-out ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {profileMenuOpen ? (
                  <div
                    id="navbar-profile-menu"
                    role="menu"
                    aria-labelledby="navbar-profile-trigger"
                    className="navbar-profile-dropdown-panel absolute right-0 top-full z-[60] mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-border/55 bg-secondary/55 py-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl ring-1 ring-white/[0.06]"
                  >
                    <Link
                      role="menuitem"
                      to="/profile"
                      onClick={closeProfileMenu}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/45"
                    >
                      {ICON_PROFILE}
                      Profile
                    </Link>
                    <Link
                      role="menuitem"
                      to="/settings"
                      onClick={closeProfileMenu}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/45"
                    >
                      {ICON_SETTINGS}
                      Settings
                    </Link>
                    <div className="mx-2 my-1 h-px bg-border/55" role="presentation" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-red-300/95 transition-colors hover:bg-red-950/35"
                    >
                      {ICON_LOGOUT}
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <path d="M4 5h16M4 12h16M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl max-h-[calc(100svh-4rem)] space-y-2 overflow-y-auto px-4 py-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-lg bg-secondary/60 px-4 py-3 text-sm font-semibold text-foreground"
            >
              <span className="flex items-center gap-2">
                {mode === "dark" ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="text-primary/90">
                    <path
                      d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="text-primary/90">
                    <path
                      d="M21 12.8A7.2 7.2 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                Theme
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{mode === "dark" ? "Dark" : "Light"}</span>
            </button>
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center justify-between rounded-lg bg-secondary/70 px-4 py-3 text-sm font-semibold text-foreground"
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="text-primary/90">
                    <path
                      d="M12 2 20 6v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.2 12.2 11 14l4-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Race approvals
                </span>
                {pendingApprovals > 0 ? (
                  <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-black text-primary-foreground">
                    {pendingApprovals}
                  </span>
                ) : null}
              </Link>
            ) : null}

            {LINKS.map((link) =>
              link.accent ? (
                "to" in link ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block rounded-lg bg-primary/15 px-4 py-3 text-sm font-semibold text-primary"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block rounded-lg bg-primary/15 px-4 py-3 text-sm font-semibold text-primary"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              ) : "to" in link ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
            {isLoggedIn ? (
              <div className="mt-4 space-y-1 border-t border-border/40 pt-4">
                <div className="flex items-center gap-3 px-4 py-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">
                    {navInitial}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{navDisplayName}</span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
                  onClick={() => setOpen(false)}
                >
                  {ICON_PROFILE}
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
                  onClick={() => setOpen(false)}
                >
                  {ICON_SETTINGS}
                  Settings
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-300/95 transition-colors hover:bg-red-950/35"
                  onClick={() => {
                    setOpen(false)
                    logout()
                    navigate("/", { replace: true })
                  }}
                >
                  {ICON_LOGOUT}
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="mt-4 block w-full rounded-md bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
