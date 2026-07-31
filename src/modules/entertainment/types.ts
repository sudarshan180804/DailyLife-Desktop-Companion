export type LaunchModeOption = 'app' | 'browser' | 'auto';
export type SortOption = 'manual' | 'recent' | 'most_watched' | 'rating' | 'az';
export type WatchlistStatus = 'Watching' | 'Planned' | 'Completed' | 'Paused' | 'Dropped' | 'Custom';

export interface StreamingServiceConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  websiteUrl: string;
  searchUrlTemplate: string;
  nativeUri?: string;
  exePath?: string;
  preferredLaunchMethod: LaunchModeOption;
  enabled: boolean;
  isCustom?: boolean;
}

export interface EntertainmentCategoryItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  isCustom?: boolean;
}

export interface EntertainmentTitle {
  id: string;
  title: string;
  serviceId: string;
  status: WatchlistStatus;
  currentEpisode: number;
  currentSeason?: number;
  totalEpisodes?: number;
  directUrl: string;
  coverImage?: string;
  icon?: string;
  rating?: number;
  notes?: string;
  category: string;
  categories: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  order: number;
  createdAt: number;
  lastWatchedAt?: number;
  watchCount: number;
}

export interface RecentlyWatchedItem {
  id: string;
  titleId: string;
  title: string;
  serviceId: string;
  episode: number;
  season?: number;
  directUrl: string;
  icon?: string;
  coverImage?: string;
  watchedAt: number;
}

export interface EntertainmentStatsData {
  titlesWatched: number;
  episodesWatched: number;
  totalSessions: number;
  streakDays: number;
}

export interface EntertainmentDataPayload {
  titles: EntertainmentTitle[];
  services: StreamingServiceConfig[];
  categories: EntertainmentCategoryItem[];
  recentlyWatched: RecentlyWatchedItem[];
  lastWatchedTitleId: string | null;
  selectedSearchServiceId: string;
  sortOption: SortOption;
  launchMode: LaunchModeOption;
  confirmExternalLaunch: boolean;
  stats: EntertainmentStatsData;
}
