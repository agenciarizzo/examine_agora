import Image from 'next/image';
import { cor } from '@/lib/theme';

/**
 * Slugs com ilustração científica pronta em `public/ilustracoes/<slug>.jpg`
 * (ver `design/prompts-ilustracoes.md`). Landings fora desta lista mantêm o
 * placeholder tracejado com a descrição textual do campo `illo`.
 */
const DISPONIVEIS = new Set([
  'prostata',
  'mama',
  'tireoide',
  'linfonodo',
  'musculo',
  'doppler',
  'morfologico',
  'mulher',
  'abdominal',
  'homem',
  'laboratorio',
]);

export function temIlustracao(slug: string): boolean {
  return DISPONIVEIS.has(slug);
}

export function Ilustracao({ slug, nome }: { slug: string; nome: string }) {
  return (
    <div
      style={{
        marginTop: 52,
        border: '1px solid rgba(20,112,196,.18)',
        background: cor.gelo,
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: 440,
      }}
    >
      <Image
        src={`/ilustracoes/${slug}.jpg`}
        alt={`Ilustração científica do procedimento — ${nome}`}
        width={1024}
        height={1024}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
}
