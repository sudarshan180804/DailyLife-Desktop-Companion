import { useState } from "react";
import { MOCK_NOTES } from "../../data/notesData";
import { NoteItem } from "../../types/notes";

interface NotesEditorProps {
  initialNoteId?: string;
  onBack: () => void;
}

export function NotesEditor({ initialNoteId, onBack }: NotesEditorProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    initialNoteId || MOCK_NOTES[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeNote: NoteItem =
    MOCK_NOTES.find((n) => n.id === selectedNoteId) || MOCK_NOTES[0];

  const filteredNotes = MOCK_NOTES.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotesList = filteredNotes.filter((n) => n.pinned);
  const recentNotesList = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="notes-editor-container">
      {/* Top Bar Navigation */}
      <div className="editor-top-nav">
        <button className="back-overview-btn" onClick={onBack}>
          ← Back to Notes Overview
        </button>
        <div className="editor-header-titles">
          <h1 className="notes-page-title">NOTES</h1>
          <p className="notes-quote-text">Knowledge collected becomes power.</p>
        </div>
      </div>

      {/* Main Split Layout: Left All Notes List + Right Manuscript Tome */}
      <div className="editor-split-grid">
        {/* Left Column: All Notes List */}
        <div className="all-notes-sidebar">
          <div className="all-notes-header">
            <h2 className="all-notes-title">ALL NOTES</h2>
            <button className="add-note-btn">+</button>
          </div>

          {/* Search Box */}
          <div className="notes-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search-input"
            />
            <span className="filter-icon">⚙️</span>
          </div>

          {/* Scrollable Notes List */}
          <div className="sidebar-notes-scroll">
            {/* PINNED SECTION */}
            {pinnedNotesList.length > 0 && (
              <div className="sidebar-section">
                <span className="sidebar-section-title">PINNED</span>
                {pinnedNotesList.map((note) => (
                  <div
                    key={note.id}
                    className={`sidebar-note-row ${
                      note.id === activeNote.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    <div className="note-row-main">
                      <span className="sidebar-note-title">{note.title}</span>
                      <span className="sidebar-pin-icon">📌</span>
                    </div>
                    <span className="sidebar-note-date">{note.lastEdited}</span>
                  </div>
                ))}
              </div>
            )}

            {/* RECENT NOTES SECTION */}
            <div className="sidebar-section">
              <span className="sidebar-section-title">RECENT NOTES</span>
              {recentNotesList.map((note) => (
                <div
                  key={note.id}
                  className={`sidebar-note-row ${
                    note.id === activeNote.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <div className="note-row-main">
                    <span className="note-icon-sm">📖</span>
                    <span className="sidebar-note-title">{note.title}</span>
                  </div>
                  <span className="sidebar-note-date">{note.lastEdited}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <span className="view-all-notes-link">View All Notes &gt;</span>
          </div>
        </div>

        {/* Right Column: Ancient Scholar Tome Manuscript */}
        <div className="manuscript-tome-panel">
          {/* Tome Binder Rings ornament on left edge */}
          <div className="binder-rings">
            <div className="ring-loop" />
            <div className="ring-loop" />
            <div className="ring-loop" />
            <div className="ring-loop" />
          </div>

          {/* Tome Header Bar */}
          <div className="tome-header-bar">
            <div className="tome-title-group">
              <span className="tome-note-title">{activeNote.title.toUpperCase()}</span>
              <span className="tome-star">⭐</span>
              <span className="tome-edited-time">Last edited: {activeNote.lastEdited}</span>
              <span className="auto-saved-badge">● Auto-saved</span>
            </div>

            <div className="tome-actions-group">
              <button className="tome-action-btn">🔗 Share</button>
              <button className="tome-action-btn">📤 Export</button>
              <button className="tome-action-btn">••• More</button>
            </div>
          </div>

          {/* Rich Text Formatting Toolbar */}
          <div className="formatting-toolbar">
            <select className="toolbar-select">
              <option>Heading 2 ▾</option>
              <option>Heading 1</option>
              <option>Paragraph</option>
            </select>
            <div className="toolbar-divider" />
            <button className="toolbar-btn bold">B</button>
            <button className="toolbar-btn italic">I</button>
            <button className="toolbar-btn underline">U</button>
            <button className="toolbar-btn strike">S</button>
            <div className="toolbar-divider" />
            <button className="toolbar-btn">:=</button>
            <button className="toolbar-btn">1=</button>
            <button className="toolbar-btn">☑</button>
            <button className="toolbar-btn">📷</button>
            <button className="toolbar-btn">&lt;/&gt;</button>
            <button className="toolbar-btn">🔗</button>
            <div className="toolbar-divider" />
            <button className="toolbar-btn">↶</button>
            <button className="toolbar-btn">↷</button>
          </div>

          {/* Parchment Manuscript Page (Content & Right Cards) */}
          <div className="parchment-page-body">
            {/* Main Manuscript Text Column */}
            <div className="manuscript-text-column">
              <h1 className="manuscript-heading">
                {activeNote.content.heading}
              </h1>
              <p className="manuscript-intro">{activeNote.content.intro}</p>

              {activeNote.content.sections.map((section, idx) => (
                <div key={idx} className="manuscript-section">
                  <h3 className="section-heading">{section.title}</h3>
                  <p className="section-subtext">
                    The {section.title.toLowerCase()} system controls all dynamic aspects.
                  </p>
                  <ul className="manuscript-bullet-list">
                    {section.items.map((item, iIdx) => (
                      <li key={iIdx}>
                        <span className="bullet-star">✦</span> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="section-ornament-divider">❖ ────── ❖</div>
                </div>
              ))}
            </div>

            {/* Right Cards Column inside parchment */}
            <div className="manuscript-side-column">
              {/* KEY GOAL Card */}
              {activeNote.content.keyGoal && (
                <div className="key-goal-parchment-card">
                  <div className="pin-tack">📍</div>
                  <h4 className="key-goal-title">KEY GOAL</h4>
                  <p className="key-goal-body">{activeNote.content.keyGoal}</p>
                </div>
              )}

              {/* PHOTO ATTACHMENT */}
              {activeNote.content.photoUrl && (
                <div className="photo-attachment-frame">
                  <div className="tape-strip top-left" />
                  <img
                    src={activeNote.content.photoUrl}
                    alt="Note Attachment"
                    className="photo-attachment-img"
                  />
                </div>
              )}

              {/* TAGS BOX */}
              <div className="side-tags-box">
                <h4 className="side-box-title">TAGS</h4>
                <div className="side-tags-list">
                  {activeNote.tags.map((tag, idx) => (
                    <span key={idx} className="side-tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* ATTACHMENTS BOX */}
              {activeNote.content.attachments && (
                <div className="side-attachments-box">
                  <h4 className="side-box-title">
                    ATTACHMENTS ({activeNote.content.attachments.length})
                  </h4>
                  <div className="attachments-list">
                    {activeNote.content.attachments.map((att, idx) => (
                      <div key={idx} className="attachment-item-row">
                        <span className="att-icon">📄</span>
                        <span className="att-name">{att.name}</span>
                        <span className="att-download">📥</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Feather Quill Ornament */}
            <div className="feather-quill-ornament">🪶</div>
          </div>
        </div>
      </div>
    </div>
  );
}
