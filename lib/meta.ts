import type { Metadata } from 'next';
import { absolute, clinica, page } from './content';
import { type Post, postPath } from './posts';

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
    },
    twitter: {
      card: 'summary_large_image',
      title: p.seo.title,
      description: p.seo.description,
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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.title,
      description: post.seo.description,
    },
  };
}
