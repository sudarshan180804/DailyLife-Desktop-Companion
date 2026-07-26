# DailyLife — Gamified Desktop Productivity Companion

> A visually immersive desktop companion designed to bring productivity, personal growth, and daily routines into one adaptive experience.

DailyLife is a desktop application built with **Tauri, React, TypeScript, and Rust**. The project explores a different approach to productivity software: instead of presenting users with another conventional dashboard, DailyLife aims to create an environment that evolves throughout the day and makes personal progress feel more engaging.

The application combines a dynamic time-aware interface with planned productivity, fitness, learning, entertainment, and progression systems.

> **Development Status:** Early development / active prototype

---

## ✨ Current Preview

DailyLife currently features an immersive fullscreen desktop interface with a time-aware visual environment.

> Screenshot coming soon.

---

## 🎯 Project Vision

Most productivity applications separate different parts of daily life across multiple tools.

DailyLife aims to bring them together into a single desktop companion.

The long-term vision includes:

- Task and routine management
- Project tracking
- Fitness and workout tracking
- Notes and personal knowledge management
- Japanese learning tools
- Anime and entertainment tracking
- Music integration
- Gamified XP and level progression
- Context-aware interface changes
- AI-assisted productivity features

The goal is to make DailyLife feel less like a traditional productivity dashboard and more like a **personal operating environment for everyday life**.

---

## ✅ Currently Implemented

### Adaptive Time-Based Environment

DailyLife automatically selects its visual background using the user's local system time.

Current periods include:

| Time | Scene |
|---|---|
| 05:00 – 08:59 | Breakfast |
| 09:00 – 11:59 | Work |
| 12:00 – 13:59 | Lunch |
| 14:00 – 17:29 | Afternoon |
| 17:30 – 20:29 | Workout |
| 20:30 – 04:59 | Night |

The time-selection system is modular so that future versions can use these periods to control more than backgrounds.

### Dynamic Background Transitions

Background scenes automatically update while the application is running and transition smoothly when the active time period changes.

### Adaptive Sidebar

The navigation interface supports:

- Compact collapsed mode
- Expanded hover state
- Transparent background blending
- Contextual active-item highlighting
- Animated transitions
- Fullscreen-oriented layout

### Gamification Foundation

The interface includes the initial visual foundation for:

- User profile
- Player level
- XP progression
- Progress bar

The underlying progression system is planned for future development.

### Dynamic Greeting System

The home interface displays:

- Time-aware greetings
- User name
- Rotating motivational quotes

Quotes are stored separately from the presentation layer to keep the system extensible.

### Desktop Window Integration

DailyLife uses Tauri for native desktop functionality, including:

- Frameless application window
- Fullscreen presentation
- Custom window controls
- ESC-based window control overlay

---

## 🗺️ Planned Modules

DailyLife is being designed around several interconnected modules.

### 🏠 Home

A contextual overview of the user's day, progress, upcoming activities, and important information.

### ✅ Tasks

Task management with planned support for priorities, deadlines, recurring tasks, XP rewards, and progress tracking.

### 📁 Projects

A workspace for tracking larger personal, academic, and development projects.

### 🏋️ Gym

Workout planning and fitness progression with potential support for exercises, sets, repetitions, personal records, and workout history.

### 📝 Notes

Integrated personal notes and knowledge management.

### 🇯🇵 Japanese

A dedicated Japanese-learning environment intended to support vocabulary, kanji, grammar, review sessions, and learning progress.

### ▶️ Anime

Personal anime tracking and entertainment management.

### 🎵 Music

Music-focused functionality and integration planned for future versions.

### ⚙️ Settings

Customization for application behaviour, appearance, profile information, and other preferences.

---

## 🎮 Gamification

A major design direction for DailyLife is turning real-world progress into visible progression.

Planned systems include:

- XP rewards
- Player levels
- Daily goals
- Streaks
- Achievements
- Activity statistics
- Progress milestones
- Module-specific progression

Instead of gamification existing as a separate feature, the goal is for progression to connect naturally with activities completed throughout DailyLife.

---

## 🤖 Future AI Integration

AI capabilities are planned for later stages of development.

Potential areas include:

- Intelligent task prioritization
- Daily planning assistance
- Routine recommendations
- Productivity summaries
- Context-aware suggestions
- Natural-language interaction
- Learning assistance
- Personal progress insights

AI features will be introduced incrementally rather than being required for the application's core functionality.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Tauri** | Native desktop application framework |
| **React** | User interface architecture |
| **TypeScript** | Type-safe frontend development |
| **Rust** | Native Tauri backend |
| **Vite** | Frontend build tooling |
| **CSS** | Custom UI, animation, transparency, and responsive styling |

The application currently avoids unnecessary external UI dependencies and uses lightweight custom components where practical.

---

## 🏗️ Project Architecture

```text
DailyLife/
│
├── public/
│
├── src/
│   ├── assets/
│   │   ├── backgrounds/
│   │   └── profile/
│   │
│   ├── components/
│   │   ├── Background.tsx
│   │   ├── GreetingSection.tsx
│   │   ├── Icons.tsx
│   │   ├── Sidebar.tsx
│   │   └── WindowControlsOverlay.tsx
│   │
│   ├── data/
│   │   └── quotes.ts
│   │
│   ├── utils/
│   │   ├── quoteService.ts
│   │   └── timePeriod.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
│
├── src-tauri/
│   ├── capabilities/
│   ├── icons/
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

The architecture intentionally separates time logic, quote selection, UI components, and native desktop configuration so the application can grow without concentrating everything inside the main application component.

---

## 🚀 Running the Project Locally

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Rust
- Cargo
- Tauri system prerequisites

### Clone the Repository

```bash
git clone https://github.com/sudarshan180804/DailyLife-Desktop-Companion.git
```

Enter the project directory:

```bash
cd DailyLife-Desktop-Companion
```

Install frontend dependencies:

```bash
npm install
```

Run the desktop application:

```bash
npm run tauri dev
```

For frontend-only development:

```bash
npm run dev
```

---

## 🧪 Build

Build the frontend:

```bash
npm run build
```

Build the native desktop application:

```bash
npm run tauri build
```

---

## 🛣️ Development Roadmap

### Phase 1 — Application Foundation

- [x] Tauri desktop application setup
- [x] React + TypeScript frontend
- [x] Frameless fullscreen interface
- [x] Adaptive sidebar
- [x] Dynamic local-time backgrounds
- [x] Background transitions
- [x] Greeting system
- [x] Motivational quote system
- [x] Initial profile / XP interface

### Phase 2 — Core Productivity

- [ ] Home dashboard
- [ ] Task management
- [ ] Project management
- [ ] Notes system
- [ ] Local data persistence

### Phase 3 — Lifestyle Modules

- [ ] Gym and workout tracking
- [ ] Japanese learning
- [ ] Anime tracking
- [ ] Music functionality

### Phase 4 — Gamification

- [ ] Functional XP system
- [ ] Level progression
- [ ] Streak system
- [ ] Achievements
- [ ] Daily objectives
- [ ] Progress analytics

### Phase 5 — Intelligence

- [ ] Context-aware daily assistance
- [ ] Smart task suggestions
- [ ] Personal productivity insights
- [ ] AI-assisted planning
- [ ] Adaptive recommendations

---

## 💡 Design Philosophy

DailyLife is built around four principles:

**Immersive** — The application should feel like a personal environment rather than a collection of disconnected forms and dashboards.

**Adaptive** — The interface should respond to context such as time, activity, and eventually user behaviour.

**Motivating** — Progress should be visible and rewarding through levels, XP, streaks, and achievements.

**Modular** — Productivity, fitness, learning, and entertainment systems should remain independently maintainable while contributing to a shared progression system.

---

## 🔒 Privacy Direction

DailyLife is intended to prioritize local-first functionality where practical.

As cloud and AI capabilities are introduced, privacy and explicit control over externally processed data will remain important architectural considerations.

---

## 🤝 Contributing

DailyLife is currently a personal project under active development.

Suggestions, ideas, and constructive feedback are welcome through GitHub Issues.

---

## 👨‍💻 Author

**Sudarshan Kshirsagar**

Computer Science & Engineering student interested in:

- Full-stack development
- Desktop applications
- Game development
- Artificial intelligence
- Unreal Engine
- Interactive systems

GitHub: **@sudarshan180804**

---

## ⭐ Project Status

DailyLife is under active development.

The current repository represents the foundation of the application, and additional modules will be implemented incrementally.

If you find the project interesting, consider giving the repository a ⭐ and following its development.