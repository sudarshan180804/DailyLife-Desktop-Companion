import { useGymStore } from "../../../modules/gym";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function GymWidget({ onNavigateToModule }: WidgetProps) {
  const { workoutDays, exercises, summary, toggleExercise } = useGymStore();

  const currentExercises =
    exercises && exercises.length > 0
      ? exercises.slice(0, 4)
      : workoutDays[0]?.exercises
      ? workoutDays[0].exercises.slice(0, 4)
      : [];

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">🏋️</span>
          <h3 className="widget-title-text">Today's Workout Focus</h3>
          <span className="widget-count-badge">
            🔥 {summary.streakDays} Day Streak
          </span>
        </div>

        <button
          className="widget-nav-link"
          onClick={() => onNavigateToModule && onNavigateToModule("gym")}
        >
          Open Gym →
        </button>
      </div>

      <div className="widget-content-list">
        {currentExercises.length > 0 ? (
          currentExercises.map((e) => (
            <div key={e.id} className="widget-task-item">
              <input
                type="checkbox"
                checked={e.completed}
                onChange={() => toggleExercise(e.id)}
                className="widget-task-checkbox"
              />
              <div className="widget-task-info">
                <span className="widget-task-title">{e.name}</span>
                <span className="widget-task-category">
                  {e.setsCount || e.setsList?.length || e.sets || 3} sets ×{" "}
                  {e.repsDisplay || e.reps || "10 reps"}{" "}
                  {e.weightDisplay || e.weight ? `@ ${e.weightDisplay || e.weight}` : ""}
                </span>
              </div>
              <span className="widget-task-xp">+{e.xpReward || 20} XP</span>
            </div>
          ))
        ) : (
          <div className="widget-empty-msg">
            <span>💪 Rest day or workout not configured yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}
