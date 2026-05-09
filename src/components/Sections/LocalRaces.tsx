import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MOCK_RACES_LIST as MOCK_RACES } from "../../data"
import { EUROPEAN_COUNTRIES, EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { RaceCard } from "../cards/RaceCard"
import { sportKeyFromLabel } from "../sportTokens"

const FLAG_BY_CODE = EUROPE_FLAG_BY_CODE

type Selection = "ALL" | string

/** Default chip selection — Lithuania. */
const DEFAULT_SELECTED_COUNTRY_CODE: Selection = "LT"

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

const CAROUSEL_ARROW_CLASS =
  "pointer-events-auto absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8d4b0]/35 bg-[#0c1018]/65 text-[#f0e6d4] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_-12px_rgba(0,0,0,0.75)] backdrop-blur-xl transition hover:border-primary/40 hover:bg-[#0c1018]/78 hover:text-primary active:scale-[0.96] sm:size-11"

function scrollStepPx(scrollEl: HTMLDivElement): number {
  const first = scrollEl.firstElementChild as HTMLElement | undefined
  if (!first) return 336
  const style = getComputedStyle(scrollEl)
  const gapRaw = style.columnGap || style.gap || "16px"
  const gap = Number.parseFloat(gapRaw) || 16
  return first.offsetWidth + gap
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
    if (selectedCountryCode === "ALL") return MOCK_RACES
    return MOCK_RACES.filter((r) => r.countryCode === selectedCountryCode)
  }, [selectedCountryCode])

  const scrollRacesPrev = useCallback(() => {
    const el = racesCarouselRef.current
    if (!el) return
    const step = scrollStepPx(el)
    const maxScroll = el.scrollWidth - el.clientWidth
    const atStart = el.scrollLeft <= 2
    if (atStart) {
      el.scrollTo({ left: maxScroll, behavior: "smooth" })
    } else {
      el.scrollBy({ left: -step, behavior: "smooth" })
    }
  }, [])

  const scrollRacesNext = useCallback(() => {
    const el = racesCarouselRef.current
    if (!el) return
    const step = scrollStepPx(el)
    const maxScroll = el.scrollWidth - el.clientWidth
    const atEnd = el.scrollLeft >= maxScroll - 2
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" })
    } else {
      el.scrollBy({ left: step, behavior: "smooth" })
    }
  }, [])

  scrollRacesNextRef.current = scrollRacesNext

  useEffect(() => {
    racesCarouselRef.current?.scrollTo({ left: 0, behavior: "auto" })
  }, [selectedCountryCode, filteredRaces.length])

  useEffect(() => {
    if (filteredRaces.length <= 1) return
    if (racesCarouselPaused) return
    const id = window.setInterval(() => scrollRacesNextRef.current(), 3000)
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
    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-xl transition-colors duration-200"

  return (
    <section className="relative overflow-x-hidden border-t border-border/30 py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-[#22c55e]/5 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex min-w-0 flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 max-w-full flex-1 sm:pr-4">
            <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
              <span className="size-1 shrink-0 animate-pulse rounded-full bg-primary" />
              <span className="truncate">{eyebrow}</span>
            </div>
            <h2 className="text-balance break-words text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {heading}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {contextLine}
            </p>
          </div>
          <a
            href="#"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start whitespace-nowrap rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-2 text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:border-primary/40 hover:bg-primary/[0.11] sm:mt-1"
          >
            View all countries
            <ChevronRight className="size-4 shrink-0 opacity-90" />
          </a>
        </div>

        <div className="mb-5 grid min-w-0 w-full max-w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-5 md:gap-y-2">
          <div
            className="flex min-w-0 flex-wrap content-start gap-2 md:pr-2"
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
                      : "border-white/[0.1] bg-[#0a0d14]/45 text-foreground/90 ring-white/[0.04] hover:border-primary/28 hover:bg-[#0a0d14]/70"
                  }`}
                >
                  {opt.flag ? (
                    <span className="text-base leading-none" aria-hidden="true">
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
              className="relative z-10 h-9 w-full min-w-0 max-w-full rounded-full border border-white/[0.09] bg-[#0a0d14]/55 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/65 backdrop-blur-xl ring-1 ring-white/[0.04] transition-colors focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/15 md:text-[13px]"
              aria-label="Search European countries"
            />
            {searchOpen && countryQuery.trim().length > 0 ? (
              <ul
                id="local-races-country-results"
                role="listbox"
                className="scrollbar-hide absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/[0.09] bg-[#0a0d14]/95 py-1 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.06] backdrop-blur-xl"
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
                className={`${CAROUSEL_ARROW_CLASS} left-0 sm:left-1`}
                onClick={scrollRacesPrev}
              >
                <ChevronLeft className="size-5 opacity-95 sm:size-[22px]" />
              </button>
              <button
                type="button"
                aria-label="Next race"
                aria-controls="local-races-carousel"
                className={`${CAROUSEL_ARROW_CLASS} right-0 sm:right-1`}
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
            className="flex min-w-0 w-full max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {filteredRaces.map((race) => (
              <RaceCard
                key={race.id}
                mode="local"
                compactListing
                sportKey={sportKeyFromLabel(race.raceType)}
                title={race.title}
                locationLine={`${race.city}, ${race.countryName}`}
                flag={FLAG_BY_CODE[race.countryCode] ?? "🏁"}
                dateLabel={race.dateLabel}
                imageUrl={race.imageUrl}
                distances={race.distances}
                daysUntil={race.daysUntil}
                to={`/race/${race.id}`}
                startingPriceLabel={homepagePriceLabel(race.startingPriceLabel)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
