import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Plus, Calendar, Target, ChevronRight, MapPin, Star, Trash2, CircleCheck as CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Race, RaceStatus, Priority } from "@/types";

export const Route = createFileRoute("/planner")({
  component: PlannerPage,
});

interface PlanEntry {
  id: string;
  race: Race;
  status: RaceStatus;
  priority: Priority;
  notes: string | null;
}

const SAMPLE_PLAN: PlanEntry[] = [
  {
    id: "pe1",
    race: {
      id: "2",
      name: "Paris Marathon",
      location: "Paris",
      country: "France",
      date: "2026-04-05",
      distance_km: 42.2,
      elevation_m: 200,
      race_type: "road",
      difficulty: "intermediate",
      description: null,
      website_url: null,
      image_url:
        "https://images.pexels.com/photos/2403392/pexels-photo-2403392.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["city", "scenic"],
      created_at: "2026-01-01",
    },
    status: "registered",
    priority: "a",
    notes: "Goal: sub 3:30",
  },
  {
    id: "pe2",
    race: {
      id: "4",
      name: "Hardrock 100",
      location: "Silverton, Colorado",
      country: "USA",
      date: "2026-07-12",
      distance_km: 160,
      elevation_m: 10000,
      race_type: "ultra",
      difficulty: "elite",
      description: null,
      website_url: null,
      image_url:
        "https://images.pexels.com/photos/2402926/pexels-photo-2402926.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["brutal", "mountainous"],
      created_at: "2026-01-01",
    },
    status: "target",
    priority: "a",
    notes: "Lottery entry pending",
  },
  {
    id: "pe3",
    race: {
      id: "1",
      name: "Ultra Trail Mont Blanc",
      location: "Chamonix",
      country: "France",
      date: "2026-08-22",
      distance_km: 171,
      elevation_m: 10000,
      race_type: "ultra",
      difficulty: "elite",
      description: null,
      website_url: null,
      image_url:
        "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["iconic", "mountainous"],
      created_at: "2026-01-01",
    },
    status: "target",
    priority: "b",
    notes: null,
  },
];

const STATUS_CONFIG: Record<RaceStatus, { label: string; color: string; icon: React.ElementType }> =
  {
    target: { label: "Target", color: "bg-blue-100 text-blue-800", icon: Target },
    registered: { label: "Registered", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    completed: { label: "Completed", color: "bg-slate-100 text-slate-800", icon: CheckCircle2 },
    skipped: { label: "Skipped", color: "bg-red-100 text-red-800", icon: X },
  };

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  a: { label: "A Race", color: "text-amber-600 bg-amber-50" },
  b: { label: "B Race", color: "text-blue-600 bg-blue-50" },
  c: { label: "C Race", color: "text-slate-600 bg-slate-50" },
};

function X({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlannerPage() {
  const [entries, setEntries] = useState<PlanEntry[]>(SAMPLE_PLAN);
  const [planName] = useState("2026 Race Season");

  const completedCount = entries.filter((e) => e.status === "completed").length;
  const registeredCount = entries.filter((e) => e.status === "registered").length;
  const totalCount = entries.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const sortedEntries = [...entries].sort((a, b) => {
    const priorityOrder = { a: 0, b: 1, c: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.race.date).getTime() - new Date(b.race.date).getTime();
  });

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next: RaceStatus[] = ["target", "registered", "completed", "skipped"];
        const curr = next.indexOf(e.status);
        return { ...e, status: next[(curr + 1) % next.length] };
      }),
    );
  };

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
            <Link to="/races">
              <Button variant="outline" size="sm">
                Discover Races
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Season Plan
            </div>
            <h1 className="text-3xl font-bold text-foreground">{planName}</h1>
          </div>
          <Link to="/races">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Race
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Races", value: totalCount, icon: Calendar },
            {
              label: "Registered",
              value: registeredCount,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            { label: "Completed", value: completedCount, icon: Trophy, color: "text-primary" },
            {
              label: "A Races",
              value: entries.filter((e) => e.priority === "a").length,
              icon: Star,
              color: "text-amber-600",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color || "text-muted-foreground"}`} />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Season Progress</span>
              <span className="text-muted-foreground">
                {completedCount} / {totalCount} completed
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{progressPct}% of your season done</p>
          </div>
        )}

        {/* Race List */}
        <div className="space-y-3">
          {sortedEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="mb-2 font-medium text-foreground">No races planned yet</p>
              <p className="mb-6 text-sm text-muted-foreground">
                Start by adding races to your season plan
              </p>
              <Link to="/races">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Discover Races
                </Button>
              </Link>
            </div>
          ) : (
            sortedEntries.map((entry) => {
              const StatusIcon = STATUS_CONFIG[entry.status].icon;
              const raceDate = new Date(entry.race.date);
              const isPast = raceDate < new Date();

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm ${isPast ? "opacity-70" : ""}`}
                >
                  {entry.race.image_url && (
                    <img
                      src={entry.race.image_url}
                      alt={entry.race.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{entry.race.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CONFIG[entry.priority].color}`}
                      >
                        {PRIORITY_CONFIG[entry.priority].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {entry.race.location}, {entry.race.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {raceDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>{entry.race.distance_km} km</span>
                    </div>
                    {entry.notes && (
                      <p className="mt-1 text-xs text-muted-foreground italic">{entry.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleStatus(entry.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${STATUS_CONFIG[entry.status].color} hover:opacity-80`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {STATUS_CONFIG[entry.status].label}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sortedEntries.length > 0 && (
          <div className="mt-6 text-center">
            <Link to="/races">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add More Races
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
