import { useState } from "react";
import { Project, Milestone } from "../../modules/projects/types";
import { useProjectStore } from "../../modules/projects";

interface ProjectMilestonesTabProps {
  project: Project;
}

export function ProjectMilestonesTab({ project }: ProjectMilestonesTabProps) {
  const { addMilestone, updateMilestone, deleteMilestone } = useProjectStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"completed" | "active" | "locked">("active");
  const [targetDate, setTargetDate] = useState("End of Quarter");
  const [xpReward, setXpReward] = useState(100);
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addMilestone(project.id, {
      name: name.trim(),
      status,
      targetDate: targetDate.trim() || "TBD",
      xpReward,
      description: description.trim(),
    });

    setName("");
    setDescription("");
    setStatus("active");
    setIsAddOpen(false);
  };

  const handleUpdateStatus = async (m: Milestone, newStatus: "completed" | "active" | "locked") => {
    await updateMilestone(project.id, m.id, { status: newStatus });
  };

  return (
    <div className="project-milestones-tab-wrapper">
      <div className="card-header-between">
        <h3 className="card-heading">Project Milestones & Roadmaps ({project.milestones.length})</h3>
        <button className="new-task-action-btn" onClick={() => setIsAddOpen(true)}>
          + Add Milestone
        </button>
      </div>

      <div className="milestones-grid-list">
        {project.milestones.map((m, idx) => (
          <div key={m.id} className={`milestone-card-item status-${m.status}`}>
            <div className="milestone-card-header">
              <div className="node-icon-circle">
                {m.status === "completed" && "✓"}
                {m.status === "active" && "★"}
                {m.status === "locked" && "🔒"}
              </div>
              <div className="milestone-title-block">
                <span className="milestone-step-lbl">MILESTONE #{idx + 1}</span>
                <h4 className="milestone-name">{m.name}</h4>
              </div>
              <select
                className={`status-select-pill status-${m.status}`}
                value={m.status}
                onChange={(e) => handleUpdateStatus(m, e.target.value as any)}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            {m.description && <p className="milestone-desc-text">{m.description}</p>}

            <div className="milestone-card-footer">
              <span className="target-date-lbl">Target: {m.targetDate || "TBD"}</span>
              <span className="ptask-xp-badge">+{m.xpReward || 100} XP</span>
              <button
                className="config-delete-btn"
                onClick={() => deleteMilestone(project.id, m.id)}
                title="Delete Milestone"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Milestone Overlay Modal */}
      {isAddOpen && (
        <div className="modal-overlay-backdrop">
          <div className="error-boundary-card new-task-modal-card">
            <h3 className="error-title">+ Add Project Milestone</h3>

            <form onSubmit={handleCreate} className="modal-form-body">
              <div className="form-group">
                <label className="form-lbl">Milestone Name</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="e.g. Beta Playtest Release"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">Description</label>
                <textarea
                  className="settings-textarea"
                  rows={2}
                  placeholder="Milestone description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-lbl">Status</label>
                  <select
                    className="settings-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-lbl">Target Date</label>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="e.g. Q3 Release"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">XP Completion Reward</label>
                <input
                  type="number"
                  className="settings-input"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value, 10) || 100)}
                />
              </div>

              <div className="settings-action-row">
                <button type="button" className="config-delete-btn" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-settings-btn">
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
