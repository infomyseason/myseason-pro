type SportKey = "running" | "triathlon" | "cycling" | "hyrox"

type SportRace = {
  id: string
  title: string
  location: string
  dateLabel: string
  distances: string[]
  imageUrl: string
}

type SportSectionData = {
  key: SportKey
  title: string
  subtitle: string
  badge: string
  accent: {
    ring: string
    border: string
    bg: string
    text: string
    glow: string
  }
  races: SportRace[]
}

const SECTIONS: SportSectionData[] = [
  {
    key: "running",
    title: "Running",
    subtitle: "Road races, marathons & trail events",
    badge: "Running",
    accent: {
      ring: "focus-visible:ring-emerald-400/60",
      border: "hover:border-emerald-400/30",
      bg: "bg-emerald-500/15",
      text: "text-emerald-200",
      glow: "hover:shadow-[0_30px_90px_-55px_rgba(16,185,129,0.55)]",
    },
    races: [
      {
        id: "run-1",
        title: "Berlin Marathon",
        location: "Berlin, Germany",
        dateLabel: "Sep 28, 2026",
        distances: ["42.2K", "WMM"],
        imageUrl:
          "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80",
      },
      {
        id: "run-2",
        title: "Vilnius Marathon",
        location: "Vilnius, Lithuania",
        dateLabel: "Sep 14, 2026",
        distances: ["42.2K", "21.1K"],
        imageUrl:
          "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=900&q=80",
      },
      {
        id: "run-3",
        title: "Valencia Half Marathon",
        location: "Valencia, Spain",
        dateLabel: "Oct 26, 2026",
        distances: ["21.1K"],
        imageUrl:
          "https://images.unsplash.com/photo-1520975958225-25c506d36a1d?w=900&q=80",
      },
    ],
  },
  {
    key: "triathlon",
    title: "Triathlon",
    subtitle: "Swim, bike, run — all in one",
    badge: "Triathlon",
    accent: {
      ring: "focus-visible:ring-violet-400/60",
      border: "hover:border-violet-400/30",
      bg: "bg-violet-500/15",
      text: "text-violet-200",
      glow: "hover:shadow-[0_30px_90px_-55px_rgba(139,92,246,0.55)]",
    },
    races: [
      {
        id: "tri-1",
        title: "Ironman 70.3 Tallinn",
        location: "Tallinn, Estonia",
        dateLabel: "Aug 9, 2026",
        distances: ["70.3"],
        imageUrl:
          "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=80",
      },
      {
        id: "tri-2",
        title: "Challenge Roth",
        location: "Roth, Germany",
        dateLabel: "Jul 5, 2026",
        distances: ["Full"],
        imageUrl:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80",
      },
      {
        id: "tri-3",
        title: "Coastal Sprint Triathlon",
        location: "Klaipėda, Lithuania",
        dateLabel: "Jul 12, 2026",
        distances: ["Sprint"],
        imageUrl:
          "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=900&q=80",
      },
    ],
  },
  {
    key: "cycling",
    title: "Cycling",
    subtitle: "Granfondos, sportives & gravel",
    badge: "Cycling",
    accent: {
      ring: "focus-visible:ring-sky-400/60",
      border: "hover:border-sky-400/30",
      bg: "bg-sky-500/15",
      text: "text-sky-200",
      glow: "hover:shadow-[0_30px_90px_-55px_rgba(56,189,248,0.55)]",
    },
    races: [
      {
        id: "cyc-1",
        title: "Tour de France Stage",
        location: "Alpe d'Huez, France",
        dateLabel: "Jul 18, 2026",
        distances: ["155K", "HC climb"],
        imageUrl:
          "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=900&q=80",
      },
      {
        id: "cyc-2",
        title: "Mallorca 312",
        location: "Playa de Muro, Spain",
        dateLabel: "Apr 25, 2026",
        distances: ["312K"],
        imageUrl:
          "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=900&q=80",
      },
      {
        id: "cyc-3",
        title: "Strade Bianche Fondo",
        location: "Siena, Italy",
        dateLabel: "Mar 8, 2026",
        distances: ["137K"],
        imageUrl:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80",
      },
    ],
  },
  {
    key: "hyrox",
    title: "HYROX",
    subtitle: "The fitness race for everybody",
    badge: "HYROX",
    accent: {
      ring: "focus-visible:ring-orange-400/60",
      border: "hover:border-orange-400/30",
      bg: "bg-orange-500/15",
      text: "text-orange-200",
      glow: "hover:shadow-[0_30px_90px_-55px_rgba(251,146,60,0.60)]",
    },
    races: [
      {
        id: "hyr-1",
        title: "HYROX World Championship",
        location: "Las Vegas, United States",
        dateLabel: "Jun 14, 2026",
        distances: ["Pro", "Doubles"],
        imageUrl:
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80",
      },
      {
        id: "hyr-2",
        title: "HYROX Kaunas",
        location: "Kaunas, Lithuania",
        dateLabel: "Nov 22, 2026",
        distances: ["Open", "Pro"],
        imageUrl:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80",
      },
      {
        id: "hyr-3",
        title: "HYROX London",
        location: "London, United Kingdom",
        dateLabel: "Oct 5, 2026",
        distances: ["Open"],
        imageUrl:
          "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=900&q=80",
      },
    ],
  },
]

function headerBadgeClass(key: SportKey) {
  if (key === "running") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
  if (key === "triathlon") return "border-violet-400/30 bg-violet-500/15 text-violet-200"
  if (key === "cycling") return "border-sky-400/30 bg-sky-500/15 text-sky-200"
  return "border-orange-400/30 bg-orange-500/15 text-orange-200"
}

export function SportSections() {
  return (
    <section className="border-t border-white/[0.10] bg-transparent py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.034)] sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-12 px-3 sm:space-y-16 sm:px-6">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <div className="mb-7 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div
                  className={[
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    headerBadgeClass(section.key),
                  ].join(" ")}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {section.badge}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-[2.75rem] lg:leading-[1.06]">
                  {section.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-base">
                  {section.subtitle}
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

              <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-4 pt-1 [-webkit-overflow-scrolling:touch] scroll-pl-3 scroll-pr-3 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:px-6 sm:pb-5 sm:scroll-pl-6 sm:scroll-pr-6 [&::-webkit-scrollbar]:hidden touch-pan-x">
                {section.races.map((race) => (
                  <article
                    key={race.id}
                    className={[
                      "group relative w-[min(calc(100vw-3.25rem),288px)] shrink-0 snap-start snap-always overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_22px_70px_-42px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.04] transition hover:border-[#f6d7b0]/28 hover:shadow-[0_30px_88px_-42px_rgba(246,215,176,0.16)] sm:w-[328px]",
                      section.accent.border,
                      section.accent.glow,
                    ].join(" ")}
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

                      <div className="absolute left-3 top-3 z-[1]">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                            "border-white/10 bg-white/5 text-white backdrop-blur",
                            section.accent.text,
                            section.accent.bg,
                          ].join(" ")}
                        >
                          {section.badge}
                        </span>
                      </div>

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

                        <h4 className="text-[15px] font-extrabold leading-snug tracking-tight text-white sm:text-lg">
                          {race.title}
                        </h4>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-200/85">
                          <span>{race.location}</span>
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
        ))}
      </div>
    </section>
  )
}

