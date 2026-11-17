import { TrackAgg, ArtistAgg, AlbumAgg } from '../../types';
import { msToMinutes } from '../../utils/timeUtils';

type Item = TrackAgg | ArtistAgg | AlbumAgg;

function getName(item: Item): string {
  if ('trackName' in item) return item.trackName;
  if ('albumName' in item) return item.albumName;
  return item.artistName;
}

function getSubtitle(item: Item): string | null {
  if ('trackName' in item) return item.artistName;
  if ('albumName' in item) return item.artistName;
  return null;
}

interface TopListProps {
  title: string;
  items: Item[];
  topN: number;
  accentColor?: string;
  emptyMessage?: string;
}

export default function TopList({
  title,
  items,
  topN,
  accentColor = '#a855f7',
  emptyMessage = 'Nenhum dado disponível.',
}: TopListProps) {
  const visible = items.slice(0, topN);
  const maxMs = visible[0]?.msPlayed ?? 1;

  return (
    <div>
      <h3 className="text-lg font-bold text-white/80 mb-4">{title}</h3>
      {visible.length === 0 ? (
        <div className="card p-6 text-gray-500 text-sm text-center">{emptyMessage}</div>
      ) : (
        <div className="card overflow-hidden">
          {visible.map((item, i) => {
            const pct = Math.round((item.msPlayed / maxMs) * 100);
            const name = getName(item);
            const subtitle = getSubtitle(item);
            const minutes = msToMinutes(item.msPlayed);

            return (
              <div
                key={`${name}-${i}`}
                className="relative px-5 py-4 border-b border-white/[0.05] last:border-0 overflow-hidden"
              >
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 left-0 opacity-[0.07] transition-all duration-700"
                  style={{ width: `${pct}%`, background: accentColor }}
                />

                <div className="relative flex items-center gap-4">
                  {/* Rank */}
                  <span className={`text-2xl font-black w-8 flex-shrink-0 text-center tabular-nums ${i === 0 ? 'gradient-text' : 'text-white/25'}`}>
                    {i + 1}
                  </span>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{name}</p>
                    {subtitle && (
                      <p className="text-gray-500 text-xs truncate">{subtitle}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-white tabular-nums">{minutes.toLocaleString('pt-BR')} min</p>
                    <p className="text-gray-500 text-xs tabular-nums">{item.plays} plays</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
