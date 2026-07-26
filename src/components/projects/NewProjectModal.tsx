import React, { useState } from "react";
import { Priority } from "../../types/project";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => void;
}

export function NewProjectModal({ isOpen, onClose, onSave }: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Work / Development");
  const [priority, setPriority] = useState<Priority>("High");
  const [shieldType, setShieldType] = useState<"caduceus" | "flame" | "axes" | "book" | "shield">("shield");
  const [shieldColor, setShieldColor] = useState<"blue" | "purple" | "green" | "bronze">("blue");
  const [gitRepo, setGitRepo] = useState("");
  const [projectFolder, setProjectFolder] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      subtitle: subtitle.trim() || "New project quest",
      description: description.trim() || "Project details and objectives...",
      currentFocus: "Initial planning and core architecture.",
      category,
      priority,
      shieldType,
      shieldColor,
      tags: ["Active", `${priority} Priority`],
      quickAccess: {
        gitRepo: gitRepo.trim() || undefined,
        projectFolder: projectFolder.trim() || undefined,
      },
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚔️ Create New Project Quest</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI Unreal Engine Companion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
            />
          </div>

          <div className="form-group">
            <label>Subtitle / One-Line Objective</label>
            <input
              type="text"
              placeholder="e.g. Building AI-driven gameplay systems"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="modal-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="modal-select"
              >
                <option value="Work / Development">Work / Development</option>
                <option value="Personal / Software">Personal / Software</option>
                <option value="Game Dev / R&D">Game Dev / R&D</option>
                <option value="Education / Language">Education / Language</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="modal-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Crest Emblem</label>
              <select
                value={shieldType}
                onChange={(e) => setShieldType(e.target.value as any)}
                className="modal-select"
              >
                <option value="caduceus">Caduceus (Medical/Tech)</option>
                <option value="flame">Flame (Power/Companion)</option>
                <option value="axes">Double Axes (Battle/UE5)</option>
                <option value="book">Book (Knowledge/Study)</option>
                <option value="shield">Standard Shield</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Crest Color</label>
              <select
                value={shieldColor}
                onChange={(e) => setShieldColor(e.target.value as any)}
                className="modal-select"
              >
                <option value="blue">Royal Blue</option>
                <option value="purple">Mystic Purple</option>
                <option value="green">Forest Green</option>
                <option value="bronze">Guild Bronze</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="Detailed description of the project scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modal-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>GitHub Repository URL</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="form-group flex-1">
              <label>Project Folder Path</label>
              <input
                type="text"
                placeholder="c:/myfiles/PROJECTS/..."
                value={projectFolder}
                onChange={(e) => setProjectFolder(e.target.value)}
                className="modal-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
