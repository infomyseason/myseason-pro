import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { loadApprovedCommunityEvents, MOCK_RACE_DETAILS } from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { formatRaceDateLabel } from "../explore/exploreFilters"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

type TabId = "events" | "clubs" | "stories"

type CommunityEvent = {
  id: string
  title: string
  sport: "Running" | "Triathlon" | "Cycling" | "HYROX" | "Recovery"
  city: string
  country: string
  countryCode: string
  date: string // ISO
  organizer: string
  participants: number
}

type Club = {
  id: string
  name: string
  sport: "Running" | "Triathlon" | "Cycling" | "HYROX"
  city: string
  country: string
  countryCode: string
  description: string
  websiteUrl?: string
  instagramUrl?: string
  membersCount: number
}

type RaceStory = {
  id: string
  userName: string
  userInitials: string
  date: string // ISO
  sport: "Running" | "Triathlon" | "Cycling" | "HYROX"
  raceId: string
  photoUrl: string
  distanceLabel: string
  resultLabel: string
  caption: string
  likes: number
  comments: number
}

type LocationScope = "near" | "city" | "country" | "europe" | "all"

const TABS: { id: TabId; label: string; blurb: string }[] = [
  { id: "events", label: "Community events", blurb: "Group runs, training sessions, social events & recovery." },
  { id: "clubs", label: "Clubs", blurb: "Find local crews and training partners across Europe." },
  { id: "stories", label: "Race stories", blurb: "Experiences, photos, results — share the season." },
]

const CURRENT_USER = { city: "Kaunas", country: "Lithuania" } as const

const LOCATION_FILTERS: { id: LocationScope; label: string }[] = [
  { id: "near", label: "Near me" },
  { id: "city", label: "My city" },
  { id: "country", label: "My country" },
  { id: "europe", label: "Europe" },
  { id: "all", label: "All countries" },
]

const SPORT_ACCENTS: Record<
  CommunityEvent["sport"] | Club["sport"] | RaceStory["sport"],
  { label: string; hex: string; bg: string; border: string; text: string }
> = {
  Running: {
    label: "Running",
    hex: "#22c55e",
    bg: "bg-[#22c55e]/10",
    border: "border-[#22c55e]/25",
    text: "text-[#22c55e]",
  },
  Cycling: {
    label: "Cycling",
    hex: "#3b82f6",
    bg: "bg-[#3b82f6]/10",
    border: "border-[#3b82f6]/25",
    text: "text-[#3b82f6]",
  },
  Triathlon: {
    label: "Triathlon",
    hex: "#a855f7",
    bg: "bg-[#a855f7]/10",
    border: "border-[#a855f7]/25",
    text: "text-[#a855f7]",
  },
  HYROX: {
    label: "HYROX",
    hex: "#f97316",
    bg: "bg-[#f97316]/10",
    border: "border-[#f97316]/25",
    text: "text-[#f97316]",
  },
  Recovery: {
    label: "Recovery",
    hex: "#e8c896",
    bg: "bg-primary/10",
    border: "border-primary/25",
    text: "text-primary",
  },
}

const MOCK_COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: "evt-01",
    title: "Sunday Long Run · Easy pace + coffee",
    sport: "Running",
    city: "Vilnius",
    country: "Lithuania",
    countryCode: "LT",
    date: "2026-05-17",
    organizer: "myseason Run Club",
    participants: 38,
  },
  {
    id: "evt-02",
    title: "Track Tuesday · 10×400m (all levels)",
    sport: "Running",
    city: "Kaunas",
    country: "Lithuania",
    countryCode: "LT",
    date: "2026-05-12",
    organizer: "Temple Social Crew",
    participants: 22,
  },
  {
    id: "evt-03",
    title: "Group Ride · Gravel loops + skills",
    sport: "Cycling",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    date: "2026-05-24",
    organizer: "North Road Collective",
    participants: 46,
  },
  {
    id: "evt-04",
    title: "Open-water session · Technique + confidence",
    sport: "Triathlon",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    date: "2026-06-01",
    organizer: "Tri Squad BCN",
    participants: 18,
  },
  {
    id: "evt-05",
    title: "Recovery flow · Mobility + sauna meetup",
    sport: "Recovery",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    date: "2026-05-15",
    organizer: "Nordic Endurance",
    participants: 27,
  },
]

const MOCK_CLUBS: Club[] = [
  {
    id: "club-01",
    name: "myseason Run Club",
    sport: "Running",
    city: "Vilnius",
    country: "Lithuania",
    countryCode: "LT",
    description: "Weekly socials + structured sessions. Beginners welcome, PB hunters supported.",
    instagramUrl: "#",
    websiteUrl: "#",
    membersCount: 214,
  },
  {
    id: "club-02",
    name: "Tri Squad BCN",
    sport: "Triathlon",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    description: "Swim/bike/run group with open-water meetups and race-weekend support.",
    instagramUrl: "#",
    membersCount: 128,
  },
  {
    id: "club-03",
    name: "North Road Collective",
    sport: "Cycling",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    description: "Road + gravel rides, cafe culture, and big days out with friendly pacing groups.",
    websiteUrl: "#",
    membersCount: 302,
  },
  {
    id: "club-04",
    name: "HYROX Crew Berlin",
    sport: "HYROX",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    description: "Strength + engine sessions focused on HYROX race prep and team doubles.",
    instagramUrl: "#",
    membersCount: 176,
  },
]

const MOCK_RACE_STORIES: RaceStory[] = [
  {
    id: "story-01",
    userName: "Benas K.",
    userInitials: "BK",
    sport: "Running",
    date: "2026-04-27",
    raceId: "swedbank-vilnius-marathon-2026",
    photoUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1400&auto=format&fit=crop&q=80",
    distanceLabel: "Half Marathon",
    resultLabel: "1:34:12 · PB",
    caption: "Perfect weather and unreal crowds in Old Town. Went out controlled and closed strong.",
    likes: 124,
    comments: 18,
  },
  {
    id: "story-02",
    userName: "Aistė M.",
    userInitials: "AM",
    sport: "Triathlon",
    date: "2026-05-10",
    raceId: "temple-kauno-pusmaratonis-2026",
    photoUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1400&auto=format&fit=crop&q=80",
    distanceLabel: "10K (training day)",
    resultLabel: "48:31",
    caption: "Used the event vibe as a tempo day — music, community, and a super smooth course.",
    likes: 88,
    comments: 9,
  },
]

const PANEL_WRAP = "rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl"

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function locationLabel(city: string, country: string): string {
  return `${city}, ${country}`
}

function inUserCity(itemCity: string, itemCountry: string): boolean {
  return norm(itemCity) === norm(CURRENT_USER.city) && norm(itemCountry) === norm(CURRENT_USER.country)
}

function inUserCountry(itemCountry: string): boolean {
  return norm(itemCountry) === norm(CURRENT_USER.country)
}

function locationScore(itemCity: string, itemCountry: string, selected?: { city?: string; country?: string }): number {
  const selCity = selected?.city?.trim()
  const selCountry = selected?.country?.trim()

  if (selCity && selCountry) {
    if (norm(itemCity) === norm(selCity) && norm(itemCountry) === norm(selCountry)) return 0
    if (norm(itemCountry) === norm(selCountry)) return 1
    return 2
  }
  if (selCountry) {
    if (norm(itemCountry) === norm(selCountry)) return 0
    return 1
  }

  if (inUserCity(itemCity, itemCountry)) return 0
  if (inUserCountry(itemCountry)) return 1
  return 2
}

function ScopeChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/55 bg-background/40 text-muted-foreground hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function LocationSearch({
  options,
  value,
  onChange,
  onPick,
}: {
  options: { city: string; country: string; countryCode: string }[]
  value: string
  onChange: (v: string) => void
  onPick: (next: { city?: string; country?: string; countryCode?: string } | null) => void
}) {
  const q = value.trim().toLowerCase()
  const matches =
    q.length === 0
      ? []
      : options
          .filter((o) => o.city.toLowerCase().includes(q) || o.country.toLowerCase().includes(q))
          .slice(0, 8)

  return (
    <div className="relative w-full sm:max-w-[420px]">
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="m21 21-4.34-4.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search city or country…"
        className="w-full rounded-xl border border-border/55 bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/55 focus:border-primary/40 focus:ring-2"
        autoComplete="off"
      />

      {matches.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border/55 bg-background/95 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          {matches.map((m) => (
            <button
              key={`${m.city}|${m.countryCode}`}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-secondary/60"
              onClick={() => {
                onPick({ city: m.city, country: m.country, countryCode: m.countryCode })
                onChange("")
              }}
            >
              <span className="text-base">{EUROPE_FLAG_BY_CODE[m.countryCode] ?? "🏁"}</span>
              <span className="flex-1 truncate">{locationLabel(m.city, m.country)}</span>
            </button>
          ))}
          <div className="border-t border-border/40 p-2">
            <button
              type="button"
              className="w-full rounded-xl border border-border/55 bg-secondary/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/25 hover:bg-secondary/60 hover:text-foreground"
              onClick={() => {
                onPick(null)
                onChange("")
              }}
            >
              Clear location
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ExternalIcon({ name }: { name: "instagram" | "website" }) {
  if (name === "instagram")
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1" fill="currentColor" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M10 14a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 10a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SoftButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-border/55 bg-background/40 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-secondary/60 ${className}`}
    >
      {children}
    </button>
  )
}

function PrimaryButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary/90 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition hover:bg-primary ${className}`}
    >
      {children}
    </button>
  )
}

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabId>("events")
  const [locationScope, setLocationScope] = useState<LocationScope>("near")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ city?: string; country?: string; countryCode?: string } | null>(null)

  const raceById = useMemo(() => new Map(MOCK_RACE_DETAILS.map((r) => [r.id, r])), [])

  const locationOptions = useMemo(() => {
    const seen = new Set<string>()
    const out: { city: string; country: string; countryCode: string }[] = []
    const push = (city: string, country: string, countryCode: string) => {
      const key = `${norm(city)}|${norm(country)}|${countryCode}`
      if (seen.has(key)) return
      seen.add(key)
      out.push({ city, country, countryCode })
    }
    for (const e of MOCK_COMMUNITY_EVENTS) push(e.city, e.country, e.countryCode)
    for (const c of MOCK_CLUBS) push(c.city, c.country, c.countryCode)
    out.sort((a, b) => locationScore(a.city, a.country, selectedLocation ?? undefined) - locationScore(b.city, b.country, selectedLocation ?? undefined))
    return out
  }, [selectedLocation])

  const dynamicEvents = useMemo(() => {
    const submitted = loadApprovedCommunityEvents().map((e) => ({
      ...e,
      sport: (e.sport as any) as CommunityEvent["sport"],
    }))
    // countryCode is optional on submissions — fall back to empty string
    const normalized = submitted.map((e) => ({ ...e, countryCode: e.countryCode || "" }))
    return [...normalized, ...MOCK_COMMUNITY_EVENTS]
  }, [])

  const sortedEvents = useMemo(() => {
    const base = [...dynamicEvents].sort((a, b) => {
      const s = locationScore(a.city, a.country, selectedLocation ?? undefined) - locationScore(b.city, b.country, selectedLocation ?? undefined)
      if (s !== 0) return s
      // more participants first within same bucket
      return b.participants - a.participants
    })

    const scoped = base.filter((e) => {
      if (locationScope === "all") return true
      if (locationScope === "europe") return true
      if (locationScope === "country") return inUserCountry(e.country)
      if (locationScope === "city") return inUserCity(e.city, e.country)
      // near: show all, but sorted by relevance
      return true
    })
    return scoped
  }, [dynamicEvents, locationScope, selectedLocation])

  const sortedClubs = useMemo(() => {
    const base = [...MOCK_CLUBS].sort((a, b) => {
      const s = locationScore(a.city, a.country, selectedLocation ?? undefined) - locationScore(b.city, b.country, selectedLocation ?? undefined)
      if (s !== 0) return s
      return b.membersCount - a.membersCount
    })
    const scoped = base.filter((c) => {
      if (locationScope === "all") return true
      if (locationScope === "europe") return true
      if (locationScope === "country") return inUserCountry(c.country)
      if (locationScope === "city") return inUserCity(c.city, c.country)
      return true
    })
    return scoped
  }, [locationScope, selectedLocation])

  const hasCityEvents = useMemo(
    () => sortedEvents.some((e) => inUserCity(e.city, e.country)),
    [sortedEvents],
  )

  const hasCityClubs = useMemo(
    () => sortedClubs.some((c) => inUserCity(c.city, c.country)),
    [sortedClubs],
  )

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#3b82f6]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 lg:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">Hub</p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">Community</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Find your people — train together, join clubs, and share race stories.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeTab === "events" ? (
                  <PrimaryButton onClick={() => {}}>Add community event</PrimaryButton>
                ) : activeTab === "clubs" ? (
                  <PrimaryButton onClick={() => {}}>Add club</PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => {}}>Create post</PrimaryButton>
                )}
                <SoftButton onClick={() => {}}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Quick action
                </SoftButton>
              </div>
            </div>
          </header>

          <div className={PANEL_WRAP}>
            <div
              role="tablist"
              aria-label="Community sections"
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
                    aria-controls={`community-tabpanel-${tab.id}`}
                    id={`community-tab-${tab.id}`}
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
              {/* Events */}
              {activeTab === "events" ? (
                <section
                  role="tabpanel"
                  id="community-tabpanel-events"
                  aria-labelledby="community-tab-events"
                  className="outline-none"
                >
                  <p className="mb-6 text-sm text-muted-foreground">{TABS.find((t) => t.id === "events")?.blurb}</p>

                  <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {LOCATION_FILTERS.map((f) => (
                        <ScopeChip key={f.id} active={locationScope === f.id} onClick={() => setLocationScope(f.id)}>
                          {f.label}
                        </ScopeChip>
                      ))}
                    </div>
                    <LocationSearch
                      options={locationOptions}
                      value={locationQuery}
                      onChange={setLocationQuery}
                      onPick={(next) => setSelectedLocation(next)}
                    />
                  </div>

                  {locationScope === "near" && selectedLocation == null && !hasCityEvents ? (
                    <div className="mb-6 rounded-2xl border border-border/45 bg-background/30 px-5 py-4">
                      <p className="text-sm font-bold text-foreground">No events in {CURRENT_USER.city} yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">Showing events in {CURRENT_USER.country}.</p>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sortedEvents.map((ev) => {
                      const accent = SPORT_ACCENTS[ev.sport]
                      return (
                        <div
                          key={ev.id}
                          className="rounded-2xl border border-border/45 bg-background/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-primary/25 hover:bg-background/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${accent.bg} ${accent.border} ${accent.text}`}
                              >
                                <span className="size-1.5 rounded-full" style={{ backgroundColor: accent.hex }} />
                                {accent.label}
                              </div>
                              <h3 className="mt-3 truncate text-base font-black tracking-tight text-foreground">
                                {ev.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {EUROPE_FLAG_BY_CODE[ev.countryCode] ?? "🏁"} {ev.city}, {ev.country}
                              </p>
                            </div>
                            <div className="shrink-0 rounded-xl border border-border/45 bg-secondary/35 px-3 py-2 text-right">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Date</p>
                              <p className="text-sm font-semibold text-foreground">{formatRaceDateLabel(ev.date)}</p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-border/40 bg-secondary/25 px-3 py-2">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                                Organizer
                              </p>
                              <p className="truncate text-sm font-semibold text-foreground">{ev.organizer}</p>
                            </div>
                            <div className="rounded-xl border border-border/40 bg-secondary/25 px-3 py-2">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                                Participants
                              </p>
                              <p className="text-sm font-semibold text-foreground">{ev.participants}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                <path
                                  d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinejoin="round"
                                />
                                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              Details
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/12 px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {/* Clubs */}
              {activeTab === "clubs" ? (
                <section
                  role="tabpanel"
                  id="community-tabpanel-clubs"
                  aria-labelledby="community-tab-clubs"
                  className="outline-none"
                >
                  <p className="mb-6 text-sm text-muted-foreground">{TABS.find((t) => t.id === "clubs")?.blurb}</p>

                  <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {LOCATION_FILTERS.map((f) => (
                        <ScopeChip key={f.id} active={locationScope === f.id} onClick={() => setLocationScope(f.id)}>
                          {f.label}
                        </ScopeChip>
                      ))}
                    </div>
                    <LocationSearch
                      options={locationOptions}
                      value={locationQuery}
                      onChange={setLocationQuery}
                      onPick={(next) => setSelectedLocation(next)}
                    />
                  </div>

                  {locationScope === "near" && selectedLocation == null && !hasCityClubs ? (
                    <div className="mb-6 rounded-2xl border border-border/45 bg-background/30 px-5 py-4">
                      <p className="text-sm font-bold text-foreground">No clubs in {CURRENT_USER.city} yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">Showing clubs in {CURRENT_USER.country}.</p>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sortedClubs.map((c) => {
                      const accent = SPORT_ACCENTS[c.sport]
                      return (
                        <div
                          key={c.id}
                          className="rounded-2xl border border-border/45 bg-background/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-primary/25 hover:bg-background/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${accent.bg} ${accent.border} ${accent.text}`}
                              >
                                <span className="size-1.5 rounded-full" style={{ backgroundColor: accent.hex }} />
                                {accent.label}
                              </div>
                              <h3 className="mt-3 truncate text-base font-black tracking-tight text-foreground">
                                {c.name}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {EUROPE_FLAG_BY_CODE[c.countryCode] ?? "🏁"} {c.city}, {c.country}
                              </p>
                            </div>
                            <div className="shrink-0 rounded-xl border border-border/45 bg-secondary/35 px-3 py-2 text-right">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Members</p>
                              <p className="text-sm font-semibold text-foreground">{c.membersCount}</p>
                            </div>
                          </div>

                          <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {c.instagramUrl ? (
                              <a
                                href={c.instagramUrl}
                                className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-secondary/35 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                              >
                                <ExternalIcon name="instagram" />
                                Instagram
                              </a>
                            ) : null}
                            {c.websiteUrl ? (
                              <a
                                href={c.websiteUrl}
                                className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-secondary/35 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                              >
                                <ExternalIcon name="website" />
                                Website
                              </a>
                            ) : null}
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">Local club · mock data</span>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/12 px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                            >
                              View club
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {/* Stories */}
              {activeTab === "stories" ? (
                <section
                  role="tabpanel"
                  id="community-tabpanel-stories"
                  aria-labelledby="community-tab-stories"
                  className="outline-none"
                >
                  <p className="mb-6 text-sm text-muted-foreground">{TABS.find((t) => t.id === "stories")?.blurb}</p>

                  <div className="grid gap-5 lg:grid-cols-2">
                    {MOCK_RACE_STORIES.map((s) => {
                      const accent = SPORT_ACCENTS[s.sport]
                      const race = raceById.get(s.raceId)
                      return (
                        <article
                          key={s.id}
                          className="overflow-hidden rounded-2xl border border-border/45 bg-background/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-primary/25 hover:bg-background/40"
                        >
                          <div className="flex items-center justify-between gap-3 px-5 pt-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-black text-primary">
                                {s.userInitials}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-foreground">{s.userName}</p>
                                <p className="text-xs text-muted-foreground">{formatRaceDateLabel(s.date)}</p>
                              </div>
                            </div>
                            <div
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${accent.bg} ${accent.border} ${accent.text}`}
                            >
                              <span className="size-1.5 rounded-full" style={{ backgroundColor: accent.hex }} />
                              {accent.label}
                            </div>
                          </div>

                          <div className="mt-4 aspect-[16/9] w-full overflow-hidden bg-secondary/30">
                            <img src={s.photoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                          </div>

                          <div className="px-5 pb-5 pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-border/55 bg-secondary/35 px-3 py-1 text-xs font-semibold text-foreground">
                                {s.distanceLabel}
                              </span>
                              <span className="rounded-full border border-border/55 bg-secondary/35 px-3 py-1 text-xs font-semibold text-foreground">
                                {s.resultLabel}
                              </span>
                              {race ? (
                                <Link
                                  to={`/race/${race.id}`}
                                  className="max-w-full truncate rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary/45 hover:bg-primary/15"
                                  title={race.title}
                                >
                                  Race: {race.title}
                                </Link>
                              ) : (
                                <span className="rounded-full border border-border/55 bg-secondary/35 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  Race linked
                                </span>
                              )}
                            </div>

                            <p className="mt-3 text-sm text-foreground/95">{s.caption}</p>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                    <path
                                      d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {s.likes} likes
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                    <path
                                      d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {s.comments} comments
                                </span>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full border border-border/55 bg-secondary/35 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                              >
                                Comment
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
