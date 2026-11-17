import { AccountHistoryEntry } from '../types';

// Isolated field mapping so it's easy to update if Spotify changes the format
function mapEntry(e: Record<string, unknown>): AccountHistoryEntry | null {
  if (
    typeof e.endTime !== 'string' ||
    typeof e.artistName !== 'string' ||
    typeof e.trackName !== 'string' ||
    typeof e.msPlayed !== 'number'
  ) {
    return null;
  }
  return {
    endTime: e.endTime,
    artistName: e.artistName,
    trackName: e.trackName,
    msPlayed: e.msPlayed,
  };
}

export function parseAccountHistory(raw: unknown[]): AccountHistoryEntry[] {
  const result: AccountHistoryEntry[] = [];
  for (const item of raw) {
    const mapped = mapEntry(item as Record<string, unknown>);
    if (mapped) result.push(mapped);
  }
  return result;
}
