#!/usr/bin/env node
/**
 * Gera os cartões de compartilhamento — a imagem que o WhatsApp, o Facebook e o
 * LinkedIn mostram quando alguém manda o link de uma página.
 *
 *   public/og-card.jpg        o cartão INSTITUCIONAL (home, hub, posts, páginas
 *                             do site e legais)
 *   public/og/<slug>.jpg      um cartão POR LANDING clínica — nome do exame e a
 *                             ilustração daquela página
 *
 * Por que por página: o link de uma landing costuma ser reencaminhado no
 * WhatsApp e é o destino da mídia paga. Com o cartão certo, quem recebe já sabe
 * de qual exame se trata antes de clicar; com o cartão único, todos os 12 links
 * chegavam com a mesma arte institucional.
 *
 * ZERO copy inventada. O cartão de cada landing usa o MESMO H1 da página
 * (`hero.h1a` + `hero.emph` em itálico + `hero.h1b`), a MESMA ilustração
 * (`public/ilustracoes/<slug>.jpg`), o selo e a linha do RT do json. O rótulo
 * de categoria vem do campo `grupo`, não de texto novo.
 *
 * O hub (`/procedimentos-guiados-por-ultrassom`) fica no cartão institucional:
 * é página-índice e não tem ilustração própria — inventar uma arte só para ele
 * seria copy nova (§⚖️ do CLAUDE.md: melhor a ausência honesta).
 *
 * Não faz parte do `npm run build`: roda à mão quando a arte muda.
 *
 *   npx playwright@1.56 install chromium   # só na primeira vez
 *   node scripts/og-card.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p, tipo) => `data:${tipo};base64,${readFileSync(join(raiz, p)).toString('base64')}`;

/** O grão dos panos escuros, o mesmo de `lib/theme.ts`. */
const GRAIN = readFileSync(join(raiz, 'lib/theme.ts'), 'utf-8').match(/GRAIN =\s*\n?\s*"([^"]+)"/)[1];

const db = JSON.parse(readFileSync(join(raiz, 'content/ea-landings.json'), 'utf-8'));
const { selo, rt_line: rt } = db.clinica;

/** Rótulo de categoria, derivado do `grupo` do json — não é copy nova. */
const CATEGORIA = { proc: 'Procedimento guiado', exame: 'Exame de imagem', lab: 'Laboratório' };

/** A chamada do cartão institucional é a MESMA da home (`app/page.tsx`). */
const INSTITUCIONAL = { a: 'Ultrassom e biópsia guiada', e: 'no seu bairro', b: '' };

const LOGO = b64('public/ea_logo_light.png', 'image/png');

const base = `
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:'Schibsted Grotesk',system-ui,sans-serif;background:#061423;color:#fff;position:relative}
.grao{position:absolute;inset:0;background:url("${GRAIN}");opacity:.5;mix-blend-mode:overlay;pointer-events:none;z-index:3}
.wrap{position:relative;z-index:2;height:100%;padding:62px 70px;display:flex;flex-direction:column;justify-content:space-between}
/*
 * ATENCAO: o align-self:flex-start NAO e enfeite. O .wrap e um flex em COLUNA, e
 * num flex column o align-items:stretch padrao estica o item na LARGURA,
 * atropelando o width:auto da imagem. Sem esta linha o logo saia 3,43x mais
 * largo que o arquivo (744x42 em vez de 217x42), e os 12 cartoes foram ao ar
 * assim ate o cliente enxergar. A trava contra a volta disso e a medicao da
 * proporcao do logo, no fim do render().
 */
.logo{height:52px;width:auto;align-self:flex-start;display:block}
h1{font-weight:500;line-height:1.0;letter-spacing:-.025em;text-wrap:balance}
h1 em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:#A9D6F5}
.pe{display:flex;align-items:center;gap:12px;font-size:20px;color:#A9D6F5;font-weight:500;margin-top:24px}
.rt{font-size:15px;color:rgba(169,214,245,.72);margin-top:10px}
`;

/** Cartão institucional: foto real da recepção sob o véu navy. */
function institucional() {
  return `<style>
${base}
.foto{position:absolute;inset:0;background:url('${b64('public/fotos/recepcao-mezanino.jpg', 'image/jpeg')}') center 38% / cover}
.veu{position:absolute;inset:0;background:linear-gradient(100deg,#061423 0%,#061423 46%,rgba(6,20,35,.93) 58%,rgba(10,42,82,.72) 100%)}
h1{font-size:74px;max-width:15ch}
</style>
<div class="foto"></div><div class="veu"></div><div class="grao"></div>
<div class="wrap">
  <img class="logo" src="${LOGO}" alt="">
  <div class="bloco">
    <h1>${INSTITUCIONAL.a} <em>${INSTITUCIONAL.e}</em></h1>
    <div class="pe">${selo.split(' · ').join(' <span style="opacity:.5">·</span> ')}</div>
    <div class="rt">${rt}</div>
  </div>
</div>`;
}

/** Cartão de landing: o H1 da própria página + a ilustração dela. */
function landing(p) {
  return `<style>
${base}
.wrap{width:62%}
/*
 * A ilustração entra como PAINEL EMOLDURADO, do mesmo jeito que a landing a
 * mostra (components/Ilustracao.tsx: fundo gelo, borda fina azul, raio 8).
 * A primeira tentativa esfumava a arte sobre o navy e produzia uma faixa
 * leitosa no meio do cartão — desenho novo onde o site já tem gramática.
 * Quadrado porque as ilustrações são 1024×1024: cabe inteira, sem corte.
 */
.arte{position:absolute;right:66px;top:105px;width:420px;height:420px;z-index:1;border-radius:8px;
  border:1px solid rgba(20,112,196,.18);background:#EEF6FC url('${b64(`public/ilustracoes/${p.slug}.jpg`, 'image/jpeg')}') center/cover;
  box-shadow:0 18px 50px rgba(6,20,35,.45)}
.olho{font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#A9D6F5;font-weight:700;margin-bottom:14px}
h1{font-size:56px;max-width:14ch}
</style>
<div class="arte"></div><div class="grao"></div>
<div class="wrap">
  <img class="logo" src="${LOGO}" alt="">
  <div class="bloco">
    <div class="olho">${CATEGORIA[p.grupo]}</div>
    <h1>${p.hero.h1a} <em>${p.hero.emph}</em>${p.hero.h1b ? ' ' + p.hero.h1b : ''}</h1>
    <div class="pe">${selo.split(' · ').slice(1).join(' <span style="opacity:.5">·</span> ')}</div>
    <div class="rt">${rt}</div>
  </div>
</div>`;
}

const doc = (corpo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;700&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
</head><body>${corpo}</body></html>`;

/** As landings que ganham cartão próprio: as que têm ilustração (o hub não tem). */
const comArte = db.pages.filter((p) => p.tipo === 'landing' && !p.hub && p.hero);

const { chromium } = await import('playwright').catch(() => {
  console.error('[og-card] playwright não está instalado. `npm i -D playwright` ou rode com o global.');
  process.exit(1);
});

const temp = join(tmpdir(), 'ea-og-card.html');
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
mkdirSync(join(raiz, 'public/og'), { recursive: true });

const falhas = [];

async function render(corpo, saida, rotulo) {
  writeFileSync(temp, doc(corpo));
  await pagina.goto('file://' + temp, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  for (const fonte of ["16px 'Schibsted Grotesk'", "16px 'Instrument Serif'"]) {
    const ok = await pagina.evaluate((f) => document.fonts.check(f), fonte);
    if (!ok) throw new Error(`[og-card] fonte não carregou: ${fonte} — o cartão sairia com fonte errada.`);
  }

  /*
   * Auto-ajuste: encolhe o H1 até o bloco caber na moldura. O título mais longo
   * da leva ("Biópsia de linfonodo axilar guiada por ultrassom") tem o dobro de
   * caracteres do mais curto, e cartão com texto estourando a borda é pior que
   * cartão nenhum. O piso é 40px — abaixo disso não se lê no celular, e aí a
   * geração REPROVA em vez de entregar ilegível.
   */
  const medida = await pagina.evaluate(() => {
    const h1 = document.querySelector('h1');
    const wrap = document.querySelector('.wrap');
    const limite = () => wrap.scrollHeight <= wrap.clientHeight;
    let px = parseFloat(getComputedStyle(h1).fontSize);
    while (!limite() && px > 40) {
      px -= 2;
      h1.style.fontSize = px + 'px';
    }
    const r = document.querySelector('.bloco').getBoundingClientRect();
    return { px, coube: limite(), fundo: Math.round(r.bottom), topo: Math.round(r.top) };
  });
  if (!medida.coube) falhas.push(`${rotulo}: o texto não cabe nem a 40px`);
  if (medida.fundo > 630 || medida.topo < 0) falhas.push(`${rotulo}: bloco fora da moldura (${medida.topo}–${medida.fundo})`);

  /*
   * O logo tem de sair com a proporção do ARQUIVO. Deformar a marca do cliente
   * é o tipo de defeito que passa por três revisões sem ninguém ver — este
   * passou, e foi o cliente que viu. Tolerância de 1%: acima disso, reprova.
   */
  const logo = await pagina.evaluate(() => {
    const el = document.querySelector('.logo');
    const r = el.getBoundingClientRect();
    return { render: r.width / r.height, arquivo: el.naturalWidth / el.naturalHeight, w: Math.round(r.width), h: Math.round(r.height) };
  });
  const desvio = Math.abs(logo.render / logo.arquivo - 1);
  if (desvio > 0.01) {
    falhas.push(
      `${rotulo}: logo DEFORMADO — ${logo.w}×${logo.h} (proporção ${logo.render.toFixed(3)}) ` +
        `contra ${logo.arquivo.toFixed(3)} do arquivo, ${(logo.render / logo.arquivo).toFixed(2)}× esticado`,
    );
  }

  await pagina.screenshot({ path: join(raiz, saida), type: 'jpeg', quality: 88 });
  console.log(`  ${saida}  ·  H1 ${medida.px}px  ·  logo ${logo.w}×${logo.h}`);
}

console.log('[og-card] gerando:');
await render(institucional(), 'public/og-card.jpg', 'institucional');
for (const p of comArte) await render(landing(p), `public/og/${p.slug}.jpg`, p.slug);

await navegador.close();
rmSync(temp, { force: true });

if (falhas.length) {
  console.error(`\n[og-card] ${falhas.length} falha(s):`);
  for (const f of falhas) console.error('  ✗', f);
  process.exit(1);
}
console.log(`[og-card] ${comArte.length + 1} cartões gerados (1200×630).`);
