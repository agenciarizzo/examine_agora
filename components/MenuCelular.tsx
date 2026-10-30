'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { cor } from '@/lib/theme';

/**
 * Menu do celular do `SiteHeader` (até 640 px; regras no `globals.css`).
 * É um `<details>`: abre e fecha sem JavaScript. O único JS é fechar no
 * clique de um item, porque link pra mesma página (`/#exames`) não troca a
 * rota e o painel ficaria aberto por cima do conteúdo.
 */
export function MenuCelular({
  itens,
  waHref,
  cta,
}: {
  itens: { label: string; href: string }[];
  waHref: string;
  cta: boolean;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  const fechar = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <details ref={menu} className="ea-nav-cel">
      <summary aria-label="Abrir o menu">
        <span aria-hidden="true" className="ea-nav-cel-icone" />
        Menu
      </summary>
      <nav aria-label="Menu" className="ea-nav-cel-painel" style={{ background: cor.campo }}>
        {itens.map((n) => (
          <Link key={n.label} href={n.href} className="ea-nav-cel-link" onClick={fechar}>
            {n.label}
          </Link>
        ))}
        {cta && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className="ea-nav-cel-cta"
            style={{ background: cor.ceu, color: cor.campo }}
            onClick={fechar}
          >
            Agende seu exame
          </a>
        )}
      </nav>
    </details>
  );
}
