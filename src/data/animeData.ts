import { EntertainmentTitle, EntertainmentStatsData } from "../types/entertainment";

export const MOCK_CONTINUE_WATCHING: EntertainmentTitle = {
  id: "anime-fairy-tail",
  title: "FAIRY TAIL",
  serviceId: "service-crunchyroll",
  status: "Watching",
  currentEpisode: 127,
  totalEpisodes: 328,
  directUrl: "https://www.crunchyroll.com/series/G6V893V76/fairy-tail",
  coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
  icon: "⛩️",
  rating: 5,
  notes: "The Flame Dragon King Arc",
  category: "Anime",
  categories: ["Anime"],
  isFavorite: true,
  isPinned: true,
  order: 0,
  createdAt: Date.now() - 86400000 * 30,
  lastWatchedAt: Date.now() - 3600000 * 2,
  watchCount: 45,
};

export const MOCK_CURRENTLY_WATCHING: EntertainmentTitle[] = [
  {
    id: "cw-1",
    title: "One Piece",
    serviceId: "service-crunchyroll",
    status: "Watching",
    currentEpisode: 1123,
    directUrl: "https://www.crunchyroll.com/series/GRMG8WEWY/one-piece",
    icon: "⛩️",
    category: "Anime",
    categories: ["Anime"],
    order: 1,
    createdAt: Date.now() - 86400000 * 60,
    watchCount: 120,
  },
  {
    id: "cw-2",
    title: "Jujutsu Kaisen",
    serviceId: "service-crunchyroll",
    status: "Watching",
    currentEpisode: 42,
    directUrl: "https://www.crunchyroll.com/series/G6W4D0796/jujutsu-kaisen",
    icon: "⛩️",
    category: "Anime",
    categories: ["Anime"],
    order: 2,
    createdAt: Date.now() - 86400000 * 40,
    watchCount: 42,
  },
];

export const MOCK_QUEUE_ITEMS: EntertainmentTitle[] = [
  {
    id: "q-1",
    title: "Attack on Titan",
    serviceId: "service-crunchyroll",
    status: "Planned",
    currentEpisode: 1,
    totalEpisodes: 87,
    directUrl: "https://www.crunchyroll.com/series/GR751KNZY/attack-on-titan",
    icon: "⛩️",
    category: "Anime",
    categories: ["Anime"],
    order: 0,
    createdAt: Date.now() - 86400000 * 10,
    watchCount: 0,
  },
];

export const MOCK_ANIME_STATS: EntertainmentStatsData = {
  titlesWatched: 24,
  episodesWatched: 362,
  totalSessions: 156,
  streakDays: 18,
};
