import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { nativeDialogService, SmartLaunchResult } from "../../services/nativeDialogService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import {
  LaunchModeOption,
  SortOption,
  WatchlistStatus,
  StreamingServiceConfig,
  EntertainmentCategoryItem,
  EntertainmentTitle,
  RecentlyWatchedItem,
  EntertainmentStatsData,
  EntertainmentDataPayload,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.ENTERTAINMENT;
const FALLBACK_ANIME_KEY = STORAGE_KEYS.ANIME;

export const DEFAULT_PRESET_SERVICES: StreamingServiceConfig[] = [
  {
    id: "service-crunchyroll",
    name: "Crunchyroll",
    icon: "⛩️",
    color: "#ff6c00",
    websiteUrl: "https://www.crunchyroll.com",
    searchUrlTemplate: "https://www.crunchyroll.com/search?q={query}",
    nativeUri: "crunchyroll://",
    exePath: "",
    preferredLaunchMethod: "auto",
    enabled: true,
    isCustom: false,
  },
  {
    id: "service-netflix",
    name: "Netflix",
    icon: "🍿",
    color: "#e50914",
    websiteUrl: "https://www.netflix.com",
    searchUrlTemplate: "https://www.netflix.com/search?q={query}",
    nativeUri: "",
    exePath: "",
    preferredLaunchMethod: "browser",
    enabled: true,
    isCustom: false,
  },
  {
    id: "service-youtube",
    name: "YouTube",
    icon: "🔴",
    color: "#ff0000",
    websiteUrl: "https://www.youtube.com",
    searchUrlTemplate: "https://www.youtube.com/results?search_query={query}",
    nativeUri: "",
    exePath: "",
    preferredLaunchMethod: "browser",
    enabled: true,
    isCustom: false,
  },
  {
    id: "service-disney",
    name: "Disney+",
    icon: "✨",
    color: "#113ccf",
    websiteUrl: "https://www.disneyplus.com",
    searchUrlTemplate: "https://www.disneyplus.com/search?q={query}",
    nativeUri: "",
    exePath: "",
    preferredLaunchMethod: "browser",
    enabled: true,
    isCustom: false,
  },
  {
    id: "service-prime",
    name: "Prime Video",
    icon: "📦",
    color: "#00a8e1",
    websiteUrl: "https://www.primevideo.com",
    searchUrlTemplate: "https://www.primevideo.com/region/eu/search/ref=atv_nb_sr?phrase={query}",
    nativeUri: "",
    exePath: "",
    preferredLaunchMethod: "browser",
    enabled: true,
    isCustom: false,
  },
  {
    id: "service-plex",
    name: "Plex",
    icon: "⚡",
    color: "#e5a00d",
    websiteUrl: "https://app.plex.tv/desktop",
    searchUrlTemplate: "https://app.plex.tv/desktop#!/search?query={query}",
    nativeUri: "",
    exePath: "",
    preferredLaunchMethod: "auto",
    enabled: true,
    isCustom: false,
  },
  {
    id: "service-jellyfin",
    name: "Jellyfin",
    icon: "🐟",
    color: "#00a4dc",
    websiteUrl: "http://localhost:8096",
    searchUrlTemplate: "http://localhost:8096/#/search.html?query={query}",
    nativeUri: "",
    exePath: "",
    preferredLaunchMethod: "auto",
    enabled: true,
    isCustom: false,
  },
];

export const DEFAULT_PRESET_CATEGORIES: EntertainmentCategoryItem[] = [
  { id: "Anime", name: "Anime", icon: "⛩️", color: "#ec4899", isCustom: false },
  { id: "Movies", name: "Movies", icon: "🍿", color: "#e50914", isCustom: false },
  { id: "TV Shows", name: "TV Shows", icon: "📺", color: "#3b82f6", isCustom: false },
  { id: "Documentaries", name: "Documentaries", icon: "📹", color: "#10b981", isCustom: false },
  { id: "Custom", name: "Custom", icon: "⚡", color: "#f59e0b", isCustom: false },
];

export const DEFAULT_SEED_TITLES: EntertainmentTitle[] = [
  {
    id: "title-solo-leveling",
    title: "Solo Leveling",
    serviceId: "service-crunchyroll",
    status: "Watching",
    currentEpisode: 12,
    totalEpisodes: 24,
    directUrl: "https://www.crunchyroll.com/series/G50H5630M/solo-leveling",
    icon: "⛩️",
    rating: 5,
    notes: "Epic hunter levelling anime with top-tier action.",
    category: "Anime",
    categories: ["Anime", "TV Shows"],
    isFavorite: true,
    isPinned: true,
    order: 0,
    createdAt: Date.now() - 86400000 * 10,
    lastWatchedAt: Date.now() - 3600000 * 3,
    watchCount: 14,
  },
  {
    id: "title-arcane",
    title: "Arcane",
    serviceId: "service-netflix",
    status: "Watching",
    currentEpisode: 6,
    totalEpisodes: 18,
    directUrl: "https://www.netflix.com/title/81435684",
    icon: "🍿",
    rating: 5,
    notes: "Stunning animation and story in Zaun and Piltover.",
    category: "TV Shows",
    categories: ["TV Shows", "Movies"],
    isFavorite: true,
    isPinned: false,
    order: 1,
    createdAt: Date.now() - 86400000 * 8,
    lastWatchedAt: Date.now() - 3600000 * 12,
    watchCount: 9,
  },
  {
    id: "title-cyberpunk-edgerunners",
    title: "Cyberpunk: Edgerunners",
    serviceId: "service-netflix",
    status: "Completed",
    currentEpisode: 10,
    totalEpisodes: 10,
    directUrl: "https://www.netflix.com/title/81054853",
    icon: "⚡",
    rating: 5,
    notes: "Night City tragedy with amazing Studio Trigger visual aesthetics.",
    category: "Anime",
    categories: ["Anime"],
    isFavorite: true,
    isPinned: false,
    order: 2,
    createdAt: Date.now() - 86400000 * 15,
    lastWatchedAt: Date.now() - 86400000 * 2,
    watchCount: 22,
  },
];

export class EntertainmentService {
  private titles: EntertainmentTitle[] = [];
  private services: StreamingServiceConfig[] = [];
  private categories: EntertainmentCategoryItem[] = [];
  private recentlyWatched: RecentlyWatchedItem[] = [];
  private lastWatchedTitleId: string | null = null;
  private selectedSearchServiceId: string = "all";
  private sortOption: SortOption = "manual";
  private launchMode: LaunchModeOption = "auto";
  private confirmExternalLaunch: boolean = false;
  private stats: EntertainmentStatsData = {
    titlesWatched: 0,
    episodesWatched: 0,
    totalSessions: 0,
    streakDays: 7,
  };

  constructor() {
    this.initStorage();
  }

  private sanitizeStats(rawStats?: any): EntertainmentStatsData {
    return {
      titlesWatched: typeof rawStats?.titlesWatched === "number" ? rawStats.titlesWatched : 0,
      episodesWatched: typeof rawStats?.episodesWatched === "number" ? rawStats.episodesWatched : 0,
      totalSessions: typeof rawStats?.totalSessions === "number" ? rawStats.totalSessions : 0,
      streakDays: typeof rawStats?.streakDays === "number" ? rawStats.streakDays : 7,
    };
  }

  private sanitizeService(raw: any, index: number): StreamingServiceConfig {
    return {
      id: String(raw?.id || `service-${Date.now()}-${index}`),
      name: String(raw?.name || `Service ${index + 1}`),
      icon: String(raw?.icon || "🌐"),
      color: String(raw?.color || "#a855f7"),
      websiteUrl: String(raw?.websiteUrl || "https://google.com"),
      searchUrlTemplate: String(raw?.searchUrlTemplate || ""),
      nativeUri: raw?.nativeUri || undefined,
      exePath: raw?.exePath || undefined,
      preferredLaunchMethod: raw?.preferredLaunchMethod || "auto",
      enabled: raw?.enabled !== false,
      isCustom: Boolean(raw?.isCustom),
    };
  }

  private sanitizeCategory(raw: any, index: number): EntertainmentCategoryItem {
    return {
      id: String(raw?.id || `cat-${Date.now()}-${index}`),
      name: String(raw?.name || raw?.id || `Category ${index + 1}`),
      icon: String(raw?.icon || "🎬"),
      color: raw?.color || "#a855f7",
      isCustom: Boolean(raw?.isCustom),
    };
  }

  private sanitizeTitle(raw: any, index: number = 0): EntertainmentTitle {
    const mainCategory = raw?.category || "Anime";
    let catArray: string[] = Array.isArray(raw?.categories) && raw.categories.length > 0
      ? raw.categories.map(String)
      : [mainCategory];

    if (!catArray.includes(mainCategory)) {
      catArray.unshift(mainCategory);
    }

    return {
      id: String(raw?.id || `title-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
      title: String(raw?.title || "Untitled Show"),
      serviceId: String(raw?.serviceId || "service-crunchyroll"),
      status: (raw?.status as WatchlistStatus) || "Watching",
      currentEpisode: typeof raw?.currentEpisode === "number" ? raw.currentEpisode : 0,
      currentSeason: typeof raw?.currentSeason === "number" ? raw.currentSeason : 1,
      totalEpisodes: typeof raw?.totalEpisodes === "number" ? raw.totalEpisodes : undefined,
      directUrl: String(raw?.directUrl || ""),
      coverImage: String(raw?.coverImage || ""),
      icon: String(raw?.icon || "🎬"),
      rating: typeof raw?.rating === "number" ? raw.rating : 5,
      notes: String(raw?.notes || ""),
      category: mainCategory,
      categories: catArray,
      isFavorite: Boolean(raw?.isFavorite),
      isPinned: Boolean(raw?.isPinned),
      order: typeof raw?.order === "number" ? raw.order : index,
      createdAt: typeof raw?.createdAt === "number" ? raw.createdAt : Date.now(),
      lastWatchedAt: typeof raw?.lastWatchedAt === "number" ? raw.lastWatchedAt : undefined,
      watchCount: typeof raw?.watchCount === "number" ? raw.watchCount : 0,
    };
  }

  private async initStorage(): Promise<void> {
    try {
      let saved = await storageService.load<EntertainmentDataPayload>(STORAGE_KEY);
      if (!saved) {
        // Migration fallback: check legacy anime storage key if available
        saved = await storageService.load<any>(FALLBACK_ANIME_KEY);
      }

      if (saved && Array.isArray(saved.services) && saved.services.length > 0) {
        this.services = saved.services.map((s, i) => this.sanitizeService(s, i));
      } else {
        this.services = DEFAULT_PRESET_SERVICES.map((s, i) => this.sanitizeService(s, i));
      }

      if (saved && Array.isArray(saved.categories) && saved.categories.length > 0) {
        this.categories = saved.categories.map((c, i) => this.sanitizeCategory(c, i));
      } else {
        this.categories = DEFAULT_PRESET_CATEGORIES.map((c, i) => this.sanitizeCategory(c, i));
      }

      if (saved && Array.isArray(saved.titles) && saved.titles.length > 0) {
        this.titles = saved.titles.map((t, i) => this.sanitizeTitle(t, i));
        this.recentlyWatched = Array.isArray(saved.recentlyWatched)
          ? saved.recentlyWatched.map((r) => ({
              id: String(r?.id || `rw-${Date.now()}`),
              titleId: String(r?.titleId || ""),
              title: String(r?.title || "Untitled"),
              serviceId: String(r?.serviceId || "service-crunchyroll"),
              episode: typeof r?.episode === "number" ? r.episode : 1,
              season: typeof r?.season === "number" ? r.season : 1,
              directUrl: String(r?.directUrl || ""),
              icon: r?.icon || "🎬",
              coverImage: r?.coverImage || "",
              watchedAt: typeof r?.watchedAt === "number" ? r.watchedAt : Date.now(),
            }))
          : [];
        this.lastWatchedTitleId = saved.lastWatchedTitleId || null;
        this.selectedSearchServiceId = saved.selectedSearchServiceId || "all";
        this.sortOption = saved.sortOption || "manual";
        this.launchMode = saved.launchMode || "auto";
        this.confirmExternalLaunch = Boolean(saved.confirmExternalLaunch);
        this.stats = this.sanitizeStats(saved.stats);
      } else {
        // Populate default starter titles
        this.titles = DEFAULT_SEED_TITLES.map((t, i) => this.sanitizeTitle(t, i));
        this.lastWatchedTitleId = this.titles[0]?.id || null;
        this.recentlyWatched = this.titles.slice(0, 3).map((t) => ({
          id: `rw-${t.id}`,
          titleId: t.id,
          title: t.title,
          serviceId: t.serviceId,
          episode: t.currentEpisode || 1,
          season: t.currentSeason || 1,
          directUrl: t.directUrl,
          icon: t.icon,
          coverImage: t.coverImage || "",
          watchedAt: t.lastWatchedAt || Date.now(),
        }));
        this.stats = this.sanitizeStats(saved?.stats);
        await this.persist();
      }
    } catch (err) {
      console.error("[EntertainmentService] Failed to load storage:", err);
      this.services = DEFAULT_PRESET_SERVICES.map((s, i) => this.sanitizeService(s, i));
      this.categories = DEFAULT_PRESET_CATEGORIES.map((c, i) => this.sanitizeCategory(c, i));
      this.titles = DEFAULT_SEED_TITLES.map((t, i) => this.sanitizeTitle(t, i));
      this.stats = this.sanitizeStats();
    }
  }

  private async persist(): Promise<void> {
    try {
      const payload: EntertainmentDataPayload = {
        titles: this.titles.map((t, i) => this.sanitizeTitle(t, i)),
        services: this.services.map((s, i) => this.sanitizeService(s, i)),
        categories: this.categories.map((c, i) => this.sanitizeCategory(c, i)),
        recentlyWatched: this.recentlyWatched,
        lastWatchedTitleId: this.lastWatchedTitleId,
        selectedSearchServiceId: this.selectedSearchServiceId,
        sortOption: this.sortOption,
        launchMode: this.launchMode,
        confirmExternalLaunch: this.confirmExternalLaunch,
        stats: this.sanitizeStats(this.stats),
      };
      await storageService.save(STORAGE_KEY, payload);
    } catch (err) {
      console.error("[EntertainmentService] Failed to persist storage:", err);
    }
  }

  /**
   * Universal Search across single platform or all enabled platforms.
   */
  async universalSearch(query: string, targetServiceId?: string): Promise<boolean> {
    if (!query || !query.trim()) return false;
    const term = query.trim();
    const serviceId = targetServiceId || this.selectedSearchServiceId;

    let targetServices: StreamingServiceConfig[] = [];
    if (serviceId === "all" || !serviceId) {
      targetServices = this.services.filter((s) => s.enabled);
    } else {
      const found = this.services.find((s) => s.id === serviceId && s.enabled);
      if (found) targetServices = [found];
      else targetServices = this.services.filter((s) => s.enabled);
    }

    if (targetServices.length === 0) {
      notificationService.notify("warning", "No enabled streaming services found for search.", "Search Warning");
      return false;
    }

    let openedCount = 0;
    for (const service of targetServices) {
      let searchTargetUrl = service.websiteUrl;
      if (service.searchUrlTemplate && service.searchUrlTemplate.includes("{query}")) {
        searchTargetUrl = service.searchUrlTemplate.replace("{query}", encodeURIComponent(term));
      }

      try {
        const result = await nativeDialogService.smartLaunch(
          service.exePath,
          service.nativeUri,
          service.websiteUrl,
          service.preferredLaunchMethod,
          searchTargetUrl
        );
        if (result.success) openedCount++;
      } catch (err) {
        console.warn(`[EntertainmentService] Failed search launch for ${service.name}:`, err);
      }
    }

    if (openedCount > 0) {
      notificationService.notify(
        "info",
        `🔍 Launched search for "${term}" across ${openedCount} platform(s)`,
        "Universal Search"
      );
    }

    return openedCount > 0;
  }

  /**
   * Returns list of configured streaming services.
   */
  getServices(): StreamingServiceConfig[] {
    return this.services.map((s, i) => this.sanitizeService(s, i));
  }

  /**
   * Returns categories list.
   */
  getCategories(): EntertainmentCategoryItem[] {
    return this.categories.map((c, i) => this.sanitizeCategory(c, i));
  }

  /**
   * Returns titles with category/status/search filtering and sorting applied.
   */
  getTitles(category?: string, status?: string, search?: string): EntertainmentTitle[] {
    let result = this.titles.map((t, i) => this.sanitizeTitle(t, i));

    if (status && status !== "All") {
      result = result.filter((t) => t.status === status);
    }

    if (category && category !== "All") {
      result = result.filter(
        (t) => t.category === category || (Array.isArray(t.categories) && t.categories.includes(category))
      );
    }

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.directUrl.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          (Array.isArray(t.categories) && t.categories.some((c) => c.toLowerCase().includes(term))) ||
          (t.notes && t.notes.toLowerCase().includes(term))
      );
    }

    // Sort order: Pinned titles prioritized
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (this.sortOption) {
        case "recent":
          return (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0);
        case "most_watched":
          return (b.watchCount || 0) - (a.watchCount || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "az":
          return a.title.localeCompare(b.title);
        case "manual":
        default:
          return (a.order ?? 0) - (b.order ?? 0);
      }
    });

    return result;
  }

  /**
   * Returns a title by ID.
   */
  getTitleById(id: string): EntertainmentTitle | undefined {
    const found = this.titles.find((t) => t.id === id);
    return found ? this.sanitizeTitle(found) : undefined;
  }

  /**
   * Returns the last watched / active title for Continue Watching hero banner.
   */
  getLastWatchedTitle(): EntertainmentTitle | undefined {
    if (this.lastWatchedTitleId) {
      const found = this.titles.find((t) => t.id === this.lastWatchedTitleId);
      if (found) return this.sanitizeTitle(found);
    }
    return this.titles[0] ? this.sanitizeTitle(this.titles[0]) : undefined;
  }

  /**
   * Returns recently watched history.
   */
  getRecentlyWatched(): RecentlyWatchedItem[] {
    return [...this.recentlyWatched];
  }

  /**
   * Returns active stats.
   */
  getStats(): EntertainmentStatsData {
    return this.sanitizeStats(this.stats);
  }

  /**
   * Selects a random title from watchlist status.
   */
  getRandomTitle(status?: WatchlistStatus): EntertainmentTitle | undefined {
    let pool = this.titles.map((t, i) => this.sanitizeTitle(t, i));
    if (status) {
      pool = pool.filter((t) => t.status === status);
    } else {
      pool = pool.filter((t) => t.status === "Watching" || t.status === "Planned");
    }

    if (pool.length === 0) pool = this.titles;
    if (pool.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  /**
   * Diagnostic test launcher for a service configuration.
   */
  async testServiceLauncher(serviceId: string): Promise<SmartLaunchResult | null> {
    const service = this.services.find((s) => s.id === serviceId);
    if (!service) return null;

    return nativeDialogService.smartLaunch(
      service.exePath,
      service.nativeUri,
      service.websiteUrl,
      service.preferredLaunchMethod,
      service.websiteUrl
    );
  }

  /**
   * Launches direct URL or service link for a title using intelligent launcher fallback.
   */
  async launchTitle(id: string, forceMode?: LaunchModeOption): Promise<boolean> {
    const title = this.titles.find((t) => t.id === id);
    if (!title) {
      notificationService.notify("warning", "Title not found.", "Launch Error");
      return false;
    }

    if (this.confirmExternalLaunch && !forceMode) {
      const confirmed = window.confirm(`Launch "${title.title}"?`);
      if (!confirmed) return false;
    }

    const service = this.services.find((s) => s.id === title.serviceId);
    const targetMode = forceMode || service?.preferredLaunchMethod || this.launchMode;
    const browserTarget = title.directUrl || service?.websiteUrl || "https://google.com";

    const result = await nativeDialogService.smartLaunch(
      service?.exePath,
      service?.nativeUri,
      service?.websiteUrl || "https://google.com",
      targetMode,
      browserTarget
    );

    if (result.success) {
      const now = Date.now();
      title.watchCount = (title.watchCount || 0) + 1;
      title.lastWatchedAt = now;
      this.lastWatchedTitleId = title.id;

      // Update recently watched list
      const existingIdx = this.recentlyWatched.findIndex((r) => r.titleId === title.id);
      if (existingIdx !== -1) {
        this.recentlyWatched.splice(existingIdx, 1);
      }

      this.recentlyWatched.unshift({
        id: `rw-${title.id}-${now}`,
        titleId: title.id,
        title: title.title,
        serviceId: title.serviceId,
        episode: title.currentEpisode || 1,
        season: title.currentSeason || 1,
        directUrl: title.directUrl,
        icon: title.icon || "🎬",
        coverImage: title.coverImage || "",
        watchedAt: now,
      });

      if (this.recentlyWatched.length > 10) {
        this.recentlyWatched = this.recentlyWatched.slice(0, 10);
      }

      // Update stats & award XP
      this.stats.titlesWatched = (this.stats.titlesWatched || 0) + 1;
      this.stats.totalSessions = (this.stats.totalSessions || 0) + 1;

      const xpEarned = 15;
      const coinsEarned = 3;
      xpService.awardXP(xpEarned, "Entertainment Watch Session");
      profileService.addCoins(coinsEarned);

      notificationService.notify(
        "success",
        `🎬 Watching "${title.title}" via ${result.launchedMethod.toUpperCase()} (+${xpEarned} XP)`,
        "Title Launched"
      );

      eventBus.emit("anime:episodeWatched", {
        animeId: title.id,
        episodeNumber: title.currentEpisode || 1,
        xpEarned,
      });

      await this.persist();
      eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    }

    return result.success;
  }

  /**
   * Increments current episode for a title.
   */
  async incrementProgress(id: string): Promise<boolean> {
    const title = this.titles.find((t) => t.id === id);
    if (!title) return false;

    title.currentEpisode = (title.currentEpisode || 0) + 1;
    title.lastWatchedAt = Date.now();
    this.lastWatchedTitleId = title.id;

    if (title.totalEpisodes && title.currentEpisode >= title.totalEpisodes) {
      title.status = "Completed";
      notificationService.notify("success", `🎉 Completed "${title.title}"! (+100 Bonus XP)`, "Show Completed");
      xpService.awardXP(100, "Series Completed Bonus");
      profileService.addCoins(50);
    } else {
      const xpEarned = 15;
      xpService.awardXP(xpEarned, "Episode Watched");
      profileService.addCoins(3);
      notificationService.notify(
        "success",
        `▶ "${title.title}" Ep ${title.currentEpisode} (+${xpEarned} XP)`,
        "Episode Incremented"
      );
    }

    this.stats.episodesWatched = (this.stats.episodesWatched || 0) + 1;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return true;
  }

  /**
   * Reorders titles via Drag & Drop.
   */
  async reorderTitles(sourceIndex: number, destinationIndex: number): Promise<void> {
    if (
      sourceIndex < 0 ||
      sourceIndex >= this.titles.length ||
      destinationIndex < 0 ||
      destinationIndex >= this.titles.length ||
      sourceIndex === destinationIndex
    ) {
      return;
    }

    const [moved] = this.titles.splice(sourceIndex, 1);
    this.titles.splice(destinationIndex, 0, moved);

    this.titles.forEach((t, i) => {
      t.order = i;
    });

    this.sortOption = "manual";
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
  }

  /**
   * Adds a new title to user's collection.
   */
  async addTitle(
    data: Omit<EntertainmentTitle, "id" | "createdAt" | "watchCount" | "order">
  ): Promise<EntertainmentTitle> {
    const newTitle: EntertainmentTitle = this.sanitizeTitle(
      {
        ...data,
        id: `title-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        watchCount: 0,
        order: 0,
      },
      0
    );

    this.titles.forEach((t) => {
      t.order = (t.order || 0) + 1;
    });

    this.titles.unshift(newTitle);
    await this.persist();
    notificationService.notify("success", `✨ Saved title "${newTitle.title}"`, "Title Added");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return newTitle;
  }

  /**
   * Duplicates a title entry.
   */
  async duplicateTitle(id: string): Promise<EntertainmentTitle | undefined> {
    const target = this.titles.find((t) => t.id === id);
    if (!target) return undefined;

    const copyData = {
      title: `${target.title} (Copy)`,
      serviceId: target.serviceId,
      status: target.status,
      currentEpisode: target.currentEpisode,
      currentSeason: target.currentSeason,
      totalEpisodes: target.totalEpisodes,
      directUrl: target.directUrl,
      coverImage: target.coverImage || "",
      icon: target.icon || "🎬",
      rating: target.rating,
      notes: target.notes || "",
      category: target.category,
      categories: [...(target.categories || [target.category])],
      isFavorite: target.isFavorite,
      isPinned: false,
    };

    return this.addTitle(copyData);
  }

  /**
   * Updates an existing title.
   */
  async updateTitle(id: string, updates: Partial<EntertainmentTitle>): Promise<EntertainmentTitle | undefined> {
    const index = this.titles.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    this.titles[index] = this.sanitizeTitle(
      {
        ...this.titles[index],
        ...updates,
      },
      this.titles[index].order ?? index
    );

    await this.persist();
    notificationService.notify("success", `Updated "${this.titles[index].title}"`, "Title Updated");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return this.titles[index];
  }

  /**
   * Deletes a title by ID.
   */
  async deleteTitle(id: string): Promise<boolean> {
    const target = this.titles.find((t) => t.id === id);
    if (!target) return false;

    this.titles = this.titles.filter((t) => t.id !== id);
    this.recentlyWatched = this.recentlyWatched.filter((r) => r.titleId !== id);

    if (this.lastWatchedTitleId === id) {
      this.lastWatchedTitleId = this.titles[0]?.id || null;
    }

    await this.persist();
    notificationService.notify("info", `Deleted "${target.title}"`, "Title Removed");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return true;
  }

  /**
   * Toggles title pinned status.
   */
  async togglePin(id: string): Promise<boolean> {
    const title = this.titles.find((t) => t.id === id);
    if (!title) return false;

    title.isPinned = !title.isPinned;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return title.isPinned;
  }

  /**
   * Toggles title favorite status.
   */
  async toggleFavorite(id: string): Promise<boolean> {
    const title = this.titles.find((t) => t.id === id);
    if (!title) return false;

    title.isFavorite = !title.isFavorite;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return title.isFavorite;
  }

  /**
   * Service Manager CRUD operations
   */
  async addService(data: Omit<StreamingServiceConfig, "id">): Promise<StreamingServiceConfig> {
    const newService = this.sanitizeService(
      {
        ...data,
        id: `service-${Date.now()}`,
        isCustom: true,
        enabled: true,
      },
      this.services.length
    );

    this.services.push(newService);
    await this.persist();
    notificationService.notify("success", `Added service "${newService.name}"`, "Service Added");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return newService;
  }

  async updateService(id: string, updates: Partial<StreamingServiceConfig>): Promise<StreamingServiceConfig | undefined> {
    const index = this.services.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    this.services[index] = this.sanitizeService(
      {
        ...this.services[index],
        ...updates,
      },
      index
    );

    await this.persist();
    notificationService.notify("success", `Updated service "${this.services[index].name}"`, "Service Updated");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return this.services[index];
  }

  async deleteService(id: string): Promise<boolean> {
    const target = this.services.find((s) => s.id === id);
    if (!target) return false;

    this.services = this.services.filter((s) => s.id !== id);
    await this.persist();
    notificationService.notify("info", `Deleted service "${target.name}"`, "Service Removed");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return true;
  }

  async toggleServiceEnabled(id: string): Promise<boolean> {
    const service = this.services.find((s) => s.id === id);
    if (!service) return false;

    service.enabled = !service.enabled;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return service.enabled;
  }

  /**
   * Category CRUD operations
   */
  async addCategory(name: string, icon: string = "🎬", color: string = "#a855f7"): Promise<EntertainmentCategoryItem> {
    const newCat = this.sanitizeCategory(
      {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        icon: icon || "🎬",
        color: color || "#a855f7",
        isCustom: true,
      },
      this.categories.length
    );

    this.categories.push(newCat);
    await this.persist();
    notificationService.notify("success", `Added category "${newCat.name}"`, "Category Added");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return newCat;
  }

  async updateCategory(id: string, updates: Partial<EntertainmentCategoryItem>): Promise<EntertainmentCategoryItem | undefined> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.categories[index] = this.sanitizeCategory(
      {
        ...this.categories[index],
        ...updates,
      },
      index
    );

    await this.persist();
    notificationService.notify("success", `Updated category "${this.categories[index].name}"`, "Category Updated");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const target = this.categories.find((c) => c.id === id);
    if (!target) return false;

    this.categories = this.categories.filter((c) => c.id !== id);
    await this.persist();
    notificationService.notify("info", `Deleted category "${target.name}"`, "Category Removed");
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
    return true;
  }

  /**
   * Settings Setters
   */
  async setSelectedSearchServiceId(id: string): Promise<void> {
    this.selectedSearchServiceId = id;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
  }

  async setSortOption(sort: SortOption): Promise<void> {
    this.sortOption = sort;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
  }

  async setLaunchMode(mode: LaunchModeOption): Promise<void> {
    this.launchMode = mode;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
  }

  async setConfirmExternalLaunch(confirm: boolean): Promise<void> {
    this.confirmExternalLaunch = confirm;
    await this.persist();
    eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
  }

  /**
   * JSON Export / Import
   */
  exportJSON(): string {
    return JSON.stringify(this.getPayloadSnapshot(), null, 2);
  }

  async importJSON(jsonStr: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.titles)) {
        this.titles = parsed.titles.map((t: any, i: number) => this.sanitizeTitle(t, i));
        if (Array.isArray(parsed.services)) {
          this.services = parsed.services.map((s: any, i: number) => this.sanitizeService(s, i));
        }
        if (Array.isArray(parsed.categories)) {
          this.categories = parsed.categories.map((c: any, i: number) => this.sanitizeCategory(c, i));
        }
        if (Array.isArray(parsed.recentlyWatched)) {
          this.recentlyWatched = parsed.recentlyWatched;
        }
        if (parsed.stats) {
          this.stats = this.sanitizeStats(parsed.stats);
        }
        await this.persist();
        notificationService.notify("success", "Imported entertainment library successfully!", "Import Complete");
        eventBus.emit("entertainment:updated", this.getPayloadSnapshot());
        return true;
      }
    } catch (err) {
      console.error("[EntertainmentService] Import JSON error:", err);
      notificationService.notify("warning", "Failed to parse imported JSON file.", "Import Error");
    }
    return false;
  }

  private getPayloadSnapshot(): EntertainmentDataPayload {
    return {
      titles: this.titles.map((t, i) => this.sanitizeTitle(t, i)),
      services: this.services.map((s, i) => this.sanitizeService(s, i)),
      categories: this.categories.map((c, i) => this.sanitizeCategory(c, i)),
      recentlyWatched: [...this.recentlyWatched],
      lastWatchedTitleId: this.lastWatchedTitleId,
      selectedSearchServiceId: this.selectedSearchServiceId,
      sortOption: this.sortOption,
      launchMode: this.launchMode,
      confirmExternalLaunch: this.confirmExternalLaunch,
      stats: this.sanitizeStats(this.stats),
    };
  }
}

export const entertainmentServiceModule = new EntertainmentService();
