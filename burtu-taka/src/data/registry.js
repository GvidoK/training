// Apkopo visas datu kopas vienā reģistrā, ko lieto engine/app kods.
// Katra "kopa" (set) = { key, title, kind:'letter'|'digit', items:[...] }
// `kind` ir gatavs paplašinājumiem (nākotnē var pievienot 'lv-letter' u.c.)

import { LETTERS_PRINT } from './letters-print.js';
import { LETTERS_CURSIVE } from './letters-cursive.js';
import { DIGITS } from './digits.js';

export const SCRIPT_PRINT = 'print';
export const SCRIPT_CURSIVE = 'cursive';

export const SETS = {
  letters: {
    key: 'letters',
    title: 'Burti',
    kind: 'letter',
    scripts: {
      [SCRIPT_PRINT]: LETTERS_PRINT,
      [SCRIPT_CURSIVE]: LETTERS_CURSIVE,
    },
  },
  digits: {
    key: 'digits',
    title: 'Cipari',
    kind: 'digit',
    scripts: {
      // cipariem nav "rakstīto" varianta - abi pārslēgi rāda to pašu
      [SCRIPT_PRINT]: DIGITS,
      [SCRIPT_CURSIVE]: DIGITS,
    },
  },
};

// atgriež pieejamo (script-specifisko) burtu/ciparu sarakstu; ja rakstītajam
// trūkst kāda burta datu (šobrīd tikai apakškopa), krīt atpakaļ uz drukāto,
// lai lietotne nekad nesalūzt, kamēr cursive kopa netiek papildināta pilnībā
export function getItems(setKey, script) {
  const set = SETS[setKey];
  const items = set.scripts[script] || set.scripts[SCRIPT_PRINT];
  if (script === SCRIPT_CURSIVE && set.scripts[SCRIPT_CURSIVE]) {
    // apvieno: cursive burti, kur ir dati, print burti pārējiem (pēc id kārtas no print kopas)
    const cursiveById = new Map(set.scripts[SCRIPT_CURSIVE].map(l => [l.id, l]));
    const order = set.scripts[SCRIPT_PRINT];
    return order.map(l => cursiveById.get(l.id) || l);
  }
  return items;
}

export function hasCursiveData(setKey, id) {
  const set = SETS[setKey];
  const cursive = set.scripts[SCRIPT_CURSIVE];
  if (!cursive) return false;
  return cursive.some(l => l.id === id);
}
