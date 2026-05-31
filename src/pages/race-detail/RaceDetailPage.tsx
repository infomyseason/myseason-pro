import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { computeDaysUntilRace, getRaceDetailById, getSubmittedRaceDetailById } from "../../data"
import { useFavouriteRaceIds } from "../../hooks/useFavouriteRaceIds"
import { useRequireLoginAction } from "../../hooks/useRequireLoginAction"
import { useUserRaceLists, type CalendarEntry } from "../../hooks/useUserRaceLists"
import { useRaceSubmissions } from "../../hooks/useRaceSubmissions"
import { SPORT_STYLES, sportKeyFromLabel } from "../../components/sportTokens"
import { triathlonFormatLabels } from "../../lib/triathlonFormats"

function planningDistanceOptions(race: { sport: string; distances: string[] }): string[] {
  if (race.sport === "Triathlon") {
    const formats = triathlonFormatLabels(race.distances)
    if (formats.length) return formats
  }
  return race.distances.length ? race.distances : ["Distance TBD"]
}

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
  const navigate = useNavigate()
  const { raceId } = useParams<{ raceId: string }>()
  const race = raceId ? getRaceDetailById(raceId) ?? getSubmittedRaceDetailById(raceId) : undefined
  const [routeMapOpen, setRouteMapOpen] = useState(false)
  const { toggle, isFavourite } = useFavouriteRaceIds()
  const { calendarEntries, setLists, plannedRaceIds, completedRaceIds } = useUserRaceLists()
  const { guardOrRun, isLoggedIn } = useRequireLoginAction()
  const { submissions, canEdit } = useRaceSubmissions()

  const canGoBack = useMemo(() => {
    const idx = (window.history.state as { idx?: unknown } | null)?.idx
    return typeof idx === "number" ? idx > 0 : window.history.length > 1
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close a stale route modal when navigating between race ids
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

  const distanceOptions = useMemo(() => (race ? planningDistanceOptions(race) : []), [race])

  if (!race) {
    return (
      <div className="min-h-screen bg-background px-4 py-28 text-center">
        <p className="text-muted-foreground">We couldn’t find this race.</p>
        <Link
          to="/explore"
          className="mt-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/[0.14]"
        >
          Back to explore
        </Link>
      </div>
    )
  }

  const linkedSubmission = submissions.find((s) => s.id === race.id) ?? null
  const allowEdit = linkedSubmission ? canEdit(linkedSubmission) : false

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
  const existingPlan = calendarEntries.find((e) => e.raceId === race.id) ?? null
  const inCalendar = Boolean(existingPlan)
  const registrationLabel =
    race.registrationStatus === "open"
      ? "Open for registration"
      : race.registrationStatus === "closingSoon"
        ? "Closing soon"
        : race.registrationStatus === "soldOut"
          ? "Sold out"
          : race.registrationStatus === "notOpenYet"
            ? "Registration not open yet"
            : race.registrationStatus === "cancelled"
              ? "Cancelled"
              : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={() => {
              if (canGoBack) navigate(-1)
              else navigate("/explore")
            }}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
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

      <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5">
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_12px_40px_-18px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.03] dark:border-white/[0.08] dark:bg-transparent dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] dark:ring-white/[0.04]">
          <div className="relative h-[150px] w-full sm:h-[180px] md:h-[240px]">
            <img src={race.image} alt={race.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent dark:via-background/55" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,transparent_45%,rgba(255,255,255,0.65)_100%)] dark:bg-[radial-gradient(ellipse_at_center_top,transparent_40%,rgba(9,11,16,0.65)_100%)]" />
            {charityTone ? (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(236,72,153,0.14)_0%,transparent_42%,transparent_100%)]" />
            ) : null}
          </div>
        </div>

        <div className="-mt-8 relative z-10 sm:-mt-10 md:-mt-12">
          <div
            className={`rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[0_8px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6 dark:border-white/[0.08] dark:bg-[#0c1018]/90 dark:shadow-xl ${
              charityTone
                ? "ring-1 ring-pink-400/25 ring-offset-0 dark:ring-pink-500/20"
                : "ring-1 ring-black/[0.04] dark:ring-white/[0.05]"
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
                className={`rounded-md border px-3 py-1 text-xs font-semibold ${
                  charityTone
                    ? "border-pink-200 bg-pink-50 text-pink-900 dark:border-pink-400/35 dark:bg-pink-500/[0.09] dark:text-pink-50/95"
                    : "border-border bg-muted/80 text-foreground/90 dark:border-white/15 dark:bg-white/[0.06]"
                }`}
              >
                {race.category}
              </span>
            </div>

            <h1 className="text-balance text-2xl font-black tracking-tight text-foreground sm:text-4xl md:text-[2.25rem]">
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

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
              <a
                href={race.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary/35 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-primary/90 sm:w-auto sm:min-w-[200px] sm:py-3.5 sm:text-[15px]"
              >
                Official website
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M14 3h7v7M10 14 21 3M21 3v7h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() =>
                  guardOrRun(
                    () => toggle(race.id),
                    "Sign in to save favourites — they appear under Profile → Favourites.",
                  )
                }
                aria-pressed={savedToFavourites}
                className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition sm:w-auto sm:px-5 sm:py-3.5 ${
                  savedToFavourites
                    ? "border border-primary/40 bg-primary/12 text-primary ring-1 ring-primary/20 hover:bg-primary/[0.16]"
                    : "border border-primary/22 bg-primary/[0.07] text-foreground hover:border-primary/35 hover:bg-primary/[0.1]"
                }`}
              >
                <HeartIcon filled={savedToFavourites} />
                {savedToFavourites ? "Saved to favourites" : "Save to favourites"}
              </button>
              {allowEdit ? (
                <Link
                  to={`/add-race?edit=${encodeURIComponent(linkedSubmission!.id)}`}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-border/55 bg-secondary/50 px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-primary/25 hover:bg-secondary/70 sm:w-auto sm:px-5"
                >
                  Edit event
                </Link>
              ) : null}
              {inCalendar ? (
                <Link
                  to="/my-calendar"
                  title="Set distance, goal, and notes on My Calendar"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/12 px-4 py-3 text-[13px] font-semibold text-primary shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] ring-1 ring-primary/20 transition-colors hover:bg-primary/[0.16] sm:w-auto sm:py-3.5"
                >
                  <span aria-hidden="true">📅</span>
                  <span>In My Calendar</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    guardOrRun(() => {
                      const dist =
                        (distanceOptions[0] ?? race.distances[0] ?? "Distance TBD").trim() || "Distance TBD"
                      const prev = calendarEntries
                      const nextEntry: CalendarEntry = {
                        raceId: race.id,
                        selectedDistance: dist,
                        addedAt: new Date().toISOString(),
                      }
                      setLists({
                        plannedRaceIds,
                        completedRaceIds,
                        calendarEntries: [nextEntry, ...prev],
                      })
                    }, "Sign in to add races to your calendar.")
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-muted/90 px-4 py-3 text-[13px] font-semibold text-foreground shadow-sm transition-colors hover:border-primary/35 hover:bg-muted dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:bg-white/[0.09] sm:w-auto sm:py-3.5"
                >
                  <span aria-hidden="true">📅</span>
                  <span>Add to calendar</span>
                </button>
              )}
            </div>

            {!isLoggedIn ? (
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground">
                Saving favourites requires an account. After you sign in, open{" "}
                <strong className="font-semibold text-foreground/90">Profile</strong> →{" "}
                <strong className="font-semibold text-foreground/90">Favourites</strong> to see saved races.
              </p>
            ) : null}

            {registrationLabel ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                    race.registrationStatus === "open"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : race.registrationStatus === "closingSoon"
                        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-300/25 dark:bg-amber-400/10 dark:text-amber-200"
                        : race.registrationStatus === "soldOut"
                          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-400/25 dark:bg-red-950/20 dark:text-red-200"
                          : race.registrationStatus === "notOpenYet"
                            ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-300/20 dark:bg-sky-500/10 dark:text-sky-200"
                            : "border-border/55 bg-secondary/40 text-muted-foreground"
                  }`}
                  title={race.lastCheckedAt?.trim() ? `Last checked: ${race.lastCheckedAt}` : undefined}
                >
                  {registrationLabel}
                </span>
                <p className="text-xs text-muted-foreground">
                  Prices and registration status may change. Always check the official website before registering.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Prices and registration status may change. Always check the official website before registering.
              </p>
            )}

            <div className="mt-5 space-y-2 border-b border-border/70 pb-4 dark:border-white/[0.06]">
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
                className={`flex min-h-[5.25rem] flex-col justify-center rounded-xl border border-primary/30 bg-primary/[0.09] px-4 py-4 shadow-sm ring-1 sm:min-h-[5.5rem] sm:py-[1.125rem] dark:border-primary/25 dark:bg-primary/[0.07] dark:shadow-none ${
                  charityTone ? "ring-pink-400/30 dark:ring-pink-500/25" : "ring-primary/20 dark:ring-primary/15"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Countdown</div>
                <div className="mt-1 text-base font-black leading-snug text-foreground">{countdownLabel}</div>
              </div>
              <div className="flex min-h-[5.25rem] flex-col justify-center rounded-xl border border-border/70 bg-muted/50 px-4 py-4 shadow-sm ring-1 ring-black/[0.02] sm:min-h-[5.5rem] sm:py-[1.125rem] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none dark:ring-white/[0.05]">
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
              <div className="flex min-h-[5.25rem] flex-col justify-center rounded-xl border border-border/70 bg-muted/50 px-4 py-4 shadow-sm ring-1 ring-black/[0.02] sm:min-h-[5.5rem] sm:py-[1.125rem] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none dark:ring-white/[0.05]">
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

            <div className={`mt-6 ${isFestival ? "border-t border-border/70 pt-6 dark:border-white/[0.06]" : ""}`}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {isFestival ? "Experiences & sessions" : "Distances"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {race.distances.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm dark:border-white/15 dark:bg-[#0a0d14]/55 dark:shadow-none dark:backdrop-blur-md"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {race.showCoursePendingNotice && !race.courseRoute ? (
              <div className="mt-6 border-t border-border/70 pt-6 dark:border-white/[0.06]">
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
              <div className="mt-6 border-t border-border/70 pt-6 dark:border-white/[0.06]">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {charityTone ? "Route & gathering" : "Course"}
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-[7.25rem]">
                    {routePreviewInteractive ? (
                      <button
                        type="button"
                        onClick={() => setRouteMapOpen(true)}
                        className="group relative h-28 w-full overflow-hidden rounded-lg border border-border text-left shadow-sm ring-1 ring-black/[0.03] transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/[0.08] dark:shadow-none dark:ring-white/[0.04] sm:h-[5.5rem] sm:w-[7.25rem]"
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
                      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border border-border shadow-sm ring-1 ring-black/[0.03] dark:border-white/[0.08] dark:shadow-none dark:ring-white/[0.04] sm:h-[5.5rem] sm:w-[7.25rem]">
                        {routePreviewSrc ? (
                          <img src={routePreviewSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted dark:bg-white/[0.04]" aria-hidden />
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

            <div className="mt-6 border-t border-border/70 pt-6 dark:border-white/[0.06]">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Pricing</h2>
              {race.pricing.length > 0 ? (
                <>
                  <ul className="divide-y divide-border rounded-xl border border-border bg-muted/40 shadow-sm ring-1 ring-black/[0.02] dark:divide-white/[0.06] dark:border-white/[0.08] dark:bg-[#0a0d14]/40 dark:shadow-none dark:ring-white/[0.04]">
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
                <p className="rounded-xl border border-border bg-muted/50 px-4 py-4 text-sm leading-relaxed text-muted-foreground shadow-sm ring-1 ring-black/[0.02] dark:border-white/[0.08] dark:bg-[#0a0d14]/40 dark:shadow-none dark:ring-white/[0.04]">
                  Not published yet
                </p>
              )}
            </div>

            {!isFestival ? (
              <div className="mt-6 border-t border-border/70 pt-6 dark:border-white/[0.06]">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {charityTone ? "Mission & atmosphere" : "About"}
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{race.description}</p>
              </div>
            ) : race.festivalSections && race.festivalSections.length > 0 ? (
              <div className="mt-6 space-y-8 border-t border-border/70 pt-6 dark:border-white/[0.06]">
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
            className="relative max-h-[92vh] max-w-5xl rounded-xl border border-border bg-card p-2 shadow-2xl ring-1 ring-black/[0.06] dark:border-white/[0.12] dark:bg-[#0c1018] dark:ring-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-md transition hover:bg-muted dark:border-white/15 dark:bg-black/65 dark:text-white dark:hover:bg-black/85"
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
