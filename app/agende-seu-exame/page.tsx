import type { Metadata } from 'next';
import Link from 'next/link';
import { Em, JsonLd } from '@/components/Bits';
import { ParCta } from '@/components/ParCta';
import { Grain, Halo } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TopBar } from '@/components/TopBar';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { clinica, href, mapHref, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { metaDe } from '@/lib/meta';
import { cor, WRAP } from '@/lib/theme';

export const metadata: Metadata = metaDe('agende');

const wa = waHref('agende');

export default function Agende() {
  return (
    <>
      <JsonLd data={graph('agende')} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <TopBar />
        {/* Sem CTA duplicado no header: a página inteira é o CTA. */}
        <SiteHeader waHref={wa} cta={false} />

        {/* Hero conversão · halo centro */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(60% 50% at 50% 40%, rgba(20,112,196,.5) 0%, rgba(20,112,196,.16) 40%, rgba(6,20,35,0) 76%)" />
          <Grain opacity={0.1} />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '96px 24px 80px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                margin: '0 auto',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontSize: 'clamp(46px,7vw,96px)',
                color: '#FFFFFF',
                maxWidth: '13ch',
                textWrap: 'balance',
              }}
            >
              Agende seu <Em>exame</Em>
            </h1>
            <p
              style={{
                margin: '24px auto 0',
                fontSize: 18,
                lineHeight: 1.55,
                color: 'rgba(238,246,252,.8)',
                maxWidth: '52ch',
              }}
            >
              Pelo WhatsApp você confirma convênio, preparo e horário numa conversa só.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 16,
                marginTop: 36,
              }}
            >
              <ParCta waHref={wa}>WhatsApp {clinica.phone}</ParCta>
            </div>
          </div>
        </section>

        {/* Endereço e horários · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div
            style={{
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '64px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
              gap: 18,
            }}
          >
            <div style={cartao}>
              <h2 style={rotulo}>Onde</h2>
              <p style={{ margin: '0 0 14px', fontSize: 17, lineHeight: 1.55 }}>{clinica.address}</p>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener"
                style={{ fontSize: 14, fontWeight: 700, color: cor.eco, textDecoration: 'none' }}
              >
                Ver no mapa ›
              </a>
            </div>
            <div style={cartao}>
              <h2 style={rotulo}>Quando</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{clinica.hours}</p>
            </div>
            <div style={cartao}>
              <h2 style={rotulo}>Como pagar</h2>
              <p style={{ margin: '0 0 14px', fontSize: 17, lineHeight: 1.55 }}>{clinica.pagamento}</p>
              <Link
                href={href('convenios')}
                style={{ fontSize: 14, fontWeight: 700, color: cor.eco, textDecoration: 'none' }}
              >
                Lista de convênios ›
              </Link>
            </div>
          </div>
          <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '0 24px 64px' }}>
            <div style={cartao}>
              <h2 style={rotulo}>No dia, traga</h2>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(10,42,82,.85)',
                }}
              >
                Documento com foto · pedido médico · carteirinha do convênio · exames anteriores da
                mesma região. Confira o{' '}
                <Link href={href('preparos')} style={{ fontWeight: 700 }}>
                  preparo do seu exame
                </Link>{' '}
                antes de sair de casa.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(10,42,82,.6)' }}>
                Resultados são retirados na clínica, no prazo informado no dia da coleta.
              </p>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}

const cartao = {
  background: '#FFFFFF',
  border: '1px solid rgba(20,112,196,.18)',
  borderRadius: 10,
  padding: 26,
} as const;

const rotulo = {
  margin: '0 0 10px',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  color: cor.eco,
} as const;
