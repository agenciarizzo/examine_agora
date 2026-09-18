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
 * Manda a conversão para o GA4 assim que a tag montar — e não antes.
 *
 * ⚠️ Medido na revisão desta entrega (Chromium, iPhone, build de produção, nos
 * 3 caminhos: link colado, aba nova e clique real no botão flutuante): quando
 * este efeito roda, `window.gtag` AINDA NÃO EXISTE. O degrau vive menos de um
 * segundo e a tag entra com `afterInteractive`, depois da hidratação — a prova
 * é a ordem do `dataLayer`, em que o evento caía na posição 0, à frente do
 * `js` e do `config` da própria tag.
 *
 * Duas coisas quebravam aí, e as duas em silêncio:
 *  1. **Formato.** Sem `gtag`, o evento caía num push de ARRAY CRU no
 *     `dataLayer` — e array cru o GA4 ignora. Não é teoria: é o defeito que o
 *     commit `ce76a46` mediu em produção neste mesmo site ("nunca tinha
 *     aparecido nos eventos da propriedade em 7 dias") e curou no
 *     `components/Medicao.tsx`. O degrau nasceu repetindo o defeito curado.
 *  2. **Ordem.** Evento que chega antes do `config` não tem a que propriedade
 *     se associar.
 *
 * Esperar a tag montar resolve as duas de uma vez: o `gtag` só existe depois
 * do script que chama `js` e `config`, então sair por ele é sair na ordem
 * certa e no formato certo. Se a tag não montar (recusa da medição, bloqueador
 * de anúncio, rede caída), o evento simplesmente não sai — que é o honesto:
 * conversão inventada é pior que conversão perdida.
 *
 * Devolve o cancelador, para o efeito não deixar `setTimeout` solto.
 */
function eventoQuandoATagMontar(
  nome: string,
  params: Record<string, string>,
  limiteMs: number,
): () => void {
  const fim = Date.now() + limiteMs;
  let id = 0;

  const tenta = () => {
    if (typeof window.gtag === 'function') {
      // `beacon` porque o redirecionamento vem logo atrás: o navegador entrega
      // o disparo mesmo com o documento indo embora.
      window.gtag('event', nome, { ...params, transport_type: 'beacon' });
      return;
    }
    if (Date.now() >= fim) return;
    id = window.setTimeout(tenta, 30);
  };

  tenta();
  return () => clearTimeout(id);
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

    // A CONVERSÃO nasce AQUI, não no clique lá atrás: é neste ponto que o
    // WhatsApp realmente abre. O clique anterior já foi contado como
    // `whatsapp_click` e pode nunca virar conversa. O limite de espera é o
    // mesmo tempo que o degrau fica na tela — passou disso, o documento já
    // está indo embora e não há mais o que disparar.
    const paraDeEsperar = medindo
      ? eventoQuandoATagMontar('generate_lead', { method: 'whatsapp', origem }, ESPERA_MS)
      : () => {};

    // `replace` tira o degrau do histórico: quem voltar do WhatsApp cai no
    // site, e não neste degrau de novo — que reabriria o WhatsApp num
    // pingue-pongue e inflaria o número de cliques.
    const t = setTimeout(() => window.location.replace(url), ESPERA_MS);
    return () => {
      clearTimeout(t);
      paraDeEsperar();
    };
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
