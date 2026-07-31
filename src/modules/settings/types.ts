export type SettingsTabId =
  | "general"
  | "appearance"
  | "notifications"
  | "performance"
  | "data"
  | "about";

export type ThemeMode = "dark" | "dusk" | "light" | "midnight" | "system";
export type PanelTint = "warm" | "neutral" | "purple";
export type SidebarBehavior = "expanded" | "collapsed" | "hover_expand";
export type StartupPageId =
  | "home"
  | "tasks"
  | "projects"
  | "gym"
  | "notes"
  | "japanese"
  | "anime"
  | "music"
  | "settings";
export type AnimationSpeed = "disabled" | "0.5x" | "1x" | "1.5x" | "2x";

export interface AppSettings {
  // Appearance
  theme: ThemeMode;
  accentColor: string;
  transparency: number; // 10 to 95 (percent)
  blurStrength: number; // 0 to 30 (px)
  panelTint: PanelTint;
  bgBehavior: string;
  bgImage?: string;
  pageBackgrounds: Record<string, string>; // Per-page custom wallpapers (home, tasks, projects, etc.)
  dimBackground: number; // 0 to 80 (percent)
  uiFont: string;
  fontSize: number; // 12 to 22
  fontScale: number; // 80 to 130 (percent)

  // Behavior & Layout
  sidebarBehavior: SidebarBehavior;
  startupPage: StartupPageId;
  startWithWindows: boolean;
  minimizeToTray: boolean;

  // Notifications
  notificationsEnabled: boolean;
  notifyAchievements: boolean;
  notifyXp: boolean;
  notifyTasksDue: boolean;
  notifyTimers: boolean;
  soundEnabled: boolean;

  // Performance & Animation
  animationsEnabled: boolean;
  animationSpeed: AnimationSpeed;
  autoSaveEnabled: boolean;
  autoSaveIntervalMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  accentColor: "#a855f7",
  transparency: 82,
  blurStrength: 4,
  panelTint: "purple",
  bgBehavior: "Subtle Parallax",
  bgImage: undefined,
  pageBackgrounds: {},
  dimBackground: 35,
  uiFont: "Poppins",
  fontSize: 16,
  fontScale: 100,

  sidebarBehavior: "expanded",
  startupPage: "home",
  startWithWindows: false,
  minimizeToTray: false,

  notificationsEnabled: true,
  notifyAchievements: true,
  notifyXp: true,
  notifyTasksDue: true,
  notifyTimers: true,
  soundEnabled: true,

  animationsEnabled: true,
  animationSpeed: "1x",
  autoSaveEnabled: true,
  autoSaveIntervalMinutes: 5,
};
