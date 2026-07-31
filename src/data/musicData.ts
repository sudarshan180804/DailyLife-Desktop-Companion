import { LauncherPlaylist, MusicStatsData } from "../types/music";

export const MOCK_SEED_PLAYLISTS: LauncherPlaylist[] = [
  {
    id: "pl-lofi-chill",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
    service: "spotify",
    category: "Chill",
    categories: ["Chill"],
    icon: "☕",
    description: "Relaxing lofi beats for studying, reading, or chilling out.",
    isFavorite: true,
    isPinned: true,
    order: 0,
    createdAt: Date.now() - 86400000 * 5,
    lastOpenedAt: Date.now() - 3600000 * 2,
    launchCount: 12,
  },
  {
    id: "pl-coding-synth",
    title: "Synthwave / Cyberpunk Coding Mix",
    url: "https://music.youtube.com/playlist?list=PLw-VjHDlEOgvWWaGIk0C0ZMG8TnpM",
    service: "ytmusic",
    category: "Coding",
    categories: ["Coding"],
    icon: "💻",
    description: "High-energy retrowave & cyberpunk electronic beats for deep code flow.",
    isFavorite: true,
    isPinned: false,
    order: 1,
    createdAt: Date.now() - 86400000 * 4,
    lastOpenedAt: Date.now() - 3600000 * 5,
    launchCount: 8,
  },
];

export const MOCK_MUSIC_STATS: MusicStatsData = {
  playlistsLaunched: 14,
  streakDays: 7,
  totalListenSessions: 22,
};
