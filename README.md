# Site Examine Agora — Imagem e Medicina

Site da **Examine Agora** (diagnóstico por imagem · Recanto das Emas, Brasília-DF),
implementado a partir do handoff de design *Eco Editorial* que está em `design/`.

Next.js 15 (App Router), TypeScript, geração estática. Sem CSS framework: a
linha visual é reproduzida com os mesmos valores dos HTML de referência.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera as 17 páginas estáticas
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
| `lib/redirects.ts` | 301 do WP antigo, derivados de `site.port_map` |
| `lib/config.ts` | Toggle da revisão clínica do RT |
| `lib/theme.ts` | Paleta Eco Editorial, grão e a ênfase em Instrument Serif |

## As 17 páginas

| Rota | Origem |
| --- | --- |
| `/` | `app/page.tsx` |
| `/procedimentos-guiados-por-ultrassom` | hub, renderer `app/[slug]/page.tsx` |
| 4 procedimentos guiados (próstata, mama, tireoide, linfonodo) | mesmo renderer |
| 7 landings de exame (morfológico, mulher, abdominal, homem, musculoesquelético, Doppler, laboratório) | mesmo renderer |
| `/preparos` `/convenios` `/sobre-nos` `/agende-seu-exame` | páginas próprias |

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
- `sitemap.xml` e `robots.txt` gerados das 17 páginas.
- Horário no `MedicalClinic`: **seg a sex 8h–18h · sáb 8h–12h** (confirmado pelo cliente em 2026-07-25).

## Migração do WordPress

`lib/redirects.ts` gera **20 redirects 301** a partir de `site.port_map`, entre eles:

- `/morfologico` → `/ultrassom-morfologico-brasilia`, `/articulacoes` → `/ultrassom-musculoesqueletico-brasilia` etc.
- `/valores` → `/convenios` (não há página de preços).
- `/resultado-on-line`, `/area-restrita`, `/conta`, `/registro`, `/login` → `/agende-seu-exame`
  (serviço de resultados online descontinuado).

Entradas do `port_map` cujo destino é a própria rota nova (`/preparos`, `/convenios`,
`/sobre-nos`, `/agende-seu-exame`, `/exames-laboratoriais`) não viram redirect —
seriam laço. A barra final é normalizada pelo próprio Next.

## Guardrails de conteúdo

O site **não** publica preços, resultados online nem conteúdo de colo do útero, e
"Doppler" vai sempre com D maiúsculo. Há um teste que varre as 17 páginas
renderizadas atrás desses termos — ver "Verificação" abaixo.

## Revisão clínica do RT

As afirmações médicas seguem **pendentes de validação do Dr. Flávio**. Enquanto
`NEXT_PUBLIC_REVISAO_CLINICA` não for `false`, as seções clínicas exibem o selo
"revisão clínica pendente". Depois do aval:

```bash
NEXT_PUBLIC_REVISAO_CLINICA=false npm run build
```

## Pendências herdadas do handoff

- **Revisão clínica do RT** — ver acima; é o que trava o go-live.
- **Foto do Dr. Flávio** — molduras "· pendente ·" na Home, nas landings e em `/sobre-nos`.
- **Fotos da clínica** — coloque os arquivos em `public/fotos/` e registre em
  `content/fotos.json`; a seção "A clínica por dentro" em `/sobre-nos` aparece sozinha.
- **Blog (21 posts do WP)** — `site.posts_wp` descreve a regra de interligação, mas o
  pacote não traz o conteúdo dos posts. Precisa do export do WordPress para migrar.
- **Páginas legais** — `/politica-de-privacidade`, `/cookies` e `/termos-de-uso` são
  "portar como estão" no port_map; o texto atual vive no WP e ainda não foi trazido.

## Verificação

```bash
npm run typecheck
npm run build
```

Com o servidor de pé (`npm start`), a varredura de guardrails e SEO:

```bash
node scripts/verifica.mjs http://localhost:3000
```

## Referências de design

`design/` guarda o pacote original intacto — os `.dc.html`, o `support.js`, o
`HANDOFF.md` e o `PROMPT.md`. É a fonte de verdade visual; não faz parte do build.
