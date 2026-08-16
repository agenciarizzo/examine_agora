# Site Examine Agora — Imagem e Medicina

Site da **Examine Agora** (diagnóstico por imagem · Recanto das Emas, Brasília-DF),
implementado a partir do handoff de design *Eco Editorial* que está em `design/`.

Next.js 15 (App Router), TypeScript, geração estática. Sem CSS framework: a
linha visual é reproduzida com os mesmos valores dos HTML de referência.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera as 20 páginas estáticas
npm start
```

## Fonte única de conteúdo

**`content/ea-landings.json`** — todo texto, FAQ, mitos, preparos, meta SEO,
nav, convênios (44), mapa de 301 e a nota sobre os posts do WP.
**Nada de copy hardcoded fora do json**, exceto os textos que já eram fixos nos
próprios HTML de referência (títulos de seção da Home, "Em todo exame, traga",
rótulos de cartão).

Para mudar um texto do site, mude o json — não o componente.

| Arquivo | Papel |
| --- | --- |
| `lib/content.ts` | Carrega e tipa o json; helpers `href`, `waHref`, `nav`, `mapHref` |
| `lib/meta.ts` | `<title>`, description, keywords, canonical e OG a partir do bloco `seo` |
| `lib/jsonld.ts` | Grafo JSON-LD por página (ver abaixo) |
| `lib/redirects.ts` | 301 do WP antigo, derivados de `site.port_map` e `site.port_map_posts` |
| `lib/config.ts` | Toggle da revisão clínica do RT |
| `lib/theme.ts` | Paleta Eco Editorial, grão e a ênfase em Instrument Serif |

## As 20 páginas

| Rota | Origem |
| --- | --- |
| `/` | `app/page.tsx` |
| `/procedimentos-guiados-por-ultrassom` | hub, renderer `app/[slug]/page.tsx` |
| 4 procedimentos guiados (próstata, mama, tireoide, linfonodo) | mesmo renderer |
| 7 landings de exame (morfológico, mulher, abdominal, homem, musculoesquelético, Doppler, laboratório) | mesmo renderer |
| `/preparos` `/convenios` `/sobre-nos` `/agende-seu-exame` | páginas próprias |
| `/politica-de-privacidade` `/termos-de-uso` `/cookies` | renderer `components/PaginaLegal.tsx`, texto em `site.legal` |

O renderer único (`app/[slug]/page.tsx`) reproduz `EA Landing Pagina.dc.html`:
liga/desliga as seções de procedimento (indicada, como, preparo, depois, FAQ,
mitos) e a grade do hub conforme os campos presentes no json, exatamente como os
`sc-if` do design.

Rotas fora dessa lista dão 404 (`dynamicParams = false`), com uma página de erro
na linha visual do site.

## SEO

- `<title>`, description, keywords, canonical, OpenGraph e Twitter por página, do bloco `seo`.
- JSON-LD por página: `WebPage` + `MedicalClinic` sempre; `MedicalProcedure`
  (procedimentos guiados) ou `MedicalTest` (exames e laboratório) nas landings;
  `FAQPage` onde há FAQ; `BreadcrumbList` nas landings.
- `sitemap.xml` e `robots.txt` gerados das 20 páginas (as legais entram com prioridade 0.3).
- Horário no `MedicalClinic`: **seg a sex 8h–18h · sáb 8h–12h** (confirmado pelo cliente em 2026-07-25).

## Migração do WordPress

`lib/redirects.ts` gera **46 redirects 301**, para que nenhuma URL indexada do WP
antigo caia em 404. São quatro origens:

| Origem | Nº | Exemplo |
| --- | --- | --- |
| `site.port_map` — páginas do WP | 14 | `/morfologico` → `/ultrassom-morfologico-brasilia` |
| `site.port_map_posts` — posts do blog | 17 | `/biopsia-de-mama-linhas-gerais` → `/biopsia-de-mama-guiada-por-ultrassom` |
| `EXTRAS` — o que sobrou dos resultados online | 6 | `/area-restrita` → `/agende-seu-exame` |
| `ARQUIVOS_WP` — arquivos e feeds do WP | 9 | `/category/:slug*`, `/author/:slug*`, `/tag/:slug*`, `/feed`, `/manutencao` → `/` |

Sobre os posts: eles **não** foram migrados (falta o export do WP), mas as URLs
estavam indexadas. Cada uma vai de 301 para a landing do seu tema — que é o que
`site.posts_wp` manda fazer na interligação. Quando um post for republicado no
site, basta tirar a linha dele de `port_map_posts`.

Entradas do `port_map` cujo destino é a própria rota nova (`/preparos`, `/convenios`,
`/sobre-nos`, `/agende-seu-exame`, `/exames-laboratoriais`) não viram redirect —
seriam laço.

A barra final é normalizada pelo próprio Next, num 308 anterior ao 301: as URLs
antigas, que o Google rastreou com barra, respondem `308 → 301 → 200`. Os dois
saltos são permanentes e o buscador consolida o sinal; não dá para colapsar em um
só, porque o Next normaliza a barra antes de casar o `source` do redirect.

## Guardrails de conteúdo

O site **não** publica preços, resultados online nem conteúdo de colo do útero, e
"Doppler" vai sempre com D maiúsculo. Há um teste que varre as 20 páginas
renderizadas atrás desses termos — ver "Verificação" abaixo.

## Revisão clínica do RT

As afirmações médicas seguem **pendentes de validação do Dr. Flávio**. Enquanto
`NEXT_PUBLIC_REVISAO_CLINICA` não for `false`, as seções clínicas exibem o selo
"revisão clínica pendente". Depois do aval:

```bash
NEXT_PUBLIC_REVISAO_CLINICA=false npm run build
```

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

O port_map pedia "portar como estão", mas o texto do WP não veio no pacote e o
site antigo não está mais acessível. O que está no ar é **texto novo**, escrito
para o site atual em cima do que o json já afirma (endereço, horário, telefone,
RT, convênios, fluxo de biópsia) e das regras que se aplicam a uma clínica de
imagem: LGPD (Lei 13.709/2018, art. 11, II, "f" para dado de saúde) e a guarda
mínima de 20 anos do prontuário (Resolução CFM 1.821/2007). Fica em `site.legal`,
com as seções tipadas em `lib/content.ts`.

Antes do go-live, três coisas dependem do cliente:

1. **Revisão jurídica** do texto das três páginas.
2. **Encarregado (DPO)** — hoje o canal do titular é o mesmo da clínica (WhatsApp,
   telefone e recepção). Se houver nome e e-mail de encarregado, entram na seção
   "Como exercer os seus direitos".
3. **Cookies** — o texto declara que o site não usa medição nem publicidade, o que
   é verdade hoje. No dia em que entrar tag de Ads ou Analytics, o texto muda
   junto e passa a exigir consentimento.

## Pendências herdadas do handoff

- **Revisão clínica do RT** — ver acima; é o que trava o go-live.
- **Blog (21 posts do WP)** — `site.posts_wp` descreve a regra de interligação, mas o
  pacote não traz o conteúdo dos posts. Precisa do export do WordPress para migrar.
  Enquanto isso, as 17 URLs de post que o Google tinha indexado vão de 301 para a
  landing do tema (ver "Migração do WordPress"); as outras 4 não apareceram no
  relatório de cobertura e, se surgirem, é só acrescentar em `port_map_posts`.

## Verificação

```bash
npm run typecheck
npm run build
```

Com o servidor de pé (`npm start`), a varredura de guardrails e SEO:

```bash
node scripts/verifica.mjs http://localhost:3000
```

Ela faz duas passagens: as 20 páginas (guardrails, WhatsApp, RT, canonical,
JSON-LD) e as 49 URLs antigas do WP (port_map + posts + arquivos), onde a regra é
uma só — nenhuma pode terminar em 404.

## Referências de design

`design/` guarda o pacote original intacto — os `.dc.html`, o `support.js`, o
`HANDOFF.md` e o `PROMPT.md`. É a fonte de verdade visual; não faz parte do build.
