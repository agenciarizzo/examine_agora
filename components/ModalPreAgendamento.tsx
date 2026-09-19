'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { ItemBarra } from '@/components/Bits';
import { site } from '@/lib/content';
import {
  CAMPOS_VAZIOS,
  EXAME_OUTRO,
  EXAMES,
  OBSERVACAO_MAX,
  PACIENTE_MAX,
  PEDIDO_MEDICO_OPCOES,
  TURNO_OPCOES,
  montarMensagem,
  preparoDoExame,
  primeiroExameDaLanding,
  type CamposPreAgendamento,
} from '@/lib/preagendamento';
import { cor } from '@/lib/theme';
import { degrauHref } from '@/lib/whatsapp';

/** `?o=` do pré-agendamento — dimensão de origem do `generate_lead` (§3.1 do mapa). */
const ORIGEM = 'preagendamento';

function camposIniciais(exameSlugInicial?: string): CamposPreAgendamento {
  const exame = exameSlugInicial ? primeiroExameDaLanding(exameSlugInicial) : undefined;
  return exame ? { ...CAMPOS_VAZIOS, exame: exame.nome } : CAMPOS_VAZIOS;
}

/**
 * O modal do pré-agendamento (§4 do mapa). Quem o abre é o botão de
 * `components/PreAgendamento.tsx`, que carrega este módulo **sob demanda**:
 * ele puxa o `ea-landings.json` inteiro para o navegador (catálogo de exames
 * + 44 convênios) e não pode viajar na carga inicial de página nenhuma —
 * é a sobra medida do §5.5 do mapa (138 kB × 111 kB de First Load JS).
 *
 * `exameSlugInicial` é o slug da landing de origem — o modal abre com o
 * primeiro exame do catálogo daquele slug já selecionado (§4.5); sem slug
 * (home, `/agende-seu-exame`) ou landing sem exame no catálogo (o hub), abre
 * sem pré-seleção.
 */
export function ModalPreAgendamento({
  exameSlugInicial,
  onFechar,
}: {
  exameSlugInicial?: string;
  onFechar: () => void;
}) {
  const [campos, setCampos] = useState<CamposPreAgendamento>(() =>
    camposIniciais(exameSlugInicial),
  );
  const [copiado, setCopiado] = useState(false);

  // Trava o scroll de fundo e fecha no Esc — o par de hábitos de qualquer
  // diálogo modal. Sem framework de UI no site, os dois são ~10 linhas.
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function noEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    document.addEventListener('keydown', noEsc);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', noEsc);
    };
  }, [onFechar]);

  function muda<K extends keyof CamposPreAgendamento>(campo: K, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  const mensagem = montarMensagem(campos);
  const href = degrauHref(mensagem, ORIGEM);
  const preparo =
    campos.exame && campos.exame !== EXAME_OUTRO ? preparoDoExame(campos.exame) : undefined;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissão de clipboard (ou contexto não seguro): o "Enviar no
      // WhatsApp" continua sendo o caminho principal, então não há o que tratar.
    }
  }

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
      style={overlay}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="pre-agendamento-titulo" style={cartao}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h2 id="pre-agendamento-titulo" style={titulo}>
            Pré-agendamento
          </h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" style={botaoFechar}>
            ×
          </button>
        </div>
        <p style={subtitulo}>Preencha o que já sabe — a gente confirma o resto pelo WhatsApp.</p>

        <label style={rotuloCampo}>
          Paciente
          <input
            type="text"
            value={campos.paciente}
            maxLength={PACIENTE_MAX}
            onChange={(e) => muda('paciente', e.target.value)}
            placeholder="Nome de quem vai fazer o exame"
            style={input}
          />
        </label>

        <label style={rotuloCampo}>
          Exame
          <select value={campos.exame} onChange={(e) => muda('exame', e.target.value)} style={input}>
            <option value="">Selecione</option>
            {EXAMES.map((ex) => (
              <option key={ex.nome} value={ex.nome}>
                {ex.nome}
              </option>
            ))}
            <option value={EXAME_OUTRO}>{EXAME_OUTRO}</option>
          </select>
        </label>
        {preparo && <ItemBarra>{preparo}</ItemBarra>}

        <label style={rotuloCampo}>
          Convênio
          <select value={campos.convenio} onChange={(e) => muda('convenio', e.target.value)} style={input}>
            <option value="">Selecione</option>
            <option value="Particular">Particular</option>
            {site.convenios.map((cv) => (
              <option key={cv} value={cv}>
                {cv}
              </option>
            ))}
          </select>
        </label>

        <label style={rotuloCampo}>
          Pedido médico
          <select
            value={campos.pedidoMedico}
            onChange={(e) => muda('pedidoMedico', e.target.value)}
            style={input}
          >
            <option value="">Selecione</option>
            {PEDIDO_MEDICO_OPCOES.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </label>

        <label style={rotuloCampo}>
          Turno
          <select value={campos.turno} onChange={(e) => muda('turno', e.target.value)} style={input}>
            <option value="">Selecione</option>
            {TURNO_OPCOES.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </label>

        <label style={rotuloCampo}>
          Observação <span style={opcional}>(opcional)</span>
          <textarea
            value={campos.observacao}
            maxLength={OBSERVACAO_MAX}
            onChange={(e) => muda('observacao', e.target.value)}
            placeholder="Cadeirante, acompanhante, semana de gestação…"
            rows={3}
            style={{ ...input, resize: 'vertical' }}
          />
        </label>

        <div style={preview}>
          <p style={previewRotulo}>Prévia da mensagem</p>
          <pre style={previewTexto}>{mensagem}</pre>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
          <a href={href} target="_blank" rel="noopener" style={botaoEnviar}>
            Enviar no WhatsApp
          </a>
          <button type="button" onClick={copiar} style={botaoCopiar}>
            {copiado ? 'Copiado!' : 'Copiar mensagem'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  background: 'rgba(6,20,35,.72)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  overflowY: 'auto',
};

const cartao: CSSProperties = {
  width: '100%',
  maxWidth: 520,
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#FFFFFF',
  color: cor.navy,
  borderRadius: 14,
  padding: 28,
  boxShadow: '0 24px 60px rgba(6,20,35,.45)',
};

const titulo: CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: cor.navy,
};

const subtitulo: CSSProperties = {
  margin: '8px 0 24px',
  fontSize: 15,
  lineHeight: 1.5,
  color: 'rgba(10,42,82,.7)',
};

const botaoFechar: CSSProperties = {
  flex: '0 0 auto',
  border: 'none',
  background: 'transparent',
  fontSize: 28,
  lineHeight: 1,
  color: 'rgba(10,42,82,.5)',
  cursor: 'pointer',
  padding: 4,
};

const rotuloCampo: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: cor.eco,
  marginTop: 16,
};

const opcional: CSSProperties = {
  textTransform: 'none',
  fontWeight: 500,
  letterSpacing: 0,
  color: 'rgba(10,42,82,.5)',
};

const input: CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  border: '1px solid rgba(10,42,82,.22)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'inherit',
  color: cor.navy,
  background: '#FFFFFF',
  boxSizing: 'border-box',
};

const preview: CSSProperties = {
  marginTop: 22,
  padding: 16,
  background: cor.gelo,
  borderRadius: 10,
};

const previewRotulo: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'rgba(10,42,82,.55)',
};

const previewTexto: CSSProperties = {
  margin: 0,
  fontFamily: 'inherit',
  fontSize: 14,
  lineHeight: 1.6,
  color: cor.navy,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const botaoEnviar: CSSProperties = {
  display: 'inline-block',
  background: cor.whatsapp,
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: 16,
  fontWeight: 700,
  padding: '14px 28px',
  borderRadius: 999,
};

const botaoCopiar: CSSProperties = {
  display: 'inline-block',
  border: '1px solid rgba(10,42,82,.22)',
  background: 'transparent',
  color: cor.navy,
  fontFamily: 'inherit',
  fontSize: 15,
  fontWeight: 500,
  padding: '14px 24px',
  borderRadius: 999,
  cursor: 'pointer',
};
