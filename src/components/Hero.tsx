import { RETRO_NAME } from '../constants';

export default function Hero() {
  const scrollToTutorial = () => {
    document.getElementById('tutorial')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-3xl animate-slide-up">
        <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4">
          {RETRO_NAME}
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
          Sua retrospectiva{' '}
          <span className="gradient-text">pelo que você realmente ouviu</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          As outras retrospectivas contam quantas vezes você deu play.{' '}
          <strong className="text-white/90">A gente conta quanto tempo</strong> você passou
          ouvindo cada música, artista e álbum.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={scrollToTutorial} className="btn-primary text-base px-8 py-4">
            Começar agora
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-base px-8 py-4"
          >
            Já tenho meus dados
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
