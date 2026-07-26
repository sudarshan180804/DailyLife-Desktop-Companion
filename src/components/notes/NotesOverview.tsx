import {
  MOCK_NOTEBOOKS,
  MOCK_NOTES,
  MOCK_NOTES_SUMMARY,
} from "../../data/notesData";
import { FlameIcon, StarIcon } from "../Icons";

interface NotesOverviewProps {
  onSelectNote: (noteId: string) => void;
}

export function NotesOverview({ onSelectNote }: NotesOverviewProps) {
  const pinnedNotes = MOCK_NOTES.filter((n) => n.pinned);

  return (
    <div className="notes-overview-container">
      {/* Top Header Bar */}
      <div className="notes-header-bar">
        <div className="notes-title-row">
          <div className="notes-crest-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <h1 className="notes-page-title">NOTES</h1>
            <p className="notes-quote-text">Knowledge collected becomes power.</p>
          </div>
        </div>

        <div className="notes-stats-row">
          <div className="notes-stat-badge">
            <FlameIcon size={16} />
            <span className="stat-val">{MOCK_NOTES_SUMMARY.streak}</span>
            <span className="stat-lbl">STREAK</span>
          </div>

          <div className="notes-stat-badge">
            <span className="stat-icon">📖</span>
            <span className="stat-val">{MOCK_NOTES_SUMMARY.totalNotes}</span>
            <span className="stat-lbl">NOTES</span>
          </div>

          <div className="notes-stat-badge">
            <StarIcon size={16} />
            <span className="stat-val gold-txt">{MOCK_NOTES_SUMMARY.totalXp.toLocaleString()}</span>
            <span className="stat-lbl">TOTAL XP</span>
          </div>

          <div className="user-profile-badge-small">
            <div className="avatar-circle-small">
              <span className="avatar-img-fallback">🧙‍♂️</span>
            </div>
            <div className="profile-badge-info">
              <span className="profile-name-sm">Sudarshan</span>
              <span className="profile-lv-sm">Lv. 24 • 1,250 / 2,000 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Recent Notes + Right Notebooks */}
      <div className="notes-main-grid">
        {/* Left Column: Recent Notes Panel */}
        <div className="notes-panel recent-notes-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">RECENT NOTES</h2>
            <span className="view-all-link">View All &gt;</span>
          </div>

          <div className="recent-notes-list">
            {MOCK_NOTES.map((note) => (
              <div
                key={note.id}
                className="recent-note-row"
                onClick={() => onSelectNote(note.id)}
              >
                <div className="note-icon-box">📖</div>
                <div className="note-info-block">
                  <div className="note-title-line">
                    <span className="note-row-title">{note.title}</span>
                    {note.pinned && <span className="pin-star">📌</span>}
                  </div>
                  <div className="note-tags-line">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="note-time-text">{note.lastEdited}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Notebooks Grid Panel */}
        <div className="notes-panel notebooks-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">NOTEBOOKS</h2>
            <button className="new-notebook-btn">New Notebook +</button>
          </div>

          <div className="notebooks-grid">
            {MOCK_NOTEBOOKS.map((nb) => (
              <div key={nb.id} className={`notebook-tome-card color-${nb.color}`}>
                <div className="tome-book-3d">
                  <div className="tome-emboss-emblem">{nb.iconSymbol}</div>
                </div>
                <span className="notebook-tome-title">{nb.title}</span>
                <span className="notebook-note-count">{nb.noteCount} notes</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panel: Pinned Notes */}
      <div className="notes-panel pinned-notes-panel">
        <div className="panel-header-row">
          <h2 className="panel-title">📌 PINNED NOTES</h2>
        </div>

        <div className="pinned-notes-row">
          {pinnedNotes.map((note) => (
            <div
              key={note.id}
              className="pinned-parchment-card"
              onClick={() => onSelectNote(note.id)}
            >
              <div className="pinned-card-top">
                <span className="card-book-icon">📖</span>
                <span className="card-pin-icon">📌</span>
              </div>
              <h3 className="pinned-card-title">{note.title}</h3>
              <p className="pinned-card-snippet">{note.snippet}</p>
              <div className="pinned-card-tags">
                {note.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="tag-pill-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quote Ribbon */}
        <div className="notes-quote-ribbon">
          <span>❖ "What you write today, you will become tomorrow." ❖</span>
        </div>
      </div>
    </div>
  );
}
