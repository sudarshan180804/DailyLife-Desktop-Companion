import { eventBus } from "./eventBus";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "level_up"
  | "achievement";

/**
 * AppNotification data model.
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  duration?: number;
}

const DEFAULT_DURATION = 4000; // 4 seconds auto-dismiss
const MAX_VISIBLE = 3; // Maximum 3 visible notifications at once

type NotificationListener = (notifications: AppNotification[]) => void;

/**
 * NotificationService manages in-app notifications, queuing, auto-dismissal, and event handling.
 * Subscribes to EventBus events ('task:completed', 'xp:changed', 'level:up', 'achievement:unlocked')
 * and emits 'notification:added' / 'notification:removed' events.
 */
export class NotificationService {
  private visible: AppNotification[] = [];
  private queue: AppNotification[] = [];
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private listeners: Set<NotificationListener> = new Set();

  constructor() {
    // Subscribe to domain events via EventBus
    eventBus.subscribe("task:completed", (payload) => this.handleTaskCompleted(payload));
    eventBus.subscribe("level:up", (payload) => this.handleLevelUp(payload));
    eventBus.subscribe("achievement:unlocked", (payload) =>
      this.handleAchievementUnlocked(payload)
    );
    eventBus.subscribe("xp:changed", (payload) => this.handleXPChanged(payload));
  }

  private handleTaskCompleted(payload?: any): void {
    const taskTitle = payload?.task?.title;
    const xp = payload?.xpReward || payload?.task?.xpReward;
    const message = taskTitle
      ? `Completed "${taskTitle}"${xp ? ` (+${xp} XP)` : ""}`
      : `Task completed!${xp ? ` (+${xp} XP)` : ""}`;

    this.notify("success", message, "Task Completed");
  }

  private handleLevelUp(payload?: any): void {
    const level = payload?.newLevel || "";
    const message = `Congratulations! You reached Level ${level}!`;
    this.notify("level_up", message, "Level Up! 🎉");
  }

  private handleAchievementUnlocked(payload?: any): void {
    const icon = payload?.achievement?.icon || "🏆";
    const title = payload?.achievement?.title || "Achievement";
    const message = `${icon} ${title}`;
    this.notify("achievement", message, "Achievement Unlocked!");
  }

  private handleXPChanged(payload?: any): void {
    if (payload && payload.delta && payload.delta > 0 && payload.reason) {
      this.notify(
        "info",
        `+${payload.delta} XP (${payload.reason})`,
        "XP Gained"
      );
    }
  }

  private getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case "success":
        return "Success";
      case "warning":
        return "Warning";
      case "level_up":
        return "Level Up!";
      case "achievement":
        return "Achievement!";
      default:
        return "Notification";
    }
  }

  private scheduleDismiss(notification: AppNotification): void {
    const duration = notification.duration || DEFAULT_DURATION;
    const timer = setTimeout(() => {
      this.remove(notification.id);
    }, duration);

    this.timers.set(notification.id, timer);
  }

  private processQueue(): void {
    while (this.visible.length < MAX_VISIBLE && this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.visible.push(next);
      this.scheduleDismiss(next);
      eventBus.emit("notification:added", { notification: next });
    }
  }

  private notifyListeners(): void {
    const copy = this.getNotifications();
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.error("[NotificationService] Error in listener callback:", err);
      }
    });
  }

  /**
   * Triggers a new notification.
   * If maximum visible notifications limit is reached, queues it until space opens.
   *
   * @param type Category type of notification.
   * @param message Main notification text message.
   * @param title Optional header title.
   * @param duration Optional custom auto-dismiss duration in ms (defaults to 4000ms).
   * @returns Created AppNotification object.
   */
  notify(
    type: NotificationType,
    message: string,
    title?: string,
    duration?: number
  ): AppNotification {
    const notification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      title: title || this.getDefaultTitle(type),
      message,
      timestamp: new Date().toISOString(),
      duration: duration || DEFAULT_DURATION,
    };

    if (this.visible.length < MAX_VISIBLE) {
      this.visible.push(notification);
      this.scheduleDismiss(notification);
      eventBus.emit("notification:added", { notification });
      this.notifyListeners();
    } else {
      this.queue.push(notification);
    }

    return notification;
  }

  /**
   * Removes a notification by ID and processes queued items.
   * Emits 'notification:removed' event via EventBus.
   *
   * @param id Unique notification identifier.
   */
  remove(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const wasVisible = this.visible.some((n) => n.id === id);
    this.visible = this.visible.filter((n) => n.id !== id);
    this.queue = this.queue.filter((n) => n.id !== id);

    if (wasVisible) {
      eventBus.emit("notification:removed", { notificationId: id });
      this.processQueue();
      this.notifyListeners();
    }
  }

  /**
   * Clears all active and queued notifications.
   */
  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.visible = [];
    this.queue = [];
    this.notifyListeners();
  }

  /**
   * Returns array of currently active visible notifications.
   */
  getNotifications(): AppNotification[] {
    return [...this.visible];
  }

  /**
   * Subscribes a listener function to notification state changes.
   *
   * @param listener Callback function receiving active notifications array.
   * @returns Unsubscribe function.
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/**
 * Global singleton instance of NotificationService.
 */
export const notificationService = new NotificationService();
