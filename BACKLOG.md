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

### 0. 🗺️ MAP EDITOR — TOP PRIORIDADE
- Priorizar o editor de mapa (`mapa_editor.html` + `mapper-pack`). Definir escopo (o que falta / o que melhorar) e executar.

### 1. Refinar o conteúdo das builds — EM FOCO (você)
- Revisar set, roda, rotação e guia de cada build; padronizar copiar/colar entre builds.
- (Base técnica pronta: editor nativo + dano 1:1 + import/export da roda.)

### 2. Editor de builds — bugs mapeados (30/09, executar depois)

**a) ✅ FEITO (30/09) — Roda "não salvava" (visual).**
- Era a **imagem pré-renderizada** estática `assets/builds-wheel/{id}.webp` que o display usava e não era regenerada no save. O dado sempre salvou (`data.b.wheelPts` via `tpBESave` → PATCH).
- Fix aplicado: o display agora renderiza a roda **ao vivo** de `data.b.wheelPts` (`_beRichWheelSvg` readonly) — edições aparecem na hora e o webp estático foi aposentado.
- _Pendente (menor):_ confirmar o **cálculo de dano** no save (`_beCompDano` via iframe) reflete a roda; a D&H de vessel hoje é só display, não entra no dano.

**b) ✅ FEITO (30/09) — Proficiência não aparecia (ex.: Cobra Wand).**
- Era o display resolvendo a árvore pelo `TP_PTREE` pequeno em vez do índice completo.
- Fix aplicado: novo `assets/data/dc-proftrees.json` (443 árvores + 184 ícones), carregado sob demanda; o display resolve árvore e ícones no completo com fallback pro `TP_PTREE`/`TP_PICON`. Validado com a build Cobra Wand (8 tiles, ícones reais).
- _Opcional:_ backfill de `weapon.pc` no save.

**c) ✅ FEITO (30/09) — Fatias travadas mesmo com vizinha preenchida.**
- Causa: o `TP_ADJ` vinha de uma derivação que **perdia as arestas laterais dentro do mesmo quadrante** (fatias consecutivas do mesmo anel). A regra real do jogo (confirmada no codec) é adjacência **visual**: radial (par nos dois sentidos) + vizinhas consecutivas do mesmo anel (cíclico, cruzando quadrantes).
- Fix aplicado: `TP_ADJ` recalculado com a adjacência completa. Validado vs o codec (0 divergências em 112 checagens) e sem regressão no cascade/lateral. Fatia com vizinha do mesmo anel preenchida agora libera.

### 2b. Botão "＋ Criar nova build" na lista — BACKLOG (até validar tudo)
- CTA "Criar nova" na página de Builds (admin) abrindo o editor nativo com build vazia. Segurar até o editor estar 100% validado.

### 2c. Meta de Hunts — retirada do ar (revisitar no futuro)
- Retirada em 30/09: nav removida (bottom-nav + mega-menu) e rota `#huntmeta` redireciona pra home; a seção e `tpHuntMetaInit` **continuam no código** pra reuso.
- Por que saiu: a página não tinha função clara.
- Antes de voltar, resolver: faixas de nível muito díspares; margens de erro grandes; não distingue **solo vs party**.
- Ideia: **agregar ao Hunt Finder** com curadoria melhor (dados reais, faixas coerentes, solo/PT).

### 2d. Sistema de gemas completo (Atelier de Gemas) — a fazer
Hoje o editor só tem: tier (lesser/regular/greater) + **1 mod supremo** (só no greater) + D&H de presença. O modelo real do jogo é mais rico:
- **Gema menor (lesser):** 1 mod **básico**.
- **Gema média (regular):** 2 mods **básicos**.
- **Gema maior (greater):** 2 mods **básicos** + 1 mod **supremo**.
- Ref.: https://www.tibiabr.com/23347/atelier-de-gemas/
- Precisa: trazer as listas de **mods básicos** (por vocação/domínio) — hoje só temos os supremos (`greaterGems` em `dc-wheels.json`). Montar a UI de seleção (1/2/2+1 conforme o tier) e refletir no dano.
- Inclui o item "roda sem gema greater": o greater só abre no estágio III (1000 pts); confirmar que aparece e ganha os 2 básicos + 1 supremo.

### 2e. ✅ FEITO (30/09) — Contador de pontos movido pra cima da roda
- Estava sobreposto no centro da arte. Agora fica num cabeçalho acima da roda (editor: usados / limite do nível; display: pts na roda).

### 2f. Miniatura da roda "errada" — a confirmar
- Precisa apontar **onde** (qual tela) a miniatura aparece errada e **o que** está errado (arte diferente do build / fills errados / imagem estática antiga). Candidatos: fallback `tpWheelSVG` (webp) pra builds **sem** `wheelPts` salvos; flash do webp antes do `__DWH` carregar. Confirmar com o Kemay.

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

## 🔗 Ferramentas de referência (inspiração)
- **Simulador de revelar gemas** (Tibia do Zero): https://tibiadozero.com.br/ferramentas/simulador-revelar-gemas — referência forte pro sistema de gemas / Atelier (item 2d).
- **Atelier de Gemas** (TibiaBR): https://www.tibiabr.com/23347/atelier-de-gemas/ — mecânica oficial dos mods básicos/supremos.

## Notas técnicas
- Regra permanente: **sempre recalcular o dano** com o equipamento escolhido ao criar/editar (salvo em `builds.dano`).
- Índices das fatias da roda são **1:1** entre `TP_WHEEL` (site) e a calculadora; a adjacência real (radial+lateral) e o mapa fatia↔`EGridTile` estão em `assets/js/wheel-codec.js`.
- Deploy: repo `pandas-do-bambuzal` (GitHub Pages). Commits feitos no device; o push é manual.
