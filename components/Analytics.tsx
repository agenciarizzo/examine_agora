import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/config';

/**
 * Google Analytics 4 (gtag.js) — a tag oficial da propriedade da clínica.
 *
 * Carrega via `next/script` com `afterInteractive`: o Next injeta os dois
 * scripts depois da hidratação, então a medição não disputa banda com o
 * conteúdo nem entra no caminho crítico de renderização.
 *
 * Sem ID configurado (`NEXT_PUBLIC_GA_ID=""`) o componente não renderiza nada,
 * o que mantém build local e preview limpos de tráfego de teste.
 */
export function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
