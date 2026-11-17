import { useRef, useState, useCallback } from 'react';

interface UploadSectionProps {
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  progressMessage: string;
  errorMessage: string;
  onFiles: (files: File[]) => void;
}

export default function UploadSection({
  status,
  progress,
  progressMessage,
  errorMessage,
  onFiles,
}: UploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files).filter(
        f => f.name.endsWith('.zip') || f.name.endsWith('.json')
      );
      if (arr.length > 0) onFiles(arr);
    },
    [onFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const isProcessing = status === 'processing';

  return (
    <section id="upload" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Faça o <span className="gradient-text">upload do seu arquivo</span>
          </h2>
          <p className="text-gray-400">
            Arraste o .zip que você baixou do Spotify — ou clique para selecionar.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="card-elevated p-4 mb-6 flex gap-3 items-start text-sm">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <p className="text-gray-300">
            <strong className="text-white">Seu arquivo não sai do seu computador.</strong> Todo o
            cálculo é feito no seu navegador. Nada é enviado nem guardado em servidor nenhum.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isProcessing && inputRef.current?.click()}
          className={[
            'relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-purple-400 bg-purple-500/10'
              : 'border-white/20 hover:border-purple-400/60 hover:bg-white/[0.02]',
            isProcessing ? 'pointer-events-none opacity-70' : '',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.json"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {status === 'idle' || status === 'error' ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-semibold mb-1">
                {isDragging ? 'Solte aqui!' : 'Arraste o .zip ou clique para selecionar'}
              </p>
              <p className="text-gray-500 text-sm">Aceita .zip (Spotify) ou arquivos .json avulsos</p>
              {status === 'error' && (
                <p className="mt-4 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2">
                  {errorMessage}
                </p>
              )}
            </>
          ) : status === 'processing' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">{progressMessage || 'Processando…'}</p>
                <p className="text-gray-500 text-sm">{progress}%</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold">Dados carregados!</p>
              <p className="text-gray-500 text-sm">
                Sua retrospectiva está logo abaixo — ou clique aqui para carregar outros dados.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
