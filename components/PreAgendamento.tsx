'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { cor } from '@/lib/theme';

/**
 * O modal entra **sob demanda**, e isso é medida, não gosto: ele importa o
 * `ea-landings.json` inteiro (catálogo de exames + 44 convênios), e com o
 * import estático esse pacote viajava na carga inicial de toda página que usa
 * o `Fechamento` — incluindo `/noticias` e os 11 posts, onde o botão nem
 * aparece (§5.5 do mapa). Este arquivo fica leve de propósito: só o botão.
 *
 * ⚠️ `ssr: false` é o que tira o pacote da carga inicial. Ele só é permitido
 * dentro de um Componente de Cliente — em Componente de Servidor o Next
 * recusa, e `dynamic` sem ele **mantém** o pacote na carga inicial (medido
 * nesta fatia: 138 kB → 143 kB, ou seja, piorou).
 */
const ModalPreAgendamento = dynamic(
  () => import('./ModalPreAgendamento').then((m) => m.ModalPreAgendamento),
  { ssr: false },
);

/**
 * O botão que abre o pré-agendamento. Vive nos pontos do D4:
 * `/agende-seu-exame` e o `Fechamento` das 12 landings e da home — e também
 * no par de CTAs de toda resposta do concierge (§5.2).
 */
export function PreAgendamento({
  exameSlugInicial,
  rotulo = 'Preencher pré-agendamento',
  estilo,
}: {
  /** Slug da landing de origem — pré-seleciona o exame no modal (§4.5). */
  exameSlugInicial?: string;
  rotulo?: string;
  /**
   * Ajuste do botão, para quando ele não está num pano escuro de CTA — é o
   * caso do par de CTAs dentro da janela do concierge. O modal não muda.
   */
  estilo?: CSSProperties;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} style={{ ...botaoAbrir, ...estilo }}>
        {rotulo}
      </button>
      {aberto && (
        <ModalPreAgendamento
          exameSlugInicial={exameSlugInicial}
          onFechar={() => setAberto(false)}
        />
      )}
    </>
  );
}

const botaoAbrir: CSSProperties = {
  display: 'inline-block',
  border: '1px solid rgba(169,214,245,.5)',
  background: 'transparent',
  color: cor.ceu,
  fontFamily: 'inherit',
  fontSize: 18,
  fontWeight: 500,
  padding: '18px 36px',
  borderRadius: 999,
  cursor: 'pointer',
};
