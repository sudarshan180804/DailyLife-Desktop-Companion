import { useSyncExternalStore } from "react";
import { settingsServiceModule, SettingsService } from "./settingsService";
import { eventBus } from "../../services/eventBus";
import { EVENTS } from "../../constants/appConstants";
import { AppSettings } from "./types";

export interface SettingsStoreState {
  settings: AppSettings;
  loading: boolean;
}

export interface SettingsStoreActions {
  updateSettings: (updates: Partial<AppSettings>) => Promise<AppSettings>;
  resetSection: (
    section: "appearance" | "general" | "notifications" | "performance"
  ) => Promise<AppSettings>;
  factoryReset: () => Promise<AppSettings>;
  exportSettingsJSON: () => string;
  importSettingsJSON: (jsonStr: string) => Promise<AppSettings>;
  pickBackgroundImage: () => Promise<string | null>;
  setPageBackground: (pageId: string, bgUrl: string) => Promise<AppSettings>;
  refresh: () => void;
}

export class SettingsStore {
  private state: SettingsStoreState;
  private listeners: Set<() => void> = new Set();
  private service: SettingsService;

  constructor(service: SettingsService = settingsServiceModule) {
    this.service = service;
    this.state = {
      settings: this.service.getSettings(),
      loading: false,
    };

    eventBus.subscribe(EVENTS.SETTINGS_CHANGED, () => {
      this.syncFromService();
    });
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      settings: this.service.getSettings(),
    };
    this.notify();
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = (): SettingsStoreState => {
    return this.state;
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = await this.service.updateSettings(updates);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async resetSection(
    section: "appearance" | "general" | "notifications" | "performance"
  ): Promise<AppSettings> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = await this.service.resetSection(section);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async factoryReset(): Promise<AppSettings> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = await this.service.factoryReset();
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public exportSettingsJSON(): string {
    return this.service.exportSettingsJSON();
  }

  public async importSettingsJSON(jsonStr: string): Promise<AppSettings> {
    return this.service.importSettingsJSON(jsonStr);
  }

  public async pickBackgroundImage(): Promise<string | null> {
    return this.service.pickBackgroundImage();
  }

  public async setPageBackground(pageId: string, bgUrl: string): Promise<AppSettings> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = await this.service.setPageBackground(pageId, bgUrl);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public refresh(): void {
    this.syncFromService();
  }
}

export const settingsStore = new SettingsStore();

export function useSettingsStore(): SettingsStoreState & SettingsStoreActions {
  const state = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getSnapshot
  );

  return {
    ...state,
    updateSettings: (updates) => settingsStore.updateSettings(updates),
    resetSection: (section) => settingsStore.resetSection(section),
    factoryReset: () => settingsStore.factoryReset(),
    exportSettingsJSON: () => settingsStore.exportSettingsJSON(),
    importSettingsJSON: (jsonStr) => settingsStore.importSettingsJSON(jsonStr),
    pickBackgroundImage: () => settingsStore.pickBackgroundImage(),
    setPageBackground: (pageId, bgUrl) => settingsStore.setPageBackground(pageId, bgUrl),
    refresh: () => settingsStore.refresh(),
  };
}
