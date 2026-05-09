import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import { computeDaysUntilRace, MOCK_RACE_DETAILS, type MockRaceDetail } from "../../data"
import { EUROPEAN_COUNTRIES, EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { RaceCard } from "../../components/cards/RaceCard"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"
import { sportKeyFromLabel, SPORT_STYLES, type SportKey } from "../../components/sportTokens"
import { ExploreDatePicker } from "./ExploreDatePicker"
import { ExploreEventsMap } from "./ExploreEventsMap"
import {
  EMPTY_APPLIED_FILTERS,
  EXPLORE_COURSE_OPTIONS,
  EXPLORE_DISTANCE_OPTIONS,
  EXPLORE_EVENT_TYPE_LABELS,
  EXPLORE_EVENT_TYPE_OPTIONS,
  EXPLORE_SPORT_OPTIONS,
  filterExploreRaces,
  formatAppliedDateChip,
  formatRaceDateLabel,
  parseEventTypeQueryParam,
  parseSportQueryParam,
  type AppliedDateFilter,
  type AppliedExploreFilters,
  type ExploreCourseOption,
  type ExploreDistanceOption,
  type ExploreEventTypeOption,
} from "./exploreFilters"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/90 px-3 py-2 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/45 focus:border-primary/40 focus:ring-2"

const BTN_SECONDARY =
  "rounded-lg border border-border/55 bg-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/35 hover:bg-secondary/60 hover:text-foreground"

const BTN_PRIMARY_SM =
  "rounded-lg bg-primary/90 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition hover:bg-primary"

function homepagePriceLabel(label?: string): string | undefined {
  if (!label?.trim()) return undefined
  return label.replace(/^starting\s+from\s+/i, "from ")
}

function toggleMember<T extends string>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

const SPORT_KEY_BY_LABEL: Record<(typeof EXPLORE_SPORT_OPTIONS)[number], SportKey> = {
  Running: "running",
  Triathlon: "triathlon",
  Cycling: "cycling",
  HYROX: "hyrox",
}

const CHIP_TOGGLE_BASE =
  "rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function ToggleChip({
  active,
  children,
  onClick,
  className = "",
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CHIP_TOGGLE_BASE} ${
        active
          ? "border-primary/55 bg-primary/18 text-primary shadow-inner shadow-primary/10"
          : "border-border/50 bg-background/55 text-muted-foreground hover:border-primary/35 hover:bg-secondary/50 hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  )
}

type DateDraftMode = "exact" | "range" | "month"

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type FilterShellProps = {
  title: string
  summary?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

function FilterShell({ title, summary, open, onToggle, children }: FilterShellProps) {
  return (
    <div className="rounded-2xl border border-border/45 bg-background/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-foreground">{title}</span>
        <span className="flex items-center gap-2">
          {summary ? (
            <span className="hidden max-w-[140px] truncate text-[11px] font-medium text-primary/90 sm:inline">{summary}</span>
          ) : null}
          <Chevron open={open} />
        </span>
      </button>
      {open ? <div className="border-t border-border/40 px-4 pb-4 pt-1">{children}</div> : null}
    </div>
  )
}

function FilterActions({ onApply, onClear }: { onApply: () => void; onClear: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className={BTN_PRIMARY_SM} onClick={onApply}>
        Apply
      </button>
      <button type="button" className={BTN_SECONDARY} onClick={onClear}>
        Clear
      </button>
    </div>
  )
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [applied, setApplied] = useState<AppliedExploreFilters>(EMPTY_APPLIED_FILTERS)

  useEffect(() => {
    const q = searchParams.get("q")
    setSearch(q ?? "")
    setApplied((prev) => {
      const next = { ...prev }
      if (searchParams.has("sport")) {
        next.sports = parseSportQueryParam(searchParams.get("sport"))
      }
      if (searchParams.has("eventType")) {
        next.eventTypes = parseEventTypeQueryParam(searchParams.get("eventType"))
      }
      return next
    })
  }, [searchParams])

  const [openSport, setOpenSport] = useState(true)
  const [openDate, setOpenDate] = useState(false)
  const [openDistance, setOpenDistance] = useState(false)
  const [openEventType, setOpenEventType] = useState(false)
  const [openCountry, setOpenCountry] = useState(false)
  const [openCourse, setOpenCourse] = useState(false)

  const [draftSports, setDraftSports] = useState<string[]>([])
  const [draftDistances, setDraftDistances] = useState<ExploreDistanceOption[]>([])
  const [draftEventTypes, setDraftEventTypes] = useState<ExploreEventTypeOption[]>([])
  const [draftCountries, setDraftCountries] = useState<string[]>([])
  const [draftCourseTypes, setDraftCourseTypes] = useState<ExploreCourseOption[]>([])
  const [countryQuery, setCountryQuery] = useState("")

  const [draftDateMode, setDraftDateMode] = useState<DateDraftMode>("exact")
  const [draftExact, setDraftExact] = useState("")
  const [draftFrom, setDraftFrom] = useState("")
  const [draftTo, setDraftTo] = useState("")
  const [draftMonth, setDraftMonth] = useState("")
  const [dateError, setDateError] = useState<string | null>(null)

  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false)
  const [mapViewOpen, setMapViewOpen] = useState(false)

  const syncDraftSport = useCallback(() => setDraftSports([...applied.sports]), [applied.sports])
  const syncDraftDistance = useCallback(() => setDraftDistances([...applied.distances]), [applied.distances])
  const syncDraftEventTypes = useCallback(() => setDraftEventTypes([...applied.eventTypes]), [applied.eventTypes])
  const syncDraftCountry = useCallback(() => setDraftCountries([...applied.countries]), [applied.countries])
  const syncDraftCourse = useCallback(() => setDraftCourseTypes([...applied.courseTypes]), [applied.courseTypes])

  const syncDraftDate = useCallback(() => {
    const d = applied.date
    setDateError(null)
    if (d.kind === "none") {
      setDraftDateMode("exact")
      setDraftExact("")
      setDraftFrom("")
      setDraftTo("")
      setDraftMonth("")
      return
    }
    if (d.kind === "exact") {
      setDraftDateMode("exact")
      setDraftExact(d.iso)
      return
    }
    if (d.kind === "range") {
      setDraftDateMode("range")
      setDraftFrom(d.from)
      setDraftTo(d.to)
      return
    }
    setDraftDateMode("month")
    setDraftMonth(d.yearMonth)
  }, [applied.date])

  useEffect(() => {
    if (openSport) syncDraftSport()
  }, [openSport, syncDraftSport])

  useEffect(() => {
    if (openDate) syncDraftDate()
  }, [openDate, syncDraftDate])

  useEffect(() => {
    if (openDistance) syncDraftDistance()
  }, [openDistance, syncDraftDistance])

  useEffect(() => {
    if (openEventType) syncDraftEventTypes()
  }, [openEventType, syncDraftEventTypes])

  useEffect(() => {
    if (openCountry) syncDraftCountry()
  }, [openCountry, syncDraftCountry])

  useEffect(() => {
    if (openCourse) syncDraftCourse()
  }, [openCourse, syncDraftCourse])

  useEffect(() => {
    if (!filtersDrawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [filtersDrawerOpen])

  const filtered = useMemo(
    () => filterExploreRaces(MOCK_RACE_DETAILS, applied, search),
    [applied, search],
  )

  const applySports = () => {
    const sports = [...draftSports]
    setApplied((a) => ({ ...a, sports }))
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      if (sports.length) p.set("sport", sports.join(","))
      else p.delete("sport")
      return p
    }, { replace: true })
  }
  const clearSports = () => {
    setDraftSports([])
    setApplied((a) => ({ ...a, sports: [] }))
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.delete("sport")
      return p
    }, { replace: true })
  }

  const applyDistances = () => setApplied((a) => ({ ...a, distances: [...draftDistances] }))
  const clearDistances = () => {
    setDraftDistances([])
    setApplied((a) => ({ ...a, distances: [] }))
  }

  const applyEventTypes = () => {
    const eventTypes = [...draftEventTypes]
    setApplied((a) => ({ ...a, eventTypes }))
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      if (eventTypes.length) {
        p.set(
          "eventType",
          eventTypes.map((et) => EXPLORE_EVENT_TYPE_LABELS[et]).join(","),
        )
      } else p.delete("eventType")
      return p
    }, { replace: true })
  }
  const clearEventTypes = () => {
    setDraftEventTypes([])
    setApplied((a) => ({ ...a, eventTypes: [] }))
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.delete("eventType")
      return p
    }, { replace: true })
  }

  const applyCountries = () => setApplied((a) => ({ ...a, countries: [...draftCountries] }))
  const clearCountries = () => {
    setDraftCountries([])
    setCountryQuery("")
    setApplied((a) => ({ ...a, countries: [] }))
  }

  const applyCourse = () => setApplied((a) => ({ ...a, courseTypes: [...draftCourseTypes] }))
  const clearCourse = () => {
    setDraftCourseTypes([])
    setApplied((a) => ({ ...a, courseTypes: [] }))
  }

  const applyDate = () => {
    setDateError(null)
    let next: AppliedDateFilter = { kind: "none" }
    if (draftDateMode === "exact") {
      if (!draftExact) {
        setDateError("Pick a date.")
        return
      }
      next = { kind: "exact", iso: draftExact }
    } else if (draftDateMode === "range") {
      if (!draftFrom || !draftTo) {
        setDateError("Choose both start and end dates.")
        return
      }
      if (draftFrom > draftTo) {
        setDateError("End date must be on or after start date.")
        return
      }
      next = { kind: "range", from: draftFrom, to: draftTo }
    } else {
      if (!draftMonth) {
        setDateError("Pick a month.")
        return
      }
      next = { kind: "month", yearMonth: draftMonth }
    }
    setApplied((a) => ({ ...a, date: next }))
  }

  const clearDate = () => {
    setDateError(null)
    setDraftDateMode("exact")
    setDraftExact("")
    setDraftFrom("")
    setDraftTo("")
    setDraftMonth("")
    setApplied((a) => ({ ...a, date: { kind: "none" } }))
  }

  const clearAll = () => {
    setSearch("")
    setApplied(EMPTY_APPLIED_FILTERS)
    setDraftSports([])
    setDraftDistances([])
    setDraftEventTypes([])
    setDraftCountries([])
    setDraftCourseTypes([])
    setDateError(null)
    setDraftDateMode("exact")
    setDraftExact("")
    setDraftFrom("")
    setDraftTo("")
    setDraftMonth("")
    setCountryQuery("")
    setMapViewOpen(false)
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.delete("q")
      p.delete("sport")
      p.delete("eventType")
      return p
    }, { replace: true })
  }

  const chipRows = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []

    for (const s of applied.sports) {
      chips.push({
        key: `sport:${s}`,
        label: s,
        onRemove: () =>
          setApplied((a) => {
            const sports = a.sports.filter((x) => x !== s)
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev)
              if (sports.length) p.set("sport", sports.join(","))
              else p.delete("sport")
              return p
            }, { replace: true })
            return { ...a, sports }
          }),
      })
    }

    const dateLabel = formatAppliedDateChip(applied.date)
    if (dateLabel) {
      chips.push({
        key: "date",
        label: `Date: ${dateLabel}`,
        onRemove: () => setApplied((a) => ({ ...a, date: { kind: "none" } })),
      })
    }

    for (const d of applied.distances) {
      chips.push({
        key: `dist:${d}`,
        label: d,
        onRemove: () => setApplied((a) => ({ ...a, distances: a.distances.filter((x) => x !== d) })),
      })
    }

    for (const et of applied.eventTypes) {
      chips.push({
        key: `et:${et}`,
        label: EXPLORE_EVENT_TYPE_LABELS[et],
        onRemove: () =>
          setApplied((a) => {
            const eventTypes = a.eventTypes.filter((x) => x !== et)
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev)
              if (eventTypes.length) {
                p.set(
                  "eventType",
                  eventTypes.map((e) => EXPLORE_EVENT_TYPE_LABELS[e]).join(","),
                )
              } else p.delete("eventType")
              return p
            }, { replace: true })
            return { ...a, eventTypes }
          }),
      })
    }

    for (const code of applied.countries) {
      const c = EUROPEAN_COUNTRIES.find((x) => x.code === code)
      chips.push({
        key: `ct:${code}`,
        label: c ? `${c.flag} ${c.label}` : code,
        onRemove: () => setApplied((a) => ({ ...a, countries: a.countries.filter((x) => x !== code) })),
      })
    }

    for (const ct of applied.courseTypes) {
      chips.push({
        key: `course:${ct}`,
        label: ct,
        onRemove: () => setApplied((a) => ({ ...a, courseTypes: a.courseTypes.filter((x) => x !== ct) })),
      })
    }

    return chips
  }, [applied, setSearchParams])

  const hasActiveFilters = chipRows.length > 0 || search.trim().length > 0

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return EUROPEAN_COUNTRIES
    return EUROPEAN_COUNTRIES.filter((c) => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [countryQuery])

  const sportSummary =
    applied.sports.length === 0 ? undefined : applied.sports.length <= 2 ? applied.sports.join(", ") : `${applied.sports.length} selected`

  const distanceSummary =
    applied.distances.length === 0 ? undefined : applied.distances.length <= 2 ? applied.distances.join(", ") : `${applied.distances.length} distances`

  const eventTypeSummary =
    applied.eventTypes.length === 0
      ? undefined
      : applied.eventTypes.length <= 2
        ? applied.eventTypes.map((e) => EXPLORE_EVENT_TYPE_LABELS[e]).join(", ")
        : `${applied.eventTypes.length} event types`

  const countrySummary =
    applied.countries.length === 0
      ? undefined
      : applied.countries.length <= 2
        ? applied.countries.map((code) => EUROPEAN_COUNTRIES.find((c) => c.code === code)?.label ?? code).join(", ")
        : `${applied.countries.length} countries`

  const courseSummary =
    applied.courseTypes.length === 0
      ? undefined
      : applied.courseTypes.length <= 2
        ? applied.courseTypes.join(", ")
        : `${applied.courseTypes.length} terrain tags`

  const dateSummary = formatAppliedDateChip(applied.date) ?? undefined

  const renderRaceCard = (race: MockRaceDetail) => (
    <RaceCard
      key={race.id}
      mode="local"
      compactListing
      sportKey={sportKeyFromLabel(race.sport)}
      title={race.title}
      locationLine={`${race.city}, ${race.country}`}
      flag={EUROPE_FLAG_BY_CODE[race.countryCode] ?? "🏁"}
      dateLabel={formatRaceDateLabel(race.date)}
      imageUrl={race.image}
      distances={race.distances}
      daysUntil={computeDaysUntilRace(race.date)}
      to={`/race/${race.id}`}
      startingPriceLabel={homepagePriceLabel(race.startingPriceLabel)}
    />
  )

  const filterPanelInner = (
    <div className="flex flex-col gap-3">
      <FilterShell
        title="Sport type"
        summary={sportSummary}
        open={openSport}
        onToggle={() => setOpenSport((v) => !v)}
      >
        <div className="mt-2 grid grid-cols-2 gap-2">
          {EXPLORE_SPORT_OPTIONS.map((s) => {
            const sk = SPORT_KEY_BY_LABEL[s]
            const st = SPORT_STYLES[sk]
            const active = draftSports.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => setDraftSports((prev) => toggleMember(prev, s))}
                className={`rounded-2xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "border-primary/55 bg-gradient-to-br from-primary/[0.18] to-primary/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-primary/30"
                    : "border-border/50 bg-background/45 hover:border-primary/35 hover:bg-secondary/40"
                }`}
              >
                <span className="text-2xl leading-none">{st.emoji}</span>
                <span className="mt-2 block text-[13px] font-black tracking-tight text-foreground">{st.label}</span>
              </button>
            )
          })}
        </div>
        <FilterActions onApply={applySports} onClear={clearSports} />
      </FilterShell>

      <FilterShell title="Date" summary={dateSummary} open={openDate} onToggle={() => setOpenDate((v) => !v)}>
        <div className="mt-2 flex rounded-xl border border-border/45 bg-background/35 p-0.5">
          {(["exact", "range", "month"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setDraftDateMode(id)}
              className={`flex-1 rounded-[10px] py-2 text-[11px] font-bold uppercase tracking-wide transition sm:text-xs ${
                draftDateMode === id ? "bg-primary/22 text-primary shadow-inner shadow-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {id === "exact" ? "Exact date" : id === "range" ? "Date range" : "Month"}
            </button>
          ))}
        </div>

        <ExploreDatePicker
          key={draftDateMode}
          mode={draftDateMode}
          exactIso={draftExact}
          rangeFrom={draftFrom}
          rangeTo={draftTo}
          monthYm={draftMonth}
          onSelectExact={setDraftExact}
          onSelectRange={(from, to) => {
            setDraftFrom(from)
            setDraftTo(to)
          }}
          onSelectMonth={setDraftMonth}
        />

        {dateError ? (
          <p className="mt-2 text-xs text-red-300/95" role="alert">
            {dateError}
          </p>
        ) : null}

        <FilterActions onApply={applyDate} onClear={clearDate} />
      </FilterShell>

      <FilterShell title="Distance" summary={distanceSummary} open={openDistance} onToggle={() => setOpenDistance((v) => !v)}>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXPLORE_DISTANCE_OPTIONS.map((d) => (
            <ToggleChip
              key={d}
              active={draftDistances.includes(d)}
              onClick={() => setDraftDistances((prev) => toggleMember(prev, d))}
            >
              {d}
            </ToggleChip>
          ))}
        </div>
        <FilterActions onApply={applyDistances} onClear={clearDistances} />
      </FilterShell>

      <FilterShell
        title="Event type"
        summary={eventTypeSummary}
        open={openEventType}
        onToggle={() => setOpenEventType((v) => !v)}
      >
        <div className="mt-2 flex flex-col gap-2">
          {EXPLORE_EVENT_TYPE_OPTIONS.map((et) => (
            <ToggleChip
              key={et}
              active={draftEventTypes.includes(et)}
              onClick={() => setDraftEventTypes((prev) => toggleMember(prev, et))}
              className="w-full justify-center py-2 text-[13px]"
            >
              {EXPLORE_EVENT_TYPE_LABELS[et]}
            </ToggleChip>
          ))}
        </div>
        <FilterActions onApply={applyEventTypes} onClear={clearEventTypes} />
      </FilterShell>

      <FilterShell title="Country" summary={countrySummary} open={openCountry} onToggle={() => setOpenCountry((v) => !v)}>
        <input
          type="search"
          value={countryQuery}
          onChange={(e) => setCountryQuery(e.target.value)}
          placeholder="Search countries…"
          className={`${FIELD_CLASS} mt-2`}
          autoComplete="off"
        />
        <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-border/40 bg-background/40 scrollbar-hide">
          {filteredCountries.map((c) => {
            const checked = draftCountries.includes(c.code)
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setDraftCountries((prev) => toggleMember(prev, c.code))}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/[0.04] ${checked ? "bg-primary/10 text-primary" : "text-foreground"}`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 truncate">{c.label}</span>
                {checked ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="text-primary" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </button>
            )
          })}
        </div>
        <FilterActions onApply={applyCountries} onClear={clearCountries} />
      </FilterShell>

      <FilterShell title="Course type" summary={courseSummary} open={openCourse} onToggle={() => setOpenCourse((v) => !v)}>
        <div className="mt-2 flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-0.5 scrollbar-hide">
          {EXPLORE_COURSE_OPTIONS.map((c) => (
            <ToggleChip
              key={c}
              active={draftCourseTypes.includes(c)}
              onClick={() => setDraftCourseTypes((prev) => toggleMember(prev, c))}
            >
              {c}
            </ToggleChip>
          ))}
        </div>
        <FilterActions onApply={applyCourse} onClear={clearCourse} />
      </FilterShell>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#a855f7]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 lg:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">Discover</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">Explore events</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Find running, triathlon, cycling and HYROX events across Europe.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="m21 21-4.34-4.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by event, city, or country…"
                  className={`${FIELD_CLASS} pl-10`}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition lg:hidden ${
                  filtersDrawerOpen
                    ? "border-primary/45 bg-primary/15 text-primary"
                    : "border-border/55 bg-secondary/50 text-foreground hover:border-primary/35"
                }`}
                onClick={() => setFiltersDrawerOpen(true)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M4 6h16M8 12h8M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Filters
              </button>
            </div>
          </header>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <aside className="hidden w-full max-w-[320px] shrink-0 lg:block">{filterPanelInner}</aside>

            <div className="min-w-0 flex-1">
              {(chipRows.length > 0 || search.trim()) ? (
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {search.trim() ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("")
                          setSearchParams((prev) => {
                            const p = new URLSearchParams(prev)
                            p.delete("q")
                            return p
                          }, { replace: true })
                        }}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/30 bg-primary/12 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/18"
                      >
                        <span className="truncate">Search: “{search.trim()}”</span>
                        <span className="text-muted-foreground" aria-hidden="true">
                          ×
                        </span>
                      </button>
                    ) : null}
                    {chipRows.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.onRemove}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/55 bg-secondary/50 px-3 py-1 text-xs font-semibold text-foreground transition hover:border-red-400/35 hover:bg-red-950/25"
                      >
                        <span className="truncate">{c.label}</span>
                        <span className="text-muted-foreground" aria-hidden="true">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                  {hasActiveFilters ? (
                    <button type="button" onClick={clearAll} className={`${BTN_SECONDARY} self-start sm:self-auto`}>
                      Clear all filters
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "event" : "events"}
                </p>
                <button
                  type="button"
                  onClick={() => setMapViewOpen((v) => !v)}
                  className={`inline-flex items-center justify-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition sm:self-auto ${
                    mapViewOpen
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                  }`}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Map view
                </button>
              </div>

              {mapViewOpen ? <ExploreEventsMap races={filtered} /> : null}

              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-border/45 bg-secondary/25 px-6 py-16 text-center backdrop-blur-xl">
                  <p className="text-lg font-bold text-foreground">No events match</p>
                  <p className="mt-2 text-sm text-muted-foreground">Try widening filters or clearing search.</p>
                  <button type="button" className={`${BTN_PRIMARY_SM} mt-6 px-5 py-2`} onClick={clearAll}>
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(renderRaceCard)}</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {filtersDrawerOpen ? (
        <div className="fixed inset-0 z-[65] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Close filters"
            onClick={() => setFiltersDrawerOpen(false)}
          />
          <div className="explore-filters-drawer-panel absolute right-0 top-0 flex h-full w-[min(100%,380px)] flex-col border-l border-border/45 bg-background/95 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/45 px-4 py-3">
              <span className="text-sm font-black text-foreground">Filters</span>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary/80 hover:text-foreground"
                aria-label="Close"
                onClick={() => setFiltersDrawerOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{filterPanelInner}</div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  )
}
