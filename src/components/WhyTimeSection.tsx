import { useEffect, useRef, useState } from 'react';

interface TrackRow {
  name: string;
  plays: number;
  maxPlays: number;
  minutes: number;
  maxMinutes: number;
  highlight: boolean;
}

function Bar({ pct, color, animated }: { pct: number; color: string; animated: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setWidth(pct), 80);
      return () => clearTimeout(t);
    }
    setWidth(pct);
  }, [animated, pct]);

  return (
    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

function ComparisonCard({
  title,
  subtitle,
  tracks,
  unit,
  getValue,
  getMax,
  color,
  animated,
}: {
  title: string;
  subtitle: string;
  tracks: TrackRow[];
  unit: string;
  getValue: (t: TrackRow) => number;
  getMax: (t: TrackRow) => number;
  color: string;
  animated: boolean;
}) {
  return (
    <div className="card p-6 flex-1">
      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          {title}
        </span>
        <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
      </div>
      <div className="space-y-4">
        {tracks.map((track, i) => (
          <div key={track.name}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className={`text-sm font-medium ${track.highlight ? 'text-white' : 'text-white/50'}`}>
                <span className="text-white/30 mr-1.5">{i + 1}.</span>
                {track.name}
              </span>
              <span className={`text-xs tabular-nums ${track.highlight ? 'text-white/80' : 'text-white/30'}`}>
                {getValue(track)} {unit}
              </span>
            </div>
            <Bar
              pct={Math.round((getValue(track) / getMax(track)) * 100)}
              color={track.highlight ? color : 'rgba(255,255,255,0.15)'}
              animated={animated}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const tracks: TrackRow[] = [
  { name: '🎵 Música X', plays: 2, maxPlays: 2, minutes: 6, maxMinutes: 60, highlight: false },
  { name: '🎵 Música Z', plays: 1, maxPlays: 2, minutes: 60, maxMinutes: 60, highlight: true },
];

export default function WhyTimeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Por que <span className="gradient-text">tempo ouvido</span>, e não plays?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A maioria das retrospectivas, incluindo a do próprio Spotify, monta o ranking pelo número de
            reproduções. Só que <strong className="text-white/90">play não é a mesma coisa que tempo ouvido</strong>.
          </p>
        </div>

        <div className="card p-6 mb-8 text-sm text-gray-300 leading-relaxed">
          <p className="mb-3">Imagine duas músicas:</p>
          <ul className="space-y-2 mb-3">
            <li>
              <strong className="text-white">🎵 Música X (3 min):</strong> você deu play 2 vezes.
              Total: 6 minutos.
            </li>
            <li>
              <strong className="text-white">🎵 Música Z:</strong> você deu play 1 vez, mas sempre que
              ela ia acabar você arrastava de volta para o começo. Para o Spotify continuou sendo uma
              única reprodução — só que você ficou <strong className="text-white">1 hora</strong> nela.
            </li>
          </ul>
          <p className="text-white/50 text-xs">Veja como cada método ranqueia essas músicas:</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <ComparisonCard
            title="Por número de plays"
            subtitle="Música X ganha — tem 2 plays"
            tracks={[
              { ...tracks[0], highlight: true },
              { ...tracks[1], highlight: false },
            ]}
            unit="plays"
            getValue={t => t.plays}
            getMax={t => t.maxPlays}
            color="#f59e0b"
            animated={animated}
          />
          <div className="flex items-center justify-center sm:flex-col text-white/20 font-black text-xl">
            VS
          </div>
          <ComparisonCard
            title="Por tempo ouvido"
            subtitle="Música Z ganha — 60 minutos"
            tracks={[
              { ...tracks[1], highlight: true },
              { ...tracks[0], highlight: false },
            ]}
            unit="min"
            getValue={t => t.minutes}
            getMax={t => t.maxMinutes}
            color="#a855f7"
            animated={animated}
          />
        </div>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Nas outras retrospectivas, a Música X ganha. Aqui,{' '}
          <strong className="text-white">quem ganha é quem você de fato mais ouviu</strong>.
        </p>
      </div>
    </section>
  );
}
