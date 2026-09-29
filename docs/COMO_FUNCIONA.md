# Como funciona o Tibia Panda — Builds & Roda do Destino

> Documento de alinhamento. Serve para **humano e IA** entenderem a lógica do site sem
> precisar reconstruir tudo do zero a cada sessão. Se algo mudar no código, **atualize aqui**.
>
> Princípios do projeto: **dados reais, nunca inventar.** Toda build é validada 1:1 contra a
> calculadora de dano. Quando não sabemos um valor real, deixamos claro que é suposição.

---

## 1. Visão geral

- Site estático (HTML/JS/CSS) hospedado no **GitHub Pages** a partir do repo `kemaysant/pandas-do-bambuzal`.
- Arquivos principais:
  - `index.html` — o site (builds, roda, perfil, agenda, etc.).
  - `calculadora-dano.html` — a calculadora de dano (o **motor** de dano vive aqui).
  - `assets/spell-anim/*.webp` — animações das spells (hover na rotação).
  - `assets/builds-wheel/<buildId>.webp` — arte pré-renderizada da roda, uma por build.
- Dados das builds ficam no **Supabase** (projeto `vrhsylkkdqnakftjutvb`), tabela `builds`.
  O site faz `fetch` de `builds?status=eq.approved` em runtime. **Guia, rotação, dano e wheel
  vêm do Supabase** — mudar isso NÃO precisa de push (é live). Mudar HTML/JS/CSS precisa de push.

## 2. O modelo de uma build (coluna `data` jsonb no Supabase)

```
{
  "b":   { weapon, rotation, wheelPts, wprof, equip, gems, ... },  // o que a calculadora usa
  "inp": { level, ml, skill, critc, critd, tr, tres, fatal, ... }, // inputs da calculadora
  "voc": "druid" | "sorcerer" | "knight" | "paladin" | "monk",
  "guide": { chips, summary, style, styleTitle, rotation[], priorities[],
             insights[], strengths[], weaknesses[] }               // só EXIBIÇÃO
}
```

- `dano` (coluna própria) = dano/turno validado pelo motor. **Tem que bater 1:1** com a calculadora.
- `b.rotation` = rotação que o **motor** usa pra calcular o dano (lista de `{id, ratio, targets}`).
- `BDET[buildId].rot` (em `index.html`) = rotação de **exibição** (os ícones). Precisa ser
  consistente com `b.rotation`. **Ao mudar a rotação, atualize os 3**: `b.rotation` (dano),
  `guide.rotation` (texto) e `BDET[id].rot` (ícones).
- O código copiável ("Copiar código da build") é `base64(JSON da build)` **sem o `guide`**
  (o guia é grande e só serve pra exibir). Ele abre a build na NOSSA calculadora — **não** é
  compatível com o planner oficial do Tibia (formato binário próprio de 28 bytes).

## 3. O motor de dano (em `calculadora-dano.html`)

- Cada spell tem: `scalesWith` (`magic` | `skill` | `shielding` | `distance`), `power`,
  `skillFactor`, `buckets`, `element`.
- Fórmula base (`core`): para magia (`scalesWith:"magic"`) →
  **`dano = power/skillFactor × Magic Level + power/4`**.
  Só ataque corpo-a-corpo/distância/escudo usa a **skill** de luta.
- **IMPORTANTE:** magias de mage (druid/sorcerer) escalam **só com Magic Level**.
  O campo **Skill não afeta o dano de mage** — por isso ele fica **escondido** para druid/sorcerer.
- **Crit:** o multiplicador usa `critc` (chance) e `critd` (dano extra). Os valores padrão da
  calculadora são **10% / +90%** e **não são medidos do personagem** — são suposição. O crit
  real vem das **gemas e itens**. Na UI, os stats de crit têm um "?" avisando isso. Se soubermos
  o crit real de um personagem, atualizamos `inp.critc`/`inp.critd` e o `dano`.
- Reordenar a rotação **não muda o dano** (é uma soma por turno). Trocar spells, ratios,
  proficiências, wheel ou inputs **muda** — sempre recalcular e atualizar `dano`.

## 4. Roda do Destino — a mecânica

### Pontos de promoção
- **Pontos = nível − 50** (a partir do nível 51, 1 ponto por nível). Ex.: lvl 600 → 550 pts.
- No site, o total de pontos de cada build tem que ser `nível − 50` (já é assim).

### Revelação (por domínio)
- Investir pontos **num domínio** libera o Revelation Perk daquele domínio:
  - **250 pts** no domínio → Estágio 1 → **+4** de Dano & Cura (flat, em TODAS as spells).
  - **500 pts** → Estágio 2 → **+9**.
  - **1000 pts** → Estágio 3 → **+20**.
- O motor soma esse flat (`revDmg`) no dano.

### Gemas (Vessel Resonance)
- Gema encaixada num vessel de um domínio **ativo** soma D&H **por presença** (não muda o dano
  por %): **+1** por lesser/regular, **+2** se for greater no vessel de Estágio 3 (VR III).
- Isso é o `+X de gemas (Vessel Resonance)` que aparece na linha de D&H da roda.

### Marcos (Milestones) — o que cada faixa de pontos LIBERA
Fonte: TibiaWiki/CIP. É o painel "Marcos da Roda" no detalhe da build.
(níveis; pontos = nível − 50)

| Nível | Pontos | Libera |
|------:|------:|--------|
| 300  | 250 | 1º Revelation Perk (Estágio 1) |
| 550  | 500 | Revelation Perk Estágio 2 |
| 625  | 575 | **1º Conviction Perk** (fatia externa) — melhorias fortes de spell |
| 800  | 750 | Est. 2 + Est. 1 (ou três Est. 1) |
| 825  | 775 | Est. 2 + Est. 1 adjacente + Conviction |
| 875  | 825 | Est. 2 + Est. 1 oposto + Conviction |
| 1050 | 1000 | Dois Est. 2 · ou Est. 2 + dois Est. 1 · ou quatro Est. 1 · ou um Est. 3 |
| 1075 | 1025 | Dois Est. 2 adjacentes + Conviction |
| 1125 | 1075 | Dois Est. 2 opostos + Conviction |
| 1150 | 1100 | Dois Est. 2 adjacentes + os dois Conviction |
| 1200 | 1150 | Dois Est. 2 opostos + os dois Conviction |
| 1300 | 1250 | Dois Est. 2 + um Est. 1 · ou Est. 3 + Est. 1 |
| 1500 | 1450 | Est. 3 + dois Est. 1 · ou Est. 3 + Est. 2 |
| 1725 | 1675 | Três Est. 2 + três Conviction (roda "completa") |

### Conviction Perks (por que importam pra rotação)
- São os perks das **fatias externas**, e melhoram spells específicas (ex.: **−2s de CD do
  Death Echo, 6s→4s**). **Só abrem a partir do nível 625 (575 pts).**
- **Consequência prática:** a rotação muda por faixa de nível. Ex.: um Master Sorcerer abaixo
  do lvl 625 **não** consegue bufar o Death Echo → a rotação de beam otimizada só vale de
  ~625+; nas faixas baixas ele alterna spells de morte / prioriza fogo. Um MS lvl 200 (150 pts)
  nem abre um Revelation Estágio 1 (precisa de 250).
- **TODO conhecido:** os guias hoje são um por família (MS usa o mesmo texto em todas as faixas).
  Isso é impreciso nas faixas baixas — o certo é rotação por faixa (próximo passo).

## 5. Ícones e animações das spells (em `index.html`)

- `TP_SPELLICON` = mapa `nome → data-uri` (webp 44px) do **ícone estático** da spell
  (sprite oficial do TibiaWiki). É o que aparece parado na rotação.
- `TP_SPELLANIM` = `Set` de nomes que têm **animação de hover** em `assets/spell-anim/<Nome>.webp`
  (nome com espaços→`_`, apóstrofo removido). Ao passar o mouse, abre um popup com a animação.
- As animações são cortadas **no efeito** (frames vazios de chão removidos) e o popup centraliza
  a imagem (`object-fit:contain`). Pra adicionar uma spell nova à animação: colocar o webp em
  `assets/spell-anim/` e o nome no `TP_SPELLANIM`.

## 6. Deploy / fluxo de trabalho

- **Dados (Supabase):** guia, rotação, dano, wheel, visibilidade (`status`) → live, sem push.
- **Código (index.html / calculadora):** precisa de **push** no GitHub (o site é GitHub Pages).
- Visibilidade: `status='approved'` aparece; `status='hidden'` some. Só liberamos builds validadas.
- Ao mudar a rotação de uma build, lembrar dos **3 lugares** (ver §2).

## 7. Coisas que a gente NÃO inventa

- Dano: sempre do motor (1:1 com a calculadora).
- Crit 10%/90%: é **padrão da calculadora**, não do personagem (marcado com "?").
- Rotação/estratégia: baseada nos dados reais da build e nas mecânicas verificáveis do jogo
  (não em achismo). Quando o texto tático não é validado pelo usuário, tratamos como rascunho.

---

_Última atualização: setembro/2026. Mantido junto com o código para alinhar humano e IA._
