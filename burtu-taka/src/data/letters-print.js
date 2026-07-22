// DRUKĀTIE LIELIE burti A-Z. Katrs ieraksts: { id, label, strokes:[{points:[{x,y}...]}] }
// Autorēts 100x100 režģī, strokes[] secība = pareizā rakstīšanas/svītru secība.
// Vairāk-svītru burtiem (A,B,D,E,F,G,H,K,P,Q,R,T,X,Y) katra svītra jāpabeidz,
// pirms nākamā atbloķējas - skat. src/engine/drawing-engine.js

import { line, arc, cubic, quad, join, stroke } from './path-utils.js';

export const LETTERS_PRINT = [
  { id: 'A', label: 'A', strokes: [
    stroke(line(50,15, 28,85, 18)),
    stroke(line(50,15, 72,85, 18)),
    stroke(line(36,58, 64,58, 10)),
  ]},
  { id: 'B', label: 'B', strokes: [
    stroke(line(28,15, 28,85, 22)),
    stroke(join(quad(28,15, 66,15, 28,50, 18), quad(28,50, 70,52, 28,85, 18))),
  ]},
  { id: 'C', label: 'C', strokes: [
    stroke(arc(50,50,32, -40,-300, 32)),
  ]},
  { id: 'D', label: 'D', strokes: [
    stroke(line(28,15, 28,85, 22)),
    stroke(cubic(28,15, 75,18, 75,82, 28,85, 26)),
  ]},
  { id: 'E', label: 'E', strokes: [
    stroke(line(28,15, 28,85, 22)),
    stroke(line(28,15, 70,15, 10)),
    stroke(line(28,50, 62,50, 8)),
    stroke(line(28,85, 70,85, 10)),
  ]},
  { id: 'F', label: 'F', strokes: [
    stroke(line(28,15, 28,85, 22)),
    stroke(line(28,15, 68,15, 10)),
    stroke(line(28,50, 58,50, 8)),
  ]},
  { id: 'G', label: 'G', strokes: [
    stroke(arc(50,50,32, -40,-350, 34)),
    stroke(join(line(81,56, 55,56, 8), line(55,56, 55,42, 6))),
  ]},
  { id: 'H', label: 'H', strokes: [
    stroke(line(28,15, 28,85, 20)),
    stroke(line(72,15, 72,85, 20)),
    stroke(line(28,50, 72,50, 12)),
  ]},
  { id: 'I', label: 'I', strokes: [
    stroke(line(50,15, 50,85, 20)),
  ]},
  { id: 'J', label: 'J', strokes: [
    stroke(join(line(62,15, 62,68, 14), quad(62,68, 62,86, 36,78, 14))),
  ]},
  { id: 'K', label: 'K', strokes: [
    stroke(line(28,15, 28,85, 20)),
    stroke(line(28,50, 72,15, 14)),
    stroke(line(28,50, 72,85, 14)),
  ]},
  { id: 'L', label: 'L', strokes: [
    stroke(join(line(28,15, 28,85, 20), line(28,85, 70,85, 12))),
  ]},
  { id: 'M', label: 'M', strokes: [
    stroke(join(line(24,85, 24,15, 18), line(24,15, 50,58, 14), line(50,58, 76,15, 14), line(76,15, 76,85, 18))),
  ]},
  { id: 'N', label: 'N', strokes: [
    stroke(join(line(28,85, 28,15, 18), line(28,15, 72,85, 20), line(72,85, 72,15, 18))),
  ]},
  { id: 'O', label: 'O', strokes: [
    stroke(arc(50,50,33, -90,-450, 36)),
  ]},
  { id: 'P', label: 'P', strokes: [
    stroke(line(28,15, 28,85, 22)),
    stroke(quad(28,15, 70,15, 28,50, 18)),
  ]},
  { id: 'Q', label: 'Q', strokes: [
    stroke(arc(50,48,30, -90,-450, 36)),
    stroke(line(60,66, 80,86, 10)),
  ]},
  { id: 'R', label: 'R', strokes: [
    stroke(line(28,15, 28,85, 22)),
    stroke(quad(28,15, 70,15, 28,50, 18)),
    stroke(line(28,50, 74,85, 14)),
  ]},
  { id: 'S', label: 'S', strokes: [
    stroke(cubic(70,22, 18,22, 82,78, 30,78, 32)),
  ]},
  { id: 'T', label: 'T', strokes: [
    stroke(line(26,15, 74,15, 14)),
    stroke(line(50,15, 50,85, 20)),
  ]},
  { id: 'U', label: 'U', strokes: [
    stroke(join(line(28,15, 28,60, 12), quad(28,60, 28,85, 50,85, 10), quad(50,85, 72,85, 72,60, 10), line(72,60, 72,15, 12))),
  ]},
  { id: 'V', label: 'V', strokes: [
    stroke(join(line(26,15, 50,85, 18), line(50,85, 74,15, 18))),
  ]},
  { id: 'W', label: 'W', strokes: [
    stroke(join(line(20,15, 32,85, 16), line(32,85, 50,40, 12), line(50,40, 68,85, 12), line(68,85, 80,15, 16))),
  ]},
  { id: 'X', label: 'X', strokes: [
    stroke(line(26,15, 74,85, 20)),
    stroke(line(74,15, 26,85, 20)),
  ]},
  { id: 'Y', label: 'Y', strokes: [
    stroke(line(26,15, 50,50, 14)),
    stroke(join(line(74,15, 50,50, 14), line(50,50, 50,85, 14))),
  ]},
  { id: 'Z', label: 'Z', strokes: [
    stroke(join(line(26,18, 74,18, 12), line(74,18, 26,82, 18), line(26,82, 74,82, 12))),
  ]},
];
