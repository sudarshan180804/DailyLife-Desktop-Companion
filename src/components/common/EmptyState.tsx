interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Reusable empty state component with glassmorphic parchment styling.
 */
export function EmptyState({
  icon = "📜",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {actionLabel && onAction && (
        <button className="empty-state-action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
