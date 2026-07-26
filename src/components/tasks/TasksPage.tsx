import { useState, useEffect } from "react";
import { Task, TaskTab, TaskSummary } from "../../types/task";
import { taskService } from "../../services/taskService";
import { xpService, XPState } from "../../services/xpService";
import { TaskSummaryCards } from "./TaskSummaryCards";
import { TaskList } from "./TaskList";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { NewTaskModal } from "./NewTaskModal";
import { SparklesIcon, PlusIcon } from "../Icons";

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => taskService.getTasks());
  const [xpState, setXpState] = useState<XPState>(() => xpService.getXPState());
  const [activeTab, setActiveTab] = useState<TaskTab>("today");
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(() => tasks[0]?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Subscribe to taskService and xpService updates
  useEffect(() => {
    const unsubscribeTasks = taskService.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });
    const unsubscribeXP = xpService.subscribe((updatedXP) => {
      setXpState(updatedXP);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeXP();
    };
  }, []);

  // Filter tasks according to activeTab
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "completed") return t.completed;
    if (activeTab === "upcoming") return !t.completed && t.priority === "high";
    return true; // "today" tab shows all current tasks
  });

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || filteredTasks[0] || null;

  // Compute Task Summary statistics
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const summary: TaskSummary = {
    progressPercent,
    completedCount,
    totalCount,
    todayXp: xpState.todayXp,
    streakDays: xpState.streakDays,
    bestStreakDays: xpState.bestStreakDays,
  };

  const handleToggleTaskComplete = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    taskService.toggleTaskComplete(taskId);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    taskService.toggleSubtask(taskId, subtaskId);
  };

  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditTaskModal = (taskToEdit: Task) => {
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (taskData.id) {
      const existing = tasks.find((t) => t.id === taskData.id);
      if (existing) {
        taskService.updateTask({
          ...existing,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          priority: taskData.priority,
          xpReward: taskData.xpReward,
          dueTime: taskData.dueTime,
          subtasks: taskData.subtasks
            ? taskData.subtasks.map((st: any, idx: number) => ({
                id: existing.subtasks[idx]?.id || `sub-${Date.now()}-${idx}`,
                title: st.title,
                completed: existing.subtasks[idx]?.completed || false,
              }))
            : existing.subtasks,
        });
      }
    } else {
      const created = taskService.addTask(taskData);
      setSelectedTaskId(created.id);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.deleteTask(taskId);
    if (selectedTaskId === taskId) {
      const remaining = tasks.filter((t) => t.id !== taskId);
      setSelectedTaskId(remaining[0]?.id);
    }
  };

  return (
    <div className="tasks-page-container">
      {/* Top Bar Header */}
      <div className="tasks-header-bar">
        <div className="tasks-header-left">
          <div className="tasks-title-row">
            <h1 className="tasks-page-title">Tasks</h1>
            <SparklesIcon size={20} />
          </div>
          <p className="tasks-quote-text">“Discipline today, freedom tomorrow.”</p>

          {/* Navigation Tabs */}
          <div className="tasks-tabs-row">
            <button
              className={`tasks-tab-btn ${activeTab === "today" ? "active" : ""}`}
              onClick={() => setActiveTab("today")}
            >
              Today
            </button>
            <button
              className={`tasks-tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`tasks-tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="tasks-header-right">
          <button className="new-task-action-btn" onClick={handleOpenNewTaskModal}>
            <PlusIcon size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <TaskSummaryCards summary={summary} />

      {/* Main Workspace Grid (Task List + Detail Panel) */}
      <div className="tasks-workspace-grid">
        <div className="tasks-list-section">
          <TaskList
            tasks={filteredTasks}
            selectedTaskId={selectedTask?.id}
            onSelectTask={(task) => setSelectedTaskId(task.id)}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        </div>

        <div className="tasks-detail-section">
          <TaskDetailPanel
            task={selectedTask}
            onToggleComplete={handleToggleTaskComplete}
            onToggleSubtask={handleToggleSubtask}
            onEditTask={handleOpenEditTaskModal}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {/* New / Edit Task Modal */}
      <NewTaskModal
        isOpen={isModalOpen}
        editingTask={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}
