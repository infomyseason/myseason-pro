import type { MockRaceDetail } from "../../data"

export const EXPLORE_SPORT_OPTIONS = ["Running", "Triathlon", "Cycling", "HYROX"] as const

export const EXPLORE_DISTANCE_OPTIONS = [
  "5K",
  "10K",
  "Half Marathon",
  "Marathon",
  "Sprint",
  "Olympic",
  "IM 70.3",
  "Ironman",
  "HYROX Individual",
] as const

export type ExploreDistanceOption = (typeof EXPLORE_DISTANCE_OPTIONS)[number]

/** Course chips order matches Explore UI. */
export const EXPLORE_COURSE_OPTIONS = [
  "Road",
  "Trail",
  "Gravel",
  "Mostly flat",
  "Hilly",
  "Mountain",
  "City course",
  "Scenic",
  "Fast course",
] as const

export type ExploreCourseOption = (typeof EXPLORE_COURSE_OPTIONS)[number]

export const EXPLORE_EVENT_TYPE_OPTIONS = ["verified", "community", "world_class", "local"] as const

export type ExploreEventTypeOption = (typeof EXPLORE_EVENT_TYPE_OPTIONS)[number]

/** Normalize sport labels from URL (`running`, `Running`) to canonical UI values. */
export function parseSportQueryParam(raw: string | null): string[] {
  if (!raw?.trim()) return []
  const out: string[] = []
  for (const part of raw.split(",")) {
    const s = part.trim()
    if (!s) continue
    const low = s.toLowerCase()
    const match = EXPLORE_SPORT_OPTIONS.find((opt) => opt.toLowerCase() === low)
    if (match && !out.includes(match)) out.push(match)
  }
  return out
}

export const EXPLORE_EVENT_TYPE_LABELS: Record<ExploreEventTypeOption, string> = {
  verified: "Verified events",
  community: "Community events",
  world_class: "World-class events",
  local: "Local events",
}

/** Parse `eventType` query: labels ("World-class events"), keys (`world_class`), or comma-separated lists. */
export function parseEventTypeQueryParam(raw: string | null): ExploreEventTypeOption[] {
  if (!raw?.trim()) return []
  const out: ExploreEventTypeOption[] = []
  for (const part of raw.split(",")) {
    const p = part.trim()
    if (!p) continue
    const pNorm = p.toLowerCase().replace(/-/g, " ").replace(/_/g, " ").replace(/\s+/g, " ").trim()
    let hit: ExploreEventTypeOption | undefined
    for (const opt of EXPLORE_EVENT_TYPE_OPTIONS) {
      if (opt === p || opt.toLowerCase() === p.toLowerCase()) {
        hit = opt
        break
      }
      const labelLow = EXPLORE_EVENT_TYPE_LABELS[opt].toLowerCase()
      if (labelLow === p.toLowerCase()) {
        hit = opt
        break
      }
      const keyWords = opt.replace(/_/g, " ").toLowerCase()
      if (keyWords === pNorm) {
        hit = opt
        break
      }
    }
    if (hit && !out.includes(hit)) out.push(hit)
  }
  return out
}

export type AppliedDateFilter =
  | { kind: "none" }
  | { kind: "exact"; iso: string }
  | { kind: "range"; from: string; to: string }
  | { kind: "month"; yearMonth: string }

export type AppliedExploreFilters = {
  sports: string[]
  date: AppliedDateFilter
  distances: ExploreDistanceOption[]
  countries: string[]
  courseTypes: ExploreCourseOption[]
  eventTypes: ExploreEventTypeOption[]
}

export const EMPTY_APPLIED_FILTERS: AppliedExploreFilters = {
  sports: [],
  date: { kind: "none" },
  distances: [],
  countries: [],
  courseTypes: [],
  eventTypes: [],
}

const COURSE_SYNONYMS: Record<ExploreCourseOption, readonly string[]> = {
  Road: ["road", "asphalt", "paved"],
  Trail: ["trail"],
  Gravel: ["gravel"],
  "Mostly flat": ["mostly flat", "flat", "minimal", "gently rolling", "flat to gently"],
  Hilly: ["hilly", "rolling", "steep"],
  Mountain: ["mountain", "alpine"],
  "City course": ["city course", "urban", "capital-city"],
  Scenic: ["scenic"],
  "Fast course": ["fast course"],
}

function courseHaystack(race: MockRaceDetail): string {
  const parts = [...race.courseProfile]
  if (race.courseRoute) {
    parts.push(race.courseRoute.surface, race.courseRoute.profileSummary, race.courseRoute.layoutType)
  }
  return parts.join(" ").toLowerCase()
}

export function raceMatchesCourseTypes(race: MockRaceDetail, selected: ExploreCourseOption[]): boolean {
  if (selected.length === 0) return true
  const hay = courseHaystack(race)
  return selected.some((opt) => {
    const keys = COURSE_SYNONYMS[opt]
    return keys.some((k) => hay.includes(k))
  })
}

export function raceMatchesDistanceOption(race: MockRaceDetail, opt: ExploreDistanceOption): boolean {
  const blob = [...race.distances, race.category, race.title].join(" | ")
  const low = blob.toLowerCase()

  switch (opt) {
    case "5K":
      return /\b5\s*k\b|\b5km\b|\b5\s*km\b/i.test(blob)
    case "10K":
      return /\b10\s*k\b|\b10km\b|\b10\s*km\b/i.test(blob)
    case "Half Marathon":
      return /half\s*marathon|half\s*maraton|21\.?\s*k\b|pusmaratonis|pusmaraton|21k/i.test(blob)
    case "Marathon":
      return (
        /\bmarathon\b|\bmaraton\b/i.test(blob) &&
        !/half\s*marathon|half\s*maraton|pusmaratonis|pusmaraton/i.test(blob)
      )
    case "Sprint":
      return /\bsprint\b/i.test(low)
    case "Olympic":
      return /\bolympic\b|\bstandard\s*distance\b|\b1\.5\s*km\s*swim\b|\bolimpinė\b/i.test(low)
    case "IM 70.3":
      return /\b70\.3\b|half\s*iron|middle\s*distance/i.test(low)
    case "Ironman":
      return (
        /\bironman\b|\bfull\s*distance\b|3\.8\s*km\s*swim/i.test(low) ||
        (/ironman/i.test(race.category) && !/\b70\.3\b/i.test(low))
      )
    case "HYROX Individual":
      return /\bhyrox\b/i.test(low)
    default:
      return false
  }
}

export function raceMatchesDistances(race: MockRaceDetail, selected: ExploreDistanceOption[]): boolean {
  if (selected.length === 0) return true
  return selected.some((opt) => raceMatchesDistanceOption(race, opt))
}

export function raceMatchesSports(race: MockRaceDetail, sports: string[]): boolean {
  if (sports.length === 0) return true
  const rs = race.sport.trim().toLowerCase()
  const titleLow = race.title.toLowerCase()
  return sports.some((sp) => {
    const t = sp.trim().toLowerCase()
    if (t === "hyrox") return rs.includes("hyrox") || /\bhyrox\b/i.test(titleLow)
    return rs === t
  })
}

export function raceMatchesDate(race: MockRaceDetail, d: AppliedDateFilter): boolean {
  if (d.kind === "none") return true
  const rd = race.date
  if (d.kind === "exact") return rd === d.iso
  if (d.kind === "range") return rd >= d.from && rd <= d.to
  if (d.kind === "month") return rd.slice(0, 7) === d.yearMonth
  return true
}

export function raceMatchesCountries(race: MockRaceDetail, codes: string[]): boolean {
  if (codes.length === 0) return true
  return codes.includes(race.countryCode)
}

export function raceMatchesSearch(race: MockRaceDetail, q: string): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const parts = [
    race.title,
    race.city,
    race.country,
    race.countryCode,
    race.sport,
    race.category,
    ...(race.organizer ? [race.organizer] : []),
    ...race.distances,
    ...race.courseProfile,
  ]
  const blob = parts.join(" ").toLowerCase()
  return blob.includes(s)
}

function isWorldClass(race: MockRaceDetail): boolean {
  const org = race.organizer ?? ""
  if (/ironman/i.test(org)) return true
  if (race.category === "Ironman") return true
  if ((race.participants ?? 0) >= 10000) return true
  return false
}

function isCommunity(race: MockRaceDetail): boolean {
  if (race.detailTone === "charityCommunity") return true
  const blob = `${race.title} ${race.category} ${race.courseProfile.join(" ")}`.toLowerCase()
  if (/charity|awareness|pink run|community/i.test(blob)) return true
  if (/city festival/i.test(race.category.toLowerCase())) return true
  return false
}

function isLocal(race: MockRaceDetail): boolean {
  if (isWorldClass(race)) return false
  const org = (race.organizer ?? "").toLowerCase()
  if (/triatlono|triathlon cup|lietuvos triatlono|kauno maratono|naktinis/i.test(org)) return true
  if (race.countryCode === "LT" && !/ironman/i.test(race.organizer ?? "") && race.category !== "Ironman") return true
  return false
}

function matchesEventType(race: MockRaceDetail, opt: ExploreEventTypeOption): boolean {
  switch (opt) {
    case "verified":
      return race.isOfficial
    case "community":
      return isCommunity(race)
    case "world_class":
      return isWorldClass(race)
    case "local":
      return isLocal(race)
    default:
      return false
  }
}

export function raceMatchesEventTypes(race: MockRaceDetail, selected: ExploreEventTypeOption[]): boolean {
  if (selected.length === 0) return true
  return selected.some((opt) => matchesEventType(race, opt))
}

/** ISO `YYYY-MM-DD`: ascending = soonest upcoming first (mixed sports share one timeline). */
export function compareRaceDatesAscending(aIso: string, bIso: string): number {
  return aIso.localeCompare(bIso)
}

export function filterExploreRaces(
  races: MockRaceDetail[],
  applied: AppliedExploreFilters,
  search: string,
): MockRaceDetail[] {
  const filtered = races.filter(
    (race) =>
      raceMatchesSearch(race, search) &&
      raceMatchesSports(race, applied.sports) &&
      raceMatchesDate(race, applied.date) &&
      raceMatchesDistances(race, applied.distances) &&
      raceMatchesCountries(race, applied.countries) &&
      raceMatchesCourseTypes(race, applied.courseTypes) &&
      raceMatchesEventTypes(race, applied.eventTypes),
  )
  return filtered.slice().sort((a, b) => compareRaceDatesAscending(a.date, b.date))
}

export function formatRaceDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

export function formatAppliedDateChip(d: AppliedDateFilter): string | null {
  if (d.kind === "none") return null
  if (d.kind === "exact") return formatRaceDateLabel(d.iso)
  if (d.kind === "range") return `${formatRaceDateLabel(d.from)} → ${formatRaceDateLabel(d.to)}`
  if (d.kind === "month") {
    const [y, m] = d.yearMonth.split("-").map(Number)
    const label = new Date(y, (m ?? 1) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })
    return label
  }
  return null
}
