import type { MetadataRoute } from 'next';
import { absolute, pages } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: absolute(p.path),
    changeFrequency: 'monthly',
    priority: p.path === '/' ? 1 : p.tipo === 'landing' ? 0.8 : 0.6,
  }));
}
