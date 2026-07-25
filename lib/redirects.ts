/**
 * Mapa de 301 do WordPress antigo → site novo.
 *
 * A base vem de `site.port_map` no ea-landings.json. Duas linhas de lá são
 * anotações em prosa, não URLs, e por isso são tratadas à parte:
 *
 *  - "/resultado-on-line/ + área restrita/conta/registro" → agende
 *    (serviço de resultados online DESCONTINUADO — 301 e remover);
 *    expandido abaixo em `EXTRAS` com as rotas reais que o WP publicava.
 *
 *  - "/politica-de-privacidade|cookies|termos-de-uso/" → "portar como estão
 *    (sem redesign)": não são 301, são páginas a portar. Ficam listadas em
 *    `A_PORTAR` e não geram redirect.
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

/** Páginas legais do WP que devem ser portadas como estão, sem redesign. */
export const A_PORTAR = ['/politica-de-privacidade', '/cookies', '/termos-de-uso'];

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
  for (const { source, para } of EXTRAS) add(source, para);

  return out;
}
