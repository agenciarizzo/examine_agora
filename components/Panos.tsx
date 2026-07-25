import type { CSSProperties } from 'react';
import { cor, GRAIN } from '@/lib/theme';

const cobre: CSSProperties = { position: 'absolute', inset: 0 };

/** Grão de ruído dos panos escuros. */
export function Grain({ opacity = 0.12 }: { opacity?: number }) {
  return (
    <div
      style={{
        ...cobre,
        backgroundImage: `url(${GRAIN})`,
        backgroundSize: '220px 220px',
        opacity,
        mixBlendMode: 'screen',
      }}
    />
  );
}

/** Halo radial de eco sobre o campo. */
export function Halo({ gradient }: { gradient: string }) {
  return <div style={{ ...cobre, background: gradient }} />;
}

/** Varredura: linhas verticais com máscara de baixo para cima. */
export function Varredura({ opacity = 0.3 }: { opacity?: number }) {
  const mask = 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 55%)';
  return (
    <div
      style={{
        ...cobre,
        background:
          'repeating-linear-gradient(90deg, rgba(20,112,196,.5) 0 3px, transparent 3px 17px)',
        opacity,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}

/** Setor: o "leque" do transdutor, em traço fino. */
export function Setor({
  style,
  strokeWidth = 3,
  strokeOpacity,
}: {
  style: CSSProperties;
  strokeWidth?: number;
  strokeOpacity?: number;
}) {
  return (
    <div style={{ position: 'absolute', width: 1080, height: 1000, ...style }}>
      <svg viewBox="0 0 1080 1000" width="100%" height="100%" aria-hidden="true">
        <path
          d="M470 0H610L1010 700Q540 950 70 700Z"
          fill="none"
          stroke={cor.ceu}
          strokeWidth={strokeWidth}
          opacity={strokeOpacity}
        />
      </svg>
    </div>
  );
}

/** Eco: círculos concêntricos saindo da borda direita. */
export function Eco({
  viewBox,
  raios,
  cx = 1180,
  cy = 120,
  stroke = cor.ceu,
  strokeWidth = 5,
  opacity = 0.6,
  preserveAspectRatio = 'xMaxYMid slice',
}: {
  viewBox: string;
  /** Pares [raio, opacidade] do círculo. */
  raios: [number, number][];
  cx?: number;
  cy?: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  preserveAspectRatio?: string;
}) {
  return (
    <div style={{ ...cobre, overflow: 'hidden', opacity }}>
      <svg
        viewBox={viewBox}
        width="100%"
        height="100%"
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
      >
        {raios.map(([r, o]) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={o}
          />
        ))}
      </svg>
    </div>
  );
}
