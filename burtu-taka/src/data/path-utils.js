// Palīgfunkcijas burtu/ciparu ceļu (stroke path) autorēšanai.
// Autorēšana notiek 100x100 režģī (viegli lasāms), rezultāts vienmēr
// tiek pārparaugots vienmērīgā punktu blīvumā un normalizēts uz 0-1.

function lerp(a, b, t) { return a + (b - a) * t; }

export function line(x1, y1, x2, y2, steps = 12) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: lerp(x1, x2, t), y: lerp(y1, y2, t) });
  }
  return pts;
}

export function arc(cx, cy, r, startDeg, endDeg, steps = 24) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = (startDeg + (endDeg - startDeg) * t) * Math.PI / 180;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

// kubiskā Bezjē (kontrolpunkti x0,y0 -> x1,y1 -> x2,y2 -> x3,y3)
export function cubic(x0, y0, x1, y1, x2, y2, x3, y3, steps = 28) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, mt = 1 - t;
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
    pts.push({
      x: a * x0 + b * x1 + c * x2 + d * x3,
      y: a * y0 + b * y1 + c * y2 + d * y3
    });
  }
  return pts;
}

// kvadrātiskā Bezjē (x0,y0 -> x1,y1 kontrolpunkts -> x2,y2)
export function quad(x0, y0, x1, y1, x2, y2, steps = 20) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, mt = 1 - t;
    pts.push({
      x: mt * mt * x0 + 2 * mt * t * x1 + t * t * x2,
      y: mt * mt * y0 + 2 * mt * t * y1 + t * t * y2
    });
  }
  return pts;
}

// savieno vairākus punktu masīvus vienā nepārtrauktā ceļā (bez dublēta savienojuma punkta)
export function join(...arrs) {
  let out = [];
  arrs.forEach(a => {
    if (out.length > 0) a = a.slice(1);
    out = out.concat(a);
  });
  return out;
}

function pathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

// pārparaugo punktus uz `count` vienmērīgi (pēc loka garuma) izvietotiem punktiem
export function resample(points, count) {
  if (points.length < 2) return points.slice();
  const total = pathLength(points);
  if (total === 0) return points.slice();
  const step = total / (count - 1);
  const out = [points[0]];
  let segIdx = 0;
  let segStart = points[0];
  let segEnd = points[1];
  let segLen = Math.hypot(segEnd.x - segStart.x, segEnd.y - segStart.y);
  let coveredBeforeSeg = 0;
  let target = step;

  while (out.length < count - 1) {
    while (coveredBeforeSeg + segLen < target && segIdx < points.length - 2) {
      coveredBeforeSeg += segLen;
      segIdx++;
      segStart = points[segIdx];
      segEnd = points[segIdx + 1];
      segLen = Math.hypot(segEnd.x - segStart.x, segEnd.y - segStart.y);
    }
    const into = segLen === 0 ? 0 : (target - coveredBeforeSeg) / segLen;
    const t = Math.min(1, Math.max(0, into));
    out.push({ x: lerp(segStart.x, segEnd.x, t), y: lerp(segStart.y, segEnd.y, t) });
    target += step;
  }
  out.push(points[points.length - 1]);
  return out;
}

// autorēšanas režģis (0-100) -> normalizēts (0-1)
export function normalize(points) {
  return points.map(p => ({ x: p.x / 100, y: p.y / 100 }));
}

// galvenā funkcija: autorēšanas punkti -> gatava, pārparaugota, normalizēta svītra
export function stroke(points, resampleCount = 46) {
  return { points: normalize(resample(points, resampleCount)) };
}
