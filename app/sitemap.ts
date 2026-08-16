import type { MetadataRoute } from 'next';
import { absolute, pages } from '@/lib/content';
import { posts, postPath } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((p) => ({
      url: absolute(p.path),
      changeFrequency: p.grupo === 'legal' ? ('yearly' as const) : ('monthly' as const),
      priority:
        p.path === '/' ? 1 : p.grupo === 'legal' ? 0.3 : p.tipo === 'landing' ? 0.8 : 0.6,
    })),
    ...posts.map((p) => ({
      url: absolute(postPath(p)),
      lastModified: new Date(`${p.atualizado}T12:00:00Z`),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
