// wheel-codec.js — Tibia Panda ↔ Tibia "Wheel of Destiny" code codec (wrapper)
//
// Uses the self-contained compiled codec (wheel-codec-core.js, the real
// tibiatrade/game WASM module) behind a clean JS API:
//   importarDoTibia(code)      -> { voc, wheelPts, spent }   (decode a game code)
//   copiarProJogo(wheelPts,voc)-> { code, spent, wanted, complete }  (encode)
//
// wheelPts is keyed by Tibia Panda's own slot index `i` (0..35, as in TP_WHEEL).
// The mapping to the WASM's EGridTile ids below was verified as an exact
// adjacency-graph isomorphism against TP_WHEEL's `par` topology (all 48 edges).

import createModule from './wheel-codec-core.js';

// Panda slot index i (0..35)  ->  WASM EGridTile value (0..35)
const I2V = {0:21,1:20,2:14,3:15,4:22,5:27,6:26,7:19,8:13,9:8,10:9,11:16,12:23,13:28,14:33,15:32,16:25,17:18,18:12,19:7,20:2,21:3,22:10,23:17,24:29,25:34,26:31,27:24,28:6,29:1,30:4,31:11,32:35,33:30,34:0,35:5};
const V2I = {}; for (const i in I2V) V2I[I2V[i]] = +i;

// WASM EGridTile value -> enum member name (embind)
const TILE_NAME = {0:"QTL8",1:"QTL7",2:"QTL6",3:"QTR6",4:"QTR7",5:"QTR8",6:"QTL5",7:"QTL4",8:"QTL3",9:"QTR3",10:"QTR4",11:"QTR5",12:"QTL2",13:"QTL1",14:"QTL0",15:"QTR0",16:"QTR1",17:"QTR2",18:"QBL2",19:"QBL1",20:"QBL0",21:"QBR0",22:"QBR1",23:"QBR2",24:"QBL5",25:"QBL4",26:"QBL3",27:"QBR3",28:"QBR4",29:"QBR5",30:"QBL8",31:"QBL7",32:"QBL6",33:"QBR6",34:"QBR7",35:"QBR8"};

const VOC_BY_PREFIX = { K:'knight', P:'paladin', S:'sorcerer', D:'druid', M:'monk' };
const EVOC_NAME = { knight:'Knight', paladin:'Paladin', sorcerer:'Sorcerer', druid:'Druid', monk:'Monk' };
const VOC_BY_ENUM = ['knight','paladin','sorcerer','druid','monk']; // EVocation order

let _modPromise = null;
function _mod() { if (!_modPromise) _modPromise = createModule(); return _modPromise; }

/** Decode a game wheel code -> { voc, wheelPts:{i:pts}, spent }. wheelPts in Panda index space. */
export async function importarDoTibia(code) {
  code = String(code || '').trim();
  if (!code) throw new Error('Código vazio.');
  const Mod = await _mod();
  const prefix = code[0].toUpperCase();
  const vocHint = VOC_BY_PREFIX[prefix];
  if (!vocHint) throw new Error('Código de roda inválido (vocação não reconhecida: "' + prefix + '").');
  const P = new Mod.SkillwheelPlanner(Mod.EVocation[EVOC_NAME[vocHint]]);
  try {
    P.updateByCode(code); // sets vocation + points from the code itself
    const sp = P.getSkillParameters();
    const wheelPts = {};
    for (let k = 0; k < 36; k++) {
      const s = sp.get(k);
      const v = (s.id.value ?? s.id);
      const pts = s.currentSkillPoints;
      if (pts > 0) wheelPts[V2I[v]] = pts;
    }
    const spent = P.getSpentSkillPoints();
    const vEnum = (P.getVocation && (P.getVocation().value ?? P.getVocation()));
    const voc = VOC_BY_ENUM[vEnum] ?? vocHint;
    return { voc, wheelPts, spent };
  } finally { if (P.delete) P.delete(); }
}

/** Encode Panda wheelPts -> { code, spent, wanted, complete }. Points-only (no mods/gems). */
export async function copiarProJogo(wheelPts, voc) {
  voc = String(voc || '').toLowerCase();
  if (!EVOC_NAME[voc]) throw new Error('Vocação inválida: "' + voc + '".');
  const Mod = await _mod();
  const P = new Mod.SkillwheelPlanner(Mod.EVocation[EVOC_NAME[voc]]);
  try {
    const target = {}; let wanted = 0;
    for (const i in (wheelPts || {})) {
      const v = I2V[+i]; if (v === undefined) continue;
      const p = +wheelPts[i] || 0; if (p > 0) { target[v] = p; wanted += p; }
    }
    const curOf = (v) => P.getSkillParameters().get(v).currentSkillPoints;
    // Fixpoint fill: the wheel unlocks from the centre outward; repeat sweeps
    // until no tile can take more (respects the game's neighbour-unlock rule).
    let changed = true, guard = 0;
    while (changed && guard < 200) {
      changed = false; guard++;
      for (const v in target) {
        const vv = +v;
        const need = target[v] - curOf(vv);
        if (need > 0) {
          const before = curOf(vv);
          P.addToSkill(Mod.EGridTile[TILE_NAME[vv]], need);
          if (curOf(vv) > before) changed = true;
        }
      }
    }
    const spent = P.getSpentSkillPoints();
    const code = P.getCode();
    return { code, spent, wanted, complete: spent === wanted };
  } finally { if (P.delete) P.delete(); }
}

// corner.id (WASM) -> Panda domain index
const CORNER_ID_TO_DOM = { 0: 2, 1: 3, 2: 1, 3: 0 };

/**
 * Nível de vessel por domínio Panda (0=nenhum, 1=lesser, 2=regular, 3=greater),
 * calculado pelo codec real do jogo — depende da FORMA da alocação, não só do total.
 * Retorna { 0:vl, 1:vl, 2:vl, 3:vl }.
 */
export async function vesselLevels(wheelPts, voc) {
  voc = String(voc || '').toLowerCase();
  const Mod = await _mod();
  const P = new Mod.SkillwheelPlanner(Mod.EVocation[EVOC_NAME[voc] || 'Sorcerer']);
  try {
    const target = {};
    for (const i in (wheelPts || {})) { const v = I2V[+i]; if (v === undefined) continue; const p = +wheelPts[i] || 0; if (p > 0) target[v] = p; }
    const curOf = (v) => { const sp = P.getSkillParameters(); const x = sp.get(v).currentSkillPoints; if (sp.delete) sp.delete(); return x; };
    let changed = true, guard = 0;
    while (changed && guard < 200) {
      changed = false; guard++;
      for (const v in target) { const vv = +v; const need = target[v] - curOf(vv); if (need > 0) { const b = curOf(vv); P.addToSkill(Mod.EGridTile[TILE_NAME[vv]], need); if (curOf(vv) > b) changed = true; } }
    }
    const out = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const cp = P.getCornerParameters();
    for (let k = 0; k < cp.size(); k++) {
      const c = cp.get(k);
      const id = (c.id && c.id.value !== undefined) ? c.id.value : c.id;
      const dom = CORNER_ID_TO_DOM[id];
      if (dom !== undefined) out[dom] = c.vesselLevel;
    }
    if (cp.delete) cp.delete();
    return out;
  } finally { if (P.delete) P.delete(); }
}

/** Warm up the WASM module (optional; call on editor open to avoid first-use latency). */
export function ready() { return _mod().then(() => true); }

if (typeof window !== 'undefined') {
  window.TibiaWheelCodec = { importarDoTibia, copiarProJogo, vesselLevels, ready };
}

export default { importarDoTibia, copiarProJogo, vesselLevels, ready };
