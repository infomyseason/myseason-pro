export type CommunityClub = {
  id: string
  name: string
  sport: "Running" | "Triathlon" | "Cycling" | "HYROX"
  /** Hero image for cards & detail (race-card style). */
  coverImageUrl: string
  /** Primary city for sorting when multi-city */
  city: string
  /** Multiple meeting hubs — shown on card and used for city filters */
  cities?: string[]
  country: string
  countryCode: string
  description: string
  websiteUrl?: string
  instagramUrl?: string
  membersCount: number
}

export const MOCK_COMMUNITY_CLUBS: CommunityClub[] = [
  {
    id: "club-temple-social-club",
    name: "Temple Social Club",
    sport: "Running",
    coverImageUrl:
      "https://templesocial.club/wp-content/uploads/2026/04/Temple-homepage-dekstop.jpg",
    city: "Kaunas",
    cities: ["Kaunas", "Vilnius", "Klaipėda"],
    country: "Lithuania",
    countryCode: "LT",
    description:
      "Temple Social Club is Lithuania’s running community with hubs in Kaunas, Vilnius, and Klaipėda — group miles, structured workouts, and about 400 members pushing together.",
    instagramUrl: "https://www.instagram.com/temple.socialclub/",
    membersCount: 400,
  },
  {
    id: "club-01",
    name: "myseason Run Club",
    sport: "Running",
    coverImageUrl:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&auto=format&fit=crop&q=80",
    city: "Vilnius",
    country: "Lithuania",
    countryCode: "LT",
    description: "Weekly socials + structured sessions. Beginners welcome, PB hunters supported.",
    instagramUrl: "#",
    websiteUrl: "#",
    membersCount: 214,
  },
  {
    id: "club-02",
    name: "Tri Squad BCN",
    sport: "Triathlon",
    coverImageUrl:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    description: "Swim/bike/run group with open-water meetups and race-weekend support.",
    instagramUrl: "#",
    membersCount: 128,
  },
  {
    id: "club-03",
    name: "North Road Collective",
    sport: "Cycling",
    coverImageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277d4c61895?w=1200&auto=format&fit=crop&q=80",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    description: "Road + gravel rides, cafe culture, and big days out with friendly pacing groups.",
    websiteUrl: "#",
    membersCount: 302,
  },
  {
    id: "club-04",
    name: "HYROX Crew Berlin",
    sport: "HYROX",
    coverImageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    description: "Strength + engine sessions focused on HYROX race prep and team doubles.",
    instagramUrl: "#",
    membersCount: 176,
  },
]

const CLUB_BY_ID = new Map(MOCK_COMMUNITY_CLUBS.map((c) => [c.id, c]))

export function getCommunityClubById(id: string): CommunityClub | undefined {
  return CLUB_BY_ID.get(id)
}
