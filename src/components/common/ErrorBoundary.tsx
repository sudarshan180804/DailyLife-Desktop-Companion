import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable ErrorBoundary capturing runtime React errors in component subtrees,
 * preventing total application crashes and rendering a dark glassmorphic recovery screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-icon-crest">🛡️</div>
            <h2 className="error-title">A Minor Disturbance Occurred</h2>
            <p className="error-message">
              {this.state.error?.message || "An unexpected system error took place."}
            </p>
            <div className="error-actions-row">
              <button className="error-reload-btn" onClick={this.handleReset}>
                🔄 Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
