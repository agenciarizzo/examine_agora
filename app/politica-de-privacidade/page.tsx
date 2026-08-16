import type { Metadata } from 'next';
import { PaginaLegal } from '@/components/PaginaLegal';
import { metaDe } from '@/lib/meta';

export const metadata: Metadata = metaDe('privacidade');

export default function Privacidade() {
  return <PaginaLegal slug="privacidade" />;
}
