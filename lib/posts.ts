/**
 * Blog migrado do WordPress.
 *
 * O conteúdo vive em `content/posts.json`, gerado por `scripts/migra-wp.mjs` a
 * partir do export em `migracao/`. Cada post ficou na URL que já tinha no WP —
 * por isso moram na raiz, ao lado das landings, e não em /noticias/<slug>.
 */
import raw from '../content/posts.json';
import { page, type Page } from './content';

/** União discriminada bloco a bloco — é o que deixa o renderer estreitar o tipo. */
export type Bloco =
  | { t: 'p'; html: string }
  | { t: 'h2'; html: string }
  | { t: 'h3'; html: string }
  | { t: 'blockquote'; html: string }
  | { t: 'ul'; itens: string[] }
  | { t: 'ol'; itens: string[] };

export type Post = {
  slug: string;
  titulo: string;
  /** ISO (yyyy-mm-dd) da publicação original no WP. */
  data: string;
  atualizado: string;
  /** Slug da página do tema — a interligação que `site.posts_wp` pede. */
  tema: string;
  /** Minutos de leitura, calculados na migração. */
  min: number;
  lead: string;
  seo: { title: string; description: string; waMsg: string };
  blocos: Bloco[];
};

export type PostsDb = {
  schema: string;
  gerado_de: string;
  gerado_por: string;
  nota: string;
  /** Posts que ficaram fora por serem reprodução de terceiros. */
  reproduzidos: { slug: string; fonte: string }[];
  posts: Post[];
};

export const postsDb = raw as unknown as PostsDb;

/** Do mais novo para o mais antigo — a ordem já vem da migração. */
export const posts = postsDb.posts;

const porSlug = new Map(posts.map((p) => [p.slug, p]));

export function achaPost(slug: string): Post | undefined {
  return porSlug.get(slug);
}

export function post(slug: string): Post {
  const p = porSlug.get(slug);
  if (!p) throw new Error(`Post inexistente no posts.json: "${slug}"`);
  return p;
}

/** Página do tema do post (landing ou página de apoio). */
export function tema(p: Post): Page {
  return page(p.tema);
}

/** URL do post: raiz, como era no WP. */
export function postPath(p: Post): string {
  return `/${p.slug}`;
}

const LONGA = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "4 de maio de 2023" — meio-dia UTC para a data não escorregar de fuso. */
export function dataLonga(iso: string): string {
  return LONGA.format(new Date(`${iso}T12:00:00Z`));
}

export function ano(iso: string): string {
  return iso.slice(0, 4);
}
