import React, { useState, useEffect } from "react";
import { useNotesStore } from "../../modules/notes";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNote?: (noteId: string) => void;
  initialCollection?: string;
  initialTitle?: string;
  initialContent?: string;
}

export function QuickCaptureModal({
  isOpen,
  onClose,
  onOpenNote,
  initialCollection,
  initialTitle = "",
  initialContent = "",
}: QuickCaptureModalProps) {
  const { notebooks, createNote } = useNotesStore();

  const [title, setTitle] = useState<string>(initialTitle);
  const [content, setContent] = useState<string>(initialContent);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>("nb-personal");
  const [selectedCollection, setSelectedCollection] = useState<string>(
    initialCollection || "DailyLife"
  );

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialContent) setContent(initialContent);
    if (initialCollection) setSelectedCollection(initialCollection);
  }, [initialTitle, initialContent, initialCollection]);

  if (!isOpen) return null;

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const noteTitle = title.trim() || "Quick Note";
    const noteContent = content.trim() || `# ${noteTitle}\n\nCaptured thoughts...`;

    const created = await createNote({
      title: noteTitle,
      content: noteContent,
      notebookId: selectedNotebookId,
      collections: [selectedCollection],
      tags: ["#QuickCapture"],
    });

    setTitle("");
    setContent("");
    onClose();

    if (onOpenNote) {
      onOpenNote(created.id);
    }
  };

  return (
    <div className="music-modal-backdrop" onClick={onClose}>
      <div className="music-modal-box quick-capture-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="quick-cap-hdr-row">
            <span className="quick-cap-bolt">⚡</span>
            <h3 className="modal-title">QUICK CAPTURE (Ctrl+Shift+N)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleQuickSave} className="modal-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input quick-title-input"
              placeholder="Note Title or Thought..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <textarea
              className="form-textarea quick-textarea"
              placeholder="Type quick note text, markdown, or ideas here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label">Notebook</label>
              <select
                className="form-select"
                value={selectedNotebookId}
                onChange={(e) => setSelectedNotebookId(e.target.value)}
              >
                {notebooks.map((nb) => (
                  <option key={nb.id} value={nb.id}>
                    {nb.iconSymbol} {nb.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Collection Tag</label>
              <select
                className="form-select"
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
              >
                <option value="DailyLife">🏠 DailyLife</option>
                <option value="Internship">💼 Internship</option>
                <option value="Unreal">🎮 Unreal</option>
                <option value="Research">📚 Research</option>
                <option value="Japanese">⛩️ Japanese</option>
                <option value="Gym">🏋️ Gym</option>
                <option value="Entertainment">🍿 Entertainment</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              ⚡ Save Instantly
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
