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
