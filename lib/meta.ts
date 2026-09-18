import type { Metadata } from 'next';
import { absolute, clinica, page, type Page } from './content';
import { type Post, postPath } from './posts';

/**
 * O cartão que WhatsApp, Facebook e LinkedIn mostram no compartilhamento.
 *
 * São DOIS níveis, e a regra de qual entra está em `cartao()`:
 *  • **por landing** (`/og/<slug>.jpg`) — nome do exame e a ilustração da
 *    própria página. É o link que mais circula: o que a paciente reencaminha e
 *    o destino da mídia paga. Quem recebe já sabe de qual exame se trata antes
 *    de clicar.
 *  • **institucional** (`/og-card.jpg`) — home, hub, posts, páginas do site e
 *    legais. O hub fica aqui de propósito: é página-índice e não tem ilustração
 *    própria (§⚖️ — inventar arte só para ele seria copy nova).
 *
 * Os dois são gerados por `scripts/og-card.mjs` a partir dos ativos do repo.
 * Antes desta entrega o site não tinha NENHUM: quem mandava uma landing no
 * WhatsApp mandava um retângulo vazio.
 *
 * ⚠️ Declarado aqui, e não pela convenção `app/opengraph-image.jpg` do Next:
 * medido — com a convenção, só a HOME herdava a imagem, porque cada página
 * define o seu bloco `openGraph` e isso substitui o do pai. As outras 31 saíam
 * sem cartão nenhum, em silêncio.
 */
const MEDIDA = { width: 1200, height: 630 } as const;

const INSTITUCIONAL = {
  url: absolute('/og-card.jpg'),
  ...MEDIDA,
  alt: 'Examine Agora — Imagem e Medicina: ultrassom e biópsia guiada no Recanto das Emas, Brasília-DF.',
} as const;

/**
 * O cartão de uma página. A regra é a MESMA do gerador — landing com
 * ilustração tem o seu; o resto herda o institucional. Se as duas listas
 * divergirem, o gate de `scripts/verifica.mjs` reprova: ele confere que a URL
 * do `og:image` de cada página responde 200.
 */
function cartao(p: Page) {
  if (p.tipo !== 'landing' || p.hub || !p.hero) return INSTITUCIONAL;
  return {
    url: absolute(`/og/${p.slug}.jpg`),
    ...MEDIDA,
    alt: `${p.nome} — Examine Agora, Recanto das Emas, Brasília-DF.`,
  };
}

/** Metadata de uma página a partir do bloco `seo` do ea-landings.json. */
export function metaDe(slug: string): Metadata {
  const p = page(slug);
  const url = absolute(p.path);
  const capa = cartao(p);
  return {
    title: p.seo.title,
    description: p.seo.description,
    keywords: [p.seo.kw, ...p.seo.kws],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: p.seo.title,
      description: p.seo.description,
      siteName: clinica.nome,
      locale: 'pt_BR',
      images: [capa],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.seo.title,
      description: p.seo.description,
      images: [capa.url],
    },
  };
}

/** Metadata de um post migrado do WP. Artigo tem data; página não. */
export function metaPost(post: Post): Metadata {
  const url = absolute(postPath(post));
  return {
    title: post.seo.title,
    description: post.seo.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.seo.title,
      description: post.seo.description,
      siteName: clinica.nome,
      locale: 'pt_BR',
      publishedTime: post.data,
      modifiedTime: post.atualizado,
      images: [INSTITUCIONAL],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.title,
      description: post.seo.description,
      images: [INSTITUCIONAL.url],
    },
  };
}
