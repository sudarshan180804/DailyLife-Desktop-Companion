import { useState } from "react";
import { Project, ProjectTask, Priority } from "../../modules/projects/types";
import { useProjectStore } from "../../modules/projects";

interface ProjectTasksTabProps {
  project: Project;
}

export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  const {
    toggleProjectTask,
    addProjectTask,
    updateProjectTask,
    deleteProjectTask,
    toggleProjectSubtask,
  } = useProjectStore();

  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  // New Task Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");
  const [newXpReward, setNewXpReward] = useState(25);
  const [newDueDate, setNewDueDate] = useState("Today");
  const [newNotes, setNewNotes] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [newSubtasks, setNewSubtasks] = useState<{ title: string; completed: boolean }[]>([]);

  // Filter Tasks
  const filteredTasks = project.tasks.filter((t) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "done") return t.completed || t.status === "done";
    if (statusFilter === "in_progress") return t.status === "in_progress";
    if (statusFilter === "todo") return !t.completed && (t.status === "todo" || !t.status);
    return true;
  });

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setNewSubtasks([...newSubtasks, { title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setNewSubtasks(newSubtasks.filter((_, i) => i !== index));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addProjectTask(project.id, {
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      xpReward: newXpReward,
      dueDate: newDueDate.trim() || "Today",
      notes: newNotes.trim(),
      subtasks: newSubtasks,
    });

    setNewTitle("");
    setNewDesc("");
    setNewPriority("Medium");
    setNewXpReward(25);
    setNewDueDate("Today");
    setNewNotes("");
    setNewSubtasks([]);
    setIsAddModalOpen(false);
  };

  const handleStatusChange = async (task: ProjectTask, newStatus: "todo" | "in_progress" | "done") => {
    if (newStatus === "done" && !task.completed) {
      await toggleProjectTask(project.id, task.id);
    } else if (newStatus !== "done" && task.completed) {
      await toggleProjectTask(project.id, task.id);
    }
    await updateProjectTask(project.id, task.id, { status: newStatus });
  };

  return (
    <div className="project-tasks-tab-wrapper">
      {/* Header & Filter Control Row */}
      <div className="tasks-tab-header">
        <div className="tasks-tab-header-left">
          <h3 className="card-heading">
            Project Tasks ({project.tasks.length})
          </h3>

          <div className="status-filter-pills">
            <button
              className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({project.tasks.length})
            </button>
            <button
              className={`filter-pill ${statusFilter === "todo" ? "active" : ""}`}
              onClick={() => setStatusFilter("todo")}
            >
              To Do ({project.tasks.filter((t) => !t.completed && (t.status === "todo" || !t.status)).length})
            </button>
            <button
              className={`filter-pill ${statusFilter === "in_progress" ? "active" : ""}`}
              onClick={() => setStatusFilter("in_progress")}
            >
              In Progress ({project.tasks.filter((t) => t.status === "in_progress").length})
            </button>
            <button
              className={`filter-pill ${statusFilter === "done" ? "active" : ""}`}
              onClick={() => setStatusFilter("done")}
            >
              Done ({project.tasks.filter((t) => t.completed || t.status === "done").length})
            </button>
          </div>
        </div>

        <button className="new-task-action-btn" onClick={() => setIsAddModalOpen(true)}>
          + New Project Task
        </button>
      </div>

      {/* Main Grid: Tasks List (Left) + Detail & Notes View (Right) */}
      <div className="tasks-tab-content-grid">
        {/* Left: Task Cards List */}
        <div className="ptasks-list-column">
          {filteredTasks.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-state-icon">📋</span>
              <h4 className="empty-state-title">No Tasks Found</h4>
              <p className="empty-state-description">There are no tasks matching the selected status filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const currentStatus = task.status || (task.completed ? "done" : "todo");

              return (
                <div
                  key={task.id}
                  className={`ptask-row-card ${task.completed ? "completed" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="ptask-row-left">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleProjectTask(project.id, task.id)}
                      className="task-due-checkbox"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="ptask-text-group">
                      <span className="ptask-title-text">{task.title}</span>
                      {task.description && <span className="ptask-desc-sub">{task.description}</span>}
                    </div>
                  </div>

                  <div className="ptask-row-right">
                    <select
                      className={`status-select-pill status-${currentStatus}`}
                      value={currentStatus}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task, e.target.value as any);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>

                    <span className="ptask-xp-badge">+{task.xpReward} XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Task Detail / Subtasks / Notes Panel */}
        <div className="ptasks-detail-column">
          {selectedTask ? (
            <div className="detail-card selected-task-card">
              <div className="card-header-between">
                <h3 className="card-heading">{selectedTask.title}</h3>
                <button
                  className="config-delete-btn"
                  onClick={() => {
                    deleteProjectTask(project.id, selectedTask.id);
                    setSelectedTask(null);
                  }}
                  title="Delete Task"
                >
                  Delete
                </button>
              </div>

              {selectedTask.description && (
                <div className="task-detail-block">
                  <span className="detail-block-label">Description</span>
                  <p className="detail-block-text">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.notes && (
                <div className="task-detail-block">
                  <span className="detail-block-label">Notes & Instructions</span>
                  <p className="detail-block-text notes-text">{selectedTask.notes}</p>
                </div>
              )}

              {/* Subtasks Section */}
              <div className="task-detail-block">
                <span className="detail-block-label">
                  Subtasks ({selectedTask.subtasks?.filter((s) => s.completed).length || 0} /{" "}
                  {selectedTask.subtasks?.length || 0})
                </span>

                <div className="subtasks-list">
                  {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                    selectedTask.subtasks.map((st) => (
                      <label key={st.id} className={`subtask-item-row ${st.completed ? "completed" : ""}`}>
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleProjectSubtask(project.id, selectedTask.id, st.id)}
                        />
                        <span className="subtask-title">{st.title}</span>
                      </label>
                    ))
                  ) : (
                    <span className="no-subtasks-text">No subtasks defined for this task.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-card empty-detail-card">
              <span className="empty-state-icon">🔍</span>
              <h4 className="empty-state-title">Select a Task</h4>
              <p className="empty-state-description">Click on any task to view notes, manage subtasks, or update details.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Task Overlay Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay-backdrop">
          <div className="error-boundary-card new-task-modal-card">
            <h3 className="error-title">+ Create New Project Task</h3>

            <form onSubmit={handleCreateTask} className="modal-form-body">
              <div className="form-group">
                <label className="form-lbl">Task Title</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">Description</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Task description..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-lbl">Priority</label>
                  <select
                    className="settings-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-lbl">XP Reward</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={newXpReward}
                    onChange={(e) => setNewXpReward(parseInt(e.target.value, 10) || 25)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">Notes</label>
                <textarea
                  className="settings-textarea"
                  rows={2}
                  placeholder="Additional notes or links..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              {/* Subtasks Add Section */}
              <div className="form-group">
                <label className="form-lbl">Subtasks</label>
                <div className="add-subtask-input-row">
                  <input
                    type="text"
                    className="settings-input flex-1"
                    placeholder="Subtask name..."
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                  />
                  <button type="button" className="add-launcher-btn" onClick={handleAddSubtask}>
                    + Add Subtask
                  </button>
                </div>

                <div className="subtasks-chips-list">
                  {newSubtasks.map((st, sIdx) => (
                    <span key={sIdx} className="subtask-chip">
                      {st.title}
                      <button type="button" onClick={() => handleRemoveSubtask(sIdx)} className="chip-remove-btn">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="settings-action-row">
                <button type="button" className="config-delete-btn" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-settings-btn">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
