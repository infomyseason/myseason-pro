export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      races: {
        Row: {
          id: string;
          name: string;
          date: string;
          location: string;
          country: string;
          distance_km: number;
          elevation_m: number;
          race_type: string;
          difficulty: string;
          description: string | null;
          website_url: string | null;
          image_url: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["races"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["races"]["Insert"]>;
      };
      season_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          year: number;
          goal: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["season_plans"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["season_plans"]["Insert"]>;
      };
      plan_races: {
        Row: {
          id: string;
          plan_id: string;
          race_id: string;
          status: string;
          priority: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["plan_races"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plan_races"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
