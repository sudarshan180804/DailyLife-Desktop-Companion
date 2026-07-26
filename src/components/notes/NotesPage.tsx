import { useState } from "react";
import { NotesOverview } from "./NotesOverview";
import { NotesEditor } from "./NotesEditor";

export function NotesPage() {
  const [activeView, setActiveView] = useState<"overview" | "editor">("overview");
  const [selectedNoteId, setSelectedNoteId] = useState<string>("note-ai-patient");

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setActiveView("editor");
  };

  return (
    <div className="notes-page-wrapper">
      {activeView === "overview" ? (
        <NotesOverview onSelectNote={handleSelectNote} />
      ) : (
        <NotesEditor
          initialNoteId={selectedNoteId}
          onBack={() => setActiveView("overview")}
        />
      )}
    </div>
  );
}
