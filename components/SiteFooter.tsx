import Image from 'next/image';
import Link from 'next/link';
import { clinica, href, nav } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';

/**
 * Rodapé mudo com a linha do RT. A faixa de links só aparece nas páginas que
 * a têm nos HTML de referência (Home e landings).
 */
export function SiteFooter({ links = false }: { links?: boolean }) {
  return (
    <footer style={{ background: cor.navy, borderTop: '1px solid rgba(169,214,245,.14)' }}>
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '30px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Image
          src="/ea_logo_light.png"
          alt="Examine Agora"
          width={300}
          height={60}
          style={{ height: 30, width: 'auto', display: 'block' }}
        />
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(169,214,245,.7)' }}>{clinica.rt_line}</p>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(169,214,245,.7)' }}>
          {clinica.handle} · {clinica.site}
        </p>
      </div>
      {links && (
        <div
          style={{
            maxWidth: WRAP,
            margin: '0 auto',
            padding: '0 24px 26px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 22px',
          }}
        >
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="ea-link-inherit"
              style={{ color: 'rgba(169,214,245,.55)', textDecoration: 'none', fontSize: 12 }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={href('agende')}
            className="ea-link-inherit"
            style={{ color: 'rgba(169,214,245,.55)', textDecoration: 'none', fontSize: 12 }}
          >
            Agende seu exame
          </Link>
        </div>
      )}
    </footer>
  );
}
