# Calculadora de Dano — Tibia Panda · Documentação técnica

Documento de referência do projeto da **Calculadora de Dano** do Tibia Panda: arquitetura,
motor de cálculo, dados, funcionalidades e o histórico completo do que foi construído.

> Princípio norteador do projeto: **copiar 100% dado real, nunca inventar/aproximar fórmula** —
> tudo é validado contra o tibiatools.io / exivabuild.io e contra o jogo. Números que não
> conseguimos derivar com exatidão são marcados como "não modelado", nunca chutados.

---

## 1. Visão geral e arquitetura

A calculadora é um **app HTML single-file** embutido via iframe em `tibiapanda.com.br`.

Pipeline de build (na pasta `calculadora/`):

```
template.html  →  build.js  →  index.html  →  (+ guarda de iframe)  →  calculadora-dano.html
   (fonte)         (injeta        (~5,5 MB,        standalone servido no site
                    JSON +         auto-contido)
                    ícones base64)
```

- **template.html** — fonte: HTML, CSS e todo o JavaScript do motor e da UI.
- **build.js** — injeta os arquivos de dados (`pesquisa/data/*.json`) e os ícones em base64
  dentro de um bloco `/*DATA*/…/*END*/`, gerando `index.html`.
- **calculadora-dano.html** — `index.html` + uma IIFE de guarda que bloqueia acesso direto
  fora do iframe (exige login pelo site). É o arquivo publicado no repositório
  `pandas-do-bambuzal`.

Validação é feita **headless** com Playwright (Chromium), aplicando builds no motor real e
lendo `computeTurnValue()` — o mesmo motor que roda no site.

---

## 2. Motor de dano

O motor foi validado **1:1 contra o bundle do tibiatools** (`DamageCalc.*.js`), dígito por dígito.

Conceitos centrais:

- **flatOf(level, wheel)** — dano/cura plano base por nível (ex.: `flatOf(987)=181`,
  `flatOf(500)=100`, batido com o jogo real).
- **Magias que escalam com Magic Level** (casters: MS/ED): `avg = ceil((flat + m(P·(1+Σbd)))·add)`,
  onde `P` é o poder da magia e só o termo `P` recebe o **% base damage** (o flat não).
- **Magias melee (EK/Monk)** e **paladino**: escalam com **skill × ataque da arma**
  (não com ML). Por isso a arma equipada importa pro dano desses.
- **Auto-attack**: `o = floor(6·atk/5)·(skill+4)/28`; **Monk dobra** (fator i=2).
  Wand/rod usam o `damage` fixo da arma direto.
- **Crítico / Fatal / Transcendence**: modelados pela função de multiplicador efetivo
  (`effMult` / `autoEff`) exatamente como o tibiatools.
- **Monk "spender" (Harmony)**: multiplica o poder da magia por `(2.12 + 0.0008·level)` — validado 1:1.

### Validações digit-perfect já feitas
- **MS** vs exivabuild (ex.: Death Echo 990 → 990).
- **Elder Druid, Elite Knight, Royal Paladin** vs tibiatools (min/avg/max exatos em todas as magias).
- **Monk** — auto-attack (o tibiatools não tem as magias de Monk); fórmula de punho validada.
- Descoberta importante: magias melee precisam do **ataque da arma** — sem arma o EK dava
  123 em vez de 200; com o ataque correto, todas as 7 magias do EK bateram exato.

---

## 3. Dados (`pesquisa/data/`)

- `spells.json` (104) · `weapons.json` (860) · `equipment.json` (325) · `arrows.json` / `bolts.json`
- `proficiencies*.json`, `weapon-prof-trees.json`, `prof-icons.json`, `shaping-options.json`
- `wheel*.json` (roda por vocação) · `stances.json` · `item-icons.json` (1213 sprites base64)

Campos de equipamento: `id, name, slot, vocations, minLevel, ml, elementMl, skill{type,value},
augments[], imbueSlots, icon, notModeled`. O `notModeled` guarda o que não entra no cálculo
(armadura, resistências, etc.) de forma transparente.

---

## 4. Funcionalidades

- **5 vocações**: Master Sorcerer, Elder Druid, Elite Knight, Royal Paladin, Exalted Monk.
- **Roda da Destino (Wheel of Destiny)** por vocação, com pontos, domínios e **gemas**
  (incl. as 4 gemas de **Revelation Mastery**, +225 pontos, para ED/EK/RP/Monk/MS).
- **Wheel Damage auto-derivado**: `flat de revelação (Σ [0,4,9,20] por estágio) + vessel das gemas
  (+2 por greater gem)`. Preenche o campo "Wheel Damage" sozinho, validado com screenshots do jogo
  (ex.: nível 987 → 197 = 181 base + 16 da roda).
- **Proficiência de arma**: árvore por arma (igual ao jogo), 1 perk por nível.
- **Perk Shaping** inline (botão ✦ shape por perk, igual exivabuild), com todos os perks e
  **troca de ícone** quando shapado. Cobre os perks Genéricos + específicos por vocação.
- **Augments** dos equipamentos (ex.: `Spell → +X% critical extra damage`).
- **Mastery (stance)**: só aparece para quem tem de fato — **MS e ED**. Monk/EK/RP não têm
  mastery de elemento (o dano do Monk vem de Harmony/Serene, modelado à parte), então o campo
  **some** da tela pra eles.
- **Builds A vs B**: comparação lado a lado, com todos os campos por-build (arma, equip, roda,
  proficiência, shapes, gemas) independentes entre A e B.
- **Comparador lado a lado**: grade de stats por build (Wheel dmg, pontos, equip, proficiências,
  shapes, gemas, stance) + dano por hit + delta %.
- **Galeria de builds**:
  - **Fase 1** — salvar/compartilhar localmente (localStorage) + código base64 export/import.
  - **Fase 2** — comunidade via **Supabase** (publicar, curtir, abrir builds de outros).

---

## 5. Galeria / Comunidade (Supabase)

- Projeto: `vrhsylkkdqnakftjutvb` · URL `https://vrhsylkkdqnakftjutvb.supabase.co`
- Tabelas: **`builds`** e **`build_likes`** (RLS ligado).
- Colunas de `builds`: `id, user_id, author_name, name, vocation, dano, ml, element,
  data (jsonb), notes, status ('approved' por padrão), likes, created_at, updated_at`.
- O `data` é o snapshot `captureBuild()`: `{fmt, voc, inp, b, tg, ut, ex}` — `inp` = campos de
  personagem; `b` = build por-vocação (weapon, ammo, rotation, equip, wprof, shapes, wheelPts,
  gems, stance, etc.).
- Autenticação da comunidade: token do site via `window.parent.TP_AUTH.access_token`
  (iframe mesma origem). RLS: anon lê builds `approved`, insert exige login.

---

## 6. Builds de referência (45)

45 builds prontas na galeria da comunidade: **5 vocações × níveis 200/300/400/500/600/700/800/
900/1000**, assinadas como "Tibia Panda 🐼", `status = approved`.

Metodologia (tudo derivado de dado real):
- **Roda**: pontos = `nível − 50` (confirmado: 1 ponto por nível a partir do 51), alocados nos
  domínios de dano.
- **Equipamentos por classe** (v2): seleção respeita `skill`/`ml`/`vocations` de cada item —
  punho (fist) para Monk, machado (axe) para EK, distância para RP, ML para magos. **Sem
  misturar peça de classe errada.**
- **Level-gates reais das armas** (TibiaWiki): Umbral → Falcon → Soul (400) → **Sanguine (600)** →
  **Moonsilver** (elmo 800; wand/rod de mago **1000**; arma melee/distância 800).
- **ML/skill** representativos por nível (paladino usa ML nas magias Divine, curva própria).
- **Dano REAL**: cada build é medida pelo próprio motor (headless) e **verificada de volta** —
  puxando do banco e recalculando, as 45 batem dígito por dígito.

Ressalva honesta: em níveis baixos (200–300) algumas peças ficam vazias **de propósito** —
magos não têm perna/amuleto com ML abaixo do nível 400, e melee de nível baixo não ganha skill
nas pernas (confirmado na pesquisa). Vazio é o correto e não afeta o dano.

---

## 7. Histórico de mudanças (changelog do projeto)

1. **Gemas de Revelation Mastery** (+225 pts) adicionadas para ED/EK/RP/Monk (MS já tinha).
2. **Crit/Wheel Damage** entraram na lista de auto-preenchimento; **Perk Shaping** implementado.
3. **Fix de foco de digitação**: `render(keep)` evita reconstruir o host e perder o cursor ao
   digitar números continuamente.
4. **Augments** preenchidos em ~40 equipamentos (parse do campo `augments` da wiki, pulando
   augments de cooldown).
5. **Wheel Damage auto-derivado** e validado com screenshots do jogo e cross-tool.
6. **Perk Shaping**: virou inline por-perk (estilo exivabuild), com todos os perks e troca de ícone.
7. **Bug A/B corrigido**: proficiência/shapes eram compartilhados no `state`; movidos para
   objeto por-build (`mkBuild`), tornando A e B independentes.
8. **Galeria** Fase 1 (local/base64) + Fase 2 (Supabase) + **comparador lado a lado**.
9. **45 builds de referência** geradas, medidas e publicadas.
10. **Mastery por vocação**: `masteryList()` deixou de vazar as masteries de MS para as outras
    vocações; os campos **Mastery + Tier somem** para Monk/EK/RP.
11. **Grand Sanguine Coil > Sanguine Coil** — investigado e confirmado que **não é bug**:
    a Grand tem o **dobro** dos valores de proficiência (verificado 1:1 na TibiaWiki). É a versão
    superior; deve bater mais mesmo.
12. **Gear por classe + level-gates corretos** (varredura das 5 vocações): reescrita a seleção de
    equipamento para respeitar classe; corrigidos os gates (Sanguine 600, Moonsilver wand 1000, etc.);
    45 builds refeitas e revalidadas.
13. **Itens novos** adicionados com stats reais: **Norcferatu Bonehood** (elmo Monk, fist+2, lv230),
    **Norcferatu Skullguard** (elmo RP, distance+2, lv270), **Norcferatu Goretrampers** (botas EK,
    lv270), **Dwarven Legs**. **Sprites reais** puxados da TibiaWiki (GIF animado) via o navegador —
    nada de ícone emprestado.

---

## 8. Deploy

1. As mudanças são gravadas **direto na pasta do repositório** em
   `C:\Users\mikes\Documents\GitHub\pandas-do-bambuzal\calculadora-dano.html`.
2. No **GitHub Desktop**: escrever a mensagem de commit → **Commit to main** → **Push origin**.
3. O site rebuilda/serve a nova versão.

> Importante: o arquivo enviado no chat é um download e **não** entra sozinho na pasta do repo.
> Por isso agora ele é escrito diretamente na pasta versionada.

---

## 9. Backlog / pendências

- Auto-preenchimento de **Crit Chance/Extra** (precisa modelar imbuements — só Wheel Damage feito).
- Seções por vocação no site (área da galeria).
- Gemas + Perk Shaping padrão nas builds de referência (hoje ficam vazios por segurança).
- Completar tags de vocação/armadura de itens de nível baixo (para preencher slots melee/mago cedo).
