// RAKSTĪTIE (cursive/rokraksta) mazie burti — sākotnējā apakškopa.
// Arhitektūra atbalsta pilnu a-z kopu; šeit iekļauti 10 burti kā piemērs
// (vienkāršāki burti bez sarežģītām cilpām, lai demonstrētu mehāniku).
// Struktūra identiska letters-print.js — engine kods neatšķiras.
// Papildinot: pievieno jaunu ierakstu ar tādu pašu `id` kā LETTERS_PRINT,
// lai pārslēgs (toggle) zinātu, kurš burts kuram atbilst.

import { line, arc, quad, join, stroke } from './path-utils.js';

export const LETTERS_CURSIVE = [
  { id: 'C', label: 'c', strokes: [
    stroke(join(line(26,75, 34,50, 6), arc(50,58,17.9, -153,87, 24), line(51,76, 62,64, 6))),
  ]},
  { id: 'E', label: 'e', strokes: [
    stroke(join(line(26,68, 48,42, 8), arc(48,58,16, -90,190, 24), line(32,55, 44,66, 6))),
  ]},
  { id: 'I', label: 'i', strokes: [
    stroke(join(line(28,75, 34,45, 8), line(34,45, 40,75, 10), line(40,75, 50,64, 6))),
  ]},
  { id: 'L', label: 'l', strokes: [
    stroke(join(line(30,75, 34,45, 8), quad(34,45, 42,15, 34,15, 10), line(34,15, 38,75, 18), line(38,75, 48,64, 6))),
  ]},
  { id: 'M', label: 'm', strokes: [
    stroke(join(line(22,75, 24,58, 4), quad(24,58, 31,40, 38,75, 12), quad(38,75, 45,40, 52,75, 12), line(52,75, 62,62, 6))),
  ]},
  { id: 'N', label: 'n', strokes: [
    stroke(join(line(28,75, 30,58, 4), quad(30,58, 40,40, 50,75, 14), line(50,75, 60,62, 6))),
  ]},
  { id: 'O', label: 'o', strokes: [
    stroke(join(line(26,68, 40,50, 6), arc(50,58,12.8, -141,179, 26), line(37.2,58.2, 48,68, 6))),
  ]},
  { id: 'T', label: 't', strokes: [
    stroke(join(line(28,75, 32,25, 10), quad(32,25, 36,25, 38,42, 8), line(38,42, 48,75, 14), line(48,75, 58,64, 6))),
    stroke(line(24,38, 42,38, 8)),
  ]},
  { id: 'U', label: 'u', strokes: [
    stroke(join(
      line(26,45, 26,66, 6), quad(26,66, 32,76, 38,66, 8), line(38,66, 38,45, 8),
      line(38,45, 46,45, 4), line(46,45, 46,66, 6), quad(46,66, 52,76, 58,66, 8), line(58,66, 62,48, 6)
    )),
  ]},
  { id: 'W', label: 'w', strokes: [
    stroke(join(
      line(20,45, 20,66, 6), quad(20,66, 26,76, 32,66, 8), line(32,66, 32,45, 8),
      line(32,45, 40,45, 4), line(40,45, 40,66, 6), quad(40,66, 46,76, 52,66, 8), line(52,66, 52,45, 8),
      line(52,45, 60,45, 4), line(60,45, 60,66, 6), quad(60,66, 66,76, 72,66, 8), line(72,66, 76,50, 6)
    )),
  ]},
];
