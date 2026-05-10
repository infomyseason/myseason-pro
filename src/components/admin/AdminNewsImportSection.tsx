import { useCallback, useEffect, useState, type FormEvent } from "react"
import { isSupabaseConfigured } from "../../lib/supabase"
import type { NewsSportChannel } from "../../lib/news/newsSportChannel"
import {
  insertNewsSourceAdmin,
  loadNewsSourcesAdmin,
  loadPendingImportedNewsAdmin,
  setImportedNewsStatusAdmin,
  simulateImportFromSourceAdmin,
  type ImportedNewsRow,
  type NewsSourceRow,
} from "../../lib/news/importedNewsSupabase"

const FIELD_CLASS =
  "w-full rounded-xl border border-border/55 bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none ring-primary/15 placeholder:text-muted-foreground/55 focus:border-primary/40 focus:ring-2"

const SPORT_OPTIONS: NewsSportChannel[] = ["Running", "Triathlon", "Cycling", "HYROX", "Community"]

export function AdminNewsImportSection() {
  const [sources, setSources] = useState<NewsSourceRow[]>([])
  const [pending, setPending] = useState<ImportedNewsRow[]>([])
  const [banner, setBanner] = useState<string | null>(null)
  const [busySourceId, setBusySourceId] = useState<string | null>(null)

  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newRaceId, setNewRaceId] = useState("")
  const [newSport, setNewSport] = useState<NewsSportChannel>("Running")

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const [s, p] = await Promise.all([loadNewsSourcesAdmin(), loadPendingImportedNewsAdmin()])
    setSources(s)
    setPending(p)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addSource(e: FormEvent) {
    e.preventDefault()
    setBanner(null)
    const res = await insertNewsSourceAdmin({
      source_name: newName,
      source_url: newUrl,
      related_event_id: newRaceId.trim() || null,
      sport: newSport,
      fetch_kind: "mock",
    })
    if (!res.ok) {
      setBanner(res.error ?? "Could not add source.")
      return
    }
    setNewName("")
    setNewUrl("")
    setNewRaceId("")
    setNewSport("Running")
    await refresh()
  }

  async function runMockImport(source: NewsSourceRow) {
    setBusySourceId(source.id)
    setBanner(null)
    try {
      const result = await simulateImportFromSourceAdmin(source)
      if (result.error) {
        setBanner(result.error)
      } else {
        setBanner(`Imported ${result.inserted} new headline(s); ${result.skipped} duplicate(s) skipped.`)
      }
      await refresh()
    } finally {
      setBusySourceId(null)
    }
  }

  async function resolvePending(id: string, status: ImportedNewsRow["status"]) {
    setBanner(null)
    const res = await setImportedNewsStatusAdmin(id, status)
    if (!res.ok) setBanner(res.error ?? "Update failed.")
    await refresh()
  }

  if (!isSupabaseConfigured()) {
    return (
      <section className="mt-6 rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
        <div className="border-b border-border/40 p-6 sm:p-8">
          <h2 className="text-lg font-black text-foreground">News sources & import</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Supabase (<code className="text-xs">VITE_SUPABASE_URL</code>,{" "}
            <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>) and apply migrations to enable official news import.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6 rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
      <div className="border-b border-border/40 p-6 sm:p-8">
        <h2 className="text-lg font-black text-foreground">News sources & import</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Register organiser homepage or future RSS URLs. MVP uses{" "}
          <code className="rounded bg-background/40 px-1 py-0.5 text-xs">fetchNewsFromSource()</code> mock payloads — no
          scraping yet. Headlines stay as short summaries; readers open the{" "}
          <span className="font-semibold text-foreground">official source</span> link. Add your email to{" "}
          <code className="rounded bg-background/40 px-1 py-0.5 text-xs">news_admin_allowlist</code> via SQL Editor so
          JWT policies allow imports.
        </p>
        {banner ? (
          <p className="mt-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">{banner}</p>
        ) : null}
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Add news source</h3>
          <form className="mt-4 space-y-3" onSubmit={addSource}>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Source name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className={FIELD_CLASS} required placeholder="e.g. Vilnius Marathon official" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Source URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className={FIELD_CLASS}
                required
                placeholder="https://example-race.com"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Related event id (optional)
              </label>
              <input
                value={newRaceId}
                onChange={(e) => setNewRaceId(e.target.value)}
                className={FIELD_CLASS}
                placeholder="mock race id, e.g. swedbank-vilnius-marathon-2026"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sport channel</label>
              <select value={newSport} onChange={(e) => setNewSport(e.target.value as NewsSportChannel)} className={FIELD_CLASS}>
                {SPORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-full bg-primary/90 px-5 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary"
            >
              Save source
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Sources</h3>
          <ul className="mt-4 space-y-3">
            {sources.length === 0 ? (
              <li className="rounded-xl border border-border/45 bg-background/25 px-4 py-6 text-center text-sm text-muted-foreground">
                No sources yet.
              </li>
            ) : (
              sources.map((src) => (
                <li key={src.id} className="rounded-xl border border-border/45 bg-background/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{src.source_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{src.source_url}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {src.sport} · {src.fetch_kind}
                        {src.related_event_id ? ` · event ${src.related_event_id}` : ""}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Last check: {src.last_checked_at ? new Date(src.last_checked_at).toLocaleString() : "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!src.enabled || busySourceId === src.id}
                      onClick={() => runMockImport(src)}
                      className="shrink-0 rounded-full border border-primary/35 bg-primary/12 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-primary transition hover:border-primary/55 hover:bg-primary/[0.16] disabled:opacity-45"
                    >
                      {busySourceId === src.id ? "Importing…" : "Mock import"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40 p-6 sm:p-8">
        <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Pending headlines</h3>
        <p className="mt-1 text-sm text-muted-foreground">Approve before they appear on Community → News.</p>
        <div className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <p className="rounded-xl border border-border/45 bg-background/25 px-4 py-6 text-center text-sm text-muted-foreground">
              No pending items.
            </p>
          ) : (
            pending.map((row) => (
              <div key={row.id} className="rounded-xl border border-border/45 bg-background/30 p-4">
                <p className="font-bold text-foreground">{row.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.summary}</p>
                <a
                  href={row.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-xs font-semibold text-sky-300 hover:text-sky-200"
                >
                  Preview source ↗
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => resolvePending(row.id, "approved")}
                    className="rounded-full bg-primary/90 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => resolvePending(row.id, "rejected")}
                    className="rounded-full border border-red-400/25 bg-red-950/25 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-red-200 transition hover:border-red-400/45"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
