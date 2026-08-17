import Link from 'next/link';
import { cor } from '@/lib/theme';

/**
 * Aviso de medição de audiência.
 *
 * Informa, não barra: a medição já está rodando quando esta faixa aparece, e
 * quem não quiser desliga ali mesmo, no "Recusar". É o modelo de recusa, que a
 * Política de Cookies descreve com essas palavras.
 *
 * Some da tela na primeira resposta, seja ela qual for, e não volta — faixa que
 * insiste custa agendamento e não acrescenta transparência nenhuma.
 */
export function AvisoMedicao({
  onEntendi,
  onRecusar,
}: {
  onEntendi: () => void;
  onRecusar: () => void;
}) {
  return (
    <div
      className="ea-aviso"
      role="region"
      aria-label="Aviso de medição de audiência"
      style={{
        background: cor.navy,
        border: '1px solid rgba(169,214,245,.28)',
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: '0 14px 40px rgba(6,20,35,.55)',
        color: cor.gelo,
      }}
    >
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }}>
        Este site mede audiência para saber quais páginas ajudam quem procura exame, e
        registra de qual anúncio a visita veio. Nada disso identifica você, e você pode
        desligar quando quiser.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          margin: '14px 0 0',
        }}
      >
        <button
          type="button"
          onClick={onEntendi}
          style={{
            background: cor.ceu,
            color: cor.campo,
            border: 'none',
            borderRadius: 999,
            padding: '10px 22px',
            fontSize: 14.5,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Entendi
        </button>

        <button
          type="button"
          onClick={onRecusar}
          style={{
            background: 'transparent',
            color: cor.gelo,
            border: '1px solid rgba(238,246,252,.34)',
            borderRadius: 999,
            padding: '10px 22px',
            fontSize: 14.5,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Recusar
        </button>

        <Link
          href="/cookies"
          style={{ color: cor.ceu, fontSize: 13.5, textDecoration: 'underline' }}
        >
          Política de Cookies
        </Link>
      </div>
    </div>
  );
}
