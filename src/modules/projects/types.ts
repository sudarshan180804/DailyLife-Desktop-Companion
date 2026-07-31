export type Priority = "Low" | "Medium" | "High";

export interface ProjectSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  xpReward: number;
  completed: boolean;
  dueDate?: string;
  status?: "todo" | "in_progress" | "done";
  notes?: string;
  subtasks?: ProjectSubtask[];
}

export interface CreateProjectTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  xpReward?: number;
  dueDate?: string;
  status?: "todo" | "in_progress" | "done";
  notes?: string;
  subtasks?: { title: string; completed?: boolean }[];
}

export interface Milestone {
  id: string;
  name: string;
  status: "completed" | "active" | "locked";
  targetDate?: string;
  xpReward?: number;
  description?: string;
  linkedTaskIds?: string[];
}

export interface CreateMilestoneInput {
  name: string;
  status?: "completed" | "active" | "locked";
  targetDate?: string;
  xpReward?: number;
  description?: string;
  linkedTaskIds?: string[];
}

export interface ActivityItem {
  id: string;
  type: "completed" | "updated" | "added";
  text: string;
  timestamp: string;
  xpDelta?: number;
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface ProjectFileItem {
  id: string;
  name: string;
  type: "file" | "folder" | "app" | "url";
  pathOrUrl: string;
  args?: string;
  icon?: string;
  category?: string;
}

export interface QuickAccessLinks {
  unrealEngine?: string;
  projectFolder?: string;
  gitRepo?: string;
  pptPresentation?: string;
  referencesFolder?: string;
  chatGptUrl?: string;
}

export interface ConfiguredApp {
  id: string;
  name: string;
  exePath: string;
  args?: string;
  icon?: string;
}

export interface ConfiguredFolder {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export interface ConfiguredLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  currentFocus: string;
  category: string;
  tags: string[];
  shieldType: "caduceus" | "flame" | "axes" | "book" | "shield";
  shieldColor: "blue" | "purple" | "green" | "bronze";
  priority: Priority;
  progressPercent: number;
  xpEarned: number;
  nextXpReward: number;
  tasksDueTodayCount: number;
  totalTasksCount: number;
  completedTasksCount: number;
  createdOn: string;
  lastUpdated: string;
  dueDate?: string;
  quickAccess: QuickAccessLinks;
  tasks: ProjectTask[];
  milestones: Milestone[];
  projectNotes?: ProjectNote[];
  fileItems?: ProjectFileItem[];
  activities: ActivityItem[];
  resources: { name: string; path?: string }[];
  apps?: ConfiguredApp[];
  folders?: ConfiguredFolder[];
  links?: ConfiguredLink[];
  bannerUrl?: string;
  iconSymbol?: string;
}

export interface CreateProjectInput {
  title: string;
  subtitle?: string;
  description?: string;
  currentFocus?: string;
  category?: string;
  tags?: string[];
  shieldType?: "caduceus" | "flame" | "axes" | "book" | "shield";
  shieldColor?: "blue" | "purple" | "green" | "bronze";
  priority?: Priority;
  dueDate?: string;
  quickAccess?: QuickAccessLinks;
  apps?: ConfiguredApp[];
  folders?: ConfiguredFolder[];
  links?: ConfiguredLink[];
}

export interface UpdateProjectInput {
  title?: string;
  subtitle?: string;
  description?: string;
  currentFocus?: string;
  category?: string;
  tags?: string[];
  shieldType?: "caduceus" | "flame" | "axes" | "book" | "shield";
  shieldColor?: "blue" | "purple" | "green" | "bronze";
  priority?: Priority;
  dueDate?: string;
  quickAccess?: QuickAccessLinks;
  apps?: ConfiguredApp[];
  folders?: ConfiguredFolder[];
  links?: ConfiguredLink[];
  bannerUrl?: string;
  iconSymbol?: string;
}
