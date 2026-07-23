// DRUKĀTIE LIELIE burti - latviešu alfabēts (33 burti, bez Q/W/X/Y).
// Katrs ieraksts: { id, label, strokes:[{points:[{x,y}]}] }
// Autorēts 100x100 režģī, strokes[] secība = pareizā rakstīšanas/svītru secība.
// Vairāk-svītru burtiem katra svītra jāpabeidz, pirms nākamā atbloķējas -
// skat. src/engine/drawing-engine.js. Diakritiskās zīmes (garumzīme,
// mīkstinājuma zīme) vienmēr ir PĒDĒJĀ svītra - pievienotas pēc pamatburta,
// tāpat kā "i" punkts vai "t" šķērssvītra.

import { line, arc, cubic, quad, join, stroke } from './path-utils.js';

// -------- diakritisko zīmju palīgfunkcijas (novietotas virs burta, y<15) --------
function macron(cx) {              // garumzīme: Ā Ē Ī Ū
  return stroke(line(cx - 9, 8, cx + 9, 8, 6));
}
function caron(cx) {               // mīkstinājuma zīme (ˇ): Č Š Ž
  return stroke(join(line(cx - 7, 3, cx, 10, 4), line(cx, 10, cx + 7, 3, 4)));
}
function comma(cx) {               // mīkstinājuma zīme (,): Ģ Ķ Ļ Ņ - apakšā, burta vidū
  return stroke(quad(cx + 5, 80, cx + 7, 87, cx, 92, 8));
}

// -------- pamatburtu svītras (atkārtoti izmantotas arī diakritiskajos) --------
const A_STROKES = [
  stroke(line(28,85, 50,15, 18)),
  stroke(line(50,15, 72,85, 18)),
  stroke(line(36,58, 64,58, 10)),
];
const B_STROKES = [
  stroke(line(28,15, 28,85, 22)),
  stroke(join(arc(28,32.5,17.5, -90,90, 18), arc(28,67.5,19, -90,90, 18))),
];
const C_STROKES = [
  stroke(arc(50,50,32, -40,-300, 32)),
];
const D_STROKES = [
  stroke(line(28,15, 28,85, 22)),
  stroke(cubic(28,15, 75,18, 75,82, 28,85, 26)),
];
const E_STROKES = [
  stroke(line(28,15, 28,85, 22)),
  stroke(line(28,15, 70,15, 10)),
  stroke(line(28,50, 62,50, 8)),
  stroke(line(28,85, 70,85, 10)),
];
const F_STROKES = [
  stroke(line(28,15, 28,85, 22)),
  stroke(line(28,15, 68,15, 10)),
  stroke(line(28,50, 58,50, 8)),
];
const G_STROKES = [
  stroke(arc(50,50,32, -40,-350, 34)),
  stroke(line(81,54, 56,54, 10)),
];
const H_STROKES = [
  stroke(line(28,15, 28,85, 20)),
  stroke(line(72,15, 72,85, 20)),
  stroke(line(28,50, 72,50, 12)),
];
const I_STROKES = [
  stroke(line(50,15, 50,85, 20)),
];
const J_STROKES = [
  stroke(join(line(62,15, 62,68, 14), quad(62,68, 62,86, 36,78, 14))),
];
const K_STROKES = [
  stroke(line(28,15, 28,85, 20)),
  stroke(line(72,15, 28,50, 14)),
  stroke(line(28,50, 72,85, 14)),
];
const L_STROKES = [
  stroke(join(line(28,15, 28,85, 20), line(28,85, 70,85, 12))),
];
const M_STROKES = [
  stroke(join(line(24,85, 24,15, 18), line(24,15, 50,58, 14), line(50,58, 76,15, 14), line(76,15, 76,85, 18))),
];
const N_STROKES = [
  stroke(join(line(28,85, 28,15, 18), line(28,15, 72,85, 20), line(72,85, 72,15, 18))),
];
const O_STROKES = [
  stroke(arc(50,50,33, -90,-450, 36)),
];
const P_STROKES = [
  stroke(line(28,15, 28,85, 22)),
  stroke(arc(28,32.5,17.5, -90,90, 20)),
];
const R_STROKES = [
  stroke(line(28,15, 28,85, 22)),
  stroke(arc(28,32.5,17.5, -90,90, 20)),
  stroke(line(28,50, 74,85, 14)),
];
const S_STROKES = [
  stroke(join(
    arc(50,32,18, -40,-260, 24),
    arc(50,68,18, -80,140, 24),
  )),
];
const T_STROKES = [
  stroke(line(50,15, 50,85, 20)),
  stroke(line(26,15, 74,15, 14)),
];
const U_STROKES = [
  stroke(join(line(28,15, 28,60, 12), quad(28,60, 28,85, 50,85, 10), quad(50,85, 72,85, 72,60, 10), line(72,60, 72,15, 12))),
];
const V_STROKES = [
  stroke(join(line(26,15, 50,85, 18), line(50,85, 74,15, 18))),
];
const Z_STROKES = [
  stroke(join(line(26,18, 74,18, 12), line(74,18, 26,82, 18), line(26,82, 74,82, 12))),
];

export const LETTERS_PRINT = [
  { id: 'A', label: 'A', strokes: A_STROKES },
  { id: 'Ā', label: 'Ā', strokes: [...A_STROKES, macron(50)] },
  { id: 'B', label: 'B', strokes: B_STROKES },
  { id: 'C', label: 'C', strokes: C_STROKES },
  { id: 'Č', label: 'Č', strokes: [...C_STROKES, caron(50)] },
  { id: 'D', label: 'D', strokes: D_STROKES },
  { id: 'E', label: 'E', strokes: E_STROKES },
  { id: 'Ē', label: 'Ē', strokes: [...E_STROKES, macron(49)] },
  { id: 'F', label: 'F', strokes: F_STROKES },
  { id: 'G', label: 'G', strokes: G_STROKES },
  { id: 'Ģ', label: 'Ģ', strokes: [...G_STROKES, comma(50)] },
  { id: 'H', label: 'H', strokes: H_STROKES },
  { id: 'I', label: 'I', strokes: I_STROKES },
  { id: 'Ī', label: 'Ī', strokes: [...I_STROKES, macron(50)] },
  { id: 'J', label: 'J', strokes: J_STROKES },
  { id: 'K', label: 'K', strokes: K_STROKES },
  { id: 'Ķ', label: 'Ķ', strokes: [...K_STROKES, comma(50)] },
  { id: 'L', label: 'L', strokes: L_STROKES },
  { id: 'Ļ', label: 'Ļ', strokes: [...L_STROKES, comma(49)] },
  { id: 'M', label: 'M', strokes: M_STROKES },
  { id: 'N', label: 'N', strokes: N_STROKES },
  { id: 'Ņ', label: 'Ņ', strokes: [...N_STROKES, comma(50)] },
  { id: 'O', label: 'O', strokes: O_STROKES },
  { id: 'P', label: 'P', strokes: P_STROKES },
  { id: 'R', label: 'R', strokes: R_STROKES },
  { id: 'S', label: 'S', strokes: S_STROKES },
  { id: 'Š', label: 'Š', strokes: [...S_STROKES, caron(50)] },
  { id: 'T', label: 'T', strokes: T_STROKES },
  { id: 'U', label: 'U', strokes: U_STROKES },
  { id: 'Ū', label: 'Ū', strokes: [...U_STROKES, macron(50)] },
  { id: 'V', label: 'V', strokes: V_STROKES },
  { id: 'Z', label: 'Z', strokes: Z_STROKES },
  { id: 'Ž', label: 'Ž', strokes: [...Z_STROKES, caron(50)] },
];
