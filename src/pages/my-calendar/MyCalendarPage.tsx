import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { computeDaysUntilRace, MOCK_RACE_DETAILS, type MockRaceDetail } from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { useFavouriteRaceIds } from "../../hooks/useFavouriteRaceIds"
import { useUserRaceLists } from "../../hooks/useUserRaceLists"
import { formatRaceDateLabel } from "../explore/exploreFilters"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

type ViewMode = "timeline" | "upcoming" | "month"

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

function ActionButton({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  tone: "primary" | "danger" | "neutral"
}) {
  const cls =
    tone === "primary"
      ? "border-primary/30 bg-primary/12 text-primary hover:border-primary/55 hover:bg-primary/[0.16]"
      : tone === "danger"
        ? "border-red-400/25 bg-red-950/25 text-red-200 hover:border-red-400/45 hover:bg-red-950/35"
        : "border-border/55 bg-secondary/35 text-foreground hover:border-primary/25 hover:bg-secondary/55"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition ${cls}`}
    >
      {children}
    </button>
  )
}

export function MyCalendarPage() {
  const [view, setView] = useState<ViewMode>("timeline")
  const { calendarRaceIds, plannedRaceIds, completedRaceIds, setLists } = useUserRaceLists()
  const { isFavourite, toggle: toggleFavourite } = useFavouriteRaceIds()

  const raceById = useMemo(() => new Map(MOCK_RACE_DETAILS.map((r) => [r.id, r])), [])

  const calendarRaces = useMemo(() => {
    const rows = calendarRaceIds
      .map((id) => raceById.get(id))
      .filter((r): r is MockRaceDetail => Boolean(r))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
    return rows
  }, [calendarRaceIds, raceById])

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

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

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
                          className="flex flex-col gap-3 rounded-2xl border border-border/45 bg-background/30 p-5 transition hover:border-primary/25 hover:bg-background/40 sm:flex-row sm:items-center sm:justify-between"
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
                              {computeDaysUntilRace(r.date)} days · {r.distances[0] ?? "Distance TBD"}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <ActionButton
                              tone="danger"
                              onClick={() =>
                                setLists({
                                  plannedRaceIds,
                                  completedRaceIds,
                                  calendarRaceIds: calendarRaceIds.filter((id) => id !== r.id),
                                })
                              }
                            >
                              Remove
                            </ActionButton>
                            <ActionButton
                              tone="primary"
                              onClick={() => {
                                if (!isFavourite(r.id)) toggleFavourite(r.id)
                                setLists({
                                  plannedRaceIds,
                                  completedRaceIds,
                                  calendarRaceIds: calendarRaceIds.filter((id) => id !== r.id),
                                })
                              }}
                            >
                              Move to favourites only
                            </ActionButton>
                          </div>
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
                                className={`rounded-2xl border bg-background/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition ${
                                  isNext ? "border-primary/35 bg-primary/[0.06]" : "border-border/45 hover:border-primary/25 hover:bg-background/40"
                                }`}
                              >
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
                                        {r.distances[0] ?? "Distance TBD"}
                                      </span>
                                      <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        {computeDaysUntilRace(r.date)} days
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                    <ActionButton
                                      tone="neutral"
                                      onClick={() => {
                                        // open event page (internal)
                                        window.location.href = `/race/${r.id}`
                                      }}
                                    >
                                      Open
                                    </ActionButton>
                                    <ActionButton
                                      tone="danger"
                                      onClick={() =>
                                        setLists({
                                          plannedRaceIds,
                                          completedRaceIds,
                                          calendarRaceIds: calendarRaceIds.filter((id) => id !== r.id),
                                        })
                                      }
                                    >
                                      Remove
                                    </ActionButton>
                                    <ActionButton
                                      tone="primary"
                                      onClick={() => {
                                        if (!isFavourite(r.id)) toggleFavourite(r.id)
                                        setLists({
                                          plannedRaceIds,
                                          completedRaceIds,
                                          calendarRaceIds: calendarRaceIds.filter((id) => id !== r.id),
                                        })
                                      }}
                                    >
                                      Move to favourites only
                                    </ActionButton>
                                  </div>
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
