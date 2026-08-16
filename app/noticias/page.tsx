import type { Metadata } from 'next';
import Link from 'next/link';
import { Em, JsonLd, Pilula } from '@/components/Bits';
import { Fechamento } from '@/components/Fechamento';
import { Eco } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { clinica, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { metaDe } from '@/lib/meta';
import { ano, dataLonga, posts, postPath, tema } from '@/lib/posts';
import { cor, WRAP } from '@/lib/theme';

export const metadata: Metadata = metaDe('noticias');

const wa = waHref('noticias');

export default function Noticias() {
  let anoAtual = '';

  return (
    <>
      <JsonLd data={graph('noticias')} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
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
              O que a gente <Em>escreve</Em>
            </h1>
            <p
              style={{
                margin: '22px 0 0',
                fontSize: 18,
                lineHeight: 1.55,
                color: 'rgba(238,246,252,.8)',
                maxWidth: '56ch',
              }}
            >
              Artigos sobre os exames que fazemos aqui — o que cada um mostra, quando o médico
              costuma pedir e como se preparar. Dúvida que não estiver aqui, é só chamar no
              WhatsApp {clinica.phone}.
            </p>
          </div>
        </section>

        {/* Lista · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 72px' }}>
            {posts.map((p) => {
              const a = ano(p.data);
              const novoAno = a !== anoAtual;
              anoAtual = a;
              const t = tema(p);
              return (
                <div key={p.slug}>
                  {novoAno && (
                    <p
                      style={{
                        margin: '0 0 18px',
                        paddingTop: 18,
                        fontFamily: "'Instrument Serif',serif",
                        fontStyle: 'italic',
                        fontSize: 40,
                        lineHeight: 1,
                        color: 'rgba(20,112,196,.45)',
                      }}
                    >
                      {a}
                    </p>
                  )}
                  <article
                    style={{
                      borderTop: '1px solid rgba(20,112,196,.22)',
                      padding: '26px 0 30px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '8px 14px',
                        marginBottom: 12,
                        fontSize: 13,
                        color: 'rgba(10,42,82,.6)',
                      }}
                    >
                      <span>{dataLonga(p.data)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.min} min</span>
                      <Pilula>{t.curto}</Pilula>
                    </div>
                    <h2
                      style={{
                        margin: '0 0 10px',
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        fontSize: 'clamp(22px,2.8vw,30px)',
                        textWrap: 'balance',
                      }}
                    >
                      <Link
                        href={postPath(p)}
                        className="ea-link-inherit"
                        style={{ color: cor.navy, textDecoration: 'none' }}
                      >
                        {p.titulo}
                      </Link>
                    </h2>
                    <p
                      style={{
                        margin: '0 0 14px',
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: 'rgba(10,42,82,.75)',
                        maxWidth: '68ch',
                      }}
                    >
                      {p.lead}
                    </p>
                    <Link
                      href={postPath(p)}
                      className="ea-link-inherit"
                      style={{
                        color: cor.eco,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      Ler o artigo ›
                    </Link>
                  </article>
                </div>
              );
            })}
          </div>
        </section>

        <Fechamento
          waHref={wa}
          sub={`${clinica.pagamento} · atendemos com pedido médico e encaminhamentos.`}
        />

        <SiteFooter links />
      </div>
    </>
  );
}
