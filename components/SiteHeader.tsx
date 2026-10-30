import Image from 'next/image';
import Link from 'next/link';
import { clinica, href, nav } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';
import { MenuCelular } from './MenuCelular';

/**
 * Header data-driven (`site.nav` do json). O CTA some na página Agende,
 * como nos HTML de referência.
 *
 * Celular: os HTML de referência só desenham o desktop, e o nav quebrava em
 * 5 linhas ao lado do logo (medido em 390 px: 150 px de largura, 256 de
 * altura). Até 640 px o nav do desktop sai (`.ea-nav-desk`) e os mesmos
 * itens vão pra um `<details>` "Menu" (`MenuCelular`) — o desktop fica
 * idêntico. Regras no `globals.css`.
 */
export function SiteHeader({
  waHref,
  cta = true,
}: {
  waHref: string;
  cta?: boolean;
}) {
  return (
    <header
      style={{
        background: cor.campo,
        borderBottom: '1px solid rgba(169,214,245,.14)',
        position: 'relative',
        zIndex: 5,
      }}
    >
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link href={href('inicio')} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/ea_logo_light.png"
            alt={clinica.nome}
            width={340}
            height={68}
            priority
            style={{ height: 34, width: 'auto', display: 'block' }}
          />
        </Link>
        <nav className="ea-nav-desk" style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="ea-link-inherit"
              style={{ color: cor.ceu, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
            >
              {n.label}
            </Link>
          ))}
          {cta && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              style={{
                background: cor.ceu,
                color: cor.campo,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: 999,
              }}
            >
              Agende seu exame
            </a>
          )}
        </nav>
        <MenuCelular itens={nav} waHref={waHref} cta={cta} />
      </div>
    </header>
  );
}
