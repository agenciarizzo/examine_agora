import Link from 'next/link';
import { BotaoCeu, Em } from '@/components/Bits';
import { Halo } from '@/components/Panos';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TopBar } from '@/components/TopBar';
import { href, nav, waHref } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';

const wa = waHref('inicio');

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: cor.campo, color: cor.gelo }}>
      <TopBar />
      <SiteHeader waHref={wa} />
      <section style={{ position: 'relative', overflow: 'hidden', background: cor.campo }}>
        <Halo gradient="radial-gradient(56% 42% at 50% 20%, rgba(20,112,196,.38) 0%, rgba(20,112,196,.12) 46%, rgba(6,20,35,0) 78%)" />
        <div
          style={{
            position: 'relative',
            maxWidth: WRAP,
            margin: '0 auto',
            padding: '120px 24px 100px',
            textAlign: 'center',
          }}
        >
          <h1
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
            Esta página <Em>não existe</Em> mais
          </h1>
          <p
            style={{
              margin: '22px auto 0',
              fontSize: 18,
              color: 'rgba(238,246,252,.8)',
              maxWidth: '52ch',
            }}
          >
            O exame que você procura deve estar em uma destas páginas — ou é só chamar no WhatsApp.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              margin: '32px 0 34px',
            }}
          >
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="ea-link-inherit"
                style={{
                  border: '1px solid rgba(169,214,245,.4)',
                  color: cor.ceu,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 18px',
                  borderRadius: 999,
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <BotaoCeu href={wa} fontSize={17} padding="16px 32px">
            Agendar pelo WhatsApp
          </BotaoCeu>
          <p style={{ marginTop: 26 }}>
            <Link href={href('inicio')} style={{ color: cor.ceu, fontSize: 15 }}>
              Voltar para o início ›
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter links />
    </div>
  );
}
