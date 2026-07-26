import { useState, useEffect } from "react";
import { Project } from "../../types/project";
import { projectService } from "../../services/projectService";
import { ProjectsOverview } from "./ProjectsOverview";
import { ProjectDetail } from "./ProjectDetail";
import { NewProjectModal } from "./NewProjectModal";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = projectService.subscribe((updatedProjects) => {
      setProjects(updatedProjects);
    });
    return () => unsubscribe();
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreateProject = (projectData: any) => {
    const created = projectService.addProject(projectData);
    setSelectedProjectId(created.id);
  };

  return (
    <div className="projects-page-wrapper">
      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <ProjectsOverview
          projects={projects}
          onSelectProject={(id) => setSelectedProjectId(id)}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        />
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleCreateProject}
      />
    </div>
  );
}
