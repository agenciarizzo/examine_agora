/**
 * Medição de audiência e atribuição de clique pago.
 *
 * Duas coisas moram aqui: o carregamento do Google Analytics e a captura do
 * identificador de clique que o Google Ads (ou o Meta) põe na URL da landing.
 *
 * O identificador viaja depois na mensagem do WhatsApp, numa linha final, para
 * que a recepção consiga amarrar o contato ao clique no CRM e a clínica consiga
 * subir a conversão offline — exame realizado — de volta para o Google Ads.
 * Sem isso, o lance otimiza por clique no botão; com isso, por exame feito.
 *
 * Modelo de escolha: a medição roda desde a primeira visita e o aviso informa,
 * em vez de barrar. Só o "recusar" desliga — e desliga tudo, medição e
 * atribuição. Ausência de escolha significa medindo, não parado.
 *
 * Este arquivo é puro de propósito: nada de DOM além de `localStorage`, para
 * que a regra de negócio fique testável e longe do componente.
 */

/** `aceito` aqui quer dizer "avisado e seguiu adiante". */
export type EscolhaDeMedicao = 'aceito' | 'recusado';

const CHAVE_ESCOLHA = 'ea_medicao';
const CHAVE_ORIGEM = 'ea_origem';

/** 90 dias — a janela do Google Ads para importar conversão offline. */
const VALIDADE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Identificadores de clique pago, na ordem de precedência. O `gclid` cobre a
 * maior parte das campanhas de Search; `gbraid` e `wbraid` aparecem quando a
 * campanha envolve app ou iOS e o `gclid` não vem; `fbclid` é do Meta e serve
 * para o mesmo trabalho do outro lado.
 */
const IDS_DE_CLIQUE = ['gclid', 'gbraid', 'wbraid', 'fbclid'] as const;

export type TipoDeClique = (typeof IDS_DE_CLIQUE)[number];

export type Origem = {
  tipo: TipoDeClique;
  valor: string;
  /** Momento da captura, em ms — é o que expira a origem depois de 90 dias. */
  ts: number;
};

/**
 * O valor entra numa mensagem que a paciente vê e envia, então é tratado como
 * entrada hostil: só o alfabeto que os identificadores de clique realmente
 * usam, e com teto de tamanho.
 */
const VALOR_VALIDO = /^[A-Za-z0-9._-]{1,200}$/;

/** Lê o identificador de clique da query string da landing, se houver algum. */
export function origemDaUrl(search: string, agora = Date.now()): Origem | null {
  const q = new URLSearchParams(search);

  for (const tipo of IDS_DE_CLIQUE) {
    const valor = q.get(tipo);
    if (valor && VALOR_VALIDO.test(valor)) return { tipo, valor, ts: agora };
  }
  return null;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // Navegador com storage bloqueado: a medição desliga sozinha, sem quebrar.
    return null;
  }
}

export function leEscolha(): EscolhaDeMedicao | null {
  const v = storage()?.getItem(CHAVE_ESCOLHA);
  return v === 'aceito' || v === 'recusado' ? v : null;
}

export function salvaEscolha(v: EscolhaDeMedicao): void {
  try {
    storage()?.setItem(CHAVE_ESCOLHA, v);
  } catch {
    /* sem storage, a escolha vale só para esta visita */
  }
}

/** Apaga o que a medição guardou — usado quando o visitante recusa. */
export function limpaOrigem(): void {
  try {
    storage()?.removeItem(CHAVE_ORIGEM);
  } catch {
    /* nada a fazer */
  }
}

export function leOrigem(agora = Date.now()): Origem | null {
  const cru = storage()?.getItem(CHAVE_ORIGEM);
  if (!cru) return null;

  try {
    const o = JSON.parse(cru) as Origem;
    const valida =
      IDS_DE_CLIQUE.includes(o?.tipo) &&
      typeof o?.valor === 'string' &&
      VALOR_VALIDO.test(o.valor) &&
      typeof o?.ts === 'number' &&
      agora - o.ts < VALIDADE_MS;

    return valida ? o : null;
  } catch {
    return null;
  }
}

export function salvaOrigem(o: Origem): void {
  try {
    storage()?.setItem(CHAVE_ORIGEM, JSON.stringify(o));
  } catch {
    /* sem storage, a origem vale só para esta visita */
  }
}

/** Marcador da linha de referência — é por ele que a linha é reconhecida. */
const MARCA = '[ref:';

/**
 * A linha que entra no fim da mensagem. O nome do parâmetro vai explícito
 * porque a importação de conversão offline do Google Ads tem coluna diferente
 * para cada tipo — quem montar o CSV precisa saber se aquilo é gclid ou gbraid.
 */
export function refDaOrigem(o: Origem): string {
  return `${MARCA} ${o.tipo}=${o.valor}]`;
}

/**
 * Devolve o link de WhatsApp com a linha de referência no fim da mensagem.
 *
 * Idempotente: reescreve a linha em vez de empilhar outra, porque o mesmo
 * elemento pode ser clicado mais de uma vez. Visita orgânica não tem
 * identificador de clique e a mensagem sai limpa, sem sobra de rastreamento.
 */
export function comRef(url: string, o: Origem | null): string {
  try {
    const u = new URL(url);
    const texto = u.searchParams.get('text');
    if (texto === null) return url;

    const limpo = texto.split(`\n\n${MARCA}`)[0];
    u.searchParams.set('text', o ? `${limpo}\n\n${refDaOrigem(o)}` : limpo);
    return u.toString();
  } catch {
    return url;
  }
}
