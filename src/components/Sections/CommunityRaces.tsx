import { RaceCard } from "../cards/RaceCard"
import { sportKeyFromLabel } from "../sportTokens"

type CommunityRace = {
  id: string
  title: string
  location: string
  countryName: string
  flag: string
  sportType: string
  distances: string[]
  dateLabel: string
  imageUrl: string
  daysUntil: number
}

const MOCK_COMMUNITY_RACES: CommunityRace[] = [
  {
    id: "cr-1",
    title: "Bohemia Gravel Adventure",
    location: "Prague",
    countryName: "Czech Republic",
    flag: "🇨🇿",
    sportType: "Cycling",
    distances: ["80km", "140km"],
    dateLabel: "Jun 14, 2026",
    daysUntil: 38,
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cr-2",
    title: "Carpathian Sunrise Trail",
    location: "Brașov",
    countryName: "Romania",
    flag: "🇷🇴",
    sportType: "Running",
    distances: ["21K", "42K"],
    dateLabel: "Jul 19, 2026",
    daysUntil: 73,
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cr-3",
    title: "Lisbon Riverside Time Trial",
    location: "Lisbon",
    countryName: "Portugal",
    flag: "🇵🇹",
    sportType: "Cycling",
    distances: ["20km"],
    dateLabel: "May 24, 2026",
    daysUntil: 17,
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cr-4",
    title: "Stockholm Sprint Triathlon",
    location: "Stockholm",
    countryName: "Sweden",
    flag: "🇸🇪",
    sportType: "Triathlon",
    distances: ["Sprint"],
    dateLabel: "Jun 28, 2026",
    daysUntil: 52,
    imageUrl: "https://images.unsplash.com/photo-1520975693411-6b56f0fd4d35?w=800&auto=format&fit=crop&q=80",
  },
]

export function CommunityRaces() {
  return (
    <section className="relative overflow-hidden border-t border-border/30 py-16 md:py-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black text-foreground md:text-5xl">Community races</h2>
            <p className="mt-2 text-lg text-muted-foreground">Events created by athletes like you</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            View all
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {MOCK_COMMUNITY_RACES.map((race) => (
            <RaceCard
              key={race.id}
              mode="sport"
              sportKey={sportKeyFromLabel(race.sportType)}
              title={race.title}
              locationLine={`${race.location}, ${race.countryName}`}
              flag={race.flag}
              dateLabel={race.dateLabel}
              imageUrl={race.imageUrl}
              distances={race.distances}
              daysUntil={race.daysUntil}
              extraBadge="Community"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
