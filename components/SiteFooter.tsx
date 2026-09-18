import Image from 'next/image';
import Link from 'next/link';
import { clinica, href, legais, nav } from '@/lib/content';
import { cor, WRAP } from '@/lib/theme';

const miudo = {
  color: 'rgba(169,214,245,.8)',
  textDecoration: 'none',
  fontSize: 12,
} as const;

/**
 * Ano do rodapé. O site é gerado estaticamente, então este valor congela no
 * build — é o ano do último deploy, não o de hoje. Está certo assim: o que a
 * linha declara é a data do conteúdo publicado.
 */
const ANO = new Date().getFullYear();

/**
 * Rodapé mudo com a linha do RT. A faixa de links de navegação só aparece nas
 * páginas que a têm nos HTML de referência (Home e landings); a faixa legal
 * (privacidade, termos, cookies) vai em todas — é por ela que essas páginas
 * deixam de ser órfãs, no site e para o buscador.
 */
export function SiteFooter({ links = false }: { links?: boolean }) {
  return (
    <footer style={{ background: cor.navy, borderTop: '1px solid rgba(169,214,245,.14)' }}>
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '30px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Image
          src="/ea_logo_light.png"
          alt="Examine Agora"
          width={300}
          height={60}
          style={{ height: 30, width: 'auto', display: 'block' }}
        />
        {/*
          A linha do RT é exigência do CFM, não enfeite de rodapé: nome, CRM e
          RQE precisam estar visíveis em toda página. Fica em `cor.ceu` cheio,
          e não num cinza-azul a 70%, porque exigência ilegível é exigência
          não cumprida.
        */}
        <p style={{ margin: 0, fontSize: 13, color: cor.ceu, fontWeight: 500 }}>
          {clinica.rt_line}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(169,214,245,.8)' }}>
          <a
            href={clinica.instagram}
            target="_blank"
            rel="noopener"
            className="ea-link-inherit"
            style={{ textDecoration: 'none' }}
          >
            {clinica.handle}
          </a>{' '}
          · {clinica.site}
        </p>
      </div>
      {links && (
        <div
          style={{
            maxWidth: WRAP,
            margin: '0 auto',
            padding: '0 24px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 22px',
          }}
        >
          {nav.map((n) => (
            <Link key={n.label} href={n.href} className="ea-link-inherit" style={miudo}>
              {n.label}
            </Link>
          ))}
          <Link href={href('agende')} className="ea-link-inherit" style={miudo}>
            Agende seu exame
          </Link>
        </div>
      )}
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '16px 24px 26px',
          borderTop: '1px solid rgba(169,214,245,.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 22px',
        }}
      >
        {legais.map((l) => (
          <Link key={l.slug} href={l.path} className="ea-link-inherit" style={miudo}>
            {l.nome}
          </Link>
        ))}
      </div>
      <div
        style={{
          maxWidth: WRAP,
          margin: '0 auto',
          padding: '0 24px 26px',
          borderTop: '1px solid rgba(169,214,245,.1)',
          paddingTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px 22px',
        }}
      >
        <p style={{ margin: 0, ...miudo }}>
          © {ANO} {clinica.nome}. Todos os direitos reservados.
        </p>
        <p style={{ margin: 0, ...miudo }}>
          Desenvolvido por{' '}
          {/*
            A assinatura da agência é link para o site dela — padrão da casa,
            igual ao do site da ECOA.

            `rel="noopener"` SEM `noreferrer`, ao contrário dos outros links
            externos do site: é o referrer que faz a visita chegar identificada
            como vinda daqui no Analytics da agência, que é exatamente o que um
            crédito de rodapé existe para fazer. `noopener` fica, que é a parte
            de segurança.

            `aria-label` porque o "|" é ornamento da marca: em leitor de tela
            ele seria lido como "barra vertical" no meio do nome.
          */}
          <a
            href="https://www.agenciarizzo.com.br/"
            target="_blank"
            rel="noopener"
            aria-label="Agência Rizzo"
            className="ea-link-inherit"
            style={{ color: cor.branco, fontWeight: 600, textDecoration: 'none' }}
          >
            agência<span style={{ color: '#FFCC00' }}>|</span>rizzo
          </a>
        </p>
      </div>
    </footer>
  );
}
