export interface NoteAttachment {
  id: string;
  name: string;
  type: string; // 'image' | 'pdf' | 'video' | 'file'
  path: string;
  size?: number;
  createdAt: number;
}

export interface NoteVersion {
  id: string;
  timestamp: number;
  title: string;
  content: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  icon: string;
  category: string;
  defaultTitle: string;
  content: string;
  tags: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  snippet: string;
  content: string;
  notebookId: string;
  notebookName: string;
  folderId?: string;
  tags: string[];
  collections: string[];
  isFavorite: boolean;
  pinned: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  isJournal?: boolean;
  journalDate?: string; // 'YYYY-MM-DD'
  createdAt: number;
  updatedAt: number;
  lastViewed?: number;
  lastModified?: number;
  lastEdited: string;
  wordsCount: number;
  charCount: number;
  readingTimeMinutes: number;
  attachments: NoteAttachment[];
  history: NoteVersion[];

  // AI-ready Metadata
  summary?: string;
  keywords?: string[];
  relatedNoteIds?: string[];
  embeddingId?: string; // placeholder
  importance?: number; // 1 to 5
  source?: string;

  // Cross-Module Linked Items
  linkedTaskIds?: string[];
  linkedProjectIds?: string[];
  linkedWorkoutIds?: string[];
  linkedVocabIds?: string[];
  linkedTitleIds?: string[];
}

export interface NotebookItem {
  id: string;
  title: string;
  color: "blue" | "brown" | "green" | "purple" | "darkblue" | "parchment";
  iconSymbol: string;
  parentFolderId?: string;
  noteCount: number;
}

export interface FolderItem {
  id: string;
  name: string;
  icon?: string;
  parentFolderId?: string;
}

export interface NotesSummary {
  streak: number;
  totalNotes: number;
  totalXP: number;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string;
  notebookName?: string;
  folderId?: string;
  tags?: string[];
  collections?: string[];
  pinned?: boolean;
  isFavorite?: boolean;
  isJournal?: boolean;
  journalDate?: string;
  templateId?: string;
  summary?: string;
  keywords?: string[];
  importance?: number;
  source?: string;
  linkedTaskIds?: string[];
  linkedProjectIds?: string[];
  linkedWorkoutIds?: string[];
  linkedVocabIds?: string[];
  linkedTitleIds?: string[];
}
