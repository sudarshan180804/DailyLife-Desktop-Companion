export interface WordCardItem {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  partOfSpeech: "Verb" | "Noun" | "Adj." | "Particle";
  pillColor: string;
}

export interface AnkiDeckItem {
  id: string;
  title: string;
  subtitle: string;
  cardCount: number;
  iconSymbol: string;
  badgeColor: string;
}

export interface JapaneseProgressData {
  level: number;
  streakDays: number;
  currentXp: number;
  targetXp: number;
  jlptLevel: string;
  proverbKanji: string;
  proverbRomaji: string;
  proverbEnglish: string;
  todayJourney: {
    vocabCurrent: number;
    vocabTarget: number;
    kanjiCurrent: number;
    kanjiTarget: number;
    grammarCurrent: number;
    grammarTarget: number;
    reviewDue: number;
  };
  dailyGoal: {
    percentCompleted: number;
    vocabLearned: number;
    kanjiLearned: number;
    grammarLessons: number;
    reviewDueToday: number;
  };
}
