/* TibiaPanda Outfitter — renders Tibia outfits (+ mounts) from a self-hosted sprite pack.
   Pack layout: <base>/manifest.json + <base>/outfits/<id>.png
                <base>/manifest_mounts.json + <base>/mounts/<cid>.png + <base>/outfits_mounted/<id>.png
   Outfit/mounted PNG: cols = dir(0..3)*2 + layer(0=base,1=template); rows = addon layer (0..ph-1). Cell 64x64.
   Mount PNG: cols = dir(0..3)*2 + layer(0=base,1=template); 1 row. Cell 64x64. */
(function (global) {
  'use strict';
  var HSI_H = 19, HSI_SI = 7;
  function getColor(color) {
    if (color >= HSI_H * HSI_SI) color = 0;
    var l1 = 0, l2 = 0, l3 = 0;
    if (color % HSI_H !== 0) {
      l1 = (color % HSI_H) * (1 / 18); l2 = 1; l3 = 1;
      switch (Math.floor(color / HSI_H)) {
        case 0: l2 = .25; l3 = 1; break;   case 1: l2 = .25; l3 = .75; break;
        case 2: l2 = .5; l3 = .75; break;   case 3: l2 = .667; l3 = .75; break;
        case 4: l2 = 1; l3 = 1; break;      case 5: l2 = 1; l3 = .75; break;
        case 6: l2 = 1; l3 = .5; break;
      }
    } else { l1 = 0; l2 = 0; l3 = 1 - color / HSI_H / HSI_SI; }
    if (l3 === 0) return [0, 0, 0];
    if (l2 === 0) { var v = (l3 * 255) | 0; return [v, v, v]; }
    var r = 0, g = 0, b = 0;
    if (l1 < 1/6) { r = l3; b = l3*(1-l2); g = b+(l3-b)*6*l1; }
    else if (l1 < 2/6) { g = l3; b = l3*(1-l2); r = g-(l3-b)*(6*l1-1); }
    else if (l1 < 3/6) { g = l3; r = l3*(1-l2); b = r+(l3-r)*(6*l1-2); }
    else if (l1 < 4/6) { b = l3; r = l3*(1-l2); g = b-(l3-r)*(6*l1-3); }
    else if (l1 < 5/6) { b = l3; g = l3*(1-l2); r = g+(l3-g)*(6*l1-4); }
    else { r = l3; g = l3*(1-l2); b = r-(l3-g)*(6*l1-5); }
    return [(r*255)|0, (g*255)|0, (b*255)|0];
  }
  function TPOutfitter(opts) {
    this.base = (opts.base || '').replace(/\/$/, '');
    this.manifest = null; this.mounts = {}; this.mountedSet = {};
    this._img = {}; this._mimg = {}; this._mtimg = {};
    this._off = document.createElement('canvas'); this._off.width = 64; this._off.height = 64;
    this._octx = this._off.getContext('2d');
    this._base = document.createElement('canvas'); this._base.width = 64; this._base.height = 64;
    this._bctx = this._base.getContext('2d');
    this._tmpl = document.createElement('canvas'); this._tmpl.width = 64; this._tmpl.height = 64;
    this._tctx = this._tmpl.getContext('2d');
  }
  TPOutfitter.prototype.load = function () {
    var self = this;
    return fetch(this.base + '/manifest.json').then(function (r) { return r.json(); })
      .then(function (m) {
        self.manifest = m;
        return fetch(self.base + '/manifest_mounts.json')
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (mm) {
            self.mounts = (mm && mm.mounts) || {};
            self.mountedSet = {};
            ((mm && mm.mountedOutfits) || []).forEach(function (id) { self.mountedSet[id] = 1; });
            return m;
          });
      });
  };
  TPOutfitter.prototype.outfitList = function () {
    var m = this.manifest, out = [];
    for (var id in m.outfits) { var o = m.outfits[id]; out.push({ id: +id, name: o.name || ('Outfit #' + id), gender: o.gender || null, addonLayers: o.addonLayers }); }
    out.sort(function (a, b) { var an = !!a.name && !/^Outfit #/.test(a.name), bn = !!b.name && !/^Outfit #/.test(b.name); if (an !== bn) return an ? -1 : 1; return a.id - b.id; });
    return out;
  };
  TPOutfitter.prototype.mountList = function () {
    var out = [];
    for (var id in this.mounts) { out.push({ id: +id, name: this.mounts[id].name || ('Montaria #' + id), layers: this.mounts[id].layers }); }
    out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out;
  };
  function _loadInto(cache, url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return new Promise(function (res, rej) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () { cache[url] = im; res(im); };
      im.onerror = function () { rej(new Error(url)); };
      im.src = url;
    });
  }
  TPOutfitter.prototype._getImg = function (id) { return _loadInto(this._img, this.base + '/outfits/' + id + '.png'); };
  TPOutfitter.prototype._getMount = function (cid) { return _loadInto(this._mimg, this.base + '/mounts/' + cid + '.png'); };
  TPOutfitter.prototype._getMounted = function (id) { return _loadInto(this._mtimg, this.base + '/outfits_mounted/' + id + '.png'); };
  // colorize one addon-layer of an outfit/mounted atlas into this._off (composited)
  TPOutfitter.prototype._drawLayer = function (img, dir, y, colors, clear) {
    var cb = (dir * 2 + 0), ct = (dir * 2 + 1);
    this._bctx.clearRect(0,0,64,64); this._bctx.drawImage(img, cb*64, y*64, 64,64, 0,0,64,64);
    this._tctx.clearRect(0,0,64,64); this._tctx.drawImage(img, ct*64, y*64, 64,64, 0,0,64,64);
    var B = this._bctx.getImageData(0,0,64,64), T = this._tctx.getImageData(0,0,64,64);
    var bd = B.data, td = T.data;
    var head = colors.head, body = colors.body, legs = colors.legs, feet = colors.feet;
    for (var i = 0; i < bd.length; i += 4) {
      var a = bd[i+3]; if (a === 0) continue;
      var ta = td[i+3];
      if (ta > 0) {
        var tr = td[i], tg = td[i+1], tb = td[i+2], c = null;
        if (tr>127 && tg>127 && tb<128) c = head;
        else if (tr>127 && tg<128 && tb<128) c = body;
        else if (tg>127 && tr<128 && tb<128) c = legs;
        else if (tb>127 && tr<128 && tg<128) c = feet;
        if (c) { bd[i]=(bd[i]*c[0])/255|0; bd[i+1]=(bd[i+1]*c[1])/255|0; bd[i+2]=(bd[i+2]*c[2])/255|0; }
      }
    }
    this._bctx.putImageData(B,0,0);
    if (clear) this._octx.clearRect(0,0,64,64);
    this._octx.drawImage(this._base,0,0);
  };
  // cfg: {outfit, head,body,legs,feet, addons(0..3), dir(0..3), mount(cid|0)}
  TPOutfitter.prototype.render = function (cfg, targetCanvas, scale) {
    var self = this; scale = scale || 2;
    var o = this.manifest.outfits[cfg.outfit]; if (!o) return Promise.reject(new Error('unknown outfit'));
    var colors = { head: getColor(cfg.head|0), body: getColor(cfg.body|0), legs: getColor(cfg.legs|0), feet: getColor(cfg.feet|0) };
    var dir = cfg.dir|0;
    var mountCid = cfg.mount|0;
    var useMount = mountCid && this.mounts[mountCid];
    var mounted = useMount && this.mountedSet[cfg.outfit];
    return this._getImg(cfg.outfit).then(function (img) {
      var pMount = useMount ? self._getMount(mountCid).catch(function(){return null;}) : Promise.resolve(null);
      var pPose  = mounted  ? self._getMounted(cfg.outfit).catch(function(){return img;}) : Promise.resolve(img);
      return Promise.all([pMount, pPose]).then(function (arr) {
        var mImg = arr[0], pose = arr[1] || img;
        var ph = o.addonLayers || 1, ys = [0];
        if (ph > 1 && (cfg.addons & 1)) ys.push(1);
        if (ph > 2 && (cfg.addons & 2)) ys.push(2);
        self._octx.clearRect(0,0,64,64);
        if (mImg) self._octx.drawImage(mImg, (dir*2)*64, 0, 64,64, 0,0,64,64);
        ys.forEach(function (y) { self._drawLayer(pose, dir, y, colors, false); });
        if (targetCanvas) {
          var s = scale, ctx = targetCanvas.getContext('2d');
          targetCanvas.width = 64*s; targetCanvas.height = 64*s;
          ctx.imageSmoothingEnabled = false; ctx.clearRect(0,0,64*s,64*s);
          ctx.drawImage(self._off, 0,0, 64*s, 64*s);
        }
        return self._off.toDataURL('image/png');
      });
    });
  };
  TPOutfitter.getColor = getColor;
  global.TPOutfitter = TPOutfitter;
})(typeof window !== 'undefined' ? window : this);

/* ---- Interactive picker UI — two-list (Outfits | Montarias) game style ---- */
(function () {
  if (typeof window === 'undefined' || !window.TPOutfitter) return;
  var P = window.TPOutfitter.prototype;
  var REGIONS = [['head','Head'],['body','Primary'],['legs','Secondary'],['feet','Detail']];
  function injectCSS() {
    if (document.getElementById('tp-of-style')) return;
    var st = document.createElement('style'); st.id = 'tp-of-style';
    st.textContent = [
      '.tp-of{--gold:#d8b567;--acc:#8b5cf6;color:#cdd2dc;font:13px/1.4 Verdana,system-ui,sans-serif;max-width:440px;margin:0 auto}',
      '.tp-pan{background:linear-gradient(#3a3f49,#2b2f37);border:2px solid #0d0f14;border-radius:5px;box-shadow:inset 0 0 0 1px #4b5563,inset 0 2px 4px rgba(255,255,255,.05);padding:8px;margin-bottom:8px}',
      '.tp-cols{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}',
      '.tp-col{background:linear-gradient(#3a3f49,#2b2f37);border:2px solid #0d0f14;border-radius:5px;box-shadow:inset 0 0 0 1px #4b5563;overflow:hidden}',
      '.tp-colhd{display:flex;align-items:center;gap:6px;padding:6px 9px;font-weight:700;color:var(--gold);border-bottom:2px solid #0d0f14;background:#20242c;font-size:12px}',
      '.tp-list{max-height:172px;overflow:auto;background:#1a1d24}',
      '.tp-list::-webkit-scrollbar{width:9px}.tp-list::-webkit-scrollbar-track{background:#14171d}.tp-list::-webkit-scrollbar-thumb{background:#454b57;border-radius:6px}',
      '.tp-item{display:flex;align-items:center;gap:8px;padding:5px 9px;cursor:pointer;border-bottom:1px solid #14171d;color:#c3c8d2;font-size:12.5px}',
      '.tp-item:hover{background:#232831}.tp-item.on{background:var(--acc);color:#fff}',
      '.tp-radio{width:13px;height:13px;border-radius:50%;border:2px solid #6b7280;flex:none;position:relative;background:#12141a}',
      '.tp-item.on .tp-radio{border-color:#fff}.tp-item.on .tp-radio:after{content:"";position:absolute;inset:2px;border-radius:50%;background:#fff}',
      '.tp-item .g{color:#8b93a3;font-size:11px}.tp-item.on .g{color:#e3ddf7}',
      '.tp-search{width:100%;box-sizing:border-box;background:#20242c;border:0;border-bottom:2px solid #0d0f14;box-shadow:inset 0 0 0 1px #454b57;color:#e8ecf3;padding:6px 9px;font:12px Verdana,sans-serif}',
      '.tp-search::placeholder{color:#6b7280}',
      '.tp-stage{height:138px;display:flex;align-items:center;justify-content:center;background:#0d0f14;border-radius:3px;box-shadow:inset 0 0 0 1px #454b57;position:relative;overflow:hidden}',
      '.tp-stage:after{content:"";position:absolute;bottom:22px;width:86px;height:16px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.6),transparent)}',
      '.tp-cav{image-rendering:pixelated;width:124px;height:124px;position:relative;z-index:1}',
      '.tp-ctabs{display:flex;border:2px solid #0d0f14;border-radius:4px;overflow:hidden;margin-bottom:7px}',
      '.tp-ctabs button{flex:1;background:linear-gradient(#3a3f49,#2b2f37);border:0;border-right:1px solid #0d0f14;color:#cdd2dc;padding:7px 3px;cursor:pointer;font:700 12px Verdana,sans-serif;display:flex;flex-direction:column;align-items:center;gap:4px}',
      '.tp-ctabs button:last-child{border-right:0}.tp-ctabs button.on{background:#20242c;box-shadow:inset 0 -2px 0 var(--gold),inset 0 0 0 1px #454b57;color:#fff}',
      '.tp-sw{width:16px;height:16px;border-radius:3px;border:1px solid #0d0f14;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}',
      '.tp-pal{display:grid;grid-template-columns:repeat(19,1fr);gap:2px;background:#1a1d24;border:2px solid #0d0f14;border-radius:4px;padding:6px}',
      '.tp-pal i{padding-top:100%;border-radius:2px;cursor:pointer;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);outline:2px solid transparent;outline-offset:-2px}',
      '.tp-pal i:hover{transform:scale(1.18);position:relative;z-index:2}.tp-pal i.on{outline-color:#fff}',
      '.tp-bottom{display:flex;align-items:center;gap:14px;padding:10px}',
      '.tp-compass{position:relative;width:74px;height:74px;flex:none}',
      '.tp-compass button{position:absolute;width:24px;height:24px;border:2px solid #0d0f14;border-radius:4px;background:linear-gradient(#464c57,#333842);color:var(--gold);cursor:pointer;font-size:11px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}',
      '.tp-compass button:hover{background:linear-gradient(#525967,#3b414c)}.tp-compass button.on{background:var(--acc);border-color:var(--acc);color:#fff}',
      '.tp-compass .n{top:0;left:25px}.tp-compass .s{bottom:0;left:25px}.tp-compass .w{left:0;top:25px}.tp-compass .e{right:0;top:25px}',
      '.tp-compass .c{position:absolute;left:25px;top:25px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:#5b6270;font-size:14px}',
      '.tp-addons{display:flex;flex-direction:column;gap:9px}',
      '.tp-addons label{display:inline-flex;align-items:center;gap:8px;cursor:pointer;color:#cdd2dc}.tp-addons input{accent-color:var(--acc);width:16px;height:16px}'
    ].join('');
    document.head.appendChild(st);
  }
  P.mountPicker = function (container, opts) {
    opts = opts || {}; var self = this;
    var cfg = Object.assign({ outfit:128, head:0, body:0, legs:0, feet:0, addons:0, dir:2, mount:0 }, opts.value || {});
    var onChange = opts.onChange || function(){};
    injectCSS(); container.innerHTML=''; container.classList.add('tp-of');
    var all = self.outfitList(), mounts = self.mountList();
    var el = document.createElement('div');
    el.innerHTML =
      '<div class="tp-cols">'
      + '<div class="tp-col"><div class="tp-colhd">🎽 Outfits</div><input class="tp-search tp-osearch" placeholder="Buscar..."><div class="tp-list tp-ol"></div></div>'
      + '<div class="tp-col"><div class="tp-colhd">🐎 Montarias</div><input class="tp-search tp-msearch" placeholder="Buscar..."><div class="tp-list tp-ml"></div></div>'
      + '</div>'
      + '<div class="tp-pan"><div class="tp-stage"><canvas class="tp-cav" width="192" height="192"></canvas></div></div>'
      + '<div class="tp-pan"><div class="tp-ctabs">'+REGIONS.map(function(r){return '<button data-region="'+r[0]+'"><span class="tp-sw" data-swatch="'+r[0]+'"></span>'+r[1]+'</button>';}).join('')+'</div><div class="tp-pal"></div></div>'
      + '<div class="tp-pan tp-bottom"><div class="tp-compass"><button class="n" data-dir="0">▲</button><button class="e" data-dir="1">▶</button><button class="s" data-dir="2">▼</button><button class="w" data-dir="3">◀</button><div class="c">✦</div></div>'
      + '<div class="tp-addons"><label><input type="checkbox" data-addon="1">Addon 1</label><label><input type="checkbox" data-addon="2">Addon 2</label></div></div>';
    container.appendChild(el);
    var ol=el.querySelector('.tp-ol'), osearch=el.querySelector('.tp-osearch');
    var ml=el.querySelector('.tp-ml'), msearch=el.querySelector('.tp-msearch'), pal=el.querySelector('.tp-pal');
    var activeRegion='head';
    function rgb(c){var a=window.TPOutfitter.getColor(c);return 'rgb('+a[0]+','+a[1]+','+a[2]+')';}
    function buildPal(){ pal.innerHTML=''; for(var i=0;i<133;i++){var s=document.createElement('i');s.style.background=rgb(i);s.dataset.c=i;if(cfg[activeRegion]===i)s.className='on';pal.appendChild(s);} }
    function buildSwatches(){ REGIONS.forEach(function(r){el.querySelector('[data-swatch="'+r[0]+'"]').style.background=rgb(cfg[r[0]]);}); el.querySelectorAll('.tp-ctabs button').forEach(function(b){b.classList.toggle('on',b.dataset.region===activeRegion);}); }
    function setDir(){ el.querySelectorAll('.tp-compass button').forEach(function(b){b.classList.toggle('on',+b.dataset.dir===cfg.dir);}); }
    function draw(){ self.render(cfg,el.querySelector('.tp-cav'),3).catch(function(){}); }
    function emit(){ onChange(Object.assign({},cfg)); }
    function buildOutfits(q){ q=(q||'').toLowerCase().trim(); ol.innerHTML='';
      var items=q?all.filter(function(o){return o.name.toLowerCase().indexOf(q)>=0;}):all;
      var frag=document.createDocumentFragment();
      items.forEach(function(o){ var d=document.createElement('div'); d.className='tp-item'+(o.id===cfg.outfit?' on':''); d.dataset.id=o.id;
        d.innerHTML='<span class="tp-radio"></span>'+o.name+(o.gender?' <span class="g">'+(o.gender==='female'?'♀':'♂')+'</span>':''); frag.appendChild(d); });
      ol.appendChild(frag);
      var on=ol.querySelector('.tp-item.on'); if(on&&!q) on.scrollIntoView({block:'center'});
    }
    function buildMounts(q){ q=(q||'').toLowerCase().trim(); ml.innerHTML='';
      var frag=document.createDocumentFragment();
      var none=document.createElement('div'); none.className='tp-item'+(!cfg.mount?' on':''); none.dataset.mid='0';
      none.innerHTML='<span class="tp-radio"></span>Nenhuma'; frag.appendChild(none);
      var items=q?mounts.filter(function(m){return m.name.toLowerCase().indexOf(q)>=0;}):mounts;
      items.forEach(function(m){ var d=document.createElement('div'); d.className='tp-item'+(m.id===cfg.mount?' on':''); d.dataset.mid=m.id;
        d.innerHTML='<span class="tp-radio"></span>'+m.name; frag.appendChild(d); });
      ml.appendChild(frag);
      var on=ml.querySelector('.tp-item.on'); if(on&&!q&&cfg.mount) on.scrollIntoView({block:'center'});
    }
    el.querySelectorAll('.tp-compass button').forEach(function(b){b.onclick=function(){cfg.dir=+b.dataset.dir;setDir();draw();emit();};});
    el.querySelectorAll('[data-addon]').forEach(function(cb){cb.checked=!!(cfg.addons&+cb.dataset.addon);cb.onchange=function(){var bit=+cb.dataset.addon;if(cb.checked)cfg.addons|=bit;else cfg.addons&=~bit;draw();emit();};});
    el.querySelectorAll('.tp-ctabs button').forEach(function(b){b.onclick=function(){activeRegion=b.dataset.region;buildSwatches();buildPal();};});
    pal.onclick=function(e){var t=e.target.closest('i');if(!t)return;cfg[activeRegion]=+t.dataset.c;buildSwatches();buildPal();draw();emit();};
    ol.onclick=function(e){var d=e.target.closest('.tp-item');if(!d)return;cfg.outfit=+d.dataset.id;ol.querySelectorAll('.tp-item').forEach(function(x){x.classList.toggle('on',x===d);});draw();emit();};
    ml.onclick=function(e){var d=e.target.closest('.tp-item');if(!d)return;cfg.mount=+d.dataset.mid;ml.querySelectorAll('.tp-item').forEach(function(x){x.classList.toggle('on',x===d);});draw();emit();};
    osearch.oninput=function(){buildOutfits(osearch.value);};
    msearch.oninput=function(){buildMounts(msearch.value);};
    setDir(); buildSwatches(); buildPal(); buildOutfits(''); buildMounts(''); draw();
    return { getValue:function(){return Object.assign({},cfg);}, setValue:function(v){Object.assign(cfg,v);setDir();buildSwatches();buildPal();buildOutfits('');buildMounts('');draw();} };
  };
})();
