# CLAUDE.md — Site Examine Agora

> **Template padrão da Agência Rizzo pra repo de site de cliente** (fonte: rizzo-os → [`docs/SITES_CLIENTE_MULTIREPO_MAPA.md`](https://github.com/agenciarizzo/rizzo-os/blob/main/docs/SITES_CLIENTE_MULTIREPO_MAPA.md)). Preencher SÓ o cabeçalho; **não inchar este arquivo** — ele é injetado em toda sessão de agente deste repo, cada linha custa token em cada conversa.

## Identidade

- **Cliente:** `Examine Agora — Imagem e Medicina` (`diagnóstico por imagem e laboratório · Recanto das Emas, Brasília-DF`) · **Prod:** `https://examineagora.com.br` · **Vercel:** `ea` · **Stack:** `Next.js 15 (App Router), páginas estáticas`
- **A `main` publica sozinha** (medido em 12/11/2026, no squash do #24: o deploy saiu `target: "production"` com o domínio, sem passo manual). Depois do squash, conferir em examineagora.com.br. Se um deploy da `main` voltar a sair `target: null`, o branch de produção mudou: redeploy como produção (`create_deployment` com `deploymentId` e `target: "production"`) e avisar (rizzo-os → `docs/NOVEMBRO_AZUL_2026_MAPA.md` §9).
- **Doc-mapa da frente** (fonte da verdade do trabalho, "o que falta e por onde retomo"): repo `agenciarizzo/rizzo-os` → `docs/EA_SEO_MANUTENCAO_MAPA.md` (o site); a medição do WhatsApp no Ads, `docs/ADS_CONVERSAO_HONESTA_MAPA.md` §3 (índice-mestre: `MAPAS.md` de lá).

## Fonte da verdade dos DADOS do cliente — CONSULTAR, nunca colar

- Planejamento estratégico, cadastro, pack visual moram no **Supabase do RizzoOS** (projeto `dpxcrdzgouqusvyqjivl` — tabelas `strategic_planning`, `clients`, `visual_design_pack`), lidos **via MCP na hora**. Dado colado neste repo/prompt envelhece e vira mentira; a regra é LER fresco.
- ⚠️ Este site pode ter **Supabase PRÓPRIO** (conteúdo do site) — **não confundir** os projetos: dado do cliente = projeto do RizzoOS; conteúdo da página = o daqui.
- **NUNCA inventar dado do cliente** (telefone, endereço, CRM/RQE, convênio, depoimento, e-mail). Faltou → placeholder explícito + parquear no doc-mapa.

## Esteira (igual à casa)

- Branch → commits pequenos → PR draft → **build Vercel verde** → squash na `main`. **Aditivo > reescrita**; proibido "passar a vassoura" (reflow/rename fora da entrega).
- **Toda conversa de trabalho fecha com o bloco `🏁 FECHAMENTO`** — STATUS na 1ª linha: ✅ TERMINOU (foi até o fim) · ⏭️ TEM MAIS (próximo prompt PRONTO, colável) · 🧪 CHECKPOINT EQUIPE RIZZO (ação sensível: roteiro de teste + prompt de retorno). "Falar por alto" que sobrou coisa = violação. (Regra da casa: rizzo-os → `CLAUDE.md` §🏁.)

## Regras de site (aprendidas a custo real — não rediscutir)

- **Site que precisa rankear NUNCA vira SPA client-side** (SSG/SSR sempre) — o site da agência perdeu 91% das impressões assim. Site novo (export do AI Studio) nasce direto pelo **molde**: `scaffold/site-cliente/` no rizzo-os (`README.md` = runbook, `REGUA.md` = manutenção vs. frente própria).
- **Conteúdo aprovado pelo cliente — texto da página, `<title>` e meta description — NÃO muda sem a equipe ver antes → depois, ANTES do merge** (Rizzo, 2026-09-30: *"sem mexer no conteúdo sem me falar, pois foi aprovado pelo cliente"*). Mudança técnica (rota, schema, pré-renderização) prova que o texto visível ficou idêntico; SEO que pede texto novo vai pro `PARKING.md` com a proposta escrita.
- **Handoff de design do cliente (Claude Design, AI Studio) é ordem dele.** Divergiu do `src/content` (número, texto, bloco)? **Quiz na hora** (`AskUserQuestion`, tudo junto) — nunca descartar em silêncio nem decidir sozinho (rizzo-os `casos §22`).
- **URL antiga com lastro se RECRIA na MESMA URL** — redirect pra assunto diferente é soft-404; 301 só com inventário de URLs.
- **LGPD/CFM:** sem superlativo/autopromoção vedada, sem depoimento/antes-e-depois de paciente, política de privacidade **factual** (canal de contato real, nunca e-mail inventado). Na dúvida jurídica → 🧪 CHECKPOINT, não decidir sozinho.
- **Voz V1: sem travessão nem meia-risca no texto público** (texto, faixa do topo, alt, JSON-LD; pausa forte = ponto, fraca = vírgula · rizzo-os `docs/VOZ_CONTEUDO_V2_MAPA.md`) **e sem linha órfã** (medida em 360/390/1024/1440 px · skill `seo-manutencao` §K-9); porte de canvas passa por ela antes do merge.
- **Medição** (GA4/Pixel/GCLID) só roda em produção; **token/credencial NUNCA no repo** — env var do Vercel.

## RizzoOS (repo `agenciarizzo/rizzo-os`) — anexar SÓ quando a ação pede

- Precisa ler/atualizar o doc-mapa, buscar pack/asset da casa, ou registrar fechamento → `add_repo` na hora (funciona no meio da sessão). **Anexar por padrão não compensa:** não lê o repo inteiro, mas injeta o CLAUDE.md grande dele em toda mensagem desta sessão.
