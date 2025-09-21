export type ActivityType =
  | "RUNNING"
  | "CYCLING"
  | "SWIMMING"
  | "WEIGHT_TRAINING"
  | "YOGA"
  | "CARDIO"
  | "STRETCHING"
  | "OTHER";

export interface AdditionalMetrics {
  [key: string]: any;
}

export interface ActivityTrackRequest {
  keycloakId: string;
  activityType: ActivityType;
  duration: number;
  caloriesBurned: number;
  startTime: string; // "YYYY-MM-DDTHH:mm:ss"
  additionalMetrics: AdditionalMetrics;
}

export interface ActivityResponse {
  id: string;
  keycloakId: string;
  type: ActivityType;
  duration: number;
  caloriesBurned: number;
  startTime: string;
  additionalMetrics: AdditionalMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  activityId: string;
  keycloakId: string;
  type: string;
  recommendation: string;
  improvements: string[];
  suggestions: string[];
  safety: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityWithRecommendation extends ActivityResponse {
  recommendation?: Recommendation;
  recommendationStatus: "loading" | "available" | "unavailable";
}
