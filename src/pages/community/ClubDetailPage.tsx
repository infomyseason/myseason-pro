import { Link, useParams } from "react-router-dom"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"
import { type CommunityClub, getCommunityClubById } from "./communityClubsData"

const SPORT_ACCENTS: Record<
  CommunityClub["sport"],
  { label: string; hex: string; bg: string; border: string; text: string }
> = {
  Running: {
    label: "Running",
    hex: "#22c55e",
    bg: "bg-[#22c55e]/10",
    border: "border-[#22c55e]/25",
    text: "text-[#22c55e]",
  },
  Cycling: {
    label: "Cycling",
    hex: "#3b82f6",
    bg: "bg-[#3b82f6]/10",
    border: "border-[#3b82f6]/25",
    text: "text-[#3b82f6]",
  },
  Triathlon: {
    label: "Triathlon",
    hex: "#a855f7",
    bg: "bg-[#a855f7]/10",
    border: "border-[#a855f7]/25",
    text: "text-[#a855f7]",
  },
  HYROX: {
    label: "HYROX",
    hex: "#f97316",
    bg: "bg-[#f97316]/10",
    border: "border-[#f97316]/25",
    text: "text-[#f97316]",
  },
}

function ExternalIcon({ name }: { name: "instagram" | "website" }) {
  if (name === "instagram")
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1" fill="currentColor" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M10 14a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 10a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ClubDetailPage() {
  const { clubId } = useParams<{ clubId: string }>()
  const club = clubId ? getCommunityClubById(clubId) : undefined

  if (!club) {
    return (
      <div className="min-h-screen bg-background">
        <HomeNavbar />
        <main className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-28 text-center sm:px-6">
          <p className="text-muted-foreground">We couldn’t find this club.</p>
          <Link
            to="/community"
            state={{ tab: "clubs" }}
            className="mt-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/[0.14]"
          >
            Back to clubs
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const accent = SPORT_ACCENTS[club.sport]

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#3b82f6]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/community"
            state={{ tab: "clubs" }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/85"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to clubs
          </Link>

          <article className="mt-8 overflow-hidden rounded-3xl border border-border/45 bg-secondary/25 backdrop-blur-xl">
            <div className="aspect-[21/9] w-full overflow-hidden bg-secondary/30 sm:aspect-[2.4/1]">
              <img
                src={club.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${accent.bg} ${accent.border} ${accent.text}`}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: accent.hex }} />
                  {accent.label}
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{club.name}</h1>
                <p className="mt-2 text-base text-muted-foreground">
                  <span className="mr-1 inline">{EUROPE_FLAG_BY_CODE[club.countryCode] ?? "🏁"}</span>
                  {club.cities?.length ? (
                    <>
                      {club.cities.join(" · ")}
                      <span className="text-muted-foreground/80"> · {club.country}</span>
                    </>
                  ) : (
                    <>
                      {club.city}, {club.country}
                    </>
                  )}
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-border/45 bg-background/40 px-5 py-4 text-center sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Members</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{club.membersCount}</p>
              </div>
            </div>

            <p className="mt-8 text-base leading-relaxed text-foreground/95">{club.description}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {club.instagramUrl ? (
                <a
                  href={club.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-secondary/35 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                >
                  <ExternalIcon name="instagram" />
                  Instagram
                </a>
              ) : null}
              {club.websiteUrl ? (
                <a
                  href={club.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-secondary/35 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary/55"
                >
                  <ExternalIcon name="website" />
                  Website
                </a>
              ) : null}
            </div>

            <p className="mt-8 text-xs text-muted-foreground">Local club · mock data</p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
