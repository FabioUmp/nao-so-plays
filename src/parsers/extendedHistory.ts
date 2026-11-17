import { ExtendedHistoryEntry } from '../types';

export function parseExtendedHistory(raw: unknown[]): ExtendedHistoryEntry[] {
  const result: ExtendedHistoryEntry[] = [];
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue;
    const e = item as Record<string, unknown>;
    if (
      typeof e.ts !== 'string' ||
      typeof e.ms_played !== 'number' ||
      // Skip podcasts, audiobooks, and other non-track entries
      typeof e.master_metadata_track_name !== 'string' ||
      !e.master_metadata_track_name
    ) {
      continue;
    }
    result.push({
      ts: e.ts as string,
      ms_played: e.ms_played as number,
      master_metadata_track_name: e.master_metadata_track_name as string,
      master_metadata_album_artist_name:
        typeof e.master_metadata_album_artist_name === 'string'
          ? e.master_metadata_album_artist_name
          : null,
      master_metadata_album_album_name:
        typeof e.master_metadata_album_album_name === 'string'
          ? e.master_metadata_album_album_name
          : null,
      spotify_track_uri:
        typeof e.spotify_track_uri === 'string' ? e.spotify_track_uri : null,
      skipped: typeof e.skipped === 'boolean' ? e.skipped : null,
    });
  }
  return result;
}
