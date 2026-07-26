import {
  NowPlayingTrack,
  RecentlyPlayedItem,
  PlaylistItem,
  MusicStreamingPlatform,
  MusicStatsData,
} from "../types/music";

export const MOCK_NOW_PLAYING: NowPlayingTrack = {
  id: "track-nightcore-mix",
  title: "Nightcore Mix",
  artist: "Lofi for the Adventurer",
  genres: ["Chill", "Lofi", "Nightcore"],
  currentTime: "1:42",
  totalTime: "3:28",
  progressPercent: 51,
  coverImage:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
  isFavorite: true,
  isPlaying: true,
};

export const MOCK_RECENTLY_PLAYED: RecentlyPlayedItem[] = [
  {
    id: "rp-1",
    title: "Lofi Girl",
    subtitle: "Lofi Hip Hop Radio",
    duration: "2:15:43",
    coverImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "rp-2",
    title: "Study Beats",
    subtitle: "Chillhop Essentials",
    duration: "1:02:31",
    coverImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "rp-3",
    title: "Anime Openings Mix",
    subtitle: "The Anime Bois",
    duration: "45:12",
    coverImage:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "rp-4",
    title: "Rainy Day Lofi",
    subtitle: "Lofi Records",
    duration: "1:11:08",
    coverImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop",
  },
];

export const MOCK_PLAYLISTS: PlaylistItem[] = [
  {
    id: "pl-favorites",
    title: "Favorites",
    songCount: 128,
    coverImage:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "pl-chill",
    title: "Chill & Relax",
    songCount: 58,
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "pl-workout",
    title: "Workout Hits",
    songCount: 74,
    coverImage:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "pl-anime",
    title: "Anime Vibes",
    songCount: 96,
    coverImage:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "pl-late-night",
    title: "Late Night Drive",
    songCount: 63,
    coverImage:
      "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=300&auto=format&fit=crop",
  },
];

export const MOCK_MUSIC_PLATFORMS: MusicStreamingPlatform[] = [
  {
    id: "platform-spotify",
    name: "Spotify",
    iconSymbol: "🟢",
    badgeColor: "spotify",
    url: "https://open.spotify.com",
  },
  {
    id: "platform-ytmusic",
    name: "YouTube Music",
    iconSymbol: "🔴",
    badgeColor: "ytmusic",
    url: "https://music.youtube.com",
  },
  {
    id: "platform-soundcloud",
    name: "SoundCloud",
    iconSymbol: "🟠",
    badgeColor: "soundcloud",
    url: "https://soundcloud.com",
  },
  {
    id: "platform-apple",
    name: "Apple Music",
    iconSymbol: "💗",
    badgeColor: "apple",
    url: "https://music.apple.com",
  },
];

export const MOCK_MUSIC_STATS: MusicStatsData = {
  xpCurrent: 860,
  xpTarget: 2000,
  streakDays: 14,
  songsPlayed: 1248,
};

export const MOOD_OPTIONS = [
  { id: "mood-focus", label: "Focus", icon: "📖" },
  { id: "mood-workout", label: "Workout", icon: "🏋️" },
  { id: "mood-relax", label: "Relax", icon: "🍃", active: true },
  { id: "mood-anime", label: "Anime", icon: "📺" },
  { id: "mood-sleep", label: "Sleep", icon: "🌙" },
];
