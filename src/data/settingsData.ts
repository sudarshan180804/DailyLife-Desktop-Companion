import { SettingsState } from "../types/settings";

export const INITIAL_SETTINGS_STATE: SettingsState = {
  theme: "dark",
  transparency: 82,
  blurStrength: 4,
  panelTint: "purple",
  accentColor: "#a855f7",
  backgroundBehavior: "Subtle Parallax",
  dimBackground: 35,
  uiFont: "Poppins",
  fontSize: 16,
};

export const THEME_OPTIONS = [
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "dusk", label: "Dusk", icon: "🌅" },
  { id: "light", label: "Light", icon: "☀️" },
  { id: "midnight", label: "Midnight", icon: "🌌" },
];

export const ACCENT_COLORS = [
  { id: "purple", color: "#a855f7" },
  { id: "pink", color: "#ec4899" },
  { id: "blue", color: "#3b82f6" },
  { id: "cyan", color: "#06b6d4" },
  { id: "green", color: "#22c55e" },
  { id: "amber", color: "#f59e0b" },
  { id: "red", color: "#ef4444" },
];
