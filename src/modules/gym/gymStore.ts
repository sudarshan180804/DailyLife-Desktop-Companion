import { useSyncExternalStore } from "react";
import { gymServiceModule, GymService } from "./gymService";
import { eventBus } from "../../services/eventBus";
import {
  WorkoutDay,
  WorkoutSession,
  WorkoutHistoryRecord,
  Exercise,
  TimelineItem,
  BodyStat,
  GymSummary,
  WeeklyScheduleDay,
  WeekDayName,
  ExerciseSet,
} from "./types";

export interface GymStoreState {
  workoutDays: WorkoutDay[];
  activeSession: WorkoutSession | null;
  history: WorkoutHistoryRecord[];
  summary: GymSummary;
  bodyStats: BodyStat[];
  schedule: WeeklyScheduleDay[];
  exercises: Exercise[];
  timeline: TimelineItem[];
  loading: boolean;
}

export interface GymStoreActions {
  createWorkoutDay: (data: {
    dayOfWeek: WeekDayName;
    title: string;
    enabled?: boolean;
    isRestDay?: boolean;
    description?: string;
    icon?: string;
  }) => Promise<WorkoutDay>;
  updateWorkoutDay: (id: string, updates: Partial<WorkoutDay>) => Promise<WorkoutDay | undefined>;
  deleteWorkoutDay: (id: string) => Promise<boolean>;
  reorderWorkoutDays: (orderedIds: string[]) => Promise<void>;
  createExercise: (
    workoutDayId: string,
    data: {
      name: string;
      category?: string;
      targetedMuscles?: { name: string; color?: string }[];
      instructions?: string[];
      tips?: string[];
      setsList?: ExerciseSet[];
      restTimeSeconds?: number;
      xpReward?: number;
      imageUrl?: string;
      videoUrl?: string;
      equipment?: string;
      durationMinutes?: number;
    }
  ) => Promise<Exercise | undefined>;
  updateExercise: (
    workoutDayId: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => Promise<Exercise | undefined>;
  deleteExercise: (workoutDayId: string, exerciseId: string) => Promise<boolean>;
  duplicateExercise: (workoutDayId: string, exerciseId: string) => Promise<Exercise | undefined>;
  reorderExercises: (workoutDayId: string, orderedIds: string[]) => Promise<void>;
  startSession: (workoutDayId: string) => Promise<WorkoutSession | undefined>;
  toggleSetComplete: (
    exerciseId: string,
    setNumber: number,
    actualReps?: number,
    actualWeight?: number
  ) => Promise<WorkoutSession | null>;
  updateSetActuals: (
    exerciseId: string,
    setNumber: number,
    actualReps: number,
    actualWeight: number
  ) => Promise<WorkoutSession | null>;
  setCurrentExerciseIndex: (index: number) => void;
  tickSessionTimer: (deltaSeconds?: number) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  finishSession: () => Promise<WorkoutHistoryRecord | null>;
  cancelSession: () => Promise<void>;
  clearHistory: () => Promise<void>;
  toggleExercise: (exerciseId: string) => Promise<Exercise | undefined>;
  completeWorkoutSession: () => Promise<void>;
  resetWorkout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export class GymStore {
  private state: GymStoreState;
  private listeners: Set<() => void> = new Set();
  private service: GymService;

  constructor(service: GymService = gymServiceModule) {
    this.service = service;
    this.state = {
      workoutDays: this.service.getWorkoutDays(),
      activeSession: this.service.getActiveSession(),
      history: this.service.getHistory(),
      bodyStats: this.service.getBodyStats(),
      summary: this.service.getGymSummary(),
      schedule: this.service.getWeeklySchedule(),
      exercises: this.service.getExercises(),
      timeline: this.service.getTimeline(),
      loading: false,
    };

    eventBus.subscribe("gym:updated", () => this.syncFromService());
    eventBus.subscribe("gym:sessionStarted", () => this.syncFromService());
    eventBus.subscribe("gym:sessionCompleted", () => this.syncFromService());
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      workoutDays: this.service.getWorkoutDays(),
      activeSession: this.service.getActiveSession(),
      history: this.service.getHistory(),
      bodyStats: this.service.getBodyStats(),
      summary: this.service.getGymSummary(),
      schedule: this.service.getWeeklySchedule(),
      exercises: this.service.getExercises(),
      timeline: this.service.getTimeline(),
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
    this.syncFromService();
    this.state = { ...this.state, loading: false };
    this.notify();
  }

  // Action methods delegating to GymService
  public async createWorkoutDay(data: any): Promise<WorkoutDay> {
    const res = this.service.createWorkoutDay(data);
    this.syncFromService();
    return res;
  }

  public async updateWorkoutDay(id: string, updates: Partial<WorkoutDay>): Promise<WorkoutDay | undefined> {
    const res = this.service.updateWorkoutDay(id, updates);
    this.syncFromService();
    return res;
  }

  public async deleteWorkoutDay(id: string): Promise<boolean> {
    const res = this.service.deleteWorkoutDay(id);
    this.syncFromService();
    return res;
  }

  public async reorderWorkoutDays(orderedIds: string[]): Promise<void> {
    this.service.reorderWorkoutDays(orderedIds);
    this.syncFromService();
  }

  public async createExercise(workoutDayId: string, data: any): Promise<Exercise | undefined> {
    const res = this.service.createExercise(workoutDayId, data);
    this.syncFromService();
    return res;
  }

  public async updateExercise(workoutDayId: string, exerciseId: string, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    const res = this.service.updateExercise(workoutDayId, exerciseId, updates);
    this.syncFromService();
    return res;
  }

  public async deleteExercise(workoutDayId: string, exerciseId: string): Promise<boolean> {
    const res = this.service.deleteExercise(workoutDayId, exerciseId);
    this.syncFromService();
    return res;
  }

  public async duplicateExercise(workoutDayId: string, exerciseId: string): Promise<Exercise | undefined> {
    const res = this.service.duplicateExercise(workoutDayId, exerciseId);
    this.syncFromService();
    return res;
  }

  public async reorderExercises(workoutDayId: string, orderedIds: string[]): Promise<void> {
    this.service.reorderExercises(workoutDayId, orderedIds);
    this.syncFromService();
  }

  public async startSession(workoutDayId: string): Promise<WorkoutSession | undefined> {
    const session = this.service.startSession(workoutDayId);
    this.syncFromService();
    return session;
  }

  public async toggleSetComplete(
    exerciseId: string,
    setNumber: number,
    actualReps?: number,
    actualWeight?: number
  ): Promise<WorkoutSession | null> {
    const res = this.service.toggleSetComplete(exerciseId, setNumber, actualReps, actualWeight);
    this.syncFromService();
    return res;
  }

  public async updateSetActuals(
    exerciseId: string,
    setNumber: number,
    actualReps: number,
    actualWeight: number
  ): Promise<WorkoutSession | null> {
    const res = this.service.updateSetActuals(exerciseId, setNumber, actualReps, actualWeight);
    this.syncFromService();
    return res;
  }

  public setCurrentExerciseIndex(index: number): void {
    this.service.setCurrentExerciseIndex(index);
    this.syncFromService();
  }

  public tickSessionTimer(deltaSeconds: number = 1): void {
    this.service.tickSessionTimer(deltaSeconds);
    this.syncFromService();
  }

  public startRestTimer(seconds: number): void {
    this.service.startRestTimer(seconds);
    this.syncFromService();
  }

  public stopRestTimer(): void {
    this.service.stopRestTimer();
    this.syncFromService();
  }

  public async finishSession(): Promise<WorkoutHistoryRecord | null> {
    const res = this.service.finishSession();
    this.syncFromService();
    return res;
  }

  public async cancelSession(): Promise<void> {
    this.service.cancelSession();
    this.syncFromService();
  }

  public async clearHistory(): Promise<void> {
    this.service.clearHistory();
    this.syncFromService();
  }

  public async toggleExercise(exerciseId: string): Promise<Exercise | undefined> {
    if (this.state.activeSession) {
      // Toggle first set of exercise in active session
      this.service.toggleSetComplete(exerciseId, 1);
    }
    this.syncFromService();
    return undefined;
  }

  public async completeWorkoutSession(): Promise<void> {
    this.service.finishSession();
    this.syncFromService();
  }

  public async resetWorkout(): Promise<void> {
    this.service.cancelSession();
    this.syncFromService();
  }
}

export const gymStore = new GymStore();

export function useGymStore(): GymStoreState & GymStoreActions {
  const state = useSyncExternalStore(
    gymStore.subscribe,
    gymStore.getSnapshot,
    gymStore.getSnapshot
  );

  return {
    ...state,
    createWorkoutDay: (data) => gymStore.createWorkoutDay(data),
    updateWorkoutDay: (id, updates) => gymStore.updateWorkoutDay(id, updates),
    deleteWorkoutDay: (id) => gymStore.deleteWorkoutDay(id),
    reorderWorkoutDays: (orderedIds) => gymStore.reorderWorkoutDays(orderedIds),
    createExercise: (workoutDayId, data) => gymStore.createExercise(workoutDayId, data),
    updateExercise: (workoutDayId, exerciseId, updates) =>
      gymStore.updateExercise(workoutDayId, exerciseId, updates),
    deleteExercise: (workoutDayId, exerciseId) => gymStore.deleteExercise(workoutDayId, exerciseId),
    duplicateExercise: (workoutDayId, exerciseId) =>
      gymStore.duplicateExercise(workoutDayId, exerciseId),
    reorderExercises: (workoutDayId, orderedIds) =>
      gymStore.reorderExercises(workoutDayId, orderedIds),
    startSession: (workoutDayId) => gymStore.startSession(workoutDayId),
    toggleSetComplete: (exerciseId, setNumber, actualReps, actualWeight) =>
      gymStore.toggleSetComplete(exerciseId, setNumber, actualReps, actualWeight),
    updateSetActuals: (exerciseId, setNumber, actualReps, actualWeight) =>
      gymStore.updateSetActuals(exerciseId, setNumber, actualReps, actualWeight),
    setCurrentExerciseIndex: (index) => gymStore.setCurrentExerciseIndex(index),
    tickSessionTimer: (deltaSeconds) => gymStore.tickSessionTimer(deltaSeconds),
    startRestTimer: (seconds) => gymStore.startRestTimer(seconds),
    stopRestTimer: () => gymStore.stopRestTimer(),
    finishSession: () => gymStore.finishSession(),
    cancelSession: () => gymStore.cancelSession(),
    clearHistory: () => gymStore.clearHistory(),
    toggleExercise: (exerciseId) => gymStore.toggleExercise(exerciseId),
    completeWorkoutSession: () => gymStore.completeWorkoutSession(),
    resetWorkout: () => gymStore.resetWorkout(),
    refresh: () => gymStore.refresh(),
  };
}
