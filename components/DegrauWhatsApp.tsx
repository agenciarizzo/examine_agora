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
 * Manda o evento para o GA4 assim que a tag montar — e não antes.
 *
 * ⚠️ Medido na revisão do degrau (Chromium, iPhone, build de produção, nos 3
 * caminhos: link colado, aba nova e clique real no botão flutuante): logo
 * depois da hidratação, `window.gtag` AINDA NÃO EXISTE. A tag entra com
 * `afterInteractive`, depois da hidratação — a prova era a ordem do
 * `dataLayer`, em que o evento caía na posição 0, à frente do `js` e do
 * `config` da própria tag. Hoje o evento sai no toque, que quase sempre vem
 * depois de a tag montar; o toque apressado é o caso que esta espera cobre.
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
 * `aoTerminar(true)` quando o evento saiu, `aoTerminar(false)` quando o teto
 * estourou sem tag. Devolve o cancelador, para não deixar `setTimeout` solto.
 */
function eventoQuandoATagMontar(
  nome: string,
  params: Record<string, string>,
  limiteMs: number,
  aoTerminar: (saiu: boolean) => void,
): () => void {
  const fim = Date.now() + limiteMs;
  let id = 0;

  const tenta = () => {
    if (typeof window.gtag === 'function') {
      // `beacon` porque o WhatsApp abre logo em seguida: no celular a aba do
      // site vai pro fundo (ou é congelada) e o navegador entrega o disparo
      // mesmo assim.
      window.gtag('event', nome, { ...params, transport_type: 'beacon' });
      aoTerminar(true);
      return;
    }
    if (Date.now() >= fim) {
      aoTerminar(false);
      return;
    }
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

/**
 * O destino do botão, lido na hora: a mensagem e a origem vêm da URL do degrau,
 * e a referência do clique pago só entra para quem não recusou a medição.
 * Quem recusou não é medido nem atribuído — nem aqui, que é o ponto mais
 * valioso do site. A recusa desliga tudo, e é para valer.
 */
function destino(padrao: string): { url: string; origem: string; medindo: boolean } {
  const busca = new URLSearchParams(window.location.search);
  const mensagem = busca.get('m')?.slice(0, 600) || padrao;
  const origem = busca.get('o')?.slice(0, 60) || 'direto';
  const medindo = leEscolha() !== 'recusado';
  const url = medindo ? comRef(linkWhatsApp(mensagem), leOrigem()) : linkWhatsApp(mensagem);
  return { url, origem, medindo };
}

/**
 * Teto de espera pela tag DEPOIS do toque. A página segue viva (o WhatsApp
 * abre em outra aba), então esperar não segura ninguém: é só o tempo que o
 * `gtag.js` tem para montar se o toque vier antes dele.
 */
const ESPERA_DA_TAG_MS = 10_000;

/**
 * 1 lead por sessão. A chave guarda QUANDO o lead saiu e vale por 30 minutos,
 * a sessão do GA4. Não é `sessionStorage` de propósito: todo CTA do site abre o
 * degrau em aba nova com `rel="noopener"`, e aba aberta assim nasce com o
 * `sessionStorage` vazio — cada ida ao degrau seria uma "sessão" nova e o lead
 * contaria de novo.
 */
const CHAVE_LEAD = 'ea_lead_whatsapp';
const JANELA_DA_SESSAO_MS = 30 * 60 * 1000;

function leadJaContado(agora = Date.now()): boolean {
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
 * O degrau: monta o link do WhatsApp e conta o lead NO TOQUE em "Abrir o
 * WhatsApp" — nunca na chegada, e nada redireciona sozinho.
 *
 * Até 07/11/2026 a chegada disparava o `generate_lead` e fazia
 * `location.replace` pro WhatsApp em 900 ms: o Google e o GA4 contavam como
 * lead quem só CHEGOU (aba aberta por engano, pré-carregamento, robô que roda
 * JavaScript, a mesma pessoa voltando). Agora a pessoa confirma com um toque, e
 * é nesse toque que o `generate_lead` sai, com o mesmo nome e os mesmos
 * parâmetros, 1 vez por sessão. Molde: PR #33 do
 * `agenciarizzo/lm-dr-luciano-morais`; rizzo-os →
 * `docs/ADS_CONVERSAO_HONESTA_MAPA.md` §3.
 *
 * É o ÚNICO lugar do site onde `wa.me` existe — todo CTA aponta para a rota
 * `/whatsapp`, e o link de verdade nasce aqui, no navegador, a partir das
 * partes de `lib/whatsapp.ts`. Ver o cabeçalho daquele arquivo para o porquê.
 * O HTML servido sai sem `href`; o link entra depois da hidratação, então o
 * render do servidor e o do navegador são o mesmo.
 */
export function DegrauWhatsApp({ padrao }: { padrao: string }) {
  const botao = useRef<HTMLAnchorElement>(null);
  const pendente = useRef(false);
  const cancelar = useRef<() => void>(() => {});

  // Na CHEGADA só se monta o link. Nenhum evento, nenhum redirecionamento.
  useEffect(() => {
    botao.current?.setAttribute('href', destino(padrao).url);
  }, [padrao]);

  useEffect(() => () => cancelar.current(), []);

  /** O toque: o único lugar onde o degrau conta alguma coisa. Não segura o link. */
  function aoTocar(e: React.MouseEvent<HTMLAnchorElement>) {
    // Lido de novo no toque: a escolha de medição pode ter mudado desde a chegada.
    const { url, origem, medindo } = destino(padrao);
    e.currentTarget.setAttribute('href', url);

    if (!medindo || pendente.current || leadJaContado()) return;
    pendente.current = true;
    cancelar.current = eventoQuandoATagMontar(
      'generate_lead',
      { method: 'whatsapp', origem },
      ESPERA_DA_TAG_MS,
      (saiu) => {
        if (saiu) marcaLeadContado();
        else pendente.current = false; // a tag não montou: o próximo toque tenta de novo
      },
    );
  }

  return (
    <a
      ref={botao}
      onClick={aoTocar}
      target="_blank"
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
      Abrir o WhatsApp
    </a>
  );
}
