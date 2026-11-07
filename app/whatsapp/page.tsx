import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { DegrauWhatsApp } from '@/components/DegrauWhatsApp';
import { clinica, page } from '@/lib/content';
import { cor, GRAIN, serif } from '@/lib/theme';

/**
 * Página intermediária: NÃO entra no Google.
 *
 * Ela não é conteúdo do site — é o degrau que abre o WhatsApp. Indexá-la só
 * exporia o caminho e ainda poria uma página sem conteúdo no índice.
 * `app/robots.ts` também a bloqueia; os dois sinais juntos são de propósito.
 *
 * Desde 07/11/2026 o degrau NÃO abre sozinho: mostra o botão "Abrir o
 * WhatsApp", e o lead conta no toque dele (`components/DegrauWhatsApp.tsx`).
 * O texto diz isso, e o botão vem logo depois da frase que pede o toque.
 */
export const metadata: Metadata = {
  title: 'Continue no WhatsApp | Examine Agora',
  description: 'Abra a conversa de WhatsApp da Examine Agora.',
  robots: { index: false, follow: false },
};

export default function Whatsapp() {
  return (
    <main
      className="ea-degrau"
      style={{
        minHeight: '100svh',
        background: cor.campo,
        backgroundImage: `url("${GRAIN}")`,
        color: cor.branco,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <Image
        src="/ea_logo_light.png"
        alt="Examine Agora"
        width={300}
        height={60}
        priority
        style={{ height: 34, width: 'auto', marginBottom: 34 }}
      />

      <div
        style={{
          maxWidth: 430,
          width: '100%',
          background: 'rgba(169,214,245,.06)',
          border: '1px solid rgba(169,214,245,.18)',
          borderRadius: 22,
          padding: '38px 26px 32px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 21, fontWeight: 500, lineHeight: 1.35 }}>
          Continue no <span style={{ ...serif, color: cor.ceu }}>WhatsApp</span> da{' '}
          {/* O nome não quebra no meio: em 390 px o "Agora" caía sozinho na 2ª linha (Voz V1, sem linha órfã). */}
          {clinica.nome.split(' — ')[0].replace(/ /g, '\u00a0')}
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.72)' }}>
          Sua mensagem já está pronta.
          <br />
          Toque no botão abaixo para abrir a conversa.
        </p>

        <DegrauWhatsApp padrao={page('inicio').seo.waMsg} />
      </div>

      <Link
        href="/"
        className="ea-link-inherit"
        style={{ marginTop: 22, fontSize: 13, color: 'rgba(169,214,245,.8)', textDecoration: 'none' }}
      >
        ← Voltar ao site
      </Link>
    </main>
  );
}
