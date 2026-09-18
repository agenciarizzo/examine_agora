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

/** Tetos de metadado do Padrão Rizzo de SEO (seção C). */
const TETO_TITLE = 60;
const TETO_DESC = 155;

const falhas = [];
const anota = (path, msg) => falhas.push(`${path} — ${msg}`);

/** Guardrails, sinais obrigatórios e SEO de uma página renderizada. */
async function verifica(path, exigeJsonLd = [], proprio = false) {
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

  // Todo CTA de WhatsApp aponta para o degrau interno, e `wa.me` não pode
  // aparecer em página nenhuma — quem cobra isso no build é
  // `scripts/antirobo.mjs`; aqui é o mesmo teste, do lado do servidor de pé.
  if (!html.includes('href="/whatsapp?')) anota(path, 'sem float/link de WhatsApp');
  if (html.includes('wa.me')) anota(path, 'wa.me servido na página (antirrobô furado)');
  if (!html.includes(db.clinica.rt.crm.split(' · ')[0])) anota(path, 'sem a linha do RT');

  const titulo = /<title>(.*?)<\/title>/.exec(html)?.[1];
  if (!titulo) anota(path, 'sem <title>');
  if (!html.includes(`rel="canonical"`)) anota(path, 'sem canonical');

  // Limites de metadados (Padrão Rizzo de SEO, seção C). O teto não é estético:
  // acima dele o Google corta no meio da frase e quem busca lê reticências.
  if (titulo && titulo.length > TETO_TITLE) {
    anota(path, `<title> com ${titulo.length} caracteres (teto ${TETO_TITLE})`);
  }
  // Cartão de compartilhamento: sem ele, o link mandado no WhatsApp chega como
  // retângulo vazio. Vale para as 32 páginas, não só para a home.
  const capa = /property="og:image" content="([^"]+)"/.exec(html)?.[1];
  if (!capa) anota(path, 'sem og:image');
  if (capa) {
    // O arquivo tem de EXISTIR. É o gate que pega a divergência entre a regra
    // de `lib/meta.ts` (quem declara o cartão) e a de `scripts/og-card.mjs`
    // (quem gera): uma landing nova apontaria para um cartão inexistente, e o
    // link chegaria vazio de novo — em silêncio.
    const r = await fetch(base + new URL(capa).pathname);
    if (!r.ok) anota(path, `og:image aponta para ${new URL(capa).pathname} → HTTP ${r.status}`);
    // E landing clínica não pode cair no cartão institucional: o dela é o que
    // diz qual exame o link abre.
    if (proprio && new URL(capa).pathname === '/og-card.jpg') {
      anota(path, 'landing com cartão institucional (devia ter o seu)');
    }
  }

  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
  if (!desc) anota(path, 'sem meta description');
  if (desc && desc.length > TETO_DESC) {
    anota(path, `meta description com ${desc.length} caracteres (teto ${TETO_DESC})`);
  }

  // Exatamente um <h1> por página, e nenhuma imagem sem alt.
  const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1 !== 1) anota(path, `${h1} <h1> na página (esperado 1)`);
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(img[0])) anota(path, `<img> sem alt: ${img[0].slice(0, 70)}…`);
  }

  const blocos = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const tipos = blocos.flatMap((m) => {
    const d = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    return (d['@graph'] ?? [d]).map((n) => n['@type']);
  });
  for (const t of ['MedicalClinic', ...exigeJsonLd]) {
    if (!tipos.includes(t)) anota(path, `sem ${t} no JSON-LD`);
  }
  // Trilha em toda rota aninhada — a raiz é a única sem, porque é a raiz.
  if (path !== '/' && !tipos.includes('BreadcrumbList')) {
    anota(path, 'sem BreadcrumbList no JSON-LD (rota aninhada)');
  }
}

/**
 * Varredura do json (cura da armadilha C, §1.1 do mapa de pré-agendamento):
 * `texto()` acima tira o conteúdo de dentro de `<script>` antes de procurar
 * termo vedado — e é exatamente onde mora a carga do React, ou seja, tudo
 * que só existe depois de um clique (modal, concierge) é invisível para o
 * scanner de HTML. Esta varredura aplica os MESMOS guardrails direto no
 * json, offline, antes de qualquer `fetch`.
 */
function todasAsStrings(valor, acc = []) {
  if (typeof valor === 'string') acc.push(valor);
  else if (Array.isArray(valor)) for (const v of valor) todasAsStrings(v, acc);
  else if (valor && typeof valor === 'object') for (const v of Object.values(valor)) todasAsStrings(v, acc);
  return acc;
}

function varreJson(rotulo, valor) {
  if (valor === undefined) return;
  const junto = todasAsStrings(valor).join(' \n ');
  const minusculo = junto.toLowerCase();
  for (const termo of VEDADO) {
    if (minusculo.includes(termo)) anota(rotulo, `termo vedado: "${termo}"`);
  }
  const colo = coloVedado(junto);
  if (colo) anota(rotulo, `colo do útero em contexto de câncer: "…${colo}…"`);
}

varreJson('content/ea-landings.json → site.exames', db.site.exames);
// `site.concierge` ainda não existe na Fatia 1 — `varreJson` não faz nada
// com `undefined`, e a varredura liga sozinha quando a Fatia 2 criar o nó.
varreJson('content/ea-landings.json → site.concierge', db.site.concierge);
for (const p of db.pages) {
  if (p.faq?.length) varreJson(`content/ea-landings.json → pages[${p.slug}].faq`, p.faq);
}

for (const p of db.pages) {
  // `Physician` entra em todas: é o RT que assina o laudo, e o perfil de
  // centro de diagnóstico por imagem pede o nó por membro do corpo clínico.
  const exige = ['Physician'];
  if (p.faq?.length) exige.push('FAQPage');
  if (p.tipo === 'landing' && !p.hub) {
    exige.push(p.grupo === 'proc' ? 'MedicalProcedure' : 'MedicalTest');
  }
  // Landing clínica com ilustração tem cartão de compartilhamento PRÓPRIO.
  const cartaoProprio = p.tipo === 'landing' && !p.hub && Boolean(p.hero);
  await verifica(p.path, exige, cartaoProprio);
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

/** O degrau: responde, é noindex e não monta o link no HTML. */
{
  const res = await fetch(base + '/whatsapp?m=teste&o=verifica');
  if (!res.ok) anota('/whatsapp', `HTTP ${res.status}`);
  const html = res.ok ? await res.text() : '';
  if (html && !/name="robots"[^>]*noindex/.test(html)) anota('/whatsapp', 'sem noindex');
  if (html.includes('wa.me')) anota('/whatsapp', 'wa.me no HTML do degrau (tem de nascer no JS)');
  const robots = await (await fetch(base + '/robots.txt')).text();
  if (!/Disallow:\s*\/whatsapp/.test(robots)) anota('/robots.txt', 'sem Disallow do /whatsapp');
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  if (sitemap.includes('/whatsapp')) anota('/sitemap.xml', 'degrau /whatsapp dentro do sitemap');
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
