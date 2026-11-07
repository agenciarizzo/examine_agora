import { pixelLiberado } from '@/lib/config';

/**
 * O `Lead` do Pixel do Meta: sai junto do `generate_lead` do GA4/Ads, no mesmo
 * instante (`lib/lead.ts`) e com o mesmo id, que o GA4 leva como `event_id` e
 * o Pixel como `eventID` (a API de Conversões, quando vier, manda o mesmo id e
 * o Meta não conta em dobro). Molde: rizzo-os `docs/SITES_MEDICAO_ADS_META_MAPA.md` §5.2.2.
 *
 * Três travas, todas herdadas do que o site já decidiu para o Pixel:
 *  1. **Consentimento:** quem chama (o `Medicao`) só escuta o clique de quem
 *     não recusou. Quem recusou nunca chega aqui e o Pixel nem carrega.
 *  2. **Allowlist (`PAGINAS_COM_PIXEL`):** o Pixel manda a URL da página junto
 *     de todo evento. Numa landing de exame a URL nomeia o procedimento, e isso
 *     é dado de saúde (a Política de Cookies promete que não vai). Logo, clique
 *     numa landing conta o lead no GA4/Ads como sempre e NÃO manda Lead ao Meta.
 *  3. **Pixel carregado nesta página:** sem `fbq`, não faz nada.
 *
 * "Pronto" é a config do pixel carregada (`signals/config/<id>`, que o
 * fbevents.js pede depois de chegar): antes dela o `fbq` só enfileira. O
 * `MetaPixel` registra o ouvinte de `load` e avisa por `window.__eaPixelPronto`
 * e pelo evento `EVENTO_PIXEL_PRONTO`. Os botões de WhatsApp abrem a ponte em
 * aba nova, então a página de origem segue viva e a fila do `fbq` esvazia
 * sozinha; mesmo assim a espera tem o teto de 1,2 s contado do clique, e
 * passado o teto o `track` é enfileirado do mesmo jeito.
 */
export const EVENTO_PIXEL_PRONTO = 'ea:pixel-pronto';

type Fbq = (...args: unknown[]) => void;
type JanelaDoPixel = Window & { fbq?: Fbq; __eaPixelPronto?: boolean };

/** Diz se mandou (ou se vai mandar assim que a config chegar). */
export function leadMeta(origem: string, eventID: string, inicio = Date.now(), prazo = 1200): boolean {
  const w = window as JanelaDoPixel;
  if (typeof w.fbq !== 'function' || !pixelLiberado(window.location.pathname)) return false;

  let feito = false;
  const enviar = () => {
    if (feito) return;
    feito = true;
    window.removeEventListener(EVENTO_PIXEL_PRONTO, enviar);
    w.fbq?.('track', 'Lead', { origem }, { eventID });
  };

  if (w.__eaPixelPronto) enviar();
  else {
    window.addEventListener(EVENTO_PIXEL_PRONTO, enviar);
    window.setTimeout(enviar, Math.max(0, inicio + prazo - Date.now()));
  }
  return true;
}
