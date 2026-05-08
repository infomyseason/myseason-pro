type SavedRace = {
  id: string
  title: string
  days: number
  location: string
  month: string
}

const SAVED_RACES: SavedRace[] = [
  {
    id: "sp-1",
    title: "Ironman 70.3 Tallinn",
    days: 87,
    location: "Tallinn",
    month: "AUG",
  },
  {
    id: "sp-2",
    title: "Vilnius Marathon",
    days: 124,
    location: "Vilnius",
    month: "SEP",
  },
  {
    id: "sp-3",
    title: "Berlin Marathon",
    days: 144,
    location: "Berlin",
    month: "SEP",
  },
  {
    id: "sp-4",
    title: "HYROX Kaunas",
    days: 165,
    location: "Kaunas",
    month: "NOV",
  },
]

export function SeasonPlannerPreview() {
  return (
    <section className="border-t border-white/[0.10] bg-transparent py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.034)] sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-3 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f6d7b0]/25 bg-[#f6d7b0]/10 px-3 py-1.5 text-xs font-semibold text-[#f6d7b0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f6d7b0]" />
            Season Planner
          </div>

          <h2 className="text-2xl font-black leading-[1.08] tracking-tight text-white sm:text-3xl lg:text-[2.75rem] lg:leading-[1.06]">
            Build your race calendar.{" "}
            <span className="text-[#f6d7b0]">Chase your goals.</span>
          </h2>

          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-base">
            Save races, track your season progress, and never miss registration deadlines.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            {["Track deadlines", "Set goals", "Celebrate PRs"].map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-slate-200 sm:px-4 sm:py-2 sm:text-sm"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-7 sm:mt-8">
            <a
              href="#"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#f6d7b0] px-5 py-3 text-[13px] font-extrabold text-[#050a18] shadow-[0_18px_60px_-30px_rgba(246,215,176,0.9)] transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d7b0]/60 sm:min-h-0 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-4 sm:text-sm"
            >
              Start planning your season
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2"
                aria-hidden="true"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_30%_10%,rgba(246,215,176,0.14),transparent_60%),radial-gradient(circle_at_90%_40%,rgba(59,130,246,0.16),transparent_55%)] blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] shadow-[0_34px_90px_-52px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.04]">
            <div className="border-b border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold text-white">Your 2026 Season</div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-400">4 races planned</p>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                {SAVED_RACES.map((r) => (
                  <div
                    key={r.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#050a18]/40 px-4 py-3 shadow-inner shadow-black/30 ring-1 ring-white/[0.03] transition hover:border-[#f6d7b0]/25 hover:bg-[#050a18]/55"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(246,215,176,0.12),transparent_55%)]" />
                    </div>

                    <div className="relative flex items-center gap-3">
                      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                        <div className="text-[10px] font-extrabold tracking-wider text-[#f6d7b0]">
                          {r.month}
                        </div>
                        <div className="text-sm font-black">{String(r.days).slice(0, 2)}</div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-extrabold text-white">{r.title}</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-400">{r.location}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-white">{r.days}</div>
                        <div className="text-[11px] font-semibold text-slate-400">days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d7b0]/60 sm:min-h-0 sm:rounded-2xl sm:text-sm"
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

