import { RETRO_NAME, SITE_URL } from '../constants';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-4 text-center text-gray-600 text-sm">
      <p className="font-semibold text-gray-400 mb-2">{RETRO_NAME}</p>
      <p className="mb-3">{SITE_URL}</p>
      <p className="max-w-md mx-auto text-xs leading-relaxed">
        Este site não é afiliado ao Spotify. Os dados exportados do Spotify pertencem a você — aqui
        eles são processados inteiramente no seu navegador.
      </p>
    </footer>
  );
}
