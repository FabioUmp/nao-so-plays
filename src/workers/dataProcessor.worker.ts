import JSZip from 'jszip';
import { WorkerInMessage, WorkerOutMessage } from '../types';
import { parseExtendedHistory } from '../parsers/extendedHistory';
import { parseAccountHistory } from '../parsers/accountData';
import { aggregateEntries, RawAggEntry } from '../aggregation/index';

function post(msg: WorkerOutMessage) {
  self.postMessage(msg);
}

function progress(pct: number, message: string) {
  post({ type: 'progress', progress: pct, message });
}

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  if (e.data.type !== 'process') return;

  try {
    const { files } = e.data;
    progress(5, 'Lendo arquivos…');

    // Flatten ZIP contents and bare JSON files into named text entries
    const jsonFiles: Array<{ name: string; content: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      progress(5 + Math.round((i / files.length) * 15), `Abrindo ${file.name}…`);

      if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file.content);
        for (const [zipPath, zipEntry] of Object.entries(zip.files)) {
          if (!zipEntry.dir && zipPath.toLowerCase().endsWith('.json')) {
            const text = await zipEntry.async('string');
            jsonFiles.push({ name: zipPath.split('/').pop() ?? zipPath, content: text });
          }
        }
      } else if (file.name.toLowerCase().endsWith('.json')) {
        const text = new TextDecoder().decode(file.content);
        jsonFiles.push({ name: file.name, content: text });
      }
    }

    progress(22, 'Detectando formato…');

    // Prefer extended history; ignore video files and use only audio
    const extendedFiles = jsonFiles.filter(f =>
      /^Streaming_History_Audio_.*\.json$/i.test(f.name)
    );
    const accountFiles = jsonFiles.filter(f =>
      /^StreamingHistory_music_.*\.json$/i.test(f.name)
    );

    type Fmt = 'extended' | 'account';
    let format: Fmt;
    let selectedFiles: typeof jsonFiles;

    if (extendedFiles.length > 0) {
      format = 'extended';
      selectedFiles = extendedFiles;
    } else if (accountFiles.length > 0) {
      format = 'account';
      selectedFiles = accountFiles;
    } else {
      throw new Error(
        'Nenhum arquivo de histórico encontrado. ' +
        'Certifique-se de incluir os arquivos Streaming_History_Audio_*.json ' +
        'ou StreamingHistory_music_*.json do seu pacote Spotify.'
      );
    }

    progress(28, 'Processando entradas…');

    const allEntries: RawAggEntry[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      progress(28 + Math.round((i / selectedFiles.length) * 50), `Processando ${file.name}…`);

      let parsed: unknown;
      try {
        parsed = JSON.parse(file.content);
      } catch {
        continue;
      }
      if (!Array.isArray(parsed)) continue;

      if (format === 'extended') {
        const entries = parseExtendedHistory(parsed);
        for (const entry of entries) {
          if (!entry.master_metadata_track_name || !entry.master_metadata_album_artist_name) continue;
          allEntries.push({
            ts_utc: entry.ts,
            ms_played: entry.ms_played,
            trackName: entry.master_metadata_track_name,
            artistName: entry.master_metadata_album_artist_name,
            albumName: entry.master_metadata_album_album_name,
            spotifyTrackUri: entry.spotify_track_uri,
          });
        }
      } else {
        const entries = parseAccountHistory(parsed);
        for (const entry of entries) {
          allEntries.push({
            endTime_local: entry.endTime,
            ms_played: entry.msPlayed,
            trackName: entry.trackName,
            artistName: entry.artistName,
            albumName: null,
            spotifyTrackUri: null,
          });
        }
      }
    }

    progress(82, 'Agregando dados…');

    const data = aggregateEntries(allEntries, format);

    progress(100, 'Pronto!');
    post({ type: 'done', data });
  } catch (err) {
    post({ type: 'error', error: String(err) });
  }
};
