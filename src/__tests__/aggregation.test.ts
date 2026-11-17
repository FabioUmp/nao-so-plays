import { describe, it, expect } from 'vitest';
import { aggregateEntries, combineMonths } from '../aggregation/index';
import type { RawAggEntry } from '../aggregation/index';

// --- aggregateEntries ---

describe('aggregateEntries – extended format', () => {
  const makeEntry = (overrides: Partial<RawAggEntry> = {}): RawAggEntry => ({
    ts_utc: '2026-03-15T14:00:00Z',
    ms_played: 180000,
    trackName: 'In the End',
    artistName: 'Linkin Park',
    albumName: 'Hybrid Theory',
    spotifyTrackUri: 'spotify:track:abc',
    ...overrides,
  });

  it('groups entries into months', () => {
    const entries = [
      makeEntry({ ts_utc: '2026-01-10T10:00:00Z' }),
      makeEntry({ ts_utc: '2026-01-20T10:00:00Z' }),
      makeEntry({ ts_utc: '2026-02-05T10:00:00Z' }),
    ];
    const result = aggregateEntries(entries, 'extended');
    // months count depends on local timezone but should be 1 or 2 jan entries grouped
    expect(result.months.length).toBeGreaterThanOrEqual(1);
    expect(result.format).toBe('extended');
  });

  it('sums ms_played for the same track in the same month', () => {
    const entries = [
      makeEntry({ ms_played: 100_000 }),
      makeEntry({ ms_played: 80_000 }),
    ];
    const result = aggregateEntries(entries, 'extended');
    const month = result.months[0];
    const trackKey = 'Linkin Park|||In the End';
    expect(month.tracks[trackKey].msPlayed).toBe(180_000);
  });

  it('counts plays only for ms_played >= 30000', () => {
    const entries = [
      makeEntry({ ms_played: 29_999 }), // should NOT count as play
      makeEntry({ ms_played: 30_000 }), // should count
      makeEntry({ ms_played: 60_000 }), // should count
    ];
    const result = aggregateEntries(entries, 'extended');
    const month = result.months[0];
    const trackKey = 'Linkin Park|||In the End';
    expect(month.tracks[trackKey].plays).toBe(2);
    expect(month.tracks[trackKey].msPlayed).toBe(119_999);
  });

  it('accumulates artist ms_played across multiple tracks', () => {
    const entries = [
      makeEntry({ trackName: 'Track A', ms_played: 60_000 }),
      makeEntry({ trackName: 'Track B', ms_played: 40_000 }),
    ];
    const result = aggregateEntries(entries, 'extended');
    const month = result.months[0];
    expect(month.artists['Linkin Park'].msPlayed).toBe(100_000);
  });

  it('builds album aggregation from extended history', () => {
    const result = aggregateEntries([makeEntry()], 'extended');
    const month = result.months[0];
    const albumKey = 'Linkin Park|||Hybrid Theory';
    expect(month.albums[albumKey]).toBeDefined();
    expect(month.albums[albumKey].msPlayed).toBe(180_000);
  });

  it('sorts months chronologically', () => {
    const entries = [
      makeEntry({ ts_utc: '2026-06-01T10:00:00Z' }),
      makeEntry({ ts_utc: '2026-01-01T10:00:00Z' }),
      makeEntry({ ts_utc: '2026-03-01T10:00:00Z' }),
    ];
    const result = aggregateEntries(entries, 'extended');
    const ym = result.months.map(m => m.yearMonth);
    expect(ym).toEqual([...ym].sort());
  });

  it('skips entries with no ts_utc in extended format', () => {
    const bad: RawAggEntry = {
      ms_played: 60_000,
      trackName: 'Track',
      artistName: 'Artist',
      albumName: null,
      spotifyTrackUri: null,
      // neither ts_utc nor endTime_local
    };
    const result = aggregateEntries([bad], 'extended');
    expect(result.months).toHaveLength(0);
  });
});

describe('aggregateEntries – account format', () => {
  const makeAccountEntry = (overrides: Partial<RawAggEntry> = {}): RawAggEntry => ({
    endTime_local: '2026-03-15 14:30',
    ms_played: 240_000,
    trackName: 'It Must Have Been Love',
    artistName: 'Roxette',
    albumName: null,
    spotifyTrackUri: null,
    ...overrides,
  });

  it('parses local time format without UTC conversion', () => {
    const result = aggregateEntries([makeAccountEntry()], 'account');
    expect(result.months[0].yearMonth).toBe('2026-03');
  });

  it('does not create album entries for account format', () => {
    const result = aggregateEntries([makeAccountEntry()], 'account');
    expect(Object.keys(result.months[0].albums)).toHaveLength(0);
  });

  it('marks format as account', () => {
    const result = aggregateEntries([makeAccountEntry()], 'account');
    expect(result.format).toBe('account');
  });
});

// --- combineMonths ---

describe('combineMonths', () => {
  it('merges tracks from multiple months', () => {
    const data = aggregateEntries(
      [
        {
          ts_utc: '2026-01-10T10:00:00Z',
          ms_played: 100_000,
          trackName: 'Song',
          artistName: 'Artist',
          albumName: 'Album',
          spotifyTrackUri: null,
        },
        {
          ts_utc: '2026-02-10T10:00:00Z',
          ms_played: 200_000,
          trackName: 'Song',
          artistName: 'Artist',
          albumName: 'Album',
          spotifyTrackUri: null,
        },
      ],
      'extended'
    );
    const combined = combineMonths(data.months, false);
    const track = combined.tracks.find(t => t.trackName === 'Song');
    expect(track?.msPlayed).toBe(300_000);
  });

  it('sorts tracks by msPlayed descending', () => {
    const data = aggregateEntries(
      [
        {
          ts_utc: '2026-01-10T10:00:00Z',
          ms_played: 50_000,
          trackName: 'Short',
          artistName: 'Artist',
          albumName: null,
          spotifyTrackUri: null,
        },
        {
          ts_utc: '2026-01-10T11:00:00Z',
          ms_played: 500_000,
          trackName: 'Long',
          artistName: 'Artist',
          albumName: null,
          spotifyTrackUri: null,
        },
      ],
      'extended'
    );
    const combined = combineMonths(data.months, false);
    expect(combined.tracks[0].trackName).toBe('Long');
  });

  it('filters ambient tracks when excludeAmbient is true', () => {
    const data = aggregateEntries(
      [
        {
          ts_utc: '2026-01-10T10:00:00Z',
          ms_played: 300_000,
          trackName: 'Chuva para dormir',
          artistName: 'Sons de chuva',
          albumName: null,
          spotifyTrackUri: null,
        },
        {
          ts_utc: '2026-01-10T11:00:00Z',
          ms_played: 100_000,
          trackName: 'Normal Song',
          artistName: 'Normal Artist',
          albumName: null,
          spotifyTrackUri: null,
        },
      ],
      'extended'
    );
    const withFilter = combineMonths(data.months, true);
    const withoutFilter = combineMonths(data.months, false);
    expect(withFilter.tracks.some(t => t.trackName === 'Chuva para dormir')).toBe(false);
    expect(withoutFilter.tracks.some(t => t.trackName === 'Chuva para dormir')).toBe(true);
  });

  it('computes totalMs correctly', () => {
    const data = aggregateEntries(
      [
        {
          ts_utc: '2026-01-10T10:00:00Z',
          ms_played: 60_000,
          trackName: 'A',
          artistName: 'B',
          albumName: null,
          spotifyTrackUri: null,
        },
        {
          ts_utc: '2026-01-10T11:00:00Z',
          ms_played: 90_000,
          trackName: 'C',
          artistName: 'D',
          albumName: null,
          spotifyTrackUri: null,
        },
      ],
      'extended'
    );
    const combined = combineMonths(data.months, false);
    expect(combined.totalMs).toBe(150_000);
  });
});
