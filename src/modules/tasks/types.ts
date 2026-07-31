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

/**
 * Core Task data model for the task module.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string;
  dueTime?: string;
  xpReward: number;
  createdAt: string;
  completedAt?: string;
  subtasks: SubTask[];
}

/**
 * Input payload for creating a new Task.
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
  dueTime?: string;
  xpReward?: number;
  subtasks?: { title: string; completed?: boolean }[];
}

/**
 * Filter options for querying tasks.
 */
export interface TaskFilterOptions {
  category?: string;
  priority?: Priority;
  completed?: boolean;
  searchQuery?: string;
}

export type TaskSortField =
  | "createdAt"
  | "dueDate"
  | "priority"
  | "title"
  | "xpReward";

export type SortOrder = "asc" | "desc";

/**
 * Sorting options for ordering tasks.
 */
export interface TaskSortOptions {
  field: TaskSortField;
  order?: SortOrder;
}
