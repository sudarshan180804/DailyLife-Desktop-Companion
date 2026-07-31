import { NoteTemplate } from "./types";

export const BUILTIN_TEMPLATES: NoteTemplate[] = [
  {
    id: "template-blank",
    name: "Blank Parchment",
    icon: "📄",
    category: "General",
    defaultTitle: "Untitled Note",
    content: `# Untitled Note\n\nStart typing thoughts...`,
    tags: ["#Notes"],
  },
  {
    id: "template-meeting",
    name: "Meeting Notes",
    icon: "🤝",
    category: "Work",
    defaultTitle: "Meeting: [Topic]",
    content: `# Meeting: [Topic] 🤝
**Date**: {{date}} | **Attendees**: 

## 🎯 Objectives
- 

## 📝 Key Discussion Points
- 

## ⚡ Action Items
- [ ] Task 1
- [ ] Task 2
`,
    tags: ["#Meeting", "#Work"],
  },
  {
    id: "template-research",
    name: "Research Synthesis",
    icon: "🔬",
    category: "Academic",
    defaultTitle: "Research: [Topic]",
    content: `# Research: [Topic] 🔬
**Source**: [URL or Citation]
**Key Terms**: #Research, #Synthesis

## 📌 Executive Summary
Brief summary of findings...

## 💡 Core Insights
1. 
2. 

## 🔗 Related References
- [[Note Title]]
`,
    tags: ["#Research", "#Academic"],
  },
  {
    id: "template-lecture",
    name: "Lecture Notes",
    icon: "🎓",
    category: "Academic",
    defaultTitle: "Lecture: [Course Name]",
    content: `# Lecture: [Course Name] 🎓
**Instructor**: 
**Date**: {{date}}

## 📖 Key Concepts
- 

## ✍️ Detailed Notes
> Quote or core theorem...

## ❓ Questions & Follow-ups
- [ ] Review chapter
`,
    tags: ["#Lecture", "#Study"],
  },
  {
    id: "template-project",
    name: "Project Planning",
    icon: "🚀",
    category: "Development",
    defaultTitle: "Project: [Title]",
    content: `# Project: [Title] 🚀
**Collection**: #Unreal / #DailyLife

## 🎯 Vision & Goals
- 

## 🏗️ Architecture & Modules
\`\`\`mermaid
graph TD;
    A[UI Component] --> B[Service Layer];
    B --> C[Store / Storage];
\`\`\`

## 📋 Milestone Checklist
- [ ] Milestone 1: MVP Setup
- [ ] Milestone 2: Feature Polish
`,
    tags: ["#Project", "#Dev"],
  },
  {
    id: "template-gym",
    name: "Gym Workout Log",
    icon: "🏋️",
    category: "Fitness",
    defaultTitle: "Gym Log: [Workout Name]",
    content: `# Gym Log: [Workout Name] 🏋️
**Date**: {{date}} | **Focus**: Push / Pull / Legs

## 📊 Exercises & Sets
- **Bench Press**: 4 sets x 10 reps @ 80kg
- **Incline Dumbbell Press**: 3 sets x 12 reps
- **Tricep Cable Pushdown**: 4 sets x 15 reps

## 💡 Performance Notes
- Strong energy, hit personal record on bench.
`,
    tags: ["#Gym", "#Fitness", "#Workout"],
  },
  {
    id: "template-japanese",
    name: "Japanese Study Log",
    icon: "⛩️",
    category: "Language",
    defaultTitle: "Japanese Study: [Topic]",
    content: `# Japanese Study: [Topic] ⛩️
**Level**: JLPT N3 / N2 | **Date**: {{date}}

## 📝 Kanji & Vocabulary
- **努力 (どりょく)**: Effort, hard work
- **準備 (じゅんび)**: Preparation

## 🗣️ Grammar Pattern
> **~ようにする**: Make an effort to do...

## 💬 Practice Sentences
- 毎日日本語を勉強するようにしています。
`,
    tags: ["#Japanese", "#Kanji", "#Study"],
  },
  {
    id: "template-anime-review",
    name: "Anime Review",
    icon: "🌸",
    category: "Entertainment",
    defaultTitle: "Anime Review: [Show Name]",
    content: `# Anime Review: [Show Name] 🌸
**Rating**: ⭐⭐⭐⭐⭐ (5/5) | **Status**: Completed

## 🍿 Synopsis
Brief summary of plot...

## 🎨 Animation & Soundtrack
- **Studio**: 
- **Music**: 

## 💬 Verdict & Review Notes
Great story execution and character development.
`,
    tags: ["#Anime", "#Review", "#Entertainment"],
  },
  {
    id: "template-movie-review",
    name: "Movie Review",
    icon: "🍿",
    category: "Entertainment",
    defaultTitle: "Movie Review: [Film Title]",
    content: `# Movie Review: [Film Title] 🍿
**Director**: | **Year**: | **Rating**: ⭐⭐⭐⭐⭐ (5/5)

## 🎥 Key Highlights
- 

## 💭 Impressions
Fascinating cinematography and pacing.
`,
    tags: ["#Movie", "#Review", "#Entertainment"],
  },
  {
    id: "template-weekly-review",
    name: "Weekly Review",
    icon: "📅",
    category: "Journal",
    defaultTitle: "Weekly Review: Week of {{date}}",
    content: `# Weekly Review: Week of {{date}} 📅

## 🏆 Wins & Achievements
- 

## 📈 Stats & Progress
- **XP Earned**: 
- **Notes Created**: 

## 🎯 Next Week's Priorities
- [ ] Task 1
- [ ] Task 2
`,
    tags: ["#WeeklyReview", "#Journal"],
  },
];
