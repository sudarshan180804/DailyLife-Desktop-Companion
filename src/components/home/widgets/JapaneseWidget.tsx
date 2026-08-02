import { useJapaneseStore } from "../../../modules/japanese";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function JapaneseWidget({ onNavigateToModule }: WidgetProps) {
  const { progress, words } = useJapaneseStore();

  const currentWord = words[0] || {
    kanji: "努力",
    kana: "どりょく",
    meaning: "Effort, hard work",
  };

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">🌸</span>
          <h3 className="widget-title-text">Japanese Word of the Day</h3>
          <span className="widget-count-badge">JLPT {progress.jlptLevel}</span>
        </div>

        <button
          className="widget-nav-link"
          onClick={() => onNavigateToModule && onNavigateToModule("japanese")}
        >
          Practice Japanese →
        </button>
      </div>

      <div className="widget-jp-card">
        <div className="jp-word-row">
          <span className="jp-kanji-big">{currentWord.kanji}</span>
          <span className="jp-reading-sub">[{currentWord.kana}]</span>
        </div>
        <p className="jp-meaning-txt">{currentWord.meaning}</p>
        <span className="jp-streak-lbl">🔥 {progress.streakDays || 12} Day Study Streak</span>
      </div>
    </div>
  );
}
