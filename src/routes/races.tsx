import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Mountain, ListFilter as Filter, Trophy, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Race } from "@/types";

export const Route = createFileRoute("/races")({
  component: RacesPage,
});

const MOCK_RACES: Race[] = [
  {
    id: "1",
    name: "Ultra Trail Mont Blanc",
    location: "Chamonix",
    country: "France",
    date: "2026-08-22",
    distance_km: 171,
    elevation_m: 10000,
    race_type: "ultra",
    difficulty: "elite",
    description: "The world's most prestigious ultra trail race circumnavigating Mont Blanc.",
    website_url: null,
    image_url:
      "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["iconic", "mountainous", "ultra"],
    created_at: "2026-01-01",
  },
  {
    id: "2",
    name: "Berlin Marathon",
    location: "Berlin",
    country: "Germany",
    date: "2026-09-27",
    distance_km: 42.2,
    elevation_m: 30,
    race_type: "road",
    difficulty: "intermediate",
    description: "One of the world's fastest marathon courses through historic Berlin.",
    website_url: null,
    image_url:
      "https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["fast", "flat", "world major"],
    created_at: "2026-01-01",
  },
  {
    id: "3",
    name: "Ironman Hawaii",
    location: "Kona",
    country: "USA",
    date: "2026-10-10",
    distance_km: 226,
    elevation_m: 1800,
    race_type: "triathlon",
    difficulty: "elite",
    description: "The iconic Ironman World Championship on the Big Island of Hawaii.",
    website_url: null,
    image_url:
      "https://images.pexels.com/photos/1456951/pexels-photo-1456951.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["world championship", "triathlon", "iconic"],
    created_at: "2026-01-01",
  },
  {
    id: "4",
    name: "Hardrock 100",
    location: "Silverton, Colorado",
    country: "USA",
    date: "2026-07-12",
    distance_km: 160,
    elevation_m: 10000,
    race_type: "ultra",
    difficulty: "elite",
    description: "One of the toughest 100-mile races in North America.",
    website_url: null,
    image_url:
      "https://images.pexels.com/photos/2402926/pexels-photo-2402926.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["brutal", "mountainous", "lottery"],
    created_at: "2026-01-01",
  },
  {
    id: "5",
    name: "Paris Marathon",
    location: "Paris",
    country: "France",
    date: "2026-04-05",
    distance_km: 42.2,
    elevation_m: 200,
    race_type: "road",
    difficulty: "intermediate",
    description: "Run through the most romantic city in the world.",
    website_url: null,
    image_url:
      "https://images.pexels.com/photos/2403392/pexels-photo-2403392.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["city", "scenic", "iconic"],
    created_at: "2026-01-01",
  },
  {
    id: "6",
    name: "Haute Route Alps Cycling",
    location: "Geneva to Nice",
    country: "France/Switzerland",
    date: "2026-08-16",
    distance_km: 890,
    elevation_m: 22000,
    race_type: "cycling",
    difficulty: "advanced",
    description: "Seven-day cycling event through the highest paved Alpine passes.",
    website_url: null,
    image_url:
      "https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["cycling", "alpine", "multi-day"],
    created_at: "2026-01-01",
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-orange-100 text-orange-800",
  elite: "bg-red-100 text-red-800",
};

const RACE_TYPE_LABELS: Record<string, string> = {
  trail: "Trail",
  road: "Road",
  ultra: "Ultra",
  obstacle: "OCR",
  triathlon: "Triathlon",
  cycling: "Cycling",
};

function RaceCard({ race }: { race: Race }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-muted">
        {race.image_url ? (
          <img
            src={race.image_url}
            alt={race.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Trophy className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            {RACE_TYPE_LABELS[race.race_type] || race.race_type}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DIFFICULTY_COLORS[race.difficulty] || ""}`}
          >
            {race.difficulty}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-1 font-semibold text-foreground">{race.name}</h3>
        <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {race.location}, {race.country}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{race.distance_km} km</span>
            {race.elevation_m > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Mountain className="h-3.5 w-3.5" />
                  {race.elevation_m.toLocaleString()}m
                </span>
              </>
            )}
          </div>
          <span className="font-medium text-primary">
            {new Date(race.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        {race.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {race.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RacesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_RACES.filter((race) => {
    const matchesSearch =
      race.name.toLowerCase().includes(search.toLowerCase()) ||
      race.location.toLowerCase().includes(search.toLowerCase()) ||
      race.country.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || race.race_type === typeFilter;
    const matchesDifficulty = difficultyFilter === "all" || race.difficulty === difficultyFilter;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const hasFilters = typeFilter !== "all" || difficultyFilter !== "all";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">MySeason Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/planner">
              <Button size="sm">Season Planner</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Discover Races</h1>
          <p className="mt-1 text-muted-foreground">
            Find your next challenge from {MOCK_RACES.length} events worldwide
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search races, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                  {(typeFilter !== "all" ? 1 : 0) + (difficultyFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-background">
                  <SelectValue placeholder="Race Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trail">Trail</SelectItem>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="ultra">Ultra</SelectItem>
                  <SelectItem value="triathlon">Triathlon</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="obstacle">OCR</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-44 bg-background">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter("all");
                    setDifficultyFilter("all");
                  }}
                  className="gap-1 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "race" : "races"} found
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((race) => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No races match your filters</p>
            <Button
              variant="link"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setDifficultyFilter("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
