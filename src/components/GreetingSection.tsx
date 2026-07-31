import { useState } from "react";
import { getRandomQuote } from "../utils/quoteService";
import { useProfileStore } from "../stores/profileStore";

export function getGreetingTimeText(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "Good Morning,";
  }
  if (hours >= 12 && hours < 17) {
    return "Good Afternoon,";
  }
  if (hours >= 17 && hours < 21) {
    return "Good Evening,";
  }
  return "Good Night,";
}

export function GreetingSection() {
  const { profile } = useProfileStore();
  const [quote] = useState(() => getRandomQuote());
  const greeting = getGreetingTimeText();

  const xpPercent = Math.min(100, Math.max(0, (profile.currentXP / 100) * 100));

  return (
    <div className="greeting-container">
      <div className="greeting-text-group">
        <h1 className="greeting-salutation">{greeting}</h1>
        <h2 className="greeting-username">{profile.name}!</h2>
      </div>

      {/* Live Profile Quick Stats Row */}
      <div className="greeting-profile-stats-row">
        <div className="profile-stat-badge level-badge">
          <span className="stat-label">Level</span>
          <span className="stat-value">{profile.level}</span>
        </div>
        <div className="profile-stat-badge xp-badge">
          <span className="stat-label">XP</span>
          <span className="stat-value">{profile.currentXP} / 100</span>
          <div className="greeting-xp-bar-bg">
            <div className="greeting-xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
        <div className="profile-stat-badge coins-badge">
          <span className="stat-label">Coins</span>
          <span className="stat-value">🪙 {profile.coins}</span>
        </div>
        <div className="profile-stat-badge tasks-badge">
          <span className="stat-label">Tasks Done</span>
          <span className="stat-value">✓ {profile.stats.tasksCompleted}</span>
        </div>
      </div>

      <div className="greeting-quote-block">
        <span className="quote-mark">“</span>
        <p className="quote-text">{quote.text}</p>
        <span className="quote-mark">”</span>
      </div>
    </div>
  );
}
