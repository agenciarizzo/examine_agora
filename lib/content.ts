/**
 * Fonte única de conteúdo do site.
 *
 * Todo texto, SEO, nav, convênios, preparos e mapa de 301 vem de
 * `content/ea-landings.json` — nada de copy hardcoded fora do json
 * (regra do handoff, `design/HANDOFF.md`).
 */
import raw from '../content/ea-landings.json';
import { degrauHref, numeroWhatsApp, telefoneVisivel } from './whatsapp';

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
  handle: string;
  instagram: string;
  facebook: string;
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

/**
 * Trava contra deriva: o telefone que o site MOSTRA e as partes que o site
 * DISCA têm de ser o mesmo número. Sem isto, editar `clinica.phone` no json
 * (que é o gesto natural de quem mexe em texto) deixaria o site exibindo um
 * número e abrindo outro — em silêncio. Reprova o build.
 */
if (clinica.phone !== telefoneVisivel()) {
  throw new Error(
    `clinica.phone ("${clinica.phone}") não bate com as partes de lib/whatsapp.ts ` +
      `("${telefoneVisivel()}"). Um dos dois está errado — os dois são o mesmo número.`,
  );
}

/**
 * CTA de WhatsApp com uma mensagem já escrita.
 *
 * Devolve a ROTA INTERNA, nunca `wa.me` — ver `lib/whatsapp.ts` para o porquê.
 * A `origem` viaja como `?o=` e vira a dimensão do evento de conversão.
 */
export function waMsgHref(msg: string, origem?: string): string {
  return degrauHref(msg, origem);
}

/** CTA de WhatsApp com o `waMsg` da própria página. */
export function waHref(slug: string): string {
  return degrauHref(page(slug).seo.waMsg, slug);
}

export const mapHref =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Examine Agora, ' + clinica.address.replace(/ · /g, ', '));

/**
 * O link de ligação continua sendo `tel:` com o número inteiro, e isso é
 * DELIBERADO — decidido pelo cliente em 2026-09-18, PARKING [A-02]: *"o maior
 * índice de spam é com WhatsApp, não telefone"*. O número da clínica é NAP
 * (nome, endereço, telefone): apagá-lo do HTML tiraria do buscador o sinal de
 * negócio local e derrubaria o "Ligar" que o cliente pediu para destacar. A
 * proteção antirrobô daqui mira o `wa.me`, que é o canal que sofre o spam.
 */
export const telHref = 'tel:+' + numeroWhatsApp();

/** Nav do header/rodapé, data-driven a partir de `site.nav`. */
export const nav = site.nav.map((n) => ({
  label: n.label,
  href: href(n.slug, n.hash),
}));

/** Domínio de produção — usado em canonical, sitemap e JSON-LD. */
export const SITE_URL = `https://${clinica.site}`;

/**
 * URL absoluta de uma rota. A home sai SEM barra final.
 *
 * Isso não é escolha estética, é o que o Next faz: com `trailingSlash: false`
 * (o padrão, e o que está em `next.config.ts`), ele normaliza as URLs de
 * metadado e devolve `https://examineagora.com.br` no canonical e no og:url,
 * mesmo quando o valor entra com a barra. Medido nesta manutenção: forçar a
 * barra aqui mudava só o `<loc>` do sitemap — ou seja, CRIAVA a divergência
 * entre os sinais em vez de tirar. Os cinco sinais falam a mesma forma
 * seguindo o framework. Ver PARKING.md [A-03].
 */
export function absolute(path: string): string {
  return SITE_URL + (path === '/' ? '' : path);
}
