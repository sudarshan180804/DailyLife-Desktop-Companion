import { useTaskStore } from "../../../modules/tasks";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function TasksWidget({ onNavigateToModule }: WidgetProps) {
  const { tasks, toggleTask } = useTaskStore();

  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 4);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">☑️</span>
          <h3 className="widget-title-text">Daily Tasks & Quest Log</h3>
          <span className="widget-count-badge">
            {completedCount}/{totalCount} Completed ({progressPercent}%)
          </span>
        </div>

        <button
          className="widget-nav-link"
          onClick={() => onNavigateToModule && onNavigateToModule("tasks")}
        >
          Open Tasks Hub →
        </button>
      </div>

      <div className="widget-progress-bar-bg">
        <div className="widget-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="widget-content-list">
        {pendingTasks.length > 0 ? (
          pendingTasks.map((t) => (
            <div key={t.id} className="widget-task-item">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t.id)}
                className="widget-task-checkbox"
              />
              <div className="widget-task-info">
                <span className="widget-task-title">{t.title}</span>
                <span className="widget-task-category">{t.category || "General"}</span>
              </div>
              <span className="widget-task-xp">+{t.xpReward || 15} XP</span>
            </div>
          ))
        ) : (
          <div className="widget-empty-msg">
            <span>🎉 All tasks for this context are completed!</span>
          </div>
        )}
      </div>
    </div>
  );
}
