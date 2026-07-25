import type { Metadata } from 'next';
import { absolute, clinica, page } from './content';

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
