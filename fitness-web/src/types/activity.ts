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
  laps?: number;
  poolLength?: number;
  avgStrokeRate?: number;
  [key: string]: any; // Allow any additional properties
}

export interface ActivityTrackRequest {
  keycloakId: string; // Changed from userId
  activityType: ActivityType; // request uses activityType
  duration: number;
  caloriesBurned: number;
  startTime: string; // "YYYY-MM-DDTHH:mm:ss"
  additionalMetrics: AdditionalMetrics;
}

export interface ActivityResponse {
  id: string;
  keycloakId: string; // Changed from userId
  type: ActivityType; // response uses "type"
  duration: number;
  caloriesBurned: number;
  startTime: string;
  additionalMetrics: AdditionalMetrics;
  createdAt: string;
  updatedAt: string;
}
