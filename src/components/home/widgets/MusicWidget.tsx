import { useMusicStore } from "../../../modules/music";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function MusicWidget({ onNavigateToModule }: WidgetProps) {
  const { playlists, preferredService, launchPlaylist } = useMusicStore();

  const favoritePlaylists = playlists.filter((p) => p.isFavorite).slice(0, 3);
  const serviceName = preferredService === "ytmusic" ? "YouTube Music" : "Spotify";

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">🎵</span>
          <h3 className="widget-title-text">Music & Sound Hub</h3>
          <span className="widget-count-badge">
            {serviceName} Active
          </span>
        </div>

        <button
          className="widget-nav-link"
          onClick={() => onNavigateToModule && onNavigateToModule("music")}
        >
          Open Music Launcher →
        </button>
      </div>

      <div className="widget-music-row">
        {favoritePlaylists.length > 0 ? (
          favoritePlaylists.map((pl) => (
            <div
              key={pl.id}
              className="music-chip-btn"
              onClick={() => launchPlaylist(pl.id)}
            >
              <span className="chip-icon">{pl.icon || "🎧"}</span>
              <span className="chip-name">{pl.title}</span>
              <span className="chip-launch">↗</span>
            </div>
          ))
        ) : (
          <div className="widget-empty-msg">
            <span>🎧 Launch playlists from Spotify or YouTube Music.</span>
          </div>
        )}
      </div>
    </div>
  );
}
