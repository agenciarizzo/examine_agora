import { clinica, mapHref, telHref } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';

/**
 * Barra utilitária acima do `<SiteHeader>`, em todas as páginas. Todo dado
 * vem de `clinica` (`content/ea-landings.json`) — nada hardcoded aqui.
 *
 * "Ligar" e "Como chegar" ficam sempre visíveis (o par que sobrevive no
 * celular); endereço escrito, horário e redes formam o grupo secundário,
 * que o `.ea-topbar-secundario` esconde em telas estreitas (`globals.css`).
 * Sem WhatsApp: já são 11 pontos de entrada dele no site — este é o trilho
 * do telefone.
 */
export function TopBar() {
  return (
    <div className="ea-topbar" style={{ background: cor.navy, borderBottom: '1px solid rgba(169,214,245,.14)' }}>
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '8px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px 20px',
          fontSize: 13,
          color: cor.ceu,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 20px' }}>
          <a href={telHref} className="ea-link-inherit ea-topbar-item" style={item}>
            <IconTelefone />
            <span style={{ fontWeight: 700 }}>Ligar {clinica.phone}</span>
          </a>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener"
            className="ea-link-inherit ea-topbar-item"
            style={item}
          >
            <IconPino />
            <span>Como chegar ›</span>
          </a>
        </div>

        <div className="ea-topbar-secundario">
          <span style={item}>
            <IconPino />
            {clinica.address}
          </span>
          <span style={item}>
            <IconRelogio />
            {clinica.hours}
          </span>
          <a href={clinica.instagram} target="_blank" rel="noopener" className="ea-link-inherit ea-topbar-item" style={item}>
            <IconInstagram />
            Instagram
          </a>
          <a href={clinica.facebook} target="_blank" rel="noopener" className="ea-link-inherit ea-topbar-item" style={item}>
            <IconFacebook />
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}

const item = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  textDecoration: 'none',
  color: cor.ceu,
  whiteSpace: 'nowrap',
} as const;

function IconTelefone() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" />
    </svg>
  );
}

function IconPino() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M12 2c-4.4 0-8 3.6-8 8 0 5.4 7 11.5 7.3 11.7.2.2.5.3.7.3s.5-.1.7-.3C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
    </svg>
  );
}

function IconRelogio() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-1.5v6l5.2 3.1.8-1.3-4.5-2.7V7z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M12 2c-2.7 0-3.1 0-4.1.1-1.1.1-1.8.2-2.5.5-.7.3-1.3.6-1.9 1.2C2.9 4.4 2.6 5 2.3 5.7c-.3.7-.4 1.4-.5 2.5C1.7 9.2 1.7 9.6 1.7 12.3s0 3.1.1 4.1c.1 1.1.2 1.8.5 2.5.3.7.6 1.3 1.2 1.9.6.6 1.2.9 1.9 1.2.7.3 1.4.4 2.5.5 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c1.1-.1 1.8-.2 2.5-.5.7-.3 1.3-.6 1.9-1.2.6-.6.9-1.2 1.2-1.9.3-.7.4-1.4.5-2.5.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-1.1-.2-1.8-.5-2.5-.3-.7-.6-1.3-1.2-1.9-.6-.6-1.2-.9-1.9-1.2-.7-.3-1.4-.4-2.5-.5C15.1 2 14.7 2 12 2zm0 1.8c2.6 0 3 0 4 .1 1 .1 1.5.2 1.9.4.5.2.8.4 1.1.7.3.3.5.6.7 1.1.2.4.3.9.4 1.9.1 1 .1 1.4.1 4s0 3-.1 4c-.1 1-.2 1.5-.4 1.9-.2.5-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.4.2-.9.3-1.9.4-1 .1-1.4.1-4 .1s-3 0-4-.1c-1-.1-1.5-.2-1.9-.4-.5-.2-.8-.4-1.1-.7-.3-.3-.5-.6-.7-1.1-.2-.4-.3-.9-.4-1.9-.1-1-.1-1.4-.1-4s0-3 .1-4c.1-1 .2-1.5.4-1.9.2-.5.4-.8.7-1.1.3-.3.6-.5 1.1-.7.4-.2.9-.3 1.9-.4 1-.1 1.4-.1 4-.1zm0 3a5.2 5.2 0 1 0 0 10.4A5.2 5.2 0 0 0 12 6.8zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8zm5.4-8.8a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8.1h2.7l.4-3.2h-3.1V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1C16.5 3 15.6 3 14.5 3c-2.3 0-3.9 1.4-3.9 4v2.7H8v3.2h2.6V21h2.9z" />
    </svg>
  );
}
