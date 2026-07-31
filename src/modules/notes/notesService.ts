import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import { BUILTIN_TEMPLATES } from "./templateData";
import {
  NoteItem,
  NotebookItem,
  FolderItem,
  NotesSummary,
  CreateNoteInput,
  NoteAttachment,
  NoteTemplate,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.NOTES;

export const DEFAULT_NOTEBOOKS: NotebookItem[] = [
  { id: "nb-personal", title: "PERSONAL", color: "purple", iconSymbol: "🔮", noteCount: 0 },
  { id: "nb-journal", title: "DAILY JOURNAL", color: "blue", iconSymbol: "📖", noteCount: 0 },
  { id: "nb-coding", title: "CODING & TECH", color: "green", iconSymbol: "💻", noteCount: 0 },
  { id: "nb-study", title: "JAPANESE & STUDY", color: "brown", iconSymbol: "⛩️", noteCount: 0 },
  { id: "nb-ideas", title: "PROJECT IDEAS", color: "parchment", iconSymbol: "💡", noteCount: 0 },
];

export const DEFAULT_FOLDERS: FolderItem[] = [
  { id: "folder-work", name: "Work & Projects", icon: "💼" },
  { id: "folder-life", name: "Personal Life", icon: "🏠" },
  { id: "folder-learning", name: "Learning & Research", icon: "📚" },
];

export const DEFAULT_COLLECTIONS: string[] = [
  "Internship",
  "DailyLife",
  "Unreal",
  "Research",
  "Japanese",
  "Gym",
  "Entertainment",
];

export class NotesService {
  private notes: NoteItem[] = [];
  private notebooks: NotebookItem[] = [];
  private folders: FolderItem[] = [];
  private templates: NoteTemplate[] = BUILTIN_TEMPLATES;
  private summary: NotesSummary = { streak: 7, totalNotes: 0, totalXP: 0 };

  constructor() {
    this.initStorage();
  }

  private calculateWordStats(text: string): { wordsCount: number; charCount: number; readingTimeMinutes: number } {
    const clean = text || "";
    const charCount = clean.length;
    const wordsCount = clean.trim().split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordsCount / 200));
    return { wordsCount, charCount, readingTimeMinutes };
  }

  private formatRelativeTime(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  private formatDateString(date: Date = new Date()): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  private sanitizeNote(rawNote: any, index: number = 0): NoteItem {
    let markdownContent = "";

    if (rawNote?.content && typeof rawNote.content === "object") {
      const heading = rawNote.content.heading || rawNote.title || "Untitled";
      const intro = rawNote.content.intro || "";
      markdownContent = `# ${heading}\n\n${intro}\n\n`;

      if (Array.isArray(rawNote.content.sections)) {
        rawNote.content.sections.forEach((sec: any) => {
          if (sec.title) markdownContent += `## ${sec.title}\n\n`;
          if (Array.isArray(sec.items)) {
            sec.items.forEach((item: string) => {
              markdownContent += `- ${item}\n`;
            });
            markdownContent += "\n";
          }
        });
      }
    } else if (typeof rawNote?.content === "string") {
      markdownContent = rawNote.content;
    } else {
      markdownContent = rawNote?.snippet ? `# ${rawNote.title}\n\n${rawNote.snippet}` : "";
    }

    const { wordsCount, charCount, readingTimeMinutes } = this.calculateWordStats(markdownContent);

    const createdAt = typeof rawNote?.createdAt === "number" ? rawNote.createdAt : Date.now() - index * 3600000;
    const updatedAt = typeof rawNote?.updatedAt === "number" ? rawNote.updatedAt : Date.now() - index * 1800000;

    const snippetText = markdownContent
      .replace(/^#+\s+/gm, "")
      .replace(/[*_`#]/g, "")
      .slice(0, 120)
      .trim();

    return {
      id: String(rawNote?.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
      title: String(rawNote?.title || "Untitled Note"),
      snippet: snippetText || "No content...",
      content: markdownContent,
      notebookId: String(rawNote?.notebookId || "nb-personal"),
      notebookName: String(rawNote?.notebookName || "PERSONAL"),
      folderId: rawNote?.folderId ? String(rawNote.folderId) : undefined,
      tags: Array.isArray(rawNote?.tags) ? rawNote.tags.map(String) : ["#Notes"],
      collections: Array.isArray(rawNote?.collections)
        ? rawNote.collections.map(String)
        : [rawNote?.notebookName || "DailyLife"],
      isFavorite: Boolean(rawNote?.isFavorite || rawNote?.favorite),
      pinned: Boolean(rawNote?.pinned),
      isArchived: Boolean(rawNote?.isArchived),
      isTrashed: Boolean(rawNote?.isTrashed),
      isJournal: Boolean(rawNote?.isJournal),
      journalDate: rawNote?.journalDate ? String(rawNote.journalDate) : undefined,
      createdAt,
      updatedAt,
      lastViewed: typeof rawNote?.lastViewed === "number" ? rawNote.lastViewed : updatedAt,
      lastModified: typeof rawNote?.lastModified === "number" ? rawNote.lastModified : updatedAt,
      lastEdited: this.formatRelativeTime(updatedAt),
      wordsCount,
      charCount,
      readingTimeMinutes,
      attachments: Array.isArray(rawNote?.attachments) ? rawNote.attachments : [],
      history: Array.isArray(rawNote?.history) ? rawNote.history : [],

      // AI metadata
      summary: rawNote?.summary || snippetText,
      keywords: Array.isArray(rawNote?.keywords) ? rawNote.keywords : [],
      relatedNoteIds: Array.isArray(rawNote?.relatedNoteIds) ? rawNote.relatedNoteIds : [],
      embeddingId: rawNote?.embeddingId || undefined,
      importance: typeof rawNote?.importance === "number" ? rawNote.importance : 3,
      source: rawNote?.source || undefined,

      // Cross-Module Links
      linkedTaskIds: Array.isArray(rawNote?.linkedTaskIds) ? rawNote.linkedTaskIds : [],
      linkedProjectIds: Array.isArray(rawNote?.linkedProjectIds) ? rawNote.linkedProjectIds : [],
      linkedWorkoutIds: Array.isArray(rawNote?.linkedWorkoutIds) ? rawNote.linkedWorkoutIds : [],
      linkedVocabIds: Array.isArray(rawNote?.linkedVocabIds) ? rawNote.linkedVocabIds : [],
      linkedTitleIds: Array.isArray(rawNote?.linkedTitleIds) ? rawNote.linkedTitleIds : [],
    };
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<any>(STORAGE_KEY);

      if (saved && Array.isArray(saved.notebooks) && saved.notebooks.length > 0) {
        this.notebooks = saved.notebooks;
      } else {
        this.notebooks = DEFAULT_NOTEBOOKS;
      }

      if (saved && Array.isArray(saved.folders) && saved.folders.length > 0) {
        this.folders = saved.folders;
      } else {
        this.folders = DEFAULT_FOLDERS;
      }

      if (saved && Array.isArray(saved.notes) && saved.notes.length > 0) {
        this.notes = saved.notes.map((n: any, i: number) => this.sanitizeNote(n, i));
      } else if (saved && Array.isArray(saved) && saved.length > 0) {
        this.notes = saved.map((n: any, i: number) => this.sanitizeNote(n, i));
      } else {
        // Initial setup
        const todayStr = this.formatDateString();
        const initJournal = this.sanitizeNote({
          id: `journal-${todayStr}`,
          title: `Daily Journal - ${todayStr}`,
          content: `# Daily Journal: ${todayStr} 📖\n\n## 🌅 Morning Intentions\n- Focus on building connected Knowledge Hub.\n\n## 📝 Reflection & Notes\n- Knowledge collected becomes power.\n`,
          notebookId: "nb-journal",
          notebookName: "DAILY JOURNAL",
          isJournal: true,
          journalDate: todayStr,
          tags: ["#Journal", "#Daily"],
          collections: ["DailyLife"],
          pinned: true,
          isFavorite: true,
        });

        this.notes = [initJournal];
        await this.persist();
      }

      this.updateNotebookCounts();
    } catch (err) {
      console.error("[NotesService] Storage initialization failed:", err);
      this.notebooks = DEFAULT_NOTEBOOKS;
      this.folders = DEFAULT_FOLDERS;
    }
  }

  private async persist(): Promise<void> {
    try {
      this.updateNotebookCounts();
      const payload = {
        notes: this.notes,
        notebooks: this.notebooks,
        folders: this.folders,
        summary: this.summary,
      };
      await storageService.save(STORAGE_KEY, payload);
    } catch (err) {
      console.error("[NotesService] Persist failed:", err);
    }
  }

  private updateNotebookCounts(): void {
    const active = this.notes.filter((n) => !n.isTrashed);
    this.notebooks.forEach((nb) => {
      nb.noteCount = active.filter((n) => n.notebookId === nb.id).length;
    });
  }

  /**
   * Daily Journal Engine: Gets or creates journal note for specified date (YYYY-MM-DD).
   */
  async getOrCreateDailyJournal(dateStr?: string): Promise<NoteItem> {
    const targetDate = dateStr || this.formatDateString();
    const existing = this.notes.find(
      (n) => !n.isTrashed && (n.journalDate === targetDate || n.title.includes(targetDate))
    );

    if (existing) {
      this.recordView(existing.id);
      return existing;
    }

    // Create journal for targetDate
    const newJournal = await this.createNote({
      title: `Daily Journal - ${targetDate}`,
      content: `# Daily Journal: ${targetDate} 📖\n\n## 🌅 Morning Intentions\n- \n\n## 📝 Daily Notes & Reflection\n- \n\n## 🎯 Achievements\n- [ ] Task 1\n`,
      notebookId: "nb-journal",
      notebookName: "DAILY JOURNAL",
      isJournal: true,
      journalDate: targetDate,
      tags: ["#Journal", "#Daily"],
      collections: ["DailyLife"],
      pinned: false,
    });

    return newJournal;
  }

  /**
   * Returns Next and Previous journal date strings relative to targetDate.
   */
  getJournalDateNav(currentDateStr: string): { prevDate: string; nextDate: string } {
    const current = new Date(currentDateStr);
    const prev = new Date(current.getTime() - 86400000);
    const next = new Date(current.getTime() + 86400000);
    return {
      prevDate: this.formatDateString(prev),
      nextDate: this.formatDateString(next),
    };
  }

  /**
   * Returns built-in templates.
   */
  getTemplates(): NoteTemplate[] {
    return [...this.templates];
  }

  /**
   * Returns filtered notes.
   */
  getNotes(filter?: {
    view?: "all" | "favorites" | "pinned" | "recent" | "frequently_edited" | "recently_viewed" | "archived" | "trash" | "journal";
    notebookId?: string;
    folderId?: string;
    collection?: string;
    tag?: string;
    search?: string;
  }): NoteItem[] {
    let result = [...this.notes];
    const view = filter?.view || "all";

    switch (view) {
      case "favorites":
        result = result.filter((n) => n.isFavorite && !n.isTrashed);
        break;
      case "pinned":
        result = result.filter((n) => n.pinned && !n.isTrashed);
        break;
      case "recent":
        result = result.filter((n) => !n.isTrashed).sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case "frequently_edited":
        result = result.filter((n) => !n.isTrashed).sort((a, b) => (b.lastModified || b.updatedAt) - (a.lastModified || a.updatedAt));
        break;
      case "recently_viewed":
        result = result.filter((n) => !n.isTrashed).sort((a, b) => (b.lastViewed || b.updatedAt) - (a.lastViewed || a.updatedAt));
        break;
      case "journal":
        result = result.filter((n) => n.isJournal && !n.isTrashed).sort((a, b) => (b.journalDate || "").localeCompare(a.journalDate || ""));
        break;
      case "archived":
        result = result.filter((n) => n.isArchived && !n.isTrashed);
        break;
      case "trash":
        result = result.filter((n) => n.isTrashed);
        break;
      case "all":
      default:
        result = result.filter((n) => !n.isTrashed && !n.isArchived);
        break;
    }

    if (filter?.notebookId && filter.notebookId !== "all") {
      result = result.filter((n) => n.notebookId === filter.notebookId);
    }

    if (filter?.folderId && filter.folderId !== "all") {
      result = result.filter((n) => n.folderId === filter.folderId);
    }

    if (filter?.collection && filter.collection !== "all") {
      result = result.filter((n) => Array.isArray(n.collections) && n.collections.includes(filter.collection!));
    }

    if (filter?.tag) {
      const term = filter.tag.toLowerCase().trim();
      result = result.filter((n) => n.tags.some((t) => t.toLowerCase().includes(term)));
    }

    if (filter?.search && filter.search.trim()) {
      const term = filter.search.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.content.toLowerCase().includes(term) ||
          n.notebookName.toLowerCase().includes(term) ||
          n.tags.some((t) => t.toLowerCase().includes(term)) ||
          (n.collections && n.collections.some((c) => c.toLowerCase().includes(term)))
      );
    }

    if (view !== "recent" && view !== "frequently_edited" && view !== "recently_viewed" && view !== "journal") {
      result.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
    }

    return result;
  }

  /**
   * Single note view getter with view tracking.
   */
  getNoteById(id: string): NoteItem | undefined {
    const found = this.notes.find((n) => n.id === id);
    if (found) {
      this.recordView(found.id);
      return this.sanitizeNote(found);
    }
    return undefined;
  }

  /**
   * Tracks note lastViewed timestamp.
   */
  recordView(id: string): void {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.lastViewed = Date.now();
      this.persist();
    }
  }

  /**
   * Smart Rule-Based Suggestions: Returns related notes based on tags, collections, and shared links.
   */
  getSmartSuggestions(noteId: string): { relatedNotes: NoteItem[]; recentlyViewed: NoteItem[]; frequentlyEdited: NoteItem[] } {
    const currentNote = this.notes.find((n) => n.id === noteId);
    if (!currentNote) {
      return {
        relatedNotes: this.notes.slice(0, 4),
        recentlyViewed: this.notes.slice(0, 4),
        frequentlyEdited: this.notes.slice(0, 4),
      };
    }

    const currentTags = new Set(currentNote.tags.map((t) => t.toLowerCase()));
    const currentCols = new Set(currentNote.collections.map((c) => c.toLowerCase()));

    const relatedNotes = this.notes
      .filter((n) => n.id !== noteId && !n.isTrashed)
      .map((n) => {
        let score = 0;
        n.tags.forEach((t) => { if (currentTags.has(t.toLowerCase())) score += 2; });
        n.collections.forEach((c) => { if (currentCols.has(c.toLowerCase())) score += 3; });
        if (currentNote.content.includes(`[[${n.title}]]`)) score += 5;
        if (n.content.includes(`[[${currentNote.title}]]`)) score += 5;
        return { note: n, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.note)
      .slice(0, 5);

    const recentlyViewed = [...this.notes]
      .filter((n) => n.id !== noteId && !n.isTrashed)
      .sort((a, b) => (b.lastViewed || 0) - (a.lastViewed || 0))
      .slice(0, 5);

    const frequentlyEdited = [...this.notes]
      .filter((n) => n.id !== noteId && !n.isTrashed)
      .sort((a, b) => (b.lastModified || b.updatedAt) - (a.lastModified || a.updatedAt))
      .slice(0, 5);

    return { relatedNotes, recentlyViewed, frequentlyEdited };
  }

  /**
   * Backlinks getter.
   */
  getBacklinks(noteTitle: string): NoteItem[] {
    if (!noteTitle || !noteTitle.trim()) return [];
    const term = `[[${noteTitle.trim().toLowerCase()}]]`;
    return this.notes.filter(
      (n) => !n.isTrashed && n.title.toLowerCase() !== noteTitle.toLowerCase() && n.content.toLowerCase().includes(term)
    );
  }

  getNotebooks(): NotebookItem[] {
    this.updateNotebookCounts();
    return [...this.notebooks];
  }

  getFolders(): FolderItem[] {
    return [...this.folders];
  }

  getAllCollections(): string[] {
    const colSet = new Set<string>(DEFAULT_COLLECTIONS);
    this.notes
      .filter((n) => !n.isTrashed)
      .forEach((n) => {
        if (Array.isArray(n.collections)) {
          n.collections.forEach((c) => colSet.add(c));
        }
      });
    return Array.from(colSet);
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.notes
      .filter((n) => !n.isTrashed)
      .forEach((n) => {
        n.tags.forEach((t) => tagSet.add(t));
      });
    return Array.from(tagSet);
  }

  async createNote(input: CreateNoteInput): Promise<NoteItem> {
    let content = input.content;

    // Apply template content if templateId provided
    if (input.templateId) {
      const tmpl = this.templates.find((t) => t.id === input.templateId);
      if (tmpl) {
        const todayStr = this.formatDateString();
        content = tmpl.content.replace(/\{\{date\}\}/g, todayStr);
        if (!input.title) input.title = tmpl.defaultTitle.replace(/\{\{date\}\}/g, todayStr);
        if (!input.tags || input.tags.length === 0) input.tags = [...tmpl.tags];
      }
    }

    const title = input.title?.trim() || "Untitled Note";
    content = content || `# ${title}\n\nStart writing notes here...`;

    const newNote: NoteItem = this.sanitizeNote(
      {
        ...input,
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        content,
        notebookId: input.notebookId || "nb-personal",
        notebookName: input.notebookName || "PERSONAL",
        tags: input.tags || ["#Notes"],
        collections: input.collections || ["DailyLife"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastViewed: Date.now(),
        lastModified: Date.now(),
      },
      0
    );

    this.notes.unshift(newNote);
    this.summary.totalNotes = this.notes.filter((n) => !n.isTrashed).length;

    const xpEarned = 15;
    xpService.awardXP(xpEarned, "Created Parchment Note");
    profileService.addCoins(5);

    notificationService.notify("success", `✨ Created note "${newNote.title}" (+${xpEarned} XP)`, "Note Created");
    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return newNote;
  }

  async autoSaveNote(id: string, updates: Partial<NoteItem>): Promise<NoteItem | undefined> {
    const index = this.notes.findIndex((n) => n.id === id);
    if (index === -1) return undefined;

    const existing = this.notes[index];
    const now = Date.now();

    let newContent = updates.content !== undefined ? updates.content : existing.content;
    let newTitle = updates.title !== undefined ? updates.title.trim() : existing.title;
    if (!newTitle) newTitle = "Untitled Note";

    const { wordsCount, charCount, readingTimeMinutes } = this.calculateWordStats(newContent);
    const snippetText = newContent
      .replace(/^#+\s+/gm, "")
      .replace(/[*_`#]/g, "")
      .slice(0, 120)
      .trim();

    const history = [...existing.history];
    const lastVersion = history[0];
    if (newContent !== existing.content && (!lastVersion || now - lastVersion.timestamp > 300000)) {
      history.unshift({
        id: `ver-${now}`,
        timestamp: now,
        title: existing.title,
        content: existing.content,
      });
      if (history.length > 20) history.pop();
    }

    const updatedNote: NoteItem = {
      ...existing,
      ...updates,
      title: newTitle,
      content: newContent,
      snippet: snippetText || "No content...",
      wordsCount,
      charCount,
      readingTimeMinutes,
      updatedAt: now,
      lastModified: now,
      lastEdited: "Just now",
      history,
    };

    this.notes[index] = updatedNote;
    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return updatedNote;
  }

  async updateNote(id: string, updates: Partial<NoteItem>): Promise<NoteItem | undefined> {
    return this.autoSaveNote(id, updates);
  }

  async restoreVersion(noteId: string, versionId: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return false;

    const ver = note.history.find((v) => v.id === versionId);
    if (!ver) return false;

    await this.autoSaveNote(noteId, {
      title: ver.title,
      content: ver.content,
    });

    notificationService.notify("info", `Restored version from ${new Date(ver.timestamp).toLocaleTimeString()}`, "Version Restored");
    return true;
  }

  async addAttachment(noteId: string, attachment: Omit<NoteAttachment, "id" | "createdAt">): Promise<NoteAttachment | undefined> {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return undefined;

    const newAtt: NoteAttachment = {
      ...attachment,
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };

    note.attachments = [...(note.attachments || []), newAtt];
    await this.persist();
    notificationService.notify("success", `Attached "${newAtt.name}"`, "Attachment Added");
    eventBus.emit("notes:updated", this.notes);
    return newAtt;
  }

  async removeAttachment(noteId: string, attachmentId: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return false;

    note.attachments = note.attachments.filter((a) => a.id !== attachmentId);
    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return true;
  }

  async togglePin(id: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return false;

    note.pinned = !note.pinned;
    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return note.pinned;
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return false;

    note.isFavorite = !note.isFavorite;
    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return note.isFavorite;
  }

  async deleteNote(id: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return false;

    if (note.isTrashed) {
      this.notes = this.notes.filter((n) => n.id !== id);
      notificationService.notify("info", `Permanently deleted note "${note.title}"`, "Note Deleted");
    } else {
      note.isTrashed = true;
      notificationService.notify("info", `Moved "${note.title}" to Trash`, "Note Trashed");
    }

    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return true;
  }

  async restoreNote(id: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return false;

    note.isTrashed = false;
    await this.persist();
    notificationService.notify("success", `Restored note "${note.title}"`, "Note Restored");
    eventBus.emit("notes:updated", this.notes);
    return true;
  }

  async archiveNote(id: string): Promise<boolean> {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return false;

    note.isArchived = !note.isArchived;
    await this.persist();
    notificationService.notify(
      "info",
      note.isArchived ? `Archived note "${note.title}"` : `Unarchived note "${note.title}"`,
      "Note Archived"
    );
    eventBus.emit("notes:updated", this.notes);
    return note.isArchived;
  }

  async createNotebook(title: string, color: NotebookItem["color"] = "purple", iconSymbol: string = "🔮", parentFolderId?: string): Promise<NotebookItem> {
    const newNb: NotebookItem = {
      id: `nb-${Date.now()}`,
      title: title.trim().toUpperCase(),
      color,
      iconSymbol: iconSymbol || "🔮",
      parentFolderId,
      noteCount: 0,
    };

    this.notebooks.push(newNb);
    await this.persist();
    notificationService.notify("success", `Created notebook "${newNb.title}"`, "Notebook Created");
    eventBus.emit("notes:updated", this.notes);
    return newNb;
  }

  async deleteNotebook(id: string): Promise<boolean> {
    const target = this.notebooks.find((nb) => nb.id === id);
    if (!target) return false;

    this.notebooks = this.notebooks.filter((nb) => nb.id !== id);
    this.notes.forEach((n) => {
      if (n.notebookId === id) {
        n.notebookId = "nb-personal";
        n.notebookName = "PERSONAL";
      }
    });

    await this.persist();
    notificationService.notify("info", `Deleted notebook "${target.title}"`, "Notebook Removed");
    eventBus.emit("notes:updated", this.notes);
    return true;
  }

  async createFolder(name: string, icon: string = "📁", parentFolderId?: string): Promise<FolderItem> {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      icon: icon || "📁",
      parentFolderId,
    };

    this.folders.push(newFolder);
    await this.persist();
    notificationService.notify("success", `Created folder "${newFolder.name}"`, "Folder Created");
    eventBus.emit("notes:updated", this.notes);
    return newFolder;
  }

  async deleteFolder(id: string): Promise<boolean> {
    this.folders = this.folders.filter((f) => f.id !== id);
    this.notebooks.forEach((nb) => {
      if (nb.parentFolderId === id) nb.parentFolderId = undefined;
    });
    this.notes.forEach((n) => {
      if (n.folderId === id) n.folderId = undefined;
    });
    await this.persist();
    eventBus.emit("notes:updated", this.notes);
    return true;
  }

  async importMarkdownNote(title: string, markdownText: string, notebookId?: string): Promise<NoteItem> {
    return this.createNote({
      title: title || "Imported Note",
      content: markdownText,
      notebookId: notebookId || "nb-personal",
      tags: ["#Imported"],
    });
  }

  getSummary(): NotesSummary {
    return {
      streak: 7,
      totalNotes: this.notes.filter((n) => !n.isTrashed).length,
      totalXP: profileService.getProfile().totalXP || 0,
    };
  }
}

export const notesServiceModule = new NotesService();
