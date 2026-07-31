import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import {
  Task,
  CreateTaskInput,
  TaskFilterOptions,
  TaskSortOptions,
  Priority,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.TASKS;

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Morning Workout",
    category: "Gym",
    priority: "medium",
    xpReward: 25,
    dueTime: "7:00 AM",
    dueDate: "Today",
    completed: true,
    completedAt: new Date().toISOString(),
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Read 20 pages of a book",
    category: "Personal",
    priority: "low",
    xpReward: 15,
    dueTime: "8:30 AM",
    dueDate: "Today",
    completed: true,
    completedAt: new Date().toISOString(),
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "React + TypeScript Practice",
    category: "Development",
    priority: "high",
    xpReward: 30,
    dueTime: "10:00 AM",
    dueDate: "Today",
    completed: true,
    completedAt: new Date().toISOString(),
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Build DailyLife Tasks Page",
    description:
      "Create a fully functional tasks page with add, edit, delete, complete functionality and XP integration.",
    category: "Development",
    priority: "high",
    xpReward: 40,
    dueTime: "Today, 11:59 PM",
    dueDate: "Today",
    completed: false,
    subtasks: [
      { id: "sub-1", title: "Design the UI layout", completed: true },
      { id: "sub-2", title: "Implement add task functionality", completed: false },
      { id: "sub-3", title: "Implement complete / delete", completed: false },
      { id: "sub-4", title: "Integrate XP system", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Japanese Vocabulary (20 words)",
    category: "Japanese",
    priority: "medium",
    xpReward: 20,
    dueTime: "12:00 PM",
    dueDate: "Today",
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-6",
    title: "Lunch & Break",
    category: "Personal",
    priority: "low",
    xpReward: 10,
    dueTime: "1:00 PM",
    dueDate: "Today",
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-7",
    title: "Study Data Structures",
    category: "Study",
    priority: "high",
    xpReward: 25,
    dueTime: "2:30 PM",
    dueDate: "Today",
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-8",
    title: "Walk for 20 minutes",
    category: "Health",
    priority: "low",
    xpReward: 15,
    dueTime: "7:00 PM",
    dueDate: "Today",
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Modular TaskService implementing task management logic.
 * Uses StorageService for persistence, EventBus for messaging, and XPService for XP rewards.
 */
export class TaskService {
  private tasks: Task[] = [];

  constructor() {
    this.tasks = [...INITIAL_TASKS];
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<Task[]>(STORAGE_KEY);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        this.tasks = saved.map((t) => ({
          ...t,
          subtasks: t.subtasks || [],
        }));
      } else {
        await storageService.save(STORAGE_KEY, this.tasks);
      }
    } catch (err) {
      console.error("[TaskService] Failed to load tasks from StorageService:", err);
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.save(STORAGE_KEY, this.tasks);
    } catch (err) {
      console.error("[TaskService] Failed to persist tasks:", err);
    }
  }

  /**
   * Retrieves all tasks.
   */
  getTasks(): Task[] {
    return [...this.tasks];
  }

  /**
   * Finds a task by unique ID.
   *
   * @param id Unique task identifier.
   */
  getTask(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  /**
   * Creates a new task and persists it.
   * Emits 'task:created' event via EventBus.
   *
   * @param input Task data input.
   */
  createTask(input: CreateTaskInput): Task {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title.trim(),
      description: input.description?.trim(),
      completed: false,
      priority: input.priority || "medium",
      category: input.category || "General",
      dueDate: input.dueDate || "Today",
      dueTime: input.dueTime || "Today",
      xpReward: Math.max(5, input.xpReward ?? 15),
      subtasks: (input.subtasks || []).map((sub, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: sub.title,
        completed: sub.completed || false,
      })),
      createdAt: new Date().toISOString(),
    };

    this.tasks = [newTask, ...this.tasks];
    this.persist();

    eventBus.emit("task:created", { taskId: newTask.id, task: newTask });
    return newTask;
  }

  /**
   * Updates an existing task by ID.
   * Emits 'task:updated' event via EventBus.
   *
   * @param id Unique task identifier.
   * @param updates Object containing fields to update.
   */
  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const existing = this.tasks[index];
    const isNowCompleted =
      updates.completed !== undefined ? updates.completed : existing.completed;

    if (!existing.completed && isNowCompleted) {
      return this.completeTask(id);
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      id: existing.id,
      completed: isNowCompleted,
      completedAt: !isNowCompleted
        ? undefined
        : updates.completedAt || existing.completedAt,
      subtasks: updates.subtasks !== undefined ? updates.subtasks : existing.subtasks,
    };

    this.tasks[index] = updatedTask;
    this.persist();

    eventBus.emit("task:updated", { taskId: id, task: updatedTask });
    return updatedTask;
  }

  /**
   * Deletes a task by ID.
   * Emits 'task:deleted' event via EventBus.
   *
   * @param id Unique task identifier.
   * @returns True if deleted, false if not found.
   */
  deleteTask(id: string): boolean {
    const initialLength = this.tasks.length;
    const taskToDelete = this.getTask(id);

    this.tasks = this.tasks.filter((t) => t.id !== id);

    if (this.tasks.length < initialLength) {
      this.persist();
      if (taskToDelete && taskToDelete.completed) {
        xpService.removeXP(taskToDelete.xpReward);
      }
      eventBus.emit("task:deleted", { taskId: id });
      return true;
    }
    return false;
  }

  /**
   * Toggles task completion state.
   * If toggled to completed, triggers completeTask logic and awards XP.
   * If toggled to uncompleted, removes awarded XP.
   *
   * @param id Unique task identifier.
   */
  toggleTask(id: string): Task | undefined {
    const task = this.getTask(id);
    if (!task) return undefined;

    if (!task.completed) {
      return this.completeTask(id);
    } else {
      xpService.removeXP(task.xpReward);
      return this.updateTask(id, { completed: false, completedAt: undefined });
    }
  }

  /**
   * Toggles a subtask's completion status by ID.
   * Emits 'task:updated' event via EventBus.
   *
   * @param taskId Parent task identifier.
   * @param subtaskId Target subtask identifier.
   */
  toggleSubtask(taskId: string, subtaskId: string): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return undefined;

    const task = this.tasks[index];
    const updatedSubtasks = (task.subtasks || []).map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
    };

    this.tasks[index] = updatedTask;
    this.persist();

    eventBus.emit("task:updated", { taskId, task: updatedTask });
    return updatedTask;
  }

  /**
   * Completes a task, sets completedAt timestamp, awards XP via XPService,
   * and emits 'task:completed' and 'task:updated' events via EventBus.
   *
   * @param id Unique task identifier.
   */
  completeTask(id: string): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const existing = this.tasks[index];
    const completedTask: Task = {
      ...existing,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    this.tasks[index] = completedTask;
    this.persist();

    if (!existing.completed) {
      xpService.awardXP(existing.xpReward, `Completed task: ${existing.title}`);
    }

    eventBus.emit("task:completed", {
      taskId: id,
      xpReward: existing.xpReward,
      task: completedTask,
    });
    eventBus.emit("task:updated", { taskId: id, task: completedTask });

    return completedTask;
  }

  /**
   * Returns all completed tasks.
   */
  getCompleted(): Task[] {
    return this.tasks.filter((t) => t.completed);
  }

  /**
   * Returns all pending (uncompleted) tasks.
   */
  getPending(): Task[] {
    return this.tasks.filter((t) => !t.completed);
  }

  /**
   * Searches tasks by matching query string against title, description, or category.
   *
   * @param query Search query string.
   */
  search(query: string): Task[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getTasks();

    return this.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }

  /**
   * Filters tasks using TaskFilterOptions criteria.
   *
   * @param options Filter options.
   */
  filter(options: TaskFilterOptions): Task[] {
    let result = [...this.tasks];

    if (options.completed !== undefined) {
      result = result.filter((t) => t.completed === options.completed);
    }
    if (options.category) {
      const cat = options.category.toLowerCase();
      result = result.filter((t) => t.category.toLowerCase() === cat);
    }
    if (options.priority) {
      result = result.filter((t) => t.priority === options.priority);
    }
    if (options.searchQuery) {
      const q = options.searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Sorts tasks using TaskSortOptions parameters.
   *
   * @param options Sort options.
   */
  sort(options: TaskSortOptions): Task[] {
    const { field, order = "asc" } = options;
    const modifier = order === "asc" ? 1 : -1;

    return [...this.tasks].sort((a, b) => {
      if (field === "priority") {
        const weightA = PRIORITY_WEIGHT[a.priority] || 0;
        const weightB = PRIORITY_WEIGHT[b.priority] || 0;
        return (weightA - weightB) * modifier;
      }
      if (field === "title") {
        return a.title.localeCompare(b.title) * modifier;
      }
      if (field === "xpReward") {
        return (a.xpReward - b.xpReward) * modifier;
      }
      if (field === "dueDate") {
        const valA = a.dueDate || "";
        const valB = b.dueDate || "";
        return valA.localeCompare(valB) * modifier;
      }
      const valA = a.createdAt || "";
      const valB = b.createdAt || "";
      return valA.localeCompare(valB) * modifier;
    });
  }
}

/**
 * Global singleton instance of modular TaskService.
 */
export const taskServiceModule = new TaskService();
