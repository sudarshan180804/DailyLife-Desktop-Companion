import { useEntertainmentStore } from "../../../modules/entertainment";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function EntertainmentWidget({ onNavigateToModule }: WidgetProps) {
  const { titles, updateTitle } = useEntertainmentStore();

  const watchingTitles = titles.filter((t) => t.status === "Watching").slice(0, 2);

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">🍿</span>
          <h3 className="widget-title-text">Continue Watching & Streaming</h3>
          <span className="widget-count-badge">
            {titles.filter((t) => t.status === "Watching").length} Watching
          </span>
        </div>

        <button
          className="widget-nav-link"
          onClick={() => onNavigateToModule && onNavigateToModule("anime")}
        >
          Open Entertainment Hub →
        </button>
      </div>

      <div className="widget-media-grid">
        {watchingTitles.length > 0 ? (
          watchingTitles.map((t) => (
            <div key={t.id} className="widget-media-card">
              <div className="media-card-main">
                <span className="media-icon">{t.icon || "🎬"}</span>
                <div className="media-info">
                  <span className="media-title">{t.title}</span>
                  <span className="media-ep">
                    Episode {t.currentEpisode} / {t.totalEpisodes || "∞"}
                  </span>
                </div>
              </div>

              <button
                className="ep-inc-btn"
                onClick={() => updateTitle(t.id, { currentEpisode: t.currentEpisode + 1 })}
                title="Increment Episode"
              >
                +1 Ep
              </button>
            </div>
          ))
        ) : (
          <div className="widget-empty-msg">
            <span>🎬 No active titles currently in "Watching".</span>
          </div>
        )}
      </div>
    </div>
  );
}
