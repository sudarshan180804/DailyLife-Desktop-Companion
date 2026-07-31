import { NoteItem, NotebookItem, NotesSummary } from "../types/notes";

export const MOCK_NOTEBOOKS: NotebookItem[] = [
  {
    id: "nb-university",
    title: "UNIVERSITY",
    noteCount: 28,
    color: "blue",
    iconSymbol: "📘",
  },
  {
    id: "nb-projects",
    title: "PROJECTS",
    noteCount: 16,
    color: "brown",
    iconSymbol: "📕",
  },
  {
    id: "nb-japanese",
    title: "JAPANESE",
    noteCount: 12,
    color: "green",
    iconSymbol: "📗",
  },
  {
    id: "nb-research",
    title: "RESEARCH",
    noteCount: 19,
    color: "purple",
    iconSymbol: "📔",
  },
  {
    id: "nb-personal",
    title: "PERSONAL",
    noteCount: 14,
    color: "darkblue",
    iconSymbol: "📓",
  },
  {
    id: "nb-archive",
    title: "ARCHIVE",
    noteCount: 8,
    color: "parchment",
    iconSymbol: "📜",
  },
];

export const MOCK_NOTES: NoteItem[] = [
  {
    id: "note-ai-patient",
    title: "Nursing Serious Game Architecture",
    snippet: "Core systems and gameplay loop design...",
    content: `# AI PATIENT ARCHITECTURE

Core systems and gameplay loop design for nursing simulation.

## 1. CORE SCENARIO LOGIC
- Patient state machine handling vitals deterioration
- Medication administration validation with dosage checks
- Dialogue system for patient-nurse interaction

## 2. METRICS & SCORING
- Real-time clinical accuracy evaluation
- Procedural step adherence tracking
`,
    notebookId: "nb-projects",
    notebookName: "PROJECTS",
    tags: ["#AI", "#Nursing", "#Unreal", "#GameDev", "#Architecture"],
    collections: ["Unreal", "Research", "DailyLife"],
    lastEdited: "Today, 4:32 PM",
    pinned: true,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 4,
    wordsCount: 52,
    charCount: 340,
    readingTimeMinutes: 1,
    attachments: [],
    history: [],
  },
  {
    id: "note-japanese-kanji",
    title: "JLPT N3 Kanji & Vocabulary Notes",
    snippet: "Important kanji compounds and usage rules...",
    content: `# JLPT N3 KANJI & VOCABULARY NOTES

Important kanji compounds and grammar patterns for N3 exam preparation.

## 1. ESSENTIAL COMPOUNDS
- 努力 (どりょく) - Effort, hard work
- 準備 (じゅんび) - Preparation
- 経験 (けいけん) - Experience

## 2. GRAMMAR PATTERNS
- ~ようにする - Make an effort to do
- ~ことにする - Decide to do
`,
    notebookId: "nb-japanese",
    notebookName: "JAPANESE",
    tags: ["#Japanese", "#Kanji", "#N3", "#Study"],
    collections: ["Japanese", "DailyLife"],
    lastEdited: "Yesterday, 2:15 PM",
    pinned: false,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    wordsCount: 45,
    charCount: 290,
    readingTimeMinutes: 1,
    attachments: [],
    history: [],
  },
];

export const MOCK_NOTES_SUMMARY: NotesSummary = {
  streak: 36,
  totalNotes: 124,
  totalXP: 8450,
};
