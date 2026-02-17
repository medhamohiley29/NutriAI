
export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  goals?: string[];
  dietType?: string;
  region?: string;
  wantsFitnessPlan?: boolean;
  workoutTiming?: string;
  alarmEnabled?: boolean;
}

export interface WorkoutDay {
  day: string;
  duration: string;
  exercises: string[];
}

export interface Recommendation {
  workoutPlan?: WorkoutDay[];
  dietChart?: {
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
  };
  tips: string[];
}
