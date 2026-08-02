import { useNotesStore } from "../../../modules/notes";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function NotesWidget({ onNavigateToModule }: WidgetProps) {
  const { notes, getOrCreateDailyJournal } = useNotesStore();

  const activeNotes = notes.filter((n) => !n.isTrashed && !n.isArchived).slice(0, 3);
  const todayJournal = notes.find((n) => n.isJournal && n.journalDate === new Date().toISOString().split("T")[0]);

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">📖</span>
          <h3 className="widget-title-text">Daily Journal & Parchment Notes</h3>
          <span className="widget-count-badge">{notes.length} Parchments</span>
        </div>

        <button
          className="widget-nav-link"
          onClick={async () => {
            await getOrCreateDailyJournal();
            if (onNavigateToModule) onNavigateToModule("notes");
          }}
        >
          {todayJournal ? "Open Today's Journal →" : "+ Start Daily Journal →"}
        </button>
      </div>

      <div className="widget-notes-list">
        {activeNotes.map((n) => (
          <div key={n.id} className="widget-note-row">
            <span className="note-row-icon">{n.isJournal ? "📖" : "📄"}</span>
            <div className="note-row-info">
              <span className="note-row-title">{n.title}</span>
              <span className="note-row-meta">{n.lastEdited} • {n.wordsCount} words</span>
            </div>
            {n.isFavorite && <span className="note-star">♥</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
