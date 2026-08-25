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

/**
 * Pixel do Meta (Facebook/Instagram Ads).
 *
 * Mesmo desenho do GA: um lugar só, trocável por ambiente com
 * `NEXT_PUBLIC_META_PIXEL_ID`, e `""` desliga no site inteiro sem tocar em
 * componente.
 *
 * Atenção: a Política de Cookies descreve esta tag. Se o ID sair, entrar ou
 * mudar de ferramenta, o texto de `site.legal` (slug `cookies`) tem de
 * acompanhar — é declaração pública, não comentário de código.
 */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '538854443996153';

/**
 * As ÚNICAS páginas onde o pixel do Meta pode disparar.
 *
 * 🔴 Não é preferência de implementação, é limite legal e de política de
 * plataforma. O pixel manda pro Meta a URL de cada visita, e as URLs das
 * landings nomeiam o procedimento (`/biopsia-de-mama-guiada-por-ultrassom`,
 * `/paaf-de-tireoide-brasilia`…). Deixar o pixel disparar lá significaria:
 *
 *  1. quebrar a promessa que a própria Política de Cookies publica —
 *     *"nunca separando as pessoas por exame procurado ou condição de saúde"*; e
 *  2. mandar dado de saúde pelas Business Tools do Meta, que é justamente o que
 *     os termos delas proíbem — o gatilho clássico de restrição da conta.
 *
 * Por isso a lista é ALLOWLIST, não denylist: página nova nasce SEM pixel, e só
 * entra aqui por decisão consciente. As 12 landings clínicas e o hub ficam de
 * fora por natureza; as 3 páginas legais também — medir quem lê a política de
 * privacidade é feio e não serve pra nada.
 *
 * Decisão do cliente em 2026-08-24, com as alternativas na mesa.
 */
export const PAGINAS_COM_PIXEL: readonly string[] = [
  '/',
  '/agende-seu-exame',
  '/convenios',
  '/sobre-nos',
  '/preparos',
  '/noticias',
];

/** `true` só nas páginas do allowlist acima. Barra final não conta. */
export function pixelLiberado(pathname: string | null): boolean {
  if (!pathname) return false;
  const limpo = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PAGINAS_COM_PIXEL.includes(limpo === '' ? '/' : limpo);
}
