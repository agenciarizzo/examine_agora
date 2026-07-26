# Prompts — ilustrações científicas das landings

11 ilustrações, uma por landing com campo `illo` no `content/ea-landings.json`.
Hoje aparecem como placeholder tracejado na seção "Como é realizado" de cada
página (`app/[slug]/page.tsx`). Estilo fixado em `design/ea-studio-config.json`
→ `illo_style`; os prompts abaixo só aplicam esse guia a cada órgão.

## Bloco fixo (repete em todo prompt)

**Estilo:** ilustração científica em vetor de linha, traço fino e uniforme,
UM elemento anatômico central, composição limpa com respiro ao redor —
o transdutor de ultrassom como elemento recorrente, tocando ou próximo da
estrutura examinada. Paleta travada em `navy #0A2A52` (linhas principais) +
`eco #1470C4` (destaque/agulha/fluxo) sobre fundo `gelo #EEF6FC` ou
transparente. Sem sombra realista, sem gradiente fotográfico, sem textura de
pele — é diagrama médico-editorial, não fotografia nem render 3D.

**Proibido (guardrail da marca, `ea-studio-config.json`):** aparelho de
ultrassom genérico ou fora de contexto; ícone de coração ou estetoscópio;
qualquer coisa que pareça tela de laudo, resultado de exame ou texto
diagnóstico legível. Nenhum texto, letra, número ou marca d'água — a peça
final entra ao lado de um parágrafo de texto do site, então a arte não pode
competir com isso.

**Proporção:** 1:1 (quadrado). A caixa que recebe a imagem no site é de
largura flexível dentro de um bloco de 760px — quadrado é o que melhor
comporta um elemento central único e ainda reaproveita em cards/grade se
precisar depois.

---

## 1 — Próstata (`prostata`)
**Arquivo:** `public/ilustracoes/prostata.png`

> Anatomia da próstata em corte sagital, com o transdutor transretal
> posicionado e o trajeto pontilhado da agulha de biópsia até o ponto-alvo
> na glândula — vetor de linha fino, navy `#0A2A52` para a anatomia, eco
> `#1470C4` para agulha e trajeto, sobre gelo `#EEF6FC` ou fundo
> transparente. UM elemento central, sem outros órgãos ao redor, bastante
> respiro. Sem sombra, sem textura de pele, sem gradiente fotográfico —
> diagrama médico-editorial de linha.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 2 — Mama (`mama`)
**Arquivo:** `public/ilustracoes/mama.png`

> Anatomia da mama em corte, com um nódulo demarcado por um contorno fino,
> o transdutor linear posicionado sobre a pele e a agulha de core biopsy em
> trajetória até o nódulo — vetor de linha fino, navy `#0A2A52` para a
> anatomia, eco `#1470C4` para agulha e nódulo, sobre gelo `#EEF6FC` ou
> fundo transparente. UM elemento central, composição limpa, sem
> caracterização de gênero ou corpo — é diagrama anatômico, não ilustração
> de pessoa.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 3 — PAAF de tireoide (`tireoide`)
**Arquivo:** `public/ilustracoes/tireoide.png`

> Glândula tireoide em vista anterior do pescoço, com um nódulo pequeno
> marcado por contorno fino e a agulha fina de PAAF guiada pelo transdutor
> posicionado sobre a região — vetor de linha fino, navy `#0A2A52` para a
> anatomia, eco `#1470C4` para agulha e nódulo, sobre gelo `#EEF6FC` ou
> fundo transparente. UM elemento central (a tireoide), sem representar
> rosto ou pescoço completo de pessoa — recorte anatômico, não retrato.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 4 — Biópsia/PAAF de linfonodo (`linfonodo`)
**Arquivo:** `public/ilustracoes/linfonodo.png`

> Região axilar com um linfonodo em destaque (contorno fino, formato
> ovalado característico) e a agulha guiada pelo transdutor posicionado
> sobre a pele — vetor de linha fino, navy `#0A2A52` para a anatomia
> envolvente, eco `#1470C4` para agulha e linfonodo, sobre gelo `#EEF6FC`
> ou fundo transparente. UM elemento central, sem outras estruturas do
> braço ou tronco além do necessário para dar contexto.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 5 — Ultrassom musculoesquelético (`musculo`)
**Arquivo:** `public/ilustracoes/musculo.png`

> Articulação do ombro em corte, com o tendão do manguito rotador
> demarcado por contorno fino e o transdutor linear posicionado sobre a
> pele em ângulo de exame dinâmico — vetor de linha fino, navy `#0A2A52`
> para osso e tendão, eco `#1470C4` para a área de interesse examinada,
> sobre gelo `#EEF6FC` ou fundo transparente. UM elemento central (a
> articulação), sem braço completo ou figura humana.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 6 — Doppler vascular (`doppler`)
**Arquivo:** `public/ilustracoes/doppler.png`

> Um vaso sanguíneo em corte longitudinal com o fluxo mapeado por setas ou
> linhas de fluxo finas dentro do vaso, e o transdutor linear posicionado
> sobre a pele acima — vetor de linha fino, navy `#0A2A52` para a parede
> do vaso, eco `#1470C4` para as linhas de fluxo, sobre gelo `#EEF6FC` ou
> fundo transparente. UM elemento central, sem representar coração nem
> sistema circulatório completo — só o segmento de vaso em exame.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo (nem gráfico de onda Doppler colorido tipo
> monitor). Proporção 1:1.

## 7 — Ultrassom morfológico (`morfologico`)
**Arquivo:** `public/ilustracoes/morfologico.png`

> Feto em perfil dentro do útero, contorno simples e delicado, com a
> medida da translucência nucal indicada por uma linha fina de referência,
> e o transdutor convexo posicionado sobre o abdome — vetor de linha fino,
> navy `#0A2A52` para o contorno fetal e uterino, eco `#1470C4` para a
> linha de medida, sobre gelo `#EEF6FC` ou fundo transparente. Traço
> delicado e afetivo, sem realismo anatômico excessivo — é uma silhueta,
> não uma imagem de ultrassom real.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo ou imagem real de ultrassom. Proporção 1:1.

## 8 — Ultrassom da mulher (`mulher`)
**Arquivo:** `public/ilustracoes/mulher.png`

> Útero e ovários em vista anterior, contorno anatômico simples, com o
> transdutor posicionado sobre o abdome — vetor de linha fino, navy
> `#0A2A52` para a anatomia, eco `#1470C4` como destaque discreto nos
> ovários, sobre gelo `#EEF6FC` ou fundo transparente. Anatomia neutra e
> genérica, sem marcar nódulo, lesão ou qualquer achado — é diagrama de
> localização, não de diagnóstico.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> qualquer indicação de patologia do colo do útero (vedado no site); sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 9 — Ultrassom abdominal (`abdominal`)
**Arquivo:** `public/ilustracoes/abdominal.png`

> Abdome superior em corte, com fígado, vesícula biliar e rins indicados
> por contornos finos simples, e o transdutor convexo posicionado sobre a
> região — vetor de linha fino, navy `#0A2A52` para os órgãos, eco
> `#1470C4` como destaque discreto num dos órgãos, sobre gelo `#EEF6FC` ou
> fundo transparente. Composição organizada, sem sobrepor demais órgãos —
> clareza acima de completude anatômica.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 10 — Ultrassom do homem (`homem`)
**Arquivo:** `public/ilustracoes/homem.png`

> Próstata e vias urinárias em corte, contorno anatômico simples, com o
> transdutor posicionado sobre o baixo abdome (via abdominal, sem
> conotação transretal aqui) — vetor de linha fino, navy `#0A2A52` para a
> anatomia, eco `#1470C4` como destaque discreto, sobre gelo `#EEF6FC` ou
> fundo transparente. UM elemento central, composição limpa.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> aparelho genérico, ícone de coração/estetoscópio ou qualquer coisa que
> pareça tela de laudo. Proporção 1:1.

## 11 — Exames laboratoriais (`laboratorio`)
**Arquivo:** `public/ilustracoes/laboratorio.png`

> Um pequeno conjunto de tubos de coleta de sangue (2–3 tubos, tampa lisa
> sem rótulo de marca) ao lado de um microscópio simplificado — vetor de
> linha fino, navy `#0A2A52` para os contornos, eco `#1470C4` como
> destaque discreto num dos tubos, sobre gelo `#EEF6FC` ou fundo
> transparente. Sem transdutor aqui (é a única ilustração fora do universo
> de ultrassom) — o par tubo+microscópio é o elemento central.
> **IMPORTANTE:** sem nenhum texto, letra, número ou marca d'água; sem
> logotipo ou marca de laboratório real; sem ícone de coração/estetoscópio
> ou qualquer coisa que pareça tela de laudo. Proporção 1:1.

---

## Convenção de nome de arquivo

Segue o padrão já usado no repo (`public/fotos/<nome>.jpg`,
`public/dr-flavio.webp`): pasta nova `public/ilustracoes/`, um arquivo por
landing, nome = **slug da página** no `ea-landings.json` — não o nome
completo do exame, para bater 1:1 com o campo `slug` e permitir automação
depois.

```
public/ilustracoes/prostata.png
public/ilustracoes/mama.png
public/ilustracoes/tireoide.png
public/ilustracoes/linfonodo.png
public/ilustracoes/musculo.png
public/ilustracoes/doppler.png
public/ilustracoes/morfologico.png
public/ilustracoes/mulher.png
public/ilustracoes/abdominal.png
public/ilustracoes/homem.png
public/ilustracoes/laboratorio.png
```

PNG com fundo transparente é a recomendação — encaixa tanto no fundo gelo
do box atual quanto em qualquer fundo futuro. Se o gerador não sustentar
transparência limpa, gerar com fundo chapado `#EEF6FC` funciona igual,
já que é o fundo que a caixa já usa hoje.

## Depois do upload

Suba os 11 arquivos com esses nomes exatos em `public/ilustracoes/` (do
jeito que já fizemos com `content/fotos.json` para as fotos da clínica) e
me avisa — eu troco a caixa tracejada "ilustração científica · placeholder"
de cada landing por essa imagem, sem tocar em mais nada da página.
