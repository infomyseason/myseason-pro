import type { NewsSportChannel } from "./newsSportChannel"

/** Row shape for `public.news_sources`. */
export type NewsSourceRow = {
  id: string
  source_name: string
  source_url: string
  related_event_id: string | null
  sport: string
  enabled: boolean
  last_checked_at: string | null
  fetch_kind: "mock" | "rss" | "scrape"
  created_at: string
  updated_at: string
}

/** Row shape for `public.imported_news`. */
export type ImportedNewsRow = {
  id: string
  news_source_id: string | null
  title: string
  summary: string
  article_url: string
  dedupe_source_url: string
  dedupe_title_key: string
  published_at: string
  related_event_id: string | null
  sport: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

/** Simulated fetch output — no scraping in MVP. */
export type SimulatedImportedArticle = {
  title: string
  summary: string
  articleUrl: string
  publishedAt: string
  relatedEventId?: string | null
  sport: NewsSportChannel
}
