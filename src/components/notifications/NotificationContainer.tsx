import { useState, useEffect } from "react";
import {
  notificationService,
  AppNotification,
  NotificationType,
} from "../../services/notificationService";
import { SparklesIcon, FlameIcon } from "../Icons";

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "level_up":
      return <FlameIcon size={20} />;
    case "achievement":
      return <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>🏆</span>;
    case "success":
      return <SparklesIcon size={18} />;
    case "warning":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

function SingleNotificationToast({ n }: { n: AppNotification }) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setTimeout(() => {
      notificationService.remove(n.id);
    }, n.duration || 4000);

    return () => clearTimeout(timer);
  }, [n.id, n.duration, isHovered]);

  return (
    <div
      className={`notification-card notification-${n.type}`}
      onClick={() => notificationService.remove(n.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="notification-content-row">
        <div className="notification-icon-wrapper">
          <NotificationIcon type={n.type} />
        </div>

        <div className="notification-text-col">
          <h4 className="notification-title">{n.title}</h4>
          <p className="notification-message">{n.message}</p>
        </div>

        <button
          type="button"
          className="notification-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            notificationService.remove(n.id);
          }}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Global NotificationContainer component.
 * Displays floating top-right notification stack matching app glass aesthetic.
 * Auto-dismisses smoothly with hover pause support and zero countdown progress bars.
 */
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    notificationService.getNotifications()
  );

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications(updated);
    });
    return () => unsubscribe();
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <SingleNotificationToast key={n.id} n={n} />
      ))}
    </div>
  );
}
