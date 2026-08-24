import type { Metadata } from 'next';
import Link from 'next/link';
import { Em, JsonLd } from '@/components/Bits';
import { Fechamento } from '@/components/Fechamento';
import { ParCta } from '@/components/ParCta';
import { RetratoRT } from '@/components/RetratoRT';
import { Eco, Grain, Halo, Setor, Varredura } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TopBar } from '@/components/TopBar';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { clinica, href, page, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { metaDe } from '@/lib/meta';
import { cor, WRAP } from '@/lib/theme';

const wa = waHref('inicio');

export const metadata: Metadata = metaDe('inicio');

const PROC = ['prostata', 'mama', 'tireoide', 'linfonodo'];
const EXAMES = ['morfologico', 'mulher', 'abdominal', 'homem', 'musculo', 'doppler'];

function card(slug: string) {
  const x = page(slug);
  return { href: x.path, nome: x.nome, sub: x.hero?.sub ?? '' };
}

export default function Home() {
  return (
    <>
      <JsonLd data={graph('inicio')} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <TopBar />
        <SiteHeader waHref={wa} />

        {/* HERO · pano campo */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(56% 42% at 50% 8%, rgba(20,112,196,.42) 0%, rgba(20,112,196,.13) 46%, rgba(6,20,35,0) 78%)" />
          <Setor
            style={{
              left: '50%',
              top: -560,
              transform: 'translateX(-42%) scale(1.8)',
              opacity: 0.34,
            }}
            strokeWidth={2}
            strokeOpacity={0.8}
          />
          <Grain />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '100px 24px 80px',
            }}
          >
            <p
              style={{
                margin: '0 0 20px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: cor.ceu,
              }}
            >
              Imagem e medicina · desde 2012
            </p>
            <h1
              style={{
                margin: 0,
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
                fontSize: 'clamp(46px,7vw,92px)',
                color: '#FFFFFF',
                maxWidth: '15ch',
                textWrap: 'balance',
              }}
            >
              Ultrassom e biópsia guiada <Em>no seu bairro</Em>
            </h1>
            <p
              style={{
                margin: '26px 0 0',
                fontSize: 19,
                lineHeight: 1.55,
                color: 'rgba(238,246,252,.82)',
                maxWidth: '56ch',
              }}
            >
              Do morfológico ao Doppler, da coleta de sangue à biópsia guiada por ultrassom — com
              radiologista experiente e laudo assinado por quem fez o exame.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 18,
                marginTop: 36,
              }}
            >
              <ParCta waHref={wa} fontSize={17} padding="16px 30px">
                Agendar pelo WhatsApp
              </ParCta>
              <Link
                href={href('hub')}
                className="ea-link-inherit"
                style={{ color: cor.ceu, textDecoration: 'none', fontSize: 16, fontWeight: 500 }}
              >
                Procedimentos guiados ›
              </Link>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 32px',
                marginTop: 52,
                paddingTop: 24,
                borderTop: '1px solid rgba(169,214,245,.18)',
                fontSize: 14,
                color: 'rgba(169,214,245,.8)',
              }}
            >
              <span>{clinica.pagamento}</span>
              <span>{clinica.hours}</span>
              <span>Recanto das Emas · Brasília-DF</span>
              <span>{clinica.rt_line}</span>
            </div>
          </div>
        </section>

        {/* Procedimentos guiados · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '84px 24px' }}>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: cor.eco,
              }}
            >
              Referência em procedimentos guiados por ultrassom
            </p>
            <h2
              style={{
                margin: '0 0 14px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(30px,4vw,48px)',
                maxWidth: '20ch',
                textWrap: 'balance',
              }}
            >
              A agulha certa, no alvo certo, <Em color={cor.eco}>vista</Em> em tempo real
            </h2>
            <p
              style={{
                margin: '0 0 40px',
                fontSize: 17,
                lineHeight: 1.55,
                color: 'rgba(10,42,82,.75)',
                maxWidth: '62ch',
              }}
            >
              Biópsias e punções em que o médico enxerga a agulha na tela do início ao fim —
              ambulatorial, com anestesia local e sem radiação.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                gap: 16,
              }}
            >
              {PROC.map(card).map((g) => (
                <Link
                  key={g.href}
                  href={g.href}
                  className="ea-card"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    background: '#FFFFFF',
                    color: cor.navy,
                    border: '1px solid rgba(20,112,196,.18)',
                    borderRadius: 10,
                    padding: 24,
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: 20,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {g.nome}
                  </h3>
                  <p
                    style={{
                      margin: '0 0 14px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: 'rgba(10,42,82,.7)',
                    }}
                  >
                    {g.sub}
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cor.eco }}>Saiba mais ›</span>
                </Link>
              ))}
            </div>
            <p style={{ margin: '28px 0 0' }}>
              <Link
                href={href('hub')}
                style={{ fontSize: 15, fontWeight: 700, color: cor.eco, textDecoration: 'none' }}
              >
                Por que guiado por ultrassom — a página completa ›
              </Link>
            </p>
          </div>
        </section>

        {/* Exames de ultrassom · branco + setor */}
        <section
          id="exames"
          style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', color: cor.navy }}
        >
          <Setor
            style={{ right: -420, top: 160, transform: 'rotate(-19deg) scale(1.5)', opacity: 0.45 }}
          />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '84px 24px' }}
          >
            <h2
              style={{
                margin: '0 0 40px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(30px,4vw,48px)',
              }}
            >
              Exames de ultrassom
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 16,
              }}
            >
              {EXAMES.map(card).map((g) => (
                <Link
                  key={g.href}
                  href={g.href}
                  className="ea-card ea-card-gelo"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    background: cor.gelo,
                    color: cor.navy,
                    border: '1px solid rgba(20,112,196,.18)',
                    borderRadius: 10,
                    padding: 24,
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: 20,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {g.nome}
                  </h3>
                  <p
                    style={{
                      margin: '0 0 14px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: 'rgba(10,42,82,.7)',
                    }}
                  >
                    {g.sub}
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cor.eco }}>Ver exame ›</span>
                </Link>
              ))}
            </div>
            <p style={{ margin: '30px 0 0', fontSize: 15, color: 'rgba(10,42,82,.7)' }}>
              Realizamos praticamente todos os exames de ultrassonografia — não achou o seu?{' '}
              <a href={wa} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>
                Pergunte no WhatsApp
              </a>
              .
            </p>
          </div>
        </section>

        {/* Laboratório · navy + varredura */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: cor.navy, color: cor.gelo }}
        >
          <Varredura />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '76px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 32,
            }}
          >
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
                Exames laboratoriais
              </p>
              <h2
                style={{
                  margin: '0 0 12px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(26px,3.4vw,40px)',
                  maxWidth: '22ch',
                }}
              >
                Sangue, urina e fezes — e o teste de gravidez em <Em>20 minutos</Em>
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: 'rgba(238,246,252,.78)',
                  maxWidth: '58ch',
                }}
              >
                Hemograma, glicemia, colesterol, hormônios e marcadores — inclusive as análises das
                biópsias feitas aqui.
              </p>
            </div>
            <Link
              href={href('laboratorio')}
              className="ea-link-inherit"
              style={{
                flex: '0 0 auto',
                border: '1px solid rgba(169,214,245,.5)',
                color: cor.ceu,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                padding: '14px 26px',
                borderRadius: 999,
              }}
            >
              Ver laboratório ›
            </Link>
          </div>
        </section>

        {/* Quem assina o seu laudo · branco + eco */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', color: cor.navy }}
        >
          <Eco
            viewBox="0 0 1100 480"
            raios={[
              [270, 0.6],
              [460, 0.45],
              [650, 0.3],
            ]}
          />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '80px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 44,
              alignItems: 'center',
            }}
          >
            <RetratoRT width={200} height={240} />
            <div style={{ flex: 1, minWidth: 300 }}>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: cor.eco,
                }}
              >
                Quem assina o seu laudo
              </p>
              <h2
                style={{
                  margin: '0 0 6px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(26px,3.4vw,38px)',
                }}
              >
                {clinica.rt.name}
              </h2>
              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'rgba(10,42,82,.7)',
                }}
              >
                {clinica.rt.specialty} · {clinica.rt.crm} · {clinica.rt.rqe}
              </p>
              <p
                style={{
                  margin: '0 0 18px',
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: 'rgba(10,42,82,.8)',
                  maxWidth: '58ch',
                }}
              >
                {clinica.rt.bio}
              </p>
              <Link
                href={href('sobre')}
                style={{ fontSize: 15, fontWeight: 700, color: cor.eco, textDecoration: 'none' }}
              >
                Conheça a clínica ›
              </Link>
            </div>
          </div>
        </section>

        {/* Preparos + Convênios · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div
            style={{
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '72px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
              gap: 18,
            }}
          >
            <Link
              href={href('preparos')}
              className="ea-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                background: '#FFFFFF',
                color: cor.navy,
                border: '1px solid rgba(20,112,196,.18)',
                borderRadius: 10,
                padding: 28,
              }}
            >
              <h3
                style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}
              >
                Preparos de exames
              </h3>
              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'rgba(10,42,82,.72)',
                }}
              >
                Jejum, bexiga cheia, medicações: o preparo certo de cada exame, para você não
                remarcar.
              </p>
              <span style={{ fontSize: 14, fontWeight: 700, color: cor.eco }}>Ver preparos ›</span>
            </Link>
            <Link
              href={href('convenios')}
              className="ea-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                background: '#FFFFFF',
                color: cor.navy,
                border: '1px solid rgba(20,112,196,.18)',
                borderRadius: 10,
                padding: 28,
              }}
            >
              <h3
                style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}
              >
                Convênios
              </h3>
              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'rgba(10,42,82,.72)',
                }}
              >
                Mais de 40 planos atendidos — GDF Saúde, Saúde Caixa, FUSEX, Postal Saúde e outros.
                Também particular.
              </p>
              <span style={{ fontSize: 14, fontWeight: 700, color: cor.eco }}>Ver a lista ›</span>
            </Link>
          </div>
        </section>

        <Fechamento waHref={wa} />
        <SiteFooter links />
      </div>
    </>
  );
}
