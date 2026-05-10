import type { NewsSportChannel } from "../../lib/news/newsSportChannel"

export type { NewsSportChannel }

/** Lightweight feed categories — not a CMS taxonomy. */
export type CommunityNewsCategory =
  | "registration_open"
  | "sold_out"
  | "course_update"
  | "new_race"
  | "community_highlight"
  | "expo_info"
  | "elite_news"
  | "weather_alert"
  | "event_change"
  | "merch_reveal"
  /** Imported digest — short summary + external link only (see articleUrl). */
  | "organiser_feed"

export type CommunityNewsItem = {
  id: string
  title: string
  summary: string
  category: CommunityNewsCategory
  /** Used with hub filters (Running / Triathlon / … / Community). */
  channel: NewsSportChannel
  /** ISO 8601 local-friendly strings for mock feed ordering & relative labels. */
  publishedAt: string
  imageUrl?: string
  /** When set, links to `/race/:id` if the race exists in catalogue. */
  relatedRaceId?: string
  /** Original organiser article — never mirror full text in-app. */
  articleUrl?: string
}

export const CATEGORY_LABEL: Record<CommunityNewsCategory, string> = {
  registration_open: "Registration open",
  sold_out: "Sold out",
  course_update: "Course update",
  new_race: "New race",
  community_highlight: "Community",
  expo_info: "Expo",
  elite_news: "Elite",
  weather_alert: "Weather",
  event_change: "Event change",
  merch_reveal: "Medal & tee",
  organiser_feed: "Official source",
}

/** Badge accents tuned for dark UI — compact feed. */
export const CATEGORY_BADGE_CLASS: Record<CommunityNewsCategory, string> = {
  registration_open: "border-emerald-400/35 bg-emerald-500/[0.12] text-emerald-200/95",
  sold_out: "border-red-400/35 bg-red-950/30 text-red-200/95",
  course_update: "border-sky-400/30 bg-sky-500/[0.12] text-sky-100",
  new_race: "border-violet-400/30 bg-violet-500/[0.14] text-violet-100",
  community_highlight: "border-primary/35 bg-primary/[0.12] text-primary",
  expo_info: "border-amber-400/35 bg-amber-500/[0.12] text-amber-100",
  elite_news: "border-fuchsia-400/30 bg-fuchsia-600/[0.14] text-fuchsia-100",
  weather_alert: "border-cyan-400/35 bg-cyan-600/[0.14] text-cyan-100",
  event_change: "border-orange-400/35 bg-orange-600/[0.14] text-orange-100",
  merch_reveal: "border-pink-400/35 bg-pink-600/[0.14] text-pink-100",
  organiser_feed: "border-slate-400/35 bg-slate-500/[0.14] text-slate-100",
}

export const NEWS_CHANNEL_STYLE: Record<
  NewsSportChannel,
  { hex: string; bg: string; border: string; text: string }
> = {
  Running: {
    hex: "#22c55e",
    bg: "bg-[#22c55e]/12",
    border: "border-[#22c55e]/28",
    text: "text-[#22c55e]",
  },
  Triathlon: {
    hex: "#a855f7",
    bg: "bg-[#a855f7]/12",
    border: "border-[#a855f7]/28",
    text: "text-[#a855f7]",
  },
  Cycling: {
    hex: "#3b82f6",
    bg: "bg-[#3b82f6]/12",
    border: "border-[#3b82f6]/28",
    text: "text-[#3b82f6]",
  },
  HYROX: {
    hex: "#f97316",
    bg: "bg-[#f97316]/12",
    border: "border-[#f97316]/28",
    text: "text-[#f97316]",
  },
  Community: {
    hex: "#e8c896",
    bg: "bg-primary/12",
    border: "border-primary/30",
    text: "text-primary",
  },
}

export const MOCK_COMMUNITY_NEWS: CommunityNewsItem[] = [
  {
    id: "nw-01",
    title: "Swedbank Vilnius Marathon opens priority waves",
    summary: "Early slots release today — rolling tiers through Sunday. Half & relay bundles updated.",
    category: "registration_open",
    channel: "Running",
    publishedAt: "2026-05-09T07:15:00",
    relatedRaceId: "swedbank-vilnius-marathon-2026",
    imageUrl:
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "nw-02",
    title: "IRONMAN Hamburg European Championship — general entries closed",
    summary: "Allocation exhausted for age-group slots. Waitlist opens Monday 18:00 CET.",
    category: "sold_out",
    channel: "Triathlon",
    publishedAt: "2026-05-09T05:40:00",
    relatedRaceId: "im-hamburg-european-championship",
  },
  {
    id: "nw-03",
    title: "Noord-Holland fondo: revised sectors after dyke maintenance",
    summary: "Km 42–58 rerouted inland — neutral rollout extended by 4 km before first timed segment.",
    category: "course_update",
    channel: "Cycling",
    publishedAt: "2026-05-08T18:20:00",
    relatedRaceId: "gran-fondo-noord-holland-2026",
    imageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277d4c61895?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "nw-04",
    title: "HYROX Berlin — expo floor map & bag policy",
    summary: "Hall 9 layout published; rolling luggage restricted — plan athlete village drop-off.",
    category: "expo_info",
    channel: "HYROX",
    publishedAt: "2026-05-08T14:05:00",
    relatedRaceId: "hyrox-berlin-may-2026",
  },
  {
    id: "nw-05",
    title: "Temple Social Club crosses 400 members",
    summary: "Kaunas · Vilnius · Klaipėda hubs — mid-week intervals calendar refreshed.",
    category: "community_highlight",
    channel: "Community",
    publishedAt: "2026-05-08T09:30:00",
    imageUrl:
      "https://templesocial.club/wp-content/uploads/2026/04/Temple-homepage-dekstop.jpg",
  },
  {
    id: "nw-06",
    title: "Rimi Riga Marathon weekend — wind shift advisory",
    summary: "Sunday marathon forecast gusts 35 km/h from NW — elite briefing adjusts pacing charts.",
    category: "weather_alert",
    channel: "Running",
    publishedAt: "2026-05-07T21:00:00",
    relatedRaceId: "rimi-riga-marathon-2026",
  },
  {
    id: "nw-07",
    title: "Pro debut stacked for IRONMAN Calella-Barcelona",
    summary: "Two continental champions confirmed on start list — swim waves reorganised by bib.",
    category: "elite_news",
    channel: "Triathlon",
    publishedAt: "2026-05-07T16:45:00",
    relatedRaceId: "im-calella-barcelona",
    imageUrl:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "nw-08",
    title: "PINK RUN Kaunas reveals finisher medal",
    summary: "Matte ribbon + reflective accents — youth distances ship alternate ribbon colours.",
    category: "merch_reveal",
    channel: "Running",
    publishedAt: "2026-05-06T12:10:00",
    relatedRaceId: "pink-run-su-anteja-2026",
  },
  {
    id: "nw-09",
    title: "Mallorca 312 adds satellite 120 km gran fondo",
    summary: "Ballot opens Thursday — capped field mirrors expo village accreditation.",
    category: "new_race",
    channel: "Cycling",
    publishedAt: "2026-05-05T08:00:00",
    relatedRaceId: "mallorca-312-sportive-2026",
  },
  {
    id: "nw-10",
    title: "HYROX Helsinki wave schedule tweak",
    summary: "Doubles heats consolidated — revised athlete briefing drops tonight.",
    category: "event_change",
    channel: "HYROX",
    publishedAt: "2026-05-04T19:30:00",
    relatedRaceId: "hyrox-helsinki-2026",
  },
  {
    id: "nw-11",
    title: "Trakai Triathlon — bike penalty zones redrawn",
    summary: "Draft marshals publish GPS overlays — download before rack check.",
    category: "course_update",
    channel: "Triathlon",
    publishedAt: "2026-05-03T11:25:00",
    relatedRaceId: "trakai-triatlonas-ltt3-2026",
  },
  {
    id: "nw-12",
    title: "TEMPLE Kauno pusmaratonis volunteer roster opens",
    summary: "Aid stations & Nemunas Island flow roles — shifts capped per neighbourhood.",
    category: "community_highlight",
    channel: "Community",
    publishedAt: "2026-05-02T07:50:00",
    relatedRaceId: "temple-kauno-pusmaratonis-2026",
  },
]

export function formatCommunityNewsTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  let sec = Math.floor((now - then) / 1000)
  if (!Number.isFinite(sec)) return "—"
  if (sec < 0) return "Just now"
  if (sec < 45) return "Just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w}w ago`
  return `${Math.floor(d / 30)}mo ago`
}
