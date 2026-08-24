'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { META_PIXEL_ID, pixelLiberado } from '@/lib/config';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Pixel do Meta (Facebook/Instagram Ads) — tráfego pago para o site.
 *
 * Espelha o `Analytics`: `next/script` com `afterInteractive`, ID num lugar só,
 * e sem ID (`NEXT_PUBLIC_META_PIXEL_ID=""`) não renderiza nada. Como o
 * `Analytics`, quem monta é o `Medicao`, DEPOIS do gate de consentimento —
 * quem recusa a medição não carrega pixel nenhum.
 *
 * Três diferenças em relação ao snippet cru que o Meta entrega, todas
 * deliberadas:
 *
 *  1. **Só dispara no allowlist do `pixelLiberado`.** As landings de exame
 *     ficam de fora: a URL delas nomeia o procedimento, e mandar isso pro Meta
 *     é dado de saúde (ver o comentário do `PAGINAS_COM_PIXEL`). Numa visita
 *     que começa numa landing, o script sequer é carregado.
 *
 *  2. **`autoConfig: false`.** Desliga a coleta automática do Meta, que sem
 *     isso varre botões e campos da página por conta própria e manda o que
 *     achar. Num site de clínica esse varredor é exatamente o que não pode
 *     rodar. Com ele desligado, só sai o que este arquivo manda sair.
 *
 *  3. **Sem o `<noscript>` do snippet oficial.** Aquele `<img>` dispara direto
 *     do HTML, ou seja, ANTES e À REVELIA do gate de consentimento — e para
 *     quem está sem JavaScript o aviso de medição também não funciona, então
 *     não haveria como recusar. Rastrear quem não pode dizer não fica fora.
 *
 * O `PageView` não sai do snippet: sai do efeito abaixo, um por página
 * liberada. Assim a primeira carga e as navegações internas seguem o mesmo
 * caminho, sem contar duas vezes na primeira.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const [pronto, setPronto] = useState(false);
  const liberado = pixelLiberado(pathname);

  useEffect(() => {
    if (!pronto || !liberado) return;
    window.fbq?.('track', 'PageView');
  }, [pronto, liberado, pathname]);

  if (!META_PIXEL_ID) return null;

  // Numa página fora do allowlist o script nem entra na árvore. Se ele já foi
  // carregado numa página liberada antes, segue em memória — mas sem `track`
  // nenhum e com a coleta automática desligada, não reporta a visita clínica.
  if (!liberado) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive" onReady={() => setPronto(true)}>
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');`}
    </Script>
  );
}
