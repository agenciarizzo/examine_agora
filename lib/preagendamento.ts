/**
 * Núcleo do pré-agendamento: o catálogo de exames, o formato exato da
 * mensagem e os invariantes que reprovam o build — nada de DOM, nada de
 * `wa.me` (quem monta o link final é `lib/whatsapp.ts`, via `degrauHref`).
 *
 * `site.exames` não faz parte do tipo `Site` de `lib/content.ts` de
 * propósito: este módulo é a fonte única de quem lê aquele nó, no mesmo
 * espírito de `lib/whatsapp.ts` não importar o json inteiro.
 */
import { pages, site } from './content';

export type ExameCatalogo = {
  nome: string;
  preparo: string;
  slug?: string;
};

type SiteComExames = typeof site & { exames: ExameCatalogo[] };

/** Os 22 exames do catálogo — a fonte do select e da resposta de preparo. */
export const EXAMES: ExameCatalogo[] = (site as SiteComExames).exames;

/** Opção sem catálogo — sempre a última do select, nunca filtrada por landing. */
export const EXAME_OUTRO = 'Não sei / outro exame';

export const PEDIDO_MEDICO_OPCOES = [
  'já tenho em mãos',
  'ainda não tenho',
  'não sei se preciso',
] as const;

export const TURNO_OPCOES = [
  'Manhã (8h–12h)',
  'Tarde (12h–18h, seg a sex)',
  'Qualquer horário',
] as const;

export type CamposPreAgendamento = {
  paciente: string;
  exame: string;
  convenio: string;
  pedidoMedico: string;
  turno: string;
  observacao: string;
};

export const CAMPOS_VAZIOS: CamposPreAgendamento = {
  paciente: '',
  exame: '',
  convenio: '',
  pedidoMedico: '',
  turno: '',
  observacao: '',
};

export const PACIENTE_MAX = 60;
export const OBSERVACAO_MAX = 200;

const ABERTURA = 'Olá! Quero agendar um exame na Examine Agora.';
const FECHO = 'Podem me passar os próximos horários?';

/**
 * Monta a mensagem do pré-agendamento — o formato do §4.2 do mapa. Linha só
 * entra se o campo estiver preenchido; tudo vazio devolve só abertura + fecho
 * (o "olá cru" de hoje, nunca pior).
 */
export function montarMensagem(campos: CamposPreAgendamento): string {
  const linhas: string[] = [];
  if (campos.paciente) linhas.push(`• Paciente: ${campos.paciente}`);
  if (campos.exame) linhas.push(`• Exame: ${campos.exame}`);
  if (campos.convenio) linhas.push(`• Convênio: ${campos.convenio}`);
  if (campos.pedidoMedico) linhas.push(`• Pedido médico: ${campos.pedidoMedico}`);
  if (campos.turno) linhas.push(`• Turno: ${campos.turno}`);
  if (campos.observacao) linhas.push(`• Observação: ${campos.observacao}`);

  if (linhas.length === 0) return `${ABERTURA}\n\n${FECHO}`;
  return `${ABERTURA}\n\n${linhas.join('\n')}\n\n${FECHO}`;
}

/** A nota de preparo do grupo de um exame do catálogo — o brinde do §4.4. */
export function preparoDoExame(nomeExame: string): string | undefined {
  const exame = EXAMES.find((e) => e.nome === nomeExame);
  if (!exame) return undefined;
  return site.preparos.find((g) => g.grupo === exame.preparo)?.nota;
}

/**
 * O primeiro exame do catálogo cujo `slug` é o da landing — o `initialExam`
 * do §4.5. Landing sem exame no catálogo (o hub) devolve `undefined`, e o
 * modal abre sem pré-seleção.
 */
export function primeiroExameDaLanding(slug: string): ExameCatalogo | undefined {
  return EXAMES.find((e) => e.slug === slug);
}

function maiorString(strs: readonly string[]): string {
  return strs.reduce((maior, atual) => (atual.length > maior.length ? atual : maior), '');
}

/**
 * Trava contra deriva: a mensagem do PIOR CASO (todo campo no teto, com o
 * maior valor real do catálogo) tem de caber no corte de 600 caracteres do
 * degrau (`components/DegrauWhatsApp.tsx`). Sem isto, um exame ou convênio
 * novo com nome comprido estoura a mensagem em silêncio, cortando no meio de
 * uma palavra. Reprova o build — o mesmo padrão de `lib/content.ts:158`.
 */
const TETO_MENSAGEM = 600;

const piorCaso: CamposPreAgendamento = {
  paciente: 'x'.repeat(PACIENTE_MAX),
  exame: maiorString([...EXAMES.map((e) => e.nome), EXAME_OUTRO]),
  convenio: maiorString(['Particular', ...site.convenios]),
  pedidoMedico: maiorString(PEDIDO_MEDICO_OPCOES),
  turno: maiorString(TURNO_OPCOES),
  observacao: 'x'.repeat(OBSERVACAO_MAX),
};

const tamanhoPiorCaso = montarMensagem(piorCaso).length;
if (tamanhoPiorCaso > TETO_MENSAGEM) {
  throw new Error(
    `Mensagem do pré-agendamento no pior caso tem ${tamanhoPiorCaso} caracteres, acima do ` +
      `teto de ${TETO_MENSAGEM} que o degrau corta (components/DegrauWhatsApp.tsx). Encurte ` +
      `um campo do catálogo (site.exames/site.convenios) ou reveja o teto.`,
  );
}

/**
 * Trava contra deriva: todo `site.exames[].preparo` tem de apontar para um
 * `site.preparos[].grupo` que existe — senão a nota de preparo do §4.4 some
 * em silêncio para aquele exame.
 */
for (const exame of EXAMES) {
  if (!site.preparos.some((g) => g.grupo === exame.preparo)) {
    throw new Error(
      `site.exames "${exame.nome}" aponta para o grupo de preparo "${exame.preparo}", que não ` +
        `existe em site.preparos[].grupo.`,
    );
  }
}

/**
 * Trava contra deriva: todo `site.exames[].slug` tem de ser uma página que
 * existe — senão o link "ler a página completa" e o pré-preenchimento do
 * §4.5 apontam para uma landing inexistente.
 */
for (const exame of EXAMES) {
  if (exame.slug && !pages.some((p) => p.slug === exame.slug)) {
    throw new Error(
      `site.exames "${exame.nome}" aponta para a página "${exame.slug}", que não existe em pages.`,
    );
  }
}
