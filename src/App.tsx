import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Background } from "./components/Background";
import { Sidebar } from "./components/Sidebar";
import { GreetingSection } from "./components/GreetingSection";
import { WindowControlsOverlay } from "./components/WindowControlsOverlay";
import { getBackgroundForTime } from "./utils/timePeriod";
import "./App.css";

export function App() {
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const [bgUrl, setBgUrl] = useState<string>(() => getBackgroundForTime());

  // Enforce true fullscreen on launch in Tauri environment
  useEffect(() => {
    const initFullscreen = async () => {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.setFullscreen(true);
      } catch (err) {
        console.warn("Fullscreen initialization fallback in web mode:", err);
      }
    };
    initFullscreen();
  }, []);

  // ESC key toggles top-right window overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOverlayVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Periodically re-evaluate time to auto-switch background when period changes
  useEffect(() => {
    const checkTimeBackground = () => {
      const newBg = getBackgroundForTime();
      setBgUrl((prevBg) => (prevBg !== newBg ? newBg : prevBg));
    };

    // Re-check every 30 seconds
    const interval = setInterval(checkTimeBackground, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Background wallpaper with smooth crossfade */}
      <Background bgUrl={bgUrl} />

      {/* Expandable translucent dark sidebar */}
      <Sidebar onHoverChange={(hovered) => setIsSidebarHovered(hovered)} />

      {/* Main Home Content Area */}
      <main className="main-content">
        <GreetingSection isFaded={isSidebarHovered} />
      </main>

      {/* Top-Right ESC Window Controls Overlay */}
      <WindowControlsOverlay
        isVisible={isOverlayVisible}
        onCloseOverlay={() => setIsOverlayVisible(false)}
      />
    </div>
  );
}

export default App;
