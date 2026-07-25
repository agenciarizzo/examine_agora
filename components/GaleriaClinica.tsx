import Image from 'next/image';
import fotos from '../content/fotos.json';
import { cor, WRAP } from '@/lib/theme';

export type Foto = { src: string; alt: string; w: number; h: number };

const lista = (fotos.clinica ?? []) as Foto[];

/**
 * "A clínica por dentro" — fotos reais da sede.
 *
 * Some por inteiro enquanto `content/fotos.json` estiver vazio, para o site
 * nunca mostrar moldura sem foto.
 */
export function GaleriaClinica() {
  if (!lista.length) return null;

  return (
    <section style={{ background: cor.gelo, color: cor.navy }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '72px 24px' }}>
        <h2
          style={{
            margin: '0 0 32px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px,3.6vw,42px)',
          }}
        >
          A clínica por dentro
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 16,
          }}
        >
          {lista.map((f) => (
            <figure
              key={f.src}
              style={{
                margin: 0,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(20,112,196,.18)',
                background: '#FFFFFF',
              }}
            >
              <Image
                src={f.src}
                alt={f.alt}
                width={f.w}
                height={f.h}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
