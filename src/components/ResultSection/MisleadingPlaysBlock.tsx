import { TrackAgg } from '../../types';
import { MISLEADING_MIN_DIFF } from '../../constants';
import { msToMinutes } from '../../utils/timeUtils';

interface MisleadingPlaysBlockProps {
  tracks: TrackAgg[];
}

export default function MisleadingPlaysBlock({ tracks }: MisleadingPlaysBlockProps) {
  if (tracks.length < MISLEADING_MIN_DIFF + 1) return null;

  // Rank by time (already sorted)
  const byTime = tracks;
  // Rank by plays
  const byPlays = [...tracks].sort((a, b) => b.plays - a.plays);

  // Find track with largest absolute position difference
  let best: { track: TrackAgg; timePos: number; playsPos: number; diff: number } | null = null;

  for (let i = 0; i < byTime.length; i++) {
    const track = byTime[i];
    const playsPos = byPlays.indexOf(track);
    const diff = Math.abs(playsPos - i);
    if (!best || diff > best.diff) {
      best = { track, timePos: i, playsPos, diff };
    }
  }

  if (!best || best.diff < MISLEADING_MIN_DIFF) return null;

  const { track, timePos, playsPos } = best;
  const isHigherByTime = timePos < playsPos; // lower number = better rank

  return (
    <div>
      <h3 className="text-lg font-bold text-white/80 mb-4">
        🎭 Quando plays enganam
      </h3>
      <div className="card p-6">
        <p className="text-gray-400 text-sm mb-5">
          A música com maior discrepância entre as formas de medir:
        </p>

        <div className="font-semibold text-white text-lg mb-1 truncate">{track.trackName}</div>
        <div className="text-gray-500 text-sm mb-5">{track.artistName}</div>

        <div className="flex gap-4">
          <div className={`flex-1 rounded-xl p-4 text-center ${isHigherByTime ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-white/[0.03] border border-white/10'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Por tempo ouvido</p>
            <p className={`text-3xl font-black ${isHigherByTime ? 'gradient-text' : 'text-white/40'}`}>
              {timePos + 1}º
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {msToMinutes(track.msPlayed).toLocaleString('pt-BR')} min
            </p>
          </div>

          <div className={`flex-1 rounded-xl p-4 text-center ${!isHigherByTime ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-white/[0.03] border border-white/10'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Por número de plays</p>
            <p className={`text-3xl font-black ${!isHigherByTime ? 'text-amber-400' : 'text-white/40'}`}>
              {playsPos + 1}º
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {track.plays.toLocaleString('pt-BR')} plays
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-xs mt-4 text-center">
          {isHigherByTime
            ? `${playsPos + 1}º por plays, mas ${timePos + 1}º por tempo — você passou muito mais tempo nela do que os plays indicam`
            : `${timePos + 1}º por tempo, mas ${playsPos + 1}º por plays — muitas skips ou plays bem curtos`}
        </p>
      </div>
    </div>
  );
}
