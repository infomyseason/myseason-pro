import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { isRaceDateNotPast } from "../../data"
import { exploreHref } from "../../lib/exploreLinks"
import { RaceCard } from "../cards/RaceCard"
import { sportKeyFromLabel } from "../sportTokens"
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

type CommunityRace = {
  id: string
  title: string
  location: string
  countryName: string
  flag: string
  sportType: string
  distances: string[]
  dateLabel: string
  /** ISO `YYYY-MM-DD` for ordering */
  dateIso: string
  imageUrl: string
}

const MOCK_COMMUNITY_RACES_RAW: CommunityRace[] = [
  {
    id: "cr-1",
    title: "Bohemia Gravel Adventure",
    location: "Prague",
    countryName: "Czech Republic",
    flag: "🇨🇿",
    sportType: "Cycling",
    distances: ["80km", "140km"],
    dateLabel: "Jun 14, 2026",
    dateIso: "2026-06-14",
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cr-2",
    title: "Carpathian Sunrise Trail",
    location: "Brașov",
    countryName: "Romania",
    flag: "🇷🇴",
    sportType: "Running",
    distances: ["21K", "42K"],
    dateLabel: "Jul 19, 2026",
    dateIso: "2026-07-19",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cr-3",
    title: "Lisbon Riverside Time Trial",
    location: "Lisbon",
    countryName: "Portugal",
    flag: "🇵🇹",
    sportType: "Cycling",
    distances: ["20km"],
    dateLabel: "May 24, 2026",
    dateIso: "2026-05-24",
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cr-4",
    title: "Stockholm Sprint Triathlon",
    location: "Stockholm",
    countryName: "Sweden",
    flag: "🇸🇪",
    sportType: "Triathlon",
    distances: ["Sprint"],
    dateLabel: "Jun 28, 2026",
    dateIso: "2026-06-28",
    imageUrl: "https://images.unsplash.com/photo-1520975693411-6b56f0fd4d35?w=800&auto=format&fit=crop&q=80",
  },
]

const MOCK_COMMUNITY_RACES = MOCK_COMMUNITY_RACES_RAW.filter((r) => isRaceDateNotPast(r.dateIso))
  .slice()
  .sort((a, b) => a.dateIso.localeCompare(b.dateIso))

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

export function CommunityRaces() {
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
    if (MOCK_COMMUNITY_RACES.length <= 1) return
    if (paused) return
    const id = window.setInterval(() => scrollNextRef.current(), 5000)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <section className={`relative overflow-hidden border-t border-border/30 ${HOME_SECTION_PY}`}>
      <div className={HOME_SECTION_INNER}>
        <div className={HOME_SECTION_HEADER_ROW}>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-5xl">Community races</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:mt-2 md:text-lg">
              Events created by athletes like you
            </p>
          </div>
          <Link to={exploreHref({ eventType: "community" })} className={`${HOME_VIEW_ALL_LINK} self-start md:self-auto`}>
            View all
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div
          className="relative min-w-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {MOCK_COMMUNITY_RACES.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous community races"
                className={`${HOME_CAROUSEL_ARROW_CLASS} left-0 flex sm:left-1`}
                onClick={scrollPrev}
              >
                <ChevronLeft className="size-5 opacity-95 sm:size-[22px]" />
              </button>
              <button
                type="button"
                aria-label="Next community races"
                className={`${HOME_CAROUSEL_ARROW_CLASS} right-0 flex sm:right-1`}
                onClick={scrollNext}
              >
                <ChevronRight className="size-5 opacity-95 sm:size-[22px]" />
              </button>
            </>
          ) : null}
          <div
            ref={stripRef}
            role="region"
            aria-label="Community race cards"
            className={HOME_RACE_CAROUSEL_STRIP}
          >
            {MOCK_COMMUNITY_RACES.map((race) => (
              <div
                key={race.id}
                className={HOME_CARD_SLIDE}
              >
                <RaceCard
                  mode="sport"
                  homeMinimal
                  sportKey={sportKeyFromLabel(race.sportType)}
                  title={race.title}
                  locationLine={`${race.location}, ${race.countryName}`}
                  flag={race.flag}
                  dateLabel={race.dateLabel}
                  imageUrl={race.imageUrl}
                  distances={race.distances}
                  to={`/race/${race.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
