import { useState, useRef } from "react";
import { useNotesStore } from "../../modules/notes";
import { useProfileStore } from "../../stores/profileStore";
import { nativeDialogService } from "../../services/nativeDialogService";
import { NotebookItem, NoteTemplate } from "../../modules/notes/types";

interface NotesOverviewProps {
  onSelectNote: (noteId: string) => void;
}

export function NotesOverview({ onSelectNote }: NotesOverviewProps) {
  const {
    notes,
    notebooks,
    folders,
    allCollections,
    allTags,
    templates,
    summary,
    getNotes,
    getOrCreateDailyJournal,
    getJournalDateNav,
    createNote,
    createNotebook,
    deleteNotebook,
    createFolder,
    deleteFolder,
    restoreNote,
    deleteNote,
    archiveNote,
    togglePin,
    toggleFavorite,
    importMarkdownNote,
  } = useNotesStore();

  const { profile } = useProfileStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [activeView, setActiveView] = useState<
    "all" | "journal" | "favorites" | "pinned" | "recent" | "frequently_edited" | "recently_viewed" | "archived" | "trash"
  >("all");
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Daily Journal Date Navigation
  const [journalDate, setJournalDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const journalNav = getJournalDateNav(journalDate);

  // Modals
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState<boolean>(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);

  // Form states
  const [newNbTitle, setNewNbTitle] = useState<string>("");
  const [newNbColor, setNewNbColor] = useState<NotebookItem["color"]>("purple");
  const [newNbIcon, setNewNbIcon] = useState<string>("🔮");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [newFolderIcon, setNewFolderIcon] = useState<string>("📁");

  // Import state
  const [importText, setImportText] = useState<string>("");
  const [importTitle, setImportTitle] = useState<string>("");

  // New Note Template Selection State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("template-blank");

  const filteredNotes = getNotes({
    view: activeView,
    notebookId: selectedNotebookId,
    folderId: selectedFolderId,
    collection: selectedCollection,
    tag: selectedTag,
    search: searchQuery,
  });

  const handleCreateNoteWithTemplate = async (tmpl?: NoteTemplate) => {
    const templateId = tmpl?.id || selectedTemplateId;
    const created = await createNote({
      templateId,
      notebookId: selectedNotebookId !== "all" ? selectedNotebookId : "nb-personal",
      collections: selectedCollection !== "all" ? [selectedCollection] : ["DailyLife"],
    });
    setIsTemplateModalOpen(false);
    onSelectNote(created.id);
  };

  const handleOpenDailyJournal = async (targetDateStr?: string) => {
    const dStr = targetDateStr || journalDate;
    const journal = await getOrCreateDailyJournal(dStr);
    onSelectNote(journal.id);
  };

  const handleSaveNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNbTitle.trim()) return;
    await createNotebook(newNbTitle.trim(), newNbColor, newNbIcon || "🔮");
    setNewNbTitle("");
    setIsNotebookModalOpen(false);
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), newFolderIcon || "📁");
    setNewFolderName("");
    setIsFolderModalOpen(false);
  };

  const handlePickImportFile = async () => {
    const file = await nativeDialogService.pickFile(
      "Select Markdown or Text Note to Import",
      "Markdown & Text Files (*.md, *.txt)",
      ["md", "txt"]
    );
    if (file) {
      try {
        const text = await window.fetch(nativeDialogService.formatAssetUrl(file)).then((r) => r.text());
        const fileName = file.split(/[\\/]/).pop()?.replace(/\.(md|txt)$/i, "") || "Imported Note";
        const created = await importMarkdownNote(fileName, text);
        onSelectNote(created.id);
        setIsImportModalOpen(false);
      } catch (err) {
        const str = window.prompt("Paste Markdown text content to import:");
        if (str) {
          const created = await importMarkdownNote("Imported Note", str);
          onSelectNote(created.id);
          setIsImportModalOpen(false);
        }
      }
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const created = await importMarkdownNote(importTitle.trim() || "Imported Note", importText.trim());
    onSelectNote(created.id);
    setIsImportModalOpen(false);
  };

  const currentXpValue = typeof profile?.currentXP === "number" ? profile.currentXP : 0;

  return (
    <div className="notes-overview-container">
      {/* Top Header Bar */}
      <div className="notes-header-bar">
        <div className="notes-title-row">
          <div className="notes-crest-badge">
            <span>📚</span>
          </div>
          <div>
            <h1 className="notes-page-title">CONNECTED KNOWLEDGE HUB</h1>
            <p className="notes-quote-text">Knowledge collected becomes power.</p>
          </div>
        </div>

        <div className="notes-stats-row">
          <div className="notes-stat-badge">
            <span className="stat-icon">🔥</span>
            <span className="stat-val">{profile?.stats?.streakDays || summary.streak}</span>
            <span className="stat-lbl">STREAK</span>
          </div>

          <div className="notes-stat-badge">
            <span className="stat-icon">📖</span>
            <span className="stat-val">{notes.filter((n) => !n.isTrashed).length}</span>
            <span className="stat-lbl">NOTES</span>
          </div>

          <div className="notes-stat-badge">
            <span className="stat-icon">⭐</span>
            <span className="stat-val gold-txt">{currentXpValue.toLocaleString()}</span>
            <span className="stat-lbl">XP</span>
          </div>

          <div className="user-profile-badge-small">
            <div className="avatar-circle-small">
              <span className="avatar-img-fallback">🧙‍♂️</span>
            </div>
            <div className="profile-badge-info">
              <span className="profile-name-sm">{profile?.name || "Scholar"}</span>
              <span className="profile-lv-sm">
                Lv. {profile?.level || 1} • {currentXpValue} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Views Tabs + Search Bar + Quick Actions */}
      <div className="notes-control-bar">
        <div className="notes-view-tabs">
          <button
            className={`view-tab-btn ${activeView === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveView("all");
              setSelectedNotebookId("all");
              setSelectedTag("");
            }}
          >
            📚 All Notes
          </button>
          <button
            className={`view-tab-btn ${activeView === "journal" ? "active" : ""}`}
            onClick={() => setActiveView("journal")}
          >
            📖 Daily Journal
          </button>
          <button
            className={`view-tab-btn ${activeView === "favorites" ? "active" : ""}`}
            onClick={() => setActiveView("favorites")}
          >
            ♥ Favorites
          </button>
          <button
            className={`view-tab-btn ${activeView === "pinned" ? "active" : ""}`}
            onClick={() => setActiveView("pinned")}
          >
            📌 Pinned
          </button>
          <button
            className={`view-tab-btn ${activeView === "recent" ? "active" : ""}`}
            onClick={() => setActiveView("recent")}
          >
            🕒 Recent
          </button>
          <button
            className={`view-tab-btn ${activeView === "frequently_edited" ? "active" : ""}`}
            onClick={() => setActiveView("frequently_edited")}
          >
            ✏️ Freq. Edited
          </button>
          <button
            className={`view-tab-btn ${activeView === "recently_viewed" ? "active" : ""}`}
            onClick={() => setActiveView("recently_viewed")}
          >
            👀 Rec. Viewed
          </button>
          <button
            className={`view-tab-btn ${activeView === "archived" ? "active" : ""}`}
            onClick={() => setActiveView("archived")}
          >
            📦 Archive
          </button>
          <button
            className={`view-tab-btn ${activeView === "trash" ? "active" : ""}`}
            onClick={() => setActiveView("trash")}
          >
            🗑️ Trash
          </button>
        </div>

        <div className="notes-search-control">
          <span className="search-icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            className="notes-global-search-input"
            placeholder="Search titles, text, tags, collections... (Ctrl+Shift+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="notes-action-buttons">
          <button
            className="btn-quick-note"
            onClick={() => setIsTemplateModalOpen(true)}
            title="Create Note from Template"
          >
            <span>+</span> New Note / Template
          </button>

          <button
            className="btn-quick-note btn-journal-quick"
            onClick={() => handleOpenDailyJournal()}
            title="Today's Journal"
          >
            📖 Today's Journal
          </button>

          <button
            className="btn-import-note"
            onClick={() => setIsImportModalOpen(true)}
            title="Import Markdown Note"
          >
            📥 Import
          </button>
        </div>
      </div>

      {/* Daily Journal Calendar & Date Bar */}
      {activeView === "journal" && (
        <div className="journal-calendar-bar">
          <button
            className="journal-nav-btn"
            onClick={() => {
              setJournalDate(journalNav.prevDate);
              handleOpenDailyJournal(journalNav.prevDate);
            }}
          >
            ◀ {journalNav.prevDate}
          </button>

          <div className="journal-date-picker-group">
            <span className="cal-icon">📅</span>
            <input
              type="date"
              className="journal-date-input"
              value={journalDate}
              onChange={(e) => {
                setJournalDate(e.target.value);
                handleOpenDailyJournal(e.target.value);
              }}
            />
            <button
              className="journal-nav-btn today-btn"
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setJournalDate(today);
                handleOpenDailyJournal(today);
              }}
            >
              Today
            </button>
          </div>

          <button
            className="journal-nav-btn"
            onClick={() => {
              setJournalDate(journalNav.nextDate);
              handleOpenDailyJournal(journalNav.nextDate);
            }}
          >
            {journalNav.nextDate} ▶
          </button>
        </div>
      )}

      {/* Collections Pills Bar */}
      <div className="collections-filter-bar">
        <span className="col-bar-title">COLLECTIONS:</span>
        <button
          className={`collection-chip ${selectedCollection === "all" ? "active" : ""}`}
          onClick={() => setSelectedCollection("all")}
        >
          All Collections
        </button>
        {allCollections.map((col) => (
          <button
            key={col}
            className={`collection-chip ${selectedCollection === col ? "active" : ""}`}
            onClick={() => setSelectedCollection(selectedCollection === col ? "all" : col)}
          >
            #{col}
          </button>
        ))}
      </div>

      {/* Main Layout Grid: Left Hierarchy Sidebar + Right Notes Grid */}
      <div className="notes-main-grid">
        {/* Left Column: Folders & Notebooks Hierarchy */}
        <div className="notes-panel hierarchy-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">NOTEBOOKS & FOLDERS</h2>
            <div className="panel-btn-group">
              <button
                className="mini-add-btn"
                onClick={() => setIsFolderModalOpen(true)}
                title="New Folder"
              >
                📁+
              </button>
              <button
                className="mini-add-btn"
                onClick={() => setIsNotebookModalOpen(true)}
                title="New Notebook"
              >
                📖+
              </button>
            </div>
          </div>

          <div className="hierarchy-scroll-list">
            <div
              className={`hierarchy-item-row ${
                selectedNotebookId === "all" && selectedFolderId === "all" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedNotebookId("all");
                setSelectedFolderId("all");
              }}
            >
              <span className="item-icon">📂</span>
              <span className="item-title">All Notebooks</span>
              <span className="item-count">{notes.filter((n) => !n.isTrashed).length}</span>
            </div>

            {folders.length > 0 && (
              <div className="hierarchy-section">
                <span className="section-hdr-lbl">FOLDERS</span>
                {folders.map((f) => (
                  <div
                    key={f.id}
                    className={`hierarchy-item-row ${selectedFolderId === f.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedFolderId(f.id);
                      setSelectedNotebookId("all");
                    }}
                  >
                    <span className="item-icon">{f.icon || "📁"}</span>
                    <span className="item-title">{f.name}</span>
                    <button
                      className="mini-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete folder "${f.name}"?`)) {
                          deleteFolder(f.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="hierarchy-section">
              <span className="section-hdr-lbl">NOTEBOOKS</span>
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  className={`hierarchy-item-row ${selectedNotebookId === nb.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedNotebookId(nb.id);
                    setSelectedFolderId("all");
                  }}
                >
                  <span className="item-icon">{nb.iconSymbol || "📖"}</span>
                  <span className="item-title">{nb.title}</span>
                  <span className={`nb-color-pill color-${nb.color}`}>{nb.noteCount}</span>

                  {nb.id !== "nb-personal" && (
                    <button
                      className="mini-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete notebook "${nb.title}"?`)) {
                          deleteNotebook(nb.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {allTags.length > 0 && (
              <div className="hierarchy-section">
                <span className="section-hdr-lbl">TAGS ({allTags.length})</span>
                <div className="tags-cloud-container">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`tag-cloud-chip ${selectedTag === tag ? "active" : ""}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notes Grid */}
        <div className="notes-panel notes-grid-panel">
          <div className="panel-header-row">
            <div className="grid-header-left">
              <h2 className="panel-title">
                {activeView === "trash"
                  ? "TRASH BIN"
                  : activeView === "archived"
                  ? "ARCHIVED NOTES"
                  : activeView === "favorites"
                  ? "FAVORITE NOTES"
                  : activeView === "pinned"
                  ? "PINNED NOTES"
                  : activeView === "journal"
                  ? "DAILY JOURNALS"
                  : "KNOWLEDGE NOTES"}{" "}
                ({filteredNotes.length})
              </h2>
              {selectedTag && (
                <span className="active-tag-badge">
                  Tag: {selectedTag}{" "}
                  <button className="tag-clear-btn" onClick={() => setSelectedTag("")}>
                    ✕
                  </button>
                </span>
              )}
            </div>

            <span className="note-shortcut-hint">Ctrl+Shift+N to Quick Capture</span>
          </div>

          {filteredNotes.length > 0 ? (
            <div className="notes-card-grid">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`note-card-item ${note.pinned ? "pinned-card" : ""}`}
                  onClick={() => onSelectNote(note.id)}
                >
                  <div className="note-card-header">
                    <div className="card-badge-row">
                      <span className="notebook-pill">{note.notebookName}</span>
                      {note.isJournal && <span className="journal-badge">📖 Journal</span>}
                      {note.pinned && <span className="pin-badge">📌 Pinned</span>}
                    </div>

                    <div className="card-top-actions">
                      <button
                        className={`star-btn ${note.pinned ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(note.id);
                        }}
                        title="Pin Note"
                      >
                        📌
                      </button>

                      <button
                        className={`star-btn ${note.isFavorite ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(note.id);
                        }}
                        title="Favorite Note"
                      >
                        {note.isFavorite ? "♥" : "♡"}
                      </button>
                    </div>
                  </div>

                  <div className="note-card-body">
                    <h3 className="note-card-title">{note.title || "Untitled Note"}</h3>
                    <p className="note-card-snippet">{note.snippet || "No content snippet..."}</p>

                    {Array.isArray(note.collections) && note.collections.length > 0 && (
                      <div className="card-collections-row">
                        {note.collections.map((col, idx) => (
                          <span key={idx} className="collection-tag-pill">
                            #{col}
                          </span>
                        ))}
                      </div>
                    )}

                    {note.tags.length > 0 && (
                      <div className="card-tags-row">
                        {note.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="card-tag-pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="note-card-footer">
                    <span className="card-meta-text">
                      📝 {note.wordsCount} words • ⏱️ {note.readingTimeMinutes} min • {note.lastEdited}
                    </span>

                    <div className="card-footer-btns">
                      {activeView === "trash" ? (
                        <>
                          <button
                            className="card-mini-btn btn-restore"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreNote(note.id);
                            }}
                            title="Restore Note"
                          >
                            ↩ Restore
                          </button>
                          <button
                            className="card-mini-btn btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Permanently delete "${note.title}"?`)) {
                                deleteNote(note.id);
                              }
                            }}
                            title="Permanent Delete"
                          >
                            🗑 Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="card-mini-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNote(note.id);
                            }}
                            title="Archive Note"
                          >
                            📦
                          </button>
                          <button
                            className="card-mini-btn btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            title="Trash Note"
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notes-empty-state">
              <span className="empty-icon">📜</span>
              <h3>No notes found</h3>
              <p>
                {searchQuery
                  ? `No notes match "${searchQuery}".`
                  : activeView === "trash"
                  ? "Trash bin is empty."
                  : "Your parchment workspace is empty."}
              </p>

              <button
                className="btn-quick-note margin-top-12"
                onClick={() => setIsTemplateModalOpen(true)}
              >
                + Create Note from Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Templates Selector Modal */}
      {isTemplateModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsTemplateModalOpen(false)}>
          <div className="music-modal-box large-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📑 Choose a Note Template</h3>
              <button className="modal-close-btn" onClick={() => setIsTemplateModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="templates-grid">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className={`template-card-item ${
                      selectedTemplateId === tmpl.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                  >
                    <div className="tmpl-hdr">
                      <span className="tmpl-icon">{tmpl.icon}</span>
                      <span className="tmpl-name">{tmpl.name}</span>
                    </div>
                    <span className="tmpl-category">{tmpl.category}</span>
                    <p className="tmpl-preview">{tmpl.defaultTitle}</p>
                    <button
                      className="btn-save btn-use-tmpl"
                      onClick={() => handleCreateNoteWithTemplate(tmpl)}
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>

              <div className="modal-actions margin-top-12">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsTemplateModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Notebook Modal */}
      {isNotebookModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsNotebookModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📖 Create New Notebook</h3>
              <button className="modal-close-btn" onClick={() => setIsNotebookModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotebook} className="modal-form">
              <div className="form-group">
                <label className="form-label">Notebook Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. JAPANESE STUDY, WORK LOG"
                  value={newNbTitle}
                  onChange={(e) => setNewNbTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Icon Symbol</label>
                  <input
                    type="text"
                    className="form-input icon-input"
                    value={newNbIcon}
                    onChange={(e) => setNewNbIcon(e.target.value)}
                    maxLength={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color Theme</label>
                  <select
                    className="form-select"
                    value={newNbColor}
                    onChange={(e) => setNewNbColor(e.target.value as any)}
                  >
                    <option value="purple">🔮 Purple</option>
                    <option value="blue">🟦 Blue</option>
                    <option value="green">🟩 Green</option>
                    <option value="brown">🟫 Brown</option>
                    <option value="darkblue">🌌 Dark Blue</option>
                    <option value="parchment">📜 Parchment</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsNotebookModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Create Notebook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsFolderModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📁 Create New Folder</h3>
              <button className="modal-close-btn" onClick={() => setIsFolderModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="modal-form">
              <div className="form-group">
                <label className="form-label">Folder Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Research & Development"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icon Emoji</label>
                <input
                  type="text"
                  className="form-input icon-input"
                  value={newFolderIcon}
                  onChange={(e) => setNewFolderIcon(e.target.value)}
                  maxLength={4}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsFolderModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Markdown Modal */}
      {isImportModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsImportModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📥 Import Markdown Note</h3>
              <button className="modal-close-btn" onClick={() => setIsImportModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Option A: Select File (.md / .txt)</label>
                <button
                  type="button"
                  className="btn-import-note"
                  onClick={handlePickImportFile}
                >
                  📁 Choose File to Import
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Option B: Paste Markdown Content</label>
                <input
                  type="text"
                  className="form-input margin-bottom-8"
                  placeholder="Note Title..."
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                />
                <textarea
                  className="form-textarea"
                  placeholder="Paste Markdown text here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
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
                <button type="submit" className="btn-save">
                  Import Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
