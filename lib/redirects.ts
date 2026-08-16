/**
 * Mapa de 301 do WordPress antigo → site novo.
 *
 * A base vem de `site.port_map` (páginas do WP) e `site.port_map_posts` (os
 * posts do blog) no ea-landings.json. Duas linhas do port_map são anotações em
 * prosa, não URLs, e por isso são tratadas à parte:
 *
 *  - "/resultado-on-line/ + área restrita/conta/registro" → agende
 *    (serviço de resultados online DESCONTINUADO — 301 e remover);
 *    expandido abaixo em `EXTRAS` com as rotas reais que o WP publicava.
 *
 *  - "/politica-de-privacidade|cookies|termos-de-uso/" → "portar como estão
 *    (sem redesign)": não são 301, são páginas — e agora existem de verdade,
 *    escritas a partir de `site.legal` (ver `components/PaginaLegal.tsx`).
 *
 * Os posts do blog ainda não foram migrados (falta o export do WP), mas as
 * URLs deles estavam indexadas: cada uma vai de 301 para a landing do seu
 * tema, que é o que `site.posts_wp` manda fazer na interligação. Se um post
 * for republicado no site, basta tirar a linha correspondente do json.
 */
import { page, site } from './content';

/** 301 explícito (e não o 308 do `permanent: true`) — é o que o handoff pede. */
export type Redirect = { source: string; destination: string; statusCode: 301 };

/** Linhas do port_map que não são URL — casadas por prefixo e tratadas à parte. */
const PROSA = ['/resultado-on-line/', '/politica-de-privacidade|'];

/** Rotas do WP que morriam no serviço de resultados online. */
const EXTRAS: { source: string; para: string }[] = [
  { source: '/resultado-on-line', para: 'agende' },
  { source: '/area-restrita', para: 'agende' },
  { source: '/minha-conta', para: 'agende' },
  { source: '/conta', para: 'agende' },
  { source: '/registro', para: 'agende' },
  { source: '/login', para: 'agende' },
];

/**
 * O que o WordPress publicava além das páginas e dos posts: arquivos de
 * categoria, autor e tag, feeds RSS e a página de manutenção. Tudo isso foi
 * rastreado pelo Google e não tem equivalente no site novo — vai para o
 * início. Os `:slug*` cobrem também o que não apareceu no relatório de
 * cobertura (ex.: `/category/noticias/page/2`).
 */
const ARQUIVOS_WP: { source: string; para: string }[] = [
  { source: '/category/:slug*', para: 'inicio' },
  { source: '/categoria/:slug*', para: 'inicio' },
  { source: '/author/:slug*', para: 'inicio' },
  { source: '/autor/:slug*', para: 'inicio' },
  { source: '/tag/:slug*', para: 'inicio' },
  { source: '/blog/:slug*', para: 'inicio' },
  { source: '/feed/:slug*', para: 'inicio' },
  { source: '/comments/feed/:slug*', para: 'inicio' },
  { source: '/manutencao', para: 'inicio' },
];

function normaliza(de: string): string {
  const s = de.replace(/\/+$/, '');
  return s === '' ? '/' : s;
}

export function redirects(): Redirect[] {
  const out: Redirect[] = [];
  const vistos = new Set<string>();

  const add = (source: string, slug: string) => {
    const destination = page(slug).path;
    // Um 301 para si mesmo é um laço — descarta (ex.: "/" → inicio).
    if (source === destination || vistos.has(source)) return;
    vistos.add(source);
    out.push({ source, destination, statusCode: 301 });
  };

  for (const { de, para } of site.port_map) {
    if (PROSA.some((p) => de.startsWith(p))) continue;
    add(normaliza(de), para);
  }
  for (const { de, para } of site.port_map_posts) add(normaliza(de), para);
  for (const { source, para } of [...EXTRAS, ...ARQUIVOS_WP]) add(source, para);

  return out;
}
