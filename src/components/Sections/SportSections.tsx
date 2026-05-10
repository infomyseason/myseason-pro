import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { MOCK_RACE_DETAILS, type MockRaceDetail } from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { exploreHref } from "../../lib/exploreLinks"
import { formatRaceDateLabel } from "../../pages/explore/exploreFilters"
import { RaceCard } from "../cards/RaceCard"
import type { SportKey } from "../sportTokens"
import { SPORT_STYLES, sportKeyFromLabel } from "../sportTokens"
import {
  HOME_CAROUSEL_ARROW_CLASS,
  homeCarouselScrollNextLoop,
  homeCarouselScrollPrevLoop,
} from "./homeCarouselUtils"
import {
  HOME_CARD_SLIDE,
  HOME_RACE_CAROUSEL_STRIP,
  HOME_SECTION_HEADER_ROW,
  HOME_SECTION_INNER,
  HOME_SECTION_PY,
  HOME_VIEW_ALL_LINK,
} from "./homeSectionLayout"

type SportSectionSeed = { key: SportKey; title: string; subtitle: string; exploreSport: string }

function homepagePriceLabel(label?: string): string | undefined {
  if (!label?.trim()) return undefined
  return label.replace(/^starting\s+from\s+/i, "from ")
}

const SECTION_SEEDS: SportSectionSeed[] = [
  { key: "running", title: "Running", subtitle: "Road races, marathons & trail events", exploreSport: "Running" },
  { key: "triathlon", title: "Triathlon", subtitle: "Swim, bike, run — all in one", exploreSport: "Triathlon" },
  { key: "cycling", title: "Cycling", subtitle: "Granfondos, sportives & gravel", exploreSport: "Cycling" },
  { key: "hyrox", title: "HYROX", subtitle: "The fitness race for everybody", exploreSport: "HYROX" },
] as const

function ChevronRight({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeft({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SportSectionBlock({ section, races }: { section: SportSectionSeed; races: MockRaceDetail[] }) {
  const s = SPORT_STYLES[section.key]
  const stripRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const scrollNextRef = useRef<() => void>(() => {})

  const scrollPrev = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    homeCarouselScrollPrevLoop(el)
  }, [])

  const scrollNext = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    homeCarouselScrollNextLoop(el)
  }, [])

  scrollNextRef.current = scrollNext

  useEffect(() => {
    stripRef.current?.scrollTo({ left: 0, behavior: "auto" })
  }, [races.length, section.key])

  useEffect(() => {
    if (races.length <= 1) return
    if (paused) return
    const id = window.setInterval(() => scrollNextRef.current(), 5000)
    return () => window.clearInterval(id)
  }, [races.length, paused, section.key])

  const exploreTo = exploreHref({ sport: section.exploreSport })

  return (
    <section id={section.key} className={`relative overflow-hidden scroll-mt-24 ${HOME_SECTION_PY}`}>
      <div className={HOME_SECTION_INNER}>
        <div className={HOME_SECTION_HEADER_ROW}>
          <div>
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide md:mb-3 md:px-3 md:py-1 md:text-xs"
              style={{ borderColor: `${s.hex}4d`, color: s.hex, backgroundColor: `${s.hex}1a` }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: s.hex }} />
              {section.title}
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-5xl">{section.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:mt-2 md:text-lg">{section.subtitle}</p>
          </div>

          <Link to={exploreTo} className={`${HOME_VIEW_ALL_LINK} self-start md:self-auto`}>
            View all
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        </div>

        <div
          className="relative min-w-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {races.length > 1 ? (
            <>
              <button
                type="button"
                aria-label={`Previous ${section.title} events`}
                className={`${HOME_CAROUSEL_ARROW_CLASS} left-0 flex sm:left-1`}
                onClick={scrollPrev}
              >
                <ChevronLeft className="size-5 opacity-95 sm:size-[22px]" />
              </button>
              <button
                type="button"
                aria-label={`Next ${section.title} events`}
                className={`${HOME_CAROUSEL_ARROW_CLASS} right-0 flex sm:right-1`}
                onClick={scrollNext}
              >
                <ChevronRight className="size-5 opacity-95 sm:size-[22px]" />
              </button>
            </>
          ) : null}

          {races.length === 0 ? (
            <div className="-mx-4 px-4">
              <div className="rounded-3xl border border-border/45 bg-secondary/25 px-6 py-10 text-center backdrop-blur-xl">
                <p className="text-base font-bold text-foreground">Coming soon</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We’ll add HYROX events here as soon as they’re available.
                </p>
                <Link
                  to={exploreTo}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-primary/35 bg-primary/12 px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                >
                  View all on Explore
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div
              ref={stripRef}
              role="region"
              aria-label={`${section.title} races`}
              className={HOME_RACE_CAROUSEL_STRIP}
            >
              {races.map((race) => (
                <div
                  key={race.id}
                  className={HOME_CARD_SLIDE}
                >
                  <RaceCard
                    mode="sport"
                    homeMinimal
                    sportKey={sportKeyFromLabel(section.title)}
                    title={race.title}
                    locationLine={`${race.city}, ${race.country}`}
                    flag={EUROPE_FLAG_BY_CODE[race.countryCode] ?? "🏁"}
                    dateLabel={formatRaceDateLabel(race.date)}
                    imageUrl={race.image}
                    distances={race.distances}
                    to={`/race/${race.id}`}
                    startingPriceLabel={homepagePriceLabel(race.startingPriceLabel)}
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

        return <SportSectionBlock key={section.key} section={section} races={races} />
      })}
    </div>
  )
}
