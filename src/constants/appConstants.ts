/**
 * Centralized Application Constants
 * Single source of truth for storage keys, events, rewards, and navigation.
 */

export const STORAGE_KEYS = {
  TASKS: "dailylife_tasks",
  PROJECTS: "dailylife_projects",
  NOTES: "dailylife_notes",
  GYM: "dailylife_gym",
  JAPANESE: "dailylife_japanese",
  MUSIC: "dailylife_music",
  ANIME: "dailylife_anime",
  ENTERTAINMENT: "dailylife_entertainment",
  PROFILE: "dailylife_profile",
  SETTINGS: "dailylife_settings",
} as const;

export const EVENTS = {
  // Tasks
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_COMPLETED: "task:completed",

  // Projects
  PROJECT_CREATED: "project:created",
  PROJECT_UPDATED: "project:updated",
  PROJECT_DELETED: "project:deleted",
  PROJECT_COMPLETED: "project:completed",

  // Notes
  NOTE_CREATED: "note:created",
  NOTE_UPDATED: "note:updated",
  NOTE_DELETED: "note:deleted",

  // Gym
  GYM_EXERCISE_COMPLETED: "gym:exerciseCompleted",
  GYM_SESSION_COMPLETED: "gym:sessionCompleted",
  GYM_UPDATED: "gym:updated",

  // Japanese
  JAPANESE_STUDY_COMPLETED: "japanese:studyCompleted",
  JAPANESE_GOAL_COMPLETED: "japanese:goalCompleted",
  JAPANESE_UPDATED: "japanese:updated",

  // Music
  MUSIC_PLAYED: "music:played",
  MUSIC_PLAYLIST_COMPLETED: "music:playlistCompleted",
  MUSIC_UPDATED: "music:updated",

  // Anime
  ANIME_EPISODE_WATCHED: "anime:episodeWatched",
  ANIME_SERIES_COMPLETED: "anime:seriesCompleted",
  ANIME_UPDATED: "anime:updated",

  // System & Profile
  XP_CHANGED: "xp:changed",
  LEVEL_UP: "level:up",
  ACHIEVEMENT_PROGRESS: "achievement:progress",
  ACHIEVEMENT_UNLOCKED: "achievement:unlocked",
  NOTIFICATION_ADDED: "notification:added",
  NOTIFICATION_REMOVED: "notification:removed",
  PROFILE_UPDATED: "profile:updated",
  SETTINGS_CHANGED: "settings:changed",
} as const;

export const XP_REWARDS = {
  TASK_DEFAULT: 25,
  TASK_HIGH: 45,
  PROJECT_COMPLETED_BONUS: 500,
  EXERCISE_COMPLETED: 20,
  WORKOUT_SESSION_BONUS: 100,
  JAPANESE_CARD: 5,
  JAPANESE_LESSON: 15,
  JAPANESE_GOAL_BONUS: 50,
  MUSIC_SESSION: 10,
  ANIME_EPISODE: 15,
  ANIME_SERIES_BONUS: 100,
} as const;

export const COIN_REWARDS = {
  TASK_COMPLETED: 10,
  LEVEL_UP_BONUS: 50,
  ACHIEVEMENT_UNLOCKED: 25,
  PROJECT_COMPLETED: 50,
  EXERCISE_COMPLETED: 5,
  WORKOUT_SESSION: 50,
  JAPANESE_STUDY: 10,
  JAPANESE_GOAL_BONUS: 25,
  MUSIC_SESSION: 2,
  ANIME_EPISODE: 3,
  ANIME_SERIES_BONUS: 50,
} as const;

export const NAV_TABS = [
  { id: "home", label: "Home" },
  { id: "tasks", label: "Tasks" },
  { id: "projects", label: "Projects" },
  { id: "gym", label: "Gym" },
  { id: "notes", label: "Notes" },
  { id: "japanese", label: "Japanese" },
  { id: "anime", label: "Anime" },
  { id: "music", label: "Music" },
  { id: "settings", label: "Settings" },
] as const;
