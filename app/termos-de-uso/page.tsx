import type { Metadata } from 'next';
import { PaginaLegal } from '@/components/PaginaLegal';
import { metaDe } from '@/lib/meta';

export const metadata: Metadata = metaDe('termos');

export default function Termos() {
  return <PaginaLegal slug="termos" />;
}
