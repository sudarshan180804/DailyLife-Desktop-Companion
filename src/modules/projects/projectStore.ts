import { useSyncExternalStore } from "react";
import { projectServiceModule, ProjectService } from "./projectService";
import { eventBus } from "../../services/eventBus";
import {
  Project,
  ProjectTask,
  CreateProjectTaskInput,
  Milestone,
  CreateMilestoneInput,
  ProjectFileItem,
  CreateProjectInput,
  QuickAccessLinks,
} from "./types";

/**
 * State structure exposed by ProjectStore.
 */
export interface ProjectStoreState {
  projects: Project[];
  loading: boolean;
}

/**
 * Asynchronous actions exposed by ProjectStore.
 */
export interface ProjectStoreActions {
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (
    id: string,
    updates: Partial<Project>
  ) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<boolean>;
  toggleProjectTask: (
    projectId: string,
    taskId: string
  ) => Promise<Project | undefined>;
  updateQuickAccessLinks: (
    projectId: string,
    links: QuickAccessLinks
  ) => Promise<Project | undefined>;
  addProjectTask: (
    projectId: string,
    input: CreateProjectTaskInput
  ) => Promise<Project | undefined>;
  updateProjectTask: (
    projectId: string,
    taskId: string,
    updates: Partial<ProjectTask>
  ) => Promise<Project | undefined>;
  deleteProjectTask: (
    projectId: string,
    taskId: string
  ) => Promise<Project | undefined>;
  toggleProjectSubtask: (
    projectId: string,
    taskId: string,
    subtaskId: string
  ) => Promise<Project | undefined>;
  addMilestone: (
    projectId: string,
    input: CreateMilestoneInput
  ) => Promise<Project | undefined>;
  updateMilestone: (
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ) => Promise<Project | undefined>;
  deleteMilestone: (
    projectId: string,
    milestoneId: string
  ) => Promise<Project | undefined>;
  addProjectNote: (
    projectId: string,
    title: string,
    content: string,
    tags?: string[]
  ) => Promise<Project | undefined>;
  updateProjectNote: (
    projectId: string,
    noteId: string,
    title: string,
    content: string,
    tags?: string[]
  ) => Promise<Project | undefined>;
  deleteProjectNote: (
    projectId: string,
    noteId: string
  ) => Promise<Project | undefined>;
  addProjectFileItem: (
    projectId: string,
    item: Omit<ProjectFileItem, "id">
  ) => Promise<Project | undefined>;
  deleteProjectFileItem: (
    projectId: string,
    itemId: string
  ) => Promise<Project | undefined>;
  openLink: (urlOrPath: string) => Promise<boolean>;
  launchApp: (exePath: string, args?: string) => Promise<boolean>;
  openFolder: (folderPath: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * ProjectStore acts as the single source of truth for Project state in React.
 * Wraps ProjectService, listens to EventBus events, and exposes useSyncExternalStore integration.
 */
export class ProjectStore {
  private state: ProjectStoreState;
  private listeners: Set<() => void> = new Set();
  private service: ProjectService;

  constructor(service: ProjectService = projectServiceModule) {
    this.service = service;
    this.state = {
      projects: this.service.getProjects(),
      loading: false,
    };

    // Subscribe to EventBus project events for automatic real-time state synchronization
    eventBus.subscribe("project:created", () => this.syncFromService());
    eventBus.subscribe("project:updated", () => this.syncFromService());
    eventBus.subscribe("project:deleted", () => this.syncFromService());
    eventBus.subscribe("project:completed", () => this.syncFromService());
  }

  private syncFromService(): void {
    this.state = {
      ...this.state,
      projects: this.service.getProjects(),
    };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): ProjectStoreState => {
    return this.state;
  };

  public async refresh(): Promise<void> {
    this.state = { ...this.state, loading: true };
    this.notify();

    await new Promise((resolve) => setTimeout(resolve, 0));

    this.syncFromService();
    this.state = { ...this.state, loading: false };
    this.notify();
  }

  public async createProject(input: CreateProjectInput): Promise<Project> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const created = this.service.createProject(input);
      this.syncFromService();
      return created;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.updateProject(id, updates);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async deleteProject(id: string): Promise<boolean> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const deleted = this.service.deleteProject(id);
      this.syncFromService();
      return deleted;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async toggleProjectTask(
    projectId: string,
    taskId: string
  ): Promise<Project | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.toggleProjectTask(projectId, taskId);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async updateQuickAccessLinks(
    projectId: string,
    links: QuickAccessLinks
  ): Promise<Project | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.updateQuickAccessLinks(projectId, links);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async addProjectTask(
    projectId: string,
    input: CreateProjectTaskInput
  ): Promise<Project | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.addProjectTask(projectId, input);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async updateProjectTask(
    projectId: string,
    taskId: string,
    updates: Partial<ProjectTask>
  ): Promise<Project | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.updateProjectTask(projectId, taskId, updates);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async deleteProjectTask(
    projectId: string,
    taskId: string
  ): Promise<Project | undefined> {
    this.state = { ...this.state, loading: true };
    this.notify();

    try {
      const updated = this.service.deleteProjectTask(projectId, taskId);
      this.syncFromService();
      return updated;
    } finally {
      this.state = { ...this.state, loading: false };
      this.notify();
    }
  }

  public async toggleProjectSubtask(
    projectId: string,
    taskId: string,
    subtaskId: string
  ): Promise<Project | undefined> {
    const updated = this.service.toggleProjectSubtask(projectId, taskId, subtaskId);
    this.syncFromService();
    return updated;
  }

  public async addMilestone(
    projectId: string,
    input: CreateMilestoneInput
  ): Promise<Project | undefined> {
    const updated = this.service.addMilestone(projectId, input);
    this.syncFromService();
    return updated;
  }

  public async updateMilestone(
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<Project | undefined> {
    const updated = this.service.updateMilestone(projectId, milestoneId, updates);
    this.syncFromService();
    return updated;
  }

  public async deleteMilestone(
    projectId: string,
    milestoneId: string
  ): Promise<Project | undefined> {
    const updated = this.service.deleteMilestone(projectId, milestoneId);
    this.syncFromService();
    return updated;
  }

  public async addProjectNote(
    projectId: string,
    title: string,
    content: string,
    tags?: string[]
  ): Promise<Project | undefined> {
    const updated = this.service.addProjectNote(projectId, title, content, tags);
    this.syncFromService();
    return updated;
  }

  public async updateProjectNote(
    projectId: string,
    noteId: string,
    title: string,
    content: string,
    tags?: string[]
  ): Promise<Project | undefined> {
    const updated = this.service.updateProjectNote(projectId, noteId, title, content, tags);
    this.syncFromService();
    return updated;
  }

  public async deleteProjectNote(
    projectId: string,
    noteId: string
  ): Promise<Project | undefined> {
    const updated = this.service.deleteProjectNote(projectId, noteId);
    this.syncFromService();
    return updated;
  }

  public async addProjectFileItem(
    projectId: string,
    item: Omit<ProjectFileItem, "id">
  ): Promise<Project | undefined> {
    const updated = this.service.addProjectFileItem(projectId, item);
    this.syncFromService();
    return updated;
  }

  public async deleteProjectFileItem(
    projectId: string,
    itemId: string
  ): Promise<Project | undefined> {
    const updated = this.service.deleteProjectFileItem(projectId, itemId);
    this.syncFromService();
    return updated;
  }

  public async openLink(urlOrPath: string): Promise<boolean> {
    return this.service.openLink(urlOrPath);
  }

  public async launchApp(exePath: string, args?: string): Promise<boolean> {
    return this.service.launchApp(exePath, args);
  }

  public async openFolder(folderPath: string): Promise<boolean> {
    return this.service.openFolder(folderPath);
  }
}

/**
 * Global singleton instance of ProjectStore.
 */
export const projectStore = new ProjectStore();

/**
 * Custom React hook for subscribing to ProjectStore state and async actions.
 */
export function useProjectStore(): ProjectStoreState & ProjectStoreActions {
  const state = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getSnapshot
  );

  return {
    ...state,
    createProject: (input) => projectStore.createProject(input),
    updateProject: (id, updates) => projectStore.updateProject(id, updates),
    deleteProject: (id) => projectStore.deleteProject(id),
    toggleProjectTask: (projectId, taskId) =>
      projectStore.toggleProjectTask(projectId, taskId),
    updateQuickAccessLinks: (projectId, links) =>
      projectStore.updateQuickAccessLinks(projectId, links),
    addProjectTask: (projectId, input) =>
      projectStore.addProjectTask(projectId, input),
    updateProjectTask: (projectId, taskId, updates) =>
      projectStore.updateProjectTask(projectId, taskId, updates),
    deleteProjectTask: (projectId, taskId) =>
      projectStore.deleteProjectTask(projectId, taskId),
    toggleProjectSubtask: (projectId, taskId, subtaskId) =>
      projectStore.toggleProjectSubtask(projectId, taskId, subtaskId),
    addMilestone: (projectId, input) =>
      projectStore.addMilestone(projectId, input),
    updateMilestone: (projectId, milestoneId, updates) =>
      projectStore.updateMilestone(projectId, milestoneId, updates),
    deleteMilestone: (projectId, milestoneId) =>
      projectStore.deleteMilestone(projectId, milestoneId),
    addProjectNote: (projectId, title, content, tags) =>
      projectStore.addProjectNote(projectId, title, content, tags),
    updateProjectNote: (projectId, noteId, title, content, tags) =>
      projectStore.updateProjectNote(projectId, noteId, title, content, tags),
    deleteProjectNote: (projectId, noteId) =>
      projectStore.deleteProjectNote(projectId, noteId),
    addProjectFileItem: (projectId, item) =>
      projectStore.addProjectFileItem(projectId, item),
    deleteProjectFileItem: (projectId, itemId) =>
      projectStore.deleteProjectFileItem(projectId, itemId),
    openLink: (urlOrPath) => projectStore.openLink(urlOrPath),
    launchApp: (exePath, args) => projectStore.launchApp(exePath, args),
    openFolder: (folderPath) => projectStore.openFolder(folderPath),
    refresh: () => projectStore.refresh(),
  };
}
