import type { Metadata } from 'next';
import { PaginaLegal } from '@/components/PaginaLegal';
import { metaDe } from '@/lib/meta';

export const metadata: Metadata = metaDe('cookies');

export default function Cookies() {
  return <PaginaLegal slug="cookies" />;
}
