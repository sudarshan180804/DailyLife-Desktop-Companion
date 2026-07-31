import { storageService } from "./storageService";
import { eventBus } from "./eventBus";

/**
 * Model representing an achievement in the application.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

const STORAGE_KEY = "dailylife_achievements";

/**
 * Default initial achievements list.
 */
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_task",
    title: "First Step",
    description: "Complete your very first task",
    icon: "🎯",
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: "task_5",
    title: "Task Apprentice",
    description: "Complete 5 tasks",
    icon: "⚡",
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: "task_25",
    title: "Task Master",
    description: "Complete 25 tasks",
    icon: "🏆",
    unlocked: false,
    progress: 0,
    target: 25,
  },
  {
    id: "level_5",
    title: "Rising Adventurer",
    description: "Reach Level 5",
    icon: "⭐",
    unlocked: false,
    progress: 1,
    target: 5,
  },
  {
    id: "level_10",
    title: "Seasoned Hero",
    description: "Reach Level 10",
    icon: "🌟",
    unlocked: false,
    progress: 1,
    target: 10,
  },
  {
    id: "xp_1000",
    title: "XP Collector",
    description: "Earn a total of 1,000 XP",
    icon: "💎",
    unlocked: false,
    progress: 0,
    target: 1000,
  },
];

type AchievementListener = (achievements: Achievement[]) => void;

/**
 * AchievementService manages tracking, evaluation, unlocking, and persistence of achievements.
 * Automatically listens to EventBus events ('task:completed', 'xp:changed', 'level:up').
 */
export class AchievementService {
  private achievements: Achievement[];
  private totalCompletedTasksCount: number = 0;
  private listeners: Set<AchievementListener> = new Set();

  constructor() {
    this.achievements = INITIAL_ACHIEVEMENTS.map((a) => ({ ...a }));

    // Initialize state from StorageService
    this.initStorage();

    // Subscribe to EventBus events for automatic achievement evaluation
    eventBus.subscribe("task:completed", () => this.handleTaskCompleted());
    eventBus.subscribe("xp:changed", (payload) => this.handleXPChanged(payload));
    eventBus.subscribe("level:up", (payload) => this.handleLevelUp(payload));
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<Achievement[]>(STORAGE_KEY);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        this.achievements = INITIAL_ACHIEVEMENTS.map((def) => {
          const found = saved.find((s) => s.id === def.id);
          return found ? { ...def, ...found } : { ...def };
        });
      } else {
        await this.persist();
      }
    } catch (err) {
      console.error(
        "[AchievementService] Failed to load achievements from StorageService:",
        err
      );
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.save(STORAGE_KEY, this.achievements);
    } catch (err) {
      console.error(
        "[AchievementService] Failed to save achievements to StorageService:",
        err
      );
    }
  }

  private notifyListeners(): void {
    const copy = this.getAchievements();
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.error("[AchievementService] Error in listener callback:", err);
      }
    });
  }

  /**
   * Internal handler for 'task:completed' event.
   */
  private handleTaskCompleted(): void {
    this.totalCompletedTasksCount += 1;

    const taskAchievementIds = ["first_task", "task_5", "task_25"];
    let stateChanged = false;

    for (const id of taskAchievementIds) {
      const index = this.achievements.findIndex((a) => a.id === id);
      if (index === -1) continue;

      const achievement = this.achievements[index];
      if (achievement.unlocked) continue;

      const newProgress = Math.min(achievement.target, achievement.progress + 1);
      const isNowUnlocked = newProgress >= achievement.target;

      this.achievements[index] = {
        ...achievement,
        progress: newProgress,
        unlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked ? new Date().toISOString() : undefined,
      };

      stateChanged = true;
      const updated = this.achievements[index];

      eventBus.emit("achievement:progress", {
        achievementId: updated.id,
        progress: updated.progress,
        target: updated.target,
        achievement: updated,
      });

      if (isNowUnlocked) {
        eventBus.emit("achievement:unlocked", {
          achievementId: updated.id,
          achievement: updated,
        });
      }
    }

    if (stateChanged) {
      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Internal handler for 'xp:changed' event.
   */
  private handleXPChanged(payload?: {
    currentXp?: number;
    level?: number;
    totalXP?: number;
  }): void {
    if (!payload) return;

    let stateChanged = false;

    if (payload.totalXP !== undefined || payload.currentXp !== undefined) {
      const totalXP = payload.totalXP ?? payload.currentXp ?? 0;
      const index = this.achievements.findIndex((a) => a.id === "xp_1000");
      if (index !== -1) {
        const achievement = this.achievements[index];
        if (!achievement.unlocked) {
          const newProgress = Math.min(achievement.target, totalXP);
          const isNowUnlocked = newProgress >= achievement.target;

          if (newProgress !== achievement.progress || isNowUnlocked) {
            this.achievements[index] = {
              ...achievement,
              progress: newProgress,
              unlocked: isNowUnlocked,
              unlockedAt: isNowUnlocked ? new Date().toISOString() : undefined,
            };

            stateChanged = true;
            const updated = this.achievements[index];

            eventBus.emit("achievement:progress", {
              achievementId: updated.id,
              progress: updated.progress,
              target: updated.target,
              achievement: updated,
            });

            if (isNowUnlocked) {
              eventBus.emit("achievement:unlocked", {
                achievementId: updated.id,
                achievement: updated,
              });
            }
          }
        }
      }
    }

    if (payload.level !== undefined) {
      this.evaluateLevelAchievements(payload.level);
    }

    if (stateChanged) {
      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Internal handler for 'level:up' event.
   */
  private handleLevelUp(payload?: { newLevel?: number }): void {
    if (payload && payload.newLevel !== undefined) {
      this.evaluateLevelAchievements(payload.newLevel);
    }
  }

  private evaluateLevelAchievements(currentLevel: number): void {
    const levelAchievementIds = ["level_5", "level_10"];
    let stateChanged = false;

    for (const id of levelAchievementIds) {
      const index = this.achievements.findIndex((a) => a.id === id);
      if (index === -1) continue;

      const achievement = this.achievements[index];
      if (achievement.unlocked) continue;

      const newProgress = Math.min(achievement.target, currentLevel);
      const isNowUnlocked = newProgress >= achievement.target;

      if (newProgress !== achievement.progress || isNowUnlocked) {
        this.achievements[index] = {
          ...achievement,
          progress: newProgress,
          unlocked: isNowUnlocked,
          unlockedAt: isNowUnlocked ? new Date().toISOString() : undefined,
        };

        stateChanged = true;
        const updated = this.achievements[index];

        eventBus.emit("achievement:progress", {
          achievementId: updated.id,
          progress: updated.progress,
          target: updated.target,
          achievement: updated,
        });

        if (isNowUnlocked) {
          eventBus.emit("achievement:unlocked", {
            achievementId: updated.id,
            achievement: updated,
          });
        }
      }
    }

    if (stateChanged) {
      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Returns a copy of all registered achievements.
   */
  getAchievements(): Achievement[] {
    return this.achievements.map((a) => ({ ...a }));
  }

  /**
   * Retrieves an achievement by unique ID.
   *
   * @param id Achievement identifier.
   */
  getAchievement(id: string): Achievement | undefined {
    const found = this.achievements.find((a) => a.id === id);
    return found ? { ...found } : undefined;
  }

  /**
   * Returns all unlocked achievements.
   */
  getUnlocked(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked).map((a) => ({ ...a }));
  }

  /**
   * Returns all pending (locked) achievements.
   */
  getPending(): Achievement[] {
    return this.achievements.filter((a) => !a.unlocked).map((a) => ({ ...a }));
  }

  /**
   * Resets all achievement progress back to initial default state.
   */
  async reset(): Promise<void> {
    this.achievements = INITIAL_ACHIEVEMENTS.map((a) => ({ ...a }));
    this.totalCompletedTasksCount = 0;
    await this.persist();
    this.notifyListeners();
  }

  /**
   * Subscribes a listener to achievement changes.
   *
   * @param listener Callback function invoked when achievements change.
   * @returns Unsubscribe function.
   */
  subscribe(listener: AchievementListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/**
 * Global singleton instance of AchievementService.
 */
export const achievementService = new AchievementService();
