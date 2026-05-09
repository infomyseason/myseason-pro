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
