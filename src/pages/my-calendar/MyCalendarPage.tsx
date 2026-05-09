import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { computeDaysUntilRace, MOCK_RACE_DETAILS, type MockRaceDetail } from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { useFavouriteRaceIds } from "../../hooks/useFavouriteRaceIds"
import { useUserRaceLists, type CalendarEntry, type CalendarGoalType } from "../../hooks/useUserRaceLists"
import { formatRaceDateLabel } from "../explore/exploreFilters"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

type ViewMode = "timeline" | "upcoming" | "month"

function parseSegmentKm(distances: string[], segment: "swim" | "bike" | "run"): number | null {
  const re = new RegExp(String.raw`(\d+(?:\.\d+)?)\s*km\s*${segment}`, "i")
  for (const d of distances) {
    const m = d.match(re)
    if (!m) continue
    const v = Number(m[1])
    if (Number.isFinite(v)) return v
  }
  return null
}

function triathlonFormatOptions(distances: string[]): string[] {
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

function planningDistanceOptions(race: { sport: string; distances: string[] }): string[] {
  if (race.sport === "Triathlon") {
    const formats = triathlonFormatOptions(race.distances)
    if (formats.length) return formats
  }
  return race.distances.length ? race.distances : ["Distance TBD"]
}

function ellipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const s = text.slice(0, mid) + "…"
    if (ctx.measureText(s).width <= maxWidth) lo = mid + 1
    else hi = mid
  }
  const cut = Math.max(0, lo - 1)
  return text.slice(0, cut) + "…"
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function exportSeasonCalendarPng(args: {
  rows: { race: MockRaceDetail; entry: CalendarEntry }[]
  title: string
  subtitle?: string
  theme: { bg: string; card: string; border: string; text: string; muted: string; gold: string; navy2: string }
}) {
  const { rows, title, theme } = args
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  const W = 860
  const margin = 44
  const headerH = 86
  const rowH = 58
  const tableHeadH = 44
  const footerH = 38
  const maxRows = 18
  const pageRows = rows.slice(0, maxRows)
  const H = margin + headerH + tableHeadH + pageRows.length * rowH + footerH + margin

  const canvas = document.createElement("canvas")
  canvas.width = Math.floor(W * dpr)
  canvas.height = Math.floor(H * dpr)
  canvas.style.width = `${W}px`
  canvas.style.height = `${H}px`
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.scale(dpr, dpr)

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, W, H)
  const grad = ctx.createRadialGradient(W * 0.25, 0, 10, W * 0.25, 0, 420)
  grad.addColorStop(0, "rgba(232,200,150,0.10)")
  grad.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = theme.text
  ctx.font = "800 30px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
  ctx.fillText(title, margin, margin + 42)

  const tableX = margin
  const tableY = margin + headerH
  const tableW = W - margin * 2
  const tableH = tableHeadH + pageRows.length * rowH
  ctx.fillStyle = theme.card
  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(tableX, tableY, tableW, tableH, 18)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = theme.navy2
  ctx.beginPath()
  ctx.roundRect(tableX, tableY, tableW, tableHeadH, 18)
  ctx.fill()
  ctx.fillRect(tableX, tableY + tableHeadH - 18, tableW, 18)

  // Allocate more space to Race + Distance/Note, less to Sport.
  const colDate = 120
  const colRace = 320
  const colSport = 90
  const colPlace = 160
  const colNotes = tableW - (colDate + colRace + colSport + colPlace)
  const colXs = [
    tableX,
    tableX + colDate,
    tableX + colDate + colRace,
    tableX + colDate + colRace + colSport,
    tableX + colDate + colRace + colSport + colPlace,
  ]

  ctx.fillStyle = "rgba(255,255,255,0.86)"
  ctx.font = "800 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
  const headY = tableY + 28
  ctx.fillText("DATE", colXs[0] + 16, headY)
  ctx.fillText("RACE", colXs[1] + 16, headY)
  ctx.fillText("SPORT", colXs[2] + 16, headY)
  ctx.fillText("PLACE", colXs[3] + 16, headY)
  ctx.fillText("DISTANCE / NOTE", colXs[4] + 16, headY)

  const startY = tableY + tableHeadH
  for (let i = 0; i < pageRows.length; i++) {
    const y = startY + i * rowH
    ctx.strokeStyle = "rgba(255,255,255,0.07)"
    ctx.beginPath()
    ctx.moveTo(tableX, y)
    ctx.lineTo(tableX + tableW, y)
    ctx.stroke()
    for (let c = 1; c < colXs.length; c++) {
      ctx.beginPath()
      ctx.moveTo(colXs[c], y)
      ctx.lineTo(colXs[c], y + rowH)
      ctx.stroke()
    }

    const { race, entry } = pageRows[i]!
    const d = new Date(`${race.date}T00:00:00`)
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const place = `${race.city}, ${race.country}`
    const distance = entry.selectedDistance || race.distances[0] || "—"
    const note = entry.userNote?.trim() ? ` · ${entry.userNote.trim()}` : ""

    const padX = 14
    const baseY = y + 28

    const drawInCell = (x: number, w: number, draw: () => void) => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x + 8, y + 6, w - 16, rowH - 12)
      ctx.clip()
      draw()
      ctx.restore()
    }

    drawInCell(colXs[0], colDate, () => {
      ctx.fillStyle = theme.text
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      ctx.fillText(ellipsis(ctx, dateLabel, colDate - (padX * 2)), colXs[0] + padX, baseY)
    })

    drawInCell(colXs[1], colRace, () => {
      ctx.fillStyle = theme.text
      ctx.font = "900 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      ctx.fillText(ellipsis(ctx, race.title, colRace - (padX * 2)), colXs[1] + padX, baseY)
    })

    drawInCell(colXs[2], colSport, () => {
      ctx.fillStyle = theme.muted
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      ctx.fillText(ellipsis(ctx, race.sport, colSport - (padX * 2)), colXs[2] + padX, baseY)
    })

    drawInCell(colXs[3], colPlace, () => {
      ctx.fillStyle = theme.muted
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      ctx.fillText(ellipsis(ctx, place, colPlace - (padX * 2)), colXs[3] + padX, baseY)
    })

    drawInCell(colXs[4], colNotes, () => {
      ctx.fillStyle = theme.text
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      ctx.fillText(ellipsis(ctx, `${distance}${note}`, colNotes - (padX * 2)), colXs[4] + padX, baseY)
    })
  }

  const footY = tableY + tableH + 18
  ctx.fillStyle = theme.gold
  ctx.font = "900 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
  ctx.fillText("myseason.pro", W - margin - ctx.measureText("myseason.pro").width, footY + 18)

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"))
  if (!blob) return
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  downloadBlob(`${safe || "my-season-calendar"}.png`, blob)
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, diff: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1)
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function dayDiff(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00`)
  const b = new Date(`${bIso}T00:00:00`)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function gapLabel(days: number): string {
  if (days <= 0) return "Next race"
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} recovery block`
  const w = Math.round(days / 7)
  if (w <= 6) return `${w} week${w === 1 ? "" : "s"} until next race`
  return `${w} weeks training block`
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/45 bg-background/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black tracking-tight text-foreground tabular-nums">{value}</p>
    </div>
  )
}

function ViewChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/55 bg-background/40 text-muted-foreground hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M9 3h6m-8 4h10m-9 0 .7 13h6.6L17 7M10 11v7m4-7v7M6.5 7h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      {filled ? (
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function MyCalendarPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>("timeline")
  const { calendarEntries, plannedRaceIds, completedRaceIds, setLists } = useUserRaceLists()
  const { isFavourite, toggle: toggleFavourite } = useFavouriteRaceIds()
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [planRaceId, setPlanRaceId] = useState<string | null>(null)
  const [planDistance, setPlanDistance] = useState("")
  const [planGoal, setPlanGoal] = useState<CalendarGoalType | "">("")
  const [planNote, setPlanNote] = useState("")

  const raceById = useMemo(() => new Map(MOCK_RACE_DETAILS.map((r) => [r.id, r])), [])

  const calendarRows = useMemo(() => {
    const rows = calendarEntries
      .map((e) => ({ entry: e, race: raceById.get(e.raceId) }))
      .filter((r): r is { entry: CalendarEntry; race: MockRaceDetail } => Boolean(r.race))
      .slice()
      .sort((a, b) => a.race.date.localeCompare(b.race.date))
    return rows
  }, [calendarEntries, raceById])

  const calendarRaces = useMemo(() => calendarRows.map((r) => r.race), [calendarRows])
  const entryByRaceId = useMemo(() => new Map(calendarEntries.map((e) => [e.raceId, e] as const)), [calendarEntries])
  const exportRows = useMemo(() => calendarRows.map((r) => ({ race: r.race, entry: r.entry })), [calendarRows])

  const todayIso = isoDate(new Date())

  const nextRace = useMemo(() => {
    const upcoming = calendarRaces.filter((r) => r.date >= todayIso)
    return upcoming[0]
  }, [calendarRaces, todayIso])

  const seasonDurationLabel = useMemo(() => {
    if (calendarRaces.length < 2) return "—"
    const first = calendarRaces[0]!.date
    const last = calendarRaces[calendarRaces.length - 1]!.date
    const days = Math.max(0, dayDiff(first, last))
    const weeks = Math.round(days / 7)
    return `${weeks} weeks`
  }, [calendarRaces])

  const sportsBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of calendarRaces) map.set(r.sport, (map.get(r.sport) ?? 0) + 1)
    const rows = [...map.entries()].sort((a, b) => b[1] - a[1])
    return rows
  }, [calendarRaces])

  const monthCursor = useMemo(() => startOfMonth(new Date()), [])
  const [month, setMonth] = useState<Date>(monthCursor)

  const monthDays = useMemo(() => {
    const first = startOfMonth(month)
    const startWeekday = (first.getDay() + 6) % 7 // Mon=0
    const gridStart = new Date(first)
    gridStart.setDate(first.getDate() - startWeekday)
    const out: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      out.push(d)
    }
    return out
  }, [month])

  const raceDatesInMonthGrid = useMemo(() => {
    const s = new Set<string>()
    for (const r of calendarRaces) s.add(r.date)
    return s
  }, [calendarRaces])

  const onRaceCardClick = (raceId: string) => (e: React.MouseEvent<HTMLElement>) => {
    const t = e.target as HTMLElement | null
    if (t?.closest("button,a,input,textarea,select,label")) return
    navigate(`/race/${raceId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      {planModalOpen && planRaceId ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add to your season calendar"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setPlanModalOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/55 bg-background/95 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-border/40 px-5 py-4">
              <p className="text-sm font-black text-foreground">Edit season plan</p>
              <p className="mt-1 text-xs text-muted-foreground">Update distance, goal and note.</p>
            </div>

            <div className="px-5 py-5">
              {raceById.get(planRaceId) ? (
                <>
                  {(() => {
                    const race = raceById.get(planRaceId)!
                    const options = planningDistanceOptions(race)
                    return (
                      <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Distance / category</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {options.map((d) => {
                      const active = planDistance === d
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setPlanDistance(d)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "border-primary/55 bg-primary/18 text-primary"
                              : "border-border/55 bg-secondary/35 text-foreground hover:border-primary/30 hover:bg-secondary/55"
                          }`}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                      </>
                    )
                  })()}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Goal (optional)</p>
                      <select
                        value={planGoal}
                        onChange={(e) => setPlanGoal(e.target.value as any)}
                        className="mt-2 w-full rounded-xl border border-border/55 bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none ring-primary/15 focus:border-primary/40 focus:ring-2"
                      >
                        <option value="">No goal</option>
                        <option value="justFinish">Just finish</option>
                        <option value="pbAttempt">PB attempt</option>
                        <option value="trainingRace">Training race</option>
                        <option value="aRace">A race</option>
                        <option value="bRace">B race</option>
                        <option value="cRace">C race</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Note (optional)</p>
                      <textarea
                        value={planNote}
                        onChange={(e) => setPlanNote(e.target.value)}
                        className="mt-2 min-h-[84px] w-full resize-y rounded-xl border border-border/55 bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none ring-primary/15 focus:border-primary/40 focus:ring-2"
                        placeholder="e.g. Fuel plan, pacing, travel, recovery focus…"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Race not found.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="rounded-full border border-border/55 bg-secondary/40 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
                onClick={() => setPlanModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!planDistance.trim()}
                className="rounded-full bg-primary/90 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  const race = raceById.get(planRaceId)
                  if (!race) return
                  const dist = planDistance.trim()
                  if (!dist) return
                  const prev = calendarEntries
                  const existing = prev.find((e) => e.raceId === race.id)
                  const nextEntry: CalendarEntry = {
                    raceId: race.id,
                    selectedDistance: dist,
                    ...(planGoal ? { goalType: planGoal as CalendarGoalType } : {}),
                    ...(planNote.trim() ? { userNote: planNote.trim() } : {}),
                    addedAt: existing?.addedAt ?? new Date().toISOString(),
                  }
                  const nextEntries = existing ? prev.map((e) => (e.raceId === race.id ? nextEntry : e)) : [nextEntry, ...prev]
                  setLists({
                    plannedRaceIds,
                    completedRaceIds,
                    calendarEntries: nextEntries,
                  })
                  setPlanModalOpen(false)
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="relative overflow-hidden pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#a855f7]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 lg:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">Planner</p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">My Season Calendar</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Plan your races, recovery and build your season.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ViewChip active={view === "month"} onClick={() => setView("month")}>
                  Month view
                </ViewChip>
                <ViewChip active={view === "timeline"} onClick={() => setView("timeline")}>
                  Timeline view
                </ViewChip>
                <ViewChip active={view === "upcoming"} onClick={() => setView("upcoming")}>
                  Upcoming view
                </ViewChip>
                <button
                  type="button"
                  onClick={() => {
                    const root = getComputedStyle(document.documentElement)
                    void exportSeasonCalendarPng({
                      rows: exportRows,
                      title: "2026 Race Calendar",
                      theme: {
                        bg: root.getPropertyValue("--color-background").trim() || "#070b16",
                        card: root.getPropertyValue("--color-card").trim() || "#0d1424",
                        border: root.getPropertyValue("--color-border").trim() || "#24304a",
                        text: root.getPropertyValue("--color-foreground").trim() || "#e8eefc",
                        muted: root.getPropertyValue("--color-muted-foreground").trim() || "#a5b1c8",
                        gold: root.getPropertyValue("--color-primary").trim() || "#e8c896",
                        navy2: "rgba(15,26,46,0.85)",
                      },
                    })
                  }}
                  className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary transition hover:border-primary/45 hover:bg-primary/[0.14]"
                  title="Download a PNG calendar"
                >
                  Download
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
            <section className="rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
              <div className="border-b border-border/40 p-6 sm:p-8">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatPill label="Planned races" value={String(calendarRaces.length)} />
                  <StatPill
                    label="Next race"
                    value={nextRace ? `${computeDaysUntilRace(nextRace.date)} days` : "—"}
                  />
                  <StatPill label="Sports mix" value={sportsBreakdown.length ? `${sportsBreakdown.length} sports` : "—"} />
                  <StatPill label="Season duration" value={seasonDurationLabel} />
                </div>

                {sportsBreakdown.length ? (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {sportsBreakdown.slice(0, 6).map(([sport, count]) => (
                      <span
                        key={sport}
                        className="rounded-full border border-border/55 bg-background/40 px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {sport}: <span className="text-primary">{count}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="p-6 sm:p-8">
                {calendarRaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" className="text-primary" aria-hidden="true">
                        <path
                          d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Your season is empty</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Add races using <span className="font-semibold text-foreground/90">Add to calendar</span> on any event.
                    </p>
                    <Link
                      to="/explore"
                      className="mt-8 inline-flex rounded-full border border-primary/35 bg-primary/12 px-6 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                    >
                      Explore events
                    </Link>
                  </div>
                ) : view === "upcoming" ? (
                  <div className="space-y-4">
                    {calendarRaces
                      .filter((r) => r.date >= todayIso)
                      .slice(0, 30)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-border/45 bg-background/30 p-5 transition hover:border-primary/25 hover:bg-background/40 sm:flex-row sm:items-center sm:justify-between"
                          role="link"
                          tabIndex={0}
                          onClick={onRaceCardClick(r.id)}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">{r.sport}</p>
                            <Link to={`/race/${r.id}`} className="mt-1 block truncate text-base font-black text-foreground hover:text-primary">
                              {r.title}
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {EUROPE_FLAG_BY_CODE[r.countryCode] ?? "🏁"} {r.city}, {r.country} · {formatRaceDateLabel(r.date)}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {computeDaysUntilRace(r.date)} days ·{" "}
                              {entryByRaceId.get(r.id)?.selectedDistance?.trim() || r.distances[0] || "Distance TBD"}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:items-end">
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setLists({
                                    plannedRaceIds,
                                    completedRaceIds,
                                    calendarEntries: calendarEntries.filter((e) => e.raceId !== r.id),
                                  })
                                }
                                className="inline-flex size-9 items-center justify-center rounded-full border border-red-400/25 bg-red-950/25 text-red-200 transition hover:border-red-400/45 hover:bg-red-950/35"
                                aria-label="Remove from calendar"
                                title="Remove"
                              >
                                <TrashIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isFavourite(r.id)) toggleFavourite(r.id)
                                  setLists({
                                    plannedRaceIds,
                                    completedRaceIds,
                                    calendarEntries: calendarEntries.filter((e) => e.raceId !== r.id),
                                  })
                                }}
                                className="inline-flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/12 text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                                aria-label="Move to favourites only"
                                title="Move to favourites only"
                              >
                                <HeartIcon filled={isFavourite(r.id)} />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const existing = entryByRaceId.get(r.id) ?? null
                              const defaultDistance =
                                existing?.selectedDistance?.trim() || (r.distances.length === 1 ? (r.distances[0] ?? "") : "")
                              setPlanRaceId(r.id)
                              setPlanDistance(defaultDistance)
                              setPlanGoal((existing?.goalType ?? "") as any)
                              setPlanNote(existing?.userNote ?? "")
                              setPlanModalOpen(true)
                            }}
                            className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-full border border-border/55 bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
                            aria-label="Edit plan"
                            title="Edit plan"
                          >
                            Edit plan
                          </button>
                        </div>
                      ))}
                  </div>
                ) : view === "month" ? (
                  <div className="rounded-2xl border border-border/45 bg-background/25 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-foreground">
                          {month.toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground">Dates with planned races are highlighted.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMonth((m) => addMonths(m, -1))}
                          className="rounded-full border border-border/55 bg-secondary/40 p-2 text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
                          aria-label="Previous month"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMonth(startOfMonth(new Date()))}
                          className="rounded-full border border-border/55 bg-secondary/40 px-4 py-2 text-xs font-bold uppercase tracking-wide text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setMonth((m) => addMonths(m, 1))}
                          className="rounded-full border border-border/55 bg-secondary/40 p-2 text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
                          aria-label="Next month"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-xs">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="px-2 py-1 font-bold text-muted-foreground">
                          {d}
                        </div>
                      ))}
                      {monthDays.map((d) => {
                        const isCurrentMonth = d.getMonth() === month.getMonth()
                        const dIso = isoDate(d)
                        const hasRace = raceDatesInMonthGrid.has(dIso)
                        const isToday = dIso === todayIso
                        return (
                          <div
                            key={dIso}
                            className={`rounded-xl border px-2 py-2 transition ${
                              isCurrentMonth ? "border-border/45 bg-background/20" : "border-border/25 bg-background/10 opacity-70"
                            } ${hasRace ? "ring-1 ring-primary/35" : ""} ${isToday ? "border-primary/40" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                                {d.getDate()}
                              </span>
                              {hasRace ? <span className="text-primary">•</span> : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/25 via-border/50 to-transparent" />

                    <div className="space-y-5">
                      {calendarRaces.map((r, idx) => {
                        const isPast = r.date < todayIso
                        const isNext = nextRace?.id === r.id
                        const prev = idx > 0 ? calendarRaces[idx - 1] : null
                        const gapDays = prev ? Math.max(0, dayDiff(prev.date, r.date)) : 0
                        const gapText = prev ? gapLabel(gapDays) : null

                        return (
                          <div key={r.id}>
                            {gapText ? (
                              <div className="ml-10 mb-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-background/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  <span className="size-1.5 rounded-full bg-primary/60" aria-hidden="true" />
                                  {gapText}
                                </div>
                              </div>
                            ) : null}

                            <div className={`relative pl-10 ${isPast ? "opacity-70" : ""}`}>
                              <div
                                className={`absolute left-3 top-6 size-3 -translate-x-1/2 rounded-full border ${
                                  isNext ? "border-primary bg-primary/60 shadow-[0_0_0_6px_rgba(232,200,150,0.12)]" : "border-border/70 bg-background"
                                }`}
                                aria-hidden="true"
                              />

                              <div
                                className={`relative rounded-2xl border bg-background/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition ${
                                  isNext ? "border-primary/35 bg-primary/[0.06]" : "border-border/45 hover:border-primary/25 hover:bg-background/40"
                                }`}
                                role="link"
                                tabIndex={0}
                                onClick={onRaceCardClick(r.id)}
                              >
                                <div className="absolute right-4 top-4 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!isFavourite(r.id)) toggleFavourite(r.id)
                                      setLists({
                                        plannedRaceIds,
                                        completedRaceIds,
                                        calendarEntries: calendarEntries.filter((e) => e.raceId !== r.id),
                                      })
                                    }}
                                    className="inline-flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/12 text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                                    aria-label="Move to favourites only"
                                    title="Move to favourites only"
                                  >
                                    <HeartIcon filled={isFavourite(r.id)} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLists({
                                        plannedRaceIds,
                                        completedRaceIds,
                                        calendarEntries: calendarEntries.filter((e) => e.raceId !== r.id),
                                      })
                                    }
                                    className="inline-flex size-9 items-center justify-center rounded-full border border-red-400/25 bg-red-950/25 text-red-200 transition hover:border-red-400/45 hover:bg-red-950/35"
                                    aria-label="Remove from calendar"
                                    title="Remove"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const existing = entryByRaceId.get(r.id) ?? null
                                    const defaultDistance =
                                      existing?.selectedDistance?.trim() ||
                                      (r.distances.length === 1 ? (r.distances[0] ?? "") : "")
                                    setPlanRaceId(r.id)
                                    setPlanDistance(defaultDistance)
                                    setPlanGoal((existing?.goalType ?? "") as any)
                                    setPlanNote(existing?.userNote ?? "")
                                    setPlanModalOpen(true)
                                  }}
                                  className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-full border border-border/55 bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/60"
                                  aria-label="Edit plan"
                                  title="Edit plan"
                                >
                                  Edit plan
                                </button>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-primary/90">{r.sport}</p>
                                    <Link to={`/race/${r.id}`} className="mt-1 block truncate text-lg font-black text-foreground hover:text-primary">
                                      {r.title}
                                    </Link>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {EUROPE_FLAG_BY_CODE[r.countryCode] ?? "🏁"} {r.city}, {r.country}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <span className="rounded-full border border-border/55 bg-secondary/35 px-3 py-1 text-xs font-semibold text-foreground">
                                        {formatRaceDateLabel(r.date)}
                                      </span>
                                      <span className="rounded-full border border-border/55 bg-secondary/35 px-3 py-1 text-xs font-semibold text-foreground">
                                        {entryByRaceId.get(r.id)?.selectedDistance?.trim() || r.distances[0] || "Distance TBD"}
                                      </span>
                                      {entryByRaceId.get(r.id)?.goalType ? (
                                        <span className="rounded-full border border-border/55 bg-background/40 px-3 py-1 text-xs font-semibold text-foreground">
                                          {entryByRaceId.get(r.id)!.goalType === "justFinish"
                                            ? "Just finish"
                                            : entryByRaceId.get(r.id)!.goalType === "pbAttempt"
                                              ? "PB attempt"
                                              : entryByRaceId.get(r.id)!.goalType === "trainingRace"
                                                ? "Training race"
                                                : entryByRaceId.get(r.id)!.goalType === "aRace"
                                                  ? "A race"
                                                  : entryByRaceId.get(r.id)!.goalType === "bRace"
                                                    ? "B race"
                                                    : "C race"}
                                        </span>
                                      ) : null}
                                      <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        {computeDaysUntilRace(r.date)} days
                                      </span>
                                    </div>
                                  </div>

                                  <div className="hidden" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-border/45 bg-secondary/25 p-6 backdrop-blur-xl">
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Next up</h2>
                {nextRace ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary/90">{nextRace.sport}</p>
                    <Link to={`/race/${nextRace.id}`} className="mt-1 block text-lg font-black text-foreground hover:text-primary">
                      {nextRace.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {EUROPE_FLAG_BY_CODE[nextRace.countryCode] ?? "🏁"} {nextRace.city}, {nextRace.country}
                    </p>
                    <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Countdown</p>
                      <p className="mt-1 text-xl font-black text-foreground tabular-nums">
                        {computeDaysUntilRace(nextRace.date)} days
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatRaceDateLabel(nextRace.date)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Add a race to your calendar to start planning.</p>
                )}
              </div>

              <div className="rounded-3xl border border-border/45 bg-secondary/25 p-6 backdrop-blur-xl">
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Season notes</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  The timeline shows the recovery/prep gaps between starts so you can plan blocks like an endurance athlete.
                </p>
                <div className="mt-4 rounded-2xl border border-border/45 bg-background/25 px-4 py-4 text-sm text-muted-foreground">
                  Tip: favourite races are separate from calendar planning — you can save inspiration without committing it to your season.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
