import { Link } from "react-router-dom"
import type { SportKey } from "../sportTokens"
import { SPORT_STYLES } from "../sportTokens"
import { useFavouriteRaceIds } from "../../hooks/useFavouriteRaceIds"

export type RaceCardMode = "local" | "sport" | "featured"

type RaceCardProps = {
  mode: RaceCardMode
  sportKey: SportKey
  title: string
  /** e.g. "Berlin, Germany" */
  locationLine: string
  flag?: string
  dateLabel: string
  imageUrl: string
  distances: string[]
  daysUntil?: number
  major?: boolean
  athletesLabel?: string
  /** Second pill next to sport (e.g. Community) */
  extraBadge?: string
  registrationStatus?: "open" | "closingSoon" | "soldOut" | "notOpenYet" | "cancelled"
  priceNote?: string
  /** Internal route — card renders as a link (does not open external URLs). */
  to?: string
  /** Opens official site in a new tab; featured cards omit the heart control to avoid nesting interactive elements. */
  externalHref?: string
  /** Featured mode only — short supporting line under the title. */
  featuredBlurb?: string
  /** Entry pricing hint (e.g. "Starting from €13"). */
  startingPriceLabel?: string
  /** Homepage-style listing: fewer badges, capped distances, stronger image fade. */
  compactListing?: boolean
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      {filled ? (
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function RaceCard({
  mode,
  sportKey,
  title,
  locationLine,
  flag,
  dateLabel,
  imageUrl,
  distances,
  daysUntil,
  major,
  athletesLabel,
  extraBadge,
  registrationStatus,
  priceNote,
  to,
  externalHref,
  featuredBlurb,
  startingPriceLabel,
  compactListing = false,
}: RaceCardProps) {
  const sport = SPORT_STYLES[sportKey]
  const { toggle, isFavourite } = useFavouriteRaceIds()
  const favId = to ? (to.startsWith("/race/") ? to.slice("/race/".length) : to) : ""
  const fav = favId ? isFavourite(favId) : false
  const hoverShadow = `hover:shadow-[0_0_60px_rgba(${sport.rgb},0.3)]`
  const restDistances = distances.length > 2 ? distances.length - 2 : 0

  const sizeClass =
    mode === "featured"
      ? "h-[340px] w-[340px] md:h-[380px] md:w-[400px]"
      : mode === "local"
        ? "h-[300px] w-[280px] md:w-[320px]"
        : "h-[280px] w-[280px] md:w-[300px]"

  const titleClass =
    mode === "featured"
      ? "text-2xl md:text-3xl"
      : mode === "local"
        ? "text-xl"
        : "text-lg md:text-xl"

  const shellClassName = `group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ${sizeClass} hover:scale-[1.03] ${hoverShadow}`
  const focusRingClass =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  const cardInner = (
    <>
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div
            className={
              compactListing
                ? "absolute inset-0 bg-gradient-to-t from-[#050917] via-[#070b16]/95 to-[#0f1a2e]/35"
                : "absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/60 to-[#0f1a2e]/22"
            }
          />
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${sport.hex}66, transparent)`,
            }}
          />
          <div
            className={
              compactListing
                ? "absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,transparent_30%,rgba(2,4,8,0.65)_100%)]"
                : "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,14,26,0.3)_100%)]"
            }
          />
        </div>

        <div
          className="absolute left-0 right-0 top-0 z-10 h-1 opacity-80"
          style={{ backgroundColor: sport.hex }}
        />

        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-2">
            <span
              className="rounded-md px-3 py-1.5 text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: sport.hex }}
            >
              {sport.emoji} {sport.label}
            </span>
            {registrationStatus ? (
              <span
                className={`rounded-md border px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm ${
                  registrationStatus === "open"
                    ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                    : registrationStatus === "closingSoon"
                      ? "border-amber-300/25 bg-amber-400/10 text-amber-200"
                      : registrationStatus === "soldOut"
                        ? "border-red-400/25 bg-red-950/20 text-red-200"
                        : registrationStatus === "notOpenYet"
                          ? "border-sky-300/20 bg-sky-500/10 text-sky-200"
                          : "border-border/55 bg-secondary/40 text-muted-foreground"
                }`}
                title={priceNote?.trim() ? priceNote.trim() : undefined}
              >
                {registrationStatus === "open"
                  ? "Open"
                  : registrationStatus === "closingSoon"
                    ? "Closing soon"
                    : registrationStatus === "soldOut"
                      ? "Sold out"
                      : registrationStatus === "notOpenYet"
                        ? "Not open yet"
                        : "Cancelled"}
              </span>
            ) : null}
            {!compactListing && extraBadge ? (
              <span className="rounded-md border border-primary/35 bg-primary/15 px-3 py-1 text-xs font-bold text-primary shadow-lg backdrop-blur-sm">
                {extraBadge}
              </span>
            ) : null}
            {!compactListing && major ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-black shadow-lg">
                <span aria-hidden="true">🏆</span>
                Major
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode === "local" && daysUntil != null ? (
              <span className="rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                {daysUntil} days
              </span>
            ) : null}
            {mode === "sport" && daysUntil != null ? (
              <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                {daysUntil} days
              </span>
            ) : null}
            {!externalHref && favId ? (
              <button
                type="button"
                aria-label={fav ? "Remove from favourites" : "Save to favourites"}
                aria-pressed={fav}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle(favId)
                }}
                className={`flex size-9 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition hover:scale-110 ${
                  fav
                    ? "border-primary/35 bg-primary/15 text-primary hover:bg-primary/20"
                    : "border-border/55 bg-background/30 text-white/80 hover:bg-background/45 hover:text-white"
                }`}
              >
                <HeartIcon filled={fav} />
              </button>
            ) : null}
          </div>
        </div>

        {mode === "featured" && daysUntil != null ? (
          <div className="absolute left-4 top-16 z-10">
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 shadow-lg backdrop-blur-md">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" className="text-primary" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-bold text-white">{daysUntil} days</span>
            </div>
          </div>
        ) : null}

        <div className={`absolute bottom-0 left-0 right-0 z-10 ${compactListing ? "p-5 pb-6 pt-2" : "p-5"}`}>
          <div className={`flex items-center gap-2 ${compactListing ? "mb-3" : "mb-2"}`}>
            {flag ? <span className="text-xl leading-none">{flag}</span> : null}
            <span className={`font-medium text-white/75 ${compactListing ? "text-[13px] leading-snug" : "text-sm"}`}>
              {locationLine}
            </span>
          </div>
          <h3
            className={`${titleClass} line-clamp-2 min-h-0 font-black leading-tight text-white transition-colors group-hover:text-primary ${compactListing ? "mb-4 text-[1.0625rem] tracking-tight sm:text-xl" : featuredBlurb && mode === "featured" ? "mb-2" : "mb-3"}`}
          >
            {title}
          </h3>
          {mode === "featured" && featuredBlurb ? (
            <p className="mb-3 line-clamp-2 text-sm leading-snug text-white/72">{featuredBlurb}</p>
          ) : null}
          <div className={`flex items-center gap-2 text-white/90 ${compactListing ? "mb-4" : "mb-3"}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="shrink-0 text-primary" aria-hidden="true">
              <path
                d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className={`font-semibold leading-snug ${mode === "featured" ? "text-base" : compactListing ? "text-[13px]" : "text-sm"}`}>
              {dateLabel}
            </span>
          </div>
          {startingPriceLabel ? (
            <div className={compactListing ? "mb-3.5" : "mb-3"}>
              <span
                className={`inline-flex rounded-full border border-primary/45 bg-primary/18 px-3 py-1 font-bold text-primary backdrop-blur-sm ${compactListing ? "text-[13px]" : "px-2.5 text-xs"}`}
              >
                {startingPriceLabel}
              </span>
            </div>
          ) : null}
          {!compactListing && athletesLabel ? (
            <div className="mb-3 flex items-center gap-2 text-white/70">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{athletesLabel}</span>
            </div>
          ) : null}
          <div className={`flex flex-wrap gap-1.5 ${compactListing ? "mt-1" : ""}`}>
            {(compactListing ? distances.slice(0, 2) : distances).map((d) => (
              <span
                key={d}
                className={
                  compactListing
                    ? "rounded-md border border-white/22 bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md"
                    : "rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
                }
              >
                {d}
              </span>
            ))}
            {compactListing && restDistances > 0 ? (
              <span
                className="rounded-md border border-white/18 bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white/90 backdrop-blur-md"
                aria-label={`${restDistances} more distances`}
              >
                +{restDistances}
              </span>
            ) : null}
          </div>
        </div>
    </>
  )

  return (
    <div className="snap-start">
      {externalHref ? (
        <a
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${shellClassName} block ${focusRingClass}`}
        >
          {cardInner}
        </a>
      ) : to ? (
        <Link to={to} className={`${shellClassName} block ${focusRingClass}`}>
          {cardInner}
        </Link>
      ) : (
        <div className={shellClassName}>{cardInner}</div>
      )}
    </div>
  )
}
