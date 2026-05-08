type CommunityRace = {
  id: string
  title: string
  location: string
  countryCode: string
  countryName: string
  sportType: string
  distanceLabel: string
  dateLabel: string
  imageUrl: string
}

const MOCK_COMMUNITY_RACES: CommunityRace[] = [
  {
    id: "cr-1",
    title: "Zverynas Sunrise Run",
    location: "Vilnius",
    countryCode: "LT",
    countryName: "Lithuania",
    sportType: "Running",
    distanceLabel: "10K",
    dateLabel: "Jun 1, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80",
  },
  {
    id: "cr-2",
    title: "Baltic Sea Swim–Bike Brick",
    location: "Palanga",
    countryCode: "LT",
    countryName: "Lithuania",
    sportType: "Triathlon",
    distanceLabel: "Brick session",
    dateLabel: "Jul 19, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1520975693411-6b56f0fd4d35?w=900&q=80",
  },
  {
    id: "cr-3",
    title: "Curonian Gravel Social",
    location: "Nida",
    countryCode: "LT",
    countryName: "Lithuania",
    sportType: "Cycling",
    distanceLabel: "80K",
    dateLabel: "Aug 3, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=900&q=80",
  },
  {
    id: "cr-4",
    title: "HYROX Training Meetup",
    location: "Kaunas",
    countryCode: "LT",
    countryName: "Lithuania",
    sportType: "HYROX",
    distanceLabel: "Doubles prep",
    dateLabel: "Sep 9, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80",
  },
]

function sportPillClass(sport: string) {
  const s = sport.toLowerCase()
  if (s === "running")
    return "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
  if (s === "triathlon")
    return "border-violet-400/35 bg-violet-500/15 text-violet-200"
  if (s === "cycling")
    return "border-sky-400/35 bg-sky-500/15 text-sky-200"
  if (s === "hyrox")
    return "border-orange-400/35 bg-orange-500/15 text-orange-200"
  return "border-[#f6d7b0]/35 bg-[#f6d7b0]/12 text-[#f6d7b0]"
}

export function CommunityRaces() {
  return (
    <section className="border-t border-white/[0.10] bg-transparent py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.034)] sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-7 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f6d7b0]/30 bg-[#f6d7b0]/10 px-3 py-1.5 text-xs font-semibold text-[#f6d7b0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f6d7b0]" />
              Community
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-[2.75rem] lg:leading-[1.06]">
              Races created by athletes like you
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-base">
              Discover community-made challenges, local meetups, and unofficial races.
            </p>
          </div>

          <a
            href="#"
            className="inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-[#f6d7b0] px-5 py-3 text-[13px] font-extrabold text-[#050a18] shadow-[0_18px_60px_-30px_rgba(246,215,176,0.9)] transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d7b0]/60 sm:w-auto sm:min-h-[2.75rem] sm:rounded-2xl sm:px-6 sm:py-4 sm:text-sm"
          >
            Create a community race
          </a>
        </div>

        <div className="relative -mx-3 sm:-mx-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#030712] via-[#030712]/85 to-transparent sm:w-16 md:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#030712] via-[#030712]/85 to-transparent sm:w-16 md:w-20" />

          <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-4 pt-1 [-webkit-overflow-scrolling:touch] scroll-pl-3 scroll-pr-3 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:px-6 sm:pb-5 sm:scroll-pl-6 sm:scroll-pr-6 [&::-webkit-scrollbar]:hidden touch-pan-x">
            {MOCK_COMMUNITY_RACES.map((race) => (
              <article
                key={race.id}
                className="group relative w-[min(calc(100vw-3.25rem),288px)] shrink-0 snap-start snap-always overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_22px_70px_-42px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.04] transition hover:border-[#f6d7b0]/28 hover:shadow-[0_30px_88px_-42px_rgba(246,215,176,0.16)] sm:w-[328px]"
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
                    <span className="rounded-full border border-[#f6d7b0]/35 bg-[#f6d7b0]/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#f6d7b0] backdrop-blur">
                      Community
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${sportPillClass(race.sportType)}`}
                    >
                      {race.sportType}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-[1] p-3 sm:p-4">
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      <span className="rounded-full border border-white/12 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-slate-100 backdrop-blur-md">
                        {race.distanceLabel}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-white sm:text-lg">
                      {race.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-200/85">
                      <span>
                        {race.countryCode} {race.location}, {race.countryName}
                      </span>
                      <span className="h-3 w-px bg-white/15" aria-hidden="true" />
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
