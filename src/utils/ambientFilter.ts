import { AMBIENT_KEYWORDS } from '../constants';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const normalizedKeywords = AMBIENT_KEYWORDS.map(normalize);

export function isAmbient(name: string): boolean {
  const n = normalize(name);
  return normalizedKeywords.some(kw => n.includes(kw));
}
