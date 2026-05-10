import type { NewsSportChannel } from "./newsSportChannel"

export function sportLabelToNewsChannel(sport: string): NewsSportChannel {
  const s = sport.trim().toLowerCase()
  if (s.includes("hyrox")) return "HYROX"
  if (s.includes("triathlon") || s === "tri") return "Triathlon"
  if (s.includes("cycl") || s.includes("bike")) return "Cycling"
  if (s.includes("community")) return "Community"
  return "Running"
}
