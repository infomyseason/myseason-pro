import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth/useAuth"
import { isAdminEmail } from "../lib/adminEmails"
import { notifyUserDataChanged, USER_DATA_CHANGED_EVENT } from "./userScopedStorage"

export type RaceSubmissionType = "official_race" | "community_race" | "community_event"
export type RaceSubmissionStatus = "pending" | "approved" | "rejected"
export type RegistrationStatus = "open" | "closingSoon" | "soldOut" | "notOpenYet" | "cancelled"

export type SubmissionEditHistoryEntry = {
  at: string // ISO
  byUserId: string
  byName: string
  note?: string
}

export type RaceSubmission = {
  id: string
  createdAt: string // ISO
  updatedAt: string // ISO
  createdByUserId: string
  createdByEmail: string
  createdByName: string
  updatedByUserId?: string
  status: RaceSubmissionStatus
  type: RaceSubmissionType

  title: string
  sport: "Running" | "Triathlon" | "Cycling" | "HYROX" | "Other"
  country: string
  countryCode?: string
  city: string
  venueLine?: string
  date: string // ISO date
  time?: string
  distances?: string
  description?: string
  websiteUrl?: string
  imageUrl?: string
  organizer?: string
  estimatedParticipants?: number
  entryFee?: string
  registrationStatus?: RegistrationStatus
  priceLastUpdatedAt?: string
  lastCheckedAt?: string
  priceNote?: string
  routeUrl?: string
  notes?: string
  adminNote?: string
  editHistory?: SubmissionEditHistoryEntry[]
}

export const RACE_SUBMISSIONS_STORAGE_KEY = "myseason_race_submissions_v1"

function nowIso(): string {
  return new Date().toISOString()
}

function readNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim()) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function readString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function coerceSubmission(row: unknown): RaceSubmission | null {
  if (typeof row !== "object" || row === null) return null
  const r = row as Record<string, unknown>
  const id = readString(r.id)
  const createdAt = readString(r.createdAt)
  const updatedAt = readString(r.updatedAt)
  const createdByUserId = readString(r.createdByUserId)
  const createdByEmail = readString(r.createdByEmail)
  const createdByName = readString(r.createdByName) ?? "User"
  const updatedByUserId = readString(r.updatedByUserId)
  const status = readString(r.status) as RaceSubmissionStatus | undefined
  const type = readString(r.type) as RaceSubmissionType | undefined

  const title = readString(r.title)
  const sport = readString(r.sport) as RaceSubmission["sport"] | undefined
  const country = readString(r.country)
  const city = readString(r.city)
  const date = readString(r.date)
  const registrationStatus = readString(r.registrationStatus) as RegistrationStatus | undefined

  if (!id || !createdAt || !updatedAt || !createdByUserId || !createdByEmail) return null
  if (!status || !type || !title || !sport || !country || !city || !date) return null
  if (!["pending", "approved", "rejected"].includes(status)) return null
  if (!["official_race", "community_race", "community_event"].includes(type)) return null
  if (
    registrationStatus &&
    !["open", "closingSoon", "soldOut", "notOpenYet", "cancelled"].includes(registrationStatus)
  )
    return null

  return {
    id,
    createdAt,
    updatedAt,
    createdByUserId,
    createdByEmail,
    createdByName,
    updatedByUserId,
    status,
    type,
    title,
    sport,
    country,
    countryCode: readString(r.countryCode),
    city,
    venueLine: readString(r.venueLine),
    date,
    time: readString(r.time),
    distances: readString(r.distances),
    description: readString(r.description),
    websiteUrl: readString(r.websiteUrl),
    imageUrl: readString(r.imageUrl),
    organizer: readString(r.organizer),
    estimatedParticipants: readNumber(r.estimatedParticipants),
    entryFee: readString(r.entryFee),
    registrationStatus,
    priceLastUpdatedAt: readString(r.priceLastUpdatedAt),
    lastCheckedAt: readString(r.lastCheckedAt),
    priceNote: readString(r.priceNote),
    routeUrl: readString(r.routeUrl),
    notes: readString(r.notes),
    adminNote: readString(r.adminNote),
    editHistory: Array.isArray(r.editHistory)
      ? (r.editHistory
          .map((row) => {
            if (typeof row !== "object" || row === null) return null
            const rr = row as Record<string, unknown>
            const at = readString(rr.at)
            const byUserId = readString(rr.byUserId)
            const byName = readString(rr.byName)
            if (!at || !byUserId || byName == null) return null
            const note = readString(rr.note)
            return { at, byUserId, byName, ...(note?.trim() ? { note } : {}) }
          })
          .filter((x): x is SubmissionEditHistoryEntry => Boolean(x)) as SubmissionEditHistoryEntry[])
      : undefined,
  }
}

export function loadRaceSubmissions(): RaceSubmission[] {
  const raw = localStorage.getItem(RACE_SUBMISSIONS_STORAGE_KEY)
  const arr = safeParseArray(raw)
  const out: RaceSubmission[] = []
  for (const row of arr) {
    const s = coerceSubmission(row)
    if (s) out.push(s)
  }
  return out
}

export function saveRaceSubmissions(next: RaceSubmission[]): void {
  localStorage.setItem(RACE_SUBMISSIONS_STORAGE_KEY, JSON.stringify(next))
  notifyUserDataChanged()
}

export function useRaceSubmissions(): {
  submissions: RaceSubmission[]
  isAdmin: boolean
  submit: (input: Omit<RaceSubmission, "id" | "createdAt" | "updatedAt" | "createdByUserId" | "createdByEmail" | "status">) => {
    ok: true
    submission: RaceSubmission
  } | { ok: false; error: string }
  canEdit: (s: RaceSubmission) => boolean
  updateAsCurrentUser: (id: string, patch: Partial<RaceSubmission>, note?: string) => { ok: true } | { ok: false; error: string }
  remove: (id: string) => void
  approve: (id: string) => void
  reject: (id: string, adminNote?: string) => void
} {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [submissions, setSubmissionsState] = useState<RaceSubmission[]>([])

  const reload = useCallback(() => setSubmissionsState(loadRaceSubmissions()), [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const onEvt = () => reload()
    window.addEventListener("storage", onEvt)
    window.addEventListener(USER_DATA_CHANGED_EVENT, onEvt)
    return () => {
      window.removeEventListener("storage", onEvt)
      window.removeEventListener(USER_DATA_CHANGED_EVENT, onEvt)
    }
  }, [reload])

  const isAdmin = useMemo(() => isAdminEmail(user?.email), [user?.email])

  const submit = useCallback(
    (input: Omit<RaceSubmission, "id" | "createdAt" | "updatedAt" | "createdByUserId" | "createdByEmail" | "createdByName" | "status">) => {
      if (!userId || !user) return { ok: false as const, error: "You must be logged in to submit." }
      const title = input.title.trim()
      const country = input.country.trim()
      const city = input.city.trim()
      const date = input.date.trim()
      if (!title || !country || !city || !date) return { ok: false as const, error: "Fill in title, country, city and date." }

      const status: RaceSubmissionStatus =
        input.type === "official_race" && !isAdminEmail(user.email) ? "pending" : "approved"

      const sub: RaceSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        createdByUserId: user.id,
        createdByEmail: user.email,
        createdByName: user.displayName,
        updatedByUserId: user.id,
        status,
        ...input,
        title,
        country,
        city,
        date,
      }

      const next = [sub, ...loadRaceSubmissions()]
      saveRaceSubmissions(next)
      setSubmissionsState(next)
      return { ok: true as const, submission: sub }
    },
    [user, userId],
  )

  const canEdit = useCallback(
    (s: RaceSubmission) => {
      if (!userId || !user) return false
      if (isAdminEmail(user.email)) return true
      return s.createdByUserId === userId
    },
    [user, userId],
  )

  const updateAsCurrentUser = useCallback(
    (id: string, patch: Partial<RaceSubmission>, note?: string) => {
      if (!userId || !user) return { ok: false as const, error: "You must be logged in to edit." }
      const all = loadRaceSubmissions()
      const current = all.find((s) => s.id === id)
      if (!current) return { ok: false as const, error: "Submission not found." }
      if (!canEdit(current)) return { ok: false as const, error: "You don't have permission to edit this submission." }

      const isAdminActor = isAdminEmail(user.email)
      const requestedType = patch.type ?? current.type
      let nextStatus = current.status

      // Official races always require admin approval after creator edits, including type changes from community rows.
      if (!isAdminActor && requestedType === "official_race") {
        nextStatus = "pending"
      }

      const historyEntry: SubmissionEditHistoryEntry = {
        at: nowIso(),
        byUserId: user.id,
        byName: user.displayName,
        ...(note?.trim() ? { note: note.trim() } : {}),
      }

      const merged: RaceSubmission = {
        ...current,
        ...patch,
        status: isAdminActor && patch.status ? patch.status : nextStatus,
        updatedAt: nowIso(),
        updatedByUserId: user.id,
        editHistory: [...(current.editHistory ?? []), historyEntry],
      }

      const next = all.map((s) => (s.id === id ? merged : s))
      saveRaceSubmissions(next)
      setSubmissionsState(next)
      return { ok: true as const }
    },
    [canEdit, user, userId],
  )

  const remove = useCallback((id: string) => {
    const next = loadRaceSubmissions().filter((s) => s.id !== id)
    saveRaceSubmissions(next)
    setSubmissionsState(next)
  }, [])

  const approve = useCallback((id: string) => {
    const all = loadRaceSubmissions()
    const hit = all.find((s) => s.id === id)
    if (!hit) return
    // admin-only gating happens in UI/route guard, but keep safe.
    if (!isAdminEmail(user?.email)) return
    const next = all.map((s) =>
      s.id === id
        ? { ...s, status: "approved" as RaceSubmissionStatus, updatedAt: nowIso(), updatedByUserId: user?.id }
        : s,
    )
    saveRaceSubmissions(next)
    setSubmissionsState(next)
  }, [user?.email, user?.id])

  const reject = useCallback(
    (id: string, adminNote?: string) => {
      const all = loadRaceSubmissions()
      const hit = all.find((s) => s.id === id)
      if (!hit) return
      if (!isAdminEmail(user?.email)) return
      const next = all.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "rejected" as RaceSubmissionStatus,
              adminNote,
              updatedAt: nowIso(),
              updatedByUserId: user?.id,
            }
          : s,
      )
      saveRaceSubmissions(next)
      setSubmissionsState(next)
    },
    [user?.email, user?.id],
  )

  return { submissions, isAdmin, submit, canEdit, updateAsCurrentUser, remove, approve, reject }
}

