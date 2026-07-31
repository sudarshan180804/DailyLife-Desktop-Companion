export interface MuscleTarget {
  name: string;
  color: string;
}

export interface Exercise {
  id: string;
  orderNumber: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  weight?: string;
  xpReward: number;
  completed: boolean;
  imageUrl?: string;
  targetedMuscles: MuscleTarget[];
  instructions: string[];
  tips: string[];
  restTime: string;
  equipment: string;
}

export interface TimelineItem {
  id: string;
  timeOffset: string;
  type: "exercise" | "warmup" | "break" | "hydration" | "cooldown";
  title: string;
  subtitle: string;
  exerciseId?: string;
  completed: boolean;
  orderNumber?: string;
}

export interface BodyStat {
  name: string;
  level: number;
  progressPercent: number;
}

export interface GymSummary {
  streakDays: number;
  weeklyWorkoutsCount: number;
  totalXpEarned: number;
  warriorRank: string;
  warriorRankXp: number;
  warriorRankMaxXp: number;
}

export interface WeeklyScheduleDay {
  day: string;
  status: string;
}
