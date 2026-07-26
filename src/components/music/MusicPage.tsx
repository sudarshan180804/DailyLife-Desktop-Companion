import { useState } from "react";
import {
  MOCK_NOW_PLAYING,
  MOCK_RECENTLY_PLAYED,
  MOCK_PLAYLISTS,
  MOCK_MUSIC_PLATFORMS,
  MOCK_MUSIC_STATS,
  MOOD_OPTIONS,
} from "../../data/musicData";

export function MusicPage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(MOCK_NOW_PLAYING.isPlaying);
  const [isFavorite, setIsFavorite] = useState<boolean>(MOCK_NOW_PLAYING.isFavorite);
  const [activeMood, setActiveMood] = useState<string>("mood-relax");

  const track = MOCK_NOW_PLAYING;
  const stats = MOCK_MUSIC_STATS;

  return (
    <div className="music-page-wrapper">
      {/* Top Header Section */}
      <div className="music-header-bar">
        <div className="music-header-left">
          <div className="music-title-row">
            <h1 className="music-page-title">MUSIC</h1>
            <span className="sakura-flower">🌸</span>
          </div>

          <div className="music-quote-block">
            <p className="quote-english">Find your rhythm.</p>
          </div>
        </div>

        {/* Top Right Header Stats */}
        <div className="music-header-stats-panel">
          <div className="music-stat-badge">
            <span className="badge-icon">🎵</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Music XP</span>
              <span className="badge-val highlight-purple">
                {stats.xpCurrent.toLocaleString()} <span className="sub-target">/ {stats.xpTarget.toLocaleString()}</span>
              </span>
              <div className="xp-bar-bg">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${(stats.xpCurrent / stats.xpTarget) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="music-stat-divider" />

          <div className="music-stat-badge">
            <span className="badge-icon">🔥</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Listening Streak</span>
              <span className="badge-val highlight-orange">{stats.streakDays} days</span>
            </div>
          </div>

          <div className="music-stat-divider" />

          <div className="music-stat-badge">
            <span className="badge-icon">🎧</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Songs Played</span>
              <span className="badge-val">{stats.songsPlayed.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upper Main Grid: Now Playing Player (Left) + Mood & Streaming Platforms (Right) */}
      <div className="music-upper-grid">
        {/* Left: Now Playing Player Card */}
        <div className="music-card now-playing-card">
          <div className="card-title-row">
            <span className="title-chart-icon">📊</span>
            <h2 className="card-title-text">NOW PLAYING</h2>
          </div>

          <div className="now-playing-content-split">
            {/* Album Cover */}
            <div className="album-cover-box">
              <img src={track.coverImage} alt={track.title} className="album-cover-img" />
            </div>

            {/* Track Info & Controls */}
            <div className="player-controls-block">
              <div className="track-title-row">
                <div className="title-info">
                  <h3 className="track-main-title">
                    {track.title} <span className="audio-wave">📊</span>
                  </h3>
                  <span className="track-artist-sub">{track.artist}</span>
                </div>
                <button
                  className={`heart-fav-btn ${isFavorite ? "active" : ""}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                  title="Favorite"
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
              </div>

              {/* Genre Pills */}
              <div className="genre-pills-row">
                {track.genres.map((g, idx) => (
                  <span key={idx} className="genre-pill">
                    {g}
                  </span>
                ))}
              </div>

              {/* Progress Slider */}
              <div className="player-progress-group">
                <span className="time-text">{track.currentTime}</span>
                <div className="player-progress-bg">
                  <div
                    className="player-progress-fill"
                    style={{ width: `${track.progressPercent}%` }}
                  />
                  <div
                    className="player-progress-knob"
                    style={{ left: `${track.progressPercent}%` }}
                  />
                </div>
                <span className="time-text">{track.totalTime}</span>
              </div>

              {/* Controls Bar */}
              <div className="player-buttons-row">
                <button className="control-btn shuffle" title="Shuffle">🔀</button>
                <button className="control-btn prev" title="Previous">⏮</button>
                <button
                  className="control-btn play-pause-main"
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button className="control-btn next" title="Next">⏭</button>
                <button className="control-btn repeat" title="Repeat">🔁</button>
              </div>

              {/* Action Buttons */}
              <div className="player-footer-actions">
                <button className="player-footer-btn lyrics">
                  <span>✕</span> Lyrics
                </button>
                <button className="player-footer-btn queue">
                  Add to Queue ≡
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack: Mood / Activity + Streaming Platforms */}
        <div className="upper-right-stack">
          {/* Mood / Activity Card */}
          <div className="music-card mood-card">
            <div className="card-title-row">
              <span className="title-coffee-icon">☕</span>
              <h2 className="card-title-text">MOOD / ACTIVITY</h2>
            </div>

            <div className="mood-buttons-row">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.id}
                  className={`mood-select-btn ${activeMood === mood.id ? "active" : ""}`}
                  onClick={() => setActiveMood(mood.id)}
                >
                  <span className="mood-icon">{mood.icon}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Streaming Platforms Card */}
          <div className="music-card streaming-card">
            <div className="card-title-row">
              <span className="title-headphone-icon">🎧</span>
              <h2 className="card-title-text">STREAMING PLATFORMS</h2>
            </div>

            <div className="platforms-list-small">
              {MOCK_MUSIC_PLATFORMS.map((platform) => (
                <div key={platform.id} className="music-platform-row">
                  <div className={`platform-badge color-${platform.badgeColor}`}>
                    {platform.iconSymbol}
                  </div>
                  <span className="platform-name-text">{platform.name}</span>
                  <button className="platform-open-btn">
                    <span>Open</span>
                    <span className="btn-arrow">↗</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Main Grid: Recently Played (Col 1) + Playlists (Col 2) + Quick Actions (Col 3) */}
      <div className="music-lower-grid">
        {/* Column 1: Recently Played */}
        <div className="music-card recently-played-card">
          <div className="card-title-row header-between">
            <div className="title-group-left">
              <span className="title-clock-icon">🕒</span>
              <h2 className="card-title-text">RECENTLY PLAYED</h2>
            </div>
            <span className="view-all-link">View All</span>
          </div>

          <div className="rp-list">
            {MOCK_RECENTLY_PLAYED.map((item) => (
              <div key={item.id} className="rp-item-row">
                <div className="rp-thumb-box">
                  <img src={item.coverImage} alt={item.title} className="rp-thumb-img" />
                </div>
                <div className="rp-info-block">
                  <span className="rp-title">{item.title}</span>
                  <span className="rp-sub">{item.subtitle}</span>
                </div>
                <span className="rp-duration">{item.duration}</span>
                <span className="rp-dots">⋮</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Your Playlists */}
        <div className="music-card playlists-card">
          <div className="card-title-row header-between">
            <div className="title-group-left">
              <span className="title-music-icon">🎵</span>
              <h2 className="card-title-text">YOUR PLAYLISTS</h2>
            </div>
            <span className="view-all-link">View All</span>
          </div>

          <div className="playlists-list">
            {MOCK_PLAYLISTS.map((playlist) => (
              <div key={playlist.id} className="playlist-item-row">
                <div className="playlist-thumb-box">
                  <img
                    src={playlist.coverImage}
                    alt={playlist.title}
                    className="playlist-thumb-img"
                  />
                </div>
                <div className="playlist-info-block">
                  <span className="playlist-title">{playlist.title}</span>
                  <span className="playlist-sub">{playlist.songCount} songs</span>
                </div>
                <span className="playlist-arrow">&gt;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Quick Actions */}
        <div className="music-card quick-actions-card">
          <div className="card-title-row">
            <span className="title-bolt-icon">⚡</span>
            <h2 className="card-title-text">QUICK ACTIONS</h2>
          </div>

          <div className="quick-actions-2x2">
            <div className="music-action-tile">
              <span className="action-icon">☁️</span>
              <div className="action-text-block">
                <span className="action-title">Upload Music</span>
                <span className="action-sub">Add your own tracks</span>
              </div>
            </div>

            <div className="music-action-tile">
              <span className="action-icon">📑</span>
              <div className="action-text-block">
                <span className="action-title">Import Playlist</span>
                <span className="action-sub">From other platforms</span>
              </div>
            </div>

            <div className="music-action-tile">
              <span className="action-icon">🎚️</span>
              <div className="action-text-block">
                <span className="action-title">Equalizer</span>
                <span className="action-sub">Customize sound</span>
              </div>
            </div>

            <div className="music-action-tile">
              <span className="action-icon">🌙</span>
              <div className="action-text-block">
                <span className="action-title">Sleep Timer</span>
                <span className="action-sub">Set a timer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Ribbon */}
      <div className="music-footer-ribbon">
        <span className="ribbon-flower">🎵</span>
        <span className="footer-kanji">音楽は、心の旅を優しく照らす。</span>
        <span className="footer-english">Music gently lights the journey of the heart.</span>
        <span className="ribbon-flower">🌸</span>
      </div>
    </div>
  );
}
