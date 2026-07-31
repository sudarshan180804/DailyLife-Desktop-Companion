/**
 * Type representing a listener callback function.
 */
export type EventCallback<T = any> = (payload: T) => void | Promise<void>;

/**
 * Standard application event payloads registry.
 * Namespaced event string format: "domain:action" (e.g. "task:completed", "xp:changed").
 */
export interface EventMap {
  "task:created": { taskId: string; task?: any };
  "task:updated": { taskId: string; task?: any };
  "task:completed": { taskId: string; xpReward?: number; task?: any };
  "task:deleted": { taskId: string };
  "xp:changed": { currentXp: number; level: number; delta?: number; reason?: string };
  "level:up": { oldLevel: number; newLevel: number; currentXP: number; totalXP: number };
  "achievement:progress": { achievementId: string; progress: number; target: number; achievement: any };
  "achievement:unlocked": { achievementId: string; achievement: any };
  "notification:added": { notification: any };
  "notification:removed": { notificationId: string };
  "project:created": { projectId: string; project?: any };
  "project:updated": { projectId: string; project?: any };
  "project:completed": { projectId: string; xpReward?: number; project?: any };
  "project:deleted": { projectId: string };
  "note:created": { noteId: string; note?: any };
  "note:updated": { noteId: string; note?: any };
  "note:deleted": { noteId: string };
  "gym:exerciseCompleted": { exerciseId: string; xpReward: number; exercise?: any };
  "gym:sessionCompleted": { workoutId: string; totalXp: number; bonusCoins: number };
  "gym:updated": { exercises: any[]; timeline: any[] };
  "japanese:studyCompleted": { deckId?: string; cardsStudied: number; xpEarned: number };
  "japanese:goalCompleted": { goalPercent: number; bonusCoins: number };
  "japanese:updated": { progress: any; decks: any[]; words: any[] };
  "music:played": { trackId?: string; playlistId?: string; title: string; service?: string; xpEarned: number };
  "music:playlistCompleted": { playlistId: string; bonusCoins: number };
  "music:updated": any;
  "anime:episodeWatched": { animeId: string; episodeNumber: number; xpEarned: number };
  "anime:seriesCompleted": { animeId: string; title: string; bonusCoins: number };
  "anime:updated": { continueWatching: any; currentlyWatching: any[]; queue: any[]; stats: any };
  "profile:updated": { profile: any };
  "settings:changed": Record<string, any>;
  [event: string]: any;
}

/**
 * EventBus provides a pub/sub event emitter pattern independent of UI framework (React).
 * It enables decoupled communication between services and modules using typed, namespaced events.
 */
export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribes a callback function to a specific event.
   * Duplicate subscriptions of the exact same callback reference are handled safely.
   *
   * @template K Key in EventMap or custom event string.
   * @param event The event name (e.g. "task:completed", "xp:changed").
   * @param callback The callback function to invoke when event is emitted.
   * @returns Unsubscribe function to easily remove the listener.
   */
  subscribe<K extends keyof EventMap>(
    event: K | string,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    const eventName = String(event);
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const eventSet = this.listeners.get(eventName)!;
    eventSet.add(callback as EventCallback);

    return () => this.unsubscribe(eventName, callback);
  }

  /**
   * Unsubscribes a callback function from a specific event.
   *
   * @template K Key in EventMap or custom event string.
   * @param event The event name.
   * @param callback The callback function to remove.
   */
  unsubscribe<K extends keyof EventMap>(
    event: K | string,
    callback: EventCallback<EventMap[K]>
  ): void {
    const eventName = String(event);
    const eventSet = this.listeners.get(eventName);
    if (eventSet) {
      eventSet.delete(callback as EventCallback);
      if (eventSet.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Emits an event with an optional payload to all subscribed listeners.
   * Each listener is executed inside an isolated try-catch block so that one failing
   * listener will not prevent other listeners from executing.
   *
   * @template K Key in EventMap or custom event string.
   * @param event The event name.
   * @param payload The payload object associated with the event.
   */
  emit<K extends keyof EventMap>(
    event: K | string,
    payload?: EventMap[K]
  ): void {
    const eventName = String(event);
    const eventSet = this.listeners.get(eventName);
    if (!eventSet || eventSet.size === 0) {
      return;
    }

    // Copy callbacks to array to ensure safety if a callback unsubscribes during emit
    const callbacks = Array.from(eventSet);
    for (const callback of callbacks) {
      try {
        callback(payload);
      } catch (error) {
        console.error(
          `[EventBus] Error occurred in listener for event "${eventName}":`,
          error
        );
      }
    }
  }

  /**
   * Subscribes a callback to an event for a single execution.
   * The listener automatically unsubscribes itself after being called once.
   *
   * @template K Key in EventMap or custom event string.
   * @param event The event name.
   * @param callback The callback function to invoke once.
   * @returns Unsubscribe function to cancel the subscription before it triggers.
   */
  once<K extends keyof EventMap>(
    event: K | string,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    const eventName = String(event);
    const wrapper: EventCallback<EventMap[K]> = (payload) => {
      this.unsubscribe(eventName, wrapper);
      callback(payload);
    };

    return this.subscribe(eventName, wrapper);
  }

  /**
   * Clears event listeners.
   * If an event name is specified, removes all listeners for that event.
   * If no event name is specified, clears all listeners for all events.
   *
   * @param event Optional event name to clear.
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Gets the number of active listeners for a specific event or total listeners across all events.
   *
   * @param event Optional event name.
   * @returns Number of active listeners.
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size || 0;
    }
    let total = 0;
    for (const set of this.listeners.values()) {
      total += set.size;
    }
    return total;
  }
}

/**
 * Global singleton instance of EventBus for application-wide messaging.
 */
export const eventBus = new EventBus();
