export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced';
export type RouteStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type AlertSeverity = 'info' | 'warning' | 'danger';
export type AlertType = 'wind' | 'gust' | 'wave' | 'visibility' | 'thunder' | 'wind_shift' | 'general';

export interface Profile {
  id: string;
  display_name: string | null;
  experience_level: ExperienceLevel;
  preferred_language: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertThreshold {
  id: string;
  user_id: string;
  name: string;
  wind_speed_ms: number;
  wind_gust_ms: number;
  wave_height_m: number;
  visibility_km: number;
  thunder: boolean;
  wind_shift_degrees: number;
}

export interface Waypoint {
  id: string;
  route_id: string;
  sequence_order: number;
  lat: number;
  lng: number;
  name: string | null;
  eta: string | null;
  wind_speed_ms: number | null;
  wind_gust_ms: number | null;
  wind_direction_deg: number | null;
  wave_height_m: number | null;
  visibility_km: number | null;
  thunder_risk: boolean;
  weather_fetched_at: string | null;
}

export interface Route {
  id: string;
  user_id: string;
  name: string | null;
  status: RouteStatus;
  departure_time: string | null;
  boat_speed_knots: number;
  threshold_id: string | null;
  route_geojson: any | null;
  weather_cache: any | null;
  weather_cached_at: string | null;
  created_at: string;
  updated_at: string;
  waypoints?: Waypoint[];
}

export interface RouteAlert {
  id: string;
  route_id: string;
  waypoint_id: string | null;
  severity: AlertSeverity;
  alert_type: AlertType;
  triggered_value: number | null;
  threshold_value: number | null;
  message_sv: string;
  message_en: string | null;
  suggested_action_sv: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface WeatherData {
  wind_speed_ms: number;
  wind_gust_ms: number;
  wind_direction_deg: number;
  wave_height_m: number;
  visibility_km: number;
  thunder_risk: boolean;
  temperature_c?: number;
  fetched_at: string;
}

// Supabase Database type for typed client
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      routes: { Row: Route; Insert: Partial<Route>; Update: Partial<Route> };
      waypoints: { Row: Waypoint; Insert: Partial<Waypoint>; Update: Partial<Waypoint> };
      route_alerts: { Row: RouteAlert; Insert: Partial<RouteAlert>; Update: Partial<RouteAlert> };
      alert_thresholds: { Row: AlertThreshold; Insert: Partial<AlertThreshold>; Update: Partial<AlertThreshold> };
    };
  };
};
