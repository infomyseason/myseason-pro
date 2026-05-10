import { supabase, isSupabaseConfigured } from "../supabase"
import { fetchNewsFromSource } from "./fetchNewsFromSource"
import { normalizeDedupeSourceUrl, normalizeDedupeTitleKey } from "./dedupeKeys"
import type { ImportedNewsRow, NewsSourceRow } from "./newsTypes"
import { sportLabelToNewsChannel } from "./sportChannel"
import type { CommunityNewsItem } from "../../pages/community/communityNewsMock"
import type { NewsSportChannel } from "./newsSportChannel"
import { importedNewsRowToFeedItem } from "./mapImportedToCommunityNews"

export async function loadApprovedImportedNewsFeed(): Promise<CommunityNewsItem[]> {
  if (!isSupabaseConfigured()) return []

  const { data, error } = await supabase
    .from("imported_news")
    .select("*")
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .limit(80)

  if (error || !data?.length) return []
  return (data as ImportedNewsRow[]).map(importedNewsRowToFeedItem)
}

export async function loadNewsSourcesAdmin(): Promise<NewsSourceRow[]> {
  if (!isSupabaseConfigured()) return []

  const { data, error } = await supabase.from("news_sources").select("*").order("source_name")

  if (error || !data) return []
  return data as NewsSourceRow[]
}

export async function loadPendingImportedNewsAdmin(): Promise<ImportedNewsRow[]> {
  if (!isSupabaseConfigured()) return []

  const { data, error } = await supabase
    .from("imported_news")
    .select("*")
    .eq("status", "pending")
    .order("published_at", { ascending: false })

  if (error || !data) return []
  return data as ImportedNewsRow[]
}

export async function insertNewsSourceAdmin(row: {
  source_name: string
  source_url: string
  related_event_id?: string | null
  sport: NewsSportChannel
  enabled?: boolean
  fetch_kind?: NewsSourceRow["fetch_kind"]
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" }

  const { error } = await supabase.from("news_sources").insert({
    source_name: row.source_name.trim(),
    source_url: row.source_url.trim(),
    related_event_id: row.related_event_id?.trim() || null,
    sport: row.sport,
    enabled: row.enabled ?? true,
    fetch_kind: row.fetch_kind ?? "mock",
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function setImportedNewsStatusAdmin(
  id: string,
  status: ImportedNewsRow["status"],
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" }

  const { error } = await supabase.from("imported_news").update({ status, updated_at: new Date().toISOString() }).eq("id", id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/**
 * MVP mock import: simulates fetch, inserts pending rows, skips duplicates (unique constraint).
 */
export async function simulateImportFromSourceAdmin(source: NewsSourceRow): Promise<{ inserted: number; skipped: number; error?: string }> {
  if (!isSupabaseConfigured()) return { inserted: 0, skipped: 0, error: "Supabase not configured" }

  const channel = sportLabelToNewsChannel(source.sport)
  const drafts = await fetchNewsFromSource(source.source_url, {
    sport: channel,
    relatedEventId: source.related_event_id,
  })

  const dedupeBase = normalizeDedupeSourceUrl(source.source_url)
  let inserted = 0
  let skipped = 0

  for (const d of drafts) {
    const dedupeTitleKey = normalizeDedupeTitleKey(d.title)
    const related = d.relatedEventId ?? source.related_event_id ?? null
    const sport = d.sport

    const { error } = await supabase.from("imported_news").insert({
      news_source_id: source.id,
      title: d.title.trim(),
      summary: d.summary.trim(),
      article_url: d.articleUrl.trim(),
      dedupe_source_url: dedupeBase,
      dedupe_title_key: dedupeTitleKey,
      published_at: d.publishedAt,
      related_event_id: related,
      sport,
      status: "pending",
    })

    if (error && (error.code === "23505" || /duplicate key/i.test(error.message ?? ""))) {
      skipped += 1
      continue
    }
    if (error) return { inserted, skipped, error: error.message }
    inserted += 1
  }

  await supabase
    .from("news_sources")
    .update({ last_checked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", source.id)

  return { inserted, skipped }
}

export type { NewsSourceRow, ImportedNewsRow }
