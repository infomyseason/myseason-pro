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

export function SeasonPlannerPreview() {
  return (
    <section className="relative overflow-hidden border-t border-border/30 py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-primary/5 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Season Planner
          </div>

          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Build your race calendar. <span className="text-primary">Chase your goals.</span>
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Save races, track your season progress, and never miss registration deadlines. Your personal race
            timeline awaits.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Track deadlines", "Set goals", "Celebrate PRs"].map((b) => (
              <span
                key={b}
                className="rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm font-semibold text-foreground/90 backdrop-blur-sm"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
            >
              Start planning your season
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="ml-2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </a>
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
              <p className="mt-1 text-xs text-muted-foreground">4 races planned</p>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                {SAVED_RACES.map((r, i) => (
                  <div
                    key={r.id}
                    className={`relative overflow-hidden rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 ring-1 ring-white/[0.03] transition hover:border-primary/25 ${
                      i === 0 ? "border-primary/30 bg-primary/5" : ""
                    }`}
                  >
                    {i === 0 ? (
                      <span className="absolute right-3 top-3 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Next up
                      </span>
                    ) : null}
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-border/50 bg-secondary/80 text-center">
                        <div className="text-[9px] font-extrabold tracking-wider text-primary">{r.month}</div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-black text-foreground">{r.title}</h4>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{r.detail}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-foreground">{r.days}</div>
                        <div className="text-[11px] font-semibold text-muted-foreground">days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-border/50 bg-secondary/50 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                + Add another race to your season
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
