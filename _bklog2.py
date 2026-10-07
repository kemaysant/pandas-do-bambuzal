# -*- coding: utf-8 -*-
import io
P="BACKLOG.md"
s=io.open(P,encoding="utf-8").read()
def rep(old,new,n,label):
    global s
    c=s.count(old); assert c==n,"FAIL ["+label+"] got %d"%c
    s=s.replace(old,new); print("ok:",label)

rep("_Atualizado: 2026-10-04_","_Atualizado: 2026-10-06_",1,"data")

NEW='''### 🟢 Entregue recentemente — Admin, Builds & Calculadora (06/10)
- **Painel Admin virou console (bz29–bz37)** — abas: **Visão geral** (dashboard de pendências), **Aprovações** (builds + fotos), **Bugs** (triagem), **Usuários** (busca com autocomplete + atribuir cargos Admin/Editor/Moderador e categorias de editor), **Jornada** (editar capítulos: título, nível, coins, conquistas por vocação), além de Bosses/Fundos/Gamificação. Gate server-side: ninguém vê o Admin nem a Moderação sem permissão (re-check via `tpCheckBuildAdmin`/`checkMod`, mesmo forçando flags no cliente).
- **Server-side (LIVE):** `jornada_chapters` com RLS (era buraco: anon tinha INSERT/UPDATE/DELETE → qualquer um mexia nos requisitos da jornada) — leitura pública, escrita só admin; tabela `bug_reports`; RPCs `tp_admin_find_users` + `tp_admin_profiles_by_ids` (SECURITY DEFINER, checam admin/mod) pra busca de usuários funcionar com RLS.
- **Editor de builds — seletor de Munição (bz38)** — faltava no editor: toda build de distância saía com `ammo:null` e o **dano saía subestimado** (a besta atirava "pelada", só atk 10). Agora tem o seletor (bolts/flechas), assume uma munição padrão quando falta, e recalcula ao salvar. (bz39: corrigido o emoji 🎯 da seção, que vazava como texto `U0001F3AF` e empurrava os nomes.)
- **Calculadora — modelo de dano/turno corrigido** — `dano/turno` agora conta o **auto-attack cheio todo turno + 1 spell por turno** (média ponderada pelo ratio), em vez de diluir o auto na média. Alinha com o modelo da **tibiatools.io** (mesma engine/fork do exivabuild; validado spell-a-spell: auto/barrage/sudden death batem 1:1). Só afeta vocações com auto na rotação (**knight/paladin/monk**); **sorcerer/druid ficam idênticos** (rotação só de spells). Recalculadas as **31 builds** afetadas no banco (ex.: paladino de besta 891→1781; pico Monk 1050pts = 7610). _Obs.: motor commitado, vale no ar após o push; a lista de builds já lê o dano novo do banco._
- **Descrições de build padronizadas** — guia dividido nos campos certos (summary / 🎯 prioridades / insights-chave) em vez de um parágrafo só; spells viram ícone automaticamente via `gmd()`. Liga com o item 1 (padronizar builds).

### A. 👥 Comunidade & Guilds — NOVO (foco estratégico)'''
rep("### A. 👥 Comunidade & Guilds — NOVO (foco estratégico)",NEW,1,"entregue_block")

rep("Ref: https://tibiadozero.com.br/ferramentas/timers",
    "Ref: https://tibiadozero.com.br/ferramentas/timers · Outra referência (hunt timers): https://tibiawatch.com/dashboard?tool=hunt-timers (Kemay, 06/10)",
    1,"timers_ref")

rep("- **Atelier de Gemas** (TibiaBR): https://www.tibiabr.com/23347/atelier-de-gemas/ — mecânica oficial dos mods básicos/supremos.",
    "- **Atelier de Gemas** (TibiaBR): https://www.tibiabr.com/23347/atelier-de-gemas/ — mecânica oficial dos mods básicos/supremos.\n- **Hunt Timers** (TibiaWatch): https://tibiawatch.com/dashboard?tool=hunt-timers — referência pro item **Timers** (cronômetros de respawn/boss/cooldown). _Kemay apontou (06/10)._",
    1,"ref_section")

io.open(P,"w",encoding="utf-8").write(s)
print("WROTE lines:",s.count(chr(10))+1)
