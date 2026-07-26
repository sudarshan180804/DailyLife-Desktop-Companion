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
    notebookId: "nb-projects",
    notebookName: "PROJECTS",
    tags: ["#AI", "#Nursing", "#Unreal", "#GameDev", "#Architecture"],
    lastEdited: "Today, 4:32 PM",
    pinned: true,
    content: {
      heading: "AI PATIENT ARCHITECTURE",
      intro:
        "The AI Patient system is the core of the serious game. It simulates realistic patient behavior, responses, and clinical changes based on the trainee's actions.",
      keyGoal:
        "Create patients that feel alive, realistic and responsive to the trainee's actions.",
      photoUrl:
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
      attachments: [
        { name: "patient_state_diagram.png", type: "image" },
        { name: "rule_engine_flow.pdf", type: "pdf" },
      ],
      sections: [
        {
          title: "1. PATIENT STATE",
          items: [
            "Vital signs (HR, BP, RR, SpO2, Temp)",
            "Emotional state (Anxiety, Pain, Comfort)",
            "Symptoms and complaints",
            "Medical history",
            "Current interventions and medications",
          ],
        },
        {
          title: "2. STATE TRANSITIONS",
          items: [
            "Trainee actions (assessments, meds, procedures)",
            "Time progression",
            "World events (e.g., deterioration, power outage)",
            "AI-driven logic & rule engine",
          ],
        },
        {
          title: "3. RESPONSE GENERATION",
          items: [
            "LLM for natural language responses",
            "Rule-based system for clinical accuracy",
            "Context from patient state and history",
          ],
        },
      ],
    },
  },
  {
    id: "note-ai-patient-system",
    title: "AI Patient System",
    snippet: "Patient state, behavior tree, and dialogue system...",
    notebookId: "nb-projects",
    notebookName: "PROJECTS",
    tags: ["#Unreal", "#AI", "#Nursing"],
    lastEdited: "2h ago",
    pinned: true,
    content: {
      heading: "AI PATIENT SYSTEM DESIGN",
      intro: "Detailed breakdown of the behavior trees and dialogue triggers.",
      sections: [
        {
          title: "1. BEHAVIOR TREES",
          items: [
            "Root node checking patient vitals",
            "Selector for stress vs calm state",
          ],
        },
      ],
    },
  },
  {
    id: "note-unreal-stt",
    title: "Unreal STT Pipeline",
    snippet: "Speech to text system implementation notes...",
    notebookId: "nb-projects",
    notebookName: "PROJECTS",
    tags: ["#Unreal", "#STT", "#Blueprints"],
    lastEdited: "5h ago",
    pinned: true,
    content: {
      heading: "UNREAL STT PIPELINE",
      intro: "Speech to text integration in Unreal Engine 5 via Whisper API.",
      sections: [
        {
          title: "1. AUDIO CAPTURE",
          items: [
            "Microphone submix listener in UE5",
            "16kHz mono WAV buffer conversion",
          ],
        },
      ],
    },
  },
  {
    id: "note-japanese-grammar",
    title: "Japanese N5 Grammar",
    snippet: "Verb conjugations and basic sentence patterns...",
    notebookId: "nb-japanese",
    notebookName: "JAPANESE",
    tags: ["#Japanese", "#Grammar", "#Study"],
    lastEdited: "Yesterday",
    pinned: true,
    content: {
      heading: "JAPANESE N5 GRAMMAR & PARTICLES",
      intro: "Summary of particle usages: は, が, を, に, で.",
      sections: [
        {
          title: "1. PARTICLES OVERVIEW",
          items: [
            "は (wa): Topic marker",
            "が (ga): Subject marker",
            "を (wo): Direct object marker",
          ],
        },
      ],
    },
  },
  {
    id: "note-dailylife-ideas",
    title: "DailyLife Ideas",
    snippet: "Ideas for better daily planning and tracking...",
    notebookId: "nb-personal",
    notebookName: "PERSONAL",
    tags: ["#Productivity", "#Ideas"],
    lastEdited: "Yesterday",
    pinned: true,
    content: {
      heading: "DAILYLIFE PRODUCTIVITY IDEAS",
      intro: "Future widget ideas and tavern aesthetic enhancements.",
      sections: [
        {
          title: "1. WIDGETS",
          items: ["Pomodoro timer scroll", "Quest board integration"],
        },
      ],
    },
  },
  {
    id: "note-nursing-game",
    title: "Nursing Serious Game",
    snippet: "Design notes for patient simulation scenarios...",
    notebookId: "nb-university",
    notebookName: "UNIVERSITY",
    tags: ["#Nursing", "#GameDev", "#AI"],
    lastEdited: "2 days ago",
    pinned: false,
    content: {
      heading: "NURSING SCENARIOS",
      intro: "Clinical scenario outline for IV administration.",
      sections: [
        {
          title: "1. SCENARIO A",
          items: ["Patient presenting with acute dehydration"],
        },
      ],
    },
  },
];

export const MOCK_NOTES_SUMMARY: NotesSummary = {
  streak: 36,
  totalNotes: 124,
  totalXp: 8450,
};
