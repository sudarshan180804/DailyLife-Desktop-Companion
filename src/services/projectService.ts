import { Project, QuickAccessLinks } from "../types/project";
import { INITIAL_PROJECTS } from "../data/projectsData";
import { xpService } from "./xpService";

const STORAGE_KEY = "dailylife_projects";

type ProjectListener = (projects: Project[]) => void;
const listeners: Set<ProjectListener> = new Set();

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
  } catch (err) {
    console.error("Failed to load projects from localStorage:", err);
    return INITIAL_PROJECTS;
  }
}

function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save projects to localStorage:", err);
  }
}

function notifyListeners(projects: Project[]): void {
  listeners.forEach((listener) => listener(projects));
}

export const projectService = {
  getProjects(): Project[] {
    return loadProjects();
  },

  getProjectById(id: string): Project | undefined {
    const projects = loadProjects();
    return projects.find((p) => p.id === id);
  },

  addProject(projectData: Partial<Project>): Project {
    const projects = loadProjects();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: projectData.title?.trim() || "Untitled Project",
      subtitle: projectData.subtitle?.trim() || "New project quest",
      description: projectData.description?.trim() || "Project description...",
      currentFocus: projectData.currentFocus?.trim() || "Initial planning phase",
      category: projectData.category || "General / Software",
      tags: projectData.tags || ["Active", "Medium Priority"],
      shieldType: projectData.shieldType || "shield",
      shieldColor: projectData.shieldColor || "blue",
      priority: projectData.priority || "Medium",
      progressPercent: 0,
      xpEarned: 0,
      nextXpReward: 100,
      tasksDueTodayCount: 0,
      totalTasksCount: 0,
      completedTasksCount: 0,
      createdOn: "Today",
      lastUpdated: "Just now",
      dueDate: projectData.dueDate || "No due date",
      quickAccess: projectData.quickAccess || {},
      tasks: [],
      milestones: [
        { id: `m-init-1`, name: "Planning", status: "active" },
        { id: `m-init-2`, name: "Development", status: "locked" },
        { id: `m-init-3`, name: "Release", status: "locked" },
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          type: "added",
          text: `Created project: ${projectData.title}`,
          timestamp: "Just now",
        },
      ],
      resources: [],
    };

    const updated = [newProject, ...projects];
    saveProjects(updated);
    notifyListeners(updated);
    return newProject;
  },

  toggleProjectTaskComplete(projectId: string, taskId: string): Project | null {
    const projects = loadProjects();
    let targetProject: Project | null = null;

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;

      let xpChange = 0;

      const updatedTasks = p.tasks.map((t) => {
        if (t.id !== taskId) return t;

        const isNowCompleted = !t.completed;
        xpChange = isNowCompleted ? t.xpReward : -t.xpReward;

        return { ...t, completed: isNowCompleted };
      });

      if (xpChange > 0) {
        xpService.addXP(xpChange);
      } else if (xpChange < 0) {
        xpService.removeXP(Math.abs(xpChange));
      }

      const completedCount = updatedTasks.filter((t) => t.completed).length;
      const totalCount = updatedTasks.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : p.progressPercent;
      const xpEarned = Math.max(0, p.xpEarned + xpChange);

      const newActivity = {
        id: `act-${Date.now()}`,
        type: xpChange > 0 ? ("completed" as const) : ("updated" as const),
        text: xpChange > 0 ? `Completed task: ${taskId}` : `Uncompleted task: ${taskId}`,
        timestamp: "Just now",
        xpDelta: xpChange > 0 ? xpChange : undefined,
      };

      targetProject = {
        ...p,
        tasks: updatedTasks,
        completedTasksCount: completedCount,
        progressPercent,
        xpEarned,
        lastUpdated: "Just now",
        activities: [newActivity, ...p.activities],
      };

      return targetProject;
    });

    if (targetProject) {
      saveProjects(updated);
      notifyListeners(updated);
    }
    return targetProject;
  },

  updateQuickAccessLinks(projectId: string, links: QuickAccessLinks): Project | null {
    const projects = loadProjects();
    let targetProject: Project | null = null;

    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      targetProject = { ...p, quickAccess: { ...p.quickAccess, ...links } };
      return targetProject;
    });

    if (targetProject) {
      saveProjects(updated);
      notifyListeners(updated);
    }
    return targetProject;
  },

  subscribe(listener: ProjectListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
