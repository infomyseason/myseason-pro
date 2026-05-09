import { Link } from "react-router-dom"
import { computeDaysUntilRace, MOCK_RACE_DETAILS } from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { formatRaceDateLabel } from "../../pages/explore/exploreFilters"
import { RaceCard } from "../cards/RaceCard"
import type { SportKey } from "../sportTokens"
import { SPORT_STYLES, sportKeyFromLabel } from "../sportTokens"

type SportSectionSeed = { key: SportKey; title: string; subtitle: string; exploreSport: string }

const SECTION_SEEDS: SportSectionSeed[] = [
  { key: "running", title: "Running", subtitle: "Road races, marathons & trail events", exploreSport: "Running" },
  { key: "triathlon", title: "Triathlon", subtitle: "Swim, bike, run — all in one", exploreSport: "Triathlon" },
  { key: "cycling", title: "Cycling", subtitle: "Granfondos, sportives & gravel", exploreSport: "Cycling" },
  { key: "hyrox", title: "HYROX", subtitle: "The fitness race for everybody", exploreSport: "HYROX" },
] as const

function SectionHeader({
  sportKey,
  title,
  subtitle,
  exploreSport,
}: {
  sportKey: SportKey
  title: string
  subtitle: string
  exploreSport: string
}) {
  const s = SPORT_STYLES[sportKey]
  return (
    <div className="mb-5 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-4">
      <div>
        <div
          className="mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold md:mb-3 md:px-3 md:py-1 md:text-xs"
          style={{ borderColor: `${s.hex}4d`, color: s.hex, backgroundColor: `${s.hex}1a` }}
        >
          <span className="size-1.5 rounded-full" style={{ backgroundColor: s.hex }} />
          {title}
        </div>
        <h2 className="text-xl font-black tracking-tight text-foreground md:text-4xl">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground md:mt-2 md:text-lg">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            disabled
            className="rounded-full border border-border/50 bg-secondary/50 p-2.5 text-muted-foreground/30"
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-full border border-border/50 bg-secondary/50 p-2.5 text-foreground transition-all hover:border-primary/30 hover:bg-secondary"
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <Link
          to={`/explore?sport=${encodeURIComponent(exploreSport)}`}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary/80 md:ml-2 md:px-4 md:py-2 md:text-sm"
        >
          View all
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export function SportSections() {
  return (
    <div className="border-t border-border/30">
      {SECTION_SEEDS.map((section) => {
        const sportLabel = section.exploreSport
        const races = MOCK_RACE_DETAILS.filter((r) => {
          const sp = r.sport.trim().toLowerCase()
          if (sportLabel.toLowerCase() === "hyrox") return sp.includes("hyrox") || /\bhyrox\b/i.test(r.title)
          return sp === sportLabel.toLowerCase()
        })
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 8)

        if (races.length === 0 && section.key !== "hyrox") return null

        return (
          <section key={section.key} className="relative overflow-hidden py-8 md:py-20">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              sportKey={section.key}
              title={section.title}
              subtitle={section.subtitle}
              exploreSport={section.exploreSport}
            />

            <div className="relative">
              {races.length === 0 ? (
                <div className="-mx-4 px-4">
                  <div className="rounded-3xl border border-border/45 bg-secondary/25 px-6 py-10 text-center backdrop-blur-xl">
                    <p className="text-base font-bold text-foreground">Coming soon</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We’ll add HYROX events here as soon as they’re available.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-4 scrollbar-hide touch-pan-x md:gap-5">
                  {races.map((race) => (
                    <div
                      key={race.id}
                      className="w-[calc((100vw-2rem)*0.91)] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none"
                    >
                      <RaceCard
                        mode="sport"
                        sportKey={sportKeyFromLabel(section.title)}
                        title={race.title}
                        locationLine={`${race.city}, ${race.country}`}
                        flag={EUROPE_FLAG_BY_CODE[race.countryCode] ?? "🏁"}
                        dateLabel={formatRaceDateLabel(race.date)}
                        imageUrl={race.image}
                        distances={race.distances}
                        daysUntil={computeDaysUntilRace(race.date)}
                        to={`/race/${race.id}`}
                        registrationStatus={race.registrationStatus}
                        priceNote={race.priceNote}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        )
      })}
    </div>
  )
}
