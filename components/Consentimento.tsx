import Link from 'next/link';
import { cor } from '@/lib/theme';

/**
 * Faixa de consentimento da medição de audiência.
 *
 * A Política de Cookies promete, em texto público, pedir consentimento no
 * primeiro acesso antes de ligar ferramenta de audiência ou cruzar navegação
 * com dados de campanha — esta faixa é o cumprimento dessa promessa.
 *
 * Não bloqueia a leitura: a mesma política diz que nada do site depende de
 * aceitar cookie, e um site de clínica não deve fazer paciente negociar com
 * modal para ler preparo de exame.
 */
export function Consentimento({
  onAceitar,
  onRecusar,
}: {
  onAceitar: () => void;
  onRecusar: () => void;
}) {
  return (
    <div
      className="ea-consent"
      role="dialog"
      aria-label="Consentimento de medição de audiência"
      style={{
        background: cor.navy,
        border: '1px solid rgba(169,214,245,.28)',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: '0 14px 40px rgba(6,20,35,.55)',
        color: cor.gelo,
      }}
    >
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
        Este site mede audiência para saber quais páginas ajudam quem procura exame, e
        registra de qual anúncio a visita veio. Nada disso é necessário para ler o site.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          margin: '16px 0 0',
        }}
      >
        <button
          type="button"
          onClick={onAceitar}
          style={{
            background: cor.ceu,
            color: cor.campo,
            border: 'none',
            borderRadius: 999,
            padding: '11px 24px',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Aceitar
        </button>

        <button
          type="button"
          onClick={onRecusar}
          style={{
            background: 'transparent',
            color: cor.gelo,
            border: '1px solid rgba(238,246,252,.34)',
            borderRadius: 999,
            padding: '11px 24px',
            fontSize: 15,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Recusar
        </button>

        <Link
          href="/cookies"
          style={{ color: cor.ceu, fontSize: 14, textDecoration: 'underline' }}
        >
          Política de Cookies
        </Link>
      </div>
    </div>
  );
}
