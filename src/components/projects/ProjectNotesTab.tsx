import { useState } from "react";
import { Project, ProjectNote } from "../../modules/projects/types";
import { useProjectStore } from "../../modules/projects";

interface ProjectNotesTabProps {
  project: Project;
}

export function ProjectNotesTab({ project }: ProjectNotesTabProps) {
  const { addProjectNote, updateProjectNote, deleteProjectNote } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Note form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const notesList = project.projectNotes || [];
  const filteredNotes = notesList.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTags([]);
    setIsEditing(true);
  };

  const handleOpenEdit = (note: ProjectNote) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (selectedNote) {
      await updateProjectNote(project.id, selectedNote.id, title.trim(), content.trim(), tags);
    } else {
      await addProjectNote(project.id, title.trim(), content.trim(), tags);
    }

    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="project-notes-tab-wrapper">
      <div className="tasks-tab-header">
        <div className="tasks-tab-header-left">
          <h3 className="card-heading">Project Notes & Documents ({notesList.length})</h3>
          <input
            type="text"
            className="settings-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="new-task-action-btn" onClick={handleOpenCreate}>
          + New Project Note
        </button>
      </div>

      <div className="tasks-tab-content-grid">
        {/* Left: Notes List */}
        <div className="ptasks-list-column">
          {filteredNotes.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-state-icon">📝</span>
              <h4 className="empty-state-title">No Notes Available</h4>
              <p className="empty-state-description">Create project notes to store meeting notes, design specs, or code snippets.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`ptask-row-card ${selectedNote?.id === note.id ? "selected" : ""}`}
                onClick={() => handleOpenEdit(note)}
              >
                <div className="ptask-row-left">
                  <span className="config-icon">📜</span>
                  <div className="ptask-text-group">
                    <span className="ptask-title-text">{note.title}</span>
                    <span className="ptask-desc-sub">Updated {note.updatedAt}</span>
                  </div>
                </div>

                <div className="ptask-row-right">
                  <button
                    className="config-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProjectNote(project.id, note.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Note Editor / Reader */}
        <div className="ptasks-detail-column">
          {isEditing ? (
            <form onSubmit={handleSave} className="detail-card selected-task-card">
              <h3 className="card-heading">{selectedNote ? "Edit Project Note" : "New Project Note"}</h3>

              <div className="form-group">
                <label className="form-lbl">Title</label>
                <input
                  type="text"
                  className="settings-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">Content</label>
                <textarea
                  className="settings-textarea"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write project documentation..."
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">Tags</label>
                <div className="add-subtask-input-row">
                  <input
                    type="text"
                    className="settings-input flex-1"
                    placeholder="Tag name..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                  <button type="button" className="add-launcher-btn" onClick={handleAddTag}>
                    + Tag
                  </button>
                </div>
                <div className="subtasks-chips-list">
                  {tags.map((t, idx) => (
                    <span key={idx} className="subtask-chip">
                      {t}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="chip-remove-btn">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="settings-action-row">
                <button type="button" className="config-delete-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-settings-btn">
                  Save Note
                </button>
              </div>
            </form>
          ) : (
            <div className="detail-card empty-detail-card">
              <span className="empty-state-icon">📖</span>
              <h4 className="empty-state-title">Select a Note</h4>
              <p className="empty-state-description">Click on a note on the left or click "+ New Project Note" to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
