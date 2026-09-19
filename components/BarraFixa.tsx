'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { PreAgendamento } from './PreAgendamento';
import { cor } from '@/lib/theme';

/**
 * A janela entra sob demanda pelo mesmo motivo de `Concierge.tsx` (§5.5 do
 * mapa): ela lê o `ea-landings.json` inteiro, e isso não pode viajar na carga
 * inicial de página nenhuma — a barra existe nas 32.
 */
const ConciergeJanela = dynamic(
  () => import('./ConciergeJanela').then((m) => m.ConciergeJanela),
  { ssr: false },
);

/**
 * Barra fixa do rodapé, largura inteira, em toda página (§14 do mapa) — molde
 * de `StickyActionBar.tsx` do repo SR, adaptado: aqui o WhatsApp não some no
 * celular, muda de forma (o `WhatsAppFloat` de canto é quem sai, pra não
 * empilhar com esta barra — ver `components/WhatsAppFloat.tsx`).
 *
 * O WhatsApp é o único botão universal (§7 invariante 6: continua em TODAS as
 * páginas). Pré-agendamento e Dúvidas nascem OPT-IN (§5.5) — a mesma régua do
 * `Fechamento` e do `Concierge`, senão vazam pros mesmos 26/32 URLs que a F3
 * da Fatia 1 já corrigiu uma vez.
 *
 * Os 3 rótulos são os do próprio pedido desta fatia (curtos, de propósito):
 * "Preencher pré-agendamento" (o padrão do componente) e "Abrir o guia de
 * dúvidas" (`site.concierge.cartao.botao`) não cabem 3-a-3 numa tela de
 * celular sem cortar — medido: o texto ficava truncado dos DOIS lados (botão
 * centralizado + overflow), não só no fim. Rótulo de botão é chrome de UI,
 * não roteiro do concierge — por isso fica aqui, não no json (§7-5 é sobre o
 * SCRIPT do concierge/pré-agendamento, não sobre o texto do botão que abre).
 */
export function BarraFixa({
  waHref,
  preAgendamento = false,
  concierge = false,
  exameSlug,
}: {
  waHref: string;
  preAgendamento?: boolean;
  concierge?: boolean;
  /** Landing de origem — pré-seleciona o exame no modal e no concierge. */
  exameSlug?: string;
}) {
  const [duvidasAberta, setDuvidasAberta] = useState(false);

  return (
    <>
      <div className="ea-barra-fixa" style={barra}>
        <a href={waHref} target="_blank" rel="noopener" style={botaoWhats}>
          <IconeWhats />
          WhatsApp
        </a>
        {preAgendamento && (
          <PreAgendamento
            exameSlugInicial={exameSlug}
            rotulo="Pré-agendamento"
            estilo={ajusteBotao}
          />
        )}
        {concierge && (
          <button
            type="button"
            onClick={() => setDuvidasAberta(true)}
            style={{ ...botaoVazado, ...ajusteBotao }}
          >
            Dúvidas
          </button>
        )}
      </div>
      {concierge && duvidasAberta && (
        <ConciergeJanela onFechar={() => setDuvidasAberta(false)} exameSlugDoCard={exameSlug} />
      )}
    </>
  );
}

/** Mesmo ícone do `WhatsAppFloat`, menor — a barra tem texto ao lado. */
function IconeWhats() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="#FFFFFF"
      aria-hidden="true"
      style={{ flex: '0 0 auto' }}
    >
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.9 9.88m8.42-18.3A11.8 11.8 0 0 0 12.08 0C5.54 0 .21 5.32.2 11.87c0 2.09.55 4.13 1.59 5.93L.1 24l6.34-1.66a11.9 11.9 0 0 0 5.67 1.44h.01c6.54 0 11.86-5.32 11.87-11.87 0-3.17-1.23-6.15-3.48-8.4" />
    </svg>
  );
}

const barra: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '10px 14px',
  paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
  background: cor.navy,
  borderTop: '1px solid rgba(169,214,245,.28)',
  boxShadow: '0 -8px 24px rgba(6,20,35,.35)',
};

const botaoBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: 'inherit',
  fontWeight: 700,
  padding: '10px 14px',
  borderRadius: 999,
  textDecoration: 'none',
  cursor: 'pointer',
  flex: '1 1 0',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const botaoWhats: CSSProperties = {
  ...botaoBase,
  background: cor.whatsapp,
  color: '#FFFFFF',
  border: 'none',
  fontSize: 14,
};

const botaoVazado: CSSProperties = {
  ...botaoBase,
  background: 'transparent',
  border: '1px solid rgba(169,214,245,.5)',
  color: cor.ceu,
  fontSize: 13.5,
};

/** Reaproveita o botão do `PreAgendamento` (que já aceita `estilo`), só encolhendo pra caber na barra. */
const ajusteBotao: CSSProperties = {
  fontSize: 13.5,
  padding: '10px 14px',
  flex: '1 1 0',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
