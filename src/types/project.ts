export type Priority = "Low" | "Medium" | "High";

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  xpReward: number;
  completed: boolean;
  dueDate?: string;
}

export interface Milestone {
  id: string;
  name: string;
  status: "completed" | "active" | "locked";
}

export interface ActivityItem {
  id: string;
  type: "completed" | "updated" | "added";
  text: string;
  timestamp: string;
  xpDelta?: number;
}

export interface QuickAccessLinks {
  unrealEngine?: string;
  projectFolder?: string;
  gitRepo?: string;
  pptPresentation?: string;
  referencesFolder?: string;
  chatGptUrl?: string;
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
  activities: ActivityItem[];
  resources: { name: string; path?: string }[];
}
