export interface NowPlayingTrack {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  currentTime: string;
  totalTime: string;
  progressPercent: number;
  coverImage: string;
  isFavorite: boolean;
  isPlaying: boolean;
}

export interface RecentlyPlayedItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  coverImage: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  songCount: number;
  coverImage: string;
}

export interface MusicStreamingPlatform {
  id: string;
  name: string;
  iconSymbol: string;
  badgeColor: string;
  url?: string;
}

export interface MusicStatsData {
  xpCurrent: number;
  xpTarget: number;
  streakDays: number;
  songsPlayed: number;
}
