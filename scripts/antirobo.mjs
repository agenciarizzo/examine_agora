#!/usr/bin/env node
/**
 * Prova da proteção antirrobô — roda DENTRO do `npm run build`.
 *
 * Por que dentro do build: uma regressão que não reprova o build vira deploy
 * no dia seguinte e ninguém vê. O site continua funcionando perfeitamente — só
 * a proteção deixa de existir. É uma falha silenciosa, e este arquivo é o
 * alarme.
 *
 * Confere o que é SERVIDO (o `.next/`), nunca o código-fonte: o número pode
 * estar bonitinho em partes no `lib/whatsapp.ts` e mesmo assim sair colado no
 * pacote final depois que o empacotador junta tudo. Varre o HTML pré-renderado
 * (onde mora a carga do React, que repete a árvore inteira) e o JavaScript que
 * o navegador baixa.
 *
 * ⚠️ O que este teste NÃO proíbe, e é decisão registrada, não esquecimento:
 * o telefone da clínica aparece em texto e em `tel:` no HTML. É NAP — nome,
 * endereço e telefone —, o sinal de negócio local que o buscador lê, e o
 * "Ligar" que o cliente pediu para destacar. A proteção desta casa mira o
 * `wa.me`, que é o que o spam de WhatsApp colhe. Ver PARKING [A-02].
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const saida = resolve(raiz, '.next');

if (!existsSync(saida)) {
  console.error('[antirobo] .next/ não existe. Rode o build antes.');
  process.exit(1);
}

/** O número inteiro, montado aqui do mesmo jeito que o site monta. */
const NUMERO = ['55', '61', '3208', '6814'].join('');

const falhas = [];
const exigir = (regra, ok, onde) => ok || falhas.push(`${regra} — ${onde}`);

function arquivos(dir, filtro, acc = []) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const cheio = resolve(dir, item.name);
    if (item.isDirectory()) arquivos(cheio, filtro, acc);
    else if (filtro(cheio)) acc.push(cheio);
  }
  return acc;
}

/** O que um robô consegue baixar: o HTML pré-renderado e o JS do navegador. */
const html = existsSync(resolve(saida, 'server/app'))
  ? arquivos(resolve(saida, 'server/app'), (f) => f.endsWith('.html'))
  : [];
const js = existsSync(resolve(saida, 'static'))
  ? arquivos(resolve(saida, 'static'), (f) => /\.(js|css)$/.test(f))
  : [];

exigir('o build não gerou HTML pré-renderado', html.length > 0, '.next/server/app');
exigir('o build não gerou pacote de navegador', js.length > 0, '.next/static');

for (const caminho of [...html, ...js]) {
  const nome = relative(saida, caminho);
  const texto = readFileSync(caminho, 'utf-8');

  // 1 · A REGRA-MÃE: nenhum link de WhatsApp já resolvido em arquivo servido.
  //     Proibir o domínio `wa.me` sozinho erraria o alvo — sem número depois
  //     dele, um varredor não leva nada.
  exigir('link wa.me já resolvido (com número)', !/wa\.me\/\d/.test(texto), nome);

  // 2 · e o domínio só pode aparecer no pedaço do degrau, que é o único lugar
  //     onde montar o link é legítimo. Se `wa.me` reaparecer em outro arquivo,
  //     algum CTA voltou a falar direto com o WhatsApp.
  exigir(
    'wa.me fora do degrau (algum CTA voltou a montar o link)',
    !texto.includes('wa.me') || nome.split(sep).join('/').includes('whatsapp'),
    nome,
  );
}

for (const caminho of js) {
  const nome = relative(saida, caminho);
  // 3 · o número contíguo não entra no pacote do navegador. No HTML ele
  //     aparece de propósito (NAP, `tel:`); no JavaScript, nunca — é de lá que
  //     um varredor colheria sem precisar renderizar nada.
  exigir('número da clínica contíguo no pacote do navegador', !readFileSync(caminho, 'utf-8').includes(NUMERO), nome);
}

// 4 · o degrau existe mesmo, e declara noindex.
const degrau = html.find((f) => /whatsapp\.html$/.test(f));
exigir('a rota /whatsapp não foi pré-renderada', Boolean(degrau), '.next/server/app/whatsapp.html');
if (degrau) {
  const t = readFileSync(degrau, 'utf-8');
  exigir('o degrau /whatsapp não declara noindex', /noindex/.test(t), 'whatsapp.html');
}

console.log(
  `[antirobo] ${html.length} páginas e ${js.length} arquivos de navegador varridos.`,
);
if (falhas.length) {
  console.error(`\n[antirobo] ${falhas.length} falha(s):`);
  for (const f of falhas) console.error('  ✗', f);
  process.exit(1);
}
console.log('[antirobo] nenhum link de WhatsApp resolvido em arquivo servido.');
