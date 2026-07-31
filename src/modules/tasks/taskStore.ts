import { useSyncExternalStore } from "react";
import { taskServiceModule, TaskService } from "./taskService";
import { eventBus } from "../../services/eventBus";
import { Task, CreateTaskInput } from "./types";

/**
 * State structure exposed by TaskStore.
 */
export interface TaskStoreState {
  tasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  loading: boolean;
}

/**
 * Asynchronous actions exposed by TaskStore.
 */
export interface TaskStoreActions {
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<Task | undefined>;
  completeTask: (id: string) => Promise<Task | undefined>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<Task | undefined>;
  refresh: () => Promise<void>;
}

/**
 * TaskStore serves as the single source of truth for task state in React components.
 * It wraps TaskService for CRUD operations, listens to EventBus events for real-time
 * synchronization, and provides async action methods.
 */
export class TaskStore {
  private state: TaskStoreState = {
    tasks: [],
    completedTasks: [],
    pendingTasks: [],
    loading: false,
  };

  private listeners: Set<() => void> = new Set();
  private service: TaskService;

  constructor(service: TaskService = taskServiceModule) {
    this.service = service;

    // Perform initial data sync from TaskService
    this.syncFromService();

    // Subscribe to EventBus for automatic state synchronization
    eventBus.subscribe("task:created", () => this.syncFromService());
    eventBus.subscribe("task:updated", () => this.syncFromService());
    eventBus.subscribe("task:deleted", () => this.syncFromService());
    eventBus.subscribe("task:completed", () => this.syncFromService());
  }

  /**
   * Synchronizes store state from TaskService snapshot and notifies listeners.
   */
  private syncFromService(): void {
    const all = this.service.getTasks();
    const completed = this.service.getCompleted();
    const pending = this.service.getPending();

    this.state = {
      ...this.state,
      tasks: all,
      completedTasks: completed,
      pendingTasks: pending,
    };
    this.notify();
  }

  /**
   * Notifies all registered React listeners of state updates.
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Subscribes a listener callback to store state changes.
   *
   * @param listener Callback function invoked on state updates.
   * @returns Cleanup function to unsubscribe.
   */
  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Returns current immutable state snapshot for React's useSyncExternalStore.
   */
  public getSnapshot = (): TaskStoreState => {
    return this.state;
  };

  /**
   * Asynchronously refreshes state from TaskService.
   */
  public async refresh(): Promise<void> {
    this.state = { ...this.state, loading: true };
    this.notify();

    await new Promise((resolve) => setTimeout(resolve, 0));

    this.syncFromService();
    this.state = { ...this.state, loading: false };
    this.notify();
  }

  /**
   * Asynchronously creates a new task using TaskService.
   *
   * @param input CreateTaskInput fields.
   * @returns Created Task object.
   */
  public async createTask(input: CreateTaskInput): Promise<Task> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const newTask = this.service.createTask(input);
      this.syncFromService();
      return newTask;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  /**
   * Asynchronously updates an existing task.
   *
   * @param id Unique task identifier.
   * @param updates Object containing task fields to update.
   * @returns Updated Task object or undefined if not found.
   */
  public async updateTask(
    id: string,
    updates: Partial<Task>
  ): Promise<Task | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.updateTask(id, updates);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  /**
   * Asynchronously deletes a task by ID.
   *
   * @param id Unique task identifier.
   * @returns True if deleted, false if not found.
   */
  public async deleteTask(id: string): Promise<boolean> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const deleted = this.service.deleteTask(id);
      this.syncFromService();
      return deleted;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  /**
   * Asynchronously toggles a task's completion state.
   *
   * @param id Unique task identifier.
   * @returns Updated Task object or undefined if not found.
   */
  public async toggleTask(id: string): Promise<Task | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.toggleTask(id);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  /**
   * Asynchronously completes a task and awards XP via TaskService.
   *
   * @param id Unique task identifier.
   * @returns Completed Task object or undefined if not found.
   */
  public async completeTask(id: string): Promise<Task | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const completed = this.service.completeTask(id);
      this.syncFromService();
      return completed;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  /**
   * Asynchronously toggles a subtask's completion status.
   *
   * @param taskId Parent task identifier.
   * @param subtaskId Target subtask identifier.
   * @returns Updated Task object or undefined if not found.
   */
  public async toggleSubtask(
    taskId: string,
    subtaskId: string
  ): Promise<Task | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.toggleSubtask(taskId, subtaskId);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }
}

/**
 * Global singleton instance of TaskStore.
 */
export const taskStore = new TaskStore();

/**
 * Custom React hook for subscribing to TaskStore state and async actions.
 * Serves as the primary interface for React components.
 */
export function useTaskStore(): TaskStoreState & TaskStoreActions {
  const state = useSyncExternalStore(
    taskStore.subscribe,
    taskStore.getSnapshot,
    taskStore.getSnapshot
  );

  return {
    ...state,
    createTask: (input) => taskStore.createTask(input),
    updateTask: (id, updates) => taskStore.updateTask(id, updates),
    deleteTask: (id) => taskStore.deleteTask(id),
    toggleTask: (id) => taskStore.toggleTask(id),
    completeTask: (id) => taskStore.completeTask(id),
    toggleSubtask: (taskId, subtaskId) => taskStore.toggleSubtask(taskId, subtaskId),
    refresh: () => taskStore.refresh(),
  };
}
