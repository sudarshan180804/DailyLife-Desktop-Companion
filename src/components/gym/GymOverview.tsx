import { useState } from "react";
import { useGymStore } from "../../modules/gym";
import { useProfileStore } from "../../stores/profileStore";
import { StarIcon, FlameIcon } from "../Icons";
import { WorkoutDay } from "../../modules/gym/types";

interface GymOverviewProps {
  onViewFullWorkout: (dayId?: string) => void;
  onOpenCreateDay: () => void;
  onStartSession: (dayId: string) => void;
}

export function GymOverview({
  onViewFullWorkout,
  onOpenCreateDay,
  onStartSession,
}: GymOverviewProps) {
  const {
    workoutDays,
    bodyStats,
    summary,
    schedule,
    history,
    activeSession,
    clearHistory,
  } = useGymStore();
  const { profile } = useProfileStore();

  const [selectedDayId, setSelectedDayId] = useState<string>(
    workoutDays[0]?.id || ""
  );

  const activeDay: WorkoutDay | undefined =
    workoutDays.find((d) => d.id === selectedDayId) || workoutDays[0];

  const exercises = activeDay?.exercises || [];
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

        <div className="gym-header-right" style={{ display: "flex", gap: "10px" }}>
          {activeSession && (
            <button
              className="btn-resume-session"
              onClick={() => onStartSession(activeSession.workoutDayId)}
            >
              🔥 Resume Active Workout
            </button>
          )}

          <button
            className="btn-create-day"
            onClick={onOpenCreateDay}
            title="Create Custom Workout Day"
          >
            ➕ New Workout Day
          </button>

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
          >
            <span>🏋️ + Workout Note</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      {workoutDays.length === 0 ? (
        /* Clean Empty State UI when user has zero workout days */
        <div className="gym-empty-state-card">
          <div className="empty-state-shield">🛡️</div>
          <h2>Your Gym Schedule is Empty</h2>
          <p>
            Configure your custom workout days (e.g., Push Day, Back + Biceps, Rest Day)
            and set up your personal training timeline!
          </p>
          <button className="btn-create-day-lg" onClick={onOpenCreateDay}>
            ➕ Create Your First Workout Day
          </button>
        </div>
      ) : (
        <div className="gym-overview-grid">
          {/* Left Column: Today's / Selected Day Training Card */}
          <div className="gym-card today-training-card">
            <div className="card-top-row">
              <div className="training-title-block">
                <div className="shield-icon-small">
                  {activeDay?.icon || "🛡️"}
                </div>
                <div>
                  <h2 className="training-routine-title">
                    {activeDay?.title.toUpperCase()}
                  </h2>
                  <span className="training-focus-subtitle">
                    {activeDay?.isRestDay
                      ? "Rest & Recovery Day"
                      : activeDay?.description || `${activeDay?.dayOfWeek} Workout Routine`}
                  </span>
                </div>
              </div>

              {!activeDay?.isRestDay && (
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
                                (completedExercisesCount / totalExercisesCount) * 100
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Day Selector Pills */}
            <div className="day-selector-pills">
              {workoutDays.map((day) => (
                <button
                  key={day.id}
                  className={`day-pill-btn ${
                    activeDay?.id === day.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedDayId(day.id)}
                >
                  <span>{day.icon || "🏋️"}</span>
                  <span>{day.title}</span>
                  <span className="pill-day-name">({day.dayOfWeek.slice(0, 3)})</span>
                </button>
              ))}
            </div>

            {/* Exercise List in Selected Day */}
            {activeDay?.isRestDay ? (
              <div className="rest-day-card-body">
                <div className="rest-icon-lg">🌙</div>
                <h3>Rest & Muscle Recovery Day</h3>
                <p>Allow your muscles to repair and recover. Drink plenty of water!</p>
              </div>
            ) : exercises.length === 0 ? (
              <div className="no-exercises-placeholder">
                <p>No exercises added to this workout day yet.</p>
                <button
                  className="btn-add-ex-inline"
                  onClick={() => onViewFullWorkout(activeDay?.id)}
                >
                  + Add Exercises to {activeDay?.title}
                </button>
              </div>
            ) : (
              <div className="overview-exercise-list">
                {exercises.map((ex) => (
                  <div key={ex.id} className="exercise-overview-row">
                    <div className="ex-icon-box">🏋️</div>
                    <div className="ex-main-info">
                      <span className="ex-name">{ex.name}</span>
                      <span className="ex-sets-reps">
                        {ex.setsCount || ex.setsList?.length || ex.sets || 3} sets ×{" "}
                        {ex.repsDisplay || ex.reps} &nbsp;•&nbsp;{" "}
                        <span className="ex-weight">
                          {ex.weightDisplay || ex.weight || "Bodyweight"}
                        </span>
                      </span>
                    </div>

                    <div className="ex-reward-block">
                      <span className="ex-xp-badge">+{ex.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Card Footer Actions */}
            <div className="card-footer-action-row">
              {!activeDay?.isRestDay && exercises.length > 0 && (
                <button
                  className="btn-start-workout-action"
                  onClick={() => onStartSession(activeDay.id)}
                >
                  🚀 Start Workout Session
                </button>
              )}

              <button
                className="view-full-workout-btn"
                onClick={() => onViewFullWorkout(activeDay?.id)}
              >
                <span>View & Edit Routine</span>
                <span className="btn-arrow">&gt;</span>
              </button>
            </div>
          </div>

          {/* Right Column: Weekly Schedule & Body Stats */}
          <div className="gym-right-col">
            {/* Weekly Progress Card */}
            <div className="gym-card weekly-progress-card">
              <div className="card-header">
                <span className="card-header-icon">📅</span>
                <h3 className="card-header-title">Weekly Schedule</h3>
              </div>

              <div className="weekly-schedule-row">
                {schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className={`day-node status-${item.status}`}
                    onClick={() => {
                      if (item.workoutDayId) setSelectedDayId(item.workoutDayId);
                    }}
                    style={{ cursor: item.workoutDayId ? "pointer" : "default" }}
                    title={item.title || item.fullDayName}
                  >
                    <span className="day-name">{item.day}</span>
                    <div className="day-badge-circle">
                      {item.status === "completed" && "✓"}
                      {item.status === "rest" && "🌙"}
                      {item.status === "today" && "🎯"}
                      {item.status === "upcoming" && "🏋️"}
                      {item.status === "disabled" && "•"}
                    </div>
                    <span className="day-title-sub">{item.title}</span>
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
      )}

      {/* Bottom Summary Cards Row */}
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
              {(profile?.totalXP ?? summary.totalXpEarned).toLocaleString()} XP
            </span>
            <span className="summary-sub">Keep pushing forward.</span>
          </div>
        </div>
      </div>

      {/* Workout History Section */}
      {history.length > 0 && (
        <div className="gym-card history-section-card margin-top-card">
          <div className="card-header history-header-row">
            <div>
              <span className="card-header-icon">📜</span>
              <h3 className="card-header-title">Workout History Logs</h3>
            </div>
            <button className="btn-clear-history" onClick={clearHistory}>
              Clear History
            </button>
          </div>

          <div className="history-logs-list">
            {history.map((record) => (
              <div key={record.id} className="history-item-row">
                <div className="history-main-info">
                  <span className="history-day-title">{record.workoutDayTitle}</span>
                  <span className="history-date-time">
                    {new Date(record.date).toLocaleDateString()} at{" "}
                    {new Date(record.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="history-stats">
                  <span>
                    ⏱️ {Math.floor(record.durationSeconds / 60)} min
                  </span>
                  <span>
                    🏋️ {record.completedExercisesCount} / {record.totalExercisesCount} Ex.
                  </span>
                  <span className="history-xp-badge">
                    +{record.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
