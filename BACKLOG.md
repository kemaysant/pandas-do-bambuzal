# Tibia Panda — Builds · Status & Backlog

_Atualizado: 2026-09-30_

Objetivo: transformar a página de builds no "Blitz.gg do Tibia" — dados reais (nunca inventados), 1:1 com a calculadora, e uma UX de alto padrão. Toda build recalcula o dano com o equipamento escolhido antes de salvar.

---

## ✅ Feito

### Arquitetura de dados
- **Catálogo unificado** extraído do `DC_DATA` da calculadora:
  - `assets/data/dc-catalog.json` (~798KB) — display público: ícones de equip, armas usadas, spells, shapes, stances, aliases.
  - `assets/data/dc-editor.json` (~3,5MB) — editor (sob demanda): objetos completos de equip/arma, árvores de proficiência, ícones (1184 = equip + todas as armas), shapeOpts/shapeIcons, e mapas de alias `nid`/`nnm`.
  - `assets/data/dc-wheels.json` (~1,0MB) — arte real da Roda do Destino (fundo + sprites + moldura) + `greaterGems` (mods supremos por vocação), carregada só no editor.

### Roda do Destino — código oficial & editor (30/09)
- **Import/Export do código oficial do jogo** (o "planner code" do Tibia): codec real extraído (WASM `SkillwheelPlanner`) e embutido localmente.
  - `assets/js/wheel-codec-core.js` — módulo Emscripten auto-contido (codec compilado).
  - `assets/js/wheel-codec.js` — API `importarDoTibia()` / `copiarProJogo()`.
  - Editor: campo + botões "📥 Importar do Tibia" e "📤 Copiar pro jogo".
  - Mapeamento fatia Panda ↔ `EGridTile` validado como isomorfismo de grafo (48 arestas). Round-trip exato (Node + headless HTTP).
- **Bug de seleção de fatias corrigido**: a roda usa a **adjacência real do jogo** (radial + lateral, cruzando quadrantes), derivada do codec; cascade virou flood-fill do centro. Fatias com vizinha preenchida agora liberam.
- **Gemas/vessels somam Dano & Cura** (Vessel Resonance): +1 lesser/regular, +2 greater; total na linha "Dano & Cura da roda" (editor e display).
- **Dropdown de mod supremo** virou `<select>` no padrão dos demais, com a lista correta de runas por vocação (`greaterGems`).

### Display da build (1:1 com o motor)
- Renderiza 100% dos dados **ao vivo** (`data.b`): atributos, proficiências + shapes, rotação, equipamento, roda, tags.
- **Aposentadoria do BDET**: quando há dados ao vivo, o snapshot "baked" antigo é ignorado → dano/postura/tags não divergem mais.
- **Dano 1:1** com a calculadora, validado headless (MS 2.706 · ED 4.224).
- **Shapes**: o perk mostra o **ícone real** do shape, com badge ✷ e o %.
- **Roda do Destino**: imagem pré-renderizada 1:1 da calculadora; fallback SVG.
- **Tags de elemento** automáticas (postura/arma).

### Editor nativo (Fase 2)
- Set com picker de itens + ícones reais (alias `nid`/`nnm`).
- Arma com picker + ícone; embute `b.weapon.icd` na build.
- Proficiência dirigida pela arma; shapes editáveis com ícone real (máx 2).
- Roda com arte real, interativa (clique + painel −máx…+máx), contiguidade e trava por nível; brilho dinâmico dos cantos/beads por estágio.
- Postura → atualiza tags. Rotação editável (repetição + reordenar). Dano recalculado no save (iframe oculto da calc).

### Lista de builds
- Ícone real da arma; tags de elemento pela postura/arma.

---

## 📋 Backlog (prioridade sugerida)

### 1. Refinar o conteúdo das builds — EM FOCO (você)
- Revisar set, roda, rotação e guia de cada build; padronizar copiar/colar entre builds.
- (Base técnica pronta: editor nativo + dano 1:1 + import/export da roda.)

### 2. Editor "redondo" — itens específicos (você vai listar)
- Ajustes finais do editor de builds apontados no uso.

### 3. Segurança — hardening (não urgente; nenhum buraco aberto hoje)
Auditoria de 30/09: RLS ligado nas 41 tabelas, políticas da `builds` corretas (só dono edita/apaga), sem `service_role` no código/histórico, RPCs sensíveis checam `auth.uid()`. Itens de endurecimento:
- **`SET search_path`** em `builds_touch` e nas funções `SECURITY DEFINER` (migração não-destrutiva; corrige o aviso do linter do Supabase).
- **Ativar proteção contra senha vazada** (HaveIBeenPwned) em Authentication → Policies no painel do Supabase.
- **Confirmar visibilidade do repo** no GitHub (o site é público de qualquer forma; privado protege o histórico).
- **Investigar a 2ª referência de projeto Supabase** no código (`buxgrdbsynsvajxonqhf`) — confirmar o que é / se deve sair.
- (Opcional) Auditar caso a caso o corpo de cada RPC `SECURITY DEFINER`.

### 4. Estrutura & manutenção do repo — ver `docs/REVISAO-ESTRUTURA.md`
- **Alto valor / risco baixo (pode já):** `.gitattributes` + Git LFS pra binários novos; apagar `_to_delete/` (57MB, já ignorado); `git gc --aggressive`.
- **Alto valor / decisão:** tirar assets pesados (GIFs de spell 38MB, outfits-pack 101MB, mapper-pack 18MB) do repo (assets repo / Release / CDN); otimizar GIFs → webp/mp4; reescrever histórico (`git filter-repo`/BFG) pra derrubar os 333MB de `.git`.
- **Incremental:** extrair blocos de dados e JS inline do `index.html` (19k linhas) pra `assets/`.
- Documentar/automatizar o script que gera os `dc-*.json` a partir do `DC_DATA` da calc.

### 5. Estrutura da página estilo Blitz.gg — MÉDIO
- Hierarquia estilo Blitz: "tier/confiança" no topo, matchups / onde caçar, variações por contexto, decisão-primeiro.

### 6. "Prioridades & o porquê" a partir da rotação — MÉDIO
- Derivar da rotação salva (marcar magia → miniatura + variação de elemento/padrão).

### 7. Cobertura de vocações — BAIXO
- Expandir de MS/ED para EK/RP/Monk quando o conteúdo amadurecer.

---

## Notas técnicas
- Regra permanente: **sempre recalcular o dano** com o equipamento escolhido ao criar/editar (salvo em `builds.dano`).
- Índices das fatias da roda são **1:1** entre `TP_WHEEL` (site) e a calculadora; a adjacência real (radial+lateral) e o mapa fatia↔`EGridTile` estão em `assets/js/wheel-codec.js`.
- Deploy: repo `pandas-do-bambuzal` (GitHub Pages). Commits feitos no device; o push é manual.
