/**
 * Fonte única de conteúdo do site.
 *
 * Todo texto, SEO, nav, convênios, preparos e mapa de 301 vem de
 * `content/ea-landings.json` — nada de copy hardcoded fora do json
 * (regra do handoff, `design/HANDOFF.md`).
 */
import raw from '../content/ea-landings.json';

export type Ponto = { t: string; d: string };
export type Passo = { t: string; d: string };
export type Faq = { q: string; a: string };
export type Mito = { m: string; v: string };

export type Seo = {
  title: string;
  description: string;
  kw: string;
  kws: string[];
  waMsg: string;
};

export type Hero = {
  h1a: string;
  emph: string;
  h1b: string;
  pano: string;
  sub: string;
};

export type Lista = { h2: string; itens: string[] };

export type Page = {
  slug: string;
  file: string;
  path: string;
  nome: string;
  curto: string;
  intencao: string;
  tipo: 'landing' | 'site';
  grupo: 'proc' | 'exame' | 'lab' | 'site' | 'legal';
  seo: Seo;
  hub?: boolean;
  illo?: string;
  hero?: Hero;
  manifesto?: string[];
  indicada?: Lista;
  como?: { h2: string; dur: string; passos: Passo[] };
  preparo?: Lista;
  guiado?: { h2: string; emph: string; lead: string; pontos: Ponto[] };
  depois?: Lista;
  faq?: Faq[];
  mitos?: { destaque: Mito; pares: Mito[] };
  rel?: string[];
  gridSlugs?: string[];
};

export type Clinica = {
  nome: string;
  rt_line: string;
  rt: { name: string; specialty: string; crm: string; rqe: string; bio: string };
  phone: string;
  whatsapp_link: string;
  handle: string;
  site: string;
  address: string;
  hours: string;
  pagamento: string;
  selo: string;
};

/** Uma seção do texto legal: parágrafos, lista, nota de fecho e links irmãos. */
export type LegalSecao = {
  h2: string;
  ps?: string[];
  itens?: string[];
  nota?: string;
  links?: { label: string; slug: string }[];
};

export type LegalDoc = {
  slug: string;
  h1a: string;
  emph: string;
  h1b: string;
  lead: string;
  secoes: LegalSecao[];
};

export type Site = {
  nav: { label: string; slug: string; hash?: string }[];
  convenios: string[];
  sobre: {
    historia: string[];
    missao: string;
    visao: string;
    valores: string[];
    bio: string[];
  };
  preparos: { grupo: string; nota: string; exames: string[] }[];
  port_map: { de: string; para: string }[];
  posts_wp: string;
  /** URLs dos posts do WP → landing do tema (a regra descrita em `posts_wp`). */
  port_map_posts: { de: string; para: string }[];
  legal: { atualizado: string; nota: string; docs: LegalDoc[] };
};

export type Db = {
  schema: string;
  created: string;
  nota: string;
  clinica: Clinica;
  pages: Page[];
  site: Site;
};

export const db = raw as unknown as Db;
export const clinica = db.clinica;
export const site = db.site;
export const pages = db.pages;

const bySlug: Record<string, Page> = Object.fromEntries(
  pages.map((p) => [p.slug, p]),
);

export function page(slug: string): Page {
  const p = bySlug[slug];
  if (!p) throw new Error(`Página inexistente no ea-landings.json: "${slug}"`);
  return p;
}

/** Landings renderizadas pelo renderer único (`app/[slug]/page.tsx`). */
export const landings = pages.filter((p) => p.tipo === 'landing');

/** Páginas legais (privacidade, termos, cookies) — a faixa fixa do rodapé. */
export const legais = pages.filter((p) => p.grupo === 'legal');

/** Texto de uma página legal, a partir de `site.legal.docs`. */
export function legalDoc(slug: string): LegalDoc {
  const d = site.legal.docs.find((x) => x.slug === slug);
  if (!d) throw new Error(`Documento legal inexistente no ea-landings.json: "${slug}"`);
  return d;
}

/** URL canônica interna de uma página, a partir do `path` do json. */
export function href(slug: string, hash?: string): string {
  return page(slug).path + (hash ?? '');
}

/** Link de WhatsApp com o `waMsg` da própria página. */
export function waHref(slug: string): string {
  return (
    clinica.whatsapp_link + '?text=' + encodeURIComponent(page(slug).seo.waMsg)
  );
}

export const mapHref =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Examine Agora, ' + clinica.address.replace(/ · /g, ', '));

export const telHref = 'tel:+' + clinica.whatsapp_link.split('/').pop();

/** Nav do header/rodapé, data-driven a partir de `site.nav`. */
export const nav = site.nav.map((n) => ({
  label: n.label,
  href: href(n.slug, n.hash),
}));

/** Domínio de produção — usado em canonical, sitemap e JSON-LD. */
export const SITE_URL = `https://${clinica.site}`;

export function absolute(path: string): string {
  return SITE_URL + (path === '/' ? '' : path);
}
