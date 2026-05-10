/** Parse swim/bike/run segment distances from strings like "3.8 km swim". */
export function parseSegmentKm(distances: string[], segment: "swim" | "bike" | "run"): number | null {
  const re = new RegExp(String.raw`(\d+(?:\.\d+)?)\s*km\s*${segment}`, "i")
  for (const d of distances) {
    const m = d.match(re)
    if (!m) continue
    const v = Number(m[1])
    if (Number.isFinite(v)) return v
  }
  return null
}

/** Recognised triathlon formats from swim/bike/run triples (same tolerances as race detail). */
export function triathlonFormatLabels(distances: string[]): string[] {
  const swim = parseSegmentKm(distances, "swim")
  const bike = parseSegmentKm(distances, "bike")
  const run = parseSegmentKm(distances, "run")
  if (swim === null || bike === null || run === null) return []

  const within = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol
  const formats: string[] = []
  if (within(swim, 3.8, 0.35) && within(bike, 180, 12) && within(run, 42.2, 2.5)) formats.push("Ironman")
  if (within(swim, 1.9, 0.25) && within(bike, 90, 8) && within(run, 21.1, 1.8)) formats.push("Ironman 70.3")
  if (within(swim, 1.5, 0.2) && within(bike, 40, 5) && within(run, 10, 1.2)) formats.push("Olympic")
  if (within(swim, 0.75, 0.15) && within(bike, 20, 3) && within(run, 5, 0.9)) formats.push("Sprint")
  return formats
}

/** Single chip for cards: full Ironman vs half, when distances match known profiles. */
export function triathlonCardFormatChip(distances: string[]): string | null {
  const labels = triathlonFormatLabels(distances)
  if (labels.includes("Ironman")) return "Ironman"
  if (labels.includes("Ironman 70.3")) return "Ironman 70.3"
  return null
}
