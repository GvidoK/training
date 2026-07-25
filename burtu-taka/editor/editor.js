// Path Editor — iekšējs rīks burtu/ciparu ceļu punktu novietošanai.
// Klikšķinot canvas, novieto kontrolpunktus katrai svītrai (taisnei vai
// cubic bezjē līknei). Eksportē gatavu JS fragmentu, kas izmanto tās pašas
// path-utils.js funkcijas (line/cubic/join/stroke), ko lieto letters-print.js
// un digits.js — rezultātu var tieši iekopēt tajos failos.

import { line, cubic, join, stroke, resample } from '../src/data/path-utils.js';
import { LETTERS_PRINT } from '../src/data/letters-print.js';
import { DIGITS } from '../src/data/digits.js';

const CANVAS_SIZE = 640;
const MARGIN = 60;
const DRAW_SIZE = CANVAS_SIZE - 2 * MARGIN;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

const letterSelect = document.getElementById('letterSelect');
const showReferenceEl = document.getElementById('showReference');
const showExistingEl = document.getElementById('showExisting');
const clickHint = document.getElementById('clickHint');
const strokeListEl = document.getElementById('strokeList');
const strokeCountEl = document.getElementById('strokeCount');
const exportOut = document.getElementById('exportOut');

// -------- reģistrs izvēlnei un "esošo datu" atsaucei --------
const ALL_ITEMS = [...LETTERS_PRINT, ...DIGITS];
ALL_ITEMS.forEach(item => {
  const opt = document.createElement('option');
  opt.value = item.id;
  opt.textContent = `${item.label}  (${item.id})`;
  letterSelect.appendChild(opt);
});

// -------- state --------
let currentLetterId = ALL_ITEMS[0].id;
let mode = 'line';               // 'line' | 'cubic'
let strokes = [];                // pabeigtās svītras: [{segments:[{type,pts}]}]
let currentSegments = [];        // pašreizējās (nepabeigtās) svītras segmenti
let pendingClicks = [];          // klikšķinātie punkti pašreizējam segmentam

function pointsNeededForCurrentSegment() {
  const isFirstSegmentOfStroke = currentSegments.length === 0;
  const base = mode === 'line' ? 2 : 4;
  return isFirstSegmentOfStroke ? base : base - 1;
}

function commitSegment() {
  let pts = pendingClicks.slice();
  if (currentSegments.length > 0) {
    const prevSeg = currentSegments[currentSegments.length - 1];
    const startPt = prevSeg.pts[prevSeg.pts.length - 1];
    pts = [startPt, ...pts];
  }
  currentSegments.push({ type: mode, pts });
  pendingClicks = [];
}

function finishStroke() {
  if (currentSegments.length === 0) return;
  strokes.push({ segments: currentSegments });
  currentSegments = [];
  pendingClicks = [];
  renderAll();
}

function undoPoint() {
  if (pendingClicks.length > 0) {
    pendingClicks.pop();
    renderAll();
    return;
  }
  if (currentSegments.length === 0) return;
  const seg = currentSegments.pop();
  const wasFirst = currentSegments.length === 0;
  const restored = wasFirst ? seg.pts.slice() : seg.pts.slice(1);
  restored.pop();
  pendingClicks = restored;
  renderAll();
}

function undoStroke() {
  if (currentSegments.length > 0 || pendingClicks.length > 0) {
    currentSegments = [];
    pendingClicks = [];
  } else {
    strokes.pop();
  }
  renderAll();
}

function resetAll() {
  if (!confirm('Notīrīt visas šī burta svītras?')) return;
  strokes = [];
  currentSegments = [];
  pendingClicks = [];
  renderAll();
}

function deleteStroke(idx) {
  strokes.splice(idx, 1);
  renderAll();
}

// -------- koordinātu pārveide --------
function pxToGrid(px, py) {
  return { x: (px - MARGIN) / DRAW_SIZE * 100, y: (py - MARGIN) / DRAW_SIZE * 100 };
}
function gridToPx(gx, gy) {
  return { x: MARGIN + gx / 100 * DRAW_SIZE, y: MARGIN + gy / 100 * DRAW_SIZE };
}

cv.addEventListener('click', (e) => {
  const rect = cv.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width, scaleY = CANVAS_SIZE / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;
  const g = pxToGrid(px, py);
  pendingClicks.push(g);
  if (pendingClicks.length >= pointsNeededForCurrentSegment()) {
    commitSegment();
  }
  renderAll();
});

// -------- segmentu -> renderējamu punktu masīvu --------
function segmentToPoints(seg) {
  const p = seg.pts;
  if (seg.type === 'line') return line(p[0].x, p[0].y, p[1].x, p[1].y, 16);
  return cubic(p[0].x, p[0].y, p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y, 26);
}
function strokeToPoints(strokeObj) {
  const arrs = strokeObj.segments.map(segmentToPoints);
  return join(...arrs);
}

// -------- eksporta koda ģenerēšana --------
function fmt(n) { return Math.round(n * 10) / 10; }
function segmentCall(seg) {
  const p = seg.pts;
  if (seg.type === 'line') {
    return `line(${fmt(p[0].x)},${fmt(p[0].y)}, ${fmt(p[1].x)},${fmt(p[1].y)}, 16)`;
  }
  return `cubic(${fmt(p[0].x)},${fmt(p[0].y)}, ${fmt(p[1].x)},${fmt(p[1].y)}, ${fmt(p[2].x)},${fmt(p[2].y)}, ${fmt(p[3].x)},${fmt(p[3].y)}, 26)`;
}
function strokeCode(strokeObj) {
  const calls = strokeObj.segments.map(segmentCall);
  const inner = calls.length === 1 ? calls[0] : `join(${calls.join(', ')})`;
  return `  stroke(${inner}),`;
}
function exportCode() {
  if (strokes.length === 0) return '';
  const varName = currentLetterId.replace(/[^A-Za-z0-9]/g, '') + '_STROKES';
  const lines = [`const ${varName} = [`, ...strokes.map(strokeCode), `];`];
  return lines.join('\n');
}

// -------- zīmēšana --------
function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(76,124,42,0.10)';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 100; g += 10) {
    const a = gridToPx(g, 0), b = gridToPx(g, 100);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const c = gridToPx(0, g), d = gridToPx(100, g);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
  }
  // cap-height / baseline / center — izceltas
  ctx.strokeStyle = 'rgba(230,57,70,0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  [15, 85].forEach(g => {
    const a = gridToPx(0, g), b = gridToPx(100, g);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(76,124,42,0.25)';
  const a = gridToPx(50, 0), b = gridToPx(50, 100);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawReferenceGlyph() {
  if (!showReferenceEl.checked) return;
  const item = ALL_ITEMS.find(it => it.id === currentLetterId);
  const label = item ? item.label : currentLetterId;
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.font = `bold ${DRAW_SIZE * 0.72}px Arial, sans-serif`;
  ctx.fillStyle = '#4C7C2A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const base = gridToPx(50, 85);
  ctx.fillText(label, base.x, base.y);
  ctx.restore();
}

function drawExistingReference() {
  if (!showExistingEl.checked) return;
  const item = ALL_ITEMS.find(it => it.id === currentLetterId);
  if (!item) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(43,108,176,0.55)';
  ctx.lineWidth = 3;
  ctx.setLineDash([3, 5]);
  ctx.lineCap = 'round';
  item.strokes.forEach(s => {
    ctx.beginPath();
    s.points.forEach((p, i) => {
      const px = gridToPx(p.x * 100, p.y * 100);
      i === 0 ? ctx.moveTo(px.x, px.y) : ctx.lineTo(px.x, px.y);
    });
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
}

function angleAt(points, i) {
  const a = points[Math.max(0, i - 1)];
  const b = points[Math.min(points.length - 1, i + 1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function drawArrow(px, ang, color) {
  const size = 11;
  ctx.save();
  ctx.translate(px.x, px.y);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.6, size * 0.7);
  ctx.lineTo(-size * 0.6, -size * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFinishedPath(points, color, num) {
  const px = points.map(p => gridToPx(p.x, p.y));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  px.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();

  [0.3, 0.7].forEach(f => {
    const i = Math.round((px.length - 1) * f);
    drawArrow(px[i], angleAt(px, i), color);
  });

  // sākumpunkta numurs - nedaudz nobīdīts, ja pārklājas ar iepriekšēju marķieri
  const start = { ...px[0] };
  let overlaps = usedMarkerPositions.some(p => Math.hypot(p.x - start.x, p.y - start.y) < 22);
  let tries = 0;
  while (overlaps && tries < 8) {
    const ang = tries * 0.9;
    start.x = px[0].x + Math.cos(ang) * 24;
    start.y = px[0].y + Math.sin(ang) * 24;
    overlaps = usedMarkerPositions.some(p => Math.hypot(p.x - start.x, p.y - start.y) < 22);
    tries++;
  }
  usedMarkerPositions.push(start);
  if (start.x !== px[0].x || start.y !== px[0].y) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px[0].x, px[0].y);
    ctx.lineTo(start.x, start.y);
    ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(start.x, start.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(num), start.x, start.y + 1);
  ctx.restore();

  // beigu punkts
  const end = px[px.length - 1];
  ctx.save();
  ctx.beginPath();
  ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPendingConstruction() {
  // committed segmenti pašreizējā (nepabeigtā) svītrā - oranžā krāsā, bez numura vēl
  currentSegments.forEach(seg => {
    const pts = segmentToPoints(seg);
    const px = pts.map(p => gridToPx(p.x, p.y));
    ctx.save();
    ctx.strokeStyle = '#e6a23c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    px.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.restore();
  });

  // klikšķinātie (vēl neapstiprinātie) punkti šim segmentam
  const startPt = currentSegments.length > 0
    ? currentSegments[currentSegments.length - 1].pts.slice(-1)[0]
    : null;
  const previewPts = startPt ? [startPt, ...pendingClicks] : pendingClicks;

  if (previewPts.length >= 2) {
    ctx.save();
    ctx.strokeStyle = 'rgba(230,162,60,0.55)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    previewPts.forEach((p, i) => {
      const px = gridToPx(p.x, p.y);
      i === 0 ? ctx.moveTo(px.x, px.y) : ctx.lineTo(px.x, px.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  pendingClicks.forEach((p, i) => {
    const px = gridToPx(p.x, p.y);
    ctx.save();
    ctx.beginPath();
    ctx.arc(px.x, px.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#e6a23c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });

  if (startPt && currentSegments.length > 0 && pendingClicks.length === 0) {
    // izceļ, no kurienes turpināsies nākamais segments
    const px = gridToPx(startPt.x, startPt.y);
    ctx.save();
    ctx.beginPath();
    ctx.arc(px.x, px.y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#e6a23c';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

let usedMarkerPositions = [];

function renderAll() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawGrid();
  drawReferenceGlyph();
  drawExistingReference();
  usedMarkerPositions = [];

  strokes.forEach((s, i) => {
    drawFinishedPath(strokeToPoints(s), '#5FBF6B', i + 1);
  });
  drawPendingConstruction();

  updateSidebar();
}

function updateSidebar() {
  strokeCountEl.textContent = String(strokes.length);
  strokeListEl.innerHTML = '';
  if (strokes.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Vēl nav pabeigtu svītru.';
    strokeListEl.appendChild(li);
  } else {
    strokes.forEach((s, i) => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${i + 1}. svītra`;
      const count = document.createElement('span');
      count.className = 'seg-count';
      count.textContent = `${s.segments.length} segm.`;
      const del = document.createElement('button');
      del.className = 'del-stroke';
      del.textContent = '✕';
      del.onclick = () => deleteStroke(i);
      li.appendChild(label);
      li.appendChild(count);
      li.appendChild(del);
      strokeListEl.appendChild(li);
    });
  }

  const needed = pointsNeededForCurrentSegment();
  const have = pendingClicks.length;
  const segLabel = mode === 'line' ? 'taisni' : 'līkni (p0→ctrl1→ctrl2→p3)';
  if (currentSegments.length === 0 && have === 0) {
    clickHint.textContent = `Jauna svītra: klikšķini ${needed} punktus, lai novietotu ${segLabel}.`;
  } else {
    clickHint.textContent = `Novietoti ${have}/${needed} punkti šim segmentam (${segLabel}). Turpini klikšķināt vai maini tipu nākamajam segmentam.`;
  }

  exportOut.value = exportCode();
}

// -------- UI notikumi --------
letterSelect.addEventListener('change', () => {
  currentLetterId = letterSelect.value;
  strokes = [];
  currentSegments = [];
  pendingClicks = [];
  renderAll();
});
letterSelect.value = currentLetterId;

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    renderAll();
  });
});

showReferenceEl.addEventListener('change', renderAll);
showExistingEl.addEventListener('change', renderAll);
document.getElementById('undoPointBtn').addEventListener('click', undoPoint);
document.getElementById('finishStrokeBtn').addEventListener('click', finishStroke);
document.getElementById('undoStrokeBtn').addEventListener('click', undoStroke);
document.getElementById('resetBtn').addEventListener('click', resetAll);
document.getElementById('copyBtn').addEventListener('click', () => {
  exportOut.select();
  navigator.clipboard?.writeText(exportOut.value).catch(() => {});
});

renderAll();
