import Link from 'next/link';
import { Em, JsonLd } from '@/components/Bits';
import { Fechamento } from '@/components/Fechamento';
import { RetratoRT } from '@/components/RetratoRT';
import { Eco, Halo } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TopBar } from '@/components/TopBar';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { clinica, href, waMsgHref } from '@/lib/content';
import { breadcrumbPost, grafoPost } from '@/lib/jsonld';
import { type Bloco, dataLonga, type Post, tema } from '@/lib/posts';
import { cor, WRAP } from '@/lib/theme';

/** Coluna de leitura — mais estreita que a do site, que é de cartão. */
const COLUNA = 780;

const corpo = {
  margin: '0 0 18px',
  fontSize: 18,
  lineHeight: 1.68,
  color: 'rgba(10,42,82,.84)',
} as const;

/**
 * Os blocos vêm sanitizados da migração (`scripts/migra-wp.mjs`): o inline é
 * só `a`, `strong`, `em` e `br`, e todo o resto foi escapado na origem. É por
 * isso que o innerHTML aqui é seguro — nada de HTML do WP chega cru.
 */
function Blocos({ blocos }: { blocos: Bloco[] }) {
  return (
    <>
      {blocos.map((b, i) => {
        const k = `${b.t}-${i}`;
        if (b.t === 'ul' || b.t === 'ol') {
          const Lista = b.t;
          return (
            <Lista
              key={k}
              style={{ ...corpo, paddingLeft: 22, display: 'grid', gap: 8, listStyle: b.t === 'ol' ? 'decimal' : 'disc' }}
            >
              {b.itens.map((it, j) => (
                <li key={`${k}-${j}`} dangerouslySetInnerHTML={{ __html: it }} />
              ))}
            </Lista>
          );
        }
        if (b.t === 'h2' || b.t === 'h3') {
          const Titulo = b.t;
          return (
            <Titulo
              key={k}
              style={{
                margin: b.t === 'h2' ? '38px 0 14px' : '30px 0 12px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                fontSize: b.t === 'h2' ? 'clamp(24px,3vw,32px)' : 'clamp(20px,2.4vw,25px)',
                color: cor.navy,
                textWrap: 'balance',
              }}
              dangerouslySetInnerHTML={{ __html: b.html }}
            />
          );
        }
        if (b.t === 'blockquote') {
          return (
            <blockquote
              key={k}
              style={{
                margin: '24px 0',
                padding: '4px 0 4px 20px',
                borderLeft: `3px solid ${cor.eco}`,
                fontSize: 19,
                lineHeight: 1.6,
                color: 'rgba(10,42,82,.9)',
              }}
              dangerouslySetInnerHTML={{ __html: b.html }}
            />
          );
        }
        return <p key={k} style={corpo} dangerouslySetInnerHTML={{ __html: b.html }} />;
      })}
    </>
  );
}

export function PaginaPost({ post }: { post: Post }) {
  const t = tema(post);
  const wa = waMsgHref(post.seo.waMsg);

  return (
    <>
      <JsonLd data={grafoPost(post)} />
      <JsonLd data={breadcrumbPost(post)} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <TopBar />
        <SiteHeader waHref={wa} />

        {/* Cabeça do artigo · campo */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(56% 42% at 50% 0%, rgba(20,112,196,.36) 0%, rgba(20,112,196,.11) 46%, rgba(6,20,35,0) 78%)" />
          <div
            style={{ position: 'relative', maxWidth: COLUNA, margin: '0 auto', padding: '64px 24px 52px' }}
          >
            <Link
              href={href('noticias')}
              className="ea-link-inherit"
              style={{
                color: cor.ceu,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              ‹ Notícias
            </Link>
            <h1
              style={{
                margin: '18px 0 0',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1.06,
                fontSize: 'clamp(32px,4.6vw,54px)',
                color: '#FFFFFF',
                textWrap: 'balance',
              }}
            >
              {post.titulo}
            </h1>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px 18px',
                marginTop: 22,
                fontSize: 14,
                color: 'rgba(169,214,245,.8)',
              }}
            >
              <span>Publicado em {dataLonga(post.data)}</span>
              <span aria-hidden="true">·</span>
              <span>{post.min} min de leitura</span>
            </div>
          </div>
        </section>

        {/* Texto · gelo */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div style={{ maxWidth: COLUNA, margin: '0 auto', padding: '56px 24px 64px' }}>
            <Blocos blocos={post.blocos} />

            {/* A interligação que o handoff pede: post → landing do tema */}
            <aside
              style={{
                marginTop: 46,
                background: '#FFFFFF',
                border: '1px solid rgba(20,112,196,.2)',
                borderRadius: 10,
                padding: 26,
              }}
            >
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: cor.eco,
                }}
              >
                O exame deste artigo
              </p>
              <h2
                style={{
                  margin: '0 0 10px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(22px,2.6vw,28px)',
                }}
              >
                {t.nome}
              </h2>
              <p style={{ margin: '0 0 18px', fontSize: 16, lineHeight: 1.55, color: 'rgba(10,42,82,.75)' }}>
                {t.hero?.sub ?? t.seo.description}
              </p>
              <Link
                href={t.path}
                className="ea-link-inherit"
                style={{
                  display: 'inline-block',
                  background: cor.navy,
                  color: cor.gelo,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: 999,
                }}
              >
                Ver a página de {t.curto} ›
              </Link>
            </aside>
          </div>
        </section>

        {/* Quem faz · pano eco branco */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', color: cor.navy }}
        >
          <Eco
            viewBox="0 0 1100 420"
            raios={[
              [270, 0.5],
              [460, 0.36],
              [650, 0.24],
            ]}
          />
          <div
            style={{
              position: 'relative',
              maxWidth: WRAP,
              margin: '0 auto',
              padding: '64px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 36,
              alignItems: 'center',
            }}
          >
            <RetratoRT width={168} height={198} />
            <div style={{ flex: 1, minWidth: 280 }}>
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: cor.eco,
                }}
              >
                Quem faz o exame
              </p>
              <h2
                style={{
                  margin: '0 0 6px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(24px,3vw,34px)',
                }}
              >
                {clinica.rt.name}
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'rgba(10,42,82,.7)' }}>
                {clinica.rt.specialty} · {clinica.rt.crm} · {clinica.rt.rqe}
              </p>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'rgba(10,42,82,.8)', maxWidth: '58ch' }}>
                {clinica.rt.bio}
              </p>
            </div>
          </div>
        </section>

        <Fechamento
          waHref={wa}
          sub={`${clinica.pagamento} · atendemos com pedido médico e encaminhamentos.`}
        >
          <p style={{ marginTop: 44 }}>
            <Link href={href('noticias')} className="ea-link-inherit" style={{ color: cor.ceu, fontSize: 15 }}>
              Ver <Em>todas</Em> as notícias ›
            </Link>
          </p>
        </Fechamento>

        <SiteFooter links />
      </div>
    </>
  );
}
