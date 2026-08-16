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
 * Depois da migração do blog (2026-08), `site.port_map_posts` guarda só os 10
 * posts que ficaram fora do site por serem reprodução de terceiros — esses
 * seguem em 301 para a landing do tema. Os 11 posts de texto próprio voltaram
 * nas URLs originais e respondem 200; 301 neles apagaria a página que acabou
 * de voltar, e `scripts/migra-wp.mjs` falha se as duas listas se cruzarem.
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
 * categoria, autor e tag, feeds RSS e a página de manutenção. Os arquivos do
 * blog vão para `/noticias`, que é o índice equivalente no site novo; só a
 * página de manutenção não tem par e vai para o início. Os `:slug*` cobrem
 * também o que não apareceu no relatório de cobertura (ex.:
 * `/category/noticias/page/2`).
 */
const ARQUIVOS_WP: { source: string; para: string }[] = [
  { source: '/category/:slug*', para: 'noticias' },
  { source: '/categoria/:slug*', para: 'noticias' },
  { source: '/author/:slug*', para: 'noticias' },
  { source: '/autor/:slug*', para: 'noticias' },
  { source: '/tag/:slug*', para: 'noticias' },
  { source: '/blog/:slug*', para: 'noticias' },
  { source: '/feed/:slug*', para: 'noticias' },
  { source: '/comments/feed/:slug*', para: 'noticias' },
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
