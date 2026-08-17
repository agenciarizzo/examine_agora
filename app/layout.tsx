import type { Metadata, Viewport } from 'next';
import { Analytics } from '@/components/Analytics';
import { clinica, page, SITE_URL } from '@/lib/content';
import './globals.css';

const inicio = page('inicio');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: inicio.seo.title, template: '%s' },
  description: inicio.seo.description,
  applicationName: clinica.nome,
  authors: [{ name: clinica.nome, url: SITE_URL }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: clinica.nome,
    locale: 'pt_BR',
    url: SITE_URL,
  },
  icons: { icon: '/ea_symbol_dark.png', apple: '/ea_symbol_dark.png' },
};

export const viewport: Viewport = {
  themeColor: '#061423',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;700&family=Instrument+Serif:ital@1&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
