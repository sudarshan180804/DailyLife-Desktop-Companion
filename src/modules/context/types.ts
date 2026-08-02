export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type WeekendBehavior = "always" | "only_weekend" | "only_weekday" | "never";

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface ModuleWidgetConfig {
  id: string;
  title: string;
  module: string; // 'tasks' | 'projects' | 'gym' | 'japanese' | 'entertainment' | 'music' | 'notes'
  showOnHome: boolean;
  enabled: boolean;
  preferredTimeBlocks: TimeOfDay[];
  preferredDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  weekendBehavior: WeekendBehavior;
  priority: number; // Higher number = higher priority
  widgetSize: WidgetSize;
  collapsedByDefault: boolean;
}

export interface CurrentContextState {
  timeOfDay: TimeOfDay;
  dayOfWeek: number; // 0-6
  dayName: string; // 'Monday', 'Tuesday', etc.
  isWeekend: boolean;
  isWeekday: boolean;
  timeString: string; // '22:15'
  dateString: string; // '2026-07-31'
  hour: number;
}

export interface ActiveWidgetResult {
  config: ModuleWidgetConfig;
  score: number;
  reason: string;
}
