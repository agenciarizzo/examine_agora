'use client';

import { useCallback, useEffect, useState } from 'react';
import { Analytics } from '@/components/Analytics';
import { AvisoMedicao } from '@/components/AvisoMedicao';
import { MetaPixel } from '@/components/MetaPixel';
import {
  comRef,
  leEscolha,
  leOrigem,
  limpaOrigem,
  origemDaUrl,
  salvaEscolha,
  salvaOrigem,
  type EscolhaDeMedicao,
  type Origem,
} from '@/lib/medicao';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Manda o evento pro gtag.js. `window.gtag` é a própria função definida pelo
 * `Analytics` (o script oficial do Google) — chamar ela é o jeito documentado
 * e sem ambiguidade. Se o clique acontecer antes do Analytics montar (não
 * deveria, já que os dois nascem do mesmo `medindo`), cai no push cru pro
 * dataLayer como fallback, pra não perder o evento.
 */
function evento(nome: string, params: Record<string, string>): void {
  if (typeof window.gtag === 'function') {
    window.gtag('event', nome, params);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(['event', nome, params]);
}

/**
 * Liga a medição no site inteiro, a partir de um ponto só no layout.
 *
 * Os CTAs estão espalhados por 24 landings, header, rodapé e float — em vez de
 * instrumentar cada um deles, escuta o clique na fase de captura do documento e
 * decide pelo `href`. Nenhum componente do site precisou mudar, e um erro aqui
 * não impede a navegação: o listener nunca cancela o clique.
 *
 * Modelo de recusa: mede desde a primeira visita e o aviso informa. Só quem
 * recusa fica de fora, e a recusa desliga Analytics, pixel do Meta e atribuição
 * juntos — os três nascem do mesmo `medindo`.
 */
export function Medicao() {
  /** `undefined` = ainda não leu o storage, então nada é renderizado no SSR. */
  const [escolha, setEscolha] = useState<EscolhaDeMedicao | null | undefined>(undefined);
  const [origem, setOrigem] = useState<Origem | null>(null);

  const medindo = escolha !== undefined && escolha !== 'recusado';

  useEffect(() => {
    const atual = leEscolha();
    setEscolha(atual);
    if (atual === 'recusado') return;

    // Clique novo manda no que já estava guardado: é a campanha mais recente.
    const daUrl = origemDaUrl(window.location.search);
    if (daUrl) salvaOrigem(daUrl);
    setOrigem(daUrl ?? leOrigem());
  }, []);

  const entendi = useCallback(() => {
    salvaEscolha('aceito');
    setEscolha('aceito');
  }, []);

  const recusar = useCallback(() => {
    salvaEscolha('recusado');
    limpaOrigem();
    setOrigem(null);
    setEscolha('recusado');
  }, []);

  useEffect(() => {
    if (!medindo) return;

    function noClique(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.('a');
      const href = a?.getAttribute('href');
      if (!a || !href) return;

      const pagina = window.location.pathname;

      if (href.startsWith('https://wa.me/')) {
        // A mensagem ganha a referência do clique pago antes da navegação.
        const comReferencia = comRef(href, origem);
        if (comReferencia !== href) a.setAttribute('href', comReferencia);

        evento('whatsapp_click', { pagina, origem: origem?.tipo ?? 'organico' });
        return;
      }
      if (href.startsWith('tel:')) {
        evento('telefone_click', { pagina });
        return;
      }
      if (href.includes('google.com/maps')) {
        evento('rota_click', { pagina });
      }
    }

    document.addEventListener('click', noClique, { capture: true });
    return () => document.removeEventListener('click', noClique, { capture: true });
  }, [medindo, origem]);

  return (
    <>
      {medindo && <Analytics />}
      {medindo && <MetaPixel />}
      {escolha === null && <AvisoMedicao onEntendi={entendi} onRecusar={recusar} />}
    </>
  );
}
