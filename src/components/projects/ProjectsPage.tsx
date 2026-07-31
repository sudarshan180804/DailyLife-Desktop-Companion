import { useState } from "react";
import { useProjectStore } from "../../modules/projects";
import { ProjectsOverview } from "./ProjectsOverview";
import { ProjectDetail } from "./ProjectDetail";
import { NewProjectModal } from "./NewProjectModal";

export function ProjectsPage() {
  const { projects, createProject } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreateProject = async (projectData: any) => {
    const created = await createProject(projectData);
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
