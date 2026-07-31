import { useState } from "react";
import {
  THEME_OPTIONS,
  ACCENT_COLORS,
} from "../../data/settingsData";
import { useSettingsStore } from "../../modules/settings";
import { profileService } from "../../services/profileService";
import { nativeDialogService } from "../../services/nativeDialogService";
import { wallpaperService } from "../../services/wallpaperService";
import type { SettingsTabId, PanelTint, SidebarBehavior, StartupPageId, AnimationSpeed } from "../../types/settings";

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetSection,
    factoryReset,
    exportSettingsJSON,
    importSettingsJSON,
    setPageBackground,
  } = useSettingsStore();

  const profile = profileService.getProfile();

  const [activeTab, setActiveTab] = useState<SettingsTabId>("appearance");
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportSettingsJSON();
    navigator.clipboard.writeText(jsonStr);
    showToast("📋 Settings JSON copied to clipboard!");
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    await importSettingsJSON(importJsonText.trim());
    setIsImportModalOpen(false);
    setImportJsonText("");
    showToast("✓ Settings JSON imported successfully!");
  };

  return (
    <div className="settings-page-wrapper">
      {/* Toast Notification */}
      {saveToast && (
        <div className="save-toast-notification">
          {saveToast}
        </div>
      )}

      {/* Top Header Section */}
      <div className="settings-header-bar">
        <div className="settings-header-left">
          <div className="settings-title-row">
            <h1 className="settings-page-title">SETTINGS</h1>
            <span className="gear-icon">⚙️</span>
          </div>
          <p className="settings-subtitle">Fine tune your world. Make it truly yours.</p>
        </div>

        {/* Top Right Profile Badge */}
        <div className="settings-profile-badge">
          <div className="profile-avatar-box">
            <span className="avatar-emoji">{profile.avatar || "🧙‍♂️"}</span>
          </div>
          <div className="profile-text-block">
            <span className="profile-name">{profile.name || "Adventurer"}</span>
            <div className="level-xp-row">
              <span className="level-tag">Level {profile.level || 1}</span>
              <span className="xp-val-text">{profile.currentXP || 0} XP</span>
            </div>
            <div className="mini-xp-bar-bg">
              <div
                className="mini-xp-bar-fill"
                style={{ width: `${Math.min(100, Math.round(((profile.currentXP || 0) / 1000) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left Sidebar Navigation + Right Settings Panel */}
      <div className="settings-main-grid">
        {/* Left Section Navigation Sidebar */}
        <div className="settings-sidebar-panel">
          <div className="nav-tabs-list">
            <button
              className={`settings-nav-tab ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              <span className="tab-icon">⚙️</span>
              <span className="tab-label">General</span>
            </button>

            <button
              className={`settings-nav-tab ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              <span className="tab-icon">🔮</span>
              <span className="tab-label">Appearance</span>
            </button>

            <button
              className={`settings-nav-tab ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <span className="tab-icon">🔔</span>
              <span className="tab-label">Notifications</span>
            </button>

            <button
              className={`settings-nav-tab ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <span className="tab-icon">⚡</span>
              <span className="tab-label">Performance</span>
            </button>

            <button
              className={`settings-nav-tab ${activeTab === "data" ? "active" : ""}`}
              onClick={() => setActiveTab("data")}
            >
              <span className="tab-icon">💾</span>
              <span className="tab-label">Data & Storage</span>
            </button>

            <button
              className={`settings-nav-tab ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <span className="tab-icon">ⓘ</span>
              <span className="tab-label">About</span>
            </button>
          </div>

          {/* Lower Heraldic Crest Box */}
          <div className="crest-quote-box">
            <div className="heraldic-crest-emblem">
              <span className="shield-icon">🛡️</span>
              <span className="swords-icon">⚔️</span>
            </div>
            <p className="crest-quote-text">
              Discipline in settings leads to mastery in life.
            </p>
          </div>
        </div>

        {/* Right Settings Workspace Area */}
        <div className="settings-content-panel">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="appearance-workspace">
              <div className="section-header-block">
                <div className="title-row">
                  <span className="section-icon">⚙️</span>
                  <h2 className="section-title">GENERAL SETTINGS</h2>
                </div>
                <p className="section-subtitle">Configure application behavior, startup pages, and desktop integration.</p>
              </div>

              <div className="appearance-controls-grid">
                <div className="setting-card">
                  <h3 className="card-title">STARTUP & NAVIGATION</h3>

                  <div className="select-setting-row">
                    <span className="setting-label">Default Startup Page</span>
                    <select
                      value={settings.startupPage}
                      onChange={(e) => updateSettings({ startupPage: e.target.value as StartupPageId })}
                      className="settings-select-dropdown"
                    >
                      <option value="home">Home Dashboard</option>
                      <option value="tasks">Tasks Board</option>
                      <option value="projects">Projects Workspace</option>
                      <option value="gym">Gym & Fitness</option>
                      <option value="notes">Notes Overview</option>
                      <option value="japanese">Japanese Learning</option>
                      <option value="anime">Anime Watchlist</option>
                      <option value="music">Music Player</option>
                      <option value="settings">Settings</option>
                    </select>
                  </div>

                  <div className="radio-setting-row margin-top-16">
                    <span className="setting-label">Sidebar Behavior</span>
                    <div className="radio-options-group">
                      {(["expanded", "collapsed", "hover_expand"] as SidebarBehavior[]).map((sb) => (
                        <label key={sb} className="tint-radio-lbl">
                          <input
                            type="radio"
                            name="sidebarBehavior"
                            checked={settings.sidebarBehavior === sb}
                            onChange={() => updateSettings({ sidebarBehavior: sb })}
                            className="tint-radio-input"
                          />
                          <span className="tint-radio-name">
                            {sb === "expanded" ? "Expanded" : sb === "collapsed" ? "Collapsed" : "Hover Expand"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">WINDOWS & SYSTEM INTEGRATION</h3>

                  <div className="radio-setting-row">
                    <span className="setting-label">Start with Windows</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.startWithWindows}
                        onChange={(e) => updateSettings({ startWithWindows: e.target.checked })}
                      />
                      <span className="tint-radio-name">Launch DailyLife on System Boot</span>
                    </label>
                  </div>

                  <div className="radio-setting-row margin-top-12">
                    <span className="setting-label">Minimize to Tray</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.minimizeToTray}
                        onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                      />
                      <span className="tint-radio-name">Keep running in Windows System Tray</span>
                    </label>
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">AUTO-SAVE CONFIGURATION</h3>

                  <div className="radio-setting-row">
                    <span className="setting-label">Enable Auto-Save</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.autoSaveEnabled}
                        onChange={(e) => updateSettings({ autoSaveEnabled: e.target.checked })}
                      />
                      <span className="tint-radio-name">Automatically persist changes</span>
                    </label>
                  </div>

                  {settings.autoSaveEnabled && (
                    <div className="select-setting-row margin-top-12">
                      <span className="setting-label">Auto-Save Interval</span>
                      <select
                        value={settings.autoSaveIntervalMinutes}
                        onChange={(e) => updateSettings({ autoSaveIntervalMinutes: Number(e.target.value) })}
                        className="settings-select-dropdown"
                      >
                        <option value={1}>Every 1 minute</option>
                        <option value={5}>Every 5 minutes</option>
                        <option value={10}>Every 10 minutes</option>
                        <option value={30}>Every 30 minutes</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="setting-card">
                  <h3 className="card-title">SECTION RESET</h3>
                  <p className="section-subtext">Reset General Settings back to system defaults.</p>
                  <button className="footer-reset-btn margin-top-12" onClick={() => resetSection("general")}>
                    🔄 Reset General Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="appearance-workspace">
              <div className="section-header-block">
                <div className="title-row">
                  <span className="section-icon">🔮</span>
                  <h2 className="section-title">APPEARANCE</h2>
                </div>
                <p className="section-subtitle">Customize how DailyLife looks and feels.</p>
              </div>

              {/* Grid Layout for Controls & Preview */}
              <div className="appearance-controls-grid">
                {/* Theme Selector */}
                <div className="setting-card theme-card">
                  <h3 className="card-title">THEME MODE</h3>
                  <div className="theme-options-grid">
                    {THEME_OPTIONS.map((theme) => (
                      <div
                        key={theme.id}
                        className={`theme-option-box ${settings.theme === theme.id ? "active" : ""}`}
                        onClick={() => updateSettings({ theme: theme.id as any })}
                      >
                        <span className="theme-icon">{theme.icon}</span>
                        <span className="theme-name">{theme.label}</span>
                        {settings.theme === theme.id && <span className="theme-check-badge">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Miniature Live Home Page Preview */}
                <div className="setting-card live-preview-card">
                  <h3 className="card-title">LIVE MINI HOME PREVIEW</h3>
                  <p className="section-subtext">Real-time rendering using active global theme variables.</p>
                  <div className="preview-window-viewport">
                    <div
                      className="simulated-preview-panel"
                      style={{
                        backdropFilter: `blur(${settings.blurStrength}px)`,
                        WebkitBackdropFilter: `blur(${settings.blurStrength}px)`,
                        background:
                          settings.panelTint === "warm"
                            ? `rgba(35, 20, 12, ${(100 - settings.transparency) / 100})`
                            : settings.panelTint === "purple"
                            ? `rgba(25, 14, 30, ${(100 - settings.transparency) / 100})`
                            : `rgba(18, 18, 22, ${(100 - settings.transparency) / 100})`,
                        fontFamily: `${settings.uiFont}, sans-serif`,
                      }}
                    >
                      <div className="mini-greeting-header">
                        <span className="mini-emoji">{profile.avatar || "🧙‍♂️"}</span>
                        <div className="mini-greeting-text">
                          <span className="mini-salutation">Good Evening,</span>
                          <span className="mini-name">{profile.name || "Adventurer"}</span>
                        </div>
                      </div>

                      <div className="mini-stats-row">
                        <div className="mini-badge">
                          <span>Level {profile.level || 1}</span>
                          <div className="mini-xp-fill-track">
                            <div
                              className="mini-xp-fill"
                              style={{
                                width: `${Math.min(100, Math.round(((profile.currentXP || 0) / 1000) * 100))}%`,
                                backgroundColor: settings.accentColor,
                              }}
                            />
                          </div>
                        </div>
                        <div className="mini-badge">
                          <span>🪙 {profile.coins || 0}</span>
                        </div>
                      </div>

                      <div className="mini-quest-card">
                        <span className="mini-quest-title">⚔️ Daily Guild Quest</span>
                        <span className="mini-quest-sub">Complete 3 Tasks for +100 XP</span>
                        <button
                          className="mini-action-btn"
                          style={{ backgroundColor: settings.accentColor }}
                        >
                          Claim Quest
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glass Effect Settings */}
                <div className="setting-card glass-effect-card">
                  <h3 className="card-title">GLASS & TRANSPARENCY</h3>

                  <div className="slider-setting-row">
                    <span className="setting-label">Transparency</span>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={settings.transparency}
                      onChange={(e) => updateSettings({ transparency: Number(e.target.value) })}
                      className="settings-range-slider"
                    />
                    <span className="slider-value-text">{settings.transparency}%</span>
                  </div>

                  <div className="slider-setting-row">
                    <span className="setting-label">Blur Strength</span>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={settings.blurStrength}
                      onChange={(e) => updateSettings({ blurStrength: Number(e.target.value) })}
                      className="settings-range-slider"
                    />
                    <span className="slider-value-text">{settings.blurStrength}px</span>
                  </div>

                  <div className="radio-setting-row">
                    <span className="setting-label">Panel Tint</span>
                    <div className="radio-options-group">
                      {(["warm", "neutral", "purple"] as PanelTint[]).map((tint) => (
                        <label key={tint} className="tint-radio-lbl">
                          <input
                            type="radio"
                            name="panelTint"
                            checked={settings.panelTint === tint}
                            onChange={() => updateSettings({ panelTint: tint })}
                            className="tint-radio-input"
                          />
                          <span className="tint-radio-name">
                            {tint.charAt(0).toUpperCase() + tint.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* UI Accent Color & Font Settings */}
                <div className="setting-card accent-font-card">
                  <h3 className="card-title">UI ACCENT COLOR</h3>
                  <div className="accent-colors-picker">
                    {ACCENT_COLORS.map((item) => (
                      <div
                        key={item.id}
                        className={`color-circle-btn ${settings.accentColor === item.color ? "selected" : ""}`}
                        style={{ backgroundColor: item.color }}
                        onClick={() => updateSettings({ accentColor: item.color })}
                      >
                        {settings.accentColor === item.color && "✓"}
                      </div>
                    ))}
                  </div>

                  <div className="font-settings-block">
                    <h3 className="card-title margin-top-12">FONT & SCALING</h3>
                    <div className="select-setting-row">
                      <span className="setting-label">UI Font</span>
                      <select
                        value={settings.uiFont}
                        onChange={(e) => updateSettings({ uiFont: e.target.value })}
                        className="settings-select-dropdown"
                      >
                        <option value="Poppins">Poppins</option>
                        <option value="Inter">Inter</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Outfit">Outfit</option>
                      </select>
                    </div>

                    <div className="slider-setting-row">
                      <span className="setting-label">Font Size</span>
                      <input
                        type="range"
                        min="12"
                        max="22"
                        value={settings.fontSize}
                        onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                        className="settings-range-slider"
                      />
                      <span className="slider-value-text">{settings.fontSize}px</span>
                    </div>

                    <div className="slider-setting-row">
                      <span className="setting-label">Font Scale</span>
                      <input
                        type="range"
                        min="80"
                        max="130"
                        value={settings.fontScale}
                        onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })}
                        className="settings-range-slider"
                      />
                      <span className="slider-value-text">{settings.fontScale}%</span>
                    </div>
                  </div>
                </div>

                {/* Background Settings & Per-Page Wallpapers */}
                <div className="setting-card background-card span-2">
                  <h3 className="card-title">BACKGROUND & OVERLAY</h3>

                  <div className="form-grid-2col">
                    <div className="select-setting-row">
                      <span className="setting-label">Background Behavior</span>
                      <select
                        value={settings.bgBehavior}
                        onChange={(e) => updateSettings({ bgBehavior: e.target.value })}
                        className="settings-select-dropdown"
                      >
                        <option value="Subtle Parallax">Subtle Parallax</option>
                        <option value="Static Cover">Static Cover</option>
                        <option value="Zoom Pan">Zoom Pan</option>
                      </select>
                    </div>

                    <div className="slider-setting-row">
                      <span className="setting-label">Dim Background</span>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={settings.dimBackground}
                        onChange={(e) => updateSettings({ dimBackground: Number(e.target.value) })}
                        className="settings-range-slider"
                      />
                      <span className="slider-value-text">{settings.dimBackground}%</span>
                    </div>
                  </div>

                  {/* Per-Page Wallpaper Assignment */}
                  <h3 className="card-title margin-top-16">PER-PAGE CUSTOM WALLPAPERS</h3>
                  <p className="section-subtext">Each page renders its own custom or bundled background wallpaper with automatic fallback.</p>

                  <div className="per-page-bgs-grid margin-top-12">
                    {[
                      { id: "home", label: "🏠 Home Dashboard" },
                      { id: "tasks", label: "📝 Tasks Board" },
                      { id: "projects", label: "🚀 Projects Workspace" },
                      { id: "gym", label: "🏋️ Gym & Fitness" },
                      { id: "notes", label: "📚 Notes Overview" },
                      { id: "japanese", label: "⛩️ Japanese Study" },
                      { id: "anime", label: "🎬 Entertainment Hub" },
                      { id: "music", label: "🎵 Music Player" },
                      { id: "settings", label: "⚙️ Settings" },
                    ].map((page) => {
                      const customBg = settings.pageBackgrounds?.[page.id];
                      const bundledBg = wallpaperService.getBundledDefault(page.id);
                      const displayUrl = nativeDialogService.formatAssetUrl(customBg || bundledBg);
                      const filename = customBg ? customBg.split(/[\/\\]/).pop() : "Bundled Default";

                      return (
                        <div key={page.id} className="page-bg-config-row">
                          <div className="page-bg-preview-box">
                            <img src={displayUrl} alt={page.label} className="page-bg-thumbnail" />
                          </div>

                          <div className="page-bg-info">
                            <span className="page-bg-name">{page.label}</span>
                            <span className="page-bg-path">{customBg ? `Custom: ${filename}` : "Bundled Default"}</span>
                          </div>

                          <div className="page-bg-actions">
                            <button
                              type="button"
                              className="add-launcher-btn"
                              onClick={async () => {
                                const path = await nativeDialogService.pickFile(
                                  `Select Background Image for ${page.label}`,
                                  "Image Files (*.png, *.jpg, *.jpeg, *.webp)",
                                  ["png", "jpg", "jpeg", "webp"]
                                );
                                if (path) {
                                  const importedUrl = await nativeDialogService.importWallpaper(path);
                                  await setPageBackground(page.id, importedUrl);
                                }
                              }}
                            >
                              📁 Choose Custom
                            </button>

                            {customBg && (
                              <button
                                type="button"
                                className="config-delete-btn"
                                onClick={async () => {
                                  const updated = { ...(settings.pageBackgrounds || {}) };
                                  delete updated[page.id];
                                  await updateSettings({ pageBackgrounds: updated });
                                }}
                                title="Remove Custom (Restores Bundled Wallpaper)"
                              >
                                Remove Custom
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">SECTION RESET</h3>
                  <p className="section-subtext">Reset Appearance Settings back to default theme.</p>
                  <button className="footer-reset-btn margin-top-12" onClick={() => resetSection("appearance")}>
                    🔄 Reset Appearance Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="appearance-workspace">
              <div className="section-header-block">
                <div className="title-row">
                  <span className="section-icon">🔔</span>
                  <h2 className="section-title">NOTIFICATIONS SETTINGS</h2>
                </div>
                <p className="section-subtitle">Manage alert banners, category filters, and sound cues.</p>
              </div>

              <div className="appearance-controls-grid">
                <div className="setting-card">
                  <h3 className="card-title">GLOBAL NOTIFICATIONS</h3>

                  <div className="radio-setting-row">
                    <span className="setting-label">Enable Notifications</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.notificationsEnabled}
                        onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                      />
                      <span className="tint-radio-name">Show toast alerts in app</span>
                    </label>
                  </div>

                  <div className="radio-setting-row margin-top-12">
                    <span className="setting-label">Sound Cues</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      />
                      <span className="tint-radio-name">Play audio chime on notifications</span>
                    </label>
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">NOTIFICATION CATEGORIES</h3>

                  <div className="radio-setting-row">
                    <span className="setting-label">Achievements</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.notifyAchievements}
                        onChange={(e) => updateSettings({ notifyAchievements: e.target.checked })}
                      />
                      <span className="tint-radio-name">Achievement unlocked alerts</span>
                    </label>
                  </div>

                  <div className="radio-setting-row margin-top-8">
                    <span className="setting-label">XP & Level Ups</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.notifyXp}
                        onChange={(e) => updateSettings({ notifyXp: e.target.checked })}
                      />
                      <span className="tint-radio-name">XP gain and level up toasts</span>
                    </label>
                  </div>

                  <div className="radio-setting-row margin-top-8">
                    <span className="setting-label">Tasks Due Today</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.notifyTasksDue}
                        onChange={(e) => updateSettings({ notifyTasksDue: e.target.checked })}
                      />
                      <span className="tint-radio-name">Task deadline reminders</span>
                    </label>
                  </div>

                  <div className="radio-setting-row margin-top-8">
                    <span className="setting-label">Timers & Alarms</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.notifyTimers}
                        onChange={(e) => updateSettings({ notifyTimers: e.target.checked })}
                      />
                      <span className="tint-radio-name">Scheduled timer notifications</span>
                    </label>
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">SECTION RESET</h3>
                  <p className="section-subtext">Reset Notification preferences to default state.</p>
                  <button className="footer-reset-btn margin-top-12" onClick={() => resetSection("notifications")}>
                    🔄 Reset Notifications Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERFORMANCE */}
          {activeTab === "performance" && (
            <div className="appearance-workspace">
              <div className="section-header-block">
                <div className="title-row">
                  <span className="section-icon">⚡</span>
                  <h2 className="section-title">PERFORMANCE & ANIMATIONS</h2>
                </div>
                <p className="section-subtitle">Optimize rendering speed and animation transitions.</p>
              </div>

              <div className="appearance-controls-grid">
                <div className="setting-card">
                  <h3 className="card-title">UI ANIMATIONS</h3>

                  <div className="radio-setting-row">
                    <span className="setting-label">Enable Animations</span>
                    <label className="tint-radio-lbl">
                      <input
                        type="checkbox"
                        checked={settings.animationsEnabled}
                        onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
                      />
                      <span className="tint-radio-name">Smooth transitions & micro-animations</span>
                    </label>
                  </div>

                  {settings.animationsEnabled && (
                    <div className="select-setting-row margin-top-16">
                      <span className="setting-label">Animation Speed</span>
                      <select
                        value={settings.animationSpeed}
                        onChange={(e) => updateSettings({ animationSpeed: e.target.value as AnimationSpeed })}
                        className="settings-select-dropdown"
                      >
                        <option value="0.5x">0.5x (Slow Motion)</option>
                        <option value="1x">1x (Normal Speed)</option>
                        <option value="1.5x">1.5x (Fast)</option>
                        <option value="2x">2x (Ultra Fast)</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="setting-card">
                  <h3 className="card-title">SECTION RESET</h3>
                  <p className="section-subtext">Reset Performance settings to default.</p>
                  <button className="footer-reset-btn margin-top-12" onClick={() => resetSection("performance")}>
                    🔄 Reset Performance Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & STORAGE */}
          {activeTab === "data" && (
            <div className="appearance-workspace">
              <div className="section-header-block">
                <div className="title-row">
                  <span className="section-icon">💾</span>
                  <h2 className="section-title">DATA & BACKUP MANAGEMENT</h2>
                </div>
                <p className="section-subtitle">Backup, export, import or restore application configuration.</p>
              </div>

              <div className="appearance-controls-grid">
                <div className="setting-card">
                  <h3 className="card-title">BACKUP & EXPORT</h3>
                  <p className="section-subtext">Copy settings configuration as JSON to clipboard.</p>

                  <div className="margin-top-12">
                    <button type="button" className="add-launcher-btn" onClick={handleExport}>
                      📋 Export Settings JSON
                    </button>
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">RESTORE & IMPORT</h3>
                  <p className="section-subtext">Paste or import settings JSON object.</p>

                  <div className="margin-top-12">
                    <button type="button" className="add-launcher-btn" onClick={() => setIsImportModalOpen(true)}>
                      📥 Import Settings JSON
                    </button>
                  </div>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">FACTORY RESET</h3>
                  <p className="section-subtext">Restores all settings, layout, and configuration back to factory default state.</p>

                  <div className="margin-top-12">
                    <button type="button" className="config-delete-btn" onClick={factoryReset}>
                      ⚠️ Factory Reset App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT */}
          {activeTab === "about" && (
            <div className="appearance-workspace">
              <div className="section-header-block">
                <div className="title-row">
                  <span className="section-icon">ⓘ</span>
                  <h2 className="section-title">ABOUT DAILYLIFE</h2>
                </div>
                <p className="section-subtitle">Personalized desktop companion & quest engine.</p>
              </div>

              <div className="appearance-controls-grid">
                <div className="setting-card">
                  <h3 className="card-title">SYSTEM DETAILS</h3>
                  <p className="description-body">
                    <strong>Version:</strong> v0.1.0 (Production Build)<br />
                    <strong>Architecture:</strong> Tauri 2 + React 19 + TypeScript + Vite<br />
                    <strong>Platform:</strong> Windows Desktop Companion<br />
                    <strong>Build Mode:</strong> Local Native App
                  </p>
                </div>

                <div className="setting-card">
                  <h3 className="card-title">GUILD LICENSE & CREST</h3>
                  <p className="description-body">
                    Crafted for guild adventurers and creators aiming for daily progress, gamified questing, and focus mastery.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Action Bar */}
      <div className="settings-footer-bar">
        <button className="footer-reset-btn" onClick={() => resetSection("appearance")}>
          <span>⏱</span> Reset Appearance
        </button>

        <div className="footer-right-buttons">
          <button className="footer-cancel-btn" onClick={() => resetSection("appearance")}>
            Cancel
          </button>
          <button
            className="footer-save-btn"
            style={{ backgroundColor: settings.accentColor }}
            onClick={() => showToast("✓ All settings saved and applied to system!")}
          >
            <span>✔</span> Save & Apply Changes
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay-backdrop">
          <div className="error-boundary-card new-task-modal-card">
            <h3 className="error-title">📥 Import Settings JSON</h3>

            <form onSubmit={handleImportSubmit} className="modal-form-body">
              <div className="form-group">
                <label className="form-lbl">Paste Settings JSON</label>
                <textarea
                  className="settings-textarea"
                  rows={6}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"theme": "dark", "accentColor": "#a855f7"...}'
                  required
                />
              </div>

              <div className="settings-action-row">
                <button type="button" className="config-delete-btn" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-settings-btn">
                  Import & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
