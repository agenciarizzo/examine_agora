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

## ✅ [A-02] O telefone continua inteiro no HTML — DECIDIDO em 2026-09-18

- **Estado:** o degrau `/whatsapp` tirou o `wa.me` de todos os arquivos servidos
  (é o que `scripts/antirobo.mjs` prova a cada build). O **telefone**, não:
  `(61) 3208-6814` aparece em texto no topbar e no rodapé, como
  `tel:+556132086814` nos botões "Ligar", e como `telephone` no JSON-LD. Nos
  sites da **EL** e da **ECOA**, o número inteiro **não existe** em arquivo
  servido — o display é montado das partes por JavaScript e o `tel:` nasce no
  clique.
- **A decisão (do cliente, 2026-09-18):** *"o maior índice de spam é com
  WhatsApp, não telefone"*. **Fica como está.** O que o site tinha de fazer
  contra spam já está feito — o link do WhatsApp não existe mais em arquivo
  servido —, e esconder o telefone cobraria os dois preços que o negócio não
  quer pagar: o **NAP** (nome, endereço, telefone é o sinal de negócio local que
  o buscador cruza com o Google Meu Negócio) e o **"Ligar"** que o cliente pediu
  em agosto para ter o mesmo peso do WhatsApp. Perder sinal de busca local para
  proteger um canal que não é o atacado seria trocar certo por incerto.
- **O que reabre este item:** spam **por ligação ou SMS** no número da clínica.
  Aí o meio-termo que preserva o SEO é manter o número **em texto** (NAP) e mover
  só o `tel:` para o clique — recupera parte da proteção sem apagar o sinal local.
- **Para os próximos sites da casa:** a régua deixa de ser "todo site esconde o
  número" e passa a ser **"esconde-se o canal que sofre o spam"**. Na EL e na
  ECOA, esconder o número inteiro não custa NAP porque lá o telefone não é o
  trilho que o cliente quis destacar; na EA, custa. Registrado em
  `docs/EA_SEO_MANUTENCAO_MAPA.md` §4, no `rizzo-os`.

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

## ✅ [C-01] `og:image` por página — FEITO em 2026-09-18

- **Estado:** as **11 landings clínicas com ilustração** têm cartão próprio
  (`public/og/<slug>.jpg`): o H1 da própria página, a ilustração dela e a linha
  do RT. Home, hub, posts, páginas do site e legais seguem no cartão
  institucional (`public/og-card.jpg`). Os 12 saem de `scripts/og-card.mjs`.
- **A decisão (do cliente, 2026-09-18):** *"faz"*. O item estava parqueado com a
  recomendação de fazer junto da próxima campanha; o cliente adiantou.
- **O hub ficou de fora de propósito:** `/procedimentos-guiados-por-ultrassom`
  é página-índice e **não tem ilustração própria**. Inventar arte só para ele
  seria copy nova (§⚖️ do `CLAUDE.md`: ausência honesta > presença defeituosa).
  Ele usa o institucional, que é o cartão certo para uma página-índice.
- **O que sustenta isso no tempo:** `scripts/verifica.mjs` confere, página a
  página, que a URL do `og:image` **responde 200** e que landing clínica **não**
  cai no cartão institucional. Provado vermelho: escondendo `og/mama.jpg`, a
  varredura reprova com `→ HTTP 404`.
- **Se entrar landing nova:** rodar `node scripts/og-card.mjs`. Esquecer disso
  não passa silencioso — o gate reprova.

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

## [M-01] A conversão do degrau depende do gtag.js carregar dentro de ~900 ms

> **Fora das seções do Padrão Rizzo (A–G) de propósito:** medição não é SEO. O
> degrau entrou nesta entrega como o terceiro pedido do cliente, e este item é a
> ponta que sobrou dele. Aberto na **revisão (F3)**, depois de o defeito
> principal ter sido medido e curado — ver o commit do `generate_lead`.

- **Estado:** o `generate_lead` agora sai pela função `gtag` de verdade, no
  formato certo e depois do `config` (medido nos 3 caminhos — link colado, aba
  nova e clique real no flutuante). Mas o **disparo pela rede** ainda depende de
  o `gtag.js` terminar de carregar antes de o degrau redirecionar, ~900 ms
  depois. O evento fica na fila do `dataLayer`, e quem esvazia a fila é o
  `gtag.js`: se ele não chegar a tempo, o documento vai embora com a fila
  cheia. Na prática o arquivo quase sempre está **quente no cache** (a mesma tag
  acabou de carregar na landing de onde o visitante veio); o caso frio é o link
  **colado direto no WhatsApp** por quem nunca abriu o site.
- **Por que não decidi:** a única forma de fechar isso é **segurar o visitante
  mais tempo no degrau** esperando o disparo confirmar (`event_callback`), e
  isso é troca de UX, não conserto: atrasa o WhatsApp do paciente para salvar um
  registro de analytics. Quem decide de que lado essa balança pende é o cliente
  — e o tempo do degrau na tela é justamente o que ele acabou de validar no
  celular.
- **Minha recomendação:** **deixar como está** e medir primeiro. O passo 7 do
  roteiro de checkpoint (GA4 → Tempo real) já dá o número real: se a contagem de
  `generate_lead` ficar muito abaixo da de `whatsapp_click`, a diferença é esta
  fila perdida — e aí vale o `event_callback` com teto de ~1,6 s, que solta o
  visitante assim que o disparo confirma e nunca segura além do teto.
- **Custo de não decidir:** baixo e visível. Não afeta o paciente em nada — o
  WhatsApp abre igual. O que se perde é contagem de conversão, e ela é
  mensurável pela própria razão `generate_lead` ÷ `whatsapp_click`.
- **Prazo sugerido:** depois da primeira semana de dados no GA4.
