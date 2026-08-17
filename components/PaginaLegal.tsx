import Link from 'next/link';
import { BotaoCeu, Em, ItemBarra, JsonLd } from '@/components/Bits';
import { Halo, Varredura } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { clinica, href, legalDoc, page, site, waHref } from '@/lib/content';
import { graph } from '@/lib/jsonld';
import { cor, WRAP } from '@/lib/theme';

/**
 * Renderer único das páginas legais (privacidade, termos, cookies), na mesma
 * linha visual do resto do site. Todo o texto vem de `site.legal` no
 * ea-landings.json — coluna editorial estreita, que é o que texto longo pede.
 */
export function PaginaLegal({ slug }: { slug: string }) {
  const p = page(slug);
  const doc = legalDoc(slug);
  const wa = waHref(slug);

  return (
    <>
      <JsonLd data={graph(slug)} />
      <WhatsAppFloat href={wa} />

      <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
        <SiteHeader waHref={wa} />

        {/* Hero curto · campo */}
        <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
          <Halo gradient="radial-gradient(56% 42% at 50% 0%, rgba(20,112,196,.34) 0%, rgba(20,112,196,.1) 46%, rgba(6,20,35,0) 78%)" />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '72px 24px 56px' }}
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
              {doc.h1a} <Em>{doc.emph}</Em>
              {doc.h1b && ` ${doc.h1b}`}
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
              {doc.lead}
            </p>
            <p
              style={{
                margin: '20px 0 0',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: cor.ceu,
              }}
            >
              Atualizado em {site.legal.atualizado}
            </p>
          </div>
        </section>

        {/* Texto · gelo, coluna editorial */}
        <section style={{ background: cor.gelo, color: cor.navy }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px 72px' }}>
            {doc.secoes.map((s) => (
              <section key={s.h2} style={{ marginBottom: 46 }}>
                <h2
                  style={{
                    margin: '0 0 16px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    fontSize: 'clamp(22px,2.6vw,30px)',
                    maxWidth: '26ch',
                    textWrap: 'balance',
                  }}
                >
                  {s.h2}
                </h2>
                {(s.ps ?? []).map((par) => (
                  <p
                    key={par.slice(0, 40)}
                    style={{
                      margin: '0 0 14px',
                      fontSize: 17,
                      lineHeight: 1.6,
                      color: 'rgba(10,42,82,.82)',
                    }}
                  >
                    {par}
                  </p>
                ))}
                {!!s.itens?.length && (
                  <div style={{ display: 'grid', gap: 10, margin: '18px 0 14px' }}>
                    {s.itens.map((it) => (
                      <ItemBarra key={it}>{it}</ItemBarra>
                    ))}
                  </div>
                )}
                {s.nota && (
                  <p
                    style={{
                      margin: '18px 0 0',
                      background: '#FFFFFF',
                      border: '1px solid rgba(20,112,196,.18)',
                      borderRadius: 10,
                      padding: '16px 20px',
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: 'rgba(10,42,82,.78)',
                    }}
                  >
                    {s.nota}
                  </p>
                )}
                {!!s.links?.length && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
                    {s.links.map((l) => (
                      <Link
                        key={l.slug}
                        href={href(l.slug)}
                        className="ea-link-inherit"
                        style={{
                          border: `1px solid ${cor.eco}`,
                          color: cor.eco,
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: 500,
                          padding: '8px 18px',
                          borderRadius: 999,
                        }}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>

        {/* Fecho discreto · navy */}
        <section
          style={{ position: 'relative', overflow: 'hidden', background: cor.navy, color: cor.gelo }}
        >
          <Varredura opacity={0.3} />
          <div
            style={{ position: 'relative', maxWidth: WRAP, margin: '0 auto', padding: '56px 24px' }}
          >
            <h2
              style={{
                margin: '0 0 12px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(24px,3vw,34px)',
                maxWidth: '22ch',
              }}
            >
              Ficou alguma dúvida sobre {p.curto.toLowerCase()}?
            </h2>
            <p
              style={{
                margin: '0 0 26px',
                fontSize: 16,
                lineHeight: 1.55,
                color: 'rgba(169,214,245,.8)',
                maxWidth: '58ch',
              }}
            >
              Fale com a recepção pelo WhatsApp {clinica.phone}, ou venha à clínica:{' '}
              {clinica.address} · {clinica.hours}.
            </p>
            <BotaoCeu href={wa} fontSize={16} padding="14px 28px">
              Falar no WhatsApp
            </BotaoCeu>
          </div>
        </section>

        <SiteFooter links />
      </div>
    </>
  );
}
