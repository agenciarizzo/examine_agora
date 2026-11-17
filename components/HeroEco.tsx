import type { CSSProperties } from 'react';
import Image from 'next/image';
import { temIlustracao } from '@/components/Ilustracao';

/**
 * A ilustração científica da página no hero, como se estivesse na tela do
 * ultrassom: o traço navy da ilustração vira traço claro sobre o pano campo
 * (inversão + `lighten`, o fundo gelo da imagem some no escuro), e o leque do
 * transdutor revela o desenho a partir da sonda, com uma onda de eco que sai
 * dela uma vez. Só CSS (`globals.css`, bloco "Hero eco"): nada de JavaScript,
 * nada no caminho da primeira pintura, e `prefers-reduced-motion` mostra o
 * desenho parado.
 *
 * A mesma ilustração, com o texto alternativo, segue na seção "Como é feito"
 * (`Ilustracao.tsx`); aqui ela é decorativa (`alt=""`), pra não repetir a
 * leitura no leitor de tela.
 */

/** Onde está a sonda em cada ilustração (% da largura, % da altura). */
const SONDA: Record<string, [number, number]> = {
  prostata: [80, 42],
  mama: [38, 12],
  tireoide: [74, 12],
  linfonodo: [38, 14],
  musculo: [66, 10],
  doppler: [50, 12],
  morfologico: [58, 12],
  mulher: [50, 10],
  abdominal: [50, 14],
  homem: [24, 20],
  laboratorio: [50, 52],
  infiltracao: [66, 40],
};

function origem(slug: string): CSSProperties {
  const [x, y] = SONDA[slug] ?? [50, 12];
  return { '--ea-ox': `${x}%`, '--ea-oy': `${y}%` } as CSSProperties;
}

export function temHeroEco(slug: string): boolean {
  return temIlustracao(slug);
}

/** Uma ilustração, revelada uma vez pelo leque. */
export function HeroEco({ slug }: { slug: string }) {
  return (
    <figure className="ea-hero-eco" style={origem(slug)} aria-hidden="true">
      <Image
        className="ea-hero-eco__img"
        src={`/ilustracoes/${slug}.jpg`}
        alt=""
        width={1024}
        height={1024}
        priority
        sizes="(min-width: 960px) 440px, 340px"
      />
      <span className="ea-hero-eco__onda" />
      <span className="ea-hero-eco__onda ea-hero-eco__onda--2" />
    </figure>
  );
}

/**
 * Home: as ilustrações se sucedem no mesmo monitor, cada uma revelada pelo
 * leque e apagada antes da próxima (ciclo de 4 × 5 s, só CSS).
 */
export function HeroEcoCiclo({ slugs }: { slugs: string[] }) {
  return (
    <figure className="ea-hero-eco ea-hero-eco--ciclo" aria-hidden="true">
      {slugs.map((s, i) => (
        <span
          key={s}
          className="ea-hero-eco__quadro"
          style={{ ...origem(s), animationDelay: `${i * 5}s` }}
        >
          <Image
            className="ea-hero-eco__img"
            src={`/ilustracoes/${s}.jpg`}
            alt=""
            width={1024}
            height={1024}
            priority={i === 0}
            sizes="(min-width: 960px) 440px, 340px"
          />
        </span>
      ))}
    </figure>
  );
}
