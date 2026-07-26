import {
  MOCK_CONTINUE_WATCHING,
  MOCK_CURRENTLY_WATCHING,
  MOCK_QUEUE_ITEMS,
  MOCK_STREAMING_PLATFORMS,
  MOCK_ANIME_STATS,
} from "../../data/animeData";

export function AnimePage() {
  const stats = MOCK_ANIME_STATS;
  const continueItem = MOCK_CONTINUE_WATCHING;

  return (
    <div className="anime-page-wrapper">
      {/* Top Header Section */}
      <div className="anime-header-bar">
        <div className="anime-header-left">
          <div className="anime-title-row">
            <h1 className="anime-page-title">ANIME</h1>
            <span className="sakura-flower">🌸</span>
          </div>

          <div className="anime-quote-block">
            <p className="quote-english">Another world is only one episode away.</p>
            <p className="quote-japanese">次のエピソードが、また新しい世界へ。</p>
          </div>
        </div>

        {/* Top Right Header Stats */}
        <div className="anime-header-stats-panel">
          <div className="anime-stat-badge">
            <span className="badge-icon">⭐</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Anime XP</span>
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

          <div className="anime-stat-divider" />

          <div className="anime-stat-badge">
            <span className="badge-icon">🔥</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Streak</span>
              <span className="badge-val highlight-orange">{stats.streakDays} days</span>
            </div>
          </div>

          <div className="anime-stat-divider" />

          <div className="anime-stat-badge">
            <span className="badge-icon">🎬</span>
            <div className="badge-text-group">
              <span className="badge-lbl">Episodes Watched</span>
              <span className="badge-val">{stats.episodesWatched}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upper Main Grid: Continue Watching Banner (Left) + Your Stats (Right) */}
      <div className="anime-upper-grid">
        {/* Left: Continue Watching Hero Card */}
        <div className="anime-card continue-watching-card">
          <div className="card-title-row">
            <span className="title-play-icon">▷</span>
            <h2 className="card-title-text">CONTINUE WATCHING</h2>
          </div>

          <div className="continue-hero-banner">
            <img
              src={continueItem.coverImage}
              alt={continueItem.title}
              className="continue-cover-img"
            />
            <div className="continue-gradient-overlay" />

            <div className="continue-content-block">
              <div className="anime-logo-title-row">
                <h3 className="hero-anime-title">{continueItem.title}</h3>
                <span className="fairytail-emblem">🔥</span>
              </div>

              <span className="episode-number-label">
                Episode {continueItem.episodeNumber}
              </span>
              <span className="episode-name-sub">{continueItem.episodeTitle}</span>

              {/* Progress Bar */}
              <div className="video-progress-group">
                <div className="video-progress-bg">
                  <div
                    className="video-progress-fill"
                    style={{ width: `${continueItem.progressPercent}%` }}
                  />
                </div>
                <span className="video-time-text">
                  {continueItem.currentTime} / {continueItem.totalTime}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="continue-actions-row">
                <button className="continue-play-btn">
                  <span>▶</span>
                  <span>Continue</span>
                </button>
                <button className="continue-details-btn">
                  <span>ⓘ</span>
                  <span>Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Your Stats & Quote Card */}
        <div className="anime-card your-stats-card">
          <div className="card-title-row">
            <span className="title-crown-icon">👑</span>
            <h2 className="card-title-text">YOUR STATS</h2>
          </div>

          {/* 2x2 Stats Grid */}
          <div className="stats-2x2-grid">
            <div className="stat-tile">
              <span className="tile-icon purple-glow">▷</span>
              <div className="tile-info">
                <span className="tile-num">{stats.episodesWatched}</span>
                <span className="tile-lbl">Episodes Watched</span>
              </div>
            </div>

            <div className="stat-tile">
              <span className="tile-icon pink-glow">⭐</span>
              <div className="tile-info">
                <span className="tile-num">{stats.seriesCompleted}</span>
                <span className="tile-lbl">Series Completed</span>
              </div>
            </div>

            <div className="stat-tile">
              <span className="tile-icon blue-glow">📅</span>
              <div className="tile-info">
                <span className="tile-num">{stats.streakDays}</span>
                <span className="tile-lbl">Day Streak</span>
              </div>
            </div>

            <div className="stat-tile">
              <span className="tile-icon green-glow">⏳</span>
              <div className="tile-info">
                <span className="tile-num">{stats.hoursWatched}</span>
                <span className="tile-lbl">Hours Watched</span>
              </div>
            </div>
          </div>

          {/* Motivational Quote Card */}
          <div className="anime-quote-box">
            <p className="box-quote-kanji">夢を信じて、進み続けろ。</p>
            <p className="box-quote-english">
              Believe in your dreams and keep moving forward.
            </p>
          </div>
        </div>
      </div>

      {/* Lower Main Grid: Currently Watching (Col 1) + Queue (Col 2) + Watch On / Streaming & Quick Actions (Col 3) */}
      <div className="anime-lower-grid">
        {/* Column 1: Currently Watching (3) */}
        <div className="anime-card currently-watching-card">
          <div className="card-title-row header-between">
            <div className="title-group-left">
              <span className="title-tv-icon">📺</span>
              <h2 className="card-title-text">CURRENTLY WATCHING ({MOCK_CURRENTLY_WATCHING.length})</h2>
            </div>
            <span className="view-all-link">View All</span>
          </div>

          <div className="cw-list">
            {MOCK_CURRENTLY_WATCHING.map((item) => (
              <div key={item.id} className="cw-item-row">
                <div className="cw-thumb-box">
                  <img src={item.thumbnailUrl} alt={item.title} className="cw-thumb-img" />
                </div>
                <div className="cw-info-block">
                  <div className="cw-title-line">
                    <span className="cw-title">{item.title}</span>
                    <span className="cw-options-dots">⋮</span>
                  </div>
                  <span className="cw-ep-text">{item.episodeText}</span>
                  <div className="cw-progress-bg">
                    <div
                      className="cw-progress-fill"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>
                <span className="cw-percent-badge">{item.progressPercent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Watch Next / Queue (5) */}
        <div className="anime-card queue-card">
          <div className="card-title-row header-between">
            <div className="title-group-left">
              <span className="title-film-icon">🎬</span>
              <h2 className="card-title-text">WATCH NEXT / QUEUE ({MOCK_QUEUE_ITEMS.length})</h2>
            </div>
            <span className="view-all-link">View All</span>
          </div>

          <div className="queue-list">
            {MOCK_QUEUE_ITEMS.map((item) => (
              <div key={item.id} className="queue-item-row">
                <span className="queue-order-num">{item.order}</span>
                <div className="queue-thumb-box">
                  <img src={item.thumbnailUrl} alt={item.title} className="queue-thumb-img" />
                </div>
                <div className="queue-info-block">
                  <span className="queue-title">{item.title}</span>
                  <span className="queue-sub">{item.seasonEpText}</span>
                </div>
                <span className="queue-menu-icon">≡</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Stack (Watch On / Streaming + Quick Actions) */}
        <div className="col3-stack">
          {/* Watch On / Streaming */}
          <div className="anime-card streaming-card">
            <div className="card-title-row header-between">
              <div className="title-group-left">
                <span className="title-tv-icon">📺</span>
                <h2 className="card-title-text">WATCH ON / STREAMING</h2>
              </div>
            </div>

            <div className="streaming-list-small">
              {MOCK_STREAMING_PLATFORMS.map((platform) => (
                <div key={platform.id} className="streaming-row-item">
                  <div className={`streaming-badge color-${platform.badgeColor}`}>
                    {platform.iconSymbol}
                  </div>
                  <div className="platform-info-block">
                    <span className="platform-name">{platform.name}</span>
                    <span className="platform-sub">{platform.subtitle}</span>
                  </div>
                  <button className="platform-open-btn">
                    <span>Open</span>
                    <span className="btn-arrow">&gt;</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="anime-card quick-actions-card">
            <div className="card-title-row">
              <span className="title-bolt-icon">⚡</span>
              <h2 className="card-title-text">QUICK ACTIONS</h2>
            </div>

            <div className="quick-actions-2x2">
              <div className="action-tile">
                <span className="action-icon">📁</span>
                <span className="action-label">Browse Library</span>
              </div>

              <div className="action-tile">
                <span className="action-icon">📅</span>
                <span className="action-label">Watch Calendar</span>
              </div>

              <div className="action-tile">
                <span className="action-icon">⭐</span>
                <span className="action-label">Recommendations</span>
              </div>

              <div className="action-tile">
                <span className="action-icon">➕</span>
                <span className="action-label">Add Anime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Ribbon */}
      <div className="anime-footer-ribbon">
        <span className="ribbon-flower">🌸</span>
        <span className="footer-kanji">楽しんだ時間は、決して無駄にはならない。</span>
        <span className="footer-english">Time spent enjoying anime is never wasted.</span>
        <span className="ribbon-flower">🌸</span>
      </div>
    </div>
  );
}
