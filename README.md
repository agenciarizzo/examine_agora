# Site Examine Agora — Imagem e Medicina

Site da **Examine Agora** (diagnóstico por imagem · Recanto das Emas, Brasília-DF),
implementado a partir do handoff de design *Eco Editorial* que está em `design/`.

Next.js 15 (App Router), TypeScript, geração estática. Sem CSS framework: a
linha visual é reproduzida com os mesmos valores dos HTML de referência.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera as 32 páginas estáticas (21 páginas + 11 posts)
npm start
```

## Fonte única de conteúdo

**`content/ea-landings.json`** — todo texto, FAQ, mitos, preparos, meta SEO,
nav, convênios (44), páginas legais e o mapa de 301.
**`content/posts.json`** — os posts do blog, gerados da migração do WordPress
(ver "Blog" abaixo); é o único arquivo de conteúdo que não se edita à mão.
**Nada de copy hardcoded fora do json**, exceto os textos que já eram fixos nos
próprios HTML de referência (títulos de seção da Home, "Em todo exame, traga",
rótulos de cartão).

Para mudar um texto do site, mude o json — não o componente.

| Arquivo | Papel |
| --- | --- |
| `lib/content.ts` | Carrega e tipa o json; helpers `href`, `waHref`, `nav`, `mapHref` |
| `lib/posts.ts` | Carrega e tipa `posts.json`; blocos do post, data longa, tema |
| `lib/meta.ts` | `<title>`, description, keywords, canonical e OG a partir do bloco `seo` |
| `lib/jsonld.ts` | Grafo JSON-LD por página (ver abaixo) |
| `lib/redirects.ts` | 301 do WP antigo, derivados de `site.port_map` e `site.port_map_posts` |
| `lib/config.ts` | IDs de medição (GA4, pixel do Meta) e o allowlist do pixel |
| `lib/theme.ts` | Paleta Eco Editorial, grão e a ênfase em Instrument Serif |

## As 32 páginas

| Rota | Origem |
| --- | --- |
| `/` | `app/page.tsx` |
| `/procedimentos-guiados-por-ultrassom` | hub, renderer `components/PaginaLanding.tsx` |
| 4 procedimentos guiados (próstata, mama, tireoide, linfonodo) | mesmo renderer |
| 7 landings de exame (morfológico, mulher, abdominal, homem, musculoesquelético, Doppler, laboratório) | mesmo renderer |
| `/preparos` `/convenios` `/sobre-nos` `/agende-seu-exame` | páginas próprias |
| `/noticias` | índice do blog, `app/noticias/page.tsx` |
| 11 posts, na raiz (`/ultrassom-das-articulacoes`…) | renderer `components/PaginaPost.tsx` |
| `/politica-de-privacidade` `/termos-de-uso` `/cookies` | renderer `components/PaginaLegal.tsx`, texto em `site.legal` |

A raiz é compartilhada por landings e posts, porque **as duas coisas já moravam
lá no WP** — os posts voltaram na URL original para não perder o que o Google já
tinha indexado. Quem decide qual renderer usar é `app/[slug]/page.tsx`, que só
despacha: landing conhecida → `PaginaLanding`, slug de post → `PaginaPost`,
resto → 404.

`PaginaLanding` reproduz `EA Landing Pagina.dc.html`: liga/desliga as seções de
procedimento (indicada, como, preparo, depois, FAQ, mitos) e a grade do hub
conforme os campos presentes no json, exatamente como os `sc-if` do design.

Rotas fora dessa lista dão 404 (`dynamicParams = false`), com uma página de erro
na linha visual do site.

## SEO

- `<title>`, description, keywords, canonical, OpenGraph e Twitter por página, do bloco `seo`.
- JSON-LD por página: `WebPage` + `MedicalClinic` sempre; `MedicalProcedure`
  (procedimentos guiados) ou `MedicalTest` (exames e laboratório) nas landings;
  `FAQPage` onde há FAQ; `BreadcrumbList` nas landings.
- Nos posts: `BlogPosting` (autor e publisher = a clínica) + `BreadcrumbList` (Início → Notícias → post).
- `sitemap.xml` e `robots.txt` gerados das 32 URLs (legais com prioridade 0.3, posts com 0.5).
- Horário no `MedicalClinic`: **seg a sex 8h–18h · sáb 8h–12h** (confirmado pelo cliente em 2026-07-25).

## Blog

Os 21 posts do WordPress vieram no export de 25/07/2026 (`migracao/`). **11 são
texto próprio da clínica e voltaram ao ar**, cada um na URL que já tinha; os
outros **10 são reprodução de terceiros** e ficaram fora, com 301 para a landing
do tema.

A divisão não é estética: os 10 excluídos trazem crédito "Fonte:" para Veja,
Veja Saúde, Crescer, Febrasgo, INCA, SBACV-RJ, Tua Saúde, tireoide.org.br e
Minha Vida — e o de mamas era um print de página inteira do Minha Vida, com o
menu, o rodapé e os iframes de anúncio deles dentro do post. Republicar isso no
domínio novo seria risco de direito autoral, conteúdo duplicado para o Google e
o oposto do E-E-A-T que o site inteiro defende ("quem assina o laudo é o Dr.
Flávio"). A lista com a fonte de cada um está em `REPRODUZIDOS`, em
`scripts/migra-wp.mjs`, e em `reproduzidos` no `posts.json`.

```bash
node scripts/migra-wp.mjs    # regera content/posts.json a partir do export
```

O conversor tira o que era do WordPress e não é conteúdo: shortcodes do
WPBakery/Impreza (`[vc_row]`, `[us_image]`), comentários HTML (havia anotação
interna de redação no meio de um post), `<span>` e `style=` de colagem do Google
Docs, `<img>` e `<iframe>`. O que sobra vira blocos tipados (`p`, `h2`, `h3`,
`ul`, `ol`, `blockquote`) com inline restrito a `a`, `strong`, `em` e `br` — é
por isso que o renderer pode usar `dangerouslySetInnerHTML` sem sustos: nada de
HTML do WP chega cru no componente.

Três coisas que o conversor arruma além da limpeza:

- **Links internos** apontavam para o WP antigo, absolutos e com barra final
  (`https://examineagora.com.br/ultrassom/`). Cada um é resolvido pelo mesmo
  mapa que gera os 301, então chega no destino novo sem salto. Link para post
  que não foi migrado vai direto para a landing do tema.
- **"Doppler" com D maiúsculo** no texto visível — e só nele: a normalização não
  encosta em `href`, senão quebraria a URL.
- **Listas escritas à mão** (parágrafos seguidos começando com hífen) viram `ul`.

Para publicar depois um post que hoje está fora: tire o slug de `REPRODUZIDOS`,
acrescente o tema em `TEMA`, tire a linha dele de `site.port_map_posts` e rode a
migração. O script falha de propósito se um post publicado ainda tiver 301 — as
duas listas não podem se cruzar.

**As imagens não vieram.** O export traz só as URLs (`wp-content/uploads/…`) e os
arquivos ficaram no servidor antigo; 20 dos 21 posts tinham imagem de destaque.
O blog foi desenhado sem imagem — cartão tipográfico no índice, artigo em coluna
de leitura — então nada quebra. Se as imagens forem recuperadas, o lugar delas é
`public/posts/<slug>.jpg`, no mesmo padrão de `public/ilustracoes/`.

## Migração do WordPress

`lib/redirects.ts` gera **38 redirects 301**, para que nenhuma URL indexada do WP
antigo caia em 404. São quatro origens:

| Origem | Nº | Exemplo |
| --- | --- | --- |
| `site.port_map` — páginas do WP | 13 | `/morfologico` → `/ultrassom-morfologico-brasilia` |
| `site.port_map_posts` — só os posts reproduzidos | 10 | `/biopsia-de-mama-linhas-gerais` → `/biopsia-de-mama-guiada-por-ultrassom` |
| `EXTRAS` — o que sobrou dos resultados online | 6 | `/area-restrita` → `/agende-seu-exame` |
| `ARQUIVOS_WP` — arquivos e feeds do WP | 9 | `/category/:slug*`, `/author/:slug*`, `/tag/:slug*`, `/feed` → `/noticias` |

Entradas do `port_map` cujo destino é a própria rota nova (`/preparos`, `/convenios`,
`/sobre-nos`, `/agende-seu-exame`, `/exames-laboratoriais`, `/noticias`) não viram
redirect — seriam laço. Foi assim que `/noticias` deixou de ser 301 e virou o
índice do blog: mudou o destino no json, o laço se desfez sozinho.

Das 36 URLs do relatório de cobertura, **17 respondem 200 no próprio endereço**
(as 11 de post migrado mais as páginas que já existiam) e 19 seguem em 301.
Nenhuma dá 404.

A barra final é normalizada pelo próprio Next, num 308 anterior ao 301: as URLs
antigas, que o Google rastreou com barra, respondem `308 → 301 → 200`. Os dois
saltos são permanentes e o buscador consolida o sinal; não dá para colapsar em um
só, porque o Next normaliza a barra antes de casar o `source` do redirect.

## Guardrails de conteúdo

O site **não** publica preços, resultados online nem conteúdo de colo do útero, e
"Doppler" vai sempre com D maiúsculo. Há um teste que varre as 20 páginas
renderizadas atrás desses termos — ver "Verificação" abaixo.

## Fotos e ilustrações

As fotos reais da clínica e as ilustrações científicas entraram no lugar dos
placeholders do handoff:

- **Retrato do RT** (`public/dr-flavio.webp`) na Home, nas 12 landings e em `/sobre-nos`.
- **Galeria "A clínica por dentro"** em `/sobre-nos`, montada a partir de
  `content/fotos.json`. Para acrescentar uma foto: arquivo em `public/fotos/`,
  entrada no json — nada de mexer em componente.
- **Ilustrações científicas** das 11 landings (`public/ilustracoes/<slug>.jpg`),
  no lugar da caixa tracejada "ilustração científica · placeholder" na seção
  "Como é realizado". Prompts e convenção de nome em
  `design/prompts-ilustracoes.md`; o componente (`components/Ilustracao.tsx`)
  degrada de volta ao placeholder textual (`p.illo`) se um slug futuro não
  tiver arquivo — nada trava se faltar imagem.

Os originais enviados pelo cliente ficam em `design/fotos-originais/` (fonte, sem
tratamento) e a marca original em `design/marca-original/`. O site usa os logos do
pacote de design (`public/ea_logo_*.png`), que são a versão fechada da marca.

Duas fotos do lote ficaram de fora, de propósito:

- `balcao-recepcao.jpeg` — o monitor do balcão exibe um portal de notícias com
  manchete política, legível na foto.
- `entrada-bandeiras.jpeg` — traz uma pessoa identificável, sem autorização de uso
  de imagem.

## Páginas legais

`/politica-de-privacidade`, `/termos-de-uso` e `/cookies` existem e estão no
rodapé de **todas** as páginas — antes davam 404, com as duas primeiras já
indexadas pelo Google.

O port_map pedia "portar como estão". O que está no ar, porém, é **texto novo**,
escrito para o site atual em cima do que o json já afirma (endereço, horário,
telefone, RT, convênios, fluxo de biópsia) e das regras que se aplicam a uma
clínica de imagem: LGPD (Lei 13.709/2018, art. 11, II, "f" para dado de saúde) e
a guarda mínima de 20 anos do prontuário (Resolução CFM 1.821/2007). Fica em
`site.legal`, com as seções tipadas em `lib/content.ts`.

O original de 2020 está no export (`migracao/`, páginas `politica-de-privacidade`,
`termos-de-uso` e `politica-de-cookies`) e foi lido antes dessa decisão, tomada
com o cliente em 16/08/2026: ele é modelo genérico de agência, manda o titular
escrever para `atendimento@agenciarizzo.com.br`, descreve formulários e e-mail
marketing que o site novo não tem e não diz uma palavra sobre dado de saúde nem
sobre guarda de prontuário — que é justamente o que uma clínica de imagem precisa
ter na política. Portá-lo literalmente seria publicar uma descrição errada das
práticas reais. Vale comparar os dois na revisão jurídica.

Antes do go-live, três coisas dependem do cliente:

1. **Revisão jurídica** do texto das três páginas.
2. **Encarregado (DPO)** — hoje o canal do titular é o mesmo da clínica (WhatsApp,
   telefone e recepção). Se houver nome e e-mail de encarregado, entram na seção
   "Como exercer os seus direitos".
3. **Cookies** — o texto declara que o site não usa medição nem publicidade, o que
   é verdade hoje. No dia em que entrar tag de Ads ou Analytics, o texto muda
   junto e passa a exigir consentimento.

## Pendências

- **Revisão jurídica** das três páginas legais, e a definição do encarregado (DPO).
- **Imagens dos posts** — ficaram no servidor antigo; ver "Blog".
- **Posts reproduzidos (10)** — decidir entre relicenciar, reescrever com texto
  próprio ou deixar como está (301 para a landing).

Três passagens dos posts migrados que valem a atenção do RT e do cliente, porque
são afirmação da casa e envelheceram:

| Onde | O quê |
| --- | --- |
| `/ultrassom-de-tireoide-diagnostico` | "Com 8 anos de experiência" — escrito em 2022; a clínica é de 2012 |
| `/quando-realizar-ultrassom-transvaginal` | "é possível […] até mesmo, diagnosticar o câncer" — o ultrassom levanta suspeita, quem fecha diagnóstico é a histopatologia |
| `/tudo-no-seu-tempo` | mensagem de Natal de 2021, com menção à pandemia; é conteúdo datado, dá para arquivar sem perda |

## Verificação

```bash
npm run typecheck
npm run build
```

Com o servidor de pé (`npm start`), a varredura de guardrails e SEO:

```bash
node scripts/verifica.mjs http://localhost:3000
```

Ela faz três passagens: as 21 páginas (guardrails, WhatsApp, RT, canonical,
JSON-LD), os 11 posts (o mesmo, mais o `BlogPosting` e o link para a landing do
tema) e as 53 URLs antigas do WP, onde a regra é uma só — nenhuma pode terminar
em 404.

Um dos guardrails foi afinado na migração do blog. A regra do cliente veda
"diagnóstico de câncer de colo do útero"; o teste barrava qualquer menção ao
termo, e isso derrubava a **medição obstétrica do colo** — comprimento cervical,
risco de parto prematuro —, que é exame que a clínica faz e aparece no post do
transvaginal. Agora o termo só reprova quando vem perto de câncer, Papanicolau,
colposcopia ou HPV, que é o que a regra veda de fato.

## Referências de design

`design/` guarda o pacote original intacto — os `.dc.html`, o `support.js`, o
`HANDOFF.md` e o `PROMPT.md`. É a fonte de verdade visual; não faz parte do build.
