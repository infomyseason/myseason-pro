import { useMemo } from "react"
import { Link } from "react-router-dom"
import { computeDaysUntilRace, getRaceDetailById, getSubmittedRaceDetailById, type MockRaceDetail } from "../../data"
import { useUserRaceLists } from "../../hooks/useUserRaceLists"

type SavedRace = {
  id: string
  title: string
  days: number
  detail: string
  month: string
}

const SAVED_RACES: SavedRace[] = [
  {
    id: "sp-1",
    title: "Ironman 70.3 Tallinn",
    days: 87,
    detail: "🇪🇪 Tallinn • 70.3",
    month: "AUG",
  },
  {
    id: "sp-2",
    title: "Vilnius Marathon",
    days: 124,
    detail: "🇱🇹 Vilnius • 42.2km",
    month: "SEP",
  },
  {
    id: "sp-3",
    title: "Berlin Marathon",
    days: 144,
    detail: "🇩🇪 Berlin • 42.2km",
    month: "SEP",
  },
  {
    id: "sp-4",
    title: "HYROX Kaunas",
    days: 165,
    detail: "🇱🇹 Kaunas • 8×1km",
    month: "OCT",
  },
]

type PlannedRow = {
  id: string
  title: string
  month: string
  daysUntil: number
  detail: string
  dateIso: string
}

function monthShort(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(d).toUpperCase()
}

function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00`)
  const b = new Date(`${bIso}T00:00:00`)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000))
}

export function SeasonPlannerPreview() {
  const { calendarEntries } = useUserRaceLists()
  const calendarRaceIds = useMemo(() => calendarEntries.map((e) => e.raceId), [calendarEntries])
  const hasCalendar = calendarRaceIds.length > 0

  const plannedRows = useMemo((): PlannedRow[] => {
    if (!hasCalendar) return []
    const rows = calendarRaceIds
      .map((id) => getRaceDetailById(id) ?? getSubmittedRaceDetailById(id))
      .filter((r): r is MockRaceDetail => Boolean(r))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        title: r.title,
        month: monthShort(r.date),
        daysUntil: computeDaysUntilRace(r.date),
        detail: `${r.city} • ${r.distances[0] ?? "Distance TBD"}`,
        dateIso: r.date,
      }))
    return rows
  }, [calendarRaceIds, hasCalendar])

  const renderRow = (r: PlannedRow, i: number) => (
    <div
      key={r.id}
      className={`relative overflow-hidden rounded-2xl border border-border/45 bg-secondary/30 px-4 py-3 ring-1 ring-white/[0.03] transition hover:border-primary/25 ${
        i === 0 ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-border/55 bg-secondary/70 text-center">
          <div className="text-[9px] font-extrabold tracking-wider text-primary">{r.month}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="min-w-0 truncate font-black text-foreground">{r.title}</h4>
            {i === 0 ? (
              <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Next up
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{r.detail}</p>
        </div>

        <div className="text-right">
          <div className="text-lg font-black text-foreground">{r.daysUntil}</div>
          <div className="text-[11px] font-semibold text-muted-foreground">days</div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="relative overflow-hidden border-t border-border/30 py-10 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-primary/5 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 md:gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary md:mb-3 md:px-3 md:py-1 md:text-xs">
            <span className="size-1.5 rounded-full bg-primary" />
            Season Planner
          </div>

          <h2 className="text-xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Build your race calendar. <span className="text-primary">Chase your goals.</span>
          </h2>

          <p className="mt-3 text-sm text-muted-foreground md:mt-4 md:text-lg">
            Save races, track your season progress, and never miss registration deadlines. Your personal race
            timeline awaits.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 md:mt-6 md:gap-2">
            {["Track deadlines", "Set goals", "Celebrate PRs"].map((b) => (
              <span
                key={b}
                className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1.5 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm md:px-4 md:py-2 md:text-sm"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-6 md:mt-10">
            <Link
              to="/my-calendar"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 md:w-auto md:px-8 md:py-4"
            >
              Start planning your season
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="ml-2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_30%_10%,rgba(232,200,150,0.14),transparent_60%),radial-gradient(circle_at_90%_40%,rgba(59,130,246,0.14),transparent_55%)] blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl">
            <div className="border-b border-border/50 bg-secondary/40 px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-foreground">Your 2026 Season</h3>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Active
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasCalendar ? `${calendarRaceIds.length} race${calendarRaceIds.length === 1 ? "" : "s"} planned` : "4 races planned"}
              </p>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                {hasCalendar
                  ? plannedRows.flatMap((r, i) => {
                      const nodes: React.ReactNode[] = [renderRow(r, i)]
                      const next = plannedRows[i + 1]
                      if (next) {
                        const gapDays = daysBetween(r.dateIso, next.dateIso)
                        const weeks = Math.max(1, Math.round(gapDays / 7))
                        nodes.push(
                          <div key={`${r.id}:gap`} className="pl-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-background/30 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                              <span className="size-1.5 rounded-full bg-primary/60" aria-hidden="true" />
                              {weeks} week{weeks === 1 ? "" : "s"} until next race
                            </div>
                          </div>,
                        )
                      }
                      return nodes
                    })
                  : SAVED_RACES.map((r, i) =>
                      renderRow(
                        {
                          id: r.id,
                          title: r.title,
                          month: r.month,
                          daysUntil: r.days,
                          detail: r.detail,
                          dateIso: "2026-01-01",
                        },
                        i,
                      ),
                    )}
              </div>

              <Link
                to={hasCalendar ? "/my-calendar" : "/explore"}
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-border/50 bg-secondary/50 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                {hasCalendar ? "Open season planner" : "+ Add another race to your season"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
