import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { isRaceDateNotPast } from "../../data"
import { exploreHref } from "../../lib/exploreLinks"
import { triathlonCardFormatChip } from "../../lib/triathlonFormats"
import { RaceCard } from "../cards/RaceCard"
import { sportKeyFromLabel } from "../sportTokens"
import {
  HOME_CAROUSEL_ARROW_CLASS,
  homeCarouselScrollNextLoop,
  homeCarouselScrollPrevLoop,
} from "./homeCarouselUtils"
import {
  HOME_CARD_SLIDE_WIDE,
  HOME_RACE_CAROUSEL_STRIP,
  HOME_SECTION_HEADER_ROW,
  HOME_SECTION_INNER,
  HOME_SECTION_PY,
  HOME_VIEW_ALL_LINK,
} from "./homeSectionLayout"

type FeaturedRace = {
  id: string
  title: string
  city: string
  countryName: string
  flag: string
  sportType: string
  dateLabel: string
  /** ISO YYYY-MM-DD from official ironman.com structured data */
  dateIso: string
  participantsLabel?: string
  distances: string[]
  imageUrl: string
  officialWebsite: string
  /** Compact copy aligned with official race themes — original wording */
  description: string
  startingPriceLabel?: string
}

function formatFeaturedDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d)
}

function homepagePriceLabel(label?: string): string | undefined {
  if (!label?.trim()) return undefined
  return label.replace(/^starting\s+from\s+/i, "from ")
}

/** World-class strip: one chip — full Ironman vs 70.3 from swim/bike/run lines (not leg distances). */
function worldClassCardDistances(race: FeaturedRace): string[] {
  if (race.sportType !== "Triathlon") return race.distances
  const chip = triathlonCardFormatChip(race.distances)
  if (chip) return [chip]
  if (/\b70\.3\b/i.test(race.title)) return ["Ironman 70.3"]
  return ["Ironman"]
}

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

/**
 * European IRONMAN full-distance events — dates, imagery and URLs from official ironman.com race pages (structured data).
 */
const FEATURED_RACES_RAW: FeaturedRace[] = [
  {
    id: "im-hamburg-european-championship",
    title: "IRONMAN Hamburg European Championship",
    city: "Hamburg",
    countryName: "Germany",
    flag: "🇩🇪",
    sportType: "Triathlon",
    dateIso: "2026-06-07",
    dateLabel: formatFeaturedDate("2026-06-07"),
    distances: ["3.8 km swim", "178 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/imhamburg_eventcard_image1.jpg?h=b086164c&itok=hOyoIZDD",
    officialWebsite: "https://www.ironman.com/races/im-hamburg",
    description:
      "Harbour-city racing through the Alster swim, iconic Hamburg landmarks on two wheels, and a finale along waterways built for bucket-list momentum.",
  },
  {
    id: "im-frankfurt-european-championship",
    title: "IRONMAN Frankfurt European Championship",
    city: "Frankfurt",
    countryName: "Germany",
    flag: "🇩🇪",
    sportType: "Triathlon",
    dateIso: "2026-06-28",
    dateLabel: formatFeaturedDate("2026-06-28"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/IM-Frankfurt_RaceCard_Finish.jpg?h=aae7d1ee&itok=v76LWLS0",
    officialWebsite: "https://www.ironman.com/races/im-frankfurt",
    description:
      "Mainhattan skylines frame Langener Waldsee swimming and a Main river run — a headline European Championship canvas for age-group racing.",
  },
  {
    id: "im-vitoria-gasteiz",
    title: "IRONMAN Vitoria-Gasteiz",
    city: "Vitoria-Gasteiz",
    countryName: "Spain",
    flag: "🇪🇸",
    sportType: "Triathlon",
    dateIso: "2026-07-12",
    dateLabel: formatFeaturedDate("2026-07-12"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/IM%20Vitoria-Gasteiz_event%20card.JPG?h=a0d62d26&itok=npTIep8E",
    officialWebsite: "https://www.ironman.com/races/im-vitoria-gasteiz",
    description:
      "Basque Country stadium atmosphere — forested climbs, passionate roadside fans, and a proven proving ground for long-course debuts and qualifiers alike.",
  },
  {
    id: "im-kalmar-sweden",
    title: "IRONMAN Kalmar",
    city: "Kalmar",
    countryName: "Sweden",
    flag: "🇸🇪",
    sportType: "Triathlon",
    dateIso: "2026-08-15",
    dateLabel: formatFeaturedDate("2026-08-15"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/im%20kalmar_eventcard.jpg?h=1399bfd2&itok=QCgXhmZL",
    officialWebsite: "https://www.ironman.com/races/im-kalmar",
    description:
      "Kalmar Strait swim starts, the Öland bridge on the bike leg, and Scandinavia’s famously loud finish-line energy — small city, enormous crowd noise.",
  },
  {
    id: "im-copenhagen",
    title: "IRONMAN Copenhagen",
    city: "Copenhagen",
    countryName: "Denmark",
    flag: "🇩🇰",
    sportType: "Triathlon",
    dateIso: "2026-08-16",
    dateLabel: formatFeaturedDate("2026-08-16"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/IM_Copenhagen_eventcard_Nyhavn.jpg?h=d1cb525d&itok=vXygzkVN",
    officialWebsite: "https://www.ironman.com/races/im-copenhagen",
    description:
      "Capital-city racing with Baltic bay swimming, rolling North Zealand riding, and a flat urban run past Danish landmarks — Nordic cheer everywhere.",
  },
  {
    id: "im-wales",
    title: "IRONMAN Wales",
    city: "Tenby",
    countryName: "United Kingdom",
    flag: "🇬🇧",
    sportType: "Triathlon",
    dateIso: "2026-09-13",
    dateLabel: formatFeaturedDate("2026-09-13"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/imwales_eventcard_image1.png?h=d1cb525d&itok=KzowB77u",
    officialWebsite: "https://www.ironman.com/races/im-wales",
    description:
      "North Beach sunrise swims, Pembrokeshire coastal riding, and Tenby’s fortress-like spectator gauntlet — legendary British long-course theatre.",
  },
  {
    id: "im-emilia-romagna",
    title: "IRONMAN Italy Emilia-Romagna",
    city: "Cervia",
    countryName: "Italy",
    flag: "🇮🇹",
    sportType: "Triathlon",
    dateIso: "2026-09-19",
    dateLabel: formatFeaturedDate("2026-09-19"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/IM-Italy-event-card.jpg?h=b6717701&itok=WAKuOkX6",
    officialWebsite: "https://www.ironman.com/races/im-emilia-romagna",
    description:
      "Adriatic-edge racing from historic Cervia — Mediterranean calm on the swim, Romagna countryside tempo on the bike, seaside runway into town.",
  },
  {
    id: "im-calella-barcelona",
    title: "IRONMAN Calella-Barcelona",
    city: "Calella",
    countryName: "Spain",
    flag: "🇪🇸",
    sportType: "Triathlon",
    dateIso: "2026-10-04",
    dateLabel: formatFeaturedDate("2026-10-04"),
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    imageUrl:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/IMBarcelona_eventcard.jpg?h=b6717701&itok=Wc_q30pi",
    officialWebsite: "https://www.ironman.com/races/im-barcelona",
    description:
      "Maresme coastal kilometres, fast autumn pacing, and a beach-close finish — a favourite European season closer drenched in Catalan sunshine.",
  },
]

const FEATURED_RACES = FEATURED_RACES_RAW.filter((r) => isRaceDateNotPast(r.dateIso))
  .slice()
  .sort((a, b) => a.dateIso.localeCompare(b.dateIso))

export function WorldClassEvents() {
  const stripRef = useRef<HTMLDivElement>(null)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const scrollFeaturedNextRef = useRef<() => void>(() => {})

  const scrollFeaturedPrev = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    homeCarouselScrollPrevLoop(el)
  }, [])

  const scrollFeaturedNext = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    homeCarouselScrollNextLoop(el)
  }, [])

  scrollFeaturedNextRef.current = scrollFeaturedNext

  useEffect(() => {
    if (FEATURED_RACES.length <= 1) return
    if (featuredPaused) return
    const id = window.setInterval(() => scrollFeaturedNextRef.current(), 5000)
    return () => window.clearInterval(id)
  }, [featuredPaused, FEATURED_RACES.length])

  return (
    <section className={`relative overflow-hidden border-t border-border/30 ${HOME_SECTION_PY}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-[#a855f7]/5 blur-[100px]" />
      </div>

      <div className={HOME_SECTION_INNER}>
        <div className={HOME_SECTION_HEADER_ROW}>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary md:mb-3 md:px-3 md:py-1 md:text-xs">
              <span className="text-[10px]" aria-hidden="true">
                ◆
              </span>
              Featured Events
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-5xl">World-class events</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:mt-2 md:text-lg">
              Official IRONMAN full-distance racing across Europe
            </p>
          </div>

          <Link
            to={exploreHref({ sport: "Triathlon", eventType: "world_class" })}
            className={`${HOME_VIEW_ALL_LINK} self-start md:self-auto`}
          >
            View all
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        </div>

        <div
          className="relative min-w-0"
          onMouseEnter={() => setFeaturedPaused(true)}
          onMouseLeave={() => setFeaturedPaused(false)}
        >
          {FEATURED_RACES.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Scroll to previous events"
                aria-controls="world-class-events-strip"
                className={`${HOME_CAROUSEL_ARROW_CLASS} left-0 flex sm:left-1`}
                onClick={scrollFeaturedPrev}
              >
                <ChevronLeft className="size-5 opacity-95 sm:size-[22px]" />
              </button>
              <button
                type="button"
                aria-label="Scroll to next events"
                aria-controls="world-class-events-strip"
                className={`${HOME_CAROUSEL_ARROW_CLASS} right-0 flex sm:right-1`}
                onClick={scrollFeaturedNext}
              >
                <ChevronRight className="size-5 opacity-95 sm:size-[22px]" />
              </button>
            </>
          ) : null}
          <div
            ref={stripRef}
            id="world-class-events-strip"
            role="region"
            aria-label="World-class event cards"
            className={HOME_RACE_CAROUSEL_STRIP}
          >
            {FEATURED_RACES.map((race) => (
              <div key={race.id} className={HOME_CARD_SLIDE_WIDE}>
                <RaceCard
                  mode="featured"
                  homeMinimal
                  sportKey={sportKeyFromLabel(race.sportType)}
                  title={race.title}
                  locationLine={`${race.city}, ${race.countryName}`}
                  flag={race.flag}
                  dateLabel={race.dateLabel}
                  imageUrl={race.imageUrl}
                  distances={worldClassCardDistances(race)}
                  to={`/race/${race.id}`}
                  startingPriceLabel={homepagePriceLabel(race.startingPriceLabel)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
