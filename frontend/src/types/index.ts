export interface SessionCreated {
  session_id: string;
  partner_a_survey_token: string;
  partner_b_survey_token: string;
  expires_at: string;
}

export interface SessionStatus {
  session_id: string;
  status: 'pending' | 'partial' | 'complete';
  partners_completed: number;
  expires_at: string;
}

export interface SurveyInfo {
  token: string;
  session_id: string;
  already_submitted: boolean;
}

export interface SurveySubmit {
  cuisines_liked: string[];
  cuisines_avoided: string[];
  dietary_restrictions: string[];
  price_min: number;
  price_max: number;
  atmospheres: string[];
  max_distance_miles: number;
}

export interface Restaurant {
  place_id: string | null;
  name: string;
  address: string;
  rating: number;
  review_count: number;
  price_level: string;
  distance_miles: number;
  open_now: boolean;
  hours_today: string | null;
  phone: string | null;
  google_maps_url: string | null;
  photo_url: string | null;
  health_score: number | null;
}

export interface MatchedPrefs {
  cuisines: string[];
  dietary_restrictions: string[];
  price_range: { min: number; max: number };
  max_distance_miles: number;
  atmospheres: string[];
}

export interface RecommendationResponse {
  matched_preferences: MatchedPrefs;
  restaurants: Restaurant[];
}
