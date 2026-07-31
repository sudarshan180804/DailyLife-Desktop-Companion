import { useState } from "react";
import { useJapaneseStore } from "../../modules/japanese";
import { useProfileStore } from "../../stores/profileStore";

export function JapanesePage() {
  const { progress, decks, words, completeStudySession } = useJapaneseStore();
  const { profile } = useProfileStore();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handlePlayAudio = (id: string) => {
    setPlayingAudioId(id);
    setTimeout(() => setPlayingAudioId(null), 800);
  };

  const handleDeckClick = (deckId: string) => {
    completeStudySession(deckId, 5);
  };

  return (
    <div className="japanese-page-wrapper">
      {/* Top Header Section */}
      <div className="jp-header-bar">
        <div className="jp-header-left">
          <div className="jp-title-row">
            <h1 className="jp-page-title">JAPANESE</h1>
            <span className="sakura-flower">🌸</span>
          </div>

          <div className="jp-jlpt-tag">
            <span className="sparkle">✨</span>
            <span className="jlpt-text">{progress.jlptLevel}</span>
            <span className="sparkle">✨</span>
          </div>

          <div className="jp-proverb-block">
            <span className="proverb-kanji">{progress.proverbKanji}</span>
            <span className="proverb-romaji">{progress.proverbRomaji}</span>
            <span className="proverb-english">{progress.proverbEnglish}</span>
          </div>
        </div>

        {/* Top Right Stats Row & Note Trigger */}
        <div className="jp-header-stats-panel">
          <button
            className="new-task-action-btn btn-secondary-note"
            onClick={async () => {
              const notesStore = (await import("../../modules/notes")).notesStore;
              await notesStore.createNote({
                templateId: "template-japanese",
                notebookId: "nb-study",
                collections: ["Japanese"],
                tags: ["#JapaneseStudy"],
              });
            }}
            title="Create Japanese Study Note"
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 800,
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <span>⛩️ + Study Note</span>
          </button>
          <div className="jp-stat-badge">
            <span className="badge-icon">🌸</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Level</span>
              <span className="badge-val">{profile.level || progress.level}</span>
            </div>
          </div>

          <div className="jp-stat-divider" />

          <div className="jp-stat-badge">
            <span className="badge-icon">🔥</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Streak</span>
              <span className="badge-val highlight-orange">
                {profile.stats.streakDays || progress.streakDays} days
              </span>
            </div>
          </div>

          <div className="jp-stat-divider" />

          <div className="jp-stat-badge">
            <span className="badge-icon xp-sparkle">🔮</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Japanese XP</span>
              <span className="badge-val highlight-purple">
                {profile.currentXP || progress.currentXp}{" "}
                <span className="sub-target">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="jp-main-grid">
        {/* Column 1: Today's Journey */}
        <div className="jp-card today-journey-card">
          <div className="card-title-row">
            <span className="title-sakura">🌸</span>
            <h2 className="card-title-text">TODAY'S JOURNEY</h2>
          </div>

          <div className="journey-progress-list">
            {/* Vocabulary */}
            <div className="journey-progress-item">
              <div className="journey-label-row">
                <span className="item-title">
                  <span className="item-icon">📘</span> Vocabulary
                </span>
                <span className="item-val">
                  {progress.todayJourney.vocabCurrent} /{" "}
                  {progress.todayJourney.vocabTarget}
                </span>
              </div>
              <div className="jp-progress-bg">
                <div
                  className="jp-progress-fill fill-purple"
                  style={{
                    width: `${
                      (progress.todayJourney.vocabCurrent /
                        progress.todayJourney.vocabTarget) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Kanji */}
            <div className="journey-progress-item">
              <div className="journey-label-row">
                <span className="item-title">
                  <span className="item-kanji-icon">漢</span> Kanji
                </span>
                <span className="item-val">
                  {progress.todayJourney.kanjiCurrent} /{" "}
                  {progress.todayJourney.kanjiTarget}
                </span>
              </div>
              <div className="jp-progress-bg">
                <div
                  className="jp-progress-fill fill-pink"
                  style={{
                    width: `${
                      (progress.todayJourney.kanjiCurrent /
                        progress.todayJourney.kanjiTarget) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Grammar */}
            <div className="journey-progress-item">
              <div className="journey-label-row">
                <span className="item-title">
                  <span className="item-icon">⛩️</span> Grammar
                </span>
                <span className="item-val">
                  {progress.todayJourney.grammarCurrent} /{" "}
                  {progress.todayJourney.grammarTarget}
                </span>
              </div>
              <div className="jp-progress-bg">
                <div
                  className="jp-progress-fill fill-green"
                  style={{
                    width: `${
                      (progress.todayJourney.grammarCurrent /
                        progress.todayJourney.grammarTarget) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Review */}
            <div className="journey-progress-item">
              <div className="journey-label-row">
                <span className="item-title">
                  <span className="item-icon">🔄</span> Review
                </span>
                <span className="item-val">
                  {progress.todayJourney.reviewDue} cards
                </span>
              </div>
              <div className="jp-progress-bg">
                <div
                  className="jp-progress-fill fill-blue"
                  style={{ width: "85%" }}
                />
              </div>
            </div>
          </div>

          <button
            className="continue-learning-btn"
            onClick={() => completeStudySession(undefined, 5)}
          >
            <span>Continue Learning</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Column 2: Daily Goal */}
        <div className="jp-card daily-goal-card">
          <div className="card-title-row">
            <span className="title-target-icon">🎯</span>
            <h2 className="card-title-text">DAILY GOAL</h2>
          </div>

          {/* Segmented Progress Bar */}
          <div className="goal-segmented-bar-row">
            <div className="segmented-bar">
              {Array.from({ length: 15 }).map((_, idx) => {
                const isActive =
                  idx <
                  Math.round(
                    (progress.dailyGoal.percentCompleted / 100) * 15
                  );
                return (
                  <div
                    key={idx}
                    className={`bar-segment ${isActive ? "active" : ""}`}
                  />
                );
              })}
            </div>
            <span className="goal-percent-text">
              {progress.dailyGoal.percentCompleted}%
            </span>
          </div>

          {/* 2x2 Metric Grid */}
          <div className="goal-metrics-2x2">
            <div className="metric-box">
              <span className="box-tag">VOCABULARY</span>
              <div className="box-val-row">
                <span className="box-icon">📘</span>
                <span className="box-num">
                  {progress.dailyGoal.vocabLearned}
                </span>
              </div>
              <span className="box-sub">learned</span>
            </div>

            <div className="metric-box">
              <span className="box-tag">KANJI</span>
              <div className="box-val-row">
                <span className="box-kanji-icon">漢</span>
                <span className="box-num">
                  {progress.dailyGoal.kanjiLearned}
                </span>
              </div>
              <span className="box-sub">learned</span>
            </div>

            <div className="metric-box">
              <span className="box-tag">GRAMMAR</span>
              <div className="box-val-row">
                <span className="box-icon">⛩️</span>
                <span className="box-num">
                  {progress.dailyGoal.grammarLessons}
                </span>
              </div>
              <span className="box-sub">lessons</span>
            </div>

            <div className="metric-box">
              <span className="box-tag">REVIEW</span>
              <div className="box-val-row">
                <span className="box-icon">🔄</span>
                <span className="box-num">
                  {progress.dailyGoal.reviewDueToday}
                </span>
              </div>
              <span className="box-sub">due today</span>
            </div>
          </div>
        </div>

        {/* Column 3: Study Decks (Anki) */}
        <div className="jp-card study-decks-card">
          <div className="card-title-row">
            <span className="title-book-icon">📙</span>
            <h2 className="card-title-text">STUDY DECKS (ANKI)</h2>
          </div>

          <div className="decks-scroll-list">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="deck-item-row"
                onClick={() => handleDeckClick(deck.id)}
                style={{ cursor: "pointer" }}
              >
                <div className={`deck-badge color-${deck.badgeColor}`}>
                  {deck.iconSymbol}
                </div>
                <div className="deck-info-block">
                  <span className="deck-title">{deck.title}</span>
                  <span className="deck-sub">{deck.subtitle}</span>
                </div>
                <div className="deck-count-arrow">
                  <span className="deck-count-val">{deck.cardCount}</span>
                  <span className="deck-arrow">&gt;</span>
                </div>
              </div>
            ))}

            {/* Custom Study Row */}
            <div className="deck-item-row custom-study-row">
              <div className="deck-badge color-custom">🪙</div>
              <div className="deck-info-block">
                <span className="deck-title">Custom Study</span>
                <span className="deck-sub">Create your own deck</span>
              </div>
              <button className="create-deck-plus-btn">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Words */}
      <div className="jp-card todays-words-card">
        <div className="card-title-row header-between">
          <div className="title-group-left">
            <span className="title-sakura">🌸</span>
            <h2 className="card-title-text">TODAY'S WORDS</h2>
          </div>
          <span className="view-all-link">View All</span>
        </div>

        <div className="words-grid">
          {words.map((word) => (
            <div key={word.id} className="word-card-item">
              <div className="word-kanji-row">
                <span className="word-kanji">{word.kanji}</span>
                <button
                  className={`audio-btn ${
                    playingAudioId === word.id ? "playing" : ""
                  }`}
                  onClick={() => handlePlayAudio(word.id)}
                  title="Listen pronunciation"
                >
                  🔊
                </button>
              </div>

              <span className="word-kana">{word.kana}</span>
              <span className="word-romaji">{word.romaji}</span>
              <span className="word-meaning">{word.meaning}</span>

              <div className={`pos-pill pos-${word.pillColor}`}>
                {word.partOfSpeech}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Proverb Ribbon */}
        <div className="jp-footer-proverb-ribbon">
          <span className="ribbon-flower">🌸</span>
          <span className="footer-kanji">一日一歩、夢に近づく。</span>
          <span className="footer-english">
            One step every day brings you closer to your dream.
          </span>
          <span className="ribbon-flower">🌸</span>
        </div>
      </div>
    </div>
  );
}
