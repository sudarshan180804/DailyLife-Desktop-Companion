import { Project } from "../../modules/projects/types";

interface ProjectActivityTabProps {
  project: Project;
}

export function ProjectActivityTab({ project }: ProjectActivityTabProps) {
  return (
    <div className="project-activity-tab-wrapper">
      <div className="detail-card activity-card">
        <h3 className="card-heading">Chronological Activity Log ({project.activities.length})</h3>

        <div className="activity-timeline-list">
          {project.activities.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-state-icon">🕒</span>
              <h4 className="empty-state-title">No Recorded Activity</h4>
              <p className="empty-state-description">Activities will automatically log here as tasks are completed or settings are updated.</p>
            </div>
          ) : (
            project.activities.map((act) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
