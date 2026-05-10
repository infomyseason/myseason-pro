import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  getRaceDetailByIdIncludingPast,
  loadApprovedCommunityEvents,
  MOCK_RACE_DETAILS,
} from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { formatRaceDateLabel } from "../explore/exploreFilters"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"
import { MOCK_COMMUNITY_CLUBS as MOCK_CLUBS, type CommunityClub } from "./communityClubsData"
import { loadApprovedImportedNewsFeed } from "../../lib/news/importedNewsSupabase"
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_LABEL,
  formatCommunityNewsTime,
  MOCK_COMMUNITY_NEWS,
  NEWS_CHANNEL_STYLE,
  type CommunityNewsItem,
  type NewsSportChannel,
} from "./communityNewsMock"

type TabId = "events" | "clubs" | "news" | "stories"

type NewsFeedFilter = "all" | NewsSportChannel

const NEWS_FEED_FILTERS: { id: NewsFeedFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Running", label: "Running" },
  { id: "Triathlon", label: "Triathlon" },
  { id: "Cycling", label: "Cycling" },
  { id: "HYROX", label: "HYROX" },
  { id: "Community", label: "Community" },
]

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
  /** Optional hero for cards; falls back to sport stock image. */
  imageUrl?: string
}

type Club = CommunityClub

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

type RaceStoryComment = {
  id: string
  authorName: string
  body: string
  timeLabel: string
}

type LocationScope = "near" | "city" | "country" | "europe" | "all"

const TABS: { id: TabId; label: string; blurb: string }[] = [
  { id: "events", label: "Community events", blurb: "Group runs, training sessions, social events & recovery." },
  { id: "clubs", label: "Clubs", blurb: "Find local crews and training partners across Europe." },
  {
    id: "news",
    label: "News",
    blurb: "Registration drops, course notes, and headline updates — without leaving your training flow.",
  },
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
    imageUrl:
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "evt-02",
    title: "Track Tuesday · 10×400m (all levels)",
    sport: "Running",
    city: "Kaunas",
    country: "Lithuania",
    countryCode: "LT",
    date: "2026-05-12",
    organizer: "Temple Social Club",
    participants: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-feec71571dbf?w=1200&auto=format&fit=crop&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&auto=format&fit=crop&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1569880155583-63e8da511499?w=1200&auto=format&fit=crop&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
  },
]

const COMMUNITY_EVENT_COVER_FALLBACK: Record<CommunityEvent["sport"], string> = {
  Running:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80",
  Cycling:
    "https://images.unsplash.com/photo-1541625602330-2277d4c61895?w=1200&auto=format&fit=crop&q=80",
  Triathlon:
    "https://images.unsplash.com/photo-1596730749249-da817dcd782d?w=1200&auto=format&fit=crop&q=80",
  HYROX:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=80",
  Recovery:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=80",
}

function communityEventCoverUrl(ev: { sport: string; imageUrl?: string }): string {
  const trimmed = ev.imageUrl?.trim()
  if (trimmed) return trimmed
  const sp = ev.sport.trim().toLowerCase()
  if (sp.includes("cycl")) return COMMUNITY_EVENT_COVER_FALLBACK.Cycling
  if (sp.includes("triathlon")) return COMMUNITY_EVENT_COVER_FALLBACK.Triathlon
  if (sp.includes("hyrox")) return COMMUNITY_EVENT_COVER_FALLBACK.HYROX
  if (sp.includes("recover")) return COMMUNITY_EVENT_COVER_FALLBACK.Recovery
  return COMMUNITY_EVENT_COVER_FALLBACK.Running
}

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
    comments: 3,
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
    comments: 2,
  },
]

/** Seed thread shown when “N comments” is opened (mock data). */
const INITIAL_STORY_COMMENTS: Record<string, RaceStoryComment[]> = {
  "story-01": [
    {
      id: "story-01-c1",
      authorName: "Jonas P.",
      body: "Huge PB — congrats! Old Town finish must have felt electric.",
      timeLabel: "2d ago",
    },
    {
      id: "story-01-c2",
      authorName: "Laura V.",
      body: "Those crowds carry you — amazing execution.",
      timeLabel: "2d ago",
    },
    {
      id: "story-01-c3",
      authorName: "Noah T.",
      body: "What was your nutrition plan on course?",
      timeLabel: "1d ago",
    },
  ],
  "story-02": [
    {
      id: "story-02-c1",
      authorName: "Petras K.",
      body: "Temple atmosphere is unbeatable — smart tempo day.",
      timeLabel: "3d ago",
    },
    {
      id: "story-02-c2",
      authorName: "Ieva S.",
      body: "Love this — community races make the best workouts.",
      timeLabel: "2d ago",
    },
  ],
}

function StoryHeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className} aria-hidden="true">
      {filled ? (
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

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

function clubCityLines(c: Club): string[] {
  return c.cities?.length ? c.cities : [c.city]
}

function clubInUserCity(c: Club): boolean {
  const lines = clubCityLines(c)
  return lines.some((city) => inUserCity(city, c.country))
}

function clubLocationScore(c: Club, selected?: { city?: string; country?: string }): number {
  const lines = clubCityLines(c)
  return Math.min(...lines.map((city) => locationScore(city, c.country, selected)))
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

/** RaceCard-style image shell: photo fills the card with gradients; content overlays bottom/top. */
const COMMUNITY_RACE_CARD_SHELL =
  "group relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-500 hover:border-primary/35 hover:shadow-[0_22px_56px_rgba(0,0,0,0.38)] sm:min-h-[320px] md:min-h-[340px]"

function CommunityRaceOverlayCard({
  imageUrl,
  accentHex,
  accentLabel,
  topRight,
  footer,
}: {
  imageUrl: string
  accentHex: string
  accentLabel: string
  topRight: ReactNode
  footer: ReactNode
}) {
  return (
    <div className={COMMUNITY_RACE_CARD_SHELL}>
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050917] via-[#070b16]/95 to-[#0f1a2e]/35" />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(to bottom right, ${accentHex}66, transparent)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,transparent_30%,rgba(2,4,8,0.65)_100%)]" />
      </div>
      <div
        className="absolute left-0 right-0 top-0 z-10 h-1 opacity-90"
        style={{ backgroundColor: accentHex }}
      />
      <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-2 sm:left-4 sm:right-4 sm:top-4">
        <span
          className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md sm:text-xs"
          style={{ backgroundColor: accentHex }}
        >
          {accentLabel}
        </span>
        {topRight}
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2.5 p-4 pb-5 sm:gap-3 sm:p-5">{footer}</div>
    </div>
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
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabId>("events")
  const [locationScope, setLocationScope] = useState<LocationScope>("near")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ city?: string; country?: string; countryCode?: string } | null>(null)
  const [newsFeedFilter, setNewsFeedFilter] = useState<NewsFeedFilter>("all")
  const [approvedImportedNews, setApprovedImportedNews] = useState<CommunityNewsItem[]>([])

  useEffect(() => {
    const tab = (location.state as { tab?: TabId } | null)?.tab
    if (tab === "events" || tab === "clubs" || tab === "news" || tab === "stories") setActiveTab(tab)
  }, [location.state])

  useEffect(() => {
    if (activeTab !== "news") return
    let cancelled = false
    loadApprovedImportedNewsFeed().then((items) => {
      if (!cancelled) setApprovedImportedNews(items)
    })
    return () => {
      cancelled = true
    }
  }, [activeTab])

  const raceById = useMemo(() => new Map(MOCK_RACE_DETAILS.map((r) => [r.id, r])), [])

  const visibleRaceStories = useMemo(
    () => MOCK_RACE_STORIES.filter((s) => raceById.has(s.raceId)),
    [raceById],
  )

  const [storyCommentsByStoryId, setStoryCommentsByStoryId] = useState<Record<string, RaceStoryComment[]>>(() => ({
    ...INITIAL_STORY_COMMENTS,
  }))
  const [storyEngagement, setStoryEngagement] = useState<
    Record<string, { likeCount: number; likedByMe: boolean; threadOpen: boolean }>
  >(() =>
    Object.fromEntries(
      MOCK_RACE_STORIES.map((st) => [st.id, { likeCount: st.likes, likedByMe: false, threadOpen: false }]),
    ),
  )
  const [storyCommentDraft, setStoryCommentDraft] = useState<Record<string, string>>({})
  const storyCommentTextareaRef = useRef<Record<string, HTMLTextAreaElement | null>>({})

  function getStoryEng(storyId: string, fallbackLikes: number) {
    return (
      storyEngagement[storyId] ?? {
        likeCount: fallbackLikes,
        likedByMe: false,
        threadOpen: false,
      }
    )
  }

  function toggleStoryLike(storyId: string, fallbackLikes: number) {
    setStoryEngagement((prev) => {
      const cur = prev[storyId] ?? { likeCount: fallbackLikes, likedByMe: false, threadOpen: false }
      const nextLiked = !cur.likedByMe
      const likeCount = Math.max(0, cur.likeCount + (nextLiked ? 1 : -1))
      return { ...prev, [storyId]: { ...cur, likedByMe: nextLiked, likeCount } }
    })
  }

  function toggleStoryCommentsPanel(storyId: string, fallbackLikes: number) {
    setStoryEngagement((prev) => {
      const cur = prev[storyId] ?? { likeCount: fallbackLikes, likedByMe: false, threadOpen: false }
      return { ...prev, [storyId]: { ...cur, threadOpen: !cur.threadOpen } }
    })
  }

  function openStoryThreadAndFocusComposer(storyId: string, fallbackLikes: number) {
    setStoryEngagement((prev) => {
      const cur = prev[storyId] ?? { likeCount: fallbackLikes, likedByMe: false, threadOpen: false }
      return { ...prev, [storyId]: { ...cur, threadOpen: true } }
    })
    requestAnimationFrame(() => storyCommentTextareaRef.current[storyId]?.focus())
  }

  function postStoryComment(storyId: string) {
    const text = storyCommentDraft[storyId]?.trim()
    if (!text) return
    const row: RaceStoryComment = {
      id: `${storyId}-you-${Date.now()}`,
      authorName: "You",
      body: text,
      timeLabel: "Just now",
    }
    setStoryCommentsByStoryId((prev) => ({
      ...prev,
      [storyId]: [...(prev[storyId] ?? []), row],
    }))
    setStoryCommentDraft((prev) => ({ ...prev, [storyId]: "" }))
  }

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
    for (const c of MOCK_CLUBS) {
      const cities = clubCityLines(c)
      for (const city of cities) push(city, c.country, c.countryCode)
    }
    out.sort((a, b) => locationScore(a.city, a.country, selectedLocation ?? undefined) - locationScore(b.city, b.country, selectedLocation ?? undefined))
    return out
  }, [selectedLocation])

  const dynamicEvents = useMemo(() => {
    const submitted = loadApprovedCommunityEvents().map((e) => ({
      ...e,
      sport: e.sport as CommunityEvent["sport"],
      imageUrl: e.imageUrl,
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
      const s = clubLocationScore(a, selectedLocation ?? undefined) - clubLocationScore(b, selectedLocation ?? undefined)
      if (s !== 0) return s
      return b.membersCount - a.membersCount
    })
    const scoped = base.filter((c) => {
      if (locationScope === "all") return true
      if (locationScope === "europe") return true
      if (locationScope === "country") return inUserCountry(c.country)
      if (locationScope === "city") return clubInUserCity(c)
      return true
    })
    return scoped
  }, [locationScope, selectedLocation])

  const hasCityEvents = useMemo(
    () => sortedEvents.some((e) => inUserCity(e.city, e.country)),
    [sortedEvents],
  )

  const hasCityClubs = useMemo(() => sortedClubs.some((c) => clubInUserCity(c)), [sortedClubs])

  const filteredCommunityNews = useMemo(() => {
    const merged = [...approvedImportedNews, ...MOCK_COMMUNITY_NEWS]
    const base =
      newsFeedFilter === "all" ? merged : merged.filter((n) => n.channel === newsFeedFilter)
    return [...base].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  }, [newsFeedFilter, approvedImportedNews])

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
                ) : activeTab === "news" ? (
                  <PrimaryButton onClick={() => {}}>Suggest update</PrimaryButton>
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
                      const coverSrc = communityEventCoverUrl(ev)
                      return (
                        <CommunityRaceOverlayCard
                          key={ev.id}
                          imageUrl={coverSrc}
                          accentHex={accent.hex}
                          accentLabel={accent.label}
                          topRight={
                            <span className="rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] font-bold tabular-nums text-white backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[11px]">
                              {ev.participants} joining
                            </span>
                          }
                          footer={
                            <>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="max-w-full truncate rounded-md border border-white/22 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                                  {ev.organizer}
                                </span>
                              </div>
                              <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight text-white transition-colors group-hover:text-primary sm:text-xl">
                                {ev.title}
                              </h3>
                              <div className="flex min-w-0 items-center gap-2 text-white/80">
                                <span className="shrink-0 text-lg leading-none">
                                  {EUROPE_FLAG_BY_CODE[ev.countryCode] ?? "🏁"}
                                </span>
                                <span className="truncate text-sm font-medium leading-snug">
                                  {ev.city}, {ev.country}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-white/90">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  className="size-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="text-sm font-semibold leading-snug">
                                  {formatRaceDateLabel(ev.date)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-black/50"
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
                                  className="inline-flex items-center justify-center rounded-full border border-primary/50 bg-primary/25 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md transition hover:bg-primary/35"
                                >
                                  Join
                                </button>
                              </div>
                            </>
                          }
                        />
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
                      const locationLine = c.cities?.length
                        ? `${c.cities.join(" · ")} · ${c.country}`
                        : `${c.city}, ${c.country}`
                      return (
                        <CommunityRaceOverlayCard
                          key={c.id}
                          imageUrl={c.coverImageUrl}
                          accentHex={accent.hex}
                          accentLabel={accent.label}
                          topRight={
                            <span className="rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] font-bold tabular-nums text-white backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[11px]">
                              {c.membersCount} members
                            </span>
                          }
                          footer={
                            <>
                              <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight text-white transition-colors group-hover:text-primary sm:text-xl">
                                {c.name}
                              </h3>
                              <div className="flex min-w-0 items-center gap-2 text-white/80">
                                <span className="shrink-0 text-lg leading-none">
                                  {EUROPE_FLAG_BY_CODE[c.countryCode] ?? "🏁"}
                                </span>
                                <span className="truncate text-sm font-medium leading-snug">{locationLine}</span>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-white/72">{c.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {c.instagramUrl ? (
                                  <a
                                    href={c.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/55"
                                  >
                                    <ExternalIcon name="instagram" />
                                    Instagram
                                  </a>
                                ) : null}
                                {c.websiteUrl ? (
                                  <a
                                    href={c.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/55"
                                  >
                                    <ExternalIcon name="website" />
                                    Website
                                  </a>
                                ) : null}
                              </div>
                              <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                                <span className="text-[11px] text-white/55">Local club · mock data</span>
                                <Link
                                  to={`/community/club-details/${c.id}`}
                                  className="inline-flex items-center justify-center rounded-full border border-primary/50 bg-primary/25 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md transition hover:bg-primary/35"
                                >
                                  View club
                                </Link>
                              </div>
                            </>
                          }
                        />
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {/* News */}
              {activeTab === "news" ? (
                <section
                  role="tabpanel"
                  id="community-tabpanel-news"
                  aria-labelledby="community-tab-news"
                  className="outline-none"
                >
                  <p className="mb-6 text-sm text-muted-foreground">{TABS.find((t) => t.id === "news")?.blurb}</p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {NEWS_FEED_FILTERS.map((f) => (
                      <ScopeChip key={f.id} active={newsFeedFilter === f.id} onClick={() => setNewsFeedFilter(f.id)}>
                        {f.label}
                      </ScopeChip>
                    ))}
                  </div>

                  <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {filteredCommunityNews.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">
                        Nothing in this channel yet — try another filter.
                      </p>
                    ) : null}
                    {filteredCommunityNews.map((item) => {
                      const ch = NEWS_CHANNEL_STYLE[item.channel]
                      const relatedRace = item.relatedRaceId
                        ? getRaceDetailByIdIncludingPast(item.relatedRaceId)
                        : undefined
                      const catClass = CATEGORY_BADGE_CLASS[item.category]
                      return (
                        <article
                          key={item.id}
                          className="flex gap-3 rounded-xl border border-border/40 bg-background/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:border-primary/22 hover:bg-background/45 sm:gap-3.5 sm:p-3.5"
                        >
                          {item.imageUrl ? (
                            <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-border/35 bg-secondary/30 sm:size-[4.75rem]">
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div
                              className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-lg border border-border/35 bg-secondary/25 sm:size-[4.75rem]"
                              aria-hidden="true"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="22"
                                height="22"
                                fill="none"
                                className="text-muted-foreground/45"
                              >
                                <path
                                  d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
                              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex max-w-full truncate rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${catClass}`}
                                >
                                  {CATEGORY_LABEL[item.category]}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ch.bg} ${ch.border} ${ch.text}`}
                                >
                                  <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: ch.hex }} />
                                  {item.channel}
                                </span>
                              </div>
                              <time
                                className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground"
                                dateTime={item.publishedAt}
                              >
                                {formatCommunityNewsTime(item.publishedAt)}
                              </time>
                            </div>
                            <h3 className="mt-2 text-[0.9375rem] font-black leading-snug tracking-tight text-foreground sm:text-base">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                              {item.summary}
                            </p>
                            {item.articleUrl || item.relatedRaceId ? (
                              <div className="mt-2.5 flex flex-col gap-2">
                                {item.articleUrl ? (
                                  <a
                                    href={item.articleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex max-w-full items-center gap-1 text-xs font-semibold text-sky-300 underline decoration-sky-400/35 underline-offset-4 transition hover:text-sky-200 hover:decoration-sky-300/60"
                                  >
                                    Official source
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="14"
                                      height="14"
                                      fill="none"
                                      className="shrink-0 opacity-90"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M7 17 17 7m0 0v10m0-10H7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </a>
                                ) : null}
                                {item.relatedRaceId ? (
                                  relatedRace ? (
                                    <Link
                                      to={`/race/${relatedRace.id}`}
                                      className="inline-flex max-w-full items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary/85"
                                    >
                                      <span className="shrink-0 text-muted-foreground">Related event</span>
                                      <span className="min-w-0 truncate">{relatedRace.title}</span>
                                      <svg
                                        viewBox="0 0 24 24"
                                        width="14"
                                        height="14"
                                        fill="none"
                                        className="shrink-0 opacity-80"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="m9 18 6-6-6-6"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </Link>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">Related event unavailable.</p>
                                  )
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </article>
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
                    {visibleRaceStories.length === 0 ? (
                      <p className="col-span-full text-sm text-muted-foreground">
                        Stories will appear here for upcoming races on the calendar.
                      </p>
                    ) : null}
                    {visibleRaceStories.map((s) => {
                      const accent = SPORT_ACCENTS[s.sport]
                      const race = raceById.get(s.raceId)
                      const eng = getStoryEng(s.id, s.likes)
                      const commentsForStory = storyCommentsByStoryId[s.id] ?? []
                      const commentCount = commentsForStory.length
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

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <button
                                  type="button"
                                  className={`inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 text-xs font-semibold transition hover:bg-secondary/50 ${
                                    eng.likedByMe ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
                                  }`}
                                  aria-label={eng.likedByMe ? "Unlike this story" : "Like this story"}
                                  aria-pressed={eng.likedByMe}
                                  onClick={() => toggleStoryLike(s.id, s.likes)}
                                >
                                  <StoryHeartIcon
                                    filled={eng.likedByMe}
                                    className={eng.likedByMe ? "text-rose-500" : "text-current"}
                                  />
                                  <span className="tabular-nums">{eng.likeCount} likes</span>
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-secondary/50 hover:text-foreground"
                                  aria-expanded={eng.threadOpen}
                                  aria-controls={`story-thread-${s.id}`}
                                  id={`story-comments-trigger-${s.id}`}
                                  onClick={() => toggleStoryCommentsPanel(s.id, s.likes)}
                                >
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                    <path
                                      d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span className="tabular-nums">{commentCount} comments</span>
                                </button>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full border border-border/55 bg-secondary/35 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                                aria-expanded={eng.threadOpen}
                                aria-controls={`story-thread-${s.id}`}
                                onClick={() => openStoryThreadAndFocusComposer(s.id, s.likes)}
                              >
                                Comment
                              </button>
                            </div>

                            {eng.threadOpen ? (
                              <div
                                id={`story-thread-${s.id}`}
                                role="region"
                                aria-labelledby={`story-comments-trigger-${s.id}`}
                                className="mt-4 space-y-3 rounded-xl border border-border/45 bg-secondary/20 p-4"
                              >
                                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                                  Comments
                                </p>
                                <ul className="max-h-52 space-y-3 overflow-y-auto overscroll-contain pr-1">
                                  {commentsForStory.map((c) => (
                                    <li
                                      key={c.id}
                                      className="border-b border-border/35 pb-3 last:border-0 last:pb-0"
                                    >
                                      <p className="text-sm">
                                        <span className="font-bold text-foreground">{c.authorName}</span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                          {" "}
                                          · {c.timeLabel}
                                        </span>
                                      </p>
                                      <p className="mt-1 text-sm leading-snug text-foreground/95">{c.body}</p>
                                    </li>
                                  ))}
                                </ul>
                                <div className="border-t border-border/40 pt-3">
                                  <label htmlFor={`story-comment-${s.id}`} className="sr-only">
                                    Write a comment on this story
                                  </label>
                                  <textarea
                                    id={`story-comment-${s.id}`}
                                    ref={(el) => {
                                      storyCommentTextareaRef.current[s.id] = el
                                    }}
                                    rows={2}
                                    placeholder="Write a comment…"
                                    value={storyCommentDraft[s.id] ?? ""}
                                    onChange={(e) =>
                                      setStoryCommentDraft((prev) => ({ ...prev, [s.id]: e.target.value }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        postStoryComment(s.id)
                                      }
                                    }}
                                    className="w-full resize-none rounded-xl border border-border/55 bg-background/60 px-3 py-2 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/55 focus:border-primary/40 focus:ring-2"
                                  />
                                  <div className="mt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => postStoryComment(s.id)}
                                      className="inline-flex items-center justify-center rounded-full border border-primary/35 bg-primary/12 px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                                    >
                                      Post
                                    </button>
                                  </div>
                                  <p className="mt-2 text-[11px] text-muted-foreground">
                                    Press Enter to post · Shift+Enter for a new line
                                  </p>
                                </div>
                              </div>
                            ) : null}
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
