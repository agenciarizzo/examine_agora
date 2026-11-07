// Prova local do Lead do Pixel no clique de WhatsApp (nada sai pra conta de ninguém).
// Uso: npm run build && (npm start -- -p 3100 &) && node scripts/prova-pixel-lead.cjs http://localhost:3100
// Alcança o servidor local pelo domínio real (page.route), com consentimento já dado, todo hit de medição
// abortado e a ida ao WhatsApp respondida com 204. O fbevents.js não manda hit de rede com
// `navigator.webdriver`, então a prova confere a CHAMADA ao `fbq` (Object.defineProperty + Proxy) e se a
// config do pixel (`/signals/config/`) já tinha chegado. Molde: rizzo-os scaffold/site-cliente/kit/scripts.
const {chromium} = require('playwright');
const LOCAL = (process.argv[2] || 'http://localhost:3100').replace(/\/$/, '');
const BASE = 'https://examineagora.com.br';
const MEDICAO = /google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect|google\.com\/g\/collect|googleadservices\.com|doubleclick\.net|facebook\.com\/tr/;
const WHATS = /^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//;
const LANDING = '/biopsia-de-mama-guiada-por-ultrassom';

async function contexto(b, escolha = 'aceito') {
  const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
  const log = {fbq: [], whats: 0, fbevents: 0};
  await ctx.route(`${BASE}/**`, async (route) => {
    const u = new URL(route.request().url());
    const r = await fetch(LOCAL + u.pathname + u.search);
    route.fulfill({status: r.status, body: Buffer.from(await r.arrayBuffer()), headers: {'content-type': r.headers.get('content-type') || 'text/html'}});
  });
  await ctx.route(MEDICAO, (route) => route.abort());
  await ctx.route(WHATS, (route) => { log.whats++; route.fulfill({status: 204, body: ''}); });
  ctx.on('request', (r) => { if (/connect\.facebook\.net\/en_US\/fbevents\.js/.test(r.url())) log.fbevents++; });
  await ctx.addInitScript((e) => {
    try { if (!localStorage.getItem('ea_medicao')) localStorage.setItem('ea_medicao', e); } catch {}
    let atual;
    Object.defineProperty(window, 'fbq', {
      configurable: true,
      get: () => atual,
      set: (f) => {
        atual = typeof f !== 'function' ? f : new Proxy(f, {
          apply(alvo, este, args) {
            if (args[0] === 'track' && args[1] !== 'PageView') {
              const pronta = performance.getEntriesByType('resource').some((x) => /\/signals\/config\//.test(x.name));
              console.log(`FBQ ${args[1]} ${(args[3] && args[3].eventID) || '-'} ${pronta ? 'pronta' : 'sem-config'}`);
            }
            return Reflect.apply(alvo, este, args);
          },
        });
      },
    });
  }, escolha);
  ctx.on('console', (m) => { if (m.text().startsWith('FBQ ')) log.fbq.push(m.text().slice(4)); });
  return {ctx, log};
}
// os generate_lead que o site empurrou pro gtag (dataLayer guarda `arguments`)
const gaLeads = (p) => p.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a)).filter((a) => a[0] === 'event' && a[1] === 'generate_lead').map((a) => a[2].event_id || '-')).catch(() => ['(fora)']);
const gaCliques = (p) => p.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a)).filter((a) => a[0] === 'event' && a[1] === 'whatsapp_click').length).catch(() => -1);
const CTA = 'a[href^="/whatsapp"]';
const clica = (p) => p.locator(CTA).filter({visible: true}).first().click({noWaitAfter: true});

(async () => {
  const b = await chromium.launch({channel: undefined, executablePath: process.env.CHROME || undefined});
  const linhas = [];
  const caso = (n, ok, d) => { console.log(`${ok ? 'OK ' : 'XX '} ${n.padEnd(44)} ${d}`); linhas.push([n, ok, d]); };

  { // 1 e 2
    const {ctx, log} = await contexto(b);
    const p = await ctx.newPage();
    await p.goto(BASE + '/', {waitUntil: 'load'});
    await p.waitForTimeout(4000);
    await clica(p); await p.waitForTimeout(2500);
    const ga = await gaLeads(p);
    caso('1. 1º clique, página carregada (~4 s)', log.fbq.length === 1 && ga.length === 1 && log.fbq[0] === `Lead ${ga[0]} pronta`, JSON.stringify({fbq: log.fbq, ga_event_id: ga}));
    const antes = log.fbq.length;
    await clica(p); await p.waitForTimeout(2500);
    caso('2. 2º clique na sessão', log.fbq.length === antes && (await gaLeads(p)).length === 1, JSON.stringify({leadsFbq: log.fbq.length, generate_lead_ga: (await gaLeads(p)).length, whatsapp_click_ga: await gaCliques(p)}));
    await ctx.close();
  }
  { // 3
    const {ctx, log} = await contexto(b);
    const p = await ctx.newPage();
    await p.goto(BASE + '/whatsapp?m=Ol%C3%A1&o=prova', {waitUntil: 'load'}).catch(() => {});
    await p.waitForTimeout(4000);
    caso('3. chegada direta ao portão, sem clique', !log.fbq.length && log.fbevents === 0, JSON.stringify({fbq: log.fbq, whatsapp_aberto: log.whats, fbevents_pedido: log.fbevents}));
    await ctx.close();
  }
  { // 4
    const {ctx, log} = await contexto(b);
    const p = await ctx.newPage();
    await p.goto(BASE + '/', {waitUntil: 'load'});
    await p.waitForTimeout(300);
    await clica(p); await p.waitForTimeout(6000);
    const ga = await gaLeads(p);
    caso('4. clique apressado (300 ms após o load)', log.fbq.length === 1 && ga.length === 1 && log.fbq[0] === `Lead ${ga[0]} pronta`, JSON.stringify({fbq: log.fbq, ga_event_id: ga}));
    await ctx.close();
  }
  { // 5
    const {ctx, log} = await contexto(b, 'recusado');
    const p = await ctx.newPage();
    await p.goto(BASE + '/', {waitUntil: 'load'});
    await p.waitForTimeout(4000);
    await clica(p); await p.waitForTimeout(2500);
    caso('5. sem consentimento (recusado)', !log.fbq.length && log.fbevents === 0 && (await gaLeads(p)).length === 0, JSON.stringify({fbq: log.fbq, fbevents_pedido: log.fbevents, generate_lead_ga: (await gaLeads(p)).length}));
    await ctx.close();
  }
  { // 6 landing de exame: o Pixel não roda ali (allowlist)
    const {ctx, log} = await contexto(b);
    const p = await ctx.newPage();
    await p.goto(BASE + LANDING, {waitUntil: 'load'});
    await p.waitForTimeout(4000);
    await clica(p); await p.waitForTimeout(2500);
    const ga = await gaLeads(p);
    caso('6. clique numa landing de exame (fora do allowlist)', !log.fbq.length && log.fbevents === 0 && ga.length === 1, JSON.stringify({fbq: log.fbq, fbevents_pedido: log.fbevents, generate_lead_ga: ga.length}));
    await ctx.close();
  }
  await b.close();
  console.log(`\n${linhas.filter((l) => l[1]).length}/${linhas.length} casos como esperado (esperado = regra nova)`);
})();
