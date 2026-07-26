export interface NoteItem {
  id: string;
  title: string;
  snippet: string;
  notebookId: string;
  notebookName: string;
  tags: string[];
  lastEdited: string;
  pinned: boolean;
  content: {
    heading: string;
    subtitle?: string;
    intro: string;
    sections: {
      title: string;
      items: string[];
    }[];
    keyGoal?: string;
    photoUrl?: string;
    attachments?: { name: string; type: string }[];
  };
}

export interface NotebookItem {
  id: string;
  title: string;
  noteCount: number;
  color: "blue" | "brown" | "green" | "purple" | "darkblue" | "parchment";
  iconSymbol: string;
}

export interface NotesSummary {
  streak: number;
  totalNotes: number;
  totalXp: number;
}
