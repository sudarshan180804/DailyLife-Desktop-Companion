import { storageService } from "./storageService";
import { eventBus } from "./eventBus";
import { STORAGE_KEYS } from "../constants/appConstants";

/**
 * Statistics tracked within the user's profile.
 */
export interface ProfileStats {
  tasksCompleted: number;
  achievementsUnlocked: number;
  streakDays: number;
  bestStreakDays: number;
  projectsCompleted: number;
}

/**
 * Core UserProfile data model.
 */
export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  currentXP: number;
  totalXP: number;
  coins: number;
  stats: ProfileStats;
}

const STORAGE_KEY = STORAGE_KEYS.PROFILE;

/**
 * Default initial profile state.
 */
export const INITIAL_PROFILE: UserProfile = {
  name: "Sudarshan",
  avatar: "natsu-profile.png",
  level: 5,
  currentXP: 50,
  totalXP: 450,
  coins: 120,
  stats: {
    tasksCompleted: 3,
    achievementsUnlocked: 0,
    streakDays: 7,
    bestStreakDays: 14,
    projectsCompleted: 1,
  },
};

type ProfileListener = (profile: UserProfile) => void;

/**
 * ProfileService aggregates player data (name, avatar, level, XP, coins, stats),
 * listens to domain events, auto-persists updates via StorageService, and emits 'profile:updated'.
 */
export class ProfileService {
  private profile: UserProfile;
  private listeners: Set<ProfileListener> = new Set();

  constructor() {
    this.profile = {
      ...INITIAL_PROFILE,
      stats: { ...INITIAL_PROFILE.stats },
    };

    // Load persisted state from StorageService
    this.initStorage();

    // Subscribe to domain events via EventBus
    eventBus.subscribe("xp:changed", (payload) => this.handleXPChanged(payload));
    eventBus.subscribe("level:up", (payload) => this.handleLevelUp(payload));
    eventBus.subscribe("task:completed", () => this.handleTaskCompleted());
    eventBus.subscribe("achievement:unlocked", () => this.handleAchievementUnlocked());
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<UserProfile>(STORAGE_KEY);
      if (saved) {
        this.profile = {
          ...INITIAL_PROFILE,
          ...saved,
          stats: {
            ...INITIAL_PROFILE.stats,
            ...(saved.stats || {}),
          },
        };
      } else {
        await this.persist();
      }
    } catch (err) {
      console.error(
        "[ProfileService] Failed to load profile from StorageService:",
        err
      );
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.save(STORAGE_KEY, this.profile);
    } catch (err) {
      console.error(
        "[ProfileService] Failed to save profile to StorageService:",
        err
      );
    }
  }

  private notify(): void {
    const current = this.getProfile();
    eventBus.emit("profile:updated", { profile: current });

    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error("[ProfileService] Error in listener callback:", err);
      }
    });
  }

  private handleXPChanged(payload?: any): void {
    if (!payload) return;

    let updated = false;
    if (payload.currentXp !== undefined && payload.currentXp !== this.profile.currentXP) {
      this.profile.currentXP = payload.currentXp;
      updated = true;
    }
    if (payload.level !== undefined && payload.level !== this.profile.level) {
      this.profile.level = payload.level;
      updated = true;
    }

    if (updated) {
      this.persist();
      this.notify();
    }
  }

  private handleLevelUp(payload?: any): void {
    if (!payload) return;

    this.profile.level = payload.newLevel || this.profile.level;
    this.profile.currentXP = payload.currentXP ?? this.profile.currentXP;
    this.profile.totalXP = payload.totalXP ?? this.profile.totalXP;

    // Award +50 coins for leveling up!
    this.profile.coins += 50;

    this.persist();
    this.notify();
  }

  private handleTaskCompleted(): void {
    this.profile.stats.tasksCompleted += 1;
    // Award +10 coins for completing a task
    this.profile.coins += 10;

    this.persist();
    this.notify();
  }

  private handleAchievementUnlocked(): void {
    this.profile.stats.achievementsUnlocked += 1;
    // Award +25 coins for unlocking an achievement
    this.profile.coins += 25;

    this.persist();
    this.notify();
  }

  /**
   * Returns a copy of the current UserProfile object.
   */
  getProfile(): UserProfile {
    return {
      ...this.profile,
      stats: { ...this.profile.stats },
    };
  }

  /**
   * Updates fields of the user profile and persists changes.
   *
   * @param updates Object containing profile property updates.
   * @returns Updated UserProfile object.
   */
  updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.profile = {
      ...this.profile,
      ...updates,
      stats: updates.stats
        ? { ...this.profile.stats, ...updates.stats }
        : this.profile.stats,
    };

    this.persist();
    this.notify();
    return this.getProfile();
  }

  /**
   * Updates profile statistics fields.
   *
   * @param statsUpdates Partial stats object.
   * @returns Updated UserProfile object.
   */
  updateStats(statsUpdates: Partial<ProfileStats>): UserProfile {
    this.profile.stats = {
      ...this.profile.stats,
      ...statsUpdates,
    };

    this.persist();
    this.notify();
    return this.getProfile();
  }

  /**
   * Adds coins to the player's balance.
   *
   * @param amount Number of coins to add.
   * @returns New coin total.
   */
  addCoins(amount: number): number {
    if (amount <= 0) return this.profile.coins;

    this.profile.coins += Math.floor(amount);
    this.persist();
    this.notify();
    return this.profile.coins;
  }

  /**
   * Deducts coins from the player's balance if sufficient funds exist.
   *
   * @param amount Number of coins to deduct.
   * @returns True if successful, false if insufficient coins.
   */
  removeCoins(amount: number): boolean {
    if (amount <= 0 || this.profile.coins < amount) {
      return false;
    }

    this.profile.coins -= Math.floor(amount);
    this.persist();
    this.notify();
    return true;
  }

  /**
   * Resets profile back to default initial values.
   */
  async reset(): Promise<UserProfile> {
    this.profile = {
      ...INITIAL_PROFILE,
      stats: { ...INITIAL_PROFILE.stats },
    };

    await this.persist();
    this.notify();
    return this.getProfile();
  }

  /**
   * Subscribes a listener to profile state updates.
   *
   * @param listener Callback function receiving UserProfile updates.
   * @returns Cleanup function to unsubscribe.
   */
  subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/**
 * Global singleton instance of ProfileService.
 */
export const profileService = new ProfileService();
