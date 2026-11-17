import { useCallback, useRef, useState } from 'react';
import { AggregatedData, WorkerInMessage, WorkerOutMessage } from './types';
import Hero from './components/Hero';
import WhyTimeSection from './components/WhyTimeSection';
import TutorialSection from './components/TutorialSection';
import UploadSection from './components/UploadSection';
import ResultSection from './components/ResultSection/index';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

export default function App() {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [appData, setAppData] = useState<AggregatedData | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    // Terminate any previous worker
    workerRef.current?.terminate();

    setStatus('processing');
    setProgress(0);
    setProgressMessage('Iniciando…');
    setErrorMessage('');

    // Read all files as ArrayBuffer
    const fileBuffers: Array<{ name: string; content: ArrayBuffer }> = await Promise.all(
      files.map(async f => ({ name: f.name, content: await f.arrayBuffer() }))
    );

    const worker = new Worker(
      new URL('./workers/dataProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        setProgress(msg.progress ?? 0);
        setProgressMessage(msg.message ?? '');
      } else if (msg.type === 'done') {
        setAppData(msg.data!);
        setStatus('done');
        setProgress(100);
        // Scroll to result
        setTimeout(() => {
          document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        worker.terminate();
      } else if (msg.type === 'error') {
        setErrorMessage(msg.error ?? 'Erro desconhecido.');
        setStatus('error');
        worker.terminate();
      }
    };

    worker.onerror = err => {
      setErrorMessage(`Erro no processamento: ${err.message}`);
      setStatus('error');
      worker.terminate();
    };

    const msg: WorkerInMessage = { type: 'process', files: fileBuffers };
    worker.postMessage(msg, fileBuffers.map(f => f.content));
  }, []);

  return (
    <div className="min-h-screen bg-retro-bg">
      <Hero />
      <WhyTimeSection />
      <TutorialSection />
      <UploadSection
        status={status}
        progress={progress}
        progressMessage={progressMessage}
        errorMessage={errorMessage}
        onFiles={handleFiles}
      />
      {appData && <ResultSection appData={appData} />}
      <FAQSection />
      <Footer />
    </div>
  );
}
