import React, { useState, useEffect } from "react";
import { Task, Category, Priority } from "../../types/task";
import { PlusIcon } from "../Icons";

interface NewTaskModalProps {
  isOpen: boolean;
  editingTask?: Task | null;
  onClose: () => void;
  onSave: (taskData: {
    id?: string;
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    xpReward: number;
    dueTime?: string;
    subtasks?: { title: string }[];
  }) => void;
}

const CATEGORIES: Category[] = [
  "Development",
  "Personal",
  "Gym",
  "Japanese",
  "Notes",
  "Anime",
  "Music",
  "Health",
  "Study",
  "General",
];

export function NewTaskModal({ isOpen, editingTask, onClose, onSave }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Development");
  const [priority, setPriority] = useState<Priority>("medium");
  const [xpReward, setXpReward] = useState<number>(25);
  const [dueTime, setDueTime] = useState("Today");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setXpReward(editingTask.xpReward);
      setDueTime(editingTask.dueTime || "Today");
      setSubtasks(editingTask.subtasks.map((s) => s.title));
    } else {
      setTitle("");
      setDescription("");
      setCategory("Development");
      setPriority("medium");
      setXpReward(25);
      setDueTime("Today");
      setSubtasks([]);
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (newSubtaskInput.trim()) {
      setSubtasks([...subtasks, newSubtaskInput.trim()]);
      setNewSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingTask?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      xpReward,
      dueTime: dueTime.trim(),
      subtasks: subtasks.map((st) => ({ title: st })),
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editingTask ? "Edit Task" : "✨ New Task"}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Build DailyLife Tasks Page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="modal-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="modal-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>XP Reward</label>
              <input
                type="number"
                min="5"
                max="200"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="modal-input"
              />
            </div>

            <div className="form-group flex-1">
              <label>Due Date / Time</label>
              <input
                type="text"
                placeholder="e.g. Today, 11:59 PM"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="modal-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="Add details, notes, or objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modal-textarea"
            />
          </div>

          {/* Subtasks input */}
          <div className="form-group">
            <label>Subtasks</label>
            <div className="subtask-input-row">
              <input
                type="text"
                placeholder="Add a subtask..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="modal-input flex-1"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="modal-add-sub-btn"
              >
                <PlusIcon size={16} />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="modal-subtasks-list">
                {subtasks.map((st, idx) => (
                  <div key={idx} className="modal-subtask-item">
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="subtask-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              {editingTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
