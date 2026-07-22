// Režīmu reģistrs. Šobrīd aktīvs tikai 'trace' (velkamais ceļš - šī prototipa
// mehānika, skat. trace-mode.js). Struktūra paredzēta, lai nākotnē
// pievienotu:
//
//   'word-gap'  - vārds ar trūkstošu 1-2 burtiem (izvēles UI: burtu bloki,
//                 kurus lietotājs velk/klikšķina pareizajā vietā vārdā)
//   'math-gap'  - vienādojums ar trūkstošu ciparu, piem. "2 + x = 5"
//                 (ievades UI: cipari izvēlei, vai numuru taustiņi)
//
// Katrs režīms ir objekts ar:
//   key            - unikāls identifikators (izmantots progress-store atslēgā)
//   title          - cilvēkam lasāms nosaukums
//   mount(root, ctx) - izveido režīma UI zem `root` elementa; `ctx` satur
//                      { progressStore, script, onScoreDelta, ... }
//                      atgriež { unmount() } tīrīšanai
//   supportsScript - vai režīmam ir jēga drukāts/rakstīts pārslēgs (trace: jā;
//                    word-gap/math-gap droši vien nē - tie izmantos boolean false)
//
// Šis fails šobrīd EKSPORTĒ TIKAI 'trace', bet UI (app.js) reģistra vietā
// var vēlāk pievienot ierakstus, nemainot progress-store vai engine kodu -
// abi jau strādā ar patvaļīgu `mode` atslēgu.

export const MODES = {};

export function registerMode(modeDef) {
  MODES[modeDef.key] = modeDef;
}

export function getMode(key) {
  return MODES[key];
}

export function listModes() {
  return Object.values(MODES);
}
