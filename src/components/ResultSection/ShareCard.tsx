import { forwardRef } from 'react';
import { CombinedData, Period } from '../../types';
import { RETRO_NAME, SITE_URL } from '../../constants';
import { msToMinutes } from '../../utils/timeUtils';

interface ShareCardProps {
  data: CombinedData;
  period: Period;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data, period }, ref) => {
  const totalHours = (data.totalMs / 3_600_000).toFixed(1);
  const topArtists = data.artists.slice(0, 5);
  const topTracks = data.tracks.slice(0, 5);

  // Note: WebkitBackgroundClip/WebkitTextFillColor do not work inside html-to-image canvas.
  // All gradient text is replaced with solid colours here.
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#070711',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        padding: '80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 60 }}>
        <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase',
          color: '#c084fc', marginBottom: 8 }}>
          {RETRO_NAME}
        </p>
        <p style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, color: '#f9fafb' }}>
          Meu ano em música
        </p>
        <p style={{ fontSize: 28, color: '#9ca3af' }}>{period.label}</p>
      </div>

      {/* Total */}
      <div style={{ backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 24, padding: '40px 48px',
        marginBottom: 48, border: '1px solid rgba(168,85,247,0.3)' }}>
        <p style={{ fontSize: 24, color: '#c084fc', marginBottom: 8 }}>Tempo total ouvido</p>
        <p style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: '#c084fc' }}>
          {totalHours}h
        </p>
      </div>

      {/* Top Artists */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase',
          letterSpacing: 3, marginBottom: 24 }}>
          Top Artistas
        </p>
        {topArtists.map((a, i) => (
          <div key={a.artistName} style={{ display: 'flex', alignItems: 'center', marginBottom: 20,
            padding: '16px 24px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 900, width: 60, color: i === 0 ? '#c084fc' : 'rgba(255,255,255,0.2)',
              textAlign: 'center' }}>
              {i + 1}
            </span>
            <span style={{ flex: 1, fontSize: 30, fontWeight: 600, marginLeft: 16 }}>{a.artistName}</span>
            <span style={{ fontSize: 26, color: '#9ca3af' }}>{msToMinutes(a.msPlayed).toLocaleString('pt-BR')} min</span>
          </div>
        ))}
      </div>

      {/* Top Tracks */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase',
          letterSpacing: 3, marginBottom: 24 }}>
          Top Músicas
        </p>
        {topTracks.map((t, i) => (
          <div key={t.trackName} style={{ display: 'flex', alignItems: 'center', marginBottom: 20,
            padding: '16px 24px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 900, width: 60, color: i === 0 ? '#f472b6' : 'rgba(255,255,255,0.2)',
              textAlign: 'center' }}>
              {i + 1}
            </span>
            <div style={{ flex: 1, marginLeft: 16, minWidth: 0 }}>
              <p style={{ fontSize: 28, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis' }}>
                {t.trackName}
              </p>
              <p style={{ fontSize: 22, color: '#6b7280' }}>{t.artistName}</p>
            </div>
            <span style={{ fontSize: 24, color: '#9ca3af', marginLeft: 16 }}>
              {msToMinutes(t.msPlayed).toLocaleString('pt-BR')} min
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, marginTop: 40,
        textAlign: 'center' }}>
        <p style={{ fontSize: 24, color: '#6b7280' }}>
          Gerado em <strong style={{ color: '#9ca3af' }}>{SITE_URL}</strong> · Ranking por tempo ouvido
        </p>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;
