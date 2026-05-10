import type { ExploreEventTypeOption } from "../pages/explore/exploreFilters"

type ExploreHrefInput = {
  sport?: string
  eventType?: ExploreEventTypeOption | ExploreEventTypeOption[]
}

/** Build `/explore` URLs read by `ExplorePage` (`sport`, `eventType` query params). */
export function exploreHref({ sport, eventType }: ExploreHrefInput): string {
  const p = new URLSearchParams()
  const s = sport?.trim()
  if (s) p.set("sport", s)
  if (eventType !== undefined) {
    const list = (Array.isArray(eventType) ? eventType : [eventType]).filter(Boolean)
    if (list.length) p.set("eventType", list.join(","))
  }
  const qs = p.toString()
  return qs ? `/explore?${qs}` : "/explore"
}
