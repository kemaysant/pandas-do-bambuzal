# Tibia Panda — Builds · Status & Backlog

_Atualizado: 2026-09-30_

Objetivo: transformar a página de builds no "Blitz.gg do Tibia" — dados reais (nunca inventados), 1:1 com a calculadora, e uma UX de alto padrão. Toda build recalcula o dano com o equipamento escolhido antes de salvar.

---

## ✅ Feito

### Arquitetura de dados
- **Catálogo unificado** extraído do `DC_DATA` da calculadora:
  - `assets/data/dc-catalog.json` (~798KB) — display público: ícones de equip, armas usadas, spells, shapes, stances, aliases.
  - `assets/data/dc-editor.json` (~3,5MB) — editor (sob demanda): objetos completos de equip/arma, árvores de proficiência, ícones (1184 = equip + todas as armas), shapeOpts/shapeIcons, e mapas de alias `nid`/`nnm`.
  - `assets/data/dc-wheels.json` (~976KB) — arte real da Roda do Destino (fundo + sprites + moldura), carregada só no editor.

### Display da build (1:1 com o motor)
- Renderiza 100% dos dados **ao vivo** (`data.b`): atributos, proficiências + shapes, rotação, equipamento, roda, tags.
- **Aposentadoria do BDET**: quando há dados ao vivo, o snapshot "baked" antigo é ignorado → dano/postura/tags não divergem mais (corrigido 4112→2706, "Morte"→"Fogo").
- **Dano 1:1** com a calculadora, validado headless (MS 2.706 · ED 4.224).
- **Atributos** movido para baixo das Proficiências (alinha com Equipamentos).
- **Shapes**: o perk selecionado mostra o **ícone real** do shape (igual à calculadora), com badge ✷ e o %.
- **Roda do Destino**: imagem pré-renderizada 1:1 da calculadora (`assets/builds-wheel/{id}.webp`) para todas as builds MS aprovadas + a druida de referência; fallback SVG.
- **Tags de elemento** automáticas: mago = elemento da **postura (Mastery)**; melee = elemento da **arma**; mago sem postura = adapta.

### Editor nativo (Fase 2)
- Set com picker de itens + ícones reais (resolução por alias `nid`/`nnm` — todos os slots resolvem).
- Arma com picker + ícone; ao salvar, **embute o ícone na build** (`b.weapon.icd`) → qualquer uma das 859 armas mostra certo no display/lista.
- Proficiência dirigida pela arma; shapes editáveis com ícone real na fatia (máx 2).
- **Roda do Destino** com a **arte real da calculadora**, interativa: clique seleciona a fatia + painel de ajuste fino (−máx −10 −1 +1 +10 +máx); contiguidade (enche de dentro pra fora) + trava de pontos pelo nível.
- Postura → atualiza as tags de elemento.
- **Rotação** editável: repetição de magias + reordenar (↑↓), miniaturas iguais à calculadora.
- **Dano recalculado no save** via motor headless (iframe oculto da calculadora).

### Lista de builds
- Ícone real da arma (catálogo compartilhado + re-render quando o catálogo carrega).
- Tags de elemento pela postura/arma (não mais "todas").

---

## 📋 Backlog (prioridade sugerida)

### 1. Código oficial da Roda do Destino do Tibia (import/export) — ALTO
Permitir **copiar e colar a roda direto no char do Tibia** e vice-versa.
- Formato: código do planner oficial (ex.: `K0Y2CAAm8waQSijBhQwX8kAAA`), aceito em
  `tibia.com/community/?subtopic=wheelofdestinyplanner&code=...`.
- Precisa: **engenharia reversa** do formato (parece base64-url compacto que codifica os pontos por fatia).
  - **Import**: colar o código → decodifica → preenche `data.b.wheelPts` (roda real do char).
  - **Export**: gerar o mesmo código a partir dos `wheelPts` da build → botão "copiar código da roda".
- Ganho: a build deixa de ser só visual e vira **acionável no jogo** — diferencial forte vs. concorrentes.
- Risco: formato não documentado; exige capturar exemplos conhecidos (pontos → código) pra validar o encoder 1:1.

### 2. Refinar o conteúdo das builds — EM FOCO (você)
- Revisar set, roda, rotação e guia de cada build; padronizar copiar/colar entre builds.
- (Base técnica já pronta: editor nativo + dano 1:1.)

### 3. Polish da roda no editor — MÉDIO
- Arte já é a real; falta o **brilho dinâmico dos cantos/beads** por estágio de revelação (hoje a moldura é estática).

### 4. Estrutura da página estilo Blitz.gg — MÉDIO
- Pesquisar a hierarquia do Blitz e mapear × nossa página.
- Candidatos: "tier/confiança" no topo, seção de **matchups / onde caçar**, variações por contexto (nível/hunt), decisão-primeiro.

### 5. "Prioridades & o porquê" a partir da rotação — MÉDIO
- Hoje é texto curado no guia; puxar/derivar da rotação salva (marcar magia → miniatura + variação de elemento/padrão).

### 6. Cobertura de vocações — BAIXO
- Hoje o grosso é Master Sorcerer + 1 Elder Druid. Expandir para EK/RP/Monk quando o conteúdo estiver maduro.

---

## Notas técnicas
- Regra permanente: **sempre recalcular o dano** com o equipamento escolhido ao criar/editar (salvo em `builds.dano`).
- Índices das fatias da roda são **1:1** entre `TP_WHEEL` (site) e `D.wheelSorc/...` (calculadora) — validado, zero divergência.
- Deploy: repo `pandas-do-bambuzal` (GitHub Pages). Commits feitos no device; o push é manual.
