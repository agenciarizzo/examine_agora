import type { Metadata } from 'next';
import { Em, JsonLd } from '@/components/Bits';
import { Eco } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TopBar } from '@/components/TopBar';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { site, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { metaDe } from '@/lib/meta';
import { cor, WRAP } from '@/lib/theme';

export const metadata: Metadata = metaDe('convenios');

const wa = waHref('convenios');

export default function Convenios() {
  return (
    <>
      <JsonLd data={graph('convenios')} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <TopBar />
        <SiteHeader waHref={wa} />

        {/* Hero curto · eco */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Eco
            viewBox="0 0 1100 420"
            raios={[
              [270, 0.5],
              [460, 0.38],
              [650, 0.26],
              [840, 0.14],
            ]}
            cx={1150}
            cy={60}
            stroke={cor.eco}
            strokeWidth={9}
            opacity={0.5}
            preserveAspectRatio="xMaxYMin slice"
          />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '76px 24px 60px' }}
          >
            <h1
              style={{
                margin: 0,
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontSize: 'clamp(40px,5.6vw,72px)',
                color: '#FFFFFF',
              }}
            >
              <Em>{site.convenios.length}</Em> convênios atendidos
            </h1>
            <p
              style={{
                margin: '22px 0 0',
                fontSize: 18,
                lineHeight: 1.55,
                color: 'rgba(238,246,252,.8)',
                maxWidth: '58ch',
              }}
            >
              E também particular. Não achou o seu plano? Chame no WhatsApp — a lista cresce e
              confirmamos a cobertura do seu exame na hora.
            </p>
          </div>
        </section>

        {/* Lista · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '64px 24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))',
                gap: '10px 28px',
              }}
            >
              {site.convenios.map((cv) => (
                <div
                  key={cv}
                  style={{
                    borderLeft: `3px solid ${cor.eco}`,
                    padding: '6px 0 6px 14px',
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {cv}
                </div>
              ))}
            </div>
            <p
              style={{
                margin: '40px 0 0',
                fontSize: 15,
                color: 'rgba(10,42,82,.7)',
                maxWidth: '62ch',
              }}
            >
              A cobertura de cada exame depende do seu plano — confirme no agendamento. Atendimento
              particular disponível para todos os exames e procedimentos.
            </p>
            <div style={{ marginTop: 24 }}>
              <a
                href={wa}
                target="_blank"
                rel="noopener"
                style={{
                  display: 'inline-block',
                  background: cor.navy,
                  color: cor.gelo,
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                  padding: '14px 28px',
                  borderRadius: 999,
                }}
              >
                Confirmar meu convênio no WhatsApp
              </a>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
