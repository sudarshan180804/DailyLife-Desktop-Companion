import React from "react";
import { Task, Category } from "../../types/task";
import { EmptyState } from "../common/EmptyState";
import {
  CodeIcon,
  GymIcon,
  NotesIcon,
  JapaneseIcon,
  BookOpenIcon,
  HeartIcon,
  AnimeIcon,
  MusicIcon,
  TagIcon,
} from "../Icons";

interface TaskListProps {
  tasks: Task[];
  selectedTaskId?: string;
  onSelectTask: (task: Task) => void;
  onToggleTaskComplete: (taskId: string, e: React.MouseEvent) => void;
}

export function getCategoryIcon(category: Category) {
  switch (category) {
    case "Development":
      return <CodeIcon size={14} />;
    case "Gym":
      return <GymIcon size={14} />;
    case "Personal":
      return <NotesIcon size={14} />;
    case "Japanese":
      return <JapaneseIcon size={14} />;
    case "Study":
      return <BookOpenIcon size={14} />;
    case "Health":
      return <HeartIcon size={14} />;
    case "Anime":
      return <AnimeIcon size={14} />;
    case "Music":
      return <MusicIcon size={14} />;
    default:
      return <TagIcon size={14} />;
  }
}

export function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleTaskComplete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="⚔️"
        title="No Quest Tasks Available"
        description="Your task board is clear! Create a new quest task to start earning XP and coins."
      />
    );
  }

  return (
    <div className="task-list-container">
      {tasks.map((task) => {
        const isSelected = selectedTaskId === task.id;

        return (
          <div
            key={task.id}
            className={`task-row ${task.completed ? "completed" : ""} ${
              isSelected ? "selected" : ""
            }`}
            onClick={() => onSelectTask(task)}
          >
            {/* Completion Checkbox */}
            <button
              className={`task-checkbox ${task.completed ? "checked" : ""}`}
              onClick={(e) => onToggleTaskComplete(task.id, e)}
              title={task.completed ? "Mark Incomplete" : "Mark Complete"}
            >
              {task.completed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Task Title */}
            <span className="task-title-text">{task.title}</span>

            {/* Category Tag */}
            <div className="task-category-tag">
              <span className="category-icon">{getCategoryIcon(task.category)}</span>
              <span className="category-name">{task.category}</span>
            </div>

            {/* XP Reward */}
            <span className="task-xp-reward">+{task.xpReward} XP</span>

            {/* Due Time / Status */}
            <span className="task-due-time">
              {task.completed ? (
                "Completed"
              ) : isSelected ? (
                <span className="in-progress-text">In Progress &gt;</span>
              ) : (
                task.dueTime || "Today"
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
