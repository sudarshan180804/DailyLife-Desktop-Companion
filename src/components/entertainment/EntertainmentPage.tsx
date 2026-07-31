import { useState, useEffect, useRef } from "react";
import { useEntertainmentStore } from "../../modules/entertainment";
import { useProfileStore } from "../../stores/profileStore";
import { nativeDialogService, SmartLaunchResult } from "../../services/nativeDialogService";
import {
  EntertainmentTitle,
  StreamingServiceConfig,
  WatchlistStatus,
  SortOption,
  LaunchModeOption,
} from "../../modules/entertainment/types";

const PRESET_ICONS = ["⛩️", "🍿", "📺", "📹", "⚡", "🎬", "🔥", "🌸", "🚀", "🌙", "⭐", "🎧"];
const PRESET_COLORS = ["#a855f7", "#ef4444", "#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

interface ContextMenuState {
  x: number;
  y: number;
  title: EntertainmentTitle;
}

export function EntertainmentPage() {
  const {
    titles = [],
    filteredTitles = [],
    services = [],
    categories = [],
    recentlyWatched = [],
    lastWatchedTitle,
    selectedSearchServiceId = "all",
    sortOption = "manual",
    launchMode = "auto",
    confirmExternalLaunch = false,
    stats = { titlesWatched: 0, episodesWatched: 0, totalSessions: 0, streakDays: 7 },
    activeStatusFilter = "All",
    activeCategoryFilter = "All",
    searchQuery = "",
    setActiveStatusFilter,
    setActiveCategoryFilter,
    setSearchQuery,
    setSelectedSearchServiceId,
    setSortOption,
    setLaunchMode,
    setConfirmExternalLaunch,
    universalSearch,
    launchTitle,
    incrementProgress,
    reorderTitles,
    addTitle,
    duplicateTitle,
    updateTitle,
    deleteTitle,
    togglePin,
    toggleFavorite,
    addService,
    updateService,
    deleteService,
    toggleServiceEnabled,
    addCategory,
    deleteCategory,
    getRandomTitle,
    testServiceLauncher,
    exportJSON,
    importJSON,
  } = useEntertainmentStore();

  const { profile } = useProfileStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const universalSearchInputRef = useRef<HTMLInputElement>(null);

  // Search Input State
  const [universalQuery, setUniversalQuery] = useState<string>("");

  // Modal States
  const [isTitleModalOpen, setIsTitleModalOpen] = useState<boolean>(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Test Launcher Diagnostic Modal State
  const [testResult, setTestResult] = useState<{
    serviceName: string;
    result: SmartLaunchResult;
    serviceConfig: StreamingServiceConfig;
  } | null>(null);

  // Service Modal Edit Form
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormName, setServiceFormName] = useState<string>("");
  const [serviceFormIcon, setServiceFormIcon] = useState<string>("🌐");
  const [serviceFormColor, setServiceFormColor] = useState<string>("#a855f7");
  const [serviceFormWebsiteUrl, setServiceFormWebsiteUrl] = useState<string>("");
  const [serviceFormSearchTemplate, setServiceFormSearchTemplate] = useState<string>("");
  const [serviceFormNativeUri, setServiceFormNativeUri] = useState<string>("");
  const [serviceFormExePath, setServiceFormExePath] = useState<string>("");
  const [serviceFormLaunchMode, setServiceFormLaunchMode] = useState<LaunchModeOption>("auto");

  // Category Form
  const [catName, setCatName] = useState<string>("");
  const [catIcon, setCatIcon] = useState<string>("🎬");
  const [catColor, setCatColor] = useState<string>("#a855f7");

  // Import JSON Form
  const [importJsonText, setImportJsonText] = useState<string>("");

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Highlighted Card State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Title Add/Edit Form Fields
  const [formTitleName, setFormTitleName] = useState<string>("");
  const [formServiceId, setFormServiceId] = useState<string>("service-crunchyroll");
  const [formStatus, setFormStatus] = useState<WatchlistStatus>("Watching");
  const [formEpisode, setFormEpisode] = useState<number>(1);
  const [formSeason, setFormSeason] = useState<number>(1);
  const [formTotalEpisodes, setFormTotalEpisodes] = useState<string>("");
  const [formDirectUrl, setFormDirectUrl] = useState<string>("");
  const [formCoverImage, setFormCoverImage] = useState<string>("");
  const [formIcon, setFormIcon] = useState<string>("🎬");
  const [formRating, setFormRating] = useState<number>(5);
  const [formNotes, setFormNotes] = useState<string>("");
  const [formCategories, setFormCategories] = useState<string[]>(["Anime"]);
  const [formIsPinned, setFormIsPinned] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || activeEl?.tagName === "SELECT";

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        universalSearchInputRef.current?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleOpenAddTitleModal();
        return;
      }

      if (!isInputActive) {
        if (e.key === "Enter" && (selectedCardId || lastWatchedTitle?.id)) {
          e.preventDefault();
          const targetId = selectedCardId || lastWatchedTitle?.id;
          if (targetId) launchTitle(targetId);
        } else if (e.key === "Delete" && selectedCardId) {
          e.preventDefault();
          const target = titles.find((t) => t.id === selectedCardId);
          if (target && window.confirm(`Delete "${target.title}"?`)) {
            deleteTitle(selectedCardId);
            setSelectedCardId(null);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCardId, lastWatchedTitle, titles]);

  // Close context menu on window click
  useEffect(() => {
    const handleWindowClick = () => setContextMenu(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  const handleOpenAddTitleModal = () => {
    setEditingTitleId(null);
    setFormTitleName("");
    setFormServiceId(services[0]?.id || "service-crunchyroll");
    setFormStatus("Watching");
    setFormEpisode(1);
    setFormSeason(1);
    setFormTotalEpisodes("");
    setFormDirectUrl("");
    setFormCoverImage("");
    setFormIcon("🎬");
    setFormRating(5);
    setFormNotes("");
    setFormCategories(["Anime"]);
    setFormIsPinned(false);
    setFormError("");
    setIsTitleModalOpen(true);
  };

  const handleOpenEditTitleModal = (item: EntertainmentTitle) => {
    setEditingTitleId(item.id);
    setFormTitleName(item.title || "");
    setFormServiceId(item.serviceId || services[0]?.id || "service-crunchyroll");
    setFormStatus(item.status || "Watching");
    setFormEpisode(item.currentEpisode || 1);
    setFormSeason(item.currentSeason || 1);
    setFormTotalEpisodes(item.totalEpisodes ? String(item.totalEpisodes) : "");
    setFormDirectUrl(item.directUrl || "");
    setFormCoverImage(item.coverImage || "");
    setFormIcon(item.icon || "🎬");
    setFormRating(item.rating || 5);
    setFormNotes(item.notes || "");
    setFormCategories(
      Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : [item.category || "Anime"]
    );
    setFormIsPinned(Boolean(item.isPinned));
    setFormError("");
    setIsTitleModalOpen(true);
  };

  const handlePickCoverImage = async () => {
    const file = await nativeDialogService.pickFile(
      "Select Media Poster / Cover",
      "Image Files (*.png, *.jpg, *.jpeg, *.webp)",
      ["png", "jpg", "jpeg", "webp"]
    );
    if (file) {
      setFormCoverImage(file);
    }
  };

  const handlePickServiceExePath = async () => {
    const file = await nativeDialogService.pickFile(
      "Select Executable App File",
      "Executables (*.exe)",
      ["exe"]
    );
    if (file) {
      setServiceFormExePath(file);
    }
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleName.trim()) {
      setFormError("Title name is required.");
      return;
    }

    const primaryCat = formCategories[0] || "Anime";
    const totalEpNum = formTotalEpisodes.trim() ? parseInt(formTotalEpisodes.trim(), 10) : undefined;

    try {
      if (editingTitleId) {
        await updateTitle(editingTitleId, {
          title: formTitleName.trim(),
          serviceId: formServiceId,
          status: formStatus,
          currentEpisode: formEpisode,
          currentSeason: formSeason,
          totalEpisodes: totalEpNum,
          directUrl: formDirectUrl.trim(),
          coverImage: formCoverImage,
          icon: formIcon || "🎬",
          rating: formRating,
          notes: formNotes.trim(),
          category: primaryCat,
          categories: formCategories,
          isPinned: formIsPinned,
        });
      } else {
        await addTitle({
          title: formTitleName.trim(),
          serviceId: formServiceId,
          status: formStatus,
          currentEpisode: formEpisode,
          currentSeason: formSeason,
          totalEpisodes: totalEpNum,
          directUrl: formDirectUrl.trim(),
          coverImage: formCoverImage,
          icon: formIcon || "🎬",
          rating: formRating,
          notes: formNotes.trim(),
          category: primaryCat,
          categories: formCategories,
          isFavorite: false,
          isPinned: formIsPinned,
        });
      }

      setIsTitleModalOpen(false);
    } catch (err) {
      setFormError("Failed to save title. Please check input values.");
    }
  };

  const handleUniversalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (universalQuery.trim()) {
      universalSearch(universalQuery.trim());
    }
  };

  const handleRandomPick = () => {
    const picked = getRandomTitle();
    if (picked) {
      setSelectedCardId(picked.id);
      launchTitle(picked.id);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await addCategory(catName.trim(), catIcon || "🎬", catColor || "#a855f7");
    setCatName("");
    setIsCatModalOpen(false);
  };

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceFormName("");
    setServiceFormIcon("🌐");
    setServiceFormColor("#a855f7");
    setServiceFormWebsiteUrl("https://");
    setServiceFormSearchTemplate("https://example.com/search?q={query}");
    setServiceFormNativeUri("");
    setServiceFormExePath("");
    setServiceFormLaunchMode("auto");
  };

  const handleOpenEditService = (service: StreamingServiceConfig) => {
    setEditingServiceId(service.id);
    setServiceFormName(service.name);
    setServiceFormIcon(service.icon);
    setServiceFormColor(service.color);
    setServiceFormWebsiteUrl(service.websiteUrl);
    setServiceFormSearchTemplate(service.searchUrlTemplate);
    setServiceFormNativeUri(service.nativeUri || "");
    setServiceFormExePath(service.exePath || "");
    setServiceFormLaunchMode(service.preferredLaunchMethod || "auto");
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormName.trim() || !serviceFormWebsiteUrl.trim()) return;

    if (editingServiceId) {
      await updateService(editingServiceId, {
        name: serviceFormName.trim(),
        icon: serviceFormIcon || "🌐",
        color: serviceFormColor || "#a855f7",
        websiteUrl: serviceFormWebsiteUrl.trim(),
        searchUrlTemplate: serviceFormSearchTemplate.trim(),
        nativeUri: serviceFormNativeUri.trim() || undefined,
        exePath: serviceFormExePath.trim() || undefined,
        preferredLaunchMethod: serviceFormLaunchMode,
      });
    } else {
      await addService({
        name: serviceFormName.trim(),
        icon: serviceFormIcon || "🌐",
        color: serviceFormColor || "#a855f7",
        websiteUrl: serviceFormWebsiteUrl.trim(),
        searchUrlTemplate: serviceFormSearchTemplate.trim(),
        nativeUri: serviceFormNativeUri.trim() || undefined,
        exePath: serviceFormExePath.trim() || undefined,
        preferredLaunchMethod: serviceFormLaunchMode,
        enabled: true,
      });
    }

    setEditingServiceId(null);
  };

  const handleTestService = async (service: StreamingServiceConfig) => {
    const res = await testServiceLauncher(service.id);
    if (res) {
      setTestResult({
        serviceName: service.name,
        result: res,
        serviceConfig: service,
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, title: EntertainmentTitle) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCardId(title.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      title,
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
      reorderTitles(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleExportJSON = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailylife_entertainment_${Date.now()}.json`;
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

  const toggleCategorySelection = (catId: string) => {
    setFormCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== catId);
      }
      return [...prev, catId];
    });
  };

  const getServiceBadge = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    if (!s) return <span className="service-badge badge-other">🌐 Web</span>;
    return (
      <span className="service-badge" style={{ backgroundColor: `${s.color}22`, borderColor: s.color, color: s.color }}>
        {s.icon} {s.name}
      </span>
    );
  };

  const currentXpValue = typeof profile?.currentXP === "number" ? profile.currentXP : 0;
  const episodesWatchedValue = typeof stats?.episodesWatched === "number" ? stats.episodesWatched : 0;
  const streakDaysValue = typeof profile?.stats?.streakDays === "number"
    ? profile.stats.streakDays
    : typeof stats?.streakDays === "number"
    ? stats.streakDays
    : 7;

  return (
    <div className="music-page-wrapper entertainment-page-wrapper">
      {/* Top Header Bar */}
      <div className="music-header-bar">
        <div className="music-header-left">
          <div className="music-title-row">
            <h1 className="music-page-title">ENTERTAINMENT HUB</h1>
            <span className="sakura-flower">🌸</span>
          </div>

          <div className="music-quote-block">
            <p className="quote-english">Find your show & launch your streaming hub.</p>
          </div>
        </div>

        {/* Header Stats Panel */}
        <div className="music-header-stats-panel">
          <div className="music-stat-badge">
            <span className="badge-icon">⭐</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Media XP</span>
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
              <span className="badge-lbl">Watch Streak</span>
              <span className="badge-val highlight-orange">
                {streakDaysValue} days
              </span>
            </div>
          </div>

          <div className="music-stat-divider" />

          <div className="music-stat-badge">
            <span className="badge-icon">🎬</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Episodes Watched</span>
              <span className="badge-val highlight-green">
                {episodesWatchedValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Search Bar & Platform Launcher Bar */}
      <div className="music-card launcher-control-card">
        <form onSubmit={handleUniversalSearchSubmit} className="universal-search-row">
          <div className="search-platform-selector">
            <span className="selector-icon">🌐</span>
            <select
              className="platform-select-input"
              value={selectedSearchServiceId}
              onChange={(e) => setSelectedSearchServiceId(e.target.value)}
            >
              <option value="all">All Platforms (Search Everywhere)</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="universal-input-group">
            <span className="search-lens-icon">🔍</span>
            <input
              ref={universalSearchInputRef}
              type="text"
              className="universal-search-input"
              placeholder="Universal Search across Netflix, Crunchyroll, YouTube, Disney+... (Ctrl+F)"
              value={universalQuery}
              onChange={(e) => setUniversalQuery(e.target.value)}
            />
            {universalQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setUniversalQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <button type="submit" className="add-playlist-btn search-submit-btn">
            <span>🚀</span> Search
          </button>
        </form>

        {/* Quick Platform Launch Buttons + Service Manager Trigger */}
        <div className="control-bar-split margin-top-10">
          <div className="control-group quick-launch-group flex-wrap">
            {services
              .filter((s) => s.enabled)
              .slice(0, 6)
              .map((s) => (
                <button
                  key={s.id}
                  className="quick-service-btn"
                  style={{ borderColor: `${s.color}66` }}
                  onClick={() => nativeDialogService.smartLaunch(s.exePath, s.nativeUri, s.websiteUrl, s.preferredLaunchMethod)}
                >
                  <span>
                    {s.icon} {s.name}
                  </span>{" "}
                  ↗
                </button>
              ))}

            <button
              className="icon-action-btn"
              onClick={() => setIsServiceModalOpen(true)}
              title="Manage Streaming Services & Search Templates"
            >
              ⚙ Services Manager
            </button>

            <button
              className="icon-action-btn"
              onClick={async () => {
                const notesStore = (await import("../../modules/notes")).notesStore;
                await notesStore.createNote({
                  templateId: "template-anime-review",
                  notebookId: "nb-personal",
                  collections: ["Entertainment"],
                  tags: ["#MediaReview"],
                });
              }}
              title="Create Anime/Media Review Note"
            >
              🍿 + Review Note
            </button>
          </div>

          <div className="control-group">
            <span className="control-label">Target:</span>
            <div className="toggle-btn-group">
              <button
                className={`toggle-option-btn ${launchMode === "app" ? "active-mode" : ""}`}
                onClick={() => setLaunchMode("app")}
                title="Launch in Desktop App"
              >
                🖥️ App
              </button>
              <button
                className={`toggle-option-btn ${launchMode === "browser" ? "active-mode" : ""}`}
                onClick={() => setLaunchMode("browser")}
                title="Launch in Web Browser"
              >
                🌐 Browser
              </button>
              <button
                className={`toggle-option-btn ${launchMode === "auto" ? "active-mode" : ""}`}
                onClick={() => setLaunchMode("auto")}
                title="Auto Detect App or Browser"
              >
                ⚡ Auto
              </button>
            </div>

            <label className="checkbox-toggle-lbl margin-left-8" title="Confirm before launching external link">
              <input
                type="checkbox"
                checked={confirmExternalLaunch}
                onChange={(e) => setConfirmExternalLaunch(e.target.checked)}
              />
              <span>Confirm Launch</span>
            </label>
          </div>

          <div className="control-group">
            <button
              className="quick-service-btn btn-random-pick"
              onClick={handleRandomPick}
              title="Pick a random show to watch from your Watchlist!"
            >
              🎲 Random Picker
            </button>

            <button
              className="icon-action-btn"
              onClick={handleExportJSON}
              title="Export Library JSON"
            >
              📥 Backup
            </button>
            <button
              className="icon-action-btn"
              onClick={() => setIsImportModalOpen(true)}
              title="Import JSON"
            >
              📤 Import
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section: CONTINUE WATCHING */}
      {lastWatchedTitle ? (
        <div className="music-card hero-launcher-card">
          <div className="hero-split-content">
            <div className="hero-icon-box">
              {lastWatchedTitle.coverImage ? (
                <img
                  src={nativeDialogService.formatAssetUrl(lastWatchedTitle.coverImage)}
                  alt={lastWatchedTitle.title}
                  className="hero-cover-img"
                />
              ) : (
                <span className="hero-emoji-icon">{lastWatchedTitle.icon || "🎬"}</span>
              )}
            </div>

            <div className="hero-info-block">
              <div className="hero-tag-row">
                <span className="hero-status-pill">⭐ CONTINUE WATCHING</span>
                {getServiceBadge(lastWatchedTitle.serviceId)}
                <span className="category-pill">{lastWatchedTitle.category || "Anime"}</span>
                {lastWatchedTitle.isPinned && <span className="pin-badge">📌 Pinned</span>}
              </div>

              <h2 className="hero-title">{lastWatchedTitle.title || "Untitled Show"}</h2>
              {lastWatchedTitle.notes && <p className="hero-description">{lastWatchedTitle.notes}</p>}

              <div className="hero-meta-row">
                <span>
                  📺 Episode {lastWatchedTitle.currentEpisode || 1}
                  {lastWatchedTitle.totalEpisodes ? ` / ${lastWatchedTitle.totalEpisodes}` : ""}
                </span>
                <span>•</span>
                <span>⭐ {lastWatchedTitle.rating || 5}/5</span>
                <span>•</span>
                <span>
                  {lastWatchedTitle.lastWatchedAt && !isNaN(new Date(lastWatchedTitle.lastWatchedAt).getTime())
                    ? `Last watched: ${new Date(lastWatchedTitle.lastWatchedAt).toLocaleDateString()} ${new Date(
                        lastWatchedTitle.lastWatchedAt
                      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Ready to watch"}
                </span>
              </div>
            </div>

            <div className="hero-action-box">
              <button
                className="hero-launch-main-btn"
                onClick={() => launchTitle(lastWatchedTitle.id)}
              >
                <span className="launch-icon">▶</span>
                <span>CONTINUE EP {lastWatchedTitle.currentEpisode || 1}</span>
              </button>

              <button
                className="quick-service-btn btn-plus-ep"
                onClick={() => incrementProgress(lastWatchedTitle.id)}
                title="Mark episode finished (+1 Ep)"
              >
                +1 Episode
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="music-card hero-launcher-card empty-hero">
          <div className="empty-hero-content">
            <span className="empty-icon">🍿</span>
            <h3>No media title watched yet</h3>
            <p>Add a show or movie below to track your progress and launch instantly!</p>
          </div>
        </div>
      )}

      {/* Watchlist Hub: Status Filter + Category Filter + Titles Grid */}
      <div className="music-card playlists-hub-card">
        <div className="playlists-header-row">
          <div className="title-group-left">
            <span className="title-music-icon">🎬</span>
            <h2 className="card-title-text">YOUR MEDIA WATCHLIST ({(titles || []).length})</h2>
          </div>

          <div className="playlists-header-actions">
            {/* Search Input */}
            <div className="music-search-box">
              <span className="search-icon">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                className="music-search-input"
                placeholder="Search Watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              className="music-select-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="manual">🖐️ Drag & Drop (Manual)</option>
              <option value="recent">🕒 Recently Watched</option>
              <option value="most_watched">🔥 Most Watched</option>
              <option value="rating">⭐ Highest Rating</option>
              <option value="az">🔤 Title (A-Z)</option>
            </select>

            {/* Add Title Button */}
            <button className="add-playlist-btn" onClick={handleOpenAddTitleModal} title="Shortcut: Ctrl+N">
              <span>+</span> Add Show / Movie
            </button>
          </div>
        </div>

        {/* Watchlist Status Filter Tabs */}
        <div className="watchlist-status-tabs">
          {["All", "Watching", "Planned", "Completed", "Paused", "Dropped"].map((st) => (
            <button
              key={st}
              className={`status-tab-btn ${activeStatusFilter === st ? "active" : ""}`}
              onClick={() => setActiveStatusFilter(st)}
            >
              {st === "Watching" && "📺 "}
              {st === "Planned" && "📋 "}
              {st === "Completed" && "✅ "}
              {st === "Paused" && "⏸️ "}
              {st === "Dropped" && "🗑️ "}
              {st}
            </button>
          ))}
        </div>

        {/* Category Filter Pills Bar */}
        <div className="category-filter-bar">
          <button
            className={`category-tab-btn ${activeCategoryFilter === "All" ? "active" : ""}`}
            onClick={() => setActiveCategoryFilter("All")}
          >
            <span className="cat-icon">🎬</span>
            <span className="cat-label">All</span>
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="category-tab-wrapper">
              <button
                className={`category-tab-btn ${activeCategoryFilter === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter(cat.id)}
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

        {/* Titles Grid with Drag & Drop */}
        {(filteredTitles || []).length > 0 ? (
          <div className="playlists-grid">
            {filteredTitles.map((item, idx) => (
              <div
                key={item.id}
                draggable={sortOption === "manual"}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onClick={() => setSelectedCardId(item.id)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                className={`playlist-card-item ${selectedCardId === item.id ? "selected-card" : ""} ${
                  dragOverIndex === idx ? "drag-over-target" : ""
                } ${draggedIndex === idx ? "dragging-source" : ""}`}
              >
                <div className="card-top-row">
                  {item.coverImage ? (
                    <img
                      src={nativeDialogService.formatAssetUrl(item.coverImage)}
                      alt={item.title}
                      className="playlist-card-cover-img"
                    />
                  ) : (
                    <span className="playlist-emoji-icon">{item.icon || "🎬"}</span>
                  )}

                  <div className="badge-group">
                    {getServiceBadge(item.serviceId)}
                    <span className="category-pill">{item.status || "Watching"}</span>
                  </div>

                  <button
                    className={`fav-star-btn ${item.isPinned ? "active-pin" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(item.id);
                    }}
                    title={item.isPinned ? "Unpin Title" : "Pin Title"}
                  >
                    📌
                  </button>

                  <button
                    className={`fav-star-btn ${item.isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    title={item.isFavorite ? "Remove Favorite" : "Mark Favorite"}
                  >
                    {item.isFavorite ? "♥" : "♡"}
                  </button>
                </div>

                <div className="card-body">
                  <h3 className="playlist-card-title">{item.title || "Untitled Show"}</h3>
                  <div className="episode-progress-row">
                    <span className="ep-counter-tag">
                      📺 Ep {item.currentEpisode || 1}
                      {item.totalEpisodes ? ` / ${item.totalEpisodes}` : ""}
                    </span>
                    <span className="rating-tag">⭐ {item.rating || 5}/5</span>
                  </div>

                  {item.notes && <p className="playlist-card-desc">{item.notes}</p>}

                  {Array.isArray(item.categories) && item.categories.length > 0 && (
                    <div className="multi-tag-row">
                      {item.categories.map((c, i) => (
                        <span key={i} className="mini-tag">
                          #{c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-footer-row">
                  <button
                    className="quick-service-btn btn-plus-mini"
                    onClick={(e) => {
                      e.stopPropagation();
                      incrementProgress(item.id);
                    }}
                    title="Increment +1 Episode"
                  >
                    +1 Ep
                  </button>

                  <div className="card-btn-group">
                    <button
                      className="playlist-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateTitle(item.id);
                      }}
                      title="Duplicate Entry"
                    >
                      📋 Copy
                    </button>

                    <button
                      className="playlist-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditTitleModal(item);
                      }}
                      title="Edit Entry"
                    >
                      ✏ Edit
                    </button>

                    <button
                      className="playlist-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${item.title}"?`)) {
                          deleteTitle(item.id);
                        }
                      }}
                      title="Delete Entry"
                    >
                      🗑
                    </button>

                    <button
                      className="playlist-launch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        launchTitle(item.id);
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
            <span className="empty-state-icon">🍿</span>
            <p className="empty-state-title">No media found</p>
            <p className="empty-state-sub">
              {searchQuery
                ? `No titles match "${searchQuery}".`
                : activeStatusFilter !== "All"
                ? `No titles under status "${activeStatusFilter}".`
                : "Your entertainment watchlist is empty."}
            </p>
            <button className="add-playlist-btn margin-top-12" onClick={handleOpenAddTitleModal}>
              + Add New Show / Movie
            </button>
          </div>
        )}
      </div>

      {/* Recently Watched Section */}
      {(recentlyWatched || []).length > 0 && (
        <div className="music-card recently-opened-card">
          <div className="card-title-row">
            <span className="title-clock-icon">🕒</span>
            <h2 className="card-title-text">RECENTLY WATCHED HISTORY</h2>
          </div>

          <div className="recently-opened-list">
            {recentlyWatched.map((item) => (
              <div key={item.id} className="rp-launch-row">
                <span className="rp-item-icon">{item.icon || "🎬"}</span>

                <div className="rp-item-info">
                  <span className="rp-item-title">{item.title || "Untitled"}</span>
                  <div className="rp-item-sub">
                    {getServiceBadge(item.serviceId)}
                    <span className="category-pill mini">Ep {item.episode}</span>
                    <span className="rp-time-stamp">
                      {item?.watchedAt && !isNaN(new Date(item.watchedAt).getTime())
                        ? new Date(item.watchedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                </div>

                <button
                  className="rp-relaunch-btn"
                  onClick={() => launchTitle(item.titleId)}
                >
                  ▶ Watch Now
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
              launchTitle(contextMenu.title.id);
              setContextMenu(null);
            }}
          >
            🚀 Launch Media
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              incrementProgress(contextMenu.title.id);
              setContextMenu(null);
            }}
          >
            ▶ Mark +1 Episode
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              handleOpenEditTitleModal(contextMenu.title);
              setContextMenu(null);
            }}
          >
            ✏ Edit Title
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              duplicateTitle(contextMenu.title.id);
              setContextMenu(null);
            }}
          >
            📋 Duplicate (Copy)
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              togglePin(contextMenu.title.id);
              setContextMenu(null);
            }}
          >
            📌 {contextMenu.title.isPinned ? "Unpin" : "Pin to Top"}
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              toggleFavorite(contextMenu.title.id);
              setContextMenu(null);
            }}
          >
            ♥ {contextMenu.title.isFavorite ? "Unfavorite" : "Favorite"}
          </div>
          <div className="context-menu-divider" />
          <div
            className="context-menu-item danger-item"
            onClick={() => {
              if (window.confirm(`Delete "${contextMenu.title.title}"?`)) {
                deleteTitle(contextMenu.title.id);
              }
              setContextMenu(null);
            }}
          >
            🗑 Delete Title
          </div>
        </div>
      )}

      {/* Add / Edit Title Modal */}
      {isTitleModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsTitleModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTitleId ? "✏ Edit Media Title" : "➕ Add Show / Movie"}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsTitleModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTitle} className="modal-form">
              {formError && <div className="modal-error-banner">⚠️ {formError}</div>}

              <div className="form-group">
                <label className="form-label">Show / Movie Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Solo Leveling, Arcane, Dune"
                  value={formTitleName}
                  onChange={(e) => setFormTitleName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Streaming Platform</label>
                  <select
                    className="form-select"
                    value={formServiceId}
                    onChange={(e) => setFormServiceId(e.target.value)}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Watchlist Status</label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as WatchlistStatus)}
                  >
                    <option value="Watching">📺 Watching</option>
                    <option value="Planned">📋 Planned</option>
                    <option value="Completed">✅ Completed</option>
                    <option value="Paused">⏸️ Paused</option>
                    <option value="Dropped">🗑️ Dropped</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Current Episode</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formEpisode}
                    onChange={(e) => setFormEpisode(parseInt(e.target.value || "1", 10))}
                    min={1}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Episodes (Optional)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 12 or 24"
                    value={formTotalEpisodes}
                    onChange={(e) => setFormTotalEpisodes(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Direct Web / Stream Link</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.crunchyroll.com/... or https://www.netflix.com/title/..."
                  value={formDirectUrl}
                  onChange={(e) => setFormDirectUrl(e.target.value)}
                />
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

              {/* Poster Artwork Upload */}
              <div className="form-group">
                <label className="form-label">Poster / Cover Image (File or URL)</label>
                <div className="cover-upload-row">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Image URL or local image file path..."
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                  />
                  <button type="button" className="add-playlist-btn" onClick={handlePickCoverImage}>
                    📁 Browse
                  </button>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Rating (1-5 Stars)</label>
                  <select
                    className="form-select"
                    value={formRating}
                    onChange={(e) => setFormRating(parseInt(e.target.value, 10))}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
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
                    <span>📌 Pinned Title</span>
                  </label>
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
                <label className="form-label">Notes / Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Notes, episode thoughts, or season details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsTitleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingTitleId ? "Save Changes" : "Create Title"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Manager Modal */}
      {isServiceModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsServiceModalOpen(false)}>
          <div className="music-modal-box large-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚙ Streaming Services & Smart Launcher Manager</h3>
              <button className="modal-close-btn" onClick={() => setIsServiceModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="service-manager-list">
                {services.map((srv) => (
                  <div key={srv.id} className="service-manager-row">
                    <span className="srv-icon" style={{ color: srv.color }}>
                      {srv.icon}
                    </span>
                    <div className="srv-info">
                      <span className="srv-name">{srv.name}</span>
                      <span className="srv-url-sub">{srv.searchUrlTemplate || srv.websiteUrl}</span>
                    </div>

                    <button
                      className="quick-service-btn btn-test-launcher"
                      onClick={() => handleTestService(srv)}
                      title="Run Diagnostic Smart Launcher Test"
                    >
                      🧪 Test Launcher
                    </button>

                    <label className="checkbox-toggle-lbl" title="Enable/Disable Service for Universal Search">
                      <input
                        type="checkbox"
                        checked={srv.enabled}
                        onChange={() => toggleServiceEnabled(srv.id)}
                      />
                      <span>{srv.enabled ? "Active" : "Disabled"}</span>
                    </label>

                    <button
                      className="playlist-edit-btn"
                      onClick={() => handleOpenEditService(srv)}
                    >
                      ✏ Edit
                    </button>

                    {srv.isCustom && (
                      <button
                        className="playlist-delete-btn"
                        onClick={() => deleteService(srv.id)}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Service Edit / Create Sub-Form */}
              <div className="service-sub-form-card margin-top-12">
                <h4 className="sub-form-title">
                  {editingServiceId ? "✏ Edit Service Template" : "➕ Add Custom Service"}
                </h4>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Service Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Crunchyroll, Stremio, Netflix"
                      value={serviceFormName}
                      onChange={(e) => setServiceFormName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emoji Icon</label>
                    <input
                      type="text"
                      className="form-input icon-input"
                      value={serviceFormIcon}
                      onChange={(e) => setServiceFormIcon(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Website URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://www.example.com"
                    value={serviceFormWebsiteUrl}
                    onChange={(e) => setServiceFormWebsiteUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Search URL Template (Use {'{query}'})</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://www.example.com/search?q={query}"
                    value={serviceFormSearchTemplate}
                    onChange={(e) => setServiceFormSearchTemplate(e.target.value)}
                  />
                  <span className="form-hint">
                    Example: https://www.crunchyroll.com/search?q={"{query}"}
                  </span>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Native Protocol URI Scheme (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. crunchyroll:// or netflix:"
                      value={serviceFormNativeUri}
                      onChange={(e) => setServiceFormNativeUri(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Launch Method</label>
                    <select
                      className="form-select"
                      value={serviceFormLaunchMode}
                      onChange={(e) => setServiceFormLaunchMode(e.target.value as LaunchModeOption)}
                    >
                      <option value="auto">⚡ Auto (Smart Fallback)</option>
                      <option value="app">🖥️ Native App Only</option>
                      <option value="browser">🌐 Web Browser Only</option>
                    </select>
                  </div>
                </div>

                {/* Local Executable Path Selection */}
                <div className="form-group">
                  <label className="form-label">Local Executable Path (Optional .exe)</label>
                  <div className="cover-upload-row">
                    <input
                      type="text"
                      className="form-input flex-1"
                      placeholder="e.g. C:\Program Files\Crunchyroll\Crunchyroll.exe"
                      value={serviceFormExePath}
                      onChange={(e) => setServiceFormExePath(e.target.value)}
                    />
                    <button type="button" className="add-playlist-btn" onClick={handlePickServiceExePath}>
                      📁 Browse Executable
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  {editingServiceId && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleOpenAddService}
                    >
                      Reset Form
                    </button>
                  )}
                  <button type="button" className="btn-save" onClick={handleSaveService}>
                    {editingServiceId ? "Update Service" : "Add Service"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Launcher Diagnostic Modal */}
      {testResult && (
        <div className="music-modal-backdrop" onClick={() => setTestResult(null)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🧪 Launcher Diagnostic Report: {testResult.serviceName}</h3>
              <button className="modal-close-btn" onClick={() => setTestResult(null)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="diagnostic-card">
                <div className="diag-row">
                  <span className="diag-label">Executable Found:</span>
                  <span className={`diag-val ${testResult.result.exeFound ? "val-green" : "val-amber"}`}>
                    {testResult.result.exeFound ? "✅ Yes" : "❌ No"}
                  </span>
                </div>

                <div className="diag-row">
                  <span className="diag-label">Executable Path:</span>
                  <span className="diag-val code-path">
                    {testResult.serviceConfig.exePath || "None configured"}
                  </span>
                </div>

                <div className="diag-row">
                  <span className="diag-label">URI Scheme Registered:</span>
                  <span className={`diag-val ${testResult.result.uriSupported ? "val-green" : "val-amber"}`}>
                    {testResult.result.uriSupported ? "✅ Yes" : "❌ No"}
                  </span>
                </div>

                <div className="diag-row">
                  <span className="diag-label">URI Scheme Value:</span>
                  <span className="diag-val code-path">
                    {testResult.serviceConfig.nativeUri || "None configured"}
                  </span>
                </div>

                <div className="diag-row">
                  <span className="diag-label">Browser Fallback Available:</span>
                  <span className="diag-val val-green">✅ Yes ({testResult.serviceConfig.websiteUrl})</span>
                </div>

                <div className="diag-row">
                  <span className="diag-label">Selected Launch Mode:</span>
                  <span className="diag-val highlight-purple">
                    {testResult.serviceConfig.preferredLaunchMethod.toUpperCase()}
                  </span>
                </div>

                <div className="diag-row margin-top-8">
                  <span className="diag-label">Effective Target Launched:</span>
                  <span className="diag-val highlight-green bold-text">
                    {testResult.result.details}
                  </span>
                </div>
              </div>

              <div className="modal-actions margin-top-12">
                <button type="button" className="btn-save" onClick={() => setTestResult(null)}>
                  Close Diagnostic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Category Modal */}
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
                  placeholder="e.g. Kdrama, Sci-Fi, Thriller"
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
              <h3 className="modal-title">📤 Import Media Library JSON</h3>
              <button className="modal-close-btn" onClick={() => setIsImportModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Option A: Select JSON File</label>
                <button
                  type="button"
                  className="add-playlist-btn"
                  onClick={async () => {
                    const file = await nativeDialogService.pickFile(
                      "Select JSON Import File",
                      "JSON Files (*.json)",
                      ["json"]
                    );
                    if (file) {
                      try {
                        const content = await window.fetch(nativeDialogService.formatAssetUrl(file)).then((r) => r.text());
                        if (content) {
                          await importJSON(content);
                          setIsImportModalOpen(false);
                        }
                      } catch (err) {
                        const str = window.prompt("Paste JSON string content:");
                        if (str) {
                          await importJSON(str);
                          setIsImportModalOpen(false);
                        }
                      }
                    }
                  }}
                >
                  📁 Choose File to Import
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Option B: Paste Raw JSON</label>
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
                  Import Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Ribbon */}
      <div className="music-footer-ribbon">
        <span className="ribbon-flower">🎬</span>
        <span className="footer-kanji">良い物語は、人生を豊かに彩る。</span>
        <span className="footer-english">
          Time spent enjoying great stories is never wasted.
        </span>
        <span className="ribbon-flower">🌸</span>
      </div>
    </div>
  );
}
