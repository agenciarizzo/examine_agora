/**
 * Núcleo do concierge: resolve o roteiro (§5.2 do mapa) a partir do json —
 * puro, sem DOM, no padrão de `lib/medicao.ts` e `lib/preagendamento.ts`.
 *
 * A regra que este módulo existe para cumprir: **nenhuma resposta é escrita
 * aqui nem no componente**. Toda tela devolve texto que veio de um endereço
 * do `content/ea-landings.json` — `pages[slug].faq[i]`, `site.preparos[i]`,
 * `site.concierge.*`, `clinica.*`. O componente só desenha o que vier.
 *
 * O concierge **não tem IA e não tem caixa de texto**: todo estado é uma
 * lista de botões, e cada botão é um endereço (`exame:mama:3`). Por isso
 * "não entendi" é impossível por construção — não há o que interpretar.
 *
 * `site.concierge` não faz parte do tipo `Site` de `lib/content.ts` pelo mesmo
 * motivo de `site.exames`: este módulo é a fonte única de quem lê aquele nó.
 */
import { clinica, href, mapHref, type Page, pages, site, telHref } from './content';
import { degrauHref } from './whatsapp';

export type CartaoConcierge = { titulo: string; linha: string; botao: string };

type EntradaMenu = {
  id: string;
  botao: string;
  titulo: string;
  abertura: string;
  link: string;
};

type ConciergeJson = {
  cartao: CartaoConcierge;
  janela: { titulo: string; fechar: string; voltar: string; inicio: string };
  rodape: { quem: string; urgencia: string };
  ctas: { preAgendamento: string; whatsapp: string; semResposta: string; waMsg: string };
  menu: EntradaMenu[];
  convenio: { paragrafos: string[] };
  levar: { itens: string[]; notaPreparo: string; nota: string };
  local: { ligar: string };
};

type SiteComConcierge = typeof site & { concierge: ConciergeJson };

/** Toda a copy fixa do concierge — o nó `site.concierge` do json. */
export const CONCIERGE: ConciergeJson = (site as SiteComConcierge).concierge;

export const cartao = CONCIERGE.cartao;
export const janela = CONCIERGE.janela;
export const rodape = CONCIERGE.rodape;
export const ctas = CONCIERGE.ctas;

/** A tela por onde todo mundo entra. */
export const TELA_INICIAL = 'menu';

export type Opcao = { id: string; rotulo: string };
export type Link = { rotulo: string; href: string; externo?: boolean };

export type Tela = {
  id: string;
  titulo: string;
  /** Endereço da tela anterior — `undefined` só no menu. */
  voltar?: string;
  /** Texto resolvido do json, verbatim. Nada é escrito no componente. */
  paragrafos: string[];
  /** Lista de apoio (exames do grupo, o que levar, endereço e horário). */
  itens: string[];
  /** Botões que levam a outra tela. Vazio numa tela de resposta. */
  opcoes: Opcao[];
  /** "Ler a página completa", "Ver no mapa", "Ligar" — sempre do json. */
  links: Link[];
  /**
   * Tela de resposta: fecha com o par de CTAs na ordem do §5.2 —
   * 1º pré-agendamento, 2º WhatsApp.
   */
  resposta: boolean;
  /** Mensagem que vai pro degrau nesta tela (saída humana). */
  waMsg: string;
  /** Exame que o pré-agendamento abre pré-selecionado, quando a tela tem um. */
  exameSlug?: string;
};

/** As 11 landings que têm `faq` — o nível 1 do P4. */
const COM_FAQ: Page[] = pages.filter((p) => !!p.faq?.length);

function preenche(texto: string, vars: Record<string, string>): string {
  return texto.replace(/\{(\w+)\}/g, (inteiro, chave) => vars[chave] ?? inteiro);
}

function entrada(id: string): EntradaMenu {
  const e = CONCIERGE.menu.find((m) => m.id === id);
  if (!e) throw new Error(`site.concierge.menu não tem a entrada "${id}".`);
  return e;
}

/** A saída humana que fecha toda lista (§5.1) — sempre com `?o=concierge`. */
export const ORIGEM = 'concierge';

export function saidaHumana(waMsg: string): Link {
  return { rotulo: ctas.semResposta, href: degrauHref(waMsg, ORIGEM), externo: true };
}

function menu(): Tela {
  return {
    id: 'menu',
    titulo: janela.titulo,
    paragrafos: [janela.inicio],
    itens: [],
    opcoes: CONCIERGE.menu.map((m) => ({ id: m.id, rotulo: m.botao })),
    links: [],
    resposta: false,
    waMsg: ctas.waMsg,
  };
}

/** P1 · nível 1 — os 7 grupos de `site.preparos[].grupo`. */
function listaPreparo(): Tela {
  const e = entrada('preparo');
  return {
    id: 'preparo',
    titulo: e.titulo,
    voltar: 'menu',
    paragrafos: [e.abertura],
    itens: [],
    opcoes: site.preparos.map((g, i) => ({ id: `preparo:${i}`, rotulo: g.grupo })),
    links: [{ rotulo: e.link, href: href('preparos') }],
    resposta: false,
    waMsg: ctas.waMsg,
  };
}

/** P1 · resposta — `site.preparos[i].nota` + os exames do grupo. */
function respostaPreparo(indice: number): Tela {
  const e = entrada('preparo');
  const grupo = site.preparos[indice];
  if (!grupo) throw new Error(`site.preparos não tem o índice ${indice}.`);
  return {
    id: `preparo:${indice}`,
    titulo: grupo.grupo,
    voltar: 'preparo',
    paragrafos: [grupo.nota],
    itens: grupo.exames,
    opcoes: [],
    links: [{ rotulo: e.link, href: href('preparos') }],
    resposta: true,
    waMsg: ctas.waMsg,
  };
}

/**
 * P2 — `clinica.pagamento` + a contagem de `site.convenios` + link.
 * ⚠️ Nunca afirma cobertura: ela depende do plano e da autorização, e quem
 * confirma é a recepção. O texto está no json; aqui só entra o número.
 */
function respostaConvenio(): Tela {
  const e = entrada('convenio');
  return {
    id: 'convenio',
    titulo: e.titulo,
    voltar: 'menu',
    paragrafos: [
      e.abertura,
      clinica.pagamento,
      ...CONCIERGE.convenio.paragrafos.map((p) =>
        preenche(p, { n: String(site.convenios.length) }),
      ),
    ],
    itens: [],
    opcoes: [],
    links: [{ rotulo: e.link, href: href('convenios') }],
    resposta: true,
    waMsg: ctas.waMsg,
  };
}

/**
 * P3 — a lista de `site.concierge.levar.itens` (a mesma que `/preparos`
 * renderiza em "Em todo exame, traga") + a nota do grupo sem preparo.
 */
function respostaLevar(): Tela {
  const e = entrada('levar');
  const semPreparo = site.preparos[0];
  return {
    id: 'levar',
    titulo: e.titulo,
    voltar: 'menu',
    paragrafos: [
      e.abertura,
      preenche(CONCIERGE.levar.notaPreparo, { nota: semPreparo.nota }),
      CONCIERGE.levar.nota,
    ],
    itens: CONCIERGE.levar.itens,
    opcoes: [],
    links: [{ rotulo: e.link, href: href('preparos') }],
    resposta: true,
    waMsg: ctas.waMsg,
  };
}

/** P4 · nível 1 — as 11 landings com `faq`, pelo rótulo curto do json. */
function listaExames(): Tela {
  const e = entrada('exame');
  return {
    id: 'exame',
    titulo: e.titulo,
    voltar: 'menu',
    paragrafos: [e.abertura],
    itens: [],
    opcoes: COM_FAQ.map((p) => ({ id: `exame:${p.slug}`, rotulo: p.curto })),
    links: [],
    resposta: false,
    waMsg: ctas.waMsg,
  };
}

function landing(slug: string): Page {
  const p = COM_FAQ.find((x) => x.slug === slug);
  if (!p) throw new Error(`"${slug}" não é uma landing com faq no json.`);
  return p;
}

/** P4 · nível 2 — as 6 perguntas daquela landing, pelo `faq[i].q`. */
function listaPerguntas(slug: string): Tela {
  const p = landing(slug);
  const e = entrada('exame');
  return {
    id: `exame:${slug}`,
    titulo: p.nome,
    voltar: 'exame',
    paragrafos: [],
    itens: [],
    opcoes: p.faq!.map((f, i) => ({ id: `exame:${slug}:${i}`, rotulo: f.q })),
    links: [{ rotulo: e.link, href: p.path }],
    resposta: false,
    waMsg: p.seo.waMsg,
    exameSlug: slug,
  };
}

/** P4 · resposta — `pages[slug].faq[i].a`, **verbatim**. */
function respostaPergunta(slug: string, indice: number): Tela {
  const p = landing(slug);
  const e = entrada('exame');
  const par = p.faq![indice];
  if (!par) throw new Error(`pages[${slug}].faq não tem o índice ${indice}.`);
  return {
    id: `exame:${slug}:${indice}`,
    titulo: par.q,
    voltar: `exame:${slug}`,
    paragrafos: [par.a],
    itens: [],
    opcoes: [],
    links: [{ rotulo: e.link, href: p.path }],
    resposta: true,
    waMsg: p.seo.waMsg,
    exameSlug: slug,
  };
}

/** P5 — endereço, horário, mapa e telefone, todos de `clinica`. */
function respostaLocal(): Tela {
  const e = entrada('local');
  return {
    id: 'local',
    titulo: e.titulo,
    voltar: 'menu',
    paragrafos: [e.abertura],
    itens: [clinica.address, clinica.hours],
    opcoes: [],
    links: [
      { rotulo: e.link, href: mapHref, externo: true },
      { rotulo: CONCIERGE.local.ligar, href: telHref },
    ],
    resposta: true,
    waMsg: ctas.waMsg,
  };
}

/**
 * O resolvedor: endereço → tela. Endereço desconhecido cai no menu, que é o
 * único jeito de o concierge "não saber" — e ele não fica preso.
 */
export function tela(id: string): Tela {
  const [raiz, a, b] = id.split(':');
  switch (raiz) {
    case 'preparo':
      return a === undefined ? listaPreparo() : respostaPreparo(Number(a));
    case 'convenio':
      return respostaConvenio();
    case 'levar':
      return respostaLevar();
    case 'exame':
      if (a === undefined) return listaExames();
      return b === undefined ? listaPerguntas(a) : respostaPergunta(a, Number(b));
    case 'local':
      return respostaLocal();
    default:
      return menu();
  }
}

/**
 * Trava contra deriva: toda entrada de `site.concierge.menu` tem de ser um
 * endereço que o resolvedor conhece. Sem isto, renomear um `id` no json
 * devolveria o menu no lugar da resposta — em silêncio, e só o paciente veria.
 * Reprova o build, no padrão de `lib/content.ts:158`.
 */
const RESOLVIDOS = ['preparo', 'convenio', 'levar', 'exame', 'local'];
for (const m of CONCIERGE.menu) {
  if (!RESOLVIDOS.includes(m.id)) {
    throw new Error(
      `site.concierge.menu tem a entrada "${m.id}", que lib/concierge.ts não sabe resolver ` +
        `(conhecidos: ${RESOLVIDOS.join(', ')}).`,
    );
  }
}

/**
 * Trava contra deriva: o P4 promete "as respostas são as mesmas da página" —
 * então toda landing com `faq` tem de ter `path` e pergunta com resposta.
 * Um par vazio no json viraria botão que abre tela em branco.
 */
for (const p of COM_FAQ) {
  for (const [i, f] of p.faq!.entries()) {
    if (!f.q?.trim() || !f.a?.trim()) {
      throw new Error(`pages[${p.slug}].faq[${i}] está sem pergunta ou sem resposta.`);
    }
  }
}
