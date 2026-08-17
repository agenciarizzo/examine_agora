'use client';

import { useCallback, useEffect, useState } from 'react';
import { Analytics } from '@/components/Analytics';
import { Consentimento } from '@/components/Consentimento';
import {
  comRef,
  leConsentimento,
  leOrigem,
  limpaOrigem,
  origemDaUrl,
  salvaConsentimento,
  salvaOrigem,
  type Consentimento as Escolha,
  type Origem,
} from '@/lib/medicao';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Fila do gtag.js. Evento empurrado antes do script chegar espera na fila. */
function evento(nome: string, params: Record<string, string>): void {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(['event', nome, params]);
}

/**
 * Liga a medição no site inteiro, a partir de um ponto só no layout.
 *
 * Os CTAs estão espalhados por 24 landings, header, rodapé e float — em vez de
 * instrumentar cada um deles, escuta o clique na fase de captura do documento e
 * decide pelo `href`. Nenhum componente existente precisou mudar, e um erro
 * aqui não impede a navegação: o listener nunca cancela o clique.
 *
 * Ordem que importa: sem consentimento não carrega o Analytics nem persiste
 * identificador de clique. O identificador da URL fica só em memória enquanto a
 * escolha não vem, e é gravado no momento do "Aceitar".
 */
export function Medicao() {
  /** `undefined` = ainda não leu o storage, então nada é renderizado no SSR. */
  const [escolha, setEscolha] = useState<Escolha | null | undefined>(undefined);
  const [origem, setOrigem] = useState<Origem | null>(null);

  useEffect(() => {
    const atual = leConsentimento();
    setEscolha(atual);

    const daUrl = origemDaUrl(window.location.search);

    if (atual === 'aceito') {
      // Clique novo manda no que já estava guardado: é a campanha mais recente.
      if (daUrl) salvaOrigem(daUrl);
      setOrigem(daUrl ?? leOrigem());
      return;
    }
    // Sem escolha ainda: segura em memória, sem tocar no storage.
    if (atual === null) setOrigem(daUrl);
  }, []);

  const aceitar = useCallback(() => {
    salvaConsentimento('aceito');
    // A origem só desce para o storage agora, com o consentimento na mão.
    const nova = origemDaUrl(window.location.search) ?? origem;
    if (nova) salvaOrigem(nova);
    setOrigem(nova ?? null);
    setEscolha('aceito');
  }, [origem]);

  const recusar = useCallback(() => {
    salvaConsentimento('recusado');
    limpaOrigem();
    setOrigem(null);
    setEscolha('recusado');
  }, []);

  useEffect(() => {
    if (escolha !== 'aceito') return;

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
  }, [escolha, origem]);

  return (
    <>
      {escolha === 'aceito' && <Analytics />}
      {escolha === null && <Consentimento onAceitar={aceitar} onRecusar={recusar} />}
    </>
  );
}
