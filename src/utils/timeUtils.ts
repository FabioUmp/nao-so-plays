export function msToMinutes(ms: number): number {
  return Math.round(ms / 60_000);
}

export function msToHours(ms: number): number {
  return +(ms / 3_600_000).toFixed(1);
}

export function formatMinutes(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatHoursLong(ms: number): string {
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} minutos`;
  if (m === 0) return `${h} horas`;
  return `${h} horas e ${m} minutos`;
}

const MONTH_NAMES_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTH_NAMES_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTH_NAMES_SHORT[Number(month) - 1]}. ${year}`;
}

export function formatYearMonthLong(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTH_NAMES_LONG[Number(month) - 1]} de ${year}`;
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${Number(day)} de ${MONTH_NAMES_LONG[Number(month) - 1]} de ${year}`;
}

// Convert UTC ISO string to local "YYYY-MM" string
export function yearMonthFromUTC(ts: string): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

// Convert UTC ISO string to local "YYYY-MM-DD" string
export function dateKeyFromUTC(ts: string): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const mo = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Parse local-time "YYYY-MM-DD HH:MM" string to "YYYY-MM"
export function yearMonthFromLocal(endTime: string): string {
  return endTime.slice(0, 7); // "2026-01"
}

// Parse local-time "YYYY-MM-DD HH:MM" string to "YYYY-MM-DD"
export function dateKeyFromLocal(endTime: string): string {
  return endTime.slice(0, 10); // "2026-01-15"
}
