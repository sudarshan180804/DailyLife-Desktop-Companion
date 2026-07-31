import React, { useState, useEffect, useRef } from "react";
import { useNotesStore } from "../../modules/notes";
import { nativeDialogService } from "../../services/nativeDialogService";
import { MarkdownRenderer, extractHeadings, MarkdownHeadingItem } from "./MarkdownRenderer";
import { NoteItem, NoteAttachment } from "../../modules/notes/types";
import { eventBus } from "../../services/eventBus";
import { notificationService } from "../../services/notificationService";

interface NotesEditorProps {
  initialNoteId?: string;
  onBack: () => void;
}

export function NotesEditor({ initialNoteId, onBack }: NotesEditorProps) {
  const {
    notes,
    notebooks,
    allCollections,
    getBacklinks,
    getSmartSuggestions,
    createNote,
    autoSaveNote,
    togglePin,
    toggleFavorite,
    archiveNote,
    deleteNote,
    addAttachment,
    removeAttachment,
    restoreVersion,
    recordView,
  } = useNotesStore();

  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    initialNoteId || (notes[0]?.id || "")
  );

  const activeNote: NoteItem =
    notes.find((n) => n.id === selectedNoteId) ||
    notes[0] || {
      id: "fallback",
      title: "Untitled Note",
      snippet: "",
      content: "# Untitled Note\n\nStart typing notes here...",
      notebookId: "nb-personal",
      notebookName: "PERSONAL",
      tags: ["#Notes"],
      collections: ["DailyLife"],
      isFavorite: false,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastEdited: "Just now",
      wordsCount: 0,
      charCount: 0,
      readingTimeMinutes: 1,
      attachments: [],
      history: [],
      importance: 3,
    };

  // Record view timestamp when activeNote changes
  useEffect(() => {
    if (activeNote.id) {
      recordView(activeNote.id);
    }
  }, [activeNote.id]);

  // Local Editor State
  const [editorTitle, setEditorTitle] = useState<string>(activeNote.title);
  const [editorContent, setEditorContent] = useState<string>(activeNote.content);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Metadata Form State
  const [summaryInput, setSummaryInput] = useState<string>(activeNote.summary || "");
  const [sourceInput, setSourceInput] = useState<string>(activeNote.source || "");
  const [importanceInput, setImportanceInput] = useState<number>(activeNote.importance || 3);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    activeNote.collections || ["DailyLife"]
  );

  // Modals
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [convertSelectedText, setConvertSelectedText] = useState<string>("");
  const [lightboxImgSrc, setLightboxImgSrc] = useState<string | null>(null);
  const [previewPdfSrc, setPreviewPdfSrc] = useState<string | null>(null);
  const [previewVideoSrc, setPreviewVideoSrc] = useState<string | null>(null);

  // Auto-Save Debounce Ref
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep local editor synced when activeNote changes
  useEffect(() => {
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      setSummaryInput(activeNote.summary || "");
      setSourceInput(activeNote.source || "");
      setImportanceInput(activeNote.importance || 3);
      setSelectedCollections(activeNote.collections || ["DailyLife"]);
    }
  }, [selectedNoteId, activeNote.id]);

  // Extract Table of Contents (TOC)
  const outlineHeadings: MarkdownHeadingItem[] = extractHeadings(editorContent);

  // Smart suggestions
  const { relatedNotes } = getSmartSuggestions(activeNote.id);

  // Handle Debounced Auto-Save
  const handleContentChange = (newText: string) => {
    setEditorContent(newText);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveNote(activeNote.id, {
        title: editorTitle,
        content: newText,
        summary: summaryInput,
        source: sourceInput,
        importance: importanceInput,
        collections: selectedCollections,
      });
    }, 500);
  };

  const handleTitleChange = (newTitle: string) => {
    setEditorTitle(newTitle);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveNote(activeNote.id, {
        title: newTitle,
        content: editorContent,
      });
    }, 500);
  };

  // Sidebar Filtered Notes List
  const filteredNotes = notes.filter((n) => !n.isTrashed && !n.isArchived).filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotesList = filteredNotes.filter((n) => n.pinned);
  const recentNotesList = filteredNotes.filter((n) => !n.pinned);

  // Backlinks
  const backlinks = getBacklinks(activeNote.title);

  // Toolbar Formatting Helpers
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = editorContent.substring(start, end);
    const replacement = `${prefix}${selection || "text"}${suffix}`;

    const newContent =
      editorContent.substring(0, start) + replacement + editorContent.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selection ? selection.length : 4));
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = editorContent.substring(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;

    const newContent =
      editorContent.substring(0, lineStart) + prefix + editorContent.substring(lineStart);

    handleContentChange(newContent);
    setTimeout(() => textarea.focus(), 0);
  };

  // Text Conversion Logic
  const handleOpenConvertModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = editorContent.substring(start, end).trim();
      setConvertSelectedText(selected || activeNote.title);
    } else {
      setConvertSelectedText(activeNote.title);
    }
    setIsConvertModalOpen(true);
  };

  const handleConvertToTask = () => {
    if (!convertSelectedText) return;
    eventBus.emit("task:create", {
      title: convertSelectedText,
      description: `Created from Note: [[${activeNote.title}]]`,
    });
    notificationService.notify("success", `⚡ Converted text to Task: "${convertSelectedText}"`, "Action Converted");
    setIsConvertModalOpen(false);
  };

  const handleConvertToProject = () => {
    if (!convertSelectedText) return;
    eventBus.emit("project:create", {
      title: convertSelectedText,
      description: `Created from Note: [[${activeNote.title}]]`,
    });
    notificationService.notify("success", `🚀 Converted text to Project: "${convertSelectedText}"`, "Action Converted");
    setIsConvertModalOpen(false);
  };

  const handleConvertToFlashcard = () => {
    if (!convertSelectedText) return;
    eventBus.emit("japanese:createFlashcard", {
      word: convertSelectedText,
      reading: convertSelectedText,
      meaning: `Note reference: [[${activeNote.title}]]`,
    });
    notificationService.notify("success", `⛩️ Converted text to Flashcard: "${convertSelectedText}"`, "Action Converted");
    setIsConvertModalOpen(false);
  };

  // Clipboard Image Paste Handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              const imageMd = `\n![Pasted Image](${dataUrl})\n`;
              insertFormatting(imageMd);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Attachment Handler
  const handlePickAttachment = async () => {
    const file = await nativeDialogService.pickFile(
      "Attach File to Note",
      "All Supported Files (*.png, *.jpg, *.pdf, *.mp4, *.zip, *.txt)",
      ["png", "jpg", "jpeg", "pdf", "mp4", "zip", "txt", "docx"]
    );
    if (file) {
      const fileName = file.split(/[\\/]/).pop() || "Attached File";
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
      let attType = "file";
      if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) attType = "image";
      else if (ext === "pdf") attType = "pdf";
      else if (["mp4", "webm", "mkv"].includes(ext)) attType = "video";

      await addAttachment(activeNote.id, {
        name: fileName,
        type: attType,
        path: file,
      });
    }
  };

  // Open Attachment Lightbox/Viewer
  const handleViewAttachment = (att: NoteAttachment) => {
    const formattedUrl = nativeDialogService.formatAssetUrl(att.path);
    if (att.type === "image") {
      setLightboxImgSrc(formattedUrl);
    } else if (att.type === "pdf") {
      setPreviewPdfSrc(formattedUrl);
    } else if (att.type === "video") {
      setPreviewVideoSrc(formattedUrl);
    } else {
      nativeDialogService.launchAppOrFile(att.path);
    }
  };

  // Wiki Link Click Handler
  const handleWikiLinkClick = async (targetTitle: string) => {
    const found = notes.find((n) => !n.isTrashed && n.title.toLowerCase() === targetTitle.toLowerCase());
    if (found) {
      setSelectedNoteId(found.id);
    } else {
      if (window.confirm(`Note "${targetTitle}" does not exist. Create it now?`)) {
        const created = await createNote({
          title: targetTitle,
          content: `# ${targetTitle}\n\nLinked from [[${activeNote.title}]]`,
          notebookId: activeNote.notebookId,
        });
        setSelectedNoteId(created.id);
      }
    }
  };

  // Checkbox toggle handler
  const handleToggleCheckbox = (lineIndex: number, newChecked: boolean) => {
    const lines = editorContent.split("\n");
    if (lineIndex >= 0 && lineIndex < lines.length) {
      let line = lines[lineIndex];
      if (newChecked) {
        line = line.replace(/^\s*[-*]\s+\[\s*\]/i, "- [x]");
      } else {
        line = line.replace(/^\s*[-*]\s+\[[xX]\]/i, "- [ ]");
      }
      lines[lineIndex] = line;
      handleContentChange(lines.join("\n"));
    }
  };

  // Collections toggle
  const toggleCollection = async (col: string) => {
    let nextCols = [...selectedCollections];
    if (nextCols.includes(col)) {
      if (nextCols.length === 1) return;
      nextCols = nextCols.filter((c) => c !== col);
    } else {
      nextCols.push(col);
    }
    setSelectedCollections(nextCols);
    await autoSaveNote(activeNote.id, { collections: nextCols });
  };

  // Add Tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    let tag = newTagInput.trim();
    if (!tag.startsWith("#")) tag = `#${tag}`;

    if (!activeNote.tags.includes(tag)) {
      const updatedTags = [...activeNote.tags, tag];
      await autoSaveNote(activeNote.id, { tags: updatedTags });
    }
    setNewTagInput("");
  };

  // Remove Tag
  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = activeNote.tags.filter((t) => t !== tagToRemove);
    await autoSaveNote(activeNote.id, { tags: updatedTags });
  };

  // Export Handlers
  const handleExportMarkdown = () => {
    const blob = new Blob([editorContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${activeNote.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #261e17; background: #fdfaf6; }
    h1, h2, h3 { color: #78350f; }
    blockquote { border-left: 4px solid #b45309; margin: 0; padding-left: 16px; font-style: italic; }
    code { background: rgba(120,53,15,0.1); padding: 2px 6px; border-radius: 4px; }
    pre { background: #261e17; color: #f5ebd9; padding: 12px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  ${editorContent}
</body>
</html>`;

    const blob = new Blob([htmlBody], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="notes-editor-container">
      {/* Top Bar Navigation */}
      <div className="editor-top-nav">
        <button className="back-overview-btn" onClick={onBack}>
          ← Back to Overview
        </button>

        {/* Active Note Title Input */}
        <input
          type="text"
          className="editor-active-title-input"
          value={editorTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Note..."
        />

        {/* Top Action Buttons */}
        <div className="editor-header-actions">
          <select
            className="editor-select-notebook"
            value={activeNote.notebookId}
            onChange={(e) => {
              const nb = notebooks.find((n) => n.id === e.target.value);
              autoSaveNote(activeNote.id, {
                notebookId: e.target.value,
                notebookName: nb?.title || "PERSONAL",
              });
            }}
          >
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.iconSymbol} {nb.title}
              </option>
            ))}
          </select>

          <button
            className="tome-action-btn btn-convert-trigger"
            onClick={handleOpenConvertModal}
            title="Convert Text to Task/Project/Flashcard"
          >
            ⚡ Convert...
          </button>

          <button
            className={`tome-action-btn ${activeNote.pinned ? "active" : ""}`}
            onClick={() => togglePin(activeNote.id)}
            title="Pin Note"
          >
            📌 {activeNote.pinned ? "Pinned" : "Pin"}
          </button>

          <button
            className={`tome-action-btn ${activeNote.isFavorite ? "active" : ""}`}
            onClick={() => toggleFavorite(activeNote.id)}
            title="Favorite Note"
          >
            {activeNote.isFavorite ? "♥ Favorited" : "♡ Favorite"}
          </button>

          <button
            className="tome-action-btn"
            onClick={() => setIsHistoryModalOpen(true)}
            title="Version History"
          >
            📜 History ({activeNote.history?.length || 0})
          </button>

          {/* Export Dropdown */}
          <div className="export-dropdown-wrapper">
            <button className="tome-action-btn">📤 Export ▾</button>
            <div className="export-dropdown-menu">
              <button onClick={handleExportMarkdown}>📝 Markdown (.md)</button>
              <button onClick={handleExportHTML}>🌐 HTML Page (.html)</button>
              <button onClick={handleExportPDF}>🖨️ PDF / Print</button>
            </div>
          </div>

          <button
            className="tome-action-btn"
            onClick={() => archiveNote(activeNote.id)}
            title="Archive Note"
          >
            📦 Archive
          </button>

          <button
            className="tome-action-btn btn-danger"
            onClick={() => {
              if (window.confirm(`Move "${activeNote.title}" to Trash?`)) {
                deleteNote(activeNote.id);
                onBack();
              }
            }}
            title="Trash Note"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Notes Sidebar + Right Manuscript Workspace */}
      <div className="editor-split-grid">
        {/* Left Column: All Notes Sidebar Switcher */}
        <div className="all-notes-sidebar">
          <div className="all-notes-header">
            <h2 className="all-notes-title">ALL NOTES</h2>
            <button
              className="add-note-btn"
              onClick={async () => {
                const created = await createNote({
                  title: "Untitled Note",
                  content: "# Untitled Note\n\nStart typing thoughts...",
                });
                setSelectedNoteId(created.id);
              }}
            >
              +
            </button>
          </div>

          <div className="notes-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search-input"
            />
          </div>

          {/* Table of Contents / Outline Section */}
          {outlineHeadings.length > 0 && (
            <div className="outline-sidebar-box">
              <span className="outline-hdr-lbl">📋 OUTLINE (TOC)</span>
              <div className="outline-toc-list">
                {outlineHeadings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className={`toc-link level-${h.level}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const targetEl = document.getElementById(h.id);
                      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {"  ".repeat(Math.max(0, h.level - 1))}• {h.text}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Notes List */}
          <div className="sidebar-notes-scroll">
            {pinnedNotesList.length > 0 && (
              <div className="sidebar-section">
                <span className="sidebar-section-title">PINNED</span>
                {pinnedNotesList.map((note) => (
                  <div
                    key={note.id}
                    className={`sidebar-note-row ${note.id === activeNote.id ? "active" : ""}`}
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

            <div className="sidebar-section">
              <span className="sidebar-section-title">RECENT NOTES</span>
              {recentNotesList.map((note) => (
                <div
                  key={note.id}
                  className={`sidebar-note-row ${note.id === activeNote.id ? "active" : ""}`}
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
        </div>

        {/* Right Column: Ancient Scholar Tome Manuscript Workspace */}
        <div className="manuscript-tome-panel">
          <div className="binder-rings">
            <div className="ring-loop" />
            <div className="ring-loop" />
            <div className="ring-loop" />
            <div className="ring-loop" />
          </div>

          <div className="tome-header-bar">
            <div className="tome-title-group">
              <span className="tome-note-title">{activeNote.title.toUpperCase()}</span>
              {activeNote.isFavorite && <span className="tome-star">♥</span>}
              <span className="tome-edited-time">Last edited: {activeNote.lastEdited}</span>
              <span className="auto-saved-badge">● Auto-saved</span>
            </div>

            <div className="view-mode-toggle-group">
              <button
                className={`mode-btn ${viewMode === "edit" ? "active" : ""}`}
                onClick={() => setViewMode("edit")}
              >
                ✏ Edit
              </button>
              <button
                className={`mode-btn ${viewMode === "preview" ? "active" : ""}`}
                onClick={() => setViewMode("preview")}
              >
                📖 Preview
              </button>
              <button
                className={`mode-btn ${viewMode === "split" ? "active" : ""}`}
                onClick={() => setViewMode("split")}
              >
                ⚡ Split
              </button>
            </div>
          </div>

          {/* Rich Markdown Formatting Toolbar */}
          <div className="formatting-toolbar">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("# ")}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("## ")}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("### ")}
              title="Heading 3"
            >
              H3
            </button>

            <div className="toolbar-divider" />

            <button
              type="button"
              className="toolbar-btn bold"
              onClick={() => insertFormatting("**", "**")}
              title="Bold (**text**)"
            >
              B
            </button>
            <button
              type="button"
              className="toolbar-btn italic"
              onClick={() => insertFormatting("*", "*")}
              title="Italic (*text*)"
            >
              I
            </button>

            <div className="toolbar-divider" />

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("- ")}
              title="Bullet List (- )"
            >
              :=
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("1. ")}
              title="Numbered List (1. )"
            >
              1=
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("- [ ] ")}
              title="Task Checkbox (- [ ] )"
            >
              ☑
            </button>

            <div className="toolbar-divider" />

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertFormatting("```typescript\n", "\n```")}
              title="Code Block (```)"
            >
              &lt;/&gt;
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertFormatting("```mermaid\ngraph TD;\n  A[Start] --> B[Finish];\n```\n")}
              title="Mermaid Diagram (```mermaid)"
            >
              📊 Mermaid
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertFormatting("$$ ", " $$")}
              title="Math Equation ($$)"
            >
              ∑ Math
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertLinePrefix("> ")}
              title="Quote (> )"
            >
              ”
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertFormatting("[Link Title](", ")")}
              title="Hyperlink ([text](url))"
            >
              🔗
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertFormatting("![Alt Text](", ")")}
              title="Inline Image (![alt](url))"
            >
              📷
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertFormatting("[[", "]]")}
              title="Wiki Link ([[Note Title]])"
            >
              📄 Wiki
            </button>

            <div className="toolbar-divider" />

            <button
              type="button"
              className="toolbar-btn btn-att-trigger"
              onClick={handlePickAttachment}
              title="Attach File"
            >
              📎 Attach File
            </button>
          </div>

          {/* Parchment Manuscript Page (Editor & Preview & Side Cards) */}
          <div className="parchment-page-body">
            {/* Left Content Area: Edit / Preview / Split */}
            <div className="manuscript-text-column">
              {viewMode === "edit" ? (
                <textarea
                  ref={textareaRef}
                  className="markdown-source-editor"
                  value={editorContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Type Markdown content here... Use [[Note Title]] for wiki links."
                />
              ) : viewMode === "preview" ? (
                <MarkdownRenderer
                  content={editorContent}
                  onWikiLinkClick={handleWikiLinkClick}
                  onToggleCheckbox={handleToggleCheckbox}
                />
              ) : (
                <div className="split-workspace-grid">
                  <textarea
                    ref={textareaRef}
                    className="markdown-source-editor"
                    value={editorContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Type Markdown content here... Use [[Note Title]] for wiki links."
                  />
                  <div className="split-preview-pane">
                    <MarkdownRenderer
                      content={editorContent}
                      onWikiLinkClick={handleWikiLinkClick}
                      onToggleCheckbox={handleToggleCheckbox}
                    />
                  </div>
                </div>
              )}

              {/* Backlinks Panel */}
              {backlinks.length > 0 && (
                <div className="backlinks-footer-panel">
                  <h4 className="backlinks-header-title">
                    🔗 BACKLINKS & REFERENCES ({backlinks.length})
                  </h4>
                  <div className="backlinks-pills-list">
                    {backlinks.map((bNote) => (
                      <button
                        key={bNote.id}
                        className="backlink-pill-btn"
                        onClick={() => setSelectedNoteId(bNote.id)}
                      >
                        📄 {bNote.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Cards Column inside parchment */}
            <div className="manuscript-side-column">
              {/* COLLECTIONS SELECTOR */}
              <div className="side-tags-box">
                <h4 className="side-box-title">COLLECTIONS</h4>
                <div className="multi-cat-selector">
                  {allCollections.map((col) => (
                    <button
                      type="button"
                      key={col}
                      className={`multi-cat-chip ${
                        selectedCollections.includes(col) ? "active" : ""
                      }`}
                      onClick={() => toggleCollection(col)}
                    >
                      #{col}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI METADATA CARD */}
              <div className="side-tags-box">
                <h4 className="side-box-title">AI-READY METADATA</h4>
                <div className="metrics-rows-list">
                  <div className="form-group margin-bottom-4">
                    <label className="form-label mini-lbl">Summary</label>
                    <input
                      type="text"
                      className="form-input mini-input"
                      value={summaryInput}
                      onChange={(e) => {
                        setSummaryInput(e.target.value);
                        handleContentChange(editorContent);
                      }}
                      placeholder="Executive summary..."
                    />
                  </div>

                  <div className="form-group margin-bottom-4">
                    <label className="form-label mini-lbl">Importance Level</label>
                    <select
                      className="form-select mini-input"
                      value={importanceInput}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setImportanceInput(val);
                        handleContentChange(editorContent);
                      }}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Critical)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - High)</option>
                      <option value={3}>⭐⭐⭐ (3 - Medium)</option>
                      <option value={2}>⭐⭐ (2 - Low)</option>
                      <option value={1}>⭐ (1 - Minimal)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label mini-lbl">Source URL / Origin</label>
                    <input
                      type="text"
                      className="form-input mini-input"
                      value={sourceInput}
                      onChange={(e) => {
                        setSourceInput(e.target.value);
                        handleContentChange(editorContent);
                      }}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* SMART RULE-BASED SUGGESTIONS */}
              {relatedNotes.length > 0 && (
                <div className="side-tags-box">
                  <h4 className="side-box-title">💡 SMART RELATED NOTES</h4>
                  <div className="smart-suggest-list">
                    {relatedNotes.map((rNote) => (
                      <button
                        key={rNote.id}
                        className="suggest-row-btn"
                        onClick={() => setSelectedNoteId(rNote.id)}
                      >
                        📄 {rNote.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTE METRICS CARD */}
              <div className="side-tags-box">
                <h4 className="side-box-title">NOTE METRICS</h4>
                <div className="metrics-rows-list">
                  <div className="metric-item">
                    <span>Words:</span>
                    <strong>{activeNote.wordsCount}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Characters:</span>
                    <strong>{activeNote.charCount}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Reading Time:</span>
                    <strong>~{activeNote.readingTimeMinutes} min</strong>
                  </div>
                </div>
              </div>

              {/* TAGS MANAGER BOX */}
              <div className="side-tags-box">
                <h4 className="side-box-title">TAGS ({activeNote.tags.length})</h4>
                <div className="side-tags-list">
                  {activeNote.tags.map((tag, idx) => (
                    <span key={idx} className="side-tag-pill">
                      {tag}
                      <button
                        className="tag-remove-mini"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddTag} className="add-tag-inline-form">
                  <input
                    type="text"
                    className="tag-inline-input"
                    placeholder="+ Add tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                  />
                </form>
              </div>

              {/* ATTACHMENTS GALLERY & LIST */}
              <div className="side-attachments-box">
                <div className="side-box-header">
                  <h4 className="side-box-title">
                    ATTACHMENTS ({(activeNote.attachments || []).length})
                  </h4>
                  <button className="att-add-mini-btn" onClick={handlePickAttachment}>
                    +
                  </button>
                </div>

                <div className="attachments-list">
                  {(activeNote.attachments || []).map((att) => (
                    <div key={att.id} className="attachment-item-row">
                      <span className="att-icon">
                        {att.type === "image"
                          ? "🖼️"
                          : att.type === "pdf"
                          ? "📄"
                          : att.type === "video"
                          ? "🎥"
                          : "📎"}
                      </span>
                      <span className="att-name">{att.name}</span>

                      <button
                        className="att-action-mini"
                        onClick={() => handleViewAttachment(att)}
                        title="Preview Attachment"
                      >
                        👁️
                      </button>
                      <button
                        className="att-action-mini danger"
                        onClick={() => removeAttachment(activeNote.id, att.id)}
                        title="Remove Attachment"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feather Quill Ornament */}
            <div className="feather-quill-ornament">🪶</div>
          </div>
        </div>
      </div>

      {/* Convert Selected Text Modal */}
      {isConvertModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsConvertModalOpen(false)}>
          <div className="music-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚡ Convert Text to Action Item</h3>
              <button className="modal-close-btn" onClick={() => setIsConvertModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Selected Text / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={convertSelectedText}
                  onChange={(e) => setConvertSelectedText(e.target.value)}
                />
              </div>

              <div className="convert-grid-actions margin-top-10">
                <button className="convert-action-btn btn-task" onClick={handleConvertToTask}>
                  ☑️ Create Task
                </button>
                <button className="convert-action-btn btn-project" onClick={handleConvertToProject}>
                  🚀 Create Project
                </button>
                <button className="convert-action-btn btn-vocab" onClick={handleConvertToFlashcard}>
                  ⛩️ Create Flashcard
                </button>
              </div>

              <div className="modal-actions margin-top-12">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsConvertModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImgSrc && (
        <div className="music-modal-backdrop" onClick={() => setLightboxImgSrc(null)}>
          <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn float-right" onClick={() => setLightboxImgSrc(null)}>
              ✕
            </button>
            <img src={lightboxImgSrc} alt="Preview" className="lightbox-img" />
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {previewPdfSrc && (
        <div className="music-modal-backdrop" onClick={() => setPreviewPdfSrc(null)}>
          <div className="pdf-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📄 PDF Preview</h3>
              <button className="modal-close-btn" onClick={() => setPreviewPdfSrc(null)}>
                ✕
              </button>
            </div>
            <iframe src={previewPdfSrc} title="PDF Preview" className="pdf-iframe-view" />
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {previewVideoSrc && (
        <div className="music-modal-backdrop" onClick={() => setPreviewVideoSrc(null)}>
          <div className="video-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🎥 Video Attachment Preview</h3>
              <button className="modal-close-btn" onClick={() => setPreviewVideoSrc(null)}>
                ✕
              </button>
            </div>
            <video src={previewVideoSrc} controls autoPlay className="video-player-view" />
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {isHistoryModalOpen && (
        <div className="music-modal-backdrop" onClick={() => setIsHistoryModalOpen(false)}>
          <div className="music-modal-box large-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📜 Version History: {activeNote.title}</h3>
              <button className="modal-close-btn" onClick={() => setIsHistoryModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              {(activeNote.history || []).length > 0 ? (
                <div className="version-history-list">
                  {activeNote.history.map((ver) => (
                    <div key={ver.id} className="version-history-row">
                      <div className="ver-info">
                        <span className="ver-time">
                          {new Date(ver.timestamp).toLocaleDateString()}{" "}
                          {new Date(ver.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="ver-title">{ver.title}</span>
                        <span className="ver-snippet">
                          {ver.content.slice(0, 100).replace(/[*_#]/g, "")}...
                        </span>
                      </div>

                      <button
                        className="btn-save"
                        onClick={() => {
                          restoreVersion(activeNote.id, ver.id);
                          setIsHistoryModalOpen(false);
                        }}
                      >
                        ↩ Restore Version
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="playlists-empty-state">
                  <span className="empty-state-icon">📜</span>
                  <p className="empty-state-title">No previous versions saved</p>
                  <p className="empty-state-sub">
                    Snapshots are automatically created as you write and edit notes.
                  </p>
                </div>
              )}

              <div className="modal-actions margin-top-12">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsHistoryModalOpen(false)}
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
