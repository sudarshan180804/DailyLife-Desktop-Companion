import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import {
  MOCK_JAPANESE_PROGRESS,
  MOCK_ANKI_DECKS,
  MOCK_TODAYS_WORDS,
} from "../../data/japaneseData";
import {
  JapaneseProgressData,
  AnkiDeckItem,
  WordCardItem,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.JAPANESE;

export interface JapaneseDataPayload {
  progress: JapaneseProgressData;
  decks: AnkiDeckItem[];
  words: WordCardItem[];
}

/**
 * Modular JapaneseService managing Japanese study progress, Anki decks,
 * daily goals, vocabulary cards, XP/coin rewards, StorageService persistence, and EventBus emissions.
 */
export class JapaneseService {
  private progress: JapaneseProgressData = { ...MOCK_JAPANESE_PROGRESS };
  private decks: AnkiDeckItem[] = MOCK_ANKI_DECKS.map((d) => ({ ...d }));
  private words: WordCardItem[] = MOCK_TODAYS_WORDS.map((w) => ({ ...w }));

  constructor() {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<JapaneseDataPayload>(STORAGE_KEY);
      if (saved && saved.progress) {
        this.progress = saved.progress;
        this.decks = saved.decks || this.decks;
        this.words = saved.words || this.words;
      } else {
        await this.persist();
      }
    } catch (err) {
      console.error("[JapaneseService] Failed to load japanese data from StorageService:", err);
    }
  }

  private async persist(): Promise<void> {
    try {
      const payload: JapaneseDataPayload = {
        progress: this.progress,
        decks: this.decks,
        words: this.words,
      };
      await storageService.save(STORAGE_KEY, payload);
    } catch (err) {
      console.error("[JapaneseService] Failed to persist japanese data:", err);
    }
  }

  /**
   * Returns current Japanese progress data.
   */
  getProgress(): JapaneseProgressData {
    return JSON.parse(JSON.stringify(this.progress));
  }

  /**
   * Returns list of Anki study decks.
   */
  getDecks(): AnkiDeckItem[] {
    return [...this.decks];
  }

  /**
   * Returns list of today's word cards.
   */
  getWords(): WordCardItem[] {
    return [...this.words];
  }

  /**
   * Completes a study session (e.g. Anki cards or general study).
   * Awards XP + coins, updates progress, and emits 'japanese:studyCompleted'.
   *
   * @param deckId Optional target deck identifier.
   * @param cardsStudied Number of cards reviewed (defaults to 5).
   */
  completeStudySession(deckId?: string, cardsStudied: number = 5): void {
    const xpEarned = cardsStudied * 5;
    const coinsEarned = 10;

    xpService.awardXP(xpEarned, "Japanese Study Session");
    profileService.addCoins(coinsEarned);

    // Update progress state
    this.progress.currentXp += xpEarned;
    this.progress.todayJourney.vocabCurrent = Math.min(
      this.progress.todayJourney.vocabTarget,
      this.progress.todayJourney.vocabCurrent + cardsStudied
    );
    this.progress.todayJourney.reviewDue = Math.max(
      0,
      this.progress.todayJourney.reviewDue - cardsStudied
    );
    this.progress.dailyGoal.vocabLearned += cardsStudied;

    this.recalculateGoalPercent();

    notificationService.notify(
      "success",
      `🌸 Japanese Study Completed! (+${xpEarned} XP, +${coinsEarned} Coins)`,
      "Anki Cards Reviewed"
    );

    this.persist();
    eventBus.emit("japanese:studyCompleted", {
      deckId,
      cardsStudied,
      xpEarned,
    });
    eventBus.emit("japanese:updated", {
      progress: this.getProgress(),
      decks: this.getDecks(),
      words: this.getWords(),
    });
  }

  /**
   * Increments specific journey progress category (vocab, kanji, or grammar).
   *
   * @param type Category to increment.
   */
  incrementProgress(type: "vocab" | "kanji" | "grammar"): void {
    if (type === "vocab") {
      this.progress.todayJourney.vocabCurrent = Math.min(
        this.progress.todayJourney.vocabTarget,
        this.progress.todayJourney.vocabCurrent + 1
      );
      this.progress.dailyGoal.vocabLearned += 1;
    } else if (type === "kanji") {
      this.progress.todayJourney.kanjiCurrent = Math.min(
        this.progress.todayJourney.kanjiTarget,
        this.progress.todayJourney.kanjiCurrent + 1
      );
      this.progress.dailyGoal.kanjiLearned += 1;
    } else if (type === "grammar") {
      this.progress.todayJourney.grammarCurrent = Math.min(
        this.progress.todayJourney.grammarTarget,
        this.progress.todayJourney.grammarCurrent + 1
      );
      this.progress.dailyGoal.grammarLessons += 1;
    }

    xpService.awardXP(15, `Japanese ${type} lesson`);
    profileService.addCoins(5);

    this.recalculateGoalPercent();
    this.persist();
    eventBus.emit("japanese:updated", {
      progress: this.getProgress(),
      decks: this.getDecks(),
      words: this.getWords(),
    });
  }

  private recalculateGoalPercent(): void {
    const journey = this.progress.todayJourney;
    const totalCurrent = journey.vocabCurrent + journey.kanjiCurrent + journey.grammarCurrent;
    const totalTarget = journey.vocabTarget + journey.kanjiTarget + journey.grammarTarget;

    const prevPercent = this.progress.dailyGoal.percentCompleted;
    const percent = Math.min(100, Math.round((totalCurrent / totalTarget) * 100));
    this.progress.dailyGoal.percentCompleted = percent;

    if (prevPercent < 100 && percent === 100) {
      const bonusXp = 50;
      const bonusCoins = 25;
      xpService.awardXP(bonusXp, "Japanese Daily Goal 100% Complete!");
      profileService.addCoins(bonusCoins);

      notificationService.notify(
        "achievement",
        `🎉 Japanese Daily Goal Cleared! (+${bonusXp} XP, +${bonusCoins} Coins)`,
        "Daily Goal Achieved!"
      );
      eventBus.emit("japanese:goalCompleted", {
        goalPercent: 100,
        bonusCoins,
      });
    }
  }

  /**
   * Adds a new vocabulary card item.
   *
   * @param input Partial WordCardItem details.
   */
  addWord(input: Partial<WordCardItem>): WordCardItem {
    const newWord: WordCardItem = {
      id: `word-${Date.now()}`,
      kanji: input.kanji?.trim() || "新しい",
      kana: input.kana?.trim() || "あたらしい",
      romaji: input.romaji?.trim() || "atarashii",
      meaning: input.meaning?.trim() || "new",
      partOfSpeech: input.partOfSpeech || "Noun",
      pillColor: input.pillColor || "purple",
    };

    this.words = [newWord, ...this.words];
    this.persist();

    eventBus.emit("japanese:updated", {
      progress: this.getProgress(),
      decks: this.getDecks(),
      words: this.getWords(),
    });
    return newWord;
  }
}

/**
 * Global singleton instance of JapaneseService.
 */
export const japaneseServiceModule = new JapaneseService();
