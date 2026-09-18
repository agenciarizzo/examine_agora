# PARKING — Site Examine Agora

> O que a manutenção de SEO **não** decidiu entra aqui, com o estado medido e a
> recomendação já escrita — nunca em prosa solta no chat. O que foi decidido e
> aplicado está nos commits e no `README.md`. Frente e plano:
> `docs/EA_SEO_MANUTENCAO_MAPA.md`, no repo `agenciarizzo/rizzo-os`.
>
> Aberto em **2026-09-18**, na manutenção de SEO + degrau antirrobô.

---

## [A-01] apex × www: o host canônico NÃO foi medido

- **Estado:** o site declara `examineagora.com.br` (apex) nos cinco sinais —
  canonical, `og:url`, `<loc>` do sitemap, `Sitemap:` do robots e os `@id` do
  JSON-LD — e eles são consistentes **entre si**, porque todos derivam de
  `clinica.site`. O que não foi possível é a medição que decide se o apex é o
  host certo: `curl -sIL https://examineagora.com.br/` e a versão `www`
  responderam **403 no CONNECT** — a política de egresso deste ambiente bloqueia
  o domínio do cliente (mesma parede que o site da FZ encontrou em 17/09).
- **Por que não decidi:** canonical apontando para o host que redireciona é o
  defeito nº 1 da casa em site de cliente, e chutar apex × www é exatamente o
  jeito de criá-lo. Consistência interna não prova que o alvo está certo.
- **Minha recomendação:** rodar por fora, de qualquer máquina com rede aberta:
  `curl -sIL https://examineagora.com.br/ | grep -i '^location'` e o mesmo com
  `www.`. Se o servidor entregar `www`, o valor de `clinica.site` muda em **um
  lugar só** e os cinco sinais acompanham sozinhos. Alternativa estrutural:
  liberar o domínio na política de rede do ambiente, que destrava de uma vez a
  medição de host, o crawl do conteúdo e a conferência de indexação.
- **Custo de não decidir:** se o servidor redirecionar para `www`, **toda URL
  do sitemap redireciona e a canonical rebate** — o sinal que o Google recebe é
  jogado fora. Enquanto ninguém mede, não dá para saber se isso está
  acontecendo hoje.
- **Prazo sugerido:** antes da próxima rodada de mídia paga.

## [A-02] O telefone continua inteiro no HTML — e isso diverge da EL e da ECOA

- **Estado:** o degrau `/whatsapp` tirou o `wa.me` de todos os arquivos
  servidos (é o que `scripts/antirobo.mjs` prova a cada build). O **telefone**,
  não: `(61) 3208-6814` aparece em texto no topbar e no rodapé, e como
  `tel:+556132086814` nos botões "Ligar" — além de `telephone` no JSON-LD. Nos
  sites da **EL** e da **ECOA**, o número inteiro **não existe** em arquivo
  servido: o display é montado das partes por JavaScript e o `tel:` nasce no
  clique.
- **Por que não decidi sozinho:** os dois lados têm razão, e a diferença é de
  negócio, não técnica. **A favor de esconder:** um varredor que colha números
  brasileiros ainda consegue tentar o WhatsApp deste número — o degrau protege
  o link, não o número. **A favor de manter:** (a) o telefone é **NAP** (nome,
  endereço, telefone), o sinal de negócio local que o buscador lê e cruza com o
  Google Meu Negócio, e esconder atrás de JavaScript o entrega pior; (b) o
  cliente pediu, em agosto, que o **"Ligar" ganhasse o mesmo peso do WhatsApp**
  — o topbar existe por causa disso; (c) na EA, WhatsApp e ligação são **a
  mesma linha**, então a decisão cobra pedágio nos dois canais de uma vez.
- **Minha recomendação:** **manter como está** e revisar se aparecer spam de
  voz/ligação (não de WhatsApp). Se o cliente quiser esconder mesmo assim, o
  meio-termo que preserva o SEO é manter o número **em texto** (NAP) e mover só
  o `tel:` para o clique — recupera parte da proteção sem apagar o sinal local.
- **Custo de não decidir:** baixo e reversível. Nenhum dos dois caminhos trava
  nada.
- **Pergunta para o cliente:** a proteção da EL/ECOA foi decisão de padrão
  ("todo site da casa esconde o número") ou resposta a um spam específico
  daquelas clínicas? A resposta muda a régua para os próximos sites.

## [A-03] Barra final na home: quem decide é o Next, não o repo

- **Estado:** a home sai como `https://examineagora.com.br`, **sem** barra
  final, no canonical, no `og:url` e no `<loc>` do sitemap — os três de acordo.
  Medido nesta manutenção: forçar a barra na origem (`absolute('/')`) mudava
  **só o sitemap**, porque o Next normaliza as URLs de metadado segundo o
  `trailingSlash: false` do `next.config.ts`. Ou seja, a "correção" **criava** a
  divergência que ela queria tirar.
- **Por que não decidi:** as duas formas são a mesma URL para qualquer
  rastreador (caminho vazio normaliza para `/`), e mexer em canonical de home
  tem risco maior que o ganho.
- **Minha recomendação:** deixar como está. Se um dia a casa quiser a barra, o
  lugar é `trailingSlash: true` no `next.config.ts` — que muda o servidor **e**
  o metadado juntos, e aí vale reconferir os 124 redirects do WP.
- **Custo de não decidir:** nenhum.
- **Prazo sugerido:** não tem.

## [C-01] `og:image` é um cartão global, não um por página

- **Estado:** o site passou de **zero** cartão para **um**, global, gerado por
  `scripts/og-card.mjs` (foto real da recepção + chamada da home + RT). O
  padrão da casa pede um **por página** quando a stack tem `next/og` — e tem:
  o site é Next 15.
- **Por que não decidi:** cartão por página é obra, não ajuste: precisa de uma
  rota `opengraph-image.tsx` com as fontes da marca carregadas no build (o
  `next/og` não lê Google Fonts por link, tem de embutir o arquivo da fonte), e
  de uma decisão de arte por grupo de página — landing de exame, post e página
  legal não pedem o mesmo cartão. Entregar isso meia-boca produziria 32
  cartões piores que o único bom que está no ar agora.
- **Minha recomendação:** fazer em fatia própria, começando pelas **12 landings
  clínicas** (que são as que recebem mídia paga): cartão com o nome do exame
  sobre a ilustração que a própria landing já usa. Posts e páginas legais
  seguem no cartão global.
- **Custo de não decidir:** o compartilhamento das 12 landings mostra a mesma
  arte — funciona, mas não diz qual exame o link abre.
- **Prazo sugerido:** junto da próxima campanha.

## [D-01] JSON-LD sem `GeoCoordinates`

- **Estado:** a `MedicalClinic` declara `PostalAddress`, `areaServed`,
  `openingHoursSpecification` e `hasMap`, mas **não** `geo`. O padrão da casa
  pede coordenadas no perfil de saúde.
- **Por que não decidi:** **não existe fonte.** O cadastro do cliente no
  RizzoOS (`public.clients`) tem `address` e `address_number`, e **nenhuma
  coluna de latitude/longitude** — conferido por consulta ao banco nesta
  manutenção. Coordenada inventada é pior que coordenada ausente: manda o
  paciente para a porta errada.
- **Minha recomendação:** pegar o par exato do **Google Meu Negócio** da
  clínica (o mesmo perfil que responde pela busca local) e colar em
  `clinica.geo` no json — `lib/jsonld.ts` passa a emitir `geo` em uma linha.
  Enquanto não vier, fica sem.
- **Custo de não decidir:** perda pequena e indireta: `geo` ajuda o buscador a
  casar a clínica com a busca "perto de mim", mas endereço + `hasMap` já
  cobrem a maior parte.
- **Prazo sugerido:** próxima manutenção.

## [F-01] As 12 landings servem HTML de 113 a 119 KB (teto do padrão: 100 KB)

- **Estado medido:** `/biopsia-de-prostata-brasilia` = **119,4 KB**, e as 11
  outras landings entre 113 e 118. A composição do arquivo, medida na maior
  delas: **76,1 KB são a carga do React** (`self.__next_f`, a árvore
  serializada de novo dentro do HTML), 18,6 KB são `style=` inline e 12,4 KB o
  JSON-LD. As páginas do site e os posts ficam abaixo do teto.
- **Por que não decidi:** a causa é o estilo inline do site inteiro — que o
  Next serializa **duas vezes**, no atributo e na carga. Curar é mover estilo
  inline para classe em todos os componentes: vassoura grande, arriscada e
  fora do escopo de uma manutenção de SEO, com chance real de mudar a linha
  visual que o cliente já aprovou.
- **Minha recomendação:** fatia própria, começando pelo `PaginaLanding.tsx`
  (que sozinho responde pelas 12 páginas fora do teto). Meta: tirar os ~37 KB
  de estilo duplicado. Enquanto isso, o número não é dramático — é HTML, não
  bloqueia renderização, e o site não carrega framework de CSS nem biblioteca
  de terceiros.
- **Custo de não decidir:** alguns quilobytes a mais no primeiro byte em 12
  páginas. Não afeta indexação.
- **Prazo sugerido:** quando houver uma fatia de performance.

## [F-02] As provas existem, mas nada as roda sozinho no pull request

- **Estado:** `scripts/antirobo.mjs` roda dentro do `npm run build` (logo, roda
  na Vercel e reprova o deploy). Já `scripts/verifica.mjs` — que é onde moram os
  gates de `<title>`, `description`, `<h1>`, `alt`, `og:image`,
  `BreadcrumbList`, `Physician`, guardrails de conteúdo e as 53 URLs antigas —
  **precisa do site de pé** e só roda quando alguém lembra. O repo não tem
  `.github/workflows`.
- **Por que não decidi:** montar CI é decisão de infraestrutura do repo (e de
  custo de minutos), não de SEO.
- **Minha recomendação:** um workflow simples — `npm ci` → `npm run build` →
  `npm start &` → `node scripts/verifica.mjs http://localhost:3000` — em cada
  pull request. É o mesmo comando que esta manutenção rodou à mão.
- **Custo de não decidir:** os gates viram documentação. Uma regressão de
  metadado ou de JSON-LD volta sem ninguém ver — que é exatamente o estado em
  que esta manutenção encontrou o site.
- **Prazo sugerido:** próxima entrega que tocar o repo.
