import { useState } from 'react';

const faqs = [
  {
    q: 'Por que não posso só fazer login com o Spotify?',
    a: 'O Spotify não informa a outros sites quanto tempo você ouviu cada música. Esse dado só existe no arquivo que você mesmo baixa diretamente na sua conta.',
  },
  {
    q: 'Recebi só os "Dados da conta". Serve?',
    a: 'Serve, mas cobre só o último ano e não traz os álbuns. Com o "Histórico ampliado de streams", a retrospectiva fica completa, desde que você criou a conta.',
  },
  {
    q: 'O que conta como play?',
    a: 'Na coluna de plays, contamos reproduções de pelo menos 30 segundos. O ranking principal é sempre por tempo ouvido.',
  },
  {
    q: 'Meus dados ficam salvos no site?',
    a: 'Não. O cálculo é feito no seu próprio navegador, e o seu arquivo nunca é enviado para nenhum servidor. Quando você fecha a página, os dados somem.',
  },
  {
    q: 'Posso carregar dados de mais de um arquivo?',
    a: 'Sim! Você pode selecionar vários arquivos .json de uma vez. Se vier um .zip com vários arquivos dentro, basta soltar o .zip.',
  },
  {
    q: 'Por que algumas músicas de fundo foram filtradas?',
    a: 'O filtro "Excluir sons ambiente" remove automaticamente artistas e músicas com nomes que sugerem sons de chuva, ruído branco, meditação e similares. Você pode desligá-lo nos controles.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-white/90">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="text-gray-400 pb-5 text-sm leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black mb-10 text-center">
          Dúvidas <span className="gradient-text">frequentes</span>
        </h2>
        <div className="card px-6">
          {faqs.map(faq => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
