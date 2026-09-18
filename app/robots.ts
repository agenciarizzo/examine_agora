import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/content';

export default function robots(): MetadataRoute.Robots {
  return {
    /*
     * `/whatsapp` é o degrau que abre a conversa, não conteúdo do site: fora
     * do índice. A página também declara `noindex` no próprio <head> — os dois
     * sinais juntos são de propósito, porque robots.txt impede o rastreio mas
     * não impede a indexação de uma URL descoberta por link.
     */
    rules: { userAgent: '*', allow: '/', disallow: '/whatsapp' },
    sitemap: absolute('/sitemap.xml'),
  };
}
