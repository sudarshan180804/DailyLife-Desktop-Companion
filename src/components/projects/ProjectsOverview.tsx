import { Project } from "../../types/project";
import { ProjectShield } from "./ProjectShield";
import { PlusIcon, StarIcon, CheckCircleIcon, NotesIcon } from "../Icons";

interface ProjectsOverviewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
}

export function ProjectsOverview({
  projects,
  onSelectProject,
  onOpenNewProjectModal,
}: ProjectsOverviewProps) {
  // Aggregate stats across all projects
  const activeProjectsCount = projects.length;
  const totalXpEarned = projects.reduce((sum, p) => sum + p.xpEarned, 0);
  const tasksDueTodayTotal = projects.reduce((sum, p) => sum + p.tasksDueTodayCount, 0);
  const completedTasksTotal = projects.reduce((sum, p) => sum + p.completedTasksCount, 0);

  return (
    <div className="projects-overview-container">
      {/* Header Bar */}
      <div className="projects-header-bar">
        <div className="projects-header-left">
          <h1 className="projects-page-title">PROJECTS</h1>
          <p className="projects-quote-text">Plan your quests. Build your legacy.</p>
        </div>

        <button className="new-project-btn" onClick={onOpenNewProjectModal}>
          <PlusIcon size={18} />
          <span>+ New Project</span>
        </button>
      </div>

      {/* Top Summary Cards Bar */}
      <div className="projects-summary-row">
        <div className="summary-parchment-card">
          <div className="card-icon-wrapper">
            <NotesIcon size={24} />
          </div>
          <div className="card-info">
            <span className="card-label">Active Projects</span>
            <span className="card-val">{activeProjectsCount}</span>
          </div>
        </div>

        <div className="summary-parchment-card">
          <div className="card-icon-wrapper gold-glow">
            <StarIcon size={24} />
          </div>
          <div className="card-info">
            <span className="card-label">XP Earned</span>
            <span className="card-val highlight-gold">{totalXpEarned.toLocaleString()} XP</span>
          </div>
        </div>

        <div className="summary-parchment-card">
          <div className="card-icon-wrapper amber-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="card-info">
            <span className="card-label">Tasks Due Today</span>
            <span className="card-val">{tasksDueTodayTotal}</span>
          </div>
        </div>

        <div className="summary-parchment-card">
          <div className="card-icon-wrapper green-glow">
            <CheckCircleIcon size={24} />
          </div>
          <div className="card-info">
            <span className="card-label">Completed Tasks</span>
            <span className="card-val highlight-green">{completedTasksTotal}</span>
          </div>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="projects-list-container">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="project-banner-card"
            onClick={() => onSelectProject(proj.id)}
          >
            {/* Left Shield Crest */}
            <div className="banner-shield-wrapper">
              <ProjectShield type={proj.shieldType} color={proj.shieldColor} size={52} />
            </div>

            {/* Title, Subtitle & Progress */}
            <div className="banner-main-info">
              <h2 className="banner-title">{proj.title}</h2>
              <p className="banner-subtitle">{proj.subtitle}</p>

              <div className="banner-progress-group">
                <span className="progress-label">Progress</span>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
                <span className="progress-val-text">{proj.progressPercent}%</span>
              </div>
            </div>

            {/* Right Meta Column 1: Priority & XP */}
            <div className="banner-meta-col">
              <div className="meta-item">
                <span className="meta-heading">Priority</span>
                <span className={`priority-badge priority-${proj.priority.toLowerCase()}`}>
                  {proj.priority}
                </span>
              </div>

              <div className="meta-item">
                <span className="meta-heading">XP Reward</span>
                <span className="xp-reward-text">{proj.xpEarned} XP</span>
              </div>
            </div>

            {/* Right Meta Column 2: Due Today & Total Tasks */}
            <div className="banner-meta-col">
              <div className="meta-item">
                <span className="meta-heading">Tasks Due Today</span>
                <span className="tasks-count-val">📋 {proj.tasksDueTodayCount}</span>
              </div>

              <div className="meta-item">
                <span className="meta-heading">Total Tasks</span>
                <span className="tasks-count-val">🛡️ {proj.totalTasksCount}</span>
              </div>
            </div>

            {/* Bookmark Ribbon */}
            <div className="bookmark-ribbon">★</div>
          </div>
        ))}
      </div>
    </div>
  );
}
