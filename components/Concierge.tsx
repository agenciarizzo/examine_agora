'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { CartaoConcierge } from '@/lib/concierge';
import { cor } from '@/lib/theme';

/**
 * A janela entra **sob demanda**, e isso é medida, não gosto: ela resolve o
 * roteiro em `lib/concierge.ts`, que lê o `ea-landings.json` inteiro. Com o
 * import estático, esse pacote viajaria na carga inicial de toda página que
 * mostra o card — inclusive na rota `/[slug]`, que as landings dividem com os
 * 11 posts do WP (§5.5 do mapa).
 *
 * ⚠️ `ssr: false` é o que tira o pacote da carga inicial, e ele só vale dentro
 * de um Componente de Cliente. `dynamic` SEM ele mantém tudo na carga inicial
 * — medido nesta fatia: 138 kB → 143 kB, ou seja, piorou. Por isso o card
 * (que precisa estar no HTML servido, é o que a varredura das 32 URLs
 * confere) mora aqui, leve, e só a janela é adiada.
 *
 * A copy vem por `prop` em vez de `import` pelo mesmo motivo: quem lê o json
 * é o Componente de Servidor que monta o card.
 */
const ConciergeJanela = dynamic(
  () => import('./ConciergeJanela').then((m) => m.ConciergeJanela),
  { ssr: false },
);

/**
 * O card de entrada do concierge SEM IA (§5 do mapa), nos dois pontos do D2:
 * o fim do bloco de FAQ e o CTA final.
 *
 * ⚠️ Não existe segundo flutuante (D2): o canto de baixo à direita continua
 * sendo só do `WhatsAppFloat`.
 */
export function Concierge({
  cartao,
  tom = 'claro',
  exameSlug,
}: {
  /** `site.concierge.cartao` — lido no servidor e passado pronto. */
  cartao: CartaoConcierge;
  /** `escuro` = sobre pano campo/navy (o Fechamento); `claro` = sobre gelo. */
  tom?: 'claro' | 'escuro';
  /** Landing de origem — o pré-agendamento abre com o exame preenchido. */
  exameSlug?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const escuro = tom === 'escuro';

  return (
    <>
      <div style={escuro ? cartaoEscuro : cartaoClaro}>
        <p style={escuro ? cartaoTituloEscuro : cartaoTituloClaro}>{cartao.titulo}</p>
        <p style={escuro ? cartaoLinhaEscura : cartaoLinhaClara}>{cartao.linha}</p>
        <button
          type="button"
          onClick={() => setAberto(true)}
          style={escuro ? botaoCardEscuro : botaoCardClaro}
        >
          <IconeGuia />
          {cartao.botao}
        </button>
      </div>
      {aberto && (
        <ConciergeJanela onFechar={() => setAberto(false)} exameSlugDoCard={exameSlug} />
      )}
    </>
  );
}

/** Balão de dúvidas — SVG inline, como o ícone do `WhatsAppFloat`. */
function IconeGuia() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: '0 0 auto' }}
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.7-5a8.4 8.4 0 0 1-.7-3.4 8.4 8.4 0 0 1 8.4-8.4 8.4 8.4 0 0 1 8.6 7.8z" />
      <path d="M9.6 9.6a2.4 2.4 0 0 1 4.7.8c0 1.6-2.4 2.4-2.4 2.4" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

const cartaoBase: CSSProperties = {
  borderRadius: 10,
  padding: 24,
  maxWidth: 520,
};

const cartaoClaro: CSSProperties = {
  ...cartaoBase,
  background: '#FFFFFF',
  border: '1px solid rgba(20,112,196,.18)',
  color: cor.navy,
  margin: '32px auto 0',
  textAlign: 'left',
};

const cartaoEscuro: CSSProperties = {
  ...cartaoBase,
  background: 'rgba(238,246,252,.06)',
  border: '1px solid rgba(169,214,245,.28)',
  color: cor.gelo,
  margin: '48px auto 0',
  textAlign: 'center',
};

const cartaoTituloBase: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: '-0.01em',
};

const cartaoTituloClaro: CSSProperties = { ...cartaoTituloBase, color: cor.navy };
const cartaoTituloEscuro: CSSProperties = { ...cartaoTituloBase, color: '#FFFFFF' };

const cartaoLinhaBase: CSSProperties = { margin: '0 0 18px', fontSize: 15, lineHeight: 1.55 };

const cartaoLinhaClara: CSSProperties = { ...cartaoLinhaBase, color: 'rgba(10,42,82,.75)' };
const cartaoLinhaEscura: CSSProperties = { ...cartaoLinhaBase, color: 'rgba(238,246,252,.78)' };

const botaoCardBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'inherit',
  fontSize: 16,
  fontWeight: 700,
  padding: '12px 24px',
  borderRadius: 999,
  cursor: 'pointer',
};

const botaoCardClaro: CSSProperties = {
  ...botaoCardBase,
  border: `1px solid ${cor.eco}`,
  background: 'transparent',
  color: cor.eco,
};

const botaoCardEscuro: CSSProperties = {
  ...botaoCardBase,
  border: '1px solid rgba(169,214,245,.5)',
  background: 'transparent',
  color: cor.ceu,
};
