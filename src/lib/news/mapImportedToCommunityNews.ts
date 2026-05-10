import type { CommunityNewsItem } from "../../pages/community/communityNewsMock"
import type { ImportedNewsRow } from "./newsTypes"
import { sportLabelToNewsChannel } from "./sportChannel"

export function importedNewsRowToFeedItem(row: ImportedNewsRow): CommunityNewsItem {
  return {
    id: `imported:${row.id}`,
    title: row.title,
    summary: row.summary,
    category: "organiser_feed",
    channel: sportLabelToNewsChannel(row.sport),
    publishedAt: row.published_at,
    relatedRaceId: row.related_event_id ?? undefined,
    articleUrl: row.article_url,
  }
}
