import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useMockAuth } from "../../hooks/useMockAuth"
import { useRaceSubmissions, type RaceSubmissionType, type RegistrationStatus } from "../../hooks/useRaceSubmissions"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/55 focus:border-primary/40 focus:ring-2"

const LABEL_CLASS = "text-[11px] font-bold uppercase tracking-wider text-muted-foreground"

function TypeChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/55 bg-background/40 text-muted-foreground hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

export function AddRacePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn, user } = useMockAuth()
  const { submit, isAdmin, submissions, canEdit, updateAsCurrentUser } = useRaceSubmissions()

  const editId = searchParams.get("edit")
  const editingSubmission = useMemo(() => (editId ? submissions.find((s) => s.id === editId) ?? null : null), [editId, submissions])
  const isEditMode = Boolean(editId)

  const [type, setType] = useState<RaceSubmissionType>("community_race")
  const [title, setTitle] = useState("")
  const [sport, setSport] = useState<"Running" | "Triathlon" | "Cycling" | "HYROX" | "Other">("Running")
  const [country, setCountry] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [city, setCity] = useState("")
  const [venueLine, setVenueLine] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [distances, setDistances] = useState("")
  const [description, setDescription] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [organizer, setOrganizer] = useState("")
  const [estimatedParticipants, setEstimatedParticipants] = useState("")
  const [entryFee, setEntryFee] = useState("")
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | "">("")
  const [priceNote, setPriceNote] = useState("")
  const [priceLastUpdatedAt, setPriceLastUpdatedAt] = useState("")
  const [lastCheckedAt, setLastCheckedAt] = useState("")
  const [routeUrl, setRouteUrl] = useState("")
  const [notes, setNotes] = useState("")

  const [resultMsg, setResultMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditMode) return
    if (!editingSubmission) return
    setType(editingSubmission.type)
    setTitle(editingSubmission.title)
    setSport(editingSubmission.sport)
    setCountry(editingSubmission.country)
    setCountryCode(editingSubmission.countryCode ?? "")
    setCity(editingSubmission.city)
    setVenueLine(editingSubmission.venueLine ?? "")
    setDate(editingSubmission.date)
    setTime(editingSubmission.time ?? "")
    setDistances(editingSubmission.distances ?? "")
    setDescription(editingSubmission.description ?? "")
    setWebsiteUrl(editingSubmission.websiteUrl ?? "")
    setImageUrl(editingSubmission.imageUrl ?? "")
    setOrganizer(editingSubmission.organizer ?? "")
    setEstimatedParticipants(editingSubmission.estimatedParticipants != null ? String(editingSubmission.estimatedParticipants) : "")
    setEntryFee(editingSubmission.entryFee ?? "")
    setRegistrationStatus((editingSubmission.registrationStatus ?? "") as any)
    setPriceNote(editingSubmission.priceNote ?? "")
    setPriceLastUpdatedAt(editingSubmission.priceLastUpdatedAt ?? "")
    setLastCheckedAt(editingSubmission.lastCheckedAt ?? "")
    setRouteUrl(editingSubmission.routeUrl ?? "")
    setNotes(editingSubmission.notes ?? "")
  }, [editingSubmission, isEditMode])

  const typeHint = useMemo(() => {
    if (type === "official_race") return "Official race submissions require admin approval before being public."
    if (type === "community_race") return "Community races publish immediately."
    return "Community events publish immediately."
  }, [type])

  const onSubmit = () => {
    setResultMsg(null)
    const payload = {
      type,
      title,
      sport,
      country,
      countryCode: countryCode.trim() || undefined,
      city,
      venueLine: venueLine.trim() || undefined,
      date,
      time: time.trim() || undefined,
      distances: distances.trim() || undefined,
      description: description.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      organizer: organizer.trim() || undefined,
      estimatedParticipants: estimatedParticipants.trim() ? Number(estimatedParticipants) : undefined,
      entryFee: entryFee.trim() || undefined,
      registrationStatus: registrationStatus || undefined,
      priceNote: priceNote.trim() || undefined,
      priceLastUpdatedAt: priceLastUpdatedAt.trim() || undefined,
      lastCheckedAt: lastCheckedAt.trim() || undefined,
      routeUrl: routeUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    } as const

    if (isEditMode) {
      if (!editingSubmission) {
        setResultMsg("Submission not found.")
        return
      }
      if (!canEdit(editingSubmission)) {
        setResultMsg("You don't have permission to edit this submission.")
        return
      }
      const res = updateAsCurrentUser(editingSubmission.id, payload, "Edited submission")
      if (!res.ok) {
        setResultMsg(res.error)
        return
      }
      setResultMsg("Updated.")
      navigate(`/profile`, { replace: true })
      return
    }

    const res = submit(payload as any)
    if (!res.ok) {
      setResultMsg(res.error)
      return
    }
    setResultMsg(res.submission.status === "pending" ? "Submitted. Waiting for admin approval." : "Submitted. Your event is now visible.")
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#3b82f6]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">Submit</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">Add Race / Event</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Share official races, community races, or community events. Official submissions go through approval.
            </p>
          </header>

          {!isLoggedIn ? (
            <div className="rounded-3xl border border-border/45 bg-secondary/25 px-6 py-12 text-center backdrop-blur-xl">
              <h2 className="text-lg font-bold text-foreground">Login required</h2>
              <p className="mt-2 text-sm text-muted-foreground">You need an account to submit races or events.</p>
              <Link
                to="/login"
                className="mt-7 inline-flex rounded-full border border-primary/35 bg-primary/12 px-6 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
              <div className="border-b border-border/40 p-6 sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-foreground">Submission type</p>
                    <p className="mt-1 text-xs text-muted-foreground">{typeHint}</p>
                    {isAdmin ? (
                      <p className="mt-2 text-xs font-semibold text-primary">Admin mode enabled for {user?.email}</p>
                    ) : null}
                    {isEditMode && editingSubmission ? (
                      <p className="mt-2 text-xs font-semibold text-muted-foreground">
                        Editing submission · status: <span className="text-primary">{editingSubmission.status}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeChip active={type === "official_race"} onClick={() => setType("official_race")}>
                      Official race
                    </TypeChip>
                    <TypeChip active={type === "community_race"} onClick={() => setType("community_race")}>
                      Community race
                    </TypeChip>
                    <TypeChip active={type === "community_event"} onClick={() => setType("community_event")}>
                      Community event
                    </TypeChip>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {resultMsg ? (
                  <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">
                    {resultMsg}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS}>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD_CLASS} placeholder="Event name" />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Sport</label>
                    <select value={sport} onChange={(e) => setSport(e.target.value as any)} className={FIELD_CLASS}>
                      {["Running", "Triathlon", "Cycling", "HYROX", "Other"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Country</label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} className={FIELD_CLASS} placeholder="Lithuania" />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={FIELD_CLASS} placeholder="Kaunas" />
                  </div>
                </div>

                <details className="mt-6 rounded-2xl border border-border/45 bg-background/20 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-foreground">Details</summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS}>Country code (optional)</label>
                      <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={FIELD_CLASS} placeholder="LT" />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Time (optional)</label>
                      <input value={time} onChange={(e) => setTime(e.target.value)} className={FIELD_CLASS} placeholder="09:00" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Venue / location (optional)</label>
                      <input value={venueLine} onChange={(e) => setVenueLine(e.target.value)} className={FIELD_CLASS} placeholder="Start/finish location" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Distances / categories (optional)</label>
                      <input
                        value={distances}
                        onChange={(e) => setDistances(e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Marathon, Half Marathon, 10K"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Description (optional)</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`${FIELD_CLASS} min-h-[96px] resize-y`}
                        placeholder="What makes this event special?"
                      />
                    </div>
                  </div>
                </details>

                <details className="mt-4 rounded-2xl border border-border/45 bg-background/20 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-foreground">Links & media</summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Official website / registration URL (optional)</label>
                      <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={FIELD_CLASS} placeholder="https://…" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Image URL (optional)</label>
                      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={FIELD_CLASS} placeholder="https://…" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Route URL (optional)</label>
                      <input value={routeUrl} onChange={(e) => setRouteUrl(e.target.value)} className={FIELD_CLASS} placeholder="https://…" />
                    </div>
                  </div>
                </details>

                <details className="mt-4 rounded-2xl border border-border/45 bg-background/20 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-foreground">Organizer & numbers</summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS}>Organizer (optional)</label>
                      <input value={organizer} onChange={(e) => setOrganizer(e.target.value)} className={FIELD_CLASS} placeholder="Club / team / org" />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Estimated participants (optional)</label>
                      <input
                        inputMode="numeric"
                        value={estimatedParticipants}
                        onChange={(e) => setEstimatedParticipants(e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="150"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Price / entry fee (optional)</label>
                      <input value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className={FIELD_CLASS} placeholder="from €35" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Registration status (optional)</label>
                      <select
                        value={registrationStatus}
                        onChange={(e) => setRegistrationStatus(e.target.value as any)}
                        className={FIELD_CLASS}
                      >
                        <option value="">Not set</option>
                        <option value="open">Open for registration</option>
                        <option value="closingSoon">Closing soon</option>
                        <option value="soldOut">Sold out</option>
                        <option value="notOpenYet">Registration not open yet</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLASS}>Price note (optional)</label>
                      <input
                        value={priceNote}
                        onChange={(e) => setPriceNote(e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Early bird until May 20 · limited spots"
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Price last updated (optional)</label>
                      <input type="date" value={priceLastUpdatedAt} onChange={(e) => setPriceLastUpdatedAt(e.target.value)} className={FIELD_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Last checked (optional)</label>
                      <input type="date" value={lastCheckedAt} onChange={(e) => setLastCheckedAt(e.target.value)} className={FIELD_CLASS} />
                    </div>
                  </div>
                </details>

                <details className="mt-4 rounded-2xl border border-border/45 bg-background/20 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-foreground">Notes (optional)</summary>
                  <div className="mt-4">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`${FIELD_CLASS} min-h-[90px] resize-y`}
                      placeholder="Anything an admin should know? (optional)"
                    />
                  </div>
                </details>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Submitting as <span className="font-semibold text-foreground/90">{user?.displayName}</span>
                  </p>
                  <button
                    type="button"
                    onClick={onSubmit}
                    className="inline-flex items-center justify-center rounded-full bg-primary/90 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition hover:bg-primary"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

