import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Background } from "./components/Background";
import { Sidebar } from "./components/Sidebar";
import { GreetingSection } from "./components/GreetingSection";
import { TasksPage } from "./components/tasks/TasksPage";
import { ProjectsPage } from "./components/projects/ProjectsPage";
import { WindowControlsOverlay } from "./components/WindowControlsOverlay";
import { getBackgroundForTime } from "./utils/timePeriod";
import taskBgImg from "./assets/backgrounds/taskbg.png";
import projectBgImg from "./assets/backgrounds/projectbg.png";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
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

  // Active wallpaper: taskbg.png for Tasks, projectbg.png for Projects, dynamic system time wallpaper for Home/others
  const currentWallpaper =
    activeTab === "tasks" ? taskBgImg : activeTab === "projects" ? projectBgImg : bgUrl;

  return (
    <div className="app-container">
      {/* Background wallpaper with smooth crossfade */}
      <Background bgUrl={currentWallpaper} />

      {/* Expandable translucent dark sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onHoverChange={(hovered) => setIsSidebarHovered(hovered)}
      />

      {/* Main Content Area - Generically adjusts layout offset on sidebar hover */}
      <main className={`main-content ${isSidebarHovered ? "sidebar-expanded" : ""}`}>
        {activeTab === "home" && <GreetingSection />}
        {activeTab === "tasks" && <TasksPage />}
        {activeTab === "projects" && <ProjectsPage />}
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
