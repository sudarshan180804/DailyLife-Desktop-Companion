export type SettingsTabId =
  | "general"
  | "appearance"
  | "profile"
  | "integrations"
  | "data"
  | "about";

export type ThemeMode = "dark" | "dusk" | "light" | "midnight";

export type PanelTint = "warm" | "neutral" | "purple";

export interface SettingsState {
  theme: ThemeMode;
  transparency: number; // 0 to 100
  blurStrength: number; // 0 to 20
  panelTint: PanelTint;
  accentColor: string; // hex or color key
  backgroundBehavior: string;
  dimBackground: number; // 0 to 100
  uiFont: string;
  fontSize: number; // e.g. 16
}
