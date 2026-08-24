import type { Metadata } from 'next';
import { BotaoCeu, Em, ItemBarra, JsonLd, Pilula, SeloRevisao } from '@/components/Bits';
import { Halo, Varredura } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TopBar } from '@/components/TopBar';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { REVISAO_CLINICA_PENDENTE } from '@/lib/config';
import { clinica, site, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { metaDe } from '@/lib/meta';
import { cor, WRAP } from '@/lib/theme';

export const metadata: Metadata = metaDe('preparos');

const wa = waHref('preparos');

const TRAGA = [
  'Documento com foto',
  'Pedido médico',
  'Carteirinha do convênio',
  'Exames anteriores da mesma região',
];

export default function Preparos() {
  return (
    <>
      <JsonLd data={graph('preparos')} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <TopBar />
        <SiteHeader waHref={wa} />

        {/* Hero curto · campo */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(56% 42% at 50% 0%, rgba(20,112,196,.38) 0%, rgba(20,112,196,.12) 46%, rgba(6,20,35,0) 78%)" />
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
              O preparo <Em>certo</Em> de cada exame
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
              Jejum, bexiga cheia, medicações e o que trazer no dia. Na dúvida, chame no WhatsApp{' '}
              {clinica.phone} — respondemos antes do exame.
            </p>
            {REVISAO_CLINICA_PENDENTE && (
              <p style={{ margin: '18px 0 0' }}>
                <SeloRevisao tom="escuro" />
              </p>
            )}
          </div>
        </section>

        {/* Grupos de preparo · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div
            style={{
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '64px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
              gap: 18,
            }}
          >
            {site.preparos.map((g) => (
              <div
                key={g.grupo}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(20,112,196,.18)',
                  borderRadius: 10,
                  padding: 26,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: cor.navy,
                  }}
                >
                  {g.grupo}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: 'rgba(10,42,82,.8)',
                    borderLeft: `3px solid ${cor.eco}`,
                    paddingLeft: 14,
                  }}
                >
                  {g.nota}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {g.exames.map((ex) => (
                    <Pilula key={ex}>{ex}</Pilula>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* O que trazer · navy varredura */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: cor.navy, color: cor.gelo }}
        >
          <Varredura />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '72px 24px' }}
          >
            <h2
              style={{
                margin: '0 0 30px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(28px,3.6vw,42px)',
              }}
            >
              Em todo exame, traga
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                gap: '14px 36px',
                maxWidth: 940,
              }}
            >
              {TRAGA.map((it) => (
                <ItemBarra key={it} tom="escuro">
                  {it}
                </ItemBarra>
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              <BotaoCeu href={wa} fontSize={16} padding="14px 28px">
                Tirar dúvida no WhatsApp
              </BotaoCeu>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
