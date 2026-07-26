export type Priority = "low" | "medium" | "high";

export type Category =
  | "Development"
  | "Personal"
  | "Gym"
  | "Japanese"
  | "Notes"
  | "Anime"
  | "Music"
  | "Health"
  | "Study"
  | "General";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  xpReward: number;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
  xpAwarded?: boolean;
  subtasks: SubTask[];
  createdAt: string;
}

export type TaskTab = "today" | "upcoming" | "completed";

export interface TaskSummary {
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  todayXp: number;
  streakDays: number;
  bestStreakDays: number;
}
