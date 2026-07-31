import { useSyncExternalStore } from "react";
import { musicServiceModule, MusicService } from "./musicService";
import { eventBus } from "../../services/eventBus";
import {
  MusicPlatformService,
  LaunchModeOption,
  SortOption,
  MusicCategoryItem,
  LauncherPlaylist,
  RecentlyOpenedItem,
  InstalledAppsStatus,
  MusicStatsData,
} from "./types";

export interface MusicStoreState {
  playlists: LauncherPlaylist[];
  filteredPlaylists: LauncherPlaylist[];
  mostLaunchedPlaylists: LauncherPlaylist[];
  categories: MusicCategoryItem[];
  recentlyOpened: RecentlyOpenedItem[];
  lastOpenedPlaylist: LauncherPlaylist | null;
  preferredService: MusicPlatformService;
  launchMode: LaunchModeOption;
  sortOption: SortOption;
  confirmExternalLaunch: boolean;
  stats: MusicStatsData;
  installedApps: InstalledAppsStatus;
  activeCategory: string;
  searchQuery: string;
  loading: boolean;
}

export interface MusicStoreActions {
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPreferredService: (service: MusicPlatformService) => Promise<void>;
  setLaunchMode: (mode: LaunchModeOption) => Promise<void>;
  setSortOption: (sort: SortOption) => Promise<void>;
  setConfirmExternalLaunch: (confirm: boolean) => Promise<void>;
  reorderPlaylists: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  addPlaylist: (
    data: Omit<LauncherPlaylist, "id" | "createdAt" | "launchCount" | "order">
  ) => Promise<LauncherPlaylist>;
  duplicatePlaylist: (id: string) => Promise<LauncherPlaylist | undefined>;
  updatePlaylist: (
    id: string,
    updates: Partial<LauncherPlaylist>
  ) => Promise<LauncherPlaylist | undefined>;
  deletePlaylist: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  addCategory: (name: string, icon?: string, color?: string) => Promise<MusicCategoryItem>;
  updateCategory: (id: string, updates: Partial<MusicCategoryItem>) => Promise<MusicCategoryItem | undefined>;
  deleteCategory: (id: string) => Promise<boolean>;
  launchPlaylist: (id: string, forceMode?: LaunchModeOption) => Promise<boolean>;
  launchServicePlatform: (service: MusicPlatformService) => Promise<boolean>;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export class MusicStore {
  private state: MusicStoreState;
  private listeners: Set<() => void> = new Set();
  private service: MusicService;

  constructor(service: MusicService = musicServiceModule) {
    this.service = service;

    const initialPlaylists = this.service.getPlaylists();
    this.state = {
      playlists: initialPlaylists,
      filteredPlaylists: initialPlaylists,
      mostLaunchedPlaylists: this.service.getMostLaunchedPlaylists(5),
      categories: this.service.getCategories(),
      recentlyOpened: this.service.getRecentlyOpened(),
      lastOpenedPlaylist: this.service.getLastOpenedPlaylist() || null,
      preferredService: this.service.getPreferredService(),
      launchMode: this.service.getLaunchMode(),
      sortOption: this.service.getSortOption(),
      confirmExternalLaunch: this.service.getConfirmExternalLaunch(),
      stats: this.service.getStats(),
      installedApps: this.service.getInstalledApps(),
      activeCategory: "All",
      searchQuery: "",
      loading: false,
    };

    // Synchronize state when music events occur
    eventBus.subscribe("music:played", () => this.syncFromService());
    eventBus.subscribe("music:updated", () => this.syncFromService());
  }

  private syncFromService(): void {
    const allPlaylists = this.service.getPlaylists();
    const filtered = this.service.getPlaylists(
      this.state.activeCategory,
      this.state.searchQuery
    );

    this.state = {
      ...this.state,
      playlists: allPlaylists,
      filteredPlaylists: filtered,
      mostLaunchedPlaylists: this.service.getMostLaunchedPlaylists(5),
      categories: this.service.getCategories(),
      recentlyOpened: this.service.getRecentlyOpened(),
      lastOpenedPlaylist: this.service.getLastOpenedPlaylist() || null,
      preferredService: this.service.getPreferredService(),
      launchMode: this.service.getLaunchMode(),
      sortOption: this.service.getSortOption(),
      confirmExternalLaunch: this.service.getConfirmExternalLaunch(),
      stats: this.service.getStats(),
      installedApps: this.service.getInstalledApps(),
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

  public getSnapshot = (): MusicStoreState => {
    return this.state;
  };

  public setActiveCategory(category: string): void {
    this.state = {
      ...this.state,
      activeCategory: category,
      filteredPlaylists: this.service.getPlaylists(category, this.state.searchQuery),
    };
    this.notify();
  }

  public setSearchQuery(query: string): void {
    this.state = {
      ...this.state,
      searchQuery: query,
      filteredPlaylists: this.service.getPlaylists(this.state.activeCategory, query),
    };
    this.notify();
  }

  public async setPreferredService(service: MusicPlatformService): Promise<void> {
    await this.service.setPreferredService(service);
    this.syncFromService();
  }

  public async setLaunchMode(mode: LaunchModeOption): Promise<void> {
    await this.service.setLaunchMode(mode);
    this.syncFromService();
  }

  public async setSortOption(sort: SortOption): Promise<void> {
    await this.service.setSortOption(sort);
    this.syncFromService();
  }

  public async setConfirmExternalLaunch(confirm: boolean): Promise<void> {
    await this.service.setConfirmExternalLaunch(confirm);
    this.syncFromService();
  }

  public async reorderPlaylists(sourceIndex: number, destinationIndex: number): Promise<void> {
    await this.service.reorderPlaylists(sourceIndex, destinationIndex);
    this.syncFromService();
  }

  public async addPlaylist(
    data: Omit<LauncherPlaylist, "id" | "createdAt" | "launchCount" | "order">
  ): Promise<LauncherPlaylist> {
    const created = await this.service.addPlaylist(data);
    this.syncFromService();
    return created;
  }

  public async duplicatePlaylist(id: string): Promise<LauncherPlaylist | undefined> {
    const dup = await this.service.duplicatePlaylist(id);
    this.syncFromService();
    return dup;
  }

  public async updatePlaylist(
    id: string,
    updates: Partial<LauncherPlaylist>
  ): Promise<LauncherPlaylist | undefined> {
    const updated = await this.service.updatePlaylist(id, updates);
    this.syncFromService();
    return updated;
  }

  public async deletePlaylist(id: string): Promise<boolean> {
    const ok = await this.service.deletePlaylist(id);
    this.syncFromService();
    return ok;
  }

  public async toggleFavorite(id: string): Promise<boolean> {
    const fav = await this.service.toggleFavorite(id);
    this.syncFromService();
    return fav;
  }

  public async togglePin(id: string): Promise<boolean> {
    const pin = await this.service.togglePin(id);
    this.syncFromService();
    return pin;
  }

  public async addCategory(name: string, icon?: string, color?: string): Promise<MusicCategoryItem> {
    const cat = await this.service.addCategory(name, icon, color);
    this.syncFromService();
    return cat;
  }

  public async updateCategory(id: string, updates: Partial<MusicCategoryItem>): Promise<MusicCategoryItem | undefined> {
    const cat = await this.service.updateCategory(id, updates);
    this.syncFromService();
    return cat;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const ok = await this.service.deleteCategory(id);
    this.syncFromService();
    return ok;
  }

  public async launchPlaylist(
    id: string,
    forceMode?: LaunchModeOption
  ): Promise<boolean> {
    const ok = await this.service.launchPlaylist(id, forceMode);
    this.syncFromService();
    return ok;
  }

  public async launchServicePlatform(
    service: MusicPlatformService
  ): Promise<boolean> {
    return this.service.launchServicePlatform(service);
  }

  public exportJSON(): string {
    return this.service.exportJSON();
  }

  public async importJSON(jsonStr: string): Promise<boolean> {
    const ok = await this.service.importJSON(jsonStr);
    this.syncFromService();
    return ok;
  }

  public async refresh(): Promise<void> {
    this.state = { ...this.state, loading: true };
    this.notify();

    await new Promise((resolve) => setTimeout(resolve, 0));
    this.syncFromService();

    this.state = { ...this.state, loading: false };
    this.notify();
  }
}

export const musicStore = new MusicStore();

export function useMusicStore(): MusicStoreState & MusicStoreActions {
  const state = useSyncExternalStore(
    musicStore.subscribe,
    musicStore.getSnapshot,
    musicStore.getSnapshot
  );

  return {
    ...state,
    setActiveCategory: (cat) => musicStore.setActiveCategory(cat),
    setSearchQuery: (q) => musicStore.setSearchQuery(q),
    setPreferredService: (s) => musicStore.setPreferredService(s),
    setLaunchMode: (m) => musicStore.setLaunchMode(m),
    setSortOption: (s) => musicStore.setSortOption(s),
    setConfirmExternalLaunch: (c) => musicStore.setConfirmExternalLaunch(c),
    reorderPlaylists: (src, dest) => musicStore.reorderPlaylists(src, dest),
    addPlaylist: (data) => musicStore.addPlaylist(data),
    duplicatePlaylist: (id) => musicStore.duplicatePlaylist(id),
    updatePlaylist: (id, updates) => musicStore.updatePlaylist(id, updates),
    deletePlaylist: (id) => musicStore.deletePlaylist(id),
    toggleFavorite: (id) => musicStore.toggleFavorite(id),
    togglePin: (id) => musicStore.togglePin(id),
    addCategory: (name, icon, color) => musicStore.addCategory(name, icon, color),
    updateCategory: (id, updates) => musicStore.updateCategory(id, updates),
    deleteCategory: (id) => musicStore.deleteCategory(id),
    launchPlaylist: (id, forceMode) => musicStore.launchPlaylist(id, forceMode),
    launchServicePlatform: (s) => musicStore.launchServicePlatform(s),
    exportJSON: () => musicStore.exportJSON(),
    importJSON: (json) => musicStore.importJSON(json),
    refresh: () => musicStore.refresh(),
  };
}
