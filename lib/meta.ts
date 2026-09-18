import type { Metadata } from 'next';
import { absolute, clinica, page } from './content';
import { type Post, postPath } from './posts';

/**
 * O cartão que WhatsApp, Facebook e LinkedIn mostram no compartilhamento.
 *
 * Antes desta linha o site não tinha NENHUM: quem mandava uma landing no
 * WhatsApp mandava um retângulo vazio. O cartão é gerado por
 * `scripts/og-card.mjs` a partir dos ativos do repo.
 *
 * É GLOBAL — o mesmo para as 32 páginas. O ideal do padrão da casa é um por
 * página (`next/og`); está em PARKING.md [C-01] com a recomendação. Um cartão
 * só, de marca, é o piso que todos os outros sites da casa já têm.
 *
 * ⚠️ Declarado aqui, e não pela convenção `app/opengraph-image.jpg` do Next:
 * medido nesta entrega — com a convenção, só a HOME herdava a imagem, porque
 * cada página define o seu bloco `openGraph` e isso substitui o do pai. As
 * outras 31 saíam sem cartão nenhum, em silêncio.
 */
const CARTAO = {
  url: absolute('/og-card.jpg'),
  width: 1200,
  height: 630,
  alt: 'Examine Agora — Imagem e Medicina: ultrassom e biópsia guiada no Recanto das Emas, Brasília-DF.',
} as const;

/** Metadata de uma página a partir do bloco `seo` do ea-landings.json. */
export function metaDe(slug: string): Metadata {
  const p = page(slug);
  const url = absolute(p.path);
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
      images: [CARTAO],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.seo.title,
      description: p.seo.description,
      images: [CARTAO.url],
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
      images: [CARTAO],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.title,
      description: post.seo.description,
      images: [CARTAO.url],
    },
  };
}
