import type { ReactNode } from 'react';
import { cartao } from '@/lib/concierge';
import { clinica, mapHref } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';
import { Em } from './Bits';
import { Concierge } from './Concierge';
import { Halo } from './Panos';
import { ParCta } from './ParCta';
import { PreAgendamento } from './PreAgendamento';

/** Fechamento com halo baixo — o CTA final de Home e das landings. */
export function Fechamento({
  waHref,
  sub,
  preAgendamento = false,
  concierge = false,
  exameSlug,
  children,
}: {
  waHref: string;
  sub?: string;
  /**
   * Mostra o botão do pré-agendamento ao lado do `ParCta`. É **opt-in** porque
   * o D4 do mapa limita esse botão a "onde o paciente já decidiu": as 12
   * landings e a home. `/noticias` e os 11 posts também usam este `Fechamento`
   * e ficam de fora — lá o CTA segue sendo só WhatsApp + Ligar.
   */
  preAgendamento?: boolean;
  /**
   * Mostra o card do concierge abaixo do CTA final (um dos dois pontos do D2).
   * **Opt-in pela mesma razão do `preAgendamento`** — a herança medida na F3
   * da Fatia 1 (§5.5 do mapa): CTA pendurado sem porta neste componente vaza
   * para `/noticias` e para os 11 posts, 26 URLs em vez de 14.
   */
  concierge?: boolean;
  /** Slug da landing de origem — pré-seleciona o exame no modal (§4.5). */
  exameSlug?: string;
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
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 16,
            marginTop: 34,
          }}
        >
          <ParCta waHref={waHref}>WhatsApp {clinica.phone}</ParCta>
          {preAgendamento && <PreAgendamento exameSlugInicial={exameSlug} />}
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
        {concierge && <Concierge cartao={cartao} tom="escuro" exameSlug={exameSlug} />}
        {children}
      </div>
    </section>
  );
}
