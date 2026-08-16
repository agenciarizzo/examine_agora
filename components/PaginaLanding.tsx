import Link from 'next/link';
import { BotaoCeu, Em, ItemBarra, JsonLd, SeloRevisao } from '@/components/Bits';
import { Fechamento } from '@/components/Fechamento';
import { Ilustracao, temIlustracao } from '@/components/Ilustracao';
import { RetratoRT } from '@/components/RetratoRT';
import { Eco, Grain, Halo, Setor, Varredura } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { REVISAO_CLINICA_PENDENTE } from '@/lib/config';
import { clinica, href, type Page, page, waHref } from '@/lib/content';
import { breadcrumb, graph } from '@/lib/jsonld';
import { cor, WRAP } from '@/lib/theme';

/** Quebra a frase-lead do bloco `guiado` em torno da palavra em ênfase. */
function lead(p: Page) {
  const texto = p.guiado?.lead ?? '';
  const emph = p.guiado?.emph ?? '';
  const i = emph ? texto.indexOf(emph) : -1;
  if (i < 0) return { a: texto, em: '', b: '' };
  return { a: texto.slice(0, i), em: emph, b: texto.slice(i + emph.length) };
}

/**
 * Renderer único das 12 landings (hub, procedimentos guiados e exames),
 * reproduzindo `EA Landing Pagina.dc.html`. Liga e desliga cada seção conforme
 * os campos presentes no json, como os `sc-if` do design.
 */
export function PaginaLanding({ p }: { p: Page }) {
  const wa = waHref(p.slug);
  const rev = REVISAO_CLINICA_PENDENTE;
  const isHub = !!p.hub;
  const l = lead(p);

  return (
    <>
      <JsonLd data={graph(p.slug)} />
      <JsonLd data={breadcrumb(p)} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <SiteHeader waHref={wa} />

        {/* HERO · pano campo */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(56% 42% at 50% 8%, rgba(20,112,196,.42) 0%, rgba(20,112,196,.13) 46%, rgba(6,20,35,0) 78%)" />
          <Setor
            style={{ left: '50%', top: -560, transform: 'translateX(-42%) scale(1.8)', opacity: 0.34 }}
            strokeWidth={2}
            strokeOpacity={0.8}
          />
          <Grain />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '96px 24px 88px' }}
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
              Examine Agora · desde 2012 no Recanto das Emas
            </p>
            <h1
              style={{
                margin: 0,
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
                fontSize: 'clamp(46px,7.4vw,96px)',
                color: '#FFFFFF',
                maxWidth: '16ch',
                textWrap: 'balance',
              }}
            >
              {p.hero!.h1a} <Em>{p.hero!.emph}</Em> {p.hero!.h1b}
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
              {p.hero!.sub}
            </p>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginTop: 36 }}
            >
              <BotaoCeu href={wa} fontSize={17} padding="16px 30px">
                Agendar pelo WhatsApp
              </BotaoCeu>
              <span style={{ fontSize: 14, color: 'rgba(169,214,245,.75)' }}>{clinica.selo}</span>
            </div>
          </div>
        </section>

        {/* ===== PÁGINA DE PROCEDIMENTO ===== */}
        {!isHub && p.indicada && (
          <section style={{ background: cor.gelo, color: cor.navy }}>
            <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '80px 24px' }}>
              {rev && (
                <div style={{ marginBottom: 14 }}>
                  <SeloRevisao />
                </div>
              )}
              <h2
                style={{
                  margin: '0 0 36px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(28px,3.6vw,42px)',
                  maxWidth: '22ch',
                  textWrap: 'balance',
                }}
              >
                {p.indicada.h2}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                  gap: '14px 36px',
                  maxWidth: 900,
                }}
              >
                {p.indicada.itens.map((it) => (
                  <ItemBarra key={it}>{it}</ItemBarra>
                ))}
              </div>
              <p
                style={{
                  margin: '34px 0 0',
                  fontSize: 15,
                  color: 'rgba(10,42,82,.65)',
                  maxWidth: '60ch',
                }}
              >
                A indicação é sempre do seu médico. Traga o pedido — a nossa parte é fazer o
                procedimento com precisão e conforto.
              </p>
            </div>
          </section>
        )}

        {!isHub && p.como && (
          <section
            style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', color: cor.navy }}
          >
            <Setor
              style={{ right: -420, top: 120, transform: 'rotate(-19deg) scale(1.5)', opacity: 0.5 }}
            />
            <div
              style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '84px 24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 40,
                }}
              >
                {rev && <SeloRevisao />}
                <h2
                  style={{
                    margin: 0,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    fontSize: 'clamp(28px,3.6vw,42px)',
                    maxWidth: '24ch',
                  }}
                >
                  {p.como.h2}
                </h2>
                <span
                  style={{
                    border: '1px solid rgba(10,42,82,.25)',
                    color: cor.navy,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  duração média: {p.como.dur}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
                  gap: '36px 28px',
                }}
              >
                {p.como.passos.map((ps, n) => (
                  <div key={ps.t}>
                    <div
                      style={{
                        fontSize: 56,
                        fontWeight: 500,
                        letterSpacing: '-0.03em',
                        color: cor.eco,
                        lineHeight: 1,
                      }}
                    >
                      {String(n + 1).padStart(2, '0')}
                    </div>
                    <h3 style={{ margin: '12px 0 8px', fontSize: 19, fontWeight: 700 }}>{ps.t}</h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 1.55,
                        color: 'rgba(10,42,82,.75)',
                      }}
                    >
                      {ps.d}
                    </p>
                  </div>
                ))}
              </div>
              {p.illo && (
                temIlustracao(p.slug) ? (
                  <Ilustracao slug={p.slug} nome={p.nome} />
                ) : (
                  <div
                    style={{
                      marginTop: 52,
                      border: '2px dashed rgba(20,112,196,.45)',
                      background: cor.gelo,
                      borderRadius: 8,
                      padding: 28,
                      maxWidth: 760,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: cor.eco,
                      }}
                    >
                      ilustração científica · placeholder
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(10,42,82,.7)' }}>
                      {p.illo}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {!isHub && p.preparo && (
          <section
            style={{ position: 'relative', overflow: 'hidden', background: cor.navy, color: cor.gelo }}
          >
            <Varredura opacity={0.35} />
            <div
              style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '80px 24px' }}
            >
              {rev && (
                <div style={{ marginBottom: 14 }}>
                  <SeloRevisao tom="escuro" />
                </div>
              )}
              <h2
                style={{
                  margin: '0 0 36px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(28px,3.6vw,42px)',
                }}
              >
                {p.preparo.h2}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                  gap: '14px 36px',
                  maxWidth: 940,
                }}
              >
                {p.preparo.itens.map((it) => (
                  <ItemBarra key={it} tom="escuro">
                    {it}
                  </ItemBarra>
                ))}
              </div>
              <p
                style={{
                  margin: '34px 0 0',
                  fontSize: 15,
                  color: 'rgba(169,214,245,.75)',
                  maxWidth: '60ch',
                }}
              >
                Ficou com dúvida sobre o preparo? Chame no WhatsApp {clinica.phone} — respondemos
                antes do dia do procedimento.
              </p>
            </div>
          </section>
        )}

        {/* ===== HUB ===== */}
        {isHub && (
          <>
            <section style={{ background: cor.gelo, color: cor.navy }}>
              <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '84px 24px' }}>
                {(p.manifesto ?? []).map((par) => (
                  <p
                    key={par.slice(0, 40)}
                    style={{
                      margin: '0 0 26px',
                      fontSize: 'clamp(20px,2.4vw,26px)',
                      lineHeight: 1.5,
                      maxWidth: '66ch',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {par}
                  </p>
                ))}
              </div>
            </section>

            <section
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#FFFFFF',
                color: cor.navy,
              }}
            >
              <Setor
                style={{ left: -440, top: 240, transform: 'rotate(15deg) scale(1.6)', opacity: 0.45 }}
              />
              <div
                style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '84px 24px' }}
              >
                <h2
                  style={{
                    margin: '0 0 40px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    fontSize: 'clamp(28px,3.6vw,42px)',
                  }}
                >
                  Os seis procedimentos
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                    gap: 20,
                  }}
                >
                  {(p.gridSlugs ?? []).map((s) => page(s)).map((g) => (
                    <Link
                      key={g.slug}
                      href={g.path}
                      className="ea-card ea-card-gelo"
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                        background: cor.gelo,
                        color: cor.navy,
                        border: '1px solid rgba(20,112,196,.18)',
                        borderRadius: 10,
                        padding: 26,
                      }}
                    >
                      <h3
                        style={{
                          margin: '0 0 10px',
                          fontSize: 22,
                          fontWeight: 500,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {g.nome}
                      </h3>
                      <p
                        style={{
                          margin: '0 0 16px',
                          fontSize: 15,
                          lineHeight: 1.5,
                          color: 'rgba(10,42,82,.72)',
                        }}
                      >
                        {g.hero?.sub}
                      </p>
                      <span style={{ fontSize: 14, fontWeight: 700, color: cor.eco }}>
                        Ver página ›
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Segurança / por que guiado · pano halo campo */}
        {p.guiado && (
          <section
            style={{ position: 'relative', overflow: 'hidden', background: cor.campo, color: cor.gelo }}
          >
            <Halo gradient="radial-gradient(60% 46% at 50% 34%, rgba(20,112,196,.55) 0%, rgba(20,112,196,.18) 40%, rgba(6,20,35,0) 74%)" />
            <Grain opacity={0.1} />
            <div
              style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '96px 24px' }}
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
                {p.guiado.h2}
              </p>
              <p
                style={{
                  margin: '0 0 56px',
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.04,
                  fontSize: 'clamp(38px,5.6vw,72px)',
                  color: '#FFFFFF',
                  maxWidth: '20ch',
                  textWrap: 'balance',
                }}
              >
                {l.a}
                <Em>{l.em}</Em>
                {l.b}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                  gap: '32px 28px',
                }}
              >
                {p.guiado.pontos.map((pt) => (
                  <div key={pt.t} style={{ borderTop: '1px solid rgba(169,214,245,.3)', paddingTop: 18 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: cor.ceu }}>
                      {pt.t}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 1.55,
                        color: 'rgba(238,246,252,.78)',
                      }}
                    >
                      {pt.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!isHub && p.depois && (
          <section style={{ background: cor.gelo, color: cor.navy }}>
            <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '80px 24px' }}>
              {rev && (
                <div style={{ marginBottom: 14 }}>
                  <SeloRevisao />
                </div>
              )}
              <h2
                style={{
                  margin: '0 0 36px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(28px,3.6vw,42px)',
                }}
              >
                {p.depois.h2}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                  gap: '14px 36px',
                  maxWidth: 940,
                }}
              >
                {p.depois.itens.map((it) => (
                  <ItemBarra key={it}>{it}</ItemBarra>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quem faz · pano eco branco */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', color: cor.navy }}
        >
          <Eco
            viewBox="0 0 1100 560"
            raios={[
              [270, 0.6],
              [460, 0.45],
              [650, 0.3],
              [840, 0.18],
            ]}
          />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '84px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 44,
              alignItems: 'center',
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
                  color: cor.eco,
                }}
              >
                Quem faz
              </p>
              <h2
                style={{
                  margin: '0 0 6px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(28px,3.4vw,40px)',
                }}
              >
                {clinica.rt.name}
              </h2>
              <p
                style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'rgba(10,42,82,.7)' }}
              >
                {clinica.rt.specialty} · {clinica.rt.crm} · {clinica.rt.rqe}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: 'rgba(10,42,82,.8)',
                  maxWidth: '58ch',
                }}
              >
                {clinica.rt.bio}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ · gelo */}
        {!isHub && !!p.faq?.length && (
          <section style={{ background: cor.gelo, color: cor.navy }}>
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
              {rev && (
                <div style={{ marginBottom: 14 }}>
                  <SeloRevisao />
                </div>
              )}
              <h2
                style={{
                  margin: '0 0 28px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(28px,3.6vw,42px)',
                }}
              >
                Dúvidas frequentes
              </h2>
              {p.faq.map((f) => (
                <details key={f.q} style={{ borderBottom: '1px solid rgba(20,112,196,.25)', padding: '4px 0' }}>
                  <summary
                    style={{
                      listStyle: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 0',
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {f.q}
                    <span
                      className="ea-faq-sinal"
                      aria-hidden="true"
                      style={{ color: cor.eco, fontWeight: 500, fontSize: 24, flex: '0 0 auto' }}
                    />
                  </summary>
                  <p
                    style={{
                      margin: '0 0 18px',
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: 'rgba(10,42,82,.8)',
                      maxWidth: '64ch',
                    }}
                  >
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Mitos e verdades · navy */}
        {!isHub && p.mitos && (
          <section style={{ background: cor.navy, color: cor.gelo }}>
            <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '88px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 44 }}>
                <h2
                  style={{
                    margin: 0,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    fontSize: 'clamp(28px,3.6vw,42px)',
                  }}
                >
                  Mitos e verdades
                </h2>
                {rev && <SeloRevisao tom="escuro" />}
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(169,214,245,.3)',
                  paddingTop: 34,
                  marginBottom: 48,
                }}
              >
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: 'clamp(24px,3vw,34px)',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: 'rgba(238,246,252,.85)',
                  }}
                >
                  “{p.mitos.destaque.m}”
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Instrument Serif',serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(64px,9vw,120px)',
                    lineHeight: 1,
                    color: cor.ceu,
                  }}
                >
                  Mito.
                </p>
                <p
                  style={{
                    margin: '18px 0 0',
                    fontSize: 18,
                    lineHeight: 1.55,
                    color: 'rgba(238,246,252,.8)',
                    maxWidth: '56ch',
                  }}
                >
                  {p.mitos.destaque.v}
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                  gap: 32,
                }}
              >
                {p.mitos.pares.map((mt) => (
                  <div key={mt.m} style={{ borderTop: '1px solid rgba(169,214,245,.3)', paddingTop: 18 }}>
                    <p
                      style={{
                        margin: '0 0 6px',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'rgba(238,246,252,.85)',
                      }}
                    >
                      “{mt.m}” <Em>— mito.</Em>
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 1.55,
                        color: 'rgba(238,246,252,.72)',
                      }}
                    >
                      {mt.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Fechamento
          waHref={wa}
          sub={`${clinica.pagamento} · atendemos com pedido médico e encaminhamentos.`}
        >
          {!isHub && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginTop: 56,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(169,214,245,.6)',
                }}
              >
                Veja também
              </span>
              {(p.rel ?? []).map((s) => page(s)).map((r) => (
                <Link key={r.slug} href={r.path} className="ea-link-inherit" style={pilulaVazada}>
                  {r.curto}
                </Link>
              ))}
              <Link href={href('hub')} className="ea-link-inherit" style={pilulaVazada}>
                Todos os procedimentos
              </Link>
            </div>
          )}
        </Fechamento>

        <SiteFooter links />
      </div>
    </>
  );
}

const pilulaVazada = {
  border: '1px solid rgba(169,214,245,.4)',
  color: cor.ceu,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
  padding: '8px 18px',
  borderRadius: 999,
} as const;
