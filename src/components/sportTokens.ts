export type SportKey = "running" | "triathlon" | "cycling" | "hyrox"

export const SPORT_STYLES: Record<
  SportKey,
  { hex: string; rgb: string; label: string; emoji: string }
> = {
  running: { hex: "#22c55e", rgb: "34,197,94", label: "Running", emoji: "🏃" },
  triathlon: { hex: "#a855f7", rgb: "168,85,247", label: "Triathlon", emoji: "🏊" },
  cycling: { hex: "#3b82f6", rgb: "59,130,246", label: "Cycling", emoji: "🚴" },
  hyrox: { hex: "#f97316", rgb: "249,115,22", label: "HYROX", emoji: "💪" },
}

export function sportKeyFromLabel(label: string): SportKey {
  const s = label.toLowerCase()
  if (s.includes("aquathlon")) return "triathlon"
  if (s.includes("triathlon")) return "triathlon"
  if (s.includes("cycling") || s.includes("bike")) return "cycling"
  if (s.includes("hyrox")) return "hyrox"
  return "running"
}
