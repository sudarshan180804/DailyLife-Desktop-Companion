import { storageService } from "../../services/storageService";
import { eventBus } from "../../services/eventBus";
import { xpService } from "../../services/xpService";
import { profileService } from "../../services/profileService";
import { notificationService } from "../../services/notificationService";
import { nativeDialogService } from "../../services/nativeDialogService";
import { STORAGE_KEYS } from "../../constants/appConstants";
import { INITIAL_PROJECTS } from "../../data/projectsData";
import {
  Project,
  ProjectTask,
  CreateProjectTaskInput,
  Milestone,
  CreateMilestoneInput,
  ProjectNote,
  ProjectFileItem,
  CreateProjectInput,
  QuickAccessLinks,
} from "./types";

const STORAGE_KEY = STORAGE_KEYS.PROJECTS;

/**
 * Modular ProjectService implementing project lifecycle management, task toggles,
 * link launching, XP rewards, profile stat integration, and EventBus publications.
 */
export class ProjectService {
  private projects: Project[] = [];

  constructor() {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const saved = await storageService.load<Project[]>(STORAGE_KEY);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        this.projects = saved;
      } else {
        this.projects = [...INITIAL_PROJECTS];
        await storageService.save(STORAGE_KEY, this.projects);
      }
      eventBus.emit("project:updated", { projectId: "all", project: undefined as any });
    } catch (err) {
      console.error("[ProjectService] Failed to load projects from StorageService:", err);
      this.projects = [...INITIAL_PROJECTS];
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.save(STORAGE_KEY, this.projects);
    } catch (err) {
      console.error("[ProjectService] Failed to persist projects:", err);
    }
  }

  /**
   * Retrieves all projects.
   */
  getProjects(): Project[] {
    return [...this.projects];
  }

  /**
   * Retrieves a project by unique ID.
   *
   * @param id Unique project identifier.
   */
  getProject(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  /**
   * Creates a new project.
   * Emits 'project:created' event via EventBus and notifies.
   *
   * @param input CreateProjectInput data payload.
   */
  createProject(input: CreateProjectInput): Project {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: input.title.trim() || "Untitled Project",
      subtitle: input.subtitle?.trim() || "New project quest",
      description: input.description?.trim() || "Project description...",
      currentFocus: input.currentFocus?.trim() || "Initial planning phase",
      category: input.category || "General / Software",
      tags: input.tags || ["Active", "Medium Priority"],
      shieldType: input.shieldType || "shield",
      shieldColor: input.shieldColor || "blue",
      priority: input.priority || "Medium",
      progressPercent: 0,
      xpEarned: 0,
      nextXpReward: 500,
      tasksDueTodayCount: 0,
      totalTasksCount: 0,
      completedTasksCount: 0,
      createdOn: "Today",
      lastUpdated: "Just now",
      dueDate: input.dueDate || "No due date",
      quickAccess: input.quickAccess || {},
      apps: input.apps || [],
      folders: input.folders || [],
      links: input.links || [],
      tasks: [],
      milestones: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          type: "added",
          text: `Created project: ${input.title}`,
          timestamp: "Just now",
        },
      ],
      resources: [],
    };

    this.projects = [newProject, ...this.projects];
    this.persist();

    eventBus.emit("project:created", { projectId: newProject.id, project: newProject });
    notificationService.notify("success", `Created project "${newProject.title}"`, "New Project Quest");

    return newProject;
  }

  /**
   * Updates an existing project by ID.
   * Emits 'project:updated' event via EventBus.
   *
   * @param id Unique project identifier.
   * @param updates Partial project fields.
   */
  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const existing = this.projects[index];
    const updatedProject: Project = {
      ...existing,
      ...updates,
      id: existing.id,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId: id, project: updatedProject });
    return updatedProject;
  }

  /**
   * Deletes a project by ID.
   * Emits 'project:deleted' event via EventBus.
   *
   * @param id Unique project identifier.
   * @returns True if deleted, false if not found.
   */
  deleteProject(id: string): boolean {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter((p) => p.id !== id);

    if (this.projects.length < initialLength) {
      this.persist();
      eventBus.emit("project:deleted", { projectId: id });
      return true;
    }
    return false;
  }

  /**
   * Toggles task completion within a project.
   * Automatically updates project progress percentage, awards task XP via XPService,
   * awards bonus XP on project 100% completion, and updates profile stats.
   *
   * @param projectId Target project identifier.
   * @param taskId Target task identifier inside project.
   */
  toggleProjectTask(projectId: string, taskId: string): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    let xpChange = 0;

    const updatedTasks = project.tasks.map((t) => {
      if (t.id !== taskId) return t;

      const isNowCompleted = !t.completed;
      xpChange = isNowCompleted ? t.xpReward : -t.xpReward;
      return { ...t, completed: isNowCompleted };
    });

    if (xpChange > 0) {
      xpService.awardXP(xpChange, `Project Task: ${taskId}`);
    } else if (xpChange < 0) {
      xpService.removeXP(Math.abs(xpChange));
    }

    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const totalCount = updatedTasks.length;
    const prevPercent = project.progressPercent;
    const progressPercent =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : prevPercent;

    const xpEarned = Math.max(0, project.xpEarned + xpChange);
    const wasCompletedBefore = prevPercent === 100;
    const isNowCompleted = progressPercent === 100;

    // Check project 100% completion bonus
    if (!wasCompletedBefore && isNowCompleted) {
      const bonusXP = project.nextXpReward || 500;
      xpService.awardXP(bonusXP, `Completed project quest: ${project.title}`);
      
      const currentStats = profileService.getProfile().stats;
      profileService.updateStats({ projectsCompleted: currentStats.projectsCompleted + 1 });

      notificationService.notify(
        "achievement",
        `🎉 Project "${project.title}" 100% Complete! (+${bonusXP} XP)`,
        "Project Quest Cleared!"
      );
      eventBus.emit("project:completed", {
        projectId: project.id,
        xpReward: bonusXP,
        project,
      });
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      type: xpChange > 0 ? ("completed" as const) : ("updated" as const),
      text: xpChange > 0 ? `Completed task in ${project.title}` : `Uncompleted task in ${project.title}`,
      timestamp: "Just now",
      xpDelta: xpChange > 0 ? xpChange : undefined,
    };

    const updatedProject: Project = {
      ...project,
      tasks: updatedTasks,
      completedTasksCount: completedCount,
      progressPercent,
      xpEarned,
      lastUpdated: "Just now",
      activities: [newActivity, ...project.activities],
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  /**
   * Creates a new task inside a project and recalculates overall project progress.
   *
   * @param projectId Target project identifier.
   * @param input CreateProjectTaskInput parameters.
   */
  addProjectTask(projectId: string, input: CreateProjectTaskInput): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];

    const newTask: ProjectTask = {
      id: `ptask-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: input.title,
      description: input.description || "",
      priority: input.priority || "Medium",
      xpReward: input.xpReward || 25,
      completed: input.status === "done",
      dueDate: input.dueDate || "Today",
      status: input.status || "todo",
      notes: input.notes || "",
      subtasks: input.subtasks?.map((st, sIdx) => ({
        id: `st-${Date.now()}-${sIdx}`,
        title: st.title,
        completed: !!st.completed,
      })) || [],
    };

    const updatedTasks = [...project.tasks, newTask];
    const totalCount = updatedTasks.length;
    const completedCount = updatedTasks.filter((t) => t.completed || t.status === "done").length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const newActivity = {
      id: `act-${Date.now()}`,
      type: "added" as const,
      text: `Added task "${newTask.title}" to ${project.title}`,
      timestamp: "Just now",
    };

    const updatedProject: Project = {
      ...project,
      tasks: updatedTasks,
      totalTasksCount: totalCount,
      completedTasksCount: completedCount,
      progressPercent,
      lastUpdated: "Just now",
      activities: [newActivity, ...project.activities],
    };

    this.projects[index] = updatedProject;
    this.persist();

    notificationService.notify("success", `Task "${newTask.title}" added to ${project.title}`, "Task Created");
    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  /**
   * Updates an existing project task and recalculates project progress.
   *
   * @param projectId Target project identifier.
   * @param taskId Target task identifier.
   * @param updates Partial task attributes.
   */
  updateProjectTask(
    projectId: string,
    taskId: string,
    updates: Partial<ProjectTask>
  ): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const updatedTasks = project.tasks.map((t) => {
      if (t.id !== taskId) return t;
      const isCompleted = updates.status ? updates.status === "done" : updates.completed ?? t.completed;
      return {
        ...t,
        ...updates,
        completed: isCompleted,
        status: updates.status || (isCompleted ? "done" : t.status || "todo"),
      };
    });

    const totalCount = updatedTasks.length;
    const completedCount = updatedTasks.filter((t) => t.completed || t.status === "done").length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const updatedProject: Project = {
      ...project,
      tasks: updatedTasks,
      totalTasksCount: totalCount,
      completedTasksCount: completedCount,
      progressPercent,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  /**
   * Deletes a task from a project and updates total/completed metrics.
   *
   * @param projectId Target project identifier.
   * @param taskId Target task identifier to delete.
   */
  deleteProjectTask(projectId: string, taskId: string): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const updatedTasks = project.tasks.filter((t) => t.id !== taskId);

    const totalCount = updatedTasks.length;
    const completedCount = updatedTasks.filter((t) => t.completed || t.status === "done").length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const updatedProject: Project = {
      ...project,
      tasks: updatedTasks,
      totalTasksCount: totalCount,
      completedTasksCount: completedCount,
      progressPercent,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    notificationService.notify("info", `Deleted task from ${project.title}`, "Task Removed");
    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  /**
   * Toggles a subtask completion status inside a project task.
   *
   * @param projectId Target project identifier.
   * @param taskId Target parent task identifier.
   * @param subtaskId Target subtask identifier.
   */
  toggleProjectSubtask(
    projectId: string,
    taskId: string,
    subtaskId: string
  ): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const updatedTasks = project.tasks.map((task) => {
      if (task.id !== taskId || !task.subtasks) return task;

      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );

      return {
        ...task,
        subtasks: updatedSubtasks,
      };
    });

    const updatedProject: Project = {
      ...project,
      tasks: updatedTasks,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  /**
   * Updates quick access links for a project.
   *
   * @param projectId Target project identifier.
   * @param links QuickAccessLinks payload.
   */
  updateQuickAccessLinks(projectId: string, links: QuickAccessLinks): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const updatedProject: Project = {
      ...project,
      quickAccess: { ...project.quickAccess, ...links },
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  /**
   * Safely opens a web URL in the default browser.
   *
   * @param urlOrPath Target URL.
   */
  async openLink(urlOrPath: string): Promise<boolean> {
    if (!urlOrPath) return false;
    return nativeDialogService.openWebLink(urlOrPath);
  }

  /**
   * Launches any application, executable, script, or associated project document.
   *
   * @param exePath Target file or application path.
   * @param args Command-line arguments.
   */
  async launchApp(exePath: string, args?: string): Promise<boolean> {
    if (!exePath) return false;
    const isValid = await nativeDialogService.validatePath(exePath);
    if (!isValid) {
      notificationService.notify(
        "warning",
        `⚠️ Target file or application does not exist on disk:\n${exePath}`,
        "File Not Found"
      );
      return false;
    }
    const fileType = nativeDialogService.detectFileType(exePath);
    notificationService.notify("info", `🚀 Opening ${fileType}: ${exePath} ${args || ""}`.trim(), "Launching Entry");
    return nativeDialogService.launchAppOrFile(exePath, args);
  }

  /**
   * Opens a directory folder path in Windows Explorer with validation.
   *
   * @param folderPath Folder path.
   */
  async openFolder(folderPath: string): Promise<boolean> {
    if (!folderPath) return false;
    const isValid = await nativeDialogService.validatePath(folderPath);
    if (!isValid) {
      notificationService.notify(
        "warning",
        `⚠️ Directory path does not exist on disk:\n${folderPath}`,
        "Folder Not Found"
      );
      return false;
    }
    notificationService.notify("info", `📁 Opening directory in Explorer: ${folderPath}`, "Opening Folder");
    return nativeDialogService.openFolderExplorer(folderPath);
  }

  /**
   * Validates if a file or folder path exists on disk.
   */
  async validatePath(path: string): Promise<boolean> {
    return nativeDialogService.validatePath(path);
  }

  // ==========================================================================
  // MILESTONE METHODS
  // ==========================================================================

  addMilestone(projectId: string, input: CreateMilestoneInput): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      name: input.name,
      status: input.status || "active",
      targetDate: input.targetDate || "TBD",
      xpReward: input.xpReward || 100,
      description: input.description || "",
      linkedTaskIds: input.linkedTaskIds || [],
    };

    const updatedMilestones = [...project.milestones, newMilestone];
    const updatedProject: Project = {
      ...project,
      milestones: updatedMilestones,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    notificationService.notify("success", `Milestone "${newMilestone.name}" added`, "Milestone Created");
    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  updateMilestone(projectId: string, milestoneId: string, updates: Partial<Milestone>): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    let xpAwarded = 0;

    const updatedMilestones = project.milestones.map((m) => {
      if (m.id !== milestoneId) return m;

      const wasCompleted = m.status === "completed";
      const isNowCompleted = updates.status === "completed";

      if (!wasCompleted && isNowCompleted) {
        xpAwarded = updates.xpReward || m.xpReward || 100;
      }

      return { ...m, ...updates };
    });

    if (xpAwarded > 0) {
      xpService.awardXP(xpAwarded, `Milestone completed: ${milestoneId}`);
      notificationService.notify("achievement", `🏆 Milestone Completed! (+${xpAwarded} XP)`, "Milestone Cleared!");
    }

    const updatedProject: Project = {
      ...project,
      milestones: updatedMilestones,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  deleteMilestone(projectId: string, milestoneId: string): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const updatedMilestones = project.milestones.filter((m) => m.id !== milestoneId);

    const updatedProject: Project = {
      ...project,
      milestones: updatedMilestones,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  // ==========================================================================
  // PROJECT NOTES METHODS
  // ==========================================================================

  addProjectNote(projectId: string, title: string, content: string, tags: string[] = []): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const newNote: ProjectNote = {
      id: `pnote-${Date.now()}`,
      title,
      content,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: "Just now",
      tags,
    };

    const existingNotes = project.projectNotes || [];
    const updatedProject: Project = {
      ...project,
      projectNotes: [newNote, ...existingNotes],
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    notificationService.notify("success", `Project Note "${title}" created`, "Note Saved");
    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  updateProjectNote(projectId: string, noteId: string, title: string, content: string, tags?: string[]): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const existingNotes = project.projectNotes || [];
    const updatedNotes = existingNotes.map((n) =>
      n.id === noteId
        ? {
            ...n,
            title,
            content,
            tags: tags || n.tags,
            updatedAt: "Just now",
          }
        : n
    );

    const updatedProject: Project = {
      ...project,
      projectNotes: updatedNotes,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  deleteProjectNote(projectId: string, noteId: string): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const existingNotes = project.projectNotes || [];
    const updatedNotes = existingNotes.filter((n) => n.id !== noteId);

    const updatedProject: Project = {
      ...project,
      projectNotes: updatedNotes,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  // ==========================================================================
  // FILE ITEMS & RESOURCES METHODS
  // ==========================================================================

  addProjectFileItem(projectId: string, item: Omit<ProjectFileItem, "id">): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const newItem: ProjectFileItem = {
      id: `pfile-${Date.now()}`,
      ...item,
    };

    const existingFiles = project.fileItems || [];
    const updatedProject: Project = {
      ...project,
      fileItems: [...existingFiles, newItem],
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    notificationService.notify("success", `File/Resource "${item.name}" added`, "Resource Added");
    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }

  deleteProjectFileItem(projectId: string, itemId: string): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    const project = this.projects[index];
    const existingFiles = project.fileItems || [];
    const updatedFiles = existingFiles.filter((f) => f.id !== itemId);

    const updatedProject: Project = {
      ...project,
      fileItems: updatedFiles,
      lastUpdated: "Just now",
    };

    this.projects[index] = updatedProject;
    this.persist();

    eventBus.emit("project:updated", { projectId, project: updatedProject });
    return updatedProject;
  }
}

/**
 * Global singleton instance of ProjectService.
 */
export const projectServiceModule = new ProjectService();
