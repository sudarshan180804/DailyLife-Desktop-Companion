import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import { DEFAULT_BODY_STATS, DEFAULT_GYM_SUMMARY } from "../../data/gymData";
import {
  Exercise,
  ExerciseSet,
  WorkoutDay,
  WorkoutSession,
  WorkoutHistoryRecord,
  BodyStat,
  GymSummary,
  WeeklyScheduleDay,
  WeekDayName,
  GymDataPayload,
  TimelineItem,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.GYM;

const WEEKDAYS_ORDER: WeekDayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WEEKDAY_SHORT: Record<WeekDayName, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export class GymService {
  private workoutDays: WorkoutDay[] = [];
  private history: WorkoutHistoryRecord[] = [];
  private activeSession: WorkoutSession | null = null;
  private summary: GymSummary = { ...DEFAULT_GYM_SUMMARY };
  private bodyStats: BodyStat[] = [...DEFAULT_BODY_STATS];
  private isLoaded: boolean = false;

  constructor() {
    this.initStorage();
  }

  private notifyUpdated(): void {
    eventBus.emit("gym:updated", {
      exercises: this.getExercises(),
      timeline: this.getTimeline(),
      workoutDays: this.getWorkoutDays(),
      history: this.getHistory(),
    });
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<any>(STORAGE_KEY);
      // Migration & Validation check for Schema Version 2
      if (
        saved &&
        saved.version === 2 &&
        Array.isArray(saved.workoutDays)
      ) {
        this.workoutDays = saved.workoutDays;
        this.history = saved.history || [];
        this.activeSession = saved.activeSession || null;
        this.summary = saved.summary || { ...DEFAULT_GYM_SUMMARY };
        this.bodyStats = saved.bodyStats || [...DEFAULT_BODY_STATS];
      } else {
        // Migration from legacy mock structure v1 or empty initialization
        console.log("[GymService] Initializing clean empty Gym state (v2)...");
        this.workoutDays = [];
        this.history = [];
        this.activeSession = null;
        this.summary = { ...DEFAULT_GYM_SUMMARY };
        this.bodyStats = [...DEFAULT_BODY_STATS];
        await this.persist();
      }
      this.isLoaded = true;
      this.notifyUpdated();
    } catch (err) {
      console.error("[GymService] Failed to load gym data:", err);
      this.workoutDays = [];
      this.history = [];
      this.activeSession = null;
      this.summary = { ...DEFAULT_GYM_SUMMARY };
      this.bodyStats = [...DEFAULT_BODY_STATS];
    }
  }

  public async persist(): Promise<void> {
    try {
      const payload: GymDataPayload = {
        version: 2,
        workoutDays: this.workoutDays,
        history: this.history,
        activeSession: this.activeSession,
        summary: this.summary,
        bodyStats: this.bodyStats,
      };
      await storageService.save(STORAGE_KEY, payload);
    } catch (err) {
      console.error("[GymService] Failed to persist gym data:", err);
    }
  }

  // --- WORKOUT DAYS SCHEDULE CRUD ---

  getWorkoutDays(): WorkoutDay[] {
    return [...this.workoutDays].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  getWorkoutDay(id: string): WorkoutDay | undefined {
    return this.workoutDays.find((d) => d.id === id);
  }

  createWorkoutDay(data: {
    dayOfWeek: WeekDayName;
    title: string;
    enabled?: boolean;
    isRestDay?: boolean;
    description?: string;
    icon?: string;
  }): WorkoutDay {
    const newDay: WorkoutDay = {
      id: `wd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      dayOfWeek: data.dayOfWeek,
      title: data.title.trim() || "Workout Day",
      enabled: data.enabled !== undefined ? data.enabled : true,
      isRestDay: !!data.isRestDay,
      description: data.description || "",
      icon: data.icon || (data.isRestDay ? "🌙" : "🏋️"),
      exercises: [],
      orderIndex: this.workoutDays.length,
    };

    this.workoutDays.push(newDay);
    this.persist();
    this.notifyUpdated();
    notificationService.notify("success", `Created workout day: ${newDay.title}`);
    return newDay;
  }

  updateWorkoutDay(id: string, updates: Partial<WorkoutDay>): WorkoutDay | undefined {
    const idx = this.workoutDays.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;

    const current = this.workoutDays[idx];
    const updated: WorkoutDay = {
      ...current,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
    };

    this.workoutDays[idx] = updated;
    this.persist();
    this.notifyUpdated();
    return updated;
  }

  deleteWorkoutDay(id: string): boolean {
    const initialLen = this.workoutDays.length;
    this.workoutDays = this.workoutDays.filter((d) => d.id !== id);
    if (this.workoutDays.length !== initialLen) {
      this.reindexWorkoutDays();
      this.persist();
      this.notifyUpdated();
      notificationService.notify("info", "Deleted workout day");
      return true;
    }
    return false;
  }

  reorderWorkoutDays(orderedIds: string[]): void {
    const dayMap = new Map(this.workoutDays.map((d) => [d.id, d]));
    const newDays: WorkoutDay[] = [];

    orderedIds.forEach((id, index) => {
      const day = dayMap.get(id);
      if (day) {
        day.orderIndex = index;
        newDays.push(day);
        dayMap.delete(id);
      }
    });

    // Append any missing days
    dayMap.forEach((day) => {
      day.orderIndex = newDays.length;
      newDays.push(day);
    });

    this.workoutDays = newDays;
    this.persist();
    this.notifyUpdated();
  }

  private reindexWorkoutDays(): void {
    this.workoutDays.forEach((day, index) => {
      day.orderIndex = index;
    });
  }

  // --- EXERCISE CRUD WITHIN WORKOUT DAY ---

  createExercise(
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
  ): Exercise | undefined {
    const day = this.getWorkoutDay(workoutDayId);
    if (!day) return undefined;

    const setsList: ExerciseSet[] =
      data.setsList && data.setsList.length > 0
        ? data.setsList.map((s, idx) => ({
            id: s.id || `set_${Date.now()}_${idx}`,
            setNumber: idx + 1,
            targetReps: Number(s.targetReps) || 10,
            targetWeight: Number(s.targetWeight) || 0,
            completed: false,
          }))
        : [
            { id: `set_${Date.now()}_1`, setNumber: 1, targetReps: 10, targetWeight: 0, completed: false },
            { id: `set_${Date.now()}_2`, setNumber: 2, targetReps: 10, targetWeight: 0, completed: false },
            { id: `set_${Date.now()}_3`, setNumber: 3, targetReps: 10, targetWeight: 0, completed: false },
          ];

    const orderNumberStr = String(day.exercises.length + 1).padStart(2, "0");
    const restSecs = data.restTimeSeconds ?? 90;

    const newEx: Exercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      orderNumber: orderNumberStr,
      name: data.name.trim() || "New Exercise",
      category: data.category || "General",
      setsCount: setsList.length,
      setsList,
      repsDisplay: this.formatRepsDisplay(setsList),
      weightDisplay: this.formatWeightDisplay(setsList),
      xpReward: data.xpReward ?? 20,
      completed: false,
      targetedMuscles: data.targetedMuscles || [],
      instructions: data.instructions || [],
      tips: data.tips || [],
      restTimeSeconds: restSecs,
      restTimeDisplay: this.formatRestTimeDisplay(restSecs),
      equipment: data.equipment || "Gym Equipment",
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      durationMinutes: data.durationMinutes,
      // Legacy getters:
      sets: setsList.length,
      reps: this.formatRepsDisplay(setsList),
      weight: this.formatWeightDisplay(setsList),
      restTime: this.formatRestTimeDisplay(restSecs),
    };

    day.exercises.push(newEx);
    this.persist();
    this.notifyUpdated();
    notificationService.notify("success", `Added exercise: ${newEx.name}`);
    return newEx;
  }

  updateExercise(
    workoutDayId: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ): Exercise | undefined {
    const day = this.getWorkoutDay(workoutDayId);
    if (!day) return undefined;

    const idx = day.exercises.findIndex((e) => e.id === exerciseId);
    if (idx === -1) return undefined;

    const current = day.exercises[idx];
    const setsList = updates.setsList || current.setsList || [];

    const updatedSets = setsList.map((s, i) => ({
      ...s,
      setNumber: i + 1,
    }));

    const restSecs = updates.restTimeSeconds ?? current.restTimeSeconds ?? 90;

    const updated: Exercise = {
      ...current,
      ...updates,
      setsCount: updatedSets.length,
      setsList: updatedSets,
      repsDisplay: this.formatRepsDisplay(updatedSets),
      weightDisplay: this.formatWeightDisplay(updatedSets),
      restTimeSeconds: restSecs,
      restTimeDisplay: this.formatRestTimeDisplay(restSecs),
      sets: updatedSets.length,
      reps: this.formatRepsDisplay(updatedSets),
      weight: this.formatWeightDisplay(updatedSets),
      restTime: this.formatRestTimeDisplay(restSecs),
    };

    day.exercises[idx] = updated;
    this.persist();
    this.notifyUpdated();
    return updated;
  }

  deleteExercise(workoutDayId: string, exerciseId: string): boolean {
    const day = this.getWorkoutDay(workoutDayId);
    if (!day) return false;

    const initLen = day.exercises.length;
    day.exercises = day.exercises.filter((e) => e.id !== exerciseId);
    if (day.exercises.length !== initLen) {
      this.reindexExercises(day);
      this.persist();
      this.notifyUpdated();
      notificationService.notify("info", "Deleted exercise");
      return true;
    }
    return false;
  }

  duplicateExercise(workoutDayId: string, exerciseId: string): Exercise | undefined {
    const day = this.getWorkoutDay(workoutDayId);
    if (!day) return undefined;

    const exIndex = day.exercises.findIndex((e) => e.id === exerciseId);
    if (exIndex === -1) return undefined;

    const original = day.exercises[exIndex];
    const clonedSets: ExerciseSet[] = original.setsList.map((s, i) => ({
      ...s,
      id: `set_${Date.now()}_${i}`,
      completed: false,
    }));

    const duplicated: Exercise = {
      ...original,
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Copy)`,
      completed: false,
      setsList: clonedSets,
    };

    day.exercises.splice(exIndex + 1, 0, duplicated);
    this.reindexExercises(day);
    this.persist();
    this.notifyUpdated();
    notificationService.notify("success", `Duplicated exercise: ${original.name}`);
    return duplicated;
  }

  reorderExercises(workoutDayId: string, orderedIds: string[]): void {
    const day = this.getWorkoutDay(workoutDayId);
    if (!day) return;

    const exMap = new Map(day.exercises.map((e) => [e.id, e]));
    const newExercises: Exercise[] = [];

    orderedIds.forEach((id) => {
      const ex = exMap.get(id);
      if (ex) {
        newExercises.push(ex);
        exMap.delete(id);
      }
    });

    exMap.forEach((ex) => newExercises.push(ex));
    day.exercises = newExercises;
    this.reindexExercises(day);
    this.persist();
    this.notifyUpdated();
  }

  private reindexExercises(day: WorkoutDay): void {
    day.exercises.forEach((ex, idx) => {
      ex.orderNumber = String(idx + 1).padStart(2, "0");
    });
  }

  // --- ACTIVE WORKOUT SESSION ---

  startSession(workoutDayId: string): WorkoutSession | undefined {
    const day = this.getWorkoutDay(workoutDayId);
    if (!day) return undefined;

    const clonedExercises: Exercise[] = day.exercises.map((ex) => ({
      ...ex,
      completed: false,
      setsList: ex.setsList.map((s) => ({
        ...s,
        actualReps: s.targetReps,
        actualWeight: s.targetWeight,
        completed: false,
      })),
    }));

    const session: WorkoutSession = {
      id: `sess_${Date.now()}`,
      workoutDayId: day.id,
      workoutDayTitle: day.title,
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      elapsedSeconds: 0,
      restTimerSeconds: 0,
      isRestTimerActive: false,
      exercises: clonedExercises,
      isFinished: false,
    };

    this.activeSession = session;
    this.persist();
    this.notifyUpdated();
    eventBus.emit("gym:sessionStarted", { session });
    notificationService.notify("info", `Started Workout: ${day.title}`, "Session Started");
    return session;
  }

  getActiveSession(): WorkoutSession | null {
    return this.activeSession;
  }

  toggleSetComplete(
    exerciseId: string,
    setNumber: number,
    actualReps?: number,
    actualWeight?: number
  ): WorkoutSession | null {
    if (!this.activeSession) return null;

    const exIndex = this.activeSession.exercises.findIndex((e) => e.id === exerciseId);
    if (exIndex === -1) return this.activeSession;

    const exercise = this.activeSession.exercises[exIndex];
    const setIndex = exercise.setsList.findIndex((s) => s.setNumber === setNumber);
    if (setIndex === -1) return this.activeSession;

    const setItem = exercise.setsList[setIndex];
    const isNowCompleted = !setItem.completed;

    setItem.completed = isNowCompleted;
    if (actualReps !== undefined) setItem.actualReps = actualReps;
    if (actualWeight !== undefined) setItem.actualWeight = actualWeight;

    if (isNowCompleted) {
      // Start rest timer automatically
      this.activeSession.restTimerSeconds = exercise.restTimeSeconds || 60;
      this.activeSession.isRestTimerActive = true;
    }

    // Check if all sets completed for this exercise
    const allSetsComplete = exercise.setsList.every((s) => s.completed);
    exercise.completed = allSetsComplete;

    this.persist();
    this.notifyUpdated();
    return this.activeSession;
  }

  updateSetActuals(
    exerciseId: string,
    setNumber: number,
    actualReps: number,
    actualWeight: number
  ): WorkoutSession | null {
    if (!this.activeSession) return null;

    const exercise = this.activeSession.exercises.find((e) => e.id === exerciseId);
    if (!exercise) return this.activeSession;

    const setItem = exercise.setsList.find((s) => s.setNumber === setNumber);
    if (setItem) {
      setItem.actualReps = actualReps;
      setItem.actualWeight = actualWeight;
      this.persist();
      this.notifyUpdated();
    }
    return this.activeSession;
  }

  setCurrentExerciseIndex(index: number): void {
    if (!this.activeSession) return;
    if (index >= 0 && index < this.activeSession.exercises.length) {
      this.activeSession.currentExerciseIndex = index;
      this.persist();
      this.notifyUpdated();
    }
  }

  tickSessionTimer(deltaSeconds: number = 1): void {
    if (!this.activeSession || this.activeSession.isFinished) return;

    this.activeSession.elapsedSeconds += deltaSeconds;

    if (this.activeSession.isRestTimerActive) {
      this.activeSession.restTimerSeconds = Math.max(
        0,
        this.activeSession.restTimerSeconds - deltaSeconds
      );
      if (this.activeSession.restTimerSeconds === 0) {
        this.activeSession.isRestTimerActive = false;
        notificationService.notify("info", "Rest time complete! Ready for next set.", "Rest Timer");
      }
    }

    this.persist();
    this.notifyUpdated();
  }

  startRestTimer(seconds: number): void {
    if (!this.activeSession) return;
    this.activeSession.restTimerSeconds = seconds;
    this.activeSession.isRestTimerActive = true;
    this.persist();
    this.notifyUpdated();
  }

  stopRestTimer(): void {
    if (!this.activeSession) return;
    this.activeSession.isRestTimerActive = false;
    this.persist();
    this.notifyUpdated();
  }

  finishSession(): WorkoutHistoryRecord | null {
    if (!this.activeSession) return null;

    const session = this.activeSession;
    const completedExercises = session.exercises.filter((e) => e.completed);

    let totalXpEarned = completedExercises.reduce((sum, e) => sum + e.xpReward, 0) + 50; // +50 bonus session XP
    const coinsEarned = 25; // +25 bonus coins

    const historyRecord: WorkoutHistoryRecord = {
      id: `hist_${Date.now()}`,
      date: new Date().toISOString(),
      workoutDayId: session.workoutDayId,
      workoutDayTitle: session.workoutDayTitle,
      durationSeconds: session.elapsedSeconds,
      completedExercisesCount: completedExercises.length,
      totalExercisesCount: session.exercises.length,
      xpEarned: totalXpEarned,
      coinsEarned: coinsEarned,
      exercisesPerformed: session.exercises.map((e) => ({
        exerciseId: e.id,
        name: e.name,
        completed: e.completed,
        sets: e.setsList.map((s) => ({
          setNumber: s.setNumber,
          targetReps: s.targetReps,
          targetWeight: s.targetWeight,
          actualReps: s.actualReps ?? s.targetReps,
          actualWeight: s.actualWeight ?? s.targetWeight,
          completed: s.completed,
        })),
      })),
    };

    // Push to history
    this.history.unshift(historyRecord);

    // Award XP and Coins
    xpService.awardXP(totalXpEarned, `Completed workout: ${session.workoutDayTitle}`);
    profileService.addCoins(coinsEarned);

    // Update Summary Stats
    this.summary.streakDays += 1;
    this.summary.weeklyWorkoutsCount += 1;
    this.summary.totalXpEarned += totalXpEarned;

    // Clear active session
    this.activeSession = null;

    this.persist();
    eventBus.emit("gym:sessionCompleted", {
      workoutId: session.workoutDayId,
      totalXp: totalXpEarned,
      bonusCoins: coinsEarned,
      historyRecord,
    });
    this.notifyUpdated();

    notificationService.notify(
      "achievement",
      `🏆 ${session.workoutDayTitle} Cleared! (+${totalXpEarned} XP, +${coinsEarned} Coins)`,
      "Workout Completed!"
    );

    return historyRecord;
  }

  cancelSession(): void {
    if (!this.activeSession) return;
    this.activeSession = null;
    this.persist();
    this.notifyUpdated();
  }

  // --- HISTORY & SCHEDULE HELPERS ---

  getHistory(): WorkoutHistoryRecord[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
    this.persist();
    this.notifyUpdated();
  }

  getWeeklySchedule(): WeeklyScheduleDay[] {
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const todayNameMap: WeekDayName[] = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayFullDayName = todayNameMap[todayIndex];

    return WEEKDAYS_ORDER.map((dayName) => {
      const configuredDay = this.workoutDays.find(
        (d) => d.dayOfWeek.toLowerCase() === dayName.toLowerCase()
      );

      let status: "completed" | "rest" | "today" | "upcoming" | "disabled" = "upcoming";

      if (!configuredDay || !configuredDay.enabled) {
        status = "disabled";
      } else if (configuredDay.isRestDay) {
        status = "rest";
      } else if (dayName === todayFullDayName) {
        status = "today";
      }

      return {
        day: WEEKDAY_SHORT[dayName],
        fullDayName: dayName,
        status,
        workoutDayId: configuredDay?.id,
        title: configuredDay?.title || (configuredDay?.isRestDay ? "Rest Day" : "Not Set"),
      };
    });
  }

  getExercises(): Exercise[] {
    if (this.workoutDays.length === 0) return [];
    return this.workoutDays[0].exercises || [];
  }

  getExercise(id: string): Exercise | undefined {
    for (const day of this.workoutDays) {
      const found = day.exercises.find((e) => e.id === id);
      if (found) return found;
    }
    return undefined;
  }

  getTimeline(): TimelineItem[] {
    const exercises = this.getExercises();
    return exercises.map((ex, idx) => ({
      id: `tl_${ex.id}`,
      timeOffset: `0:${String(idx * 15).padStart(2, "0")}`,
      type: "exercise",
      title: ex.name,
      subtitle: `${ex.setsCount} Sets • ${ex.repsDisplay}`,
      exerciseId: ex.id,
      completed: ex.completed,
      orderNumber: ex.orderNumber,
    }));
  }

  getBodyStats(): BodyStat[] {
    return [...this.bodyStats];
  }

  getGymSummary(): GymSummary {
    return { ...this.summary };
  }

  // --- HELPERS ---

  private formatRepsDisplay(setsList: ExerciseSet[]): string {
    if (!setsList || setsList.length === 0) return "0 Reps";
    const reps = setsList.map((s) => s.targetReps);
    const allSame = reps.every((r) => r === reps[0]);
    if (allSame) return `${reps[0]} Reps`;
    return `${reps.join(", ")} Reps`;
  }

  private formatWeightDisplay(setsList: ExerciseSet[]): string {
    if (!setsList || setsList.length === 0) return "Bodyweight";
    const weights = setsList.map((s) => s.targetWeight);
    const allZero = weights.every((w) => w === 0);
    if (allZero) return "Bodyweight";

    const allSame = weights.every((w) => w === weights[0]);
    if (allSame) return `${weights[0]} kg`;
    return `${weights.map((w) => (w === 0 ? "BW" : `${w}kg`)).join(", ")}`;
  }

  private formatRestTimeDisplay(seconds: number): string {
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    if (rem === 0) return `${mins} min`;
    return `${mins}m ${rem}s`;
  }
}

export const gymServiceModule = new GymService();
