# Handoff — Site Examine Agora (Eco Editorial · 2026-07-25)

Implementação do site completo da **Examine Agora** (diagnóstico por imagem · Recanto das Emas, Brasília-DF) sobre o WordPress existente (`examineagora.com.br`). Design fechado na matriz RizzoOS; este pacote é a fonte da verdade.

## Fonte única de conteúdo
**`ea-landings.json`** — TODO o texto, FAQ, mitos, preparos, meta SEO (title/description/kw), spec JSON-LD (MedicalProcedure + FAQPage + MedicalClinic), nav (`site.nav`), convênios (44), mapa 301 (`site.port_map`) e posts do blog a manter (`site.posts_wp`). Nada de copy hardcoded fora do json.

## Páginas (17)
- **Home** — `EA Site Home.dc.html`
- **Procedimentos guiados** — hub + biópsia de próstata, biópsia de mama, PAAF de tireoide, biópsia/PAAF de linfonodo (renderer único `EA Landing Pagina.dc.html`, prop `slug`)
- **Landings de exame** — morfológico, ultrassom da mulher, abdominal, ultrassom do homem, musculoesquelético, Doppler vascular, exames laboratoriais
- **Apoio** — Preparos, Convênios, Sobre, Agende
- Índice interno com tabela SEO + migração: `EA Landings.dc.html` (referência, não publica)

Os `.dc.html` abrem direto no navegador (manter `support.js` e `public/` ao lado) — são o design de referência pixel a pixel.

## Decisões fechadas
- **Horário CONFIRMADO pelo cliente (2026-07-25): seg a sex 8h–18h · sáb 8h–12h** — já alinhado no json, no studio-config e no pack.
- **Float de WhatsApp** fixo em todas as páginas (bottom-right, `#25D366`, 58px, link `wa.me/556132086814` + `?text=` da página). Já presente nos HTML de referência.
- **301** de TODA URL do WP antigo via `site.port_map`. Área restrita/resultados online morre no 301 (serviço descontinuado). Sem página de preços (Valores → Convênios). Sem conteúdo de colo do útero.
- Blog: 21 posts do WP permanecem como artigos interlinkados (`site.posts_wp`).
- RT em todo rodapé: Dr. Flávio H. A. Chaves · CRM-DF 19506 · RQE 11288.

## Pendências (não bloqueiam implementação)
- Fotos reais da clínica/equipe (hoje banco de imagens).

## Linha visual (Eco Editorial)
Campo `#061423` · navy `#0A2A52` · eco `#1470C4` · céu `#A9D6F5` · gelo `#EEF6FC`. Schibsted Grotesk (400/500/700) + Instrument Serif itálico. Panos por seção (campo hero · gelo · setor branco · varredura navy · halo · eco); uma tipografia grande demais por seção; rodapé mudo. Logos em `public/`.
