import { Link } from "react-router-dom"
import type { SportKey } from "../sportTokens"
import { SPORT_STYLES } from "../sportTokens"

const TILES: { key: SportKey; exploreSport: string; count: string; icon: "run" | "waves" | "bike" | "zap" }[] = [
  { key: "running", exploreSport: "Running", count: "4,200+", icon: "run" },
  { key: "triathlon", exploreSport: "Triathlon", count: "1,800+", icon: "waves" },
  { key: "cycling", exploreSport: "Cycling", count: "2,500+", icon: "bike" },
  { key: "hyrox", exploreSport: "HYROX", count: "800+", icon: "zap" },
]

function Icon({ name, color }: { name: "run" | "waves" | "bike" | "zap"; color: string }) {
  const cn = "h-6 w-6 transition-all duration-300"
  if (name === "run")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cn} style={{ color }} aria-hidden="true">
        <path
          d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M16 17h4M4 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  if (name === "waves")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cn} style={{ color }} aria-hidden="true">
        <path
          d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    )
  if (name === "bike")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cn} style={{ color }} aria-hidden="true">
        <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="15" cy="5" r="1" stroke="currentColor" strokeWidth="2" />
        <path d="M12 17.5V14l-3-3 4-3 2 3h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn} style={{ color }} aria-hidden="true">
      <path
        d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SportDiscovery() {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {TILES.map((t) => {
            const s = SPORT_STYLES[t.key]
            return (
              <Link
                key={t.key}
                to={`/explore?sport=${encodeURIComponent(t.exploreSport)}`}
                className="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-border/50 bg-secondary/40 px-6 py-4 backdrop-blur-sm transition-all duration-500 ease-out hover:scale-[1.03] hover:border-primary/25 hover:shadow-xl active:scale-[0.99] md:px-8 md:py-5"
              >
                <div
                  className="absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ backgroundColor: `${s.hex}20` }}
                />
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ boxShadow: `inset 0 0 0 1px ${s.hex}40` }}
                />
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${s.hex}20` }}
                >
                  <Icon name={t.icon} color={s.hex} />
                </div>
                <div className="text-left">
                  <span className="block text-lg font-bold transition-colors duration-300" style={{ color: s.hex }}>
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.count} races</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
