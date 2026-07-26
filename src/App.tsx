import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Background } from "./components/Background";
import { Sidebar } from "./components/Sidebar";
import { GreetingSection } from "./components/GreetingSection";
import { TasksPage } from "./components/tasks/TasksPage";
import { ProjectsPage } from "./components/projects/ProjectsPage";
import { GymPage } from "./components/gym/GymPage";
import { NotesPage } from "./components/notes/NotesPage";
import { JapanesePage } from "./components/japanese/JapanesePage";
import { AnimePage } from "./components/anime/AnimePage";
import { MusicPage } from "./components/music/MusicPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { WindowControlsOverlay } from "./components/WindowControlsOverlay";
import { getBackgroundForTime } from "./utils/timePeriod";
import taskBgImg from "./assets/backgrounds/taskbg.png";
import projectBgImg from "./assets/backgrounds/projectbg.png";
import gymBgImg from "./assets/backgrounds/duringworkout.jpeg";
import studyBgImg from "./assets/backgrounds/study.png";
import jpBgImg from "./assets/backgrounds/jpbg.png";
import animeBgImg from "./assets/backgrounds/animebg.png";
import musicBgImg from "./assets/backgrounds/musicbg.png";
import settingBgImg from "./assets/backgrounds/settingbg.png";
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

  // Active wallpaper mapping
  const currentWallpaper =
    activeTab === "tasks"
      ? taskBgImg
      : activeTab === "projects"
      ? projectBgImg
      : activeTab === "gym"
      ? gymBgImg
      : activeTab === "notes"
      ? studyBgImg
      : activeTab === "japanese"
      ? jpBgImg
      : activeTab === "anime"
      ? animeBgImg
      : activeTab === "music"
      ? musicBgImg
      : activeTab === "settings"
      ? settingBgImg
      : bgUrl;

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
        {activeTab === "gym" && <GymPage />}
        {activeTab === "notes" && <NotesPage />}
        {activeTab === "japanese" && <JapanesePage />}
        {activeTab === "anime" && <AnimePage />}
        {activeTab === "music" && <MusicPage />}
        {activeTab === "settings" && <SettingsPage />}
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
