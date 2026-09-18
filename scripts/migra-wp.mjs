#!/usr/bin/env node
/**
 * Migração do blog do WordPress → `content/posts.json`.
 *
 * Lê o WXR em `migracao/` e converte os posts que são texto próprio da clínica.
 * Os 10 posts reproduzidos de terceiros (crédito "Fonte:" para Veja, Crescer,
 * INCA, Minha Vida etc.) NÃO entram: seguem em 301 para a landing do tema, por
 * decisão do cliente — direito autoral, conteúdo duplicado e E-E-A-T. A lista
 * deles fica em `REPRODUZIDOS`, para o dia em que forem relicenciados ou
 * reescritos.
 *
 * O que a limpeza tira: shortcodes do WPBakery/Impreza (`[vc_row]`, `[us_image]`),
 * comentários HTML (havia anotação interna de redação no meio do texto), `<img>`
 * e `<iframe>` (as imagens ficaram no servidor antigo, ver README), `<span>` e
 * `style=` de colagem do Google Docs. O que sobra vira blocos tipados, com
 * inline restrito a `a`, `strong`, `em` e `br`.
 *
 * Uso:  node scripts/migra-wp.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const WXR = join(raiz, 'migracao', 'examineagora.WordPress.20260725.xml');
const SAIDA = join(raiz, 'content', 'posts.json');

/** Reproduções de terceiros — ficam fora do site, com 301 para a landing. */
const REPRODUZIDOS = {
  'nodulos-tireoidianos-respeito-e-bom-e-eles-gostam': 'Veja',
  'ultrassom-o-que-e-como-e-feito-e-para-que-serve': 'Veja Saúde',
  'ultrassom-na-gravidez-quantos-a-gravida-tem-que-fazer': 'Crescer',
  'biopsia-de-mama-linhas-gerais': 'Febrasgo',
  'como-a-covid-19-causa-trombose': 'Veja Saúde',
  'a-importancia-do-mapeamento-no-doppler-venoso-superficial-dos-membros-inferiores-para-o-tratamento-das-varizes':
    'SBACV-RJ',
  'entenda-a-puncao-aspirativa-com-agulha-fina-paaf': 'tireoide.org.br',
  'cancer-de-prostata': 'INCA',
  'o-que-e-o-doppler-de-carotidas-quando-e-indicado-e-como-e-feito': 'Tua Saúde',
  'ultrassom-de-mamas-quando-e-indicado-e-o-que-o-exame-detecta': 'Minha Vida',
};

/** Post → landing do tema. É a interligação que `site.posts_wp` pede. */
const TEMA = {
  'ultrassonografia-ajudar-rastreio-pre-eclampsia': 'morfologico',
  'o-que-e-o-ultrassom-morfologico': 'morfologico',
  'ultrassom-morfologico-guia-completo-bebe': 'morfologico',
  'quando-realizar-ultrassom-transvaginal': 'mulher',
  'ultrassom-abdominal-no-diagnostico-de-doencas': 'abdominal',
  'ultrassom-das-articulacoes': 'musculo',
  'importancia-do-exame-de-ultrassonografia-vascular-com-doppler-colorido': 'doppler',
  'quando-realizar-ultrassonografia-do-aparelho-reprodutor-masculino': 'homem',
  'ultrassom-de-tireoide-diagnostico': 'tireoide',
  // O texto é sobre rastreio por ultrassom em homens 50+, não sobre a biópsia.
  'cancer-de-prostata-ultrassom-diagnostico': 'homem',
  'tudo-no-seu-tempo': 'sobre',
};

// --- XML mínimo: os itens do WXR ------------------------------------------
const xml = readFileSync(WXR, 'utf8');

function pedacos(tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  return [...xml.matchAll(re)].map((m) => m[1]);
}

function campo(item, tag) {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(item);
  if (!m) return '';
  const v = m[1];
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(v);
  return cdata ? cdata[1] : desentidade(v);
}

function desentidade(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

const escapa = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- limpeza do HTML do WP -------------------------------------------------
function limpa(html) {
  return (
    html
      // anotações internas de redação viviam em comentário HTML
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // shortcodes do WPBakery/Impreza
      .replace(/\[\/?(?:vc_|us_)[^\]]*\]/g, ' ')
      // mídia: as imagens ficaram no servidor antigo
      .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
      .replace(/<(img|iframe)\b[^>]*>(?:[\s\S]*?<\/\1>)?/gi, ' ')
      // colagem de editor: spans e divs sem semântica
      .replace(/<\/?(?:span|div|section|article|header|nav|footer)\b[^>]*>/gi, '')
      .replace(/&nbsp;/g, ' ')
  );
}

const INLINE = { a: 'a', strong: 'strong', b: 'strong', em: 'em', i: 'em', br: 'br' };
const BLOCO = /^(p|h[2-6]|ul|ol|blockquote)$/;

/**
 * Links internos apontavam para o WP antigo (absolutos, com barra final e para
 * rotas que morreram). Resolve cada um para o caminho novo, pelo mesmo mapa que
 * gera os 301 — link interno bom é o que chega sem salto.
 */
const ea = JSON.parse(readFileSync(join(raiz, 'content', 'ea-landings.json'), 'utf8'));
const caminhoDe = Object.fromEntries(ea.pages.map((p) => [p.slug, p.path]));
const caminhos = new Set(ea.pages.map((p) => p.path));
const semBarra = (s) => (s.replace(/\/+$/, '') === '' ? '/' : s.replace(/\/+$/, ''));

const MAPA = new Map();
for (const { de, para } of [...ea.site.port_map, ...(ea.site.port_map_posts ?? [])]) {
  if (!de.startsWith('/') || de.includes(' ') || de.includes('|')) continue;
  if (caminhoDe[para]) MAPA.set(semBarra(de), caminhoDe[para]);
}
/** A âncora dizia a seção do exame; a seção virou landing própria. */
const ANCORAS = { '/ultrassom#abdominal': '/ultrassom-abdominal-brasilia' };

const naoResolvidos = new Set();

function resolveHref(bruto) {
  const href = desentidade(bruto).trim();
  if (/^(mailto:|tel:)/i.test(href)) return href;
  const interno = href.replace(/^https?:\/\/(?:www\.)?examineagora\.com\.br/i, '');
  if (/^https?:/i.test(interno)) return interno; // externo de verdade
  if (!interno.startsWith('/')) return null;

  const [caminho, hash] = interno.split('#');
  const p = semBarra(caminho);
  const comHash = hash ? `${p}#${hash}` : p;
  if (ANCORAS[comHash]) return ANCORAS[comHash];
  if (TEMA[p.slice(1)]) return p; // post migrado, na URL original
  if (caminhos.has(p)) return p + (hash ? `#${hash}` : '');
  if (MAPA.has(p)) return MAPA.get(p);
  naoResolvidos.add(interno);
  return '/';
}

/** Reduz o inline ao permitido; o resto vira texto escapado. */
function inline(html) {
  let out = '';
  let i = 0;
  const re = /<(\/?)(\w+)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    // "Doppler" com D maiúsculo só no texto — nunca dentro de href.
    out += doppler(escapa(desentidade(html.slice(i, m.index))));
    i = m.index + m[0].length;
    const [, fecha, bruto, attrs] = m;
    const tag = INLINE[bruto.toLowerCase()];
    if (!tag) continue;
    if (tag === 'br') {
      out += '<br />';
    } else if (fecha) {
      out += `</${tag}>`;
    } else if (tag === 'a') {
      const href = resolveHref(/href="([^"]*)"/.exec(attrs)?.[1] ?? '');
      if (!href) continue;
      const externo = /^https?:/i.test(href);
      out += `<a href="${escapa(href)}"${externo ? ' target="_blank" rel="noopener"' : ''}>`;
    } else {
      out += `<${tag}>`;
    }
  }
  out += doppler(escapa(desentidade(html.slice(i))));
  return out.replace(/\s+/g, ' ').replace(/<(strong|em)>\s*<\/\1>/g, '').trim();
}

/** HTML do WP → blocos tipados. */
function blocos(html) {
  const limpo = limpa(html);
  const saida = [];

  const solto = (texto) => {
    // Trechos sem <p>: o WP resolvia com wpautop, aqui a linha em branco separa.
    for (const par of texto.split(/\n\s*\n/)) {
      const h = inline(par);
      if (h) saida.push({ t: 'p', html: h });
    }
  };

  const re = /<(p|h[2-6]|ul|ol|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let i = 0;
  let m;
  while ((m = re.exec(limpo))) {
    solto(limpo.slice(i, m.index));
    i = m.index + m[0].length;
    const tag = m[1].toLowerCase();
    const dentro = m[2];
    if (tag === 'ul' || tag === 'ol') {
      const itens = [...dentro.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => inline(li[1]))
        .filter(Boolean);
      if (itens.length) saida.push({ t: tag, itens });
    } else if (BLOCO.test(tag)) {
      const h = inline(dentro);
      // h4/h5/h6 do WP viram h3: a hierarquia do site é h1 → h2 → h3.
      const t = tag === 'p' || tag === 'blockquote' ? tag : tag <= 'h3' ? tag : 'h3';
      if (h) saida.push({ t, html: h });
    }
  }
  solto(limpo.slice(i));
  return agrupaHifens(saida);
}

/**
 * No WP havia lista escrita à mão: parágrafos seguidos começando com hífen.
 * Vira `ul` de verdade — o leitor de tela agradece, e o CSS do site já sabe
 * desenhar lista.
 */
function agrupaHifens(blocos) {
  const HIFEN = /^\s*[-–—]\s+/;
  const saida = [];
  let corrente = null;
  for (const b of blocos) {
    if (b.t === 'p' && HIFEN.test(b.html)) {
      const item = b.html.replace(HIFEN, '');
      if (corrente) corrente.itens.push(item);
      else saida.push((corrente = { t: 'ul', itens: [item] }));
      continue;
    }
    corrente = null;
    saida.push(b);
  }
  // Hífen solto não é lista: devolve o parágrafo como estava.
  return saida.map((b) =>
    b.t === 'ul' && b.itens.length === 1 ? { t: 'p', html: `— ${b.itens[0]}` } : b,
  );
}

/** "Doppler" vai sempre com D maiúsculo (guardrail do projeto). */
function doppler(s) {
  return s.replace(/\bdoppler\b/g, 'Doppler');
}

const texto = (b) =>
  (b.html ?? (b.itens ?? []).join(' '))
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

function corta(s, max) {
  if (s.length <= max) return s;
  const fatia = s.slice(0, max);
  return fatia.slice(0, fatia.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…';
}

/**
 * Título de SEO por post — curado, porque o título editorial do WordPress não
 * cabe no `<title>`.
 *
 * Os 11 títulos vieram do WP com 56 a 99 caracteres; somados a " | Examine
 * Agora" (16), dez deles estouravam os 60 que o Google mostra, e o que o
 * paciente lia na busca terminava em reticências no meio da frase. O padrão da
 * casa é ≤ 60 com a palavra-chave ANTES do separador.
 *
 * O título editorial (`titulo`, que vira o `<h1>` e o cartão do índice) NÃO
 * muda: só o `<title>` é reescrito. A tabela mora aqui, e não em
 * `content/posts.json`, porque o json é gerado — valor curado fora daqui
 * morreria na próxima migração.
 *
 * Post novo sem entrada aqui cai no padrão `${titulo} | Examine Agora`, e a
 * trava logo abaixo reprova a geração se isso passar de 60.
 */
const TITULOS_SEO = {
  'ultrassom-morfologico-guia-completo-bebe': 'Ultrassom morfológico: guia completo',
  'cancer-de-prostata-ultrassom-diagnostico': 'Câncer de próstata: o papel do ultrassom',
  'importancia-do-exame-de-ultrassonografia-vascular-com-doppler-colorido':
    'Doppler colorido: o exame vascular explicado',
  'quando-realizar-ultrassom-transvaginal': 'Ultrassom transvaginal: quando fazer',
  'o-que-e-o-ultrassom-morfologico': 'Ultrassom morfológico na gravidez',
  'ultrassom-das-articulacoes': 'Ultrassom das articulações: o que saber',
  'ultrassom-de-tireoide-diagnostico': 'Ultrassom de tireoide no diagnóstico',
  'quando-realizar-ultrassonografia-do-aparelho-reprodutor-masculino':
    'Ultrassom do aparelho reprodutor masculino',
  'ultrassom-abdominal-no-diagnostico-de-doencas': 'Ultrassom abdominal: o que o exame detecta',
  'ultrassonografia-ajudar-rastreio-pre-eclampsia': 'Ultrassom no rastreio da pré-eclâmpsia',
};

/** Limite do `<title>`: o que o Google mostra sem cortar. */
const TETO_TITLE = 60;

// --- monta os posts --------------------------------------------------------
const itens = pedacos('item').filter(
  (i) => campo(i, 'wp:post_type') === 'post' && campo(i, 'wp:status') === 'publish',
);

/**
 * `<title>` do post: o curado quando existe, senão o editorial com a marca.
 * Reprova a geração acima de `TETO_TITLE` — é a trava que impede um post novo
 * de voltar a nascer com 99 caracteres.
 */
function tituloSeo(slug, titulo) {
  const t = TITULOS_SEO[slug]
    ? `${TITULOS_SEO[slug]} | Examine Agora`
    : `${titulo} | Examine Agora`;
  if (t.length > TETO_TITLE) {
    throw new Error(
      `<title> com ${t.length} caracteres (teto ${TETO_TITLE}) em "${slug}": ` +
        'escreva o título curto em TITULOS_SEO.',
    );
  }
  return t;
}

const posts = [];
const fora = [];

for (const item of itens) {
  const slug = campo(item, 'wp:post_name');
  const titulo = doppler(campo(item, 'title').trim());
  if (REPRODUZIDOS[slug]) {
    fora.push({ slug, fonte: REPRODUZIDOS[slug] });
    continue;
  }
  const tema = TEMA[slug];
  if (!tema) throw new Error(`post sem tema mapeado: ${slug}`);

  const bs = blocos(campo(item, 'content:encoded'));
  if (!bs.length) throw new Error(`post sem conteúdo após a limpeza: ${slug}`);

  const corrido = bs.map(texto).join(' ').replace(/\s+/g, ' ').trim();
  const lead = texto(bs.find((b) => b.t === 'p') ?? bs[0]);

  posts.push({
    slug,
    titulo,
    data: campo(item, 'wp:post_date').slice(0, 10),
    atualizado: (campo(item, 'wp:post_modified') || campo(item, 'wp:post_date')).slice(0, 10),
    tema,
    min: Math.max(1, Math.round(corrido.split(/\s+/).length / 200)),
    lead: corta(lead, 190),
    seo: {
      title: tituloSeo(slug, titulo),
      description: corta(lead.replace(/\s+/g, ' '), 155),
      waMsg: `Olá! Li o artigo "${corta(titulo, 60)}" no site e quero agendar um exame.`,
    },
    blocos: bs,
  });
}

posts.sort((a, b) => (a.data < b.data ? 1 : -1));

/**
 * Trava contra deriva entre as duas listas: quem foi publicado não pode ter
 * 301 (apagaria a página que acabou de voltar), e quem ficou fora precisa ter.
 */
const com301 = new Set(
  (ea.site.port_map_posts ?? []).map((m) => semBarra(m.de).slice(1)),
);
for (const p of posts) {
  if (com301.has(p.slug)) {
    throw new Error(`post publicado mas ainda com 301 em port_map_posts: ${p.slug}`);
  }
}
for (const { slug } of fora) {
  if (!com301.has(slug)) {
    throw new Error(`reprodução sem 301 em port_map_posts: ${slug}`);
  }
}

const db = {
  schema: 'ea-posts',
  gerado_de: 'migracao/examineagora.WordPress.20260725.xml',
  gerado_por: 'scripts/migra-wp.mjs',
  nota:
    'Posts de texto próprio da clínica, migrados do WP nas URLs originais. As reproduções de terceiros ficaram fora (301 para a landing do tema) — ver REPRODUZIDOS no script e o README. As imagens de destaque ficaram no servidor antigo e não vieram no export.',
  reproduzidos: fora,
  posts,
};

writeFileSync(SAIDA, JSON.stringify(db, null, 1));

console.log(`posts migrados: ${posts.length}  ·  fora (reprodução): ${fora.length}`);
for (const p of posts) {
  console.log(`  ${p.data}  ${String(p.blocos.length).padStart(2)} blocos  ${p.min} min  /${p.slug}`);
}
if (naoResolvidos.size) {
  console.log('\nlinks internos sem destino no site novo (foram para "/"):');
  for (const l of naoResolvidos) console.log('  ', l);
}
