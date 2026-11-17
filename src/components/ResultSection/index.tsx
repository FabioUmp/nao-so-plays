import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import { AggregatedData, Period, TopSize } from '../../types';
import { combineMonths } from '../../aggregation/index';
import { buildPeriodOptions, filterMonthsByPeriod, getDefaultPeriod } from '../../utils/periods';
import Controls from './Controls';
import SummaryBlock from './SummaryBlock';
import TopList from './TopList';
import MisleadingPlaysBlock from './MisleadingPlaysBlock';
import ShareCard from './ShareCard';

interface ResultSectionProps {
  appData: AggregatedData;
}

export default function ResultSection({ appData }: ResultSectionProps) {
  const { months, format } = appData;
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const [period, setPeriod] = useState<Period>(() => getDefaultPeriod(months));
  const [topSize, setTopSize] = useState<TopSize>(5);
  const [excludeAmbient, setExcludeAmbient] = useState(true);

  // Reset period when data changes
  useEffect(() => {
    setPeriod(getDefaultPeriod(months));
  }, [months]);

  const { byYear } = useMemo(() => buildPeriodOptions(months), [months]);

  // Ensure selected period is still valid after data change
  useEffect(() => {
    const validYear = Object.keys(byYear).includes(period.value);
    if (period.type === 'year' && !validYear) {
      setPeriod(getDefaultPeriod(months));
    }
  }, [byYear, months, period]);

  const filteredMonths = useMemo(
    () => filterMonthsByPeriod(months, period),
    [months, period]
  );

  const combined = useMemo(
    () => combineMonths(filteredMonths, excludeAmbient),
    [filteredMonths, excludeAmbient]
  );

  const handleExport = useCallback(async () => {
    if (!shareCardRef.current || exporting) return;
    setExporting(true);
    try {
      // Wait for fonts to be ready
      await document.fonts.ready;

      // Wait two animation frames so the browser has painted the off-screen card
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const dataUrl = await toPng(shareCardRef.current, {
        backgroundColor: '#070711',
        width: 1080,
        height: 1920,
        pixelRatio: 1,
      });

      // Guard against an empty/transparent capture (a valid 1080×1920 PNG is always > 5 kB)
      if (dataUrl.length < 5000) {
        throw new Error('A imagem gerada parece vazia. Tente novamente.');
      }

      const link = document.createElement('a');
      link.download = `retrospectiva-${period.value}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Falha ao exportar imagem:', err);
      alert(`Não foi possível gerar a imagem: ${err instanceof Error ? err.message : err}`);
    } finally {
      setExporting(false);
    }
  }, [exporting, period.value]);

  const isAccountFormat = format === 'account';

  return (
    <section id="result" className="py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">
              Resultado
            </p>
            <h2 className="text-3xl font-black">Sua retrospectiva</h2>
          </div>
          <button onClick={handleExport} disabled={exporting} className="btn-ghost text-sm self-start sm:self-auto">
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gerando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar imagem
              </>
            )}
          </button>
        </div>

        {/* Account format warning */}
        {isAccountFormat && (
          <div className="card p-4 flex gap-3 items-start text-sm border-amber-500/30 bg-amber-500/5">
            <span className="text-xl">⚠️</span>
            <p className="text-amber-200/80">
              Seus dados são do formato <strong>"Dados da conta"</strong>, que cobre só o último ano
              e não inclui álbuns. Para uma retrospectiva completa, solicite o{' '}
              <strong>"Histórico ampliado de streams"</strong> (veja o tutorial acima).
            </p>
          </div>
        )}

        {/* Controls */}
        <Controls
          months={months}
          period={period}
          topSize={topSize}
          excludeAmbient={excludeAmbient}
          onPeriodChange={setPeriod}
          onTopSizeChange={setTopSize}
          onAmbientToggle={() => setExcludeAmbient(v => !v)}
        />

        {/* Summary */}
        <SummaryBlock data={combined} period={period} />

        {/* Top Artists */}
        <TopList
          title="Top Artistas por tempo"
          items={combined.artists}
          topN={topSize}
          accentColor="#a855f7"
          emptyMessage="Nenhum artista encontrado para este período."
        />

        {/* Top Tracks */}
        <TopList
          title="Top Músicas por tempo"
          items={combined.tracks}
          topN={topSize}
          accentColor="#ec4899"
          emptyMessage="Nenhuma música encontrada para este período."
        />

        {/* Top Albums (only for extended format) */}
        {!isAccountFormat && (
          <TopList
            title="Top Álbuns por tempo"
            items={combined.albums}
            topN={topSize}
            accentColor="#8b5cf6"
            emptyMessage="Nenhum álbum encontrado para este período."
          />
        )}

        {/* Misleading plays */}
        <MisleadingPlaysBlock tracks={combined.tracks} />
      </div>

      {/* Share card rendered off-screen via portal so the browser paints it fully */}
      {createPortal(
        <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', zIndex: -1 }}>
          <ShareCard ref={shareCardRef} data={combined} period={period} />
        </div>,
        document.body
      )}
    </section>
  );
}
