/**
 * Contato de WhatsApp em PARTES — proteção antirrobô.
 *
 * Padrão da casa (camada B do `PADRAO_SITE_LANDING_MAPA.md` no rizzo-os):
 * **nenhum CTA aponta para `wa.me`**. Todos apontam para a rota interna
 * `/whatsapp?m=<mensagem>&o=<origem>`, e o link do WhatsApp só é montado lá
 * dentro, no navegador, a partir dos pedaços abaixo.
 *
 * O que isso compra, nesta ordem:
 *  1. **Spam.** Varredor que baixa o HTML e colhe `wa.me/<número>` não colhe
 *     nada: a string não existe em arquivo servido nenhum.
 *  2. **Tráfego amplo.** Quem não executa JavaScript (bot ingênuo, clique
 *     acidental de Display/Discover) não chega ao WhatsApp.
 *  3. **Medição.** Um ponto único onde a conversão nasce, em vez de 11 CTAs
 *     cada um com a sua tag.
 *
 * ⚠️ Ao editar: os pedaços NÃO podem formar o número contíguo em lugar nenhum
 * do código — é isso que `scripts/antirobo.mjs` confere a cada build.
 *
 * ⚠️ Este arquivo é importado TAMBÉM por componentes de cliente, por isso não
 * importa o `ea-landings.json`: puxar o json inteiro para o pacote do
 * navegador seria trocar um problema por outro.
 *
 * ⚠️ E por isso o domínio `wa.me` NÃO mora aqui. Ele vive só em
 * `components/DegrauWhatsApp.tsx`. Medido: com a montagem do link neste
 * arquivo, a string `wa.me` viajava para o pacote do layout — que todas as 32
 * páginas carregam — porque o `Medicao` importa daqui a constante da rota.
 * Sem número junto ninguém colhe nada, mas a regra da casa é que `wa.me` só
 * exista no degrau, e é o que `scripts/antirobo.mjs` cobra.
 *
 * (61) 3208-6814 — linha única da clínica: WhatsApp e ligação são o mesmo
 * número. O `clinica.phone` do json é a forma VISÍVEL dele, e `lib/content.ts`
 * reprova o build se as duas divergirem.
 */
const PARTES = ['55', '61', '3208', '6814'] as const;

/** A rota interna. O `wa.me` só nasce dentro dela. */
export const WHATSAPP_ROUTE = '/whatsapp';

/** O número, inteiro, montado em tempo de execução. */
export function numeroWhatsApp(): string {
  return PARTES.join('');
}

/** O telefone como o visitante lê — derivado das partes, nunca literal. */
export function telefoneVisivel(): string {
  const [, ddd, prefixo, sufixo] = PARTES;
  return `(${ddd}) ${prefixo}-${sufixo}`;
}

/** O href que todo CTA do site usa: a rota interna, com mensagem e origem. */
export function degrauHref(mensagem: string, origem?: string): string {
  const q = new URLSearchParams({ m: mensagem });
  if (origem) q.set('o', origem);
  return `${WHATSAPP_ROUTE}?${q.toString()}`;
}
