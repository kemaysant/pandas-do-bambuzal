# TibiaPanda Outfitter — pacote de sprites + widget

Gerado a partir do **seu** cliente Tibia **15.32** (assets oficiais). 394 outfits, com addons e 4 direções, coloração 100% fiel (paleta HSI oficial). **Não depende de nenhum site externo.**

## Conteúdo
```
manifest.json        # índice: id -> {name, gender, addonLayers, mountDim}
outfits/<id>.png     # 394 atlas (512x192): cols = dir(0-3)*2 + [base,template]; rows = addon layer
tp-outfitter.js      # renderizador + UI (canvas, sem dependências)
demo.html            # abra no navegador pra ver funcionando
```

## Como hospedar (escolha 1)
- **GitHub Pages (mais simples):** copie `manifest.json`, a pasta `outfits/` e `tp-outfitter.js` pro repo do site. `OUTFIT_BASE` = caminho onde ficam (ex.: `/outfits-pack`).
- **Cloudflare R2/Worker ou VPS:** sirva a pasta como estático. `OUTFIT_BASE` = a URL pública.

Só o PNG do outfit selecionado é baixado (sob demanda), então é leve.

## Uso
```html
<script src="tp-outfitter.js"></script>
<script>
  const of = new TPOutfitter({ base: OUTFIT_BASE });   // pasta com manifest.json + outfits/
  await of.load();
  // Painel interativo completo:
  const api = of.mountPicker(container, {
    value: { outfit:131, head:114, body:87, legs:79, feet:95, addons:3, dir:2 },
    onChange: cfg => console.log(cfg)
  });
  // Só renderizar um avatar (ex.: card do personagem):
  of.render({outfit:131,head:114,body:87,legs:79,feet:95,addons:3,dir:2}, canvasEl, 2);
</script>
```

## Config salva por personagem
`{ outfit, head, body, legs, feet, addons(0..3), dir(0..3) }` — 7 inteiros. É isso que guardamos no Supabase.

Atualizar quando sair versão nova do Tibia: rode a extração de novo com o cliente atualizado (o script já faz tudo).
