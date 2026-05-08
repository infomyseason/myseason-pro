type FeaturedRace = {
  id: string
  title: string
  city: string
  countryName: string
  sportType: string
  dateLabel: string
  participantsLabel: string
  distances: string[]
  imageUrl: string
}

const FEATURED_RACES: FeaturedRace[] = [
  {
    id: "wce-1",
    title: "Berlin Marathon",
    city: "Berlin",
    countryName: "Germany",
    sportType: "Running",
    dateLabel: "Sep 28, 2026",
    participantsLabel: "45,000+",
    distances: ["Marathon", "WMM"],
    imageUrl:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80",
  },
  {
    id: "wce-2",
    title: "Ironman 70.3 Tallinn",
    city: "Tallinn",
    countryName: "Estonia",
    sportType: "Triathlon",
    dateLabel: "Aug 9, 2026",
    participantsLabel: "3,200+",
    distances: ["70.3", "Middle"],
    imageUrl:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=80",
  },
  {
    id: "wce-3",
    title: "HYROX World Championship",
    city: "Las Vegas",
    countryName: "United States",
    sportType: "HYROX",
    dateLabel: "Jun 14, 2026",
    participantsLabel: "6,500+",
    distances: ["Pro", "Doubles"],
    imageUrl:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80",
  },
  {
    id: "wce-4",
    title: "Tour de France Stage",
    city: "Alpe d'Huez",
    countryName: "France",
    sportType: "Cycling",
    dateLabel: "Jul 18, 2026",
    participantsLabel: "180",
    distances: ["155K", "HC climb"],
    imageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=900&q=80",
  },
  {
    id: "wce-5",
    title: "Challenge Roth",
    city: "Roth",
    countryName: "Germany",
    sportType: "Triathlon",
    dateLabel: "Jul 5, 2026",
    participantsLabel: "5,500+",
    distances: ["Full", "3.8K swim"],
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80",
  },
]

function sportBadgeClass(sport: string) {
  const s = sport.toLowerCase()
  if (s === "running")
    return "border-emerald-400/35 bg-emerald-500/20 text-emerald-100"
  if (s === "triathlon")
    return "border-violet-400/35 bg-violet-500/20 text-violet-100"
  if (s === "hyrox")
    return "border-orange-400/35 bg-orange-500/20 text-orange-100"
  if (s === "cycling")
    return "border-sky-400/35 bg-sky-500/20 text-sky-100"
  return "border-[#f6d7b0]/35 bg-[#f6d7b0]/15 text-[#f6d7b0]"
}

export function WorldClassEvents() {
  return (
    <section className="border-t border-white/[0.10] bg-transparent py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.034)] sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-7 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f6d7b0]/30 bg-[#f6d7b0]/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#f6d7b0]">
              <span className="text-base leading-none" aria-hidden="true">
                ◆
              </span>
              Featured Events
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-[2.75rem] lg:leading-[1.06]">
              World-class events
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-base">
              The races that define champions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur sm:inline-flex sm:h-11 sm:w-11"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur sm:inline-flex sm:h-11 sm:w-11"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
            </button>
            <a
              href="#"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#f6d7b0]/40 hover:bg-[#f6d7b0]/10 hover:text-[#f6d7b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d7b0]/55 sm:min-h-[2.75rem] sm:text-sm"
            >
              View all
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
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

        <div className="relative -mx-3 sm:-mx-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#030712] via-[#030712]/85 to-transparent sm:w-16 md:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#030712] via-[#030712]/85 to-transparent sm:w-16 md:w-20" />

          <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-4 pt-1 [-webkit-overflow-scrolling:touch] scroll-pl-3 scroll-pr-3 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-7 sm:px-6 sm:pb-5 sm:scroll-pl-6 sm:scroll-pr-6 [&::-webkit-scrollbar]:hidden touch-pan-x">
            {FEATURED_RACES.map((race) => (
              <article
                key={race.id}
                className="group relative w-[min(calc(100vw-3.25rem),296px)] shrink-0 snap-start snap-always overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_28px_84px_-46px_rgba(0,0,0,0.96)] ring-1 ring-white/[0.04] transition hover:border-[#f6d7b0]/28 hover:shadow-[0_34px_96px_-44px_rgba(246,215,176,0.18)] sm:w-[340px] md:w-[472px] lg:w-[508px]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={race.imageUrl}
                    alt=""
                    className="h-full w-full object-cover brightness-[0.97] contrast-[1.03] saturate-[1.05] transition duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/95 via-[#030712]/58 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0)_48%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,rgba(246,215,176,0.09),transparent_52%)]" />

                  <div className="absolute left-3 top-3 z-[1] flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${sportBadgeClass(race.sportType)}`}
                    >
                      {race.sportType}
                    </span>
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-100">
                      Major
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-[1] p-3 sm:p-4">
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {race.distances.map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-white/12 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-slate-100 backdrop-blur-md"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-white sm:text-lg lg:text-xl">
                      {race.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-200/85">
                      <span>
                        {race.city}, {race.countryName}
                      </span>
                      <span className="hidden h-3 w-px bg-white/15 sm:inline" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          className="text-[#f6d7b0]/85"
                          aria-hidden="true"
                        >
                          <path
                            d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                        {race.dateLabel}
                      </span>
                      <span className="hidden h-3 w-px bg-white/15 sm:inline" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          className="text-[#f6d7b0]/85"
                          aria-hidden="true"
                        >
                          <path
                            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                        {race.participantsLabel} athletes
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
