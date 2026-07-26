import { useState } from "react";
import {
  INITIAL_SETTINGS_STATE,
  THEME_OPTIONS,
  ACCENT_COLORS,
} from "../../data/settingsData";
import { SettingsState, SettingsTabId, PanelTint } from "../../types/settings";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("appearance");
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS_STATE);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const handleReset = () => {
    setSettings(INITIAL_SETTINGS_STATE);
  };

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="settings-page-wrapper">
      {/* Toast Notification */}
      {saveToast && (
        <div className="save-toast-notification">
          ✓ Settings saved successfully!
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
            <span className="avatar-emoji">🧙‍♂️</span>
          </div>
          <div className="profile-text-block">
            <span className="profile-name">Sudarshan</span>
            <div className="level-xp-row">
              <span className="level-tag">Level 24</span>
              <span className="xp-val-text">2,450 / 3,500 XP</span>
            </div>
            <div className="mini-xp-bar-bg">
              <div className="mini-xp-bar-fill" style={{ width: "70%" }} />
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
              className={`settings-nav-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <span className="tab-icon">👤</span>
              <span className="tab-label">Profile & Progression</span>
            </button>

            <button
              className={`settings-nav-tab ${activeTab === "integrations" ? "active" : ""}`}
              onClick={() => setActiveTab("integrations")}
            >
              <span className="tab-icon">🔗</span>
              <span className="tab-label">Integrations</span>
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
          {activeTab === "appearance" ? (
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
                  <h3 className="card-title">THEME</h3>
                  <div className="theme-options-grid">
                    {THEME_OPTIONS.map((theme) => (
                      <div
                        key={theme.id}
                        className={`theme-option-box ${
                          settings.theme === theme.id ? "active" : ""
                        }`}
                        onClick={() =>
                          setSettings({ ...settings, theme: theme.id as any })
                        }
                      >
                        <span className="theme-icon">{theme.icon}</span>
                        <span className="theme-name">{theme.label}</span>
                        {settings.theme === theme.id && (
                          <span className="theme-check-badge">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Preview Window */}
                <div className="setting-card live-preview-card">
                  <h3 className="card-title">LIVE PREVIEW</h3>
                  <div className="preview-window-viewport">
                    {/* Simulated Floating Glass Panel inside preview */}
                    <div
                      className="simulated-preview-panel"
                      style={{
                        backdropFilter: `blur(${settings.blurStrength}px)`,
                        WebkitBackdropFilter: `blur(${settings.blurStrength}px)`,
                        background:
                          settings.panelTint === "warm"
                            ? `rgba(35, 20, 12, ${1 - settings.transparency / 100})`
                            : settings.panelTint === "purple"
                            ? `rgba(25, 14, 30, ${1 - settings.transparency / 100})`
                            : `rgba(18, 18, 22, ${1 - settings.transparency / 100})`,
                      }}
                    >
                      <h4 className="preview-panel-title">Preview Panel</h4>
                      <p className="preview-panel-sub">
                        This is how your panels will look.
                      </p>
                      <div className="preview-icons-row">
                        <span>⚔️</span>
                        <span>📖</span>
                        <span>🧭</span>
                      </div>
                      <button
                        className="preview-sample-btn"
                        style={{ backgroundColor: settings.accentColor }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>
                </div>

                {/* Glass Effect Settings */}
                <div className="setting-card glass-effect-card">
                  <h3 className="card-title">GLASS EFFECT</h3>

                  <div className="slider-setting-row">
                    <span className="setting-label">Transparency</span>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={settings.transparency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          transparency: Number(e.target.value),
                        })
                      }
                      className="settings-range-slider"
                    />
                    <span className="slider-value-text">
                      {settings.transparency}%
                    </span>
                  </div>

                  <div className="slider-setting-row">
                    <span className="setting-label">Blur Strength</span>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      value={settings.blurStrength}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          blurStrength: Number(e.target.value),
                        })
                      }
                      className="settings-range-slider"
                    />
                    <span className="slider-value-text">
                      {settings.blurStrength}px
                    </span>
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
                            onChange={() =>
                              setSettings({ ...settings, panelTint: tint })
                            }
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
                        className={`color-circle-btn ${
                          settings.accentColor === item.color ? "selected" : ""
                        }`}
                        style={{ backgroundColor: item.color }}
                        onClick={() =>
                          setSettings({ ...settings, accentColor: item.color })
                        }
                      >
                        {settings.accentColor === item.color && "✓"}
                      </div>
                    ))}
                  </div>

                  <div className="font-settings-block">
                    <h3 className="card-title margin-top-12">FONT</h3>
                    <div className="select-setting-row">
                      <span className="setting-label">UI Font</span>
                      <select
                        value={settings.uiFont}
                        onChange={(e) =>
                          setSettings({ ...settings, uiFont: e.target.value })
                        }
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
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="settings-range-slider"
                      />
                      <span className="slider-value-text">
                        {settings.fontSize}px
                      </span>
                    </div>
                  </div>
                </div>

                {/* Background Settings */}
                <div className="setting-card background-card">
                  <h3 className="card-title">BACKGROUND</h3>
                  <div className="select-setting-row">
                    <span className="setting-label">Background Behavior</span>
                    <select
                      value={settings.backgroundBehavior}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backgroundBehavior: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          dimBackground: Number(e.target.value),
                        })
                      }
                      className="settings-range-slider"
                    />
                    <span className="slider-value-text">
                      {settings.dimBackground}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="other-tab-placeholder">
              <h2 className="placeholder-title">
                {activeTab.toUpperCase()} SETTINGS
              </h2>
              <p className="placeholder-sub">
                Configuration parameters for {activeTab} will be available in future updates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Action Bar */}
      <div className="settings-footer-bar">
        <button className="footer-reset-btn" onClick={handleReset}>
          <span>⏱</span> Reset to Defaults
        </button>

        <div className="footer-right-buttons">
          <button className="footer-cancel-btn">Cancel</button>
          <button
            className="footer-save-btn"
            style={{ backgroundColor: settings.accentColor }}
            onClick={handleSave}
          >
            <span>✔</span> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
