import { storageService } from "./storageService";
import { eventBus } from "./eventBus";
import { STORAGE_KEYS } from "../constants/appConstants";

/**
 * Core UserProgress model.
 */
export interface UserProgress {
  level: number;
  currentXP: number;
  totalXP: number;
}

/**
 * Legacy XPState interface retained for backward compatibility with existing components.
 */
export interface XPState {
  totalXp: number;
  todayXp: number;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  bestStreakDays: number;
  lastDate: string;
}

const STORAGE_KEY = STORAGE_KEYS.SETTINGS ? "dailylife_xp" : "dailylife_xp";
const BASE_XP_PER_LEVEL = 100;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Scalable mathematical level progression calculation.
 * Infinitely scales level calculation without hardcoded level tables.
 *
 * @param totalXP Total cumulative experience points.
 * @param baseXP Base XP required per level step.
 */
export function calculateLevelFromXP(
  totalXP: number,
  baseXP: number = BASE_XP_PER_LEVEL
): {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
} {
  const safeTotal = Math.max(0, Math.floor(totalXP));
  const level = Math.floor(safeTotal / baseXP) + 1;
  const currentXP = safeTotal % baseXP;
  const xpToNextLevel = baseXP - currentXP;

  return { level, currentXP, xpToNextLevel };
}

type LegacyXPListener = (state: XPState) => void;

/**
 * XPService handles experience points, user leveling, and progress persistence.
 * Uses StorageService for persistence and EventBus for event distribution.
 */
export class XPService {
  private progress: UserProgress;
  private todayXP: number = 120;
  private streakDays: number = 7;
  private bestStreakDays: number = 14;
  private lastDate: string = getTodayString();
  private legacyListeners: Set<LegacyXPListener> = new Set();

  constructor(initialTotalXP: number = 450) {
    const calc = calculateLevelFromXP(initialTotalXP);
    this.progress = {
      level: calc.level,
      currentXP: calc.currentXP,
      totalXP: initialTotalXP,
    };

    // Load persisted state asynchronously from StorageService
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<any>(STORAGE_KEY);
      if (saved) {
        const totalXP = saved.totalXP ?? saved.totalXp ?? 450;
        const calc = calculateLevelFromXP(totalXP);
        this.progress = {
          level: calc.level,
          currentXP: calc.currentXP,
          totalXP,
        };
        this.todayXP = saved.todayXP ?? saved.todayXp ?? 120;
        this.streakDays = saved.streakDays ?? 7;
        this.bestStreakDays = saved.bestStreakDays ?? 14;
        this.lastDate = saved.lastDate ?? getTodayString();

        const today = getTodayString();
        if (this.lastDate !== today) {
          this.todayXP = 0;
          this.lastDate = today;
          this.persist();
        }

        this.notifyLegacyListeners();
      } else {
        this.persist();
      }
    } catch (err) {
      console.error("[XPService] Failed to initialize from StorageService:", err);
    }
  }

  private persist(): void {
    const payload = {
      ...this.progress,
      totalXp: this.progress.totalXP,
      currentXp: this.progress.currentXP,
      todayXP: this.todayXP,
      todayXp: this.todayXP,
      nextLevelXp: BASE_XP_PER_LEVEL,
      streakDays: this.streakDays,
      bestStreakDays: this.bestStreakDays,
      lastDate: this.lastDate,
    };
    storageService.save(STORAGE_KEY, payload);
  }

  private notifyLegacyListeners(): void {
    const legacyState = this.getXPState();
    this.legacyListeners.forEach((listener) => {
      try {
        listener(legacyState);
      } catch (err) {
        console.error("[XPService] Error in legacy listener:", err);
      }
    });
  }

  /**
   * Returns current user progress model containing level, currentXP, and totalXP.
   */
  getProgress(): UserProgress {
    return { ...this.progress };
  }

  /**
   * Returns current user level.
   */
  getLevel(): number {
    return this.progress.level;
  }

  /**
   * Returns current XP within the current level progression.
   */
  getCurrentXP(): number {
    return this.progress.currentXP;
  }

  /**
   * Returns total cumulative XP earned by the user.
   */
  getTotalXP(): number {
    return this.progress.totalXP;
  }

  /**
   * Returns remaining XP required to reach the next level.
   */
  getXPToNextLevel(): number {
    const calc = calculateLevelFromXP(this.progress.totalXP);
    return calc.xpToNextLevel;
  }

  /**
   * Awards XP to the user and updates level calculations.
   * Emits 'xp:changed' and optional 'level:up' events via EventBus.
   *
   * @param amount Amount of XP to award.
   * @param reason Optional context or description for the award.
   * @returns Updated UserProgress object.
   */
  awardXP(amount: number, reason?: string): UserProgress {
    if (amount <= 0) return this.getProgress();

    const oldLevel = this.progress.level;
    const newTotal = this.progress.totalXP + amount;
    const calc = calculateLevelFromXP(newTotal);

    this.progress = {
      level: calc.level,
      currentXP: calc.currentXP,
      totalXP: newTotal,
    };
    this.todayXP += amount;

    this.persist();

    // Emit eventBus events
    eventBus.emit("xp:changed", {
      currentXp: this.progress.currentXP,
      level: this.progress.level,
      delta: amount,
      reason,
    });

    if (calc.level > oldLevel) {
      eventBus.emit("level:up", {
        oldLevel,
        newLevel: calc.level,
        currentXP: calc.currentXP,
        totalXP: newTotal,
      });
    }

    this.notifyLegacyListeners();
    return this.getProgress();
  }

  /**
   * Deducts XP from the user.
   * Emits 'xp:changed' event via EventBus.
   *
   * @param amount Amount of XP to remove.
   * @returns Updated UserProgress object.
   */
  removeXP(amount: number): UserProgress {
    if (amount <= 0) return this.getProgress();

    const newTotal = Math.max(0, this.progress.totalXP - amount);
    const calc = calculateLevelFromXP(newTotal);

    this.progress = {
      level: calc.level,
      currentXP: calc.currentXP,
      totalXP: newTotal,
    };
    this.todayXP = Math.max(0, this.todayXP - amount);

    this.persist();

    eventBus.emit("xp:changed", {
      currentXp: this.progress.currentXP,
      level: this.progress.level,
      delta: -amount,
    });

    this.notifyLegacyListeners();
    return this.getProgress();
  }

  /**
   * Directly sets the total XP value.
   * Emits 'xp:changed' and optional 'level:up' events via EventBus.
   *
   * @param value Target total XP value.
   * @returns Updated UserProgress object.
   */
  setXP(value: number): UserProgress {
    const oldLevel = this.progress.level;
    const newTotal = Math.max(0, value);
    const calc = calculateLevelFromXP(newTotal);

    const delta = newTotal - this.progress.totalXP;
    this.progress = {
      level: calc.level,
      currentXP: calc.currentXP,
      totalXP: newTotal,
    };

    this.persist();

    eventBus.emit("xp:changed", {
      currentXp: this.progress.currentXP,
      level: this.progress.level,
      delta,
    });

    if (calc.level > oldLevel) {
      eventBus.emit("level:up", {
        oldLevel,
        newLevel: calc.level,
        currentXP: calc.currentXP,
        totalXP: newTotal,
      });
    }

    this.notifyLegacyListeners();
    return this.getProgress();
  }

  /**
   * Resets user progress back to zero.
   * Emits 'xp:changed' event via EventBus.
   *
   * @returns Reset UserProgress object.
   */
  reset(): UserProgress {
    this.progress = {
      level: 1,
      currentXP: 0,
      totalXP: 0,
    };
    this.todayXP = 0;

    this.persist();

    eventBus.emit("xp:changed", {
      currentXp: 0,
      level: 1,
      delta: 0,
      reason: "reset",
    });

    this.notifyLegacyListeners();
    return this.getProgress();
  }

  // --- Legacy Methods for Backward Compatibility ---

  /**
   * Legacy getter returning complete XPState structure.
   */
  getXPState(): XPState {
    return {
      totalXp: this.progress.totalXP,
      todayXp: this.todayXP,
      level: this.progress.level,
      currentXp: this.progress.currentXP,
      nextLevelXp: BASE_XP_PER_LEVEL,
      streakDays: this.streakDays,
      bestStreakDays: this.bestStreakDays,
      lastDate: this.lastDate,
    };
  }

  /**
   * Legacy alias for awardXP matching existing addXP interface.
   */
  addXP(amount: number): XPState {
    this.awardXP(amount);
    return this.getXPState();
  }

  /**
   * Legacy subscription listener support for existing UI components.
   */
  subscribe(listener: LegacyXPListener): () => void {
    this.legacyListeners.add(listener);
    return () => this.legacyListeners.delete(listener);
  }
}

/**
 * Global singleton instance of XPService for application-wide progression management.
 */
export const xpService = new XPService();
