import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { MOCK_RACES_LIST } from "../../data"
import { useFavouriteRaceIds } from "../../hooks/useFavouriteRaceIds"
import { useMockAuth } from "../../hooks/useMockAuth"
import {
  PROFILE_SPORT_OPTIONS,
  type LocalProfile,
  usePersistedProfile,
} from "../../hooks/usePersistedProfile"
import { useUserRaceLists } from "../../hooks/useUserRaceLists"
import { useRaceSubmissions } from "../../hooks/useRaceSubmissions"
import { RaceCard } from "../../components/cards/RaceCard"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"
import { SPORT_STYLES, sportKeyFromLabel } from "../../components/sportTokens"

/** Flags for countries present in mock race data (aligned with Local Races). */
const FLAG_BY_CODE: Record<string, string> = {
  LT: "🇱🇹",
  LV: "🇱🇻",
  DE: "🇩🇪",
  ES: "🇪🇸",
  SE: "🇸🇪",
  DK: "🇩🇰",
  GB: "🇬🇧",
  IT: "🇮🇹",
}

function homepagePriceLabel(label?: string): string | undefined {
  if (!label?.trim()) return undefined
  return label.replace(/^starting\s+from\s+/i, "from ")
}

const TABS = [
  { id: "favourites" as const, label: "Favourites" },
  { id: "calendar" as const, label: "Calendar" },
  { id: "submissions" as const, label: "My submissions" },
  { id: "completed" as const, label: "Completed" },
  { id: "stats" as const, label: "Stats" },
]

type ProfileTabId = (typeof TABS)[number]["id"]

export function ProfilePage() {
  const { user } = useMockAuth()
  const { profile, setProfile } = usePersistedProfile()
  const { ids, toggle } = useFavouriteRaceIds()
  const { plannedCount, completedCount, calendarCount } = useUserRaceLists()
  const { submissions } = useRaceSubmissions()
  const [activeTab, setActiveTab] = useState<ProfileTabId>("favourites")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<LocalProfile>(() => ({
    displayName: "",
    avatarUrl: "",
    bio: "",
    locationLine: "",
    favouriteSportKeys: [],
  }))

  const favouriteRaces = useMemo(
    () => MOCK_RACES_LIST.filter((r) => ids.has(r.id)),
    [ids],
  )

  const favouriteCount = ids.size
  const sportsFollowedCount = profile.favouriteSportKeys.length
  const mySubmissions = useMemo(() => submissions.filter((s) => s.createdByUserId === (user?.id ?? "")), [submissions, user?.id])

  const openEdit = useCallback(() => {
    setDraft({
      ...profile,
      favouriteSportKeys: [...profile.favouriteSportKeys],
    })
    setEditing(true)
  }, [profile])

  const cancelEdit = useCallback(() => {
    setEditing(false)
  }, [])

  const saveEdit = useCallback(() => {
    const displayName = draft.displayName.trim() || user?.displayName?.trim() || ""
    const locationLine = draft.locationLine.trim()
    setProfile({
      displayName,
      locationLine,
      avatarUrl: draft.avatarUrl.trim(),
      bio: draft.bio,
      favouriteSportKeys: [...draft.favouriteSportKeys],
    })
    setEditing(false)
  }, [draft, setProfile, user?.displayName])

  useEffect(() => {
    if (!editing) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [editing])

  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelEdit()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [editing, cancelEdit])

  const sportsHint =
    profile.favouriteSportKeys.length > 0
      ? profile.favouriteSportKeys.map((k) => SPORT_STYLES[k].label).join(" · ")
      : "None selected yet"

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[380px] w-[380px] rounded-full bg-primary/6 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#a855f7]/8 blur-[90px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Back to home
            </Link>
          </div>

          {/* Profile header */}
          <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-border/45 bg-secondary/35 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl md:flex-row md:items-start md:justify-between md:gap-8 md:p-10">
            <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
              <ProfileAvatar imageUrl={profile.avatarUrl} displayName={profile.displayName} />
              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary/90">Your profile</p>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{profile.displayName}</h1>
                {profile.locationLine.trim() ? (
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/85">
                      <span aria-hidden="true">📍</span>
                      {profile.locationLine.trim()}
                    </span>
                  </p>
                ) : null}
                {profile.bio.trim() ? (
                  <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {profile.bio.trim()}
                  </p>
                ) : null}
                {profile.favouriteSportKeys.length > 0 ? (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Favourite sports
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.favouriteSportKeys.map((key) => {
                        const s = SPORT_STYLES[key]
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md"
                            style={{ backgroundColor: `${s.hex}cc` }}
                          >
                            <span aria-hidden="true">{s.emoji}</span>
                            {s.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={openEdit}
                className="rounded-xl border border-border/55 bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-primary/35 hover:bg-primary/[0.08] hover:text-primary"
              >
                Edit profile
              </button>
            </div>
          </header>

          {/* Stats cards */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Favourite races"
              value={favouriteCount}
              hint="Saved from race pages"
              accent="primary"
            />
            <StatCard
              label="Planned races"
              value={plannedCount}
              hint={plannedCount === 0 ? "Nothing planned yet" : `${plannedCount} in your planner`}
              accent="violet"
            />
            <StatCard
              label="Completed races"
              value={completedCount}
              hint={completedCount === 0 ? "No finishes logged yet" : `${completedCount} completed`}
              accent="emerald"
            />
            <StatCard
              label="Sports followed"
              value={sportsFollowedCount}
              hint={sportsHint}
              accent="sky"
            />
          </div>

          {/* Tabs */}
          <div className="rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
            <div
              role="tablist"
              aria-label="Profile sections"
              className="flex gap-1 overflow-x-auto border-b border-border/40 px-4 pt-4 scrollbar-hide sm:gap-2 sm:px-6"
            >
              {TABS.map((tab) => {
                const selected = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`profile-tabpanel-${tab.id}`}
                    id={`profile-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-t-xl px-4 py-3 text-sm font-semibold transition-colors sm:px-5 ${
                      selected
                        ? "bg-background text-primary shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === "favourites" ? (
                <section
                  role="tabpanel"
                  id="profile-tabpanel-favourites"
                  aria-labelledby="profile-tab-favourites"
                  className="outline-none"
                >
                  {favouriteRaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
                      <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" className="text-primary" aria-hidden="true">
                          <path
                            d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-foreground">No favourite races yet</h2>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Explore events and save races to build your season.
                      </p>
                      <Link
                        to="/"
                        className="mt-8 inline-flex rounded-full border border-primary/35 bg-primary/12 px-6 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                      >
                        Discover races
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {favouriteRaces.map((race) => (
                        <div key={race.id} className="relative">
                          <RaceCard
                            mode="local"
                            layout="grid"
                            compactListing
                            sportKey={sportKeyFromLabel(race.raceType)}
                            title={race.title}
                            locationLine={`${race.city}, ${race.countryName}`}
                            flag={FLAG_BY_CODE[race.countryCode] ?? "🏁"}
                            dateLabel={race.dateLabel}
                            imageUrl={race.imageUrl}
                            distances={race.distances}
                            daysUntil={race.daysUntil}
                            to={`/race/${race.id}`}
                            startingPriceLabel={homepagePriceLabel(race.startingPriceLabel)}
                            registrationStatus={race.registrationStatus}
                            priceNote={race.priceNote}
                          />
                          <button
                            type="button"
                            aria-label={`Remove ${race.title} from favourites`}
                            className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-red-400/25 bg-red-950/25 text-red-200 shadow-lg backdrop-blur-md transition hover:border-red-400/45 hover:bg-red-950/35"
                            onClick={() => toggle(race.id)}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                              <path
                                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              {activeTab === "calendar" ? (
                <section
                  role="tabpanel"
                  id="profile-tabpanel-calendar"
                  aria-labelledby="profile-tab-calendar"
                  className="outline-none"
                >
                  {plannedCount === 0 && calendarCount === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
                      <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" className="text-primary" aria-hidden="true">
                          <path
                            d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-foreground">No planned races yet</h2>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Your calendar is empty. Explore events and build your season — planned starts will appear here.
                      </p>
                      <Link
                        to="/"
                        className="mt-8 inline-flex rounded-full border border-primary/35 bg-primary/12 px-6 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                      >
                        Discover races
                      </Link>
                    </div>
                  ) : (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Calendar entries will render here from your saved planner data.
                    </p>
                  )}
                </section>
              ) : null}

              {activeTab === "submissions" ? (
                <section
                  role="tabpanel"
                  id="profile-tabpanel-submissions"
                  aria-labelledby="profile-tab-submissions"
                  className="outline-none"
                >
                  {mySubmissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
                      <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" className="text-primary" aria-hidden="true">
                          <path
                            d="M12 5v14M5 12h14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-foreground">No submissions yet</h2>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Add an official race (needs approval) or publish a community race/event instantly.
                      </p>
                      <Link
                        to="/add-race"
                        className="mt-8 inline-flex rounded-full border border-primary/35 bg-primary/12 px-6 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                      >
                        Add race / event
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mySubmissions.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col gap-3 rounded-2xl border border-border/45 bg-background/30 p-5 transition hover:border-primary/25 hover:bg-background/40 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">{s.type.replace(/_/g, " ")}</p>
                            <p className="mt-1 truncate text-base font-black text-foreground">{s.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {s.city}, {s.country} · {s.date} · {s.sport}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                                s.status === "pending"
                                  ? "border-primary/25 bg-primary/10 text-primary"
                                  : s.status === "approved"
                                    ? "border-[#22c55e]/25 bg-[#22c55e]/10 text-[#22c55e]"
                                    : "border-red-400/25 bg-red-950/20 text-red-200"
                              }`}
                            >
                              {s.status}
                            </span>
                            {s.status === "approved" ? (
                              <Link
                                to={`/race/${s.id}`}
                                className="rounded-full border border-border/55 bg-secondary/35 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                              >
                                View
                              </Link>
                            ) : null}
                            <Link
                              to={`/add-race?edit=${encodeURIComponent(s.id)}`}
                              className="rounded-full border border-primary/30 bg-primary/12 px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              {activeTab === "completed" ? (
                <section
                  role="tabpanel"
                  id="profile-tabpanel-completed"
                  aria-labelledby="profile-tab-completed"
                  className="outline-none"
                >
                  {completedCount === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-muted/15 px-6 py-16 text-center">
                      <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-white/10 bg-secondary/80">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" className="text-muted-foreground" aria-hidden="true">
                          <path
                            d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-foreground">No completed races</h2>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Races you mark complete will show up here — your list starts empty for each account.
                      </p>
                    </div>
                  ) : (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Completed race cards will appear here from your saved history.
                    </p>
                  )}
                </section>
              ) : null}

              {activeTab === "stats" ? (
                <section
                  role="tabpanel"
                  id="profile-tabpanel-stats"
                  aria-labelledby="profile-tab-stats"
                  className="outline-none"
                >
                  <div className="rounded-2xl border border-border/45 bg-background/40 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Your stats</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Numbers below reflect only data saved for your account on this device.
                    </p>
                    {favouriteCount === 0 &&
                    plannedCount === 0 &&
                    completedCount === 0 &&
                    sportsFollowedCount === 0 ? (
                      <p className="mt-6 rounded-xl border border-border/40 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                        No stats yet — save races, plan starts, or add favourite sports in Edit profile.
                      </p>
                    ) : null}
                    <dl className="mt-6 space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-border/35 pb-4">
                        <dt className="text-sm text-muted-foreground">Favourite races</dt>
                        <dd className="text-lg font-black tabular-nums text-primary">{favouriteCount}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-border/35 pb-4">
                        <dt className="text-sm text-muted-foreground">Planned races</dt>
                        <dd className="text-lg font-black tabular-nums text-foreground">{plannedCount}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-border/35 pb-4">
                        <dt className="text-sm text-muted-foreground">Completed races</dt>
                        <dd className="text-lg font-black tabular-nums text-foreground">{completedCount}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-sm text-muted-foreground">Sports followed</dt>
                        <dd className="text-lg font-black tabular-nums text-foreground">{sportsFollowedCount}</dd>
                      </div>
                    </dl>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {editing ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            aria-label="Dismiss edit profile"
            onClick={cancelEdit}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-title"
            className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-t-3xl border border-border/50 bg-[#0c0f16] shadow-[0_-24px_80px_-32px_rgba(0,0,0,0.9)] sm:rounded-3xl"
          >
            <div className="border-b border-border/40 px-6 py-5">
              <h2 id="profile-edit-title" className="text-lg font-black text-foreground">
                Edit profile
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Saved on this device only.</p>
            </div>

            <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Display name
                  </span>
                  <input
                    type="text"
                    value={draft.displayName}
                    onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))}
                    autoComplete="nickname"
                    className="w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Avatar image URL
                  </span>
                  <input
                    type="url"
                    inputMode="url"
                    value={draft.avatarUrl}
                    onChange={(e) => setDraft((d) => ({ ...d, avatarUrl: e.target.value }))}
                    className="w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 focus:border-primary/40 focus:ring-2"
                  />
                  <div className="mt-3 flex items-center gap-4">
                    <ProfileAvatar
                      imageUrl={draft.avatarUrl}
                      displayName={draft.displayName}
                      sizeClass="size-14"
                      initialTextClass="text-xl"
                    />
                    <span className="text-xs text-muted-foreground">Preview · initials if URL fails or is empty</span>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Location
                  </span>
                  <input
                    type="text"
                    value={draft.locationLine}
                    onChange={(e) => setDraft((d) => ({ ...d, locationLine: e.target.value }))}
                    className="w-full rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none ring-primary/15 focus:border-primary/40 focus:ring-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Bio</span>
                  <textarea
                    value={draft.bio}
                    onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                    rows={4}
                    className="w-full resize-y rounded-xl border border-border/55 bg-background/90 px-4 py-2.5 text-sm leading-relaxed text-foreground outline-none ring-primary/15 focus:border-primary/40 focus:ring-2"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Favourite sports
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PROFILE_SPORT_OPTIONS.map((key) => {
                      const on = draft.favouriteSportKeys.includes(key)
                      const s = SPORT_STYLES[key]
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              favouriteSportKeys: on
                                ? d.favouriteSportKeys.filter((k) => k !== key)
                                : [...d.favouriteSportKeys, key],
                            }))
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                            on
                              ? "border-white/15 text-white shadow-md"
                              : "border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                          style={on ? { backgroundColor: `${s.hex}aa` } : undefined}
                        >
                          <span aria-hidden="true">{s.emoji}</span>
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border/40 px-6 py-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 rounded-xl border border-border/55 bg-transparent py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ProfileAvatar({
  imageUrl,
  displayName,
  sizeClass = "size-24",
  initialTextClass = "text-3xl",
}: {
  imageUrl: string
  displayName: string
  sizeClass?: string
  initialTextClass?: string
}) {
  const trimmed = imageUrl.trim()
  const initial = displayName.trim().charAt(0).toLocaleUpperCase() || "?"
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [trimmed])

  const showImg = Boolean(trimmed && !broken)

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-primary/35 bg-gradient-to-br from-primary/25 to-primary/5 shadow-[0_12px_40px_-16px_rgba(232,200,150,0.45)] ${sizeClass}`}
    >
      {showImg ? (
        <img src={trimmed} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-black text-primary ${initialTextClass}`}
        >
          {initial}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: number
  hint: string
  accent: "primary" | "violet" | "emerald" | "sky"
}) {
  const ring =
    accent === "primary"
      ? "from-primary/25 to-transparent"
      : accent === "violet"
        ? "from-[#a855f7]/22 to-transparent"
        : accent === "emerald"
          ? "from-[#22c55e]/22 to-transparent"
          : "from-[#38bdf8]/22 to-transparent"

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/45 bg-secondary/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${ring} blur-2xl`} />
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-snug text-muted-foreground">{hint}</p>
    </div>
  )
}

