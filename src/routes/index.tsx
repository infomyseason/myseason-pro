import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Calendar, Search, TrendingUp, ChevronRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const FEATURED_RACES = [
  {
    id: "1",
    name: "Ultra Trail Mont Blanc",
    location: "Chamonix, France",
    date: "Aug 22, 2026",
    distance: 171,
    type: "Ultra Trail",
    image: "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "2",
    name: "Berlin Marathon",
    location: "Berlin, Germany",
    date: "Sep 27, 2026",
    distance: 42.2,
    type: "Road",
    image: "https://images.pexels.com/photos/2524/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "3",
    name: "Ironman Hawaii",
    location: "Kona, Hawaii",
    date: "Oct 10, 2026",
    distance: 226,
    type: "Triathlon",
    image: "https://images.pexels.com/photos/1456951/pexels-photo-1456951.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

const STATS = [
  { label: "Races Listed", value: "2,400+", icon: Trophy },
  { label: "Countries", value: "80+", icon: MapPin },
  { label: "Athletes", value: "15,000+", icon: TrendingUp },
  { label: "Season Plans", value: "8,500+", icon: Calendar },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">MySeason Pro</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/races"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Discover Races
            </Link>
            <Link
              to="/planner"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Season Planner
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/races">
              <Button variant="outline" size="sm">
                Explore Races
              </Button>
            </Link>
            <Link to="/planner">
              <Button size="sm">Plan Season</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-36">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Trail running"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
            Race Discovery & Season Planning
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white lg:text-7xl">
            Build Your
            <span className="block text-blue-400">Perfect Season</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
            Discover thousands of races worldwide, plan your season strategically, and track your
            athletic journey — all in one place.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/races">
              <Button size="lg" className="gap-2 bg-blue-500 text-white hover:bg-blue-600">
                <Search className="h-5 w-5" />
                Discover Races
              </Button>
            </Link>
            <Link to="/planner">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/20 text-white hover:bg-white/10"
              >
                <Calendar className="h-5 w-5" />
                Plan Your Season
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Races */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Races</h2>
              <p className="mt-1 text-muted-foreground">Iconic events from around the world</p>
            </div>
            <Link to="/races">
              <Button variant="outline" className="gap-2">
                View All Races <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURED_RACES.map((race) => (
              <div
                key={race.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={race.image}
                    alt={race.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    {race.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{race.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {race.location}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {race.date}
                    </div>
                    <span className="text-sm font-medium text-primary">{race.distance} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Ready to Plan Your Season?
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Create your personalized race calendar and crush your athletic goals this year.
          </p>
          <Link to="/planner">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Start Planning Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">MySeason Pro</span>
          </div>
          <p>2026 MySeason Pro — Race discovery & season planning</p>
        </div>
      </footer>
    </div>
  );
}
