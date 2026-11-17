import { useState } from 'react';
import Lightbox from './Lightbox';

interface Step {
  num: number;
  text: React.ReactNode;
  img?: { src: string; alt: string };
  action?: React.ReactNode;
  note?: React.ReactNode;
}

const steps: Step[] = [
  {
    num: 1,
    text: 'Abra a página de privacidade do Spotify e faça login, se ela pedir.',
    action: (
      <a
        href="https://www.spotify.com/account/privacy/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-3 text-sm"
      >
        Abrir página de privacidade do Spotify
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    ),
  },
  {
    num: 2,
    text: 'Marque "Histórico ampliado de streams" e clique em Solicitar dados. "Dados da conta" é opcional.',
    img: { src: '/tutorial/passo1-marcar-historico-ampliado.png', alt: 'Marcando Histórico ampliado de streams no Spotify' },
    note: (
      <p className="text-xs text-amber-400/80 mt-3 flex gap-2">
        <span>📧</span>
        <span>
          <strong>Não esquece de confirmar o pedido</strong> pelo link do primeiro e-mail que o Spotify
          vai mandar. Sem clicar nesse link, o Spotify não prepara nada.
        </span>
      </p>
    ),
  },
  {
    num: 3,
    text: 'Confirme pelo e-mail. O Spotify manda um e-mail de confirmação — clique no link dele para o pedido valer.',
    img: { src: '/tutorial/passo2-email-confirmacao.png', alt: 'E-mail de confirmação do Spotify' },
    note: (
      <p className="text-xs text-blue-400/80 mt-3 flex gap-2">
        <span>⏳</span>
        <span>
          Depois de pedir, o Spotify diz que pode levar <strong>até 30 dias</strong>. Não desanima: na
          prática costuma chegar bem antes, às vezes em poucas horas.
        </span>
      </p>
    ),
  },
  {
    num: 4,
    text: 'Espere o e-mail de "dados prontos", baixe o arquivo .zip e solte aqui embaixo.',
    img: { src: '/tutorial/passo3-historico-pronto.png', alt: 'E-mail com dados prontos do Spotify' },
    note: (
      <p className="text-xs text-orange-400/80 mt-3 flex gap-2">
        <span>⌛</span>
        <span>
          Baixe logo: <strong>o link de download expira depois de algumas semanas</strong>.
        </span>
      </p>
    ),
  },
];

export default function TutorialSection() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id="tutorial" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Como pegar seus dados <span className="gradient-text">do Spotify</span>
          </h2>
          <p className="text-gray-400">
            O Spotify não compartilha o histórico completo com aplicativos externos, mas você mesmo
            pode baixar tudo diretamente na sua conta.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map(step => (
            <div key={step.num} className="card p-6 flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {step.num}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90">{step.text}</p>
                {step.note}
                {step.action}
                {step.img && (
                  <button
                    onClick={() => setLightbox(step.img!)}
                    className="mt-4 block w-full overflow-hidden rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors group"
                    aria-label={`Ver imagem ampliada: ${step.img.alt}`}
                  >
                    <img
                      src={step.img.src}
                      alt={step.img.alt}
                      className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}
