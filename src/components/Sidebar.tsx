import { useState } from "react";
import natsuProfileImg from "../assets/profile/natsu-profile.png";
import {
  HomeIcon,
  TasksIcon,
  ProjectsIcon,
  GymIcon,
  NotesIcon,
  JapaneseIcon,
  AnimeIcon,
  MusicIcon,
  SettingsIcon
} from "./Icons";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface UserProfile {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  avatarUrl?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Sudarshan",
  level: 1,
  currentXp: 10,
  nextLevelXp: 100,
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "tasks", label: "Tasks", icon: TasksIcon },
  { id: "projects", label: "Projects", icon: ProjectsIcon },
  { id: "gym", label: "Gym", icon: GymIcon },
  { id: "notes", label: "Notes", icon: NotesIcon },
  { id: "japanese", label: "Japanese", icon: JapaneseIcon },
  { id: "anime", label: "Anime", icon: AnimeIcon },
  { id: "music", label: "Music", icon: MusicIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

interface SidebarProps {
  profile?: UserProfile;
  onHoverChange?: (isHovered: boolean) => void;
}

export function Sidebar({ profile = DEFAULT_PROFILE, onHoverChange }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("home");

  const xpPercent = Math.min(100, Math.max(0, (profile.currentXp / profile.nextLevelXp) * 100));

  return (
    <aside
      className="sidebar"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {/* Prominent Horizontally-Centered Profile Section */}
      <div className="sidebar-profile-section">
        <div className="profile-avatar-wrapper">
          <img
            src={natsuProfileImg}
            alt={profile.name}
            className="profile-avatar-img"
          />
        </div>

        <div className="profile-expanded-details">
          <h2 className="profile-username">{profile.name}</h2>
          <span className="profile-level-badge">Level {profile.level}</span>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <span className="xp-text">
            {profile.currentXp} / {profile.nextLevelXp} XP
          </span>
        </div>
      </div>

      {/* Navigation List - Vertically Centered Group */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">
                <Icon size={24} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
