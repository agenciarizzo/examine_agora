#!/usr/bin/env node
/**
 * Varredura das 20 páginas renderizadas: guardrails de conteúdo, sinais
 * obrigatórios (WhatsApp, RT, horário) e JSON-LD. Depois, a varredura das URLs
 * antigas do WordPress: nenhuma pode terminar em 404.
 *
 * Uso, com o site de pé:  node scripts/verifica.mjs http://localhost:3000
 */
import { readFileSync } from 'node:fs';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const db = JSON.parse(readFileSync(new URL('../content/ea-landings.json', import.meta.url)));

/** Vedado no site (guardrails do ea-studio-config.json). */
const VEDADO = [
  'colo do útero',
  'resultado on-line',
  'resultado online',
  'resultados online',
  'tabela de preços',
  'r$',
];

const texto = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const falhas = [];
const anota = (path, msg) => falhas.push(`${path} — ${msg}`);

for (const p of db.pages) {
  const res = await fetch(base + p.path);
  if (!res.ok) {
    anota(p.path, `HTTP ${res.status}`);
    continue;
  }
  const html = await res.text();
  const visivel = texto(html);
  const minusculo = visivel.toLowerCase();

  for (const termo of VEDADO) {
    if (minusculo.includes(termo)) anota(p.path, `termo vedado: "${termo}"`);
  }
  // "Doppler" sempre com D maiúsculo — só no texto visível, não nas URLs.
  if (/\bdoppler\b/.test(visivel)) anota(p.path, 'Doppler em minúsculo');

  if (!html.includes('wa.me/556132086814')) anota(p.path, 'sem float/link de WhatsApp');
  if (!html.includes(db.clinica.rt.crm.split(' · ')[0])) anota(p.path, 'sem a linha do RT');

  const titulo = /<title>(.*?)<\/title>/.exec(html)?.[1];
  if (!titulo) anota(p.path, 'sem <title>');
  if (!html.includes(`rel="canonical"`)) anota(p.path, 'sem canonical');

  const blocos = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const tipos = blocos.flatMap((m) => {
    const d = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    return (d['@graph'] ?? [d]).map((n) => n['@type']);
  });
  if (!tipos.includes('MedicalClinic')) anota(p.path, 'sem MedicalClinic no JSON-LD');
  if (p.faq?.length && !tipos.includes('FAQPage')) anota(p.path, 'tem FAQ mas não tem FAQPage');
  if (p.tipo === 'landing' && !p.hub) {
    const esperado = p.grupo === 'proc' ? 'MedicalProcedure' : 'MedicalTest';
    if (!tipos.includes(esperado)) anota(p.path, `sem ${esperado} no JSON-LD`);
  }
}

/**
 * URLs do WP que o Google rastreou e que não estão no json: arquivos de
 * categoria/autor/tag, feed, manutenção e o que sobrou do serviço de
 * resultados descontinuado. Espelham o `ARQUIVOS_WP`/`EXTRAS` de
 * `lib/redirects.ts`.
 */
const ANTIGAS_EXTRAS = [
  '/author/examineagora/',
  '/category/uncategorized/',
  '/category/noticias/',
  '/tag/ultrassom/',
  '/blog/',
  '/feed/',
  '/manutencao/',
  '/resultado-on-line/',
  '/area-restrita/',
  '/conta/',
  '/registro/',
  '/login/',
];

const antigas = [
  ...db.site.port_map.map((m) => m.de),
  ...db.site.port_map_posts.map((m) => m.de),
  ...ANTIGAS_EXTRAS,
].filter((de) => de.startsWith('/') && !de.includes(' ') && !de.includes('|'));

for (const de of antigas) {
  const res = await fetch(base + de);
  if (!res.ok) anota(de, `URL antiga do WP terminou em HTTP ${res.status}`);
}

console.log(`páginas verificadas: ${db.pages.length}`);
console.log(`URLs antigas verificadas: ${antigas.length}`);
if (falhas.length) {
  console.error(`\n${falhas.length} falha(s):`);
  for (const f of falhas) console.error('  ✗', f);
  process.exit(1);
}
console.log('tudo certo: guardrails, WhatsApp, RT, SEO e JSON-LD.');
