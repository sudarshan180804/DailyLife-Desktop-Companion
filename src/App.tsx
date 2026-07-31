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
import { NotificationContainer } from "./components/notifications/NotificationContainer";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSettingsStore } from "./modules/settings";
import { useActiveWallpaper } from "./services/wallpaperService";
import "./App.css";

export function App() {
  const { settings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<string>(() => settings.startupPage || "home");
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);

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

  // Active wallpaper obtained exclusively through WallpaperService
  const currentWallpaper = useActiveWallpaper(activeTab, settings);

  // Register global keyboard shortcuts (Numbers 1-9 for tabs, Esc for overlay)
  useKeyboardShortcuts({
    onSelectTab: (tabId) => setActiveTab(tabId),
    onEscape: () => setIsOverlayVisible(false),
  });

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
      <ErrorBoundary>
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
      </ErrorBoundary>

      {/* Top-Right Floating Notification Stack */}
      <NotificationContainer />

      {/* Top-Right ESC Window Controls Overlay */}
      <WindowControlsOverlay
        isVisible={isOverlayVisible}
        onCloseOverlay={() => setIsOverlayVisible(false)}
      />
    </div>
  );
}

export default App;
