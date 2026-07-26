import { TaskSummary } from "../../types/task";
import { StarIcon, CheckCircleIcon, FlameIcon } from "../Icons";

interface TaskSummaryCardsProps {
  summary: TaskSummary;
}

export function TaskSummaryCards({ summary }: TaskSummaryCardsProps) {
  const strokeDashoffset = 100 - (summary.progressPercent / 100) * 100;

  return (
    <div className="task-summary-row">
      {/* Today's Progress Card */}
      <div className="summary-card">
        <div className="progress-ring-wrapper">
          <svg className="progress-ring-svg" viewBox="0 0 36 36">
            <path
              className="progress-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="progress-ring-fill"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="progress-ring-text">{summary.progressPercent}%</span>
        </div>
        <div className="summary-card-info">
          <span className="summary-card-title">Today's Progress</span>
          <span className="summary-card-value">
            {summary.completedCount} / {summary.totalCount}
          </span>
          <span className="summary-card-subtext">tasks completed</span>
        </div>
      </div>

      {/* XP Earned Today Card */}
      <div className="summary-card">
        <div className="summary-card-icon-wrapper xp-icon-glow">
          <StarIcon size={24} />
        </div>
        <div className="summary-card-info">
          <span className="summary-card-title">XP Earned Today</span>
          <span className="summary-card-value highlight-gold">{summary.todayXp} XP</span>
          <span className="summary-card-subtext">Keep going!</span>
        </div>
      </div>

      {/* Tasks Completed Card */}
      <div className="summary-card">
        <div className="summary-card-icon-wrapper check-icon-glow">
          <CheckCircleIcon size={24} />
        </div>
        <div className="summary-card-info">
          <span className="summary-card-title">Tasks Completed</span>
          <span className="summary-card-value highlight-green">{summary.completedCount}</span>
          <span className="summary-card-subtext">Nice work!</span>
        </div>
      </div>

      {/* Current Streak Card */}
      <div className="summary-card">
        <div className="summary-card-icon-wrapper flame-icon-glow">
          <FlameIcon size={24} />
        </div>
        <div className="summary-card-info">
          <span className="summary-card-title">Current Streak</span>
          <span className="summary-card-value highlight-orange">
            {summary.streakDays} <span className="value-unit">days</span>
          </span>
          <span className="summary-card-subtext">Best: {summary.bestStreakDays} days</span>
        </div>
      </div>
    </div>
  );
}
