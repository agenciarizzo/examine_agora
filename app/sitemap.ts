import type { MetadataRoute } from 'next';
import { absolute, pages } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: absolute(p.path),
    changeFrequency: p.grupo === 'legal' ? 'yearly' : 'monthly',
    priority:
      p.path === '/' ? 1 : p.grupo === 'legal' ? 0.3 : p.tipo === 'landing' ? 0.8 : 0.6,
  }));
}
