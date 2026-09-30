# Revisão de estrutura & manutenção — Tibia Panda

_Revisado: 2026-09-30 · foco: manutenção e custo de repositório, sem quebrar nada em produção._

## Resumo em uma linha

O app funciona e a arquitetura de dados (calc → `dc-*.json`) é boa. O problema não é o que roda no navegador — é o **peso do repositório git (562MB, sendo 333MB só de `.git`)** e a **manutenção de arquivos gigantes de arquivo único**. Nada abaixo é urgente nem quebra o site; é higiene pra um projeto que virou "ouro".

## Números atuais

| Item | Tamanho | Nota |
|---|---|---|
| Repo total | ~562 MB | pesado pra clonar/backupar |
| `.git` (histórico) | **333 MB** | bloat de binários + HTMLs gigantes recommitados |
| `outfits-pack/` | 101 MB (882 arq.) | sprites; quase nunca mudam |
| `assets/spell-anim/` | 38 MB (GIFs) | alguns de 3–4,5 MB cada |
| `mapper-pack/` | 18 MB (4781 arq.) | tiles do mapa |
| `index.html` | 2,5 MB / 19.483 linhas | 27 `<script>` + 24 `<style>` inline |
| `calculadora-dano.html` | 5,4 MB / 2.067 linhas | motor + `DC_DATA` |
| `assets/data/*.json` | 5,3 MB | `dc-editor` 3,4MB, `dc-wheels` 1,0MB, `dc-catalog` 817KB |
| `_to_delete/` | 57 MB | lixo local (ignorado no git) — pode apagar |

## Riscos/limites concretos

- GitHub avisa em repositório > 1 GB e bloqueia arquivo individual > 100 MB (aviso em > 50 MB). Hoje nenhum arquivo estoura, mas o **histórico cresce ~8 MB a cada rodada de commits** (index + calc), então a tendência é ruim.
- Clonar/restaurar o repo (o "backup do ouro") baixa os 333 MB de histórico inteiros.
- Editar um arquivo de 19 mil linhas é frágil e os diffs do git ficam enormes/inúteis.

## Recomendações — por prioridade e risco

### A. Parar o crescimento do histórico (alto valor, risco baixo — pode fazer já)
1. **`.gitattributes` + Git LFS para binários pesados** (`*.gif`, `outfits-pack/**`, `mapper-pack/**`, `*.webp` grandes). Só isso já evita que **novos** binários inchem o `.git`. Migrar os já existentes é o passo B3.
2. **Apagar `_to_delete/`** (57 MB, já ignorado) — limpeza local, zero impacto no site.
3. **`git gc --aggressive --prune=now`** — recompacta o `.git` e recupera algum espaço sem reescrever histórico.

### B. Encolher o repositório de verdade (alto valor, risco médio — precisa de decisão)
1. **Tirar os assets pesados do caminho do site** (GIFs de spell, outfits/mapper packs): servir de um **repo de assets separado**, de um *GitHub Release*, ou de um CDN. O site referencia por URL; o repo principal fica leve. (Não quebra nada se as URLs forem ajustadas de uma vez.)
2. **Otimizar os GIFs** que ficarem: converter para `webp`/`mp4` corta 60–80% do tamanho com a mesma qualidade visual.
3. **Reescrever o histórico** (`git filter-repo` ou BFG) pra remover blobs antigos e derrubar os 333 MB → provavelmente < 50 MB. É uma operação **deliberada** (reescreve SHAs e exige `push --force`); como o push é manual e solo, é viável, mas deve ser feita com backup antes e de uma vez.

### C. Manutenção do `index.html` (médio valor, risco baixo — incremental)
1. **Extrair os grandes blocos de dados inline** (bestiário, `TP_WHEEL`, tabelas de itens/monstros) para `assets/data/*.json` e carregar sob demanda — igual já foi feito com a roda/catálogo. Cada bloco movido reduz o arquivo e o diff.
2. **Extrair JS para `assets/js/*.js`** por área (auth/supabase, editor de build, loja, mapa). O `wheel-codec.js` já é um bom precedente.
3. **Marcadores de seção**: o arquivo tem só 4 comentários de seção em 19 mil linhas. Adicionar cabeçalhos por área ajuda a navegar enquanto não se divide.

### D. Fonte única de dados (médio valor, risco baixo)
- O padrão `DC_DATA` (calc) → `dc-*.json` é correto. Vale documentar/automatizar o **script gerador** (hoje ad-hoc) pra que regenerar os JSONs quando a calc muda seja um comando só, evitando divergência calc × site.

## O que NÃO mexer
- Chaves `anon` no cliente: corretas e públicas por design (ver segurança).
- Arquitetura de render ao vivo do build (`data.b`): está boa.
- Os `dc-*.json` como camada de dados: manter.
