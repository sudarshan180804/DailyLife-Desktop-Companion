import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { STORAGE_KEYS } from "../../constants/appConstants";
import {
  ModuleWidgetConfig,
  CurrentContextState,
  TimeOfDay,
  ActiveWidgetResult,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.SETTINGS + "_context_widgets";

export const DEFAULT_WIDGET_CONFIGS: ModuleWidgetConfig[] = [
  {
    id: "tasks-widget",
    title: "Daily Tasks & Quest Log",
    module: "tasks",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["morning", "afternoon", "evening"],
    preferredDays: [0, 1, 2, 3, 4, 5, 6],
    weekendBehavior: "always",
    priority: 90,
    widgetSize: "medium",
    collapsedByDefault: false,
  },
  {
    id: "gym-widget",
    title: "Gym Workout & Training",
    module: "gym",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["afternoon", "evening"],
    preferredDays: [1, 2, 3, 4, 5, 6],
    weekendBehavior: "always",
    priority: 85,
    widgetSize: "medium",
    collapsedByDefault: false,
  },
  {
    id: "projects-widget",
    title: "Active Projects & Milestones",
    module: "projects",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["morning", "afternoon"],
    preferredDays: [1, 2, 3, 4, 5],
    weekendBehavior: "only_weekday",
    priority: 80,
    widgetSize: "large",
    collapsedByDefault: false,
  },
  {
    id: "japanese-widget",
    title: "Japanese Study & Flashcards",
    module: "japanese",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["morning", "evening"],
    preferredDays: [0, 1, 2, 3, 4, 5, 6],
    weekendBehavior: "always",
    priority: 75,
    widgetSize: "small",
    collapsedByDefault: false,
  },
  {
    id: "notes-widget",
    title: "Daily Journal & Quick Notes",
    module: "notes",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["morning", "evening", "night"],
    preferredDays: [0, 1, 2, 3, 4, 5, 6],
    weekendBehavior: "always",
    priority: 70,
    widgetSize: "medium",
    collapsedByDefault: false,
  },
  {
    id: "music-widget",
    title: "Music Service Launcher",
    module: "music",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["morning", "afternoon", "evening", "night"],
    preferredDays: [0, 1, 2, 3, 4, 5, 6],
    weekendBehavior: "always",
    priority: 60,
    widgetSize: "small",
    collapsedByDefault: false,
  },
  {
    id: "entertainment-widget",
    title: "Entertainment & Continue Watching",
    module: "entertainment",
    showOnHome: true,
    enabled: true,
    preferredTimeBlocks: ["evening", "night"],
    preferredDays: [0, 1, 2, 3, 4, 5, 6],
    weekendBehavior: "always",
    priority: 50,
    widgetSize: "medium",
    collapsedByDefault: false,
  },
];

export class ContextEngine {
  private configs: ModuleWidgetConfig[] = DEFAULT_WIDGET_CONFIGS;

  constructor() {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<ModuleWidgetConfig[]>(STORAGE_KEY);
      if (Array.isArray(saved) && saved.length > 0) {
        // Merge saved configs with default configs to handle newly added widgets safely
        this.configs = DEFAULT_WIDGET_CONFIGS.map((def) => {
          const match = saved.find((s) => s.id === def.id);
          return match ? { ...def, ...match } : def;
        });
      } else {
        this.configs = DEFAULT_WIDGET_CONFIGS;
      }
    } catch (err) {
      console.error("[ContextEngine] Storage init failed:", err);
      this.configs = DEFAULT_WIDGET_CONFIGS;
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.save(STORAGE_KEY, this.configs);
      eventBus.emit("context:updated", this.getCurrentContext());
    } catch (err) {
      console.error("[ContextEngine] Persist failed:", err);
    }
  }

  /**
   * Returns current context state derived from date & time.
   */
  public getCurrentContext(date: Date = new Date()): CurrentContextState {
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isWeekday = !isWeekend;

    let timeOfDay: TimeOfDay = "night";
    if (hour >= 5 && hour < 12) {
      timeOfDay = "morning";
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = "evening";
    } else {
      timeOfDay = "night";
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const timeString = `${String(hour).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
    const dateString = date.toISOString().split("T")[0];

    return {
      timeOfDay,
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      isWeekend,
      isWeekday,
      timeString,
      dateString,
      hour,
    };
  }

  /**
   * Returns widget configurations list.
   */
  public getWidgetConfigs(): ModuleWidgetConfig[] {
    return [...this.configs];
  }

  /**
   * Evaluates active widgets for current context and returns ordered list by score & priority.
   */
  public getActiveWidgets(date: Date = new Date()): ActiveWidgetResult[] {
    const context = this.getCurrentContext(date);
    const results: ActiveWidgetResult[] = [];

    for (const config of this.configs) {
      if (!config.enabled || !config.showOnHome) continue;

      // 1. Check Weekend Behavior
      if (config.weekendBehavior === "never") continue;
      if (config.weekendBehavior === "only_weekend" && !context.isWeekend) continue;
      if (config.weekendBehavior === "only_weekday" && !context.isWeekday) continue;

      // 2. Check Preferred Days
      if (
        Array.isArray(config.preferredDays) &&
        config.preferredDays.length > 0 &&
        !config.preferredDays.includes(context.dayOfWeek)
      ) {
        continue;
      }

      // 3. Check Preferred Time Blocks
      if (
        Array.isArray(config.preferredTimeBlocks) &&
        config.preferredTimeBlocks.length > 0 &&
        !config.preferredTimeBlocks.includes(context.timeOfDay)
      ) {
        continue;
      }

      // Calculate Relevance Score
      let score = config.priority;
      const reasons: string[] = [];

      if (config.preferredTimeBlocks.includes(context.timeOfDay)) {
        score += 15;
        reasons.push(`Matches ${context.timeOfDay} time block`);
      }

      if (config.preferredDays.includes(context.dayOfWeek)) {
        score += 10;
        reasons.push(`Scheduled for ${context.dayName}`);
      }

      results.push({
        config,
        score,
        reason: reasons.join(", ") || "Active context match",
      });
    }

    // Order by score descending
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  /**
   * Updates configuration for a single widget.
   */
  public async updateWidgetConfig(
    widgetId: string,
    updates: Partial<ModuleWidgetConfig>
  ): Promise<boolean> {
    const index = this.configs.findIndex((c) => c.id === widgetId);
    if (index === -1) return false;

    this.configs[index] = { ...this.configs[index], ...updates };
    await this.persist();
    return true;
  }

  /**
   * Saves full widget configuration list.
   */
  public async saveAllConfigs(newConfigs: ModuleWidgetConfig[]): Promise<void> {
    this.configs = newConfigs;
    await this.persist();
  }
}

export const contextEngine = new ContextEngine();
