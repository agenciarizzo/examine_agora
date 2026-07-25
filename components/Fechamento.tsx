import type { ReactNode } from 'react';
import { clinica, mapHref } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';
import { BotaoCeu, Em } from './Bits';
import { Halo } from './Panos';

/** Fechamento com halo baixo — o CTA final de Home e das landings. */
export function Fechamento({
  waHref,
  sub,
  children,
}: {
  waHref: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <section
      style={{ position: 'relative', overflow: 'hidden', background: cor.campo, color: cor.gelo }}
    >
      <Halo gradient="radial-gradient(60% 46% at 50% 92%, rgba(20,112,196,.5) 0%, rgba(20,112,196,.16) 38%, rgba(6,20,35,0) 74%)" />
      <div
        style={{
          position: 'relative',
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '96px 24px 88px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: '0 auto',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontSize: 'clamp(44px,6.4vw,84px)',
            color: '#FFFFFF',
            maxWidth: '14ch',
            textWrap: 'balance',
          }}
        >
          Agende seu <Em>exame</Em>
        </h2>
        {sub && (
          <p
            style={{
              margin: '22px auto 0',
              fontSize: 17,
              color: 'rgba(238,246,252,.78)',
              maxWidth: '52ch',
            }}
          >
            {sub}
          </p>
        )}
        <div style={{ marginTop: 34 }}>
          <BotaoCeu href={waHref}>WhatsApp {clinica.phone}</BotaoCeu>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px 32px',
            marginTop: 36,
            fontSize: 15,
            color: 'rgba(169,214,245,.85)',
          }}
        >
          <span>{clinica.address}</span>
          <span>{clinica.hours}</span>
          <a href={mapHref} target="_blank" rel="noopener" style={{ color: cor.ceu }}>
            Ver no mapa ›
          </a>
        </div>
        {children}
      </div>
    </section>
  );
}
