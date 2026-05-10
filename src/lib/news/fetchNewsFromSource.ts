import type { NewsSportChannel } from "./newsSportChannel"
import type { SimulatedImportedArticle } from "./newsTypes"

function normalizeHost(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "")
  } catch {
    return "source"
  }
}

/** Tiny deterministic hash for stable mock headlines per URL. */
function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * MVP: simulate RSS/scrape results — returns short summaries only + synthetic article URLs.
 * Replace body later with real RSS/HTML parsers using the same return shape.
 */
export async function fetchNewsFromSource(
  sourceUrl: string,
  options?: {
    sport?: NewsSportChannel
    relatedEventId?: string | null
  },
): Promise<SimulatedImportedArticle[]> {
  const trimmed = sourceUrl.trim()
  if (!trimmed) return []

  await new Promise((r) => setTimeout(r, 280 + (hashString(trimmed) % 120)))

  const host = normalizeHost(trimmed)
  const h = hashString(trimmed)
  const base = trimmed.replace(/\/$/, "")
  const sport = options?.sport ?? "Running"
  const rel = options?.relatedEventId ?? undefined

  const stamp = new Date()
  stamp.setMinutes(stamp.getMinutes() - (h % 180))

  const a: SimulatedImportedArticle = {
    title: `${host.split(".")[0]?.toUpperCase() ?? "Race"} · Registration note (${(h % 90) + 10})`,
    summary:
      "Organisers posted a short update on waves and kit rules — open the source link for the official wording. Not a full article.",
    articleUrl: `${base}/updates/mock-${h % 10000}`,
    publishedAt: new Date(stamp.getTime() - 86400000).toISOString(),
    relatedEventId: rel,
    sport,
  }

  const b: SimulatedImportedArticle = {
    title: `Course / logistics memo — ${host}`,
    summary:
      "Brief operational note (traffic, shuttle, or segment tweak). Summary only — verify details on the organiser page.",
    articleUrl: `${base}/news/mock-bulletin-${(h >> 3) % 9000}`,
    publishedAt: stamp.toISOString(),
    relatedEventId: rel,
    sport,
  }

  return [b, a]
}
