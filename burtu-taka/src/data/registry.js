// Apkopo visas datu kopas vienā reģistrā, ko lieto engine/app kods.
// Katra "kopa" (set) = { key, title, kind:'letter'|'digit', items:[...] }

import { LETTERS_PRINT } from './letters-print.js';
import { DIGITS } from './digits.js';

export const SETS = {
  letters: { key: 'letters', title: 'Burti', kind: 'letter', items: LETTERS_PRINT },
  digits: { key: 'digits', title: 'Cipari', kind: 'digit', items: DIGITS },
};

export function getItems(setKey) {
  return SETS[setKey].items;
}
