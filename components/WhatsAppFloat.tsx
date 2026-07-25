import { cor } from '@/lib/theme';

/**
 * Float de WhatsApp fixo — obrigatório em todas as páginas
 * (bottom-right, #25D366, 58px, link `wa.me/...?text=` da própria página).
 */
export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="ea-hover-wa"
      aria-label="Agendar pelo WhatsApp"
      target="_blank"
      rel="noopener"
      style={{
        position: 'fixed',
        right: 22,
        bottom: 22,
        zIndex: 80,
        width: 58,
        height: 58,
        borderRadius: 999,
        background: cor.whatsapp,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 26px rgba(6,20,35,.5)',
        textDecoration: 'none',
      }}
    >
      <svg viewBox="0 0 24 24" width={30} height={30} fill="#FFFFFF" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.9 9.88m8.42-18.3A11.8 11.8 0 0 0 12.08 0C5.54 0 .21 5.32.2 11.87c0 2.09.55 4.13 1.59 5.93L.1 24l6.34-1.66a11.9 11.9 0 0 0 5.67 1.44h.01c6.54 0 11.86-5.32 11.87-11.87 0-3.17-1.23-6.15-3.48-8.4" />
      </svg>
    </a>
  );
}
