import type { CSSProperties, ReactNode } from 'react';
import { cor, serif } from '@/lib/theme';

/** Ênfase em Instrument Serif itálico — a assinatura tipográfica da matriz. */
export function Em({ children, color = cor.ceu }: { children: ReactNode; color?: string }) {
  return <em style={{ ...serif, color }}>{children}</em>;
}

/** Item de lista com a barra vertical eco/céu. */
export function ItemBarra({
  children,
  tom = 'claro',
}: {
  children: ReactNode;
  tom?: 'claro' | 'escuro';
}) {
  const claro = tom === 'claro';
  return (
    <div
      style={{
        borderLeft: `3px solid ${claro ? cor.eco : cor.ceu}`,
        padding: '6px 0 6px 16px',
        fontSize: 17,
        lineHeight: 1.5,
        ...(claro ? {} : { color: 'rgba(238,246,252,.9)' }),
      }}
    >
      {children}
    </div>
  );
}

/** Pílula usada em preparos, valores e listas de exames. */
export function Pilula({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        background: cor.gelo,
        color: cor.navy,
        fontSize: 13,
        fontWeight: 500,
        padding: '6px 12px',
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

/** Botão pílula céu sobre pano escuro. */
export function BotaoCeu({
  href,
  children,
  fontSize = 18,
  padding = '18px 36px',
  externo = true,
  style,
}: {
  href: string;
  children: ReactNode;
  fontSize?: number;
  padding?: string;
  externo?: boolean;
  style?: CSSProperties;
}) {
  return (
    <a
      href={href}
      {...(externo ? { target: '_blank', rel: 'noopener' } : {})}
      style={{
        display: 'inline-block',
        background: cor.ceu,
        color: cor.campo,
        textDecoration: 'none',
        fontSize,
        fontWeight: 700,
        padding,
        borderRadius: 999,
        ...style,
      }}
    >
      {children}
    </a>
  );
}

/** `<script type="application/ld+json">` com o grafo da página. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
