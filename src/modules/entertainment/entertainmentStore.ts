import { useSyncExternalStore } from "react";
import { entertainmentServiceModule, EntertainmentService } from "./entertainmentService";
import { eventBus } from "../../services/eventBus";
import {
  LaunchModeOption,
  SortOption,
  WatchlistStatus,
  StreamingServiceConfig,
  EntertainmentCategoryItem,
  EntertainmentTitle,
  RecentlyWatchedItem,
  EntertainmentStatsData,
} from "./types";

export interface EntertainmentStoreState {
  titles: EntertainmentTitle[];
  filteredTitles: EntertainmentTitle[];
  services: StreamingServiceConfig[];
  categories: EntertainmentCategoryItem[];
  recentlyWatched: RecentlyWatchedItem[];
  lastWatchedTitle: EntertainmentTitle | null;
  selectedSearchServiceId: string;
  sortOption: SortOption;
  launchMode: LaunchModeOption;
  confirmExternalLaunch: boolean;
  stats: EntertainmentStatsData;
  activeStatusFilter: string;
  activeCategoryFilter: string;
  searchQuery: string;
  loading: boolean;
}

export interface EntertainmentStoreActions {
  setActiveStatusFilter: (status: string) => void;
  setActiveCategoryFilter: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSearchServiceId: (serviceId: string) => Promise<void>;
  setSortOption: (sort: SortOption) => Promise<void>;
  setLaunchMode: (mode: LaunchModeOption) => Promise<void>;
  setConfirmExternalLaunch: (confirm: boolean) => Promise<void>;
  universalSearch: (query: string, serviceId?: string) => Promise<boolean>;
  launchTitle: (id: string, forceMode?: LaunchModeOption) => Promise<boolean>;
  incrementProgress: (id: string) => Promise<boolean>;
  reorderTitles: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  addTitle: (data: Omit<EntertainmentTitle, "id" | "createdAt" | "watchCount" | "order">) => Promise<EntertainmentTitle>;
  duplicateTitle: (id: string) => Promise<EntertainmentTitle | undefined>;
  updateTitle: (id: string, updates: Partial<EntertainmentTitle>) => Promise<EntertainmentTitle | undefined>;
  deleteTitle: (id: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  addService: (data: Omit<StreamingServiceConfig, "id">) => Promise<StreamingServiceConfig>;
  updateService: (id: string, updates: Partial<StreamingServiceConfig>) => Promise<StreamingServiceConfig | undefined>;
  deleteService: (id: string) => Promise<boolean>;
  toggleServiceEnabled: (id: string) => Promise<boolean>;
  addCategory: (name: string, icon?: string, color?: string) => Promise<EntertainmentCategoryItem>;
  updateCategory: (id: string, updates: Partial<EntertainmentCategoryItem>) => Promise<EntertainmentCategoryItem | undefined>;
  deleteCategory: (id: string) => Promise<boolean>;
  getRandomTitle: (status?: WatchlistStatus) => EntertainmentTitle | undefined;
  testServiceLauncher: (serviceId: string) => Promise<any>;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export class EntertainmentStore {
  private state: EntertainmentStoreState;
  private listeners: Set<() => void> = new Set();
  private service: EntertainmentService;

  constructor(service: EntertainmentService = entertainmentServiceModule) {
    this.service = service;

    const initialTitles = this.service.getTitles();
    this.state = {
      titles: initialTitles,
      filteredTitles: initialTitles,
      services: this.service.getServices(),
      categories: this.service.getCategories(),
      recentlyWatched: this.service.getRecentlyWatched(),
      lastWatchedTitle: this.service.getLastWatchedTitle() || null,
      selectedSearchServiceId: "all",
      sortOption: "manual",
      launchMode: "auto",
      confirmExternalLaunch: false,
      stats: this.service.getStats(),
      activeStatusFilter: "All",
      activeCategoryFilter: "All",
      searchQuery: "",
      loading: false,
    };

    eventBus.subscribe("entertainment:updated", () => this.syncFromService());
    eventBus.subscribe("anime:episodeWatched", () => this.syncFromService());
  }

  private syncFromService(): void {
    const allTitles = this.service.getTitles();
    const filtered = this.service.getTitles(
      this.state.activeCategoryFilter,
      this.state.activeStatusFilter,
      this.state.searchQuery
    );

    this.state = {
      ...this.state,
      titles: allTitles,
      filteredTitles: filtered,
      services: this.service.getServices(),
      categories: this.service.getCategories(),
      recentlyWatched: this.service.getRecentlyWatched(),
      lastWatchedTitle: this.service.getLastWatchedTitle() || null,
      stats: this.service.getStats(),
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

  public getSnapshot = (): EntertainmentStoreState => {
    return this.state;
  };

  public setActiveStatusFilter(status: string): void {
    this.state = {
      ...this.state,
      activeStatusFilter: status,
      filteredTitles: this.service.getTitles(
        this.state.activeCategoryFilter,
        status,
        this.state.searchQuery
      ),
    };
    this.notify();
  }

  public setActiveCategoryFilter(category: string): void {
    this.state = {
      ...this.state,
      activeCategoryFilter: category,
      filteredTitles: this.service.getTitles(
        category,
        this.state.activeStatusFilter,
        this.state.searchQuery
      ),
    };
    this.notify();
  }

  public setSearchQuery(query: string): void {
    this.state = {
      ...this.state,
      searchQuery: query,
      filteredTitles: this.service.getTitles(
        this.state.activeCategoryFilter,
        this.state.activeStatusFilter,
        query
      ),
    };
    this.notify();
  }

  public async setSelectedSearchServiceId(serviceId: string): Promise<void> {
    await this.service.setSelectedSearchServiceId(serviceId);
    this.state = { ...this.state, selectedSearchServiceId: serviceId };
    this.notify();
  }

  public async setSortOption(sort: SortOption): Promise<void> {
    await this.service.setSortOption(sort);
    this.state = { ...this.state, sortOption: sort };
    this.syncFromService();
  }

  public async setLaunchMode(mode: LaunchModeOption): Promise<void> {
    await this.service.setLaunchMode(mode);
    this.state = { ...this.state, launchMode: mode };
    this.notify();
  }

  public async setConfirmExternalLaunch(confirm: boolean): Promise<void> {
    await this.service.setConfirmExternalLaunch(confirm);
    this.state = { ...this.state, confirmExternalLaunch: confirm };
    this.notify();
  }

  public async universalSearch(query: string, serviceId?: string): Promise<boolean> {
    return this.service.universalSearch(query, serviceId);
  }

  public async launchTitle(id: string, forceMode?: LaunchModeOption): Promise<boolean> {
    const ok = await this.service.launchTitle(id, forceMode);
    this.syncFromService();
    return ok;
  }

  public async incrementProgress(id: string): Promise<boolean> {
    const ok = await this.service.incrementProgress(id);
    this.syncFromService();
    return ok;
  }

  public async reorderTitles(sourceIndex: number, destinationIndex: number): Promise<void> {
    await this.service.reorderTitles(sourceIndex, destinationIndex);
    this.syncFromService();
  }

  public async addTitle(
    data: Omit<EntertainmentTitle, "id" | "createdAt" | "watchCount" | "order">
  ): Promise<EntertainmentTitle> {
    const title = await this.service.addTitle(data);
    this.syncFromService();
    return title;
  }

  public async duplicateTitle(id: string): Promise<EntertainmentTitle | undefined> {
    const dup = await this.service.duplicateTitle(id);
    this.syncFromService();
    return dup;
  }

  public async updateTitle(id: string, updates: Partial<EntertainmentTitle>): Promise<EntertainmentTitle | undefined> {
    const title = await this.service.updateTitle(id, updates);
    this.syncFromService();
    return title;
  }

  public async deleteTitle(id: string): Promise<boolean> {
    const ok = await this.service.deleteTitle(id);
    this.syncFromService();
    return ok;
  }

  public async togglePin(id: string): Promise<boolean> {
    const pin = await this.service.togglePin(id);
    this.syncFromService();
    return pin;
  }

  public async toggleFavorite(id: string): Promise<boolean> {
    const fav = await this.service.toggleFavorite(id);
    this.syncFromService();
    return fav;
  }

  public async addService(data: Omit<StreamingServiceConfig, "id">): Promise<StreamingServiceConfig> {
    const s = await this.service.addService(data);
    this.syncFromService();
    return s;
  }

  public async updateService(id: string, updates: Partial<StreamingServiceConfig>): Promise<StreamingServiceConfig | undefined> {
    const s = await this.service.updateService(id, updates);
    this.syncFromService();
    return s;
  }

  public async deleteService(id: string): Promise<boolean> {
    const ok = await this.service.deleteService(id);
    this.syncFromService();
    return ok;
  }

  public async toggleServiceEnabled(id: string): Promise<boolean> {
    const ok = await this.service.toggleServiceEnabled(id);
    this.syncFromService();
    return ok;
  }

  public async addCategory(name: string, icon?: string, color?: string): Promise<EntertainmentCategoryItem> {
    const cat = await this.service.addCategory(name, icon, color);
    this.syncFromService();
    return cat;
  }

  public async updateCategory(id: string, updates: Partial<EntertainmentCategoryItem>): Promise<EntertainmentCategoryItem | undefined> {
    const cat = await this.service.updateCategory(id, updates);
    this.syncFromService();
    return cat;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const ok = await this.service.deleteCategory(id);
    this.syncFromService();
    return ok;
  }

  public getRandomTitle(status?: WatchlistStatus): EntertainmentTitle | undefined {
    return this.service.getRandomTitle(status);
  }

  public async testServiceLauncher(serviceId: string): Promise<any> {
    return this.service.testServiceLauncher(serviceId);
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
    await new Promise((r) => setTimeout(r, 0));
    this.syncFromService();
    this.state = { ...this.state, loading: false };
    this.notify();
  }
}

export const entertainmentStore = new EntertainmentStore();

export function useEntertainmentStore(): EntertainmentStoreState & EntertainmentStoreActions {
  const state = useSyncExternalStore(
    entertainmentStore.subscribe,
    entertainmentStore.getSnapshot,
    entertainmentStore.getSnapshot
  );

  return {
    ...state,
    setActiveStatusFilter: (status) => entertainmentStore.setActiveStatusFilter(status),
    setActiveCategoryFilter: (category) => entertainmentStore.setActiveCategoryFilter(category),
    setSearchQuery: (query) => entertainmentStore.setSearchQuery(query),
    setSelectedSearchServiceId: (serviceId) => entertainmentStore.setSelectedSearchServiceId(serviceId),
    setSortOption: (sort) => entertainmentStore.setSortOption(sort),
    setLaunchMode: (mode) => entertainmentStore.setLaunchMode(mode),
    setConfirmExternalLaunch: (c) => entertainmentStore.setConfirmExternalLaunch(c),
    universalSearch: (q, s) => entertainmentStore.universalSearch(q, s),
    launchTitle: (id, m) => entertainmentStore.launchTitle(id, m),
    incrementProgress: (id) => entertainmentStore.incrementProgress(id),
    reorderTitles: (src, dest) => entertainmentStore.reorderTitles(src, dest),
    addTitle: (data) => entertainmentStore.addTitle(data),
    duplicateTitle: (id) => entertainmentStore.duplicateTitle(id),
    updateTitle: (id, updates) => entertainmentStore.updateTitle(id, updates),
    deleteTitle: (id) => entertainmentStore.deleteTitle(id),
    togglePin: (id) => entertainmentStore.togglePin(id),
    toggleFavorite: (id) => entertainmentStore.toggleFavorite(id),
    addService: (data) => entertainmentStore.addService(data),
    updateService: (id, updates) => entertainmentStore.updateService(id, updates),
    deleteService: (id) => entertainmentStore.deleteService(id),
    toggleServiceEnabled: (id) => entertainmentStore.toggleServiceEnabled(id),
    addCategory: (name, icon, color) => entertainmentStore.addCategory(name, icon, color),
    updateCategory: (id, updates) => entertainmentStore.updateCategory(id, updates),
    deleteCategory: (id) => entertainmentStore.deleteCategory(id),
    getRandomTitle: (status) => entertainmentStore.getRandomTitle(status),
    testServiceLauncher: (serviceId) => entertainmentStore.testServiceLauncher(serviceId),
    exportJSON: () => entertainmentStore.exportJSON(),
    importJSON: (json) => entertainmentStore.importJSON(json),
    refresh: () => entertainmentStore.refresh(),
  };
}
