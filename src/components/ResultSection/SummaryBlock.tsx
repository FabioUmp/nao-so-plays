import { CombinedData, Period } from '../../types';
import { msToMinutes, formatHoursLong, formatDate, formatYearMonthLong } from '../../utils/timeUtils';

interface SummaryBlockProps {
  data: CombinedData;
  period: Period;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5 text-center">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-black gradient-text leading-none">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function SummaryBlock({ data, period }: SummaryBlockProps) {
  const totalMinutes = msToMinutes(data.totalMs);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Days in period for avg per day
  let daysInPeriod = 1;
  if (period.type === 'year') daysInPeriod = 365;
  else if (period.type === 'semester') daysInPeriod = 183;
  else if (period.type === 'month') daysInPeriod = 30;
  else if (period.type === 'all') daysInPeriod = Math.max(1, totalMinutes / 60 / 24) || 365;
  const avgPerDay = Math.round(totalMinutes / daysInPeriod);

  return (
    <div>
      <h3 className="text-lg font-bold text-white/80 mb-4">Resumo do período</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <Stat
          label="Tempo total"
          value={`${totalHours}h`}
          sub={formatHoursLong(data.totalMs)}
        />
        <Stat
          label="Média por dia"
          value={`${avgPerDay} min`}
          sub="por dia"
        />
        <Stat
          label="Músicas diferentes"
          value={data.uniqueTracks.toLocaleString('pt-BR')}
        />
        <Stat
          label="Artistas diferentes"
          value={data.uniqueArtists.toLocaleString('pt-BR')}
        />
        {data.bestDay && (
          <Stat
            label="Dia mais intenso"
            value={`${Math.round(data.bestDayMs / 60_000)} min`}
            sub={formatDate(data.bestDay)}
          />
        )}
        {data.bestMonth && (
          <Stat
            label="Mês mais intenso"
            value={`${Math.round(data.bestMonthMs / 3_600_000)}h`}
            sub={formatYearMonthLong(data.bestMonth)}
          />
        )}
      </div>
    </div>
  );
}
