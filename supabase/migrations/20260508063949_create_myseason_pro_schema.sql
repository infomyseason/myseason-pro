/*
  # MySeason Pro Database Schema

  ## Overview
  Initial schema for the race discovery and season planning platform.

  ## New Tables

  ### races
  - Stores all race events available in the platform
  - id: UUID primary key
  - name, location, country, date: basic event info
  - distance_km, elevation_m: race metrics
  - race_type: trail/road/ultra/obstacle/triathlon/cycling
  - difficulty: beginner/intermediate/advanced/elite
  - description, website_url, image_url: content fields
  - tags: text array for searchable labels

  ### season_plans
  - User's personal season plans
  - id: UUID primary key
  - user_id: references auth.users
  - name, year, goal: plan details

  ### plan_races
  - Junction table linking season plans to races
  - id: UUID primary key
  - plan_id: references season_plans
  - race_id: references races
  - status: target/registered/completed/skipped
  - priority: a/b/c (A race = most important)
  - notes: optional user notes

  ### profiles
  - Extended user profile data
  - id: references auth.users
  - display_name, avatar_url, bio

  ## Security
  - RLS enabled on all tables
  - Public read on races (discovery feature)
  - Authenticated users can only access their own plans and plan_races
  - Profiles are user-owned
*/

-- Races table (publicly readable)
CREATE TABLE IF NOT EXISTS races (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  country text NOT NULL,
  distance_km numeric(8, 2) NOT NULL DEFAULT 0,
  elevation_m integer NOT NULL DEFAULT 0,
  race_type text NOT NULL DEFAULT 'road',
  difficulty text NOT NULL DEFAULT 'intermediate',
  description text,
  website_url text,
  image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Season plans table
CREATE TABLE IF NOT EXISTS season_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  goal text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plan races junction table
CREATE TABLE IF NOT EXISTS plan_races (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES season_plans ON DELETE CASCADE,
  race_id uuid NOT NULL REFERENCES races ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'target',
  priority text NOT NULL DEFAULT 'b',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, race_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS races_date_idx ON races(date);
CREATE INDEX IF NOT EXISTS races_race_type_idx ON races(race_type);
CREATE INDEX IF NOT EXISTS races_country_idx ON races(country);
CREATE INDEX IF NOT EXISTS season_plans_user_id_idx ON season_plans(user_id);
CREATE INDEX IF NOT EXISTS plan_races_plan_id_idx ON plan_races(plan_id);
CREATE INDEX IF NOT EXISTS plan_races_race_id_idx ON plan_races(race_id);

-- Enable RLS on all tables
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_races ENABLE ROW LEVEL SECURITY;

-- Races: public read (discovery feature), only admins write (no auth insert for now)
CREATE POLICY "Anyone can view races"
  ON races FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profiles: users own their profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Season plans: users own their plans
CREATE POLICY "Users can view own plans"
  ON season_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON season_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON season_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON season_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Plan races: accessible through plan ownership
CREATE POLICY "Users can view own plan races"
  ON plan_races FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM season_plans
      WHERE season_plans.id = plan_races.plan_id
      AND season_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert into own plans"
  ON plan_races FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM season_plans
      WHERE season_plans.id = plan_races.plan_id
      AND season_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own plan races"
  ON plan_races FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM season_plans
      WHERE season_plans.id = plan_races.plan_id
      AND season_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM season_plans
      WHERE season_plans.id = plan_races.plan_id
      AND season_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own plan races"
  ON plan_races FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM season_plans
      WHERE season_plans.id = plan_races.plan_id
      AND season_plans.user_id = auth.uid()
    )
  );

-- Seed some sample races
INSERT INTO races (name, date, location, country, distance_km, elevation_m, race_type, difficulty, description, image_url, tags) VALUES
  ('Ultra Trail Mont Blanc', '2026-08-22', 'Chamonix', 'France', 171, 10000, 'ultra', 'elite', 'The world''s most prestigious ultra trail race circumnavigating Mont Blanc.', 'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['iconic', 'mountainous', 'ultra']),
  ('Berlin Marathon', '2026-09-27', 'Berlin', 'Germany', 42.2, 30, 'road', 'intermediate', 'One of the world''s fastest marathon courses through historic Berlin.', 'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['fast', 'flat', 'world major']),
  ('Ironman Hawaii', '2026-10-10', 'Kona', 'USA', 226, 1800, 'triathlon', 'elite', 'The iconic Ironman World Championship on the Big Island of Hawaii.', 'https://images.pexels.com/photos/1456951/pexels-photo-1456951.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['world championship', 'triathlon', 'iconic']),
  ('Hardrock 100', '2026-07-12', 'Silverton, Colorado', 'USA', 160, 10000, 'ultra', 'elite', 'One of the toughest 100-mile races in North America.', 'https://images.pexels.com/photos/2402926/pexels-photo-2402926.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['brutal', 'mountainous', 'lottery']),
  ('Paris Marathon', '2026-04-05', 'Paris', 'France', 42.2, 200, 'road', 'intermediate', 'Run through the most romantic city in the world.', 'https://images.pexels.com/photos/2403392/pexels-photo-2403392.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['city', 'scenic', 'iconic']),
  ('Haute Route Alps Cycling', '2026-08-16', 'Geneva to Nice', 'France', 890, 22000, 'cycling', 'advanced', 'Seven-day cycling event through the highest paved Alpine passes.', 'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['cycling', 'alpine', 'multi-day']),
  ('Western States 100', '2026-06-27', 'Squaw Valley', 'USA', 160.9, 5486, 'ultra', 'elite', 'The oldest and most prestigious 100-mile trail run in the world.', 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['iconic', 'lottery', 'trail']),
  ('Tokyo Marathon', '2026-03-01', 'Tokyo', 'Japan', 42.2, 100, 'road', 'intermediate', 'Japan''s premier marathon through the vibrant streets of Tokyo.', 'https://images.pexels.com/photos/2524/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=800', ARRAY['world major', 'city', 'fast'])
ON CONFLICT DO NOTHING;
