import { useEffect, useMemo, useState } from "react"

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export function isoFromParts(y: number, m0: number, d: number): string {
  return `${y}-${pad2(m0 + 1)}-${pad2(d)}`
}

function parseIso(iso: string): { y: number; m0: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  if (!Number.isFinite(y) || mo < 0 || mo > 11 || d < 1 || d > 31) return null
  return { y, m0: mo, d }
}

function todayIsoLocal(): string {
  const t = new Date()
  return isoFromParts(t.getFullYear(), t.getMonth(), t.getDate())
}

function daysInMonth(y: number, m0: number): number {
  return new Date(y, m0 + 1, 0).getDate()
}

function startWeekday(y: number, m0: number): number {
  return new Date(y, m0, 1).getDay()
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

export type ExploreDatePickerProps = {
  mode: "exact" | "range" | "month"
  exactIso: string
  rangeFrom: string
  rangeTo: string
  monthYm: string
  onSelectExact: (iso: string) => void
  onSelectRange: (from: string, to: string) => void
  onSelectMonth: (ym: string) => void
}

export function ExploreDatePicker({
  mode,
  exactIso,
  rangeFrom,
  rangeTo,
  monthYm,
  onSelectExact,
  onSelectRange,
  onSelectMonth,
}: ExploreDatePickerProps) {
  const seedIso = exactIso || rangeFrom || rangeTo || todayIsoLocal()
  const seed = parseIso(seedIso) ?? parseIso(todayIsoLocal())!

  const [cursorY, setCursorY] = useState(seed.y)
  const [cursorM0, setCursorM0] = useState(seed.m0)
  const [rangeYear, setRangeYear] = useState(() => {
    const ym = /^(\d{4})-(\d{2})$/.exec(monthYm.trim())
    if (ym) return Number(ym[1])
    return seed.y
  })

  useEffect(() => {
    const ym = /^(\d{4})-(\d{2})$/.exec(monthYm.trim())
    if (ym) setRangeYear(Number(ym[1]))
  }, [monthYm])

  const cells = useMemo(() => {
    const dim = daysInMonth(cursorY, cursorM0)
    const lead = startWeekday(cursorY, cursorM0)
    const out: ({ iso: string; day: number } | null)[] = []
    for (let i = 0; i < lead; i++) out.push(null)
    for (let d = 1; d <= dim; d++) out.push({ day: d, iso: isoFromParts(cursorY, cursorM0, d) })
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [cursorY, cursorM0])

  const prevMonth = () => {
    setCursorM0((m) => {
      if (m <= 0) {
        setCursorY((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }

  const nextMonth = () => {
    setCursorM0((m) => {
      if (m >= 11) {
        setCursorY((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }

  const handleDayClick = (iso: string) => {
    if (mode === "exact") {
      onSelectExact(iso)
      return
    }
    if (mode === "range") {
      if (!rangeFrom || (rangeFrom && rangeTo)) {
        onSelectRange(iso, "")
        return
      }
      if (iso < rangeFrom) onSelectRange(iso, rangeFrom)
      else onSelectRange(rangeFrom, iso)
    }
  }

  if (mode === "month") {
    const selectedYm = monthYm.trim()
    return (
      <div className="mt-3 rounded-2xl border border-border/40 bg-background/50 p-3 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous year"
            onClick={() => setRangeYear((y) => y - 1)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-sm font-black text-foreground">{rangeYear}</span>
          <button
            type="button"
            aria-label="Next year"
            onClick={() => setRangeYear((y) => y + 1)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTH_LABELS.map((label, i) => {
            const ym = `${rangeYear}-${pad2(i + 1)}`
            const active = selectedYm === ym
            return (
              <button
                key={label}
                type="button"
                onClick={() => onSelectMonth(ym)}
                className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                  active
                    ? "border-primary/55 bg-primary/18 text-primary shadow-inner shadow-primary/10"
                    : "border-border/45 bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-2xl border border-border/40 bg-background/50 p-3 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={prevMonth}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-black text-foreground">
          {MONTH_LABELS[cursorM0]} {cursorY}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={nextMonth}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`e-${idx}`} className="aspect-square" />

          const { iso, day } = cell
          const selectedExact = mode === "exact" && exactIso === iso
          const spanActive = mode === "range" && rangeFrom && rangeTo && iso >= rangeFrom && iso <= rangeTo
          const spanEndpoint = mode === "range" && rangeFrom && rangeTo && (iso === rangeFrom || iso === rangeTo)
          const spanMid = Boolean(spanActive && !spanEndpoint)
          const pendingStart = mode === "range" && Boolean(rangeFrom && !rangeTo && iso === rangeFrom)

          return (
            <button
              key={iso}
              type="button"
              onClick={() => handleDayClick(iso)}
              className={`relative flex aspect-square items-center justify-center rounded-xl text-xs font-bold transition ${
                selectedExact || spanEndpoint || pendingStart
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : spanMid
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-white/[0.08]"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {mode === "range" ? (
        <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
          Tap start date, then end date. Selected:{" "}
          <span className="font-semibold text-foreground/90">
            {rangeFrom ? rangeFrom : "—"}
            {rangeTo ? ` → ${rangeTo}` : ""}
          </span>
        </p>
      ) : null}
    </div>
  )
}
