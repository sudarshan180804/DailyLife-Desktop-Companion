import { useProjectStore } from "../../../modules/projects";

interface WidgetProps {
  widgetId: string;
  onNavigateToModule?: (tabId: string) => void;
}

export function ProjectsWidget({ onNavigateToModule }: WidgetProps) {
  const { projects } = useProjectStore();

  const activeProjects = projects.slice(0, 3);

  return (
    <div className="home-widget-body">
      <div className="widget-header-row">
        <div className="widget-title-group">
          <span className="widget-icon">🚀</span>
          <h3 className="widget-title-text">Active Projects & Milestones</h3>
          <span className="widget-count-badge">{projects.length} Active</span>
        </div>

        <button
          className="widget-nav-link"
          onClick={() => onNavigateToModule && onNavigateToModule("projects")}
        >
          Open Projects Hub →
        </button>
      </div>

      <div className="widget-projects-grid">
        {activeProjects.map((p) => (
          <div key={p.id} className="widget-project-card">
            <div className="project-card-top">
              <span className="project-card-title">{p.title}</span>
              <span className="project-card-xp">+{p.xpEarned || 100} XP</span>
            </div>
            <p className="project-card-snippet">{p.description.slice(0, 90)}...</p>

            <div className="project-card-progress">
              <div
                className="project-progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((p.completedTasksCount / Math.max(1, p.tasksDueTodayCount + p.completedTasksCount)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
