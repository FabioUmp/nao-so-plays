/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#070711',
          card: '#0d0d1a',
          elevated: '#1a1a2e',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      backgroundImage: {
        'retro-gradient': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      },
      animation: {
        'bar-fill': 'barFill 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        barFill: {
          from: { width: '0%' },
          to: { width: 'var(--tw-bar-width)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
