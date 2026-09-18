#!/usr/bin/env node
/**
 * Gera `public/og-card.jpg` — o cartão que o WhatsApp, o Facebook e o
 * LinkedIn mostram quando alguém compartilha uma página do site.
 *
 * O cartão é montado a partir dos ativos do próprio repo (foto da recepção,
 * logo, grão e paleta), renderizado em Chromium a 1200×630 e salvo como JPEG.
 * Ele existe como script, e não só como binário commitado, para que trocar a
 * foto ou a chamada seja uma edição legível — e não um arquivo que ninguém
 * sabe de onde veio.
 *
 * Não faz parte do `npm run build`: roda à mão quando a arte muda.
 *
 *   npx playwright@1.56 install chromium   # só na primeira vez
 *   node scripts/og-card.mjs
 *
 * ⚠️ O cartão é GLOBAL: vale para as 32 páginas. O ideal do padrão da casa é
 * um por página (`opengraph-image.tsx` com `next/og`, uma rota por vez) —
 * está em PARKING.md [C-01], com a recomendação.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p, tipo) => `data:${tipo};base64,${readFileSync(join(raiz, p)).toString('base64')}`;

/** O grão dos panos escuros, o mesmo de `lib/theme.ts`. */
const GRAIN = readFileSync(join(raiz, 'lib/theme.ts'), 'utf-8').match(/GRAIN =\s*\n?\s*"([^"]+)"/)[1];

/** A chamada é a MESMA da home (`app/page.tsx`) — cartão não inventa copy. */
const CHAMADA = ['Ultrassom e biópsia guiada', 'no seu bairro'];

const db = JSON.parse(readFileSync(join(raiz, 'content/ea-landings.json'), 'utf-8'));
const { selo, rt_line: rt } = db.clinica;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;700&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:'Schibsted Grotesk',system-ui,sans-serif;background:#061423;color:#fff;position:relative}
.foto{position:absolute;inset:0;background:url('${b64('public/fotos/recepcao-mezanino.jpg', 'image/jpeg')}') center 38% / cover}
.veu{position:absolute;inset:0;background:linear-gradient(100deg,#061423 0%,#061423 46%,rgba(6,20,35,.93) 58%,rgba(10,42,82,.72) 100%)}
.grao{position:absolute;inset:0;background:url("${GRAIN}");opacity:.5;mix-blend-mode:overlay}
.wrap{position:relative;height:100%;padding:62px 70px;display:flex;flex-direction:column;justify-content:space-between}
.logo{height:46px;width:auto;display:block}
h1{font-size:74px;font-weight:500;line-height:.98;letter-spacing:-.03em;max-width:15ch;text-wrap:balance}
em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:#A9D6F5}
.pe{display:flex;align-items:center;gap:14px;font-size:21px;color:#A9D6F5;font-weight:500;margin-top:26px}
.ponto{width:7px;height:7px;border-radius:99px;background:#A9D6F5;opacity:.7}
.rt{font-size:16px;color:rgba(169,214,245,.72);margin-top:12px}
</style></head><body>
<div class="foto"></div><div class="veu"></div><div class="grao"></div>
<div class="wrap">
  <img class="logo" src="${b64('public/ea_logo_light.png', 'image/png')}" alt="">
  <div>
    <h1>${CHAMADA[0]} <em>${CHAMADA[1]}</em></h1>
    <div class="pe">${selo
      .split(' · ')
      .map((t, i) => (i === 1 ? `<i class="ponto"></i><span>${t}` : `<span>${t}`))
      .join(' · ')
      .replace(/<span>([^<]*)$/, '<span>$1</span>')}</div>
    <div class="rt">${rt}</div>
  </div>
</div></body></html>`;

const { chromium } = await import('playwright').catch(() => {
  console.error('[og-card] playwright não está instalado. `npm i -D playwright` ou rode com o global.');
  process.exit(1);
});

const temp = join(tmpdir(), 'ea-og-card.html');
writeFileSync(temp, html);
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.goto('file://' + temp, { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
for (const fonte of ["16px 'Schibsted Grotesk'", "16px 'Instrument Serif'"]) {
  const ok = await pagina.evaluate((f) => document.fonts.check(f), fonte);
  if (!ok) throw new Error(`[og-card] fonte não carregou: ${fonte} — o cartão sairia com fonte errada.`);
}
await pagina.screenshot({ path: join(raiz, 'public/og-card.jpg'), type: 'jpeg', quality: 88 });
await navegador.close();
rmSync(temp, { force: true });
console.log('[og-card] public/og-card.jpg gerado (1200×630).');
