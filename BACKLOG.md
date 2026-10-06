# Tibia Panda — Produto · Status & Backlog

_Atualizado: 2026-10-06_

Objetivo: ser o hub do Tibia BR — ferramentas de alto padrão **e** comunidade. Regra permanente: **dados reais, nunca inventados**. O produto cresceu além das builds: hoje tem bosses, eventos/agenda, hunt analyser, economia (Panda Coins)/store e conta social. Esta primeira parte é o **roadmap atual por área**; a parte detalhada de **Builds & Ferramentas** segue preservada mais abaixo.

---

## 🧭 Roadmap atual (out/2026)

### 🟢 Entregue recentemente — Bosses, Eventos, UX (out/2026)
- **Card de boss enriquecido** (busca ao vivo da TibiaWiki/Fandom com cache, dados reais):
  - 📣 **Mensagem de raid** — lê `{{Message|type=server}}` **e** `{{Raid Message|HH:MM:SS|...}}` (sequência cronológica, estilo exevopan): Orshabaal/Morgaroth/Ghazbaran etc.
  - ⚔️ **Loot relevante** (TibiaData quando tem) + link TibiaWiki.
  - 🔁 **Respawn** — intervalo típico (`TP_BOSS_IV`, calibrado pela comunidade) + "visto há Xd" + "~Xd p/ liberar" / "pode nascer já".
  - 📍 **Localização com minimapa TibiaMaps embutido** — tiles reais, marcador do spawn, troca de andar (▲▼), coordenadas ao mover o mouse, link "Tela cheia".
  - ⭐ **Marcadores do TibiaMaps** (`markers.json`, 6.398 marcadores, cache) — spawn/escadas/flags/`?`/POIs por andar, com descrição em tooltip (ex.: "Fleabringer possible spawn location").
- **Página de Bosses**: ordenar por chance (default), filtros em pills; herói da home com "caçados hoje" + Boostados + Rashid do dia ("Hoje no Tibia").
- **Eventos/Agenda**: editar na página do evento; anfitrião apaga qualquer comentário e remove jogador (RPC `SECURITY DEFINER`); confirmação no estilo do site (`tpConfirm`); refresh visual (card/kanban/vocações, sem serifa); cabeçalho capa-ready + contagem regressiva.
- **UX geral (review)**: menos topo em todas as páginas, header mobile ok, gates padronizados, estados vazios convidativos, espaçamentos.

### 🟢 Entregue recentemente — Admin, Builds & Calculadora (06/10)
- **Painel Admin virou console (bz29–bz37)** — abas: **Visão geral** (dashboard de pendências), **Aprovações** (builds + fotos), **Bugs** (triagem), **Usuários** (busca com autocomplete + atribuir cargos Admin/Editor/Moderador e categorias de editor), **Jornada** (editar capítulos: título, nível, coins, conquistas por vocação), além de Bosses/Fundos/Gamificação. Gate server-side: ninguém vê o Admin nem a Moderação sem permissão (re-check via `tpCheckBuildAdmin`/`checkMod`, mesmo forçando flags no cliente).
- **Server-side (LIVE):** `jornada_chapters` com RLS (era buraco: anon tinha INSERT/UPDATE/DELETE → qualquer um mexia nos requisitos da jornada) — leitura pública, escrita só admin; tabela `bug_reports`; RPCs `tp_admin_find_users` + `tp_admin_profiles_by_ids` (SECURITY DEFINER, checam admin/mod) pra busca de usuários funcionar com RLS.
- **Editor de builds — seletor de Munição (bz38)** — faltava no editor: toda build de distância saía com `ammo:null` e o **dano saía subestimado** (a besta atirava "pelada", só atk 10). Agora tem o seletor (bolts/flechas), assume uma munição padrão quando falta, e recalcula ao salvar. (bz39: corrigido o emoji 🎯 da seção, que vazava como texto `U0001F3AF` e empurrava os nomes.)
- **Calculadora — modelo de dano/turno corrigido** — `dano/turno` agora conta o **auto-attack cheio todo turno + 1 spell por turno** (média ponderada pelo ratio), em vez de diluir o auto na média. Alinha com o modelo da **tibiatools.io** (mesma engine/fork do exivabuild; validado spell-a-spell: auto/barrage/sudden death batem 1:1). Só afeta vocações com auto na rotação (**knight/paladin/monk**); **sorcerer/druid ficam idênticos** (rotação só de spells). Recalculadas as **31 builds** afetadas no banco (ex.: paladino de besta 891→1781; pico Monk 1050pts = 7610). _Obs.: motor commitado, vale no ar após o push; a lista de builds já lê o dano novo do banco._
- **Descrições de build padronizadas** — guia dividido nos campos certos (summary / 🎯 prioridades / insights-chave) em vez de um parágrafo só; spells viram ícone automaticamente via `gmd()`. Liga com o item 1 (padronizar builds).

### A. 👥 Comunidade & Guilds — NOVO (foco estratégico)
**Objetivo:** virar o hub social do Tibia BR, não só ferramentas — guildas e comunidades por servidor, integradas a acessos, soul cores e bosses.
- [ ] **Espaços de guilda** — cada guilda tem sua comunidade: membros (verificados por personagem), mural/feed, eventos da guilda (já temos eventos de guild), cargos (líder/vice puxados do Tibia.com).
- [ ] **Multi-servidor** — comunidades por mundo; um usuário participa de guildas/mundos diferentes; navegação por servidor.
- [ ] **Acessos integrados** — gate de conteúdo por guilda/cargo (ex.: agenda de boss da guilda só pra membros).
- [ ] **Soul Cores integrados** — rastreio/compartilhamento de soul cores (Bosstiary/soul pit) por membro e por guilda: quem já tem, o que falta, metas coletivas. _Definir fonte:_ input manual verificado vs. leitura do char no Tibia.com (se exposto).
- [ ] **Bosses por guilda** — agenda/rotação de boss da guilda ligada ao boss tracker (quem vai, split, histórico). Liga com "Meu Tracker + rotação de boss" (item E).
- _Definir:_ modelo de dados (tabelas guild/membership/roles no Supabase), verificação de liderança, privacidade (público vs. só-membros), moderação.

### B. 🌱 Desenvolvimento de comunidade — NOVO
**Objetivo:** dar motivos recorrentes pra galera voltar e interagir.
- [ ] **Feed/mural social** — posts, comentários, reações; destaque de conquistas (boss raro, build, hunt recorde).
- [ ] **Perfis sociais mais ricos** — vitrine de personagens verificados, conquistas, participação em eventos/sorteios.
- [ ] **Rankings da comunidade** — mais ativos, mais eventos, mais bosses (liga com gamificação, item C).
- [ ] **Notificações** — evento da guilda, boss prestes a liberar, resultado de sorteio/missão.
- _Definir:_ o que incentiva interação saudável; moderação; anti-spam.

### C. 🎮 Gamificação, Sorteios & Missões — REVISAR/MELHORAR o que já temos
**Hoje:** Panda Coins (economia), Store, ideia de sorteio de 1k e premiação em eventos — falta amarrar num sistema coerente.
- [ ] **Missões feitas em game, revisadas no site** — o jogador cumpre no Tibia (matar X boss, completar quest, atingir level/skill) e **comprova no site**; a revisão (automática via Tibia.com onde der, manual/admin onde não der) libera recompensa em Panda Coins. _Definir:_ catálogo de missões, prova aceita, anti-fraude, quem revisa.
- [ ] **Sorteio semanal + mensal** (evoluir o "sorteio de 1k") — cadência fixa, métrica de elegibilidade (atividade: eventos, missões, presença), bilhetes por atividade, sorteio auditável, entrega automática.
- [ ] **Animação de baú abrindo** na entrega (sorteio, missão, prêmio de evento, compra na store) — ref. baú da store do Tibia; componente reutilizável.
- [ ] **Premiação em eventos (250/500/750 PC)** — decidir quem banca (site credita vs. saldo do host), escolha de ganhador, anti-abuse, limite.
- [ ] **Métrica única de "ativo"** que alimenta rankings + elegibilidade de sorteio + missões (fonte de verdade da gamificação).
- [ ] _Menor:_ esconder widget "PANDA COINS —" no topo da Store quando deslogado.

### D. 🐲 Bosses (pendências)
- [ ] **Bosses de Alavanca** — repaginar a aba (hoje "sucateada").
- [ ] _Menor:_ respawn como faixa min~max (se tivermos o dado); opção de trocar de servidor (hoje fixo Gentebra).

### E. 📊 Hunt Analyser / Performance / Análise de PT
- [ ] **Performance: filtrar por personagem** (hoje não filtra por boneco).
- [ ] **Análise de PT: editar o nome do local** (ficou errado) + **deduplicar hunts iguais** (mesmo spot vira várias linhas).
- [ ] **Comparador por dia**: separar por PT/personagem (hoje mistura hunts e pessoas diferentes).
- [ ] **Meu Tracker (bosses) → juntar com o analyser** pra medir **rotação de boss** (quando/onde cada boss foi feito). Liga com Guildas (item A).

### F. 🧭 Jornada do personagem por vocação
- [ ] Trilha de quests/progresso **por vocação** do personagem verificado (ex.: só EK vê a trilha de EK). Exige char verificado no site com a vocação certa.

### G. 📅 Eventos / Agenda (pendências)
- [ ] **Capa (imagem/banner)** pros eventos — upload do host vs. biblioteca por tipo; onde armazenar (Supabase Storage?); recorte padrão; fallback por tipo. O cabeçalho já está pronto pra receber a imagem.

### H. 🛒 Bazar / Marketplace — NOVO (em mockup; grátis agora, monetização depois)
**Estratégia:** tudo grátis pra **validar a plataforma**; nunca esconder dados (≠ ExevoPan Pro, que tranca "investido"/filtros/alertas). Pagar só pra **aparecer** (destaque), não pra ver — de preferência com **gems da Panda** (Pix como opção futura via gateway). Diferencial vs. TibiaTrade/ExevoPan = **confiança** (char verificado + karma). Mockups em `Downloads/tibiapanda_mockups/`.
- [ ] **Bazar da Panda (itens/casas/serviços)** — classificados P2P Vendo/Procuro; char verificado + karma, contato pelo **DM interno** + notificação no sino; moderação; expira 30d (renovar/vendido); avaliar karma pós-negócio; página do anúncio com atributos do item em **chips** (anti-TibiaTrade) + link pro Market Tracker. Só troca **in-game**. Mockup: `bazar-completo.html`.
- [ ] **Bazar de Personagens (agregador do Char Bazaar oficial)** — QUER FAZER, **falta infra**. _Pesquisa out/2026:_ CipSoft **não tem API** e **TibiaData não cobre** o bazaar → única fonte = HTML do tibia.com **atrás de Cloudflare** = **scraping** (worker always-on + **proxies rotativos** + manutenção quando o layout muda; **edge function do Supabase não serve**). Rodar no **VPS** é a opção; dá pra **forkar o scraper open-source do ExevoPan** (reuso liberado). **Interim viável:** _vitrine leve_ — user cola o **link do leilão** → Panda puxa só aquela página (1 req + cache, mesma técnica da verificação de char). Lance continua no **leilão oficial (↗)** — só CipSoft transfere char. Mockups: `bazar-personagens.html` (feed estilo ExevoPan, stats completos) + `card-patrocinado.html` (destaque dourado). Destaque/boost já desenhado pra plugar depois.
  - _Estratégia de lançamento (nota):_ **não** bootstrapar na API interna do ExevoPan pra depois cortar/cobrar (pega mal na comunidade + instável + bloqueio). Se quiser o feed completo antes do VPS, **falar com o dev (xandjiji)** p/ aval (Unlicense). Validar com **vitrine leve**; Pro = monetizar **destaque/apoiador**, nunca trancar dados.

---

## ✅ Feito — Builds & Roda do Destino

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

## 📋 Backlog — Builds & Ferramentas (detalhado)

### 0. 🗺️ MAP EDITOR — (o Kemay quer as ferramentas abaixo ANTES)
- Priorizar o editor de mapa (`mapa_editor.html` + `mapper-pack`). Definir escopo (o que falta / o que melhorar) e executar.

### 0b. 🛠️ Ferramentas do site — melhorar (inspiração tibiadozero) — ALTA
O Kemay achou o tibiadozero.com.br e quer elevar as nossas ferramentas ao mesmo nível. Já temos as páginas (`delivery`, `bosses`, `imbuements`, `huntfinder`, charm calc, market) e já usamos a **TibiaData API** (21 refs) como fonte.

- **Entregas / itens da weekly** (nossa: página `delivery`):
  - ✅ **Miniaturas quebradas — CORRIGIDO (30/09):** a causa era o proxy `wsrv.nl` ter parado de servir imagens do wikia (fandom). `itemImgUrl` agora usa `tibiawiki.com.br/wiki/Special:FilePath/` **direto** (sem proxy, sem hash), com fallback pro wikia direto. Corrigiu de uma vez Task Delivery, Imbuements e o loot do Hunt Finder.
  - ✅ **Enriquecida (30/09):** agrupamento por **NPC** comprador (Rashid/Yasir/Djinns/Telas/Gladys/Esrik-Pompan/Flint) com local/quest + filtro por NPC; **Rashid do dia** (calculado pelo server save 10:00 Europe/Berlin, rotação da TibiaWiki); **faixas** (Muito Alto/Alto/Médio/Baixo) com backfill do preço NPC; **Verificar loot** (cola o log e filtra só os de entrega).
  - ✅ **Redesign em cards (30/09):** layout em **cards colapsáveis por NPC** com **miniatura do NPC** (tibiawiki Special:FilePath), grade de itens (ícone/nome/preço/conselho), colunas de grupo/qtd revisadas, filtro por faixa + legenda. **Preço ao vivo** puxado **automaticamente** ao abrir. **Motor Market-vs-NPC**: compara a oferta de compra do market com o preço do NPC e aconselha "Vale mais no Market" ou "Melhor vender ao NPC".
  - ✅ **Catálogo completo (30/09):** **478 itens** (paridade com o tibiadozero). Adicionados os 28 itens do Yasir que faltavam, com valor e **market id reais** (resolvidos via `api.tibiamarket.top/item_metadata`) — preço ao vivo funciona neles.
  - ✅ **Miniaturas (30/09):** corrigido o bug do apóstrofo ("'S"→"'s") + carregamento via IntersectionObserver (não estoura o rate-limit da wiki). Override confirmado pro "Hand". _Sobram 2 sem imagem (Rod, Darklight Core) — nome do arquivo na wiki não é derivável; não inventei._
  - _Menor:_ backfill de `v` pros poucos itens do Yasir ainda com v:0; drops/qtd dos 28 itens novos (hoje sem essa info).
- ✅ **Boss statistics por servidor (30/09)** — reescrita. Catálogo completo (**98 bosses raros**) por **categoria** (Bosstiary), **"visto há X dias"** do nosso histórico próprio + **"caçado hoje/semana"** do kill statistics oficial ao vivo, filtro por categoria + ordenação, banner de caçados hoje.
  - **Pipeline de histórico (novo, Supabase):** tabela `boss_kills_daily` + função `snapshot_killstats` (HTTP server-side via extensão `http`) + **pg_cron diário às 07:55 UTC** (pouco antes do server save) + RPC `boss_activity` (anon). Começou a coletar em 30/09 — precisão cresce a cada dia.
  - **Bootstrap (30/09):** o "último visto" dos 98 bosses foi semeado a partir do tibiadozero (que deriva do mesmo kill statistics oficial), então o "visto há Xd" já sai preciso hoje em vez de esperar semanas. Daqui pra frente o cron atualiza sozinho. _Obs.: só semeou o last-seen (1 data/boss); o histórico completo por dia vem do nosso cron._
  - ✅ **Chance ao vivo + dots (30/09):** intervalo típico de spawn por boss calibrado 1x da comunidade (tibiadozero) → chance computada **ao vivo** pelo nosso "visto há Xd" (atualiza sozinha, refina com o histórico). Dots verdes (X/5) + % por boss, ordenação por Chance. Os bosses sem calibração mostram "coletando".
  - ✅ **Mortos Ontem + miniaturas + densidade (30/09):** sidebar "Mortos Ontem" (RPC expõe `yday`; 29/09 semeado como bootstrap, real a partir de amanhã); miniaturas via exevopan (primário) + fallback tibiawiki (trocado do wsrv quebrado); cards compactos com layout de sidebar estilo tibiadozero.
  - _Menor:_ opção de trocar de servidor (hoje fixo em Gentebra); podar `boss_kills_daily` (>200 dias). Ref: https://tibiadozero.com.br/ferramentas/boss-tracker/Gentebra
- ✅ **Custo de imbuements (30/09)** — a nossa já era mais completa que a do tibiadozero (24 imbuements por categoria, **preço de market ao vivo automático** dos materiais + do Gold Token, comparação market × token). O bug real era a **taxa do shrine defasada** (25k/50k/100k). Corrigido pros valores atuais pós-update de Verão 2025: **Basic 7.500 · Intricate 60.000 · Powerful 250.000 gp** (preço fixo + sucesso garantido). O "Total 20h" do calculador agora bate. Ref: https://tibiadozero.com.br/ferramentas/custo-imbuements
  - _Menor:_ revisar quais imbuements são trocáveis por Gold Token pós-2025 (hoje só vampirism/void/strike) e as contagens de token.
- **Hunts / Hunt Finder** (nossa: `huntfinder`) — ajustar com curadoria melhor (liga com o 2c: faixas coerentes, solo/PT). Ref: https://tibiadozero.com.br/hunts
- ✅ **Market tracker (01/10)** — ferramenta nova (`markettracker`, no menu Ferramentas). Busca em **5121 itens tradeáveis** (`assets/data/market-items.json`, índice gerado do `item_metadata`), consulta o **Tibia Market Tracker** (`api.tibiamarket.top`) por `/market_values` (atual) e `/item_history` (série do mês) e mostra: **venda** (maior oferta de compra) × **compra** (menor oferta de venda), médias do mês (venda/compra), volume (vendidos/comprados), traders ativos, maior venda, e um **gráfico SVG** de tendência do último mês (2 linhas, conecta os pontos com oferta). Mundo = **seletor global do topo**; recarrega ao trocar de servidor. Autocomplete com teclado, miniatura real do item. Ref: https://tibiadozero.com.br/ferramentas/market-tracker
  - _Menor:_ itens-moeda (Crystal/Tibia Coin) não estão no índice do market (não são tradeáveis no market); sem toggle de período no gráfico (hoje = últimos ~13 snapshots do mês).
- ✅ **Transferência de servidor / arbitragem entre mundos (01/10)** — ferramenta nova (`servertransfer`, no menu Ferramentas). Compara o **/market_values real** de dois mundos (api.tibiamarket.top, 1 request por mundo = market inteiro) e lista os itens com **lucro**: compra barato na origem, transfere o personagem (que leva o inventário/depot junto) e vende caro no destino. **3 estratégias** fiéis ao tibiadozero: _sem risco_ (compra+venda instantânea), _moderado_ (compra instantânea + oferta de venda), _alto_ (oferta nas duas pontas). Filtra por **volume ≥ 10/mês nas duas pontas** (liquidez real), dimensiona a **quantidade** pelo orçamento em **Tibia Coins** (convertido pela cotação da TC na origem) e pela liquidez mensal. Tabela **ordenável** (lucro/un, ROI, qtd, lucro total, volume), 96 mundos, troca origem↔destino, miniatura real do item. Validado Gentebra→Antica (224 oport. sem risco, 1154 risco alto — números reais). Ref: https://tibiadozero.com.br/ferramentas/transferencia-servidor
  - _Menor:_ a API só expõe a melhor oferta (não o livro ±15% que o tibiadozero cita); usamos best-offer, honesto e padrão. Custo fixo da transferência (750 TC) é citado na nota, não descontado por item.
- **Timers** (nova; ainda não temos) — criador de cronômetros personalizados pra cooldowns, respawns e eventos. Campos: Nome (opcional), Tempo (mm:ss), Auto-replay, Som de alerta, Falar nome ao completar (TTS); timers com sprites de monstro/item. Saída: contagem regressiva ativa + alerta sonoro/TTS ao zerar. Ideia nossa: presets úteis (respawn de hunt, janela de boss, server save, cooldown de exercise) + sprites via tibiawiki. _Kemay pediu pra colocar no backlog (01/10)._ Ref: https://tibiadozero.com.br/ferramentas/timers · Outra referência (hunt timers): https://tibiawatch.com/dashboard?tool=hunt-timers (Kemay, 06/10)
- **Calculadora de charms** (nossa: charm calc) — **backlog** (o próprio Kemay marcou). Ref: https://tibiadozero.com.br/ferramentas/calculadora-charms

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

### 2d. Sistema de gemas completo (Atelier de Gemas) — parcial
- ✅ **Tier liberado agora vem do CODEC real** (`vesselLevels`): depende da **forma** da alocação, não só do total (ex.: Beam com 3 vessels = greater; Lord com 1 = lesser). O editor recalcula ao editar/importar e ajusta o dropdown; o gating por estágio (errado) foi aposentado.
- ✅ **Ícones reais das gemas (30/09)**: 15 imagens oficiais da wiki (lesser/regular/greater × Mystic/Sage/Marksman/Guardian/Spiritualist) em `assets/data/gem-icons.json` (WEBP data-URI, keyed `tier_vocação`), carregadas sob demanda (`tpLoadGemIcons`) e resolvidas por `_tpGemIcon(voc,tier)`. Editor e display da roda mostram a gema certa por vessel; fallback pro ícone único antigo.
- ✅ **Mods básicos (30/09)**: menor = 1 básico · média = 2 básicos · maior = 2 básicos + 1 supremo. Dados **reais** — valores exatos do codec do jogo (`getAvailableBasicModsPos1/Pos2`) cruzados com os nomes da TibiaWiki (Basic Mod, 13.30), em `dc-wheels.json` (`basicPos1` 20 + `basicPos2` 30 por vocação, Grade IV). Editor mostra os selects conforme o tier (2º slot não repete o 1º); display lista os mods de cada vessel.
  - **Dano**: os mods básicos são **defensivos** (resistências, HP/Mana/Capacidade, mitigação) — **não alteram o dano ofensivo**, então (corretamente) não entram no cálculo de dano. Só a D&H de vessel e o supremo de revelação tocam ofensiva; a D&H de vessel ainda é display (ver 2a).
  - Refs: https://www.tibiabr.com/23347/atelier-de-gemas/ · simulador de revelar gemas (Tibia do Zero).

### 2e. ✅ FEITO (30/09) — Contador de pontos movido pra cima da roda
- Estava sobreposto no centro da arte. Agora fica num cabeçalho acima da roda (editor: usados / limite do nível; display: pts na roda).

### 2g. ✅ FEITO (30/09) — Botão "Copiar código pro jogo" na roda consolidada
- O display read-only da build agora tem o botão pra gerar e copiar o código oficial (antes só existia no editor).

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

## 🔎 SEO & descoberta

**Feito (out/2026):** `sitemap.xml` + `robots.txt` na raiz (home + `calculadora-dano.html`); Google Analytics (gtag.js, `G-W5SB3RZ98J`).

- [ ] **Roteamento por path real** (`/huntfinder`, `/bosses`, `/bestiary`…) no lugar do `#hash`, pra cada ferramenta indexar como página própria no Google. Técnica SPA do GitHub Pages: `404.html` que redireciona + `history.pushState` + `<link rel="canonical">` por página; depois expandir o `sitemap.xml` com essas URLs. _Risco:_ mexe no roteamento que já funciona — testar bem.
- [ ] **Política de cookies/privacidade:** atualizar `#cookies` e `#privacy` mencionando o Google Analytics (cookies de medição) e o Microsoft Clarity (gravação de sessão/mapa de calor) — hoje o texto diz "sem analytics de terceiros".
- [ ] _Menor:_ `<title>`/meta description e Open Graph por página quando o path routing existir.

## 🔗 Ferramentas de referência (inspiração)
- **Simulador de revelar gemas** (Tibia do Zero): https://tibiadozero.com.br/ferramentas/simulador-revelar-gemas — referência forte pro sistema de gemas / Atelier (item 2d).
- **Atelier de Gemas** (TibiaBR): https://www.tibiabr.com/23347/atelier-de-gemas/ — mecânica oficial dos mods básicos/supremos.
- **Hunt Timers** (TibiaWatch): https://tibiawatch.com/dashboard?tool=hunt-timers — referência pro item **Timers** (cronômetros de respawn/boss/cooldown). _Kemay apontou (06/10)._

## Notas técnicas
- Regra permanente: **sempre recalcular o dano** com o equipamento escolhido ao criar/editar (salvo em `builds.dano`).
- Índices das fatias da roda são **1:1** entre `TP_WHEEL` (site) e a calculadora; a adjacência real (radial+lateral) e o mapa fatia↔`EGridTile` estão em `assets/js/wheel-codec.js`.
- Deploy: repo `pandas-do-bambuzal` (GitHub Pages). Commits feitos no device; o push é manual.
