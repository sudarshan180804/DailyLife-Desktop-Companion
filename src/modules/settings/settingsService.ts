import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { notificationService } from "../../services/notificationService";
import { nativeDialogService } from "../../services/nativeDialogService";
import { STORAGE_KEYS, EVENTS } from "../../constants/appConstants";
import { AppSettings, DEFAULT_SETTINGS } from "./types";

export class SettingsService {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<AppSettings>(STORAGE_KEYS.SETTINGS);
      if (saved && typeof saved === "object") {
        this.settings = { ...DEFAULT_SETTINGS, ...saved };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
        await storageService.save(STORAGE_KEYS.SETTINGS, this.settings);
      }
      this.applyDOMStyles(this.settings);
      eventBus.emit(EVENTS.SETTINGS_CHANGED, this.settings);
    } catch (err) {
      console.error("[SettingsService] Failed to load settings from StorageService:", err);
      this.settings = { ...DEFAULT_SETTINGS };
      this.applyDOMStyles(this.settings);
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.save(STORAGE_KEYS.SETTINGS, this.settings);
    } catch (err) {
      console.error("[SettingsService] Failed to persist settings:", err);
    }
  }

  /**
   * Applies CSS variables, font sizes, animations, and attributes to document root.
   */
  private applyDOMStyles(s: AppSettings): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Theme, Panel Tint & Sidebar attributes
    root.setAttribute("data-theme", s.theme);
    root.setAttribute("data-panel-tint", s.panelTint);
    root.setAttribute("data-sidebar-behavior", s.sidebarBehavior);

    // Panel Tint RGB Channels
    const tintRgb =
      s.panelTint === "warm"
        ? "35, 20, 12"
        : s.panelTint === "neutral"
        ? "18, 18, 22"
        : "25, 14, 30";
    root.style.setProperty("--panel-tint-rgb", tintRgb);

    // Accent Color & Glow
    root.style.setProperty("--accent-color", s.accentColor);
    root.style.setProperty("--accent-glow", `${s.accentColor}44`);

    // Glass & Transparency (0% = opaque 1.0, 100% = transparent 0.02)
    const glassAlpha = Math.max(0.02, Math.min(1.0, 1 - s.transparency / 100));
    root.style.setProperty("--glass-opacity", `${glassAlpha.toFixed(3)}`);
    root.style.setProperty("--glass-blur", `${Math.max(0, s.blurStrength)}px`);

    // Dimming Overlay (0% to 80%)
    const dimAlpha = Math.max(0, Math.min(0.8, s.dimBackground / 100));
    root.style.setProperty("--bg-dim", `${dimAlpha.toFixed(2)}`);

    // Font & Scale
    const fontStr = `${s.uiFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    root.style.setProperty("--font-family-custom", fontStr);
    root.style.setProperty("--font-size-base", `${s.fontSize}px`);
    root.style.setProperty("--font-scale", `${(s.fontScale / 100).toFixed(2)}`);
    document.body.style.fontFamily = fontStr;

    // Animations & Speed
    if (!s.animationsEnabled || s.animationSpeed === "disabled") {
      root.style.setProperty("--anim-duration-base", "0s");
      root.setAttribute("data-animations", "disabled");
    } else {
      root.setAttribute("data-animations", "enabled");
      const speedMult =
        s.animationSpeed === "0.5x"
          ? 2.0
          : s.animationSpeed === "1.5x"
          ? 0.67
          : s.animationSpeed === "2x"
          ? 0.5
          : 1.0;
      root.style.setProperty("--anim-duration-base", `${(0.3 * speedMult).toFixed(2)}s`);
    }
  }

  /**
   * Returns copy of current settings.
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Updates partial settings, applies changes to DOM immediately, and persists.
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = {
      ...this.settings,
      ...updates,
    };

    this.applyDOMStyles(this.settings);
    await this.persist();

    eventBus.emit(EVENTS.SETTINGS_CHANGED, this.settings);
    notificationService.notify("success", "⚙ Settings updated and applied!", "Settings Applied");

    return { ...this.settings };
  }

  /**
   * Resets an individual settings section.
   */
  async resetSection(section: "appearance" | "general" | "notifications" | "performance"): Promise<AppSettings> {
    let sectionDefaults: Partial<AppSettings> = {};

    switch (section) {
      case "appearance":
        sectionDefaults = {
          theme: DEFAULT_SETTINGS.theme,
          accentColor: DEFAULT_SETTINGS.accentColor,
          transparency: DEFAULT_SETTINGS.transparency,
          blurStrength: DEFAULT_SETTINGS.blurStrength,
          panelTint: DEFAULT_SETTINGS.panelTint,
          bgBehavior: DEFAULT_SETTINGS.bgBehavior,
          bgImage: DEFAULT_SETTINGS.bgImage,
          dimBackground: DEFAULT_SETTINGS.dimBackground,
          uiFont: DEFAULT_SETTINGS.uiFont,
          fontSize: DEFAULT_SETTINGS.fontSize,
          fontScale: DEFAULT_SETTINGS.fontScale,
        };
        break;
      case "general":
        sectionDefaults = {
          sidebarBehavior: DEFAULT_SETTINGS.sidebarBehavior,
          startupPage: DEFAULT_SETTINGS.startupPage,
          startWithWindows: DEFAULT_SETTINGS.startWithWindows,
          minimizeToTray: DEFAULT_SETTINGS.minimizeToTray,
          autoSaveEnabled: DEFAULT_SETTINGS.autoSaveEnabled,
          autoSaveIntervalMinutes: DEFAULT_SETTINGS.autoSaveIntervalMinutes,
        };
        break;
      case "notifications":
        sectionDefaults = {
          notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
          notifyAchievements: DEFAULT_SETTINGS.notifyAchievements,
          notifyXp: DEFAULT_SETTINGS.notifyXp,
          notifyTasksDue: DEFAULT_SETTINGS.notifyTasksDue,
          notifyTimers: DEFAULT_SETTINGS.notifyTimers,
          soundEnabled: DEFAULT_SETTINGS.soundEnabled,
        };
        break;
      case "performance":
        sectionDefaults = {
          animationsEnabled: DEFAULT_SETTINGS.animationsEnabled,
          animationSpeed: DEFAULT_SETTINGS.animationSpeed,
        };
        break;
    }

    return this.updateSettings(sectionDefaults);
  }

  /**
   * Factory reset all settings to defaults.
   */
  async factoryReset(): Promise<AppSettings> {
    this.settings = { ...DEFAULT_SETTINGS };
    this.applyDOMStyles(this.settings);
    await storageService.remove(STORAGE_KEYS.SETTINGS);
    await this.persist();

    eventBus.emit(EVENTS.SETTINGS_CHANGED, this.settings);
    notificationService.notify("warning", "🔄 App restored to factory settings defaults.", "Factory Reset");

    return { ...this.settings };
  }

  /**
   * Exports settings to a formatted JSON string.
   */
  exportSettingsJSON(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Imports settings from JSON string and applies immediately.
   */
  async importSettingsJSON(jsonStr: string): Promise<AppSettings> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object") {
        return await this.updateSettings(parsed);
      }
      throw new Error("Invalid settings JSON structure.");
    } catch (err: any) {
      notificationService.notify("warning", `⚠️ Failed to import settings JSON: ${err.message}`, "Import Failed");
      return { ...this.settings };
    }
  }

  /**
   * Sets custom background wallpaper for a specific page.
   */
  async setPageBackground(pageId: string, bgUrl: string): Promise<AppSettings> {
    const updatedPageBgs = {
      ...(this.settings.pageBackgrounds || {}),
      [pageId]: bgUrl,
    };
    return this.updateSettings({ pageBackgrounds: updatedPageBgs });
  }

  /**
   * Allows picking a custom background image file.
   */
  async pickBackgroundImage(): Promise<string | null> {
    const selected = await nativeDialogService.pickFile(
      "Select Background Image",
      "Image Files (*.png, *.jpg, *.jpeg, *.webp)",
      ["png", "jpg", "jpeg", "webp"]
    );

    if (selected) {
      await this.updateSettings({ bgImage: selected });
      return selected;
    }
    return null;
  }
}

export const settingsServiceModule = new SettingsService();
