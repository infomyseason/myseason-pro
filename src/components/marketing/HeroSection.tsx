import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { exploreHref } from "../../lib/exploreLinks"

const FEATURE_HIGHLIGHTS = [
  {
    title: "World-class events",
    subtitle: "From Majors to local gems",
    icon: "globe" as const,
    action: "explore-world-class" as const,
  },
  {
    title: "Plan your calendar",
    subtitle: "Organize your season",
    icon: "calendar" as const,
    action: "calendar" as const,
  },
  {
    title: "Join the community",
    subtitle: "Share, connect, get inspired",
    icon: "community" as const,
    action: "community" as const,
  },
]

function HighlightIcon({ name }: { name: "globe" | "calendar" | "community" }) {
  const cls = "size-[18px] text-primary/75"
  if (name === "globe")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 12h20M12 2a15 15 0 0 0 0 20 15 15 0 0 0 0-20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  if (name === "calendar")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14h2M12 14h2M16 14h2M8 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HeroSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  const submitSearch = useCallback(() => {
    const q = query.trim()
    if (!q) {
      navigate("/explore")
      return
    }
    navigate(`/explore?q=${encodeURIComponent(q)}`)
  }, [navigate, query])

  const onFeatureClick = useCallback(
    (action: (typeof FEATURE_HIGHLIGHTS)[number]["action"]) => {
      if (action === "explore-world-class") {
        navigate(exploreHref({ sport: "Triathlon", eventType: "world_class" }))
        return
      }
      if (action === "calendar") {
        navigate("/my-calendar")
        return
      }
      navigate("/community")
    },
    [navigate],
  )

  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (!el) return
      if (el.closest("input, textarea, select, [contenteditable=true]")) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener("keydown", onDocKey)
    return () => window.removeEventListener("keydown", onDocKey)
  }, [])

  return (
    <section className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden px-4 pb-8 pt-20 md:min-h-[90vh] md:pb-16 md:pt-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-background md:hidden" />
        <div className="absolute -left-32 top-1/4 hidden h-[600px] w-[600px] animate-pulse rounded-full bg-primary/10 blur-[120px] md:block" />
        <div
          className="absolute -right-32 bottom-1/4 hidden h-[600px] w-[600px] rounded-full bg-[#3b82f6]/10 blur-[120px] md:block"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute left-1/2 top-1/2 hidden h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6]/5 blur-[150px] md:block" />
        <div className="absolute inset-0 hidden opacity-[0.03] md:block">
          <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <path
              d="M400,100 Q500,120 550,180 Q600,250 580,320 Q560,400 500,450 Q420,500 350,480 Q280,460 250,400 Q220,330 240,260 Q260,190 320,140 Q360,100 400,100"
              fill="currentColor"
              className="text-primary"
            />
            <g stroke="currentColor" strokeWidth="0.5" className="text-primary/50" fill="none">
              <line x1="380" y1="280" x2="420" y2="200" strokeDasharray="4 4" />
              <line x1="420" y1="200" x2="500" y2="230" strokeDasharray="4 4" />
              <line x1="500" y1="230" x2="480" y2="300" strokeDasharray="4 4" />
              <line x1="480" y1="300" x2="380" y2="280" strokeDasharray="4 4" />
            </g>
            <g fill="currentColor" className="text-primary">
              <circle cx="380" cy="280" r="3" />
              <circle cx="420" cy="200" r="3" />
              <circle cx="500" cy="230" r="3" />
              <circle cx="480" cy="300" r="3" />
            </g>
          </svg>
        </div>
        <div className="absolute right-[15%] top-20 hidden h-40 w-1 rotate-12 rounded-full bg-gradient-to-b from-[#3b82f6]/28 to-transparent md:block" />
        <div className="absolute right-[12%] top-32 hidden h-28 w-0.5 rotate-12 rounded-full bg-gradient-to-b from-[#3b82f6]/18 to-transparent md:block" />
        <div className="absolute bottom-40 left-[10%] hidden h-32 w-1 -rotate-12 rounded-full bg-gradient-to-b from-[#3b82f6]/30 to-transparent md:block" />
        <div className="absolute bottom-48 left-[13%] hidden h-24 w-0.5 -rotate-12 rounded-full bg-gradient-to-b from-[#3b82f6]/20 to-transparent md:block" />
        <div className="absolute right-[8%] top-[35%] hidden h-20 w-0.5 rotate-45 rounded-full bg-gradient-to-b from-[#a855f7]/25 to-transparent md:block" />
        <div className="absolute left-[6%] top-[55%] hidden h-16 w-0.5 -rotate-45 rounded-full bg-gradient-to-b from-[#f97316]/25 to-transparent md:block" />
        <div
          className="absolute inset-0 opacity-[0.008] md:opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(246,215,176,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(246,215,176,0.8) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute left-1/4 top-1/3 hidden h-80 w-80 rounded-full bg-primary/8 blur-[100px] md:block" />
        <div className="absolute bottom-1/3 right-1/4 hidden h-64 w-64 rounded-full bg-[#f97316]/8 blur-[80px] md:block" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="order-1 mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-secondary/50 px-3 py-1.5 backdrop-blur-md md:mb-8 md:px-5 md:py-2.5">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="text-primary" aria-hidden="true">
            <path
              d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-medium text-foreground/90 md:text-sm">
            10,000+ races across 44 European countries
          </span>
        </div>

        <h1 className="order-2 mb-4 text-balance text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-4xl md:mb-6 md:text-7xl lg:text-8xl">
          Plan your season.{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-[#e8c9a0] to-primary bg-clip-text text-transparent">
              Find your next race.
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </span>
        </h1>

        <p className="order-4 mx-auto mb-0 mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base md:order-3 md:mb-12 md:mt-0 md:text-xl">
          Discover running, triathlon, cycling and HYROX events from Lisbon to Helsinki — and build a calendar
          that pushes you to your next PR.
        </p>

        <form
          className="relative order-3 mx-auto mt-4 w-full max-w-2xl md:order-4 md:mt-0"
          role="search"
          aria-label="Search events"
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch()
          }}
        >
          <div className="group relative">
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-primary/40 via-[#3b82f6]/30 to-[#a855f7]/35 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-50 group-focus-within:opacity-40" />
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary md:left-5 md:size-5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.34-4.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search event name, country, or race type…"
                autoComplete="off"
                enterKeyHint="search"
                className="h-12 w-full rounded-xl border-2 border-border/50 bg-secondary/70 pl-11 pr-4 text-sm text-foreground shadow-lg backdrop-blur-xl placeholder:text-muted-foreground transition-all duration-300 focus:border-primary/50 focus:bg-secondary/90 focus:outline-none focus:ring-[3px] focus:ring-ring/40 sm:h-14 sm:pl-12 sm:text-base md:h-16 md:rounded-2xl md:pl-14 md:pr-6 md:text-base lg:text-lg"
              />
              <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground md:flex">
                <span>Press</span>
                <kbd className="rounded bg-background/50 px-1.5 py-0.5 font-mono text-xs">/</kbd>
              </div>
            </div>
          </div>
        </form>

        <div className="order-5 mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-2 sm:grid-cols-3 md:mt-14 md:gap-4">
          {FEATURE_HIGHLIGHTS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => onFeatureClick(item.action)}
              className="flex cursor-pointer flex-col rounded-xl border border-border/55 bg-card/55 px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-primary/[0.06] backdrop-blur-xl transition-all duration-300 hover:border-primary/25 hover:ring-primary/18 hover:shadow-[0_18px_48px_-28px_rgba(59,130,246,0.22)] active:scale-[0.98] sm:rounded-2xl sm:px-5 sm:py-5 md:hover:-translate-y-0.5 md:active:scale-100 md:px-6 md:py-6"
            >
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.07] shadow-[0_0_24px_-12px_rgba(232,200,150,0.5)] sm:mb-4 sm:size-10 sm:rounded-xl md:mb-4">
                <HighlightIcon name={item.icon} />
              </div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground md:text-base">{item.title}</h3>
              <p className="mt-1 text-xs leading-snug text-muted-foreground/90 md:mt-1.5 md:text-sm">{item.subtitle}</p>
            </button>
          ))}
        </div>

        <div className="order-6 mt-6 hidden items-center justify-center gap-2 text-muted-foreground/70 md:mt-12 md:flex">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path
              d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="text-sm">From Portugal to Finland, Norway to Greece</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce flex-col items-center gap-2 md:flex">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-2">
          <div className="h-2 w-1 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  )
}
