import { Task } from "../../types/task";
import { getCategoryIcon } from "./TaskList";
import { EditIcon } from "../Icons";

interface TaskDetailPanelProps {
  task: Task | null;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskDetailPanel({
  task,
  onToggleComplete,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
}: TaskDetailPanelProps) {
  if (!task) {
    return (
      <div className="detail-panel-empty">
        <div className="notebook-tape" />
        <p>Select a task to view details</p>
      </div>
    );
  }

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtasksPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  return (
    <div className="detail-panel-paper">
      {/* Tape Accent */}
      <div className="notebook-tape" />

      {/* Header */}
      <div className="panel-header">
        <div className="panel-category-badge">
          <span className="badge-icon">{getCategoryIcon(task.category)}</span>
          <span className="badge-name">{task.category}</span>
        </div>
        <button
          className="panel-delete-btn"
          onClick={() => onDeleteTask(task.id)}
          title="Delete Task"
        >
          ×
        </button>
      </div>

      <h2 className="panel-task-title">{task.title}</h2>

      {task.description && <p className="panel-task-description">{task.description}</p>}

      {/* Meta Properties */}
      <div className="panel-meta-list">
        <div className="panel-meta-row">
          <span className="meta-label">XP Reward</span>
          <span className="meta-value xp-highlight">+{task.xpReward} XP</span>
        </div>

        <div className="panel-meta-row">
          <span className="meta-label">Priority</span>
          <span className={`meta-value priority-tag priority-${task.priority}`}>
            {task.priority === "high" ? "↑ High" : task.priority === "medium" ? "→ Medium" : "↓ Low"}
          </span>
        </div>

        <div className="panel-meta-row">
          <span className="meta-label">Due Time</span>
          <span className="meta-value">{task.dueTime || "Today"}</span>
        </div>
      </div>

      {/* Subtasks Section */}
      {totalSubtasks > 0 && (
        <div className="panel-subtasks-section">
          <div className="subtasks-header">
            <span className="subtasks-title">Subtasks</span>
            <span className="subtasks-progress-text">
              {completedSubtasksCount} / {totalSubtasks}
            </span>
          </div>

          <div className="subtasks-bar-bg">
            <div className="subtasks-bar-fill" style={{ width: `${subtasksPercent}%` }} />
          </div>

          <div className="subtasks-list">
            {task.subtasks.map((sub) => (
              <label key={sub.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => onToggleSubtask(task.id, sub.id)}
                />
                <span className={`subtask-title ${sub.completed ? "completed" : ""}`}>
                  {sub.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="panel-actions-row">
        <button className="panel-btn panel-btn-edit" onClick={() => onEditTask(task)}>
          <EditIcon size={14} />
          <span>Edit Task</span>
        </button>

        <button
          className={`panel-btn panel-btn-complete ${task.completed ? "is-completed" : ""}`}
          onClick={() => onToggleComplete(task.id)}
        >
          <span>{task.completed ? "✓ Completed" : "✓ Mark Complete"}</span>
        </button>
      </div>

      {/* Bottom Decorative Note */}
      <div className="panel-footer-note">
        <span className="jp-text">日々を楽しむ</span>
        <span className="en-sub">Enjoy the little things</span>
      </div>
    </div>
  );
}
