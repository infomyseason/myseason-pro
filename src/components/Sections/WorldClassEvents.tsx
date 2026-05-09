import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { EXPLORE_EVENT_TYPE_LABELS } from "../../pages/explore/exploreFilters"
import { RaceCard } from "../cards/RaceCard"
import { sportKeyFromLabel } from "../sportTokens"

function featuredScrollStepPx(scrollEl: HTMLDivElement): number {
  const first = scrollEl.firstElementChild as HTMLElement | undefined
  if (!first) return 420
  const style = getComputedStyle(scrollEl)
  const gapRaw = style.columnGap || style.gap || "20px"
  const gap = Number.parseFloat(gapRaw) || 20
  return first.offsetWidth + gap
}

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

function computeDaysUntilFeatured(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(`${iso}T00:00:00`)
  event.setHours(0, 0, 0, 0)
  return Math.ceil((event.getTime() - today.getTime()) / 86400000)
}

/**
 * European IRONMAN full-distance events — dates, imagery and URLs from official ironman.com race pages (structured data).
 */
const FEATURED_RACES: FeaturedRace[] = [
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

export function WorldClassEvents() {
  const stripRef = useRef<HTMLDivElement>(null)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const scrollFeaturedNextRef = useRef<() => void>(() => {})

  const scrollFeaturedPrev = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    const step = featuredScrollStepPx(el)
    const maxScroll = el.scrollWidth - el.clientWidth
    const atStart = el.scrollLeft <= 2
    if (atStart) {
      el.scrollTo({ left: maxScroll, behavior: "smooth" })
    } else {
      el.scrollBy({ left: -step, behavior: "smooth" })
    }
  }, [])

  const scrollFeaturedNext = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    const step = featuredScrollStepPx(el)
    const maxScroll = el.scrollWidth - el.clientWidth
    const atEnd = el.scrollLeft >= maxScroll - 2
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" })
    } else {
      el.scrollBy({ left: step, behavior: "smooth" })
    }
  }, [])

  scrollFeaturedNextRef.current = scrollFeaturedNext

  useEffect(() => {
    if (FEATURED_RACES.length <= 1) return
    if (featuredPaused) return
    const id = window.setInterval(() => scrollFeaturedNextRef.current(), 3000)
    return () => window.clearInterval(id)
  }, [featuredPaused])

  return (
    <section className="relative overflow-hidden border-t border-border/30 py-10 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-[#a855f7]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mb-5 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary md:mb-3 md:px-3 md:py-1 md:text-xs">
              <span className="text-[10px]" aria-hidden="true">
                ◆
              </span>
              Featured Events
            </div>
            <h2 className="text-xl font-black text-foreground md:text-5xl">World-class events</h2>
            <p className="mt-1.5 text-sm text-muted-foreground md:mt-2 md:text-lg">
              Official IRONMAN full-distance racing across Europe
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                aria-label="Scroll to previous events"
                aria-controls="world-class-events-strip"
                onClick={scrollFeaturedPrev}
                className="rounded-full border border-border/50 bg-secondary/50 p-2.5 text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary disabled:pointer-events-none disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Scroll to next events"
                aria-controls="world-class-events-strip"
                onClick={scrollFeaturedNext}
                className="rounded-full border border-border/50 bg-secondary/50 p-2.5 text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary disabled:pointer-events-none disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <Link
              to={`/explore?eventType=${encodeURIComponent(EXPLORE_EVENT_TYPE_LABELS.world_class)}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80 md:ml-2 md:px-4 md:py-2 md:text-sm"
            >
              World-class event
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path d="M14 3h7v7M10 14 21 3M21 3v7h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setFeaturedPaused(true)}
          onMouseLeave={() => setFeaturedPaused(false)}
        >
          <div
            ref={stripRef}
            id="world-class-events-strip"
            role="region"
            aria-label="World-class event cards"
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-hide touch-pan-x md:gap-5"
          >
            {FEATURED_RACES.map((race) => (
              <div
                key={race.id}
                className="relative w-[calc((100vw-2rem)*0.91)] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <RaceCard
                  mode="featured"
                  sportKey={sportKeyFromLabel(race.sportType)}
                  title={race.title}
                  locationLine={`${race.city}, ${race.countryName}`}
                  flag={race.flag}
                  dateLabel={race.dateLabel}
                  imageUrl={race.imageUrl}
                  distances={race.distances}
                  daysUntil={computeDaysUntilFeatured(race.dateIso)}
                  major
                  athletesLabel={race.participantsLabel}
                  extraBadge="Ironman"
                  featuredBlurb={race.description}
                  to={`/race/${race.id}`}
                  startingPriceLabel={race.startingPriceLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
