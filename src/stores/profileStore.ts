import { useSyncExternalStore } from "react";
import {
  profileService,
  ProfileService,
  UserProfile,
} from "../services/profileService";
import { eventBus } from "../services/eventBus";

/**
 * State exposed by ProfileStore.
 */
export interface ProfileStoreState {
  profile: UserProfile;
  loading: boolean;
}

/**
 * Asynchronous actions exposed by ProfileStore.
 */
export interface ProfileStoreActions {
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refresh: () => Promise<void>;
}

/**
 * ProfileStore acts as the single source of truth for player profile state in React.
 * Wraps ProfileService, listens to 'profile:updated' events via EventBus,
 * and provides useSyncExternalStore integration for React components.
 */
export class ProfileStore {
  private state: ProfileStoreState;
  private listeners: Set<() => void> = new Set();
  private service: ProfileService;

  constructor(service: ProfileService = profileService) {
    this.service = service;
    this.state = {
      profile: this.service.getProfile(),
      loading: false,
    };

    // Subscribe to EventBus profile:updated for real-time state synchronization
    eventBus.subscribe("profile:updated", () => this.syncFromService());

    // Subscribe directly to ProfileService updates
    this.service.subscribe(() => this.syncFromService());
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      profile: this.service.getProfile(),
    };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Subscribes a listener callback to ProfileStore state changes.
   *
   * @param listener Callback function.
   * @returns Unsubscribe function.
   */
  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Returns immutable current state snapshot for React's useSyncExternalStore.
   */
  public getSnapshot = (): ProfileStoreState => {
    return this.state;
  };

  /**
   * Asynchronously refreshes profile state from ProfileService.
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
   * Asynchronously updates user profile fields.
   *
   * @param updates Partial UserProfile fields to update.
   * @returns Updated UserProfile object.
   */
  public async updateProfile(
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.updateProfile(updates);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }
}

/**
 * Global singleton instance of ProfileStore.
 */
export const profileStore = new ProfileStore();

/**
 * Custom React hook for subscribing to ProfileStore state and actions.
 * Primary interface for React components.
 */
export function useProfileStore(): ProfileStoreState & ProfileStoreActions {
  const state = useSyncExternalStore(
    profileStore.subscribe,
    profileStore.getSnapshot,
    profileStore.getSnapshot
  );

  return {
    ...state,
    updateProfile: (updates) => profileStore.updateProfile(updates),
    refresh: () => profileStore.refresh(),
  };
}
