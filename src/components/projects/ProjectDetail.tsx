import { useState } from "react";
import { Project } from "../../types/project";
import { ProjectShield } from "./ProjectShield";
import { useProjectStore } from "../../modules/projects";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";
import { ProjectTasksTab } from "./ProjectTasksTab";
import { ProjectMilestonesTab } from "./ProjectMilestonesTab";
import { ProjectNotesTab } from "./ProjectNotesTab";
import { ProjectFilesTab } from "./ProjectFilesTab";
import { ProjectActivityTab } from "./ProjectActivityTab";
import { nativeDialogService } from "../../services/nativeDialogService";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const { toggleProjectTask, openLink, launchApp, openFolder } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [notification, setNotification] = useState<string | null>(null);

  const handleLaunchQuickAccess = async (name: string, value?: string) => {
    if (!value) {
      showToast(`No link or path configured for ${name}`);
      return;
    }

    showToast(`Launching ${name}: ${value}`);
    await openLink(value);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleProjectTask(project.id, taskId);
  };

  const hasConfiguredLaunchers =
    (project.apps && project.apps.length > 0) ||
    (project.folders && project.folders.length > 0) ||
    (project.links && project.links.length > 0);

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
        <button
          className={`detail-tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙ Settings
        </button>
      </div>

      {/* Render Sub-Tab Content */}
      {activeTab === "settings" ? (
        <ProjectSettingsPanel project={project} />
      ) : activeTab === "tasks" ? (
        <ProjectTasksTab project={project} />
      ) : activeTab === "milestones" ? (
        <ProjectMilestonesTab project={project} />
      ) : activeTab === "notes" ? (
        <ProjectNotesTab project={project} />
      ) : activeTab === "files" ? (
        <ProjectFilesTab project={project} />
      ) : activeTab === "activity" ? (
        <ProjectActivityTab project={project} />
      ) : (
        /* Dashboard Grid Container */
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
              <div className="card-header-between">
                <h3 className="card-heading">Quick Access</h3>
                <span className="view-all-link" onClick={() => setActiveTab("settings")}>
                  ⚙ Configure
                </span>
              </div>

              <div className="quick-access-grid">
                {hasConfiguredLaunchers ? (
                  <>
                    {/* Render Configured Apps & Entry Files */}
                    {project.apps?.map((app) => (
                      <div
                        key={app.id}
                        className="quick-tile"
                        onClick={() => launchApp(app.exePath, app.args)}
                      >
                        <div className="tile-icon">{app.icon || nativeDialogService.detectFileIcon(app.exePath)}</div>
                        <div className="tile-labels">
                          <span className="tile-title">{app.name}</span>
                          <span className="tile-sub">{nativeDialogService.detectFileType(app.exePath)}</span>
                        </div>
                        <span className="tile-arrow">↗</span>
                      </div>
                    ))}

                    {/* Render Configured Folders */}
                    {project.folders?.map((folder) => (
                      <div
                        key={folder.id}
                        className="quick-tile"
                        onClick={() => openFolder(folder.path)}
                      >
                        <div className="tile-icon">{folder.icon || "📁"}</div>
                        <div className="tile-labels">
                          <span className="tile-title">{folder.name}</span>
                          <span className="tile-sub">Open Folder</span>
                        </div>
                        <span className="tile-arrow">↗</span>
                      </div>
                    ))}

                    {/* Render Configured Links */}
                    {project.links?.map((link) => (
                      <div
                        key={link.id}
                        className="quick-tile"
                        onClick={() => openLink(link.url)}
                      >
                        <div className="tile-icon">{link.icon || "🌐"}</div>
                        <div className="tile-labels">
                          <span className="tile-title">{link.name}</span>
                          <span className="tile-sub">Open Link</span>
                        </div>
                        <span className="tile-arrow">↗</span>
                      </div>
                    ))}
                  </>
                ) : (
                  /* Empty state if no launcher items configured */
                  <div className="empty-quick-access-box" onClick={() => setActiveTab("settings")}>
                    <span className="config-icon">⚙</span>
                    <span className="empty-qa-title">No Quick Access Configured</span>
                    <span className="empty-qa-sub">Click here to add native Apps, Folders, or Links</span>
                  </div>
                )}
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
      )}
    </div>
  );
}
