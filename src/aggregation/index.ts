import {
  TrackAgg,
  ArtistAgg,
  AlbumAgg,
  MonthSnapshot,
  AggregatedData,
  DataFormat,
  CombinedData,
} from '../types';
import { PLAY_MIN_MS } from '../constants';
import {
  yearMonthFromUTC,
  dateKeyFromUTC,
  yearMonthFromLocal,
  dateKeyFromLocal,
} from '../utils/timeUtils';
import { isAmbient } from '../utils/ambientFilter';

interface NormalizedEntry {
  yearMonth: string;
  dateKey: string;
  ms_played: number;
  trackName: string;
  artistName: string;
  albumName: string | null;
  spotifyTrackUri: string | null;
}

export interface RawAggEntry {
  ts_utc?: string;
  endTime_local?: string;
  ms_played: number;
  trackName: string;
  artistName: string;
  albumName: string | null;
  spotifyTrackUri: string | null;
}

function normalize(entry: RawAggEntry, format: DataFormat): NormalizedEntry | null {
  let yearMonth: string;
  let dateKey: string;
  if (format === 'extended' && entry.ts_utc) {
    yearMonth = yearMonthFromUTC(entry.ts_utc);
    dateKey = dateKeyFromUTC(entry.ts_utc);
  } else if (format === 'account' && entry.endTime_local) {
    yearMonth = yearMonthFromLocal(entry.endTime_local);
    dateKey = dateKeyFromLocal(entry.endTime_local);
  } else {
    return null;
  }
  return { yearMonth, dateKey, ...entry };
}

export function aggregateEntries(entries: RawAggEntry[], format: DataFormat): AggregatedData {
  const monthMap = new Map<
    string,
    {
      tracks: Map<string, TrackAgg>;
      artists: Map<string, ArtistAgg>;
      albums: Map<string, AlbumAgg>;
      dayMs: Map<string, number>;
      totalMs: number;
    }
  >();

  for (const raw of entries) {
    const entry = normalize(raw, format);
    if (!entry) continue;

    const { yearMonth, dateKey, ms_played, trackName, artistName, albumName, spotifyTrackUri } = entry;

    if (!monthMap.has(yearMonth)) {
      monthMap.set(yearMonth, {
        tracks: new Map(),
        artists: new Map(),
        albums: new Map(),
        dayMs: new Map(),
        totalMs: 0,
      });
    }

    const month = monthMap.get(yearMonth)!;
    month.totalMs += ms_played;

    // Day
    month.dayMs.set(dateKey, (month.dayMs.get(dateKey) ?? 0) + ms_played);

    const isPlay = ms_played >= PLAY_MIN_MS;
    const trackKey = `${artistName}|||${trackName}`;

    // Track
    const t = month.tracks.get(trackKey);
    if (t) {
      t.msPlayed += ms_played;
      if (isPlay) t.plays++;
      if (!t.spotifyTrackUri && spotifyTrackUri) t.spotifyTrackUri = spotifyTrackUri;
    } else {
      month.tracks.set(trackKey, { trackName, artistName, albumName, msPlayed: ms_played, plays: isPlay ? 1 : 0, spotifyTrackUri });
    }

    // Artist
    const a = month.artists.get(artistName);
    if (a) {
      a.msPlayed += ms_played;
      if (isPlay) a.plays++;
    } else {
      month.artists.set(artistName, { artistName, msPlayed: ms_played, plays: isPlay ? 1 : 0 });
    }

    // Album (only extended history has album name)
    if (albumName) {
      const albumKey = `${artistName}|||${albumName}`;
      const al = month.albums.get(albumKey);
      if (al) {
        al.msPlayed += ms_played;
        if (isPlay) al.plays++;
      } else {
        month.albums.set(albumKey, { albumName, artistName, msPlayed: ms_played, plays: isPlay ? 1 : 0 });
      }
    }
  }

  const months: MonthSnapshot[] = [];
  for (const [yearMonth, data] of monthMap.entries()) {
    months.push({
      yearMonth,
      tracks: Object.fromEntries(data.tracks),
      artists: Object.fromEntries(data.artists),
      albums: Object.fromEntries(data.albums),
      dayMs: Object.fromEntries(data.dayMs),
      totalMs: data.totalMs,
    });
  }

  months.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
  return { months, format };
}

export function combineMonths(months: MonthSnapshot[], excludeAmbient: boolean): CombinedData {
  const trackMap = new Map<string, TrackAgg>();
  const artistMap = new Map<string, ArtistAgg>();
  const albumMap = new Map<string, AlbumAgg>();
  const dayMsMap = new Map<string, number>();
  const monthMsMap = new Map<string, number>();

  for (const month of months) {
    monthMsMap.set(month.yearMonth, (monthMsMap.get(month.yearMonth) ?? 0) + month.totalMs);

    for (const [key, track] of Object.entries(month.tracks)) {
      if (excludeAmbient && (isAmbient(track.trackName) || isAmbient(track.artistName))) continue;
      const e = trackMap.get(key);
      if (e) {
        e.msPlayed += track.msPlayed;
        e.plays += track.plays;
        if (!e.spotifyTrackUri && track.spotifyTrackUri) e.spotifyTrackUri = track.spotifyTrackUri;
      } else {
        trackMap.set(key, { ...track });
      }
    }

    for (const [key, artist] of Object.entries(month.artists)) {
      if (excludeAmbient && isAmbient(artist.artistName)) continue;
      const e = artistMap.get(key);
      if (e) { e.msPlayed += artist.msPlayed; e.plays += artist.plays; }
      else artistMap.set(key, { ...artist });
    }

    for (const [key, album] of Object.entries(month.albums)) {
      if (excludeAmbient && (isAmbient(album.albumName) || isAmbient(album.artistName))) continue;
      const e = albumMap.get(key);
      if (e) { e.msPlayed += album.msPlayed; e.plays += album.plays; }
      else albumMap.set(key, { ...album });
    }

    for (const [day, ms] of Object.entries(month.dayMs)) {
      dayMsMap.set(day, (dayMsMap.get(day) ?? 0) + ms);
    }
  }

  let bestDay: string | null = null;
  let bestDayMs = 0;
  for (const [day, ms] of dayMsMap.entries()) {
    if (ms > bestDayMs) { bestDayMs = ms; bestDay = day; }
  }

  let bestMonth: string | null = null;
  let bestMonthMs = 0;
  for (const [mo, ms] of monthMsMap.entries()) {
    if (ms > bestMonthMs) { bestMonthMs = ms; bestMonth = mo; }
  }

  const totalMs = months.reduce((s, m) => s + m.totalMs, 0);

  return {
    tracks: Array.from(trackMap.values()).sort((a, b) => b.msPlayed - a.msPlayed),
    artists: Array.from(artistMap.values()).sort((a, b) => b.msPlayed - a.msPlayed),
    albums: Array.from(albumMap.values()).sort((a, b) => b.msPlayed - a.msPlayed),
    totalMs,
    uniqueTracks: trackMap.size,
    uniqueArtists: artistMap.size,
    bestDay,
    bestDayMs,
    bestMonth,
    bestMonthMs,
  };
}
