import { useState, useEffect, useRef } from "react";
import { useMusicStore } from "../../modules/music";
import { useProfileStore } from "../../stores/profileStore";
import { nativeDialogService } from "../../services/nativeDialogService";
import {
  LauncherPlaylist,
  MusicPlatformService,
  SortOption,
} from "../../modules/music/types";

const PRESET_ICONS = ["☕", "🏋️", "⛩️", "💻", "📖", "🎵", "🎧", "⚡", "🔥", "🌸", "🚀", "🌙"];
const PRESET_COLORS = ["#a855f7", "#ef4444", "#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

interface ContextMenuState {
  x: number;
  y: number;
  playlist: LauncherPlaylist;
}

export function MusicPage() {
  const {
    playlists = [],
    filteredPlaylists = [],
    mostLaunchedPlaylists = [],
    categories = [],
    recentlyOpened = [],
    lastOpenedPlaylist,
    preferredService = "spotify",
    launchMode = "auto",
    sortOption = "manual",
    confirmExternalLaunch = false,
    stats = { playlistsLaunched: 0, streakDays: 7, totalListenSessions: 0 },
    activeCategory = "All",
    searchQuery = "",
    setActiveCategory,
    setSearchQuery,
    setPreferredService,
    setLaunchMode,
    setSortOption,
    setConfirmExternalLaunch,
    reorderPlaylists,
    addPlaylist,
    duplicatePlaylist,
    updatePlaylist,
    deletePlaylist,
    toggleFavorite,
    togglePin,
    addCategory,
    deleteCategory,
    launchPlaylist,
    launchServicePlatform,
    exportJSON,
    importJSON,
  } = useMusicStore();

  const { profile } = useProfileStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>("");
  const [catIcon, setCatIcon] = useState<string>("🎵");
  const [catColor, setCatColor] = useState<string>("#a855f7");

  // Import JSON Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Selected Card for Keyboard Navigation
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Form Fields for Playlist Add/Edit
  const [formTitle, setFormTitle] = useState<string>("");
  const [formUrl, setFormUrl] = useState<string>("");
  const [formService, setFormService] = useState<MusicPlatformService>("spotify");
  const [formCategories, setFormCategories] = useState<string[]>(["Chill"]);
  const [formIcon, setFormIcon] = useState<string>("☕");
  const [formCoverImage, setFormCoverImage] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formIsPinned, setFormIsPinned] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Keyboard Shortcuts: Enter = Launch, Ctrl+N = New, Delete = Remove, Ctrl+F = Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside text inputs/modals unless intended
      const activeEl = document.activeElement;
      const isInputActive = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || activeEl?.tagName === "SELECT";

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleOpenAddModal();
        return;
      }

      if (!isInputActive) {
        if (e.key === "Enter" && (selectedCardId || lastOpenedPlaylist?.id)) {
          e.preventDefault();
          const targetId = selectedCardId || lastOpenedPlaylist?.id;
          if (targetId) launchPlaylist(targetId);
        } else if (e.key === "Delete" && selectedCardId) {
          e.preventDefault();
          const target = playlists.find((p) => p.id === selectedCardId);
          if (target && window.confirm(`Delete "${target.title}"?`)) {
            deletePlaylist(selectedCardId);
            setSelectedCardId(null);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCardId, lastOpenedPlaylist, playlists]);

  // Close context menu on window click
  useEffect(() => {
    const handleWindowClick = () => setContextMenu(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormUrl("");
    setFormService("spotify");
    setFormCategories(["Chill"]);
    setFormIcon("☕");
    setFormCoverImage("");
    setFormDescription("");
    setFormIsPinned(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (playlist: LauncherPlaylist) => {
    setEditingId(playlist.id);
    setFormTitle(playlist.title || "");
    setFormUrl(playlist.url || "");
    setFormService(playlist.service || "spotify");
    setFormCategories(
      Array.isArray(playlist.categories) && playlist.categories.length > 0
        ? playlist.categories
        : [playlist.category || "Chill"]
    );
    setFormIcon(playlist.icon || "🎵");
    setFormCoverImage(playlist.coverImage || "");
    setFormDescription(playlist.description || "");
    setFormIsPinned(Boolean(playlist.isPinned));
    setFormError("");
    setIsModalOpen(true);
  };

  const handlePickCoverImage = async () => {
    const file = await nativeDialogService.pickFile(
      "Select Playlist Cover Image",
      "Image Files (*.png, *.jpg, *.jpeg, *.webp)",
      ["png", "jpg", "jpeg", "webp"]
    );
    if (file) {
      setFormCoverImage(file);
    }
  };

  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Playlist title is required.");
      return;
    }
    if (!formUrl.trim()) {
      setFormError("Playlist URL is required.");
      return;
    }

    const primaryCategory = formCategories[0] || "Chill";

    try {
      if (editingId) {
        await updatePlaylist(editingId, {
          title: formTitle.trim(),
          url: formUrl.trim(),
          service: formService,
          category: primaryCategory,
          categories: formCategories,
          icon: formIcon || "🎵",
          coverImage: formCoverImage,
          description: formDescription.trim(),
          isPinned: formIsPinned,
        });
      } else {
        await addPlaylist({
          title: formTitle.trim(),
          url: formUrl.trim(),
          service: formService,
          category: primaryCategory,
          categories: formCategories,
          icon: formIcon || "🎵",
          coverImage: formCoverImage,
          description: formDescription.trim(),
          isFavorite: false,
          isPinned: formIsPinned,
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError("Failed to save playlist. Please check your inputs.");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    await addCategory(catName.trim(), catIcon || "🎵", catColor || "#a855f7");
    setCatName("");
    setIsCatModalOpen(false);
  };

  const handleDeletePlaylist = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePlaylist(id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, playlist: LauncherPlaylist) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCardId(playlist.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      playlist,
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderPlaylists(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Import / Export JSON helpers
  const handleExportJSON = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailylife_music_hub_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async () => {
    if (!importJsonText.trim()) return;
    const ok = await importJSON(importJsonText.trim());
    if (ok) {
      setIsImportModalOpen(false);
      setImportJsonText("");
    }
  };

  const handleImportFromFile = async () => {
    const file = await nativeDialogService.pickFile("Select JSON Import File", "JSON Files (*.json)", ["json"]);
    if (file) {
      const inspect = await nativeDialogService.inspectPath(file);
      if (inspect.exists) {
        // read path or user prompt
        try {
          const content = await window.fetch(nativeDialogService.formatAssetUrl(file)).then((r) => r.text());
          if (content) {
            await importJSON(content);
            setIsImportModalOpen(false);
          }
        } catch (err) {
          const manualStr = window.prompt("Paste JSON content to import:");
          if (manualStr) {
            await importJSON(manualStr);
            setIsImportModalOpen(false);
          }
        }
      }
    }
  };

  const toggleCategorySelection = (catId: string) => {
    setFormCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((c) => c !== catId);
      }
      return [...prev, catId];
    });
  };

  const getServiceBadge = (service?: MusicPlatformService) => {
    switch (service) {
      case "spotify":
        return <span className="service-badge badge-spotify">🟢 Spotify</span>;
      case "ytmusic":
        return <span className="service-badge badge-ytmusic">🔴 YouTube Music</span>;
      default:
        return <span className="service-badge badge-other">🌐 Web Link</span>;
    }
  };

  const currentXpValue = typeof profile?.currentXP === "number" ? profile.currentXP : 0;
  const playlistsLaunchedValue = typeof stats?.playlistsLaunched === "number" ? stats.playlistsLaunched : 0;
  const streakDaysValue = typeof profile?.stats?.streakDays === "number"
    ? profile.stats.streakDays
    : typeof stats?.streakDays === "number"
    ? stats.streakDays
    : 7;

  return (
    <div className="music-page-wrapper">
      {/* Top Header Bar */}
      <div className="music-header-bar">
        <div className="music-header-left">
          <div className="music-title-row">
            <h1 className="music-page-title">MUSIC HUB</h1>
            <span className="sakura-flower">🌸</span>
          </div>

          <div className="music-quote-block">
            <p className="quote-english">Find your rhythm & launch your favorite playlists.</p>
          </div>
        </div>

        {/* Header Stats Panel */}
        <div className="music-header-stats-panel">
          <div className="music-stat-badge">
            <span className="badge-icon">🎵</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Music XP</span>
              <span className="badge-val highlight-purple">
                {currentXpValue.toLocaleString()}{" "}
                <span className="sub-target">/ 100</span>
              </span>
              <div className="xp-bar-bg">
                <div
                  className="xp-bar-fill"
                  style={{
                    width: `${Math.min(100, (currentXpValue / 100) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="music-stat-divider" />

          <div className="music-stat-badge">
            <span className="badge-icon">🔥</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Listening Streak</span>
              <span className="badge-val highlight-orange">
                {streakDaysValue} days
              </span>
            </div>
          </div>

          <div className="music-stat-divider" />

          <div className="music-stat-badge">
            <span className="badge-icon">🚀</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Playlists Launched</span>
              <span className="badge-val highlight-green">
                {playlistsLaunchedValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Launcher Preferences, Sorting, Confirmation & JSON Backup */}
      <div className="music-card launcher-control-card">
        <div className="control-bar-split">
          {/* Preferred Service Selector */}
          <div className="control-group">
            <span className="control-label">Platform:</span>
            <div className="toggle-btn-group">
              <button
                className={`toggle-option-btn ${preferredService === "spotify" ? "active-spotify" : ""}`}
                onClick={() => setPreferredService("spotify")}
              >
                🟢 Spotify
              </button>
              <button
                className={`toggle-option-btn ${preferredService === "ytmusic" ? "active-ytmusic" : ""}`}
                onClick={() => setPreferredService("ytmusic")}
              >
                🔴 YT Music
              </button>
            </div>
          </div>

          {/* Launch Mode Target Selector */}
          <div className="control-group">
            <span className="control-label">Target:</span>
            <div className="toggle-btn-group">
              <button
                className={`toggle-option-btn ${launchMode === "app" ? "active-mode" : ""}`}
                onClick={() => setLaunchMode("app")}
                title="Launch in Desktop App via native protocol scheme"
              >
                🖥️ App
              </button>
              <button
                className={`toggle-option-btn ${launchMode === "browser" ? "active-mode" : ""}`}
                onClick={() => setLaunchMode("browser")}
                title="Launch in Default Web Browser"
              >
                🌐 Browser
              </button>
              <button
                className={`toggle-option-btn ${launchMode === "auto" ? "active-mode" : ""}`}
                onClick={() => setLaunchMode("auto")}
                title="Automatically detect desktop app or web browser"
              >
                ⚡ Auto
              </button>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="control-group">
            <span className="control-label">Sort:</span>
            <select
              className="music-select-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="manual">🖐️ Drag & Drop (Manual)</option>
              <option value="recent">🕒 Recently Opened</option>
              <option value="most_launched">🔥 Most Launched</option>
              <option value="az">🔤 Title (A-Z)</option>
            </select>
          </div>

          {/* Launch Confirmation Toggle */}
          <div className="control-group">
            <label className="checkbox-toggle-lbl" title="Ask for confirmation before launching external URLs">
              <input
                type="checkbox"
                checked={confirmExternalLaunch}
                onChange={(e) => setConfirmExternalLaunch(e.target.checked)}
              />
              <span>Confirm Launch</span>
            </label>
          </div>

          {/* Direct Service Launchers & Backup */}
          <div className="control-group quick-launch-group">
            <button
              className="quick-service-btn btn-spotify"
              onClick={() => launchServicePlatform("spotify")}
            >
              <span>Open Spotify</span> ↗
            </button>
            <button
              className="quick-service-btn btn-ytmusic"
              onClick={() => launchServicePlatform("ytmusic")}
            >
              <span>Open YT Music</span> ↗
            </button>

            <button
              className="icon-action-btn"
              onClick={handleExportJSON}
              title="Export Playlists as JSON Backup"
            >
              📥 Backup
            </button>
            <button
              className="icon-action-btn"
              onClick={() => setIsImportModalOpen(true)}
              title="Import Playlists from JSON"
            >
              📤 Import
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section: Last Opened / Active Hub */}
      {lastOpenedPlaylist ? (
        <div className="music-card hero-launcher-card">
          <div className="hero-split-content">
            <div className="hero-icon-box">
              {lastOpenedPlaylist.coverImage ? (
                <img
                  src={nativeDialogService.formatAssetUrl(lastOpenedPlaylist.coverImage)}
                  alt={lastOpenedPlaylist.title}
                  className="hero-cover-img"
                />
              ) : (
                <span className="hero-emoji-icon">{lastOpenedPlaylist.icon || "🎵"}</span>
              )}
            </div>

            <div className="hero-info-block">
              <div className="hero-tag-row">
                <span className="hero-status-pill">⭐ LAST LAUNCHED HUB</span>
                {getServiceBadge(lastOpenedPlaylist.service)}
                <span className="category-pill">{lastOpenedPlaylist.category || "Chill"}</span>
                {lastOpenedPlaylist.isPinned && <span className="pin-badge">📌 Pinned</span>}
              </div>

              <h2 className="hero-title">{lastOpenedPlaylist.title || "Untitled Playlist"}</h2>
              {lastOpenedPlaylist.description && (
                <p className="hero-description">{lastOpenedPlaylist.description}</p>
              )}

              <div className="hero-meta-row">
                <span>🚀 Launched {lastOpenedPlaylist.launchCount ?? 0} times</span>
                <span>•</span>
                <span>
                  {lastOpenedPlaylist.lastOpenedAt && !isNaN(new Date(lastOpenedPlaylist.lastOpenedAt).getTime())
                    ? `Last opened: ${new Date(lastOpenedPlaylist.lastOpenedAt).toLocaleDateString()} ${new Date(
                        lastOpenedPlaylist.lastOpenedAt
                      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Ready to play"}
                </span>
              </div>
            </div>

            <div className="hero-action-box">
              <button
                className="hero-launch-main-btn"
                onClick={() => launchPlaylist(lastOpenedPlaylist.id)}
              >
                <span className="launch-icon">🚀</span>
                <span>RE-LAUNCH NOW</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="music-card hero-launcher-card empty-hero">
          <div className="empty-hero-content">
            <span className="empty-icon">🎧</span>
            <h3>No playlist launched yet</h3>
            <p>Select any playlist below to launch immediately on Spotify or YouTube Music!</p>
          </div>
        </div>
      )}

      {/* Main Playlists Section Header + Category Filters + Add Button */}
      <div className="music-card playlists-hub-card">
        <div className="playlists-header-row">
          <div className="title-group-left">
            <span className="title-music-icon">🎵</span>
            <h2 className="card-title-text">YOUR PLAYLISTS ({(playlists || []).length})</h2>
          </div>

          <div className="playlists-header-actions">
            {/* Search Input */}
            <div className="music-search-box">
              <span className="search-icon">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                className="music-search-input"
                placeholder="Search (Ctrl+F)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            {/* Add Playlist Button */}
            <button className="add-playlist-btn" onClick={handleOpenAddModal} title="Shortcut: Ctrl+N">
              <span>+</span> Add Playlist
            </button>
          </div>
        </div>

        {/* Category Filter Bar (Custom Category CRUD support) */}
        <div className="category-filter-bar">
          <button
            className={`category-tab-btn ${activeCategory === "All" ? "active" : ""}`}
            onClick={() => setActiveCategory("All")}
          >
            <span className="cat-icon">🎵</span>
            <span className="cat-label">All</span>
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="category-tab-wrapper">
              <button
                className={`category-tab-btn ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
                style={{ borderColor: cat.color ? `${cat.color}66` : undefined }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.name}</span>
              </button>

              {cat.isCustom && (
                <button
                  className="cat-delete-mini"
                  onClick={() => {
                    if (window.confirm(`Delete category "${cat.name}"?`)) {
                      deleteCategory(cat.id);
                    }
                  }}
                  title="Delete category"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            className="category-tab-btn add-cat-btn"
            onClick={() => setIsCatModalOpen(true)}
            title="Create Custom Category"
          >
            <span>+</span> New Category
          </button>
        </div>

        {/* Playlists Grid with Drag & Drop Reordering */}
        {(filteredPlaylists || []).length > 0 ? (
          <div className="playlists-grid">
            {filteredPlaylists.map((pl, idx) => (
              <div
                key={pl.id}
                draggable={sortOption === "manual"}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onClick={() => setSelectedCardId(pl.id)}
                onContextMenu={(e) => handleContextMenu(e, pl)}
                className={`playlist-card-item ${selectedCardId === pl.id ? "selected-card" : ""} ${
                  dragOverIndex === idx ? "drag-over-target" : ""
                } ${draggedIndex === idx ? "dragging-source" : ""}`}
              >
                <div className="card-top-row">
                  {pl.coverImage ? (
                    <img
                      src={nativeDialogService.formatAssetUrl(pl.coverImage)}
                      alt={pl.title}
                      className="playlist-card-cover-img"
                    />
                  ) : (
                    <span className="playlist-emoji-icon">{pl.icon || "🎵"}</span>
                  )}

                  <div className="badge-group">
                    {getServiceBadge(pl.service)}
                    <span className="category-pill">{pl.category || "Chill"}</span>
                  </div>

                  <button
                    className={`fav-star-btn ${pl.isPinned ? "active-pin" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(pl.id);
                    }}
                    title={pl.isPinned ? "Unpin Playlist" : "Pin Playlist to Top"}
                  >
                    📌
                  </button>

                  <button
                    className={`fav-star-btn ${pl.isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pl.id);
                    }}
                    title={pl.isFavorite ? "Remove Favorite" : "Mark Favorite"}
                  >
                    {pl.isFavorite ? "♥" : "♡"}
                  </button>
                </div>

                <div className="card-body">
                  <h3 className="playlist-card-title">{pl.title || "Untitled Playlist"}</h3>
                  {pl.description && <p className="playlist-card-desc">{pl.description}</p>}

                  {/* Multi-category tags */}
                  {Array.isArray(pl.categories) && pl.categories.length > 1 && (
                    <div className="multi-tag-row">
                      {pl.categories.map((c, i) => (
                        <span key={i} className="mini-tag">
                          #{c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-footer-row">
                  <span className="launch-counter-tag">🚀 {pl.launchCount ?? 0} launches</span>

                  <div className="card-btn-group">
                    <button
                      className="playlist-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePlaylist(pl.id);
                      }}
                      title="Duplicate Playlist"
                    >
                      📋 Copy
                    </button>

                    <button
                      className="playlist-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(pl);
                      }}
                      title="Edit Playlist"
                    >
                      ✏ Edit
                    </button>

                    <button
                      className="playlist-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(pl.id, pl.title);
                      }}
                      title="Delete Playlist"
                    >
                      🗑
                    </button>

                    <button
                      className="playlist-launch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        launchPlaylist(pl.id);
                      }}
                    >
                      ▶ Launch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="playlists-empty-state">
            <span className="empty-state-icon">📂</span>
            <p className="empty-state-title">No playlists found</p>
            <p className="empty-state-sub">
              {searchQuery
                ? `No playlists match "${searchQuery}".`
                : activeCategory !== "All"
                ? `No playlists under category "${activeCategory}".`
                : "Your playlist hub is empty."}
            </p>
            <button className="add-playlist-btn margin-top-12" onClick={handleOpenAddModal}>
              + Add New Playlist
            </button>
          </div>
        )}
      </div>

      {/* Most Launched Section */}
      {mostLaunchedPlaylists.length > 0 && (
        <div className="music-card most-launched-card">
          <div className="card-title-row">
            <span className="title-clock-icon">🔥</span>
            <h2 className="card-title-text">MOST LAUNCHED PLAYLISTS</h2>
          </div>

          <div className="most-launched-grid">
            {mostLaunchedPlaylists.map((pl) => (
              <div
                key={pl.id}
                className="most-launched-item"
                onClick={() => launchPlaylist(pl.id)}
              >
                <span className="ml-icon">{pl.icon || "🎵"}</span>
                <div className="ml-info">
                  <span className="ml-title">{pl.title}</span>
                  <span className="ml-sub">🚀 {pl.launchCount || 0} launches</span>
                </div>
                <button className="ml-launch-btn">▶</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Opened Section */}
      {(recentlyOpened || []).length > 0 && (
        <div className="music-card recently-opened-card">
          <div className="card-title-row">
            <span className="title-clock-icon">🕒</span>
            <h2 className="card-title-text">RECENTLY LAUNCHED HISTORY</h2>
          </div>

          <div className="recently-opened-list">
            {recentlyOpened.map((item) => (
              <div key={item.id} className="rp-launch-row">
                <span className="rp-item-icon">{item.icon || "🎵"}</span>

                <div className="rp-item-info">
                  <span className="rp-item-title">{item.title || "Untitled"}</span>
                  <div className="rp-item-sub">
                    {getServiceBadge(item.service)}
                    <span className="category-pill mini">{item.category || "Chill"}</span>
                    <span className="rp-time-stamp">
                      {item?.openedAt && !isNaN(new Date(item.openedAt).getTime())
                        ? new Date(item.openedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                </div>

                <button
                  className="rp-relaunch-btn"
                  onClick={() => launchPlaylist(item.playlistId)}
                >
                  ▶ Re-Launch
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="custom-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              launchPlaylist(contextMenu.playlist.id);
              setContextMenu(null);
            }}
          >
            🚀 Launch Playlist
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              handleOpenEditModal(contextMenu.playlist);
              setContextMenu(null);
            }}
          >
            ✏ Edit Playlist
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              duplicatePlaylist(contextMenu.playlist.id);
              setContextMenu(null);
            }}
          >
            📋 Duplicate (Copy)
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              togglePin(contextMenu.playlist.id);
              setContextMenu(null);
            }}
          >
            📌 {contextMenu.playlist.isPinned ? "Unpin from Top" : "Pin to Top"}
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              toggleFavorite(contextMenu.playlist.id);
              setContextMenu(null);
            }}
          >
            ♥ {contextMenu.playlist.isFavorite ? "Unfavorite" : "Favorite"}
          </div>
          <div className="context-menu-divider" />
          <div
            className="context-menu-item danger-item"
            onClick={() => {
              handleDeletePlaylist(contextMenu.playlist.id, contextMenu.playlist.title);
              setContextMenu(null);
            }}
          >
            🗑 Delete Playlist
          </div>
        </div>
      )}

      {/* Add / Edit Playlist Modal */}
      {isModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? "✏ Edit Playlist" : "➕ Add Favorite Playlist"}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlaylist} className="modal-form">
              {formError && <div className="modal-error-banner">⚠️ {formError}</div>}

              <div className="form-group">
                <label className="form-label">Playlist Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chill Lofi Beats or Anime Bangers"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Playlist Web / App URL *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://open.spotify.com/playlist/... or https://music.youtube.com/..."
                  value={formUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormUrl(val);
                    if (val.includes("spotify.com")) {
                      setFormService("spotify");
                    } else if (val.includes("youtube.com") || val.includes("youtu.be")) {
                      setFormService("ytmusic");
                    }
                  }}
                  required
                />
                <span className="form-hint">
                  Paste full Spotify or YouTube Music playlist link.
                </span>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Streaming Service</label>
                  <select
                    className="form-select"
                    value={formService}
                    onChange={(e) => setFormService(e.target.value as MusicPlatformService)}
                  >
                    <option value="spotify">🟢 Spotify</option>
                    <option value="ytmusic">🔴 YouTube Music</option>
                    <option value="other">🌐 Web Link / Custom</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pin to Top</label>
                  <label className="checkbox-toggle-lbl margin-top-4">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                    />
                    <span>📌 Pinned Playlist</span>
                  </label>
                </div>
              </div>

              {/* Multi-Category Selector */}
              <div className="form-group">
                <label className="form-label">Categories / Tags</label>
                <div className="multi-cat-selector">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      className={`multi-cat-chip ${formCategories.includes(cat.id) ? "active" : ""}`}
                      onClick={() => toggleCategorySelection(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image Upload / Selection */}
              <div className="form-group">
                <label className="form-label">Cover Image (File or URL)</label>
                <div className="cover-upload-row">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Image URL or local path..."
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                  />
                  <button type="button" className="add-playlist-btn" onClick={handlePickCoverImage}>
                    📁 Browse
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icon / Emoji (Fallback)</label>
                <div className="icon-selector-row">
                  <input
                    type="text"
                    className="form-input icon-input"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    maxLength={4}
                  />
                  <div className="preset-emojis">
                    {PRESET_ICONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        className={`preset-emoji-btn ${formIcon === emoji ? "active" : ""}`}
                        onClick={() => setFormIcon(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Short description or mood details for this playlist..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingId ? "Save Changes" : "Create Playlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Category Modal */}
      {isCatModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsCatModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">➕ Add Custom Category</h3>
              <button className="modal-close-btn" onClick={() => setIsCatModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="modal-form">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gaming, Phonk, Synth, Podcast"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Icon Emoji</label>
                  <input
                    type="text"
                    className="form-input icon-input"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    maxLength={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color Accent</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      className="color-input"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                    />
                    <div className="preset-colors">
                      {PRESET_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className="color-chip"
                          style={{ backgroundColor: col }}
                          onClick={() => setCatColor(col)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCatModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {isImportModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsImportModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📤 Import Playlists JSON</h3>
              <button className="modal-close-btn" onClick={() => setIsImportModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Option A: Select JSON File</label>
                <button type="button" className="add-playlist-btn" onClick={handleImportFromFile}>
                  📁 Choose File to Import
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Option B: Paste JSON Raw Text</label>
                <textarea
                  className="form-textarea"
                  placeholder="Paste JSON string content here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn-save" onClick={handleImportJSON}>
                  Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Ribbon */}
      <div className="music-footer-ribbon">
        <span className="ribbon-flower">🎵</span>
        <span className="footer-kanji">音楽は、心の旅を優しく照らす。</span>
        <span className="footer-english">
          Music gently lights the journey of the heart.
        </span>
        <span className="ribbon-flower">🌸</span>
      </div>
    </div>
  );
}
