import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { nativeDialogService } from "../../services/nativeDialogService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import {
  MusicPlatformService,
  LaunchModeOption,
  SortOption,
  MusicCategoryItem,
  LauncherPlaylist,
  RecentlyOpenedItem,
  InstalledAppsStatus,
  MusicStatsData,
  MusicDataPayload,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.MUSIC;

export const DEFAULT_PRESET_CATEGORIES: MusicCategoryItem[] = [
  { id: "Gym", name: "Gym", icon: "🏋️", color: "#ef4444", isCustom: false },
  { id: "Focus", name: "Focus", icon: "📖", color: "#3b82f6", isCustom: false },
  { id: "Anime", name: "Anime", icon: "⛩️", color: "#ec4899", isCustom: false },
  { id: "Chill", name: "Chill", icon: "☕", color: "#a855f7", isCustom: false },
  { id: "Coding", name: "Coding", icon: "💻", color: "#10b981", isCustom: false },
  { id: "Custom", name: "Custom", icon: "⚡", color: "#f59e0b", isCustom: false },
];

export const DEFAULT_SEED_PLAYLISTS: LauncherPlaylist[] = [
  {
    id: "pl-lofi-chill",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
    service: "spotify",
    category: "Chill",
    categories: ["Chill", "Focus"],
    icon: "☕",
    coverImage: "",
    description: "Relaxing lofi beats for studying, reading, or chilling out.",
    isFavorite: true,
    isPinned: true,
    order: 0,
    createdAt: Date.now() - 86400000 * 5,
    lastOpenedAt: Date.now() - 3600000 * 2,
    launchCount: 12,
  },
  {
    id: "pl-coding-synth",
    title: "Synthwave / Cyberpunk Coding Mix",
    url: "https://music.youtube.com/playlist?list=PLw-VjHDlEOgvWWaGIk0C0ZMG8TnpM",
    service: "ytmusic",
    category: "Coding",
    categories: ["Coding", "Focus"],
    icon: "💻",
    coverImage: "",
    description: "High-energy retrowave & cyberpunk electronic beats for deep code flow.",
    isFavorite: true,
    isPinned: false,
    order: 1,
    createdAt: Date.now() - 86400000 * 4,
    lastOpenedAt: Date.now() - 3600000 * 5,
    launchCount: 8,
  },
  {
    id: "pl-gym-beast",
    title: "Beast Mode Workout & Gym Hype",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXdLENIlTawz3",
    service: "spotify",
    category: "Gym",
    categories: ["Gym"],
    icon: "🏋️",
    coverImage: "",
    description: "Heavy bass, phonk & hip hop to unleash peak gym performance.",
    isFavorite: false,
    isPinned: false,
    order: 2,
    createdAt: Date.now() - 86400000 * 3,
    lastOpenedAt: Date.now() - 3600000 * 24,
    launchCount: 15,
  },
  {
    id: "pl-anime-bangers",
    title: "Top Anime Openings & Epic OSTs",
    url: "https://music.youtube.com/playlist?list=RDCLAK5uy_kLz1u1O7XN_r6d4q6s",
    service: "ytmusic",
    category: "Anime",
    categories: ["Anime"],
    icon: "⛩️",
    coverImage: "",
    description: "Iconic Japanese anime openings, endings, and orchestral soundtracks.",
    isFavorite: true,
    isPinned: false,
    order: 3,
    createdAt: Date.now() - 86400000 * 2,
    lastOpenedAt: Date.now() - 3600000 * 12,
    launchCount: 20,
  },
  {
    id: "pl-deep-focus",
    title: "Deep Focus Ambient Piano & Strings",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
    service: "spotify",
    category: "Focus",
    categories: ["Focus", "Chill"],
    icon: "📖",
    coverImage: "",
    description: "Distraction-free peaceful instrumental music for intense concentration.",
    isFavorite: false,
    isPinned: false,
    order: 4,
    createdAt: Date.now() - 86400000 * 1,
    lastOpenedAt: Date.now() - 3600000 * 8,
    launchCount: 6,
  },
];

export class MusicService {
  private playlists: LauncherPlaylist[] = [];
  private categories: MusicCategoryItem[] = [];
  private recentlyOpened: RecentlyOpenedItem[] = [];
  private lastOpenedPlaylistId: string | null = null;
  private preferredService: MusicPlatformService = "spotify";
  private launchMode: LaunchModeOption = "auto";
  private sortOption: SortOption = "manual";
  private confirmExternalLaunch: boolean = false;
  private stats: MusicStatsData = {
    playlistsLaunched: 0,
    streakDays: 7,
    totalListenSessions: 0,
  };
  private installedApps: InstalledAppsStatus = {
    spotifyInstalled: true,
    ytMusicInstalled: true,
  };

  constructor() {
    this.initStorage();
  }

  private sanitizeStats(rawStats?: any): MusicStatsData {
    return {
      playlistsLaunched: typeof rawStats?.playlistsLaunched === "number" ? rawStats.playlistsLaunched : 0,
      streakDays: typeof rawStats?.streakDays === "number" ? rawStats.streakDays : 7,
      totalListenSessions: typeof rawStats?.totalListenSessions === "number" ? rawStats.totalListenSessions : 0,
    };
  }

  private sanitizeCategory(raw: any, index: number): MusicCategoryItem {
    return {
      id: String(raw?.id || `cat-${Date.now()}-${index}`),
      name: String(raw?.name || raw?.id || `Category ${index + 1}`),
      icon: String(raw?.icon || "🎵"),
      color: raw?.color || "#a855f7",
      isCustom: Boolean(raw?.isCustom),
    };
  }

  private sanitizePlaylist(raw: any, index: number = 0): LauncherPlaylist {
    const mainCategory = raw?.category || "Chill";
    let catArray: string[] = Array.isArray(raw?.categories) && raw.categories.length > 0
      ? raw.categories.map(String)
      : [mainCategory];

    if (!catArray.includes(mainCategory)) {
      catArray.unshift(mainCategory);
    }

    return {
      id: String(raw?.id || `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
      title: String(raw?.title || "Untitled Playlist"),
      url: String(raw?.url || ""),
      service: raw?.service === "ytmusic" || raw?.service === "other" ? raw.service : "spotify",
      category: mainCategory,
      categories: catArray,
      icon: String(raw?.icon || "🎵"),
      coverImage: String(raw?.coverImage || ""),
      description: String(raw?.description || ""),
      isFavorite: Boolean(raw?.isFavorite),
      isPinned: Boolean(raw?.isPinned),
      order: typeof raw?.order === "number" ? raw.order : index,
      createdAt: typeof raw?.createdAt === "number" ? raw.createdAt : Date.now(),
      lastOpenedAt: typeof raw?.lastOpenedAt === "number" ? raw.lastOpenedAt : undefined,
      launchCount: typeof raw?.launchCount === "number" ? raw.launchCount : 0,
    };
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<MusicDataPayload>(STORAGE_KEY);

      if (saved && Array.isArray(saved.categories) && saved.categories.length > 0) {
        this.categories = saved.categories.map((c, i) => this.sanitizeCategory(c, i));
      } else {
        this.categories = DEFAULT_PRESET_CATEGORIES.map((c, i) => this.sanitizeCategory(c, i));
      }

      if (saved && Array.isArray(saved.playlists) && saved.playlists.length > 0) {
        this.playlists = saved.playlists.map((p, i) => this.sanitizePlaylist(p, i));
        this.recentlyOpened = Array.isArray(saved.recentlyOpened)
          ? saved.recentlyOpened.map((r) => ({
              id: String(r?.id || `rp-${Date.now()}`),
              playlistId: String(r?.playlistId || ""),
              title: String(r?.title || "Untitled"),
              url: String(r?.url || ""),
              service: r?.service || "spotify",
              category: r?.category || "Chill",
              categories: Array.isArray(r?.categories) ? r.categories : [r?.category || "Chill"],
              icon: r?.icon || "🎵",
              coverImage: r?.coverImage || "",
              openedAt: typeof r?.openedAt === "number" ? r.openedAt : Date.now(),
            }))
          : [];
        this.lastOpenedPlaylistId = saved.lastOpenedPlaylistId || null;
        this.preferredService = saved.preferredService || "spotify";
        this.launchMode = saved.launchMode || "auto";
        this.sortOption = saved.sortOption || "manual";
        this.confirmExternalLaunch = Boolean(saved.confirmExternalLaunch);
        this.stats = this.sanitizeStats(saved.stats);
      } else {
        // Starter seeds initialized and persisted cleanly
        this.playlists = DEFAULT_SEED_PLAYLISTS.map((p, i) => this.sanitizePlaylist(p, i));
        this.lastOpenedPlaylistId = this.playlists[0]?.id || null;
        this.recentlyOpened = this.playlists.slice(0, 3).map((p) => ({
          id: `rp-${p.id}`,
          playlistId: p.id,
          title: p.title,
          url: p.url,
          service: p.service,
          category: p.category,
          categories: p.categories,
          icon: p.icon,
          coverImage: p.coverImage || "",
          openedAt: p.lastOpenedAt || Date.now(),
        }));
        this.stats = this.sanitizeStats(saved?.stats);
        await this.persist();
      }
    } catch (err) {
      console.error("[MusicService] Failed to load music data from StorageService:", err);
      this.categories = DEFAULT_PRESET_CATEGORIES.map((c, i) => this.sanitizeCategory(c, i));
      this.playlists = DEFAULT_SEED_PLAYLISTS.map((p, i) => this.sanitizePlaylist(p, i));
      this.stats = this.sanitizeStats();
    }
  }

  private async persist(): Promise<void> {
    try {
      const payload: MusicDataPayload = {
        playlists: this.playlists.map((p, i) => this.sanitizePlaylist(p, i)),
        categories: this.categories.map((c, i) => this.sanitizeCategory(c, i)),
        recentlyOpened: this.recentlyOpened,
        lastOpenedPlaylistId: this.lastOpenedPlaylistId,
        preferredService: this.preferredService,
        launchMode: this.launchMode,
        sortOption: this.sortOption,
        confirmExternalLaunch: this.confirmExternalLaunch,
        stats: this.sanitizeStats(this.stats),
      };
      await storageService.save(STORAGE_KEY, payload);
    } catch (err) {
      console.error("[MusicService] Failed to persist music data:", err);
    }
  }

  /**
   * Returns categories list.
   */
  getCategories(): MusicCategoryItem[] {
    return this.categories.map((c, i) => this.sanitizeCategory(c, i));
  }

  /**
   * Returns all stored playlists, applying category filter, search query, and current sort mode.
   */
  getPlaylists(category?: string, search?: string): LauncherPlaylist[] {
    let result = this.playlists.map((p, i) => this.sanitizePlaylist(p, i));

    if (category && category !== "All") {
      result = result.filter(
        (p) => p.category === category || (Array.isArray(p.categories) && p.categories.includes(category))
      );
    }

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.url.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (Array.isArray(p.categories) && p.categories.some((c) => c.toLowerCase().includes(term))) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Apply Sorting: Pinned items always prioritized at top
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (this.sortOption) {
        case "recent":
          return (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0);
        case "most_launched":
          return (b.launchCount || 0) - (a.launchCount || 0);
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
   * Reorders playlists via Drag & Drop.
   */
  async reorderPlaylists(sourceIndex: number, destinationIndex: number): Promise<void> {
    if (
      sourceIndex < 0 ||
      sourceIndex >= this.playlists.length ||
      destinationIndex < 0 ||
      destinationIndex >= this.playlists.length ||
      sourceIndex === destinationIndex
    ) {
      return;
    }

    const [moved] = this.playlists.splice(sourceIndex, 1);
    this.playlists.splice(destinationIndex, 0, moved);

    // Update order property
    this.playlists.forEach((p, i) => {
      p.order = i;
    });

    this.sortOption = "manual";
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
  }

  /**
   * Returns a playlist by ID.
   */
  getPlaylistById(id: string): LauncherPlaylist | undefined {
    const found = this.playlists.find((p) => p.id === id);
    return found ? this.sanitizePlaylist(found) : undefined;
  }

  /**
   * Returns the most recently opened/active playlist.
   */
  getLastOpenedPlaylist(): LauncherPlaylist | undefined {
    if (this.lastOpenedPlaylistId) {
      const found = this.playlists.find((p) => p.id === this.lastOpenedPlaylistId);
      if (found) return this.sanitizePlaylist(found);
    }
    return this.playlists[0] ? this.sanitizePlaylist(this.playlists[0]) : undefined;
  }

  /**
   * Returns top most launched playlists.
   */
  getMostLaunchedPlaylists(limit: number = 5): LauncherPlaylist[] {
    return [...this.playlists]
      .map((p, i) => this.sanitizePlaylist(p, i))
      .sort((a, b) => (b.launchCount || 0) - (a.launchCount || 0))
      .slice(0, limit);
  }

  /**
   * Returns list of recently opened playlist history items.
   */
  getRecentlyOpened(): RecentlyOpenedItem[] {
    return [...this.recentlyOpened];
  }

  /**
   * Returns active music stats.
   */
  getStats(): MusicStatsData {
    return this.sanitizeStats(this.stats);
  }

  /**
   * Returns current user-preferred service.
   */
  getPreferredService(): MusicPlatformService {
    return this.preferredService || "spotify";
  }

  /**
   * Sets default user-preferred service.
   */
  async setPreferredService(service: MusicPlatformService): Promise<void> {
    this.preferredService = service;
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
  }

  /**
   * Returns active launch mode ('app' | 'browser' | 'auto').
   */
  getLaunchMode(): LaunchModeOption {
    return this.launchMode || "auto";
  }

  /**
   * Sets preferred launch mode.
   */
  async setLaunchMode(mode: LaunchModeOption): Promise<void> {
    this.launchMode = mode;
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
  }

  /**
   * Returns active sort option.
   */
  getSortOption(): SortOption {
    return this.sortOption || "manual";
  }

  /**
   * Sets sorting mode.
   */
  async setSortOption(sort: SortOption): Promise<void> {
    this.sortOption = sort;
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
  }

  /**
   * Returns external launch confirmation setting.
   */
  getConfirmExternalLaunch(): boolean {
    return this.confirmExternalLaunch;
  }

  /**
   * Toggles external launch confirmation setting.
   */
  async setConfirmExternalLaunch(confirm: boolean): Promise<void> {
    this.confirmExternalLaunch = confirm;
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
  }

  /**
   * Returns detection status of installed music desktop apps.
   */
  getInstalledApps(): InstalledAppsStatus {
    return { ...this.installedApps };
  }

  /**
   * Converts HTTPS Spotify URLs to native spotify: URI protocol scheme if preferred.
   */
  private convertToNativeUri(url: string, service: MusicPlatformService): string {
    if (!url) return url;
    if (service === "spotify") {
      const match = url.match(/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const id = match[2];
        return `spotify:${type}:${id}`;
      }
    }
    return url;
  }

  /**
   * Launches a playlist by ID.
   */
  async launchPlaylist(playlistId: string, forceMode?: LaunchModeOption): Promise<boolean> {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) {
      notificationService.notify("warning", "Playlist not found.", "Music Launch Error");
      return false;
    }

    if (this.confirmExternalLaunch && !forceMode) {
      const confirmed = window.confirm(`Launch playlist "${playlist.title}" on ${playlist.service.toUpperCase()}?`);
      if (!confirmed) return false;
    }

    const targetMode = forceMode || this.launchMode;
    let targetUrl = playlist.url;

    if (targetMode === "app" || (targetMode === "auto" && playlist.service === "spotify")) {
      const nativeUri = this.convertToNativeUri(playlist.url, playlist.service);
      targetUrl = nativeUri;
    }

    let success = false;
    try {
      success = await nativeDialogService.openWebLink(targetUrl);
    } catch (err) {
      console.warn("[MusicService] Primary launch failed, falling back to HTTPS URL:", err);
      success = await nativeDialogService.openWebLink(playlist.url);
    }

    if (success) {
      const now = Date.now();
      playlist.launchCount = (playlist.launchCount || 0) + 1;
      playlist.lastOpenedAt = now;
      this.lastOpenedPlaylistId = playlist.id;

      // Update recently opened history (keep top 10 unique)
      const existingIdx = this.recentlyOpened.findIndex((r) => r.playlistId === playlist.id);
      if (existingIdx !== -1) {
        this.recentlyOpened.splice(existingIdx, 1);
      }

      this.recentlyOpened.unshift({
        id: `rp-${playlist.id}-${now}`,
        playlistId: playlist.id,
        title: playlist.title,
        url: playlist.url,
        service: playlist.service,
        category: playlist.category,
        categories: playlist.categories,
        icon: playlist.icon,
        coverImage: playlist.coverImage || "",
        openedAt: now,
      });

      if (this.recentlyOpened.length > 10) {
        this.recentlyOpened = this.recentlyOpened.slice(0, 10);
      }

      // Update stats
      this.stats.playlistsLaunched = (this.stats.playlistsLaunched || 0) + 1;
      this.stats.totalListenSessions = (this.stats.totalListenSessions || 0) + 1;

      // Award XP & Coins
      const xpEarned = 15;
      const coinsEarned = 3;
      xpService.awardXP(xpEarned, "Music Playlist Launch");
      profileService.addCoins(coinsEarned);

      notificationService.notify(
        "success",
        `🎵 Launched "${playlist.title}" (${(playlist.service || "music").toUpperCase()}) (+${xpEarned} XP, +${coinsEarned} Coins)`,
        "Playlist Launched"
      );

      eventBus.emit("music:played", {
        playlistId: playlist.id,
        title: playlist.title,
        service: playlist.service,
        xpEarned,
      });

      await this.persist();
      eventBus.emit("music:updated", this.getPayloadSnapshot());
    }

    return success;
  }

  /**
   * Directly launches Spotify or YouTube Music application/website.
   */
  async launchServicePlatform(service: MusicPlatformService): Promise<boolean> {
    let launchUrl = "https://open.spotify.com";
    if (service === "ytmusic") {
      launchUrl = "https://music.youtube.com";
    } else if (service === "spotify" && this.launchMode !== "browser") {
      launchUrl = "spotify:";
    }

    try {
      const ok = await nativeDialogService.openWebLink(launchUrl);
      if (ok) {
        notificationService.notify(
          "info",
          `🚀 Opened ${service === "spotify" ? "Spotify" : "YouTube Music"}`,
          "Service Launched"
        );
      }
      return ok;
    } catch (err) {
      console.error("[MusicService] Error launching platform:", err);
      return false;
    }
  }

  /**
   * Adds a new playlist to user's collection and persists.
   */
  async addPlaylist(data: Omit<LauncherPlaylist, "id" | "createdAt" | "launchCount" | "order">): Promise<LauncherPlaylist> {
    const newPlaylist: LauncherPlaylist = this.sanitizePlaylist(
      {
        ...data,
        id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        launchCount: 0,
        order: 0,
        icon: data.icon || this.getDefaultCategoryIcon(data.category),
      },
      0
    );

    // Shift existing orders
    this.playlists.forEach((p) => {
      p.order = (p.order || 0) + 1;
    });

    this.playlists.unshift(newPlaylist);
    await this.persist();
    notificationService.notify("success", `✨ Saved playlist "${newPlaylist.title}"`, "Playlist Created");
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return newPlaylist;
  }

  /**
   * Duplicates an existing playlist.
   */
  async duplicatePlaylist(id: string): Promise<LauncherPlaylist | undefined> {
    const target = this.playlists.find((p) => p.id === id);
    if (!target) return undefined;

    const copyData = {
      title: `${target.title} (Copy)`,
      url: target.url,
      service: target.service,
      category: target.category,
      categories: [...(target.categories || [target.category])],
      icon: target.icon,
      coverImage: target.coverImage || "",
      description: target.description || "",
      isFavorite: target.isFavorite,
      isPinned: false,
    };

    return this.addPlaylist(copyData);
  }

  /**
   * Updates an existing playlist.
   */
  async updatePlaylist(id: string, updates: Partial<LauncherPlaylist>): Promise<LauncherPlaylist | undefined> {
    const index = this.playlists.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.playlists[index] = this.sanitizePlaylist(
      {
        ...this.playlists[index],
        ...updates,
      },
      this.playlists[index].order ?? index
    );

    await this.persist();
    notificationService.notify("success", `Updated playlist "${this.playlists[index].title}"`, "Playlist Updated");
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return this.playlists[index];
  }

  /**
   * Deletes a playlist by ID.
   */
  async deletePlaylist(id: string): Promise<boolean> {
    const target = this.playlists.find((p) => p.id === id);
    if (!target) return false;

    this.playlists = this.playlists.filter((p) => p.id !== id);
    this.recentlyOpened = this.recentlyOpened.filter((r) => r.playlistId !== id);

    if (this.lastOpenedPlaylistId === id) {
      this.lastOpenedPlaylistId = this.playlists[0]?.id || null;
    }

    await this.persist();
    notificationService.notify("info", `Deleted playlist "${target.title}"`, "Playlist Removed");
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return true;
  }

  /**
   * Toggles playlist favorite status.
   */
  async toggleFavorite(id: string): Promise<boolean> {
    const playlist = this.playlists.find((p) => p.id === id);
    if (!playlist) return false;

    playlist.isFavorite = !playlist.isFavorite;
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return playlist.isFavorite;
  }

  /**
   * Toggles playlist pinned status.
   */
  async togglePin(id: string): Promise<boolean> {
    const playlist = this.playlists.find((p) => p.id === id);
    if (!playlist) return false;

    playlist.isPinned = !playlist.isPinned;
    await this.persist();
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return playlist.isPinned;
  }

  /**
   * Category Management (CRUD)
   */
  async addCategory(name: string, icon: string = "🎵", color: string = "#a855f7"): Promise<MusicCategoryItem> {
    const newCat: MusicCategoryItem = this.sanitizeCategory(
      {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        icon: icon || "🎵",
        color: color || "#a855f7",
        isCustom: true,
      },
      this.categories.length
    );

    this.categories.push(newCat);
    await this.persist();
    notificationService.notify("success", `Added category "${newCat.name}"`, "Category Added");
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return newCat;
  }

  async updateCategory(id: string, updates: Partial<MusicCategoryItem>): Promise<MusicCategoryItem | undefined> {
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
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const target = this.categories.find((c) => c.id === id);
    if (!target) return false;

    this.categories = this.categories.filter((c) => c.id !== id);
    await this.persist();
    notificationService.notify("info", `Deleted category "${target.name}"`, "Category Removed");
    eventBus.emit("music:updated", this.getPayloadSnapshot());
    return true;
  }

  /**
   * Exports playlists and categories as JSON.
   */
  exportJSON(): string {
    return JSON.stringify(this.getPayloadSnapshot(), null, 2);
  }

  /**
   * Imports playlists and categories from JSON string.
   */
  async importJSON(jsonStr: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.playlists)) {
        this.playlists = parsed.playlists.map((p: any, i: number) => this.sanitizePlaylist(p, i));
        if (Array.isArray(parsed.categories)) {
          this.categories = parsed.categories.map((c: any, i: number) => this.sanitizeCategory(c, i));
        }
        if (Array.isArray(parsed.recentlyOpened)) {
          this.recentlyOpened = parsed.recentlyOpened;
        }
        if (parsed.stats) {
          this.stats = this.sanitizeStats(parsed.stats);
        }
        await this.persist();
        notificationService.notify("success", "Successfully imported playlists & categories!", "Import Complete");
        eventBus.emit("music:updated", this.getPayloadSnapshot());
        return true;
      }
    } catch (err) {
      console.error("[MusicService] Import JSON failed:", err);
      notificationService.notify("warning", "Failed to parse imported JSON file.", "Import Error");
    }
    return false;
  }

  /**
   * Returns default emoji icon for a playlist category.
   */
  getDefaultCategoryIcon(category: string): string {
    const found = this.categories.find((c) => c.id === category || c.name === category);
    if (found) return found.icon;

    switch (category) {
      case "Gym":
        return "🏋️";
      case "Focus":
        return "📖";
      case "Anime":
        return "⛩️";
      case "Chill":
        return "☕";
      case "Coding":
        return "💻";
      case "Custom":
      default:
        return "🎵";
    }
  }

  private getPayloadSnapshot(): MusicDataPayload {
    return {
      playlists: this.playlists.map((p, i) => this.sanitizePlaylist(p, i)),
      categories: this.categories.map((c, i) => this.sanitizeCategory(c, i)),
      recentlyOpened: [...this.recentlyOpened],
      lastOpenedPlaylistId: this.lastOpenedPlaylistId,
      preferredService: this.preferredService,
      launchMode: this.launchMode,
      sortOption: this.sortOption,
      confirmExternalLaunch: this.confirmExternalLaunch,
      stats: this.sanitizeStats(this.stats),
    };
  }
}

export const musicServiceModule = new MusicService();
