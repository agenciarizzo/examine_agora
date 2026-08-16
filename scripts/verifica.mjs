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
const posts = JSON.parse(readFileSync(new URL('../content/posts.json', import.meta.url)));

/** Vedado no site (guardrails do ea-studio-config.json). */
const VEDADO = [
  'resultado on-line',
  'resultado online',
  'resultados online',
  'tabela de preços',
  'r$',
];

/**
 * O guardrail veda "diagnóstico de câncer de colo do útero" — não a palavra
 * colo. A medição obstétrica do colo (comprimento cervical, risco de parto
 * prematuro) é exame que a clínica faz e aparece nos posts de obstetrícia.
 * Por isso o termo só reprova quando vem perto do que a regra veda de fato.
 */
const CANCER_DE_COLO = /(câncer|cancer|neoplasia|papanicolau|colposcopia|hpv|lesão precursora)/i;

function coloVedado(texto) {
  for (const m of texto.matchAll(/colo do útero/gi)) {
    const janela = texto.slice(Math.max(0, m.index - 220), m.index + 220);
    if (CANCER_DE_COLO.test(janela)) return janela.replace(/\s+/g, ' ').trim();
  }
  return null;
}

const texto = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const falhas = [];
const anota = (path, msg) => falhas.push(`${path} — ${msg}`);

/** Guardrails, sinais obrigatórios e SEO de uma página renderizada. */
async function verifica(path, exigeJsonLd = []) {
  const res = await fetch(base + path);
  if (!res.ok) {
    anota(path, `HTTP ${res.status}`);
    return;
  }
  const html = await res.text();
  const visivel = texto(html);
  const minusculo = visivel.toLowerCase();

  for (const termo of VEDADO) {
    if (minusculo.includes(termo)) anota(path, `termo vedado: "${termo}"`);
  }
  const colo = coloVedado(visivel);
  if (colo) anota(path, `colo do útero em contexto de câncer: "…${colo}…"`);

  // "Doppler" sempre com D maiúsculo — só no texto visível, não nas URLs.
  if (/\bdoppler\b/.test(visivel)) anota(path, 'Doppler em minúsculo');

  if (!html.includes('wa.me/556132086814')) anota(path, 'sem float/link de WhatsApp');
  if (!html.includes(db.clinica.rt.crm.split(' · ')[0])) anota(path, 'sem a linha do RT');

  const titulo = /<title>(.*?)<\/title>/.exec(html)?.[1];
  if (!titulo) anota(path, 'sem <title>');
  if (!html.includes(`rel="canonical"`)) anota(path, 'sem canonical');

  const blocos = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const tipos = blocos.flatMap((m) => {
    const d = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    return (d['@graph'] ?? [d]).map((n) => n['@type']);
  });
  for (const t of ['MedicalClinic', ...exigeJsonLd]) {
    if (!tipos.includes(t)) anota(path, `sem ${t} no JSON-LD`);
  }
}

for (const p of db.pages) {
  const exige = [];
  if (p.faq?.length) exige.push('FAQPage');
  if (p.tipo === 'landing' && !p.hub) {
    exige.push(p.grupo === 'proc' ? 'MedicalProcedure' : 'MedicalTest');
  }
  await verifica(p.path, exige);
}

/** Posts migrados do WP: mesmas regras, mais o BlogPosting e o link do tema. */
for (const p of posts.posts) {
  await verifica(`/${p.slug}`, ['BlogPosting']);
  const html = await fetch(base + `/${p.slug}`).then((r) => (r.ok ? r.text() : ''));
  const alvo = db.pages.find((x) => x.slug === p.tema);
  if (html && !html.includes(`href="${alvo.path}"`)) {
    anota(`/${p.slug}`, `sem o link para a landing do tema (${alvo.path})`);
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
  // Os posts migrados foram rastreados com barra final; hoje respondem sem ela.
  ...posts.posts.map((p) => `/${p.slug}/`),
  ...ANTIGAS_EXTRAS,
].filter((de) => de.startsWith('/') && !de.includes(' ') && !de.includes('|'));

for (const de of antigas) {
  const res = await fetch(base + de);
  if (!res.ok) anota(de, `URL antiga do WP terminou em HTTP ${res.status}`);
}

console.log(`páginas verificadas: ${db.pages.length}`);
console.log(`posts verificados: ${posts.posts.length}`);
console.log(`URLs antigas verificadas: ${antigas.length}`);
if (falhas.length) {
  console.error(`\n${falhas.length} falha(s):`);
  for (const f of falhas) console.error('  ✗', f);
  process.exit(1);
}
console.log('tudo certo: guardrails, WhatsApp, RT, SEO e JSON-LD.');
