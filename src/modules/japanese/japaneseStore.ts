import { useSyncExternalStore } from "react";
import { japaneseServiceModule, JapaneseService } from "./japaneseService";
import { eventBus } from "../../services/eventBus";
import {
  JapaneseProgressData,
  AnkiDeckItem,
  WordCardItem,
} from "./types";

/**
 * State structure exposed by JapaneseStore.
 */
export interface JapaneseStoreState {
  progress: JapaneseProgressData;
  decks: AnkiDeckItem[];
  words: WordCardItem[];
  loading: boolean;
}

/**
 * Asynchronous actions exposed by JapaneseStore.
 */
export interface JapaneseStoreActions {
  completeStudySession: (
    deckId?: string,
    cardsStudied?: number
  ) => Promise<void>;
  incrementProgress: (type: "vocab" | "kanji" | "grammar") => Promise<void>;
  addWord: (word: Partial<WordCardItem>) => Promise<WordCardItem>;
  refresh: () => Promise<void>;
}

/**
 * JapaneseStore acts as the single source of truth for Japanese learning state in React.
 * Wraps JapaneseService, listens to EventBus events, and exposes useSyncExternalStore integration.
 */
export class JapaneseStore {
  private state: JapaneseStoreState;
  private listeners: Set<() => void> = new Set();
  private service: JapaneseService;

  constructor(service: JapaneseService = japaneseServiceModule) {
    this.service = service;
    this.state = {
      progress: this.service.getProgress(),
      decks: this.service.getDecks(),
      words: this.service.getWords(),
      loading: false,
    };

    // Subscribe to EventBus japanese events for real-time state synchronization
    eventBus.subscribe("japanese:studyCompleted", () => this.syncFromService());
    eventBus.subscribe("japanese:goalCompleted", () => this.syncFromService());
    eventBus.subscribe("japanese:updated", () => this.syncFromService());
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      progress: this.service.getProgress(),
      decks: this.service.getDecks(),
      words: this.service.getWords(),
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

  public getSnapshot = (): JapaneseStoreState => {
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

  public async completeStudySession(
    deckId?: string,
    cardsStudied: number = 5
  ): Promise<void> {
    this.service.completeStudySession(deckId, cardsStudied);
    this.syncFromService();
  }

  public async incrementProgress(
    type: "vocab" | "kanji" | "grammar"
  ): Promise<void> {
    this.service.incrementProgress(type);
    this.syncFromService();
  }

  public async addWord(word: Partial<WordCardItem>): Promise<WordCardItem> {
    const created = this.service.addWord(word);
    this.syncFromService();
    return created;
  }
}

/**
 * Global singleton instance of JapaneseStore.
 */
export const japaneseStore = new JapaneseStore();

/**
 * Custom React hook for subscribing to JapaneseStore state and async actions.
 */
export function useJapaneseStore(): JapaneseStoreState & JapaneseStoreActions {
  const state = useSyncExternalStore(
    japaneseStore.subscribe,
    japaneseStore.getSnapshot,
    japaneseStore.getSnapshot
  );

  return {
    ...state,
    completeStudySession: (deckId, cardsStudied) =>
      japaneseStore.completeStudySession(deckId, cardsStudied),
    incrementProgress: (type) => japaneseStore.incrementProgress(type),
    addWord: (word) => japaneseStore.addWord(word),
    refresh: () => japaneseStore.refresh(),
  };
}
