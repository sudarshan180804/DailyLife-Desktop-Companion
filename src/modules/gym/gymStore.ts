import { useSyncExternalStore } from "react";
import { gymServiceModule, GymService } from "./gymService";
import { eventBus } from "../../services/eventBus";
import {
  Exercise,
  TimelineItem,
  BodyStat,
  GymSummary,
  WeeklyScheduleDay,
} from "./types";

/**
 * State structure exposed by GymStore.
 */
export interface GymStoreState {
  exercises: Exercise[];
  timeline: TimelineItem[];
  bodyStats: BodyStat[];
  summary: GymSummary;
  schedule: WeeklyScheduleDay[];
  loading: boolean;
}

/**
 * Asynchronous actions exposed by GymStore.
 */
export interface GymStoreActions {
  toggleExercise: (exerciseId: string) => Promise<Exercise | undefined>;
  completeWorkoutSession: () => Promise<void>;
  resetWorkout: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * GymStore acts as the single source of truth for Gym state in React.
 * Wraps GymService, listens to EventBus events, and exposes useSyncExternalStore integration.
 */
export class GymStore {
  private state: GymStoreState;
  private listeners: Set<() => void> = new Set();
  private service: GymService;

  constructor(service: GymService = gymServiceModule) {
    this.service = service;
    this.state = {
      exercises: this.service.getExercises(),
      timeline: this.service.getTimeline(),
      bodyStats: this.service.getBodyStats(),
      summary: this.service.getGymSummary(),
      schedule: this.service.getWeeklySchedule(),
      loading: false,
    };

    // Subscribe to EventBus gym events for real-time state synchronization
    eventBus.subscribe("gym:exerciseCompleted", () => this.syncFromService());
    eventBus.subscribe("gym:sessionCompleted", () => this.syncFromService());
    eventBus.subscribe("gym:updated", () => this.syncFromService());
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      exercises: this.service.getExercises(),
      timeline: this.service.getTimeline(),
      bodyStats: this.service.getBodyStats(),
      summary: this.service.getGymSummary(),
      schedule: this.service.getWeeklySchedule(),
    };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): GymStoreState => {
    return this.state;
  };

  public async refresh(): Promise<void> {
    this.state = { ...this.state, loading: true };
    this.notify();

    await new Promise((resolve) => setTimeout(resolve, 0));

    this.syncFromService();
    this.state = { ...this.state, loading: false };
    this.notify();
  }

  public async toggleExercise(
    exerciseId: string
  ): Promise<Exercise | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.toggleExercise(exerciseId);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async completeWorkoutSession(): Promise<void> {
    this.service.completeWorkoutSession();
    this.syncFromService();
  }

  public async resetWorkout(): Promise<void> {
    this.service.resetWorkout();
    this.syncFromService();
  }
}

/**
 * Global singleton instance of GymStore.
 */
export const gymStore = new GymStore();

/**
 * Custom React hook for subscribing to GymStore state and async actions.
 */
export function useGymStore(): GymStoreState & GymStoreActions {
  const state = useSyncExternalStore(
    gymStore.subscribe,
    gymStore.getSnapshot,
    gymStore.getSnapshot
  );

  return {
    ...state,
    toggleExercise: (exerciseId) => gymStore.toggleExercise(exerciseId),
    completeWorkoutSession: () => gymStore.completeWorkoutSession(),
    resetWorkout: () => gymStore.resetWorkout(),
    refresh: () => gymStore.refresh(),
  };
}
