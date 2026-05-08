export type RaceType = "trail" | "road" | "ultra" | "obstacle" | "triathlon" | "cycling";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";
export type RaceStatus = "target" | "registered" | "completed" | "skipped";
export type Priority = "a" | "b" | "c";

export interface Race {
  id: string;
  name: string;
  date: string;
  location: string;
  country: string;
  distance_km: number;
  elevation_m: number;
  race_type: RaceType;
  difficulty: Difficulty;
  description: string | null;
  website_url: string | null;
  image_url: string | null;
  tags: string[];
  created_at: string;
}

export interface SeasonPlan {
  id: string;
  user_id: string;
  name: string;
  year: number;
  goal: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanRace {
  id: string;
  plan_id: string;
  race_id: string;
  status: RaceStatus;
  priority: Priority;
  notes: string | null;
  created_at: string;
  race?: Race;
}
