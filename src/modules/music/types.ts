export type MusicPlatformService = 'spotify' | 'ytmusic' | 'other';
export type LaunchModeOption = 'app' | 'browser' | 'auto';
export type SortOption = 'manual' | 'recent' | 'most_launched' | 'az';

export interface MusicCategoryItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  isCustom?: boolean;
}

export interface LauncherPlaylist {
  id: string;
  title: string;
  url: string;
  service: MusicPlatformService;
  category: string;
  categories: string[];
  icon: string;
  coverImage?: string;
  description?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  order: number;
  createdAt: number;
  lastOpenedAt?: number;
  launchCount: number;
}

export interface RecentlyOpenedItem {
  id: string;
  playlistId: string;
  title: string;
  url: string;
  service: MusicPlatformService;
  category: string;
  categories?: string[];
  icon: string;
  coverImage?: string;
  openedAt: number;
}

export interface InstalledAppsStatus {
  spotifyInstalled: boolean;
  ytMusicInstalled: boolean;
}

export interface MusicStatsData {
  playlistsLaunched: number;
  streakDays: number;
  totalListenSessions: number;
}

export interface MusicDataPayload {
  playlists: LauncherPlaylist[];
  categories: MusicCategoryItem[];
  recentlyOpened: RecentlyOpenedItem[];
  lastOpenedPlaylistId: string | null;
  preferredService: MusicPlatformService;
  launchMode: LaunchModeOption;
  sortOption: SortOption;
  confirmExternalLaunch: boolean;
  stats: MusicStatsData;
}
