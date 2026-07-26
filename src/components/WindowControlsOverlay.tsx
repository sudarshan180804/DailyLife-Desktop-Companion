import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MinimizeIcon, MaximizeIcon, CloseIcon } from "./Icons";

interface WindowControlsOverlayProps {
  isVisible: boolean;
  onCloseOverlay: () => void;
}

export function WindowControlsOverlay({ isVisible, onCloseOverlay }: WindowControlsOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseOverlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseOverlay]);

  const handleMinimize = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch (err) {
      console.error("Window controls - Failed to minimize window:", err);
    }
  };

  const handleToggleFullscreen = async () => {
    try {
      const appWindow = getCurrentWindow();
      const isFullscreen = await appWindow.isFullscreen();
      await appWindow.setFullscreen(!isFullscreen);
    } catch (err) {
      console.error("Window controls - Failed to toggle fullscreen:", err);
      // Browser fallback
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => console.error("DOM fullscreen failed:", e));
      } else {
        document.exitFullscreen().catch((e) => console.error("DOM exit fullscreen failed:", e));
      }
    }
  };

  const handleClose = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (err) {
      console.error("Window controls - Failed to close window:", err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="window-overlay">
      <div className="window-overlay-badge">
        <span className="key-cap">ESC</span>
        <span className="overlay-hint-text">to hide menu</span>
      </div>

      <div className="window-overlay-divider" />

      <div className="window-overlay-controls">
        <button
          className="window-overlay-btn"
          onClick={handleMinimize}
          title="Minimize"
          aria-label="Minimize Window"
        >
          <MinimizeIcon size={14} />
        </button>
        <button
          className="window-overlay-btn"
          onClick={handleToggleFullscreen}
          title="Maximize / Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          <MaximizeIcon size={13} />
        </button>
        <button
          className="window-overlay-btn window-overlay-btn-close"
          onClick={handleClose}
          title="Close"
          aria-label="Close Window"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}
