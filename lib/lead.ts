/**
 * O lead do WhatsApp: conta no CLIQUE do botão de WhatsApp do site, 1 vez a
 * cada 30 minutos. Nunca na chegada à ponte `/whatsapp`.
 *
 * A régua, em ordem (rizzo-os → `docs/ADS_CONVERSAO_HONESTA_MAPA.md` §3):
 *  1. Até 07/11/2026, o `generate_lead` saía na CHEGADA à ponte, que abria o
 *     WhatsApp sozinha em 900 ms. Contava quem só chegou (aba restaurada,
 *     pré-carregamento, robô que roda JavaScript, a mesma pessoa voltando).
 *  2. Em 07/11, às 13h59, passou a sair no toque em "Abrir o WhatsApp" dentro
 *     da ponte, que deixou de abrir sozinha. Honesto, mas pôs 1 clique a mais
 *     em todo caminho até o WhatsApp.
 *  3. No mesmo dia, decisão do Raphael: o lead conta no clique do botão de
 *     WhatsApp do site (que já é um gesto de gente), e a ponte volta a abrir
 *     sozinha, sem contar nada na chegada. Tira o clique a mais e não volta a
 *     contar quem só chegou.
 *
 * Meta (07/11/2026): o 1º lead da janela manda também o `Lead` do Pixel, no
 * mesmo instante e com o mesmo id (`event_id` no GA4, `eventID` no Pixel),
 * só nas páginas em que o Pixel roda (`lib/pixelLead.ts`).
 *
 * Este módulo NÃO importa `lib/whatsapp.ts` nem monta link: o `wa.me` só
 * existe no degrau (`scripts/antirobo.mjs`).
 */

import { leadMeta } from '@/lib/pixelLead';

/** A chave guarda QUANDO o lead saiu. */
const CHAVE_LEAD = 'ea_lead_whatsapp';

/**
 * 30 minutos, a sessão do GA4. É `localStorage` e não `sessionStorage` porque
 * os botões abrem a ponte em aba nova com `noopener`, e a contagem precisa
 * valer entre abas do mesmo visitante.
 */
const JANELA_DA_SESSAO_MS = 30 * 60 * 1000;

/** Teto de espera pela tag, contado do clique. A página de origem segue viva. */
const ESPERA_DA_TAG_MS = 10_000;

export function leadJaContado(agora = Date.now()): boolean {
  try {
    const quando = Number(window.localStorage.getItem(CHAVE_LEAD) || 0);
    return quando > 0 && agora - quando < JANELA_DA_SESSAO_MS;
  } catch {
    return false; // sem storage: o pior caso é 1 lead a mais, nunca 1 a menos
  }
}

function marcaLeadContado(): void {
  try {
    window.localStorage.setItem(CHAVE_LEAD, String(Date.now()));
  } catch {
    /* sem storage, a marca vale só para esta página */
  }
}

/**
 * A origem que o botão leva pra ponte (o `o=` do href), com o mesmo teto e o
 * mesmo padrão que a ponte usava quando o lead nascia lá.
 */
export function origemDoBotao(href: string): string {
  try {
    const o = new URL(href, 'https://x.invalid').searchParams.get('o');
    return o?.slice(0, 60) || 'direto';
  } catch {
    return 'direto';
  }
}

/**
 * Manda o evento para o GA4 assim que a tag montar — e não antes.
 *
 * ⚠️ Medido na revisão do degrau (2026-09-18): logo depois da hidratação,
 * `window.gtag` ainda não existe (a tag entra com `afterInteractive`). Evento
 * empurrado como array cru no `dataLayer` o GA4 ignora (o defeito que o commit
 * `ce76a46` mediu neste site), e evento antes do `config` não tem propriedade.
 * Sair pela função `gtag` resolve as duas coisas. Se a tag não montar (recusa,
 * bloqueador, rede), o evento não sai: conversão inventada é pior que perdida.
 *
 * `beacon`: o WhatsApp abre logo em seguida, e no celular a aba do site vai
 * pro fundo; o navegador entrega o disparo mesmo assim.
 */
function eventoQuandoATagMontar(
  nome: string,
  params: Record<string, string>,
  aoTerminar: (saiu: boolean) => void,
): void {
  const fim = Date.now() + ESPERA_DA_TAG_MS;
  const tenta = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', nome, { ...params, transport_type: 'beacon' });
      aoTerminar(true);
      return;
    }
    if (Date.now() >= fim) {
      aoTerminar(false);
      return;
    }
    window.setTimeout(tenta, 30);
  };
  tenta();
}

let pendente = false;

function novoId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Conta o lead do clique num botão de WhatsApp do site: `generate_lead` com o
 * mesmo nome e os mesmos parâmetros de sempre (`method`, `origem`), 1 vez a
 * cada 30 minutos. Quem chama já garantiu que a medição está ligada.
 */
export function contaLeadDoClique(href: string): void {
  if (pendente || leadJaContado()) return;
  pendente = true;
  const inicio = Date.now();
  const origem = origemDoBotao(href);
  // O id do evento: o mesmo no `generate_lead` (parâmetro `event_id`) e no
  // `Lead` do Pixel (`eventID`), que o Meta usa para não contar em dobro.
  const eventId = novoId();
  eventoQuandoATagMontar('generate_lead', { method: 'whatsapp', origem, event_id: eventId }, (saiu) => {
    if (saiu) {
      marcaLeadContado();
      leadMeta(origem, eventId, inicio); // junto do lead, no mesmo instante
    }
    pendente = false;
  });
}
