import { HYROX_EVENTS_EUROPE_2026 } from "./hyroxEvents"
import { filterRaceDetailsNotPast } from "./raceDateFilters"

export type RacePricingTier = {
  distance: string
  /** e.g. "from €13" or "up to €74 with extra options" */
  priceNote: string
}

export type RaceCourseRoute = {
  elevationGain: string
  layoutType: string
  surface: string
  profileSummary: string
  startFinish: string
  /** Short landmarks / vibe bullets under Course (optional). */
  highlights?: string[]
}

export type EventDetailKind = "race" | "festival"

/** Softer copy & accents for charity / awareness events (not elite race framing). */
export type DetailPresentationTone = "standard" | "charityCommunity"

export type RegistrationStatus = "open" | "closingSoon" | "soldOut" | "notOpenYet" | "cancelled"

export type FestivalSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export type MockRaceDetail = {
  id: string
  title: string
  sport: string
  category: string
  country: string
  countryCode: string
  city: string
  /** Optional venue line shown under location (e.g. Nemunas Island). */
  venueLine?: string
  /** ISO date `YYYY-MM-DD` */
  date: string
  distances: string[]
  /** Terrain badges (races) or urban/social tags (festival pages). */
  courseProfile: string[]
  /** Small preview visual + structured course facts (optional per race). */
  courseRoute?: RaceCourseRoute
  /** Published route map available — drives preview interaction + modal. */
  hasRoute: boolean
  /** Thumbnail for course preview (optional). */
  routeImage?: string
  /** Full map asset or page URL opened from preview (optional). */
  routeUrl?: string
  image: string
  description: string
  /** Omit when field sizes are not published — detail page shows “Not published yet”. */
  participants?: number
  /** Tier rows; empty when pricing is not listed here — detail page shows “Not published yet”. */
  pricing: RacePricingTier[]
  /** Summary line for stats card; omit when unknown — detail page shows “Not published yet”. */
  startingPriceLabel?: string
  /** Manual status shown on cards/details (no scraping yet). */
  registrationStatus?: RegistrationStatus
  /** ISO date — when price was last reviewed/updated. */
  priceLastUpdatedAt?: string
  /** ISO date — when status/price was last checked. */
  lastCheckedAt?: string
  /** Optional extra pricing note (e.g. "Early bird until May 20"). */
  priceNote?: string
  officialWebsite: string
  isOfficial: boolean
  /** Default marathon-style detail page when omitted. */
  detailKind?: EventDetailKind
  /** Course stats labels & light UI accents for awareness / charity tone. */
  detailTone?: DetailPresentationTone
  /** Shown under participant count on the stats card when set. */
  participantFootnote?: string
  /** Shown on premium festival variant pages. */
  organizer?: string
  /** Narrative blocks for `detailKind: "festival"` pages. */
  festivalSections?: FestivalSection[]
  /**
   * Multisport / TBD routes: show Course heading + “Route not published yet” without inventing stats.
   * Omit `courseRoute` when using this.
   */
  showCoursePendingNotice?: boolean
}

export type MockRaceListItem = {
  id: string
  title: string
  city: string
  countryCode: string
  countryName: string
  raceType: string
  dateLabel: string
  distances: string[]
  imageUrl: string
  daysUntil: number
  startingPriceLabel?: string
  registrationStatus?: RegistrationStatus
  priceNote?: string
}

function formatRaceDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

export function computeDaysUntilRace(isoDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(`${isoDate}T00:00:00`)
  event.setHours(0, 0, 0, 0)
  return Math.ceil((event.getTime() - today.getTime()) / 86400000)
}

export const SWEDBANK_VILNIUS_MARATHON: MockRaceDetail = {
  id: "swedbank-vilnius-marathon-2026",
  title: "Swedbank Vilnius Marathon",
  sport: "Running",
  category: "Marathon",
  country: "Lithuania",
  countryCode: "LT",
  city: "Vilnius",
  date: "2026-09-13",
  distances: ["Marathon", "Half Marathon", "10K", "5K", "Kids Run"],
  courseProfile: ["Fast course", "Beginner friendly", "Scenic", "City course"],
  courseRoute: {
    elevationGain: "~240m",
    layoutType: "Single-loop marathon",
    surface: "Road",
    profileSummary: "Rolling / Mostly flat",
    startFinish: "Cathedral Square",
  },
  hasRoute: true,
  routeImage:
    "https://images.unsplash.com/photo-1576678927484-cc907957088e?w=640&auto=format&fit=crop&q=80",
  routeUrl:
    "https://images.unsplash.com/photo-1576678927484-cc907957088e?w=2000&auto=format&fit=crop&q=80",
  image: "https://www.vilniausmaratonas.lt/content/uploads/2025/08/IMG_4426.jpeg",
  description:
    "Lithuania’s biggest road race — thousands of runners, Old Town streets and open boulevards, one weekend with every distance from Kids Run to marathon. Fast enough for a PB hunt, welcoming enough for a first serious start line.",
  participants: 13700,
  pricing: [
    { distance: "Kids Run", priceNote: "from €13" },
    { distance: "5K", priceNote: "from €25" },
    { distance: "10K", priceNote: "from €35" },
    { distance: "Half Marathon", priceNote: "from €49" },
    { distance: "Marathon", priceNote: "up to €74 with extra options" },
  ],
  startingPriceLabel: "Starting from €13",
  officialWebsite: "https://www.vilniausmaratonas.lt/",
  isOfficial: true,
}

/** TEMPLE Kauno pusmaratonis — official Temple Social Club city race on Nemunas Island. */
export const TEMPLE_KAUNO_PUSMARATONIS_2026: MockRaceDetail = {
  id: "temple-kauno-pusmaratonis-2026",
  title: "TEMPLE Kauno pusmaratonis",
  sport: "Running",
  category: "City festival",
  country: "Lithuania",
  countryCode: "LT",
  city: "Kaunas",
  venueLine: "Nemuno sala · Nemunas Island",
  date: "2026-08-29",
  distances: ["Half Marathon", "10K", "5K", "400m Kids Run"],
  courseProfile: [
    "Community",
    "City festival",
    "Music & atmosphere",
    "Beginner friendly",
    "Family friendly",
    "Nemunas Island",
    "Wellness",
    "Kaunas city vibes",
  ],
  courseRoute: {
    elevationGain: "Minimal — island loops",
    layoutType: "River-island circuits · Kaunas",
    surface: "Asphalt & paved paths",
    profileSummary: "Flat to gently rolling",
    startFinish: "Nemuno sala",
  },
  hasRoute: true,
  routeImage: "https://templesocial.club/wp-content/uploads/2026/04/Temple-trasos-dekst.jpg",
  routeUrl: "https://templesocial.club/wp-content/uploads/2026/04/Temple-trasos-dekst.jpg",
  image: "https://templesocial.club/wp-content/uploads/2026/04/Temple-homepage-dekstop.jpg",
  description:
    "TEMPLE Kauno pusmaratonis is more than a conventional start-line-only race — it is a Kaunas-facing celebration on Nemunas Island where running is one part of a fuller city weekend: music, community energy, and room for families and neighbours beside competitive lanes. Open by design, it welcomes runners, relatives, friends, and locals alike — aiming for roughly five thousand participants and visitors. Half marathon, 10K, 5K, and a 400m kids run keep the programme inclusive across ages and fitness levels.",
  participants: 5000,
  pricing: [
    { distance: "400m Kids Run", priceNote: "from €13" },
    { distance: "5K", priceNote: "up to ~€38" },
    { distance: "10K", priceNote: "up to ~€38" },
    { distance: "Half Marathon", priceNote: "up to ~€38" },
  ],
  startingPriceLabel: "Starting from €13",
  officialWebsite: "https://templesocial.club/",
  isOfficial: true,
}

/** PINK RUN su ANTĖJA — breast cancer awareness charity run, Kaunas (warm community tone). */
export const PINK_RUN_SU_ANTEJA_2026: MockRaceDetail = {
  id: "pink-run-su-anteja-2026",
  title: "PINK RUN su ANTĖJA 2026",
  organizer: "VšĮ Kauno maratono klubas",
  sport: "Running",
  category: "Charity run",
  country: "Lithuania",
  countryCode: "LT",
  city: "Kaunas",
  venueLine: "Nepriklausomybės aikštė · Laisvės alėja",
  date: "2026-10-04",
  distances: ["10K", "5K", "600m Kids Run"],
  detailTone: "charityCommunity",
  participantFootnote: "Thousands of runners and supporters join every edition.",
  courseProfile: [
    "Charity run",
    "Community",
    "Family friendly",
    "Pink atmosphere",
    "Awareness event",
    "Beginner friendly",
    "City celebration",
    "Social impact",
  ],
  courseRoute: {
    elevationGain: "Uplifting boulevard energy · ribbons & gathering crowds",
    layoutType: "Laisvės alėja spine · Independence Square heart",
    surface: "Central Kaunas boulevard & adjoining streets",
    profileSummary: "Walk-run friendly · every pace belongs",
    startFinish: "Nepriklausomybės aikštė · Laisvės alėja route",
  },
  hasRoute: true,
  routeImage: "https://pinkrun.lt/assets/img/trasa.png",
  routeUrl: "https://pinkrun.lt/assets/img/trasa_full.png",
  image: "/pink-run-su-anteja-2026-hero.jpg",
  description:
    "Each October, Kaunas turns pink for a ribbon run focused on breast cancer awareness and standing with women and families touched by the disease. Expect an upbeat city celebration along Laisvės alėja — approachable distances, families side by side, music and colour — where showing up matters more than pace.",
  participants: 4200,
  pricing: [
    { distance: "600m Kids Run", priceNote: "€10.00" },
    { distance: "5K", priceNote: "€25.00" },
    { distance: "10K", priceNote: "€25.00" },
  ],
  startingPriceLabel: "Starting from €10",
  officialWebsite: "https://pinkrun.lt/",
  isOfficial: true,
}

/** Verified premium international marathon — official imagery & 42 km route map from rimirigamarathon.com. */
export const RIMI_RIGA_MARATHON_2026: MockRaceDetail = {
  id: "rimi-riga-marathon-2026",
  title: "Rimi Riga Marathon 2026",
  sport: "Running",
  category: "Marathon",
  country: "Latvia",
  countryCode: "LV",
  city: "Riga",
  venueLine: "May 16–17 festival weekend · marathon Sunday",
  date: "2026-05-17",
  distances: ["Marathon", "Half Marathon", "10K", "5.7K", "DPD Mile", "Kids races"],
  courseProfile: [
    "Road",
    "Fast course",
    "Scenic",
    "International field",
    "City course",
    "Beginner friendly",
  ],
  courseRoute: {
    elevationGain: "~45m cumulative",
    layoutType: "Single-loop city course · World Athletics–recognised road marathon",
    surface: "Road",
    profileSummary: "Fast / Mostly flat",
    startFinish: "Riga Castle / 11 November Embankment",
    highlights: ["Old Town core", "Daugava river crossings", "Capital boulevards & waterfront"],
  },
  hasRoute: true,
  routeImage:
    "https://rimirigamarathon.com/wp-content/uploads/2026/04/2026-RELJEFs_42km-udens@2x-567x800.png",
  routeUrl:
    "https://rimirigamarathon.com/wp-content/uploads/2026/04/2026-RELJEFs_42km-udens@2x-scaled.png",
  image: "https://rimirigamarathon.com/wp-content/uploads/2025/03/Aksels-Roberts-Zirnis-2-scaled.jpg",
  description:
    "The Rimi Riga Marathon is among Northern Europe’s largest and fastest-growing road-running festivals — a Baltic headline weekend where elite pacing, tourist energy, and festival crowds share the same cordoned boulevards. The marathon threads UNESCO-listed Old Town lanes, sweeps the Daugava on landmark bridges, and opens onto broad city arteries built for rhythm and momentum. With World Athletics recognition, deep international start lists, and a predominantly flat urban loop, it reads like a serious PB canvas dressed as a capital-city celebration: performance-first when you want it, postcard scenery when you don’t.",
  participants: 45000,
  participantFootnote: "Including 5,000+ international runners · 110+ countries represented.",
  organizer: "NECom / Rimi Riga Marathon",
  pricing: [
    { distance: "Marathon (42.195 km)", priceNote: "from €75 · tiered registration" },
    { distance: "Half Marathon", priceNote: "from €55 · tiered registration" },
    { distance: "10K", priceNote: "from €35 · tiered registration" },
    { distance: "5.7K", priceNote: "from €28 · tiered registration" },
    { distance: "DPD Mile", priceNote: "from €18 · tiered registration" },
    { distance: "Kids races", priceNote: "from €12 · tiered registration" },
  ],
  startingPriceLabel: "Starting from €12",
  officialWebsite: "https://rimirigamarathon.com/en/",
  isOfficial: true,
}

const TRI_IMG_TRIATHLON =
  "https://images.unsplash.com/photo-1596730749249-da817dcd782d?w=1200&auto=format&fit=crop&q=80"
const TRI_IMG_POOL =
  "https://images.unsplash.com/photo-1519315900567-29f88d919207?w=1200&auto=format&fit=crop&q=80"
const TRI_IMG_NIGHT =
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&auto=format&fit=crop&q=80"

function lttOg(idx: number): string {
  const n = (idx % 3) + 1
  return `https://www.triatlonotaure.lt/static/src/images/custom/ltt${n}.jpg`
}

/** Lietuvos sprint pool championship · May 17 2026 (official calendar — Lietuvos Triatlono Federacija). */
export const LT_SPRINT_POOL_CHAMPIONSHIP_PANEVEZYS_2026: MockRaceDetail = {
  id: "lt-sprint-pool-championship-panevezys-2026",
  title: "Lietuvos sprinto triatlono (baseino) čempionatas — B. Abramaičio taurė 2026",
  sport: "Triathlon",
  category: "National championship · Pool sprint",
  country: "Lithuania",
  countryCode: "LT",
  city: "Panevėžys",
  date: "2026-05-17",
  distances: ["Sprint (SD)", "Super sprint (SSD)", "Kids races"],
  courseProfile: ["Pool swim · indoor", "National championship", "Sprint formats · Lithuania"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: TRI_IMG_POOL,
  description:
    "National sprint-distance showcase staged around Panevėžys — indoor pool swimming shifts into fast bike–run segments for Lithuania’s championship-calibre sprint and supersprint programmes plus junior pathways.",
  participants: 220,
  pricing: [{ distance: "All disciplines", priceNote: "Tiered · Lietuvos Triatlono Federacija registracijos hub" }],
  startingPriceLabel: "Registration via triatlonas.lt",
  officialWebsite: "https://www.triatlonas.lt/registracijos/",
  isOfficial: true,
  organizer: "Lietuvos Triatlono Federacija",
}

/** Lietuvos Triatlono Taurė stage — registration via triatlonotaure.lt API-backed stage ids (2026 season). */
export const LTT_KAISIADORIU_2026: MockRaceDetail = {
  id: "ltt-kaisiadoriu-triatlonas-2026",
  title: "Kaišiadorių triatlonas — Lietuvos Triatlono Taurė I",
  sport: "Triathlon",
  category: "Cup stage · Lithuania",
  country: "Lithuania",
  countryCode: "LT",
  city: "Kaišiadorys",
  venueLine: "LTT calendar · vaikų ir jaunimo čempionato programa",
  date: "2026-05-31",
  distances: ["Olympic (OD)", "Sprint (SD)", "TRI-FUN", "Kids triathlon", "Splash & Run"],
  courseProfile: ["Lietuvos Triatlono Taurė", "Multisport festival", "Road bike · transitions"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(0),
  description:
    "Season-opening Lithuanian Triathlon Cup weekend — Olympic and sprint lanes sit beside TRI-FUN, youth-specific racing and Splash & Run entries as Kaišiadorys anchors the national multisport calendar.",
  participants: 420,
  pricing: [
    { distance: "Olympic (OD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "Sprint (SD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "TRI-FUN", priceNote: "from €20 · tiered · Taure" },
    { distance: "Kids triathlon", priceNote: "from €15 · tiered · Taure" },
    { distance: "TRI-FUN relay", priceNote: "from €35 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/134/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

export const LTT_VEISIEJAI_2026: MockRaceDetail = {
  id: "ltt-veisieju-triatlonas-2026",
  title: "Veisiejų triatlonas — Lietuvos Triatlono Taurė II",
  sport: "Triathlon",
  category: "Cup stage · Lithuania",
  country: "Lithuania",
  countryCode: "LT",
  city: "Veisiejai",
  venueLine: "LTT calendar · vaikų ir jaunimo čempionato programa",
  date: "2026-06-14",
  distances: ["Olympic (OD)", "Sprint (SD)", "TRI-FUN", "Kids triathlon", "Splash & Run"],
  courseProfile: ["Lietuvos Triatlono Taurė", "Regional showcase · Dzūkija", "Road bike · transitions"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(1),
  description:
    "Southern Lithuania’s lake-country Cup stop blends junior-focused programmes with adult OD/SD racing — the familiar Taure format returns with TRI-FUN access lanes and family Splash & Run programming.",
  participants: 380,
  pricing: [
    { distance: "Olympic (OD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "Sprint (SD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "TRI-FUN", priceNote: "from €20 · tiered · Taure" },
    { distance: "Kids triathlon", priceNote: "from €15 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/135/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

/** Trakų triatlonas — organised by Tarptautinis maratonas; registration hosted on ManoBegimas per Taure API. */
export const TRAKAI_TRIATLONAS_LTT3_2026: MockRaceDetail = {
  id: "trakai-triatlonas-ltt3-2026",
  title: "Lietuvos standartinės distancijos triatlono čempionatas / Trakų triatlonas — LTT III",
  sport: "Triathlon",
  category: "Cup stage · National-standard championship",
  country: "Lithuania",
  countryCode: "LT",
  city: "Trakai",
  venueLine: "Jaunučių, jaunių ir jaunimo čempionatas · OPEN standartinė distancija",
  date: "2026-06-28",
  distances: ["Olympic (OD)", "Sprint (SD)", "Super sprint (SSD)", "Relays"],
  courseProfile: ["Castle-town backdrop · Trakai", "Taure + TM nuostatai", "Transition-heavy racing"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: TRI_IMG_TRIATHLON,
  description:
    "Historic Trakai hosts Lithuania’s standard-distance championship alongside the Cup’s third counting stage — elite juniors chase titles while OPEN athletes settle OD, sprint and supersprint battles beneath the lakeside skyline.",
  participants: 520,
  pricing: [{ distance: "All distances", priceNote: "Tiered · ManoBegimas registration portal" }],
  startingPriceLabel: "Registration on ManoBegimas",
  officialWebsite: "https://manobegimas.lt/registration/70",
  isOfficial: true,
  organizer: "VšĮ Tarptautinis maratonas · Lietuvos Triatlono Taurė partnerystė",
}

/** moterutriatlonas.lt stage id 9 — distances/pricing sourced from public stage API (2026). */
export const VILNIUS_NAKTINIS_MOTERU_TRIATLONAS_2026: MockRaceDetail = {
  id: "vilnius-naktinis-moteru-triatlonas-2026",
  title: "Naktinis moterų triatlonas — Vilnius 2026",
  sport: "Triathlon",
  category: "Night festival · Women-focused",
  country: "Lithuania",
  countryCode: "LT",
  city: "Vilnius",
  date: "2026-07-09",
  distances: ["Super sprint (SSD)", "Kids triathlon", "Relay programmes"],
  courseProfile: ["Women-focused multisport", "Evening atmosphere · Vilnius", "Social initiative backdrop"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: TRI_IMG_NIGHT,
  description:
    "Vilnius after dark celebrates women-led multisport — sprint-paced racing, curated relay formats and youth introductions built around confidence, community lighting and a distinctly urban Lithuanian summer vibe.",
  participants: 780,
  pricing: [
    { distance: "Women · main race", priceNote: "from €17 · tiered · moterutriatlonas.lt" },
    { distance: "Kids · ages 8–13", priceNote: "from €10" },
    { distance: "Kids · ages 4–7", priceNote: "from €5" },
    { distance: "Relay teams", priceNote: "from €24 · format-dependent" },
  ],
  startingPriceLabel: "Starting from €5",
  officialWebsite: "https://www.moterutriatlonas.lt/stages/9/registration",
  isOfficial: true,
  organizer: "Naktinis moterų triatlonas · moterutriatlonas.lt",
}

/** Non-scoring TRI-FUN-only Vilnius stage per LTT 2026 nuostatai. */
export const VILNIUS_TRI_FUN_ONLY_2026: MockRaceDetail = {
  id: "vilnius-triatlonas-trifun-2026",
  title: "Vilniaus triatlonas TRI-FUN — neįskaitinis LTT etapas",
  sport: "Triathlon",
  category: "TRI-FUN · Community",
  country: "Lithuania",
  countryCode: "LT",
  city: "Vilnius",
  venueLine: "Neįskaitinis Lietuvos Triatlono Taurės bendroje įskaitoje",
  date: "2026-07-16",
  distances: ["TRI-FUN", "TRI-FUN relay"],
  courseProfile: ["Entry-friendly multisport", "Taure hospitality standards", "Skills-forward pacing"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(2),
  description:
    "A deliberately approachable Vilnius stop focused solely on TRI-FUN — ideal for first transitions, mixed-age crews and relay squads without impacting the season-long Taure standings.",
  participants: 290,
  pricing: [
    { distance: "TRI-FUN", priceNote: "from €15 · tiered · Taure" },
    { distance: "TRI-FUN relay", priceNote: "from €30 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/137/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

export const LTT_JONAVA_2026: MockRaceDetail = {
  id: "ltt-jonavos-triatlonas-2026",
  title: "Jonavos triatlonas — Lietuvos Triatlono Taurė IV",
  sport: "Triathlon",
  category: "Cup stage · Lithuania",
  country: "Lithuania",
  countryCode: "LT",
  city: "Jonava",
  venueLine: "LTT calendar · vaikų ir jaunimo čempionato programa",
  date: "2026-07-19",
  distances: ["Olympic (OD)", "Sprint (SD)", "TRI-FUN", "Kids triathlon", "Splash & Run"],
  courseProfile: ["Lietuvos Triatlono Taurė", "Industrial riverside city racing", "Road bike · transitions"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(0),
  description:
    "Jonava’s midsummer Cup round mirrors the nationwide OD/SD backbone while foregrounding youth ladders — TRI-FUN bridges newcomers into Splash & Run micro-distances for families.",
  participants: 400,
  pricing: [
    { distance: "Olympic (OD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "Sprint (SD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "TRI-FUN", priceNote: "from €20 · tiered · Taure" },
    { distance: "Kids triathlon", priceNote: "from €15 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/138/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

/** Lithuanian middle-distance (70.3) open championship — calendar lists Panevėžys · Aug 1 2026. */
export const LT_MIDDLE_DISTANCE_CHAMPIONSHIP_PANEVEZYS_2026: MockRaceDetail = {
  id: "lt-middle-distance-championship-panevezys-2026",
  title: "Lietuvos vidutinio nuotolio triatlono čempionatas — 70.3 · Panevėžys 2026",
  sport: "Triathlon",
  category: "Middle distance · National championship",
  country: "Lithuania",
  countryCode: "LT",
  city: "Panevėžys",
  date: "2026-08-01",
  distances: ["Middle distance · 70.3", "OPEN age category"],
  courseProfile: ["Endurance staging · Lithuania", "National championship", "Half-Iron programme"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: TRI_IMG_TRIATHLON,
  description:
    "Panevėžys anchors Lithuania’s middle-distance championship — a single-day 70.3-calibre test aimed at athletes stacking regional endurance racing ahead of late-season objectives.",
  participants: 260,
  pricing: [{ distance: "Middle distance", priceNote: "Tiered · announced via Lietuvos Triatlono Federacija" }],
  startingPriceLabel: "Registration via triatlonas.lt",
  officialWebsite: "https://www.triatlonas.lt/registracijos/",
  isOfficial: true,
  organizer: "Lietuvos Triatlono Federacija",
}

export const LTT_SKAUDVILE_2026: MockRaceDetail = {
  id: "ltt-skaudviles-triatlonas-2026",
  title: "Skaudvilės triatlonas — Lietuvos Triatlono Taurė V",
  sport: "Triathlon",
  category: "Cup stage · Lithuania",
  country: "Lithuania",
  countryCode: "LT",
  city: "Skaudvilė",
  venueLine: "LTT calendar · vaikų ir jaunimo čempionato programa",
  date: "2026-08-16",
  distances: ["Olympic (OD)", "Sprint (SD)", "TRI-FUN", "Kids triathlon", "Splash & Run"],
  courseProfile: ["Lietuvos Triatlono Taurė", "Žemaitija regional loop", "Road bike · transitions"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(1),
  description:
    "Žemaitija welcomes the fifth Taure counter — tight community production values with full OD/SD offerings plus youth-focused Splash & Run storytelling.",
  participants: 360,
  pricing: [
    { distance: "Olympic (OD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "Sprint (SD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "TRI-FUN", priceNote: "from €20 · tiered · Taure" },
    { distance: "Kids triathlon", priceNote: "from €15 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/139/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

/** Europe Junior Cup + Lietuvos mišrių estafečių supersprinto čempionatas — Molėtai (official calendar). */
export const EUROPE_JUNIOR_CUP_MOLETAI_2026: MockRaceDetail = {
  id: "europe-junior-cup-moletai-2026",
  title: "Europe Junior Cup Molėtai / Lietuvos mišrių estafečių supersprinto čempionatas 2026",
  sport: "Triathlon",
  category: "International juniors · Relay championship",
  country: "Lithuania",
  countryCode: "LT",
  city: "Molėtai",
  date: "2026-08-22",
  distances: ["Super sprint (SSD)", "Mixed relay · super sprint"],
  courseProfile: ["Europe Triathlon Junior Cup", "National mixed relay titles", "Lake district racing"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: TRI_IMG_TRIATHLON,
  description:
    "Molėtai steps onto the European junior calendar while simultaneously awarding Lithuania’s open mixed-relay supersprint champions — compact, explosive racing tailored to future elites and tactical relay crews.",
  participants: 240,
  pricing: [{ distance: "Race programmes", priceNote: "Tiered · Lietuvos Triatlono Federacija registracijos" }],
  startingPriceLabel: "Registration via triatlonas.lt",
  officialWebsite: "https://www.triatlonas.lt/registracijos/",
  isOfficial: true,
  organizer: "Lietuvos Triatlono Federacija",
}

export const LTT_MOLETAI_2026: MockRaceDetail = {
  id: "ltt-moletu-triatlonas-2026",
  title: "Molėtų triatlonas — Lietuvos Triatlono Taurė VI",
  sport: "Triathlon",
  category: "Cup stage · Lithuania",
  country: "Lithuania",
  countryCode: "LT",
  city: "Molėtai",
  venueLine: "LTT calendar · vaikų ir jaunimo čempionato programa",
  date: "2026-08-23",
  distances: ["Olympic (OD)", "Sprint (SD)", "TRI-FUN", "Kids triathlon", "Splash & Run"],
  courseProfile: ["Lietuvos Triatlono Taurė", "Lake district finale sprint", "Road bike · transitions"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(2),
  description:
    "Back-to-back Molėtai weekends conclude with the Taure sixth stage — full OD/SD ladder, TRI-FUN onboarding and Splash & Run energy framed by Lithuanian lake-country scenery.",
  participants: 410,
  pricing: [
    { distance: "Olympic (OD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "Sprint (SD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "TRI-FUN", priceNote: "from €20 · tiered · Taure" },
    { distance: "Kids triathlon", priceNote: "from €15 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/140/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

export const LTT_DRUSKININKAI_2026: MockRaceDetail = {
  id: "ltt-druskininku-triatlonas-2026",
  title: "Druskininkų triatlonas — Lietuvos Triatlono Taurė VII",
  sport: "Triathlon",
  category: "Cup stage · Lithuania",
  country: "Lithuania",
  countryCode: "LT",
  city: "Druskininkai",
  venueLine: "LTT calendar · vaikų ir jaunimo čempionato programa · season closer",
  date: "2026-09-05",
  distances: ["Olympic (OD)", "Sprint (SD)", "TRI-FUN", "Kids triathlon", "Splash & Run"],
  courseProfile: ["Lietuvos Triatlono Taurė", "Spa-town closing weekend", "Road bike · transitions"],
  hasRoute: false,
  showCoursePendingNotice: true,
  image: lttOg(0),
  description:
    "The resort capital hosts Lithuania Triathlon Cup’s curtain call — athletes chase final Taure points across OD/SD while newcomers toast the season with TRI-FUN and Splash & Run finales.",
  participants: 460,
  pricing: [
    { distance: "Olympic (OD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "Sprint (SD)", priceNote: "from €45 · tiered · Taure" },
    { distance: "TRI-FUN", priceNote: "from €20 · tiered · Taure" },
    { distance: "Kids triathlon", priceNote: "from €15 · tiered · Taure" },
  ],
  startingPriceLabel: "Starting from €15",
  officialWebsite: "https://www.triatlonotaure.lt/stages/141/registration",
  isOfficial: true,
  organizer: "VšĮ Triatlono taurė · Lietuvos Triatlono Taurė",
}

/**
 * European IRONMAN full-distance events — IDs align with `WorldClassEvents` carousel.
 * Dates & imagery from official ironman.com race pages; no inferred participant or fee totals.
 */
export const IRONMAN_EUROPE_FULL_DISTANCE_2026: MockRaceDetail[] = [
  {
    id: "im-hamburg-european-championship",
    title: "IRONMAN Hamburg European Championship",
    sport: "Triathlon",
    category: "Ironman",
    country: "Germany",
    countryCode: "DE",
    city: "Hamburg",
    date: "2026-06-07",
    distances: ["3.8 km swim", "178 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "European Championship · PRO women", "Harbour & Alster routing"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/imhamburg_eventcard_image1.jpg?h=b086164c&itok=hOyoIZDD",
    description:
      "Harbour-city racing through the Alster swim, landmark-studded riding, and a closing run along Hamburg’s waterways — an IRONMAN European Championship anchor on the calendar. Registration windows, course PDFs, and athlete services are published on the official IRONMAN race page.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-hamburg",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-frankfurt-european-championship",
    title: "IRONMAN Frankfurt European Championship",
    sport: "Triathlon",
    category: "Ironman",
    country: "Germany",
    countryCode: "DE",
    city: "Frankfurt",
    date: "2026-06-28",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "European Championship · age group & PRO men", "Langener Waldsee · Main"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/IM-Frankfurt_RaceCard_Finish.jpg?h=aae7d1ee&itok=v76LWLS0",
    description:
      "Mainhattan skylines watch over Langener Waldsee swimming and a Main-side marathon finish — one of Europe’s headline IRONMAN championship weekends. Use the official race hub for start protocols, qualification notes, and logistics.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-frankfurt",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-vitoria-gasteiz",
    title: "IRONMAN Vitoria-Gasteiz",
    sport: "Triathlon",
    category: "Ironman",
    country: "Spain",
    countryCode: "ES",
    city: "Vitoria-Gasteiz",
    date: "2026-07-12",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "Basque Country", "Established European long-course"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/IM%20Vitoria-Gasteiz_event%20card.JPG?h=a0d62d26&itok=npTIep8E",
    description:
      "Northern Spain’s triathlon capital delivers steep-course pedigree and stadium-grade crowds — ideal for athletes chasing memorable racing and qualification traction. Event specifics stay authoritative on ironman.com.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-vitoria-gasteiz",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-kalmar-sweden",
    title: "IRONMAN Kalmar",
    sport: "Triathlon",
    category: "Ironman",
    country: "Sweden",
    countryCode: "SE",
    city: "Kalmar",
    date: "2026-08-15",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "Kalmar Strait · Öland bridge", "Nordic flagship"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/im%20kalmar_eventcard.jpg?h=1399bfd2&itok=QCgXhmZL",
    description:
      "Kalmar’s cannon-fire swim starts and Scandinavian bridge crossings headline this seaside IRONMAN — capped by one of Europe’s loudest finish-line celebrations. Follow the official page for packet pickup, wave starts, and travel tooling.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-kalmar",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-copenhagen",
    title: "IRONMAN Copenhagen",
    sport: "Triathlon",
    category: "Ironman",
    country: "Denmark",
    countryCode: "DK",
    city: "Copenhagen",
    date: "2026-08-16",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "Capital-city routing", "Baltic bay swim"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-10/IM_Copenhagen_eventcard_Nyhavn.jpg?h=d1cb525d&itok=vXygzkVN",
    description:
      "Denmark’s capital blends harbour swimming with North Zealand riding and an urban marathon rhythm past storied landmarks — polished Nordic production throughout. Registration tiers and course assets live on the IRONMAN Copenhagen hub.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-copenhagen",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-wales",
    title: "IRONMAN Wales",
    sport: "Triathlon",
    category: "Ironman",
    country: "United Kingdom",
    countryCode: "GB",
    city: "Tenby",
    venueLine: "Pembrokeshire Coast National Park",
    date: "2026-09-13",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "Coastal Wales · Tenby", "Legendary spectator energy"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/imwales_eventcard_image1.png?h=d1cb525d&itok=KzowB77u",
    description:
      "North Beach sunrises, Pembrokeshire cliff riding, and Tenby’s fortress streets define one of the UK’s most theatrical IRONMAN stages — refer to the official race site for cut-offs and mandatory gear.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-wales",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-emilia-romagna",
    title: "IRONMAN Italy Emilia-Romagna",
    sport: "Triathlon",
    category: "Ironman",
    country: "Italy",
    countryCode: "IT",
    city: "Cervia",
    date: "2026-09-19",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "Adriatic coast · Romagna", "Made-in-Italy hospitality"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/IM-Italy-event-card.jpg?h=b6717701&itok=WAKuOkX6",
    description:
      "Historic Cervia fronts this Adriatic IRONMAN — calm seas, fast inland cycling ribbons, and a seaside finish dripping with Italian race-week polish. Official communications handle athlete guides and qualification benchmarks.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-emilia-romagna",
    isOfficial: true,
    organizer: "IRONMAN",
  },
  {
    id: "im-calella-barcelona",
    title: "IRONMAN Calella-Barcelona",
    sport: "Triathlon",
    category: "Ironman",
    country: "Spain",
    countryCode: "ES",
    city: "Calella",
    date: "2026-10-04",
    distances: ["3.8 km swim", "180 km bike", "42.2 km run"],
    courseProfile: ["IRONMAN full distance", "Maresme coast · Catalonia", "Late-season European classic"],
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://www.ironman.com/sites/default/files/styles/og/public/2024-09/IMBarcelona_eventcard.jpg?h=b6717701&itok=Wc_q30pi",
    description:
      "Sun-soaked Maresme kilometres reward pacing discipline — swim clarity, coastal tempo on the bike, and a beach-close marathon finale that closes many Europeans’ seasons in style. Ironman.com hosts mandatory briefings and fee schedules.",
    pricing: [],
    officialWebsite: "https://www.ironman.com/races/im-barcelona",
    isOfficial: true,
    organizer: "IRONMAN",
  },
]

const CYCL_IMG_ROAD =
  "https://images.unsplash.com/photo-1541625602330-2277d4c61895?w=1200&auto=format&fit=crop&q=80"
const CYCL_IMG_GRAVEL =
  "https://images.unsplash.com/photo-1596730749249-da817dcd782d?w=1200&auto=format&fit=crop&q=80"

/** European gran fondo / sportive fixtures (mock — drives Home cycling carousel & Explore). */
export const CYCLING_EVENTS_EUROPE_2026: MockRaceDetail[] = [
  {
    id: "gran-fondo-noord-holland-2026",
    title: "Gran Fondo Noord-Holland",
    sport: "Cycling",
    category: "Gran fondo",
    country: "Netherlands",
    countryCode: "NL",
    city: "Alkmaar",
    date: "2026-06-14",
    distances: ["175 km", "120 km", "75 km"],
    courseProfile: ["Flat Dutch ribbons", "Wind tactics", "Peloton-friendly sportive"],
    courseRoute: {
      elevationGain: "~180m",
      layoutType: "Northern Holland loops · dykes & polders",
      surface: "Road",
      profileSummary: "Fast / exposed",
      startFinish: "Alkmaar centrum",
    },
    hasRoute: true,
    routeImage: CYCL_IMG_ROAD,
    routeUrl: CYCL_IMG_ROAD,
    image: CYCL_IMG_ROAD,
    description:
      "A signature Dutch gran fondo built for rhythm riders — long straightaways, trademark wind sections, and café-stop culture between efforts. Three distances keep it approachable while the full route rewards smart drafting and steady fueling.",
    participants: 4200,
    pricing: [
      { distance: "175 km", priceNote: "from €89" },
      { distance: "120 km", priceNote: "from €69" },
      { distance: "75 km", priceNote: "from €49" },
    ],
    startingPriceLabel: "Starting from €49",
    registrationStatus: "open",
    officialWebsite: "https://example.com/gran-fondo-noord-holland",
    isOfficial: false,
  },
  {
    id: "sportful-dolomiti-gran-fondo-2026",
    title: "Sportful Dolomiti Gran Fondo",
    sport: "Cycling",
    category: "Mountain gran fondo",
    country: "Italy",
    countryCode: "IT",
    city: "Feltre",
    date: "2026-06-21",
    distances: ["203 km", "138 km", "86 km"],
    courseProfile: ["Alpine cols", "Spectacular vistas", "European sportive classic"],
    courseRoute: {
      elevationGain: "~4,800m (long route)",
      layoutType: "Dolomiti passes · timed sectors optional",
      surface: "Road",
      profileSummary: "Climbing-heavy",
      startFinish: "Feltre historic centre",
    },
    hasRoute: true,
    routeImage:
      "https://images.unsplash.com/photo-1511994298241-ec608ad637bd?w=1200&auto=format&fit=crop&q=80",
    routeUrl:
      "https://images.unsplash.com/photo-1511994298241-ec608ad637bd?w=2000&auto=format&fit=crop&q=80",
    image:
      "https://images.unsplash.com/photo-1511994298241-ec608ad637bd?w=1200&auto=format&fit=crop&q=80",
    description:
      "High-alpine kilometres and hairpin theatre — the kind of day where gearing choices and pacing plans matter as much as watts. Shorter routes keep the Dolomiti flavour without the full monument distance.",
    participants: 5500,
    pricing: [
      { distance: "203 km", priceNote: "from €115" },
      { distance: "138 km", priceNote: "from €95" },
      { distance: "86 km", priceNote: "from €75" },
    ],
    startingPriceLabel: "Starting from €75",
    registrationStatus: "open",
    officialWebsite: "https://example.com/sportful-dolomiti",
    isOfficial: false,
  },
  {
    id: "mallorca-312-sportive-2026",
    title: "Mallorca 312 Sportive",
    sport: "Cycling",
    category: "Sportive",
    country: "Spain",
    countryCode: "ES",
    city: "Platja de Muro",
    date: "2026-09-06",
    distances: ["312 km", "225 km", "167 km"],
    courseProfile: ["Island roads", "Early-season training camp favourite", "International peloton"],
    courseRoute: {
      elevationGain: "~5,000m (312 route)",
      layoutType: "Mallorca perimeter & mountain arcs",
      surface: "Road",
      profileSummary: "Rolling with major climbs",
      startFinish: "Platja de Muro",
    },
    hasRoute: false,
    showCoursePendingNotice: true,
    image:
      "https://images.unsplash.com/photo-1444491741275-3747c884c049?w=1200&auto=format&fit=crop&q=80",
    description:
      "The Balearic headline sportive — long sunshine kilometres, trademark climbs, and a festival atmosphere that draws riders from every timezone. Check the official rider guide for feed zones and cut-offs before committing to the full loop.",
    participants: 8000,
    pricing: [
      { distance: "312 km", priceNote: "from €129" },
      { distance: "225 km", priceNote: "from €109" },
      { distance: "167 km", priceNote: "from €89" },
    ],
    startingPriceLabel: "Starting from €89",
    registrationStatus: "closingSoon",
    officialWebsite: "https://example.com/mallorca-312",
    isOfficial: false,
  },
  {
    id: "strade-gravel-scandinavia-2026",
    title: "Strade Gravel Scandinavia",
    sport: "Cycling",
    category: "Gravel fondo",
    country: "Sweden",
    countryCode: "SE",
    city: "Gothenburg",
    date: "2026-08-16",
    distances: ["140 km", "95 km", "55 km"],
    courseProfile: ["Mixed surface", "Forest lakes", "Nordic gravel scene"],
    courseRoute: {
      elevationGain: "~1,600m (long route)",
      layoutType: "Lake district gravel ribbons",
      surface: "Gravel & hardpack",
      profileSummary: "Rolling forest roads",
      startFinish: "Gothenburg outskirts",
    },
    hasRoute: true,
    routeImage: CYCL_IMG_GRAVEL,
    routeUrl: CYCL_IMG_GRAVEL,
    image: CYCL_IMG_GRAVEL,
    description:
      "Scandinavian gravel fondo energy — quieter roads, changing surfaces, and punchy rollers that reward tyre choice and bike handling. Mid-August light makes for long cafe-neutral kilometres between timed segments.",
    participants: 2100,
    pricing: [
      { distance: "140 km", priceNote: "from €79" },
      { distance: "95 km", priceNote: "from €59" },
      { distance: "55 km", priceNote: "from €39" },
    ],
    startingPriceLabel: "Starting from €39",
    registrationStatus: "open",
    officialWebsite: "https://example.com/strade-gravel-scandinavia",
    isOfficial: false,
  },
]

/** Upcoming Lithuanian triathlon / multisport fixtures from the 2026 LTF calendar & Lietuvos Triatlono Taurė (May 8 2026 onward). */
export const LT_TRIATHLON_EVENTS_2026_UPCOMING: MockRaceDetail[] = [
  LT_SPRINT_POOL_CHAMPIONSHIP_PANEVEZYS_2026,
  LTT_KAISIADORIU_2026,
  LTT_VEISIEJAI_2026,
  TRAKAI_TRIATLONAS_LTT3_2026,
  VILNIUS_NAKTINIS_MOTERU_TRIATLONAS_2026,
  VILNIUS_TRI_FUN_ONLY_2026,
  LTT_JONAVA_2026,
  LT_MIDDLE_DISTANCE_CHAMPIONSHIP_PANEVEZYS_2026,
  LTT_SKAUDVILE_2026,
  EUROPE_JUNIOR_CUP_MOLETAI_2026,
  LTT_MOLETAI_2026,
  LTT_DRUSKININKAI_2026,
]

/** Full catalogue (includes past dates — used only where archives matter). */
export const MOCK_RACE_DETAILS_ALL: MockRaceDetail[] = [
  SWEDBANK_VILNIUS_MARATHON,
  TEMPLE_KAUNO_PUSMARATONIS_2026,
  PINK_RUN_SU_ANTEJA_2026,
  RIMI_RIGA_MARATHON_2026,
  ...CYCLING_EVENTS_EUROPE_2026,
  ...LT_TRIATHLON_EVENTS_2026_UPCOMING,
  ...IRONMAN_EUROPE_FULL_DISTANCE_2026,
  ...HYROX_EVENTS_EUROPE_2026,
]

/** Upcoming/on-day races only — drives Explore, Home, calendar lookups, and `/race/:id` for mock data. */
export const MOCK_RACE_DETAILS: MockRaceDetail[] = filterRaceDetailsNotPast(MOCK_RACE_DETAILS_ALL)

export function getRaceDetailById(id: string): MockRaceDetail | undefined {
  return MOCK_RACE_DETAILS.find((r) => r.id === id)
}

/** Resolve a mock race including ended events (e.g. calendar/history). */
export function getRaceDetailByIdIncludingPast(id: string): MockRaceDetail | undefined {
  return MOCK_RACE_DETAILS_ALL.find((r) => r.id === id)
}

function detailToListItem(d: MockRaceDetail): MockRaceListItem {
  return {
    id: d.id,
    title: d.title,
    city: d.city,
    countryCode: d.countryCode,
    countryName: d.country,
    raceType: d.sport,
    dateLabel: formatRaceDateLabel(d.date),
    distances: d.distances,
    imageUrl: d.image,
    daysUntil: computeDaysUntilRace(d.date),
    startingPriceLabel: d.startingPriceLabel,
    registrationStatus: d.registrationStatus,
    priceNote: d.priceNote,
  }
}

export const MOCK_RACES_LIST: MockRaceListItem[] = MOCK_RACE_DETAILS.map(detailToListItem)
