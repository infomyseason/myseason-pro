import type { MockRaceDetail } from "./mockRaces"
import { computeDaysUntilRace } from "./mockRaces"

type RaceSubmissionStatus = "pending" | "approved" | "rejected"
type RaceSubmissionType = "official_race" | "community_race" | "community_event"

type RaceSubmission = {
  id: string
  status: RaceSubmissionStatus
  type: RaceSubmissionType
  title: string
  sport: string
  country: string
  countryCode?: string
  city: string
  venueLine?: string
  date: string
  distances?: string
  description?: string
  imageUrl?: string
  organizer?: string
  estimatedParticipants?: number
  entryFee?: string
  websiteUrl?: string
  routeUrl?: string
}

const STORAGE_KEY = "myseason_race_submissions_v1"

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}

function readNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim()) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function coerceSubmission(row: unknown): RaceSubmission | null {
  if (typeof row !== "object" || row === null) return null
  const r = row as Record<string, unknown>
  const id = readString(r.id)
  const status = readString(r.status) as RaceSubmissionStatus | undefined
  const type = readString(r.type) as RaceSubmissionType | undefined
  const title = readString(r.title)
  const sport = readString(r.sport)
  const country = readString(r.country)
  const city = readString(r.city)
  const date = readString(r.date)
  if (!id || !status || !type || !title || !sport || !country || !city || !date) return null
  return {
    id,
    status,
    type,
    title,
    sport,
    country,
    countryCode: readString(r.countryCode),
    city,
    venueLine: readString(r.venueLine),
    date,
    distances: readString(r.distances),
    description: readString(r.description),
    imageUrl: readString(r.imageUrl),
    organizer: readString(r.organizer),
    estimatedParticipants: readNumber(r.estimatedParticipants),
    entryFee: readString(r.entryFee),
    websiteUrl: readString(r.websiteUrl),
    routeUrl: readString(r.routeUrl),
  }
}

function loadSubmissions(): RaceSubmission[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  const arr = safeParseArray(raw)
  const out: RaceSubmission[] = []
  for (const row of arr) {
    const s = coerceSubmission(row)
    if (s) out.push(s)
  }
  return out
}

export function loadApprovedSubmittedRaces(): MockRaceDetail[] {
  const subs = loadSubmissions()
  return subs
    .filter((s) => s.status === "approved" && (s.type === "official_race" || s.type === "community_race"))
    .map((s) => submissionToMockRaceDetail(s))
}

export function getSubmittedRaceDetailById(raceId: string): MockRaceDetail | undefined {
  const subs = loadSubmissions()
  const hit = subs.find((s) => s.id === raceId)
  if (!hit) return undefined
  if (hit.type === "community_event") return undefined
  // allow viewing pending/rejected via direct link (still not listed in Explore unless approved)
  return submissionToMockRaceDetail(hit)
}

export function loadApprovedCommunityEvents(): Array<{
  id: string
  title: string
  sport: string
  city: string
  country: string
  countryCode: string
  date: string
  organizer: string
  participants: number
}> {
  const subs = loadSubmissions()
  return subs
    .filter((s) => s.status === "approved" && s.type === "community_event")
    .map((s) => ({
      id: s.id,
      title: s.title,
      sport: s.sport,
      city: s.city,
      country: s.country,
      countryCode: s.countryCode ?? "",
      date: s.date,
      organizer: s.organizer ?? "Community",
      participants: s.estimatedParticipants ?? 0,
    }))
}

function submissionToMockRaceDetail(s: RaceSubmission): MockRaceDetail {
  const distances = (s.distances ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
  return {
    id: s.id,
    title: s.title,
    sport: s.sport,
    category: s.type === "official_race" ? "Official race" : "Community race",
    country: s.country,
    countryCode: s.countryCode ?? "EU",
    city: s.city,
    ...(s.venueLine?.trim() ? { venueLine: s.venueLine.trim() } : {}),
    date: s.date,
    distances: distances.length ? distances : ["Distance TBD"],
    courseProfile: s.type === "official_race" ? ["Pending verification"] : ["Community"],
    hasRoute: Boolean(s.routeUrl?.trim()),
    ...(s.routeUrl?.trim() ? { routeUrl: s.routeUrl.trim() } : {}),
    image: s.imageUrl?.trim()
      ? s.imageUrl.trim()
      : "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80",
    description: s.description?.trim() ? s.description.trim() : "Submitted by the community.",
    participants: s.estimatedParticipants,
    pricing: s.entryFee?.trim() ? [{ distance: "Entry", priceNote: s.entryFee.trim() }] : [],
    startingPriceLabel: s.entryFee?.trim() ? s.entryFee.trim() : undefined,
    officialWebsite: s.websiteUrl?.trim() ? s.websiteUrl.trim() : "#",
    isOfficial: s.type === "official_race",
  }
}

// exported for potential UI use
export { computeDaysUntilRace }

