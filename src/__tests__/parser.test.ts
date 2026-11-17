import { describe, it, expect } from 'vitest';
import { parseExtendedHistory } from '../parsers/extendedHistory';
import { parseAccountHistory } from '../parsers/accountData';

// --- Extended history ---

describe('parseExtendedHistory', () => {
  const validEntry = {
    ts: '2026-03-15T14:00:00Z',
    ms_played: 180000,
    master_metadata_track_name: 'In the End',
    master_metadata_album_artist_name: 'Linkin Park',
    master_metadata_album_album_name: 'Hybrid Theory',
    spotify_track_uri: 'spotify:track:abc123',
    skipped: false,
  };

  it('parses a valid entry', () => {
    const result = parseExtendedHistory([validEntry]);
    expect(result).toHaveLength(1);
    expect(result[0].master_metadata_track_name).toBe('In the End');
    expect(result[0].ms_played).toBe(180000);
  });

  it('filters out entries with null track name (podcasts/audiobooks)', () => {
    const podcast = { ...validEntry, master_metadata_track_name: null };
    const result = parseExtendedHistory([podcast, validEntry]);
    expect(result).toHaveLength(1);
    expect(result[0].master_metadata_track_name).toBe('In the End');
  });

  it('filters out entries with missing track name field', () => {
    const noTrack = {
      ts: '2026-03-15T14:00:00Z',
      ms_played: 5000,
      // no master_metadata_track_name
    };
    const result = parseExtendedHistory([noTrack, validEntry]);
    expect(result).toHaveLength(1);
  });

  it('handles null album name gracefully', () => {
    const noAlbum = { ...validEntry, master_metadata_album_album_name: null };
    const result = parseExtendedHistory([noAlbum]);
    expect(result[0].master_metadata_album_album_name).toBeNull();
  });

  it('returns empty array for empty input', () => {
    expect(parseExtendedHistory([])).toHaveLength(0);
  });

  it('handles malformed entries without crashing', () => {
    const bad = [null, undefined, 42, 'string', {}];
    expect(() => parseExtendedHistory(bad as unknown[])).not.toThrow();
    expect(parseExtendedHistory(bad as unknown[])).toHaveLength(0);
  });
});

// --- Account history ---

describe('parseAccountHistory', () => {
  const validEntry = {
    endTime: '2026-03-15 14:30',
    artistName: 'Roxette',
    trackName: 'It Must Have Been Love',
    msPlayed: 240000,
  };

  it('parses a valid account history entry', () => {
    const result = parseAccountHistory([validEntry]);
    expect(result).toHaveLength(1);
    expect(result[0].artistName).toBe('Roxette');
    expect(result[0].trackName).toBe('It Must Have Been Love');
    expect(result[0].msPlayed).toBe(240000);
    expect(result[0].endTime).toBe('2026-03-15 14:30');
  });

  it('filters out entries with wrong types', () => {
    const bad = { endTime: 123, artistName: 'Artist', trackName: 'Track', msPlayed: 1000 };
    const result = parseAccountHistory([bad, validEntry]);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for empty input', () => {
    expect(parseAccountHistory([])).toHaveLength(0);
  });
});
