export const RETRO_NAME = 'Não Só Plays';
export const SITE_URL = 'notjustplays.app';

export const PLAY_MIN_MS = 30_000;

export const TOP_SIZES: readonly [5, 10, 20] = [5, 10, 20];

// Tracks/artists whose names contain any of these (case-insensitive, normalised) are
// treated as "ambient sounds" and hidden when the ambient filter is on.
export const AMBIENT_KEYWORDS: string[] = [
  'chuva',
  'rain',
  'ruído branco',
  'ruido branco',
  'white noise',
  'para dormir',
  'to sleep',
  'sleep music',
  'concentração',
  'concentracao',
  'focus music',
  'focus sounds',
  'relaxante',
  'ambiente',
  'natureza',
  'lo-fi para estudar',
  'lofi study',
  'lo-fi study',
  'meditation',
  'meditação',
  'meditacao',
  'spa music',
  'asmr',
  'brown noise',
  'pink noise',
  'binaural',
  'solfegio',
  'solfeggio',
];

export const MISLEADING_MIN_DIFF = 5;
