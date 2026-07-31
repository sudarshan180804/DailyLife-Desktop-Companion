export interface ContinueWatchingAnime {
  id: string;
  title: string;
  episodeNumber: number;
  episodeTitle: string;
  currentTime: string;
  totalTime: string;
  progressPercent: number;
  coverImage: string;
}

export interface CurrentlyWatchingAnime {
  id: string;
  title: string;
  episodeText: string;
  progressPercent: number;
  thumbnailUrl: string;
}

export interface QueueAnimeItem {
  id: string;
  order: number;
  title: string;
  seasonEpText: string;
  thumbnailUrl: string;
}

export interface StreamingPlatform {
  id: string;
  name: string;
  subtitle: string;
  iconSymbol: string;
  badgeColor: string;
  url?: string;
}

export interface AnimeStudyDeck {
  id: string;
  title: string;
  cardCount: number;
  iconSymbol: string;
  badgeColor: string;
}

export interface AnimeStatsData {
  xpCurrent: number;
  xpTarget: number;
  streakDays: number;
  episodesWatched: number;
  seriesCompleted: number;
  hoursWatched: number;
}
