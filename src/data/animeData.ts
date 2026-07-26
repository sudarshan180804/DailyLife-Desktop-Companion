import {
  ContinueWatchingAnime,
  CurrentlyWatchingAnime,
  QueueAnimeItem,
  StreamingPlatform,
  AnimeStudyDeck,
  AnimeStatsData,
} from "../types/anime";

export const MOCK_CONTINUE_WATCHING: ContinueWatchingAnime = {
  id: "anime-fairy-tail",
  title: "FAIRY TAIL",
  episodeNumber: 127,
  episodeTitle: "The Flame Dragon King",
  currentTime: "18:42",
  totalTime: "24:10",
  progressPercent: 77,
  coverImage:
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
};

export const MOCK_CURRENTLY_WATCHING: CurrentlyWatchingAnime[] = [
  {
    id: "cw-1",
    title: "One Piece",
    episodeText: "Episode 1123",
    progressPercent: 72,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "cw-2",
    title: "Jujutsu Kaisen",
    episodeText: "Episode 42",
    progressPercent: 45,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "cw-3",
    title: "Demon Slayer: Kimetsu no Yaiba",
    episodeText: "Episode 11",
    progressPercent: 30,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&auto=format&fit=crop",
  },
];

export const MOCK_QUEUE_ITEMS: QueueAnimeItem[] = [
  {
    id: "q-1",
    order: 1,
    title: "Attack on Titan",
    seasonEpText: "Season 4 Part 2 • Ep 21",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "q-2",
    order: 2,
    title: "My Hero Academia",
    seasonEpText: "Season 6 • Ep 13",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "q-3",
    order: 3,
    title: "Hunter x Hunter (2011)",
    seasonEpText: "Episode 76",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "q-4",
    order: 4,
    title: "Dr. Stone",
    seasonEpText: "Season 3 • Ep 4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "q-5",
    order: 5,
    title: "Vinland Saga",
    seasonEpText: "Season 2 • Ep 8",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=300&auto=format&fit=crop",
  },
];

export const MOCK_STREAMING_PLATFORMS: StreamingPlatform[] = [
  {
    id: "sp-crunchyroll",
    name: "Crunchyroll",
    subtitle: "Anime & Simulcasts",
    iconSymbol: "🟧",
    badgeColor: "orange",
    url: "https://www.crunchyroll.com",
  },
  {
    id: "sp-netflix",
    name: "Netflix",
    subtitle: "Anime Series & Movies",
    iconSymbol: "🟥",
    badgeColor: "red",
    url: "https://www.netflix.com",
  },
  {
    id: "sp-prime",
    name: "Prime Video",
    subtitle: "Anime Channels",
    iconSymbol: "🟦",
    badgeColor: "blue",
    url: "https://www.primevideo.com",
  },
  {
    id: "sp-youtube",
    name: "YouTube",
    subtitle: "Clips & Trailers",
    iconSymbol: "▶️",
    badgeColor: "youtube",
    url: "https://www.youtube.com",
  },
];

export const MOCK_STUDY_DECKS: AnimeStudyDeck[] = [
  {
    id: "deck-anime-vocab",
    title: "Anime Vocabulary",
    cardCount: 320,
    iconSymbol: "📘",
    badgeColor: "purple",
  },
  {
    id: "deck-jp-phrases",
    title: "Japanese Phrases",
    cardCount: 210,
    iconSymbol: "💬",
    badgeColor: "pink",
  },
  {
    id: "deck-kanji-anime",
    title: "Kanji (For Anime)",
    cardCount: 180,
    iconSymbol: "名",
    badgeColor: "green",
  },
  {
    id: "deck-grammar-pts",
    title: "Grammar Points",
    cardCount: 150,
    iconSymbol: "⛩️",
    badgeColor: "blue",
  },
];

export const MOCK_ANIME_STATS: AnimeStatsData = {
  xpCurrent: 1240,
  xpTarget: 2000,
  streakDays: 18,
  episodesWatched: 362,
  seriesCompleted: 24,
  hoursWatched: 156,
};
