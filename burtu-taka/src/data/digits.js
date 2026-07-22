// Cipari 0-9. Struktūra identiska letters-print.js.
import { line, arc, cubic, join, stroke } from './path-utils.js';

export const DIGITS = [
  { id: '0', label: '0', strokes: [
    stroke(arc(50,50,28, -90,-450, 32)),
  ]},
  { id: '1', label: '1', strokes: [
    stroke(join(line(38,26, 50,15, 6), line(50,15, 50,85, 18))),
  ]},
  { id: '2', label: '2', strokes: [
    stroke(join(arc(50,32,20, -160,60, 20), line(60,49, 28,82, 16), line(28,82, 76,82, 14))),
  ]},
  { id: '3', label: '3', strokes: [
    stroke(join(arc(48,30,18, -70,110, 20), arc(48,68,20, -70,130, 20))),
  ]},
  { id: '4', label: '4', strokes: [
    stroke(join(line(58,15, 26,60, 14), line(26,60, 74,60, 14))),
    stroke(line(58,15, 58,85, 20)),
  ]},
  { id: '5', label: '5', strokes: [
    stroke(join(line(32,15, 32,50, 10), arc(32,67.5,17.5, -90,110, 22))),
    stroke(line(30,15, 72,15, 12)),
  ]},
  { id: '6', label: '6', strokes: [
    stroke(join(cubic(60,18, 28,20, 22,55, 30,68, 18), arc(48,68,19, 186,526, 28))),
  ]},
  { id: '7', label: '7', strokes: [
    stroke(join(line(26,18, 74,18, 14), line(74,18, 38,85, 20))),
  ]},
  { id: '8', label: '8', strokes: [
    stroke(join(arc(50,33,16, 90,450, 22), arc(50,69,19, -90,-450, 24))),
  ]},
  { id: '9', label: '9', strokes: [
    stroke(join(arc(50,34,18, -30,-390, 30), line(65.6,25, 55,85, 20))),
  ]},
];
