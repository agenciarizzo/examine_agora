/**
 * Revisão clínica do RT (Dr. Flávio) — pendência declarada no handoff.
 *
 * Enquanto `true`, as seções com afirmação médica exibem o selo
 * "revisão clínica pendente". Depois do aval do RT, defina
 * `NEXT_PUBLIC_REVISAO_CLINICA=false` no ambiente e o selo some do site
 * inteiro sem tocar em conteúdo.
 */
export const REVISAO_CLINICA_PENDENTE =
  process.env.NEXT_PUBLIC_REVISAO_CLINICA !== 'false';

/**
 * Medição de audiência (Google Analytics 4).
 *
 * O ID da propriedade fica aqui para ser um lugar só, e pode ser trocado por
 * ambiente com `NEXT_PUBLIC_GA_ID` — útil para apontar homologação para outra
 * propriedade. Definir `NEXT_PUBLIC_GA_ID=""` desliga a tag no site inteiro
 * sem tocar em componente.
 *
 * Atenção: a Política de Cookies descreve esta tag. Se o ID sair, entrar ou
 * mudar de ferramenta, o texto de `site.legal` (slug `cookies`) tem de
 * acompanhar — é declaração pública, não comentário de código.
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID ?? 'G-0X4DQ09YJF';
