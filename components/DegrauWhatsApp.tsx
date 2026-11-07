'use client';

import { useEffect, useRef } from 'react';
import { comRef, leEscolha, leOrigem } from '@/lib/medicao';
import { numeroWhatsApp } from '@/lib/whatsapp';

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

/**
 * O destino, lido na hora: a mensagem vem da URL do degrau, e a referência do
 * clique pago só entra para quem não recusou a medição. Quem recusou não é
 * medido nem atribuído — nem aqui. A recusa desliga tudo, e é para valer.
 */
function destino(padrao: string): string {
  const mensagem = new URLSearchParams(window.location.search).get('m')?.slice(0, 600) || padrao;
  return leEscolha() !== 'recusado' ? comRef(linkWhatsApp(mensagem), leOrigem()) : linkWhatsApp(mensagem);
}

/**
 * O degrau: monta o link do WhatsApp e abre a conversa sozinho. NÃO conta nada.
 *
 * O lead (`generate_lead`) conta no CLIQUE do botão de WhatsApp do site, que é
 * quem traz a pessoa até aqui (`components/Medicao.tsx` → `lib/lead.ts`).
 * Chegar ao degrau sem clicar (aba restaurada, pré-carregamento, link colado,
 * robô que roda JavaScript) não vira lead. Histórico da régua e porquê: o
 * cabeçalho de `lib/lead.ts`; rizzo-os → `docs/ADS_CONVERSAO_HONESTA_MAPA.md` §3.
 *
 * É o ÚNICO lugar do site onde `wa.me` existe — todo CTA aponta para a rota
 * `/whatsapp`, e o link de verdade nasce aqui, no navegador, a partir das
 * partes de `lib/whatsapp.ts`. O HTML servido sai sem `href`: quem não roda
 * JavaScript não chega ao WhatsApp, e o render do servidor é o mesmo do
 * navegador.
 */
export function DegrauWhatsApp({ padrao }: { padrao: string }) {
  const botao = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const url = destino(padrao);
    // O botão fica como reserva, se o navegador não abrir sozinho.
    botao.current?.setAttribute('href', url);
    // `replace` tira o degrau do histórico: quem voltar do WhatsApp cai no
    // site, e não neste degrau de novo — que reabriria o WhatsApp num
    // pingue-pongue.
    window.location.replace(url);
  }, [padrao]);

  return (
    <a
      ref={botao}
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
        cursor: 'pointer',
      }}
    >
      Abrir o WhatsApp agora
    </a>
  );
}
