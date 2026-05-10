import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { MOCK_RACE_DETAILS, MOCK_RACES_LIST as MOCK_RACES } from "../../data"
import { EUROPEAN_COUNTRIES, EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { exploreHref } from "../../lib/exploreLinks"
import { compareRaceDatesAscending } from "../../pages/explore/exploreFilters"
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
  HOME_VIEW_ALL_PILL,
} from "./homeSectionLayout"

const RACE_DATE_ISO_BY_LIST_ID = new Map(MOCK_RACE_DETAILS.map((d) => [d.id, d.date]))

function sortRacesByEventDateSoonestFirst<T extends { id: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => {
    const da = RACE_DATE_ISO_BY_LIST_ID.get(a.id) ?? ""
    const db = RACE_DATE_ISO_BY_LIST_ID.get(b.id) ?? ""
    return compareRaceDatesAscending(da, db)
  })
}

const FLAG_BY_CODE = EUROPE_FLAG_BY_CODE

type Selection = "ALL" | string

/** Default chip selection — All countries. */
const DEFAULT_SELECTED_COUNTRY_CODE: Selection = "ALL"

/** Inline chips only; every other European country is reachable via search dropdown. */
const CHIP_COUNTRY_CODES = ["DE", "FR", "GB", "ES", "IT", "NL"] as const

const CHIP_FILTER_OPTIONS: { code: Selection; label: string; flag?: string }[] = [
  { code: "ALL", label: "All countries", flag: "🌍" },
  ...(["LT", ...CHIP_COUNTRY_CODES] as const).map((code) => {
    const c = EUROPEAN_COUNTRIES.find((row) => row.code === code)!
    return { code: c.code, label: c.label, flag: c.flag }
  }),
]

function labelForCountryCode(code: Selection): string | undefined {
  if (code === "ALL") return undefined
  return EUROPEAN_COUNTRIES.find((c) => c.code === code)?.label
}

function sectionHeading(selectedCode: Selection): string {
  if (selectedCode === "ALL") return "Events across Europe"
  const selectedLabel = labelForCountryCode(selectedCode)
  return selectedLabel ? `Events in ${selectedLabel}` : "Events across Europe"
}

function sectionEyebrow(selectedCode: Selection): string {
  if (selectedCode === "ALL") return "Across Europe"
  return "Discover events"
}

/** Short label for homepage cards (detail page keeps full copy). */
function homepagePriceLabel(label?: string): string | undefined {
  if (!label?.trim()) return undefined
  return label.replace(/^starting\s+from\s+/i, "from ")
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

export function LocalRaces() {
  /** Country filter (ISO codes aligned with `EUROPEAN_COUNTRIES` / mock races). */
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<Selection>(DEFAULT_SELECTED_COUNTRY_CODE)
  const [countryQuery, setCountryQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const racesCarouselRef = useRef<HTMLDivElement>(null)
  const [racesCarouselPaused, setRacesCarouselPaused] = useState(false)
  const scrollRacesNextRef = useRef<() => void>(() => {})

  const selectedCountryLabel = labelForCountryCode(selectedCountryCode)

  const filteredRaces = useMemo(() => {
    const base =
      selectedCountryCode === "ALL" ? MOCK_RACES : MOCK_RACES.filter((r) => r.countryCode === selectedCountryCode)
    return sortRacesByEventDateSoonestFirst(base)
  }, [selectedCountryCode])

  const scrollRacesPrev = useCallback(() => {
    const el = racesCarouselRef.current
    if (!el) return
    homeCarouselScrollPrevLoop(el)
  }, [])

  const scrollRacesNext = useCallback(() => {
    const el = racesCarouselRef.current
    if (!el) return
    homeCarouselScrollNextLoop(el)
  }, [])

  scrollRacesNextRef.current = scrollRacesNext

  useEffect(() => {
    racesCarouselRef.current?.scrollTo({ left: 0, behavior: "auto" })
  }, [selectedCountryCode, filteredRaces.length])

  useEffect(() => {
    if (filteredRaces.length <= 1) return
    if (racesCarouselPaused) return
    const id = window.setInterval(() => scrollRacesNextRef.current(), 5000)
    return () => window.clearInterval(id)
  }, [filteredRaces.length, racesCarouselPaused, selectedCountryCode])

  const searchMatches = useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return []
    return EUROPEAN_COUNTRIES.filter(
      (c) => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    )
  }, [countryQuery])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!searchWrapRef.current?.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  const heading = sectionHeading(selectedCountryCode)
  const eyebrow = sectionEyebrow(selectedCountryCode)

  const contextLine = useMemo(() => {
    if (selectedCountryCode === "ALL") {
      return "Highlights across Lithuania and Europe’s most active race regions."
    }
    const label = selectedCountryLabel ?? "this region"
    return `Curated races in ${label}.`
  }, [selectedCountryCode, selectedCountryLabel])

  const chipBase =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-xl transition-colors duration-200 md:gap-2 md:px-3 md:py-1.5 md:text-sm"

  return (
    <section className={`relative overflow-x-hidden border-t border-border/30 ${HOME_SECTION_PY}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-[#3b82f6]/6 blur-[95px]" />
      </div>

      <div className={HOME_SECTION_INNER}>
        <div className={HOME_SECTION_HEADER_ROW}>
          <div className="min-w-0 max-w-full flex-1 sm:pr-4">
            <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
              <span className="size-1 shrink-0 animate-pulse rounded-full bg-primary" />
              <span className="truncate">{eyebrow}</span>
            </div>
            <h2 className="text-balance break-words text-xl font-black tracking-tight text-foreground sm:text-3xl md:text-5xl">
              {heading}
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground md:text-base">
              {contextLine}
            </p>
          </div>
          <Link to={exploreHref({ eventType: "local" })} className={HOME_VIEW_ALL_PILL}>
            View all
            <ChevronRight className="size-4 shrink-0 opacity-90" />
          </Link>
        </div>

        <div className="mb-4 grid min-w-0 w-full max-w-full grid-cols-1 gap-2 md:mb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-5 md:gap-y-2">
          <div
            className="-mx-4 flex min-w-0 flex-nowrap gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 md:pr-2"
            role="group"
            aria-label="Country filters"
          >
            {CHIP_FILTER_OPTIONS.map((opt) => {
              const active = selectedCountryCode === opt.code
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountryCode(opt.code)
                    setCountryQuery("")
                    setSearchOpen(false)
                  }}
                  aria-pressed={active}
                  className={`${chipBase} ${
                    active
                      ? "border-primary/40 bg-primary/[0.14] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-primary/20"
                      : "border-border/55 bg-background/40 text-foreground/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.02] hover:border-primary/25 hover:bg-secondary/50"
                  }`}
                >
                  {opt.flag ? (
                    <span className="text-sm leading-none md:text-base" aria-hidden="true">
                      {opt.flag}
                    </span>
                  ) : null}
                  <span className="whitespace-nowrap">{opt.label}</span>
                </button>
              )
            })}
          </div>
          <div ref={searchWrapRef} className="relative w-full min-w-0 shrink-0 md:w-[13rem] md:justify-self-end">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={countryQuery}
              onChange={(e) => {
                setCountryQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Find country…"
              role="combobox"
              aria-expanded={searchOpen && countryQuery.trim().length > 0}
              aria-controls="local-races-country-results"
              aria-autocomplete="list"
              className="relative z-10 h-8 w-full min-w-0 max-w-full rounded-full border border-border/55 bg-background/40 pl-9 pr-3 text-[11px] text-foreground placeholder:text-muted-foreground/65 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.02] transition-colors focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/15 md:h-9 md:text-[13px]"
              aria-label="Search European countries"
            />
            {searchOpen && countryQuery.trim().length > 0 ? (
              <ul
                id="local-races-country-results"
                role="listbox"
                className="scrollbar-hide absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/55 bg-card/95 py-1 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04] backdrop-blur-xl"
              >
                {searchMatches.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-muted-foreground">No matching countries</li>
                ) : (
                  searchMatches.map((c) => (
                    <li key={c.code} role="presentation">
                      <button
                        type="button"
                        role="option"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-primary/[0.08]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedCountryCode(c.code)
                          setCountryQuery("")
                          setSearchOpen(false)
                        }}
                      >
                        <span className="text-base leading-none" aria-hidden="true">
                          {c.flag}
                        </span>
                        <span className="min-w-0 truncate">{c.label}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        </div>

        <div
          className="relative min-w-0 w-full max-w-full"
          onMouseEnter={() => setRacesCarouselPaused(true)}
          onMouseLeave={() => setRacesCarouselPaused(false)}
        >
          {filteredRaces.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous race"
                aria-controls="local-races-carousel"
                className={`${HOME_CAROUSEL_ARROW_CLASS} left-0 flex sm:left-1`}
                onClick={scrollRacesPrev}
              >
                <ChevronLeft className="size-5 opacity-95 sm:size-[22px]" />
              </button>
              <button
                type="button"
                aria-label="Next race"
                aria-controls="local-races-carousel"
                className={`${HOME_CAROUSEL_ARROW_CLASS} right-0 flex sm:right-1`}
                onClick={scrollRacesNext}
              >
                <ChevronRight className="size-5 opacity-95 sm:size-[22px]" />
              </button>
            </>
          ) : null}
          <div
            ref={racesCarouselRef}
            id="local-races-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label={heading}
            className={`${HOME_RACE_CAROUSEL_STRIP} max-w-full`}
          >
            {filteredRaces.map((race) => (
              <div
                key={race.id}
                className={HOME_CARD_SLIDE}
              >
                <RaceCard
                  mode="local"
                  homeMinimal
                  sportKey={sportKeyFromLabel(race.raceType)}
                  title={race.title}
                  locationLine={`${race.city}, ${race.countryName}`}
                  flag={FLAG_BY_CODE[race.countryCode] ?? "🏁"}
                  dateLabel={race.dateLabel}
                  imageUrl={race.imageUrl}
                  distances={race.distances}
                  to={`/race/${race.id}`}
                  startingPriceLabel={homepagePriceLabel(race.startingPriceLabel)}
                  registrationStatus={race.registrationStatus}
                  priceNote={race.priceNote}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
