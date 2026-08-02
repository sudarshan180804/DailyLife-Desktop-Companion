export interface MuscleTarget {
  name: string;
  color?: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  targetReps: number;
  targetWeight: number; // in kg (0 for bodyweight)
  actualReps?: number;
  actualWeight?: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  orderNumber: string;
  name: string;
  category: string;
  setsCount: number;
  setsList: ExerciseSet[];
  repsDisplay: string;
  weightDisplay: string;
  xpReward: number;
  completed: boolean;
  imageUrl?: string;
  videoUrl?: string;
  targetedMuscles: MuscleTarget[];
  instructions: string[];
  tips: string[];
  restTimeSeconds: number; // in seconds, e.g., 90
  restTimeDisplay: string; // e.g., "90 sec"
  equipment: string;
  durationMinutes?: number;
  // Legacy / fallback getters compatibility:
  sets?: number;
  reps?: string;
  weight?: string;
  restTime?: string;
}

export type WeekDayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface WorkoutDay {
  id: string;
  dayOfWeek: WeekDayName;
  title: string;
  enabled: boolean;
  isRestDay: boolean;
  description?: string;
  icon?: string;
  exercises: Exercise[];
  orderIndex: number;
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

export interface WorkoutSession {
  id: string;
  workoutDayId: string;
  workoutDayTitle: string;
  startedAt: string; // ISO string
  currentExerciseIndex: number;
  elapsedSeconds: number;
  restTimerSeconds: number;
  isRestTimerActive: boolean;
  exercises: Exercise[];
  isFinished: boolean;
}

export interface WorkoutHistoryRecord {
  id: string;
  date: string; // ISO timestamp
  workoutDayId: string;
  workoutDayTitle: string;
  durationSeconds: number;
  completedExercisesCount: number;
  totalExercisesCount: number;
  xpEarned: number;
  coinsEarned: number;
  exercisesPerformed: {
    exerciseId: string;
    name: string;
    completed: boolean;
    sets: {
      setNumber: number;
      targetReps: number;
      targetWeight: number;
      actualReps: number;
      actualWeight: number;
      completed: boolean;
    }[];
  }[];
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
  fullDayName: WeekDayName;
  status: "completed" | "rest" | "today" | "upcoming" | "disabled";
  workoutDayId?: string;
  title?: string;
}

export interface GymDataPayload {
  version: number; // 2
  workoutDays: WorkoutDay[];
  history: WorkoutHistoryRecord[];
  activeSession: WorkoutSession | null;
  summary: GymSummary;
  bodyStats: BodyStat[];
}
