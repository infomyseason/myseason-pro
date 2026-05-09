import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { computeDaysUntilRace, getRaceDetailById } from "../../data"
import { useFavouriteRaceIds } from "../../hooks/useFavouriteRaceIds"
import { SPORT_STYLES, sportKeyFromLabel } from "../../components/sportTokens"

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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

export function RaceDetailPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const race = raceId ? getRaceDetailById(raceId) : undefined
  const [routeMapOpen, setRouteMapOpen] = useState(false)
  const { toggle, isFavourite } = useFavouriteRaceIds()

  useEffect(() => {
    setRouteMapOpen(false)
  }, [raceId])

  useEffect(() => {
    if (!routeMapOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRouteMapOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [routeMapOpen])

  if (!race) {
    return (
      <div className="min-h-screen bg-background px-4 py-28 text-center">
        <p className="text-muted-foreground">We couldn’t find this race.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/[0.14]"
        >
          Back to home
        </Link>
      </div>
    )
  }

  const sportKey = sportKeyFromLabel(race.sport)
  const sport = SPORT_STYLES[sportKey]
  const daysLeft = computeDaysUntilRace(race.date)
  const eventInstant = new Date(`${race.date}T12:00:00`)
  const longDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(eventInstant)

  const isFestival = race.detailKind === "festival"
  const charityTone = race.detailTone === "charityCommunity"
  const countdownLabel =
    daysLeft > 0
      ? `${daysLeft} days to go`
      : daysLeft === 0
        ? isFestival
          ? "Event day"
          : charityTone
            ? "Run day"
            : "Race day"
        : `${isFestival ? "Event was" : charityTone ? "Run was" : "Race was"} ${Math.abs(daysLeft)} days ago`

  const routePreviewSrc = race.routeImage
  const routeModalSrc = race.routeUrl ?? race.routeImage
  const routePreviewInteractive = race.hasRoute && Boolean(routePreviewSrc && routeModalSrc)
  const savedToFavourites = isFavourite(race.id)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:px-6 sm:py-4">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
          {race.isOfficial ? (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#f5e6c8]/55 bg-primary px-4 py-2 text-[12px] font-bold tracking-[0.02em] text-primary-foreground shadow-[0_2px_20px_-4px_rgba(232,200,150,0.72),0_1px_0_rgba(255,255,255,0.4)_inset,inset_0_-1px_0_rgba(12,13,17,0.1)] ring-1 ring-white/30">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true" className="shrink-0">
                <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="2" />
                <path
                  d="m8 12 2.25 2.25L16 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified event
            </span>
          ) : null}
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6 sm:pt-5">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04]">
          <div className="relative h-[180px] w-full md:h-[240px]">
            <img src={race.image} alt={race.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,transparent_40%,rgba(9,11,16,0.65)_100%)]" />
            {charityTone ? (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(236,72,153,0.14)_0%,transparent_42%,transparent_100%)]" />
            ) : null}
          </div>
        </div>

        <div className="-mt-10 relative z-10 md:-mt-12">
          <div
            className={`rounded-2xl border border-white/[0.08] bg-[#0c1018]/90 p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
              charityTone ? "ring-1 ring-pink-500/20 ring-offset-0" : "ring-1 ring-white/[0.05]"
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-3 py-1.5 text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: sport.hex }}
              >
                {sport.emoji} {race.sport}
              </span>
              <span
                className={`rounded-md border bg-white/[0.06] px-3 py-1 text-xs font-semibold text-foreground/90 ${
                  charityTone ? "border-pink-400/35 text-pink-50/95" : "border-white/15"
                }`}
              >
                {race.category}
              </span>
            </div>

            <h1 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-[2.25rem]">
              {race.title}
            </h1>
            {race.organizer ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground/85">Organizer — </span>
                {race.organizer}
              </p>
            ) : null}
            {isFestival ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{race.description}</p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
              <a
                href={race.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary/35 bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-primary/90 sm:w-auto sm:min-w-[200px] sm:text-[15px] sm:py-3"
              >
                Official website
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M14 3h7v7M10 14 21 3M21 3v7h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => toggle(race.id)}
                aria-pressed={savedToFavourites}
                className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition sm:w-auto sm:px-5 ${
                  savedToFavourites
                    ? "border border-primary/40 bg-primary/12 text-primary ring-1 ring-primary/20 hover:bg-primary/[0.16]"
                    : "border border-primary/22 bg-primary/[0.07] text-foreground hover:border-primary/35 hover:bg-primary/[0.1]"
                }`}
              >
                <HeartIcon filled={savedToFavourites} />
                {savedToFavourites ? "Saved to favourites" : "Save to favourites"}
              </button>
              <button
                type="button"
                aria-disabled="true"
                tabIndex={-1}
                title="Calendar sync is coming soon"
                onClick={(e) => e.preventDefault()}
                className="inline-flex w-full cursor-default items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-muted-foreground/85 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] transition-colors hover:border-white/[0.18] hover:bg-white/[0.1] hover:text-muted-foreground sm:w-auto"
              >
                <span aria-hidden="true">📅</span>
                <span>Add to calendar</span>
                <span className="rounded-md border border-white/[0.14] bg-black/30 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
                  Soon
                </span>
              </button>
            </div>

            <div className="mt-5 space-y-2 border-b border-white/[0.06] pb-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true">📍</span>
                  <span className="font-medium text-foreground/90">
                    {race.city}, {race.country}
                  </span>
                </span>
                <span className="hidden text-border sm:inline">·</span>
                <span className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="text-primary" aria-hidden="true">
                    <path
                      d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-semibold text-foreground/90">{longDate}</span>
                </span>
              </p>
              {race.venueLine ? (
                <p className="text-sm leading-snug text-muted-foreground">
                  <span className="font-semibold text-foreground/85">Venue — </span>
                  {race.venueLine}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div
                className={`flex min-h-[5.25rem] flex-col justify-center rounded-xl border border-primary/25 bg-primary/[0.07] px-4 py-4 ring-1 sm:min-h-[5.5rem] sm:py-[1.125rem] ${
                  charityTone ? "ring-pink-500/25" : "ring-primary/15"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Countdown</div>
                <div className="mt-1 text-base font-black leading-snug text-foreground">{countdownLabel}</div>
              </div>
              <div className="flex min-h-[5.25rem] flex-col justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.05] sm:min-h-[5.5rem] sm:py-[1.125rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {charityTone ? "Community turnout" : isFestival ? "Expected participants" : "Participants"}
                </div>
                <div className="mt-1 text-base font-black leading-snug text-foreground">
                  {race.participants != null ? (
                    `${race.participants.toLocaleString("en-US")}+`
                  ) : (
                    <span className="text-sm font-semibold leading-snug text-muted-foreground">Not published yet</span>
                  )}
                </div>
                {race.participants != null && race.participantFootnote ? (
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground/88">{race.participantFootnote}</p>
                ) : null}
              </div>
              <div className="flex min-h-[5.25rem] flex-col justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.05] sm:min-h-[5.5rem] sm:py-[1.125rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Entry</div>
                <div className="mt-1 text-base font-black leading-snug text-foreground">
                  {race.startingPriceLabel?.trim() ? (
                    race.startingPriceLabel
                  ) : (
                    <span className="text-sm font-semibold leading-snug text-muted-foreground">Not published yet</span>
                  )}
                </div>
              </div>
            </div>

            {isFestival && race.courseProfile.length > 0 ? (
              <div className="mt-6">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Festival profile
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {race.courseProfile.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-primary/28 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-semibold text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={`mt-6 ${isFestival ? "border-t border-white/[0.06] pt-6" : ""}`}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {isFestival ? "Experiences & sessions" : "Distances"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {race.distances.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-white/15 bg-[#0a0d14]/55 px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur-md"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {race.showCoursePendingNotice && !race.courseRoute ? (
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Course</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">Route not published yet</p>
                {race.courseProfile.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Profile</div>
                    <div className="flex flex-wrap gap-1.5">
                      {race.courseProfile.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/28 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-semibold text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {race.courseRoute ? (
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {charityTone ? "Route & gathering" : "Course"}
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-[7.25rem]">
                    {routePreviewInteractive ? (
                      <button
                        type="button"
                        onClick={() => setRouteMapOpen(true)}
                        className="group relative h-28 w-full overflow-hidden rounded-lg border border-white/[0.08] text-left ring-1 ring-white/[0.04] transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1018] sm:h-[5.5rem] sm:w-[7.25rem]"
                        aria-label="View course map"
                      >
                        <img
                          src={routePreviewSrc}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/45" />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-md">
                            View course map
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border border-white/[0.08] ring-1 ring-white/[0.04] sm:h-[5.5rem] sm:w-[7.25rem]">
                        {routePreviewSrc ? (
                          <img src={routePreviewSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/[0.04]" aria-hidden />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-black/25" />
                      </div>
                    )}
                    {!race.hasRoute ? (
                      <p className="text-[10px] leading-snug text-muted-foreground">Route not published yet</p>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-4">
                      <div>
                        <div className="font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {charityTone ? "Atmosphere" : "Elevation"}
                        </div>
                        <div className="mt-0.5 font-semibold text-foreground">{race.courseRoute.elevationGain}</div>
                      </div>
                      <div>
                        <div className="font-bold uppercase tracking-[0.12em] text-muted-foreground">Surface</div>
                        <div className="mt-0.5 font-semibold text-foreground">{race.courseRoute.surface}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {charityTone ? "Route" : "Course type"}
                        </div>
                        <div className="mt-0.5 font-semibold leading-snug text-foreground">{race.courseRoute.layoutType}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {charityTone ? "Together" : "Profile"}
                        </div>
                        <div className="mt-0.5 font-semibold leading-snug text-foreground">
                          {race.courseRoute.profileSummary}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/85">{charityTone ? "Gathering — " : "Start / finish — "}</span>
                      {race.courseRoute.startFinish}
                    </p>
                    {race.courseRoute.highlights && race.courseRoute.highlights.length > 0 ? (
                      <div>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Highlights
                        </div>
                        <ul className="list-inside list-disc space-y-0.5 text-xs leading-snug text-muted-foreground marker:text-primary/70">
                          {race.courseRoute.highlights.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {race.courseProfile.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {race.courseProfile.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold text-foreground ${
                              charityTone
                                ? "border-pink-400/35 bg-pink-500/[0.09]"
                                : "border-primary/28 bg-primary/[0.07]"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Pricing</h2>
              {race.pricing.length > 0 ? (
                <>
                  <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-[#0a0d14]/40 ring-1 ring-white/[0.04]">
                    {race.pricing.map((row) => (
                      <li
                        key={row.distance}
                        className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-2.5"
                      >
                        <span className="text-sm font-semibold text-foreground">{row.distance}</span>
                        <span className="text-xs text-muted-foreground sm:text-right">{row.priceNote}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-muted-foreground/85">
                    {charityTone
                      ? "Charity entry tiers and fundraising details — see pinkrun.lt for current fees."
                      : "See official site for current fees and add-ons."}
                  </p>
                </>
              ) : (
                <p className="rounded-xl border border-white/[0.08] bg-[#0a0d14]/40 px-4 py-4 text-sm leading-relaxed text-muted-foreground ring-1 ring-white/[0.04]">
                  Not published yet
                </p>
              )}
            </div>

            {!isFestival ? (
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {charityTone ? "Mission & atmosphere" : "About"}
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{race.description}</p>
              </div>
            ) : race.festivalSections && race.festivalSections.length > 0 ? (
              <div className="mt-6 space-y-8 border-t border-white/[0.06] pt-6">
                {race.festivalSections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {section.heading}
                    </h2>
                    {section.paragraphs?.length ? (
                      <div className="space-y-3">
                        {section.paragraphs.map((p, pi) => (
                          <p
                            key={`${section.heading}-p-${pi}`}
                            className="max-w-3xl text-sm leading-relaxed text-muted-foreground"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {section.bullets?.length ? (
                      <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground marker:text-primary">
                        {section.bullets.map((item, bi) => (
                          <li key={`${section.heading}-b-${bi}`}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {routeMapOpen && race.hasRoute && routeModalSrc ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setRouteMapOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Course map"
            className="relative max-h-[92vh] max-w-5xl rounded-xl border border-white/[0.12] bg-[#0c1018] p-2 shadow-2xl ring-1 ring-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur-md transition hover:bg-black/85"
              onClick={() => setRouteMapOpen(false)}
              aria-label="Close course map"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <img
              src={routeModalSrc}
              alt=""
              className="max-h-[min(88vh,920px)] w-full rounded-lg object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
