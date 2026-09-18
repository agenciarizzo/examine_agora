'use client';

import { useEffect, useRef } from 'react';
import { comRef, leEscolha, leOrigem } from '@/lib/medicao';
import { numeroWhatsApp } from '@/lib/whatsapp';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Manda o evento para o GA4.
 *
 * Se o gtag.js ainda não carregou (o degrau vive menos de um segundo, e a tag
 * entra com `afterInteractive`), o evento vai para a fila do `dataLayer` no
 * formato de `arguments` — que é como o próprio gtag empilha. A tag processa a
 * fila assim que sobe, então a conversão não se perde por corrida de carga.
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
 * O link do WhatsApp, já com a mensagem — a ÚNICA montagem do site.
 *
 * Mora aqui, e não em `lib/whatsapp.ts`, de propósito: aquele módulo é
 * importado pelo layout (pela constante da rota), e com a montagem lá dentro a
 * string `wa.me` acabava no pacote que as 32 páginas baixam. Aqui ela fica no
 * pedaço de JavaScript do degrau, que é onde ela pode estar.
 */
function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${numeroWhatsApp()}?text=${encodeURIComponent(mensagem)}`;
}

/** Quanto o degrau fica na tela antes de abrir o WhatsApp. */
const ESPERA_MS = 900;

/**
 * O degrau: monta o link do WhatsApp, conta a conversão e redireciona.
 *
 * É o ÚNICO lugar do site onde `wa.me` existe — todo CTA aponta para a rota
 * `/whatsapp`, e o link de verdade nasce aqui, no navegador, a partir das
 * partes de `lib/whatsapp.ts`. Ver o cabeçalho daquele arquivo para o porquê.
 */
export function DegrauWhatsApp({ padrao }: { padrao: string }) {
  const botao = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const busca = new URLSearchParams(window.location.search);
    const mensagem = busca.get('m')?.slice(0, 600) || padrao;
    const origem = busca.get('o')?.slice(0, 60) || 'direto';

    // Quem recusou a medição não é medido nem atribuído — nem aqui, que é o
    // ponto mais valioso do site. A recusa desliga tudo, e é para valer.
    const medindo = leEscolha() !== 'recusado';
    const url = medindo
      ? comRef(linkWhatsApp(mensagem), leOrigem())
      : linkWhatsApp(mensagem);

    botao.current?.setAttribute('href', url);

    if (medindo) {
      // A CONVERSÃO nasce AQUI, não no clique lá atrás: é neste ponto que o
      // WhatsApp realmente abre. O clique anterior já foi contado como
      // `whatsapp_click` e pode nunca virar conversa. `beacon` garante o envio
      // mesmo com o redirecionamento logo em seguida.
      evento('generate_lead', {
        method: 'whatsapp',
        origem,
        transport_type: 'beacon',
      });
    }

    // `replace` tira o degrau do histórico: quem voltar do WhatsApp cai no
    // site, e não neste degrau de novo — que reabriria o WhatsApp num
    // pingue-pongue e inflaria o número de cliques.
    const t = setTimeout(() => window.location.replace(url), ESPERA_MS);
    return () => clearTimeout(t);
  }, [padrao]);

  return (
    <a
      ref={botao}
      href="#"
      rel="noopener"
      style={{
        display: 'inline-block',
        marginTop: 26,
        padding: '15px 30px',
        borderRadius: 999,
        background: '#A9D6F5',
        color: '#0A2A52',
        fontWeight: 700,
        fontSize: 15,
        textDecoration: 'none',
      }}
    >
      Abrir o WhatsApp agora
    </a>
  );
}
