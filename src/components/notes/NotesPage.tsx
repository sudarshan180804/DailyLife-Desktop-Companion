import { useState, useEffect } from "react";
import { NotesOverview } from "./NotesOverview";
import { NotesEditor } from "./NotesEditor";
import { QuickCaptureModal } from "./QuickCaptureModal";

export function NotesPage() {
  const [activeView, setActiveView] = useState<"overview" | "editor">("overview");
  const [selectedNoteId, setSelectedNoteId] = useState<string>("note-ai-patient");
  const [isQuickCapOpen, setIsQuickCapOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsQuickCapOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCapOpen}
        onClose={() => setIsQuickCapOpen(false)}
        onOpenNote={(id) => {
          setSelectedNoteId(id);
          setActiveView("editor");
        }}
      />
    </div>
  );
}
