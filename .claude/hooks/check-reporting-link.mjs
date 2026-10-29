#!/usr/bin/env node
// Trava do vínculo Reporting Ninja — GATILHO 1, "no push" (RELATORIOS_API_MAPA.md §12.3 e §12.5).
//
// O card mensal de Manutenção é preenchido no dia 1 pelo Reporting Ninja; sem vínculo ativo da
// fonte, ele sai OCO e ninguém é avisado. E cliente com campanha precisa do menu Campanhas aberto
// no app. Este script pergunta ao RizzoOS (RPC `check_reporting_link`, só-leitura, só EQUIPE) o que
// falta pro(s) cliente(s) e imprime. O gatilho 2 (o do servidor, dias 25–31) é a
// `reporting_link_guard` no Supabase — este aqui é o lembrete na hora do push.
//
// ARQUIVO AUTOSSUFICIENTE (zero dependência, Node 18+): o repo de site de cliente copia ESTE
// arquivo literal pra `.claude/hooks/check-reporting-link.mjs` (docs/templates/settings_site_cliente.json).
// Melhoria entra AQUI, nunca só na cópia.
//
// Uso:
//   node scripts/check-reporting-link.mjs --client RF          sigla/slug (repetível ou "RF,AG")
//   node scripts/check-reporting-link.mjs --repo agenciarizzo/inmed
//   node scripts/check-reporting-link.mjs                      descobre: repo de site → pelo origin;
//                                                              rizzo-os → siglas de breadcrumb da branch
//   ... --hook   modo PostToolUse: lê o JSON do harness no stdin, só age em `git push`, imprime o JSON
//                do hook (additionalContext pro agente + systemMessage pro humano). Nunca falha o push.
//   ... --json   saída crua da RPC.
//
// Credencial: o usuário de EQUIPE do agente (mesmo caminho do scripts/ads.mjs):
//   RIZZO_SUPABASE_ANON_KEY (ou VITE_SUPABASE_ANON_KEY) · RIZZO_AGENT_EMAIL · RIZZO_AGENT_PASSWORD.
//   A RPC NÃO é anon de propósito: a anon key é pública e a resposta diz quais clientes a casa tem.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SUPABASE_URL = process.env.RIZZO_SUPABASE_URL || 'https://dpxcrdzgouqusvyqjivl.supabase.co';
const MAPA = 'RELATORIOS_API_MAPA.md §12';

// ── núcleo puro (testado em scripts/check-reporting-link.test.mjs) ──────────────────────────────

/** O comando Bash é um `git push`? Aceita `git -C dir push`, encadeado com && e afins. */
export function isGitPush(command) {
    if (typeof command !== 'string') return false;
    return /(^|[\s;&|(])git(\s+-[Cc]\s+\S+)*\s+push(\s|$)/.test(command);
}

const semAspas = (s) => s.replace(/^(['"])(.*)\1$/, '$2');

/**
 * Em que diretório o push roda: o `git -C <dir>` do próprio push ou o último `cd <dir>` antes dele.
 * null = o diretório da sessão. Sem isto, `cd /home/user/bb && git push` (outro repo, na mesma sessão)
 * era conferido contra o rizzo-os e cobrava o cliente do último breadcrumb de lá (medido em 2026-10-09:
 * push do site da BB avisou do RF; docs/BB_NOVOS_MEDICOS_MAPA.md §4.11).
 */
export function pushDir(command) {
    if (!isGitPush(command)) return null;
    const m = command.match(/(^|[\s;&|(])git((?:\s+-[Cc]\s+\S+)*)\s+push(\s|$)/);
    const c = [...m[2].matchAll(/-C\s+(\S+)/g)].pop();
    if (c) return semAspas(c[1]);
    const antes = command.slice(0, m.index + m[1].length);
    const cds = [...antes.matchAll(/(?:^|[;&|(])\s*cd\s+("[^"]*"|'[^']*'|[^\s;&|)]+)/g)];
    return cds.length ? semAspas(cds[cds.length - 1][1]) : null;
}

/**
 * Siglas de cliente citadas em breadcrumb (`XX › Tronco › fatia`, CLAUDE.md §🗣️-4).
 * Só 2 letras maiúsculas ASCII: `ΛΠ` (o hangar) e `ALL` ficam de fora por construção.
 * Só o 1º segmento de cada linha é escopo: em `ΛΠ › Trilha por IA › x`, o "IA" é o fim
 * do nome do tronco, não sigla (falso aviso medido em 2026-10-03, RELATORIOS_API_MAPA §12.5.2-D10).
 */
export function siglasFromText(text) {
    const out = new Set();
    if (typeof text !== 'string') return [];
    for (const line of text.split('\n')) {
        const seta = line.indexOf('›');
        if (seta < 0) continue;
        const m = line.slice(0, seta).match(/(?:^|[^A-Za-z0-9])([A-Z]{2})\s*$/);
        if (m) out.add(m[1]);
    }
    return [...out];
}

/** `https://github.com/o/r.git` · `git@github.com:o/r` · proxy local → `o/r` (minúsculo). */
export function repoSlug(remoteUrl) {
    if (typeof remoteUrl !== 'string' || !remoteUrl.trim()) return null;
    const clean = remoteUrl.trim().replace(/\.git$/i, '').replace(/\/+$/, '');
    const m = clean.match(/[/:]([^/:]+)\/([^/:]+)$/);
    return m ? `${m[1]}/${m[2]}`.toLowerCase() : null;
}

/** Rótulo curto de uma falta (o resumo de 1 linha que o humano vê). */
export function faltaCurta(sigla, f) {
    const oque = {
        sem_vinculo: `${f.rotulo} sem vínculo`,
        nao_responde: `${f.rotulo} não responde`,
        menu_fechado: 'menu Campanhas fechado',
        menu_sem_dado: 'menu Campanhas sem dado',
    }[f.falta] ?? `${f.rotulo ?? f.fonte} ${f.falta}`;
    return `${sigla} ${oque}`;
}

/** Linha legível de uma falta devolvida pela RPC. */
export function faltaLine(sigla, f) {
    const quando = f.publish_date ? ` (card «${f.card}», ${String(f.publish_date).slice(8, 10)}/${String(f.publish_date).slice(5, 7)})` : '';
    switch (f.falta) {
        case 'sem_vinculo':
            return `• ${sigla} — ${f.rotulo}: SEM vínculo ativo no Reporting Ninja${quando}. O card sai oco no dia 1.`;
        case 'nao_responde':
            return `• ${sigla} — ${f.rotulo}: vínculo gravado mas NÃO responde${quando}. ${f.detalhe ?? ''}`.trim();
        case 'menu_fechado':
        case 'menu_sem_dado': {
            const falta = String(f.detalhe ?? '').match(/Falta: (.*?)\. Abrir só/);
            const estado = f.falta === 'menu_fechado' ? 'fechado' : 'aberto sem o dado da campanha';
            return `• ${sigla} — menu Campanhas ${estado}${quando}.${falta ? ` Falta: ${falta[1]}.` : ''}`;
        }
        default:
            return `• ${sigla} — ${f.rotulo ?? f.fonte}: ${f.falta}${quando}`;
    }
}

/**
 * Monta o relatório a partir das respostas da RPC (uma por cliente).
 * Devolve { faltas, curtas, avisos, ok } (string[]) — `faltas` é o que o agente leva
 * pro 🏁 FECHAMENTO; `avisos` é o que impediu a checagem (nunca silêncio).
 */
export function buildReport(results) {
    const faltas = [];
    const curtas = [];
    const avisos = [];
    const ok = [];
    for (const { busca, res, erro } of results) {
        if (erro) { avisos.push(`• ${busca}: não consegui checar — ${erro}`); continue; }
        if (!res || res.ok !== true) {
            const motivo = res?.motivo ?? 'resposta inesperada';
            if (motivo === 'cliente_nao_encontrado') {
                avisos.push(`• ${busca}: nenhum cliente com essa sigla/slug/repo. Repo de site? Grave o repo no cadastro: clients.config_json.site.repo = "<owner>/<repo>".`);
            } else if (motivo === 'ambiguo') {
                const c = (res.candidatos ?? []).map((x) => `${x.sigla} (${x.nome})`).join(', ');
                avisos.push(`• ${busca}: ambíguo entre ${c} — rode com --client <sigla>.`);
            } else {
                avisos.push(`• ${busca}: ${motivo}`);
            }
            continue;
        }
        const sigla = res.cliente?.sigla ?? busca;
        if (res.cliente && res.cliente.ativo === false) { ok.push(`• ${sigla}: cliente inativo — nada a cobrar.`); continue; }
        const lista = Array.isArray(res.faltas) ? res.faltas : [];
        if (lista.length === 0) {
            const n = Array.isArray(res.cards) ? res.cards.length : 0;
            ok.push(`• ${sigla}: tudo certo${n ? ` (${n} card(s) de Manutenção até ${String(res.ate).slice(8, 10)}/${String(res.ate).slice(5, 7)} com vínculo)` : ' (sem card de Manutenção na janela)'}.`);
            continue;
        }
        for (const f of lista) { faltas.push(faltaLine(sigla, f)); curtas.push(faltaCurta(sigla, f)); }
    }
    return { faltas, curtas, avisos, ok };
}

/** O JSON que o harness espera de um hook PostToolUse (ou null = não diz nada). */
export function hookPayload(report) {
    const { faltas, avisos, curtas = [] } = report;
    if (faltas.length === 0 && avisos.length === 0) return null;
    const partes = [];
    if (faltas.length) {
        partes.push(`🔒 Trava do vínculo Reporting Ninja (${MAPA}) — o que falta pro(s) cliente(s) deste push:`,
            ...faltas,
            'Leve CADA falta pro 🏁 FECHAMENTO como item 🧪 humano ("conectar <fonte> no app do Reporting Ninja" / "abrir o menu Campanhas quando o dado estiver pronto"). Não criar vínculo nem abrir menu por conta própria.');
    }
    if (avisos.length) partes.push('⚠️ Trava do vínculo — não deu pra checar:', ...avisos);
    const resumo = faltas.length
        ? `🔒 Reporting Ninja: ${faltas.length} falta(s) — ${curtas.join(' · ')}`
        : '⚠️ Trava do vínculo Reporting Ninja não conseguiu checar este push';
    return {
        systemMessage: resumo,
        hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: partes.join('\n') },
    };
}

// ── I/O ────────────────────────────────────────────────────────────────────────────────────────

function git(args, cwd) {
    try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch { return ''; }
}

/** De onde tirar o(s) cliente(s) quando ninguém passou --client/--repo. */
export function discoverTargets(cwd) {
    const slug = repoSlug(git(['remote', 'get-url', 'origin'], cwd));
    if (slug && !slug.endsWith('/rizzo-os')) return [{ repo: slug }];
    // rizzo-os: o cliente está no breadcrumb dos commits da branch e no vNEXT do CHANGELOG.
    const base = git(['merge-base', 'HEAD', 'origin/main'], cwd);
    if (!base) return [];
    const log = git(['log', `${base}..HEAD`, '--format=%s%n%b'], cwd);
    const changelog = git(['diff', `${base}`, 'HEAD', '--', 'CHANGELOG.md'], cwd)
        .split('\n').filter((l) => l.startsWith('+### vNEXT')).join('\n');
    return siglasFromText(`${log}\n${changelog}`).map((sigla) => ({ client: sigla }));
}

async function login(anonKey) {
    const email = process.env.RIZZO_AGENT_EMAIL || '';
    const password = process.env.RIZZO_AGENT_PASSWORD || '';
    if (!anonKey || !email || !password) {
        throw new Error('credencial do agente ausente (RIZZO_SUPABASE_ANON_KEY + RIZZO_AGENT_EMAIL + RIZZO_AGENT_PASSWORD nas variáveis da sessão — docs/GOOGLE_ADS_EDICAO_AGENTE_MAPA.md §2)');
    }
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) throw new Error(`login do agente falhou (${res.status})`);
    return data.access_token;
}

async function rpc(anonKey, token, args) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_reporting_link`, {
        method: 'POST',
        headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`RPC ${res.status}: ${data?.message ?? 'sem corpo'}`);
    return data;
}

export async function checkTargets(targets) {
    const anonKey = process.env.RIZZO_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    let token;
    try { token = await login(anonKey); }
    catch (e) { return targets.map((t) => ({ busca: t.client ?? t.repo, erro: e.message })); }
    const out = [];
    for (const t of targets) {
        const busca = t.client ?? t.repo;
        try {
            const res = await rpc(anonKey, token, t.client ? { p_cliente: t.client } : { p_repo: t.repo });
            out.push({ busca, res });
        } catch (e) {
            out.push({ busca, erro: e.message });
        }
    }
    return out;
}

function parseArgs(argv) {
    const a = { clients: [], repo: null, hook: false, json: false };
    for (let i = 0; i < argv.length; i++) {
        const v = argv[i];
        if (v === '--hook') a.hook = true;
        else if (v === '--json') a.json = true;
        else if (v === '--client') a.clients.push(...String(argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean));
        else if (v === '--repo') a.repo = argv[++i] ?? null;
    }
    return a;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    let cwd = process.cwd();

    if (args.hook) {
        let input = {};
        try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* stdin vazio/ruim: não é push */ }
        if (!isGitPush(input?.tool_input?.command)) return;
        cwd = resolve(input.cwd || process.env.CLAUDE_PROJECT_DIR || cwd, pushDir(input.tool_input.command) ?? '.');
    }

    const targets = args.clients.length
        ? args.clients.map((client) => ({ client }))
        : args.repo ? [{ repo: args.repo }] : discoverTargets(cwd);

    if (targets.length === 0) {
        if (!args.hook) console.log('Nenhum cliente pra checar: passe --client <sigla> (no rizzo-os, a sigla vem do breadcrumb "XX ›" dos commits da branch).');
        return;
    }

    const results = await checkTargets(targets);
    if (args.json) { console.log(JSON.stringify(results, null, 2)); return; }

    const report = buildReport(results);
    if (args.hook) {
        const payload = hookPayload(report);
        if (payload) process.stdout.write(JSON.stringify(payload));
        return;
    }
    for (const l of [...report.faltas, ...report.avisos, ...report.ok]) console.log(l);
    if (report.faltas.length) console.log(`\n→ Levar ao 🏁 FECHAMENTO como 🧪 item humano (${MAPA}).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    main().catch((e) => {
        // No modo hook, nunca derrubar a sessão: o push já aconteceu.
        if (process.argv.includes('--hook')) {
            process.stdout.write(JSON.stringify(hookPayload({ faltas: [], avisos: [`• erro inesperado: ${e.message}`] })));
            return;
        }
        console.error(e.message);
        process.exitCode = 1;
    });
}
