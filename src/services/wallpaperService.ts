import { useState, useEffect } from "react";
import taskBgImg from "../assets/backgrounds/taskbg.png";
import projectBgImg from "../assets/backgrounds/projectbg.png";
import gymBgImg from "../assets/backgrounds/duringworkout.jpeg";
import studyBgImg from "../assets/backgrounds/study.png";
import jpBgImg from "../assets/backgrounds/jpbg.png";
import animeBgImg from "../assets/backgrounds/animebg.png";
import musicBgImg from "../assets/backgrounds/musicbg.png";
import settingBgImg from "../assets/backgrounds/settingbg.png";
import { getBackgroundForTime } from "../utils/timePeriod";
import { nativeDialogService } from "./nativeDialogService";
import { notificationService } from "./notificationService";
import { eventBus } from "./eventBus";
import { EVENTS } from "../constants/appConstants";
import { AppSettings } from "../modules/settings/types";

/**
 * Registry of original built-in bundled background wallpapers for every page.
 */
export const BUNDLED_WALLPAPERS: Record<string, string> = {
  home: getBackgroundForTime(),
  tasks: taskBgImg,
  projects: projectBgImg,
  gym: gymBgImg,
  notes: studyBgImg,
  japanese: jpBgImg,
  anime: animeBgImg,
  music: musicBgImg,
  settings: settingBgImg,
};

export class WallpaperService {
  private notifiedMissingMap: Set<string> = new Set();
  private resolvedCache: Record<string, string> = {};

  constructor() {
    // Clear resolved URL cache whenever settings are updated
    eventBus.subscribe(EVENTS.SETTINGS_CHANGED, () => {
      this.resolvedCache = {};
    });
  }

  /**
   * Synchronously returns bundled default wallpaper for a page.
   * Guarantees instant render on startup with ZERO black screens or flash.
   */
  getBundledDefault(pageId: string): string {
    const bundled = pageId === "home" ? getBackgroundForTime() : BUNDLED_WALLPAPERS[pageId] || BUNDLED_WALLPAPERS.tasks || taskBgImg;
    return bundled;
  }

  /**
   * Fast synchronous fallback resolver to ensure zero-frame black screen on initial render.
   */
  getInstantWallpaper(pageId: string, settings?: AppSettings): string {
    if (this.resolvedCache[pageId]) {
      return this.resolvedCache[pageId];
    }

    const customPath = settings?.pageBackgrounds?.[pageId] || settings?.bgImage;
    if (customPath && customPath.trim()) {
      const formatted = nativeDialogService.formatAssetUrl(customPath);
      this.resolvedCache[pageId] = formatted;
      return formatted;
    }

    const bundled = this.getBundledDefault(pageId);
    this.resolvedCache[pageId] = bundled;
    return bundled;
  }

  /**
   * Asynchronously resolves active wallpaper URL following strict fallback hierarchy:
   * 1. Page Custom Wallpaper
   * 2. Global Custom Wallpaper
   * 3. Bundled Default Page Wallpaper
   * 4. Global Fallback Wallpaper
   */
  async resolveWallpaper(pageId: string, settings?: AppSettings): Promise<string> {
    const bundledPath = this.getBundledDefault(pageId);
    const pageCustom = settings?.pageBackgrounds?.[pageId];
    const globalCustom = settings?.bgImage;

    console.group(`🖼️ [WallpaperService] Resolving Wallpaper for "${pageId.toUpperCase()}"`);
    console.log(`▸ Bundled asset path:`, bundledPath);

    // 1. Try page custom wallpaper if configured
    if (pageCustom && pageCustom.trim()) {
      const formatted = nativeDialogService.formatAssetUrl(pageCustom);
      const isPathValid = await this.validateWallpaperPath(pageCustom);

      console.log(`▸ Raw Configured Page Custom Path:`, pageCustom);
      console.log(`▸ convertFileSrc / formatted result:`, formatted);
      console.log(`▸ Disk Validation result:`, isPathValid);

      if (isPathValid) {
        this.resolvedCache[pageId] = formatted;
        console.log(`✅ [WallpaperService] Final Resolved URL (Custom):`, formatted);
        console.groupEnd();
        return formatted;
      } else {
        if (!this.notifiedMissingMap.has(pageId)) {
          this.notifiedMissingMap.add(pageId);
          notificationService.notify(
            "warning",
            `⚠️ Custom wallpaper for ${pageId.toUpperCase()} not found. Restored bundled background.`,
            "Wallpaper Fallback"
          );
        }
      }
    }

    // 2. Try global custom wallpaper if configured
    if (globalCustom && globalCustom.trim()) {
      const formatted = nativeDialogService.formatAssetUrl(globalCustom);
      const isPathValid = await this.validateWallpaperPath(globalCustom);

      console.log(`▸ Raw Configured Global Custom Path:`, globalCustom);
      console.log(`▸ convertFileSrc / formatted result:`, formatted);
      console.log(`▸ Disk Validation result:`, isPathValid);

      if (isPathValid) {
        this.resolvedCache[pageId] = formatted;
        console.log(`✅ [WallpaperService] Final Resolved URL (Global Custom):`, formatted);
        console.groupEnd();
        return formatted;
      }
    }

    // 3. Fallback to bundled default wallpaper
    this.resolvedCache[pageId] = bundledPath;
    console.log(`✅ [WallpaperService] Final Resolved URL (Bundled Default):`, bundledPath);
    console.groupEnd();
    return bundledPath;
  }

  /**
   * Helper to check if a wallpaper path or asset URL is valid on disk.
   */
  private async validateWallpaperPath(path: string): Promise<boolean> {
    if (!path || !path.trim()) return false;
    const trimmed = path.trim();
    const isWindowsDrivePath = /^[a-zA-Z]:[\\\/]/.test(trimmed);

    // If it's a web URL or Vite bundle asset, it's valid
    if (!isWindowsDrivePath) {
      return true;
    }
    return nativeDialogService.validatePath(trimmed);
  }

  /**
   * Returns list of all available bundled wallpapers for selection UI.
   */
  getBundledPresets(): { id: string; label: string; url: string }[] {
    return [
      { id: "home_time", label: "🌅 Dynamic Time Background", url: getBackgroundForTime() },
      { id: "tasks", label: "📝 Tasks Quest Map", url: taskBgImg },
      { id: "projects", label: "🚀 Projects Realm", url: projectBgImg },
      { id: "gym", label: "🏋️ Workout Sanctum", url: gymBgImg },
      { id: "notes", label: "📚 Study Library", url: studyBgImg },
      { id: "japanese", label: "⛩️ Torii Shrine", url: jpBgImg },
      { id: "anime", label: "🎬 Anime Night Sky", url: animeBgImg },
      { id: "music", label: "🎵 Music Lounge", url: musicBgImg },
      { id: "settings", label: "⚙️ Guild Laboratory", url: settingBgImg },
    ];
  }
}

export const wallpaperService = new WallpaperService();

/**
 * React hook to consume reactive active wallpaper for a page.
 * Instantly re-resolves and updates when page changes or custom settings are saved.
 */
export function useActiveWallpaper(activeTab: string, settings?: AppSettings): string {
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() =>
    wallpaperService.getInstantWallpaper(activeTab, settings)
  );

  useEffect(() => {
    let isMounted = true;

    const update = async () => {
      const resolved = await wallpaperService.resolveWallpaper(activeTab, settings);
      if (isMounted) {
        setWallpaperUrl(resolved);
      }
    };

    update();

    const unsubscribe = eventBus.subscribe(EVENTS.SETTINGS_CHANGED, update);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeTab, settings]);

  return wallpaperUrl;
}
