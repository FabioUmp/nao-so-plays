// --- Raw entry shapes from Spotify exports ---

export interface ExtendedHistoryEntry {
  ts: string;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  skipped: boolean | null;
}

export interface AccountHistoryEntry {
  endTime: string;   // "YYYY-MM-DD HH:MM", local time
  artistName: string;
  trackName: string;
  msPlayed: number;
}

// --- Aggregated shapes ---

export interface TrackAgg {
  trackName: string;
  artistName: string;
  albumName: string | null;
  msPlayed: number;
  plays: number;
  spotifyTrackUri: string | null;
}

export interface ArtistAgg {
  artistName: string;
  msPlayed: number;
  plays: number;
}

export interface AlbumAgg {
  albumName: string;
  artistName: string;
  msPlayed: number;
  plays: number;
}

// Per-month snapshot — stored as plain objects so they survive postMessage transfer
export interface MonthSnapshot {
  yearMonth: string; // "2026-01"
  tracks: Record<string, TrackAgg>;   // key: "artist|||trackName"
  artists: Record<string, ArtistAgg>; // key: artistName
  albums: Record<string, AlbumAgg>;   // key: "artist|||albumName"
  dayMs: Record<string, number>;      // key: "2026-01-15"
  totalMs: number;
}

export type DataFormat = 'extended' | 'account';

export interface AggregatedData {
  months: MonthSnapshot[];
  format: DataFormat;
}

// --- Worker message protocol ---

export interface WorkerInMessage {
  type: 'process';
  files: Array<{ name: string; content: ArrayBuffer }>;
}

export interface WorkerOutMessage {
  type: 'progress' | 'done' | 'error';
  progress?: number;
  message?: string;
  data?: AggregatedData;
  error?: string;
}

// --- Display / filtering ---

export interface CombinedData {
  tracks: TrackAgg[];
  artists: ArtistAgg[];
  albums: AlbumAgg[];
  totalMs: number;
  uniqueTracks: number;
  uniqueArtists: number;
  bestDay: string | null;    // "2026-01-15"
  bestDayMs: number;
  bestMonth: string | null;  // "2026-01"
  bestMonthMs: number;
}

export type PeriodType = 'month' | 'semester' | 'year' | 'all';

export interface Period {
  type: PeriodType;
  value: string;  // e.g. "2026-01" | "2026-S1" | "2026" | "all"
  label: string;
}

export type TopSize = 5 | 10 | 20;
