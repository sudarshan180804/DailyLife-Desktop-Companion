import {
  Exercise,
  TimelineItem,
  BodyStat,
  GymSummary,
} from "../types/gym";

export const DEFAULT_BODY_STATS: BodyStat[] = [
  { name: "Strength", level: 1, progressPercent: 0 },
  { name: "Endurance", level: 1, progressPercent: 0 },
  { name: "Stamina", level: 1, progressPercent: 0 },
  { name: "Discipline", level: 1, progressPercent: 0 },
];

export const DEFAULT_GYM_SUMMARY: GymSummary = {
  streakDays: 0,
  weeklyWorkoutsCount: 0,
  totalXpEarned: 0,
  warriorRank: "Novice",
  warriorRankXp: 0,
  warriorRankMaxXp: 500,
};

// Deprecated mock exports for backwards compatibility if needed during migration
export const MOCK_EXERCISES: Exercise[] = [];
export const MOCK_TIMELINE: TimelineItem[] = [];
export const MOCK_BODY_STATS: BodyStat[] = DEFAULT_BODY_STATS;
export const MOCK_GYM_SUMMARY: GymSummary = DEFAULT_GYM_SUMMARY;
export const WEEKLY_SCHEDULE: { day: string; status: string }[] = [];
