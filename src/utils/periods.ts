import { MonthSnapshot, Period } from '../types';
import { formatYearMonth } from './timeUtils';

export function buildPeriodOptions(months: MonthSnapshot[]): {
  all: Period[];
  byYear: Record<string, Period>;
  bySemester: Record<string, Period>;
  byMonth: Period[];
} {
  const yearMonths = months.map(m => m.yearMonth).sort();
  const years = [...new Set(yearMonths.map(ym => ym.slice(0, 4)))].sort().reverse();

  const all: Period = { type: 'all', value: 'all', label: 'Desde sempre' };

  const byYear: Record<string, Period> = {};
  for (const y of years) {
    byYear[y] = { type: 'year', value: y, label: y };
  }

  const bySemester: Record<string, Period> = {};
  for (const y of years) {
    const hasH1 = yearMonths.some(ym => ym.startsWith(y) && parseInt(ym.slice(5)) <= 6);
    const hasH2 = yearMonths.some(ym => ym.startsWith(y) && parseInt(ym.slice(5)) >= 7);
    if (hasH2) bySemester[`${y}-S2`] = { type: 'semester', value: `${y}-S2`, label: `Jul–Dez ${y}` };
    if (hasH1) bySemester[`${y}-S1`] = { type: 'semester', value: `${y}-S1`, label: `Jan–Jun ${y}` };
  }

  const byMonth: Period[] = [...yearMonths].reverse().map(ym => ({
    type: 'month' as const,
    value: ym,
    label: formatYearMonth(ym),
  }));

  return { all: [all], byYear, bySemester, byMonth };
}

export function getDefaultPeriod(months: MonthSnapshot[]): Period {
  if (months.length === 0) return { type: 'all', value: 'all', label: 'Desde sempre' };
  const years = [...new Set(months.map(m => m.yearMonth.slice(0, 4)))].sort().reverse();
  const latestYear = years[0];
  return { type: 'year', value: latestYear, label: latestYear };
}

export function filterMonthsByPeriod(all: MonthSnapshot[], period: Period): MonthSnapshot[] {
  switch (period.type) {
    case 'all':
      return all;
    case 'year':
      return all.filter(m => m.yearMonth.startsWith(period.value));
    case 'semester': {
      const year = period.value.slice(0, 4);
      const half = period.value.endsWith('S1') ? 1 : 2;
      return all.filter(m => {
        if (!m.yearMonth.startsWith(year)) return false;
        const mo = parseInt(m.yearMonth.slice(5));
        return half === 1 ? mo <= 6 : mo >= 7;
      });
    }
    case 'month':
      return all.filter(m => m.yearMonth === period.value);
  }
}
