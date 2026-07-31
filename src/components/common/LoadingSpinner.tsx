interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

/**
 * Reusable fantasy-themed loading spinner component.
 */
export function LoadingSpinner({
  message = "Loading...",
  size = "medium",
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-wrapper size-${size}`}>
      <div className="spinner-rune-ring" />
      {message && <span className="spinner-message-text">{message}</span>}
    </div>
  );
}
