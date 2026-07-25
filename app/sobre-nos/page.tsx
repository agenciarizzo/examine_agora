import type { Metadata } from 'next';
import { BotaoCeu, Em, JsonLd, Pilula } from '@/components/Bits';
import { GaleriaClinica } from '@/components/GaleriaClinica';
import { RetratoRT } from '@/components/RetratoRT';
import { Halo, Setor, Varredura } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { clinica, site, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { metaDe } from '@/lib/meta';
import { cor, WRAP } from '@/lib/theme';

export const metadata: Metadata = metaDe('sobre');

const wa = waHref('sobre');
const s = site.sobre;

export default function Sobre() {
  return (
    <>
      <JsonLd data={graph('sobre')} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <SiteHeader waHref={wa} />

        {/* Hero · campo */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(56% 42% at 50% 0%, rgba(20,112,196,.38) 0%, rgba(20,112,196,.12) 46%, rgba(6,20,35,0) 78%)" />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '80px 24px 64px' }}
          >
            <p
              style={{
                margin: '0 0 18px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: cor.ceu,
              }}
            >
              A clínica · desde 2012
            </p>
            <h1
              style={{
                margin: 0,
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontSize: 'clamp(42px,6vw,80px)',
                color: '#FFFFFF',
                maxWidth: '16ch',
                textWrap: 'balance',
              }}
            >
              Sonhos e corações fincados <Em>no Recanto</Em>
            </h1>
          </div>
        </section>

        {/* História · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '72px 24px' }}>
            {s.historia.map((par) => (
              <p
                key={par.slice(0, 40)}
                style={{
                  margin: '0 0 24px',
                  fontSize: 'clamp(18px,2.2vw,23px)',
                  lineHeight: 1.55,
                  maxWidth: '66ch',
                  letterSpacing: '-0.01em',
                }}
              >
                {par}
              </p>
            ))}
          </div>
        </section>

        {/* Missão/Visão/Valores · branco + setor */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', color: cor.navy }}
        >
          <Setor
            style={{ right: -440, top: 100, transform: 'rotate(-19deg) scale(1.4)', opacity: 0.4 }}
          />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '72px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
              gap: 36,
            }}
          >
            <div>
              <h2 style={rotulo}>Missão</h2>
              <p style={corpo}>{s.missao}</p>
            </div>
            <div>
              <h2 style={rotulo}>Visão</h2>
              <p style={corpo}>{s.visao}</p>
            </div>
            <div>
              <h2 style={rotulo}>Valores</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {s.valores.map((v) => (
                  <Pilula key={v}>{v}</Pilula>
                ))}
              </div>
            </div>
          </div>
        </section>

        <GaleriaClinica />

        {/* Responsável técnico · navy varredura */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: cor.navy, color: cor.gelo }}
        >
          <Varredura />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '80px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 44,
            }}
          >
            <RetratoRT width={220} height={260} />
            <div style={{ flex: 1, minWidth: 300 }}>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: cor.ceu,
                }}
              >
                Responsável técnico
              </p>
              <h2
                style={{
                  margin: '0 0 6px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(28px,3.4vw,40px)',
                  color: '#FFFFFF',
                }}
              >
                {clinica.rt.name}
              </h2>
              <p
                style={{
                  margin: '0 0 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'rgba(169,214,245,.85)',
                }}
              >
                {clinica.rt.specialty} · {clinica.rt.crm} · {clinica.rt.rqe}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
                {s.bio.map((b) => (
                  <div
                    key={b}
                    style={{
                      borderLeft: `3px solid ${cor.ceu}`,
                      padding: '4px 0 4px 16px',
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: 'rgba(238,246,252,.88)',
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fechamento · halo */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: cor.campo, color: cor.gelo }}
        >
          <Halo gradient="radial-gradient(60% 46% at 50% 92%, rgba(20,112,196,.5) 0%, rgba(20,112,196,.16) 38%, rgba(6,20,35,0) 74%)" />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '88px 24px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                margin: '0 auto',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontSize: 'clamp(40px,5.6vw,72px)',
                color: '#FFFFFF',
                maxWidth: '16ch',
                textWrap: 'balance',
              }}
            >
              Venha nos <Em>conhecer</Em>
            </h2>
            <div style={{ marginTop: 30 }}>
              <BotaoCeu href={wa} fontSize={17} padding="16px 32px">
                WhatsApp {clinica.phone}
              </BotaoCeu>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '12px 32px',
                marginTop: 32,
                fontSize: 15,
                color: 'rgba(169,214,245,.85)',
              }}
            >
              <span>{clinica.address}</span>
              <span>{clinica.hours}</span>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}

const rotulo = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  color: cor.eco,
} as const;

const corpo = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.6,
  color: 'rgba(10,42,82,.85)',
} as const;
