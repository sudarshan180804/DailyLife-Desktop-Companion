import { useState } from "react";
import { Project } from "../../types/project";
import { ProjectShield } from "./ProjectShield";
import { projectService } from "../../services/projectService";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [notification, setNotification] = useState<string | null>(null);

  const handleLaunchQuickAccess = (name: string, value?: string) => {
    if (!value) {
      showToast(`No link or path configured for ${name}`);
      return;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
      window.open(value, "_blank");
      showToast(`Opening ${name} link...`);
    } else {
      // Local path or app launch
      showToast(`Launching ${name}: ${value}`);
      // If running in browser or web mode, attempt window open or notification
      try {
        window.open(`file:///${value}`, "_blank");
      } catch (err) {
        console.log("Local launch:", value);
      }
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleTask = (taskId: string) => {
    projectService.toggleProjectTaskComplete(project.id, taskId);
  };

  return (
    <div className="project-detail-container">
      {/* Toast Notification */}
      {notification && <div className="quick-access-toast">{notification}</div>}

      {/* Top Back Navigation Bar */}
      <div className="detail-top-nav">
        <button className="back-projects-btn" onClick={onBack}>
          ← Back to Projects
        </button>
      </div>

      {/* Project Header Banner */}
      <div className="detail-header-banner">
        <div className="banner-left-group">
          <ProjectShield type={project.shieldType} color={project.shieldColor} size={64} />
          <div className="header-text-block">
            <div className="header-title-row">
              <h1 className="header-project-title">{project.title}</h1>
              <span className="header-star">★</span>
            </div>
            <p className="header-project-subtitle">{project.subtitle}</p>

            <div className="header-tags-row">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="header-tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="banner-right-metrics">
          <div className="header-metric-box">
            <span className="metric-label">Progress</span>
            <span className="metric-val">{project.progressPercent}%</span>
            <div className="metric-progress-bg">
              <div className="metric-progress-fill" style={{ width: `${project.progressPercent}%` }} />
            </div>
            <span className="metric-subtext">
              {project.completedTasksCount} / {project.totalTasksCount} Tasks Completed
            </span>
          </div>

          <div className="header-metric-box">
            <span className="metric-label">XP Earned</span>
            <span className="metric-val highlight-gold">{project.xpEarned} XP</span>
            <span className="metric-subtext">Next Reward: {project.nextXpReward} XP</span>
          </div>

          <div className="header-metric-box">
            <span className="metric-label">Priority</span>
            <span className={`priority-guild-seal priority-${project.priority.toLowerCase()}`}>
              {project.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="detail-sub-tabs">
        <button
          className={`detail-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks <span className="tab-badge">{project.tasks.length}</span>
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "milestones" ? "active" : ""}`}
          onClick={() => setActiveTab("milestones")}
        >
          Milestones
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "files" ? "active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          Files & Links
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Activity
        </button>
      </div>

      {/* Dashboard Grid Container */}
      <div className="detail-dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column col-left">
          {/* Project Description Card */}
          <div className="detail-card description-card">
            <h3 className="card-heading">Project Description</h3>
            <p className="description-body">{project.description}</p>

            <h4 className="focus-heading">Current Focus</h4>
            <p className="focus-body">{project.currentFocus}</p>
          </div>

          {/* Tasks Due Today Card */}
          <div className="detail-card tasks-due-card">
            <div className="card-header-row">
              <h3 className="card-heading">
                Tasks Due Today <span className="count-pill">{project.tasks.length}</span>
              </h3>
            </div>

            <div className="tasks-due-list">
              {project.tasks.map((task) => (
                <div key={task.id} className={`task-due-item ${task.completed ? "completed" : ""}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="task-due-checkbox"
                  />
                  <div className="task-due-info">
                    <span className="task-due-title">{task.title}</span>
                    <span className="task-due-desc">{task.description}</span>
                  </div>
                  <div className="task-due-meta">
                    <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className="task-xp-val">+{task.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer-row">
              <span className="view-all-link" onClick={() => setActiveTab("tasks")}>
                View all tasks →
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="dashboard-column col-mid">
          {/* Project Progress / Milestones Map Card */}
          <div className="detail-card milestones-map-card">
            <h3 className="card-heading">Project Progress & Milestones</h3>

            <div className="milestones-timeline-wrapper">
              {project.milestones.map((m, idx) => (
                <div key={m.id} className={`milestone-node status-${m.status}`}>
                  <div className="node-icon-circle">
                    {m.status === "completed" && "✓"}
                    {m.status === "active" && "★"}
                    {m.status === "locked" && "🔒"}
                  </div>
                  <span className="node-name">{m.name}</span>
                  {idx < project.milestones.length - 1 && <div className="node-connector-line" />}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="detail-card activity-card">
            <h3 className="card-heading">Recent Activity</h3>
            <div className="activity-timeline-list">
              {project.activities.map((act) => (
                <div key={act.id} className="activity-item-row">
                  <div className={`activity-icon-badge type-${act.type}`}>
                    {act.type === "completed" ? "✓" : act.type === "added" ? "+" : "✎"}
                  </div>
                  <div className="activity-details">
                    <span className="activity-text">
                      {act.text} {act.xpDelta && <strong className="gold-txt">+{act.xpDelta} XP</strong>}
                    </span>
                    <span className="activity-time">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer-row">
              <span className="view-all-link" onClick={() => setActiveTab("activity")}>
                View all activity →
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column col-right">
          {/* Quick Access Panel */}
          <div className="detail-card quick-access-card">
            <h3 className="card-heading">Quick Access</h3>

            <div className="quick-access-grid">
              <div
                className="quick-tile"
                onClick={() => handleLaunchQuickAccess("Unreal Engine", project.quickAccess.unrealEngine)}
              >
                <div className="tile-icon">🎮</div>
                <div className="tile-labels">
                  <span className="tile-title">Open in Unreal Engine</span>
                  <span className="tile-sub">Launch Editor</span>
                </div>
                <span className="tile-arrow">↗</span>
              </div>

              <div
                className="quick-tile"
                onClick={() => handleLaunchQuickAccess("Project Folder", project.quickAccess.projectFolder)}
              >
                <div className="tile-icon">📁</div>
                <div className="tile-labels">
                  <span className="tile-title">Open Project Folder</span>
                  <span className="tile-sub">Local Directory</span>
                </div>
                <span className="tile-arrow">↗</span>
              </div>

              <div
                className="quick-tile"
                onClick={() => handleLaunchQuickAccess("Git Repository", project.quickAccess.gitRepo)}
              >
                <div className="tile-icon">🐙</div>
                <div className="tile-labels">
                  <span className="tile-title">Open Git Repository</span>
                  <span className="tile-sub">GitHub Repo</span>
                </div>
                <span className="tile-arrow">↗</span>
              </div>

              <div
                className="quick-tile"
                onClick={() => handleLaunchQuickAccess("PPT Presentation", project.quickAccess.pptPresentation)}
              >
                <div className="tile-icon">📊</div>
                <div className="tile-labels">
                  <span className="tile-title">Open PPT Presentation</span>
                  <span className="tile-sub">Slides & Pitch</span>
                </div>
                <span className="tile-arrow">↗</span>
              </div>

              <div
                className="quick-tile"
                onClick={() => handleLaunchQuickAccess("References Folder", project.quickAccess.referencesFolder)}
              >
                <div className="tile-icon">📚</div>
                <div className="tile-labels">
                  <span className="tile-title">References Folder</span>
                  <span className="tile-sub">Docs & Assets</span>
                </div>
                <span className="tile-arrow">↗</span>
              </div>

              <div
                className="quick-tile"
                onClick={() => handleLaunchQuickAccess("ChatGPT Conversation", project.quickAccess.chatGptUrl)}
              >
                <div className="tile-icon">💬</div>
                <div className="tile-labels">
                  <span className="tile-title">ChatGPT Conversation</span>
                  <span className="tile-sub">AI Assistant</span>
                </div>
                <span className="tile-arrow">↗</span>
              </div>
            </div>
          </div>

          {/* Project Details Card */}
          <div className="detail-card meta-details-card">
            <h3 className="card-heading">Project Details</h3>

            <div className="details-list">
              <div className="details-row">
                <span className="d-label">Category</span>
                <span className="d-val">{project.category}</span>
              </div>
              <div className="details-row">
                <span className="d-label">Created On</span>
                <span className="d-val">{project.createdOn}</span>
              </div>
              <div className="details-row">
                <span className="d-label">Last Updated</span>
                <span className="d-val">{project.lastUpdated}</span>
              </div>
              <div className="details-row">
                <span className="d-label">Total Tasks</span>
                <span className="d-val">{project.totalTasksCount}</span>
              </div>
              <div className="details-row">
                <span className="d-label">Completed</span>
                <span className="d-val">{project.completedTasksCount}</span>
              </div>
              <div className="details-row">
                <span className="d-label">Due Date</span>
                <span className="d-val">{project.dueDate || "No due date"}</span>
              </div>
            </div>

            {/* Red Wax Seal Stamp */}
            <div className="red-wax-seal">
              <span>GUILD</span>
              <span className="seal-small">SEAL</span>
            </div>
          </div>

          {/* Project Resources Card */}
          <div className="detail-card resources-card">
            <h3 className="card-heading">Project Resources</h3>

            <div className="resources-list">
              {project.resources.map((res, idx) => (
                <div
                  key={idx}
                  className="resource-item-row"
                  onClick={() => handleLaunchQuickAccess(res.name, res.path)}
                >
                  <span className="resource-folder-icon">📁</span>
                  <span className="resource-name">{res.name}</span>
                  <span className="resource-arrow">&gt;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
