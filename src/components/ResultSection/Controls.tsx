import { MonthSnapshot, Period, TopSize } from '../../types';
import { TOP_SIZES } from '../../constants';
import { buildPeriodOptions } from '../../utils/periods';

interface ControlsProps {
  months: MonthSnapshot[];
  period: Period;
  topSize: TopSize;
  excludeAmbient: boolean;
  onPeriodChange: (p: Period) => void;
  onTopSizeChange: (n: TopSize) => void;
  onAmbientToggle: () => void;
}

export default function Controls({
  months,
  period,
  topSize,
  excludeAmbient,
  onPeriodChange,
  onTopSizeChange,
  onAmbientToggle,
}: ControlsProps) {
  const { all, byYear, bySemester, byMonth } = buildPeriodOptions(months);

  const selectClass =
    'bg-[#1a1a2e] border border-white/10 text-white rounded-xl px-3 py-2 text-sm ' +
    'focus:outline-none focus:border-purple-500 cursor-pointer';

  function handlePeriodSelect(value: string) {
    // Find matching period from all options
    const allOptions: Period[] = [
      ...all,
      ...Object.values(byYear),
      ...Object.values(bySemester),
      ...byMonth,
    ];
    const found = allOptions.find(p => `${p.type}:${p.value}` === value);
    if (found) onPeriodChange(found);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Period selector */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Período</label>
        <select
          className={selectClass}
          value={`${period.type}:${period.value}`}
          onChange={e => handlePeriodSelect(e.target.value)}
        >
          {all.map(p => (
            <option key={p.value} value={`${p.type}:${p.value}`}>{p.label}</option>
          ))}
          {Object.keys(byYear).length > 0 && (
            <optgroup label="Por ano">
              {Object.values(byYear).map(p => (
                <option key={p.value} value={`${p.type}:${p.value}`}>{p.label}</option>
              ))}
            </optgroup>
          )}
          {Object.keys(bySemester).length > 0 && (
            <optgroup label="Por semestre">
              {Object.values(bySemester).map(p => (
                <option key={p.value} value={`${p.type}:${p.value}`}>{p.label}</option>
              ))}
            </optgroup>
          )}
          {byMonth.length > 0 && (
            <optgroup label="Por mês">
              {byMonth.map(p => (
                <option key={p.value} value={`${p.type}:${p.value}`}>{p.label}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Top size */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Tamanho do top</label>
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {TOP_SIZES.map(n => (
            <button
              key={n}
              onClick={() => onTopSizeChange(n)}
              className={[
                'px-3 py-2 text-sm font-medium transition-colors',
                topSize === n
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white',
              ].join(' ')}
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      {/* Ambient toggle */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Filtro</label>
        <button
          onClick={onAmbientToggle}
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
            excludeAmbient
              ? 'border-purple-500/60 bg-purple-500/10 text-purple-300'
              : 'border-white/10 bg-[#1a1a2e] text-gray-400 hover:text-white',
          ].join(' ')}
        >
          <span
            className={[
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
              excludeAmbient ? 'bg-purple-500 border-purple-500' : 'border-gray-600',
            ].join(' ')}
          >
            {excludeAmbient && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          Excluir sons ambiente
        </button>
      </div>
    </div>
  );
}
