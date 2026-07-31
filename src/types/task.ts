export type { Priority, Category, SubTask, Task } from "../modules/tasks/types";

export type TaskTab = "today" | "upcoming" | "completed";

export interface TaskSummary {
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  todayXp: number;
  streakDays: number;
  bestStreakDays: number;
}
