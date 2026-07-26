export interface XPState {
  totalXp: number;
  todayXp: number;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  bestStreakDays: number;
  lastDate: string;
}

const STORAGE_KEY = "dailylife_xp";

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const INITIAL_STATE: XPState = {
  totalXp: 450, // Level 5 (250 / 500 equivalent or Level 5: 50 / 100)
  todayXp: 120,
  level: 5,
  currentXp: 50,
  nextLevelXp: 100,
  streakDays: 7,
  bestStreakDays: 14,
  lastDate: getTodayString(),
};

type Listener = (state: XPState) => void;
const listeners: Set<Listener> = new Set();

function calculateLevelDetails(totalXp: number) {
  // Each level requires 100 XP
  const level = Math.floor(totalXp / 100) + 1;
  const currentXp = totalXp % 100;
  const nextLevelXp = 100;
  return { level, currentXp, nextLevelXp };
}

function loadState(): XPState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveState(INITIAL_STATE);
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    const today = getTodayString();
    
    // Reset todayXp if it's a new calendar day
    if (parsed.lastDate !== today) {
      parsed.todayXp = 0;
      parsed.lastDate = today;
      saveState(parsed);
    }
    
    const { level, currentXp, nextLevelXp } = calculateLevelDetails(parsed.totalXp ?? 450);
    return {
      totalXp: parsed.totalXp ?? 450,
      todayXp: parsed.todayXp ?? 120,
      level,
      currentXp,
      nextLevelXp,
      streakDays: parsed.streakDays ?? 7,
      bestStreakDays: parsed.bestStreakDays ?? 14,
      lastDate: parsed.lastDate ?? today,
    };
  } catch (err) {
    console.error("Failed to load XP state from localStorage:", err);
    return INITIAL_STATE;
  }
}

function saveState(state: XPState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save XP state to localStorage:", err);
  }
}

function notifyListeners(state: XPState) {
  listeners.forEach((listener) => listener(state));
}

export const xpService = {
  getXPState(): XPState {
    return loadState();
  },

  addXP(amount: number): XPState {
    const currentState = loadState();
    const newTotalXp = Math.max(0, currentState.totalXp + amount);
    const newTodayXp = Math.max(0, currentState.todayXp + amount);
    const { level, currentXp, nextLevelXp } = calculateLevelDetails(newTotalXp);

    const newState: XPState = {
      ...currentState,
      totalXp: newTotalXp,
      todayXp: newTodayXp,
      level,
      currentXp,
      nextLevelXp,
    };

    saveState(newState);
    notifyListeners(newState);
    return newState;
  },

  removeXP(amount: number): XPState {
    const currentState = loadState();
    const newTotalXp = Math.max(0, currentState.totalXp - amount);
    const newTodayXp = Math.max(0, currentState.todayXp - amount);
    const { level, currentXp, nextLevelXp } = calculateLevelDetails(newTotalXp);

    const newState: XPState = {
      ...currentState,
      totalXp: newTotalXp,
      todayXp: newTodayXp,
      level,
      currentXp,
      nextLevelXp,
    };

    saveState(newState);
    notifyListeners(newState);
    return newState;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
