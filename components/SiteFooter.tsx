import Image from 'next/image';
import Link from 'next/link';
import { clinica, href, legais, nav } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';

const miudo = {
  color: 'rgba(169,214,245,.55)',
  textDecoration: 'none',
  fontSize: 12,
} as const;

/**
 * Rodapé mudo com a linha do RT. A faixa de links de navegação só aparece nas
 * páginas que a têm nos HTML de referência (Home e landings); a faixa legal
 * (privacidade, termos, cookies) vai em todas — é por ela que essas páginas
 * deixam de ser órfãs, no site e para o buscador.
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
            padding: '0 24px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 22px',
          }}
        >
          {nav.map((n) => (
            <Link key={n.label} href={n.href} className="ea-link-inherit" style={miudo}>
              {n.label}
            </Link>
          ))}
          <Link href={href('agende')} className="ea-link-inherit" style={miudo}>
            Agende seu exame
          </Link>
        </div>
      )}
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '16px 24px 26px',
          borderTop: '1px solid rgba(169,214,245,.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 22px',
        }}
      >
        {legais.map((l) => (
          <Link key={l.slug} href={l.path} className="ea-link-inherit" style={miudo}>
            {l.nome}
          </Link>
        ))}
      </div>
    </footer>
  );
}
