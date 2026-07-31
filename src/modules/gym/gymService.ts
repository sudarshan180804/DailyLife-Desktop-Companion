import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import {
  MOCK_EXERCISES,
  MOCK_TIMELINE,
  MOCK_BODY_STATS,
  MOCK_GYM_SUMMARY,
  WEEKLY_SCHEDULE,
} from "../../data/gymData";
import {
  Exercise,
  TimelineItem,
  BodyStat,
  GymSummary,
  WeeklyScheduleDay,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.GYM;

export interface GymDataPayload {
  exercises: Exercise[];
  timeline: TimelineItem[];
  bodyStats: BodyStat[];
  summary: GymSummary;
}

/**
 * Modular GymService managing workout routines, exercises, timeline progress,
 * XP & coin rewards, StorageService persistence, and EventBus emissions.
 */
export class GymService {
  private exercises: Exercise[] = [];
  private timeline: TimelineItem[] = [];
  private bodyStats: BodyStat[] = [];
  private summary: GymSummary = { ...MOCK_GYM_SUMMARY };
  private schedule: WeeklyScheduleDay[] = [...WEEKLY_SCHEDULE];

  constructor() {
    this.exercises = MOCK_EXERCISES.map((e) => ({
      ...e,
      targetedMuscles: e.targetedMuscles.map((m) => ({ ...m })),
      instructions: [...e.instructions],
      tips: [...e.tips],
    }));
    this.timeline = MOCK_TIMELINE.map((t) => ({ ...t }));
    this.bodyStats = MOCK_BODY_STATS.map((b) => ({ ...b }));
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<GymDataPayload>(STORAGE_KEY);
      if (saved && saved.exercises && Array.isArray(saved.exercises)) {
        this.exercises = saved.exercises;
        this.timeline = saved.timeline || this.timeline;
        this.bodyStats = saved.bodyStats || this.bodyStats;
        this.summary = saved.summary || this.summary;
      } else {
        await this.persist();
      }
    } catch (err) {
      console.error("[GymService] Failed to load gym data from StorageService:", err);
    }
  }

  private async persist(): Promise<void> {
    try {
      const payload: GymDataPayload = {
        exercises: this.exercises,
        timeline: this.timeline,
        bodyStats: this.bodyStats,
        summary: this.summary,
      };
      await storageService.save(STORAGE_KEY, payload);
    } catch (err) {
      console.error("[GymService] Failed to persist gym data:", err);
    }
  }

  /**
   * Returns list of current workout exercises.
   */
  getExercises(): Exercise[] {
    return [...this.exercises];
  }

  /**
   * Retrieves a specific exercise by ID.
   *
   * @param id Unique exercise identifier.
   */
  getExercise(id: string): Exercise | undefined {
    return this.exercises.find((e) => e.id === id);
  }

  /**
   * Returns current workout timeline.
   */
  getTimeline(): TimelineItem[] {
    return [...this.timeline];
  }

  /**
   * Returns player body/warrior stats.
   */
  getBodyStats(): BodyStat[] {
    return [...this.bodyStats];
  }

  /**
   * Returns gym summary statistics.
   */
  getGymSummary(): GymSummary {
    return { ...this.summary };
  }

  /**
   * Returns weekly schedule training status.
   */
  getWeeklySchedule(): WeeklyScheduleDay[] {
    return [...this.schedule];
  }

  /**
   * Toggles exercise completed status.
   * Automatically awards exercise XP and coins, updates timeline state,
   * checks session 100% completion, and emits 'gym:exerciseCompleted'.
   *
   * @param exerciseId Target exercise identifier.
   */
  toggleExercise(exerciseId: string): Exercise | undefined {
    const index = this.exercises.findIndex((e) => e.id === exerciseId);
    if (index === -1) return undefined;

    const target = this.exercises[index];
    const isNowCompleted = !target.completed;
    const updated: Exercise = { ...target, completed: isNowCompleted };
    this.exercises[index] = updated;

    // Synchronize timeline item for this exercise
    this.timeline = this.timeline.map((item) => {
      if (item.exerciseId === exerciseId) {
        return { ...item, completed: isNowCompleted };
      }
      return item;
    });

    if (isNowCompleted) {
      // Award exercise XP reward
      xpService.awardXP(target.xpReward, `Completed exercise: ${target.name}`);
      // Award +5 coins per exercise
      profileService.addCoins(5);

      this.summary.totalXpEarned += target.xpReward;

      notificationService.notify(
        "success",
        `💪 Completed ${target.name} (+${target.xpReward} XP, +5 Coins)`,
        "Exercise Complete"
      );

      eventBus.emit("gym:exerciseCompleted", {
        exerciseId: target.id,
        xpReward: target.xpReward,
        exercise: updated,
      });
    } else {
      // Deduct XP if uncompleted
      xpService.removeXP(target.xpReward);
      this.summary.totalXpEarned = Math.max(0, this.summary.totalXpEarned - target.xpReward);
    }

    // Check if entire workout session is now 100% complete
    const totalExercises = this.exercises.length;
    const completedCount = this.exercises.filter((e) => e.completed).length;

    if (isNowCompleted && completedCount === totalExercises) {
      this.completeWorkoutSession();
    }

    this.persist();
    eventBus.emit("gym:updated", {
      exercises: [...this.exercises],
      timeline: [...this.timeline],
    });

    return updated;
  }

  /**
   * Completes the entire workout session, awarding bonus XP + coins.
   * Emits 'gym:sessionCompleted' event via EventBus.
   */
  completeWorkoutSession(): void {
    const bonusXp = 100;
    const bonusCoins = 50;

    xpService.awardXP(bonusXp, "Completed full Push Day workout session!");
    profileService.addCoins(bonusCoins);

    this.summary.weeklyWorkoutsCount += 1;
    this.summary.streakDays += 1;

    notificationService.notify(
      "achievement",
      `🏆 Push Day Session Cleared! (+${bonusXp} Bonus XP, +${bonusCoins} Coins)`,
      "Workout Quest Cleared!"
    );

    eventBus.emit("gym:sessionCompleted", {
      workoutId: "push-day",
      totalXp: bonusXp,
      bonusCoins,
    });
  }

  /**
   * Resets current workout exercises to uncompleted state.
   */
  resetWorkout(): void {
    this.exercises = this.exercises.map((e) => ({ ...e, completed: false }));
    this.timeline = this.timeline.map((t) => ({ ...t, completed: false }));
    this.persist();

    eventBus.emit("gym:updated", {
      exercises: [...this.exercises],
      timeline: [...this.timeline],
    });
  }
}

/**
 * Global singleton instance of GymService.
 */
export const gymServiceModule = new GymService();
