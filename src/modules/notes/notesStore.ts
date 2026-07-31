import { useSyncExternalStore } from "react";
import { notesServiceModule, NotesService } from "./notesService";
import { eventBus } from "../../services/eventBus";
import {
  NoteItem,
  NotebookItem,
  FolderItem,
  NotesSummary,
  CreateNoteInput,
  NoteAttachment,
  NoteTemplate,
} from "./types";

export interface NotesStoreState {
  notes: NoteItem[];
  notebooks: NotebookItem[];
  folders: FolderItem[];
  allCollections: string[];
  allTags: string[];
  templates: NoteTemplate[];
  summary: NotesSummary;
  loading: boolean;
}

export interface NotesStoreActions {
  getNotes: (filter?: {
    view?: "all" | "favorites" | "pinned" | "recent" | "frequently_edited" | "recently_viewed" | "archived" | "trash" | "journal";
    notebookId?: string;
    folderId?: string;
    collection?: string;
    tag?: string;
    search?: string;
  }) => NoteItem[];
  getNoteById: (id: string) => NoteItem | undefined;
  getOrCreateDailyJournal: (dateStr?: string) => Promise<NoteItem>;
  getJournalDateNav: (currentDateStr: string) => { prevDate: string; nextDate: string };
  getSmartSuggestions: (noteId: string) => { relatedNotes: NoteItem[]; recentlyViewed: NoteItem[]; frequentlyEdited: NoteItem[] };
  getBacklinks: (noteTitle: string) => NoteItem[];
  recordView: (id: string) => void;
  createNote: (input: CreateNoteInput) => Promise<NoteItem>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<NoteItem | undefined>;
  autoSaveNote: (id: string, updates: Partial<NoteItem>) => Promise<NoteItem | undefined>;
  deleteNote: (id: string) => Promise<boolean>;
  restoreNote: (id: string) => Promise<boolean>;
  archiveNote: (id: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  addAttachment: (noteId: string, attachment: Omit<NoteAttachment, "id" | "createdAt">) => Promise<NoteAttachment | undefined>;
  removeAttachment: (noteId: string, attachmentId: string) => Promise<boolean>;
  restoreVersion: (noteId: string, versionId: string) => Promise<boolean>;
  createNotebook: (title: string, color?: NotebookItem["color"], iconSymbol?: string, parentFolderId?: string) => Promise<NotebookItem>;
  deleteNotebook: (id: string) => Promise<boolean>;
  createFolder: (name: string, icon?: string, parentFolderId?: string) => Promise<FolderItem>;
  deleteFolder: (id: string) => Promise<boolean>;
  importMarkdownNote: (title: string, markdownText: string, notebookId?: string) => Promise<NoteItem>;
  refresh: () => Promise<void>;
}

export class NotesStore {
  private state: NotesStoreState;
  private listeners: Set<() => void> = new Set();
  private service: NotesService;

  constructor(service: NotesService = notesServiceModule) {
    this.service = service;
    this.state = {
      notes: this.service.getNotes(),
      notebooks: this.service.getNotebooks(),
      folders: this.service.getFolders(),
      allCollections: this.service.getAllCollections(),
      allTags: this.service.getAllTags(),
      templates: this.service.getTemplates(),
      summary: this.service.getSummary(),
      loading: false,
    };

    eventBus.subscribe("notes:updated", () => this.syncFromService());
    eventBus.subscribe("note:created", () => this.syncFromService());
    eventBus.subscribe("note:updated", () => this.syncFromService());
    eventBus.subscribe("note:deleted", () => this.syncFromService());
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      notes: this.service.getNotes(),
      notebooks: this.service.getNotebooks(),
      folders: this.service.getFolders(),
      allCollections: this.service.getAllCollections(),
      allTags: this.service.getAllTags(),
      templates: this.service.getTemplates(),
      summary: this.service.getSummary(),
    };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): NotesStoreState => {
    return this.state;
  };

  public async refresh(): Promise<void> {
    this.state = { ...this.state, loading: true };
    this.notify();
    await new Promise((resolve) => setTimeout(resolve, 0));
    this.syncFromService();
    this.state = { ...this.state, loading: false };
    this.notify();
  }

  public getNotes(filter?: {
    view?: "all" | "favorites" | "pinned" | "recent" | "frequently_edited" | "recently_viewed" | "archived" | "trash" | "journal";
    notebookId?: string;
    folderId?: string;
    collection?: string;
    tag?: string;
    search?: string;
  }): NoteItem[] {
    return this.service.getNotes(filter);
  }

  public getNoteById(id: string): NoteItem | undefined {
    return this.service.getNoteById(id);
  }

  public async getOrCreateDailyJournal(dateStr?: string): Promise<NoteItem> {
    const journal = await this.service.getOrCreateDailyJournal(dateStr);
    this.syncFromService();
    return journal;
  }

  public getJournalDateNav(currentDateStr: string): { prevDate: string; nextDate: string } {
    return this.service.getJournalDateNav(currentDateStr);
  }

  public getSmartSuggestions(noteId: string): { relatedNotes: NoteItem[]; recentlyViewed: NoteItem[]; frequentlyEdited: NoteItem[] } {
    return this.service.getSmartSuggestions(noteId);
  }

  public getBacklinks(noteTitle: string): NoteItem[] {
    return this.service.getBacklinks(noteTitle);
  }

  public recordView(id: string): void {
    this.service.recordView(id);
    this.syncFromService();
  }

  public async createNote(input: CreateNoteInput): Promise<NoteItem> {
    const created = await this.service.createNote(input);
    this.syncFromService();
    return created;
  }

  public async updateNote(id: string, updates: Partial<NoteItem>): Promise<NoteItem | undefined> {
    const updated = await this.service.updateNote(id, updates);
    this.syncFromService();
    return updated;
  }

  public async autoSaveNote(id: string, updates: Partial<NoteItem>): Promise<NoteItem | undefined> {
    const updated = await this.service.autoSaveNote(id, updates);
    this.syncFromService();
    return updated;
  }

  public async deleteNote(id: string): Promise<boolean> {
    const ok = await this.service.deleteNote(id);
    this.syncFromService();
    return ok;
  }

  public async restoreNote(id: string): Promise<boolean> {
    const ok = await this.service.restoreNote(id);
    this.syncFromService();
    return ok;
  }

  public async archiveNote(id: string): Promise<boolean> {
    const ok = await this.service.archiveNote(id);
    this.syncFromService();
    return ok;
  }

  public async togglePin(id: string): Promise<boolean> {
    const ok = await this.service.togglePin(id);
    this.syncFromService();
    return ok;
  }

  public async toggleFavorite(id: string): Promise<boolean> {
    const ok = await this.service.toggleFavorite(id);
    this.syncFromService();
    return ok;
  }

  public async addAttachment(noteId: string, attachment: Omit<NoteAttachment, "id" | "createdAt">): Promise<NoteAttachment | undefined> {
    const att = await this.service.addAttachment(noteId, attachment);
    this.syncFromService();
    return att;
  }

  public async removeAttachment(noteId: string, attachmentId: string): Promise<boolean> {
    const ok = await this.service.removeAttachment(noteId, attachmentId);
    this.syncFromService();
    return ok;
  }

  public async restoreVersion(noteId: string, versionId: string): Promise<boolean> {
    const ok = await this.service.restoreVersion(noteId, versionId);
    this.syncFromService();
    return ok;
  }

  public async createNotebook(title: string, color?: NotebookItem["color"], iconSymbol?: string, parentFolderId?: string): Promise<NotebookItem> {
    const nb = await this.service.createNotebook(title, color, iconSymbol, parentFolderId);
    this.syncFromService();
    return nb;
  }

  public async deleteNotebook(id: string): Promise<boolean> {
    const ok = await this.service.deleteNotebook(id);
    this.syncFromService();
    return ok;
  }

  public async createFolder(name: string, icon?: string, parentFolderId?: string): Promise<FolderItem> {
    const folder = await this.service.createFolder(name, icon, parentFolderId);
    this.syncFromService();
    return folder;
  }

  public async deleteFolder(id: string): Promise<boolean> {
    const ok = await this.service.deleteFolder(id);
    this.syncFromService();
    return ok;
  }

  public async importMarkdownNote(title: string, markdownText: string, notebookId?: string): Promise<NoteItem> {
    const note = await this.service.importMarkdownNote(title, markdownText, notebookId);
    this.syncFromService();
    return note;
  }
}

export const notesStore = new NotesStore();

export function useNotesStore(): NotesStoreState & NotesStoreActions {
  const state = useSyncExternalStore(
    notesStore.subscribe,
    notesStore.getSnapshot,
    notesStore.getSnapshot
  );

  return {
    ...state,
    getNotes: (filter) => notesStore.getNotes(filter),
    getNoteById: (id) => notesStore.getNoteById(id),
    getOrCreateDailyJournal: (dateStr) => notesStore.getOrCreateDailyJournal(dateStr),
    getJournalDateNav: (dateStr) => notesStore.getJournalDateNav(dateStr),
    getSmartSuggestions: (noteId) => notesStore.getSmartSuggestions(noteId),
    getBacklinks: (title) => notesStore.getBacklinks(title),
    recordView: (id) => notesStore.recordView(id),
    createNote: (input) => notesStore.createNote(input),
    updateNote: (id, updates) => notesStore.updateNote(id, updates),
    autoSaveNote: (id, updates) => notesStore.autoSaveNote(id, updates),
    deleteNote: (id) => notesStore.deleteNote(id),
    restoreNote: (id) => notesStore.restoreNote(id),
    archiveNote: (id) => notesStore.archiveNote(id),
    togglePin: (id) => notesStore.togglePin(id),
    toggleFavorite: (id) => notesStore.toggleFavorite(id),
    addAttachment: (noteId, att) => notesStore.addAttachment(noteId, att),
    removeAttachment: (noteId, attId) => notesStore.removeAttachment(noteId, attId),
    restoreVersion: (noteId, verId) => notesStore.restoreVersion(noteId, verId),
    createNotebook: (title, color, icon, parentFolderId) => notesStore.createNotebook(title, color, icon, parentFolderId),
    deleteNotebook: (id) => notesStore.deleteNotebook(id),
    createFolder: (name, icon, parentFolderId) => notesStore.createFolder(name, icon, parentFolderId),
    deleteFolder: (id) => notesStore.deleteFolder(id),
    importMarkdownNote: (title, md, nbId) => notesStore.importMarkdownNote(title, md, nbId),
    refresh: () => notesStore.refresh(),
  };
}
