import { useMemo, useState } from "react"

type Country = {
  code: string
  label: string
}

type MockRace = {
  id: string
  title: string
  city: string
  countryCode: string
  countryName: string
  raceType: string
  dateLabel: string
  distances: string[]
  imageUrl: string
}

const COUNTRIES: Country[] = [
  { code: "LT", label: "Lithuania" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "GB", label: "United Kingdom" },
  { code: "ES", label: "Spain" },
  { code: "NL", label: "Netherlands" },
]

const MOCK_RACES: MockRace[] = [
  {
    id: "de-1",
    title: "Berlin Marathon",
    city: "Berlin",
    countryCode: "DE",
    countryName: "Germany",
    raceType: "Running",
    dateLabel: "Sep 28, 2026",
    distances: ["42.2K"],
    imageUrl:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=640&q=80",
  },
  {
    id: "fr-1",
    title: "Paris Marathon",
    city: "Paris",
    countryCode: "FR",
    countryName: "France",
    raceType: "Running",
    dateLabel: "Apr 12, 2026",
    distances: ["42.2K"],
    imageUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=640&q=80",
  },
  {
    id: "gb-1",
    title: "London Marathon",
    city: "London",
    countryCode: "GB",
    countryName: "United Kingdom",
    raceType: "Running",
    dateLabel: "Apr 26, 2026",
    distances: ["42.2K"],
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&q=80",
  },
  {
    id: "es-1",
    title: "Mallorca 312",
    city: "Playa de Muro",
    countryCode: "ES",
    countryName: "Spain",
    raceType: "Cycling",
    dateLabel: "Apr 25, 2026",
    distances: ["167K", "225K", "312K"],
    imageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=640&q=80",
  },
  {
    id: "nl-1",
    title: "Amsterdam Marathon",
    city: "Amsterdam",
    countryCode: "NL",
    countryName: "Netherlands",
    raceType: "Running",
    dateLabel: "Oct 19, 2026",
    distances: ["42.2K", "21.1K"],
    imageUrl:
      "https://images.unsplash.com/photo-1549887534-1541e9326642?w=640&q=80",
  },
  {
    id: "1",
    title: "Vilnius Marathon",
    city: "Vilnius",
    countryCode: "LT",
    countryName: "Lithuania",
    raceType: "Running",
    dateLabel: "Sep 14, 2026",
    distances: ["42.2K", "21.1K", "10K"],
    imageUrl:
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=640&q=80",
  },
  {
    id: "2",
    title: "Kaunas Half Marathon",
    city: "Kaunas",
    countryCode: "LT",
    countryName: "Lithuania",
    raceType: "Running",
    dateLabel: "May 18, 2026",
    distances: ["21.1K", "10K"],
    imageUrl:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=640&q=80",
  },
  {
    id: "3",
    title: "Curonian Spit Trail",
    city: "Nida",
    countryCode: "LT",
    countryName: "Lithuania",
    raceType: "Running",
    dateLabel: "Jun 7, 2026",
    distances: ["25K", "50K"],
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=640&q=80",
  },
  {
    id: "4",
    title: "Baltic Sprint Triathlon",
    city: "Klaipėda",
    countryCode: "LT",
    countryName: "Lithuania",
    raceType: "Triathlon",
    dateLabel: "Jul 12, 2026",
    distances: ["Sprint"],
    imageUrl:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=640&q=80",
  },
  {
    id: "5",
    title: "HYROX Vilnius",
    city: "Vilnius",
    countryCode: "LT",
    countryName: "Lithuania",
    raceType: "HYROX",
    dateLabel: "Nov 22, 2026",
    distances: ["Pro", "Open"],
    imageUrl:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=640&q=80",
  },
]

function raceTypeStyles(type: string) {
  const t = type.toLowerCase()
  if (t === "running")
    return "border-emerald-500/35 bg-emerald-500/15 text-emerald-200"
  if (t === "triathlon")
    return "border-violet-500/35 bg-violet-500/15 text-violet-200"
  if (t === "hyrox")
    return "border-orange-500/35 bg-orange-500/15 text-orange-200"
  if (t === "cycling")
    return "border-sky-500/35 bg-sky-500/15 text-sky-200"
  return "border-[#f6d7b0]/30 bg-[#f6d7b0]/10 text-[#f6d7b0]"
}

export function LocalRaces() {
  const [selectedCode, setSelectedCode] = useState("LT")

  const filtered = useMemo(
    () => MOCK_RACES.filter((r) => r.countryCode === selectedCode),
    [selectedCode],
  )

  return (
    <section className="border-t border-white/[0.10] bg-transparent py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.034)] sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-7 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f6d7b0]/25 bg-[#f6d7b0]/10 px-3 py-1.5 text-xs font-semibold text-[#f6d7b0]">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                className="shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              Races near you
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-[2.75rem] lg:leading-[1.06]">
              Events in <span className="text-[#f6d7b0]">Lithuania</span>
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-base">
              Select your country to discover local races
            </p>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
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

        <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
          {COUNTRIES.map((c) => {
            const active = c.code === selectedCode
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedCode(c.code)}
                className={[
                  "min-h-11 rounded-xl border px-3 py-2 text-[13px] font-semibold transition sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-sm",
                  active
                    ? "border-[#f6d7b0]/50 bg-[#f6d7b0]/15 text-[#f6d7b0] shadow-[0_0_24px_-8px_rgba(246,215,176,0.45)]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span className="mr-2 font-black text-white/90">{c.code}</span>
                {c.label}
              </button>
            )
          })}
        </div>

        <div className="relative -mx-3 sm:-mx-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#030712] via-[#030712]/85 to-transparent sm:w-16 md:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#030712] via-[#030712]/85 to-transparent sm:w-16 md:w-20" />

          <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-4 pt-1 [-webkit-overflow-scrolling:touch] scroll-pl-3 scroll-pr-3 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:px-6 sm:pb-5 sm:scroll-pl-6 sm:scroll-pr-6 [&::-webkit-scrollbar]:hidden touch-pan-x">
            {filtered.map((race) => (
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
                  <span
                    className={`absolute left-3 top-3 z-[1] rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${raceTypeStyles(race.raceType)}`}
                  >
                    {race.raceType}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 z-[1] p-3 sm:p-4">
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {race.distances.slice(0, 3).map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-white/12 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-slate-100 backdrop-blur-md"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-white sm:text-lg">
                      {race.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-200/85">
                      <span>{race.city}, {race.countryName}</span>
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
