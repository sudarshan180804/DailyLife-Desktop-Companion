import { Task, Category, Priority } from "../types/task";
import { xpService } from "./xpService";

const STORAGE_KEY = "dailylife_tasks";

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Morning Workout",
    category: "Gym",
    priority: "medium",
    xpReward: 25,
    dueTime: "7:00 AM",
    completed: true,
    xpAwarded: true,
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
    completed: true,
    xpAwarded: true,
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
    completed: true,
    xpAwarded: true,
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
    completed: false,
    xpAwarded: false,
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
    completed: false,
    xpAwarded: false,
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
    completed: false,
    xpAwarded: false,
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
    completed: false,
    xpAwarded: false,
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
    completed: false,
    xpAwarded: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

type TaskListener = (tasks: Task[]) => void;
const listeners: Set<TaskListener> = new Set();

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch (err) {
    console.error("Failed to load tasks from localStorage:", err);
    return INITIAL_TASKS;
  }
}

function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Failed to save tasks to localStorage:", err);
  }
}

function notifyListeners(tasks: Task[]): void {
  listeners.forEach((listener) => listener(tasks));
}

export const taskService = {
  getTasks(): Task[] {
    return loadTasks();
  },

  addTask(taskData: {
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    xpReward: number;
    dueTime?: string;
    subtasks?: { title: string }[];
  }): Task {
    const tasks = loadTasks();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      category: taskData.category,
      priority: taskData.priority,
      xpReward: Math.max(5, taskData.xpReward || 15),
      dueTime: taskData.dueTime || "Today",
      completed: false,
      xpAwarded: false,
      subtasks: (taskData.subtasks || []).map((sub, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: sub.title,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    notifyListeners(updated);
    return newTask;
  },

  updateTask(updatedTask: Task): Task {
    const tasks = loadTasks();
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    saveTasks(updated);
    notifyListeners(updated);
    return updatedTask;
  },

  deleteTask(taskId: string): void {
    const tasks = loadTasks();
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (taskToDelete && taskToDelete.xpAwarded) {
      xpService.removeXP(taskToDelete.xpReward);
    }
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    notifyListeners(updated);
  },

  toggleTaskComplete(taskId: string): Task | null {
    const tasks = loadTasks();
    let targetTask: Task | null = null;

    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;

      const isNowCompleted = !t.completed;
      let xpAwarded = t.xpAwarded;

      if (isNowCompleted && !t.xpAwarded) {
        xpService.addXP(t.xpReward);
        xpAwarded = true;
      } else if (!isNowCompleted && t.xpAwarded) {
        xpService.removeXP(t.xpReward);
        xpAwarded = false;
      }

      targetTask = {
        ...t,
        completed: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        xpAwarded,
      };
      return targetTask;
    });

    if (targetTask) {
      saveTasks(updated);
      notifyListeners(updated);
    }
    return targetTask;
  },

  toggleSubtask(taskId: string, subtaskId: string): Task | null {
    const tasks = loadTasks();
    let updatedTask: Task | null = null;

    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;

      const updatedSubtasks = t.subtasks.map((sub) =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      );

      updatedTask = { ...t, subtasks: updatedSubtasks };
      return updatedTask;
    });

    if (updatedTask) {
      saveTasks(updated);
      notifyListeners(updated);
    }
    return updatedTask;
  },

  subscribe(listener: TaskListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
