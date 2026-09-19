'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { PreAgendamento } from '@/components/PreAgendamento';
import {
  ctas,
  janela as janelaJson,
  ORIGEM,
  rodape,
  TELA_INICIAL,
  tela as resolveTela,
} from '@/lib/concierge';
import { cor } from '@/lib/theme';
import { degrauHref } from '@/lib/whatsapp';

/**
 * A janela do concierge — bottom sheet no celular, flutuante no desktop.
 *
 * Mora num módulo próprio porque é o lado PESADO do concierge: resolve o
 * roteiro em `lib/concierge.ts`, que lê o `ea-landings.json` inteiro. O card
 * de entrada (`components/Concierge.tsx`) a carrega sob demanda, no clique —
 * assim nenhuma página paga esse pacote na carga inicial (§5.5 do mapa).
 *
 * O que ela deliberadamente NÃO é (§5.3): sem nome de gente, sem "digitando",
 * **sem caixa de texto**, sem menção a valor, sem diagnóstico. Toda tela é
 * uma lista de botões; toda resposta vem do json por endereço.
 */
export function ConciergeJanela({
  onFechar,
  exameSlugDoCard,
}: {
  onFechar: () => void;
  /** Landing de origem do card — o pré-agendamento abre com o exame posto. */
  exameSlugDoCard?: string;
}) {
  const [id, setId] = useState(TELA_INICIAL);
  const [celular, setCelular] = useState(false);

  // Sem Tailwind e sem folha de estilo própria (o glob desta fatia não inclui
  // `app/globals.css`), a quebra por largura é medida aqui. A janela só
  // existe depois de um clique, então não há divergência de hidratação.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const aplica = () => setCelular(mq.matches);
    aplica();
    mq.addEventListener('change', aplica);
    return () => mq.removeEventListener('change', aplica);
  }, []);

  // Esc fecha. O scroll da página NÃO é travado de propósito: isto é um
  // painel, não um diálogo modal — e travar aqui brigaria com o modal do
  // pré-agendamento, que abre por cima e trava o seu.
  useEffect(() => {
    function noEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    document.addEventListener('keydown', noEsc);
    return () => document.removeEventListener('keydown', noEsc);
  }, [onFechar]);

  const t = resolveTela(id);
  const exameSlug = t.exameSlug ?? exameSlugDoCard;
  const hrefHumano = degrauHref(t.waMsg, ORIGEM);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={janelaJson.titulo}
      style={celular ? janelaCelular : janelaDesktop}
    >
      <div style={cabecalho}>
        {t.voltar ? (
          <button type="button" onClick={() => setId(t.voltar!)} style={botaoCabecalho}>
            ‹ {janelaJson.voltar}
          </button>
        ) : (
          <span style={{ ...botaoCabecalho, cursor: 'default' }}>{janelaJson.titulo}</span>
        )}
        <button
          type="button"
          onClick={onFechar}
          aria-label={janelaJson.fechar}
          style={{ ...botaoCabecalho, fontSize: 22, lineHeight: 1, padding: '2px 8px' }}
        >
          ×
        </button>
      </div>

      <div style={corpo}>
        <h3 style={tituloTela}>{t.titulo}</h3>

        {t.paragrafos.map((p) => (
          <p key={p} style={paragrafo}>
            {p}
          </p>
        ))}

        {t.itens.length > 0 && (
          <ul style={lista}>
            {t.itens.map((it) => (
              <li key={it} style={item}>
                {it}
              </li>
            ))}
          </ul>
        )}

        {t.opcoes.map((op) => (
          <button key={op.id} type="button" onClick={() => setId(op.id)} style={botaoOpcao}>
            {op.rotulo}
          </button>
        ))}

        {t.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            {...(l.externo ? { target: '_blank', rel: 'noopener' } : {})}
            style={linkTela}
          >
            {l.rotulo} ›
          </a>
        ))}

        {/* Fim de TODA resposta, nesta ordem (§5.2): pré-agendamento, depois WhatsApp. */}
        {t.resposta && (
          <div style={parCta}>
            <PreAgendamento
              exameSlugInicial={exameSlug}
              rotulo={ctas.preAgendamento}
              estilo={botaoPreAgendamento}
            />
            <a href={hrefHumano} target="_blank" rel="noopener" style={botaoWhatsApp}>
              {ctas.whatsapp}
            </a>
          </div>
        )}
      </div>

      {/*
        Rodapé fixo (§5.2), visível em TODA tela: a saída humana fecha toda
        lista, e a linha de urgência não é condicional — sem entrada livre não
        há texto pra interpretar, então a única forma honesta de cobrir
        urgência é deixá-la à vista o tempo todo.
      */}
      <div style={rodapeCaixa}>
        <a href={hrefHumano} target="_blank" rel="noopener" style={botaoSaida}>
          {ctas.semResposta}
        </a>
        <p style={linhaUrgencia}>{rodape.urgencia}</p>
        <p style={linhaQuem}>{rodape.quem}</p>
      </div>
    </div>
  );
}

const janelaBase: CSSProperties = {
  position: 'fixed',
  zIndex: 120,
  display: 'flex',
  flexDirection: 'column',
  background: '#FFFFFF',
  color: cor.navy,
  boxShadow: '0 24px 60px rgba(6,20,35,.45)',
  overflow: 'hidden',
};

/**
 * Desktop: janela flutuante ACIMA do `WhatsAppFloat` (`right: 22 · bottom: 22`)
 * — com o guia aberto, o WhatsApp continua no canto de sempre, à vista e
 * clicável. Não existe segundo flutuante (D2): a entrada é o card na página.
 */
const janelaDesktop: CSSProperties = {
  ...janelaBase,
  right: 22,
  bottom: 100,
  width: 380,
  maxHeight: 'min(620px, calc(100vh - 140px))',
  borderRadius: 14,
  border: '1px solid rgba(10,42,82,.14)',
};

/** Celular: bottom sheet. */
const janelaCelular: CSSProperties = {
  ...janelaBase,
  left: 0,
  right: 0,
  bottom: 0,
  maxHeight: '82vh',
  borderRadius: '14px 14px 0 0',
};

const cabecalho: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  borderBottom: '1px solid rgba(10,42,82,.12)',
  background: cor.gelo,
};

const botaoCabecalho: CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 700,
  color: cor.eco,
  cursor: 'pointer',
  padding: '6px 8px',
};

const corpo: CSSProperties = {
  flex: '1 1 auto',
  overflowY: 'auto',
  padding: '18px 20px 22px',
};

const tituloTela: CSSProperties = {
  margin: '0 0 12px',
  fontSize: 19,
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: cor.navy,
};

const paragrafo: CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  lineHeight: 1.6,
  color: 'rgba(10,42,82,.85)',
};

const lista: CSSProperties = {
  margin: '0 0 14px',
  padding: 0,
  listStyle: 'none',
};

const item: CSSProperties = {
  borderLeft: `3px solid ${cor.eco}`,
  padding: '5px 0 5px 12px',
  marginBottom: 8,
  fontSize: 15,
  lineHeight: 1.5,
  color: 'rgba(10,42,82,.85)',
};

const botaoOpcao: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  border: '1px solid rgba(20,112,196,.3)',
  background: '#FFFFFF',
  color: cor.navy,
  fontFamily: 'inherit',
  fontSize: 15,
  lineHeight: 1.45,
  fontWeight: 500,
  padding: '12px 14px',
  borderRadius: 10,
  marginBottom: 8,
  cursor: 'pointer',
};

const linkTela: CSSProperties = {
  display: 'inline-block',
  marginTop: 6,
  marginRight: 16,
  fontSize: 14,
  fontWeight: 700,
  color: cor.eco,
  textDecoration: 'none',
};

const parCta: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 18,
};

const botaoPreAgendamento: CSSProperties = {
  border: `1px solid ${cor.eco}`,
  color: cor.eco,
  fontSize: 15,
  fontWeight: 700,
  padding: '12px 20px',
};

const botaoWhatsApp: CSSProperties = {
  display: 'inline-block',
  background: cor.whatsapp,
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: 15,
  fontWeight: 700,
  padding: '12px 20px',
  borderRadius: 999,
};

const rodapeCaixa: CSSProperties = {
  flex: '0 0 auto',
  borderTop: '1px solid rgba(10,42,82,.12)',
  background: cor.gelo,
  padding: '14px 20px 16px',
};

const botaoSaida: CSSProperties = {
  display: 'block',
  textAlign: 'center',
  border: '1px solid rgba(10,42,82,.25)',
  borderRadius: 999,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 700,
  color: cor.navy,
  textDecoration: 'none',
};

const linhaUrgencia: CSSProperties = {
  margin: '12px 0 0',
  fontSize: 12.5,
  lineHeight: 1.5,
  fontWeight: 700,
  color: cor.navy,
};

const linhaQuem: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 12,
  lineHeight: 1.5,
  color: 'rgba(10,42,82,.65)',
};
