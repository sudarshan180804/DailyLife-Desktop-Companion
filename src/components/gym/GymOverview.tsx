import { useGymStore } from "../../modules/gym";
import { useProfileStore } from "../../stores/profileStore";
import { StarIcon, FlameIcon } from "../Icons";

interface GymOverviewProps {
  onViewFullWorkout: () => void;
}

export function GymOverview({ onViewFullWorkout }: GymOverviewProps) {
  const { exercises, bodyStats, summary, schedule, toggleExercise } =
    useGymStore();
  const { profile } = useProfileStore();

  const completedExercisesCount = exercises.filter((e) => e.completed).length;
  const totalExercisesCount = exercises.length;

  return (
    <div className="gym-overview-container">
      {/* Page Header */}
      <div className="gym-header-bar">
        <div className="gym-header-left">
          <div className="gym-title-row">
            <div className="gym-crest-badge">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
              >
                <path d="M6.5 6.5l11 11M21 21l-1 1M3 3l1 1M18 4l2 2M4 18l2 2M15 3l4.5 4.5M6.5 14.5L11 19M4.5 6.5L9 11" />
              </svg>
            </div>
            <div>
              <h1 className="gym-page-title">Gym</h1>
              <p className="gym-quote-text">
                Train your body. Strengthen your will.
              </p>
            </div>
          </div>
        </div>

        <div className="gym-header-right" style={{ display: "flex", gap: "8px" }}>
          <button
            className="new-task-action-btn btn-secondary-note"
            onClick={async () => {
              const notesStore = (await import("../../modules/notes")).notesStore;
              await notesStore.createNote({
                templateId: "template-gym",
                notebookId: "nb-personal",
                collections: ["Gym"],
                tags: ["#GymLog"],
              });
            }}
            title="Log Workout Note"
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 800,
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <span>🏋️ + Workout Note</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout (2 Columns) */}
      <div className="gym-overview-grid">
        {/* Left Column: Today's Training Card */}
        <div className="gym-card today-training-card">
          <div className="card-top-row">
            <div className="training-title-block">
              <div className="shield-icon-small">🛡️</div>
              <div>
                <h2 className="training-routine-title">PUSH DAY</h2>
                <span className="training-focus-subtitle">
                  Focus: Chest, Shoulders, Triceps
                </span>
              </div>
            </div>
            <div className="training-progress-block">
              <span className="progress-fraction-text">
                Progress{" "}
                <strong className="gold-num">
                  {completedExercisesCount} / {totalExercisesCount}
                </strong>
              </span>
              <div className="routine-progress-bar-bg">
                <div
                  className="routine-progress-bar-fill"
                  style={{
                    width:
                      totalExercisesCount > 0
                        ? `${Math.round(
                            (completedExercisesCount / totalExercisesCount) *
                              100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="overview-exercise-list">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className={`exercise-overview-row ${
                  ex.completed ? "completed" : ""
                }`}
                onClick={() => toggleExercise(ex.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="ex-icon-box">🏋️</div>
                <div className="ex-main-info">
                  <span className="ex-name">{ex.name}</span>
                  <span className="ex-sets-reps">
                    {ex.sets} × {ex.reps.split(" ")[0]} &nbsp;•&nbsp;{" "}
                    <span className="ex-weight">
                      {ex.weight || "Bodyweight"}
                    </span>
                  </span>
                </div>

                <div className="ex-reward-block">
                  <span className="ex-xp-badge">+{ex.xpReward} XP</span>
                  <div
                    className={`ex-check-circle ${
                      ex.completed ? "checked" : ""
                    }`}
                  >
                    {ex.completed ? "✓" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View Full Workout Action Button */}
          <div className="card-footer-action">
            <button
              className="view-full-workout-btn"
              onClick={onViewFullWorkout}
            >
              <span>View Full Workout</span>
              <span className="btn-arrow">&gt;</span>
            </button>
          </div>
        </div>

        {/* Right Column: Weekly Progress & Body Stats */}
        <div className="gym-right-col">
          {/* Weekly Progress Card */}
          <div className="gym-card weekly-progress-card">
            <div className="card-header">
              <span className="card-header-icon">📅</span>
              <h3 className="card-header-title">Weekly Progress</h3>
            </div>

            <div className="weekly-schedule-row">
              {schedule.map((item, idx) => (
                <div key={idx} className={`day-node status-${item.status}`}>
                  <span className="day-name">{item.day}</span>
                  <div className="day-badge-circle">
                    {item.status === "completed" && "✓"}
                    {item.status === "rest" && "🌙"}
                    {item.status === "today" && "🎯"}
                  </div>
                  {item.status === "today" && (
                    <span className="today-label">Today</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body Stats & Warrior Rank Card */}
          <div className="gym-card body-stats-card">
            <div className="body-stats-split">
              {/* Left side: Stats bars */}
              <div className="stats-bars-section">
                <div className="card-header">
                  <span className="card-header-icon">🛡️</span>
                  <h3 className="card-header-title">Body Stats</h3>
                </div>

                <div className="stat-bars-list">
                  {bodyStats.map((stat, idx) => (
                    <div key={idx} className="stat-bar-item">
                      <div className="stat-label-row">
                        <span className="stat-name">{stat.name}</span>
                        <span className="stat-level">Lv. {stat.level}</span>
                      </div>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${stat.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side: Warrior Rank Seal */}
              <div className="warrior-rank-section">
                <div className="lion-rank-seal">
                  <div className="lion-emblem">🦁</div>
                </div>
                <span className="rank-title-label">Warrior Rank</span>
                <h4 className="rank-name">{summary.warriorRank}</h4>
                <div className="rank-xp-bar-bg">
                  <div
                    className="rank-xp-bar-fill"
                    style={{
                      width: `${
                        (summary.warriorRankXp / summary.warriorRankMaxXp) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="rank-xp-text">
                  {summary.warriorRankXp} / {summary.warriorRankMaxXp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Summary Cards (3 Cards) */}
      <div className="gym-summary-row">
        <div className="summary-card-parchment">
          <div className="summary-icon-box flame-glow">
            <FlameIcon size={26} />
          </div>
          <div className="summary-info">
            <span className="summary-title">Current Streak</span>
            <span className="summary-val highlight-orange">
              {profile.stats.streakDays || summary.streakDays} Days
            </span>
            <span className="summary-sub">Keep it up!</span>
          </div>
        </div>

        <div className="summary-card-parchment">
          <div className="summary-icon-box swords-glow">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
            >
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l2 2 4-4-2-2" />
              <path d="M9.5 17.5L21 6V3h-3L6.5 14.5M11 19l-2 2-4-4 2-2" />
            </svg>
          </div>
          <div className="summary-info">
            <span className="summary-title">This Week</span>
            <span className="summary-val">
              {summary.weeklyWorkoutsCount} Workouts
            </span>
            <span className="summary-sub">On fire!</span>
          </div>
        </div>

        <div className="summary-card-parchment">
          <div className="summary-icon-box star-glow">
            <StarIcon size={26} />
          </div>
          <div className="summary-info">
            <span className="summary-title">Total XP Earned</span>
            <span className="summary-val highlight-gold">
              {(profile?.totalXP ?? 0).toLocaleString()} XP
            </span>
            <span className="summary-sub">Keep pushing forward.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
