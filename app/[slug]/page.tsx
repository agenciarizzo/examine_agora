import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaginaLanding } from '@/components/PaginaLanding';
import { PaginaPost } from '@/components/PaginaPost';
import { landings } from '@/lib/content';
import { metaDe, metaPost } from '@/lib/meta';
import { achaPost, posts } from '@/lib/posts';

/**
 * A raiz é compartilhada por dois tipos de página, porque as duas já moravam
 * lá: as landings (`/paaf-de-tireoide-brasilia`) e os posts migrados do WP
 * (`/ultrassom-das-articulacoes`), que voltaram na URL original para não
 * perder o que o Google já tinha indexado.
 */
const porSegmento = new Map(landings.map((p) => [p.path.replace(/^\//, ''), p]));

export const dynamicParams = false;

export function generateStaticParams() {
  return [...porSegmento.keys(), ...posts.map((p) => p.slug)].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = porSegmento.get(slug);
  if (landing) return metaDe(landing.slug);
  const post = achaPost(slug);
  return post ? metaPost(post) : {};
}

export default async function Rota({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const landing = porSegmento.get(slug);
  if (landing) return <PaginaLanding p={landing} />;

  const post = achaPost(slug);
  if (post) return <PaginaPost post={post} />;

  notFound();
}
