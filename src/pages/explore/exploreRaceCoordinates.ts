import type { MockRaceDetail } from "../../data"

/** Approximate city / venue coordinates for mock events (Europe). */
const RACE_BASE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "swedbank-vilnius-marathon-2026": { lat: 54.6872, lng: 25.2797 },
  "temple-kauno-pusmaratonis-2026": { lat: 54.8985, lng: 23.9036 },
  "pink-run-su-anteja-2026": { lat: 54.9042, lng: 23.8917 },
  "rimi-riga-marathon-2026": { lat: 56.9496, lng: 24.1052 },
  "lt-sprint-pool-championship-panevezys-2026": { lat: 55.7348, lng: 24.3578 },
  "ltt-kaisiadoriu-triatlonas-2026": { lat: 54.8639, lng: 24.4478 },
  "ltt-veisieju-triatlonas-2026": { lat: 54.1011, lng: 23.6964 },
  "trakai-triatlonas-ltt3-2026": { lat: 54.6379, lng: 24.9348 },
  "vilnius-naktinis-moteru-triatlonas-2026": { lat: 54.6718, lng: 25.2877 },
  "vilnius-triatlonas-trifun-2026": { lat: 54.7024, lng: 25.267 },
  "ltt-jonavos-triatlonas-2026": { lat: 55.0728, lng: 24.2795 },
  "lt-middle-distance-championship-panevezys-2026": { lat: 55.7412, lng: 24.371 },
  "ltt-skaudviles-triatlonas-2026": { lat: 55.4167, lng: 22.5833 },
  "europe-junior-cup-moletai-2026": { lat: 55.2257, lng: 25.4176 },
  "ltt-moletu-triatlonas-2026": { lat: 55.2389, lng: 25.419 },
  "ltt-druskininku-triatlonas-2026": { lat: 54.0159, lng: 23.9726 },
  "im-hamburg-european-championship": { lat: 53.5511, lng: 9.9937 },
  "im-frankfurt-european-championship": { lat: 50.1109, lng: 8.6821 },
  "im-vitoria-gasteiz": { lat: 42.8467, lng: -2.6719 },
  "im-kalmar-sweden": { lat: 56.6634, lng: 16.3568 },
  "im-copenhagen": { lat: 55.6761, lng: 12.5683 },
  "im-wales": { lat: 51.6727, lng: -4.7038 },
  "im-emilia-romagna": { lat: 44.2544, lng: 12.3577 },
  "im-calella-barcelona": { lat: 41.6139, lng: 2.6529 },
  /** HYROX Europe 2026 — city-centre approximations for arena events */
  "hyrox-helsinki-2026": { lat: 60.1699, lng: 24.9384 },
  "hyrox-barcelona-may-2026": { lat: 41.3874, lng: 2.1686 },
  "hyrox-heerenveen-2026": { lat: 52.9603, lng: 5.924 },
  "hyrox-lyon-2026": { lat: 45.764, lng: 4.8357 },
  "hyrox-berlin-may-2026": { lat: 52.52, lng: 13.405 },
  "hyrox-rimini-2026": { lat: 44.0607, lng: 12.5653 },
  "hyrox-riga-2026": { lat: 56.9496, lng: 24.1052 },
  "hyrox-world-championship-stockholm-2026": { lat: 59.3346, lng: 18.0632 },
  "hyrox-maastricht-2026": { lat: 50.8514, lng: 5.6909 },
  "hyrox-oslo-2026": { lat: 59.9139, lng: 10.7522 },
  "hyrox-bordeaux-2026": { lat: 44.8378, lng: -0.5792 },
  "hyrox-karlsruhe-2026": { lat: 49.0069, lng: 8.4037 },
  "hyrox-geneva-2026": { lat: 46.2044, lng: 6.1432 },
  "hyrox-gdansk-2026": { lat: 54.352, lng: 18.6466 },
  "hyrox-valencia-2026": { lat: 39.4699, lng: -0.3763 },
  "hyrox-birmingham-2026": { lat: 52.4862, lng: -1.8904 },
  "hyrox-hamburg-2026": { lat: 53.5511, lng: 9.9937 },
  "hyrox-nice-2026": { lat: 43.7102, lng: 7.262 },
  "hyrox-dublin-2026": { lat: 53.3498, lng: -6.2603 },
  "hyrox-dusseldorf-2026": { lat: 51.2277, lng: 6.7735 },
  "hyrox-barcelona-nov-2026": { lat: 41.4036, lng: 2.1744 },
  "hyrox-utrecht-2026": { lat: 52.0907, lng: 5.1214 },
  "hyrox-london-excel-2026": { lat: 51.508, lng: 0.027 },
  "hyrox-milan-2026": { lat: 45.4642, lng: 9.19 },
  "hyrox-paris-2026": { lat: 48.8566, lng: 2.3522 },
  "hyrox-gent-2026": { lat: 51.0543, lng: 3.7174 },
}

function spreadById(id: string, base: { lat: number; lng: number }): { lat: number; lng: number } {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i)
    h |= 0
  }
  const dx = ((h % 19) - 9) * 0.022
  const dy = (((h >> 7) % 19) - 9) * 0.022
  return { lat: base.lat + dx, lng: base.lng + dy }
}

export function getRaceMapCoordinates(race: MockRaceDetail): { lat: number; lng: number } | null {
  const base = RACE_BASE_COORDINATES[race.id]
  if (!base) return null
  return spreadById(race.id, base)
}
