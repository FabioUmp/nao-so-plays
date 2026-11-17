# Não Só Plays

Retrospectiva musical pelo tempo realmente ouvido — não pelo número de plays.
Todo o processamento ocorre no navegador. Nenhum dado é enviado a servidor.

## Rodando localmente

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm run build      # build de produção em dist/
npm run preview    # pré-visualiza o build
npm test           # testes unitários (Vitest)
```

## Imagens do tutorial

Coloque os screenshots do Spotify em `public/tutorial/`:

| Arquivo | Passo |
|---|---|
| `passo1-marcar-historico-ampliado.png` | Marcando "Histórico ampliado de streams" |
| `passo2-email-confirmacao.png` | E-mail de confirmação |
| `passo3-historico-pronto.png` | E-mail de dados prontos |

As imagens são opcionais — os passos funcionam sem elas.

## Deploy no Vercel

1. Faça push do repositório para o GitHub.
2. Importe no [Vercel](https://vercel.com/new).
3. Framework Preset: **Vite**.
4. Build Command: `npm run build` · Output Directory: `dist`.
5. Nenhuma variável de ambiente necessária.

## Deploy no Cloudflare Pages

1. Faça push para o GitHub.
2. No [Cloudflare Pages](https://pages.cloudflare.com), crie um novo projeto.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build` · Build Output Directory: `dist`.

## Capas de álbum (opcional, pós-lançamento)

A rota oEmbed do Spotify (`https://open.spotify.com/oembed?url=...`) pode retornar
o `thumbnail_url` da capa. Para contornar bloqueios de CORS em produção, crie um
Cloudflare Worker que faz o proxy da requisição:

```js
// worker.js (Cloudflare Worker)
export default {
  async fetch(req) {
    const url = new URL(req.url);
    const target = url.searchParams.get('url');
    if (!target?.startsWith('https://open.spotify.com/')) {
      return new Response('Bad Request', { status: 400 });
    }
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(target)}`);
    return new Response(res.body, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

Atualize `OEMBED_PROXY_URL` em `src/constants/index.ts` com a URL do seu Worker.

## Ajustes

- **Nome do site:** `RETRO_NAME` em `src/constants/index.ts`
- **URL do site:** `SITE_URL` na mesma constante (aparece no card de compartilhamento)
- **Palavras-chave de sons ambiente:** `AMBIENT_KEYWORDS` no mesmo arquivo
- **Diferença mínima para o bloco "Plays enganam":** `MISLEADING_MIN_DIFF`

## Estrutura

```
src/
├── constants/       RETRO_NAME, AMBIENT_KEYWORDS, etc.
├── types/           Interfaces TypeScript
├── utils/           Formatação de tempo, filtro ambiente, período
├── parsers/         Parser do histórico ampliado e dos dados de conta
├── aggregation/     Agregação por mês + combinação para display
├── workers/         Web Worker (processa arquivos sem travar a UI)
└── components/
    ├── ResultSection/   Controles, listas, bloco "plays enganam", card de compartilhamento
    └── ...
```
