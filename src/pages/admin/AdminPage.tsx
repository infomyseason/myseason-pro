import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useRaceSubmissions, type RaceSubmission } from "../../hooks/useRaceSubmissions"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/55 focus:border-primary/40 focus:ring-2"

function StatusPill({ status }: { status: RaceSubmission["status"] }) {
  const cls =
    status === "pending"
      ? "border-primary/25 bg-primary/10 text-primary"
      : status === "approved"
        ? "border-[#22c55e]/25 bg-[#22c55e]/10 text-[#22c55e]"
        : "border-red-400/25 bg-red-950/20 text-red-200"
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  )
}

export function AdminPage() {
  const { submissions, approve, reject, remove, update } = useRaceSubmissions()
  const [editingId, setEditingId] = useState<string | null>(null)

  const pendingOfficial = useMemo(
    () => submissions.filter((s) => s.type === "official_race" && s.status === "pending"),
    [submissions],
  )

  const recent = useMemo(() => submissions.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 30), [submissions])

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#f97316]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/90">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">Submissions</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Review pending official races. Community races/events are approved automatically.
            </p>
          </header>

          <section className="rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
            <div className="border-b border-border/40 p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">Pending official races</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{pendingOfficial.length} waiting for approval</p>
                </div>
                <Link
                  to="/add-race"
                  className="inline-flex items-center justify-center rounded-full border border-primary/35 bg-primary/12 px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
                >
                  Add submission
                </Link>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {pendingOfficial.length === 0 ? (
                <div className="rounded-2xl border border-border/45 bg-background/25 px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">No pending official races.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOfficial.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-border/45 bg-background/30 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill status={s.status} />
                            <span className="text-xs font-semibold text-muted-foreground">Official race</span>
                          </div>
                          <p className="mt-2 truncate text-lg font-black text-foreground">{s.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {s.city}, {s.country} · {s.date} · {s.sport}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Submitted by {s.createdByEmail}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => approve(s.id)}
                            className="rounded-full bg-primary/90 px-5 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => reject(s.id, "Rejected by admin")}
                            className="rounded-full border border-red-400/25 bg-red-950/25 px-5 py-2 text-xs font-bold uppercase tracking-wide text-red-200 transition hover:border-red-400/45 hover:bg-red-950/35"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId((v) => (v === s.id ? null : s.id))}
                            className="rounded-full border border-border/55 bg-secondary/35 px-5 py-2 text-xs font-bold uppercase tracking-wide text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                          >
                            {editingId === s.id ? "Close" : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(s.id)}
                            className="rounded-full border border-border/55 bg-background/30 px-5 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground transition hover:border-red-400/35 hover:bg-red-950/25 hover:text-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {editingId === s.id ? (
                        <div className="mt-5 grid gap-4 border-t border-border/40 pt-5 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                            <input value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} className={FIELD_CLASS} />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sport</label>
                            <select value={s.sport} onChange={(e) => update(s.id, { sport: e.target.value as any })} className={FIELD_CLASS}>
                              {["Running", "Triathlon", "Cycling", "HYROX", "Other"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                            <input type="date" value={s.date} onChange={(e) => update(s.id, { date: e.target.value })} className={FIELD_CLASS} />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Country</label>
                            <input value={s.country} onChange={(e) => update(s.id, { country: e.target.value })} className={FIELD_CLASS} />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">City</label>
                            <input value={s.city} onChange={(e) => update(s.id, { city: e.target.value })} className={FIELD_CLASS} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Website (optional)</label>
                            <input value={s.websiteUrl ?? ""} onChange={(e) => update(s.id, { websiteUrl: e.target.value })} className={FIELD_CLASS} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Image URL (optional)</label>
                            <input value={s.imageUrl ?? ""} onChange={(e) => update(s.id, { imageUrl: e.target.value })} className={FIELD_CLASS} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
            <div className="border-b border-border/40 p-6 sm:p-8">
              <h2 className="text-lg font-black text-foreground">Recent submissions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Quick overview (latest updates).</p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recent.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-border/45 bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill status={s.status} />
                      <span className="text-xs font-semibold text-muted-foreground">{s.type.replace(/_/g, " ")}</span>
                    </div>
                    <p className="mt-2 truncate text-sm font-black text-foreground">{s.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.city}, {s.country} · {s.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

